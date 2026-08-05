import Link from "next/link";
import { PLAN_LIST } from "@/lib/plans";

export const metadata = {
  title: "요금 안내 — 카리니 튜터링",
  description: "튜터 구독(프로/프리미엄)과 학부모 프리미엄 요금 안내. 카카오페이 결제.",
};

// 비회원도 열람 가능한 공개 요금/상품안내 페이지.
export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">요금 안내</h1>
        <p className="mt-2 text-gray-500">
          레테 전문 매칭을 더 강력하게. 결제는 카카오페이로 안전하게 진행됩니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_LIST.map((p) => (
          <div key={p.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-medium text-gray-400">
              {p.audience === "tutor" ? "튜터" : "학부모"}
            </p>
            <h2 className="mt-1 text-lg font-bold">{p.name}</h2>
            <p className="mt-1 text-2xl font-extrabold text-brand-600">
              {p.price.toLocaleString()}원<span className="text-sm font-normal text-gray-400">/월</span>
            </p>
            <p className="mt-1 text-sm text-gray-500">{p.summary}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-600">
              {p.perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <span className="text-brand-500">✓</span>
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              href={`/checkout?plan=${p.id}`}
              className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
            >
              시작하기
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        결제는 로그인 후 진행됩니다. 정기결제는 언제든 해지할 수 있습니다.
      </p>
    </div>
  );
}
