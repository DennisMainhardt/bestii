import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Coffee, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Typing Dots Component
const TypingDots = () => {
  const dotVariants = {
    initial: { y: "0%", opacity: 0.5 },
    animate: { y: ["0%", "-50%", "0%"], opacity: [0.5, 1, 0.5] },
  };
  const dotTransition = {
    duration: 0.7,
    repeat: Infinity,
    ease: "easeInOut",
  };
  return (
    <motion.div className="flex space-x-1 p-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-warm-700 rounded-full"
          variants={dotVariants}
          animate="animate"
          transition={{ ...dotTransition, delay: i * 0.2 }}
        />
      ))}
    </motion.div>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const chatMessages = [
    {
      id: 1, sender: "user", text: "I don't even know what's wrong. I just feel tired of everything"
    },
    { id: 2, sender: "ai", text: "That's not weakness. That's your soul whispering, \"I can't keep pretending I'm fine.\"" },
    { id: 3, sender: "user", text: "So what now?" },
    { id: 4, sender: "ai", text: "Now we stop pretending. We start healing. I'm here. Every step. Tell me exactly what's going on." },
  ];

  const [displayedMessages, setDisplayedMessages] = useState<typeof chatMessages>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    if (currentMessageIndex < chatMessages.length) {
      const currentMessage = chatMessages[currentMessageIndex];
      let delay = 0;

      // Check if it's an AI message AND not the very first message overall
      if (currentMessage.sender === "ai" && currentMessageIndex !== 0) {
        setIsAiTyping(true);
        delay = 3000; // 3 seconds for typing dots
      } else if (currentMessage.sender === "ai" && currentMessageIndex === 0) {
        // If it's the first AI message, ensure typing is false (it should be by default)
        setIsAiTyping(false);
      }

      const timer = setTimeout(() => {
        if (currentMessage.sender === "ai" && currentMessageIndex !== 0) {
          setIsAiTyping(false);
        }
        setDisplayedMessages((prev) => [...prev, currentMessage]);
        setCurrentMessageIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else if (currentMessageIndex === chatMessages.length && displayedMessages.length === chatMessages.length) {
      // Optional: Restart sequence after a pause
      const restartTimer = setTimeout(() => {
        setDisplayedMessages([]);
        setCurrentMessageIndex(0);
        setIsAiTyping(false);
      }, 5000); // 5-second pause before restart
      return () => clearTimeout(restartTimer);
    }
  }, [currentMessageIndex, chatMessages, displayedMessages.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-coral-50 to-orange-50 overflow-hidden py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-warm [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

      <div className="container mx-auto px-4 z-10">
        {/* Flex container for two-column layout on medium screens and up */}
        <div className="md:grid md:grid-cols-5 md:gap-12 lg:gap-16 md:items-center">

          {/* Left Content Block */}
          <div className="md:col-span-3 text-center md:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-warm-200 rounded-full px-6 py-3 mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-warm-600" />
              <span className="text-sm font-medium text-warm-700">The best friend you always needed but never had. Until now.</span>              <Sparkles className="w-4 h-4 text-warm-600" />
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-warm-600 via-coral-500 to-orange-600 bg-clip-text text-transparent mb-6 leading-tight font-display">
              The friend who
              <br />
              <span className="text-4xl md:text-5xl lg:text-6xl font-casual">actually gets it.</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-warm-700 mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              Real talk. No judgment. Support that actually sticks.
              <br />
              Even when you don't know how to ask for help.
              <br />
              <br />
              Meet Bestii: your 24/7 chat companion.
            </p>

            {/* CTA Buttons (Desktop Only) */}
            <div className="hidden md:block">
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center mb-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-warm-500 to-coral-500 hover:from-warm-600 hover:to-coral-600 text-white px-10 py-6 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                  onClick={() => navigate("/login", { state: { from: "register" } })}
                >
                  <MessageCircle className="mr-3 h-6 w-6" />
                  Talk to Bestii
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-warm-300 text-warm-700 hover:bg-warm-50 px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300 w-full sm:w-auto"
                  onClick={() => {
                    const featuresSection = document.getElementById("features");
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  See Why I'm Different
                </Button>
              </div>

              {/* Social proof (Desktop Only) */}
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-8 text-sm text-warm-600">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-10 h-10 bg-gradient-to-r from-warm-400 to-coral-400 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">
                        {['😊', '🥺', '💪', '🔥', '✨'][i - 1]}
                      </div>
                    ))}
                  </div>
                  <span className="font-medium">15,000+ people finally feeling understood</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Your new ride-or-die bestie</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Block (Phone) */}
          <div className="md:col-span-2 mt-16 md:mt-0 flex justify-center md:justify-end">
            <motion.div
              className="relative w-72 sm:w-80 h-[600px] sm:h-[670px] bg-zinc-900 rounded-[50px] border-[12px] border-zinc-800 shadow-2xl overflow-hidden ring-4 ring-coral-300/70 ring-offset-4 ring-offset-warm-50/50 mx-auto md:mx-0"
              animate={{
                scale: [1, 1.01, 1],
                boxShadow: [
                  "0 0 20px 5px rgba(255, 127, 80, 0.3)",
                  "0 0 30px 10px rgba(255, 127, 80, 0.4)",
                  "0 0 20px 5px rgba(255, 127, 80, 0.3)"
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="h-full bg-warm-50 p-4 pt-6 space-y-3 flex flex-col">
                <AnimatePresence initial={false}>
                  {displayedMessages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} // Optional: exit animation
                      transition={{ duration: 0.4, ease: "circOut" }}
                      className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[75%] min-h-[40px] p-3 rounded-2xl shadow flex items-center ${msg.sender === 'ai'
                          ? 'bg-coral-100 text-warm-800 rounded-bl-none'
                          : 'bg-warm-500 text-white rounded-br-none'
                          }`}
                      >
                        {/* Show typing dots only for the LAST AI message if it's still typing */}
                        {(isAiTyping && msg.sender === 'ai' && i === displayedMessages.length - 1 && chatMessages[currentMessageIndex - 1]?.id === msg.id) ? (
                          <TypingDots />
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }} // Slide up text
                          >
                            {msg.text}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {/* Placeholder for current AI typing dots if it's the next message */}
                {isAiTyping && currentMessageIndex < chatMessages.length && chatMessages[currentMessageIndex].sender === 'ai' && displayedMessages.length === currentMessageIndex && (
                  <motion.div
                    key="typing-dots-placeholder"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className={`flex justify-start`}
                  >
                    <div className={`max-w-[75%] min-h-[40px] p-3 rounded-2xl shadow flex items-center bg-coral-100 text-warm-800 rounded-bl-none`}>
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Buttons & Social Proof (Mobile Only) */}
        <div className="md:hidden mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-warm-500 to-coral-500 hover:from-warm-600 hover:to-coral-600 text-white px-10 py-6 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              onClick={() => navigate("/login", { state: { from: "register" } })}
            >
              <MessageCircle className="mr-3 h-6 w-6" />
              Talk to Bestii
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-warm-300 text-warm-700 hover:bg-warm-50 px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300 w-full sm:w-auto"
              onClick={() => {
                const featuresSection = document.getElementById("features");
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              See Why I'm Different
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-warm-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 bg-gradient-to-r from-warm-400 to-coral-400 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">
                    {['😊', '🥺', '💪', '🔥', '✨'][i - 1]}
                  </div>
                ))}
              </div>
              <span className="font-medium">15,000+ people finally feeling understood</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-medium">Your new ride-or-die bestie</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 