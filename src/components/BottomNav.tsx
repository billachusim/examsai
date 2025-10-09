import { Home, MessageCircle, Trophy, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("home");
  
  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/" },
    { id: "profile", label: "Profile", icon: User, path: "/" },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-card z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActive(item.id);
                navigate(item.path);
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-smooth ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "scale-110" : ""} transition-smooth`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary mx-auto" 
                     style={{ width: `${100 / navItems.length}%`, left: `${(navItems.findIndex(i => i.id === item.id) * 100) / navItems.length}%` }} 
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
