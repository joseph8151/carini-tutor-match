import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isParentPremium, getPasses, PREMIUM_PASS_GRANT } from "@/lib/store";
import { upgradeParentPremium } from "@/lib/actions";

export const metadata = { title: "학부모 프리미엄" };

const PERKS = [
  "우선 매칭 (우선 매칭권 지급)",
  "상세 합격 후기 전문 열람",
  "레테 일정 D-day 알림",
  "모의 레테 우선 신청",
];

export default async function ParentPremiumPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/parent/premium");
  if (user.role !== "parent") redirect("/");

  const premium = isParentPremium(user.id);
  const passes = getPasses(user.id);
  const action = upgradeParentPremium;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">학부모 프리미엄</h1>
        <p className="mt-1 text-sm text-gray-500">
          우리 아이 레테 준비를 우선순위로. 결제는 데모(모의)이며 실서비스는 토스/카카오페이
          정기결제로 연동됩니다.
        </p>
      </div>

      {ok && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          프리미엄이 활성화되었습니다. 우선 매칭권 {PREMIUM_PASS_GRANT}장이 지급되었습니다.
        </p>
      )}

      <div className="rounded-2xl border border-brand-500 bg-white p-6 ring-1 ring-brand-500">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">프리미엄</h2>
          <p className="text-xl font-extrabold text-brand-600">월 19,000원</p>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          {PERKS.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-brand-500">✓</span>
              {p}
            </li>
          ))}
        </ul>

        {premium ? (
          <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
            현재 프리미엄 이용 중 · 우선 매칭권 <b>{passes.remaining}</b>장 보유
            <Link href="/tutors" className="ml-2 underline">
              튜터 찾기 →
            </Link>
          </div>
        ) : (
          <form action={action} className="mt-5">
            <button className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700">
              프리미엄 시작 (모의 결제)
            </button>
          </form>
        )}
      </div>

      <Link href="/parent" className="text-sm text-gray-400 hover:text-brand-600">
        ← 대시보드로
      </Link>
    </div>
  );
}
