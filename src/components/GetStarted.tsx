import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { IdCard } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const GetStarted = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [facultyId, setFacultyId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!facultyId.trim()) {
      toast({
        title: "Required",
        description: "Please enter your Faculty ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if Faculty ID exists in database
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("faculty_id", facultyId.trim())
        .single();

      if (error || !profile) {
        toast({
          title: "Error",
          description: "Invalid Faculty ID. Please check and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if account is activated
      if (!profile.activated) {
        toast({
          title: "Account Not Activated",
          description: "Please complete WhatsApp verification to activate your account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Store session
      localStorage.setItem("facultyId", facultyId);
      localStorage.setItem("userName", profile.name);
      
      toast({
        title: "Welcome back!",
        description: "Redirecting to chat...",
      });
      
      navigate("/chat");
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="get-started" className="py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Start? 🚀
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students acing their exams with AI
          </p>
        </div>
        
        <Card className="p-8 shadow-card border-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="faculty-id">Faculty ID</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="faculty-id"
                  type="text"
                  placeholder="FAC-12345"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-smooth"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In with Faculty ID"}
            </Button>
            
            <div className="text-center">
              <button
                onClick={() => navigate("/auth", { state: { showSignUp: true } })}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Don't have a Faculty ID? <span className="font-semibold">Sign up here</span>
              </button>
            </div>
            
            <p className="text-center text-sm text-muted-foreground pt-4 border-t">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms</a> and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
