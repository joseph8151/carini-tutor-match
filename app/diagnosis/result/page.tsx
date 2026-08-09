import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getLatestDiagnosis } from "@/lib/store";
import { CATEGORY_LABEL } from "@/lib/diagnosis";

export const metadata = { title: "진단 결과 리포트" };

function Gauge({ percentile }: { percentile: number }) {
  const c = 2 * Math.PI * 52;
  return (
    <svg viewBox="0 0 140 140" className="h-36 w-36" role="img" aria-label={`백분위 ${percentile}`}>
      <circle cx="70" cy="70" r="52" fill="none" stroke="#e5ecff" strokeWidth="14" />
      <circle
        cx="70" cy="70" r="52" fill="none" stroke="#3b6cff" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${(c * percentile) / 100} ${c}`} transform="rotate(-90 70 70)"
      />
      <text x="70" y="66" textAnchor="middle" fontSize="30" fontWeight="800" fill="#1f40b8">{percentile}</text>
      <text x="70" y="88" textAnchor="middle" fontSize="12" fill="#8aa0c8">또래 백분위</text>
    </svg>
  );
}

export default async function DiagnosisResult() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/diagnosis");
  const d = await getLatestDiagnosis(user.id);
  if (!d) redirect("/diagnosis");

  const cats: { key: "reading" | "vocab" | "grammar"; v: number }[] = [
    { key: "reading", v: d.reading },
    { key: "vocab", v: d.vocab },
    { key: "grammar", v: d.grammar },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold">진단 결과 리포트</h1>
        <p className="mt-1 text-sm text-gray-500">{user.name}님의 최근 진단 결과예요.</p>
      </div>

      {/* 요약 */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row">
        <Gauge percentile={d.percentile} />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              종합 점수 {d.overall}점
            </span>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              추천 시작 레벨 {d.level}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                d.pass_ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {d.pass_ready ? "상위권 레테 도전 가능" : "기초·향상 집중 단계"}
            </span>
          </div>
          <p className="text-sm text-gray-600">{d.recommendation}</p>
        </div>
      </div>

      {/* 유형별 분석 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-bold">유형별 분석</h2>
        <div className="mt-4 space-y-3">
          {cats.map((c) => (
            <div key={c.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-gray-700">{CATEGORY_LABEL[c.key]}</span>
                <span className="text-gray-500">{c.v}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-100">
                <div className="h-2.5 rounded-full bg-brand-600" style={{ width: `${c.v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 다음 단계 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-bold">추천 다음 단계</h2>
        <p className="mt-1 text-sm text-gray-600">{d.recommendation}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/pricing" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            학습 시작하기
          </Link>
          <Link href="/tutors" className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            인증 튜터 찾기
          </Link>
          <Link href="/diagnosis/test" className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            다시 진단하기
          </Link>
        </div>
      </div>
    </div>
  );
}
