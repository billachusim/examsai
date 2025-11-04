import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Zap, IdCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const features = [
  "Unlimited chat with AI for all exams",
  "Access to 10,000+ past questions (JAMB, WAEC, NECO, NABTEB)",
  "Real-time answer marking",
  "Progress tracking & analytics",
  "Study reminders & tips",
  "WhatsApp support"
];

export const Pricing = () => {
  const [showFacultyIdDialog, setShowFacultyIdDialog] = useState(false);
  const [facultyId, setFacultyId] = useState("");
  const [planType, setPlanType] = useState<"monthly" | "day">("monthly");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePaymentClick = (type: "monthly" | "day") => {
    setPlanType(type);
    setShowFacultyIdDialog(true);
  };

  const handleFacultyIdSubmit = () => {
    if (!facultyId.trim()) {
      toast({
        title: "Required",
        description: "Please enter your Faculty ID",
        variant: "destructive",
      });
      return;
    }

    const storedFacultyId = localStorage.getItem("facultyId");
    
    if (storedFacultyId === facultyId || facultyId.startsWith("FAC-")) {
      // Store pending faculty ID and redirect to payment page
      localStorage.setItem("pendingFacultyId", facultyId);
      toast({
        title: "Verified!",
        description: "Redirecting to payment options...",
      });
      setShowFacultyIdDialog(false);
      navigate("/payment");
    } else {
      toast({
        title: "Invalid Faculty ID",
        description: "Please check your Faculty ID and try again. Don't have one? Sign up first.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            Simple, Affordable Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Less than the price of one lesson. More value than 100 textbooks! 📚
          </p>
        </div>
        
        <Card className="relative overflow-hidden shadow-card border-2 border-primary/20">
          {/* Popular badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-bl-2xl font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Most Popular
          </div>
          
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Pricing Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl md:text-6xl font-bold text-primary">₦2,000</span>
                    <span className="text-2xl text-muted-foreground">/ month</span>
                  </div>
                  <p className="text-muted-foreground">Unlimited Practice & Chat Access</p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-smooth"
                    onClick={() => handlePaymentClick("monthly")}
                  >
                    Pay & Start Now
                  </Button>
                  
                  <button
                    onClick={() => handlePaymentClick("day")}
                    className="text-center text-sm text-muted-foreground hover:text-primary transition-colors w-full"
                  >
                    Or get a <span className="font-semibold text-secondary">₦500 Day Pass</span> to try it out
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Secure payment via Paystack</span>
                </div>
              </div>
              
              {/* Features List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-6">Everything you need to succeed:</h3>
                
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        
        <p className="text-center text-muted-foreground mt-8">
          🎉 Special Launch Offer: First 1,000 students get <span className="font-semibold text-primary">3 months for ₦5,000</span>
        </p>
      </div>

      <Dialog open={showFacultyIdDialog} onOpenChange={setShowFacultyIdDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Faculty ID</DialogTitle>
            <DialogDescription>
              Please enter your Faculty ID to proceed with payment.
              Don't have one?{" "}
              <button
                onClick={() => {
                  setShowFacultyIdDialog(false);
                  navigate("/auth");
                }}
                className="text-primary hover:underline"
              >
                Sign up here
              </button>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-faculty-id">Faculty ID</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payment-faculty-id"
                  type="text"
                  placeholder="FAC-12345"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleFacultyIdSubmit()}
                />
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-semibold">
                {planType === "monthly" ? "Monthly Plan: ₦2,000" : "Day Pass: ₦500"}
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Secure payment via Paystack
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFacultyIdDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleFacultyIdSubmit} className="flex-1">
              Continue to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
    </>
  );
};
