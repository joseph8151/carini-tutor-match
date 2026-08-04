"use client";

import { createBrowserSupabase } from "@/lib/supabase/client";

export function KakaoLoginButton({ next }: { next?: string }) {
  async function signIn() {
    const sb = createBrowserSupabase();
    if (!sb) return;
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next ?? "/onboarding",
    )}`;
    await sb.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo } });
  }

  return (
    <button
      onClick={signIn}
      className="w-full rounded-xl bg-[#FEE500] px-4 py-3 font-semibold text-[#3c1e1e] hover:brightness-95"
    >
      카카오로 계속하기
    </button>
  );
}
