
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("w-full py-5 px-6 backdrop-blur-sm bg-background/90 border-b sticky top-0 z-10", className)}>
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-medium">AI</span>
          </div>
          <h1 className="ml-3 text-lg font-medium">Therapy Assistant</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary-foreground">
            Listening
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
