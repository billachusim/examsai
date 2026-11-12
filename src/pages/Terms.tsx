import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Home</Button>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated 12 November 2026</p>
        <div className="space-y-4 text-foreground/90 leading-relaxed">
          <p>ExamsAi is run by Tech Faculty. By using the ExamsAi website or apps you agree to these terms.</p>
          <h2 className="text-xl font-semibold">Your account</h2>
          <p>Keep your sign-in details private. You're responsible for activity on your account. Under-13s should use ExamsAi with a parent or guardian.</p>
          <h2 className="text-xl font-semibold">Study help, not official results</h2>
          <p>ExamsAi is a study aid. Practice questions are written by AI in the style of JAMB, WAEC and NECO; they are not past papers and not official exam content. AI answers can be wrong, so check important facts with your teacher or textbook. ExamsAi is not affiliated with JAMB, WAEC or NECO.</p>
          <h2 className="text-xl font-semibold">Free use and Premium</h2>
          <p>Free accounts have daily limits. Premium passes (Day Pass, 30-Day Pass and others shown in the app) remove those limits for the period you buy. Passes don't renew automatically. Purchases on the website are processed by Flutterwave; purchases in the apps are processed by Google Play or the App Store under their refund rules. If you paid and Premium didn't start, contact us and we'll fix it.</p>
          <h2 className="text-xl font-semibold">Fair use</h2>
          <p>Don't misuse the service: no cheating in real exams, no attempts to break or overload ExamsAi, and no abusive or illegal content in the tutor. We may suspend accounts that do.</p>
          <h2 className="text-xl font-semibold">Changes and ending</h2>
          <p>We may update ExamsAi and these terms; we'll show the date of the latest version here. You can stop using ExamsAi and delete your account at any time (see the <a className="text-primary hover:underline" href="/delete-account">account deletion page</a>). Our <a className="text-primary hover:underline" href="/privacy">Privacy Policy</a> explains how we handle your data.</p>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p><a className="text-primary hover:underline" href="mailto:thetechfaculty@gmail.com">thetechfaculty@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
