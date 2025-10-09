import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal = ({ isOpen, onClose }: PaymentModalProps) => {
  const handlePayment = (amount: number) => {
    // Integrate Paystack here
    alert(`Payment of ₦${amount.toLocaleString()} initiated. Paystack integration needed.`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">🎓 You've used your free daily sneak peek!</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Unlock full access to JAMB AI and ace your exams with unlimited practice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Monthly Plan */}
          <div className="border-2 border-primary rounded-xl p-5 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-lg font-bold">Monthly Access</h3>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">₦2,000</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {["Unlimited questions", "Full mock exams", "Progress tracking", "All subjects"].map(
                (feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                )
              )}
            </ul>
            <Button
              onClick={() => handlePayment(2000)}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              Pay with Paystack
            </Button>
          </div>

          {/* Day Pass */}
          <div className="border rounded-xl p-4 bg-muted/30">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-semibold">Day Pass</h3>
              <span className="text-xl font-bold">₦500</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Try for 24 hours</p>
            <Button
              onClick={() => handlePayment(500)}
              variant="outline"
              className="w-full"
            >
              Get Day Pass
            </Button>
          </div>
        </div>

        <Button variant="ghost" onClick={onClose} className="w-full">
          Remind me later
        </Button>
      </DialogContent>
    </Dialog>
  );
};
