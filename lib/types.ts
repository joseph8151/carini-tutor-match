export type Role = "parent" | "tutor" | "admin";

export type SubscriptionTier = "free" | "pro" | "premium";

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface Academy {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
}

export interface LevelTest {
  id: string;
  academy_id: string;
  name: string;
  format_summary: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  updated_at: string;
}

export interface TestSchedule {
  id: string;
  academy_id: string;
  test_date: string; // ISO date
  apply_deadline: string; // ISO date
  note: string;
}

export interface TutorBadge {
  academy_id: string;
  label: string;
}

export interface SessionUser {
  id: string;
  name: string;
  role: Role | null; // null = 로그인했지만 역할 미선택(온보딩 필요)
  demo?: boolean;
}

export interface Verification {
  id: string;
  tutor_id: string;
  tutor_name: string;
  academy_slug: string;
  academy_name: string;
  type: "pass" | "career";
  evidence: string;
  status: VerificationStatus;
  created_at: string;
  reviewed_at?: string;
}

export interface Inquiry {
  id: string;
  parent_id: string;
  parent_name: string;
  tutor_id: string;
  tutor_name: string;
  academy_slug?: string;
  status: "open" | "matched" | "closed";
  priority: boolean; // 우선 매칭권 사용 문의
  created_at: string;
  last_body: string;
}

export type PaymentStatus = "held" | "released" | "disputed" | "refunded";

export interface Payment {
  id: string;
  inquiry_id: string;
  parent_id: string;
  tutor_id: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}

export interface Dispute {
  id: string;
  payment_id: string;
  inquiry_id: string;
  opened_by: string;
  reason: string;
  status: "open" | "resolved";
  resolution?: string;
  created_at: string;
}

export interface MockTest {
  id: string;
  academy_slug: string;
  name: string;
  price: number;
  date: string;
}

export interface MockBooking {
  id: string;
  parent_id: string;
  mock_id: string;
  mock_name: string;
  academy_slug: string;
  date: string;
  created_at: string;
}

export interface PassInfo {
  granted: number;
  used: number;
}

export interface Message {
  id: string;
  inquiry_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface LessonReport {
  id: string;
  inquiry_id: string;
  tutor_id: string;
  tutor_name: string;
  parent_id: string;
  academy_slug?: string;
  date: string; // 수업일
  content: string; // 수업 내용
  progress_note: string; // 진도/코멘트
  created_at: string;
}

export interface Review {
  id: string;
  parent_id: string;
  parent_name: string;
  tutor_id: string;
  tutor_name: string;
  academy_slug?: string;
  rating: number; // 1~5
  body: string;
  is_verified_pass: boolean; // 실제 합격 인증
  created_at: string;
}

// ── 매칭 신청 (하이브리드 튜터 매칭 플로우) ────────────────
export type LessonType = "visit" | "online" | "either";
export type TutorPreference = "none" | "female" | "male" | "native";

export type MatchRequestStatus =
  | "new"
  | "reviewing"
  | "tutor_contacting"
  | "tutor_confirmed"
  | "proposal_sent"
  | "payment_pending"
  | "paid"
  | "lesson_scheduled"
  | "completed"
  | "cancelled";

export interface MatchRequest {
  id: string;
  user_id?: string; // 로그인 사용자면 연결, 비회원 신청도 허용
  parent_name: string;
  mobile: string;
  child_age: string;
  child_grade: string;
  location: string;
  lesson_type: LessonType;
  english_level: string;
  goals: string[];
  lessons_per_week: string;
  preferred_days: string[];
  preferred_times: string[];
  tutor_preference: TutorPreference;
  requested_tutor_id?: string;
  requested_tutor_name?: string;
  notes?: string;
  status: MatchRequestStatus;
  created_at: string;
  updated_at: string;
}

export type MatchRecommendationStatus =
  | "suggested"
  | "parent_selected"
  | "rejected"
  | "tutor_unavailable"
  | "confirmed";

export interface MatchRecommendation {
  id: string;
  match_request_id: string;
  tutor_id: string;
  tutor_name: string;
  admin_reason: string;
  available_schedule?: string;
  status: MatchRecommendationStatus;
  created_at: string;
}

// ── 수업 결제 (샘플수업 / 정규 패키지) ──────────────────────
// 기존 Payment(문의 에스크로 결제)와 별개 도메인 — 매칭 확정 후 수업 결제를 다룬다.
export type LessonPaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";
export type LessonProductType = "sample" | "package";

export interface LessonPayment {
  id: string;
  match_request_id: string;
  user_id?: string;
  tutor_id: string;
  tutor_name: string;
  student_label: string; // 표시용 (예: "이수정님 자녀 · 만 5세")
  product_type: LessonProductType;
  package_id?: string; // product_type === "package" 일 때
  lesson_schedule?: string; // 표시용 자유 텍스트 (예: "화요일 오후 4시")
  location: string;
  duration_minutes: number;
  amount: number;
  status: LessonPaymentStatus;
  provider: string; // 결제 Provider 식별자 (예: "mock", "toss")
  external_ref?: string;
  created_at: string;
  updated_at: string;
}

export interface DiagnosisRecord {
  id: string;
  user_id: string;
  overall: number;
  percentile: number;
  level: number;
  reading: number;
  vocab: number;
  grammar: number;
  pass_ready: boolean;
  recommendation: string;
  created_at: string;
}

export interface Tutor {
  id: string;
  name: string;
  bio: string;
  regions: string[];
  subjects: string[];
  academy_slugs: string[]; // 전문 학원
  base_rate: number; // 회당(원)
  rating_avg: number;
  response_rate: number; // 0~1
  subscription_tier: SubscriptionTier;
  is_verified: boolean;
  badges: TutorBadge[];
  pass_count: number; // 인증된 합격 실적 수
  // 유아·초등 원어민 튜터링 브랜드 표시용 (선택) — 없으면 UI에서 해당 항목만 생략
  is_native?: boolean;
  tutor_type?: "native" | "bilingual" | "korean";
  country?: string;
  university?: string;
  major?: string;
  years_experience?: number;
  age_focus?: string; // 예: "만 3–7세"
  age_bands?: ("toddler" | "kinder" | "elementary" | "grade4plus")[]; // 검색 필터용
  lesson_modes?: ("visit" | "online")[];
  availability?: "available" | "limited" | "waitlist";
}

export const AGE_BAND_LABELS: Record<NonNullable<Tutor["age_bands"]>[number], string> = {
  toddler: "2–4세",
  kinder: "5–7세",
  elementary: "Elementary",
  grade4plus: "Grade 4+",
};
