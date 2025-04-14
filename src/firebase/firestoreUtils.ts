import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  getDoc,
  deleteDoc,
  Unsubscribe,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig'; // Ensure db is correctly initialized and exported

export interface FirestoreMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Timestamp;
}

// Add the SummaryMetadata interface here (or import if defined elsewhere)
interface SummaryMetadata {
  key_people: string[];
  key_events: string[];
  emotional_themes: string[];
  triggers: string[];
}

export interface FirestoreSummary {
  id: string;
  summary: string;
  summarizedAt: Timestamp;
  sourceMessageIds: string[];
  tokenCount?: number; // Optional token count
  metadata?: SummaryMetadata; // Added optional metadata field
}

// --- Message Operations ---

/**
 * Saves a message to Firestore.
 */
export const saveMessage = async (
  userId: string,
  personaId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<string> => {
  if (!userId || !personaId) {
    throw new Error('User ID and Persona ID must be provided to save message.');
  }
  const messagesCollectionRef = collection(
    db,
    `users/${userId}/personas/${personaId}/messages`
  );
  const messageData = {
    role,
    content,
    createdAt: serverTimestamp(), // Use server timestamp for consistency
  };

  // Log before writing
  console.log(
    'firestoreUtils::saveMessage - Attempting to add document to:',
    messagesCollectionRef.path
  );
  console.log(
    'firestoreUtils::saveMessage - Data:',
    JSON.stringify(messageData, null, 2)
  ); // Stringify for better object logging

  try {
    const docRef = await addDoc(messagesCollectionRef, messageData);
    return docRef.id;
  } catch (error) {
    console.error(
      'firestoreUtils::saveMessage - Error adding document:',
      error
    );
    console.error(
      'firestoreUtils::saveMessage - Path:',
      messagesCollectionRef.path
    );
    console.error(
      'firestoreUtils::saveMessage - Data Sent:',
      JSON.stringify(messageData, null, 2)
    );
    // Re-throw the error after logging
    throw error;
  }
};

/**
 * Fetches the most recent messages for a user and persona, limited to 50.
 * Includes real-time updates.
 */
export const getMessages = (
  userId: string,
  personaId: string,
  callback: (messages: FirestoreMessage[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  if (!userId || !personaId) {
    onError(
      new Error('User ID and Persona ID must be provided to get messages.')
    );
    return () => {}; // Return an empty unsubscribe function
  }
  const messagesCollectionRef = collection(
    db,
    `users/${userId}/personas/${personaId}/messages`
  );
  const q = query(
    messagesCollectionRef,
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot: QuerySnapshot) => {
      const messages = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              // Ensure createdAt is a Timestamp, handle potential serverTimestamp pending state
              createdAt:
                doc.data().createdAt instanceof Timestamp
                  ? doc.data().createdAt
                  : Timestamp.now(),
            } as FirestoreMessage)
        )
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()); // Sort ascending by timestamp
      callback(messages);
    },
    (error) => {
      console.error(
        `firestoreUtils::getMessages - Error fetching messages for ${personaId}:`,
        error
      );
      onError(error);
    }
  );

  return unsubscribe;
};

// --- Memory/Summary Operations ---

/**
 * Saves a memory summary session to Firestore.
 */
