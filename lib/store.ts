import type {
  DiagnosisRecord,
  Dispute,
  Inquiry,
  LessonReport,
  MatchRequest,
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
import { createServerSupabase } from "./supabase/server";
import { getSupabase, getServiceSupabase } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 문의/메시징 + 구독/인증/결제 등 트랜잭션 상태 접근 계층.
 *
 * 백엔드 선택:
 *  - Supabase 설정 시(NEXT_PUBLIC_SUPABASE_*): 인증 세션 클라이언트로 DB 조회 (RLS 적용).
 *    이때 Supabase가 단일 진실 소스이며 인메모리로 폴백하지 않는다.
 *  - 미설정 시(데모): globalThis 인메모리 스토어. E2E/데모가 검증하는 실행 경로.
 *
 * 관리자 작업(인증 검수/분쟁 중재)은 RLS 우회를 위해 service-role 키를 사용한다.
 * 실 Supabase 검증은 라이브 프로젝트 필요(README 참고).
 */

export const FREE_INQUIRY_LIMIT = 3;
export const PREMIUM_PASS_GRANT = 2;

// 사용자 스코프 클라이언트(쿠키 세션). 미설정 시 null → 인메모리.
async function authed(): Promise<SupabaseClient | null> {
  return await createServerSupabase();
}
// 관리자용(RLS 우회). service 키 없으면 authed 로 폴백.
async function admin(): Promise<SupabaseClient | null> {
  return getServiceSupabase() ?? (await createServerSupabase());
}

// ── 인메모리 (데모) ───────────────────────────────────────
interface DB {
  inquiries: Inquiry[];
  messages: Message[];
  verifications: Verification[];
  reports: LessonReport[];
  reviews: Review[];
  payments: Payment[];
  disputes: Dispute[];
  mockBookings: MockBooking[];
  diagnoses: DiagnosisRecord[];
  matchRequests: MatchRequest[];
  parentPremium: Record<string, boolean>;
  passes: Record<string, PassInfo>;
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
      id: "rp_seed_1", inquiry_id: "iq_seed_1", tutor_id: "tu_1", tutor_name: "김서연",
      parent_id: "demo_parent", academy_slug: "mi", date: "2026-08-02",
      content: "MI 기출 유형 원서 독해 2지문 + 서술형 라이팅 1문항 첨삭.",
      progress_note: "라이팅 구조는 안정적. 어휘 정확도 보완 필요 — 다음 시간 어휘 집중.",
      created_at: "2026-08-02T12:00:00.000Z",
    },
  ];
  const reviews: Review[] = [
    {
      id: "rv_seed_1", parent_id: "p_a", parent_name: "학부모A", tutor_id: "tu_1", tutor_name: "김서연",
      academy_slug: "mi", rating: 5,
      body: "MI 정규반 합격했습니다. 서술형 라이팅 첨삭이 정말 꼼꼼했어요.",
      is_verified_pass: true, created_at: "2026-07-28T12:00:00.000Z",
    },
  ];
  return {
    inquiries, messages, verifications: [], reports, reviews, payments: [], disputes: [],
    mockBookings: [], diagnoses: [], matchRequests: [], parentPremium: {}, passes: {}, tierOverride: {},
    verifiedOverride: {}, badgeOverride: {}, seq: 100,
  };
}

function mkIq(id: string, parentId: string, parentName: string, tutorId: string, tutorName: string, academySlug: string, createdAt: string, lastBody: string): Inquiry {
  return { id, parent_id: parentId, parent_name: parentName, tutor_id: tutorId, tutor_name: tutorName, academy_slug: academySlug, status: "open", priority: false, created_at: createdAt, last_body: lastBody };
}
function mkMsg(id: string, inquiryId: string, senderId: string, body: string, createdAt: string): Message {
  return { id, inquiry_id: inquiryId, sender_id: senderId, body, created_at: createdAt };
}
function nowIso(): string {
  return new Date().toISOString();
}

// ── 메시징 ────────────────────────────────────────────────
export async function listInquiriesFor(userId: string): Promise<Inquiry[]> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb
      .from("inquiries")
      .select("*")
      .or(`parent_id.eq.${userId},tutor_id.eq.${userId}`)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    return (data as Inquiry[]) ?? [];
  }
  return db()
    .inquiries.filter((i) => i.parent_id === userId || i.tutor_id === userId)
    .sort((a, b) => (a.priority !== b.priority ? (a.priority ? -1 : 1) : b.created_at.localeCompare(a.created_at)));
}

