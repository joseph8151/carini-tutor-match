import type { Inquiry, Message, SubscriptionTier, Tutor, TutorBadge, Verification } from "./types";

/**
 * 인앱 문의/메시징 + 구독/인증 런타임 상태 (MVP: 인메모리).
 * - 연락처 노출 없이 플랫폼 내에서만 대화 → 카톡 이탈 방지의 1차 관문.
 * - 구독 티어/인증 승인은 시드 튜터(lib/seed.ts) 위에 override로 얹음.
 * - 단일 서버 프로세스 기준 유지. 프로덕션은 Supabase 테이블로 교체 예정.
 */

// 무료 티어 튜터가 열람/응답할 수 있는 최대 대화 수. 초과분은 페이월 잠금.
export const FREE_INQUIRY_LIMIT = 3;

interface DB {
  inquiries: Inquiry[];
  messages: Message[];
  verifications: Verification[];
  tierOverride: Record<string, SubscriptionTier>;
  verifiedOverride: Record<string, boolean>;
  badgeOverride: Record<string, TutorBadge[]>;
  seq: number;
}

const g = globalThis as unknown as { __cariniDB?: DB };

function db(): DB {
  if (!g.__cariniDB) g.__cariniDB = seed();
  return g.__cariniDB;
}

function seed(): DB {
  // 데모 튜터(tu_1) 문의함에 여러 대화를 심어 무료 티어 잠금까지 시연.
  const inquiries: Inquiry[] = [
    mkIq("iq_seed_2", "p_a", "학부모A", "tu_1", "김서연", "mi", "2026-07-20T10:00:00.000Z", "MI 정규반 라이팅 대비 가능할까요?"),
    mkIq("iq_seed_3", "p_b", "학부모B", "tu_1", "김서연", "twinkle", "2026-07-22T10:00:00.000Z", "트윈클 입학 레테 프랩 문의드립니다."),
    mkIq("iq_seed_4", "p_c", "학부모C", "tu_1", "김서연", "mi", "2026-07-25T10:00:00.000Z", "다음 달 MI 레테 준비 부탁드려요."),
    mkIq("iq_seed_1", "demo_parent", "데모 학부모", "tu_1", "김서연", "mi", "2026-08-01T09:00:00.000Z", "안녕하세요, MI 9월 정규반 레테 대비 프랩 문의드립니다."),
  ];
  const messages: Message[] = [
    mkMsg("msg_s2", "iq_seed_2", "p_a", "MI 정규반 라이팅 대비 가능할까요?", "2026-07-20T10:00:00.000Z"),
    mkMsg("msg_s3", "iq_seed_3", "p_b", "트윈클 입학 레테 프랩 문의드립니다.", "2026-07-22T10:00:00.000Z"),
    mkMsg("msg_s4", "iq_seed_4", "p_c", "다음 달 MI 레테 준비 부탁드려요.", "2026-07-25T10:00:00.000Z"),
    mkMsg("msg_s1a", "iq_seed_1", "demo_parent", "안녕하세요, MI 9월 정규반 레테 대비 프랩 문의드립니다.", "2026-08-01T09:00:00.000Z"),
    mkMsg("msg_s1b", "iq_seed_1", "tu_1", "네, MI 정규반 레테 프랩 상담 가능합니다. 아이 현재 레벨이 어떻게 되나요?", "2026-08-01T09:12:00.000Z"),
  ];
  return {
    inquiries,
    messages,
    verifications: [],
    tierOverride: {},
    verifiedOverride: {},
    badgeOverride: {},
    seq: 100,
  };
}

function mkIq(
  id: string, parentId: string, parentName: string, tutorId: string, tutorName: string,
  academySlug: string, createdAt: string, lastBody: string,
): Inquiry {
  return {
    id, parent_id: parentId, parent_name: parentName, tutor_id: tutorId, tutor_name: tutorName,
    academy_slug: academySlug, status: "open", created_at: createdAt, last_body: lastBody,
  };
}
function mkMsg(id: string, inquiryId: string, senderId: string, body: string, createdAt: string): Message {
  return { id, inquiry_id: inquiryId, sender_id: senderId, body, created_at: createdAt };
}

function nowIso(): string {
  return new Date().toISOString();
}

