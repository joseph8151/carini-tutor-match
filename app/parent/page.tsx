import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getAcademies, getSchedules } from "@/lib/data";
import {
  listInquiriesFor,
  listReportsForParent,
  tutorsInquiredBy,
  hasReviewed,
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
  const inquiries = listInquiriesFor(user.id);
  const reports = listReportsForParent(user.id);
  const tutors = tutorsInquiredBy(user.id);

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
      <h1 className="text-2xl font-bold">{user.name}님의 학습 대시보드</h1>

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
                  {hasReviewed(user.id, t.id) ? "후기 완료 ✓" : "후기 작성 →"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
