"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DEMO_COOKIE, getSessionUser } from "./session";
import { createServerSupabase } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase";
import { getPlan, type PlanId } from "./plans";
import { isKakaoPayConfigured, kakaoReady } from "./kakaopay";
import {
  addMessage,
  addRecommendation,
  bookMock,
  createInquiry,
  createLessonPayment,
  createMatchRequest,
  createPayment,
  createReport,
  createReview,
  getInquiry,
  getMatchRequestById,
  getPaymentForInquiry,
  grantParentPremium,
  listLessonPaymentsForRequest,
  listRecommendations,
  openDispute,
  releasePayment,
  resolveDispute,
  reviewVerification,
  setTier,
  submitVerification,
  updateMatchRequestStatus,
  usePass,
} from "./store";
import { getAcademyBySlug, getTutorById } from "./data";
import { QUESTIONS, scoreDiagnosis } from "./diagnosis";
import { saveDiagnosis } from "./store";
import { matchRequestSchema, PAYMENT_READY_STATUSES, type MatchRequestInput } from "./match";
import { getLessonPackage, SAMPLE_LESSON_DURATION_MIN, SAMPLE_LESSON_PRICE } from "./lessonPackages";
import { getPaymentProvider } from "./payment/mock";
import type { MatchRequestStatus, Role } from "./types";

const COOKIE_OPTS = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 };

// ── 데모 로그인/로그아웃 (Supabase 미설정 시) ──────────────
export async function demoLogin(role: Role, next?: string) {
  const store = await cookies();
  const user =
    role === "tutor"
      ? { id: "tu_1", name: "김서연", role: "tutor" as Role }
      : role === "admin"
        ? { id: "demo_admin", name: "운영자", role: "admin" as Role }
        : { id: "demo_parent", name: "데모 학부모", role: "parent" as Role };
  store.set(DEMO_COOKIE, JSON.stringify(user), COOKIE_OPTS);
  const home = role === "tutor" ? "/tutor" : role === "admin" ? "/admin/verifications" : "/parent";
  redirect(next && next.startsWith("/") ? next : home);
}

export async function signOut() {
  const sb = await createServerSupabase();
  if (sb) await sb.auth.signOut();
  const store = await cookies();
  store.delete(DEMO_COOKIE);
  redirect("/");
}

// ── 역할 선택 (온보딩) — Supabase 사용자 대상 ─────────────
export async function chooseRole(role: Role) {
  const sb = await createServerSupabase();
  if (!sb) redirect("/");
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");
  await sb.from("users").upsert({
    id: user.id,
    role,
    name: user.user_metadata?.name ?? "사용자",
    email: user.email,
    kakao_id: user.user_metadata?.provider_id ?? null,
  });
  redirect(role === "tutor" ? "/inbox" : "/tutors");
}

