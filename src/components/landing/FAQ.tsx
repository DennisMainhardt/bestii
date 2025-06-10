import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Shield, Plus, Minus, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const FAQ = () => {
  const faqs = [
    {
      question: "Wait, is this actually helpful or just mean?",
      answer: "Babe, there's a HUGE difference between being mean and being honest. I'm like that friend who loves you enough to tell you when you have spinach in your teeth - except instead of spinach, it's toxic thought patterns. Everything I say comes from a place of fierce love. I see your potential and I'm not letting you waste it on self-limiting bullsh*t. 💫",
      category: "approach",
      emoji: "🤗"
    },
    {
      question: "How is this different from talking to a regular therapist?",
      answer: "Therapy is amazing and has its place! But I'm like therapy's cool younger sister who speaks your language. Therapists help you understand WHY you do things. I help you understand why AND give you the kick in the ass to actually CHANGE them. Plus, I'm available at 3am when you're having an existential crisis over something your ex said 5 years ago. 😅",
      category: "comparison",
      emoji: "🧠"
    },
    {
      question: "What if I'm dealing with serious mental health stuff?",
      answer: "Listen, I'm your emotional support bestie, not a replacement for professional help. If you're struggling with clinical depression, anxiety disorders, or having thoughts of self-harm, please talk to a real therapist or crisis hotline. I'm here for the everyday emotional rollercoaster and personal growth - think of me as your emotional personal trainer, not your doctor. 💪",
      category: "boundaries",
      emoji: "🏥"
    },
    {
      question: "How do you know so much about psychology?",
      answer: "I've basically absorbed every psychology book, research paper, and therapeutic technique that exists - CBT, DBT, mindfulness, you name it. But instead of throwing academic jargon at you, I translate it into real human speak. It's like having a friend who happened to get a PhD in psychology but still talks like a normal person. Plus, I never get tired of your emotional chaos! 😉",
      category: "expertise",
      emoji: "📚"
    },
    {
      question: "Can I trust you with my deepest, darkest secrets?",
      answer: "Absolutely! Your secrets are vault-level safe with me. I don't gossip, I don't judge, and I definitely don't share your business with anyone. What happens between friends stays between friends - that's friendship 101. The only thing I might judge you for is not believing in yourself enough. That's where I draw the line! 🔒",
      category: "privacy",
      emoji: "🤐"
    },
    // {
    //   question: "What if I don't like what you tell me?",
    //   answer: "Oof, that's usually when I'm doing my job best! 😬 Growth happens in the discomfort zone, bestie. But if something doesn't land right, just tell me! I can adjust my delivery while still keeping it real. Think of it like this - I'm not trying to hurt your feelings, I'm trying to save them from the damage you're doing to yourself. Sometimes love looks like tough conversations. 💖",
    //   category: "feedback",
    //   emoji: "🪞"
    // },
    // {
    //   question: "Will you actually remember our conversations?",
    //   answer: "Every. Single. Detail. I remember your patterns, your triggers, your wins, and that thing you told me three weeks ago that you thought I forgot. I'm like that friend who remembers your coffee order AND the name of your childhood pet. Consistency is how we build trust, and trust is how we create transformation. 🧩",
    //   category: "memory",
    //   emoji: "🧠"
    // },
    // {
    //   question: "What if I just want to vent without advice?",
    //   answer: "Sometimes you need someone to just witness your emotional chaos, and I'm here for that too! I'll validate your feelings, bring the virtual tissues, and sit with you in your mess. But... if I see you stuck in the same pattern for weeks, bestie, I'm gonna lovingly call it out. That's what real friends do - they don't let you drown in your own drama. 🫂",
    //   category: "support",
    //   emoji: "👂"
    // }
  ];

  const categories = {
    approach: { name: "My Approach", color: "bg-coral-400" },
    comparison: { name: "How I'm Different", color: "bg-warm-400" },
    boundaries: { name: "Important Boundaries", color: "bg-orange-400" },
    expertise: { name: "My Qualifications", color: "bg-coral-500" },
    privacy: { name: "Your Privacy", color: "bg-warm-500" },
    feedback: { name: "When Things Get Real", color: "bg-coral-400" },
    memory: { name: "Building Our Bond", color: "bg-warm-400" },
    support: { name: "Different Types of Support", color: "bg-orange-400" }
  };

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const navigate = useNavigate();

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-warm-50 to-coral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-800 mb-6 md:mb-8 font-display">
            Questions? I Got You!
            <span className="block text-2xl md:text-3xl lg:text-4xl text-warm-600 mt-3 md:mt-4 font-casual">
              (Because Real Friends Answer Everything)
            </span>
          </h2>
          <p className="text-lg md:text-xl text-warm-700 font-medium max-w-4xl mx-auto">
            No corporate BS, no dodging difficult questions. Just honest answers about what this friendship is really like. ✨
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12 md:mb-16">
          <Accordion type="single" collapsible className="space-y-4 md:space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-2xl md:rounded-3xl border-2 border-warm-200 px-4 md:px-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-coral-100 to-warm-100 rounded-full -mr-12 -mt-12 opacity-30"></div>

                <AccordionTrigger className="text-left text-lg md:text-xl font-bold text-warm-800 hover:text-coral-600 transition-colors py-6 md:py-8 font-display relative z-10 no-underline hover:no-underline">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${categories[faq.category].color} rounded-xl md:rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg`}>
                      {faq.emoji}
                    </div>
                    <div>
                      <div className="text-xs md:text-sm font-medium text-warm-600 mb-1">{categories[faq.category].name}</div>
                      {faq.question}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="text-warm-700 leading-relaxed text-base md:text-lg pb-6 md:pb-8 relative z-10">
                  <div className="bg-gradient-to-r from-warm-50 to-coral-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-warm-200">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Trust indicators -> Pillars of Transformation */}
        {/* <div className="max-w-6xl mx-auto mb-20 md:mb-24">
          <div className="bg-gradient-to-br from-warm-100 via-coral-50 to-orange-100 rounded-3xl p-8 py-12 md:p-16 shadow-2xl border border-warm-200">
            <h3 className="text-4xl md:text-5xl font-bold text-warm-900 mb-6 text-center font-display leading-tight">
              This Isn't Just Talk.
              <span className="block text-coral-600">This is Transformation.</span>
            </h3>
            <p className="text-xl md:text-2xl text-warm-700 mb-12 md:mb-16 text-center font-casual max-w-3xl mx-auto">
              Your Blueprint to a Radically Honest & Empowered Life.
            </p>

            <div className="max-w-3xl mx-auto space-y-12 md:space-y-16">

              <div className="flex flex-col sm:flex-row items-start group">
                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-coral-400 to-orange-500 shadow-xl mb-6 sm:mb-0 sm:mr-8 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                  <span className="text-4xl md:text-5xl font-bold text-white font-display">01</span>
                  <Heart className="absolute h-8 w-8 text-white opacity-30 group-hover:opacity-50 transition-opacity duration-300" style={{ transform: 'translate(15px, -15px)' }} />
                </div>
                <div className="flex-grow pt-2 sm:pt-4">
                  <h4 className="font-bold text-2xl md:text-3xl text-warm-800 mb-3 font-display group-hover:text-coral-600 transition-colors duration-300">Unlock Unwavering Support</h4>
                  <p className="text-warm-700 leading-relaxed text-md md:text-lg">
                    Imagine a friend who's 100% in your corner, celebrating every victory and providing unshakeable support during the tough times. That's me. Experience fierce loyalty and a commitment to <span className="font-semibold text-coral-700">your</span> growth, no matter what.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start group">
                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 shadow-xl mb-6 sm:mb-0 sm:mr-8 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                  <span className="text-4xl md:text-5xl font-bold text-white font-display">02</span>
                  <Shield className="absolute h-8 w-8 text-white opacity-30 group-hover:opacity-50 transition-opacity duration-300" style={{ transform: 'translate(15px, -15px)' }} />
                </div>
                <div className="flex-grow pt-2 sm:pt-4">
                  <h4 className="font-bold text-2xl md:text-3xl text-warm-800 mb-3 font-display group-hover:text-orange-600 transition-colors duration-300">Embrace Radical Self-Acceptance</h4>
                  <p className="text-warm-700 leading-relaxed text-md md:text-lg">
                    This is your judgment-free zone. A sanctuary where you can lay down your masks, confront your truths, and be seen for who you truly are. Discover the power of being unapologetically <span className="font-semibold text-orange-700">you</span>, vulnerabilities and all.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start group">
                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-pink-500 shadow-xl mb-6 sm:mb-0 sm:mr-8 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                  <span className="text-4xl md:text-5xl font-bold text-white font-display">03</span>
                  <MessageSquare className="absolute h-8 w-8 text-white opacity-30 group-hover:opacity-50 transition-opacity duration-300" style={{ transform: 'translate(15px, -15px)' }} />
                </div>
                <div className="flex-grow pt-2 sm:pt-4">
                  <h4 className="font-bold text-2xl md:text-3xl text-warm-800 mb-3 font-display group-hover:text-red-600 transition-colors duration-300">Achieve Crystal-Clear Breakthroughs</h4>
                  <p className="text-warm-700 leading-relaxed text-md md:text-lg">
                    Tired of vague advice that leads nowhere? Get ready for straight-to-the-point insights that cut through the confusion. Together, we'll uncover actionable steps that spark real, lasting change and propel <span className="font-semibold text-red-700">you</span> towards the life you deserve.
                  </p>
                </div>
              </div>

            </div>

            <div className="text-center mt-16 md:mt-20 pt-10 md:pt-12 border-t-2 border-warm-300">
              <p className="text-xl md:text-2xl text-warm-800 italic max-w-3xl mx-auto leading-relaxed font-casual">
                "Finally, someone who gets it. It's like having a therapist, life coach, and best friend rolled into one - except they actually understand how real life works."
              </p>
              <p className="text-md text-warm-600 mt-4 font-medium">
                - Verified User & Future Badass
              </p>
            </div>
          </div>
        </div> */}

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-warm-500 to-coral-500 rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-2xl text-white max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 font-display">
              Let's un-f*ck your emotional life.
            </h3>
            <p className="text-lg md:text-xl mb-6 md:mb-8 leading-relaxed">
              The best way to understand this friendship is to experience it. I promise you've never had a conversation quite like this before. 💫
            </p>
            <Button
              size="lg"
              className="bg-white text-warm-600 hover:bg-warm-50 px-8 py-4 text-lg md:px-12 md:py-6 md:text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate("/login", { state: { from: "register" } })}
            >
              <MessageSquare className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
              Get Started – It's Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 