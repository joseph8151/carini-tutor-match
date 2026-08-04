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

### Sprint 3 — 실적 인증 & 구독 페이월
- **튜터 홈** (`/tutor`) — 구독 등급·받은 문의 수·인증 뱃지, 실적 인증 신청 폼
- **실적 인증 검수** (`/admin/verifications`) — 관리자 승인/반려 → 승인 시 인증 뱃지 발급
  및 공개 프로필·검색 노출 반영
- **구독 페이월** (`/tutor/subscription`) — 무료/프로/프리미엄, 모의 결제로 등급 변경
  (실서비스=토스/카카오페이 정기결제)
- **문의 수 제한** — 무료 등급 튜터는 최근 3건만 열람, 초과분은 잠금 + 업그레이드 CTA
- **관리자 데모 로그인** — 검수 큐 접근

### Sprint 4 — 락인 (수업 리포트·후기·D-day)
- **수업 리포트** — 튜터가 대화 스레드에서 작성(`ReportSection`), 학부모 대시보드에만 축적
- **학부모 대시보드** (`/parent`) — 레테 **D-day** 카운트다운(문의한 학원 기준),
  수업 리포트 타임라인, 후기 작성 대상 튜터
- **합격 후기 인증** — 학부모가 튜터 프로필에서 후기 작성, "실제 합격" 체크 시 **합격 인증 칩**
- **역할별 홈** — 학부모 로그인 → 대시보드로 진입

### Sprint 5 — 확장 (프리미엄·안전결제·모의 레테)
- **학부모 프리미엄** (`/parent/premium`) — 모의 결제로 가입, **우선 매칭권** 지급 +
  상세 합격 후기 열람 권한
- **우선 매칭권** — 문의 시 사용하면 튜터 문의함 상단 노출(⚡ 우선 문의)
- **결제 보호(에스크로)** — 스레드에서 첫 수업 안전결제 → 보관 → 수업 확인 시 정산
  (`PaymentBox`)
- **분쟁 중재** — 학부모/튜터가 분쟁 신청 → 관리자(`/admin/disputes`)가 환불/정산 결정
- **모의 레테** (`/mock-tests`) — 학원별 모의고사 신청, 대시보드에 일정 표시
- **상세 후기 게이팅** — 합격 인증 후기 본문은 프리미엄 학부모만 열람

> **Supabase 미설정 시**: 읽기 데이터는 `lib/seed.ts`, 로그인은 **데모 계정(학부모/튜터/운영자)**,
> 나머지 상태(메시징·구독·인증·리포트·후기·결제·분쟁·모의레테)는 인메모리 스토어
> (`lib/store.ts`)로 전체 흐름을 즉시 체험할 수 있습니다. 환경변수를 채우면 동일 코드가
> Supabase Auth/DB를 우선 사용합니다.

> E2E: 브라우저 시나리오 총 32건(Sprint 3: 11 · Sprint 4: 9 · Sprint 5: 12)으로 검증.

## 실행

```bash
npm install
cp .env.example .env.local   # (선택) Supabase 값 입력
npm run dev                  # http://localhost:3000
```

## 기술 스택

- Next.js 15 (App Router) · TypeScript · Tailwind CSS
- Supabase (Postgres · Auth · RLS) — `supabase/migrations/0001_init.sql`

## 데이터 계층 (Supabase / 인메모리 이중 백엔드)

`lib/store.ts`·`lib/data.ts`는 **환경변수 유무로 백엔드를 자동 선택**합니다.

- **Supabase 설정 시**: 인증 세션 클라이언트로 DB 조회(RLS 적용)가 단일 진실 소스.
  공개 데이터(튜터·후기·학원)는 anon 클라이언트, 관리자 작업(인증 검수·분쟁 중재)은
  service-role 키로 처리.
- **미설정 시(데모)**: `globalThis` 인메모리 스토어 — E2E/데모가 검증하는 실행 경로.

스키마 컬럼명은 `lib/types.ts` 필드명과 1:1로 맞춰 `select('*')` → 타입 매핑이 그대로 됩니다.

> 이 리포의 데모/E2E는 인메모리 경로에서 32건 시나리오로 검증됩니다. Supabase 경로는
> 동일 패턴(`lib/data.ts`)을 따르며 **라이브 프로젝트에서 최종 검증**이 필요합니다.

## DB 설정 (Supabase)

```bash
# 1) Supabase 프로젝트 생성 후 SQL Editor에서 순서대로 실행
#    supabase/migrations/0001_init.sql   (스키마 + RLS + auth 트리거)
#    supabase/seed.sql                    (학원·레테·일정·모의고사)
# 2) Auth > Providers 에서 Kakao 활성화 (client id/secret)
# 3) .env.local 채우기:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # 서버 전용 (관리자 작업)
```

가입 시 `handle_new_user` 트리거가 `users` 행을 자동 생성하고, `/onboarding`에서 역할을
설정합니다. RLS는 참여자/소유자 기준으로 문의·메시지·리포트·결제 등을 보호합니다.

## 다음 단계 (로드맵)

`docs/MVP.md` 7장 참고. **Sprint 1~5(전 범위) + Supabase 이중 백엔드 계층 구현 완료.**
남은 것: 라이브 Supabase 프로젝트에서 DB/RLS 최종 검증, 카카오 OAuth 실연동,
실결제(토스/카카오페이), 레테 D-day 알림톡/이메일, 메시지 Realtime 구독.
