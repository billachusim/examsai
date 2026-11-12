import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2.74.0";
import { HttpError } from "./cors.ts";

export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Returns the signed-in user from the request's bearer token, or throws 401. */
export async function requireUser(req: Request, admin: SupabaseClient): Promise<User> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new HttpError(401, "Please sign in.", "unauthenticated");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) throw new HttpError(401, "Please sign in again.", "unauthenticated");
  return data.user;
}

export async function isPremium(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await admin.rpc("is_premium", { uid: userId });
  if (error) throw error;
  return data === true;
}

/** Consumes daily allowance; throws 402 with code "limit_reached" when used up. */
export async function consumeUsage(
  admin: SupabaseClient,
  userId: string,
  kind: "tutor" | "practice",
  amount: number,
  limit: number,
): Promise<number> {
  const { data, error } = await admin.rpc("consume_usage", {
    uid: userId,
    p_kind: kind,
    p_amount: amount,
    p_limit: limit,
  });
  if (error) throw error;
  if (data === -1) {
    throw new HttpError(
      402,
      kind === "tutor"
        ? "You've used today's free tutor questions. Go Premium for unlimited help."
        : "You've used today's free practice questions. Go Premium for unlimited practice.",
      "limit_reached",
    );
  }
  return data as number;
}
