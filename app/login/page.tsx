import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <h1 className="text-2xl font-bold">카리니 튜터링 로그인</h1>
      <p className="text-sm text-gray-500">
        학부모와 튜터 모두 카카오 계정으로 시작합니다. 로그인 후 역할을 선택하세요.
      </p>

      <button
        disabled
        className="w-full rounded-xl bg-[#FEE500] px-4 py-3 font-semibold text-[#3c1e1e] opacity-90"
      >
        카카오로 계속하기
      </button>

      {!isSupabaseConfigured && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          현재 Supabase 환경변수가 설정되지 않아 로그인은 비활성화 상태입니다. Sprint 1에서
          카카오 OAuth(Supabase Auth)를 연결합니다. (설정: <code>.env.example</code> 참고)
        </p>
      )}

      <div className="flex justify-between text-sm text-gray-400">
        <Link href="/" className="hover:text-brand-600">
          ← 홈으로
        </Link>
        <span>역할 선택: 학부모 / 튜터</span>
      </div>
    </div>
  );
}
