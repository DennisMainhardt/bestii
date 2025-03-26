import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">AI Chat</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection('features')}
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            How it Works
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            FAQ
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={() => navigate("/login")}>
            Try the Chatbot
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
