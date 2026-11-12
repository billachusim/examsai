import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// Public page for the Google Play "delete account" URL requirement.
const DeleteAccountInfo = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Home</Button>
        <h1 className="text-3xl font-bold">Delete your ExamsAi account</h1>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Sign in on the ExamsAi website or app.</li>
          <li>Open <strong>Profile</strong>.</li>
          <li>Tap <strong>Delete my account</strong> and confirm.</li>
        </ol>
        <p>This permanently deletes your account, tutor chats, practice history, scores and any remaining Premium time straight away. Payment records may be kept for up to 6 years where the law requires it.</p>
        <p>Can't sign in? Email <a className="text-primary hover:underline" href="mailto:thetechfaculty@gmail.com">thetechfaculty@gmail.com</a> from your account's email address and we'll delete it within 7 days.</p>
        <Button onClick={() => navigate(session ? "/profile" : "/auth")}>{session ? "Go to my profile" : "Sign in"}</Button>
      </div>
    </div>
  );
};

export default DeleteAccountInfo;
