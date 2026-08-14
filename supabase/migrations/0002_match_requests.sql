-- 매칭 신청(하이브리드 튜터 매칭 플로우) — 컬럼명은 lib/types.ts MatchRequest 와 1:1 정렬
-- 실행: Supabase SQL Editor 또는 `supabase db push`

do $$ begin create type lesson_type as enum ('visit','online','either'); exception when duplicate_object then null; end $$;
do $$ begin create type tutor_preference as enum ('none','female','male','native'); exception when duplicate_object then null; end $$;
do $$ begin create type match_request_status as enum (
  'new','reviewing','tutor_contacting','tutor_confirmed','proposal_sent',
  'payment_pending','paid','lesson_scheduled','completed','cancelled'
); exception when duplicate_object then null; end $$;
do $$ begin create type match_recommendation_status as enum (
  'suggested','parent_selected','rejected','tutor_unavailable','confirmed'
); exception when duplicate_object then null; end $$;

create table if not exists match_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null, -- 비회원 신청 허용(nullable)
  parent_name text not null,
  mobile text not null,
  child_age text not null,
  child_grade text not null,
  location text not null,
  lesson_type lesson_type not null,
  english_level text not null,
  goals text[] not null default '{}',
  lessons_per_week text not null,
  preferred_days text[] not null default '{}',
  preferred_times text[] not null default '{}',
  tutor_preference tutor_preference not null default 'none',
  requested_tutor_id uuid references users(id),
  requested_tutor_name text,
  notes text,
  status match_request_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_match_requests_status on match_requests (status, created_at desc);
create index if not exists idx_match_requests_user on match_requests (user_id, created_at desc);

-- 운영자가 신청 1건당 최대 3명까지 추천 튜터를 매칭
create table if not exists match_recommendations (
  id uuid primary key default gen_random_uuid(),
  match_request_id uuid not null references match_requests(id) on delete cascade,
  tutor_id uuid not null references users(id) on delete cascade,
  tutor_name text not null default '',
  admin_reason text not null default '',
  available_schedule text,
  status match_recommendation_status not null default 'suggested',
  created_at timestamptz not null default now()
);
create index if not exists idx_match_recs_request on match_recommendations (match_request_id, created_at);

-- ── RLS ───────────────────────────────────────────────────
alter table match_requests enable row level security;
-- 비회원도 신청 가능(리드 폼). 검토/조회는 신청자 본인 또는 서버(service-role, 운영자)만.
create policy "anyone creates match request" on match_requests for insert with check (true);
create policy "owner reads own match request" on match_requests for select using (
  auth.uid() = user_id
);

alter table match_recommendations enable row level security;
create policy "owner reads own recommendations" on match_recommendations for select using (
  exists (select 1 from match_requests r where r.id = match_request_id and r.user_id = auth.uid())
);

-- 운영자 조회/작성(전체 match_requests, 추천 등록/상태 변경)은 서버의 service-role 키로 수행 → RLS 우회.
