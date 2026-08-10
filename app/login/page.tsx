import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getSessionUser } from "@/lib/session";
import { demoLogin, passwordLogin } from "@/lib/actions";
import { redirect } from "next/navigation";
import { KakaoLoginButton } from "@/components/KakaoLoginButton";

export const metadata = { title: "로그인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; err?: string }>;
}) {
  const { next, err } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(next && next.startsWith("/") ? next : "/");

  const loginParent = demoLogin.bind(null, "parent", next);
  const loginTutor = demoLogin.bind(null, "tutor", next);
  const loginAdmin = demoLogin.bind(null, "admin", next);

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <h1 className="text-2xl font-bold">카리니 튜터링 로그인</h1>
      <p className="text-sm text-gray-500">
        이메일로 로그인하거나 카카오 계정으로 시작하세요.
      </p>

      {err && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          로그인에 실패했습니다. 아이디/비밀번호를 확인해 주세요.
        </p>
      )}

      {/* 이메일/비밀번호 로그인 (회원·테스트 계정) */}
      <form action={passwordLogin} className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4">
        {next && <input type="hidden" name="next" value={next} />}
        <label className="block text-xs text-gray-500">
          이메일
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </label>
        <label className="block text-xs text-gray-500">
          비밀번호
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </label>
        <button className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700">
          이메일로 로그인
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-gray-300">
        <span className="h-px flex-1 bg-gray-200" /> 또는 <span className="h-px flex-1 bg-gray-200" />
      </div>

      {isSupabaseConfigured ? (
        <KakaoLoginButton next={next} />
      ) : (
        <div className="space-y-3">
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            Supabase 미설정 상태입니다. 아래 <b>데모 계정</b>으로 플랫폼 흐름을 바로
            체험하세요. (실서비스는 카카오 OAuth로 대체)
          </p>
          <form action={loginParent}>
            <button className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700">
              학부모 데모로 시작
            </button>
          </form>
          <form action={loginTutor}>
            <button className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50">
              튜터 데모로 시작 (김서연 튜터)
            </button>
          </form>
          <form action={loginAdmin}>
            <button className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100">
              운영자(관리자) 데모
            </button>
          </form>
        </div>
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
