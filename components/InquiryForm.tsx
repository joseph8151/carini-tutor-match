import Link from "next/link";
import { startInquiry } from "@/lib/actions";
import { getSessionUser } from "@/lib/session";

export async function InquiryForm({
  tutorId,
  tutorName,
  academySlug,
  baseRate,
  error,
}: {
  tutorId: string;
  tutorName: string;
  academySlug?: string;
  baseRate: number;
  error?: string;
}) {
  const user = await getSessionUser();
  const canInquire = user?.role === "parent";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-bold text-brand-600">
          {baseRate.toLocaleString()}원<span className="text-sm text-gray-400">/회</span>
        </p>
        <p className="text-xs text-gray-400">연락처 노출 없이 플랫폼 내 상담</p>
      </div>

      {error === "parent_only" && (
        <p className="mb-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
          문의는 학부모 계정만 가능합니다.
        </p>
      )}

      {canInquire ? (
        <form action={startInquiry} className="space-y-2">
          <input type="hidden" name="tutorId" value={tutorId} />
          {academySlug && <input type="hidden" name="academySlug" value={academySlug} />}
          <textarea
            name="body"
            rows={3}
            required
            placeholder={`${tutorName} 튜터에게 문의 내용을 남겨주세요. (아이 학년·목표 학원·레테 일정 등)`}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button className="w-full rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
            문의 보내기
          </button>
        </form>
      ) : (
        <Link
          href={`/login?next=/tutors/${tutorId}`}
          className="block rounded-xl bg-brand-600 px-6 py-3 text-center font-semibold text-white hover:bg-brand-700"
        >
          {user ? "학부모 계정으로 문의 가능" : "로그인하고 문의하기"}
        </Link>
      )}
    </div>
  );
}
