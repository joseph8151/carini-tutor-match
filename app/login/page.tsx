import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getSessionUser } from "@/lib/session";
import { demoLogin } from "@/lib/actions";
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

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <h1 className="text-2xl font-bold">카리니 튜터링 로그인</h1>
      <p className="text-sm text-gray-500">
        학부모와 튜터 모두 카카오 계정으로 시작합니다. 로그인 후 역할을 선택하세요.
      </p>

      {err && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          로그인에 실패했습니다. 다시 시도해 주세요.
        </p>
      )}

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
