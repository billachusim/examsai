-- Create profiles table to store user information
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  faculty_id text unique not null,
  name text not null,
  email text not null,
  phone_number text not null,
  school text not null,
  has_paid boolean default false,
  subscription_type text default 'free',
  subscription_expires_at timestamp with time zone,
  activated boolean default false,
  questions_asked_today integer default 0,
  total_questions_asked integer default 0,
  total_correct_answers integer default 0,
  created_at timestamp with time zone default now(),
  last_activity timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (true);

-- Allow inserts during signup (public)
create policy "Anyone can create profile"
  on public.profiles for insert
  with check (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (true);

-- Create index for faster faculty_id lookups
create index idx_profiles_faculty_id on public.profiles(faculty_id);

-- Function to generate unique faculty ID
create or replace function generate_faculty_id()
returns text
language plpgsql
as $$
declare
  new_id text;
  id_exists boolean;
begin
  loop
    -- Generate random 5-digit number
    new_id := 'FAC-' || lpad(floor(random() * 100000)::text, 5, '0');
    
    -- Check if it exists
    select exists(select 1 from public.profiles where faculty_id = new_id) into id_exists;
    
    -- Exit loop if unique
    exit when not id_exists;
  end loop;
  
  return new_id;
end;
$$;

-- Track daily question usage
create table public.daily_questions (
  id uuid primary key default gen_random_uuid(),
  faculty_id text not null references public.profiles(faculty_id) on delete cascade,
  question_date date default current_date,
  questions_count integer default 1,
  created_at timestamp with time zone default now(),
  unique(faculty_id, question_date)
);

-- Enable RLS
alter table public.daily_questions enable row level security;

-- Users can view their own question counts
create policy "Users can view own questions"
  on public.daily_questions for select
  using (true);

-- Allow inserts/updates
create policy "Users can track own questions"
  on public.daily_questions for all
  using (true);

-- Create index
create index idx_daily_questions_faculty_date on public.daily_questions(faculty_id, question_date);