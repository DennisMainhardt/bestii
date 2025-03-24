
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export type MessageType = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

interface ChatMessageProps {
  message: MessageType;
  isLatest: boolean;
}

const ChatMessage = ({ message, isLatest }: ChatMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const isUser = message.sender === "user";
  
  useEffect(() => {
    if (isLatest && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLatest]);

  return (
    <div 
      ref={messageRef}
      className={cn(
        "group flex w-full mb-4 animate-fade-in opacity-0",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "chat-bubble max-w-[80%] sm:max-w-[70%] shadow-sm",
          isUser ? "user" : "ai"
        )}
      >
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className={cn(
          "text-xs mt-1 opacity-0 transition-opacity group-hover:opacity-60",
          isUser ? "text-right text-blue-100" : "text-left text-gray-400"
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
