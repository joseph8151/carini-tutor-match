import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getMatchRequestById } from "@/lib/store";
import { MATCH_STATUS_ORDER, PAYMENT_READY_STATUSES } from "@/lib/match";

export const metadata = { title: "매칭 신청 완료 — 카리니 튜터링" };

const JOURNEY_STEPS = [
  { n: 1, label: "신청 완료", target: "new" },
  { n: 2, label: "카리니 검토", target: "reviewing" },
  { n: 3, label: "튜터 일정 확인", target: "tutor_confirmed" },
  { n: 4, label: "매칭 제안", target: "proposal_sent" },
  { n: 5, label: "샘플수업 결제", target: "payment_pending" },
] as const;

export default async function MatchCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const request = id ? await getMatchRequestById(id) : null;
  const currentIdx = request ? MATCH_STATUS_ORDER.indexOf(request.status) : -1;
  const JOURNEY = JOURNEY_STEPS.map((s) => ({ ...s, done: currentIdx >= MATCH_STATUS_ORDER.indexOf(s.target) }));
  const readyForPayment = request ? PAYMENT_READY_STATUSES.has(request.status) : false;

  return (
    <div className="mx-auto max-w-2xl space-y-10 py-6 text-center">
      <div>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-butter-100 text-brand-600">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="mt-5 font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
          매칭 신청이 완료되었습니다.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal/65">
          입력해주신 정보를 바탕으로 아이에게 적합한 튜터와 수업 가능 시간을
          확인해드립니다.
        </p>
        {request && (
          <p className="mt-2 text-xs text-charcoal/40">
            신청번호 {request.id} · {request.parent_name}님
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-softgray bg-warmwhite p-6 sm:p-8">
        <div className="grid grid-cols-3 gap-y-6 sm:grid-cols-5">
          {JOURNEY.map((j) => (
            <div key={j.n} className="flex flex-col items-center gap-2 text-center">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  j.done ? "bg-brand-600 text-white" : "bg-softgray text-charcoal/40"
                }`}
              >
                {j.n}
              </span>
              <span className={`text-[11.5px] leading-tight ${j.done ? "font-semibold text-brand-700" : "text-charcoal/45"}`}>
                {j.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {readyForPayment && request && (
        <div className="rounded-2xl bg-butter-50 px-6 py-5">
          <p className="text-sm font-semibold text-brand-700">튜터 일정이 확정되었습니다!</p>
          <Link
            href={`/checkout/sample?requestId=${request.id}`}
            className="mt-3 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            샘플수업 예약 및 결제
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/tutors"
          className="rounded-xl border border-brand-600/15 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          튜터 더 둘러보기
        </Link>
        <Link
          href="/"
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
