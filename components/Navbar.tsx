import Link from "next/link";

export function Navbar() {
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
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
          >
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}
