import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp, // Might use for the summary doc itself, but need message dates
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp, // Import Timestamp type
  FirestoreError,
  doc, // Import doc
  getDoc, // Import getDoc
  setDoc, // Import setDoc
} from 'firebase/firestore';
import { app } from '@/firebase/firebaseConfig';
// Assuming Message type might be defined elsewhere or we define a local version
// Define needed Message structure here if not importing
import { Message } from './messageService'; // Or import from a shared types file
import { ChatGPTService } from '@/services/chatGPTService'; // Import AI service types
import { ClaudeService } from '@/services/claudeService'; // Import AI service types

// Type for the AI service instance that can be passed
type AIService = ChatGPTService | ClaudeService;

const db = getFirestore(app);

// Interfaces
export interface SessionMetadata {
  lastSummarizedMessageTimestamp: Timestamp | null;
}

// Define the interface for the structured metadata (can be imported if defined elsewhere)
interface SummaryMetadata {
  key_people: string[];
  key_events: string[];
  emotional_themes: string[];
  triggers: string[];
}

export interface SessionMemorySummary {
  id: string;
  summary: string;
  createdAt: Timestamp;
  messageCount: number;
  personaId: string;
  lastMessageTimestamp: Timestamp | null;
  tokenCount?: number;
  metadata?: SummaryMetadata;
}

// --- Session Metadata Management ---

const getSessionMetadataRef = (userId: string, personaId: string) => {
  return doc(db, `users/${userId}/personas/${personaId}/session`, 'metadata');
};

export const getSessionMetadata = async (
  userId: string,
  personaId: string
): Promise<SessionMetadata> => {
  const metadataRef = getSessionMetadataRef(userId, personaId);
  try {
    const docSnap = await getDoc(metadataRef);
    if (docSnap.exists()) {
      return docSnap.data() as SessionMetadata;
    } else {
      // Default if no metadata exists yet
      return { lastSummarizedMessageTimestamp: null };
    }
  } catch (error) {
    console.error('Error getting session metadata:', error);
    // Return default on error to avoid blocking summarization logic entirely
    return { lastSummarizedMessageTimestamp: null };
  }
};

const updateSessionMetadata = async (
  userId: string,
  personaId: string,
  data: Partial<SessionMetadata>
) => {
  const metadataRef = getSessionMetadataRef(userId, personaId);
  try {
    // Use setDoc with merge: true to update or create the document
    await setDoc(metadataRef, data, { merge: true });
  } catch (error) {
    console.error('Error updating session metadata:', error);
  }
};

// Call this when a new user message is sent to indicate the session is active
// and previous summaries might be outdated by new content.
export const markSessionAsActive = async (
  userId: string,
  personaId: string
) => {
  await updateSessionMetadata(userId, personaId, {
    lastSummarizedMessageTimestamp: null,
  });
};

/**
 * Summarizes a list of messages using the provided AI service and saves it.
 */
