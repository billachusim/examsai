import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const Payment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<"flutterwave" | "bank" | null>(null);

  const userInfo = JSON.parse(localStorage.getItem("tempUserInfo") || "{}");
  const facultyId = localStorage.getItem("pendingFacultyId") || "";

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
    const message = encodeURIComponent(
      `Hi, I've made a payment for Tech Faculty subscription.\n\n` +
      `Name: ${userInfo.name}\n` +
      `Email: ${userInfo.email}\n` +
      `Phone: ${userInfo.phone}\n` +
      `School: ${userInfo.school}\n` +
      `Faculty ID: ${facultyId}\n\n` +
      `Please confirm my payment and activate my account.`
    );
    window.open(`https://wa.me/2348068597140?text=${message}`, "_blank");
    
    toast({
      title: "Redirecting to WhatsApp",
      description: "We'll confirm your payment shortly!",
    });
  };

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
              selectedMethod === "flutterwave" ? "border-primary border-2" : ""
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
              selectedMethod === "bank" ? "border-primary border-2" : ""
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
