import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  LogOut,
  Settings,
  Home,
  Users,
} from "lucide-react";
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

const ChatHeader = ({
  className,
  onPersonaSelect,
  currentPersona,
}: ChatHeaderProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, credits, monthlyResets } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <>
      <header
        className={cn(
          "w-full py-3 px-4 bg-transparent border-b border-orange-200/30",
          className
        )}
      >
        <div className="mx-auto flex items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Select Persona"
            >
              <Users size={22} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-orange-200/50">
                <img
                  src={`/${currentPersona.id}.png`}
                  alt={currentPersona.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-semibold text-gray-800">
                  {currentPersona.name}
                </h1>
                <span className="text-xs text-orange-600 flex items-center">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Online
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Go to Landing Page"
            >
              <Home className="h-5 w-5" />
            </Button>
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-gray-900"
                    aria-label="Open Settings"
                  >
                    <Settings className="h-5 w-5" />
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
                  <div className="px-2 py-1.5 text-sm text-muted-foreground space-y-1">
                    <p>
                      Credits: <span className="font-semibold text-primary">{credits !== null ? credits : '-'}</span>
                    </p>
                    <p>
                      Daily Resets Left: <span className="font-semibold text-primary">{monthlyResets !== null ? 6 - monthlyResets : '-'}</span>
                    </p>
                  </div>
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