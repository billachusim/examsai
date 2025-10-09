import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Subject, ChatMode } from "@/pages/Chat";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  subject: Subject;
  mode: ChatMode;
  onShowPaywall: () => void;
}

const DAILY_FREE_LIMIT = 3;
const STORAGE_KEY = "jamb_ai_free_questions";
const DATE_KEY = "jamb_ai_last_date";

export const ChatWindow = ({ subject, mode, onShowPaywall }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check daily free limit
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(DATE_KEY);
    
    if (lastDate !== today) {
      localStorage.setItem(DATE_KEY, today);
      localStorage.setItem(STORAGE_KEY, "0");
      setQuestionsAsked(0);
    } else {
      const count = parseInt(localStorage.getItem(STORAGE_KEY) || "0");
      setQuestionsAsked(count);
    }

    // Initial greeting
    setMessages([
      {
        role: "assistant",
        content: `Welcome to JAMB AI! 🎓 I'm here to help you prepare for ${subject}. ${
          mode === "learn"
            ? "Ask me any topic you'd like to learn!"
            : mode === "test"
            ? "Ready for some practice questions?"
            : "Let's start a timed mock exam!"
        }`,
      },
    ]);
  }, [subject, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Check free limit
    if (questionsAsked >= DAILY_FREE_LIMIT) {
      onShowPaywall();
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = generateResponse(input, mode, subject);
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
      
      const newCount = questionsAsked + 1;
      setQuestionsAsked(newCount);
      localStorage.setItem(STORAGE_KEY, newCount.toString());

      if (newCount >= DAILY_FREE_LIMIT) {
        setTimeout(() => onShowPaywall(), 2000);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3 shadow-soft",
                msg.role === "user"
                  ? "bg-gradient-to-br from-primary to-secondary text-white rounded-br-none"
                  : "bg-card border rounded-bl-none"
              )}
            >
              <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask or answer here…"
            className="min-h-[44px] max-h-32 resize-none"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="h-11 w-11 rounded-full shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {questionsAsked}/{DAILY_FREE_LIMIT} free questions used today
        </p>
      </div>
    </div>
  );
};

// Simulated AI response generator
function generateResponse(input: string, mode: ChatMode, subject: Subject): string {
  if (mode === "test") {
    return `**Question 1:**\nWhat is the SI unit of force?\nA. Newton\nB. Joule\nC. Watt\nD. Pascal\n\n(Reply with A, B, C, or D)`;
  } else if (mode === "learn") {
    return `Great question! Let me explain ${subject} concepts clearly. ${input} relates to fundamental principles in ${subject}. Would you like me to give you a practice question on this?`;
  } else {
    return `Starting Mock Exam mode for ${subject}. You'll have 40 questions in 60 minutes. Ready? Type "start" to begin!`;
  }
}