export const saveSessionMemorySummary = async (
  userId: string,
  personaId: string,
  messagesToSummarize: Message[],
  aiService: AIService | null // Add parameter for the AI service instance
): Promise<void> => {
  if (!userId || !personaId) {
    throw new Error('User ID and Persona ID are required.');
  }
  if (!aiService) {
    console.warn(
      'AI service instance not provided to saveSessionMemorySummary. Skipping summarization.'
    );
    return; // Can't summarize without the service
  }

  if (messagesToSummarize.length === 0) {
    console.warn('Attempted to summarize an empty message list.');
    return;
  }

  // Find the timestamp of the latest message in this batch
  let latestMessageTimestamp: Timestamp | null = null;
  for (const msg of messagesToSummarize) {
    if (msg.createdAt) {
      // Ensure createdAt is not null
      const currentTimestamp =
        msg.createdAt instanceof Timestamp
          ? msg.createdAt
          : Timestamp.fromDate(msg.createdAt);
      if (
        !latestMessageTimestamp ||
        currentTimestamp.toMillis() > latestMessageTimestamp.toMillis()
      ) {
        latestMessageTimestamp = currentTimestamp;
      }
    }
  }

  // Format messages for the summarization prompt
  const formattedMessages = messagesToSummarize
    .map((msg) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
    .join('\n');

  const summarizationPrompt = `
Please summarize the key emotional themes, user struggles, AI insights, and overall trajectory of the following conversation excerpt:

${formattedMessages}

Focus on capturing the essence of the interaction for future context continuity. Summary:`;

  const metadataPrompt = `
From the following conversation, extract the key metadata as a valid JSON object. Follow this structure exactly: {"key_people": ["name1", "name2"], "key_events": ["event1", "event2"], "emotional_themes": ["theme1", "theme2"], "triggers": ["trigger1", "trigger2"]}. If a category is empty, use an empty array. Do not include any text before or after the JSON object.

Conversation:
${formattedMessages}

JSON Output:`;

  try {
    console.log(`Requesting summary and metadata from AI for ${personaId}...`);

    // Run both AI calls concurrently for efficiency
    const [summary, metadataResponse] = await Promise.all([
      aiService.sendMessage(summarizationPrompt),
      aiService.sendMessage(metadataPrompt),
    ]);

    let metadata: SummaryMetadata = {
      key_people: [],
      key_events: [],
      emotional_themes: [],
      triggers: [],
    };

    try {
      // The AI response should be a JSON string, so we parse it.
      // Add error handling in case the response is not valid JSON.
      const parsedMetadata = JSON.parse(metadataResponse);
      metadata = {
        key_people: parsedMetadata.key_people || [],
        key_events: parsedMetadata.key_events || [],
        emotional_themes: parsedMetadata.emotional_themes || [],
        triggers: parsedMetadata.triggers || [],
      };
    } catch (e) {
      console.error(
        'Failed to parse metadata from AI response:',
        e,
        'Response was:',
        metadataResponse
      );
      // If parsing fails, we'll proceed to save the summary without the structured metadata.
    }

    // --- Data Alignment ---
    // Collect the IDs of the messages that were part of this summary
    const sourceMessageIds = messagesToSummarize.map((msg) => msg.id);
    // Estimate token count (a simple heuristic, can be improved)
    const estimatedTokenCount = Math.ceil(
      (summary.length + formattedMessages.length) / 4
    );

    const summariesCollectionRef = collection(
      db,
      `users/${userId}/personas/${personaId}/memory_sessions`
    );

    const summaryData = {
      summary: summary.trim(),
      summarizedAt: serverTimestamp(),
      messageCount: messagesToSummarize.length,
      personaId: personaId,
      lastMessageTimestamp: latestMessageTimestamp,
      metadata: metadata,
      sourceMessageIds: sourceMessageIds,
      tokenCount: estimatedTokenCount,
    };

    await addDoc(summariesCollectionRef, summaryData);
    console.log('Session memory summary with full schema saved successfully.');

    if (latestMessageTimestamp) {
      await updateSessionMetadata(userId, personaId, {
        lastSummarizedMessageTimestamp: latestMessageTimestamp,
      });
    }
  } catch (error) {
    console.error('Error saving session memory summary:', error);
    throw error; // Re-throw error to be handled by the caller
  }
};

/**
 * Fetches the N most recent session memory summaries for a specific persona,
 * ordered by when the session ended.
 */
export const getRecentMemorySummaries = async (
  userId: string,
  personaId: string,
  count: number = 3 // Default to fetching 3 most recent
): Promise<SessionMemorySummary[]> => {
  if (!userId || !personaId) {
    console.error(
      'User ID and Persona ID are required to get memory summaries.'
    );
    return []; // Return empty array if IDs are missing
  }

  try {
    const summariesCollectionRef = collection(
      db,
      `users/${userId}/personas/${personaId}/memory_sessions`
    );
    const q = query(
      summariesCollectionRef,
      orderBy('summarizedAt', 'desc'), // Order by the correct timestamp field
      limit(count)
    );

    const querySnapshot = await getDocs(q);

    const summaries: SessionMemorySummary[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      summaries.push({
        id: doc.id,
        summary: data.summary,
        createdAt: data.summarizedAt as Timestamp, // Use summarizedAt
        messageCount: data.messageCount,
        personaId: data.personaId,
        lastMessageTimestamp:
          data.lastMessageTimestamp instanceof Timestamp
            ? data.lastMessageTimestamp
            : null,
        tokenCount: data.tokenCount,
        metadata: data.metadata as SummaryMetadata,
      });
    });

    return summaries;
  } catch (error) {
    console.error('Error retrieving recent summaries:', error);
    return []; // Return empty array on error
  }
};
