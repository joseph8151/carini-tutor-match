import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase 환경변수가 설정되어 있으면 true.
 * false 이면 데이터 접근 계층(lib/data.ts)이 lib/seed.ts 목업으로 폴백합니다.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    });
  }
  return cached;
}

// 서버 전용: RLS 우회가 필요한 관리자 작업(인증 검수/분쟁 중재)용.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let cachedService: SupabaseClient | null = null;

export function getServiceSupabase(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!cachedService) {
    cachedService = createClient(url as string, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return cachedService;
}
