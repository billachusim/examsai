import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpenCheck, LogOut, MessageCircle, Timer, Trophy, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth, useMe } from "@/hooks/useAuth";
import type { ReactNode } from "react";

export const AppHeader = ({ title, right }: { title: string; right?: ReactNode }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: me } = useMe();
  const initial = (me?.profile?.full_name || me?.user.email || "S").charAt(0).toUpperCase();

  return (
    <div className="border-b bg-card px-4 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} aria-label="Home">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">{initial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/chat")}><MessageCircle className="mr-2 h-4 w-4" />AI Tutor</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/practice")}><BookOpenCheck className="mr-2 h-4 w-4" />Practice</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/mock")}><Timer className="mr-2 h-4 w-4" />Mock exam</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/leaderboard")}><Trophy className="mr-2 h-4 w-4" />Leaderboard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")}><UserIcon className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => { await signOut(); navigate("/"); }}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
