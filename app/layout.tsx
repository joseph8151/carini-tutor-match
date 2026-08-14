import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "카리니 튜터링 — 유아·초등 1:1 영어 튜터링",
    template: "%s | 카리니 튜터링",
  },
  description:
    "만 2세부터 초등학생까지, 미국·캐나다 원어민 선생님과 함께하는 1:1 맞춤 영어 튜터링. 아이의 나이와 수준에 맞는 선생님을 카리니가 매칭해드립니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-cream font-sans text-charcoal antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-softgray bg-warmwhite">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="font-sans text-base font-bold text-brand-600">카리니 튜터링</p>
                <p className="mt-1 text-sm text-charcoal/50">
                  유아·초등 전문 1:1 영어 튜터링 · 검증된 선생님만 매칭합니다
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-softgray bg-cream px-4 py-3">
                <span className="text-sm text-charcoal/60">상담이 필요하신가요?</span>
                <Link
                  href="/inbox"
                  className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  1:1 문의하기
                </Link>
              </div>
            </div>
            <p className="mt-8 text-xs text-charcoal/30">카리니 튜터링 · 유아·초등 영어 튜터 매칭 (MVP)</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
