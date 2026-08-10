-- 카리니 튜터링 — 스키마 (앱 데이터 모델과 1:1 정렬)
-- 실행: Supabase SQL Editor 또는 `supabase db push`
-- 주: 컬럼명은 lib/types.ts 필드명과 동일하게 맞춰 select('*') → 타입 매핑이 그대로 되도록 설계.

create extension if not exists "pgcrypto";

-- ── 열거형 ────────────────────────────────────────────────
do $$ begin create type user_role as enum ('parent','tutor','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type sub_tier as enum ('free','pro','premium'); exception when duplicate_object then null; end $$;
do $$ begin create type verify_status as enum ('pending','approved','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type inquiry_status as enum ('open','matched','closed'); exception when duplicate_object then null; end $$;
do $$ begin create type payment_status as enum ('held','released','disputed','refunded'); exception when duplicate_object then null; end $$;

-- ── 사용자 ────────────────────────────────────────────────
-- id = auth.users.id. role 은 온보딩에서 선택하므로 nullable.
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role,
  name text not null default '사용자',
  email text,
  created_at timestamptz not null default now()
);

-- auth 가입 시 users 행 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', '사용자'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ── 학원 / 레테 / 모의 (공개 읽기) ────────────────────────
create table if not exists academies (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, region text not null, description text
);
create table if not exists level_tests (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references academies(id) on delete cascade,
  name text not null, format_summary text, difficulty smallint check (difficulty between 1 and 5),
  updated_at date not null default current_date
);
create table if not exists test_schedules (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references academies(id) on delete cascade,
  test_date date not null, apply_deadline date, note text
);
create table if not exists mock_tests (
  id text primary key,
  academy_slug text not null, name text not null, price integer not null, date date not null
);

-- ── 튜터 (공개 읽기) ──────────────────────────────────────
create table if not exists tutor_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  name text not null default '튜터',
  bio text,
  regions text[] default '{}', subjects text[] default '{}', academy_slugs text[] default '{}',
  base_rate integer default 0,
  rating_avg numeric(2,1) not null default 0,
  response_rate numeric(3,2) not null default 0,
  subscription_tier sub_tier not null default 'free',
  is_verified boolean not null default false,
  pass_count integer not null default 0
);
create table if not exists tutor_badges (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references users(id) on delete cascade,
  academy_id text not null,  -- academy slug
  label text not null
);

-- ── 실적 인증 검수 ────────────────────────────────────────
create table if not exists tutor_verifications (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references users(id) on delete cascade,
  tutor_name text not null default '',
  academy_slug text not null, academy_name text not null,
  type text not null check (type in ('pass','career')),
  evidence text,
  status verify_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ── 문의 / 메시지 ─────────────────────────────────────────
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references users(id) on delete cascade,
  parent_name text not null default '',
  tutor_id uuid not null references users(id) on delete cascade,
  tutor_name text not null default '',
  academy_slug text,
  status inquiry_status not null default 'open',
  priority boolean not null default false,
  last_body text default '',
  created_at timestamptz not null default now()
);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ── 수업 리포트 / 후기 ────────────────────────────────────
create table if not exists lesson_reports (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  tutor_id uuid not null references users(id) on delete cascade,
  tutor_name text not null default '',
  parent_id uuid not null references users(id) on delete cascade,
  academy_slug text,
  date date not null default current_date,
  content text not null,
  progress_note text default '',
  created_at timestamptz not null default now()
);
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references users(id) on delete cascade,
  parent_name text not null default '',
  tutor_id uuid not null references users(id) on delete cascade,
  tutor_name text not null default '',
  academy_slug text,
  rating smallint not null check (rating between 1 and 5),
  body text,
  is_verified_pass boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── 결제 보호 / 분쟁 ──────────────────────────────────────
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  parent_id uuid not null references users(id) on delete cascade,
  tutor_id uuid not null references users(id) on delete cascade,
  amount integer not null,
  status payment_status not null default 'held',
  created_at timestamptz not null default now()
);
create table if not exists disputes (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  opened_by uuid not null references users(id) on delete cascade,
  reason text,
  status text not null default 'open' check (status in ('open','resolved')),
  resolution text,
  created_at timestamptz not null default now()
);

-- ── 학부모 프리미엄 / 우선 매칭권 / 모의 신청 ─────────────
create table if not exists parent_premium (
  parent_id uuid primary key references users(id) on delete cascade,
  premium boolean not null default true
);
create table if not exists parent_passes (
  parent_id uuid primary key references users(id) on delete cascade,
  granted integer not null default 0,
  used integer not null default 0
);
create table if not exists mock_bookings (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references users(id) on delete cascade,
  mock_id text not null references mock_tests(id),
  mock_name text not null, academy_slug text not null, date date not null,
  created_at timestamptz not null default now(),
  unique (parent_id, mock_id)
);

