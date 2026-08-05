import { NextResponse } from "next/server";
import { kakaoApprove } from "@/lib/kakaopay";
import { applyPaidPlan } from "@/lib/actions";
import type { PlanId } from "@/lib/plans";

// 카카오페이 결제창에서 결제 완료 후 approval_url 콜백
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const orderId = searchParams.get("order") ?? "";
  const pgToken = searchParams.get("pg_token") ?? "";

  const result = await kakaoApprove(orderId, pgToken);
  if ("error" in result) {
    return NextResponse.redirect(`${origin}/checkout?err=${result.error}`);
  }
  await applyPaidPlan(result.userId, result.planId as PlanId);
  return NextResponse.redirect(`${origin}/checkout/success?plan=${result.planId}`);
}
