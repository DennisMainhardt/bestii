import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  setDoc,
  getDoc,
  FirestoreError,
  limitToLast,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { app } from '@/firebase/firebaseConfig'; // Assuming app is exported from your config

// Initialize Firestore
const db = getFirestore(app);

export interface Message {
  id: string; // Document ID
  role: 'user' | 'assistant';
  content: string;
  persona: string; // ID of the persona (e.g., "raze", "reyna")
  createdAt: Date | null; // Firestore Timestamp converts to Date, null initially
}

// Interface for memory summary
export interface MemorySummary {
  summary: string;
  updatedAt: Date | null;
}

/**
 * Saves a message to the user's message subcollection in Firestore.
 * @param userId - The UID of the user.
 * @param personaId - The ID of the persona.
 * @param role - The role of the message sender ('user' or 'assistant').
 * @param content - The text content of the message.
 */
export const saveMessage = async (
  userId: string,
  personaId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<string | null> => {
  if (!userId || !personaId) {
    throw new Error('User ID and Persona ID are required to save a message.');
  }
  try {
    const messagesColRef = collection(db, 'users', userId, 'messages');
    const docRef = await addDoc(messagesColRef, {
      role: role,
      content: content,
      persona: personaId,
      createdAt: serverTimestamp(), // Use server timestamp
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving message: ', error);
    return null;
  }
};

/**
 * Fetches the *entire* message history for a user and persona *once*.
 * Does not set up a real-time listener.
 *
 * @param userId - The UID of the user.
 * @param personaId - The ID of the persona.
 * @returns Promise resolving to an array of Message objects.
 */
export const getInitialMessages = async (
  userId: string,
  personaId: string
): Promise<Message[]> => {
  if (!userId || !personaId) {
    console.error('getInitialMessages: User ID and Persona ID are required.');
    throw new Error('User ID and Persona ID are required.');
  }

  const messagesColRef = collection(db, 'users', userId, 'messages');
  const q = query(
    messagesColRef,
    where('persona', '==', personaId),
    orderBy('createdAt', 'asc') // Order chronologically
    // NO limitToLast here - fetch all
  );

  try {
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      role: doc.data().role as 'user' | 'assistant',
      content: doc.data().content as string,
      persona: doc.data().persona as string,
      createdAt: doc.data().createdAt?.toDate() ?? null, // Convert Timestamp to Date
    }));
    return messages;
  } catch (error) {
    console.error(
      `Error fetching initial messages for user ${userId}, persona ${personaId}:`,
      error
    );
    throw new Error('Failed to fetch initial message history.'); // Re-throw for the caller to handle
  }
};

/**
 * Sets up a real-time listener for a user's messages *for a specific persona*.
 * @param userId - The UID of the user.
 * @param personaId - The ID of the persona.
 * @param onMessagesUpdate - Callback function to handle message updates.
 * @param onError - Callback function to handle errors.
 * @returns Unsubscribe function for the listener.
 */
export const getMessages = (
  userId: string,
  personaId: string,
  onMessagesUpdate: (messages: Message[]) => void,
  onError: (error: FirestoreError) => void
) => {
  if (!userId || !personaId) {
    console.error('User ID and Persona ID are required to get messages.');
    onError(
      new Error('User ID and Persona ID are required.') as FirestoreError
    );
    return () => {};
  }

  const messagesColRef = collection(db, 'users', userId, 'messages');
  const q = query(
    messagesColRef,
    where('persona', '==', personaId),
    orderBy('createdAt', 'asc'),
    limitToLast(50)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        role: doc.data().role as 'user' | 'assistant',
        content: doc.data().content as string,
        persona: doc.data().persona as string,
        createdAt: doc.data().createdAt?.toDate() ?? null,
      }));
      messages.sort((a, b) => {
        const timeA =
          a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
        const timeB =
          b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
      onMessagesUpdate(messages);
    },
    (error) => {
      console.error(
        `Error fetching messages for user ${userId}, persona ${personaId}:`,
        error
      );
      onError(error);
    }
  );

  return unsubscribe;
};

/**
 * Saves or updates the memory summary for a specific persona.
 */
export const saveMemorySummary = async (
  userId: string,
  personaId: string,
  summary: string
): Promise<void> => {
  if (!userId || !personaId) {
    throw new Error(
      'User ID and Persona ID are required to save memory summary.'
    );
  }
  try {
    const memoryDocRef = doc(db, 'users', userId, 'memory', personaId);
    await setDoc(
      memoryDocRef,
      {
        summary: summary,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ); // Use merge: true to avoid overwriting other fields if any
  } catch (error) {
    console.error('Error saving memory summary:', error);
    throw new Error('Failed to save memory summary.');
  }
};

/**
 * Fetches the memory summary for a specific persona.
 */
export const getMemorySummary = async (
  userId: string,
  personaId: string
): Promise<MemorySummary | null> => {
  if (!userId || !personaId) {
    console.error('User ID and Persona ID are required to get memory summary.');
    return null;
  }
  try {
    const memoryDocRef = doc(db, 'users', userId, 'memory', personaId);
    const docSnap = await getDoc(memoryDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        summary: data.summary as string,
        updatedAt: data.updatedAt?.toDate() ?? null,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching memory summary:', error);
    return null; // Return null on error
  }
};
