-- 일정 변경 요청 — 부모는 튜터 캘린더를 직접 수정하지 않고 운영자에게 요청만 남긴다.
-- 실행: Supabase SQL Editor 또는 `supabase db push`

create table if not exists reschedule_requests (
  id uuid primary key default gen_random_uuid(),
  lesson_payment_id uuid not null references lesson_payments(id) on delete cascade,
  match_request_id uuid not null references match_requests(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  note text not null,
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);
create index if not exists idx_reschedule_requests_match on reschedule_requests (match_request_id, created_at);

alter table reschedule_requests enable row level security;
create policy "owner reads own reschedule requests" on reschedule_requests for select using (auth.uid() = user_id);
create policy "owner creates own reschedule requests" on reschedule_requests for insert with check (auth.uid() = user_id);

-- 운영자 조회/처리는 서버의 service-role 키로 수행 → RLS 우회.
