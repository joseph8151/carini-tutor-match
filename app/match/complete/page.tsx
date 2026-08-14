import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getMatchRequestById } from "@/lib/store";

export const metadata = { title: "매칭 신청 완료 — 카리니 튜터링" };

const JOURNEY = [
  { n: 1, label: "신청 완료", done: true },
  { n: 2, label: "카리니 검토", done: false },
  { n: 3, label: "튜터 일정 확인", done: false },
  { n: 4, label: "매칭 제안", done: false },
  { n: 5, label: "샘플수업 결제", done: false },
];

export default async function MatchCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const request = id ? await getMatchRequestById(id) : null;

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
