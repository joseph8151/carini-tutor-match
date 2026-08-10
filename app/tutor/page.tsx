import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getTutorById, getAcademies } from "@/lib/data";
import { listVerificationsForTutor, listInquiriesFor, FREE_INQUIRY_LIMIT } from "@/lib/store";
import { requestVerification } from "@/lib/actions";
import { VerifiedBadge, TierBadge, AcademyBadge } from "@/components/Badges";

export const metadata = { title: "튜터 홈" };

const tierName = { free: "무료", pro: "프로", premium: "프리미엄" } as const;

export default async function TutorHome({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/tutor");
  if (user.role !== "tutor") redirect("/");

  const [tutor, academies, verifications, inquiries] = await Promise.all([
    getTutorById(user.id),
    getAcademies(),
    listVerificationsForTutor(user.id),
    listInquiriesFor(user.id),
  ]);
  const inquiryCount = inquiries.length;
  const tier = tutor?.subscription_tier ?? "free";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user.name} 튜터</h1>
        <div className="flex items-center gap-2">
          {tutor?.is_verified && <VerifiedBadge />}
          <TierBadge tier={tier} />
        </div>
      </div>

      {ok === "verify" && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          인증 신청이 접수되었습니다. 관리자 검수 후 뱃지가 발급됩니다.
        </p>
      )}
      {err === "verify" && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          학원과 증빙 내용을 확인해 주세요.
        </p>
      )}

      {/* 구독 상태 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">구독 · 노출</h2>
            <p className="mt-1 text-sm text-gray-500">
              현재 <b>{tierName[tier]}</b> 등급 · 받은 문의 {inquiryCount}건
              {tier === "free" && (
                <> · 무료는 최근 {FREE_INQUIRY_LIMIT}건만 열람 가능</>
              )}
            </p>
          </div>
          <Link
            href="/tutor/subscription"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {tier === "premium" ? "구독 관리" : "업그레이드"}
          </Link>
        </div>
        <div className="mt-3 flex gap-3 text-sm">
          <Link href="/inbox" className="text-brand-600 hover:underline">
            문의함 열기 →
          </Link>
        </div>
      </section>

      {/* 실적 인증 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold">실적 인증</h2>
        <p className="mt-1 text-sm text-gray-500">
          학원별 레테 합격/경력 증빙을 제출하면 관리자 검수 후 <b>인증 뱃지</b>가 발급되어 노출에
          반영됩니다.
        </p>

        {tutor && tutor.badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tutor.badges.map((b) => (
              <AcademyBadge key={b.academy_id} label={b.label} />
            ))}
          </div>
        )}

        <form action={requestVerification} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-gray-500">
            학원
            <select
              name="academySlug"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {academies.map((a) => (
                <option key={a.id} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-500">
            유형
            <select
              name="type"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              <option value="pass">레테 합격 실적</option>
              <option value="career">강의 경력</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-500 sm:col-span-2">
            증빙 내용 (합격 통보 캡처 링크·학생 사례 등)
            <textarea
              name="evidence"
              rows={2}
              required
              placeholder="예) 2026년 3월 MI 정규반 합격 학생 2명 — 합격 문자 캡처 링크"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <div className="sm:col-span-2">
            <button className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
              인증 신청
            </button>
          </div>
        </form>

        {verifications.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">신청 내역</h3>
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {verifications.map((v) => (
                <li key={v.id} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span>
                    {v.academy_name} · {v.type === "pass" ? "레테 합격" : "경력"}
                  </span>
                  <StatusChip status={v.status} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-600",
  };
  const label: Record<string, string> = {
    pending: "검수 대기",
    approved: "승인됨",
    rejected: "반려됨",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${map[status]}`}>
      {label[status]}
    </span>
  );
}
