import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, IdCard, User, Mail, Phone, School, MessageCircle } from "lucide-react";
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
      if (facultyId.trim()) {
        localStorage.setItem("facultyId", facultyId);
        localStorage.setItem("isLoggedIn", "true");
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

      // Store signup data temporarily
      const signupData = {
        name,
        email,
        phoneNumber,
        school,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem("tempUserInfo", JSON.stringify(signupData));
      setShowSuccessModal(true);

      toast({
        title: "Success!",
        description: "Request your Faculty ID via WhatsApp",
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

  const handleRequestFacultyId = () => {
    const userInfo = JSON.parse(localStorage.getItem("tempUserInfo") || "{}");
    const message = encodeURIComponent(
      `Hi, I'd like to register for Tech Faculty.\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `WhatsApp: ${phoneNumber}\n` +
      `School: ${school || 'Not specified'}\n\n` +
      `Please onboard me and provide my Faculty ID.`
    );
    window.open(`https://wa.me/2348068597140?text=${message}`, "_blank");
    handleModalClose();
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
              Request your Faculty ID to complete your registration
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <p className="text-muted-foreground mb-4">
                Click the button below to send us your information via WhatsApp. 
                We'll onboard you properly and provide your Faculty ID.
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={handleRequestFacultyId}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Request Faculty ID via WhatsApp
              </Button>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 We'll respond quickly with your Faculty ID which you'll use to login and access all features.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Auth;
