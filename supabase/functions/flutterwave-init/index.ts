// Starts a Flutterwave checkout. POST { plan: "day" | "monthly" | "quarter", redirectUrl? }
// -> { link, txRef }. The amount comes from the server, never the client.
import { handler, HttpError, json, readJson } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";
import { PLANS, type PlanId } from "../_shared/config.ts";
import { flwFetch } from "../_shared/flutterwave.ts";

const DEFAULT_SITE = Deno.env.get("EXAMSAI_SITE_URL") ?? "https://examsai.lovable.app";

Deno.serve(handler(async (req) => {
  const admin = adminClient();
  const user = await requireUser(req, admin);
  const body = await readJson<{ plan?: string; redirectUrl?: string }>(req);

  const planId = String(body.plan ?? "") as PlanId;
  const plan = PLANS[planId];
  if (!plan) throw new HttpError(400, "Pick a plan.", "bad_plan");

  // Only allow redirects back to our own site (or the app's deep link scheme).
  let redirectUrl = `${DEFAULT_SITE}/payment/callback`;
  if (body.redirectUrl) {
    try {
      const u = new URL(body.redirectUrl);
      const allowed = u.protocol === "examsai:" || u.hostname.endsWith("examsai.ng") ||
        u.hostname.endsWith(".lovable.app") || u.hostname === "localhost";
      if (allowed) redirectUrl = u.toString();
    } catch { /* keep default */ }
  }

  const { data: profile } = await admin.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
  const txRef = `examsai-${planId}-${crypto.randomUUID()}`;

  const { error: insErr } = await admin.from("payments").insert({
    user_id: user.id,
    provider: "flutterwave",
    reference: txRef,
    plan: planId,
    amount: plan.priceNgn,
    currency: "NGN",
  });
  if (insErr) throw insErr;

  const res = await flwFetch("/payments", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: txRef,
      amount: plan.priceNgn,
      currency: "NGN",
      redirect_url: redirectUrl,
      customer: {
        email: user.email,
        name: profile?.full_name || undefined,
        phonenumber: profile?.phone || undefined,
      },
      customizations: { title: `ExamsAi Premium: ${plan.name}`, description: `${plan.days} day(s) of ExamsAi Premium` },
      meta: { user_id: user.id, plan: planId },
    }),
  });

  const link = res.body?.data?.link;
  if (!res.ok || !link) {
    console.error("Flutterwave init failed", res.status, res.body);
    throw new HttpError(502, "Could not start payment. Please try again.", "payment_init_failed");
  }
  return json({ link, txRef });
}));
