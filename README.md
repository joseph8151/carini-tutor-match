# 카리니 튜터링

대치동·분당·광교 상위권 영어학원(MI·트윈클·에디센·피아이) **레벨테스트(레테)·프랩 전문** 튜터 매칭 플랫폼.

전체 제품 설계는 [`docs/MVP.md`](docs/MVP.md) 참고.

## 현재 구현 (Sprint 1 + 튜터 브라우징)

- **랜딩** (`/`) — 히어로, 학원 허브 진입, 다가오는 레테 일정, 추천 튜터
- **학원별 레테 허브** (`/academy/[slug]`) — 레테 유형·일정·전문 인증 튜터, SEO 메타데이터
- **튜터 찾기** (`/tutors`) — 학원/지역/과목/인증 필터 + 랭킹 노출
- **튜터 상세** (`/tutors/[id]`) — 인증 뱃지·합격 실적·응답률·문의 CTA
- **로그인 스텁** (`/login`) — 카카오 OAuth 연결 예정
- **검색 랭킹** — `구독등급 가중치 + 인증 실적 + 평점 + 응답률` (`lib/data.ts`)

> Supabase 환경변수가 없으면 `lib/seed.ts` 목업 데이터로 즉시 동작합니다.
> 환경변수를 채우면 동일 코드가 Supabase를 우선 조회합니다.

## 실행

```bash
npm install
cp .env.example .env.local   # (선택) Supabase 값 입력
npm run dev                  # http://localhost:3000
```

## 기술 스택

- Next.js 15 (App Router) · TypeScript · Tailwind CSS
- Supabase (Postgres · Auth · Storage · Realtime) — `supabase/migrations/0001_init.sql`

## DB

```bash
# Supabase 프로젝트에 스키마 + 시드 적용
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/seed.sql
```

## 다음 단계 (로드맵)

`docs/MVP.md` 7장 참고. 다음: 카카오 OAuth 연결 → 인앱 문의/메시징(Sprint 2) → 인증 검수·구독 결제(Sprint 3).
