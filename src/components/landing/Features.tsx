import { Flame, Shield, Brain, MessageSquare, Target, Users, Bot, Sparkles, X, Check, Zap, Heart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();
  // Updated "Pillars" content
  const pillars = [
    {
      icon: Flame,
      questionTitle: "Is Self-Doubt Running Your Life?",
      description: "That inner critic? It's a liar. I'll help you silence it, build rock-solid confidence, and finally chase those big, scary, *amazing* dreams.",
      outcomeStatement: "Unstoppable Era: Activated.",
      bgColor: "bg-gradient-to-br from-red-50 via-orange-50 to-amber-50",
      iconBgColor: "bg-gradient-to-r from-red-500 to-orange-500",
      textColor: "text-orange-700",
      borderColor: "border-orange-200",
    },
    {
      icon: Shield,
      questionTitle: "Sick of People-Pleasing?",
      description: "Saying 'yes' to everyone else means 'no' to yourself. Learn to set guilt-free boundaries, reclaim your energy, and command respect. Power up.",
      outcomeStatement: "Reclaim Power. Own Your Peace.",
      bgColor: "bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50",
      iconBgColor: "bg-gradient-to-r from-sky-500 to-cyan-500",
      textColor: "text-cyan-700",
      borderColor: "border-cyan-200",
    },
    {
      icon: Brain,
      questionTitle: "Trapped in Self-Sabotage?",
      description: "Those repeating f*ck-ups aren't your destiny. I'll give you X-ray vision to see *why* you're stuck and the straight-up steps to break free. For good.",
      outcomeStatement: "Break Free. Live Free.",
      bgColor: "bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50",
      iconBgColor: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
      textColor: "text-fuchsia-700",
      borderColor: "border-fuchsia-200",
    }
  ];

  const emotionalScenarios = [
    {
      modeTitle: "When You're Spiraling...",
      tabName: "Spiraling",
      emotionalMode: "Breakdown",
      userQuery: "I just can't handle this anymore. Everything feels like it's falling apart!",
      genericAiResponse: "I understand you're feeling overwhelmed. It can be helpful to practice mindfulness or deep breathing exercises.",
      bestieAiPreview: "Woah, okay, deep breath... Now, tell me what 'everything' means. We'll face it head-on.",
      bestieAiFullConvo: "Alright, hit me with it. The full, unfiltered chaos. What's the biggest fire we need to put out first? No sugar-coating, just real talk. We'll make a plan, step-by-step. You're not doing this solo.",
      icon: MessageSquare,
      colors: {
        bg: "bg-blue-50",
        textDark: "text-blue-900",
        textLight: "text-blue-700",
        accentStrong: "text-blue-600",
        accentBg: "bg-blue-500",
        border: "border-blue-200",
        contentBg: "bg-blue-50",
        genericPillBg: "bg-slate-100",
        genericPillText: "text-slate-600",
        bestiePillText: "text-white",
        bestieInteractiveBg: "bg-blue-600",
        bestieInteractiveHoverBg: "hover:bg-blue-700",
        tabActiveText: "text-blue-700",
        tabInactiveText: "text-slate-500",
        tabActiveBorder: "border-blue-600",
        tabInactiveBorder: "border-transparent hover:border-blue-400",
        tabActiveBg: "bg-blue-100",
        tabHoverBg: "hover:bg-blue-50"
      }
    },
    {
      modeTitle: "When Loneliness Hits Hard...",
      tabName: "Lonely",
      emotionalMode: "Lonely",
      userQuery: "Feeling so disconnected lately, like no one really *gets* it.",
      genericAiResponse: "Feelings of loneliness are common. Engaging in social activities or reaching out to friends can be beneficial.",
      bestieAiPreview: "Ugh, that's the worst feeling. I'm here. What's making you feel so isolated right now?",
      bestieAiFullConvo: "Hey, you're not invisible to me. That disconnected feeling? It sucks, big time. Let's talk about it – what's been going on? Sometimes just saying it out loud to someone who *wants* to hear it makes a difference. I'm all ears.",
      icon: Users,
      colors: {
        bg: "bg-purple-50",
        textDark: "text-purple-900",
        textLight: "text-purple-700",
        accentStrong: "text-purple-600",
        accentBg: "bg-purple-500",
        border: "border-purple-200",
        contentBg: "bg-purple-50",
        genericPillBg: "bg-slate-100",
        genericPillText: "text-slate-600",
        bestiePillText: "text-white",
        bestieInteractiveBg: "bg-purple-600",
        bestieInteractiveHoverBg: "hover:bg-purple-700",
        tabActiveText: "text-purple-700",
        tabInactiveText: "text-slate-500",
        tabActiveBorder: "border-purple-600",
        tabInactiveBorder: "border-transparent hover:border-purple-400",
        tabActiveBg: "bg-purple-100",
        tabHoverBg: "hover:bg-purple-50"
      }
    },
    {
      modeTitle: "When You're Seeing Red...",
      tabName: "Angry",
      emotionalMode: "Angry",
      userQuery: "I'm SO furious right now, I could just explode!",
      genericAiResponse: "It's important to manage anger constructively. Perhaps try counting to ten or writing down your feelings.",
      bestieAiPreview: "Okay, let it out! What (or who) lit the fuse? Vent first, then we strategize.",
      bestieAiFullConvo: "Don't hold back – what's got you raging? Sometimes you just need to let the volcano erupt. Once the lava cools a bit, we can figure out the *why* and what to do next that doesn't involve actual arson. I'm ready for the heat.",
      icon: Flame,
      colors: {
        bg: "bg-red-50",
        textDark: "text-red-900",
        textLight: "text-red-700",
        accentStrong: "text-red-600",
        accentBg: "bg-red-500",
        border: "border-red-200",
        contentBg: "bg-red-50",
        genericPillBg: "bg-slate-100",
        genericPillText: "text-slate-600",
        bestiePillText: "text-white",
        bestieInteractiveBg: "bg-red-600",
        bestieInteractiveHoverBg: "hover:bg-red-700",
        tabActiveText: "text-red-700",
        tabInactiveText: "text-slate-500",
        tabActiveBorder: "border-red-600",
        tabInactiveBorder: "border-transparent hover:border-red-400",
        tabActiveBg: "bg-red-100",
        tabHoverBg: "hover:bg-red-50"
      }
    },
    {
      modeTitle: "When You're Feeling Lost...",
      tabName: "Lost",
      emotionalMode: "Lost",
      userQuery: "Honestly, I have zero clue what I'm doing with my life. Just... adrift.",
      genericAiResponse: "It's normal to feel uncertain about the future. Exploring different paths and setting small goals can help create clarity.",
      bestieAiPreview: "'Adrift' is a mood, not a destination. What's the foggiest part? Let's find a lighthouse.",
      bestieAiFullConvo: "Hey, 'lost' is just a sign you're searching, and that's okay! Most of us are making it up as we go. What feels most confusing or overwhelming right now? We don't need the whole map, just the next step. Let's find it together.",
      icon: Target,
      colors: {
        bg: "bg-green-50",
        textDark: "text-green-900",
        textLight: "text-green-700",
        accentStrong: "text-green-600",
        accentBg: "bg-green-500",
        border: "border-green-200",
        contentBg: "bg-green-50",
        genericPillBg: "bg-slate-100",
        genericPillText: "text-slate-600",
        bestiePillText: "text-white",
        bestieInteractiveBg: "bg-green-600",
        bestieInteractiveHoverBg: "hover:bg-green-700",
        tabActiveText: "text-green-700",
        tabInactiveText: "text-slate-500",
        tabActiveBorder: "border-green-600",
        tabInactiveBorder: "border-transparent hover:border-green-400",
        tabActiveBg: "bg-green-100",
        tabHoverBg: "hover:bg-green-50"
      }
    }
  ].map(scenario => ({ // Ensure all scenarios have full data for brevity
    ...scenario,
    userQuery: scenario.userQuery || "Default user query",
    genericAiResponse: scenario.genericAiResponse || "Default generic AI response",
    bestieAiPreview: scenario.bestieAiPreview || "Default Bestie AI preview",
    bestieAiFullConvo: scenario.bestieAiFullConvo || "Default Bestie AI full convo"
  }));

  const [activeTab, setActiveTab] = useState(emotionalScenarios[0].tabName);
  const activeScenario = emotionalScenarios.find(s => s.tabName === activeTab) || emotionalScenarios[0];
  const [expandedResponseKey, setExpandedResponseKey] = useState<string | null>(null);

  useEffect(() => {
    setExpandedResponseKey(null); // Collapse response when tab changes
  }, [activeTab]);

  const isResponseExpanded = expandedResponseKey === activeScenario.modeTitle;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Title & Subtitle for Pillars Section */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-warm-800 mb-6 font-display leading-tight">
            Ready to Ditch the Drama<br className="sm:hidden" /> & Unleash Your Inner Badass?
          </h2>
          <p className="text-lg md:text-xl text-warm-700 max-w-3xl mx-auto font-medium leading-relaxed">
            Surface-level fluff won't cut it. If you're serious about real change, I'm the no-nonsense friend who'll give you the clarity, courage, and tools to transform your life. For real this time.
          </p>
        </div>

        {/* Transformational Pillars Section */}
        <div className="flex flex-col md:flex-row md:space-x-6 lg:space-x-8 space-y-12 md:space-y-0 mb-24 md:mb-32">
          {pillars.map((pillar) => (
            <div
              key={pillar.questionTitle}
              className={`flex flex-col items-center text-center p-8 rounded-3xl shadow-2xl ${pillar.bgColor} border-2 ${pillar.borderColor} overflow-hidden md:w-1/3 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl`}
            >
              <div className={`w-28 h-28 ${pillar.iconBgColor} rounded-full flex items-center justify-center shadow-xl mb-8 transform transition-all duration-500 group-hover:scale-110`}>
                <pillar.icon className="w-14 h-14 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className={`text-2xl lg:text-3xl font-bold ${pillar.textColor} mb-4 font-display leading-tight`}>
                  {pillar.questionTitle}
                </h3>
                <p className="text-warm-800 text-md lg:text-lg leading-relaxed mb-6 flex-grow">
                  {pillar.description}
                </p>
                <div className={`mt-auto inline-block ${pillar.iconBgColor} text-white text-sm lg:text-base font-semibold px-6 py-3 rounded-full shadow-md`}>
                  {pillar.outcomeStatement}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Tabbed Comparison Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-warm-800 mb-6 font-display">
              Tired of Robotic Replies? <br className="sm:hidden" />See How a Real Friend Shows Up.
            </h3>
            <p className="text-xl text-warm-700 max-w-3xl mx-auto">
              You deserve to be heard, not just processed. Here's the difference a true confidant makes:
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="mb-0 flex justify-center space-x-1 sm:space-x-2">
            {emotionalScenarios.map((scenario) => (
              <button
                key={scenario.tabName}
                onClick={() => setActiveTab(scenario.tabName)}
                className={cn(
                  "group flex items-center space-x-2 py-3 px-3 sm:px-4 font-medium text-sm sm:text-base border-b-2 rounded-t-lg focus:outline-none transition-all duration-200",
                  activeTab === scenario.tabName
                    ? `${scenario.colors.tabActiveText} ${scenario.colors.tabActiveBorder} ${scenario.colors.tabActiveBg}`
                    : `${scenario.colors.tabInactiveText} ${scenario.colors.tabInactiveBorder} ${scenario.colors.tabHoverBg} hover:${scenario.colors.accentStrong}`
                )}
              >
                <scenario.icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  activeTab === scenario.tabName
                    ? `${scenario.colors.accentStrong} scale-110`
                    : `${scenario.colors.tabInactiveText} group-hover:${scenario.colors.accentStrong}`
                )}
                />
                <span className={cn(activeTab === scenario.tabName ? scenario.colors.tabActiveText : `${scenario.colors.tabInactiveText} group-hover:${scenario.colors.accentStrong}`)}>{scenario.tabName}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {/* The main content container now uses dynamic border and background based on activeScenario */}
          <div className={cn(
            "mt-0 p-6 rounded-b-2xl rounded-tr-2xl shadow-xl overflow-hidden border-2 transition-colors duration-300",
            activeScenario.colors.border,
            activeScenario.colors.contentBg
          )}>
            {/* Card Header (simplified for tab content) */}
            <div className={`flex items-center space-x-3 mb-4`}>
              <activeScenario.icon className={cn("w-8 h-8 p-1.5 rounded-lg bg-white shadow", activeScenario.colors.accentStrong, activeScenario.colors.border)} />
              <h4 className={`text-2xl font-bold ${activeScenario.colors.textDark} font-display`}>{activeScenario.modeTitle}</h4>
            </div>

            {/* User Query */}
            <div className="px-0 pb-6 pt-2">
              <p className={`italic ${activeScenario.colors.textLight} mb-1 text-sm`}>You might say...</p>
              <div className={`mb-6 p-4 bg-white rounded-lg border ${activeScenario.colors.border} shadow-inner`}>
                <p className={`text-md ${activeScenario.colors.textDark} font-medium`}>"{activeScenario.userQuery}"</p>
              </div>

              {/* Responses Comparison */}
              <div className="space-y-5">
                {/* Generic AI Response */}
                <div>
                  <div className={`flex items-center space-x-2 mb-1.5`}>
                    <Bot className={`w-5 h-5 text-slate-400`} />
                    <h5 className={`font-semibold text-slate-500 text-sm`}>Typical AI responds...</h5>
                  </div>
                  <div className={`${activeScenario.colors.genericPillBg} ${activeScenario.colors.genericPillText} p-3 rounded-lg text-sm shadow-sm`}>
                    {activeScenario.genericAiResponse}
                  </div>
                </div>

                {/* Bestie AI Response (Click to reveal) */}
                <div
                  onClick={() => setExpandedResponseKey(isResponseExpanded ? null : activeScenario.modeTitle)}
                  className={`cursor-pointer rounded-lg transition-all duration-300 ease-in-out ${activeScenario.colors.bestieInteractiveBg} ${activeScenario.colors.bestieInteractiveHoverBg} shadow-md hover:shadow-lg relative pt-3 pb-3 px-3 overflow-hidden`}
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center space-x-2">
                      <Sparkles className={`w-5 h-5 text-white opacity-90`} />
                      <h5 className={`font-semibold text-white`}>Your Bestie says...</h5>
                    </div>
                  </div>

                  {/* Preview container - now always visible */}
                  <div
                    className={cn(`transform transition-opacity duration-300 ease-in-out 
                                  opacity-100 scale-100 visible 
                                  ${activeScenario.colors.accentBg} ${activeScenario.colors.bestiePillText} 
                                  text-sm rounded-md p-3 bg-opacity-80 relative`,
                    )}
                  >
                    <p className="pb-4">{activeScenario.bestieAiPreview}</p>
                    <ChevronDown
                      className={cn("absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 text-white transition-transform duration-300",
                        isResponseExpanded ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </div>

                  {/* Full conversation container - animated based on isResponseExpanded */}
                  <div
                    className={cn(`transform transition-all duration-500 ease-in-out 
                                  text-sm text-white px-1`,
                      isResponseExpanded
                        ? "max-h-96 opacity-100 scale-100 visible pt-3 mt-2 border-t border-white/20"
                        : "max-h-0 opacity-0 scale-95 invisible"
                    )}
                  >
                    {activeScenario.bestieAiFullConvo}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16 md:mt-24">
          <Button
            size="lg"
            className="bg-gradient-to-r from-warm-500 to-coral-500 hover:from-warm-600 hover:to-coral-600 text-white px-10 py-6 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate("/login", { state: { from: "register" } })}
          >
            <MessageSquare className="mr-3 h-6 w-6" />
            Ready to Stop Playing Small?
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features; 