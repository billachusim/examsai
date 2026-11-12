-- ExamsAi real backend (2026-11-12)
-- Replaces the Faculty-ID-in-the-browser model with Supabase Auth, locks every
-- table to its owner, and adds the question bank, attempts, tutor history,
-- daily usage, entitlements and payments that the web and mobile apps share.
-- All writes that matter (marking, limits, premium) happen in edge functions
-- with the service role. Clients can only read their own rows.

-- ---------------------------------------------------------------------------
-- 1. Retire the old open tables (keep the data, close access)
-- ---------------------------------------------------------------------------
alter table if exists public.daily_questions rename to legacy_daily_questions;
alter table if exists public.profiles rename to legacy_profiles;

drop policy if exists "Users can view own profile" on public.legacy_profiles;
drop policy if exists "Anyone can create profile" on public.legacy_profiles;
drop policy if exists "Users can update own profile" on public.legacy_profiles;
drop policy if exists "Allow read access to profiles" on public.legacy_profiles;
drop policy if exists "Users can view own questions" on public.legacy_daily_questions;
drop policy if exists "Users can track own questions" on public.legacy_daily_questions;
drop policy if exists "Allow read access to daily questions" on public.legacy_daily_questions;
drop policy if exists "Allow tracking questions" on public.legacy_daily_questions;

alter table if exists public.legacy_profiles enable row level security;
alter table if exists public.legacy_daily_questions enable row level security;
revoke all on public.legacy_profiles from anon, authenticated;
revoke all on public.legacy_daily_questions from anon, authenticated;

-- generate_faculty_id is still used for display IDs, but only by the server.
revoke execute on function public.generate_faculty_id() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Profiles, one per auth user
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  faculty_id text unique not null,
  full_name text not null default '',
  phone text,
  school text,
  exam_target text not null default 'JAMB' check (exam_target in ('JAMB', 'WAEC', 'NECO')),
  subjects text[] not null default '{}',
  legacy_faculty_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Users may edit only these columns. faculty_id and legacy links stay server-side.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, school, exam_target, subjects) on public.profiles to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Entitlements and payments (written only by edge functions)
-- ---------------------------------------------------------------------------
create table public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null,
  expires_at timestamptz not null,
  source text not null check (source in ('flutterwave', 'google_play', 'app_store', 'legacy', 'admin')),
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;
create policy "entitlements_select_own" on public.entitlements
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.entitlements from anon, authenticated;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  provider text not null check (provider in ('flutterwave', 'google_play', 'app_store')),
  reference text not null,
  plan text not null,
  amount numeric(12, 2),
  currency text,
  status text not null default 'pending' check (status in ('pending', 'successful', 'failed')),
  provider_transaction_id text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, reference)
);

alter table public.payments enable row level security;
create policy "payments_select_own" on public.payments
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.payments from anon, authenticated;

create trigger payments_touch before update on public.payments
  for each row execute function public.touch_updated_at();

create or replace function public.is_premium(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = uid and e.expires_at > now()
  );
$$;
revoke execute on function public.is_premium(uuid) from public, anon, authenticated;
grant execute on function public.is_premium(uuid) to service_role;

-- Extends (never shortens) a user's premium. Called by payment functions.
create or replace function public.grant_premium(uid uuid, p_plan text, p_days integer, p_source text)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare
  new_expiry timestamptz;
begin
  insert into public.entitlements as e (user_id, plan, expires_at, source)
  values (uid, p_plan, now() + make_interval(days => p_days), p_source)
  on conflict (user_id) do update
    set plan = excluded.plan,
        source = excluded.source,
        expires_at = greatest(e.expires_at, now()) + make_interval(days => p_days),
        updated_at = now()
  returning expires_at into new_expiry;
  return new_expiry;
end;
$$;
revoke execute on function public.grant_premium(uuid, text, integer, text) from public, anon, authenticated;
grant execute on function public.grant_premium(uuid, text, integer, text) to service_role;

