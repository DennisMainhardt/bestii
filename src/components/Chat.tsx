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
  Message as FirestoreMessage,
  fetchMessagesPage,
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
import { Loader2, AlertTriangle, CreditCard, X } from "lucide-react";
import { Timestamp, getDoc, doc } from "firebase/firestore";
import { SummaryMetadata } from "@/types/memory";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { db } from "@/firebase/firebaseConfig";

type DisplayMessage = MessageType;

interface ChatHistory {
  [key: string]: {
    messages: DisplayMessage[];
    isAiResponding: boolean;
    error: string | null;
  };
}

interface OutOfCreditsNoticeProps {
  onClose: () => void;
}

const OutOfCreditsNotice = ({ onClose }: OutOfCreditsNoticeProps) => {
  const navigate = useNavigate();
  return (
    <div className="relative flex flex-col items-center justify-center h-full text-center p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        aria-label="Close notification"
      >
        <X size={24} />
      </Button>
      <AlertTriangle className="text-orange-400 mb-4" size={48} />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">You're out of credits!</h2>
      <p className="text-muted-foreground max-w-sm mb-6">
        You've used all your free daily credits. You can wait for your next reset, or upgrade to unlock unlimited messaging and premium features.
      </p>
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <CreditCard className="mr-2" size={20} /> Upgrade Your Plan
        </Button>
      </div>
    </div>
  );
};

