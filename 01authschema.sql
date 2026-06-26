-- ============================================================
-- TS TECH PARK LMS — AUTH SCHEMA
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.
-- ============================================================

-- 1. PROFILES TABLE
-- Supabase Auth already manages auth.users (email, password, email
-- verification). We extend it with a public 'profiles' table that
-- holds app-specific data: name, role, status, phone, city, xp, etc.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  city text,
  role text not null default 'student' check (role in ('student','instructor','admin')),
  status text not null default 'active' check (status in ('active','pending','suspended')),
  xp integer not null default 0,
  streak integer not null default 1,
  hours_learned numeric not null default 0,
  certificates integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- Reads role/first_name/last_name/phone/city out of the signup
-- "options.data" metadata you pass from the client (see auth.js).
-- Instructors are created with status='pending' so an admin must
-- approve them before they can log in as instructor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, phone, city, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    case when coalesce(new.raw_user_meta_data->>'role','student') = 'instructor'
         then 'pending' else 'active' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. updated_at auto-touch
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- 4. ROW LEVEL SECURITY
alter table public.profiles enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Users can read their own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Users can update their own profile (but not role/status — see below)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Admins can read everyone
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

-- Admins can update everyone (approve instructors, suspend, etc.)
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- Only the trigger (security definer) inserts profiles; block direct inserts
drop policy if exists "profiles_no_direct_insert" on public.profiles;
create policy "profiles_no_direct_insert" on public.profiles
  for insert with check (false);

-- 5. PREVENT SELF-PROMOTION
-- A regular user's UPDATE policy above would technically let them
-- rewrite their own role/status via the client. Lock that down with
-- a trigger that ignores role/status changes unless done by an admin.
create or replace function public.protect_role_status()
returns trigger language plpgsql security definer as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_role_status on public.profiles;
create trigger trg_protect_role_status
  before update on public.profiles
  for each row execute procedure public.protect_role_status();

-- ============================================================
-- DONE. Next: run 02_app_schema.sql for courses/enrollments/etc.
-- ============================================================
