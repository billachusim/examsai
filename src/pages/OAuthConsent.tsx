import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Details = {
  client?: { name?: string; client_name?: string };
  redirect_uri?: string;
  scope?: string;
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
};
type Result = { data: Details | null; error: { message: string } | null };
const oauth = supabase.auth.oauth as unknown as {
  getAuthorizationDetails: (id: string) => Promise<Result>;
  approveAuthorization: (id: string) => Promise<Result>;
  denyAuthorization: (id: string) => Promise<Result>;
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<Details | null>(null);
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    setDetails(null);
    (async () => {
      try {
        if (!id) throw new Error("This connection link is incomplete. Start again from your assistant.");
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!active) return;
        if (!data.session) {
          navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)}`, { replace: true });
          return;
        }
        setAccount(data.session.user.email ?? "Your account");
        const result = await oauth.getAuthorizationDetails(id);
        if (!active) return;
        if (result.error) throw new Error(result.error.message);
        const target = result.data?.redirect_url ?? result.data?.redirect_to;
        if (target && !result.data?.client) { window.location.assign(target); return; }
        if (!result.data?.client) throw new Error("This connection request is invalid or expired. Start again from your assistant.");
        setDetails(result.data);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Couldn't load the connection request.");
      }
    })();
    return () => { active = false; };
  }, [id, navigate, retry]);
  const decide = async (approve: boolean) => {
    setBusy(true);
    setError("");
    try {
      const result = approve ? await oauth.approveAuthorization(id) : await oauth.denyAuthorization(id);
      if (result.error) throw new Error(result.error.message);
      const target = result.data?.redirect_url ?? result.data?.redirect_to;
      if (!target) throw new Error("Couldn't return to your assistant. Please try again.");
      window.location.assign(target);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't complete your decision.");
      setBusy(false);
    }
  };
  const name = details?.client?.name ?? details?.client?.client_name ?? "your assistant";
  const scopes = details?.scopes ?? details?.scope?.split(" ").filter(Boolean) ?? [];
  return <main className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-lg p-6 space-y-5">
      <h1 className="text-2xl font-bold">Connect {details ? name : "your assistant"} to ExamsNG</h1>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {!details ? <>
        {!error && <p className="text-muted-foreground">Loading connection request…</p>}
        {error && <Button variant="outline" onClick={() => setRetry(v => v + 1)}>Try again</Button>}
      </> : <>
        <p className="text-muted-foreground">Signed in as {account}</p>
        {details.redirect_uri && <p className="text-sm break-all">Return to: {details.redirect_uri}</p>}
        <p>This lets {name} use this app as you.</p>
        <p>Read exam subjects and your study profile. Your study profile may be unavailable until account migration is complete.</p>
        {scopes.length > 0 && <ul className="list-disc pl-5 text-sm">{scopes.map(scope => <li key={scope}>{scope === "openid" || scope === "profile" ? "Share your basic profile" : scope === "email" ? "Share your email address" : `Additional permission requested: ${scope}`}</li>)}</ul>}
        <p className="text-sm text-muted-foreground">This does not bypass your account permissions or data protection.</p>
        <div className="flex gap-3"><Button disabled={busy} onClick={() => decide(true)}>Approve connection</Button><Button variant="outline" disabled={busy} onClick={() => decide(false)}>Cancel connection</Button></div>
        <Button variant="ghost" disabled={busy} onClick={async () => { await supabase.auth.signOut(); navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true }); }}>Use another account</Button>
      </>}
    </Card>
  </main>;
}