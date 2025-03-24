
import { useState, useEffect, useRef } from "react";
import ChatMessage, { MessageType } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Header from "@/components/Header";
import { v4 as uuidv4 } from 'uuid';

// Sample initial messages
const initialMessages: MessageType[] = [
  {
    id: uuidv4(),
    content: "Hello, I'm your AI therapy assistant. I'm here to listen and help you process your thoughts and feelings. How are you feeling today?",
    sender: "ai",
    timestamp: new Date(),
  },
];

const Index = () => {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (content: string) => {
    const newUserMessage: MessageType = {
      id: uuidv4(),
      content,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setIsAiResponding(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponses = [
        "Tell me more about that. How does that make you feel?",
        "That sounds challenging. What thoughts come up for you when you experience this?",
        "I understand this is difficult. Have you noticed any patterns in when these feelings arise?",
        "Thank you for sharing that with me. How have you been coping with these emotions?",
        "I'm here to support you. What would be helpful for you to explore about this situation?",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const newAiMessage: MessageType = {
        id: uuidv4(),
        content: randomResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
      setIsAiResponding(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex-1 overflow-hidden relative">
        <div 
          ref={chatContainerRef}
          className="chat-container h-full overflow-y-auto pb-4 pt-2 px-4"
        >
          <div className="max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isLatest={index === messages.length - 1}
              />
            ))}
            
            {isAiResponding && (
              <div className="flex justify-start mb-4 animate-fade-in opacity-0">
                <div className="chat-bubble ai">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isAiResponding={isAiResponding}
      />
    </div>
  );
};

export default Index;
