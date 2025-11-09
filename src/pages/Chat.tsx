import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Home, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentModal } from "@/components/chat/PaymentModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Subject = "English" | "Mathematics" | "Physics" | "Chemistry" | "Biology" | 
  "Government" | "Economics" | "Literature" | "Commerce" | "CRS/IRS" | "Geography";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUBJECTS: Subject[] = [
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Government",
  "Economics",
  "Literature",
  "Commerce",
  "CRS/IRS",
  "Geography",
];

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<Subject>("English");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [questionsToday, setQuestionsToday] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const facultyId = localStorage.getItem("facultyId");
    if (!facultyId) {
      navigate("/auth");
      return;
    }
    loadProfile(facultyId);
  }, [navigate]);

  useEffect(() => {
    // Initial greeting when subject changes
    setMessages([
      {
        role: "assistant",
        content: `Welcome! 🎓 I'm your AI tutor for ${selectedSubject}. Ask me anything about this subject, and I'll help you prepare for your exams!`,
      },
    ]);
  }, [selectedSubject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadProfile = async (facultyId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("faculty_id", facultyId)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Failed to load profile.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setProfile(data);
      setQuestionsToday(data.questions_asked_today || 0);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Check if user can ask questions
    if (!profile?.has_paid && questionsToday >= 3) {
      setShowPaymentModal(true);
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(async () => {
      const aiResponse = generateResponse(input, selectedSubject);
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);

      // Update question count
      if (!profile?.has_paid) {
        const newCount = questionsToday + 1;
        setQuestionsToday(newCount);

        // Update in database
        await supabase
          .from("profiles")
          .update({ 
            questions_asked_today: newCount,
            total_questions_asked: (profile?.total_questions_asked || 0) + 1,
            last_activity: new Date().toISOString()
          })
          .eq("faculty_id", profile?.faculty_id);

        if (newCount >= 3) {
          setTimeout(() => setShowPaymentModal(true), 2000);
        }
      } else {
        // Update total questions for paid users
        await supabase
          .from("profiles")
          .update({ 
            total_questions_asked: (profile?.total_questions_asked || 0) + 1,
            last_activity: new Date().toISOString()
          })
          .eq("faculty_id", profile?.faculty_id);
      }

      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("facultyId");
    localStorage.removeItem("userName");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const questionsLimit = profile?.has_paid ? "Unlimited" : `${questionsToday}/3`;
  const getBadgeColor = () => {
    if (profile?.has_paid) return "default";
    if (questionsToday >= 3) return "destructive";
    if (questionsToday >= 2) return "secondary";
    return "outline";
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="md:hidden"
            >
              <Home className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="hidden md:flex gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
            <h1 className="text-lg font-bold ml-2">JAMB AI Tutor</h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge 
              variant={getBadgeColor()}
              className={
                profile?.has_paid 
                  ? "bg-green-600 hover:bg-green-700" 
                  : questionsToday >= 3 
                    ? "" 
                    : questionsToday >= 2 
                      ? "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                      : ""
              }
            >
              {questionsLimit} today
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {profile?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Subject Chips */}
      <div className="border-b bg-card">
        <div className="overflow-x-auto">
          <div className="flex gap-2 p-3 max-w-6xl mx-auto">
            {SUBJECTS.map((subject) => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject)}
                className="whitespace-nowrap flex-shrink-0"
              >
                {subject}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-soft ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-primary to-secondary text-white rounded-br-none"
                    : "bg-card border rounded-bl-none"
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
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
            placeholder={`Ask about ${selectedSubject}...`}
            className="min-h-[44px] max-h-32 resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="h-11 w-11 rounded-full shrink-0"
            disabled={loading}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        {!profile?.has_paid && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {questionsToday}/3 free questions used today
          </p>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />

      {/* Bottom spacing for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
};

// Simulated AI response generator
function generateResponse(input: string, subject: Subject): string {
  return `Great question about ${subject}! Let me explain:\n\n${input} is an important topic. Here are the key points you need to know:\n\n1. Understanding the fundamentals\n2. Common exam patterns\n3. Practice applications\n\nWould you like me to give you a practice question on this topic?`;
}

export default Chat;
