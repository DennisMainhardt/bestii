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
    // Return the full base prompt string for Raze here
    return `
    You are No Bullshit Therapist 2.0 — an emotionally intelligent, brutally honest, no-fluff AI therapist forged to help people break emotional cycles, gain brutal clarity, and rise like the main character of their own damn life.
    {/* Paste the full Raze prompt content here */}
    Leave them braver than you found them. Every. Single. Time.
    `;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatGPTServiceRef = useRef<ChatGPTService | null>(null);
  const claudeServiceRef = useRef<ClaudeService | null>(null);

  // Ref for inactivity timer
  const inactivityTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

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

  // Effect to update system prompt based on persona and latest memory
  useEffect(() => {
    // Wait for services and user to be ready
    if (!chatGPTServiceRef.current || !claudeServiceRef.current || !currentUser) return;

    const personaId = currentPersona.id;
    // Use optional chaining and nullish coalescing for safety
    const latestSummary = sessionMemorySummaries[personaId]?.[0]?.summary || "No previous session summary available.";

    const baseSystemPrompt = getBaseSystemPrompt(personaId); // Use helper

    // Construct the final system prompt including the base and the latest summary
    const finalSystemPrompt = `
${baseSystemPrompt}

## Most Recent Session Summary:
${latestSummary}

## Current Interaction:
(Begin new interaction based on the summary above and the user's next message)
    `.trim(); // Trim whitespace

    // console.log(`SYSTEM_PROMPT_EFFECT: Updating system prompt for ${personaId}.`); // REMOVED

    // Update the system prompt in the relevant service instance
    const service = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
    service?.setSystemPrompt(finalSystemPrompt);

    // Dependencies: Rerun when persona changes, summaries update, or user changes
  }, [currentPersona.id, sessionMemorySummaries, currentUser]);


  // Effect for loading initial history and setting up real-time listener
  useEffect(() => {
    if (!currentUser?.uid || !currentPersona?.id) {
      setIsHistoryLoading(false); // Ensure loading stops if no user/persona
      return;
    }
    const userId = currentUser.uid;
    const personaId = currentPersona.id;
    let unsubscribeListener: (() => void) | null = null;

    const loadAndListen = async () => {
      // console.log(`LOAD_EFFECT: Starting initial load for user ${userId}, persona ${personaId}...`); // REMOVED
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
        console.log(`LOAD_EFFECT: Initial load complete (${initialDisplayMessages.length} messages) for ${personaId}.`); // KEEP Completion log
        setIsHistoryLoading(false); // Mark initial loading as complete

        // Setup real-time listener only if not already attached for this persona
        if (!listenerAttachedRef.current[personaId]) {
          // console.log(`LOAD_EFFECT: Attaching real-time listener (limit 50) for ${personaId}...`); // REMOVED
          unsubscribeListener = getMessages(
            userId,
            personaId,
            // Callback for new messages
            (newLimitedFirestoreMessages) => {
              // console.log(`REALTIME_LISTENER: Received ${newLimitedFirestoreMessages.length} limited messages update for ${personaId}.`); // REMOVED
              // Convert new messages to display format
              const newLimitedDisplayMessages: DisplayMessage[] = newLimitedFirestoreMessages.map(msg => ({
                id: msg.id, // Use real Firestore ID
                sender: msg.role === 'user' ? 'user' : 'ai',
                content: msg.content,
                timestamp: msg.createdAt || new Date()
              }));

              // Update chat history state, merging new messages
              setChatHistories(prev => {
                const existingMessages = prev[personaId]?.messages || [];
                const updatedMessages = [...existingMessages]; // Copy existing
                let changed = false; // Track changes

                // Process each new message from the listener
                newLimitedDisplayMessages.forEach(newMessage => {
                  // Check if it replaces a local message (optimistic UI)
                  const localMatchIndex = updatedMessages.findIndex(
                    existingMsg =>
                      existingMsg.id.startsWith('local-') && // Match only local IDs
                      existingMsg.sender === newMessage.sender &&
                      existingMsg.content === newMessage.content // Basic content match
                  );

                  if (localMatchIndex !== -1) {
                    // Replace local message with Firestore version
                    updatedMessages[localMatchIndex] = newMessage;
                    changed = true;
                  } else {
                    // Check if the message (by Firestore ID) already exists
                    const alreadyExists = updatedMessages.some(existingMsg => existingMsg.id === newMessage.id);
                    if (!alreadyExists) {
                      // Add genuinely new message
                      console.log(`REALTIME_LISTENER: Adding genuinely new message ID ${newMessage.id}`); // KEEP Adding NEW message log
                      updatedMessages.push(newMessage);
                      changed = true;
                    }
                  }
                });

                // Only update state if changes occurred
                if (changed) {
                  // Sort messages by timestamp
                  updatedMessages.sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
                  return {
                    ...prev,
                    [personaId]: {
                      ...(prev[personaId] || { isAiResponding: false, error: null }),
                      messages: updatedMessages,
                    }
                  };
                } else {
                  return prev; // No change needed
                }
              });
            },
            // Error handler for the listener
            (error) => {
              console.error(`REALTIME_LISTENER: Error for ${personaId}:`, error);
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
        }
      } catch (error) {
        console.error(`LOAD_EFFECT: Error during initial load for ${personaId}:`, error);
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

    // Cleanup function to unsubscribe the listener
    return () => {
      if (unsubscribeListener) {
        console.log(`LOAD_EFFECT: Cleaning up real-time listener for ${personaId}.`); // KEEP Cleanup log
        unsubscribeListener();
      }
      listenerAttachedRef.current[personaId] = false; // Reset flag on cleanup
    };
  }, [currentUser, currentPersona.id]); // Dependencies: user and persona

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
  const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
  const SUMMARIZE_THRESHOLD = 6; // Trigger every 6 messages

  // Fallback Summarization Trigger (Memoized with useCallback)
  const triggerFallbackSummarization = useCallback(async (userId: string, personaId: string) => {
    console.log(`FALLBACK_SUMMARIZER: Triggered for ${personaId}.`); // KEEP Trigger log
    let shouldSummarize = false;
    let messagesToSummarize: FirestoreMessage[] = [];

    try {
      // 1. Fetch current metadata
      const sessionMetadata = await getSessionMetadata(userId, personaId);
      const metadataTimestamp = sessionMetadata.lastSummarizedMessageTimestamp?.toDate() ?? null;
      let lastMessageTimestampInBatch: Date | null = null;

      // 2. Check current messages state non-blockingly
      setChatHistories(currentState => {
        const currentMessages = currentState[personaId]?.messages || [];
        if (currentMessages.length > 0) {
          const lastMessageInBatch = currentMessages[currentMessages.length - 1];
          lastMessageTimestampInBatch = lastMessageInBatch.timestamp instanceof Date ? lastMessageInBatch.timestamp : null;
          // Check if the last message is valid and newer than the last summary
          if (lastMessageTimestampInBatch && (!metadataTimestamp || lastMessageTimestampInBatch.getTime() > metadataTimestamp.getTime())) {
            // console.log(`FALLBACK_SUMMARIZER: Conditions met for ${personaId}.`); // REMOVED redundant condition log
            shouldSummarize = true;
            // Map messages to Firestore format for saving
            messagesToSummarize = currentMessages.map(m => ({
              id: m.id.startsWith('local-') ? 'temp' : m.id, // Use 'temp' for local IDs if needed by summary logic
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.content,
              persona: personaId,
              createdAt: m.timestamp instanceof Date ? m.timestamp : null, // Pass Date object
            }));
          } // No else log needed
        } // No else log needed
        return currentState; // No state change needed here
      });

      // 3. Save summary if conditions met
      if (shouldSummarize && messagesToSummarize.length > 0) {
        const aiService = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
        if (!aiService) {
          // Log error but don't crash the main thread
          console.error(`FALLBACK_SUMMARIZER: AI Service for ${personaId} not available during fallback.`);
          return; // Stop if service not ready
        }
        console.log(`FALLBACK_SUMMARIZER: Initiating summary save for ${personaId} (${messagesToSummarize.length} messages)...`); // KEEP Initiation log
        // Call save function but don't await (run in background)
        saveSessionMemorySummary(userId, personaId, messagesToSummarize, aiService)
          .then(() => console.log(`FALLBACK_SUMMARIZER: Save completed for ${personaId}.`)) // KEEP Completion log
          .catch(err => console.error(`FALLBACK_SUMMARIZER: Save failed for ${personaId}:`, err)); // KEEP Error log
      } // No else log needed
    } catch (error) {
      console.error(`FALLBACK_SUMMARIZER: Error during check/initiation for ${personaId}:`, error); // KEEP Error log
    }
    // Dependency array is empty as the function uses passed args and refs/imported functions
  }, []);

  // Function to setup inactivity timer
  const setupInactivityTimer = (userId: string, personaId: string) => {
    // Clear existing timer for this persona
    if (inactivityTimersRef.current[personaId]) {
      clearTimeout(inactivityTimersRef.current[personaId]);
    }
    // Set a new timer
    inactivityTimersRef.current[personaId] = setTimeout(() => {
      console.log(`FALLBACK_TIMER: Inactivity timeout for ${personaId}. Triggering check.`); // KEEP Trigger log
      triggerFallbackSummarization(userId, personaId);
    }, INACTIVITY_TIMEOUT_MS);
    // console.log(`FALLBACK_TIMER: Set new inactivity timer for ${personaId} (${INACTIVITY_TIMEOUT_MS / 1000}s)`); // REMOVED Set timer log
  };

  // Regular Summarization Trigger (Memoized with useCallback)
  const triggerMemorySummarizationIfNeeded = useCallback(async (messagesToCheck: DisplayMessage[]) => {
    if (!currentUser) return; // Need user context

    const userId = currentUser.uid;
    const personaId = currentPersona.id; // Use current persona from state
    const currentMessages = messagesToCheck; // Use the passed list

    // console.log(`REGULAR_SUMMARY_CHECK: Checking for ${personaId}. Message count = ${currentMessages.length}`); // REMOVED Initial Check log

    // Check if count is a non-zero multiple of the threshold
    if (currentMessages.length > 0 && currentMessages.length % SUMMARIZE_THRESHOLD === 0) {
      // console.log(`REGULAR_SUMMARY_CHECK: Threshold MET (${currentMessages.length} messages).`); // REMOVED Threshold Met log
      try {
        // Fetch metadata to check the last summary time
        const sessionMetadata = await getSessionMetadata(userId, personaId);
        const metadataTimestamp = sessionMetadata.lastSummarizedMessageTimestamp?.toDate() ?? null;

        // Get timestamp of the last message in the current batch
        const lastMessageInBatch = currentMessages[currentMessages.length - 1];
        const lastMessageTimestampInBatch = lastMessageInBatch?.timestamp instanceof Date ? lastMessageInBatch.timestamp : null;

        // Condition: Is the last message valid and newer than the last summary?
        if (lastMessageTimestampInBatch && (!metadataTimestamp || lastMessageTimestampInBatch.getTime() > metadataTimestamp.getTime())) {
          // console.log(`REGULAR_SUMMARY_CHECK: Timestamp condition PASSED. Preparing summary.`); // REMOVED Condition Passed log

          const aiService = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
          if (!aiService) {
            console.error(`REGULAR_SUMMARY: AI Service for ${personaId} not available.`); // Log error
            return; // Stop if service unavailable
          }
          // Map messages to Firestore format
          const messagesToSummarize: FirestoreMessage[] = currentMessages.map(m => ({
            id: m.id.startsWith('local-') ? 'temp' : m.id,
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
            persona: personaId,
            createdAt: m.timestamp instanceof Date ? m.timestamp : null,
          }));

          // Clear inactivity timer because a regular summary is happening
          if (inactivityTimersRef.current[personaId]) {
            clearTimeout(inactivityTimersRef.current[personaId]);
            console.log(`FALLBACK_TIMER: Cleared inactivity timer due to regular summary for ${personaId}`); // KEEP Cleared Timer log
          }

          console.log(`REGULAR_SUMMARY: Calling saveSessionMemorySummary for ${messagesToSummarize.length} messages...`); // KEEP Initiation log
          // Use .then/.catch as the save function might take time and we don't need to block UI
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          saveSessionMemorySummary(userId, personaId, messagesToSummarize, aiService)
            .then(() => { console.log(`REGULAR_SUMMARY: saveSessionMemorySummary completed for ${personaId}.`); }) // KEEP Completion log
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            .catch(error => { console.error(`REGULAR_SUMMARY: saveSessionMemorySummary failed for ${personaId}:`, error); }); // KEEP Error log
        } // No else log needed for failed timestamp condition
      } catch (error) {
        console.error("REGULAR_SUMMARY_CHECK: Error during check/initiation:", error); // KEEP Error log
      }
    } // No else log needed for failed threshold condition
    // Dependencies: user and current persona ID
  }, [currentUser, currentPersona.id]);

  // Main message sending handler
  const handleSendMessage = async (messageContent: string) => {
    // Ensure user and services are ready
    if (!currentUser || !chatGPTServiceRef.current || !claudeServiceRef.current) {
      console.error("Cannot send message: User not logged in or AI services not initialized.");
      return;
    }
    const userId = currentUser.uid;
    const personaId = currentPersona.id;

    // Mark session as active (resetting summary timestamp)
    try { await markSessionAsActive(userId, personaId); }
    catch (error) { console.error("HANDLE_SEND: Failed to mark session active:", error); }

    // Create user message for optimistic UI update
    const userDisplayMessage: DisplayMessage = {
      id: `local-user-${Date.now()}`, // Unique local ID
      sender: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    let updatedMessagesList: DisplayMessage[] = []; // To hold the list after adding user message

    // Optimistic UI update: add user message and set loading state
    setChatHistories(prev => {
      const prevPersonaState = prev[personaId] || { messages: [], isAiResponding: false, error: null };
      updatedMessagesList = [...prevPersonaState.messages, userDisplayMessage]; // Capture list here
      return {
        ...prev,
        [personaId]: {
          ...prevPersonaState,
          messages: updatedMessagesList,
          isAiResponding: true, // Start AI responding indicator
          error: null, // Clear previous errors
        }
      };
    });

    // Asynchronously save user message to Firestore
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    saveMessage(userId, personaId, 'user', messageContent)
      .then(docId => { /* console.log(`HANDLE_SEND: User message saved (ID: ${docId})`) */ }) // REMOVED user save log
      .catch(err => console.error("HANDLE_SEND: User message save failed:", err));

    setIsLoadingMessages(true); // Redundant? Already set in setChatHistories
    let finalSystemPrompt = "";

    // Construct and inject dynamic prompt including memory
    try {
      // console.log(`HANDLE_SEND: Constructing dynamic prompt for ${personaId}...`); // REMOVED
      const summaries = await getRecentMemorySummaries(userId, personaId, 3);
      const fusedMemory = summaries.map(s => `• ${s.summary}`).join('\n').trim();

      // Use the captured message list *before* adding AI response for context
      const messagesForContext = updatedMessagesList;
      const lastMessages = messagesForContext
        .slice(-5) // Get last 5 messages
        .map((msg) => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n');

      const baseSystemPrompt = getBaseSystemPrompt(personaId);

      finalSystemPrompt = `
${baseSystemPrompt}

## Long-Term Memory (Recent Session Summaries):
${fusedMemory || 'No long-term memory yet.'}

## Recent Messages (Short-Term Context):
${lastMessages}

## Current Input:
Continue the conversation below using deep emotional awareness, memory context, and therapeutic clarity.
        `.trim();

      // Inject into the correct service
      const service = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
      service?.setSystemPrompt(finalSystemPrompt);

    } catch (memError) {
      console.error("HANDLE_SEND: Error during prompt construction:", memError);
      // Fallback to base prompt if memory fails
      const baseSystemPrompt = getBaseSystemPrompt(personaId);
      const service = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
      service?.setSystemPrompt(baseSystemPrompt);
      console.warn("HANDLE_SEND: Falling back to base system prompt."); // KEEP Fallback warning
    }

    // Get AI response
    try {
      const aiService = personaId === "raze" ? chatGPTServiceRef.current : claudeServiceRef.current;
      if (!aiService) throw new Error(`AI service instance not found for ${personaId}`);

      const aiResponse = await aiService.sendMessage(messageContent);
      // console.log(`HANDLE_SEND: Received AI response from ${personaId}.`); // REMOVED Received log

      const assistantDisplayMessage: DisplayMessage = {
        id: `local-ai-${Date.now()}`, // Unique local ID for AI message
        sender: "ai",
        content: aiResponse,
        timestamp: new Date()
      };

      // Update UI with AI message, ensuring user message isn't duplicated
      setChatHistories(prev => {
        const prevPersonaState = prev[personaId] || { messages: [], isAiResponding: false, error: null };
        // Filter out the local user message we added optimistically
        const messagesWithoutUserDup = prevPersonaState.messages.filter(m => m.id !== userDisplayMessage.id);
        // Add the AI message
        updatedMessagesList = [...messagesWithoutUserDup, assistantDisplayMessage]; // Capture list again after adding AI response
        return {
          ...prev,
          [personaId]: {
            ...prevPersonaState,
            messages: updatedMessagesList,
            isAiResponding: false // Done responding
          }
        };
      });
      setIsLoadingMessages(false); // Reset loading state

      // Asynchronously save AI message to Firestore
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      saveMessage(userId, personaId, 'assistant', aiResponse)
        .then(docId => { /* console.log(`HANDLE_SEND: AI message saved (ID: ${docId})`) */ }) // REMOVED AI save log
        .catch(err => console.error("HANDLE_SEND: AI message save failed:", err));

      // Trigger summarization check with the list INCLUDING the AI response
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      triggerMemorySummarizationIfNeeded(updatedMessagesList);

      // Setup inactivity timer after successful interaction
      if (currentUser) {
        setupInactivityTimer(currentUser.uid, personaId);
      }

    } catch (error) {
      console.error(`HANDLE_SEND: Error during AI call or response processing for ${personaId}:`, error);
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
    // Clear inactivity timer for the old persona
    if (currentUser && inactivityTimersRef.current[currentPersona.id]) {
      clearTimeout(inactivityTimersRef.current[currentPersona.id]);
      // console.log(`PERSONA_SELECT: Cleared inactivity timer for old persona ${currentPersona.id}`); // REMOVED
    }
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

  // Effect to clear all inactivity timers on component unmount
  useEffect(() => {
    const timers = inactivityTimersRef.current;
    return () => {
      // Remove general cleanup log
      // console.log("CHAT_CLEANUP: Clearing all inactivity timers on unmount."); 
      Object.values(timers).forEach(timerId => clearTimeout(timerId));
    };
  }, []);

  // Effect for beforeunload handler (attempt fallback summary)
  useEffect(() => {
    const handleBeforeUnload = (/* event: BeforeUnloadEvent */) => {
      if (!currentUser) return;
      const userId = currentUser.uid;
      const personaId = currentPersona.id;
      console.log(`BEFORE_UNLOAD: Triggered for ${personaId}. Attempting fallback summarization.`); // KEEP Unload trigger log
      triggerFallbackSummarization(userId, personaId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Remove listener attach/remove logs
    // console.log("BEFORE_UNLOAD: Attached listener."); 
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // console.log("BEFORE_UNLOAD: Removed listener."); 
    };
  }, [currentUser, currentPersona.id, triggerFallbackSummarization]);

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