export const saveSummary = async (
  userId: string,
  personaId: string,
  summary: string,
  sourceMessageIds: string[],
  tokenCount?: number,
  metadata?: SummaryMetadata | null // Accept optional metadata
): Promise<string> => {
  if (!userId || !personaId) {
    throw new Error('User ID and Persona ID must be provided to save summary.');
  }
  const summariesCollectionRef = collection(
    db,
    `users/${userId}/personas/${personaId}/memory_sessions`
  );
  // Update type to include metadata field
  const summaryData: Omit<FirestoreSummary, 'id'> = {
    summary,
    summarizedAt: serverTimestamp() as Timestamp, // Use server timestamp
    sourceMessageIds,
  };
  // Conditionally add optional fields
  if (tokenCount !== undefined) {
    summaryData.tokenCount = tokenCount;
  }
  if (metadata) {
    // Add metadata if it exists and is not null
    summaryData.metadata = metadata;
  }

  // Log before writing (includes metadata now if present)
  const aboutToSaveDocPath = `${summariesCollectionRef.path}/<auto-id>`; // Indicate auto-id
  console.log(
    'firestoreUtils::saveSummary - Attempting to add document to:',
    aboutToSaveDocPath
  );
  console.log(
    'firestoreUtils::saveSummary - Data:',
    JSON.stringify(summaryData, null, 2)
  ); // Stringify for better object logging

  try {
    const docRef = await addDoc(summariesCollectionRef, summaryData);
    return docRef.id;
  } catch (error) {
    console.error(
      'firestoreUtils::saveSummary - Error adding document:',
      error
    );
    console.error('firestoreUtils::saveSummary - Path:', aboutToSaveDocPath);
    console.error(
      'firestoreUtils::saveSummary - Data Sent:',
      JSON.stringify(summaryData, null, 2)
    );
    // Re-throw the error after logging
    throw error;
  }
};

/**
 * Fetches recent memory summaries for a specific persona.
 */
export const getRecentMemorySummaries = async (
  userId: string,
  personaId: string,
  count: number
): Promise<FirestoreSummary[]> => {
  if (!userId || !personaId) {
    console.warn('User ID or Persona ID missing for getRecentMemorySummaries');
    return [];
  }
  try {
    const summariesCollectionRef = collection(
      db,
      `users/${userId}/personas/${personaId}/memory_sessions`
    );
    const q = query(
      summariesCollectionRef,
      orderBy('summarizedAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    const summaries = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          summarizedAt: doc.data().summarizedAt || Timestamp.now(), // Handle potential null timestamp
        } as FirestoreSummary)
    );
    return summaries;
  } catch (error) {
    console.error(
      `firestoreUtils::getRecentMemorySummaries - Error fetching summaries for ${personaId}:`,
      error
    );
    return []; // Return empty array on error
  }
};

// --- User/Persona Active State ---

/**
 * Updates the lastActive timestamp for a user/persona combination.
 */
export const markSessionAsActive = async (
  userId: string,
  personaId: string
): Promise<void> => {
  if (!userId) {
    throw new Error('User ID must be provided to mark session active.');
  }
  const userDocRef = doc(db, `users/${userId}`);
  const updateData = {
    lastActive: serverTimestamp(), // Update general last active time
    [`personaLastActive.${personaId}`]: serverTimestamp(), // Update specific persona last active time
  };

  // Log before writing
  console.log(
    'firestoreUtils::markSessionAsActive - Attempting to update document:',
    userDocRef.path
  );
  console.log(
    'firestoreUtils::markSessionAsActive - Data:',
    JSON.stringify(updateData, null, 2)
  );

  try {
    // Use setDoc with merge: true to create the document if it doesn't exist,
    // or update it if it does. This is safer than updateDoc which fails if the doc is missing.
    await setDoc(userDocRef, updateData, { merge: true });
  } catch (error) {
    console.error(
      'firestoreUtils::markSessionAsActive - Error updating document:',
      error
    );
    console.error(
      'firestoreUtils::markSessionAsActive - Path:',
      userDocRef.path
    );
    console.error(
      'firestoreUtils::markSessionAsActive - Data Sent:',
      JSON.stringify(updateData, null, 2)
    );
    // Re-throw the error after logging
    throw error;
  }
};

/**
 * Fetches the timestamp when the last summary was generated for a specific persona.
 */
