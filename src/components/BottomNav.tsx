import { BookOpenCheck, Home, MessageCircle, Trophy, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV = [
  { path: "/", label: "Home", icon: Home },
  { path: "/chat", label: "Tutor", icon: MessageCircle },
  { path: "/practice", label: "Practice", icon: BookOpenCheck },
  { path: "/leaderboard", label: "Ranks", icon: Trophy },
  { path: "/profile", label: "Profile", icon: User },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-card z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-smooth ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? "scale-110" : ""} transition-smooth`} />
              <span className="text-xs font-medium">{label}</span>
              {active && <div className="absolute bottom-0 left-2 right-2 h-1 rounded-full bg-gradient-to-r from-primary to-secondary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
