import Link from "next/link";
import { getMatchRequestById, listRecommendations } from "@/lib/store";
import { PAYMENT_READY_STATUSES } from "@/lib/match";
import { SAMPLE_LESSON_DURATION_MIN, SAMPLE_LESSON_PRICE } from "@/lib/lessonPackages";
import { startSampleCheckout } from "@/lib/actions";

export const metadata = { title: "샘플수업 예약 — 카리니 튜터링" };

export default async function SampleCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const { requestId } = await searchParams;
  const request = requestId ? await getMatchRequestById(requestId) : null;

  if (!request) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
        <p className="text-charcoal/60">신청 정보를 찾을 수 없습니다.</p>
        <Link href="/match" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          매칭 신청하러 가기 →
        </Link>
      </div>
    );
  }

  if (!PAYMENT_READY_STATUSES.has(request.status)) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
        <p className="font-bold text-brand-700">아직 튜터 일정이 확정되지 않았습니다.</p>
        <p className="text-sm text-charcoal/55">
          카리니 매칭팀이 선생님 일정을 확인한 뒤 결제가 가능해집니다. 조금만 기다려 주세요.
        </p>
        <Link href={`/match/complete?id=${request.id}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          신청 현황 보기 →
        </Link>
      </div>
    );
  }

  const confirmed = (await listRecommendations(request.id)).find((r) => r.status === "confirmed");
  const tutorName = confirmed?.tutor_name ?? request.requested_tutor_name;

  if (!tutorName) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
        <p className="font-bold text-brand-700">확정된 선생님이 아직 없습니다.</p>
        <p className="text-sm text-charcoal/55">카리니 매칭팀에게 문의해 주세요.</p>
        <Link href="/inbox" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          1:1 문의하기 →
        </Link>
      </div>
    );
  }

  const rows: [string, string][] = [
    ["튜터", `${tutorName} 튜터`],
    ["학생", `${request.parent_name}님 자녀 · ${request.child_age}`],
    ["일정", confirmed?.available_schedule ?? "카리니 매칭팀과 협의된 일정"],
    ["장소", `${request.location} · ${request.lesson_type === "visit" ? "방문" : request.lesson_type === "online" ? "온라인" : "방문/온라인"}`],
    ["수업 시간", `${SAMPLE_LESSON_DURATION_MIN}분`],
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6 py-4">
      <div className="text-center">
        <p className="text-xs font-semibold text-brand-600">Sample Lesson</p>
        <h1 className="mt-2 font-sans text-2xl font-extrabold text-brand-700">샘플수업 예약</h1>
      </div>

      <div className="rounded-2xl border border-softgray bg-warmwhite p-6">
        <dl className="space-y-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-softgray/80 pb-3 last:border-0 last:pb-0">
              <dt className="text-charcoal/45">{k}</dt>
              <dd className="font-medium text-charcoal/80">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-softgray pt-4">
          <span className="text-sm font-semibold text-charcoal/60">결제 금액</span>
          <span className="text-xl font-extrabold text-brand-700">{SAMPLE_LESSON_PRICE.toLocaleString()}원</span>
        </div>
      </div>

      <form action={startSampleCheckout}>
        <input type="hidden" name="requestId" value={request.id} />
        <button className="w-full rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-700">
          샘플수업 예약 및 결제 진행
        </button>
      </form>
    </div>
  );
}
