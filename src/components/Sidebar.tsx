import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 w-full md:w-[400px] bg-sidebar border-r transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
        } z-50`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Select Persona</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-sidebar-foreground hover:text-sidebar-foreground/80"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Raze Persona Card */}
            <div className="bg-sidebar-accent rounded-lg p-4 cursor-pointer hover:bg-sidebar-accent/80 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl text-primary-foreground">R</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-sidebar-accent-foreground">Raze</h3>
                  <p className="text-sm text-sidebar-accent-foreground/70">Powered by ChatGPT</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-sidebar-accent-foreground/70 uppercase">About</h4>
                <p className="text-sm text-sidebar-accent-foreground">
                  Raze is an AI assistant powered by ChatGPT. It excels at creative writing, coding assistance,
                  and engaging in natural conversations with a touch of personality.
                </p>
              </div>
            </div>

            {/* Rayna Persona Card */}
            <div className="bg-sidebar-accent rounded-lg p-4 cursor-pointer hover:bg-sidebar-accent/80 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl text-primary-foreground">R</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-sidebar-accent-foreground">Rayna</h3>
                  <p className="text-sm text-sidebar-accent-foreground/70">Powered by Claude</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-sidebar-accent-foreground/70 uppercase">About</h4>
                <p className="text-sm text-sidebar-accent-foreground">
                  Rayna is an AI assistant powered by Claude 3.5 Sonnet. She specializes in analytical thinking,
                  detailed explanations, and providing comprehensive, well-structured responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 