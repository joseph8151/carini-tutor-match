-- 수업 결제(샘플수업 / 정규 패키지) — 컬럼명은 lib/types.ts LessonPayment 와 1:1 정렬
-- 실행: Supabase SQL Editor 또는 `supabase db push`

do $$ begin create type lesson_product_type as enum ('sample','package'); exception when duplicate_object then null; end $$;
do $$ begin create type lesson_payment_status as enum ('pending','paid','failed','cancelled','refunded'); exception when duplicate_object then null; end $$;

create table if not exists lesson_payments (
  id uuid primary key default gen_random_uuid(),
  match_request_id uuid not null references match_requests(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  tutor_id uuid not null references users(id),
  tutor_name text not null default '',
  student_label text not null default '',
  product_type lesson_product_type not null,
  package_id text,
  lesson_schedule text,
  location text not null default '',
  duration_minutes integer not null default 0,
  amount integer not null,
  status lesson_payment_status not null default 'pending',
  provider text not null default 'mock',
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_lesson_payments_request on lesson_payments (match_request_id, created_at);
create index if not exists idx_lesson_payments_user on lesson_payments (user_id, created_at desc);

alter table lesson_payments enable row level security;
create policy "owner reads own lesson payments" on lesson_payments for select using (auth.uid() = user_id);
create policy "owner creates own lesson payments" on lesson_payments for insert with check (auth.uid() = user_id);
create policy "owner updates own lesson payments" on lesson_payments for update using (auth.uid() = user_id);

-- 운영자 전체 조회/정산은 서버의 service-role 키로 수행 → RLS 우회.
