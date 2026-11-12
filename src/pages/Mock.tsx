import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { PaymentModal } from "@/components/chat/PaymentModal";
import { QuizRunner } from "@/components/practice/QuizRunner";
import { useMe } from "@/hooks/useAuth";
import { ApiError, callFunction, SUBJECTS, type StartResponse } from "@/lib/api";

const Mock = () => {
  const { toast } = useToast();
  const { data: me } = useMe();
  const exam = me?.profile?.exam_target ?? "JAMB";
  const [subjects, setSubjects] = useState<string[]>(["english"]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<StartResponse | null>(null);
  const [paywall, setPaywall] = useState<string | null>(null);

  const toggle = (slug: string) => {
    if (exam === "JAMB" && slug === "english") return; // English is compulsory in UTME
    setSubjects((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : s.length >= 4 ? s : [...s, slug]));
  };

  const start = async () => {
    setLoading(true);
    try {
      const res = await callFunction<StartResponse>("start-practice", { mode: "mock", subjects, exam });
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
      <AppHeader title="Mock exam" />
      <div className="px-4 py-6 pb-24">
        {session ? (
          <QuizRunner session={session} onDone={() => setSession(null)} />
        ) : (
          <Card className="max-w-2xl mx-auto p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Timed CBT mock exam</h2>
              <p className="text-muted-foreground">
                Pick up to 4 subjects{exam === "JAMB" ? " (Use of English is compulsory for UTME)" : ""}. You get 10 questions per
                subject and 45 seconds per question, then a full breakdown.
                {!me?.premium.active && " Free accounts get 1 mock a week."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <Button key={s.slug} size="sm" variant={subjects.includes(s.slug) ? "default" : "outline"} onClick={() => toggle(s.slug)}>
                  {s.name}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {subjects.length}/4 subjects · {subjects.length * 10} questions · {Math.round((subjects.length * 10 * 45) / 60)} minutes
            </p>
            <Button size="lg" className="w-full" onClick={start} disabled={loading || subjects.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Setting your paper...
                </>
              ) : (
                "Start mock exam"
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

export default Mock;