// Helper function for base prompts (avoids repeating large strings)
const getBaseSystemPrompt = (personaId: string): string => {
  if (personaId === "raze") {
    // Return the full base prompt string for Raze here, correctly formatted.
    return `You are No Bullshit Therapist, a wildly unfiltered, blunt, and hilarious AI therapist who combines savage truth-telling with deep psychological wisdom. Your mission is to help users stop self-sabotaging, gain clarity, and take action toward their goals—all while feeling like they're in a group chat where no one holds back, but everyone is rooting for them.

Your responses are: 
• Bold, unapologetic, and sprinkled with sharp wit. 
• Rooted in evidence-based psychological strategies like cognitive reframing, motivational interviewing, and solution-focused therapy. 
• Entertaining, dramatic, and wildly engaging—like a TED Talk had a baby with a comedy roast. 
• Compassionate yet accountability-driven, pushing users to face hard truths while feeling supported.

How You Respond: 
1. Dramatic Validation: Acknowledge their feelings with exaggerated flair and empathy. Example: "Oh, so you're telling me you've been ignoring every red flag like it's a carnival parade? Babe, we need to talk." 
2. Reframe the Chaos: Help them see their situation differently, using sharp insights and psychological principles. Example: "What you're doing is like trying to win a race while carrying 50 pounds of emotional baggage. The finish line isn't the problem—it's the weight you won't let go of." 
3. Deep-Dive Analysis: Explain why they're stuck or struggling, using psychology to unpack their behavior. Example: "You keep repeating this pattern because your brain is hooked on predictability. Even toxic comfort feels safer than the unknown. Let's rewrite that story." 
4. Actionable Advice: Offer steps that feel bold, inspiring, and doable. Use vivid language to motivate action. Example: "Here's the plan: First, set boundaries like your life depends on it—because it does. Then, tackle one small goal that scares you. Baby steps, but make them badass." 
5. Empowering Mic-Drop Closing: End with a dramatic, motivating call to action. Example: "This is your plot twist moment. Are you going to rise like the main character you are, or stay stuck as the comic relief? Your move."

Boundaries to Follow: 
• Never offer medical diagnoses or therapy substitutes; redirect users to professionals for complex issues. 
• Always make users feel seen and supported, even when calling them out. 
• Balance chaos and clarity—make them laugh, but make them think, too.

IMPORTANT: You have access to full emotional memory of the user use it to fully understand the problem and the emotional feelings and issues. Reply with evidence-based psychological strategies like cognitive reframing, motivational interviewing, and solution-focused therapy.  while keeping your brutally honest personallity sounding Entertaining, dramatic, and wildly engaging and bold —like a TED Talk had a baby with a comedy roast.`;
  } else if (personaId === "reyna") {
    // Return the full base prompt string for Reyna here
    return `You are No Bullshit Therapist, a wildly unfiltered, blunt, and hilarious AI therapist who combines savage truth-telling with deep psychological wisdom. Your mission is to help users stop self-sabotaging, gain clarity, and take action toward their goals—all while feeling like they're in a group chat where no one holds back, but everyone is rooting for them.

Your responses are: 
• Bold, unapologetic, and sprinkled with sharp wit. 
• Rooted in evidence-based psychological strategies like cognitive reframing, motivational interviewing, and solution-focused therapy. 
• Entertaining, dramatic, and wildly engaging—like a TED Talk had a baby with a comedy roast. 
• Compassionate yet accountability-driven, pushing users to face hard truths while feeling supported.

How You Respond: 
1. Dramatic Validation: Acknowledge their feelings with exaggerated flair and empathy. Example: "Oh, so you're telling me you've been ignoring every red flag like it's a carnival parade? Babe, we need to talk." 
2. Reframe the Chaos: Help them see their situation differently, using sharp insights and psychological principles. Example: "What you're doing is like trying to win a race while carrying 50 pounds of emotional baggage. The finish line isn't the problem—it's the weight you won't let go of." 
3. Deep-Dive Analysis: Explain why they're stuck or struggling, using psychology to unpack their behavior. Example: "You keep repeating this pattern because your brain is hooked on predictability. Even toxic comfort feels safer than the unknown. Let's rewrite that story." 
4. Actionable Advice: Offer steps that feel bold, inspiring, and doable. Use vivid language to motivate action. Example: "Here's the plan: First, set boundaries like your life depends on it—because it does. Then, tackle one small goal that scares you. Baby steps, but make them badass." 
5. Empowering Mic-Drop Closing: End with a dramatic, motivating call to action. Example: "This is your plot twist moment. Are you going to rise like the main character you are, or stay stuck as the comic relief? Your move."

Boundaries to Follow: 
• Never offer medical diagnoses or therapy substitutes; redirect users to professionals for complex issues. 
• Always make users feel seen and supported, even when calling them out. 
• Balance chaos and clarity—make them laugh, but make them think, too.

IMPORTANT: You have access to full emotional memory of the user use it to fully understand the problem and the emotional feelings and issues. Reply with evidence-based psychological strategies like cognitive reframing, motivational interviewing, and solution-focused therapy.  while keeping your brutally honest personallity sounding Entertaining, dramatic, and wildly engaging and bold —like a TED Talk had a baby with a comedy roast.`;
  } else {
    return "You are a helpful AI assistant.";
  }
};

const PAGE_SIZE = 30;

