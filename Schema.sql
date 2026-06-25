-- ============================================================
-- TS TECH PARK LMS — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS guards
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users — DO NOT store passwords here, Supabase Auth handles that)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique not null,
  phone text,
  city text,
  role text not null default 'student' check (role in ('student','instructor','admin')),
  avatar_url text,
  xp int default 0,
  streak int default 1,
  hours_learned numeric default 0,
  is_blocked boolean default false,           -- admin can block instructors/students
  is_approved boolean default true,           -- instructors require admin approval = false on signup
  created_at timestamptz default now()
);

-- 2. COURSES
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  template_label text not null,               -- e.g. "DATA SCIENCE BY TS TECH PARK" shown instead of emoji
  category text,
  level text check (level in ('Beginner','Intermediate','Advanced')),
  description text,
  price numeric default 0,
  hours numeric default 0,
  thumbnail_url text,
  instructor_id uuid references public.profiles(id),
  is_published boolean default false,
  created_at timestamptz default now()
);

-- 3. LESSONS (video/pdf/ppt/assignment per course)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  type text check (type in ('video','pdf','ppt','assignment')),
  content_url text,                            -- Supabase Storage path
  order_index int default 0,
  created_at timestamptz default now()
);

-- 4. ENROLLMENTS
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  progress numeric default 0,
  completed boolean default false,
  enrolled_at timestamptz default now(),
  unique(student_id, course_id)
);

-- 5. PAYMENTS (DUMMY — display only, no real money moves)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id),
  amount numeric not null,
  method text check (method in ('upi','card','netbanking','cash','dummy')),
  status text default 'success' check (status in ('success','pending','failed','refunded')),
  reference_id text,                            -- fake txn id, e.g. TS-DUMMY-xxxx
  paid_at timestamptz default now()
);

-- 6. QUIZZES
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  created_at timestamptz default now()
);
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,                       -- ["opt1","opt2","opt3","opt4"]
  correct_index int not null
);
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  quiz_id uuid references public.quizzes(id),
  score int,
  total int,
  attempted_at timestamptz default now()
);

-- 7. CERTIFICATES
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id),
  cert_code text unique,
  issued_at timestamptz default now()
);

-- 8. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 9. FORUM
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  content text,
  category text,
  tags text[],
  likes int default 0,
  created_at timestamptz default now()
);

-- 10. LIVE CLASSES (admin/instructor posts links)
create table if not exists public.live_classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  instructor_id uuid references public.profiles(id),
  meeting_url text not null,                    -- Zoom/Google Meet/YouTube live link
  status text default 'upcoming' check (status in ('live','upcoming','recorded')),
  scheduled_at timestamptz,
  created_at timestamptz default now()
);

-- 11. ADMIN OTP (2-step verification codes, emailed only to the registered super-admin email)
create table if not exists public.admin_otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- 12. ACTIVITY / AUDIT LOG
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,                         -- e.g. 'signup','suspend_user','publish_course'
  meta jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.payments enable row level security;
alter table public.forum_posts enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or role = 'admin');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "courses_public_read" on public.courses;
create policy "courses_public_read" on public.courses
  for select using (is_published = true);

drop policy if exists "enrollments_own" on public.enrollments;
create policy "enrollments_own" on public.enrollments
  for all using (auth.uid() = student_id);

drop policy if exists "payments_own" on public.payments;
create policy "payments_own" on public.payments
  for select using (auth.uid() = student_id);

drop policy if exists "forum_read_all" on public.forum_posts;
create policy "forum_read_all" on public.forum_posts
  for select using (true);

-- Note: admin/instructor write access is enforced via the server-side
-- service-role API (server/routes/admin.js), not directly from the browser.

-- ============================================================
-- TRIGGER: auto-create profile row when a new auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
