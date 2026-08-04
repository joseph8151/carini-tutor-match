import { cookies } from "next/headers";
import { createServerSupabase } from "./supabase/server";
import type { Role, SessionUser } from "./types";

export const DEMO_COOKIE = "carini_demo";

/**
 * 현재 로그인 사용자.
 * - Supabase 설정 시: auth 세션 + users 테이블의 role 조회
 * - 미설정 시: 데모 쿠키(carini_demo) 파싱
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const sb = await createServerSupabase();
  if (sb) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    const { data: row } = await sb
      .from("users")
      .select("id, name, role")
      .eq("id", user.id)
      .maybeSingle();
    return {
      id: user.id,
      name: row?.name ?? user.user_metadata?.name ?? "사용자",
      role: (row?.role as Role) ?? null,
    };
  }

  // 데모 폴백
  const store = await cookies();
  const raw = store.get(DEMO_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionUser;
    return { ...parsed, demo: true };
  } catch {
    return null;
  }
}
