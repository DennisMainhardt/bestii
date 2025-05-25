import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { ArrowLeft, Home, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Persona } from "@/types/persona";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  className?: string;
  onPersonaSelect: (persona: Persona) => void;
  currentPersona: Persona;
}

const ChatHeader = ({ className, onPersonaSelect, currentPersona }: ChatHeaderProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <>
      <header className={cn("w-full py-2.5 px-4 bg-[#202C33] dark:bg-[#202C33] light:bg-[#008069] border-b border-[#313d45] light:border-[#016d5a] sticky top-0 z-10", className)}>
        <div className="mx-auto flex items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 text-white opacity-80 hover:opacity-100 md:hidden"
              aria-label="Open menu"
            >
              <ArrowLeft size={22} />
            </button>
            <Button
              variant="ghost"
              onClick={() => setIsSidebarOpen(true)}
              className="text-white hover:bg-[#313d45] hover:text-white hidden md:flex items-center gap-2"
            >
              <ArrowLeft size={22} />
              Change Persona
            </Button>
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm">
              <img
                src={`/public/${currentPersona.id}.png`}
                alt={currentPersona.name}
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-medium">{currentPersona.name}</h1>
              <span className="text-[#8696A0] text-xs">online</span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-[#313d45] hover:text-white hidden md:flex items-center justify-center"
            >
              <Home className="h-5 w-5" />
            </Button>
            <ThemeToggle isInChat />
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-[#313d45] hover:text-white">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser.displayName || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectPersona={onPersonaSelect}
        currentPersona={currentPersona}
      />
    </>
  );
};

export default ChatHeader; 