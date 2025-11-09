import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogOut, Trophy, MessageCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const facultyId = localStorage.getItem("facultyId");
    if (!facultyId) {
      navigate("/auth");
      return;
    }

    loadProfile(facultyId);
  }, [navigate]);

  const loadProfile = async (facultyId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("faculty_id", facultyId)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Failed to load profile.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("facultyId");
    localStorage.removeItem("userName");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const calculateAccuracy = () => {
    if (!profile || profile.total_questions_asked === 0) return 0;
    return Math.round((profile.total_correct_answers / profile.total_questions_asked) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const questionsLimit = profile?.has_paid ? "Unlimited" : "3/day";
  const questionsToday = profile?.questions_asked_today || 0;
  const maxDaily = profile?.has_paid ? "∞" : 3;

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
            <h1 className="text-xl font-bold">My Profile</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Faculty ID Card */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-3xl font-bold text-white">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.name}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
            <div className="inline-block bg-muted px-6 py-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Faculty ID</p>
              <p className="text-2xl font-mono font-bold text-primary">{profile?.faculty_id}</p>
            </div>
          </div>
        </Card>

        {/* Subscription Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Subscription Status</h3>
            <Badge 
              className={
                profile?.has_paid 
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-500" 
                  : "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
              }
            >
              {profile?.has_paid ? "Premium" : "Free"}
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">School</span>
              <span className="font-medium">{profile?.school}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Daily Question Limit</span>
              <span className="font-medium">{questionsLimit}</span>
            </div>
            {!profile?.has_paid && (
              <Button 
                onClick={() => navigate("/payment")}
                className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                Upgrade to Premium
              </Button>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions Today</p>
                <p className="text-2xl font-bold">{questionsToday}/{maxDaily}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{profile?.total_questions_asked || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{calculateAccuracy()}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Phone Number</span>
              <span className="font-medium">{profile?.phone_number}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">
                {new Date(profile?.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Last Activity</span>
              <span className="font-medium">
                {new Date(profile?.last_activity).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default Profile;
