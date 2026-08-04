# 카리니 튜터링 — MVP 설계서

> 대치동·분당·광교 상위권 영어학원(MI, 트윈클, 에디센, 피아이 등) **레벨테스트(레테)·프랩 전문** 튜터 매칭 플랫폼
> 핵심 목표: **매칭 후에도 플랫폼 안에서 계속 활동 → 카톡 이탈 최소화**

---

## 0. 제품 원칙 (설계 기준)

1. **레테 특화** — 일반 과외 매칭이 아니라 "학원 X 레테 합격"이라는 명확한 목표 단위로 매칭·후기·리포트가 돌아간다.
2. **락인(Lock-in) 우선** — 후기 인증·수업 리포트·대시보드·우선매칭권을 플랫폼 안에서만 제공해서 카톡으로 빠질 이유를 제거한다.
3. **구독 우선, 수수료 최소** — 튜터 구독이 메인 매출. 거래 수수료는 첫 수업만 또는 0에 수렴시켜 튜터가 플랫폼을 떠날 이유를 없앤다.
4. **신뢰가 곧 전환율** — "이 튜터가 실제로 그 학원 레테를 통과시켰다"는 증거(인증 뱃지)가 프리미엄 노출의 근거가 된다.

---

## 1. 페이지 / 화면 구조

### 공용 (비로그인 포함)
| 화면 | 설명 |
|---|---|
| 랜딩 | "우리 아이 목표 학원 레테, 합격시킨 튜터를 찾아드립니다" 히어로 + 학원별 진입 |
| 학원별 허브 (`/academy/[slug]`) | 학원(MI/트윈클/에디센/피아이)별 레테 개요·최신 유형·소속 인증 튜터 목록. **SEO 핵심 유입 페이지** |
| 튜터 검색/리스트 | 지역·학원·과목·레벨·가격·평점 필터 |
| 튜터 상세 프로필 | 인증 뱃지, 학원별 합격 실적, 후기, 요금, 가능 시간, 문의 CTA |
| 로그인/회원가입 | 학부모/튜터 역할 선택, 소셜(카카오) 로그인 |

### 학부모 측 (`/parent/...`)
| 화면 | 우선순위 |
|---|---|
| 온보딩 (아이 학년·목표 학원·희망 레테 일정·현재 레벨) | P0 |
| 튜터 탐색 & 문의하기 | P0 |
| 문의/채팅 인박스 (플랫폼 내 메시징) | P0 |
| 내 매칭 현황 (진행중/완료 수업) | P0 |
| **학부모 대시보드** — 수업 리포트 타임라인, 진도, 레테 D-day | P1 (락인 핵심) |
| 합격 후기 열람 (프리미엄 전용 상세 후기) | P1 |
| 레테 일정 알림 & 캘린더 | P1 |
| 결제/영수증, 분쟁 접수 | P1 |
| 우선 매칭권 사용(다음 레테/다음 학기) | P2 |
| 모의 레테 신청 | P2 |

### 튜터 측 (`/tutor/...`)
| 화면 | 우선순위 |
|---|---|
| 온보딩 (경력·가능 지역·전문 학원·요금) | P0 |
| 프로필 편집 | P0 |
| **실적/후기 인증 신청** (학원 합격 증빙 업로드 → 관리자 검수) | P0 (신뢰의 근간) |
| 문의 인박스 & 응답 | P0 |
| **수업 리포트 작성** (템플릿 기반, 제출 시 학부모 대시보드 반영) | P1 (락인 핵심) |
| 구독 관리 (무료/프로/프리미엄 업그레이드·결제) | P1 |
| 노출/문의 통계 대시보드 | P2 |
| 실적 배지 관리 | P2 |

### 관리자 측 (`/admin/...`)
| 화면 | 우선순위 |
|---|---|
| 인증 심사 큐 (실적·합격 증빙 승인/반려) | P0 |
| 사용자/신고/분쟁 중재 | P1 |
| 학원·레테 유형 정보 CMS | P1 |
| 구독/결제/정산 현황 | P1 |

---

## 2. 핵심 기능 리스트 (우선순위)

**P0 (MVP 필수)**
- 역할 기반 회원가입/로그인 (카카오)
- 학원별 허브 + 튜터 검색/필터/상세
- 플랫폼 내 문의·1:1 메시징 (연락처 노출 차단 → 이탈 방지의 1차 관문)
- 튜터 실적/합격 인증 신청 + 관리자 검수 + **인증 뱃지**
- 튜터 구독 티어(무료/프로/프리미엄)와 그에 따른 **노출·문의 수 제한 로직**

