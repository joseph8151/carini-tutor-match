-- 카리니 튜터링 — 초기 스키마 (설계서 5장 기준)
-- 실행: Supabase SQL Editor 또는 `supabase db push`

create extension if not exists "pgcrypto";

-- ── 열거형 ────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('parent','tutor','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sub_tier as enum ('free','pro','premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verify_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_status as enum ('open','matched','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type match_status as enum ('active','done','disputed');
exception when duplicate_object then null; end $$;

-- ── 사용자 & 프로필 ───────────────────────────────────────
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  role user_role not null,
  name text not null,
  phone text,
  kakao_id text unique,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists parent_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  child_grade text,
  target_academy_ids uuid[] default '{}',
  target_test_date date,
  current_level text,
  is_premium boolean not null default false,
  premium_until timestamptz
);

create table if not exists tutor_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  bio text,
  regions text[] default '{}',
  subjects text[] default '{}',
  base_rate integer,
  avail_json jsonb default '{}'::jsonb,
  subscription_tier sub_tier not null default 'free',
  subscription_until timestamptz,
  rating_avg numeric(2,1) not null default 0,
  response_rate numeric(3,2) not null default 0,
  is_verified boolean not null default false
);

-- ── 학원 & 레테 ───────────────────────────────────────────
create table if not exists academies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  region text not null,
  description text
);

create table if not exists level_tests (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references academies(id) on delete cascade,
  name text not null,
  format_summary text,
  difficulty smallint check (difficulty between 1 and 5),
  updated_at date not null default current_date
);

create table if not exists test_schedules (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references academies(id) on delete cascade,
  test_date date not null,
  apply_deadline date,
  note text
);

-- ── 실적/인증 ─────────────────────────────────────────────
create table if not exists tutor_verifications (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references users(id) on delete cascade,
  academy_id uuid references academies(id) on delete set null,
  type text not null check (type in ('pass','career')),
  evidence_url text,
  status verify_status not null default 'pending',
  reviewer_id uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists tutor_badges (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references users(id) on delete cascade,
  academy_id uuid references academies(id) on delete cascade,
  label text not null,
  granted_at timestamptz not null default now()
);

-- ── 매칭 & 소통 ───────────────────────────────────────────
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references users(id) on delete cascade,
  tutor_id uuid not null references users(id) on delete cascade,
  academy_id uuid references academies(id) on delete set null,
  message text,
  status inquiry_status not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references inquiries(id) on delete set null,
  parent_id uuid not null references users(id) on delete cascade,
  tutor_id uuid not null references users(id) on delete cascade,
  started_at timestamptz not null default now(),
  status match_status not null default 'active'
);

-- ── 리포트 & 후기 (락인) ──────────────────────────────────
create table if not exists lesson_reports (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  tutor_id uuid not null references users(id) on delete cascade,
  date date not null default current_date,
  content_json jsonb default '{}'::jsonb,
  progress_note text,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete set null,
  parent_id uuid not null references users(id) on delete cascade,
  tutor_id uuid not null references users(id) on delete cascade,
  academy_id uuid references academies(id) on delete set null,
  rating smallint check (rating between 1 and 5),
  body text,
  is_verified_pass boolean not null default false,
  visibility text not null default 'public' check (visibility in ('public','premium_only')),
  created_at timestamptz not null default now()
);

-- ── 수익화 ────────────────────────────────────────────────
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan text not null check (plan in ('tutor_pro','tutor_premium','parent_premium')),
  status text not null default 'active',
  provider text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  match_id uuid references matches(id) on delete set null,
  type text not null check (type in ('subscription','first_lesson','service')),
  amount integer not null,
  status text not null default 'paid',
  provider_ref text,
  created_at timestamptz not null default now()
);

create table if not exists priority_passes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references users(id) on delete cascade,
  source text not null check (source in ('premium','reward')),
  used_at timestamptz,
  expires_at timestamptz
);

create table if not exists disputes (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  opened_by uuid not null references users(id) on delete cascade,
  reason text,
  status text not null default 'open' check (status in ('open','reviewing','resolved')),
  resolution text,
  created_at timestamptz not null default now()
);

-- ── 인덱스 ────────────────────────────────────────────────
create index if not exists idx_tutor_rank on tutor_profiles (subscription_tier, rating_avg desc);
create index if not exists idx_inquiries_tutor on inquiries (tutor_id, status);
create index if not exists idx_verifications_status on tutor_verifications (status);
create index if not exists idx_schedules_academy on test_schedules (academy_id, test_date);
create index if not exists idx_messages_inquiry on messages (inquiry_id, created_at);

-- ── RLS (기본 정책 골격) ──────────────────────────────────
-- 공개 읽기 대상: academies / level_tests / test_schedules
alter table academies enable row level security;
alter table level_tests enable row level security;
alter table test_schedules enable row level security;

do $$ begin
  create policy "public read academies" on academies for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read level_tests" on level_tests for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read schedules" on test_schedules for select using (true);
exception when duplicate_object then null; end $$;

-- 참고: users/inquiries/messages/lesson_reports 등 개인 데이터는
-- auth.uid() 기반 소유자 정책을 별도 마이그레이션에서 추가할 것.
