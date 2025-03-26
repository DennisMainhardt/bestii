import { Button } from "@/components/ui/button";
import { X, Home } from "lucide-react";
import { Persona } from "@/types/persona";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (persona: Persona) => void;
  currentPersona: Persona;
}

const personas: Persona[] = [
  {
    id: "raze",
    name: "Raze",
    model: "ChatGPT",
    description: "Raze is an AI assistant powered by ChatGPT. It excels at creative writing, coding assistance, and engaging in natural conversations with a touch of personality."
  },
  {
    id: "rayna",
    name: "Rayna",
    model: "Claude",
    description: "Rayna is an AI assistant powered by Claude 3.7. She specializes in analytical thinking, detailed explanations, and providing comprehensive, well-structured responses."
  }
];

const Sidebar = ({ isOpen, onClose, onSelectPersona, currentPersona }: SidebarProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`fixed inset-y-0 left-0 w-full md:w-[400px] bg-sidebar border-r transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
        } z-50`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm">
              <img
                src={`/${currentPersona.id}.svg`}
                alt={`${currentPersona.name} Profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/fallback-avatar.svg";
                }}
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-sidebar-foreground">{currentPersona.name}</h2>
              <span className="text-xs text-sidebar-foreground/70">online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="p-1 text-sidebar-foreground opacity-80 hover:opacity-100 md:hidden"
              aria-label="Go to homepage"
            >
              <Home size={22} />
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-sidebar-foreground hover:text-sidebar-foreground/80"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className="bg-sidebar-accent rounded-lg p-4 cursor-pointer hover:bg-sidebar-accent/80 transition-colors"
                onClick={() => {
                  onSelectPersona(persona);
                  onClose();
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img
                      src={`/${persona.id}.svg`}
                      alt={`${persona.name} Profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/fallback-avatar.svg";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-sidebar-accent-foreground">{persona.name}</h3>
                    <p className="text-sm text-sidebar-accent-foreground/70">Powered by {persona.model}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-sidebar-accent-foreground/70 uppercase">About</h4>
                  <p className="text-sm text-sidebar-accent-foreground">{persona.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 