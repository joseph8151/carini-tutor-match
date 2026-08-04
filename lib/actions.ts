"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DEMO_COOKIE, getSessionUser } from "./session";
import { createServerSupabase } from "./supabase/server";
import {
  addMessage,
  createInquiry,
  getInquiry,
  reviewVerification,
  setTier,
  submitVerification,
} from "./store";
import { getAcademyBySlug, getTutorById } from "./data";
import type { Role, SubscriptionTier } from "./types";

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
  const home = role === "tutor" ? "/tutor" : role === "admin" ? "/admin/verifications" : "/tutors";
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

  const iq = createInquiry({
    parentId: user.id,
    parentName: user.name,
    tutorId: tutor.id,
    tutorName: tutor.name,
    academySlug,
    body,
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

  const iq = getInquiry(inquiryId);
  if (!iq || (iq.parent_id !== user.id && iq.tutor_id !== user.id)) {
    redirect("/inbox");
  }
  addMessage({ inquiryId, senderId: user.id, body });
  revalidatePath(`/inbox/${inquiryId}`);
}

// ── 구독 업그레이드 (MVP: 모의 결제. 실서비스=토스/카카오페이) ──
export async function upgradePlan(plan: SubscriptionTier) {
  const user = await getSessionUser();
  if (user?.role !== "tutor") redirect("/login?next=/tutor/subscription");
  setTier(user.id, plan);
  revalidatePath("/tutor/subscription");
  revalidatePath("/tutor");
  redirect("/tutor/subscription?ok=1");
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
  submitVerification({
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
  reviewVerification(id, approve);
  revalidatePath("/admin/verifications");
}
