import { useEffect, useRef } from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageType } from "@/types/message";

interface ChatMessageProps {
  message: MessageType;
  isLatest: boolean;
  currentPersona?: {
    id: string;
    name: string;
  };
}

const ChatMessage = ({ message, isLatest }: ChatMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const isUser = message.sender === "user";

  useEffect(() => {
    if (isLatest && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLatest]);

  const renderFormattedText = (text: string) => {
    // This regex finds text wrapped in **...** and replaces it with <strong>...</strong>
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;

    const withBold = text.replace(boldRegex, '<strong>$1</strong>');
    const withItalic = withBold.replace(italicRegex, '<em>$1</em>');

    return { __html: withItalic };
  };

  const text = message.content;
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isLastMessage = isLatest;

  return (
    <div
      ref={messageRef}
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start",
        "animate-fade-in"
      )}
    >
      <div className={cn("max-w-3xl", isUser ? "order-1" : "order-2")}>
        <div
          className={cn(
            "px-6 py-4 rounded-2xl shadow-sm border",
            isUser
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-200"
              : "bg-white/80 backdrop-blur-sm text-gray-800 border-orange-200",
            isLastMessage ? "animate-scale-in" : "",
            "hover:shadow-md transition-all duration-200"
          )}
        >
          <p
            className={cn(
              "text-base leading-relaxed whitespace-pre-wrap",
              isUser ? "text-white" : "text-gray-800"
            )}
            dangerouslySetInnerHTML={renderFormattedText(text)}
          >
          </p>
        </div>

        <div
          className={cn(
            "flex items-center mt-2 px-2",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs text-orange-500 font-medium">
            {timestamp}
          </span>
          {isUser && (
            <CheckCheck size={16} className="ml-2 text-orange-400" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
