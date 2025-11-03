import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, IdCard, User, Mail, Phone, School } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedFacultyId, setGeneratedFacultyId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

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
      // TODO: Verify faculty ID with backend when ready
      // For now, just simulate login
      if (facultyId.trim()) {
        localStorage.setItem("facultyId", facultyId);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        navigate("/chat");
      } else {
        throw new Error("Please enter your Faculty ID");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
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
      // Validate inputs
      if (!name || !email || !phoneNumber) {
        throw new Error("Please fill in all required fields");
      }

      // TODO: Save to backend and send notifications when ready
      // For now, generate a mock Faculty ID
      const newFacultyId = `FAC-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Store signup data temporarily
      const signupData = {
        facultyId: newFacultyId,
        name,
        email,
        phoneNumber,
        school,
        createdAt: new Date().toISOString(),
      };
      
      console.log("Signup data to be saved:", signupData);
      
      setGeneratedFacultyId(newFacultyId);
      setShowSuccessModal(true);

      toast({
        title: "Success!",
        description: "Your Faculty ID has been generated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Sign up failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Reset form
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
                  <Label htmlFor="school">School (Optional)</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="school"
                      type="text"
                      placeholder="University of Lagos"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="pl-10"
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
              Your Faculty ID has been generated. Please save it for future logins.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Your Faculty ID</p>
              <p className="text-3xl font-bold text-primary tracking-wider">
                {generatedFacultyId}
              </p>
            </div>
            <div className="text-sm text-center text-muted-foreground space-y-2">
              <p>✅ Confirmation email sent to {email}</p>
              <p>✅ WhatsApp notification sent to {phoneNumber}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedFacultyId);
                toast({
                  title: "Copied!",
                  description: "Faculty ID copied to clipboard",
                });
              }}
              variant="outline"
            >
              Copy Faculty ID
            </Button>
            <Button onClick={handleModalClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Auth;
