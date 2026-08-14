import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getAcademies, getSchedules } from "@/lib/data";
import {
  listInquiriesFor,
  listReportsForParent,
  tutorsInquiredBy,
  hasReviewed,
  isParentPremium,
  getPasses,
  listMockBookings,
  listPaymentsForParent,
  getLatestDiagnosis,
} from "@/lib/store";

export const metadata = { title: "내 학습" };

function dday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default async function ParentDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/parent");
  if (user.role !== "parent") redirect("/");

  const [academies, schedules] = await Promise.all([getAcademies(), getSchedules()]);
  const [inquiries, reports, tutors, premium, passes, mockBookings, payments] = await Promise.all([
    listInquiriesFor(user.id),
    listReportsForParent(user.id),
    tutorsInquiredBy(user.id),
    isParentPremium(user.id),
    getPasses(user.id),
    listMockBookings(user.id),
    listPaymentsForParent(user.id),
  ]);
  const diagnosis = await getLatestDiagnosis(user.id);
  const heldPayments = payments.filter((p) => p.status === "held" || p.status === "disputed");
  const reviewedFlags = await Promise.all(tutors.map((t) => hasReviewed(user.id, t.id)));
  const reviewed = new Set(tutors.filter((_, i) => reviewedFlags[i]).map((t) => t.id));

  // 문의한 학원 기준 다가오는 레테 일정
  const mySlugs = new Set(inquiries.map((i) => i.academy_slug).filter(Boolean) as string[]);
  const slugById = new Map(academies.map((a) => [a.id, a.slug]));
  const upcoming = schedules
    .map((s) => ({ ...s, slug: slugById.get(s.academy_id) }))
    .filter((s) => s.slug && mySlugs.has(s.slug) && dday(s.test_date) >= 0)
    .sort((a, b) => a.test_date.localeCompare(b.test_date));

  const academyName = (slug?: string) => academies.find((a) => a.slug === slug)?.name ?? slug;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user.name}님의 학습 대시보드</h1>
        <Link
          href="/mock-tests"
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          모의 레테 →
        </Link>
      </div>

      {/* 매칭 대시보드 진입 */}
      <section className="flex items-center justify-between rounded-2xl border border-softgray bg-butter-50 p-5">
        <div>
          <p className="font-bold text-brand-700">우리 아이 튜터 매칭 현황</p>
          <p className="mt-1 text-sm text-charcoal/55">매칭 신청, 선생님, 수업 일정, 결제 내역을 한 곳에서 확인하세요.</p>
        </div>
        <Link href="/dashboard" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          매칭 대시보드 →
        </Link>
      </section>

      {/* 프리미엄 / 우선 매칭권 */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-5">
        <div>
          <p className="font-bold">
            {premium ? "프리미엄 이용 중" : "학부모 프리미엄"}
            {premium && (
              <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                우선 매칭권 {passes.remaining}장
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            우선 매칭 · 상세 합격 후기 · 레테 알림 · 모의 레테 우선 신청
          </p>
        </div>
        <Link
          href="/parent/premium"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {premium ? "관리" : "업그레이드"}
        </Link>
      </section>

      {/* 레벨 진단 */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-5">
        <div>
          <p className="font-bold">레벨 진단</p>
          {diagnosis ? (
            <p className="mt-1 text-sm text-gray-500">
              최근 결과 · 또래 백분위 <b className="text-brand-600">{diagnosis.percentile}</b> · 추천
              레벨 <b>{diagnosis.level}</b> · {diagnosis.pass_ready ? "상위권 레테 도전 가능" : "향상 집중 단계"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              아직 진단 기록이 없어요. 5분 진단으로 현재 레벨과 약점을 확인해 보세요.
            </p>
          )}
        </div>
        <Link
          href={diagnosis ? "/diagnosis/result" : "/diagnosis"}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {diagnosis ? "결과 보기" : "진단 받기"}
        </Link>
      </section>

      {/* 안전결제 진행 상황 */}
      {heldPayments.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">안전결제 진행 중</h2>
          <ul className="space-y-2">
            {heldPayments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
              >
                <span className="font-semibold">{p.amount.toLocaleString()}원</span>
                <Link href={`/inbox/${p.inquiry_id}`} className="text-brand-600 hover:underline">
                  {p.status === "disputed" ? "분쟁 검토 중" : "결제 보호 중"} · 대화 열기 →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 레테 D-day */}
      <section>
        <h2 className="mb-3 font-bold">레테 D-day</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            문의한 학원의 다가오는 레테 일정이 없습니다.{" "}
            <Link href="/tutors" className="text-brand-600 hover:underline">
              튜터 찾기 →
            </Link>
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((s) => {
              const d = dday(s.test_date);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div>
                    <p className="font-semibold">{academyName(s.slug)}</p>
                    <p className="text-xs text-gray-400">
                      {s.test_date} · 접수 {s.apply_deadline}
                    </p>
                  </div>
                  <span className="rounded-xl bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-700">
                    {d === 0 ? "D-DAY" : `D-${d}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 수업 리포트 타임라인 */}
      <section>
        <h2 className="mb-3 font-bold">수업 리포트</h2>
        {reports.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            아직 받은 수업 리포트가 없습니다. 튜터가 수업 후 작성하면 여기에 쌓입니다.
          </p>
        ) : (
          <ol className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    {r.date} · {r.tutor_name} 튜터
                    {r.academy_slug && (
                      <span className="ml-2 text-xs text-gray-400">
                        {academyName(r.academy_slug)}
                      </span>
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{r.content}</p>
                {r.progress_note && (
                  <p className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-600">
                    📈 {r.progress_note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* 모의 레테 신청 내역 */}
      {mockBookings.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">신청한 모의 레테</h2>
          <ul className="space-y-2">
            {mockBookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
              >
                <span className="font-semibold">
                  {b.mock_name}
                  <span className="ml-2 text-xs text-gray-400">{academyName(b.academy_slug)}</span>
                </span>
                <span className="text-gray-500">{b.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 후기 작성 */}
      {tutors.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">합격 후기 남기기</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tutors.map((t) => (
              <Link
                key={t.id}
                href={`/tutors/${t.id}#review`}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-500"
              >
                <span className="font-semibold">{t.name} 튜터</span>
                <span className="text-sm text-brand-600">
                  {reviewed.has(t.id) ? "후기 완료 ✓" : "후기 작성 →"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
