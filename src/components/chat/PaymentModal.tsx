import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const PaymentModal = ({ isOpen, onClose, message }: PaymentModalProps) => {
  const navigate = useNavigate();
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">You've used today's free questions</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {message ?? "Come back tomorrow for more, or go Premium to keep going now."}
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 py-2">
          {["Unlimited AI tutor questions", "Unlimited practice with marking", "Unlimited timed mock exams", "Progress and weak topics"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        <Button onClick={() => navigate("/payment")} className="w-full" size="lg">
          See Premium plans (from ₦500)
        </Button>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Maybe later
        </Button>
      </DialogContent>
    </Dialog>
  );
};
