import Link from "next/link";
import { getAcademies, getTutors, allRegions, allSubjects } from "@/lib/data";
import { TutorCard } from "@/components/TutorCard";

export const metadata = {
  title: "튜터 찾기 — 레테 전문 인증 튜터",
};

type SP = Promise<{ academy?: string; region?: string; subject?: string; verified?: string }>;

export default async function TutorsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [academies, tutors] = await Promise.all([
    getAcademies(),
    getTutors({
      academySlug: sp.academy || undefined,
      region: sp.region || undefined,
      subject: sp.subject || undefined,
      verifiedOnly: sp.verified === "1",
    }),
  ]);

  const regions = allRegions();
  const subjects = allSubjects();

  const select =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">튜터 찾기</h1>
        <p className="mt-1 text-sm text-gray-500">
          구독 등급·인증 실적·평점·응답률을 종합한 순서로 노출됩니다.
        </p>
      </div>

      {/* 필터 (GET) */}
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          학원
          <select name="academy" defaultValue={sp.academy ?? ""} className={select}>
            <option value="">전체</option>
            {academies.map((a) => (
              <option key={a.id} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          지역
          <select name="region" defaultValue={sp.region ?? ""} className={select}>
            <option value="">전체</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          과목
          <select name="subject" defaultValue={sp.subject ?? ""} className={select}>
            <option value="">전체</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 py-2 text-sm text-gray-600">
          <input type="checkbox" name="verified" value="1" defaultChecked={sp.verified === "1"} />
          인증 튜터만
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          검색
        </button>
        <Link href="/tutors" className="px-2 py-2 text-sm text-gray-400 hover:text-gray-600">
          초기화
        </Link>
      </form>

      <p className="text-sm text-gray-500">총 {tutors.length}명</p>

      {tutors.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          조건에 맞는 튜터가 없습니다.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => (
            <TutorCard key={t.id} tutor={t} />
          ))}
        </div>
      )}
    </div>
  );
}
