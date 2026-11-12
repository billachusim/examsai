// Lets a student flag a wrong or unclear question they have answered.
// POST { questionId, reason? }. Questions with 3+ flags stop being served.
import { handler, HttpError, json, readJson } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

Deno.serve(handler(async (req) => {
  const admin = adminClient();
  const user = await requireUser(req, admin);
  const body = await readJson<{ questionId?: string; reason?: string }>(req);
  const questionId = String(body.questionId ?? "");

  const { data: answered } = await admin.from("attempt_answers").select("question_id")
    .eq("user_id", user.id).eq("question_id", questionId).limit(1);
  if (!answered || answered.length === 0) throw new HttpError(400, "You can only report questions you've answered.", "bad_request");

  const { error } = await admin.rpc("report_question", {
    p_question_id: questionId,
    p_user_id: user.id,
    p_reason: String(body.reason ?? "").slice(0, 500),
  });
  if (error) throw error;
  return json({ ok: true });
}));
