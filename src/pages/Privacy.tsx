import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Home</Button>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated 12 November 2026</p>
        <div className="space-y-4 text-foreground/90 leading-relaxed">
          <p>ExamsAi is run by Tech Faculty. This policy explains what we collect when you use the ExamsAi website and apps, and why.</p>
          <h2 className="text-xl font-semibold">What we collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account details: your name, email address, and, if you choose to give them, your WhatsApp number and school.</li>
            <li>Study activity: questions you ask the AI tutor, the tutor's answers, practice and mock exam answers, and scores.</li>
            <li>Payments: the plan you bought, the amount and the payment reference. Card and bank details are handled by Flutterwave, Google Play or the App Store, never by us.</li>
          </ul>
          <h2 className="text-xl font-semibold">How we use it</h2>
          <p>To run your account, answer your questions, mark your practice, show your progress and the leaderboard (first name and school only), and confirm payments. We don't sell your data or use it for advertising.</p>
          <h2 className="text-xl font-semibold">AI processing</h2>
          <p>Your tutor questions are sent to an AI model provider to generate answers. Don't include personal information in your questions.</p>
          <h2 className="text-xl font-semibold">Keeping and deleting your data</h2>
          <p>We keep your data while your account is open. You can delete your account and all its data at any time from your Profile page, or by following the steps on our <a className="text-primary hover:underline" href="/delete-account">account deletion page</a>.</p>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>Questions about privacy: <a className="text-primary hover:underline" href="mailto:thetechfaculty@gmail.com">thetechfaculty@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
