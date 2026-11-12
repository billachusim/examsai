import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const GetStarted = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <section id="get-started" className="py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">Ready to Start?</h2>
          <p className="text-lg text-muted-foreground">Create a free account in under a minute.</p>
        </div>
        <Card className="p-8 shadow-card border-2 space-y-4">
          {session ? (
            <Button size="lg" className="w-full text-lg py-6" onClick={() => navigate("/chat")}>Continue learning</Button>
          ) : (
            <>
              <Button size="lg" className="w-full text-lg py-6" onClick={() => navigate("/auth", { state: { showSignUp: true } })}>
                Create free account
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                I already have an account
              </Button>
            </>
          )}
          <p className="text-center text-sm text-muted-foreground pt-4 border-t">
            By continuing, you agree to our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </Card>
      </div>
    </section>
  );
};