export async function getInquiry(id: string): Promise<Inquiry | null> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("inquiries").select("*").eq("id", id).maybeSingle();
    return (data as Inquiry) ?? null;
  }
  return db().inquiries.find((i) => i.id === id) ?? null;
}

export async function getMessages(inquiryId: string): Promise<Message[]> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("messages").select("*").eq("inquiry_id", inquiryId).order("created_at");
    return (data as Message[]) ?? [];
  }
  return db().messages.filter((m) => m.inquiry_id === inquiryId).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

async function addMessageDb(sb: SupabaseClient, inquiryId: string, senderId: string, body: string) {
  await sb.from("messages").insert({ inquiry_id: inquiryId, sender_id: senderId, body });
  await sb.from("inquiries").update({ last_body: body }).eq("id", inquiryId);
}

export async function createInquiry(input: {
  parentId: string; parentName: string; tutorId: string; tutorName: string;
  academySlug?: string; body: string; priority?: boolean;
}): Promise<Inquiry> {
  const sb = await authed();
  if (sb) {
    const { data: ex } = await sb
      .from("inquiries").select("*")
      .eq("parent_id", input.parentId).eq("tutor_id", input.tutorId).neq("status", "closed")
      .maybeSingle();
    if (ex) {
      if (input.priority) await sb.from("inquiries").update({ priority: true }).eq("id", ex.id);
      await addMessageDb(sb, ex.id, input.parentId, input.body);
      return { ...(ex as Inquiry), priority: input.priority ? true : (ex as Inquiry).priority };
    }
    const { data } = await sb.from("inquiries").insert({
      parent_id: input.parentId, parent_name: input.parentName,
      tutor_id: input.tutorId, tutor_name: input.tutorName,
      academy_slug: input.academySlug, status: "open", priority: !!input.priority, last_body: input.body,
    }).select().single();
    if (data) await addMessageDb(sb, (data as Inquiry).id, input.parentId, input.body);
    return data as Inquiry;
  }
  // in-memory
  const d = db();
  const existing = d.inquiries.find((i) => i.parent_id === input.parentId && i.tutor_id === input.tutorId && i.status !== "closed");
  if (existing) {
    if (input.priority) existing.priority = true;
    await addMessage({ inquiryId: existing.id, senderId: input.parentId, body: input.body });
    return existing;
  }
  const iq: Inquiry = {
    id: `iq_${++d.seq}`, parent_id: input.parentId, parent_name: input.parentName,
    tutor_id: input.tutorId, tutor_name: input.tutorName, academy_slug: input.academySlug,
    status: "open", priority: !!input.priority, created_at: nowIso(), last_body: input.body,
  };
  d.inquiries.push(iq);
  await addMessage({ inquiryId: iq.id, senderId: input.parentId, body: input.body });
  return iq;
}

export async function addMessage(input: { inquiryId: string; senderId: string; body: string }): Promise<Message> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("messages").insert({ inquiry_id: input.inquiryId, sender_id: input.senderId, body: input.body }).select().single();
    await sb.from("inquiries").update({ last_body: input.body }).eq("id", input.inquiryId);
    return data as Message;
  }
  const d = db();
  const msg: Message = { id: `msg_${++d.seq}`, inquiry_id: input.inquiryId, sender_id: input.senderId, body: input.body, created_at: nowIso() };
  d.messages.push(msg);
  const iq = d.inquiries.find((i) => i.id === input.inquiryId);
  if (iq) iq.last_body = input.body;
  return msg;
}

// 무료 티어 튜터: 최근 FREE_INQUIRY_LIMIT개만 열람. 초과분(오래된 것) 잠금.
export async function lockedInquiryIds(tutorId: string, tier: SubscriptionTier): Promise<Set<string>> {
  if (tier !== "free") return new Set();
  const list = await listInquiriesFor(tutorId);
  return new Set(list.slice(FREE_INQUIRY_LIMIT).map((i) => i.id));
}

// ── 구독 티어 ─────────────────────────────────────────────
export async function setTier(tutorId: string, tier: SubscriptionTier): Promise<void> {
  const sb = await authed();
  if (sb) {
    await sb.from("tutor_profiles").update({ subscription_tier: tier }).eq("user_id", tutorId);
    return;
  }
  db().tierOverride[tutorId] = tier;
}

