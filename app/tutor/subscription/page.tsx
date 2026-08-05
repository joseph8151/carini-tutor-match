import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getTutorById } from "@/lib/data";
import { downgradeToFree } from "@/lib/actions";
import type { SubscriptionTier } from "@/lib/types";

export const metadata = { title: "구독 관리" };

const PLANS: {
  tier: SubscriptionTier;
  planId?: "tutor_pro" | "tutor_premium";
  name: string;
  price: string;
  perks: string[];
}[] = [
  {
    tier: "free",
    name: "무료",
    price: "0원",
    perks: ["기본 프로필 노출", "최근 문의 3건 열람", "리포트/뱃지 제한"],
  },
  {
    tier: "pro",
    planId: "tutor_pro",
    name: "프로",
    price: "월 29,000원",
    perks: ["검색 상위 노출", "문의 무제한 열람", "수업 리포트 작성", "노출/문의 통계"],
  },
  {
    tier: "premium",
    planId: "tutor_premium",
    name: "프리미엄",
    price: "월 59,000원",
    perks: ["최상위 고정 노출", "학원별 전문 뱃지 강조", "실적 하이라이트", "우선 매칭권 공급"],
  },
];

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/tutor/subscription");
  if (user.role !== "tutor") redirect("/");

  const tutor = await getTutorById(user.id);
  const current = tutor?.subscription_tier ?? "free";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">구독 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          구독 등급이 검색 노출과 문의 열람 한도를 결정합니다. 유료 등급은 카카오페이로 결제됩니다.
        </p>
      </div>

      {ok && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          구독 등급이 변경되었습니다.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = p.tier === current;
          return (
            <div
              key={p.tier}
              className={`flex flex-col rounded-2xl border bg-white p-6 ${
                isCurrent ? "border-brand-500 ring-1 ring-brand-500" : "border-gray-200"
              }`}
            >
              <h2 className="text-lg font-bold">{p.name}</h2>
              <p className="mt-1 text-xl font-extrabold text-brand-600">{p.price}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-600">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <span className="text-brand-500">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full cursor-default rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-400"
                  >
                    현재 이용 중
                  </button>
                ) : p.planId ? (
                  <Link
                    href={`/checkout?plan=${p.planId}`}
                    className="block w-full rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    카카오페이로 결제
                  </Link>
                ) : (
                  <form action={downgradeToFree}>
                    <button className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      무료로 변경
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
