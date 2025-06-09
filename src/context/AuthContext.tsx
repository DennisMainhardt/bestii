import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp, FieldValue, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  credits: number | null;
  monthlyResets: number | null;
  updateCredits: (newCredits: number) => void;
}

interface UserDocUpdates {
  [key: string]: number | FieldValue | undefined;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  credits: null,
  monthlyResets: null,
  updateCredits: () => { },
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [monthlyResets, setMonthlyResets] = useState<number | null>(null);

  // Function to manually update credits (for immediate UI updates)
  const updateCredits = (newCredits: number) => {
    setCredits(newCredits);
  };

  useEffect(() => {
    let userDocListener: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Clean up previous listener if it exists
      if (userDocListener) {
        userDocListener();
        userDocListener = null;
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // --- Create User Document for New User ---
            console.log(`Creating document for new user: ${user.uid}`);
            const newUserDoc = {
              uid: user.uid,
              email: user.email || 'No email provided',
              displayName: user.displayName || 'Anonymous User',
              providerId: user.providerData[0]?.providerId || 'unknown',
              photoURL: user.photoURL,
              credits: 5,
              monthlyResets: 0,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
              lastCreditReset: serverTimestamp(),
              monthlyCycleStart: serverTimestamp(),
            };
            await setDoc(userDocRef, newUserDoc);
            // Set state for the new user
            setCredits(newUserDoc.credits);
            setMonthlyResets(newUserDoc.monthlyResets);

          } else {
            // --- Handle Existing User ---
            const userData = userDoc.data();
            const updates: UserDocUpdates = {};

            // Update state for context
            setCredits(userData.credits ?? 0);
            setMonthlyResets(userData.monthlyResets ?? 0);

            // Initialize missing fields for older users and provide defaults for logic
            let currentMonthlyResets = userData.monthlyResets;
            if (currentMonthlyResets === undefined) {
              updates.monthlyResets = 0;
              currentMonthlyResets = 0;
            }
            if (userData.credits === undefined) updates.credits = 5;
            if (userData.monthlyCycleStart === undefined) updates.monthlyCycleStart = serverTimestamp();
            if (userData.lastCreditReset === undefined) updates.lastCreditReset = serverTimestamp();

            const cycleStart = (userData.monthlyCycleStart as Timestamp)?.toDate();
            const lastReset = (userData.lastCreditReset as Timestamp)?.toDate();

            // --- Monthly Cycle Reset ---
            const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
            if (!cycleStart || new Date().getTime() - cycleStart.getTime() > thirtyDaysInMillis) {
              updates.monthlyCycleStart = serverTimestamp();
              updates.monthlyResets = 0;
              currentMonthlyResets = 0; // Use this updated value for the daily check
              console.log(`User ${user.uid}: Monthly reset cycle started.`);
            }

            // --- Daily Credit Reset ---
            const now = new Date();
            const isNewDay = !lastReset || now.toDateString() !== lastReset.toDateString();

            if (isNewDay && currentMonthlyResets < 6) {
              updates.credits = 5;
              updates.lastCreditReset = serverTimestamp();
              updates.monthlyResets = currentMonthlyResets + 1;
              console.log(`User ${user.uid}: Daily credits reset to 5. Reset count: ${updates.monthlyResets}`);
            }

            // --- Apply Updates ---
            if (Object.keys(updates).length > 0) {
              await updateDoc(userDocRef, updates);
              console.log(`User ${user.uid}: Applied document updates.`);
              // Re-fetch and set state after updates to ensure context is fresh
              const updatedDoc = await getDoc(userDocRef);
              if (updatedDoc.exists()) {
                const updatedData = updatedDoc.data();
                setCredits(updatedData.credits ?? 0);
                setMonthlyResets(updatedData.monthlyResets ?? 0);
              }
            }
          }

          // --- Set up real-time listener for user document ---
          userDocListener = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setCredits(data.credits ?? 0);
              setMonthlyResets(data.monthlyResets ?? 0);
              console.log(`Real-time update: Credits = ${data.credits}, Monthly resets = ${data.monthlyResets}`);
            }
          }, (error) => {
            console.error("Error in user document listener:", error);
          });

        } catch (error) {
          console.error("Error during user document handling:", error);
        }
      } else {
        // No user, reset credits state
        setCredits(null);
        setMonthlyResets(null);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup function
    return () => {
      unsubscribe();
      if (userDocListener) {
        userDocListener();
      }
    };
  }, []);

  const value = {
    currentUser,
    loading,
    credits,
    monthlyResets,
    updateCredits,
  };

  // Don't render children until loading is complete to avoid flashes of incorrect state
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 