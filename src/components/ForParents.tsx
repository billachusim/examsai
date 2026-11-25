import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const reasons = [
  {
    icon: Clock,
    title: "Help at any hour",
    text: "Your child can ask about any JAMB, WAEC, NECO or NABTEB topic at night or on weekends, when lesson teachers are not around.",
  },
  {
    icon: CheckCircle2,
    title: "Every answer is marked and explained",
    text: "Practice questions are marked straight away, with a short explanation of the right answer, so mistakes are fixed before the real exam.",
  },
  {
    icon: LineChart,
    title: "You can see the progress",
    text: "Scores and weak topics are saved on the profile page, so you can sit with your child and see what needs more work.",
  },
  {
    icon: ShieldCheck,
    title: "No surprise charges",
    text: "Every plan is a single payment through Flutterwave. Nothing renews on its own.",
  },
];

export const ForParents = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const start = () =>
    navigate(session ? "/chat" : "/auth", { state: session ? undefined : { showSignUp: true } });

  return (
    <section id="parents" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">For parents</p>
          <h2 className="text-3xl md:text-5xl font-bold">A private exam tutor for less than a lesson</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try it free with your child today. If it helps, a Day Pass is ₦500 and a full month is ₦2,000.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {reasons.map((r) => (
            <Card key={r.title} className="p-6 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <r.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{r.title}</h3>
                <p className="text-muted-foreground">{r.text}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 md:p-8 border-2 border-primary/20 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-primary mb-3">See an example: JAMB Mathematics</p>
          <p className="font-medium mb-4">Solve for x: 2x + 5 = 17</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-sm">
            <div className="rounded-lg border px-3 py-2">A. 5</div>
            <div className="rounded-lg border-2 border-primary bg-primary/5 px-3 py-2 font-semibold">B. 6</div>
            <div className="rounded-lg border px-3 py-2">C. 7</div>
            <div className="rounded-lg border px-3 py-2">D. 11</div>
          </div>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Correct: B.</span> Take 5 from both sides to get 2x = 12,
            then divide both sides by 2 to get x = 6. Check: 2 × 6 + 5 = 17.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            This is how every practice answer is explained. The AI tutor can then go through any step your child does not understand.
          </p>
        </Card>

        <div className="text-center mt-10">
          <Button size="lg" className="text-lg px-8 py-6" onClick={start}>
            Try it free with your child
          </Button>
        </div>
      </div>
    </section>
  );
};
