import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, Phone, School, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Mode = "signin" | "signup" | "forgot";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" />
  </svg>
);

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [mode, setMode] = useState<Mode>(location.state?.showSignUp ? "signup" : "signin");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/chat";

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, from, navigate]);

  const fail = (description: string) => toast({ title: "Couldn't continue", description, variant: "destructive" });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      fail(error.message.includes("Invalid login") ? "Wrong email or password." : error.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return fail("Use at least 8 characters for your password.");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/chat`,
        data: { full_name: fullName.trim(), phone: phone.trim(), school: school.trim() },
      },
    });
    setLoading(false);
    if (error) return fail(error.message);
    if (!data.session) setCheckEmail(true);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return fail(error.message);
    toast({ title: "Check your email", description: "We sent you a link to set a new password." });
    setMode("signin");
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${from}` },
    });
    if (error) fail(error.message);
  };

  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back";
  const subtitle =
    mode === "signup"
      ? "Free to start: 3 tutor questions and 20 practice questions every day."
      : mode === "forgot"
        ? "Enter your email and we'll send you a reset link."
        : "Sign in to keep practising.";

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <Card className="p-8 max-w-md text-center space-y-4">
          <Mail className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Confirm your email</h1>
          <p className="text-muted-foreground">
            We sent a link to <span className="font-semibold">{email}</span>. Open it to finish creating your account.
          </p>
          <Button variant="outline" onClick={() => { setCheckEmail(false); setMode("signin"); }}>
            Back to sign in
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <Card className="p-6 shadow-card space-y-5">
          {mode !== "forgot" && (
            <>
              <Button type="button" variant="outline" size="lg" className="w-full gap-2" onClick={handleGoogle}>
                <GoogleIcon />
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                or use your email
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form
            onSubmit={mode === "signup" ? handleSignUp : mode === "forgot" ? handleForgot : handleSignIn}
            className="space-y-4"
          >
            {mode === "signup" && (
              <Field id="name" label="Full name" icon={User}>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" placeholder="Chiamaka Okafor" required autoComplete="name" />
              </Field>
            )}

            <Field id="email" label="Email" icon={Mail}>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="you@example.com" required autoComplete="email" />
            </Field>

            {mode !== "forgot" && (
              <Field id="password" label="Password" icon={Lock}>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </Field>
            )}

            {mode === "signup" && (
              <>
                <Field id="phone" label="WhatsApp number (optional)" icon={Phone}>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" placeholder="+234 800 000 0000" autoComplete="tel" />
                </Field>
                <Field id="school" label="School (optional)" icon={School}>
                  <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} className="pl-10" placeholder="Your secondary school" />
                </Field>
              </>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Please wait..." : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </Button>
          </form>

          {mode === "signin" && (
            <button type="button" onClick={() => setMode("forgot")} className="block mx-auto text-sm text-muted-foreground hover:text-primary">
              Forgot password?
            </button>
          )}

          <div className="text-center text-sm">
            {mode === "signup" ? (
              <button type="button" onClick={() => setMode("signin")} className="text-primary hover:underline">
                Already have an account? Sign in
              </button>
            ) : (
              <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline">
                New here? Create a free account
              </button>
            )}
          </div>

          {mode === "signup" && (
            <p className="text-xs text-center text-muted-foreground">
              Had a Faculty ID before? Sign up with the same email and we'll move your account over.
              By continuing you agree to our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

const Field = ({ id, label, icon: Icon, children }: { id: string; label: string; icon: typeof Mail; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      {children}
    </div>
  </div>
);

export default Auth;
