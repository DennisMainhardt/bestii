import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { useChat } from "@/hooks/useChat";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { introPrompt, followUpPrompt } from "@/constants/prompts";

const Chat = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('API Key loaded:', apiKey ? 'Yes' : 'No');

  const { messages, isAiResponding, error, sendMessage, clearChat } = useChat(apiKey);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <ChatInput onSendMessage={sendMessage} isAiResponding={isAiResponding} />
        </div>
      </div>
    </div>
  );
};

export default Chat; 