// Server-side receipt checks for Google Play and the App Store.
import { HttpError } from "./cors.ts";

const b64url = (data: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

function pemToDer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

async function signJwt(header: Record<string, unknown>, payload: Record<string, unknown>, key: CryptoKey, alg: "RS256" | "ES256") {
  const input = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const params = alg === "RS256" ? { name: "RSASSA-PKCS1-v1_5" } : { name: "ECDSA", hash: "SHA-256" };
  const sig = await crypto.subtle.sign(params, key, new TextEncoder().encode(input));
  return `${input}.${b64url(sig)}`;
}

function decodeJwsPayload<T>(jws: string): T {
  const part = jws.split(".")[1];
  const json = atob(part.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((part.length + 3) % 4));
  return JSON.parse(json) as T;
}

// ---------------------------------------------------------------- Google Play
// Secret GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: the service-account key JSON with
// access to the app in Play Console (Users and permissions > View financial data).
async function googleAccessToken(): Promise<string> {
  const raw = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON");
  if (!raw) throw new HttpError(503, "Store purchases are not set up yet.", "store_not_configured");
  const sa = JSON.parse(raw);
  const key = await crypto.subtle.importKey(
    "pkcs8", pemToDer(sa.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"],
  );
  const now = Math.floor(Date.now() / 1000);
  const assertion = await signJwt({ alg: "RS256", typ: "JWT" }, {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }, key, "RS256");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const body = await res.json();
  if (!res.ok || !body.access_token) {
    console.error("Google token error", body);
    throw new HttpError(502, "Could not check the purchase with Google.", "store_error");
  }
  return body.access_token;
}

export async function verifyGooglePurchase(packageName: string, productId: string, purchaseToken: string) {
  const token = await googleAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}` +
    `/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Play verify error", res.status, body);
    return { valid: false, orderId: null as string | null, raw: body };
  }
  // purchaseState: 0 purchased, 1 cancelled, 2 pending.
  return { valid: body.purchaseState === 0, orderId: (body.orderId as string) ?? null, raw: body };
}

// ------------------------------------------------------------------ App Store
// Secrets: APPLE_IAP_KEY_ID, APPLE_IAP_ISSUER_ID, APPLE_IAP_PRIVATE_KEY (the .p8
// In-App Purchase key from App Store Connect > Users and Access > Integrations).
async function appleToken(bundleId: string): Promise<string> {
  const keyId = Deno.env.get("APPLE_IAP_KEY_ID");
  const issuer = Deno.env.get("APPLE_IAP_ISSUER_ID");
  const pem = Deno.env.get("APPLE_IAP_PRIVATE_KEY");
  if (!keyId || !issuer || !pem) throw new HttpError(503, "Store purchases are not set up yet.", "store_not_configured");
  const key = await crypto.subtle.importKey("pkcs8", pemToDer(pem), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  return await signJwt({ alg: "ES256", kid: keyId, typ: "JWT" }, {
    iss: issuer, iat: now, exp: now + 1800, aud: "appstoreconnect-v1", bid: bundleId,
  }, key, "ES256");
}

interface AppleTransaction {
  transactionId: string;
  originalTransactionId: string;
  bundleId: string;
  productId: string;
  revocationDate?: number;
  environment?: string;
}

export async function verifyAppleTransaction(bundleId: string, transactionId: string) {
  const jwt = await appleToken(bundleId);
  for (const host of ["https://api.storekit.itunes.apple.com", "https://api.storekit-sandbox.itunes.apple.com"]) {
    const res = await fetch(`${host}/inApps/v1/transactions/${encodeURIComponent(transactionId)}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (res.status === 404) continue; // try sandbox (TestFlight / App Review)
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.signedTransactionInfo) {
      console.error("App Store verify error", res.status, body);
      return { valid: false, tx: null as AppleTransaction | null };
    }
    // Fetched directly from Apple over TLS, so the payload can be trusted.
    const tx = decodeJwsPayload<AppleTransaction>(body.signedTransactionInfo);
    return { valid: tx.bundleId === bundleId && !tx.revocationDate, tx };
  }
  return { valid: false, tx: null };
}
