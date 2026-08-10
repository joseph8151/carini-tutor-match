import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// 카카오 OAuth 리다이렉트 → 코드 교환 → 세션 쿠키 설정
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const sb = await createServerSupabase();
    if (sb) {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?err=auth`);
}
