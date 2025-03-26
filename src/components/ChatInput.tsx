import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isAiResponding: boolean;
}

const ChatInput = ({ onSendMessage, isAiResponding }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (message.trim() && !isAiResponding) {
      onSendMessage(message.trim());
      setMessage("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="w-full bg-background border-t p-4">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isAiResponding}
            className="w-full resize-none bg-background border border-input rounded-2xl py-4 px-5 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground min-h-[56px] max-h-[120px] overflow-y-auto"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isAiResponding}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full transition-all duration-200 ${message.trim()
              ? 'bg-primary hover:bg-primary/90'
              : 'bg-zinc-200 dark:bg-muted hover:bg-zinc-300 dark:hover:bg-muted/80'
              }`}
            aria-label="Send message"
          >
            <SendHorizontal size={18} className="text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
