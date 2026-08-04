# 카리니 튜터링

대치동·분당·광교 상위권 영어학원(MI·트윈클·에디센·피아이) **레벨테스트(레테)·프랩 전문** 튜터 매칭 플랫폼.

전체 제품 설계는 [`docs/MVP.md`](docs/MVP.md) 참고.

## 현재 구현

### Sprint 1 — 탐색
- **랜딩** (`/`) — 히어로, 학원 허브 진입, 다가오는 레테 일정, 추천 튜터
- **학원별 레테 허브** (`/academy/[slug]`) — 레테 유형·일정·전문 인증 튜터, SEO 메타데이터(SSG)
- **튜터 찾기** (`/tutors`) — 학원/지역/과목/인증 필터 + 랭킹 노출
- **튜터 상세** (`/tutors/[id]`) — 인증 뱃지·합격 실적·응답률
- **검색 랭킹** — `구독등급 가중치 + 인증 실적 + 평점 + 응답률` (`lib/data.ts`)

### Sprint 2 — 로그인 & 인앱 문의
- **카카오 로그인** (`/login`) — Supabase Auth OAuth (`signInWithOAuth`) + `/auth/callback` 코드 교환
- **역할 선택** (`/onboarding`) — 학부모/튜터 분리, `users` 테이블 기록
- **세션 미들웨어** — Supabase 세션 토큰 갱신 (`middleware.ts`)
- **인앱 문의** — 튜터 상세에서 학부모가 문의 생성(연락처 노출 없음)
- **메시징** (`/inbox`, `/inbox/[id]`) — 문의함 목록 + 실시간(near-live) 대화 스레드
- **인증/권한** — 비로그인 시 로그인 리다이렉트, 대화는 참여자만 열람

> **Supabase 미설정 시**: 읽기 데이터는 `lib/seed.ts`, 로그인은 **데모 계정(학부모/튜터)**,
> 메시징은 인메모리 스토어(`lib/store.ts`)로 전체 흐름을 즉시 체험할 수 있습니다.
> 환경변수를 채우면 동일 코드가 Supabase Auth/DB를 우선 사용합니다.

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

`docs/MVP.md` 7장 참고. 다음 **Sprint 3**: 튜터 실적 인증 신청 + 관리자 검수 + 뱃지 발급,
튜터 구독 결제(토스/카카오페이) 및 노출·문의 수 제한 실동작.
이후: 인메모리 메시징 → Supabase `inquiries`/`messages` + Realtime 구독 전환.
