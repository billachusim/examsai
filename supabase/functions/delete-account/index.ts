// Permanently deletes the signed-in user's account and all their data
// (required by Google Play and the App Store). POST {}
import { handler, json } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

Deno.serve(handler(async (req) => {
  const admin = adminClient();
  const user = await requireUser(req, admin);
  // Every user table references auth.users with on delete cascade.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw error;
  return json({ deleted: true });
}));
