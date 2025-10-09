import { BookOpen, Brain, Target } from "lucide-react";
import { Subject, ChatMode } from "@/pages/Chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const subjects: Subject[] = [
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Government",
  "Economics",
  "Literature",
  "Commerce",
  "CRS/IRS",
  "Geography",
];

const modes: { value: ChatMode; label: string; icon: any }[] = [
  { value: "learn", label: "Learn Mode", icon: Brain },
  { value: "test", label: "Test Mode", icon: BookOpen },
  { value: "mock", label: "Mock Exam", icon: Target },
];

interface ChatSidebarProps {
  isOpen: boolean;
  selectedSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  chatMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export const ChatSidebar = ({
  isOpen,
  selectedSubject,
  onSelectSubject,
  chatMode,
  onModeChange,
}: ChatSidebarProps) => {
  return (
    <aside
      className={cn(
        "w-64 border-r bg-card flex-shrink-0 transition-all duration-300 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-0"
      )}
    >
      <div className="p-4 space-y-6">
        {/* Mode Toggles */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Mode
          </p>
          {modes.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={chatMode === value ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onModeChange(value)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Subjects
          </p>
          {subjects.map((subject) => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? "secondary" : "ghost"}
              className="w-full justify-start text-sm"
              onClick={() => onSelectSubject(subject)}
            >
              {subject}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
};
