// Returns everything a client needs on launch: profile, premium, today's usage,
// limits, plans and per-subject progress.
import { handler, json } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";
import { FREE_PRACTICE_PER_DAY, FREE_TUTOR_PER_DAY, PLANS, SUBJECT_NAMES } from "../_shared/config.ts";

Deno.serve(handler(async (req) => {
  const admin = adminClient();
  const user = await requireUser(req, admin);
  const today = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10); // Africa/Lagos

  const [profileRes, entRes, usageRes, answersRes, attemptsRes] = await Promise.all([
    admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    admin.from("entitlements").select("plan, expires_at, source").eq("user_id", user.id).maybeSingle(),
    admin.from("daily_usage").select("tutor_messages, practice_questions").eq("user_id", user.id).eq("day", today)
      .maybeSingle(),
    admin.from("attempt_answers").select("subject_slug, topic, is_correct").eq("user_id", user.id).limit(5000),
    admin.from("attempts").select("id, mode, subjects, score, total, submitted_at").eq("user_id", user.id)
      .not("submitted_at", "is", null).order("submitted_at", { ascending: false }).limit(10),
  ]);

  const ent = entRes.data;
  const premium = !!ent && new Date(ent.expires_at).getTime() > Date.now();

  const bySubject: Record<string, { answered: number; correct: number; topics: Record<string, { answered: number; correct: number }> }> = {};
  for (const a of answersRes.data ?? []) {
    const s = (bySubject[a.subject_slug] ??= { answered: 0, correct: 0, topics: {} });
    s.answered++;
    if (a.is_correct) s.correct++;
    if (a.topic) {
      const t = (s.topics[a.topic] ??= { answered: 0, correct: 0 });
      t.answered++;
      if (a.is_correct) t.correct++;
    }
  }
  const progress = Object.entries(bySubject).map(([slug, s]) => ({
    subject: slug,
    name: SUBJECT_NAMES[slug] ?? slug,
    answered: s.answered,
    correct: s.correct,
    accuracy: s.answered ? Math.round((100 * s.correct) / s.answered) : 0,
    weakTopics: Object.entries(s.topics)
      .filter(([, t]) => t.answered >= 3)
      .map(([topic, t]) => ({ topic, accuracy: Math.round((100 * t.correct) / t.answered), answered: t.answered }))
      .sort((x, y) => x.accuracy - y.accuracy)
      .slice(0, 3),
  })).sort((x, y) => y.answered - x.answered);

  const tutorUsed = usageRes.data?.tutor_messages ?? 0;
  const practiceUsed = usageRes.data?.practice_questions ?? 0;

  return json({
    user: { id: user.id, email: user.email },
    profile: profileRes.data,
    premium: { active: premium, plan: ent?.plan ?? null, expiresAt: ent?.expires_at ?? null, source: ent?.source ?? null },
    usage: {
      tutorUsed,
      practiceUsed,
      tutorLimit: premium ? null : FREE_TUTOR_PER_DAY,
      practiceLimit: premium ? null : FREE_PRACTICE_PER_DAY,
    },
    plans: Object.entries(PLANS).map(([id, p]) => ({ id, ...p })),
    progress,
    recentAttempts: attemptsRes.data ?? [],
  });
}));
