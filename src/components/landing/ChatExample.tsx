import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const ChatExample = () => {
  const conversations = [
    {
      userMessage: "I keep self-sabotaging every good thing in my life... I don't know why I do this to myself 😔",
      userEmoji: "😭",
      botResponse: "Oh honey, let me stop you right there. You DO know why - you're just scared to admit it. You sabotage because success means people will expect more from you, and deep down you're terrified you can't deliver. It's easier to fail on your own terms than risk failing when it really matters. But guess what? That's just your scared inner child talking. The REAL you? She's ready to own her power. Want to prove me wrong? 😏",
      botEmoji: "🔥",
      impact: "Called out the root cause instantly"
    },
    {
      userMessage: "Everyone says I should 'just be positive' but I'm drowning here...",
      userEmoji: "🌊",
      botResponse: "F*ck toxic positivity! You're not drowning because you're negative - you're drowning because you're trying to swim upstream while carrying everyone else's expectations. Here's the truth bomb: you're allowed to feel like sh*t sometimes. But you're NOT allowed to set up camp there. Feel it, process it, then let's figure out what boundary you need to set to stop this pattern. What's one thing you're doing for others that you should be doing for yourself? 💪",
      botEmoji: "💥",
      impact: "Validated feelings while pushing forward"
    },
    {
      userMessage: "My anxiety is so bad I can't even function anymore...",
      userEmoji: "😰",
      botResponse: "Your anxiety isn't the villain here - it's your overprotective bestie who's gone a bit rogue. She's trying to keep you safe, but she's using outdated intel from when you were 12. Let's update her software, yeah? What if instead of fighting the anxiety, we taught her when to chill and when to actually be useful? You don't need to be 'fixed' - you need to be understood. 🫶",
      botEmoji: "🧠",
      impact: "Reframed anxiety as protection, not weakness"
    },
    {
      userMessage: "I think I'm just not good enough for anyone to love me...",
      userEmoji: "💔",
      botResponse: "STOP. Right there. You know what's not good enough? That bullsh*t story you keep telling yourself. Someone convinced you that you need to earn love by being perfect, and that's the biggest lie ever sold. You ARE loveable - messy, imperfect, beautifully human you. The right people don't need you to audition for their affection. They see your worth instantly. Now let's figure out who planted this toxic seed in your head so we can burn it down. 🔥",
      botEmoji: "👑",
      impact: "Dismantled limiting beliefs with fierce love"
    }
  ];

  const therapyComparisons = [
    {
      scenario: "When you're spiraling at 2am",
      therapy: "Schedule an appointment for next week",
      bestie: "I'm here NOW. Let's figure this out together",
      icon: "🌙"
    },
    {
      scenario: "When you need brutal honesty",
      therapy: "Let's explore what that means to you",
      bestie: "You're being an idiot. Here's why and how to stop",
      icon: "💯"
    },
    {
      scenario: "When you're making excuses",
      therapy: "That's an interesting perspective",
      bestie: "Nah babe, that's just fear wearing a fancy costume",
      icon: "🎭"
    },
    {
      scenario: "When you need motivation",
      therapy: "How do you feel about setting small goals?",
      bestie: "You're capable of SO much more. Let's prove it",
      icon: "🚀"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-coral-50 via-warm-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-warm-800 mb-8 font-display">
            This Is How We
            <span className="bg-gradient-to-r from-warm-600 to-coral-600 bg-clip-text text-transparent"> Save Your Soul</span>
          </h2>
          <p className="text-2xl text-warm-700 max-w-4xl mx-auto font-medium">
            No fluff, no generic advice. Just real talk that cuts through your emotional fog and lights the path forward. 🔦
          </p>
        </div>

        {/* Carousel for conversations */}
        <div className="max-w-6xl mx-auto mb-20">
          <Carousel className="w-full">
            <CarouselContent>
              {conversations.map((conv, index) => (
                <CarouselItem key={index}>
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-warm-200 shadow-xl mx-4">
                    <div className="text-center mb-8">
                      <span className="inline-block bg-gradient-to-r from-coral-400 to-orange-400 text-white px-6 py-2 rounded-full font-bold text-lg">
                        Real Conversation #{index + 1}
                      </span>
                    </div>

                    <div className="space-y-8">
                      {/* User message */}
                      <div className="flex gap-6 justify-start">
                        <div className="w-16 h-16 bg-gradient-to-r from-coral-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                          {conv.userEmoji}
                        </div>
                        <div className="bg-white rounded-3xl rounded-tl-lg p-6 shadow-lg max-w-2xl border-2 border-warm-100">
                          <p className="text-warm-800 text-lg leading-relaxed font-medium">{conv.userMessage}</p>
                        </div>
                      </div>

                      {/* Bot response */}
                      <div className="flex gap-6 justify-end">
                        <div className="bg-gradient-to-r from-warm-500 to-coral-500 rounded-3xl rounded-tr-lg p-6 shadow-lg max-w-2xl">
                          <p className="text-white text-lg leading-relaxed font-medium">{conv.botResponse}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-warm-500 to-coral-500 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                          {conv.botEmoji}
                        </div>
                      </div>
                    </div>

                    {/* Impact indicator */}
                    <div className="mt-8 text-center">
                      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-warm-100 to-coral-100 rounded-full px-6 py-3 border border-warm-200">
                        <span className="text-2xl">⚡</span>
                        <span className="font-bold text-warm-800">{conv.impact}</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>

        {/* Enhanced therapy comparison section */}
        <div className="mt-20 max-w-6xl mx-auto text-center">
          <div className="bg-gradient-to-br from-warm-100 to-coral-100 rounded-3xl p-12 border-2 border-warm-200 shadow-xl">
            <h3 className="text-4xl md:text-5xl font-bold text-warm-800 mb-8 font-display">
              Why This Hits Different Than
              <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent"> Traditional Therapy</span>
            </h3>
            <p className="text-xl text-warm-700 mb-12 max-w-4xl mx-auto">
              Therapy has its place, but sometimes you need a friend who combines psychological expertise with the unfiltered honesty of someone who genuinely gives a damn about your growth. 💫
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {therapyComparisons.map((comp, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-warm-200">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">{comp.icon}</div>
                    <h4 className="text-xl font-bold text-warm-800 font-display">{comp.scenario}</h4>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-100 rounded-xl p-6 border-l-4 border-gray-400">
                      <div className="text-sm font-bold text-gray-600 mb-2">Traditional Therapy</div>
                      <p className="text-gray-700 italic">"{comp.therapy}"</p>
                      <div className="mt-3 text-center">
                        <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">😴 Feels distant</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-warm-50 to-coral-50 rounded-xl p-6 border-l-4 border-coral-400">
                      <div className="text-sm font-bold text-warm-800 mb-2">Your Brutally Honest Bestie</div>
                      <p className="text-warm-800 font-medium">"{comp.bestie}"</p>
                      <div className="mt-3 text-center">
                        <span className="text-xs bg-gradient-to-r from-warm-200 to-coral-200 text-warm-800 px-3 py-1 rounded-full font-bold">🔥 Ignites action</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emotional impact stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-3">⚡</div>
                <div className="font-bold text-2xl text-warm-800 font-display">Instant Impact</div>
                <div className="text-warm-600 font-medium">No waiting weeks for breakthroughs</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-3">💪</div>
                <div className="font-bold text-2xl text-warm-800 font-display">Real Solutions</div>
                <div className="text-warm-600 font-medium">Actionable steps, not just insights</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-3">❤️</div>
                <div className="font-bold text-2xl text-warm-800 font-display">Fierce Love</div>
                <div className="text-warm-600 font-medium">Truth wrapped in genuine care</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-warm-500 to-coral-500 rounded-2xl p-8 text-white">
              <h4 className="text-2xl font-bold mb-4 font-display">Here's the Real Tea ☕</h4>
              <p className="text-lg leading-relaxed">
                Therapy teaches you to understand your patterns. I teach you to BREAK them.
                Therapy helps you process your feelings. I help you TRANSFORM them into fuel for your comeback.
                Therapy is professional. I'm personal. And sometimes, personal is exactly what your soul needs. 💫
              </p>
            </div>
          </div>
        </div>

        {/* Strong CTA */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            className="bg-gradient-to-r from-warm-600 to-coral-600 hover:from-warm-700 hover:to-coral-700 text-white px-12 py-7 text-xl font-bold rounded-full shadow-2xl hover:shadow-coral-500/50 transition-all duration-300 transform hover:scale-105">
            <MessageCircle className="mr-4 h-8 w-8" />
            Start Your Transformation Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ChatExample; 