-- ---------------------------------------------------------------------------
-- 4. New-user trigger: create profile, link legacy Faculty ID account by email
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  legacy record;
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  select * into legacy from public.legacy_profiles lp
  where new.email is not null and lower(lp.email) = lower(new.email)
  order by lp.created_at desc limit 1;

  insert into public.profiles (id, faculty_id, full_name, phone, school, legacy_faculty_id)
  values (
    new.id,
    coalesce(legacy.faculty_id, public.generate_faculty_id()),
    coalesce(nullif(meta->>'full_name', ''), nullif(meta->>'name', ''), legacy.name, ''),
    coalesce(nullif(meta->>'phone', ''), legacy.phone_number),
    coalesce(nullif(meta->>'school', ''), legacy.school),
    legacy.faculty_id
  );

  -- Carry over premium that a legacy student paid for and that is still running.
  if legacy.faculty_id is not null and legacy.has_paid
     and legacy.subscription_expires_at is not null
     and legacy.subscription_expires_at > now() then
    insert into public.entitlements (user_id, plan, expires_at, source)
    values (new.id, coalesce(legacy.subscription_type, 'monthly'), legacy.subscription_expires_at, 'legacy')
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5. Question bank (no client access: answers must never leak)
-- ---------------------------------------------------------------------------
create table public.subjects (
  slug text primary key,
  name text not null,
  exams text[] not null default '{JAMB,WAEC,NECO}',
  sort_order integer not null default 0
);

alter table public.subjects enable row level security;
create policy "subjects_read_all" on public.subjects for select to anon, authenticated using (true);
revoke insert, update, delete on public.subjects from anon, authenticated;

insert into public.subjects (slug, name, sort_order) values
  ('english', 'Use of English', 1),
  ('mathematics', 'Mathematics', 2),
  ('physics', 'Physics', 3),
  ('chemistry', 'Chemistry', 4),
  ('biology', 'Biology', 5),
  ('government', 'Government', 6),
  ('economics', 'Economics', 7),
  ('literature', 'Literature in English', 8),
  ('commerce', 'Commerce', 9),
  ('crs', 'Christian Religious Studies', 10),
  ('irs', 'Islamic Religious Studies', 11),
  ('geography', 'Geography', 12),
  ('accounting', 'Principles of Accounts', 13),
  ('agric', 'Agricultural Science', 14)
on conflict (slug) do nothing;

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  subject_slug text not null references public.subjects(slug),
  topic text,
  exam text not null default 'JAMB',
  year integer,
  stem text not null,
  options jsonb not null,           -- [{"key":"A","text":"..."}, ...]
  answer text not null check (answer in ('A', 'B', 'C', 'D', 'E')),
  explanation text not null default '',
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  source text not null default 'ai' check (source in ('ai', 'teacher', 'licensed')),
  reviewed boolean not null default false,
  flagged_count integer not null default 0,
  stem_hash text generated always as (md5(lower(regexp_replace(stem, '\s+', ' ', 'g')))) stored,
  created_at timestamptz not null default now(),
  unique (subject_slug, stem_hash)
);

create index questions_subject_idx on public.questions (subject_slug, exam, topic);
alter table public.questions enable row level security;
revoke all on public.questions from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Attempts (practice sessions and mock exams), marked server-side
-- ---------------------------------------------------------------------------
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('practice', 'mock')),
  exam text not null default 'JAMB',
  subjects text[] not null,
  question_ids uuid[] not null,
  time_limit_seconds integer,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score integer,
  total integer not null
);

create index attempts_user_idx on public.attempts (user_id, started_at desc);
alter table public.attempts enable row level security;
create policy "attempts_select_own" on public.attempts
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.attempts from anon, authenticated;

