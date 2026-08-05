import { NextResponse } from "next/server";

// 카카오페이 결제 실패
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/checkout?err=fail`);
}
