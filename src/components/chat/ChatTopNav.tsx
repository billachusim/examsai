import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatTopNavProps {
  onToggleSidebar: () => void;
}

export const ChatTopNav = ({ onToggleSidebar }: ChatTopNavProps) => {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg md:text-xl font-bold text-primary">Exams.ng</h1>
      </div>

      <h2 className="hidden md:block text-sm font-medium text-muted-foreground">
        JAMB AI — Your Smart Exam Coach
      </h2>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
              U
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>My Stats</DropdownMenuItem>
          <DropdownMenuItem>Subscription Status</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