// ── 문의 생성 (학부모 → 튜터) ─────────────────────────────
export async function startInquiry(formData: FormData) {
  const user = await getSessionUser();
  const tutorId = String(formData.get("tutorId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const academySlug = String(formData.get("academySlug") ?? "") || undefined;

  if (!user) redirect(`/login?next=/tutors/${tutorId}`);
  if (user.role !== "parent") {
    redirect(`/tutors/${tutorId}?err=parent_only`);
  }
  if (!body) redirect(`/tutors/${tutorId}?err=empty`);

  const tutor = await getTutorById(tutorId);
  if (!tutor) redirect("/tutors");

  // 우선 매칭권 사용 (보유 시에만 소모)
  const wantPriority = String(formData.get("usePass") ?? "") === "1";
  const priority = wantPriority ? await usePass(user.id) : false;

  const iq = await createInquiry({
    parentId: user.id,
    parentName: user.name,
    tutorId: tutor.id,
    tutorName: tutor.name,
    academySlug,
    body,
    priority,
  });
  redirect(`/inbox/${iq.id}`);
}

// ── 메시지 전송 ───────────────────────────────────────────
export async function sendMessage(formData: FormData) {
  const user = await getSessionUser();
  const inquiryId = String(formData.get("inquiryId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!user) redirect("/login");
  if (!body) return;

  const iq = await getInquiry(inquiryId);
  if (!iq || (iq.parent_id !== user.id && iq.tutor_id !== user.id)) {
    redirect("/inbox");
  }
  await addMessage({ inquiryId, senderId: user.id, body });
  revalidatePath(`/inbox/${inquiryId}`);
}

// ── 무료로 변경 (다운그레이드, 결제 없음) ─────────────────
export async function downgradeToFree() {
  const user = await getSessionUser();
  if (user?.role !== "tutor") redirect("/login?next=/tutor/subscription");
  await setTier(user.id, "free");
  revalidatePath("/tutor/subscription");
  revalidatePath("/tutor");
  redirect("/tutor/subscription?ok=1");
}

// 결제 성공 시 상품(플랜) 적용
async function grantPlan(userId: string, planId: PlanId) {
  const plan = getPlan(planId);
  if (!plan) return;
  if (plan.audience === "tutor" && plan.tier) await setTier(userId, plan.tier);
  if (plan.audience === "parent") await grantParentPremium(userId);
}

// ── 실적 인증 신청 (튜터) ─────────────────────────────────
export async function requestVerification(formData: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "tutor") redirect("/login?next=/tutor");
  const academySlug = String(formData.get("academySlug") ?? "");
  const type = String(formData.get("type") ?? "pass") === "career" ? "career" : "pass";
  const evidence = String(formData.get("evidence") ?? "").trim();
  const academy = await getAcademyBySlug(academySlug);
  if (!academy || !evidence) redirect("/tutor?err=verify");
  await submitVerification({
    tutorId: user.id,
    tutorName: user.name,
    academySlug: academy.slug,
    academyName: academy.name,
    type,
    evidence,
  });
  redirect("/tutor?ok=verify");
}

// ── 인증 검수 (관리자) ────────────────────────────────────
export async function decideVerification(formData: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/login?next=/admin/verifications");
  const id = String(formData.get("id") ?? "");
  const approve = String(formData.get("decision") ?? "") === "approve";
  await reviewVerification(id, approve);
  revalidatePath("/admin/verifications");
}

// ── 수업 리포트 작성 (튜터 → 학부모 대시보드) ─────────────
export async function writeReport(formData: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "tutor") redirect("/login");
  const inquiryId = String(formData.get("inquiryId") ?? "");
  const iq = await getInquiry(inquiryId);
  if (!iq || iq.tutor_id !== user.id) redirect("/inbox");

  const content = String(formData.get("content") ?? "").trim();
  const progressNote = String(formData.get("progressNote") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  if (!content) redirect(`/inbox/${inquiryId}?err=report`);

  await createReport({
    inquiryId,
    tutorId: user.id,
    tutorName: user.name,
    parentId: iq.parent_id,
    academySlug: iq.academy_slug,
    date,
    content,
    progressNote,
  });
  revalidatePath(`/inbox/${inquiryId}`);
  redirect(`/inbox/${inquiryId}?ok=report`);
}

// ── 합격 후기 작성 (학부모 → 튜터 프로필) ─────────────────
export async function writeReview(formData: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "parent") redirect("/login");
  const tutorId = String(formData.get("tutorId") ?? "");
  const tutor = await getTutorById(tutorId);
  if (!tutor) redirect("/tutors");

  const rating = Number(formData.get("rating") ?? 5);
  const body = String(formData.get("body") ?? "").trim();
  const isVerifiedPass = String(formData.get("pass") ?? "") === "1";
  if (!body) redirect(`/tutors/${tutorId}?err=review`);

  await createReview({
    parentId: user.id,
    parentName: user.name,
    tutorId: tutor.id,
    tutorName: tutor.name,
    academySlug: tutor.academy_slugs[0],
    rating,
    body,
    isVerifiedPass,
  });
  revalidatePath(`/tutors/${tutorId}`);
  redirect(`/tutors/${tutorId}?ok=review`);
}

// ── 결제 시작: 카카오페이 결제창으로 이동 ─────────────────
export async function startCheckout(formData: FormData) {
  const planId = String(formData.get("plan") ?? "") as PlanId;
  const plan = getPlan(planId);
  if (!plan) redirect("/pricing");
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout?plan=${planId}`)}`);

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;
  const orderId = `ord_${user.id}_${planId}_${Math.floor(Date.now() / 1000)}`;

  const result = await kakaoReady({
    orderId,
    userId: user.id,
    planId,
    itemName: `카리니 튜터링 ${plan.name}`,
    amount: plan.price,
    origin,
  });
  if ("error" in result) redirect(`/checkout?plan=${planId}&err=${result.error}`);
  redirect(result.redirectUrl);
}

// ── 데모 결제 완료 (카카오페이 키 미설정 시에만 노출) ──────
// 실제 카드 결제창이 아니며, 결제 이후 상태 확인용으로만 명시적으로 제공.
export async function demoCompletePurchase(formData: FormData) {
  if (isKakaoPayConfigured) redirect("/pricing");
  const planId = String(formData.get("plan") ?? "") as PlanId;
  const plan = getPlan(planId);
  if (!plan) redirect("/pricing");
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout?plan=${planId}`)}`);
  await grantPlan(user.id, planId);
  redirect(`/checkout/success?plan=${planId}`);
}

