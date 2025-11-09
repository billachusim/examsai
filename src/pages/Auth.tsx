import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, IdCard, User, Mail, Phone, School, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Auth = () => {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedFacultyId, setGeneratedFacultyId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (location.state?.showSignUp) {
      setIsSignUp(true);
    }
  }, [location]);

  // Check if user is already logged in
  useEffect(() => {
    const facultyId = localStorage.getItem("facultyId");
    if (facultyId) {
      navigate("/chat");
    }
  }, [navigate]);

  // Login form state
  const [facultyId, setFacultyId] = useState("");

  // Sign up form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [school, setSchool] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
        title: "Success!",
        description: "You have successfully signed in.",
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!name || !email || !phoneNumber || !school) {
        toast({
          title: "Error",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Generate Faculty ID using database function
      const { data: facultyIdData, error: idError } = await supabase
        .rpc("generate_faculty_id");

      if (idError || !facultyIdData) {
        toast({
          title: "Error",
          description: "Failed to generate Faculty ID. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const newFacultyId = facultyIdData;

      // Insert into profiles table
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          faculty_id: newFacultyId,
          name,
          email,
          phone_number: phoneNumber,
          school,
          activated: false,
          has_paid: false,
        });

      if (insertError) {
        toast({
          title: "Error",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setGeneratedFacultyId(newFacultyId);
      setShowSuccessModal(true);
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

  const handleRequestFacultyId = () => {
    const message = `Hello Tech Faculty Hub!

I just signed up and need my Faculty ID activated.

Name: ${name}
Email: ${email}
Phone: ${phoneNumber}
School: ${school}
Generated Faculty ID: ${generatedFacultyId}

Please activate my account. Thank you!`;

    const whatsappUrl = `https://wa.me/2348068597140?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    
    toast({
      title: "WhatsApp Opened",
      description: "Please send the message to activate your account. You can login once activated.",
    });
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setName("");
    setEmail("");
    setPhoneNumber("");
    setSchool("");
    setIsSignUp(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp
                ? "Register to get your Faculty ID"
                : "Sign in with your Faculty ID"}
            </p>
          </div>

          <Card className="p-6 shadow-card">
            {!isSignUp ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facultyId">Faculty ID</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="facultyId"
                      type="text"
                      placeholder="FAC-12345"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="school"
                      type="text"
                      placeholder="University of Lagos"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp
                  ? "Already have a Faculty ID? Sign in"
                  : "Don't have a Faculty ID? Sign up"}
              </button>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              Registration Successful! 🎉
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              Your Faculty ID: <span className="font-mono font-bold text-primary">{generatedFacultyId}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <p className="text-muted-foreground mb-4">
                Click the button below to send us your information via WhatsApp. 
                We'll activate your account and you can then login.
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={handleRequestFacultyId}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Request Activation via WhatsApp
              </Button>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Save your Faculty ID ({generatedFacultyId}). You'll use it to login once we activate your account.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Auth;