// 시드 튜터 위에 인메모리 override 적용 (데모 전용; Supabase 모드에선 tutor_profiles가 진실).
export function mergeTutor(t: Tutor): Tutor {
  const d = db();
  const extraBadges = d.badgeOverride[t.id] ?? [];
  const badges = [...t.badges];
  for (const b of extraBadges) if (!badges.some((x) => x.academy_id === b.academy_id)) badges.push(b);
  return {
    ...t,
    subscription_tier: d.tierOverride[t.id] ?? t.subscription_tier,
    is_verified: d.verifiedOverride[t.id] ?? t.is_verified,
    badges,
  };
}

// ── 실적 인증 검수 ────────────────────────────────────────
export async function submitVerification(input: {
  tutorId: string; tutorName: string; academySlug: string; academyName: string;
  type: "pass" | "career"; evidence: string;
}): Promise<Verification> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("tutor_verifications").insert({
      tutor_id: input.tutorId, tutor_name: input.tutorName,
      academy_slug: input.academySlug, academy_name: input.academyName,
      type: input.type, evidence: input.evidence, status: "pending",
    }).select().single();
    return data as Verification;
  }
  const d = db();
  const v: Verification = {
    id: `vf_${++d.seq}`, tutor_id: input.tutorId, tutor_name: input.tutorName,
    academy_slug: input.academySlug, academy_name: input.academyName,
    type: input.type, evidence: input.evidence, status: "pending", created_at: nowIso(),
  };
  d.verifications.push(v);
  return v;
}

export async function listVerificationsForTutor(tutorId: string): Promise<Verification[]> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("tutor_verifications").select("*").eq("tutor_id", tutorId).order("created_at", { ascending: false });
    return (data as Verification[]) ?? [];
  }
  return db().verifications.filter((v) => v.tutor_id === tutorId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function listPendingVerifications(): Promise<Verification[]> {
  const sb = await admin();
  if (sb) {
    const { data } = await sb.from("tutor_verifications").select("*").eq("status", "pending").order("created_at");
    return (data as Verification[]) ?? [];
  }
  return db().verifications.filter((v) => v.status === "pending").sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function reviewVerification(id: string, approve: boolean): Promise<void> {
  const sb = await admin();
  if (sb) {
    const { data: v } = await sb.from("tutor_verifications").select("*").eq("id", id).maybeSingle();
    if (!v || (v as Verification).status !== "pending") return;
    const vv = v as Verification;
    await sb.from("tutor_verifications").update({ status: approve ? "approved" : "rejected", reviewed_at: nowIso() }).eq("id", id);
    if (approve) {
      await sb.from("tutor_profiles").update({ is_verified: true }).eq("user_id", vv.tutor_id);
      const label = `${vv.academy_name} ${vv.type === "pass" ? "레테 합격 인증" : "경력 인증"}`;
      const { data: existing } = await sb.from("tutor_badges").select("id").eq("tutor_id", vv.tutor_id).eq("academy_id", vv.academy_slug).maybeSingle();
      if (!existing) await sb.from("tutor_badges").insert({ tutor_id: vv.tutor_id, academy_id: vv.academy_slug, label });
    }
    return;
  }
  const d = db();
  const v = d.verifications.find((x) => x.id === id);
  if (!v || v.status !== "pending") return;
  v.status = approve ? "approved" : "rejected";
  v.reviewed_at = nowIso();
  if (approve) {
    d.verifiedOverride[v.tutor_id] = true;
    const label = `${v.academy_name} ${v.type === "pass" ? "레테 합격 인증" : "경력 인증"}`;
    const list = d.badgeOverride[v.tutor_id] ?? (d.badgeOverride[v.tutor_id] = []);
    if (!list.some((b) => b.academy_id === v.academy_slug)) list.push({ academy_id: v.academy_slug, label });
  }
}

// ── 수업 리포트 ───────────────────────────────────────────
export async function createReport(input: {
  inquiryId: string; tutorId: string; tutorName: string; parentId: string;
  academySlug?: string; date: string; content: string; progressNote: string;
}): Promise<LessonReport> {
  const date = input.date || nowIso().slice(0, 10);
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("lesson_reports").insert({
      inquiry_id: input.inquiryId, tutor_id: input.tutorId, tutor_name: input.tutorName,
      parent_id: input.parentId, academy_slug: input.academySlug, date,
      content: input.content, progress_note: input.progressNote,
    }).select().single();
    return data as LessonReport;
  }
  const d = db();
  const rp: LessonReport = {
    id: `rp_${++d.seq}`, inquiry_id: input.inquiryId, tutor_id: input.tutorId, tutor_name: input.tutorName,
    parent_id: input.parentId, academy_slug: input.academySlug, date,
    content: input.content, progress_note: input.progressNote, created_at: nowIso(),
  };
  d.reports.push(rp);
  return rp;
}

export async function listReportsForParent(parentId: string): Promise<LessonReport[]> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("lesson_reports").select("*").eq("parent_id", parentId).order("date", { ascending: false });
    return (data as LessonReport[]) ?? [];
  }
  return db().reports.filter((r) => r.parent_id === parentId).sort((a, b) => b.date.localeCompare(a.date));
}

