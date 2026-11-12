import type { SupabaseClient } from "npm:@supabase/supabase-js@2.74.0";
import { HttpError } from "./cors.ts";
import { PLANS, type PlanId } from "./config.ts";

const FLW_API = "https://api.flutterwave.com/v3";

function secretKey(): string {
  const key = Deno.env.get("FLW_SECRET_KEY");
  if (!key) throw new HttpError(503, "Online payment is not set up yet.", "payments_not_configured");
  return key;
}

export async function flwFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${FLW_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

/**
 * Verifies a Flutterwave transaction with the API (never trusting the client or
 * the webhook body), and grants premium once per reference. Idempotent.
 */
export async function confirmFlutterwavePayment(
  admin: SupabaseClient,
  ref: { transactionId?: string | number | null; txRef?: string | null },
): Promise<{ granted: boolean; status: string; plan?: PlanId; expiresAt?: string; userId?: string }> {
  let verify;
  if (ref.transactionId) {
    verify = await flwFetch(`/transactions/${encodeURIComponent(String(ref.transactionId))}/verify`);
  } else if (ref.txRef) {
    verify = await flwFetch(`/transactions/verify_by_reference?tx_ref=${encodeURIComponent(ref.txRef)}`);
  } else {
    throw new HttpError(400, "Missing payment reference.", "bad_request");
  }

  const tx = verify.body?.data;
  if (!verify.ok || !tx) return { granted: false, status: "not_found" };

  const txRef: string = tx.tx_ref;
  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("provider", "flutterwave")
    .eq("reference", txRef)
    .maybeSingle();
  if (!payment) return { granted: false, status: "unknown_reference" };

  if (payment.status === "successful") {
    const { data: ent } = await admin.from("entitlements").select("expires_at").eq("user_id", payment.user_id)
      .maybeSingle();
    return { granted: true, status: "successful", plan: payment.plan, expiresAt: ent?.expires_at, userId: payment.user_id };
  }

  const plan = PLANS[payment.plan as PlanId];
  const paidEnough = tx.status === "successful" && tx.currency === "NGN" && Number(tx.amount) >= plan.priceNgn;

  if (!paidEnough) {
    const failed = tx.status === "failed" || (tx.status === "successful" && !paidEnough);
    if (failed) {
      await admin.from("payments").update({ status: "failed", raw: tx, provider_transaction_id: String(tx.id) })
        .eq("id", payment.id);
    }
    return { granted: false, status: tx.status ?? "pending" };
  }

  // Claim the payment row first so two callers can't both grant.
  const { data: claimed } = await admin
    .from("payments")
    .update({ status: "successful", raw: tx, provider_transaction_id: String(tx.id), amount: tx.amount, currency: tx.currency })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select("id");
  if (!claimed || claimed.length === 0) {
    return { granted: true, status: "successful", plan: payment.plan, userId: payment.user_id };
  }

  const { data: expiresAt, error } = await admin.rpc("grant_premium", {
    uid: payment.user_id,
    p_plan: payment.plan,
    p_days: plan.days,
    p_source: "flutterwave",
  });
  if (error) throw error;
  return { granted: true, status: "successful", plan: payment.plan, expiresAt, userId: payment.user_id };
}
