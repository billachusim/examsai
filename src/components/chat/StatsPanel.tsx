import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface StatsPanelProps {
  onUpgrade: () => void;
}

export const StatsPanel = ({ onUpgrade }: StatsPanelProps) => {
  return (
    <aside className="hidden lg:block w-64 border-l bg-card p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Stats Header */}
        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Your Progress
          </h3>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
          <StatCard label="Questions Today" value="3" total="3" />
          <StatCard label="Correct Answers" value="2" total="3" />
          <StatCard label="Accuracy" value="67%" />
          <StatCard label="Subjects Practiced" value="1" />
        </div>

        {/* Progress Ring */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Daily Goal</p>
          <Progress value={100} className="mb-2" />
          <p className="text-xs font-medium">3/3 questions completed 🎯</p>
        </div>

        {/* Upgrade CTA */}
        <Button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          Upgrade for Full Access
        </Button>
      </div>
    </aside>
  );
};

const StatCard = ({ label, value, total }: { label: string; value: string; total?: string }) => (
  <div className="bg-muted/30 rounded-lg p-3">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-bold text-foreground">
      {value}
      {total && <span className="text-sm text-muted-foreground">/{total}</span>}
    </p>
  </div>
);
