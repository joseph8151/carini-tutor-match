import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { signOut } from "@/lib/actions";

export async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-600">
          카리니 튜터링
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-gray-600">
          <Link href="/tutors" className="hover:text-brand-600">
            튜터 찾기
          </Link>
          <Link href="/academy/mi" className="hover:text-brand-600">
            학원별 레테
          </Link>
          <Link href="/learning-center" className="hover:text-brand-600">
            학습 센터
          </Link>
          <Link href="/mock-tests" className="hover:text-brand-600">
            모의 레테
          </Link>
          <Link href="/pricing" className="hover:text-brand-600">
            요금
          </Link>
          {user ? (
            <>
              {user.role === "parent" && (
                <Link href="/parent" className="hover:text-brand-600">
                  내 학습
                </Link>
              )}
              {user.role === "tutor" && (
                <Link href="/tutor" className="hover:text-brand-600">
                  내 튜터
                </Link>
              )}
              {user.role === "admin" && (
                <>
                  <Link href="/admin/verifications" className="hover:text-brand-600">
                    검수
                  </Link>
                  <Link href="/admin/disputes" className="hover:text-brand-600">
                    분쟁
                  </Link>
                </>
              )}
              <Link href="/inbox" className="hover:text-brand-600">
                문의함
              </Link>
              <span className="hidden text-xs text-gray-400 sm:inline">
                {user.name}
                {user.role === "tutor" ? " · 튜터" : user.role === "parent" ? " · 학부모" : ""}
              </span>
              <form action={signOut}>
                <button className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
