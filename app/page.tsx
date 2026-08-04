import Link from "next/link";
import { getAcademies, getTutors, getSchedules } from "@/lib/data";
import { TutorCard } from "@/components/TutorCard";

export default async function HomePage() {
  const [academies, topTutors, schedules] = await Promise.all([
    getAcademies(),
    getTutors(),
    getSchedules(),
  ]);

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-14 text-white">
        <h1 className="text-3xl font-extrabold leading-snug sm:text-4xl">
          목표 학원 레테,
          <br />
          합격시킨 튜터를 매칭합니다.
        </h1>
        <p className="mt-4 max-w-xl text-brand-100">
          MI·트윈클·에디센·피아이 등 상위권 영어학원 레벨테스트(레테)·프랩 전문. 실제 합격
          실적을 인증한 튜터만 노출합니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/tutors"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-brand-700 hover:bg-brand-50"
          >
            튜터 찾기
          </Link>
          <Link
            href="/academy/mi"
            className="rounded-xl border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10"
          >
            학원별 레테 정보
          </Link>
        </div>
      </section>

      {/* 학원 허브 진입 */}
      <section>
        <h2 className="mb-4 text-xl font-bold">학원별 레테 허브</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {academies.map((a) => (
            <Link
              key={a.id}
              href={`/academy/${a.slug}`}
              className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
            >
              <p className="text-xs text-gray-400">{a.region}</p>
              <h3 className="mt-1 text-lg font-bold">{a.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-gray-500">{a.description}</p>
              <p className="mt-3 text-sm font-semibold text-brand-600">레테 정보 보기 →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 다가오는 레테 일정 */}
      <section>
        <h2 className="mb-4 text-xl font-bold">다가오는 레테 일정</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">학원</th>
                <th className="px-4 py-3 font-medium">시험일</th>
                <th className="px-4 py-3 font-medium">접수 마감</th>
                <th className="px-4 py-3 font-medium">비고</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => {
                const ac = academies.find((a) => a.id === s.academy_id);
                return (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{ac?.name ?? s.academy_id}</td>
                    <td className="px-4 py-3">{s.test_date}</td>
                    <td className="px-4 py-3 text-gray-500">{s.apply_deadline}</td>
                    <td className="px-4 py-3 text-gray-500">{s.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 추천 튜터 */}
      <section>
        <h2 className="mb-4 text-xl font-bold">인증 추천 튜터</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topTutors.slice(0, 3).map((t) => (
            <TutorCard key={t.id} tutor={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
