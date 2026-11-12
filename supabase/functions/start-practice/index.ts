// Starts a practice session or a mock exam and returns questions WITHOUT answers.
// POST { mode: "practice", subject, topic?, count?, exam? }
// POST { mode: "mock", subjects: string[], exam? }
import { handler, HttpError, json, readJson } from "../_shared/cors.ts";
import { adminClient, consumeUsage, isPremium, requireUser } from "../_shared/supabase.ts";
import {
  FREE_PRACTICE_PER_DAY,
  MOCK_QUESTIONS_PER_SUBJECT,
  MOCK_SECONDS_PER_QUESTION,
  PRACTICE_MAX_QUESTIONS,
  SUBJECT_NAMES,
} from "../_shared/config.ts";
import { pickQuestions, publicQuestion, type QuestionRow } from "../_shared/questions.ts";

interface Body {
  mode?: string;
  subject?: string;
  subjects?: string[];
  topic?: string;
  count?: number;
  exam?: string;
}

Deno.serve(handler(async (req) => {
  const admin = adminClient();
  const user = await requireUser(req, admin);
  const body = await readJson<Body>(req);
  const exam = ["JAMB", "WAEC", "NECO"].includes(String(body.exam)) ? String(body.exam) : "JAMB";
  const premium = await isPremium(admin, user.id);

  let subjects: string[];
  let questions: QuestionRow[] = [];
  let timeLimit: number | null = null;
  const mode = body.mode === "mock" ? "mock" : "practice";

  if (mode === "practice") {
    const subject = String(body.subject ?? "").toLowerCase();
    if (!SUBJECT_NAMES[subject]) throw new HttpError(400, "Pick a subject.", "bad_subject");
    const count = Math.min(Math.max(Number(body.count) || 10, 1), PRACTICE_MAX_QUESTIONS);
    const topic = body.topic ? String(body.topic).slice(0, 120) : null;
    subjects = [subject];

    await consumeUsage(admin, user.id, "practice", count, premium ? -1 : FREE_PRACTICE_PER_DAY);
    try {
      questions = await pickQuestions(admin, { userId: user.id, subject, exam, topic, count, allowGenerate: true });
    } catch (e) {
      await admin.rpc("consume_usage", { uid: user.id, p_kind: "practice", p_amount: -count, p_limit: -1 });
      throw e;
    }
    if (questions.length < count) {
      // Refund what we couldn't serve.
      await admin.rpc("consume_usage", {
        uid: user.id, p_kind: "practice", p_amount: -(count - questions.length), p_limit: -1,
      });
    }
  } else {
    subjects = [...new Set((body.subjects ?? []).map((s) => String(s).toLowerCase()))];
    if (subjects.length < 1 || subjects.length > 4 || subjects.some((s) => !SUBJECT_NAMES[s])) {
      throw new HttpError(400, "Pick 1 to 4 subjects for a mock exam.", "bad_subjects");
    }
    if (!premium) {
      const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const { count } = await admin.from("attempts").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).eq("mode", "mock").gte("started_at", weekAgo);
      if ((count ?? 0) >= 1) {
        throw new HttpError(402, "Free accounts get 1 mock exam a week. Go Premium for unlimited mocks.", "limit_reached");
      }
    }
    const perSubject = await Promise.all(subjects.map((subject) =>
      pickQuestions(admin, {
        userId: user.id, subject, exam, count: MOCK_QUESTIONS_PER_SUBJECT, allowGenerate: true,
      })
    ));
    questions = perSubject.flat();
    timeLimit = questions.length * MOCK_SECONDS_PER_QUESTION;
  }

  if (questions.length === 0) {
    throw new HttpError(503, "We couldn't load questions right now. Please try again.", "no_questions");
  }

  const { data: attempt, error } = await admin.from("attempts").insert({
    user_id: user.id,
    mode,
    exam,
    subjects,
    question_ids: questions.map((q) => q.id),
    time_limit_seconds: timeLimit,
    total: questions.length,
  }).select("id, started_at").single();
  if (error) throw error;

  return json({
    attemptId: attempt.id,
    mode,
    exam,
    subjects,
    startedAt: attempt.started_at,
    timeLimitSeconds: timeLimit,
    questions: questions.map(publicQuestion),
  });
}));
