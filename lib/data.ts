import { getSupabase } from "./supabase";
import {
  academies as seedAcademies,
  levelTests as seedLevelTests,
  testSchedules as seedSchedules,
  tutors as seedTutors,
} from "./seed";
import type { Academy, LevelTest, TestSchedule, Tutor, SubscriptionTier } from "./types";

// ── 검색 랭킹 ─────────────────────────────────────────────
// 구독등급 가중치 + 인증 실적 + 평점 + 응답률 (설계서 3장 수익 플로우와 일치)
const TIER_WEIGHT: Record<SubscriptionTier, number> = { premium: 100, pro: 50, free: 0 };

export function tutorScore(t: Tutor): number {
  return (
    TIER_WEIGHT[t.subscription_tier] +
    (t.is_verified ? 20 : 0) +
    t.pass_count * 2 +
    t.rating_avg * 4 +
    t.response_rate * 10
  );
}

function rank(list: Tutor[]): Tutor[] {
  return [...list].sort((a, b) => tutorScore(b) - tutorScore(a));
}

// ── 학원 ─────────────────────────────────────────────────
export async function getAcademies(): Promise<Academy[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("academies").select("*").order("name");
    if (!error && data) return data as Academy[];
  }
  return seedAcademies;
}

export async function getAcademyBySlug(slug: string): Promise<Academy | null> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("academies").select("*").eq("slug", slug).maybeSingle();
    if (!error && data) return data as Academy;
  }
  return seedAcademies.find((a) => a.slug === slug) ?? null;
}

export async function getLevelTests(academyId: string): Promise<LevelTest[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("level_tests").select("*").eq("academy_id", academyId);
    if (!error && data) return data as LevelTest[];
  }
  return seedLevelTests.filter((t) => t.academy_id === academyId);
}

export async function getSchedules(academyId?: string): Promise<TestSchedule[]> {
  const rows = seedSchedules
    .filter((s) => !academyId || s.academy_id === academyId)
    .sort((a, b) => a.test_date.localeCompare(b.test_date));
  const sb = getSupabase();
  if (sb) {
    let q = sb.from("test_schedules").select("*").order("test_date");
    if (academyId) q = q.eq("academy_id", academyId);
    const { data, error } = await q;
    if (!error && data) return data as TestSchedule[];
  }
  return rows;
}

// ── 튜터 ─────────────────────────────────────────────────
export interface TutorFilter {
  academySlug?: string;
  region?: string;
  subject?: string;
  verifiedOnly?: boolean;
}

export async function getTutors(filter: TutorFilter = {}): Promise<Tutor[]> {
  // MVP: 시드 데이터 필터링. Supabase 전환 시 동일 시그니처로 교체.
  let list = seedTutors;
  if (filter.academySlug) list = list.filter((t) => t.academy_slugs.includes(filter.academySlug!));
  if (filter.region) list = list.filter((t) => t.regions.includes(filter.region!));
  if (filter.subject) list = list.filter((t) => t.subjects.includes(filter.subject!));
  if (filter.verifiedOnly) list = list.filter((t) => t.is_verified);
  return rank(list);
}

export async function getTutorById(id: string): Promise<Tutor | null> {
  return seedTutors.find((t) => t.id === id) ?? null;
}

// 필터 UI용 옵션 값
export function allRegions(): string[] {
  return Array.from(new Set(seedTutors.flatMap((t) => t.regions))).sort();
}
export function allSubjects(): string[] {
  return Array.from(new Set(seedTutors.flatMap((t) => t.subjects))).sort();
}
