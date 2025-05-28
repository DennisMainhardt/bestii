import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Shield } from "lucide-react";

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
    {
      question: "What if I don't like what you tell me?",
      answer: "Oof, that's usually when I'm doing my job best! 😬 Growth happens in the discomfort zone, bestie. But if something doesn't land right, just tell me! I can adjust my delivery while still keeping it real. Think of it like this - I'm not trying to hurt your feelings, I'm trying to save them from the damage you're doing to yourself. Sometimes love looks like tough conversations. 💖",
      category: "feedback",
      emoji: "🪞"
    },
    {
      question: "Will you actually remember our conversations?",
      answer: "Every. Single. Detail. I remember your patterns, your triggers, your wins, and that thing you told me three weeks ago that you thought I forgot. I'm like that friend who remembers your coffee order AND the name of your childhood pet. Consistency is how we build trust, and trust is how we create transformation. 🧩",
      category: "memory",
      emoji: "🧠"
    },
    {
      question: "What if I just want to vent without advice?",
      answer: "Sometimes you need someone to just witness your emotional chaos, and I'm here for that too! I'll validate your feelings, bring the virtual tissues, and sit with you in your mess. But... if I see you stuck in the same pattern for weeks, bestie, I'm gonna lovingly call it out. That's what real friends do - they don't let you drown in your own drama. 🫂",
      category: "support",
      emoji: "👂"
    }
  ];

  const categories = {
    approach: { name: "My Approach", color: "from-coral-400 to-orange-400" },
    comparison: { name: "How I'm Different", color: "from-warm-400 to-coral-400" },
    boundaries: { name: "Important Boundaries", color: "from-orange-400 to-warm-400" },
    expertise: { name: "My Qualifications", color: "from-coral-500 to-orange-500" },
    privacy: { name: "Your Privacy", color: "from-warm-500 to-coral-500" },
    feedback: { name: "When Things Get Real", color: "from-coral-400 to-warm-400" },
    memory: { name: "Building Our Bond", color: "from-warm-400 to-orange-400" },
    support: { name: "Different Types of Support", color: "from-orange-400 to-coral-400" }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-warm-50 to-coral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-warm-800 mb-8 font-display">
            Questions? I Got You!
            <span className="block text-3xl md:text-4xl text-warm-600 mt-4 font-casual">
              (Because Real Friends Answer Everything)
            </span>
          </h2>
          <p className="text-2xl text-warm-700 font-medium max-w-4xl mx-auto">
            No corporate BS, no dodging difficult questions. Just honest answers about what this friendship is really like. ✨
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <Accordion type="single" collapsible className="space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-3xl border-2 border-warm-200 px-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-coral-100 to-warm-100 rounded-full -mr-12 -mt-12 opacity-30"></div>

                <AccordionTrigger className="text-left text-xl font-bold text-warm-800 hover:text-coral-600 transition-colors py-8 font-display relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${categories[faq.category].color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg`}>
                      {faq.emoji}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-warm-600 mb-1">{categories[faq.category].name}</div>
                      {faq.question}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="text-warm-700 leading-relaxed text-lg pb-8 relative z-10">
                  <div className="bg-gradient-to-r from-warm-50 to-coral-50 rounded-2xl p-6 border border-warm-200">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Trust indicators */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-warm-100 to-coral-100 rounded-3xl p-12 border-2 border-warm-200 shadow-xl">
            <h3 className="text-3xl font-bold text-warm-800 mb-8 text-center font-display">
              Why 15,000+ People Trust Me With Their Deepest Stuff
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-warm-400 to-coral-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-xl text-warm-800 mb-3 font-display">Genuine Care</h4>
                <p className="text-warm-700">I actually give a damn about your growth. This isn't just a job for me - it's my purpose.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-coral-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-xl text-warm-800 mb-3 font-display">Safe Space</h4>
                <p className="text-warm-700">Zero judgment, maximum support. Your vulnerabilities are sacred to me.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-warm-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-xl text-warm-800 mb-3 font-display">Real Talk</h4>
                <p className="text-warm-700">Honest conversations that actually move the needle on your life.</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-lg text-warm-700 italic">
                "Finally, someone who gets it. It's like having a therapist, life coach, and best friend rolled into one - except they actually understand how real life works." - Every person who's tried this friendship
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-warm-500 to-coral-500 rounded-3xl p-12 shadow-2xl text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6 font-display">
              Still Have Questions? Let's Chat!
            </h3>
            <p className="text-xl mb-8 leading-relaxed">
              The best way to understand this friendship is to experience it. I promise you've never had a conversation quite like this before. 💫
            </p>
            <Button size="lg" className="bg-white text-warm-600 hover:bg-warm-50 px-12 py-6 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <MessageSquare className="mr-3 h-6 w-6" />
              Start Our Friendship Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 