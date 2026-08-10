import Link from "next/link";
import { QUESTIONS } from "@/lib/diagnosis";

export const metadata = {
  title: "레벨 진단 테스트 — 카리니 프랩 센터",
  description: "리딩·보카·그래머 진단으로 우리 아이의 현재 레벨과 약점을 데이터로 확인하세요.",
};

export default function DiagnosisIntro() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white">
        <p className="text-sm font-semibold text-brand-100">🎯 레벨 진단 테스트</p>
        <h1 className="mt-2 text-3xl font-extrabold">우리 아이 지금 레벨, 정확히 알아봐요</h1>
        <p className="mt-3 text-brand-100">
          리딩·보카·그래머 {QUESTIONS.length}문항으로 현재 실력과 약점 유형을 진단하고,
          또래 백분위·추천 레벨·맞춤 처방을 리포트로 드려요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { t: "약 5분", d: `${QUESTIONS.length}문항 · 리딩·보카·그래머` },
          { t: "즉시 결과", d: "백분위·유형별 분석·추천 레벨" },
          { t: "맞춤 처방", d: "약점부터 시작하는 코스 추천" },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
            <p className="font-bold text-brand-600">{x.t}</p>
            <p className="mt-1 text-sm text-gray-500">{x.d}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/diagnosis/test"
          className="inline-block rounded-xl bg-brand-600 px-8 py-3.5 font-semibold text-white hover:bg-brand-700"
        >
          진단 시작하기
        </Link>
        <p className="mt-2 text-xs text-gray-400">로그인 후 진행되며, 결과는 대시보드에 저장돼요.</p>
      </div>
    </div>
  );
}