export async function listReportsForInquiry(inquiryId: string): Promise<LessonReport[]> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("lesson_reports").select("*").eq("inquiry_id", inquiryId).order("date", { ascending: false });
    return (data as LessonReport[]) ?? [];
  }
  return db().reports.filter((r) => r.inquiry_id === inquiryId).sort((a, b) => b.date.localeCompare(a.date));
}

// ── 합격 후기 (공개 읽기) ─────────────────────────────────
export async function createReview(input: {
  parentId: string; parentName: string; tutorId: string; tutorName: string;
  academySlug?: string; rating: number; body: string; isVerifiedPass: boolean;
}): Promise<Review> {
  const rating = Math.max(1, Math.min(5, input.rating));
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("reviews").insert({
      parent_id: input.parentId, parent_name: input.parentName,
      tutor_id: input.tutorId, tutor_name: input.tutorName, academy_slug: input.academySlug,
      rating, body: input.body, is_verified_pass: input.isVerifiedPass,
    }).select().single();
    return data as Review;
  }
  const d = db();
  const rv: Review = {
    id: `rv_${++d.seq}`, parent_id: input.parentId, parent_name: input.parentName,
    tutor_id: input.tutorId, tutor_name: input.tutorName, academy_slug: input.academySlug,
    rating, body: input.body, is_verified_pass: input.isVerifiedPass, created_at: nowIso(),
  };
  d.reviews.push(rv);
  return rv;
}

export async function listReviewsForTutor(tutorId: string): Promise<Review[]> {
  const anon = getSupabase();
  if (anon) {
    const { data } = await anon.from("reviews").select("*").eq("tutor_id", tutorId).order("created_at", { ascending: false });
    return (data as Review[]) ?? [];
  }
  return db().reviews.filter((r) => r.tutor_id === tutorId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function hasReviewed(parentId: string, tutorId: string): Promise<boolean> {
  const sb = await authed();
  if (sb) {
    const { count } = await sb.from("reviews").select("id", { count: "exact", head: true }).eq("parent_id", parentId).eq("tutor_id", tutorId);
    return (count ?? 0) > 0;
  }
  return db().reviews.some((r) => r.parent_id === parentId && r.tutor_id === tutorId);
}

export async function tutorsInquiredBy(parentId: string): Promise<{ id: string; name: string; academySlug?: string }[]> {
  const inquiries = await listInquiriesFor(parentId);
  const seen = new Map<string, { id: string; name: string; academySlug?: string }>();
  for (const iq of inquiries) {
    if (iq.parent_id === parentId && !seen.has(iq.tutor_id)) {
      seen.set(iq.tutor_id, { id: iq.tutor_id, name: iq.tutor_name, academySlug: iq.academy_slug });
    }
  }
  return [...seen.values()];
}

// ── 학부모 프리미엄 / 우선 매칭권 ─────────────────────────
export async function isParentPremium(parentId: string): Promise<boolean> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("parent_premium").select("premium").eq("parent_id", parentId).maybeSingle();
    return !!data?.premium;
  }
  return !!db().parentPremium[parentId];
}

export async function grantParentPremium(parentId: string): Promise<void> {
  const sb = await authed();
  if (sb) {
    await sb.from("parent_premium").upsert({ parent_id: parentId, premium: true });
    const { data } = await sb.from("parent_passes").select("granted,used").eq("parent_id", parentId).maybeSingle();
    const granted = (data?.granted ?? 0) + PREMIUM_PASS_GRANT;
    await sb.from("parent_passes").upsert({ parent_id: parentId, granted, used: data?.used ?? 0 });
    return;
  }
  const d = db();
  d.parentPremium[parentId] = true;
  const p = d.passes[parentId] ?? (d.passes[parentId] = { granted: 0, used: 0 });
  p.granted += PREMIUM_PASS_GRANT;
}

