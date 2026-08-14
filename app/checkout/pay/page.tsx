import Link from "next/link";
import { getLessonPaymentById } from "@/lib/store";
import { getLessonPackage } from "@/lib/lessonPackages";
import { confirmMockPayment, cancelMockPayment } from "@/lib/actions";

export const metadata = { title: "결제 — 카리니 튜터링" };

export default async function LessonPayPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const { paymentId } = await searchParams;
  const payment = paymentId ? await getLessonPaymentById(paymentId) : null;

  if (!payment) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-10 text-center">
        <p className="text-charcoal/60">결제 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const productLabel =
    payment.product_type === "sample" ? "샘플수업 (1회)" : getLessonPackage(payment.package_id ?? "")?.label ?? "정규 패키지";

  if (payment.status !== "pending") {
    return (
      <div className="mx-auto max-w-md space-y-4 py-10 text-center">
        <p className="font-bold text-brand-700">이미 처리된 결제입니다. (상태: {payment.status})</p>
        <Link href={`/match/complete?id=${payment.match_request_id}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          신청 현황 보기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="text-center">
        <p className="text-xs font-semibold text-brand-600">결제 확인</p>
        <h1 className="mt-2 font-sans text-2xl font-extrabold text-brand-700">주문을 확인해 주세요</h1>
      </div>

      <div className="rounded-2xl border border-softgray bg-warmwhite p-6">
        <p className="text-sm text-charcoal/50">{productLabel}</p>
        <p className="mt-1 text-lg font-bold text-brand-700">{payment.tutor_name} 튜터</p>
        <p className="mt-1 text-sm text-charcoal/55">{payment.student_label}</p>
        <div className="mt-4 flex items-center justify-between border-t border-softgray pt-4">
          <span className="text-sm font-semibold text-charcoal/60">결제 금액</span>
          <span className="text-xl font-extrabold text-brand-700">{payment.amount.toLocaleString()}원</span>
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
        현재 데모 환경에는 실제 결제 Provider(Toss/PortOne/Stripe 등) 키가 연결되어 있지 않습니다. 아래
        버튼은 결제가 완료된 이후 화면을 확인하기 위한 모의(Mock) 결제입니다 — 실제 결제는
        발생하지 않습니다.
      </div>

      <form action={confirmMockPayment}>
        <input type="hidden" name="paymentId" value={payment.id} />
        <button className="w-full rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-700">
          모의 결제 확인 (실제 결제 아님)
        </button>
      </form>
      <form action={cancelMockPayment}>
        <input type="hidden" name="paymentId" value={payment.id} />
        <input type="hidden" name="requestId" value={payment.match_request_id} />
        <button className="w-full rounded-xl border border-softgray px-6 py-3 text-sm font-semibold text-charcoal/50 hover:bg-softgray">
          취소
        </button>
      </form>
    </div>
  );
}
