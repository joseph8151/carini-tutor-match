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
