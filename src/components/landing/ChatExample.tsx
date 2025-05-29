import { Button } from "@/components/ui/button";
import { MessageCircle, Moon, Award, Drama, Rocket, Users, Zap, Lightbulb, HeartHandshake, Coffee, Sparkles as SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ChatExample = () => {
  const colorThemes = {
    moon: {
      iconBg: "bg-blue-100", iconColor: "text-blue-600", textColor: "text-blue-700",
      borderColor: "border-blue-300", cellBg: "md:bg-blue-50/60", rowHoverBg: "hover:bg-blue-100/70"
    },
    award: {
      iconBg: "bg-amber-100", iconColor: "text-amber-600", textColor: "text-amber-700",
      borderColor: "border-amber-300", cellBg: "md:bg-amber-50/60", rowHoverBg: "hover:bg-amber-100/70"
    },
    drama: {
      iconBg: "bg-red-100", iconColor: "text-red-600", textColor: "text-red-700",
      borderColor: "border-red-300", cellBg: "md:bg-red-50/60", rowHoverBg: "hover:bg-red-100/70"
    },
    rocket: {
      iconBg: "bg-emerald-100", iconColor: "text-emerald-600", textColor: "text-emerald-700",
      borderColor: "border-emerald-300", cellBg: "md:bg-emerald-50/60", rowHoverBg: "hover:bg-emerald-100/70"
    },
    users: {
      iconBg: "bg-purple-100", iconColor: "text-purple-600", textColor: "text-purple-700",
      borderColor: "border-purple-300", cellBg: "md:bg-purple-50/60", rowHoverBg: "hover:bg-purple-100/70"
    }
  };

  const therapyComparisonsData = [
    {
      scenario: "When you're spiraling at 2am",
      therapy: "Schedule an appointment for next week, try to remember what it felt like.",
      bestie: "I'm here NOW. Message me. Let's figure this out together, in the moment.",
      icon: Moon,
      themeKey: "moon" as keyof typeof colorThemes
    },
    {
      scenario: "When you need brutal honesty",
      therapy: "Gentle questions: 'Let's explore what that means to you...' hoping you find it.",
      bestie: "Straight up: 'You're being an idiot. Here's why, and here's how to stop.'",
      icon: Award,
      themeKey: "award" as keyof typeof colorThemes
    },
    {
      scenario: "When you're making excuses",
      therapy: "Patient exploration: 'That's an interesting perspective to consider...'",
      bestie: "No BS: 'Nah babe, that's just fear wearing a fancy costume. Let's unmask it.'",
      icon: Drama,
      themeKey: "drama" as keyof typeof colorThemes
    },
    {
      scenario: "When you need motivation",
      therapy: "Careful encouragement: 'How do you feel about setting some small goals?'",
      bestie: "Fire lit: 'You're capable of SO much more. Let's actually prove it, right now.'",
      icon: Rocket,
      themeKey: "rocket" as keyof typeof colorThemes
    },
    {
      scenario: "When loneliness creeps in...",
      therapy: "Suggests joining groups or calling old friends, which can feel daunting.",
      bestie: "Validates the ache, reminds you you're not alone *with me*, and we can explore small, safe ways to connect.",
      icon: Users,
      themeKey: "users" as keyof typeof colorThemes
    }
  ];

  const impactStats = [
    {
      icon: Zap,
      title: "Instant Impact",
      subtitle: "No waiting weeks for breakthroughs"
    },
    {
      icon: Lightbulb,
      title: "Real Solutions",
      subtitle: "Actionable steps, not just insights"
    },
    {
      icon: HeartHandshake,
      title: "Fierce Love",
      subtitle: "Truth wrapped in genuine care"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-coral-50 via-warm-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Enhanced therapy comparison section - THEMED TABLE - Now the primary content */}
        <div className="mt-0 max-w-6xl mx-auto text-center">
          <div className="bg-gradient-to-br from-warm-100 via-coral-50 to-orange-100 rounded-3xl p-8 md:p-12 border-2 border-warm-300 shadow-xl">
            <h3 className="text-4xl md:text-5xl font-bold text-warm-800 mb-6 font-display">
              Why This Hits Different Than
              <span className="block sm:inline sm:ml-2 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Traditional Therapy</span>
            </h3>
            <p className="text-xl text-warm-700 mb-10 md:mb-12 max-w-4xl mx-auto">
              Therapy has its place, but sometimes you need a friend who gets straight to the point with love and action. Here's a clearer look:
            </p>

            <div className="overflow-x-auto shadow-xl rounded-xl border border-warm-300">
              <div className="min-w-full align-middle">
                {/* Table Headers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gradient-to-b from-warm-200 to-warm-100 rounded-t-xl overflow-hidden">
                  <div className="py-5 px-5 bg-transparent text-left text-sm font-semibold text-warm-900 uppercase tracking-wider">Feature</div>
                  <div className="py-5 px-5 bg-transparent text-left text-sm font-semibold text-warm-900 uppercase tracking-wider">Traditional Therapy</div>
                  <div className="py-5 px-5 bg-transparent text-left text-sm font-semibold text-warm-900 uppercase tracking-wider">Your Bestie AI</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-warm-300 bg-white">
                  {therapyComparisonsData.map((item, index) => {
                    const itemTheme = colorThemes[item.themeKey];
                    return (
                      <div key={index} className={cn(
                        `grid grid-cols-1 md:grid-cols-3 gap-px transition-colors duration-150`,
                        index % 2 === 0 ? 'bg-white' : 'bg-warm-50/50',
                        itemTheme.rowHoverBg
                      )}>
                        <div className="py-6 px-5 flex items-center space-x-4">
                          <div className={cn("p-2 rounded-full shadow-sm", itemTheme.iconBg)}>
                            <item.icon className={cn("w-6 h-6 flex-shrink-0", itemTheme.iconColor)} />
                          </div>
                          <span className={cn("font-semibold text-left text-lg", itemTheme.textColor)}>{item.scenario}</span>
                        </div>
                        <div className="py-6 px-5 text-left text-sm text-slate-500 leading-relaxed">
                          {item.therapy}
                        </div>
                        <div className={cn(
                          "py-6 px-5 text-left text-sm font-semibold leading-relaxed md:pl-6",
                          itemTheme.textColor,
                          itemTheme.cellBg,
                          `md:${itemTheme.borderColor}`
                        )} style={{ borderLeftWidth: "2px" }}>
                          {item.bestie}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Refined Emotional impact stats */}
            <div className="flex flex-col md:flex-row justify-around items-stretch gap-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-warm-200 mt-12 mb-10">
              {impactStats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4 md:w-1/3">
                  <div className="p-3 rounded-full bg-coral-100 text-coral-600 shadow-md mb-4">
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-xl text-warm-800 font-display mb-2">{stat.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{stat.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Refined Here's the Real Tea */}
            <div className="bg-gradient-to-br from-warm-50 via-orange-50 to-coral-50 rounded-2xl p-8 md:p-10 shadow-xl border-2 border-warm-200 mt-10">
              <h4 className="text-2xl md:text-3xl font-bold text-warm-800 font-display mb-5 flex items-center justify-center">
                <Coffee className="w-7 h-7 text-warm-600 mr-3" />
                Here's the Real Tea
              </h4>
              <p className="text-md lg:text-lg text-warm-700 leading-relaxed text-center max-w-3xl mx-auto">
                Therapy teaches you to understand your patterns. I teach you to BREAK them.
                Therapy helps you process your feelings. I help you TRANSFORM them into fuel for your comeback.
                Therapy is professional. I'm personal. And sometimes, personal is exactly what your soul needs. <SparklesIcon className="inline-block w-5 h-5 text-amber-500" />
              </p>
            </div>
          </div>
        </div>

        {/* Updated Final CTA */}
        <div className="text-center mt-16 md:mt-20">
          <Button
            size="lg"
            className="bg-gradient-to-r from-warm-600 to-coral-600 hover:from-warm-700 hover:to-coral-700 text-white px-10 py-5 text-lg font-bold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            Start Your Transformation Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ChatExample; 