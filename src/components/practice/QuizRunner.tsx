import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, ChevronRight, Flag, Timer, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { callFunction, subjectName, type StartResponse, type SubmitResponse } from "@/lib/api";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.max(0, Math.floor(s % 60));
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const QuizRunner = ({ session, onDone }: { session: StartResponse; onDone: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [remaining, setRemaining] = useState<number | null>(session.timeLimitSeconds);
  const submittedRef = useRef(false);

  const q = session.questions[index];
  const answeredCount = Object.keys(answers).length;

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await callFunction<SubmitResponse>("submit-attempt", {
        attemptId: session.attemptId,
        answers: Object.entries(answers).map(([questionId, chosen]) => ({ questionId, chosen })),
      });
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      window.scrollTo({ top: 0 });
    } catch (e) {
      submittedRef.current = false;
      toast({ title: "Couldn't submit", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }, [answers, session.attemptId, queryClient, toast]);

  // Mock exam timer, based on the server's start time.
  useEffect(() => {
    if (!session.timeLimitSeconds || result) return;
    const end = new Date(session.startedAt).getTime() + session.timeLimitSeconds * 1000;
    const tick = () => {
      const left = Math.round((end - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) submit();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session, result, submit]);

  if (result) return <Results result={result} onDone={onDone} />;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {index + 1} of {session.questions.length} · {subjectName(q.subject)}
          {q.topic ? ` · ${q.topic}` : ""}
        </span>
        {remaining != null && (
          <span className={`flex items-center gap-1 font-semibold ${remaining < 60 ? "text-destructive" : "text-foreground"}`}>
            <Timer className="h-4 w-4" />
            {formatTime(remaining)}
          </span>
        )}
      </div>
      <Progress value={(answeredCount / session.questions.length) * 100} />

      <Card className="p-5 md:p-6 space-y-5">
        <p className="text-base md:text-lg font-medium whitespace-pre-wrap">{q.stem}</p>
        <div className="space-y-2">
          {q.options.map((o) => {
            const selected = answers[q.id] === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.key }))}
                className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors flex gap-3 ${
                  selected ? "border-primary bg-primary/15 font-semibold" : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-bold">{o.key}.</span>
                <span>{o.text}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {index < session.questions.length - 1 ? (
          <Button onClick={() => setIndex((i) => i + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Marking..." : `Submit (${answeredCount}/${session.questions.length} answered)`}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {session.questions.map((qq, i) => (
          <button
            key={qq.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-8 w-8 rounded-md text-xs font-semibold border ${
              i === index ? "border-primary ring-2 ring-primary/30" : ""
            } ${answers[qq.id] ? "bg-primary text-primary-foreground" : "bg-card"}`}
            aria-label={`Go to question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {index < session.questions.length - 1 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={submit} disabled={submitting}>
            Submit now
          </Button>
        </div>
      )}
    </div>
  );
};

const Results = ({ result, onDone }: { result: SubmitResponse; onDone: () => void }) => {
  const { toast } = useToast();
  const [reported, setReported] = useState<Set<string>>(new Set());
  const pct = result.total ? Math.round((100 * result.score) / result.total) : 0;
  const message = useMemo(() => {
    if (pct >= 80) return "Excellent work!";
    if (pct >= 60) return "Good job. Review the ones you missed.";
    if (pct >= 40) return "You're getting there. Read the explanations below.";
    return "Keep going. Every explanation you read moves your score up.";
  }, [pct]);

  const report = async (questionId: string) => {
    try {
      await callFunction("report-question", { questionId, reason: "student_report" });
      setReported((s) => new Set(s).add(questionId));
      toast({ title: "Thanks for reporting", description: "We'll review this question." });
    } catch (e) {
      toast({ title: "Couldn't report", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card className="p-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Your score</p>
        <p className="text-5xl font-bold text-primary">
          {result.score}/{result.total}
        </p>
        <p className="font-medium">{pct}% · {message}</p>
        {result.late && <p className="text-sm text-destructive">Time ran out before you submitted, so answers weren't counted.</p>}
        {result.bySubject.length > 1 && (
          <div className="grid grid-cols-2 gap-2 pt-3 text-sm">
            {result.bySubject.map((s) => (
              <div key={s.subject} className="rounded-lg bg-muted p-2">
                <span className="font-semibold">{s.name}</span>: {s.correct}/{s.total}
              </div>
            ))}
          </div>
        )}
        <div className="pt-3">
          <Button onClick={onDone}>Start another</Button>
        </div>
      </Card>

      {result.results.map((r, i) => (
        <Card key={r.questionId} className="p-5 space-y-3">
          <div className="flex items-start gap-2">
            {r.isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            )}
            <p className="font-medium whitespace-pre-wrap">
              {i + 1}. {r.stem}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            {r.options.map((o) => (
              <div
                key={o.key}
                className={`rounded-lg px-3 py-2 ${
                  o.key === r.answer
                    ? "bg-green-600/10 border border-green-600/40"
                    : o.key === r.chosen
                      ? "bg-destructive/10 border border-destructive/40"
                      : ""
                }`}
              >
                <span className="font-bold">{o.key}.</span> {o.text}
                {o.key === r.answer && <span className="ml-2 text-green-700 dark:text-green-400 font-semibold">Correct answer</span>}
                {o.key === r.chosen && o.key !== r.answer && <span className="ml-2 text-destructive font-semibold">Your answer</span>}
              </div>
            ))}
            {!r.chosen && <p className="text-muted-foreground">Not answered</p>}
          </div>
          {r.explanation && <p className="text-sm bg-muted rounded-lg p-3 whitespace-pre-wrap">{r.explanation}</p>}
          <button
            type="button"
            onClick={() => report(r.questionId)}
            disabled={reported.has(r.questionId)}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 disabled:opacity-50"
          >
            <Flag className="h-3 w-3" /> {reported.has(r.questionId) ? "Reported" : "Report a problem with this question"}
          </button>
        </Card>
      ))}
    </div>
  );
};
