import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { useChat } from "@/hooks/useChat";
import { Button } from "./ui/button";
import { introPrompt, followUpPrompt } from "@/constants/prompts";

const Chat = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('API Key loaded:', apiKey ? 'Yes' : 'No');

  const { messages, isAiResponding, error, sendMessage } = useChat(apiKey);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Prevent body scrolling when chat is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="text-red-500 text-center">
          <p>Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-24 sm:pt-20 pb-6 space-y-4 overscroll-contain"
      >
        {messages.length === 0 ? (
          <>
            <ChatMessage
              message={{
                id: "welcome",
                content: introPrompt,
                sender: "ai",
                timestamp: new Date()
              }}
              isLatest={false}
            />
            <ChatMessage
              message={{
                id: "welcome2",
                content: followUpPrompt,
                sender: "ai",
                timestamp: new Date()
              }}
              isLatest={false}
            />
          </>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={sendMessage} isAiResponding={isAiResponding} />
    </div>
  );
};

export default Chat; 