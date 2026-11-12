import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award, Medal, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { backendClient, type LeaderboardRow } from "@/lib/backendClient";
import { BottomNav } from "@/components/BottomNav";

const rankIcon = (i: number) =>
  i === 0 ? <Trophy className="h-6 w-6 text-yellow-500" /> :
  i === 1 ? <Medal className="h-6 w-6 text-gray-400" /> :
  i === 2 ? <Award className="h-6 w-6 text-amber-600" /> :
  <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>;

const Leaderboard = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backendClient.rpc("get_leaderboard", { p_limit: 20 }).then(({ data }) => {
      setRows(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2"><ArrowLeft className="h-4 w-4" />Home</Button>
          <h1 className="text-xl font-bold">Leaderboard</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Top students this month</h2>
          <p className="text-muted-foreground">Ranked by correct answers in practice and mock exams over the last 30 days (minimum 10 answered).</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
        ) : rows.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
            <p className="text-muted-foreground">Answer 10 practice questions to get on the board.</p>
            <Button onClick={() => navigate("/practice")} className="mt-6">Start practising</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((r, i) => (
              <Card key={i} className={`p-4 ${r.is_me ? "ring-2 ring-primary" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center">{rankIcon(i)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {r.first_name}
                      {r.is_me && <Badge variant="outline" className="ml-2 text-xs">You</Badge>}
                    </h3>
                    {r.school && <p className="text-sm text-muted-foreground truncate">{r.school}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{r.correct} correct</p>
                    <p className="text-xs text-muted-foreground">{r.accuracy}% of {r.answered}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Leaderboard;