export const getLastSummaryTimestamp = async (
  userId: string,
  personaId: string
): Promise<Timestamp | null> => {
  if (!userId || !personaId) {
    console.warn('User ID or Persona ID missing for getLastSummaryTimestamp');
    return null;
  }
  try {
    const userDocRef = doc(db, `users/${userId}`);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Access nested field, return null if path doesn't exist
      return data?.personaLastSummaryTimestamp?.[personaId] || null;
    }
    return null; // User document doesn't exist
  } catch (error) {
    console.error(
      'firestoreUtils::getLastSummaryTimestamp - Error fetching user document:',
      error
    );
    return null; // Return null on error
  }
};

// --- Cleanup Operations ---

/**
 * Deletes all messages associated with a specific user and persona.
 * USE WITH CAUTION.
 */
export const deleteAllMessagesForPersona = async (
  userId: string,
  personaId: string
): Promise<void> => {
  console.warn(
    `Attempting to delete all messages for user ${userId}, persona ${personaId}.`
  );
  const messagesCollectionRef = collection(
    db,
    `users/${userId}/personas/${personaId}/messages`
  );
  const q = query(messagesCollectionRef); // Query all messages
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log(
      `No messages found for user ${userId}, persona ${personaId} to delete.`
    );
    return;
  }

  const batch = writeBatch(db);
  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  try {
    await batch.commit();
    console.log(
      `Successfully deleted ${querySnapshot.size} messages for user ${userId}, persona ${personaId}.`
    );
  } catch (error) {
    console.error(
      `Error deleting messages for user ${userId}, persona ${personaId}:`,
      error
    );
    throw error; // Re-throw error after logging
  }
};

/**
 * Deletes all memory summaries associated with a specific user and persona.
 * USE WITH CAUTION.
 */
export const deleteAllSummariesForPersona = async (
  userId: string,
  personaId: string
): Promise<void> => {
  console.warn(
    `Attempting to delete all summaries for user ${userId}, persona ${personaId}.`
  );
  const summariesCollectionRef = collection(
    db,
    `users/${userId}/personas/${personaId}/memory_sessions`
  );
  const q = query(summariesCollectionRef); // Query all summaries
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log(
      `No summaries found for user ${userId}, persona ${personaId} to delete.`
    );
    return;
  }

  const batch = writeBatch(db);
  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  try {
    await batch.commit();
    console.log(
      `Successfully deleted ${querySnapshot.size} summaries for user ${userId}, persona ${personaId}.`
    );
  } catch (error) {
    console.error(
      `Error deleting summaries for user ${userId}, persona ${personaId}:`,
      error
    );
    throw error; // Re-throw error after logging
  }
};

// --- Summarization Status Update ---

/**
 * Updates the timestamp when the last summary was generated for a specific persona.
 */
export const updateLastSummaryTimestamp = async (
  userId: string,
  personaId: string
): Promise<void> => {
  if (!userId || !personaId) {
    throw new Error(
      'User ID and Persona ID must be provided to update summary timestamp.'
    );
  }
  const userDocRef = doc(db, `users/${userId}`);
  const timestamp = serverTimestamp(); // Use server timestamp
  const updateData = {
    personaLastSummaryTimestamp: {
      [personaId]: timestamp,
    },
  };

  // Log before writing
  console.log(
    'firestoreUtils::updateLastSummaryTimestamp - Attempting to update document:',
    userDocRef.path
  );
  console.log(
    'firestoreUtils::updateLastSummaryTimestamp - Data:',
    JSON.stringify(updateData, null, 2)
  );

  try {
    // Use setDoc with merge: true to handle potential missing fields/doc
    await setDoc(userDocRef, updateData, { merge: true });
  } catch (error) {
    console.error(
      'firestoreUtils::updateLastSummaryTimestamp - Error updating summary timestamp:',
      error
    );
    console.error(
      'firestoreUtils::updateLastSummaryTimestamp - Path:',
      userDocRef.path
    );
    console.error(
      'firestoreUtils::updateLastSummaryTimestamp - Data Sent:',
      JSON.stringify(updateData, null, 2)
    );
    // Re-throw the error after logging
    throw error;
  }
};