create table public.attempt_answers (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_slug text not null,
  topic text,
  chosen text,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create index attempt_answers_user_idx on public.attempt_answers (user_id, subject_slug);
alter table public.attempt_answers enable row level security;
create policy "attempt_answers_select_own" on public.attempt_answers
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.attempt_answers from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. AI tutor history and daily usage
-- ---------------------------------------------------------------------------
create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_slug text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index tutor_messages_user_idx on public.tutor_messages (user_id, subject_slug, created_at);
alter table public.tutor_messages enable row level security;
create policy "tutor_messages_select_own" on public.tutor_messages
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.tutor_messages from anon, authenticated;

create table public.daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default (now() at time zone 'Africa/Lagos')::date,
  tutor_messages integer not null default 0,
  practice_questions integer not null default 0,
  primary key (user_id, day)
);

alter table public.daily_usage enable row level security;
create policy "daily_usage_select_own" on public.daily_usage
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.daily_usage from anon, authenticated;

-- Atomically checks and consumes daily allowance. Returns the new count, or -1
-- when the limit would be exceeded. p_limit < 0 means unlimited.
create or replace function public.consume_usage(uid uuid, p_kind text, p_amount integer, p_limit integer)
returns integer language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Africa/Lagos')::date;
  current_count integer;
begin
  insert into public.daily_usage (user_id, day) values (uid, today)
  on conflict (user_id, day) do nothing;

  if p_kind = 'tutor' then
    select tutor_messages into current_count from public.daily_usage
      where user_id = uid and day = today for update;
  elsif p_kind = 'practice' then
    select practice_questions into current_count from public.daily_usage
      where user_id = uid and day = today for update;
  else
    raise exception 'unknown usage kind %', p_kind;
  end if;

  if p_limit >= 0 and current_count + p_amount > p_limit then
    return -1;
  end if;

  if p_kind = 'tutor' then
    update public.daily_usage set tutor_messages = tutor_messages + p_amount
      where user_id = uid and day = today;
  else
    update public.daily_usage set practice_questions = practice_questions + p_amount
      where user_id = uid and day = today;
  end if;

  return current_count + p_amount;
end;
$$;
revoke execute on function public.consume_usage(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_usage(uuid, text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 8. Leaderboard: first name, school and score only (last 30 days)
-- ---------------------------------------------------------------------------
create or replace function public.get_leaderboard(p_limit integer default 20)
returns table (rank bigint, first_name text, school text, correct bigint, answered bigint, accuracy integer, is_me boolean)
language sql stable security definer set search_path = public as $$
  with scores as (
    select a.user_id,
           count(*) filter (where a.is_correct) as correct,
           count(*) as answered
    from public.attempt_answers a
    where a.answered_at > now() - interval '30 days'
    group by a.user_id
    having count(*) >= 10
  )
  select row_number() over (order by s.correct desc, s.answered asc) as rank,
         coalesce(nullif(split_part(trim(p.full_name), ' ', 1), ''), 'Student') as first_name,
         coalesce(p.school, '') as school,
         s.correct,
         s.answered,
         round(100.0 * s.correct / s.answered)::integer as accuracy,
         s.user_id = auth.uid() as is_me
  from scores s
  join public.profiles p on p.id = s.user_id
  order by s.correct desc, s.answered asc
  limit least(greatest(p_limit, 1), 100);
$$;
revoke execute on function public.get_leaderboard(integer) from public;
grant execute on function public.get_leaderboard(integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 9. Question reports (one per student per question)
-- ---------------------------------------------------------------------------
create table public.question_reports (
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  primary key (question_id, user_id)
);

alter table public.question_reports enable row level security;
revoke all on public.question_reports from anon, authenticated;

create or replace function public.report_question(p_question_id uuid, p_user_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.question_reports (question_id, user_id, reason)
  values (p_question_id, p_user_id, p_reason)
  on conflict do nothing;
  if found then
    update public.questions set flagged_count = flagged_count + 1 where id = p_question_id;
  end if;
end;
$$;
revoke execute on function public.report_question(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.report_question(uuid, uuid, text) to service_role;
