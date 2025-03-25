import { useState, useCallback } from 'react';
import { MessageType } from '@/components/ChatMessage';
import { ChatGPTService } from '@/services/chatGPTService';

export const useChat = (apiKey: string) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatGPTService = new ChatGPTService(apiKey);

  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setIsAiResponding(true);
        setError(null);

        // Add user message immediately
        const userMessage: MessageType = {
          id: Date.now().toString(),
          content,
          sender: 'user',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Get AI response
        const response = await chatGPTService.sendMessage(content);

        // Add AI message
        const aiMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to get response from ChatGPT'
        );
      } finally {
        setIsAiResponding(false);
      }
    },
    [apiKey]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    chatGPTService.clearHistory();
  }, []);

  return {
    messages,
    isAiResponding,
    error,
    sendMessage,
    clearChat,
  };
};
