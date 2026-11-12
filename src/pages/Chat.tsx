import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { backendClient } from "@/lib/backendClient";
import { PaymentModal } from "@/components/chat/PaymentModal";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { useMe } from "@/hooks/useAuth";
import { ApiError, callFunction, SUBJECTS, subjectName } from "@/lib/api";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "examsai.chatSubject";

const Chat = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const [subject, setSubject] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "english";
    } catch {
      return "english";
    }
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [paywall, setPaywall] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const selectSubject = (slug: string) => {
    if (typeof slug !== "string" || !SUBJECTS.some(s => s.slug === slug)) throw new Error("Unknown study subject.");
    if (sending) throw new Error("Wait for the current reply.");
    setSubject(slug);
  };
  useWebMCP({
    name: "read_tutor_view",
    description: "Read the selected subject and messages currently visible in the tutor.",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => runWebMCPTool("read_tutor_view", () => `${subject}: ${subjectName(subject)}\n${messages.length ? messages.map(m => `${m.role}: ${m.content}`).join("\n") : "Chat history is loading."}`),
  });
  useWebMCP({
    name: "select_tutor_subject",
    description: "Change the tutor to one of the available study subjects without sending a message.",
    enabled: !sending,
    inputSchema: { type: "object", properties: { subject: { type: "string", enum: SUBJECTS.map(s => s.slug), description: "Study subject slug." } }, required: ["subject"] },
    execute: ({ subject: slug }: { subject: string }) => runWebMCPTool("select_tutor_subject", () => { selectSubject(slug); return `Selected ${subjectName(slug)}.`; }),
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, subject);
    } catch {
      /* ignore */
    }
    let cancelled = false;
    backendClient
      .from("tutor_messages")
      .select("role, content, created_at")
      .eq("subject_slug", subject)
      .order("created_at", { ascending: false })
      .limit(40)
      .then(({ data }) => {
        if (cancelled) return;
        const history = (data ?? []).reverse();
        setMessages([
          {
            role: "assistant",
            content: `Hi! I'm your ${subjectName(subject)} tutor. Ask me any topic or paste a past question, and I'll explain it step by step.`,
          },
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ]);
      });
    return () => {
      cancelled = true;
    };
  }, [subject]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const usage = me?.usage;
  const left = usage?.tutorLimit != null ? Math.max(0, usage.tutorLimit - usage.tutorUsed) : null;

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    try {
      const res = await callFunction<{ reply: string }>("tutor-chat", {
        subject,
        message: text,
        exam: me?.profile?.exam_target ?? "JAMB",
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (e) {
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
      if (e instanceof ApiError && e.code === "limit_reached") {
        setPaywall(e.message);
      } else {
        toast({ title: "Not sent", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <AppHeader
        title="AI Tutor"
        right={
          <Badge variant={left === 0 ? "destructive" : "outline"} className={me?.premium.active ? "bg-green-600 text-white border-green-600" : ""}>
            {me?.premium.active ? "Premium" : left != null ? `${left} free left today` : ""}
          </Badge>
        }
      />

      <div className="border-b bg-card">
        <div className="overflow-x-auto">
          <div className="flex gap-2 p-3 max-w-6xl mx-auto">
            {SUBJECTS.map((s) => (
              <Button
                key={s.slug}
                variant={subject === s.slug ? "default" : "outline"}
                size="sm"
                onClick={() => selectSubject(s.slug)}
                disabled={sending}
                className="whitespace-nowrap flex-shrink-0"
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-soft ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-primary to-secondary text-white rounded-br-none"
                    : "bg-card border rounded-bl-none"
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap break-words">{msg.content.replace(/\*\*(.+?)\*\*/g, "$1")}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:100ms]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:200ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t bg-card p-4 pb-20 md:pb-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Ask about ${subjectName(subject)}...`}
            className="min-h-[44px] max-h-32 resize-none"
            maxLength={2000}
            disabled={sending}
          />
          <Button onClick={send} size="icon" className="h-11 w-11 rounded-full shrink-0" disabled={sending || !input.trim()} aria-label="Send">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <PaymentModal isOpen={!!paywall} message={paywall ?? undefined} onClose={() => setPaywall(null)} />
      <BottomNav />
    </div>
  );
};

export default Chat;
