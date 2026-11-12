// AI exam tutor. POST { subject, message, exam? } -> { reply, usage }
// Keeps the last few turns per subject as context and stores the history.
import { handler, HttpError, json, readJson } from "../_shared/cors.ts";
import { adminClient, consumeUsage, isPremium, requireUser } from "../_shared/supabase.ts";
import { chatCompletion, type ChatMessage } from "../_shared/ai.ts";
import { FREE_TUTOR_PER_DAY, SUBJECT_NAMES } from "../_shared/config.ts";

const MAX_MESSAGE_CHARS = 2000;
const CONTEXT_TURNS = 10;

Deno.serve(handler(async (req) => {
  const admin = adminClient();
  const user = await requireUser(req, admin);
  const body = await readJson<{ subject?: string; message?: string; exam?: string }>(req);

  const subject = String(body.subject ?? "").toLowerCase();
  if (!SUBJECT_NAMES[subject]) throw new HttpError(400, "Pick a subject first.", "bad_subject");
  const message = String(body.message ?? "").trim();
  if (!message) throw new HttpError(400, "Type a question first.", "empty_message");
  if (message.length > MAX_MESSAGE_CHARS) {
    throw new HttpError(400, `Please keep questions under ${MAX_MESSAGE_CHARS} characters.`, "too_long");
  }
  const exam = ["JAMB", "WAEC", "NECO"].includes(String(body.exam)) ? String(body.exam) : "JAMB";

  const premium = await isPremium(admin, user.id);
  const used = await consumeUsage(admin, user.id, "tutor", 1, premium ? -1 : FREE_TUTOR_PER_DAY);

  const { data: history } = await admin
    .from("tutor_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .eq("subject_slug", subject)
    .order("created_at", { ascending: false })
    .limit(CONTEXT_TURNS);

  const subjectName = SUBJECT_NAMES[subject];
  const system: ChatMessage = {
    role: "system",
    content:
      `You are ExamsAi, a friendly, patient ${subjectName} tutor for Nigerian students preparing for ` +
      `${exam} (also JAMB UTME, WAEC and NECO). Teach to the official syllabus. ` +
      `Explain step by step in simple English, show the working for calculations, and end with a ` +
      `quick tip or a short practice question when useful. Keep answers under 250 words unless the ` +
      `student asks for more. Write maths in plain text (x^2, sqrt(3), 3/4), not LaTeX. ` +
      `Use short paragraphs and numbered steps; no tables. If a question is outside ${subjectName} ` +
      `or school work, say so kindly and steer back to exam prep. Never help with cheating in a live exam. ` +
      `If you are not sure of a fact, say so rather than guess.`,
  };

  const messages: ChatMessage[] = [
    system,
    ...((history ?? []).reverse() as ChatMessage[]),
    { role: "user", content: message },
  ];

  let reply: string;
  try {
    reply = await chatCompletion(messages);
  } catch (e) {
    // Give the free question back if the AI failed.
    await admin.rpc("consume_usage", { uid: user.id, p_kind: "tutor", p_amount: -1, p_limit: -1 });
    throw e;
  }

  const now = Date.now();
  await admin.from("tutor_messages").insert([
    { user_id: user.id, subject_slug: subject, role: "user", content: message, created_at: new Date(now).toISOString() },
    { user_id: user.id, subject_slug: subject, role: "assistant", content: reply, created_at: new Date(now + 1).toISOString() },
  ]);

  return json({
    reply,
    usage: { tutorUsed: used, tutorLimit: premium ? null : FREE_TUTOR_PER_DAY },
  });
}));
