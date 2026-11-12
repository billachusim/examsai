// Flutterwave webhook. Set the URL in Flutterwave > Settings > Webhooks to
//   https://<project>.supabase.co/functions/v1/flutterwave-webhook
// and the same secret hash as the FLW_WEBHOOK_HASH secret.
import { corsHeaders } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";
import { confirmFlutterwavePayment } from "../_shared/flutterwave.ts";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const expected = Deno.env.get("FLW_WEBHOOK_HASH");
  const got = req.headers.get("verif-hash") ?? "";
  if (!expected || !safeEqual(got, expected)) return new Response("unauthorized", { status: 401 });

  let payload: { event?: string; data?: { id?: number; tx_ref?: string } };
  try {
    payload = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  if (payload.event === "charge.completed" && payload.data) {
    try {
      await confirmFlutterwavePayment(adminClient(), {
        transactionId: payload.data.id ?? null,
        txRef: payload.data.tx_ref ?? null,
      });
    } catch (e) {
      console.error("Webhook processing failed", e);
      return new Response("retry", { status: 500 });
    }
  }
  return new Response("ok", { status: 200 });
});
