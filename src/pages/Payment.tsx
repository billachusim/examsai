import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const Payment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<"flutterwave" | "bank" | null>(null);
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

  const bankDetails = {
    accountName: "Tech Faculty Hub",
    accountNumber: "6402226049",
    bank: "Moniepoint"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Account details copied to clipboard",
    });
  };

  const handleConfirmPayment = () => {
    if (!profile) return;

    const message = encodeURIComponent(
      `Hello Tech Faculty Hub!\n\n` +
      `I've made a payment for premium access.\n\n` +
      `Faculty ID: ${profile.faculty_id}\n` +
      `Name: ${profile.name}\n` +
      `Email: ${profile.email}\n` +
      `Phone: ${profile.phone_number}\n` +
      `School: ${profile.school}\n` +
      `Payment Method: ${selectedMethod === "flutterwave" ? "Flutterwave" : "Bank Transfer"}\n\n` +
      `Please activate my premium access. Thank you!`
    );
    window.open(`https://wa.me/2348068597140?text=${message}`, "_blank");
    
    toast({
      title: "Redirecting to WhatsApp",
      description: "We'll confirm your payment shortly!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Complete Your Payment</h1>
          <p className="text-muted-foreground">Choose your preferred payment method</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Flutterwave Option */}
          <Card 
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedMethod === "flutterwave" 
                ? "border-primary border-2 bg-gradient-to-br from-primary/5 to-transparent" 
                : ""
            }`}
            onClick={() => setSelectedMethod("flutterwave")}
          >
            <h3 className="text-xl font-bold mb-4">Pay with Flutterwave</h3>
            <p className="text-muted-foreground mb-6">
              Secure payment via card, bank transfer, or USSD
            </p>
            <Button 
              className="w-full"
              onClick={() => window.open("https://flutterwave.com/pay/techfacultyhub", "_blank")}
              disabled={selectedMethod !== "flutterwave"}
            >
              <ExternalLink className="mr-2 w-4 h-4" />
              Pay via Flutterwave
            </Button>
          </Card>

          {/* Bank Transfer Option */}
          <Card 
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedMethod === "bank" 
                ? "border-primary border-2 bg-gradient-to-br from-primary/5 to-transparent" 
                : ""
            }`}
            onClick={() => setSelectedMethod("bank")}
          >
            <h3 className="text-xl font-bold mb-4">Bank Transfer</h3>
            <p className="text-muted-foreground mb-4">
              Transfer directly to our business account
            </p>
            <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Account Name:</span>
                <div className="flex items-center gap-2">
                  <span>{bankDetails.accountName}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(bankDetails.accountName);
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span>{bankDetails.accountNumber}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(bankDetails.accountNumber);
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Bank:</span>
                <span>{bankDetails.bank}</span>
              </div>
            </div>
          </Card>
        </div>

        {selectedMethod && (
          <Card className="p-6 bg-primary/5">
            <h3 className="text-lg font-bold mb-4">Confirm Your Payment</h3>
            <p className="text-muted-foreground mb-6">
              After making payment, click the button below to send your payment details to us on WhatsApp. 
              We'll verify and activate your account within minutes!
            </p>
            <Button 
              size="lg"
              className="w-full"
              onClick={handleConfirmPayment}
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Confirm Payment via WhatsApp
            </Button>
          </Card>
        )}

        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
