import { useNavigate } from "react-router-dom";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const features = [
  "Unlimited AI tutor questions in every subject",
  "Unlimited practice with instant marking and explanations",
  "Unlimited timed CBT mock exams",
  "Progress tracking and weak-topic tips",
  "JAMB, WAEC and NECO syllabus",
];

export const Pricing = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const go = () => navigate(session ? "/payment" : "/auth", { state: session ? undefined : { showSignUp: true, from: "/payment" } });

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">Simple, Affordable Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Start free: 3 tutor questions, 20 practice questions and 1 mock exam a week. Go Premium for unlimited.
          </p>
        </div>

        <Card className="relative overflow-hidden shadow-card border-2 border-primary/20">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-bl-2xl font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Most Popular
          </div>
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl md:text-6xl font-bold text-primary">₦2,000</span>
                    <span className="text-2xl text-muted-foreground">/ 30 days</span>
                  </div>
                  <p className="text-muted-foreground">One payment, no auto-renewal.</p>
                </div>
                <div className="space-y-4">
                  <Button size="lg" className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-smooth" onClick={go}>
                    Go Premium
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Or a <span className="font-semibold text-foreground">₦500 Day Pass</span>, or{" "}
                    <span className="font-semibold text-foreground">3 months for ₦5,000</span>.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Secure payment via Flutterwave (card, transfer, USSD)</span>
                </div>
              </div>
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
      </div>
    </section>
  );
};