create table if not exists diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  overall integer not null,
  percentile integer not null,
  level integer not null,
  reading integer not null,
  vocab integer not null,
  grammar integer not null,
  pass_ready boolean not null default false,
  recommendation text,
  created_at timestamptz not null default now()
);
create index if not exists idx_diagnoses_user on diagnoses (user_id, created_at desc);

-- ── 인덱스 ────────────────────────────────────────────────
create index if not exists idx_tutor_rank on tutor_profiles (subscription_tier, rating_avg desc);
create index if not exists idx_inquiries_parent on inquiries (parent_id, created_at desc);
create index if not exists idx_inquiries_tutor on inquiries (tutor_id, priority desc, created_at desc);
create index if not exists idx_messages_inquiry on messages (inquiry_id, created_at);
create index if not exists idx_verifications_status on tutor_verifications (status);
create index if not exists idx_reviews_tutor on reviews (tutor_id, created_at desc);
create index if not exists idx_reports_parent on lesson_reports (parent_id, date desc);
create index if not exists idx_payments_inquiry on payments (inquiry_id, created_at desc);

-- ── RLS ───────────────────────────────────────────────────
-- 공개 읽기 테이블
do $$
declare t text;
begin
  foreach t in array array[
    'academies','level_tests','test_schedules','mock_tests','tutor_profiles','tutor_badges','reviews'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format($p$create policy "public read %1$s" on %1$I for select using (true)$p$, t);
  end loop;
end $$;

-- 본인 데이터만: 참여자(parent/tutor) 또는 소유자
alter table users enable row level security;
create policy "read own user" on users for select using (auth.uid() = id);
create policy "upsert own user" on users for insert with check (auth.uid() = id);
create policy "update own user" on users for update using (auth.uid() = id);

-- 튜터가 자기 프로필/뱃지/인증을 관리
create policy "tutor writes own profile" on tutor_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tutor reads own verifications" on tutor_verifications for select
  using (auth.uid() = tutor_id);
create policy "tutor inserts own verification" on tutor_verifications for insert
  with check (auth.uid() = tutor_id);

alter table inquiries enable row level security;
create policy "participant reads inquiry" on inquiries for select
  using (auth.uid() = parent_id or auth.uid() = tutor_id);
create policy "parent creates inquiry" on inquiries for insert with check (auth.uid() = parent_id);
create policy "participant updates inquiry" on inquiries for update
  using (auth.uid() = parent_id or auth.uid() = tutor_id);

alter table messages enable row level security;
create policy "participant reads messages" on messages for select using (
  exists (select 1 from inquiries i where i.id = inquiry_id
          and (i.parent_id = auth.uid() or i.tutor_id = auth.uid())));
create policy "participant sends message" on messages for insert with check (auth.uid() = sender_id);

alter table lesson_reports enable row level security;
create policy "participant reads report" on lesson_reports for select
  using (auth.uid() = parent_id or auth.uid() = tutor_id);
create policy "tutor writes report" on lesson_reports for insert with check (auth.uid() = tutor_id);

-- reviews 는 공개 읽기(위) + 학부모 본인 작성
create policy "parent writes review" on reviews for insert with check (auth.uid() = parent_id);

alter table payments enable row level security;
create policy "participant reads payment" on payments for select
  using (auth.uid() = parent_id or auth.uid() = tutor_id);
create policy "parent creates payment" on payments for insert with check (auth.uid() = parent_id);
create policy "participant updates payment" on payments for update
  using (auth.uid() = parent_id or auth.uid() = tutor_id);

alter table disputes enable row level security;
create policy "participant reads dispute" on disputes for select using (
  exists (select 1 from payments p where p.id = payment_id
          and (p.parent_id = auth.uid() or p.tutor_id = auth.uid())));
create policy "participant opens dispute" on disputes for insert with check (auth.uid() = opened_by);

alter table parent_premium enable row level security;
create policy "own premium" on parent_premium for all
  using (auth.uid() = parent_id) with check (auth.uid() = parent_id);
alter table parent_passes enable row level security;
create policy "own passes" on parent_passes for all
  using (auth.uid() = parent_id) with check (auth.uid() = parent_id);
alter table mock_bookings enable row level security;
create policy "own bookings" on mock_bookings for all
  using (auth.uid() = parent_id) with check (auth.uid() = parent_id);
alter table diagnoses enable row level security;
create policy "own diagnoses" on diagnoses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 관리자 작업(인증 검수/분쟁 중재)은 서버의 service-role 키로 수행 → RLS 우회.
-- (SUPABASE_SERVICE_ROLE_KEY, 서버 전용)

