import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlan } from "@/lib/plans";
import { getSessionUser } from "@/lib/session";
import { isKakaoPayConfigured } from "@/lib/kakaopay";
import { startCheckout, demoCompletePurchase } from "@/lib/actions";

export const metadata = { title: "결제 — 카리니 튜터링" };

const ERR: Record<string, string> = {
  unconfigured: "결제 연동이 아직 설정되지 않았습니다.",
  network: "결제 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; err?: string }>;
}) {
  const { plan: planId, err } = await searchParams;
  const plan = getPlan(planId ?? "");
  if (!plan) redirect("/pricing");

  // 회원제: 로그인 필요 (비회원은 로그인으로 유도, 메인으로 튕기지 않음)
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout?plan=${plan.id}`)}`);

  return (
    <div className="mx-auto max-w-md space-y-6 py-6">
      <nav className="text-sm text-gray-400">
        <Link href="/pricing" className="hover:text-brand-600">
          요금 안내
        </Link>{" "}
        / <span className="text-gray-600">결제</span>
      </nav>

      <h1 className="text-2xl font-bold">주문 확인</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{plan.audience === "tutor" ? "튜터" : "학부모"}</p>
            <p className="text-lg font-bold">{plan.name}</p>
            <p className="text-sm text-gray-500">{plan.summary}</p>
          </div>
          <p className="text-xl font-extrabold text-brand-600">
            {plan.price.toLocaleString()}원
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
          <span className="text-gray-500">결제 수단</span>
          <span className="font-semibold text-[#3c1e1e]">카카오페이</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">주문자: {user.name} 님</p>
      </div>

      {err && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {ERR[err] ?? "결제 처리 중 오류가 발생했습니다."}
        </p>
      )}

      {isKakaoPayConfigured ? (
        <form action={startCheckout}>
          <input type="hidden" name="plan" value={plan.id} />
          <button className="w-full rounded-xl bg-[#FEE500] px-4 py-3.5 font-bold text-[#3c1e1e] hover:brightness-95">
            카카오페이로 결제하기
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            현재 데모 환경에는 카카오페이 결제 키(<code>KAKAOPAY_SECRET_KEY</code>)가 설정되지
            않았습니다. 운영 환경에 키를 설정하면 이 버튼이 실제 카카오페이 결제창으로
            연결됩니다. 아래 버튼은 결제 이후 화면 확인용 데모입니다.
          </p>
          <form action={demoCompletePurchase}>
            <input type="hidden" name="plan" value={plan.id} />
            <button className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              데모: 결제 완료 처리
            </button>
          </form>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        결제를 진행하면 이용약관 및 정기결제 정책에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
