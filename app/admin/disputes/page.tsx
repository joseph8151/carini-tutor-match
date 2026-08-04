import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { listOpenDisputes } from "@/lib/store";
import { decideDispute } from "@/lib/actions";

export const metadata = { title: "분쟁 중재" };

export default async function AdminDisputes() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/disputes");
  if (user.role !== "admin") redirect("/");

  const disputes = listOpenDisputes();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">결제 분쟁 중재</h1>
        <p className="mt-1 text-sm text-gray-500">
          보호 중인 결제에 대한 분쟁을 검토하고 환불 또는 정산을 결정합니다.
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          검토 대기 중인 분쟁이 없습니다.
        </div>
      ) : (
        <ul className="space-y-3">
          {disputes.map((d) => (
            <li key={d.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {d.payment ? `${d.payment.amount.toLocaleString()}원` : "결제"} 분쟁
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(d.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{d.reason}</p>
              <div className="mt-4 flex gap-2">
                <form action={decideDispute}>
                  <input type="hidden" name="disputeId" value={d.id} />
                  <input type="hidden" name="decision" value="refund" />
                  <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                    환불 처리
                  </button>
                </form>
                <form action={decideDispute}>
                  <input type="hidden" name="disputeId" value={d.id} />
                  <input type="hidden" name="decision" value="release" />
                  <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    정산 처리 (튜터 지급)
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