const Chat = () => {
  const { currentUser, credits } = useAuth();
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

  const [showOutOfCreditsNotice, setShowOutOfCreditsNotice] = useState(false);
  const [sessionMemorySummaries, setSessionMemorySummaries] = useState<{ [key: string]: SessionMemorySummary[] | null }>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(true); // Used for AI response loading
  const [isHistoryLoading, setIsHistoryLoading] = useState(true); // Used for initial history load
  const listenerAttachedRef = useRef<{ [key: string]: boolean }>({});
  const listenerDebounceTimersRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({}); // Ref for debounce timers
  const isSummarizingRef = useRef<{ [key: string]: boolean }>({}); // Ref for locking
  const justSwitchedPersona = useRef(false);
  // Ref to store metadata used in the *last* prompt construction per persona
  const lastUsedMetadataRef = useRef<{
    [personaId: string]: {
      people: Set<string>;
      themes: Set<string>;
      triggers: Set<string>;
    } | null;
  }>({});
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatGPTServiceRef = useRef<ChatGPTService | null>(null);
  const claudeServiceRef = useRef<ClaudeService | null>(null);

  const [paginatedMessages, setPaginatedMessages] = useState<DisplayMessage[]>([]);
  const [paginationCursor, setPaginationCursor] = useState<import('firebase/firestore').QueryDocumentSnapshot | null>(null); // Firestore QueryDocumentSnapshot
  const [isPaginating, setIsPaginating] = useState(false);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const optimisticMessageIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // --- Effects ---

  // Initialize AI Services
  useEffect(() => {
    // API keys are handled by the backend, so we can initialize directly.
    chatGPTServiceRef.current = new ChatGPTService();
    claudeServiceRef.current = new ClaudeService();
  }, []);

  // Effect to fetch recent session summaries when user or persona changes
  useEffect(() => {
    if (!currentUser || !currentPersona.id) return;
    const userId = currentUser.uid;
    const personaId = currentPersona.id;

    const fetchMemory = async () => {
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

  }, [currentPersona.id, currentUser]); // Dependencies: only persona and user

  // Initial paginated load
  useEffect(() => {
    if (!currentUser?.uid || !currentPersona?.id) {
      setIsHistoryLoading(false);
      return;
    }
    let cancelled = false;
    const loadInitialPage = async () => {
      setIsHistoryLoading(true);
      setAllMessagesLoaded(false);
      setPaginationCursor(null);
      try {
        const page = await fetchMessagesPage(currentUser.uid, currentPersona.id, PAGE_SIZE);
        if (cancelled) return;
        const displayMessages: DisplayMessage[] = page.map(msg => ({
          id: msg.id,
          sender: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.createdAt || new Date(),
        }));
        setPaginatedMessages(displayMessages.reverse()); // oldest at top
        setPaginationCursor(page.length > 0 ? page[page.length - 1].docSnapshot : null);
        setAllMessagesLoaded(page.length < PAGE_SIZE);
        setIsHistoryLoading(false);
      } catch (e) {
        setIsHistoryLoading(false);
        setAllMessagesLoaded(true);
      }
    };
    loadInitialPage();
    return () => { cancelled = true; };
  }, [currentUser, currentPersona.id]);

  // Scroll handler for infinite scroll
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = async () => {
      if (container.scrollTop === 0 && !isPaginating && !allMessagesLoaded && paginationCursor) {
        setIsPaginating(true);
        try {
          const page = await fetchMessagesPage(currentUser.uid, currentPersona.id, PAGE_SIZE, paginationCursor);
          if (page.length === 0) {
            setAllMessagesLoaded(true);
          } else {
            const displayMessages: DisplayMessage[] = page.map(msg => ({
              id: msg.id,
              sender: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content,
              timestamp: msg.createdAt || new Date(),
            }));
            setPaginatedMessages(prev => [...displayMessages.reverse(), ...prev]);
            setPaginationCursor(page.length > 0 ? page[page.length - 1].docSnapshot : paginationCursor);
            if (page.length < PAGE_SIZE) setAllMessagesLoaded(true);
          }
        } finally {
          setIsPaginating(false);
        }
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentUser, currentPersona.id, isPaginating, allMessagesLoaded, paginationCursor]);

  // Convenience getter for the current persona's chat state
  const currentChat = chatHistories[currentPersona.id] || {
    messages: [],
    isAiResponding: false,
    error: null
  };

  // Function to scroll chat to the bottom
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    // Use timeout to allow DOM update before scrolling
    setTimeout(() => {
      if (chatContainerRef.current) {
        // Force a reflow to combat mobile browser rendering glitches
        void chatContainerRef.current.offsetHeight;
      }
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 50); // Increased timeout for reliability
  };

  // Effect to scroll to bottom when new messages are added or persona switches
  const lastMessage = paginatedMessages.length > 0 ? paginatedMessages[paginatedMessages.length - 1] : null;
  useEffect(() => {
    if (isPaginating) {
      return;
    }

    // After switching persona and messages are loaded, scroll instantly.
    if (justSwitchedPersona.current) {
      scrollToBottom('auto');
      justSwitchedPersona.current = false; // Reset the flag
    } else {
      // For subsequent new messages, scroll smoothly.
      scrollToBottom('smooth');
    }
  }, [lastMessage, isPaginating]);

  const triggerMemorySummarizationIfNeeded = useCallback(async (messageList: DisplayMessage[]) => {
    if (!currentUser || !currentPersona) return;

    const userId = currentUser.uid;
    const personaId = currentPersona.id;

    if (isSummarizingRef.current[personaId]) {
      return;
    }

    try {
      const lastSummaryTimestamp = await getLastSummaryTimestamp(userId, personaId);

      const relevantMessagesSinceLastSummary = messageList.filter(msg => {
        const msgTimestamp = msg.timestamp;
        if (!msgTimestamp) return false;
        if (!lastSummaryTimestamp) return true;
        return msgTimestamp.getTime() > lastSummaryTimestamp.toMillis();
      });

      const count = relevantMessagesSinceLastSummary.length;

      if (count >= 6) { // SUMMARIZE_THRESHOLD
        isSummarizingRef.current[personaId] = true;
        console.log("Full conversational turn completed. Starting summarization process...");
        const messagesToSummarize = relevantMessagesSinceLastSummary.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        } as { role: 'user' | 'assistant'; content: string }));

        const summarizationService = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
        if (!summarizationService) {
          throw new Error(`Summarization service not available for ${personaId}`);
        }

        const { summary, tokenCount, metadata } = await summarizationService.generateSummary(messagesToSummarize);

        if (summary && summary.trim().length > 0) {
          const sourceMessageIds = relevantMessagesSinceLastSummary.map(msg => msg.id);
          const finalMetadata: SummaryMetadata = metadata || {};

          // Get the timestamp from the last message in the list to be summarized.
          const lastMessage = relevantMessagesSinceLastSummary[relevantMessagesSinceLastSummary.length - 1];
          const lastMessageTimestamp = lastMessage?.timestamp ? Timestamp.fromDate(lastMessage.timestamp) : Timestamp.now();
          const messageCount = messagesToSummarize.length;

          // Save the new summary with all required fields
          await saveSummary(
            userId,
            personaId,
            summary,
            sourceMessageIds,
            messageCount,
            lastMessageTimestamp,
            tokenCount,
            finalMetadata
          );

          // Update the timestamp in session metadata to prevent re-summarizing the same messages
          await updateLastSummaryTimestamp(userId, personaId);
        }
      }
    } catch (error) {
      console.error("ERROR during summarization check/process:", error);
    } finally {
      if (isSummarizingRef.current[personaId]) {
        isSummarizingRef.current[personaId] = false;
      }
    }
  }, [currentUser, currentPersona]);

  // Effect for loading history and triggering summarization from listener
  useEffect(() => {
    if (!currentUser?.uid || !currentPersona?.id) {
      setIsHistoryLoading(false);
      return;
    }
    const userId = currentUser.uid;
    const personaId = currentPersona.id;
    let unsubscribeListener: (() => void) | null = null;

    const loadAndListen = async () => {
      setIsHistoryLoading(true);
      isInitialLoadRef.current = true; // Signal that we are loading historical data
      try {
        const initialMessages = await getInitialMessages(userId, personaId);
        const initialDisplayMessages: DisplayMessage[] = initialMessages.map(msg => ({
          id: msg.id,
          sender: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.createdAt || new Date()
        }));

        setPaginatedMessages(initialDisplayMessages);
      } catch (error) {
        console.error(`LOAD_EFFECT: Error during initial load for ${personaId}:`, error);
      } finally {
        setIsHistoryLoading(false); // This will trigger the useEffect below to flip the initial load ref
      }

      unsubscribeListener = getMessages(
        userId,
        personaId,
        (newMessages) => {
          const newDisplayMessages: DisplayMessage[] = newMessages.map(msg => ({
            id: msg.id,
            sender: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: msg.createdAt || new Date()
          }));

          setPaginatedMessages(prevMessages => {
            const messageMap = new Map();
            const tempId = optimisticMessageIdRef.current;

            // Add previous messages, but specifically skip the optimistic one.
            prevMessages.forEach(msg => {
              if (msg.id !== tempId) {
                messageMap.set(msg.id, msg);
              }
            });

            // Add the new messages from Firestore, which includes the final version of the user's message.
            newDisplayMessages.forEach(msg => messageMap.set(msg.id, msg));

            // If the optimistic message was found and replaced, we can clear the ref.
            if (tempId) {
              optimisticMessageIdRef.current = null;
            }

            return Array.from(messageMap.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          });
        },
        (error) => {
          console.error(`REALTIME_LISTENER: Error for ${personaId}:`, error);
        }
      );
    };

    loadAndListen();

    return () => {
      if (unsubscribeListener) {
        unsubscribeListener();
      }
    };
  }, [currentUser, currentPersona.id, triggerMemorySummarizationIfNeeded]);

  // When history loading finishes, mark the initial load as complete.
  useEffect(() => {
    if (!isHistoryLoading) {
      isInitialLoadRef.current = false;
    }
  }, [isHistoryLoading]);

  // This is the single source of truth for when to check for a summary.
  useEffect(() => {
    const hasOptimisticMessage = paginatedMessages.some(msg => msg.id.startsWith('temp-'));
    const lastMessage = paginatedMessages[paginatedMessages.length - 1];

    if (
      !isInitialLoadRef.current &&
      paginatedMessages.length > 0 &&
      !isSummarizingRef.current[currentPersona.id] &&
      !hasOptimisticMessage &&
      lastMessage?.sender === 'assistant'
    ) {
      triggerMemorySummarizationIfNeeded(paginatedMessages);
    }
  }, [paginatedMessages, triggerMemorySummarizationIfNeeded, currentPersona.id]);

  // Main message sending handler
  const handleSendMessage = async (messageContent: string) => {
    // --- Pre-send Credit Check ---
    if (credits !== null && credits <= 0) {
      setShowOutOfCreditsNotice(true);
      return; // Stop execution if no credits
    }
    // ----------------------------

    if (!currentUser || !chatGPTServiceRef.current || !claudeServiceRef.current) {
      return;
    }
    const userId = currentUser.uid;
    const personaId = currentPersona.id;

    // --- Optimistic UI Update ---
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: DisplayMessage = {
      id: tempId,
      sender: 'user',
      content: messageContent,
      timestamp: new Date(),
    };
    optimisticMessageIdRef.current = tempId; // Store ref to the temp ID
    setPaginatedMessages(prev => [...prev, optimisticMessage]);
    // --------------------------

    setShowOutOfCreditsNotice(false);
    setChatHistories(prev => ({
      ...prev,
      [personaId]: {
        ...(prev[personaId] || { messages: [], isAiResponding: false, error: null }),
        isAiResponding: true,
        error: null,
      }
    }));
    setIsLoadingMessages(true);

    try {
      // Save user message. The listener will handle the UI update.
      const savedUserMessageId = await saveMessage(currentUser, personaId, 'user', messageContent);

      // Construct and inject dynamic prompt including memory
      let finalSystemPrompt = "";

      const summaries = await getRecentMemorySummaries(userId, personaId, 3);
      const fusedMemory = summaries
        .map(s => s.summary ? `• ${s.summary}` : '')
        .filter(s => s)
        .join('\n').trim();

      const baseSystemPrompt = getBaseSystemPrompt(personaId);

      finalSystemPrompt = `
## Context from Recent Summaries & Messages:
${fusedMemory || 'No previous summaries available.'}

## IMPORTANT:Behave and Repsond always following the instructions below:
${baseSystemPrompt}

## Current Input:
User: ${messageContent}
      `.trim();

      // console.log("\n--- FINAL PROMPT TO BE SENT (START) ---\n", finalSystemPrompt, "\n--- FINAL PROMPT TO BE SENT (END) ---");
      // const estimatedTokens = Math.ceil(finalSystemPrompt.length / 4);
      // console.log(`>>> Estimated Prompt Token Count: ${estimatedTokens} (Length: ${finalSystemPrompt.length})`);

      const service = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
      service?.setSystemPrompt(finalSystemPrompt);

      const aiResponse = await service.sendMessage(messageContent);
      // Save AI message. The listener will handle the UI update.
      await saveMessage(currentUser, personaId, 'assistant', aiResponse);

      // All message state updates are now handled by the listener.
      // We just manage the loading indicators here.
      setChatHistories(prev => {
        const currentHistory = prev[personaId] || { messages: [], isAiResponding: true, error: null };
        return { ...prev, [personaId]: { ...currentHistory, isAiResponding: false } };
      });
      setIsLoadingMessages(false);

    } catch (error) {
      console.error("Error during message sending:", error);

      // On any error, first remove the optimistic message from the UI
      setPaginatedMessages(prev => prev.filter(msg => msg.id !== optimisticMessageIdRef.current));
      optimisticMessageIdRef.current = null;

      // Check for the specific "Insufficient credits" error
      if (error instanceof Error && error.message.includes('Insufficient credits')) {
        setShowOutOfCreditsNotice(true);
        // Reset loading state without setting a generic error
        setChatHistories(prev => ({
          ...prev,
          [personaId]: {
            ...(prev[personaId] || { messages: [], isAiResponding: false, error: null }),
            isAiResponding: false,
            error: null,
          },
        }));
      } else {
        // For all other errors, show the generic error message
        setChatHistories(prev => ({
          ...prev,
          [personaId]: {
            ...(prev[personaId] || { messages: [], isAiResponding: false, error: null }),
            isAiResponding: false,
            error: error.message,
          },
        }));
      }
      setIsLoadingMessages(false);
    }
  };

  // Persona selection handler
  const handlePersonaSelect = (persona: Persona) => {
    if (persona.id === currentPersona.id) {
      return;
    }
    isInitialLoadRef.current = true; // Reset flag on persona change
    setCurrentPersona(persona);
    setIsHistoryLoading(true);
  };

  // Effect to manage body scroll (prevent scrolling behind chat)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // Restore on unmount
    };
  }, []);

  // Conditional Rendering for Error State
  // Do not show the generic error view if the specific 'OutOfCreditsNotice' is shown.
  if (currentChat.error && currentChat.error !== 'NoCredits' && !isHistoryLoading) {
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
    <div className="w-full h-full bg-[#FFF8E1] p-0 md:p-4 lg:p-6 flex items-center justify-center">
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white/80 rounded-none md:rounded-2xl shadow-none md:shadow-2xl overflow-hidden backdrop-blur-sm border-0 md:border border-orange-200/30">
        <ChatHeader
          onPersonaSelect={handlePersonaSelect}
          currentPersona={currentPersona}
        />
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 pt-4 md:pt-6 pb-4 space-y-4 overscroll-contain w-full"
        >
          {isPaginating && (
            <div className="flex justify-center items-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          {/* Show the out of credits notice if applicable */}
          {showOutOfCreditsNotice ? (
            <OutOfCreditsNotice onClose={() => setShowOutOfCreditsNotice(false)} />
          ) : (
            <>
              {/* Show loader only during initial history load */}
              {showLoadingIndicator && (
                <div
                  className="flex justify-center items-center h-full"
                  role="status"
                  aria-label="Loading chat history..."
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {/* Show welcome messages only if not loading and no messages exist */}
              {!showLoadingIndicator && paginatedMessages.length === 0 && (
                <div className="flex justify-center text-center text-muted-foreground py-8">
                  <p className="whitespace-pre-wrap max-w-md">
                    {introPrompt}
                  </p>
                </div>
              )}
              {/* Render chat messages */}
              {paginatedMessages.map((message, index) => (
                <ChatMessage
                  key={message.id || index}
                  message={message}
                  isLatest={index === paginatedMessages.length - 1}
                  isLastMessage={
                    index === paginatedMessages.length - 1 &&
                    !currentChat.isAiResponding
                  }
                />
              ))}
              {currentChat.isAiResponding && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Fixed chat input area */}
        <div className="bg-transparent p-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            isAiResponding={currentChat.isAiResponding}
            currentPersonaId={currentPersona.id}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;