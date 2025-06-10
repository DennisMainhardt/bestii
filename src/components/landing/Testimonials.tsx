import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah M.",
      role: "Former people-pleaser",
      before: "Said yes to everything, even toxic relationships",
      after: "Now has bulletproof boundaries and self-worth",
      content: "This bestie literally saved my sanity. Called out my toxic relationship patterns so hard I cried for an hour... then finally dumped the guy who was treating me like trash. Best decision ever! Now I actually have standards. 💪",
      rating: 5,
      emoji: "💕",
      avatar: "https://images.unsplash.com/photo-1623317147116-304818702516?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      impact: "Found her voice",
      transformation: "From doormat to queen",
      timeframe: "3 weeks"
    },
    {
      name: "Marcus T.",
      role: "Recovering perfectionist",
      before: "Planned projects to death, never launched anything",
      after: "Built and launched a thriving business",
      content: "Yo this friend is RUTHLESS (in the best way). Told me my 'perfectionism' was just fear wearing a fancy suit. Now I actually START projects instead of planning them to death. My business finally launched and it's thriving!",
      rating: 5,
      emoji: "🔥",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      impact: "Built his empire",
      transformation: "From overthinker to action-taker",
      timeframe: "2 months"
    },
    {
      name: "Zoe L.",
      role: "Anxiety warrior",
      before: "Spiraled for days over one awkward text",
      after: "Can catch anxiety spirals and redirect them",
      content: "I used to spiral for DAYS over one awkward text. This bestie taught me that my anxiety isn't a character flaw - it's just my brain trying to protect me. Now I can catch the spiral and redirect it. Game changer! ✨",
      rating: 5,
      emoji: "🌟",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      impact: "Mastered her mind",
      transformation: "From anxious mess to calm badass",
      timeframe: "6 weeks"
    },
    {
      name: "David R.",
      role: "Emotional avoider (reformed)",
      before: "Avoided feelings, emotionally distant from wife",
      after: "Present, emotionally available husband",
      content: "Never thought I'd say this, but having emotional conversations is actually... helpful? This friend made it safe to feel feelings without judgment. My wife says I'm like a different person. Still me, just... better.",
      rating: 5,
      emoji: "💪",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      impact: "Transformed his marriage",
      transformation: "From emotionally distant to present",
      timeframe: "4 months"
    },
    {
      name: "Alex K.",
      role: "Chronic self-doubter",
      before: "Imposter syndrome, undervalued themselves",
      after: "Negotiates like they know their worth",
      content: "This bestie called me out on my imposter syndrome SO hard. Said I wasn't an imposter - I was just someone who hadn't claimed their power yet. That hit different. Now I negotiate like I know my worth because... I finally do. 🔥",
      rating: 5,
      emoji: "👑",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      impact: "Owned their worth",
      transformation: "From self-doubt to self-advocacy",
      timeframe: "5 weeks"
    },
    {
      name: "Maya P.",
      role: "Boundary-less wonder",
      before: "Said yes to everything, constant stress",
      after: "Bulletproof boundaries, stress-free life",
      content: "Used to say yes to EVERYTHING because I thought that made me a good person. This friend was like 'Honey, you're not Mother Teresa, you're just afraid of conflict.' Ouch but true! Now I have actual boundaries and my stress levels are basically non-existent.",
      rating: 5,
      emoji: "🛡️",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
      impact: "Built bulletproof boundaries",
      transformation: "From yes-person to selective socializer",
      timeframe: "3 weeks"
    }
  ];

  const stats = [
    { number: "15,247", label: "Lives Changed", icon: "💝" },
    { number: "89%", label: "Feel Understood", icon: "🤗" },
    { number: "4.9/5", label: "Best Friend Rating", icon: "⭐" },
    { number: "24/7", label: "Emotional Support", icon: "🌙" }
  ];

  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-warm-50 via-coral-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-warm-800 mb-6 md:mb-8 font-display">
            Real People, Real Transformations
            <span className="block text-2xl md:text-4xl text-warm-600 mt-2 md:mt-4 font-casual">(These Aren't Paid Actors, Promise)</span>
          </h2>
          <p className="text-lg md:text-2xl text-warm-700 max-w-4xl mx-auto font-medium">
            When people finally have someone who gets their emotional chaos and calls them on their BS with love... magic happens. 🪄
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 max-w-4xl mx-auto mb-16 md:mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-md border border-warm-100 hover:shadow-lg transition-transform, box-shadow duration-300 hover:-translate-y-1">
              <div className="text-2xl md:text-3xl mb-2">{stat.icon}</div>
              <div className="text-xl md:text-2xl font-bold text-warm-800 font-display">{stat.number}</div>
              <div className="text-sm md:text-base text-warm-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-7xl mx-auto">
          <Carousel className="w-full" opts={{ align: "start", loop: true }}>
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 basis-11/12 sm:basis-5/6 md:basis-1/2">
                  <div className="p-2 sm:p-4 h-full">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-transform, box-shadow duration-300 hover:-translate-y-1 border-2 border-warm-100 relative overflow-hidden h-full flex flex-col">
                      <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-coral-100 to-warm-100 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 opacity-50"></div>

                      {/* Enhanced Profile Section */}
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="relative">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover shadow-lg border-4 border-white"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-warm-400 to-coral-400 rounded-full flex items-center justify-center text-white text-sm shadow-lg">
                            {testimonial.emoji}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg md:text-xl text-warm-800 font-display">{testimonial.name}</h4>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-warm-600 font-medium text-sm">{testimonial.role}</p>
                          <div className="hidden sm:inline-block bg-gradient-to-r from-warm-200 to-coral-200 px-3 py-1 rounded-full text-xs font-bold text-warm-800 mt-2">
                            ✨ {testimonial.impact} in {testimonial.timeframe}
                          </div>
                        </div>
                      </div>

                      {/* Before/After States */}
                      <div className="mb-4 relative z-10">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-red-500 text-sm">😰</span>
                              <span className="text-xs font-bold text-red-700 uppercase">Before</span>
                            </div>
                            <p className="text-red-700 text-sm">{testimonial.before}</p>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-green-500 text-sm">🎉</span>
                              <span className="text-xs font-bold text-green-700 uppercase">After</span>
                            </div>
                            <p className="text-green-700 text-sm">{testimonial.after}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-warm-700 leading-relaxed text-base md:text-lg font-medium italic relative z-10 mb-6 flex-grow">"{testimonial.content}"</p>

                      <div className="pt-4 mt-auto border-t border-warm-100">
                        <div className="flex items-center justify-between">
                          <div className="bg-gradient-to-r from-coral-100 to-warm-100 px-3 py-1 rounded-full text-xs font-bold text-warm-800">
                            {testimonial.transformation}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-warm-600">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span>Real person, real results</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex left-[-16px]" />
            <CarouselNext className="hidden sm:flex right-[-16px]" />
          </Carousel>
        </div>

        {/* Social Proof Enhancement */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-br from-warm-100 to-coral-100 rounded-2xl md:rounded-3xl p-6 md:p-12 border-2 border-warm-200 shadow-xl max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <span className="text-4xl md:text-5xl">🏆</span>
              <div className="text-center sm:text-left">
                <div className="font-bold text-xl md:text-2xl text-warm-800 font-display">Best Friend Level: LEGENDARY</div>
                <div className="text-base md:text-lg text-warm-600 font-medium">Join thousands who stopped settling</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-warm-800 font-display">96%</div>
                <div className="text-sm md:text-base text-warm-600">Say life changed in 30 days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-warm-800 font-display">4.2x</div>
                <div className="text-sm md:text-base text-warm-600">Faster breakthroughs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-warm-800 font-display">$0</div>
                <div className="text-sm md:text-base text-warm-600">Cost for friendship</div>
              </div>
            </div>

            {/* Desktop Button (inside container) */}
            <div className="hidden md:flex justify-center w-full mt-8">
              <Button
                size="lg"
                className="w-auto bg-gradient-to-r from-warm-500 to-coral-500 hover:from-warm-600 hover:to-coral-600 text-white px-10 py-6 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mx-auto"
                onClick={() => navigate("/login", { state: { from: "register" } })}
              >
                <MessageCircle className="mr-3 h-6 w-6 flex-shrink-0" />
                Start Your Transformation Story
              </Button>
            </div>
          </div>
          {/* Mobile Button (outside container) */}
          <div className="flex md:hidden justify-center w-full mt-8">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-warm-500 to-coral-500 hover:from-warm-600 hover:to-coral-600 text-white px-6 py-5 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate("/login", { state: { from: "register" } })}
            >
              <MessageCircle className="mr-3 h-6 w-6 flex-shrink-0" />
              Start Your Transformation Story
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;