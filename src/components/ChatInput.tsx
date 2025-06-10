import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Paperclip, Smile } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isAiResponding: boolean;
  currentPersonaId: string;
}

const ChatInput = ({ onSendMessage, isAiResponding, currentPersonaId }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (message.trim() && !isAiResponding) {
      onSendMessage(message.trim());
      setMessage("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize the textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const minHeight = 40;
      const maxHeight = 120; // Increased max height
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 relative flex items-center bg-[#FDF6E3] border border-orange-200/80 rounded-full px-3 h-12">
          <Button variant="ghost" size="icon" className="text-orange-500/80 hover:text-orange-500">
            <Paperclip size={20} />
          </Button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind..?"
            disabled={isAiResponding}
            className="flex-1 w-full resize-none bg-transparent py-2 px-1 focus:outline-none text-gray-800 placeholder:text-orange-900/40"
            style={{ height: "40px" }}
            rows={1}
          />
          <Button variant="ghost" size="icon" className="text-orange-500/80 hover:text-orange-500">
            <Smile size={20} />
          </Button>
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || isAiResponding}
          className="w-12 h-12 p-0 rounded-full bg-gray-200/80 hover:bg-gray-300/80 disabled:bg-gray-100/80 disabled:text-gray-400/80 text-gray-500/80"
          aria-label="Send message"
          type="button"
        >
          <SendHorizontal size={22} />
        </Button>
      </div>
      <p className="text-xs text-orange-900/50 mt-2">
        This is a safe space. Take your time to express yourself.
      </p>
    </div>
  );
};

export default ChatInput;