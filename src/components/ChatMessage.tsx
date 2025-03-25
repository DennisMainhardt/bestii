import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Check, CheckCheck } from "lucide-react";

export type MessageType = {
  id: string;
  content: string;
  sender: "user" | "ai" | "raze";
  timestamp: Date;
};

interface ChatMessageProps {
  message: MessageType;
  isLatest: boolean;
}

const ChatMessage = ({ message, isLatest }: ChatMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const isUser = message.sender === "user";
  const isRaze = message.sender === "raze";

  useEffect(() => {
    if (isLatest && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLatest]);

  return (
    <div
      ref={messageRef}
      className={cn(
        "group flex w-full mb-2 animate-fade-in opacity-0",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "chat-bubble max-w-[80%] sm:max-w-[65%] rounded-2xl p-4",
          isUser ? "user" : "ai"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className={cn(
          "text-[11px] mt-2 flex items-center justify-end gap-1",
          isUser ? "text-[#AED8BE] dark:text-[#AED8BE] light:text-[#88B68F]" : "text-[#8696A0]"
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isUser && (
            <CheckCheck size={16} className="text-[#53BDEB] dark:text-[#53BDEB] light:text-[#53BDEB]" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
