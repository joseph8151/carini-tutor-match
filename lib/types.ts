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
}