// ── 메시징 ────────────────────────────────────────────────
export function listInquiriesFor(userId: string): Inquiry[] {
  return db()
    .inquiries.filter((i) => i.parent_id === userId || i.tutor_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getInquiry(id: string): Inquiry | null {
  return db().inquiries.find((i) => i.id === id) ?? null;
}

export function getMessages(inquiryId: string): Message[] {
  return db()
    .messages.filter((m) => m.inquiry_id === inquiryId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function findOpenInquiry(parentId: string, tutorId: string): Inquiry | null {
  return (
    db().inquiries.find(
      (i) => i.parent_id === parentId && i.tutor_id === tutorId && i.status !== "closed",
    ) ?? null
  );
}

export function createInquiry(input: {
  parentId: string; parentName: string; tutorId: string; tutorName: string;
  academySlug?: string; body: string;
}): Inquiry {
  const d = db();
  const existing = findOpenInquiry(input.parentId, input.tutorId);
  if (existing) {
    addMessage({ inquiryId: existing.id, senderId: input.parentId, body: input.body });
    return existing;
  }
  const iq: Inquiry = {
    id: `iq_${++d.seq}`,
    parent_id: input.parentId, parent_name: input.parentName,
    tutor_id: input.tutorId, tutor_name: input.tutorName,
    academy_slug: input.academySlug, status: "open",
    created_at: nowIso(), last_body: input.body,
  };
  d.inquiries.push(iq);
  addMessage({ inquiryId: iq.id, senderId: input.parentId, body: input.body });
  return iq;
}

export function addMessage(input: { inquiryId: string; senderId: string; body: string }): Message {
  const d = db();
  const msg: Message = {
    id: `msg_${++d.seq}`, inquiry_id: input.inquiryId,
    sender_id: input.senderId, body: input.body, created_at: nowIso(),
  };
  d.messages.push(msg);
  const iq = d.inquiries.find((i) => i.id === input.inquiryId);
  if (iq) iq.last_body = input.body;
  return msg;
}

// ── 무료 티어 문의 잠금 ────────────────────────────────────
// 무료 튜터는 최근 FREE_INQUIRY_LIMIT개만 열람 가능. 초과분(오래된 것) 잠금.
export function lockedInquiryIds(tutorId: string, tier: SubscriptionTier): Set<string> {
  if (tier !== "free") return new Set();
  const list = listInquiriesFor(tutorId); // 최신순
  return new Set(list.slice(FREE_INQUIRY_LIMIT).map((i) => i.id));
}

// ── 구독 티어 override ────────────────────────────────────
export function effectiveTier(tutorId: string, seedTier: SubscriptionTier): SubscriptionTier {
  return db().tierOverride[tutorId] ?? seedTier;
}
export function setTier(tutorId: string, tier: SubscriptionTier): void {
  db().tierOverride[tutorId] = tier;
}

// ── 인증(실적) override + 검수 큐 ─────────────────────────
export function mergeTutor(t: Tutor): Tutor {
  const d = db();
  const extraBadges = d.badgeOverride[t.id] ?? [];
  const badges = [...t.badges];
  for (const b of extraBadges) {
    if (!badges.some((x) => x.academy_id === b.academy_id)) badges.push(b);
  }
  return {
    ...t,
    subscription_tier: d.tierOverride[t.id] ?? t.subscription_tier,
    is_verified: d.verifiedOverride[t.id] ?? t.is_verified,
    badges,
  };
}

export function submitVerification(input: {
  tutorId: string; tutorName: string; academySlug: string; academyName: string;
  type: "pass" | "career"; evidence: string;
}): Verification {
  const d = db();
  const v: Verification = {
    id: `vf_${++d.seq}`,
    tutor_id: input.tutorId, tutor_name: input.tutorName,
    academy_slug: input.academySlug, academy_name: input.academyName,
    type: input.type, evidence: input.evidence,
    status: "pending", created_at: nowIso(),
  };
  d.verifications.push(v);
  return v;
}

export function listVerificationsForTutor(tutorId: string): Verification[] {
  return db()
    .verifications.filter((v) => v.tutor_id === tutorId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function listPendingVerifications(): Verification[] {
  return db()
    .verifications.filter((v) => v.status === "pending")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function reviewVerification(id: string, approve: boolean): void {
  const d = db();
  const v = d.verifications.find((x) => x.id === id);
  if (!v || v.status !== "pending") return;
  v.status = approve ? "approved" : "rejected";
  v.reviewed_at = nowIso();
  if (approve) {
    d.verifiedOverride[v.tutor_id] = true;
    const label = `${v.academy_name} ${v.type === "pass" ? "레테 합격 인증" : "경력 인증"}`;
    const list = d.badgeOverride[v.tutor_id] ?? (d.badgeOverride[v.tutor_id] = []);
    // academy_id 대용으로 slug 사용 (시드/오버레이 일관)
    if (!list.some((b) => b.academy_id === v.academy_slug)) {
      list.push({ academy_id: v.academy_slug, label });
    }
  }
}
