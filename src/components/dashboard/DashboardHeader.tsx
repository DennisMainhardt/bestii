import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Settings, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardHeader = () => {
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
    <header className="fixed z-50 w-full px-2">
      <div className="mx-auto mt-2 max-w-6xl px-6 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-md">
        <div className="relative flex items-center justify-between py-3">
          <Link to="/" aria-label="home" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="logo"
              className="h-14 w-auto transform scale-125 -my-4"
            />
          </Link>

          <div className="flex items-center gap-3">
            {currentUser && (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}>
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Go to Chat</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <UserIcon className="h-5 w-5" />
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 