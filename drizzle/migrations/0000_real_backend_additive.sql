drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Anyone can create profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Allow read access to profiles" on public.profiles;
drop policy if exists "Users can view own questions" on public.daily_questions;
drop policy if exists "Users can track own questions" on public.daily_questions;
drop policy if exists "Allow read access to daily questions" on public.daily_questions;
drop policy if exists "Allow tracking questions" on public.daily_questions;
revoke all on public.daily_questions from anon, authenticated;
grant all on public.daily_questions to service_role;
comment on table public.daily_questions is 'DEPRECATED: replaced by daily_usage';
revoke execute on function public.generate_faculty_id() from public, anon, authenticated;

alter table public.profiles
  add column if not exists full_name text not null default '',
  add column if not exists phone text,
  add column if not exists exam_target text not null default 'JAMB' check (exam_target in ('JAMB', 'WAEC', 'NECO')),
  add column if not exists subjects text[] not null default '{}',
  add column if not exists legacy_faculty_id text,
  add column if not exists updated_at timestamptz not null default now();
alter table public.profiles alter column name set default '';
alter table public.profiles alter column email set default '';
alter table public.profiles alter column phone_number set default '';
alter table public.profiles alter column school set default '';
update public.profiles set full_name = name, phone = phone_number where full_name = '';
comment on column public.profiles.name is 'DEPRECATED: replaced by full_name';
comment on column public.profiles.phone_number is 'DEPRECATED: replaced by phone';

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, school, exam_target, subjects) on public.profiles to authenticated;
grant all on public.profiles to service_role;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create table public.entitlements (
  user_id uuid primary key,
  plan text not null,
  expires_at timestamptz not null,
  source text not null check (source in ('flutterwave', 'google_play', 'app_store', 'legacy', 'admin')),
  updated_at timestamptz not null default now()
);
grant select on public.entitlements to authenticated;
grant all on public.entitlements to service_role;
alter table public.entitlements enable row level security;
create policy "entitlements_select_own" on public.entitlements
  for select to authenticated using (user_id = auth.uid());

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
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
grant select on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "payments_select_own" on public.payments
  for select to authenticated using (user_id = auth.uid());
create trigger payments_touch before update on public.payments
  for each row execute function public.touch_updated_at();

create or replace function public.is_premium(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = uid and e.expires_at > now()
  );
$$;
revoke execute on function public.is_premium(uuid) from public, anon;
grant execute on function public.is_premium(uuid) to authenticated, service_role;

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

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  legacy record;
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  select * into legacy from public.profiles lp
  where new.email is not null and lower(lp.email) = lower(new.email)
    and not exists (select 1 from auth.users u where u.id = lp.id)
  order by lp.created_at desc limit 1;

  if legacy.id is not null then
    update public.profiles set
      id = new.id,
      full_name = coalesce(nullif(meta->>'full_name', ''), nullif(meta->>'name', ''), legacy.name, ''),
      phone = coalesce(nullif(meta->>'phone', ''), legacy.phone_number),
      school = coalesce(nullif(meta->>'school', ''), legacy.school),
      legacy_faculty_id = legacy.faculty_id
    where id = legacy.id;
    if legacy.has_paid and legacy.subscription_expires_at is not null
       and legacy.subscription_expires_at > now() then
      insert into public.entitlements (user_id, plan, expires_at, source)
      values (new.id, coalesce(legacy.subscription_type, 'monthly'), legacy.subscription_expires_at, 'legacy')
      on conflict (user_id) do nothing;
    end if;
  else
    insert into public.profiles (id, faculty_id, full_name, name, email, phone, phone_number, school)
    values (
      new.id, public.generate_faculty_id(),
      coalesce(nullif(meta->>'full_name', ''), nullif(meta->>'name', ''), ''),
      coalesce(nullif(meta->>'full_name', ''), nullif(meta->>'name', ''), ''),
      coalesce(new.email, ''),
      nullif(meta->>'phone', ''), coalesce(meta->>'phone', ''),
      coalesce(meta->>'school', '')
    );
  end if;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.subjects (
  slug text primary key,
  name text not null,
  exams text[] not null default '{JAMB,WAEC,NECO}',
  sort_order integer not null default 0
);
grant select on public.subjects to anon, authenticated;
grant all on public.subjects to service_role;
alter table public.subjects enable row level security;
create policy "subjects_read_all" on public.subjects for select to anon, authenticated using (true);

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
  options jsonb not null,
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
grant all on public.questions to service_role;
create index questions_subject_idx on public.questions (subject_slug, exam, topic);
alter table public.questions enable row level security;

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
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
grant select on public.attempts to authenticated;
grant all on public.attempts to service_role;
create index attempts_user_idx on public.attempts (user_id, started_at desc);
alter table public.attempts enable row level security;
create policy "attempts_select_own" on public.attempts
  for select to authenticated using (user_id = auth.uid());

create table public.attempt_answers (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null,
  subject_slug text not null,
  topic text,
  chosen text,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);
grant select on public.attempt_answers to authenticated;
grant all on public.attempt_answers to service_role;
create index attempt_answers_user_idx on public.attempt_answers (user_id, subject_slug);
alter table public.attempt_answers enable row level security;
create policy "attempt_answers_select_own" on public.attempt_answers
  for select to authenticated using (user_id = auth.uid());

create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject_slug text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
grant select on public.tutor_messages to authenticated;
grant all on public.tutor_messages to service_role;
create index tutor_messages_user_idx on public.tutor_messages (user_id, subject_slug, created_at);
alter table public.tutor_messages enable row level security;
create policy "tutor_messages_select_own" on public.tutor_messages
  for select to authenticated using (user_id = auth.uid());

create table public.daily_usage (
  user_id uuid not null,
  day date not null default (now() at time zone 'Africa/Lagos')::date,
  tutor_messages integer not null default 0,
  practice_questions integer not null default 0,
  primary key (user_id, day)
);
grant select on public.daily_usage to authenticated;
grant all on public.daily_usage to service_role;
alter table public.daily_usage enable row level security;
create policy "daily_usage_select_own" on public.daily_usage
  for select to authenticated using (user_id = auth.uid());

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

create table public.question_reports (
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null,
  reason text,
  created_at timestamptz not null default now(),
  primary key (question_id, user_id)
);
grant all on public.question_reports to service_role;
alter table public.question_reports enable row level security;

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