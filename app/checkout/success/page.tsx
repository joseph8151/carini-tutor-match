import Link from "next/link";
import { getPlan } from "@/lib/plans";

export const metadata = { title: "결제 완료 — 카리니 튜터링" };

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planId } = await searchParams;
  const plan = getPlan(planId ?? "");
  const home = plan?.audience === "tutor" ? "/tutor" : "/parent";

  return (
    <div className="mx-auto max-w-md space-y-6 py-12 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="text-2xl font-bold">결제가 완료되었습니다</h1>
      <p className="text-gray-500">
        {plan ? <b>{plan.name}</b> : "구독"}이 활성화되었습니다. 이용해 주셔서 감사합니다.
      </p>
      <Link
        href={home}
        className="inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
      >
        내 페이지로 이동
      </Link>
    </div>
  );
}
