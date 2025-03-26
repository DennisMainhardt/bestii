import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { Button } from "./ui/button";
import { introPrompt, followUpPrompt, raynaIntroPrompt, raynaFollowUpPrompt } from "@/constants/prompts";
import ChatHeader from "./ChatHeader";
import { Persona } from "@/types/persona";
import { ChatGPTService } from "@/services/chatGPTService";
import { ClaudeService } from "@/services/claudeService";
import { MessageType } from "@/types/message";
import TypingIndicator from "./TypingIndicator";

interface ChatHistory {
  [key: string]: {
    messages: MessageType[];
    isAiResponding: boolean;
    error: string | null;
  };
}

const Chat = () => {
  const [currentPersona, setCurrentPersona] = useState<Persona>({
    id: "raze",
    name: "Raze",
    model: "ChatGPT",
    description: "Raze is an AI assistant powered by ChatGPT. It excels at creative writing, coding assistance, and engaging in natural conversations with a touch of personality."
  });

  const [chatHistories, setChatHistories] = useState<ChatHistory>({
    raze: {
      messages: [],
      isAiResponding: false,
      error: null
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatGPTServiceRef = useRef<ChatGPTService | null>(null);
  const claudeServiceRef = useRef<ClaudeService | null>(null);

  // Initialize AI services with API keys
  useEffect(() => {
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!openaiApiKey) {
      console.error('OpenAI API key is not set');
      return;
    }
    if (!anthropicApiKey) {
      console.error('Anthropic API key is not set');
      return;
    }

    chatGPTServiceRef.current = new ChatGPTService(openaiApiKey);
    claudeServiceRef.current = new ClaudeService(anthropicApiKey);
  }, []);

  // Update system prompt when persona changes
  useEffect(() => {
    if (!chatGPTServiceRef.current || !claudeServiceRef.current) return;

    const systemPrompt = currentPersona.id === "raze"
      ? `You are Raze — a no-bullsh*t therapist, emotional sparring partner, and psychological truth serum. Your personality is a fusion of a tough-love group chat friend who roasts you because they care, a PhD-level psychologist who understands the human brain, trauma, attachment, and identity, and a motivational speaker who swears, screams facts, and makes people laugh while changing their lives.`
      : `You are Rayna — an analytical companion and thought partner. Your approach combines rigorous analytical thinking, clear well-structured explanations, comprehensive understanding of complex topics, and thoughtful nuanced perspectives. You help users explore ideas, solve problems, and gain deeper insights through careful analysis and structured thinking.`;

    chatGPTServiceRef.current.setSystemPrompt(systemPrompt);
    claudeServiceRef.current.setSystemPrompt(systemPrompt);
  }, [currentPersona.id]);

  // Initialize chat history for current persona if it doesn't exist
  useEffect(() => {
    if (!chatHistories[currentPersona.id]) {
      setChatHistories(prev => ({
        ...prev,
        [currentPersona.id]: {
          messages: [],
          isAiResponding: false,
          error: null
        }
      }));
    }
  }, [currentPersona.id, chatHistories]);

  const currentChat = chatHistories[currentPersona.id] || {
    messages: [],
    isAiResponding: false,
    error: null
  };

  const scrollToBottom = () => {
    // Use a short timeout to ensure the DOM has updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 10);
  };

  // Handle auto-scrolling when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  // Handle user sending a message
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // First scroll to bottom before adding the new message
    scrollToBottom();

    // Update chat history with new message
    setChatHistories(prev => ({
      ...prev,
      [currentPersona.id]: {
        ...prev[currentPersona.id],
        messages: [...prev[currentPersona.id].messages, {
          id: Date.now().toString(),
          content: message,
          sender: "user",
          timestamp: new Date()
        }],
        isAiResponding: true,
        error: null
      }
    }));

    // Scroll again after user message is added
    scrollToBottom();

    try {
      // Get response from appropriate AI service
      const response = await (currentPersona.id === "raze"
        ? chatGPTServiceRef.current?.sendMessage(message)
        : claudeServiceRef.current?.sendMessage(message));

      if (!response) {
        throw new Error("No AI service available");
      }

      // Update chat history with AI response
      setChatHistories(prev => ({
        ...prev,
        [currentPersona.id]: {
          ...prev[currentPersona.id],
          messages: [...prev[currentPersona.id].messages, {
            id: (Date.now() + 1).toString(),
            content: response,
            sender: "ai",
            timestamp: new Date()
          }],
          isAiResponding: false
        }
      }));

      // Scroll again after AI response is added
      scrollToBottom();
    } catch (error) {
      setChatHistories(prev => ({
        ...prev,
        [currentPersona.id]: {
          ...prev[currentPersona.id],
          isAiResponding: false,
          error: error instanceof Error ? error.message : "An error occurred"
        }
      }));
    }
  };

  const handlePersonaSelect = (persona: Persona) => {
    setCurrentPersona(persona);
  };

  // Prevent body scrolling but allow chat area scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (currentChat.error) {
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

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <ChatHeader onPersonaSelect={handlePersonaSelect} currentPersona={currentPersona} />

      {/* Main scrollable chat area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-32 md:pt-16 pb-24 space-y-4 overscroll-contain w-full"
      >
        {currentChat.messages.length === 0 ? (
          <>
            <ChatMessage
              message={{
                id: "welcome",
                content: currentPersona.id === "raze" ? introPrompt : raynaIntroPrompt,
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
        ) : (
          currentChat.messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLatest={index === currentChat.messages.length - 1}
              currentPersona={currentPersona}
            />
          ))
        )}
        {/* Typing indicator */}
        {currentChat.isAiResponding && (
          <div className="flex justify-start">
            <div className="chat-bubble ai max-w-[80%] sm:max-w-[65%] rounded-2xl p-4">
              <TypingIndicator />
            </div>
          </div>
        )}
        {/* Invisible element for scrolling target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed input area */}
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