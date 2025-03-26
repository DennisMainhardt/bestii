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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (message.trim() && !isAiResponding) {
      onSendMessage(message.trim());
      setMessage("");

      // Reset height immediately after sending
      if (textareaRef.current) {
        // Use requestAnimationFrame to ensure DOM update happens in the right order
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "56px";
            // Force focus to stay on textarea to prevent keyboard from hiding on mobile
            textareaRef.current.focus();
          }
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize the textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      // Store the current scroll position
      const scrollPos = window.scrollY;

      // Reset height to default to calculate proper scrollHeight
      textareaRef.current.style.height = "56px";

      // Set height based on content (with a maximum)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;

      // Maintain scroll position to prevent page jump
      window.scrollTo(0, scrollPos);
    }
  }, [message]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-background border-t p-4 pb-safe"
      style={{
        // Fix for iOS to prevent scrolling issues with keyboard
        paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)'
      }}
    >
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
            style={{
              height: '56px',  // Explicit default height
            }}
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
            type="button"
          >
            <SendHorizontal size={18} className="text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;