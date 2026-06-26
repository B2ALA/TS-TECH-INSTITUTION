-- ============================================================
-- TS TECH PARK LMS — APP SCHEMA (run after 01_auth_schema.sql)
-- ============================================================

-- 1. COURSES
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  template_label text not null,           -- e.g. "DATA SCIENCE BY TS TECH PARK"
  category text not null,
  level text not null check (level in ('Beginner','Intermediate','Advanced')),
  price numeric not null default 0,
  hours integer not null default 0,
  description text,
  curriculum jsonb not null default '[]', -- array of strings
  videos jsonb not null default '[]',     -- array of {title, yt}
  color text not null default '#0891b2',
  published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

drop policy if exists "courses_select_published" on public.courses;
create policy "courses_select_published" on public.courses
  for select using (published = true or created_by = auth.uid() or public.is_admin());

drop policy if exists "courses_write_owner_or_admin" on public.courses;
create policy "courses_write_owner_or_admin" on public.courses
  for all using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

-- 2. ENROLLMENTS
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress_pct integer not null default 0 check (progress_pct between 0 and 100),
  completed boolean not null default false,
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

alter table public.enrollments enable row level security;

drop policy if exists "enroll_select_own_or_admin" on public.enrollments;
create policy "enroll_select_own_or_admin" on public.enrollments
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists "enroll_insert_own" on public.enrollments;
create policy "enroll_insert_own" on public.enrollments
  for insert with check (student_id = auth.uid());

drop policy if exists "enroll_update_own_or_admin" on public.enrollments;
create policy "enroll_update_own_or_admin" on public.enrollments
  for update using (student_id = auth.uid() or public.is_admin());

-- 3. PAYMENTS (manual: UPI / Cash — recorded, not gateway-processed)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  amount numeric not null,
  method text not null check (method in ('UPI','Cash','Card','NetBanking')),
  reference_note text,                    -- e.g. UPI txn ID, or "Paid to front desk"
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  verified_by uuid references public.profiles(id),
  paid_at timestamptz not null default now()
);

alter table public.payments enable row level security;

drop policy if exists "pay_select_own_or_admin" on public.payments;
create policy "pay_select_own_or_admin" on public.payments
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists "pay_insert_own" on public.payments;
create policy "pay_insert_own" on public.payments
  for insert with check (student_id = auth.uid());

drop policy if exists "pay_update_admin" on public.payments;
create policy "pay_update_admin" on public.payments
  for update using (public.is_admin());

-- 4. CERTIFICATES
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  cert_code text not null unique,         -- e.g. TS-2026-XXXX
  issued_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

drop policy if exists "cert_select_own_or_admin" on public.certificates;
create policy "cert_select_own_or_admin" on public.certificates
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists "cert_insert_admin" on public.certificates;
create policy "cert_insert_admin" on public.certificates
  for insert with check (public.is_admin());

-- 5. MAINTENANCE SETTINGS (single row, realtime-enabled)
create table if not exists public.maintenance_settings (
  id int primary key default 1,
  maintenance_mode boolean not null default false,
  maintenance_message text not null default 'We are currently performing scheduled maintenance. Please check back shortly.',
  maintenance_image_url text,
  estimated_completion timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  constraint single_row check (id = 1)
);

insert into public.maintenance_settings (id) values (1)
  on conflict (id) do nothing;

alter table public.maintenance_settings enable row level security;

drop policy if exists "maint_select_all" on public.maintenance_settings;
create policy "maint_select_all" on public.maintenance_settings
  for select using (true);                -- everyone must be able to check status

drop policy if exists "maint_update_admin" on public.maintenance_settings;
create policy "maint_update_admin" on public.maintenance_settings
  for update using (public.is_admin());

-- Enable realtime on this table (so admin toggle pushes instantly)
alter publication supabase_realtime add table public.maintenance_settings;

-- ============================================================
-- DONE.
-- ============================================================
