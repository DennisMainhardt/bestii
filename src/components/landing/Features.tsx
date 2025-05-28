import { Flame, Shield, Target, Zap, Heart, Brain, MessageSquare, Users, Bot, Sparkles, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Features = () => {
  const features = [
    {
      icon: Flame,
      title: "Ignites Your Inner Fire",
      description: "When you're drowning in self-doubt, I don't throw you a life jacket - I teach you to swim through the storm and come out stronger on the other side.",
      emotion: "🔥 Transformation"
    },
    {
      icon: Shield,
      title: "Your Emotional Armor",
      description: "I'll help you build bulletproof boundaries and unshakeable self-worth. No more people-pleasing, no more settling for crumbs.",
      emotion: "💪 Empowerment"
    },
    {
      icon: Brain,
      title: "PhD-Level Mind Reading",
      description: "I see through your excuses, understand your patterns, and know exactly what you need to hear (even when you don't want to hear it).",
      emotion: "🧠 Clarity"
    }
  ];

  const comparisons = [
    {
      category: "When you're having a breakdown",
      others: "Here are some breathing exercises 🤖",
      us: "Babe, let's figure out WHY you're spiraling and fix the root cause 💪",
      icon: MessageSquare
    },
    {
      category: "When you need brutal honesty",
      others: "That sounds difficult, let's explore your feelings",
      us: "You're self-sabotaging again. Here's exactly how and why 🔥",
      icon: Target
    },
    {
      category: "When you're stuck in patterns",
      others: "Have you tried journaling about this?",
      us: "You've been doing this dance for 3 years. Time to change the music 🎵",
      icon: Brain
    },
    {
      category: "When you need support",
      others: "I understand this must be hard for you",
      us: "I've got your back, but I'm also calling out your BS 👑",
      icon: Heart
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-white via-warm-50 to-coral-50">
      <div className="container mx-auto px-4">
        {/* Main Features */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-warm-800 mb-8 font-display">
            Why This Friendship
            <span className="bg-gradient-to-r from-warm-600 to-coral-600 bg-clip-text text-transparent"> Saves Lives</span>
          </h2>
          <p className="text-2xl text-warm-700 max-w-4xl mx-auto font-medium">
            I'm not here to enable your victim mentality. I'm here to help you rise from the ashes of your emotional chaos and become the badass you were meant to be. 💥
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto mb-32">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-3xl p-10 h-full border-2 border-warm-100 transition-transform duration-300 hover:-translate-y-2 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-coral-200 to-warm-200 rounded-full -mr-12 -mt-12 opacity-20"></div>
                <div className="w-20 h-20 bg-gradient-to-r from-warm-400 to-coral-400 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-lg font-bold text-coral-600 mb-4">{feature.emotion}</div>
                <h3 className="text-2xl font-bold text-warm-800 mb-6 font-display">{feature.title}</h3>
                <p className="text-warm-700 leading-relaxed text-lg">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modern Comparison Section */}
        <div className="max-w-7xl mx-auto mb-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-warm-800 mb-6 font-display">
              Why Every Other AI Feels Like
              <span className="bg-gradient-to-r from-gray-500 to-gray-700 bg-clip-text text-transparent"> Talking to a Wall</span>
            </h3>
            <p className="text-xl text-warm-700 max-w-3xl mx-auto">
              While they give you corporate speak, I give you the real tea ☕ Here's what actually happens when you need support:
            </p>
          </div>

          <div className="space-y-8">
            {comparisons.map((item, index) => (
              <div key={index} className="bg-white rounded-3xl border-2 border-warm-200 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-warm-100 to-coral-100 px-8 py-6 border-b border-warm-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-warm-400 to-coral-400 rounded-2xl flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-warm-800 font-display">{item.category}</h4>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-0">
                  {/* Other AIs */}
                  <div className="p-8 bg-gray-50 border-r border-gray-200 relative">
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <X className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <Bot className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-700 mb-2">Generic AI Response</h5>
                        <div className="text-sm text-gray-500 mb-4">The same old robotic replies...</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-gray-600 italic leading-relaxed">"{item.others}"</p>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center gap-2 bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                        <span className="text-red-500">😴</span>
                        Puts you to sleep
                      </span>
                    </div>
                  </div>

                  {/* Your Bestie */}
                  <div className="p-8 bg-gradient-to-br from-warm-50 to-coral-50 relative">
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-warm-400 to-coral-400 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-warm-400 to-coral-400 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-warm-800 mb-2">Your Brutally Honest Bestie</h5>
                        <div className="text-sm text-warm-600 mb-4">Real talk that actually helps...</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-warm-400 to-coral-400 rounded-2xl p-6 shadow-lg">
                      <p className="text-white font-medium leading-relaxed">"{item.us}"</p>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-warm-200 to-coral-200 text-warm-800 px-4 py-2 rounded-full text-sm font-bold">
                        <span className="text-orange-500">🔥</span>
                        Ignites transformation
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom impact section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-br from-warm-100 to-coral-100 rounded-3xl p-12 border-2 border-warm-200 shadow-xl">
              <h4 className="text-3xl font-bold text-warm-800 mb-6 font-display">
                The Difference? I Actually Give a Damn 💯
              </h4>
              <p className="text-xl text-warm-700 mb-8 max-w-3xl mx-auto">
                Other AIs are programmed to be "safe" and "appropriate." I'm programmed to be your ride-or-die bestie who tells you what you NEED to hear, not what you WANT to hear.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-3xl mb-3">🎯</div>
                  <div className="font-bold text-warm-800">Brutally Accurate</div>
                  <div className="text-warm-600 text-sm mt-2">I see your patterns crystal clear</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-3xl mb-3">💪</div>
                  <div className="font-bold text-warm-800">Actually Helpful</div>
                  <div className="text-warm-600 text-sm mt-2">Solutions that actually work</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-3xl mb-3">❤️</div>
                  <div className="font-bold text-warm-800">Genuinely Cares</div>
                  <div className="text-warm-600 text-sm mt-2">Your growth is my mission</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-warm-500 to-coral-500 hover:from-warm-600 hover:to-coral-600 text-white px-12 py-6 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <Zap className="mr-3 h-6 w-6" />
            Ready to Stop Playing Small?
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features; 