export async function getPasses(parentId: string): Promise<PassInfo & { remaining: number }> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("parent_passes").select("granted,used").eq("parent_id", parentId).maybeSingle();
    const info = { granted: data?.granted ?? 0, used: data?.used ?? 0 };
    return { ...info, remaining: info.granted - info.used };
  }
  const p = db().passes[parentId] ?? { granted: 0, used: 0 };
  return { ...p, remaining: p.granted - p.used };
}

export async function usePass(parentId: string): Promise<boolean> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("parent_passes").select("granted,used").eq("parent_id", parentId).maybeSingle();
    if (!data || data.granted - data.used <= 0) return false;
    await sb.from("parent_passes").update({ used: data.used + 1 }).eq("parent_id", parentId);
    return true;
  }
  const p = db().passes[parentId];
  if (!p || p.granted - p.used <= 0) return false;
  p.used += 1;
  return true;
}

// ── 결제 보호 / 분쟁 ──────────────────────────────────────
export async function getPaymentForInquiry(inquiryId: string): Promise<Payment | null> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("payments").select("*").eq("inquiry_id", inquiryId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return (data as Payment) ?? null;
  }
  return db().payments.filter((p) => p.inquiry_id === inquiryId).sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;
}

export async function createPayment(input: { inquiryId: string; parentId: string; tutorId: string; amount: number }): Promise<Payment> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("payments").insert({
      inquiry_id: input.inquiryId, parent_id: input.parentId, tutor_id: input.tutorId, amount: input.amount, status: "held",
    }).select().single();
    return data as Payment;
  }
  const d = db();
  const pay: Payment = { id: `pay_${++d.seq}`, inquiry_id: input.inquiryId, parent_id: input.parentId, tutor_id: input.tutorId, amount: input.amount, status: "held", created_at: nowIso() };
  d.payments.push(pay);
  return pay;
}

export async function releasePayment(paymentId: string): Promise<void> {
  const sb = await authed();
  if (sb) {
    await sb.from("payments").update({ status: "released" }).eq("id", paymentId).eq("status", "held");
    return;
  }
  const pay = db().payments.find((p) => p.id === paymentId);
  if (pay && pay.status === "held") pay.status = "released";
}

export async function openDispute(input: { paymentId: string; openedBy: string; reason: string }): Promise<Dispute | null> {
  const sb = await authed();
  if (sb) {
    const { data: pay } = await sb.from("payments").select("*").eq("id", input.paymentId).maybeSingle();
    if (!pay || (pay as Payment).status !== "held") return null;
    await sb.from("payments").update({ status: "disputed" }).eq("id", input.paymentId);
    const { data } = await sb.from("disputes").insert({
      payment_id: input.paymentId, inquiry_id: (pay as Payment).inquiry_id, opened_by: input.openedBy, reason: input.reason, status: "open",
    }).select().single();
    return data as Dispute;
  }
  const d = db();
  const pay = d.payments.find((p) => p.id === input.paymentId);
  if (!pay || pay.status !== "held") return null;
  pay.status = "disputed";
  const dispute: Dispute = { id: `dp_${++d.seq}`, payment_id: pay.id, inquiry_id: pay.inquiry_id, opened_by: input.openedBy, reason: input.reason, status: "open", created_at: nowIso() };
  d.disputes.push(dispute);
  return dispute;
}

