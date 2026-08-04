import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { listPendingVerifications } from "@/lib/store";
import { decideVerification } from "@/lib/actions";

export const metadata = { title: "인증 검수" };

export default async function AdminVerifications() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/verifications");
  if (user.role !== "admin") redirect("/");

  const pending = await listPendingVerifications();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">실적 인증 검수</h1>
        <p className="mt-1 text-sm text-gray-500">
          승인 시 튜터에게 인증 뱃지가 발급되고 검색 노출에 반영됩니다.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          검수 대기 중인 인증 신청이 없습니다.
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map((v) => (
            <li key={v.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="font-bold">{v.tutor_name} 튜터</span>
                <span className="text-xs text-gray-400">
                  {new Date(v.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                <b>{v.academy_name}</b> · {v.type === "pass" ? "레테 합격 실적" : "강의 경력"}
              </p>
              <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{v.evidence}</p>
              <div className="mt-4 flex gap-2">
                <form action={decideVerification}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    승인
                  </button>
                </form>
                <form action={decideVerification}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    반려
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
