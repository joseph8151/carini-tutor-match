import type {
  Dispute,
  Inquiry,
  LessonReport,
  Message,
  MockBooking,
  PassInfo,
  Payment,
  PaymentStatus,
  Review,
  SubscriptionTier,
  Tutor,
  TutorBadge,
  Verification,
} from "./types";
import { mockTests } from "./seed";

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
  reports: LessonReport[];
  reviews: Review[];
  payments: Payment[];
  disputes: Dispute[];
  mockBookings: MockBooking[];
  parentPremium: Record<string, boolean>;
  passes: Record<string, PassInfo>;
  tierOverride: Record<string, SubscriptionTier>;
  verifiedOverride: Record<string, boolean>;
  badgeOverride: Record<string, TutorBadge[]>;
  seq: number;
}

// 학부모 프리미엄 가입 시 지급되는 우선 매칭권 수
export const PREMIUM_PASS_GRANT = 2;

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
  const reports: LessonReport[] = [
    {
      id: "rp_seed_1",
      inquiry_id: "iq_seed_1",
      tutor_id: "tu_1",
      tutor_name: "김서연",
      parent_id: "demo_parent",
      academy_slug: "mi",
      date: "2026-08-02",
      content: "MI 기출 유형 원서 독해 2지문 + 서술형 라이팅 1문항 첨삭.",
      progress_note: "라이팅 구조는 안정적. 어휘 정확도 보완 필요 — 다음 시간 어휘 집중.",
      created_at: "2026-08-02T12:00:00.000Z",
    },
  ];
  const reviews: Review[] = [
    {
      id: "rv_seed_1",
      parent_id: "p_a",
      parent_name: "학부모A",
      tutor_id: "tu_1",
      tutor_name: "김서연",
      academy_slug: "mi",
      rating: 5,
      body: "MI 정규반 합격했습니다. 서술형 라이팅 첨삭이 정말 꼼꼼했어요.",
      is_verified_pass: true,
      created_at: "2026-07-28T12:00:00.000Z",
    },
  ];
  return {
    inquiries,
    messages,
    verifications: [],
    reports,
    reviews,
    payments: [],
    disputes: [],
    mockBookings: [],
    parentPremium: {},
    passes: {},
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
    academy_slug: academySlug, status: "open", priority: false,
    created_at: createdAt, last_body: lastBody,
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
    .sort((a, b) => {
      // 우선 매칭권 문의를 상단에, 그다음 최신순
      if (a.priority !== b.priority) return a.priority ? -1 : 1;
      return b.created_at.localeCompare(a.created_at);
    });
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
  academySlug?: string; body: string; priority?: boolean;
}): Inquiry {
  const d = db();
  const existing = findOpenInquiry(input.parentId, input.tutorId);
  if (existing) {
    if (input.priority) existing.priority = true;
    addMessage({ inquiryId: existing.id, senderId: input.parentId, body: input.body });
    return existing;
  }
  const iq: Inquiry = {
    id: `iq_${++d.seq}`,
    parent_id: input.parentId, parent_name: input.parentName,
    tutor_id: input.tutorId, tutor_name: input.tutorName,
    academy_slug: input.academySlug, status: "open", priority: !!input.priority,
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

// ── 수업 리포트 (락인) ────────────────────────────────────
// 튜터가 작성 → 학부모 대시보드에서만 열람. 플랫폼 밖(카톡)에는 없는 자산.
export function createReport(input: {
  inquiryId: string;
  tutorId: string;
  tutorName: string;
  parentId: string;
  academySlug?: string;
  date: string;
  content: string;
  progressNote: string;
}): LessonReport {
  const d = db();
  const rp: LessonReport = {
    id: `rp_${++d.seq}`,
    inquiry_id: input.inquiryId,
    tutor_id: input.tutorId,
    tutor_name: input.tutorName,
    parent_id: input.parentId,
    academy_slug: input.academySlug,
    date: input.date || nowIso().slice(0, 10),
    content: input.content,
    progress_note: input.progressNote,
    created_at: nowIso(),
  };
  d.reports.push(rp);
  return rp;
}

export function listReportsForParent(parentId: string): LessonReport[] {
  return db()
    .reports.filter((r) => r.parent_id === parentId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function listReportsForInquiry(inquiryId: string): LessonReport[] {
  return db()
    .reports.filter((r) => r.inquiry_id === inquiryId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ── 합격 후기 ─────────────────────────────────────────────
export function createReview(input: {
  parentId: string;
  parentName: string;
  tutorId: string;
  tutorName: string;
  academySlug?: string;
  rating: number;
  body: string;
  isVerifiedPass: boolean;
}): Review {
  const d = db();
  const rv: Review = {
    id: `rv_${++d.seq}`,
    parent_id: input.parentId,
    parent_name: input.parentName,
    tutor_id: input.tutorId,
    tutor_name: input.tutorName,
    academy_slug: input.academySlug,
    rating: Math.max(1, Math.min(5, input.rating)),
    body: input.body,
    is_verified_pass: input.isVerifiedPass,
    created_at: nowIso(),
  };
  d.reviews.push(rv);
  return rv;
}

export function listReviewsForTutor(tutorId: string): Review[] {
  return db()
    .reviews.filter((r) => r.tutor_id === tutorId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function hasReviewed(parentId: string, tutorId: string): boolean {
  return db().reviews.some((r) => r.parent_id === parentId && r.tutor_id === tutorId);
}

// 학부모가 대화한 튜터 목록 (후기 작성 대상)
export function tutorsInquiredBy(parentId: string): { id: string; name: string; academySlug?: string }[] {
  const seen = new Map<string, { id: string; name: string; academySlug?: string }>();
  for (const iq of db().inquiries) {
    if (iq.parent_id === parentId && !seen.has(iq.tutor_id)) {
      seen.set(iq.tutor_id, { id: iq.tutor_id, name: iq.tutor_name, academySlug: iq.academy_slug });
    }
  }
  return [...seen.values()];
}

// ── 학부모 프리미엄 + 우선 매칭권 ─────────────────────────
export function isParentPremium(parentId: string): boolean {
  return !!db().parentPremium[parentId];
}

export function grantParentPremium(parentId: string): void {
  const d = db();
  d.parentPremium[parentId] = true;
  const p = d.passes[parentId] ?? (d.passes[parentId] = { granted: 0, used: 0 });
  p.granted += PREMIUM_PASS_GRANT;
}

export function getPasses(parentId: string): PassInfo & { remaining: number } {
  const p = db().passes[parentId] ?? { granted: 0, used: 0 };
  return { ...p, remaining: p.granted - p.used };
}

export function usePass(parentId: string): boolean {
  const d = db();
  const p = d.passes[parentId];
  if (!p || p.granted - p.used <= 0) return false;
  p.used += 1;
  return true;
}

// ── 결제 보호 (에스크로 유사) + 분쟁 ──────────────────────
export function getPaymentForInquiry(inquiryId: string): Payment | null {
  return (
    db()
      .payments.filter((p) => p.inquiry_id === inquiryId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
  );
}

export function createPayment(input: {
  inquiryId: string; parentId: string; tutorId: string; amount: number;
}): Payment {
  const d = db();
  const pay: Payment = {
    id: `pay_${++d.seq}`,
    inquiry_id: input.inquiryId, parent_id: input.parentId, tutor_id: input.tutorId,
    amount: input.amount, status: "held", created_at: nowIso(),
  };
  d.payments.push(pay);
  return pay;
}

function setPaymentStatus(paymentId: string, status: PaymentStatus): Payment | null {
  const pay = db().payments.find((p) => p.id === paymentId);
  if (pay) pay.status = status;
  return pay ?? null;
}

export function releasePayment(paymentId: string): void {
  const pay = db().payments.find((p) => p.id === paymentId);
  if (pay && pay.status === "held") pay.status = "released";
}

export function openDispute(input: { paymentId: string; openedBy: string; reason: string }): Dispute | null {
  const d = db();
  const pay = d.payments.find((p) => p.id === input.paymentId);
  if (!pay || pay.status !== "held") return null;
  pay.status = "disputed";
  const dispute: Dispute = {
    id: `dp_${++d.seq}`,
    payment_id: pay.id, inquiry_id: pay.inquiry_id,
    opened_by: input.openedBy, reason: input.reason,
    status: "open", created_at: nowIso(),
  };
  d.disputes.push(dispute);
  return dispute;
}

export function listOpenDisputes(): (Dispute & { payment?: Payment })[] {
  const d = db();
  return d.disputes
    .filter((x) => x.status === "open")
    .map((x) => ({ ...x, payment: d.payments.find((p) => p.id === x.payment_id) }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function resolveDispute(disputeId: string, refund: boolean): void {
  const d = db();
  const dispute = d.disputes.find((x) => x.id === disputeId);
  if (!dispute || dispute.status !== "open") return;
  dispute.status = "resolved";
  dispute.resolution = refund ? "환불" : "정산(튜터 지급)";
  setPaymentStatus(dispute.payment_id, refund ? "refunded" : "released");
}

export function listPaymentsForParent(parentId: string): Payment[] {
  return db()
    .payments.filter((p) => p.parent_id === parentId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ── 모의 레테 ─────────────────────────────────────────────
export function listMockTests(): typeof mockTests {
  return mockTests;
}

export function bookMock(parentId: string, mockId: string): MockBooking | null {
  const mk = mockTests.find((m) => m.id === mockId);
  if (!mk) return null;
  const d = db();
  if (d.mockBookings.some((b) => b.parent_id === parentId && b.mock_id === mockId)) {
    return d.mockBookings.find((b) => b.parent_id === parentId && b.mock_id === mockId) ?? null;
  }
  const booking: MockBooking = {
    id: `mb_${++d.seq}`,
    parent_id: parentId, mock_id: mk.id, mock_name: mk.name,
    academy_slug: mk.academy_slug, date: mk.date, created_at: nowIso(),
  };
  d.mockBookings.push(booking);
  return booking;
}

export function listMockBookings(parentId: string): MockBooking[] {
  return db()
    .mockBookings.filter((b) => b.parent_id === parentId)
    .sort((a, b) => a.date.localeCompare(b.date));
}
