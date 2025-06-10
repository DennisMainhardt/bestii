import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, CreditCard, Shield } from 'lucide-react'; // Example icons

interface DashboardNavProps {
  activeSection: 'profile' | 'subscription'; // Add more sections as needed
  setActiveSection: (section: 'profile' | 'subscription') => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({ activeSection, setActiveSection }) => {
  const navItems = [
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      id: 'subscription',
      label: 'Subscription & Billing',
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    // Add more navigation items here, e.g., for security settings
    // {
    //   id: 'security',
    //   label: 'Security & Login',
    //   icon: <Shield className="mr-2 h-4 w-4" />,
    // },
  ];

  return (
    <aside className="w-full md:w-64 md:pr-8">
      <nav className="flex flex-row md:flex-col gap-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-center md:justify-start",
              activeSection === item.id ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => setActiveSection(item.id as 'profile' | 'subscription')}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardNav; 