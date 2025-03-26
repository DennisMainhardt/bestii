import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Brain, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your AI Therapy Companion
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience compassionate, direct, and insightful conversations with an AI therapist that adapts to your needs.
          </p>
          <Button size="lg" className="px-8 py-6 text-lg" onClick={() => navigate("/login")}>
            Try the Chatbot
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-muted/50">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our AI Chatbot?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-card border">
              <MessageSquare className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Empathetic</h3>
              <p className="text-muted-foreground">Always here to listen and support you through your journey</p>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <Brain className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Direct</h3>
              <p className="text-muted-foreground">Straightforward guidance without sugar-coating</p>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <Sparkles className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Adaptive</h3>
              <p className="text-muted-foreground">Personalizes responses based on your communication style</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Sign In</h3>
              <p className="text-muted-foreground">Quick and secure authentication with your Google account</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Chatting</h3>
              <p className="text-muted-foreground">Begin your conversation with our AI therapist</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Learns</h3>
              <p className="text-muted-foreground">The AI adapts and remembers your conversation style</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 bg-muted/50">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-lg font-semibold mb-2">Is my conversation private?</h3>
              <p className="text-muted-foreground">Yes, all conversations are encrypted and private. We never share your data with third parties.</p>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-lg font-semibold mb-2">How does the AI adapt to my needs?</h3>
              <p className="text-muted-foreground">Our AI analyzes your communication style and emotional patterns to provide personalized responses and support.</p>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-lg font-semibold mb-2">Can I use this alongside traditional therapy?</h3>
              <p className="text-muted-foreground">Yes, our chatbot can be a helpful supplement to traditional therapy, but it's not a replacement for professional mental health care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 AI Chat. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</a>
            <a href="https://github.com/DennisMainhardt/modern-chatbot" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 