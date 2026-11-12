// Marks an attempt on the server. POST { attemptId, answers: [{ questionId, chosen }] }
// Returns the score plus the correct answer and explanation for every question.
import { handler, HttpError, json, readJson } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";
import { SUBJECT_NAMES } from "../_shared/config.ts";
import { plainText, type QuestionRow } from "../_shared/questions.ts";

const GRACE_SECONDS = 90;

Deno.serve(handler(async (req) => {
  const admin = adminClient();
  const user = await requireUser(req, admin);
  const body = await readJson<{ attemptId?: string; answers?: { questionId: string; chosen: string | null }[] }>(req);

  const { data: attempt } = await admin.from("attempts").select("*").eq("id", String(body.attemptId ?? ""))
    .eq("user_id", user.id).maybeSingle();
  if (!attempt) throw new HttpError(404, "That session was not found.", "not_found");
  if (attempt.submitted_at) throw new HttpError(409, "This session was already submitted.", "already_submitted");

  const chosenById = new Map<string, string | null>();
  for (const a of body.answers ?? []) {
    if (!a || typeof a.questionId !== "string") continue;
    const c = typeof a.chosen === "string" ? a.chosen.trim().toUpperCase().charAt(0) : null;
    chosenById.set(a.questionId, c && /^[A-E]$/.test(c) ? c : null);
  }

  // Answers given after the time limit (plus grace) don't count.
  const elapsed = (Date.now() - new Date(attempt.started_at).getTime()) / 1000;
  const late = attempt.time_limit_seconds != null && elapsed > attempt.time_limit_seconds + GRACE_SECONDS;

  const { data: qs, error } = await admin.from("questions").select("*").in("id", attempt.question_ids);
  if (error) throw error;
  const byId = new Map((qs as QuestionRow[]).map((q) => [q.id, q]));

  const results = (attempt.question_ids as string[]).map((id) => {
    const q = byId.get(id);
    if (!q) return null;
    const chosen = late ? null : chosenById.get(id) ?? null;
    return { q, chosen, isCorrect: chosen === q.answer };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  const score = results.filter((r) => r.isCorrect).length;
  const submittedAt = new Date().toISOString();

  const { data: claimed, error: updErr } = await admin.from("attempts")
    .update({ submitted_at: submittedAt, score })
    .eq("id", attempt.id).is("submitted_at", null).select("id");
  if (updErr) throw updErr;
  if (!claimed || claimed.length === 0) throw new HttpError(409, "This session was already submitted.", "already_submitted");

  if (results.length) {
    const { error: insErr } = await admin.from("attempt_answers").insert(results.map((r) => ({
      attempt_id: attempt.id,
      question_id: r.q.id,
      user_id: user.id,
      subject_slug: r.q.subject_slug,
      topic: r.q.topic,
      chosen: r.chosen,
      is_correct: r.isCorrect,
    })));
    if (insErr) throw insErr;
  }

  const bySubject: Record<string, { name: string; correct: number; total: number }> = {};
  for (const r of results) {
    const s = (bySubject[r.q.subject_slug] ??= { name: SUBJECT_NAMES[r.q.subject_slug] ?? r.q.subject_slug, correct: 0, total: 0 });
    s.total++;
    if (r.isCorrect) s.correct++;
  }

  return json({
    attemptId: attempt.id,
    score,
    total: results.length,
    late,
    bySubject: Object.entries(bySubject).map(([subject, s]) => ({ subject, ...s })),
    results: results.map((r) => ({
      questionId: r.q.id,
      subject: r.q.subject_slug,
      topic: r.q.topic,
      stem: plainText(r.q.stem),
      options: r.q.options.map((o) => ({ key: o.key, text: plainText(o.text) })),
      chosen: r.chosen,
      answer: r.q.answer,
      isCorrect: r.isCorrect,
      explanation: plainText(r.q.explanation),
    })),
  });
}));
