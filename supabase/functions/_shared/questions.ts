import type { SupabaseClient } from "npm:@supabase/supabase-js@2.74.0";
import { chatCompletion, parseModelJson, QUESTION_MODEL } from "./ai.ts";
import { SUBJECT_NAMES } from "./config.ts";

export interface QuestionRow {
  id: string;
  subject_slug: string;
  topic: string | null;
  exam: string;
  year: number | null;
  stem: string;
  options: { key: string; text: string }[];
  answer: string;
  explanation: string;
  difficulty: string;
  source: string;
}

/** What a client may see before submitting: no answer, no explanation. */
export function publicQuestion(q: QuestionRow) {
  return {
    id: q.id,
    subject: q.subject_slug,
    topic: q.topic,
    exam: q.exam,
    year: q.year,
    stem: q.stem,
    options: q.options,
    difficulty: q.difficulty,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Picks `count` questions for a subject, preferring ones the user hasn't seen.
 * When `allowGenerate` is true and the bank is short, new questions are written
 * by the AI in the syllabus style and saved to the bank (source = 'ai').
 */
export async function pickQuestions(
  admin: SupabaseClient,
  opts: {
    userId: string;
    subject: string;
    exam: string;
    topic?: string | null;
    count: number;
    allowGenerate: boolean;
  },
): Promise<QuestionRow[]> {
  const { userId, subject, exam, topic, count, allowGenerate } = opts;

  const { data: seenRows } = await admin
    .from("attempt_answers")
    .select("question_id")
    .eq("user_id", userId)
    .eq("subject_slug", subject)
    .limit(2000);
  const seen = new Set((seenRows ?? []).map((r: { question_id: string }) => r.question_id));

  let query = admin
    .from("questions")
    .select("*")
    .eq("subject_slug", subject)
    .eq("exam", exam)
    .lt("flagged_count", 3)
    .limit(500);
  if (topic) query = query.ilike("topic", topic);
  const { data: pool, error } = await query;
  if (error) throw error;

  const all = (pool ?? []) as QuestionRow[];
  const unseen = shuffle(all.filter((q) => !seen.has(q.id)));
  let picked = unseen.slice(0, count);

  if (picked.length < count && allowGenerate) {
    const needed = count - picked.length;
    const generated = await generateQuestions(admin, { subject, exam, topic, count: needed });
    picked = picked.concat(generated);
  }

  if (picked.length < count) {
    // Fall back to questions the student has seen before.
    const seenPool = shuffle(all.filter((q) => seen.has(q.id) && !picked.includes(q)));
    picked = picked.concat(seenPool.slice(0, count - picked.length));
  }

  return picked.slice(0, count);
}

interface GeneratedQuestion {
  topic?: string;
  stem: string;
  options: Record<string, string> | { key: string; text: string }[];
  answer: string;
  explanation: string;
  difficulty?: string;
}

export async function generateQuestions(
  admin: SupabaseClient,
  opts: { subject: string; exam: string; topic?: string | null; count: number },
): Promise<QuestionRow[]> {
  const subjectName = SUBJECT_NAMES[opts.subject] ?? opts.subject;
  const n = Math.min(Math.max(opts.count, 1), 10);
  const optionKeys = opts.exam === "JAMB" ? "A, B, C, D" : "A, B, C, D";

  const system =
    `You write original multiple-choice exam questions for Nigerian secondary school students ` +
    `preparing for ${opts.exam}. Follow the current ${opts.exam} syllabus for ${subjectName}. ` +
    `Questions must be original (never copied from past papers or books), factually correct, ` +
    `unambiguous, with exactly one correct option and options ${optionKeys}. ` +
    `Use Nigerian context where natural (names, places, naira). Write maths in plain text ` +
    `(x^2, sqrt(3), 3/4), never LaTeX. Explanations: 1 to 4 short sentences showing the working ` +
    `or the rule, written for a 16-year-old.`;

  const user =
    `Write ${n} ${subjectName} questions` +
    (opts.topic ? ` on the topic "${opts.topic}"` : " spread across different syllabus topics") +
    `, mixed difficulty. Reply with JSON only, in this shape: ` +
    `{"questions":[{"topic":"...","stem":"...","options":{"A":"...","B":"...","C":"...","D":"..."},` +
    `"answer":"A","explanation":"...","difficulty":"easy|medium|hard"}]}`;

  const text = await chatCompletion(
    [{ role: "system", content: system }, { role: "user", content: user }],
    { model: QUESTION_MODEL, json: true, temperature: 0.7 },
  );

  let parsed: { questions?: GeneratedQuestion[] };
  try {
    parsed = parseModelJson(text);
  } catch {
    console.error("Could not parse generated questions", text.slice(0, 500));
    return [];
  }

  const rows = (parsed.questions ?? [])
    .map((q) => normaliseGenerated(q, opts))
    .filter((q): q is Omit<QuestionRow, "id"> => q !== null);
  if (rows.length === 0) return [];

  const { data, error } = await admin
    .from("questions")
    .upsert(rows, { onConflict: "subject_slug,stem_hash", ignoreDuplicates: true })
    .select("*");
  if (error) {
    console.error("Saving generated questions failed", error);
    return [];
  }
  return (data ?? []) as QuestionRow[];
}

function normaliseGenerated(
  q: GeneratedQuestion,
  opts: { subject: string; exam: string; topic?: string | null },
): Omit<QuestionRow, "id"> | null {
  if (!q || typeof q.stem !== "string" || !q.stem.trim()) return null;
  let options: { key: string; text: string }[];
  if (Array.isArray(q.options)) {
    options = q.options.map((o) => ({ key: String(o.key).toUpperCase(), text: String(o.text) }));
  } else if (q.options && typeof q.options === "object") {
    options = Object.entries(q.options).map(([k, v]) => ({ key: k.toUpperCase(), text: String(v) }));
  } else {
    return null;
  }
  options = options.filter((o) => /^[A-E]$/.test(o.key) && o.text.trim()).sort((a, b) =>
    a.key.localeCompare(b.key)
  );
  const answer = String(q.answer ?? "").trim().toUpperCase().charAt(0);
  if (options.length < 4 || !options.some((o) => o.key === answer)) return null;
  const difficulty = ["easy", "medium", "hard"].includes(String(q.difficulty)) ? String(q.difficulty) : "medium";
  return {
    subject_slug: opts.subject,
    topic: (q.topic ?? opts.topic ?? null)?.toString().slice(0, 120) ?? null,
    exam: opts.exam,
    year: null,
    stem: q.stem.trim(),
    options,
    answer,
    explanation: String(q.explanation ?? "").trim(),
    difficulty,
    source: "ai",
  };
}
