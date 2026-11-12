# ExamsAi backend

The web app and the mobile app (billachusim/exams_ai) share one Supabase backend.
Clients sign in with Supabase Auth and call the edge functions below with the
user's access token. Tables are readable only by their owner; every write that
matters (limits, marking, premium) happens inside the functions.

## Going live (Lovable)

1. Apply the migration `supabase/migrations/20261112010000_real_backend.sql`
   (ask Lovable: "apply the pending Supabase migration and deploy the edge functions").
2. Auth settings (Lovable Cloud > Users > Auth): enable Email, and Google if you want
   the Google button. Add the site URL and `/reset-password` as redirect URLs.
3. Secrets (Lovable Cloud > Secrets):
   - `FLW_SECRET_KEY`: Flutterwave secret key (live).
   - `FLW_WEBHOOK_HASH`: any long random string; put the same in Flutterwave >
     Settings > Webhooks, with URL `https://qmshqibcpetahlmcacjw.supabase.co/functions/v1/flutterwave-webhook`.
   - `EXAMSAI_SITE_URL`: the live site, e.g. `https://examsai.ng`.
   - `LOVABLE_API_KEY` is provided by Lovable Cloud for the AI tutor.
4. Publish.

Old Faculty ID accounts are kept in `legacy_profiles`. When a student signs up
with the same email, their Faculty ID and any unexpired Premium move over.

## Free and Premium

Set in `supabase/functions/_shared/config.ts`:

| | Free | Premium |
| --- | --- | --- |
| AI tutor questions | 3 a day | Unlimited |
| Practice questions | 20 a day | Unlimited |
| Mock exams | 1 a week | Unlimited |

Plans: Day Pass ₦500 (1 day), Monthly ₦2,000 (30 days), 3 Months ₦5,000 (90 days).
One-off payments; buying again extends the end date.

## Questions

`questions` holds the bank. When a subject or topic runs short, `start-practice`
asks the AI to write new syllabus-style questions and saves them (`source = 'ai'`,
`reviewed = false`). Students can report a question; 3 reports stop it being
served. Answers are never sent before submission.

## Functions (POST, JSON, `Authorization: Bearer <access token>`)

| Function | Body | Returns |
| --- | --- | --- |
| `me` | `{}` | profile, premium, today's usage and limits, plans, per-subject progress, recent attempts |
| `tutor-chat` | `{ subject, message, exam? }` | `{ reply, usage }` |
| `start-practice` | `{ mode: "practice", subject, topic?, count?, exam? }` or `{ mode: "mock", subjects[], exam? }` | `{ attemptId, questions[], timeLimitSeconds, startedAt }` |
| `submit-attempt` | `{ attemptId, answers: [{ questionId, chosen }] }` | score, per-subject breakdown, answer and explanation per question |
| `report-question` | `{ questionId, reason? }` | `{ ok }` |
| `flutterwave-init` | `{ plan, redirectUrl? }` | `{ link, txRef }` (open `link`) |
| `flutterwave-verify` | `{ transactionId?, txRef? }` | `{ granted, status, expiresAt }` |
| `delete-account` | `{}` | `{ deleted: true }` |

Errors are `{ error, code }`. `code = "limit_reached"` (HTTP 402) means show the paywall.

Subjects: english, mathematics, physics, chemistry, biology, government, economics,
literature, commerce, crs, irs, geography, accounting, agric.

Readable directly with the Supabase client (own rows only): `profiles` (and update of
full_name, phone, school, exam_target, subjects), `tutor_messages`, `attempts`,
`attempt_answers`, `entitlements`, `payments`, `daily_usage`, `subjects`, and
`rpc('get_leaderboard')`.

Still to add for the mobile app: `verify-purchase` for Google Play and App Store
receipts (grants the same entitlement).
