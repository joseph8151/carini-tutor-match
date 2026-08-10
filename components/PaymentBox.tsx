import { payFirstLesson, confirmLesson, raiseDispute } from "@/lib/actions";
import type { Payment } from "@/lib/types";

const STATUS: Record<Payment["status"], { label: string; cls: string }> = {
  held: { label: "결제 보호 중 (에스크로)", cls: "bg-amber-50 text-amber-800" },
  released: { label: "정산 완료 (튜터 지급)", cls: "bg-emerald-50 text-emerald-700" },
  disputed: { label: "분쟁 검토 중", cls: "bg-red-50 text-red-600" },
  refunded: { label: "환불 완료", cls: "bg-gray-100 text-gray-600" },
};

export function PaymentBox({
  inquiryId,
  payment,
  isParent,
  suggestedAmount,
}: {
  inquiryId: string;
  payment: Payment | null;
  isParent: boolean;
  suggestedAmount: number;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="font-bold">첫 수업 안전결제</h2>
      <p className="mt-1 text-xs text-gray-400">
        결제 금액은 플랫폼이 보관하고, 수업 확인 후 튜터에게 정산됩니다. 문제가 있으면 분쟁을
        신청해 중재받을 수 있습니다.
      </p>

      {!payment && isParent && (
        <form action={payFirstLesson} className="mt-4 flex items-end gap-2">
          <input type="hidden" name="inquiryId" value={inquiryId} />
          <label className="flex flex-col gap-1 text-xs text-gray-500">
            금액(원)
            <input
              type="number"
              name="amount"
              defaultValue={suggestedAmount}
              min={0}
              step={1000}
              className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            안전결제로 시작
          </button>
        </form>
      )}

      {!payment && !isParent && (
        <p className="mt-3 text-sm text-gray-400">학부모가 첫 수업 안전결제를 시작할 수 있습니다.</p>
      )}

      {payment && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{payment.amount.toLocaleString()}원</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[payment.status].cls}`}
            >
              {STATUS[payment.status].label}
            </span>
          </div>

          {payment.status === "held" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {isParent && (
                <form action={confirmLesson}>
                  <input type="hidden" name="inquiryId" value={inquiryId} />
                  <input type="hidden" name="paymentId" value={payment.id} />
                  <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    수업 확인 · 정산
                  </button>
                </form>
              )}
              <form action={raiseDispute} className="flex items-center gap-2">
                <input type="hidden" name="inquiryId" value={inquiryId} />
                <input type="hidden" name="paymentId" value={payment.id} />
                <input
                  name="reason"
                  placeholder="분쟁 사유"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  분쟁 신청
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
