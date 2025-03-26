import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isInChat?: boolean;
}

export function ThemeToggle({ isInChat = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "rounded-full w-8 h-8 border-none bg-transparent",
        isInChat
          ? "hover:bg-[#313d45] text-white opacity-80 hover:opacity-100"
          : theme === "dark"
            ? "hover:bg-[#313d45] text-white opacity-80 hover:opacity-100"
            : "hover:bg-gray-200 text-gray-800 opacity-80 hover:opacity-100"
      )}
    >
      {theme === "dark" ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default ThemeToggle;