**P1 (락인·수익화 강화)**
- 수업 리포트 → 학부모 대시보드 (플랫폼 내 전용)
- 합격 후기 인증 시스템 (검증된 후기만 상세 공개, 프리미엄 열람)
- 레테 일정 알림 / D-day
- 결제(첫 수업/구독) + 분쟁·결제 보호(에스크로 유사)
- 학원별 최신 레테 유형·후기 (구독자 전용 콘텐츠)

**P2 (리텐션·부가매출)**
- 우선 매칭권 (다음 레테/학기)
- 모의 레테·첨삭·컨설팅 중개
- 튜터 통계 대시보드, 랭킹

---

## 3. 수익 모델 작동 플로우

### (A) 튜터 구독 — 메인 매출
```
무료:   프로필 노출 O · 문의 월 3건 · 리포트/뱃지 제한
프로(월 구독):     검색 상위 노출 · 문의 무제한 · 리포트 기능 · 통계
프리미엄(월 구독):  최상위 고정 노출 · 학원별 전문 뱃지 강조 · 실적 하이라이트 · 우선 매칭권 공급
```
- **작동**: 문의 한도 소진 → "프로 업그레이드 시 무제한" 페이월. 검색 랭킹 = `구독등급 가중치 + 인증실적 + 평점 + 응답률`.
- 튜터가 프리미엄일수록 노출·전환이 오르므로 **매출이 곧 노출**이라는 명확한 인센티브 구조.

### (B) 학부모 프리미엄 구독
```
무료:   검색·문의·기본 매칭
프리미엄(월 구독): 우선 매칭 · 상세 합격 후기 전문 열람 · 레테 일정 알림 · 모의 레테 이용권
```

### (C) 거래 수수료 (최소)
- **첫 수업 결제 1회만** 소액 수수료(예 5~10%) 또는 정착 초기엔 0%. 이후 반복 결제는 무수수료 → 튜터 이탈 방지.

### (D) 부가 서비스 중개
- 모의 레테 응시료, 첨삭/컨설팅 건별 중개 마진.

**매출 우선순위**: 튜터 구독(A) > 학부모 구독(B) > 부가(D) > 수수료(C).

---

## 4. MVP 최소 기능 vs 이후 추가

| 구분 | 지금 만든다 (MVP) | 나중에 |
|---|---|---|
| 계정 | 카카오 로그인, 역할 분리 | 이메일/문자 인증 고도화 |
| 탐색 | 학원 허브, 검색·필터, 튜터 상세 | AI 추천 매칭 |
| 소통 | 플랫폼 내 문의·메시징 | 화상수업, 파일 공유 |
| 신뢰 | 실적 인증 신청+관리자 승인+뱃지 | 자동 증빙 OCR 검증 |
| 수익 | 튜터 구독 티어 + 노출/문의 제한 | 학부모 구독, 부가 중개 |
| 리포트 | 간단 수업 리포트 → 학부모 대시보드 | 진도 그래프, 자동 요약 |
| 결제 | (초기) 구독 결제만 | 에스크로, 분쟁 자동중재, 정산 |
| 콘텐츠 | 학원별 레테 정보 정적 페이지 | 구독자 전용 최신 후기 피드 |

> **MVP의 승부처**: `학원 허브 → 인증 튜터 → 플랫폼 내 문의 → (락인) 대시보드/리포트`. 이 한 줄이 끊기지 않게 만드는 것이 1차 목표.

---

## 5. 주요 DB 테이블 설계 (PostgreSQL)