// 카카오페이 승인 콜백에서 호출 (플랜 적용)
export async function applyPaidPlan(userId: string, planId: PlanId) {
  await grantPlan(userId, planId);
}

// ── 이메일/비밀번호 로그인 (테스트 계정용) ────────────────
export async function passwordLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  const dest = next && next.startsWith("/") ? next : "/parent";

  if (isSupabaseConfigured) {
    const sb = await createServerSupabase();
    const { error } = (await sb?.auth.signInWithPassword({ email, password })) ?? { error: true };
    if (error) redirect(`/login?err=cred${next ? `&next=${encodeURIComponent(next)}` : ""}`);
    redirect(dest);
  }

  // 데모 모드: 환경변수 또는 기본 테스트 계정
  const testEmail = process.env.TEST_MEMBER_EMAIL || "test@carini.demo";
  const testPw = process.env.TEST_MEMBER_PASSWORD || "carini1234";
  if (email === testEmail && password === testPw) {
    const store = await cookies();
    store.set(
      DEMO_COOKIE,
      JSON.stringify({ id: "test_member", name: "테스트회원", role: "parent" }),
      COOKIE_OPTS,
    );
    redirect(dest);
  }
  redirect(`/login?err=cred${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}

// ── 결제 보호: 첫 수업 안전결제 (에스크로 유사) ───────────
export async function payFirstLesson(formData: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "parent") redirect("/login");
  const inquiryId = String(formData.get("inquiryId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const iq = await getInquiry(inquiryId);
  if (!iq || iq.parent_id !== user.id) redirect("/inbox");
  if (!(await getPaymentForInquiry(inquiryId))) {
    await createPayment({ inquiryId, parentId: user.id, tutorId: iq.tutor_id, amount });
  }
  revalidatePath(`/inbox/${inquiryId}`);
}

export async function confirmLesson(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const inquiryId = String(formData.get("inquiryId") ?? "");
  const paymentId = String(formData.get("paymentId") ?? "");
  const iq = await getInquiry(inquiryId);
  if (!iq || iq.parent_id !== user.id) redirect("/inbox");
  await releasePayment(paymentId);
  revalidatePath(`/inbox/${inquiryId}`);
}

export async function raiseDispute(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const inquiryId = String(formData.get("inquiryId") ?? "");
  const paymentId = String(formData.get("paymentId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || "분쟁 신청";
  const iq = await getInquiry(inquiryId);
  if (!iq || (iq.parent_id !== user.id && iq.tutor_id !== user.id)) redirect("/inbox");
  await openDispute({ paymentId, openedBy: user.id, reason });
  revalidatePath(`/inbox/${inquiryId}`);
}

export async function decideDispute(formData: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/login?next=/admin/disputes");
  const disputeId = String(formData.get("disputeId") ?? "");
  const refund = String(formData.get("decision") ?? "") === "refund";
  await resolveDispute(disputeId, refund);
  revalidatePath("/admin/disputes");
}

// ── 레벨 진단 제출 ────────────────────────────────────────
export async function submitDiagnosis(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/diagnosis/test");
  const answers: Record<string, number> = {};
  for (const q of QUESTIONS) {
    const v = formData.get(`q_${q.id}`);
    if (v !== null) answers[q.id] = Number(v);
  }
  const s = scoreDiagnosis(answers);
  await saveDiagnosis({
    user_id: user.id,
    overall: s.overall,
    percentile: s.percentile,
    level: s.level,
    reading: s.byCategory.reading,
    vocab: s.byCategory.vocab,
    grammar: s.byCategory.grammar,
    pass_ready: s.passReady,
    recommendation: s.recommendation,
  });
  redirect("/diagnosis/result");
}

// ── 모의 레테 신청 ────────────────────────────────────────
export async function bookMockTest(formData: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "parent") redirect("/login?next=/mock-tests");
  const mockId = String(formData.get("mockId") ?? "");
  await bookMock(user.id, mockId);
  revalidatePath("/mock-tests");
  revalidatePath("/parent");
  redirect("/mock-tests?ok=1");
}

// ── 매칭 신청 (하이브리드 튜터 매칭 플로우) ────────────────
// 자동 매칭 없음: 신청을 접수하고, 최종 매칭은 운영자가 검토·승인한다.
export async function submitMatchRequest(
  input: MatchRequestInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = matchRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요." };
  }
  const user = await getSessionUser();
  const req = await createMatchRequest({ ...parsed.data, user_id: user?.id });
  revalidatePath("/admin/matches");
  return { ok: true, id: req.id };
}

// ── 운영자: 매칭 신청 상태/추천 관리 ────────────────────────
export async function changeMatchStatus(formData: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as MatchRequestStatus;
  await updateMatchRequestStatus(id, status);
  revalidatePath("/admin/matches");
}

// ── 샘플수업 / 정규 패키지 결제 ──────────────────────────────
export async function startSampleCheckout(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  const request = await getMatchRequestById(requestId);
  if (!request) redirect("/match");
  if (!PAYMENT_READY_STATUSES.has(request.status)) redirect(`/match/complete?id=${requestId}`);

  const recs = await listRecommendations(requestId);
  const confirmed = recs.find((r) => r.status === "confirmed");
  const tutorId = confirmed?.tutor_id ?? request.requested_tutor_id;
  const tutorName = confirmed?.tutor_name ?? request.requested_tutor_name;
  if (!tutorId || !tutorName) redirect(`/match/complete?id=${requestId}`);

  const user = await getSessionUser();
  const payment = await createLessonPayment({
    match_request_id: requestId,
    user_id: user?.id,
    tutor_id: tutorId,
    tutor_name: tutorName,
    student_label: `${request.parent_name}님 자녀 · ${request.child_age}`,
    product_type: "sample",
    lesson_schedule: confirmed?.available_schedule,
    location: request.location,
    duration_minutes: SAMPLE_LESSON_DURATION_MIN,
    amount: SAMPLE_LESSON_PRICE,
  });
  await getPaymentProvider().createPayment(payment);
  redirect(`/checkout/pay?paymentId=${payment.id}`);
}

export async function startPackageCheckout(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  const packageId = String(formData.get("packageId") ?? "");
  const pkg = getLessonPackage(packageId);
  const request = await getMatchRequestById(requestId);
  if (!request || !pkg) redirect("/match");

  const paid = await listLessonPaymentsForRequest(requestId);
  const sampleDone = paid.some((p) => p.product_type === "sample" && p.status === "paid");
  if (!sampleDone) redirect(`/checkout/sample?requestId=${requestId}`);

  const confirmed = (await listRecommendations(requestId)).find((r) => r.status === "confirmed");
  const tutorId = confirmed?.tutor_id ?? request.requested_tutor_id ?? "";
  const tutorName = confirmed?.tutor_name ?? request.requested_tutor_name ?? "";

  const user = await getSessionUser();
  const payment = await createLessonPayment({
    match_request_id: requestId,
    user_id: user?.id,
    tutor_id: tutorId,
    tutor_name: tutorName,
    student_label: `${request.parent_name}님 자녀 · ${request.child_age}`,
    product_type: "package",
    package_id: pkg.id,
    location: request.location,
    duration_minutes: SAMPLE_LESSON_DURATION_MIN,
    amount: pkg.price,
  });
  await getPaymentProvider().createPayment(payment);
  redirect(`/checkout/pay?paymentId=${payment.id}`);
}

export async function confirmMockPayment(formData: FormData) {
  const paymentId = String(formData.get("paymentId") ?? "");
  await getPaymentProvider().confirmPayment(paymentId);
  redirect(`/checkout/pay/success?paymentId=${paymentId}`);
}

export async function cancelMockPayment(formData: FormData) {
  const paymentId = String(formData.get("paymentId") ?? "");
  const requestId = String(formData.get("requestId") ?? "");
  await getPaymentProvider().cancelPayment(paymentId);
  redirect(`/match/complete?id=${requestId}`);
}

export async function addTutorRecommendation(formData: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/");
  const matchRequestId = String(formData.get("matchRequestId") ?? "");
  const tutorId = String(formData.get("tutorId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const schedule = String(formData.get("schedule") ?? "").trim();
  if (!tutorId || !reason) redirect("/admin/matches?err=missing_fields");
  const tutor = await getTutorById(tutorId);
  if (!tutor) redirect("/admin/matches?err=tutor_not_found");
  await addRecommendation({
    match_request_id: matchRequestId,
    tutor_id: tutorId,
    tutor_name: tutor.name,
    admin_reason: reason,
    available_schedule: schedule || undefined,
  });
  revalidatePath("/admin/matches");
}
