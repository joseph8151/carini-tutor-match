import { getSupabase } from "./supabase";
import { mergeTutor } from "./store";
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

// tutor_profiles 행 → Tutor (공개 데이터). 뱃지는 별도 조회.
function mapProfile(p: Record<string, unknown>, badges: Record<string, unknown>[]): Tutor {
  const uid = p.user_id as string;
  return {
    id: uid,
    name: (p.name as string) ?? "튜터",
    bio: (p.bio as string) ?? "",
    regions: (p.regions as string[]) ?? [],
    subjects: (p.subjects as string[]) ?? [],
    academy_slugs: (p.academy_slugs as string[]) ?? [],
    base_rate: (p.base_rate as number) ?? 0,
    rating_avg: Number(p.rating_avg ?? 0),
    response_rate: Number(p.response_rate ?? 0),
    subscription_tier: (p.subscription_tier as Tutor["subscription_tier"]) ?? "free",
    is_verified: Boolean(p.is_verified),
    pass_count: (p.pass_count as number) ?? 0,
    badges: badges
      .filter((b) => b.tutor_id === uid)
      .map((b) => ({ academy_id: b.academy_id as string, label: b.label as string })),
  };
}

export async function getTutors(filter: TutorFilter = {}): Promise<Tutor[]> {
  const sb = getSupabase();
  if (sb) {
    let q = sb.from("tutor_profiles").select("*");
    if (filter.academySlug) q = q.contains("academy_slugs", [filter.academySlug]);
    if (filter.region) q = q.contains("regions", [filter.region]);
    if (filter.subject) q = q.contains("subjects", [filter.subject]);
    if (filter.verifiedOnly) q = q.eq("is_verified", true);
    const { data: profs, error } = await q;
    if (!error && profs) {
      const ids = profs.map((p) => p.user_id);
      const { data: badges } = await sb.from("tutor_badges").select("*").in("tutor_id", ids);
      return rank(profs.map((p) => mapProfile(p, badges ?? [])));
    }
  }
  // 시드 폴백 (데모): 인메모리 override 병합
  let list = seedTutors.map(mergeTutor);
  if (filter.academySlug) list = list.filter((t) => t.academy_slugs.includes(filter.academySlug!));
  if (filter.region) list = list.filter((t) => t.regions.includes(filter.region!));
  if (filter.subject) list = list.filter((t) => t.subjects.includes(filter.subject!));
  if (filter.verifiedOnly) list = list.filter((t) => t.is_verified);
  return rank(list);
}

export async function getTutorById(id: string): Promise<Tutor | null> {
  const sb = getSupabase();
  if (sb) {
    const { data: p, error } = await sb.from("tutor_profiles").select("*").eq("user_id", id).maybeSingle();
    if (!error && p) {
      const { data: badges } = await sb.from("tutor_badges").select("*").eq("tutor_id", id);
      return mapProfile(p, badges ?? []);
    }
    if (!error) return null; // Supabase 권위: 없으면 null
  }
  const t = seedTutors.find((t) => t.id === id);
  return t ? mergeTutor(t) : null;
}

// 필터 UI용 옵션 값
export function allRegions(): string[] {
  return Array.from(new Set(seedTutors.flatMap((t) => t.regions))).sort();
}
export function allSubjects(): string[] {
  return Array.from(new Set(seedTutors.flatMap((t) => t.subjects))).sort();
}
