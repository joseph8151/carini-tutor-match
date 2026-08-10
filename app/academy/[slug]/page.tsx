import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAcademies, getAcademyBySlug, getLevelTests, getSchedules, getTutors } from "@/lib/data";
import { TutorCard } from "@/components/TutorCard";

export async function generateStaticParams() {
  const academies = await getAcademies();
  return academies.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);
  if (!academy) return { title: "학원을 찾을 수 없습니다" };
  return {
    title: `${academy.name} 레벨테스트(레테) 정보 · 전문 튜터`,
    description: `${academy.region} ${academy.name} 레테 유형과 일정, 합격 인증 전문 튜터를 확인하세요.`,
  };
}

const difficultyLabel = (d: number) => "난이도 " + "★".repeat(d) + "☆".repeat(5 - d);

export default async function AcademyHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);
  if (!academy) notFound();

  const [levelTests, schedules, tutors] = await Promise.all([
    getLevelTests(academy.id),
    getSchedules(academy.id),
    getTutors({ academySlug: slug }),
  ]);

  return (
    <div className="space-y-10">
      <nav className="text-sm text-gray-400">
        <Link href="/" className="hover:text-brand-600">
          홈
        </Link>{" "}
        / <span className="text-gray-600">{academy.name}</span>
      </nav>

      <header className="rounded-3xl border border-gray-200 bg-white p-8">
        <p className="text-sm text-gray-400">{academy.region}</p>
        <h1 className="mt-1 text-3xl font-extrabold">{academy.name} 레테 허브</h1>
        <p className="mt-3 max-w-2xl text-gray-600">{academy.description}</p>
      </header>

      {/* 레테 유형 */}
      <section>
        <h2 className="mb-4 text-xl font-bold">레벨테스트 유형</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {levelTests.map((t) => (
            <div key={t.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{t.name}</h3>
                <span className="text-xs font-medium text-amber-600">
                  {difficultyLabel(t.difficulty)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{t.format_summary}</p>
              <p className="mt-3 text-xs text-gray-400">최근 업데이트 {t.updated_at}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 일정 */}
      <section>
        <h2 className="mb-4 text-xl font-bold">레테 일정</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">시험일</th>
                <th className="px-4 py-3 font-medium">접수 마감</th>
                <th className="px-4 py-3 font-medium">비고</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{s.test_date}</td>
                  <td className="px-4 py-3 text-gray-500">{s.apply_deadline}</td>
                  <td className="px-4 py-3 text-gray-500">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 전문 튜터 */}
      <section>
        <h2 className="mb-1 text-xl font-bold">{academy.name} 전문 인증 튜터</h2>
        <p className="mb-4 text-sm text-gray-500">
          이 학원 레테 합격 실적을 인증한 튜터 우선 노출.
        </p>
        {tutors.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
            아직 등록된 전문 튜터가 없습니다.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tutors.map((t) => (
              <TutorCard key={t.id} tutor={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
