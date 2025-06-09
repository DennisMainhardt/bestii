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
import { Timestamp } from "firebase/firestore";
import { SummaryMetadata } from "@/types/memory";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

  const [showOutOfCreditsNotice, setShowOutOfCreditsNotice] = useState(false);
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

  const [paginatedMessages, setPaginatedMessages] = useState<DisplayMessage[]>([]);
  const [paginationCursor, setPaginationCursor] = useState<import('firebase/firestore').QueryDocumentSnapshot | null>(null); // Firestore QueryDocumentSnapshot
  const [isPaginating, setIsPaginating] = useState(false);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);

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
          sender: msg.role === 'user' ? 'user' : 'ai',
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
              sender: msg.role === 'user' ? 'user' : 'ai',
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
    if (!currentUser || !currentPersona) {
      return;
    }
    const userId = currentUser.uid;
    const personaId = currentPersona.id;

    try {
      // Fetch the timestamp of the last successful summary for this persona
      const lastSummaryTimestamp = await getLastSummaryTimestamp(userId, personaId);

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

      // Check if the count meets the threshold
      if (count >= SUMMARIZE_THRESHOLD) {

        // Map the relevant messages, explicitly typing the result for role
        const messagesToSummarize = relevantMessagesSinceLastSummary.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        } as { role: 'user' | 'assistant'; content: string }));

        // Select the appropriate AI service based on persona
        const summarizationService = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
        if (!summarizationService) {
          console.error("SUMMARIZE_CHECK: ERROR - Summarization service instance not found for", personaId); // Keep error logs
          throw new Error(`Summarization service not available for ${personaId}`);
        }
        // Generate the summary
        // Destructure summary, tokenCount, AND metadata
        // Ensure the type matches the expected return { summary: string; metadata: SummaryMetadata | null; tokenCount?: number }
        const { summary, tokenCount, metadata } = await summarizationService.generateSummary(messagesToSummarize);

        // Check if the summary is valid before saving
        if (summary && summary.trim().length > 0) {
          const sourceMessageIds = relevantMessagesSinceLastSummary.map(msg => msg.id);

          // Ensure metadata is not null before saving
          const finalMetadata: SummaryMetadata = metadata || {};

          // Save the summary AND metadata to Firestore
          const summaryId = await saveSummary(userId, personaId, summary, sourceMessageIds, tokenCount, finalMetadata);

          // Update the timestamp marker in the user document
          await updateLastSummaryTimestamp(userId, personaId);
        }
      }
    } catch (error) {
      // Log any errors encountered during the process
      console.error("SUMMARIZE_CHECK: ERROR during summarization check/process:", error); // Keep error logs
    }
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

    // Reset error states before sending
    setShowOutOfCreditsNotice(false);
    setChatHistories(prev => ({
      ...prev,
      [personaId]: {
        ...(prev[personaId] || { messages: [], isAiResponding: false, error: null }),
        isAiResponding: true,
        error: null, // Clear previous errors
      }
    }));
    setIsLoadingMessages(true);

    try {
      // Mark session as active
      await markSessionAsActive(userId, personaId);

      // Save user message to Firestore. The listener will pick this up.
      await saveMessage(currentUser, personaId, 'user', messageContent);

      // Construct and inject dynamic prompt including memory
      let finalSystemPrompt = "";

      const currentMessagesForContext = chatHistories[personaId]?.messages || [];
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
      const eventsSet = new Set<string>();

      summariesForMetadata.forEach(s => {
        if (s.metadata) {
          s.metadata.key_people?.forEach(p => currentPeopleSet.add(p));
          s.metadata.key_events?.forEach(e => eventsSet.add(e));
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

      // Construct the final prompt
      finalSystemPrompt = `
## Context from Recent Summaries & Messages:
${fusedMemory || 'No previous summaries available.'}
${fusedMetadata.trim()} // Contains People, Triggers, and explicit Theme Recall instructions

## IMPORTANT:Behave and Repsond always following the instructions below:
${baseSystemPrompt}

## Current Input:
User: ${messageContent}
      `.trim();

      // Rough token estimation: 1 token ~= 4 characters
      const estimatedTokens = Math.ceil(finalSystemPrompt.length / 4);

      // Inject into the correct service
      const service = personaId === 'raze' ? chatGPTServiceRef.current : claudeServiceRef.current;
      service?.setSystemPrompt(finalSystemPrompt);

      const aiResponse = await service.sendMessage(messageContent);
      await saveMessage(currentUser, personaId, 'assistant', aiResponse);

      // After sending, reload the latest page
      const page = await fetchMessagesPage(currentUser.uid, currentPersona.id, PAGE_SIZE);
      const displayMessages: DisplayMessage[] = page.map(msg => ({
        id: msg.id,
        sender: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: msg.createdAt || new Date(),
      }));
      setPaginatedMessages(displayMessages.reverse());
      setPaginationCursor(page.length > 0 ? page[page.length - 1].docSnapshot : null);
      setAllMessagesLoaded(page.length < PAGE_SIZE);
      setIsLoadingMessages(false);
      setChatHistories(prev => {
        const prevPersonaState = prev[personaId] || { messages: [], isAiResponding: true, error: null };
        return { ...prev, [personaId]: { ...prevPersonaState, isAiResponding: false } };
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message. Please try again.";
      console.error(`HANDLE_SEND: Error during message processing for ${personaId}:`, error);

      // If out of credits, show the dedicated notice instead of the generic error.
      if (errorMessage.toLowerCase().includes('insufficient credits')) {
        setShowOutOfCreditsNotice(true);
        // We set a non-visible error state just to stop the AI responding indicator
        setChatHistories(prev => {
          const prevPersonaState = prev[personaId] || { messages: [], isAiResponding: false, error: null };
          return {
            ...prev,
            [personaId]: {
              ...prevPersonaState,
              isAiResponding: false,
              error: 'NoCredits' // Special identifier, not shown to user
            }
          };
        });
      } else {
        // Handle other errors normally
        setChatHistories(prev => {
          const prevPersonaState = prev[personaId] || { messages: [], isAiResponding: false, error: null };
          return {
            ...prev,
            [personaId]: {
              ...prevPersonaState,
              isAiResponding: false,
              error: errorMessage,
            }
          };
        });
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Persona selection handler
  const handlePersonaSelect = (persona: Persona) => {
    // Prevent re-loading if the current persona is clicked again
    if (persona.id === currentPersona.id) {
      return;
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
    <div className="w-full h-screen bg-[#FFF8E1] p-0 md:p-4 lg:p-6 flex items-center justify-center">
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white/80 md:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm border border-orange-200/30">
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
                <div className="text-center text-muted-foreground py-8">
                  <p>{introPrompt}</p>
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