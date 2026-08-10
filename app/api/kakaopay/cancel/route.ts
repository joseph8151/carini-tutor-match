import { NextResponse } from "next/server";

// 사용자가 카카오페이 결제창에서 취소
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/pricing`);
}
