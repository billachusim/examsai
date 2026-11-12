import { useState } from "react";
import { Check, Crown, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { useMe } from "@/hooks/useAuth";
import { callFunction, type Plan } from "@/lib/api";

const FALLBACK_PLANS: Plan[] = [
  { id: "day", name: "Day Pass", priceNgn: 500, days: 1 },
  { id: "monthly", name: "Monthly", priceNgn: 2000, days: 30 },
  { id: "quarter", name: "3 Months", priceNgn: 5000, days: 90 },
];

const FEATURES = [
  "Unlimited AI tutor questions in every subject",
  "Unlimited practice with instant marking and explanations",
  "Unlimited timed CBT mock exams",
  "Progress tracking and weak-topic tips",
];

const Payment = () => {
  const { toast } = useToast();
  const { data: me } = useMe();
  const [busy, setBusy] = useState<string | null>(null);
  const plans = me?.plans ?? FALLBACK_PLANS;

  const pay = async (plan: Plan["id"]) => {
    setBusy(plan);
    try {
      const { link } = await callFunction<{ link: string }>("flutterwave-init", {
        plan,
        redirectUrl: `${window.location.origin}/payment/callback`,
      });
      window.location.href = link;
    } catch (e) {
      toast({ title: "Couldn't start payment", description: e instanceof Error ? e.message : "", variant: "destructive" });
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Go Premium" />
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
        <div className="text-center space-y-2">
          <Crown className="h-10 w-10 text-primary mx-auto" />
          <h2 className="text-3xl font-bold">ExamsAi Premium</h2>
          {me?.premium.active ? (
            <p className="text-muted-foreground">
              You're Premium until {new Date(me.premium.expiresAt!).toLocaleDateString("en-NG", { day: "numeric", month: "long" })}. Buying again adds more time.
            </p>
          ) : (
            <p className="text-muted-foreground">One payment, no auto-renewal. Your Premium starts as soon as payment is confirmed.</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <Card key={p.id} className={`p-6 space-y-4 ${p.id === "monthly" ? "border-2 border-primary shadow-card" : ""}`}>
              {p.id === "monthly" && <span className="text-xs font-semibold text-primary">Most popular</span>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p>
                <span className="text-4xl font-bold">₦{p.priceNgn.toLocaleString()}</span>
                <span className="text-muted-foreground"> / {p.days === 1 ? "24 hours" : `${p.days} days`}</span>
              </p>
              <Button className="w-full" variant={p.id === "monthly" ? "default" : "outline"} onClick={() => pay(p.id)} disabled={!!busy}>
                {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ₦${p.priceNgn.toLocaleString()}`}
              </Button>
            </Card>
          ))}
        </div>

        <Card className="p-6 space-y-3">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" />{f}</div>
          ))}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-3 border-t">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Secure checkout by Flutterwave: card, bank transfer or USSD.
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default Payment;
