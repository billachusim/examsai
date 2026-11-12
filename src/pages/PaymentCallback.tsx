import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { callFunction } from "@/lib/api";

type State = "checking" | "success" | "pending" | "failed";

const PaymentCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState<State>("checking");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    const transactionId = params.get("transaction_id");
    const txRef = params.get("tx_ref");
    const status = params.get("status");
    if (status === "cancelled") {
      setState("failed");
      return;
    }
    let tries = 0;
    const check = async () => {
      tries++;
      try {
        const res = await callFunction<{ granted: boolean; status: string; expiresAt: string | null }>("flutterwave-verify", {
          transactionId: transactionId ?? undefined,
          txRef: txRef ?? undefined,
        });
        if (res.granted) {
          setExpiresAt(res.expiresAt);
          setState("success");
          queryClient.invalidateQueries({ queryKey: ["me"] });
          return;
        }
        if (res.status === "failed") {
          setState("failed");
          return;
        }
      } catch {
        /* retry below */
      }
      if (tries < 6) setTimeout(check, 4000);
      else setState("pending");
    };
    check();
  }, [params, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="p-8 max-w-md w-full text-center space-y-4">
        {state === "checking" && (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
            <h1 className="text-2xl font-bold">Confirming your payment...</h1>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <h1 className="text-2xl font-bold">You're Premium!</h1>
            {expiresAt && <p className="text-muted-foreground">Active until {new Date(expiresAt).toLocaleString("en-NG")}.</p>}
            <Button className="w-full" onClick={() => navigate("/chat")}>Start learning</Button>
          </>
        )}
        {state === "pending" && (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Still confirming</h1>
            <p className="text-muted-foreground">Bank transfers can take a few minutes. Premium switches on automatically once Flutterwave confirms it.</p>
            <Button className="w-full" onClick={() => navigate("/profile")}>Go to my profile</Button>
          </>
        )}
        {state === "failed" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Payment not completed</h1>
            <p className="text-muted-foreground">You were not charged. You can try again any time.</p>
            <Button className="w-full" onClick={() => navigate("/payment")}>Try again</Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default PaymentCallback;
