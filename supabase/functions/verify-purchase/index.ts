// Verifies a Google Play or App Store purchase and grants Premium once.
// POST { platform: "android", productId, purchaseToken }
// POST { platform: "ios", productId, transactionId }
import { handler, HttpError, json, readJson } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";
import { PLANS, STORE_PRODUCTS } from "../_shared/config.ts";
import { verifyAppleTransaction, verifyGooglePurchase } from "../_shared/stores.ts";

const ANDROID_PACKAGE = Deno.env.get("ANDROID_PACKAGE_NAME") ?? "com.techfaculty.examsai";
const IOS_BUNDLE_ID = Deno.env.get("IOS_BUNDLE_ID") ?? "com.techfaculty.examsai";

Deno.serve(handler(async (req) => {
  const admin = adminClient();
  const user = await requireUser(req, admin);
  const body = await readJson<{ platform?: string; productId?: string; purchaseToken?: string; transactionId?: string }>(req);

  const productId = String(body.productId ?? "");
  const planId = STORE_PRODUCTS[productId];
  if (!planId) throw new HttpError(400, "Unknown product.", "bad_product");
  const plan = PLANS[planId];

  let provider: "google_play" | "app_store";
  let reference: string;
  let raw: unknown;

  if (body.platform === "android") {
    if (!body.purchaseToken) throw new HttpError(400, "Missing purchase token.", "bad_request");
    provider = "google_play";
    reference = body.purchaseToken;
    const r = await verifyGooglePurchase(ANDROID_PACKAGE, productId, body.purchaseToken);
    if (!r.valid) throw new HttpError(402, "Google Play hasn't confirmed this purchase yet.", "purchase_invalid");
    raw = r.raw;
  } else if (body.platform === "ios") {
    if (!body.transactionId) throw new HttpError(400, "Missing transaction.", "bad_request");
    provider = "app_store";
    const r = await verifyAppleTransaction(IOS_BUNDLE_ID, body.transactionId);
    if (!r.valid || !r.tx || r.tx.productId !== productId) {
      throw new HttpError(402, "The App Store hasn't confirmed this purchase.", "purchase_invalid");
    }
    reference = r.tx.transactionId;
    raw = r.tx;
  } else {
    throw new HttpError(400, "Unknown platform.", "bad_request");
  }

  // One grant per store transaction, even if the app retries.
  const { data: inserted, error: insErr } = await admin.from("payments").upsert({
    user_id: user.id,
    provider,
    reference,
    plan: planId,
    status: "successful",
    raw,
  }, { onConflict: "provider,reference", ignoreDuplicates: true }).select("id");
  if (insErr) throw insErr;

  if (!inserted || inserted.length === 0) {
    const { data: existing } = await admin.from("payments").select("user_id").eq("provider", provider)
      .eq("reference", reference).maybeSingle();
    if (existing && existing.user_id !== user.id) {
      throw new HttpError(409, "This purchase belongs to another account.", "purchase_other_account");
    }
    const { data: ent } = await admin.from("entitlements").select("expires_at").eq("user_id", user.id).maybeSingle();
    return json({ granted: true, alreadyProcessed: true, expiresAt: ent?.expires_at ?? null });
  }

  const { data: expiresAt, error } = await admin.rpc("grant_premium", {
    uid: user.id, p_plan: planId, p_days: plan.days, p_source: provider,
  });
  if (error) throw error;
  return json({ granted: true, alreadyProcessed: false, expiresAt });
}));
