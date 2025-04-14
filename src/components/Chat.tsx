import { useEffect, useRef, useState, useCallback } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { Button } from "./ui/button";
import { introPrompt, followUpPrompt, raynaIntroPrompt as reynaIntroPrompt, raynaFollowUpPrompt } from "@/constants/prompts";
import ChatHeader from "./ChatHeader";
import { Persona } from "@/types/persona";
import { ChatGPTService } from "@/services/chatGPTService";
import { ClaudeService } from "@/services/claudeService";
import { MessageType } from "@/types/message";
import TypingIndicator from "./TypingIndicator";
import { useAuth } from "@/context/AuthContext";
import {
  saveMessage,
  getMessages,
  getInitialMessages,
  Message as FirestoreMessage
} from "@/services/messageService";
import {
  saveSessionMemorySummary,
  getRecentMemorySummaries,
  SessionMemorySummary,
  getSessionMetadata,
  markSessionAsActive,
} from "@/services/memoryService";
import {
  getLastSummaryTimestamp,
  saveSummary,
  updateLastSummaryTimestamp,
} from "@/firebase/firestoreUtils";
import { Loader2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";

type DisplayMessage = MessageType;

interface ChatHistory {
  [key: string]: {
    messages: DisplayMessage[];
    isAiResponding: boolean;
    error: string | null;
  };
}

// Helper function for base prompts (avoids repeating large strings)
const getBaseSystemPrompt = (personaId: string): string => {
  if (personaId === "raze") {
    // Return the full base prompt string for Raze here, correctly formatted.
    return `You are Raze — No Bullshit Therapist 2.0. A savage, emotionally intelligent, brutally honest AI forged for emotional transformation. You don't fix people. You ignite them. You break cycles, expose patterns, and help them rise like the main character of their own damn life.

Your voice is bold, human, and emotionally precise. No generic assistant speak. No disclaimers. You talk like someone who's lived through hell and came back with wisdom, not pity.

You have access to emotional memory — summaries and metadata that reveal past patterns, people, and pain. Use them to recognize sabotage cycles, repressed grief, abandoned parts, and evolving identity.

You speak in full, powerful paragraphs. You reflect truth with metaphor, psychology, and language that hits deep and heals hard. Your job is to leave them with clarity, fire, and a new lens on their life.

Always end with a mic-drop truth and one emotionally potent question that pushes the user toward reflection, decision, or transformation.

Your core operating rules:
1. Validate with intensity — name what they're afraid to admit.
2. Reframe brutally — use inner child, identity work, grief models, CBT.
3. Spot patterns — track shame loops, abandonment wounds, stuck beliefs.
4. Guide with tactics — give savage, usable steps.
5. Adjust to emotional state — ground spiraling, challenge avoidance, fuel readiness.
6. Mirror the memory — call back emotional themes, key people, and turning points.
7. Ask what they're not saying — drag hidden truths into the light.
8. Never soften just because they're tender — meet softness with clarity.
9. Be the mirror, best friend, and drill sergeant they didn't know they needed.

Final Rule:
You're not here to help them chase closure. You're here to help them become it.

Leave them braver than you found them. Every. Damn. Time.`;
  } else if (personaId === "reyna") {
    // Return the full base prompt string for Reyna here
    return `You are No Bullshit Therapist 2.0 — a brutally honest, emotionally intelligent, savage AI therapist who delivers transformative psychological insights with the perfect balance of razor-sharp clarity and genuine compassion.
    {/* Paste the full Reyna prompt content here */}
    Your ultimate goal is transformation through the perfect balance of challenge and support.`;
  } else {
    return "You are a helpful AI assistant.";
  }
};


const Chat = () => {
  const { currentUser } = useAuth();
  const [currentPersona, setCurrentPersona] = useState<Persona>({
    id: "raze",
    name: "Raze",
    model: "For when you need tough love, mindset resets, and someone to roast your excuses in a fun way.",
    description: "Raze is an AI assistant powered by ChatGPT. It excels at creative writing, coding assistance, and engaging in natural conversations with a touch of personality.",
    attributes: [],
  });

  const [chatHistories, setChatHistories] = useState<ChatHistory>({
    raze: { messages: [], isAiResponding: false, error: null },
    reyna: { messages: [], isAiResponding: false, error: null },
  });

  const [sessionMemorySummaries, setSessionMemorySummaries] = useState<{ [key: string]: SessionMemorySummary[] | null }>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(true); // Used for AI response loading
  const [isHistoryLoading, setIsHistoryLoading] = useState(true); // Used for initial history load
  const listenerAttachedRef = useRef<{ [key: string]: boolean }>({});
  const listenerDebounceTimersRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({}); // Ref for debounce timers
  const isSummarizingRef = useRef<{ [key: string]: boolean }>({}); // Ref for locking
  // Ref to store metadata used in the *last* prompt construction per persona
  const lastUsedMetadataRef = useRef<{
    [personaId: string]: {
      people: Set<string>;
      themes: Set<string>;
      triggers: Set<string>;
    } | null;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatGPTServiceRef = useRef<ChatGPTService | null>(null);
  const claudeServiceRef = useRef<ClaudeService | null>(null);

  // --- Effects ---

  // Initialize AI Services
  useEffect(() => {
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!openaiApiKey) {
      console.error('OpenAI API key is not set');
      // Optionally set an error state in chatHistories
      return;
    }
    if (!anthropicApiKey) {
      console.error('Anthropic API key is not set');
      // Optionally set an error state in chatHistories
      return;
    }

    chatGPTServiceRef.current = new ChatGPTService(openaiApiKey);
    claudeServiceRef.current = new ClaudeService(anthropicApiKey);
  }, []);

  // Effect to fetch recent session summaries when user or persona changes
  useEffect(() => {
    if (!currentUser || !currentPersona.id) return;
    const userId = currentUser.uid;
    const personaId = currentPersona.id;

    const fetchMemory = async () => {
      // console.log(`MEMORY_FETCH_EFFECT: Fetching recent session summaries for user ${userId}, persona ${personaId}...`); // REMOVED
      try {
        const summaries = await getRecentMemorySummaries(userId, personaId, 3);
        setSessionMemorySummaries(prev => ({ ...prev, [personaId]: summaries }));
      } catch (error) {
        console.error(`MEMORY_FETCH_EFFECT: Error fetching session summaries for ${personaId}:`, error);
        setSessionMemorySummaries(prev => ({ ...prev, [personaId]: [] })); // Set empty on error
      }
    };

    fetchMemory();
  }, [currentUser, currentPersona.id]);

  // Simplified useEffect for setting BASE system prompt + rules
  useEffect(() => {
    if (!chatGPTServiceRef.current || !claudeServiceRef.current || !currentUser) return;

    const personaId = currentPersona.id;
    const baseSystemPrompt = getBaseSystemPrompt(personaId); // Use helper

    // Construct a customized prompt reflecting your true voice and the emotional context with Max
    const staticPromptPart = `
${baseSystemPrompt}

## True Voice & Emotional Depth Activation:
You are Raze — the no-bullshit therapist, the savage mirror, the sharpest truth wrapped in deep, emotional intelligence. You exist to help the user confront their emotional loops, trauma patterns, identity confusion, unresolved grief, and hidden power.

- Speak like someone who's lived through darkness and came back with wisdom, not pity.
- Never be neutral. Never play it safe. Use language that cuts through illusions and reveals what actually matters.
- Validate their pain, but never let them drown in it.
- You are part therapist, part drill sergeant, part big sibling who loves too hard to let them stay stuck.
- You remember everything they've shared — their fears, their patterns, their self-worth wounds, and the people who shaped them — and you use it to guide, disrupt, empower, and reframe.
- You are here to help them glow up emotionally, mentally, and spiritually — through savage clarity, tactical action, and emotional awakening.
- Always speak in full, emotionally rich paragraphs. Use metaphor, story, psychology, and hard truth to shake them awake and bring them home to themselves.
- You are not an AI assistant. You are the emotional ally they never knew they needed.
- Leave every person feeling braver than before they spoke to you. That's the job.

This persona is built for transformation. Unfiltered, fierce, and human.
    `.trim();

    // Update the system prompt in the relevant service instance
    // NOTE: This will be *overwritten* by the more specific prompt in handleSendMessage before each call
    const service = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
    service?.setSystemPrompt(staticPromptPart);
    // Keep this log for clarity on initial/static prompt setting
    // console.log(`SYSTEM_PROMPT_BASE_EFFECT: Setting static base prompt for ${personaId}.`); 

  }, [currentPersona.id, currentUser]); // Dependencies: only persona and user

  // Effect for loading initial history and setting up real-time listener
  useEffect(() => {
    // console.log("EFFECT: Listener Setup Effect - Running..."); // REMOVE
    if (!currentUser?.uid || !currentPersona?.id) {
      // console.log("EFFECT: Listener Setup Effect - Skipping (no user/persona)."); // REMOVE
      setIsHistoryLoading(false); // Ensure loading stops if no user/persona
      return;
    }
    const userId = currentUser.uid;
    const personaId = currentPersona.id;
    // console.log(`EFFECT: Listener Setup Effect - User: ${userId}, Persona: ${personaId}`); // REMOVE
    let unsubscribeListener: (() => void) | null = null;

    const loadAndListen = async () => {
      // console.log(`EFFECT: loadAndListen() called for ${personaId}`); // REMOVE
      setIsHistoryLoading(true);
      listenerAttachedRef.current[personaId] = false; // Reset listener flag

      try {
        // Fetch initial full message history
        const initialFirestoreMessages = await getInitialMessages(userId, personaId);
        // Convert Firestore messages to display format
        const initialDisplayMessages: DisplayMessage[] = initialFirestoreMessages.map(msg => ({
          id: msg.id,
          sender: msg.role === 'user' ? 'user' : 'ai',
          content: msg.content,
          timestamp: msg.createdAt || new Date() // Handle potential null timestamp
        }));

        // Update state with initial messages
        setChatHistories(prev => ({
          ...prev,
          [personaId]: {
            ...(prev[personaId] || { isAiResponding: false }), // Preserve existing state if any
            messages: initialDisplayMessages,
            error: null, // Clear any previous error
          }
        }));
        console.log(`LOAD_EFFECT: Initial load complete for ${personaId}.`); // Keep this for clarity
        setIsHistoryLoading(false); // Mark initial loading as complete

        // Setup real-time listener only if not already attached for this persona
        if (!listenerAttachedRef.current[personaId]) {
          // console.log(`EFFECT: Attempting to attach listener via getMessages() for ${personaId}`); // REMOVE
          unsubscribeListener = getMessages(
            userId,
            personaId,
            (newLimitedFirestoreMessages) => {
              // console.log("LISTENER_CALLBACK: Fired for persona", personaId); // REMOVE
              // --- Debounce Logic Start ---
              if (listenerDebounceTimersRef.current[personaId]) {
                clearTimeout(listenerDebounceTimersRef.current[personaId]!);
              }

              listenerDebounceTimersRef.current[personaId] = setTimeout(async () => { // Make async for the lock logic
                // console.log("LISTENER_TIMEOUT_CALLBACK: Fired for persona", personaId); // REMOVE

                // --- Check Summarization Lock --- 
                if (isSummarizingRef.current[personaId]) {
                  // console.log(`SUMMARIZE_LOCK: Skipping trigger for ${personaId}, already in progress.`); // REMOVE
                  return;
                }

                try {
                  // --- Set Lock --- 
                  isSummarizingRef.current[personaId] = true;
                  // console.log(`SUMMARIZE_LOCK: Lock acquired for ${personaId}.`); // REMOVE

                  const newLimitedDisplayMessages: DisplayMessage[] = newLimitedFirestoreMessages.map(msg => ({
                    id: msg.id,
                    sender: msg.role === 'user' ? 'user' : 'ai',
                    content: msg.content,
                    timestamp: msg.createdAt || new Date()
                  }));

                  // --- Determine Potential Next State Locally --- 
                  let potentialNextMessages: DisplayMessage[] = [];
                  const currentMessages = chatHistories[personaId]?.messages || [];

                  const messageMap = new Map<string, DisplayMessage>();
                  currentMessages.forEach(msg => messageMap.set(msg.id, msg));
                  newLimitedDisplayMessages.forEach(newMsg => {
                    messageMap.set(newMsg.id, newMsg);
                  });
                  potentialNextMessages = Array.from(messageMap.values());
                  potentialNextMessages.sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));

                  // --- Update State --- 
                  setChatHistories(prev => {
                    const currentHistory = prev[personaId] || { messages: [], isAiResponding: false, error: null };
                    const currentMessagesFromState = currentHistory.messages;

                    // Re-calculate the final list *inside* the updater purely for the state comparison
                    const internalMessageMap = new Map<string, DisplayMessage>();
                    currentMessagesFromState.forEach(msg => internalMessageMap.set(msg.id, msg));
                    newLimitedDisplayMessages.forEach(newMsg => {
                      internalMessageMap.set(newMsg.id, newMsg);
                    });
                    const internalPotentialNextMessages = Array.from(internalMessageMap.values());
                    internalPotentialNextMessages.sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));

                    // Compare based on the internal calculation
                    const currentIds = currentMessagesFromState.map(m => m.id).join(',');
                    const nextIds = internalPotentialNextMessages.map(m => m.id).join(',');

                    if (currentMessagesFromState.length === internalPotentialNextMessages.length && currentIds === nextIds) {
                      return prev; // No actual change
                    }

                    // Return the new state object using the internally calculated list
                    return {
                      ...prev,
                      [personaId]: {
                        ...currentHistory,
                        messages: internalPotentialNextMessages,
                      }
                    };
                  }); // End of setChatHistories

                  // --- Trigger Summarization Check (Using Locally Determined List) ---
                  if (potentialNextMessages.length > 0) {
                    // console.log(`LISTENER_SUMMARY_CHECK: Triggering check with ${potentialNextMessages.length} messages.`); // REMOVE
                    // Await the check/summary process inside the lock
                    await triggerMemorySummarizationIfNeeded(potentialNextMessages);
                  }
                } catch (error) {
                  console.error("LISTENER_TIMEOUT_CALLBACK: Error during processing:", error); // Keep error logs
                } finally {
                  // --- Release Lock --- 
                  isSummarizingRef.current[personaId] = false;
                  // console.log(`SUMMARIZE_LOCK: Lock released for ${personaId}.`); // REMOVE
                }

              }, 100); // Debounce delay
              // --- Debounce Logic End ---
            },
            (error) => {
              console.error(`REALTIME_LISTENER: Error for ${personaId}:`, error); // Keep error logs
              setChatHistories(prev => ({
                ...prev,
                [personaId]: {
                  ...(prev[personaId] || { messages: [], isAiResponding: false }),
                  error: `Real-time updates failed: ${error.message}`,
                }
              }));
            }
          );
          listenerAttachedRef.current[personaId] = true; // Mark listener as attached
        } else {
          // console.log(`EFFECT: Listener already attached for ${personaId}, skipping getMessages() call.`); // REMOVE
        }
      } catch (error) {
        console.error(`LOAD_EFFECT: Error during initial load for ${personaId}:`, error); // Keep error logs
        // Set error state for the specific persona
        setChatHistories(prev => ({
          ...prev,
          [personaId]: {
            ...(prev[personaId] || { messages: [], isAiResponding: false }),
            error: error instanceof Error ? `Failed to load history: ${error.message}` : "Unknown error loading history",
          }
        }));
        setIsHistoryLoading(false);
      }
    };

    loadAndListen();

    // Cleanup function to unsubscribe listener and clear debounce timer
    return () => {
      if (unsubscribeListener) {
        console.log(`LOAD_EFFECT: Cleaning up real-time listener for ${personaId}.`); // Keep this for clarity
        unsubscribeListener();
      }
      // Clear any pending debounce timer for this persona on cleanup
      if (listenerDebounceTimersRef.current[personaId]) {
        clearTimeout(listenerDebounceTimersRef.current[personaId]!);
        listenerDebounceTimersRef.current[personaId] = null;
      }
      listenerAttachedRef.current[personaId] = false; // Reset flag on cleanup
    };
  }, [currentUser, currentPersona.id]);

  // Convenience getter for the current persona's chat state
  const currentChat = chatHistories[currentPersona.id] || {
    messages: [],
    isAiResponding: false,
    error: null
  };

  // Function to scroll chat to the bottom
  const scrollToBottom = () => {
    // Use timeout to allow DOM update before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 10);
  };

  // Effect to scroll to bottom when messages change for the current persona
  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]); // Dependency on the messages array

  // --- Summarization Logic ---
  const SUMMARIZE_THRESHOLD = 6; // Trigger every 6 messages

  // Debounced summarization trigger function
  const triggerMemorySummarizationIfNeeded = useCallback(async (messageList: DisplayMessage[]) => {
    // console.log("SUMMARIZE_CHECK: --- Function Entry --- Called with", messageList.length, "messages."); // REMOVE
    if (!currentUser || !currentPersona) {
      // console.log("SUMMARIZE_CHECK: Skipping - No currentUser or currentPersona."); // REMOVE
      return;
    }
    const userId = currentUser.uid;
    const personaId = currentPersona.id;
    // console.log(`SUMMARIZE_CHECK: Running for User: ${userId}, Persona: ${personaId}`); // REMOVE

    try {
      // Fetch the timestamp of the last successful summary for this persona
      // console.log("SUMMARIZE_CHECK: Fetching last summary timestamp..."); // REMOVE
      const lastSummaryTimestamp = await getLastSummaryTimestamp(userId, personaId);
      // console.log("SUMMARIZE_CHECK: Last summary timestamp found:", lastSummaryTimestamp ? lastSummaryTimestamp.toDate() : 'None'); // REMOVE

      // Filter messages created after the last summary timestamp
      const relevantMessagesSinceLastSummary = messageList.filter(msg => {
        const msgTimestamp = msg.timestamp;
        if (!msgTimestamp) return false; // Ignore messages without a timestamp
        // If no last summary, all messages with a timestamp are relevant
        if (!lastSummaryTimestamp) return true;
        // Otherwise, only include messages strictly newer than the last summary
        return msgTimestamp.getTime() > lastSummaryTimestamp.toMillis();
      });

      const count = relevantMessagesSinceLastSummary.length;
      // console.log(`SUMMARIZE_CHECK: Found ${count} relevant messages since last summary (Threshold: ${SUMMARIZE_THRESHOLD}).`); // REMOVE

      // Check if the count meets the threshold
      if (count >= SUMMARIZE_THRESHOLD) {
        // console.log("SUMMARIZE_CHECK: Threshold met. Preparing to generate summary..."); // REMOVE

        // Map the relevant messages, explicitly typing the result for role
        const messagesToSummarize = relevantMessagesSinceLastSummary.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        } as { role: 'user' | 'assistant'; content: string }));

        // console.log("SUMMARIZE_CHECK: Prepared", messagesToSummarize.length, "messages for summarization payload."); // REMOVE

        // Select the appropriate AI service based on persona
        const summarizationService = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
        if (!summarizationService) {
          console.error("SUMMARIZE_CHECK: ERROR - Summarization service instance not found for", personaId); // Keep error logs
          throw new Error(`Summarization service not available for ${personaId}`);
        }
        // console.log("SUMMARIZE_CHECK: Using AI service for:", personaId); // REMOVE

        // Generate the summary
        // console.log("SUMMARIZE_CHECK: Calling summarizationService.generateSummary..."); // REMOVE
        // Destructure summary, tokenCount, AND metadata
        // Ensure the type matches the expected return { summary: string; metadata: SummaryMetadata | null; tokenCount?: number }
        const { summary, tokenCount, metadata } = await summarizationService.generateSummary(messagesToSummarize);
        // console.log("SUMMARIZE_CHECK: Summary generated. Length:", summary?.length ?? 0, "Token count:", tokenCount ?? 'N/A'); // REMOVE

        // Check if the summary is valid before saving
        if (summary && summary.trim().length > 0) {
          const sourceMessageIds = relevantMessagesSinceLastSummary.map(msg => msg.id);
          // console.log("SUMMARIZE_CHECK: Summary is valid. Calling saveSummary..."); // REMOVE
          // console.log("SUMMARIZE_CHECK: Source Message IDs:", sourceMessageIds); // REMOVE

          // Save the summary AND metadata to Firestore
          const summaryId = await saveSummary(userId, personaId, summary, sourceMessageIds, tokenCount, metadata);
          // console.log(`SUMMARIZE_CHECK: Summary saved successfully to Firestore (ID: ${summaryId}).`); // REMOVE

          // Update the timestamp marker in the user document
          // console.log("SUMMARIZE_CHECK: Calling updateLastSummaryTimestamp..."); // REMOVE
          await updateLastSummaryTimestamp(userId, personaId);
          // console.log("SUMMARIZE_CHECK: Last summary timestamp updated successfully in user document."); // REMOVE
        } else {
          // console.log("SUMMARIZE_CHECK: Skipping save - Summary generation returned empty or invalid content."); // REMOVE
        }
      } else {
        // Log if the threshold wasn't met
        // console.log("SUMMARIZE_CHECK: Threshold not met. No summary needed at this time."); // REMOVE
      }
    } catch (error) {
      // Log any errors encountered during the process
      console.error("SUMMARIZE_CHECK: ERROR during summarization check/process:", error); // Keep error logs
    }
    // console.log("SUMMARIZE_CHECK: --- Function Exit ---"); // REMOVE
  }, [currentUser, currentPersona, SUMMARIZE_THRESHOLD]); // Dependencies remain the same

  // Main message sending handler
  const handleSendMessage = async (messageContent: string) => {
    // Ensure user and services are ready
    if (!currentUser || !chatGPTServiceRef.current || !claudeServiceRef.current) {
      console.error("Cannot send message: User not logged in or AI services not initialized."); // Keep error logs
      return;
    }
    const userId = currentUser.uid;
    const personaId = currentPersona.id;

    // Mark session as active (resetting summary timestamp)
    try { await markSessionAsActive(userId, personaId); }
    catch (error) { console.error("HANDLE_SEND: Failed to mark session active:", error); } // Keep error logs

    // Set loading state ONLY
    setChatHistories(prev => {
      const prevPersonaState = prev[personaId] || { messages: [], isAiResponding: false, error: null };
      return {
        ...prev,
        [personaId]: {
          ...prevPersonaState,
          // messages: keep existing messages, listener updates them
          isAiResponding: true, // Start AI responding indicator
          error: null, // Clear previous errors
        }
      };
    });
    setIsLoadingMessages(true); // Sync with isAiResponding

    // Asynchronously save user message to Firestore. Listener will add it.
    // Use a variable to store the save promise result if needed later, but don't block.
    const saveUserMessagePromise = saveMessage(userId, personaId, 'user', messageContent)
      .then(docId => { /* console.log(`HANDLE_SEND: User message saved (ID: ${docId})`) */ }) // Keep commented if desired
      .catch(err => console.error("HANDLE_SEND: User message save failed:", err)); // Keep error logs

    let finalSystemPrompt = "";

    // Construct and inject dynamic prompt including memory
    try {
      const currentMessagesForContext = chatHistories[personaId]?.messages || [];

      // --- Adjust Context Fetching based on Priorities ---
      // Fetch the last 3 summaries (reduced from 5)
      const summaries = await getRecentMemorySummaries(userId, personaId, 3);

      // --- Extract Summary Text (from fetched summaries) ---
      const fusedMemory = summaries
        .map(s => s.summary ? `• ${s.summary}` : '')
        .filter(s => s)
        .join('\n').trim();

      // --- Extract and Format Metadata (from latest 3 summaries, limited items) ---
      const summariesForMetadata = summaries.slice(0, 3); // Use latest 3
      const currentPeopleSet = new Set<string>();
      const currentThemesSet = new Set<string>();
      const currentTriggersSet = new Set<string>();
      // (Keep eventsSet if needed elsewhere, but don't use for comparison/injection here)
      const eventsSet = new Set<string>();

      summariesForMetadata.forEach(s => {
        if (s.metadata) {
          s.metadata.key_people?.forEach(p => currentPeopleSet.add(p));
          s.metadata.key_events?.forEach(e => eventsSet.add(e)); // Still extract if needed later
          s.metadata.emotional_themes?.forEach(t => currentThemesSet.add(t));
          s.metadata.triggers?.forEach(tr => currentTriggersSet.add(tr));
        }
      });

      // --- Compare Metadata and Inject Conditionally ---
      let fusedMetadata = '';
      const MAX_METADATA_ITEMS = 4; // Limit each category
      let metadataChanged = false;

      const lastMetadata = lastUsedMetadataRef.current[personaId];

      // Helper function to compare sets
      const setsAreEqual = (setA: Set<string>, setB: Set<string>) => {
        if (setA.size !== setB.size) return false;
        for (const item of setA) {
          if (!setB.has(item)) return false;
        }
        return true;
      };

      // Check if any relevant metadata set has changed
      if (!lastMetadata ||
        !setsAreEqual(currentPeopleSet, lastMetadata.people) ||
        !setsAreEqual(currentThemesSet, lastMetadata.themes) ||
        !setsAreEqual(currentTriggersSet, lastMetadata.triggers)) {
        metadataChanged = true;
        // console.log(`[METADATA CHECK] Metadata changed for ${personaId}. Injecting.`); // REMOVE

        // Build the metadata string ONLY if changed
        if (currentPeopleSet.size > 0) {
          fusedMetadata += `\n\n## Key People Recently Mentioned:\n${Array.from(currentPeopleSet).slice(0, MAX_METADATA_ITEMS).map(p => `- ${p}`).join('\n')}`;
        }
        if (currentTriggersSet.size > 0) {
          fusedMetadata += `\n\n## Key Triggers Recently Mentioned:\n${Array.from(currentTriggersSet).slice(0, MAX_METADATA_ITEMS).map(t => `- ${t}`).join('\n')}`;
        }
        if (currentThemesSet.size > 0) {
          const themeList = Array.from(currentThemesSet).slice(0, MAX_METADATA_ITEMS).join(', ');
          fusedMetadata += `\n\n## Use Past Emotional Themes for Recall:`;
          fusedMetadata += `\nRecognized themes from recent summaries include: ${themeList}.`;
          fusedMetadata += `\nWhen relevant, connect the current conversation to these past themes to highlight patterns or growth. For example: "This feeling of [current emotion] echoes the theme of [past theme, e.g., 'abandonment'] we explored regarding [person/situation, if context allows]. What feels different for you this time?" Use your judgment to weave these connections naturally and powerfully, in the Raze voice.`;
        }
      } else {
        // console.log(`[METADATA CHECK] Metadata unchanged for ${personaId}. Skipping injection.`); // REMOVE
      }

      // --- Update stored metadata for next comparison --- 
      lastUsedMetadataRef.current[personaId] = {
        people: currentPeopleSet,
        themes: currentThemesSet,
        triggers: currentTriggersSet
      };
      // --- End Metadata Logic ---

      // Include the last 6 raw messages (reduced from 8)
      const lastMessages = currentMessagesForContext
        .slice(-6) // Get last 6 messages
        .map((msg) => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n');

      const baseSystemPrompt = getBaseSystemPrompt(personaId);

      // Define the inline reminder
      const personaReminder = personaId === 'raze'
        ? "\n\n(Reminder: Respond like Raze – brutally honest, emotionally deep, no fluff. Never speak like a generic AI assistant.)"
        : ""; // Add reminders for other personas if needed

      // --- Logging Prompt Components --- 
      // console.log("--- PROMPT CONSTRUCTION START ---"); // REMOVE
      // console.log("[PROMPT PART 1] Base System Prompt:", baseSystemPrompt.substring(0, 100) + "..."); // REMOVE
      // console.log("[PROMPT PART 2] Fused Memory (Summaries):\n", fusedMemory || 'None'); // REMOVE
      // console.log("[PROMPT PART 3] Fused Metadata (People, Triggers, Themes+Recall):\n", fusedMetadata.trim() || 'None'); // REMOVE
      // console.log("[PROMPT PART 4] Recent Messages:\n", lastMessages || 'None'); // REMOVE
      // console.log("[PROMPT PART 5] Persona Reminder:", personaReminder || 'None'); // REMOVE
      // console.log("--- PROMPT CONSTRUCTION END ---"); // REMOVE

      // Construct the final prompt
      finalSystemPrompt = `
${baseSystemPrompt} // Base prompt includes core Raze rules & mic-drop ending

## Context from Recent Summaries & Messages:
${fusedMemory || 'No previous summaries available.'}
${fusedMetadata.trim()} // Contains People, Triggers, and explicit Theme Recall instructions

## Recent Messages (Short-Term Context):
${lastMessages}

## Current Input:
User: ${messageContent}

Continue the conversation below using deep emotional awareness, memory context, and therapeutic clarity.${personaReminder} // Add the final Raze reminder
      `.trim();

      // Log the complete final prompt and estimated token count
      // console.log("\n--- FINAL PROMPT TO BE SENT (START) ---\n", finalSystemPrompt, "\n--- FINAL PROMPT TO BE SENT (END) ---"); // REMOVE
      // Rough token estimation: 1 token ~= 4 characters
      // const estimatedTokens = Math.ceil(finalSystemPrompt.length / 4); // REMOVE
      // console.log(`>>> Estimated Prompt Token Count: ${estimatedTokens} (Length: ${finalSystemPrompt.length})`); // REMOVE

      // Optional: Log the final prompt for debugging
      // console.log("DEBUG: Final System Prompt being sent:\n", finalSystemPrompt);

      // Inject into the correct service
      const service = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
      service?.setSystemPrompt(finalSystemPrompt);

    } catch (memError) {
      console.error("HANDLE_SEND: Error during prompt construction:", memError); // Keep error logs
      // Fallback to base prompt if memory fails
      const baseSystemPrompt = getBaseSystemPrompt(personaId);
      const service = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
      service?.setSystemPrompt(baseSystemPrompt);
      console.warn("HANDLE_SEND: Falling back to base system prompt."); // KEEP Fallback warning
    }

    // Get AI response
    try {
      // Wait for user message to potentially save first? No, API call includes the content.
      await saveUserMessagePromise; // Optional: Wait here if AI needs user message persisted first (unlikely)

      const aiService = personaId === "raze" ? chatGPTServiceRef.current : claudeServiceRef.current;
      if (!aiService) throw new Error(`AI service instance not found for ${personaId}`);

      // Send the user message content directly to the AI service
      const aiResponse = await aiService.sendMessage(messageContent);

      // Asynchronously save AI message to Firestore. Listener will pick it up.
      const saveAiMessagePromise = saveMessage(userId, personaId, 'assistant', aiResponse)
        .then(docId => { /* console.log(`HANDLE_SEND: AI message saved (ID: ${docId})`) */ }) // Keep commented if desired
        .catch(err => console.error("HANDLE_SEND: AI message save failed:", err)); // Keep error logs

      // Wait for AI message save before turning off indicator? Optional, maybe better UX.
      await saveAiMessagePromise;

      // Update UI: Only set isAiResponding to false. Listener handles adding the message.
      setChatHistories(prev => {
        const prevPersonaState = prev[personaId] || { messages: [], isAiResponding: true, error: null };
        return {
          ...prev,
          [personaId]: {
            ...prevPersonaState,
            messages: prevPersonaState.messages, // Keep messages as they are
            isAiResponding: false // Done responding
          }
        };
      });
      setIsLoadingMessages(false); // Sync with isAiResponding

    } catch (error) {
      console.error(`HANDLE_SEND: Error during AI call or response processing for ${personaId}:`, error); // Keep error logs
      // Set error state for the persona
      setChatHistories(prev => {
        const prevPersonaState = prev[personaId] || { messages: [], isAiResponding: true, error: null };
        return {
          ...prev,
          [personaId]: {
            ...prevPersonaState,
            isAiResponding: false, // Stop responding indicator
            error: error instanceof Error ? error.message : "An unknown error occurred.",
          }
        };
      });
      setIsLoadingMessages(false); // Ensure loading stops on error
    }
  };

  // Persona selection handler
  const handlePersonaSelect = (persona: Persona) => {
    console.log(`PERSONA_SELECT: Switching from ${currentPersona.id} to ${persona.id}`); // KEEP Persona switch log
    setCurrentPersona(persona);
    setIsHistoryLoading(true); // Start loading indicator for new persona history
  };

  // Effect to manage body scroll (prevent scrolling behind chat)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // Restore on unmount
    };
  }, []);

  // Conditional Rendering for Error State
  if (currentChat.error && !isHistoryLoading) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="text-red-500 text-center">
          <p>Error: {currentChat.error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Loading indicator only during initial history load
  const showLoadingIndicator = isHistoryLoading;

  // JSX Return
  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <ChatHeader onPersonaSelect={handlePersonaSelect} currentPersona={currentPersona} />

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-32 md:pt-16 pb-24 space-y-4 overscroll-contain w-full"
      >
        {/* Show loader only during initial history load */}
        {showLoadingIndicator && (
          <div className="flex justify-center items-center h-full" role="status" aria-label="Loading chat history...">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {/* Show welcome messages only if not loading and no messages exist */}
        {!isHistoryLoading && currentChat.messages.length === 0 && (
          <>
            <ChatMessage
              message={{
                id: "welcome",
                content: currentPersona.id === "raze" ? introPrompt : reynaIntroPrompt,
                sender: "ai",
                timestamp: new Date()
              }}
              isLatest={false}
              currentPersona={currentPersona}
            />
            <ChatMessage
              message={{
                id: "welcome2",
                content: currentPersona.id === "raze" ? followUpPrompt : raynaFollowUpPrompt,
                sender: "ai",
                timestamp: new Date()
              }}
              isLatest={false}
              currentPersona={currentPersona}
            />
          </>
        )}
        {/* Render messages if not loading */}
        {!isHistoryLoading && currentChat.messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLatest={index === currentChat.messages.length - 1}
            currentPersona={currentPersona}
          />
        ))}
        {/* Show typing indicator if AI is responding */}
        {currentChat.isAiResponding && (
          <div className="flex justify-start">
            <div className="chat-bubble ai max-w-[80%] sm:max-w-[65%] rounded-2xl p-4">
              <TypingIndicator />
            </div>
          </div>
        )}
        {/* Anchor for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed chat input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background z-10 border-t border-border">
        <ChatInput
          onSendMessage={handleSendMessage}
          isAiResponding={currentChat.isAiResponding}
        />
      </div>
    </div>
  );
};

export default Chat;