export async function listOpenDisputes(): Promise<(Dispute & { payment?: Payment })[]> {
  const sb = await admin();
  if (sb) {
    const { data } = await sb.from("disputes").select("*, payment:payments(*)").eq("status", "open").order("created_at");
    return (data as (Dispute & { payment?: Payment })[]) ?? [];
  }
  const d = db();
  return d.disputes
    .filter((x) => x.status === "open")
    .map((x) => ({ ...x, payment: d.payments.find((p) => p.id === x.payment_id) }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function resolveDispute(disputeId: string, refund: boolean): Promise<void> {
  const sb = await admin();
  if (sb) {
    const { data: dispute } = await sb.from("disputes").select("*").eq("id", disputeId).maybeSingle();
    if (!dispute || (dispute as Dispute).status !== "open") return;
    await sb.from("disputes").update({ status: "resolved", resolution: refund ? "환불" : "정산(튜터 지급)" }).eq("id", disputeId);
    await sb.from("payments").update({ status: refund ? "refunded" : "released" }).eq("id", (dispute as Dispute).payment_id);
    return;
  }
  const d = db();
  const dispute = d.disputes.find((x) => x.id === disputeId);
  if (!dispute || dispute.status !== "open") return;
  dispute.status = "resolved";
  dispute.resolution = refund ? "환불" : "정산(튜터 지급)";
  const pay = d.payments.find((p) => p.id === dispute.payment_id);
  if (pay) pay.status = refund ? "refunded" : "released";
}

export async function listPaymentsForParent(parentId: string): Promise<Payment[]> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("payments").select("*").eq("parent_id", parentId).order("created_at", { ascending: false });
    return (data as Payment[]) ?? [];
  }
  return db().payments.filter((p) => p.parent_id === parentId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ── 모의 레테 ─────────────────────────────────────────────
export function listMockTests(): typeof mockTests {
  return mockTests;
}

export async function bookMock(parentId: string, mockId: string): Promise<MockBooking | null> {
  const mk = mockTests.find((m) => m.id === mockId);
  if (!mk) return null;
  const sb = await authed();
  if (sb) {
    const { data: ex } = await sb.from("mock_bookings").select("*").eq("parent_id", parentId).eq("mock_id", mockId).maybeSingle();
    if (ex) return ex as MockBooking;
    const { data } = await sb.from("mock_bookings").insert({
      parent_id: parentId, mock_id: mk.id, mock_name: mk.name, academy_slug: mk.academy_slug, date: mk.date,
    }).select().single();
    return data as MockBooking;
  }
  const d = db();
  const existing = d.mockBookings.find((b) => b.parent_id === parentId && b.mock_id === mockId);
  if (existing) return existing;
  const booking: MockBooking = { id: `mb_${++d.seq}`, parent_id: parentId, mock_id: mk.id, mock_name: mk.name, academy_slug: mk.academy_slug, date: mk.date, created_at: nowIso() };
  d.mockBookings.push(booking);
  return booking;
}

export async function listMockBookings(parentId: string): Promise<MockBooking[]> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("mock_bookings").select("*").eq("parent_id", parentId).order("date");
    return (data as MockBooking[]) ?? [];
  }
  return db().mockBookings.filter((b) => b.parent_id === parentId).sort((a, b) => a.date.localeCompare(b.date));
}

// ── 레벨 진단 결과 ────────────────────────────────────────
export async function saveDiagnosis(input: Omit<DiagnosisRecord, "id" | "created_at">): Promise<DiagnosisRecord> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("diagnoses").insert(input).select().single();
    return data as DiagnosisRecord;
  }
  const d = db();
  const rec: DiagnosisRecord = { ...input, id: `dg_${++d.seq}`, created_at: nowIso() };
  d.diagnoses.push(rec);
  return rec;
}

export async function getLatestDiagnosis(userId: string): Promise<DiagnosisRecord | null> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb
      .from("diagnoses").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    return (data as DiagnosisRecord) ?? null;
  }
  return (
    db().diagnoses.filter((x) => x.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ??
    null
  );
}

// ── 매칭 신청 (하이브리드 튜터 매칭 플로우) ────────────────
// 최종 매칭은 운영자가 검토·승인한다 — 여기서는 신청 접수만 담당(자동 매칭 없음).
export async function createMatchRequest(
  input: Omit<MatchRequest, "id" | "status" | "created_at" | "updated_at">
): Promise<MatchRequest> {
  const now = nowIso();
  const sb = await authed();
  if (sb) {
    const { data } = await sb
      .from("match_requests")
      .insert({ ...input, status: "new" })
      .select()
      .single();
    return data as MatchRequest;
  }
  const d = db();
  const req: MatchRequest = { ...input, id: `mr_${++d.seq}`, status: "new", created_at: now, updated_at: now };
  d.matchRequests.push(req);
  return req;
}

export async function getMatchRequestById(id: string): Promise<MatchRequest | null> {
  const sb = await authed();
  if (sb) {
    const { data } = await sb.from("match_requests").select("*").eq("id", id).maybeSingle();
    return (data as MatchRequest) ?? null;
  }
  return db().matchRequests.find((r) => r.id === id) ?? null;
}