```sql
-- 사용자 & 역할
users            (id, role[parent|tutor|admin], name, phone, kakao_id, email, created_at)
parent_profiles  (user_id FK, child_grade, target_academy_ids[], target_test_date, current_level, is_premium, premium_until)
tutor_profiles   (user_id FK, bio, regions[], subjects[], base_rate, avail_json,
                  subscription_tier[free|pro|premium], subscription_until,
                  rating_avg, response_rate, is_verified)

-- 학원 & 레테
academies        (id, name, slug, region, description)
level_tests      (id, academy_id FK, name, format_summary, difficulty, updated_at)  -- 학원별 레테 유형
test_schedules   (id, academy_id FK, test_date, apply_deadline, note)               -- 일정 알림 소스

-- 실적/인증
tutor_verifications (id, tutor_id FK, academy_id FK, type[pass|career], evidence_url,
                     status[pending|approved|rejected], reviewer_id, reviewed_at)
tutor_badges        (id, tutor_id FK, academy_id FK, label, granted_at)             -- 승인 시 발급

-- 매칭 & 소통
inquiries        (id, parent_id FK, tutor_id FK, academy_id FK, message, status[open|matched|closed], created_at)
messages         (id, inquiry_id FK, sender_id FK, body, read_at, created_at)
matches          (id, inquiry_id FK, parent_id, tutor_id, started_at, status[active|done|disputed])

-- 리포트 & 후기 (락인)
lesson_reports   (id, match_id FK, tutor_id, date, content_json, progress_note, created_at)  -- 학부모 대시보드에만 노출
reviews          (id, match_id FK, parent_id, tutor_id, academy_id, rating, body,
                  is_verified_pass, visibility[public|premium_only], created_at)

-- 수익화
subscriptions    (id, user_id FK, plan[tutor_pro|tutor_premium|parent_premium], status,
                  provider, current_period_end, created_at)
payments         (id, user_id FK, match_id?, type[subscription|first_lesson|service], amount, status, provider_ref, created_at)
priority_passes  (id, parent_id FK, source[premium|reward], used_at, expires_at)             -- 우선 매칭권
disputes         (id, match_id FK, opened_by, reason, status[open|reviewing|resolved], resolution, created_at)
```

인덱스 포인트: `tutor_profiles(subscription_tier, rating_avg)`, `inquiries(tutor_id, status)`, `tutor_verifications(status)`, `test_schedules(academy_id, test_date)`.

---

## 6. 기술 스택 (빠른 구축 우선)

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js (App Router) + TypeScript** | SSR로 학원 허브 SEO + 단일 코드베이스 |
| UI | Tailwind CSS + shadcn/ui | 빠른 반응형, 모바일 우선 |
| DB/백엔드 | **Supabase (Postgres + Auth + Storage + RLS)** | 인증·DB·파일(증빙 업로드)·실시간 메시징 한 번에, 초기 개발 속도 최상 |
| 인증 | 카카오 OAuth (Supabase Auth) | 국내 사용자 전환율 |
| 결제 | **토스페이먼츠 / 카카오페이 (정기결제)** | 국내 구독 결제 표준 |
| 메시징 | Supabase Realtime | 별도 서버 없이 인앱 채팅 |
| 알림 | 카카오 알림톡 + 이메일(Resend) | 레테 D-day·리포트 알림 |
| 배포 | Vercel + Supabase Cloud | 무설정 배포 |

> 팀이 익숙하면 대안: Postgres+Prisma+NextAuth 직접 구성. 단, **속도 우선이면 Supabase 강력 추천.**

---

## 7. 개발 로드맵 (첫 버전 순서)

**스프린트 1 — 기반 (1~2주)**
1. 스키마·Supabase 세팅, 카카오 로그인, 역할 분리
2. 학원 데이터 시드(MI/트윈클/에디센/피아이) + 학원 허브 페이지(SEO)

**스프린트 2 — 탐색·매칭 (2주)**
3. 튜터 프로필 CRUD + 검색/필터/상세
4. 문의 → 인앱 메시징 (연락처 노출 차단)

**스프린트 3 — 신뢰·수익화 (2주)**
5. 실적 인증 신청 + 관리자 검수 + 뱃지
6. 튜터 구독 티어 결제 + **노출/문의 제한 랭킹 로직**

**스프린트 4 — 락인 (2주)**
7. 수업 리포트 → 학부모 대시보드
8. 합격 후기 인증 + 레테 일정 알림(D-day)

**스프린트 5 — 확장 (이후)**
9. 결제 보호/분쟁 중재, 학부모 프리미엄, 우선 매칭권
10. 모의 레테·부가 서비스 중개, 튜터 통계

> **출시 최소선(Launchable MVP) = 스프린트 1~3.** 여기까지면 "학원 허브 → 인증 튜터 → 인앱 문의 → 튜터 구독"으로 매출과 락인의 뼈대가 돈다. 스프린트 4가 카톡 이탈 방지의 결정타.
