import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserFacultyId, setCurrentUserFacultyId] = useState<string | null>(null);

  useEffect(() => {
    const facultyId = localStorage.getItem("facultyId");
    setCurrentUserFacultyId(facultyId);
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, school, total_questions_asked, total_correct_answers, faculty_id")
        .eq("activated", true)
        .gt("total_questions_asked", 0)
        .order("total_correct_answers", { ascending: false })
        .limit(10);

      if (!error && data) {
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      case 1:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
      case 2:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
            <h1 className="text-xl font-bold">Leaderboard</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Top Performers</h2>
          <p className="text-muted-foreground">Students ranked by total correct answers</p>
        </div>

        {leaderboard.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
            <p className="text-muted-foreground">Be the first to start learning and climb the leaderboard!</p>
            <Button 
              onClick={() => navigate("/chat")}
              className="mt-6"
            >
              Start Learning
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((user, index) => {
              const isCurrentUser = user.faculty_id === currentUserFacultyId;
              const accuracy = calculateAccuracy(user.total_correct_answers, user.total_questions_asked);
              
              return (
                <Card 
                  key={user.faculty_id}
                  className={`p-4 transition-all hover:shadow-md ${
                    isCurrentUser ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {user.name.split(" ")[0]}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.school}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRankBadgeColor(index)}`}>
                        {accuracy}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user.total_correct_answers}/{user.total_questions_asked} correct
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Trophy className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">How Rankings Work</p>
              <p className="text-muted-foreground">
                Students are ranked by their accuracy rate (correct answers ÷ total questions). 
                Keep practicing to climb the leaderboard!
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default Leaderboard;
