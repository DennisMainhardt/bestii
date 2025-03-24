
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("w-full py-2.5 px-4 bg-[#202C33] dark:bg-[#202C33] light:bg-[#008069] border-b border-[#313d45] light:border-[#016d5a] sticky top-0 z-10", className)}>
      <div className="mx-auto flex items-center">
        <div className="flex items-center gap-4">
          <button className="p-1 text-white opacity-80 hover:opacity-100">
            <ArrowLeft size={22} />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00A884] to-[#00A884] flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-medium">AI</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-medium">Therapy Assistant</h1>
            <span className="text-[#8696A0] text-xs">online</span>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-xs px-2.5 py-1 rounded-full bg-[#00A884]/20 text-[#00A884] hidden sm:block">
            Listening
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
