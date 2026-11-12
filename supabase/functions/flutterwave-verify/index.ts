// Called by the payment callback page: POST { transactionId?, txRef? }
// Re-checks the payment with Flutterwave and grants premium if it succeeded.
import { handler, HttpError, json, readJson } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";
import { confirmFlutterwavePayment } from "../_shared/flutterwave.ts";

Deno.serve(handler(async (req) => {
  const admin = adminClient();
  const user = await requireUser(req, admin);
  const body = await readJson<{ transactionId?: string; txRef?: string }>(req);

  if (body.txRef) {
    const { data: own } = await admin.from("payments").select("user_id").eq("provider", "flutterwave")
      .eq("reference", body.txRef).maybeSingle();
    if (!own || own.user_id !== user.id) throw new HttpError(404, "Payment not found.", "not_found");
  }

  const result = await confirmFlutterwavePayment(admin, { transactionId: body.transactionId, txRef: body.txRef });
  if (result.userId && result.userId !== user.id) throw new HttpError(404, "Payment not found.", "not_found");
  return json({ granted: result.granted, status: result.status, plan: result.plan ?? null, expiresAt: result.expiresAt ?? null });
}));
