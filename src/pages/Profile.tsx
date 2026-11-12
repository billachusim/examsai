import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpenCheck, CheckCircle, Crown, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { backendClient } from "@/lib/backendClient";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { FullPageSpinner } from "@/components/RequireAuth";
import { useAuth, useMe } from "@/hooks/useAuth";
import { callFunction } from "@/lib/api";

const EXAMS = ["JAMB", "WAEC", "NECO"] as const;

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { data: me, isLoading, error } = useMe();
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [phone, setPhone] = useState("");
  const [exam, setExam] = useState<(typeof EXAMS)[number]>("JAMB");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (me?.profile) {
      setFullName(me.profile.full_name ?? "");
      setSchool(me.profile.school ?? "");
      setPhone(me.profile.phone ?? "");
      setExam(me.profile.exam_target ?? "JAMB");
    }
  }, [me?.profile]);

  if (isLoading) return <FullPageSpinner label="Loading profile..." />;
  if (error || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 text-center space-y-3">
          <p>We couldn't load your profile.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["me"] })}>Try again</Button>
        </Card>
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    const { error: err } = await backendClient
      .from("profiles")
      .update({ full_name: fullName.trim(), school: school.trim() || null, phone: phone.trim() || null, exam_target: exam })
      .eq("id", me.user.id);
    setSaving(false);
    if (err) toast({ title: "Couldn't save", description: err.message, variant: "destructive" });
    else {
      toast({ title: "Saved" });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await callFunction("delete-account");
      await signOut();
      toast({ title: "Account deleted", description: "Your account and data have been removed." });
      navigate("/", { replace: true });
    } catch (e) {
      toast({ title: "Couldn't delete", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const totalAnswered = me.progress.reduce((n, p) => n + p.answered, 0);
  const totalCorrect = me.progress.reduce((n, p) => n + p.correct, 0);
  const accuracy = totalAnswered ? Math.round((100 * totalCorrect) / totalAnswered) : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="My Profile" />
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
        <Card className="p-6 text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-3xl font-bold text-white">
            {(me.profile?.full_name || me.user.email || "S").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{me.profile?.full_name || "Student"}</h2>
            <p className="text-muted-foreground">{me.user.email}</p>
          </div>
          {me.profile?.faculty_id && (
            <p className="text-sm text-muted-foreground">
              Student ID: <span className="font-mono font-semibold text-primary">{me.profile.faculty_id}</span>
            </p>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Plan</h3>
            <Badge className={me.premium.active ? "bg-green-600 text-white" : ""} variant={me.premium.active ? "default" : "outline"}>
              {me.premium.active ? "Premium" : "Free"}
            </Badge>
          </div>
          {me.premium.active ? (
            <p className="text-muted-foreground">
              {me.premium.expiresAt
                ? `Premium until ${new Date(me.premium.expiresAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}.`
                : "Premium active."}
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">
                Today: {me.usage.tutorUsed}/{me.usage.tutorLimit} tutor questions, {me.usage.practiceUsed}/{me.usage.practiceLimit} practice questions.
              </p>
              <Button onClick={() => navigate("/payment")} className="w-full"><Crown className="h-4 w-4 mr-2" />Go Premium</Button>
            </>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat icon={BookOpenCheck} label="Questions answered" value={String(totalAnswered)} />
          <Stat icon={CheckCircle} label="Accuracy" value={`${accuracy}%`} />
          <Stat icon={MessageCircle} label="Tutor questions today" value={String(me.usage.tutorUsed)} />
        </div>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Progress by subject</h3>
          {me.progress.length === 0 ? (
            <p className="text-muted-foreground">
              No practice yet. <button className="text-primary hover:underline" onClick={() => navigate("/practice")}>Start a practice session</button> to see your progress.
            </p>
          ) : (
            me.progress.map((p) => (
              <div key={p.subject} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.correct}/{p.answered} · {p.accuracy}%</span>
                </div>
                <Progress value={p.accuracy} />
                {p.weakTopics.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Work on: {p.weakTopics.map((t) => `${t.topic} (${t.accuracy}%)`).join(", ")}
                  </p>
                )}
              </div>
            ))
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Your details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="fn">Full name</Label><Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="sc">School</Label><Input id="sc" value={school} onChange={(e) => setSchool(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="ph">WhatsApp number</Label><Input id="ph" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Main exam</Label>
              <div className="flex gap-2">
                {EXAMS.map((x) => (
                  <Button key={x} type="button" size="sm" variant={exam === x ? "default" : "outline"} onClick={() => setExam(x)}>{x}</Button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        </Card>

        <Card className="p-6 space-y-3">
          <Button variant="outline" className="w-full" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4 mr-2" />Sign out
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive">Delete my account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes your account, chats, scores and any remaining Premium time. It can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? "Deleting..." : "Delete permanently"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: typeof CheckCircle; label: string; value: string }) => (
  <Card className="p-5 flex items-center gap-3">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Icon className="h-6 w-6 text-primary" /></div>
    <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>
  </Card>
);

export default Profile;
