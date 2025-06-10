import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, Settings, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, onSnapshot } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { name: 'Features', href: '/#features' },
  { name: 'Testimonials', href: '/#testimonials' },
  { name: 'FAQ', href: '/#faq' },
];

const Header = () => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { currentUser, credits, monthlyResets } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace(/.*#/, "");
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuState) {
      setMenuState(false);
    }
  }, [navigate]);

  return (
    <header>
      <nav
        data-state={menuState ? 'active' : 'inactive'}
        className="fixed z-50 w-full px-2 group"
      >
        <div
          className={cn(
            'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
            isScrolled && 'bg-background/50 backdrop-blur-sm max-w-4xl rounded-2xl border border-border/50 lg:px-5 shadow-md'
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between lg:w-auto">
              <Link to="/" aria-label="home" className="flex items-center space-x-2">
                {/* <Logo /> */}
                <img
                  src="/logo.png"
                  alt="logo"
                  className="h-14 w-auto transform scale-125 -my-4"
                />
              </Link>

              <div className="flex items-center lg:hidden">
                {/* <ThemeToggle /> */}
                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                  className="relative z-20 -m-2.5 ml-2 p-2.5"
                >
                  <Menu className={cn("h-6 w-6 transition-transform duration-300", menuState && "rotate-180 scale-0 opacity-0")} />
                  <X className={cn("absolute inset-0 m-auto h-6 w-6 transition-transform duration-300", !menuState && "rotate-180 scale-0 opacity-0")} />
                </button>
              </div>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {/* <ThemeToggle /> */}
              {currentUser ? (
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
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate("/login", { state: { from: 'login' } })}>
                    Login
                  </Button>
                  <Button size="sm" onClick={() => navigate("/login", { state: { from: 'register' } })}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {menuState && (
          <div className="mt-2 lg:hidden">
            <div className="bg-background/95 backdrop-blur-md rounded-xl border border-border/50 shadow-xl p-6 mx-2 space-y-4">
              <ul className="space-y-4 text-base">
                {menuItems.map((item) => (
                  <li key={item.name + "-mobile"}>
                    <Link
                      to={item.href}
                      onClick={(e) => {
                        handleNavClick(e, item.href);
                        setMenuState(false);
                      }}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150 py-2"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <hr className="border-border/50" />
              {currentUser ? (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col space-y-1 px-1 mb-3">
                    <p className="text-sm font-medium leading-none">
                      {currentUser.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                  <hr className="border-border/50" />
                  <div className="px-1 py-1.5 text-sm text-muted-foreground space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Credits:</span>
                      <span className="font-semibold text-primary">{credits !== null ? credits : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Daily Resets Left:</span>
                      <span className="font-semibold text-primary">{monthlyResets !== null ? 6 - monthlyResets : '-'}</span>
                    </div>
                  </div>
                  <hr className="border-border/50" />
                  <Button variant="outline" className="w-full justify-start" onClick={() => { navigate("/dashboard"); setMenuState(false); }}>
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <Button className="w-full" onClick={() => { navigate("/login", { state: { from: 'login' } }); setMenuState(false); }}>Sign In</Button>
                  <Button variant="outline" className="w-full" onClick={() => { navigate("/login", { state: { from: 'register' } }); setMenuState(false); }}>Sign Up</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
