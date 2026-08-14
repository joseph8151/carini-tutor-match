import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { signOut } from "@/lib/actions";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/tutors", label: "튜터 찾기" },
  { href: "/#programs", label: "수업 프로그램" },
  { href: "/#kinder-english", label: "유아 영어" },
  { href: "/#elementary-english", label: "초등 영어" },
  { href: "/#prep", label: "레벨테스트 Prep" },
  { href: "/learning-center", label: "학습센터" },
  { href: "/pricing", label: "이용안내" },
];

export async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-10 border-b border-softgray bg-warmwhite/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-sans text-lg font-extrabold text-brand-600">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-butter-500" />
          카리니 튜터링
        </Link>
        <nav className="hidden items-center gap-6 text-[13.5px] font-medium text-charcoal/70 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="transition hover:text-brand-600">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <MobileMenu links={NAV_LINKS} />
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "parent" && (
                <Link href="/parent" className="hidden text-charcoal/70 hover:text-brand-600 sm:inline">
                  내 학습
                </Link>
              )}
              {user.role === "tutor" && (
                <Link href="/tutor" className="hidden text-charcoal/70 hover:text-brand-600 sm:inline">
                  내 튜터
                </Link>
              )}
              {user.role === "admin" && (
                <>
                  <Link href="/admin/matches" className="hidden text-charcoal/70 hover:text-brand-600 sm:inline">
                    매칭 관리
                  </Link>
                  <Link href="/admin/verifications" className="hidden text-charcoal/70 hover:text-brand-600 sm:inline">
                    검수
                  </Link>
                  <Link href="/admin/disputes" className="hidden text-charcoal/70 hover:text-brand-600 sm:inline">
                    분쟁
                  </Link>
                </>
              )}
              <Link href="/inbox" className="hidden text-charcoal/70 hover:text-brand-600 sm:inline">
                문의함
              </Link>
              <span className="hidden text-xs text-charcoal/40 md:inline">
                {user.name}
                {user.role === "tutor" ? " · 튜터" : user.role === "parent" ? " · 학부모" : ""}
              </span>
              <form action={signOut}>
                <button className="rounded-xl border border-softgray px-3 py-1.5 text-charcoal/70 transition hover:bg-softgray">
                  로그아웃
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-brand-600/15 px-3.5 py-1.5 font-semibold text-brand-600 transition hover:bg-brand-600 hover:text-white"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
