import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "카리니 튜터링 — 대치·분당 영어학원 레테 전문 튜터 매칭",
    template: "%s | 카리니 튜터링",
  },
  description:
    "MI·트윈클·에디센·피아이 등 상위권 영어학원 레벨테스트(레테) 합격을 시킨 인증 튜터를 매칭합니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-400">
          카리니 튜터링 · 레테·프랩 전문 매칭 (MVP)
        </footer>
      </body>
    </html>
  );
}
