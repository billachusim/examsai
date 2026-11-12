import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { PaymentModal } from "@/components/chat/PaymentModal";
import { QuizRunner } from "@/components/practice/QuizRunner";
import { useMe } from "@/hooks/useAuth";
import { ApiError, callFunction, SUBJECTS, type StartResponse } from "@/lib/api";

const COUNTS = [5, 10, 20];

const Practice = () => {
  const { toast } = useToast();
  const { data: me } = useMe();
  const [subject, setSubject] = useState("english");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<StartResponse | null>(null);
  const [paywall, setPaywall] = useState<string | null>(null);

  const usage = me?.usage;
  const left = usage?.practiceLimit != null ? Math.max(0, usage.practiceLimit - usage.practiceUsed) : null;

  const start = async () => {
    setLoading(true);
    try {
      const res = await callFunction<StartResponse>("start-practice", {
        mode: "practice",
        subject,
        topic: topic.trim() || undefined,
        count,
        exam: me?.profile?.exam_target ?? "JAMB",
      });
      setSession(res);
    } catch (e) {
      if (e instanceof ApiError && e.code === "limit_reached") setPaywall(e.message);
      else toast({ title: "Couldn't start", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Practice" />
      <div className="px-4 py-6 pb-24">
        {session ? (
          <QuizRunner session={session} onDone={() => setSession(null)} />
        ) : (
          <Card className="max-w-2xl mx-auto p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Practise questions with instant marking</h2>
              <p className="text-muted-foreground">
                Pick a subject. You'll see the correct answer and an explanation for every question.
                {left != null && ` You have ${left} free questions left today.`}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <Button key={s.slug} size="sm" variant={subject === s.slug ? "default" : "outline"} onClick={() => setSubject(s.slug)}>
                    {s.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic (optional)</Label>
              <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Quadratic equations, Lexis and structure" maxLength={120} />
            </div>

            <div className="space-y-2">
              <Label>Number of questions</Label>
              <div className="flex gap-2">
                {COUNTS.map((c) => (
                  <Button key={c} size="sm" variant={count === c ? "default" : "outline"} onClick={() => setCount(c)}>
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={start} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing your questions...
                </>
              ) : (
                "Start practice"
              )}
            </Button>
          </Card>
        )}
      </div>
      <PaymentModal isOpen={!!paywall} message={paywall ?? undefined} onClose={() => setPaywall(null)} />
      <BottomNav />
    </div>
  );
};

export default Practice;
