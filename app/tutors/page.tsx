import Link from "next/link";
import { getAcademies, getTutors, allRegions, allSubjects } from "@/lib/data";
import { TutorCard } from "@/components/TutorCard";
import { AGE_BAND_LABELS } from "@/lib/types";

export const metadata = {
  title: "튜터 찾기 — 유아·초등 영어 튜터",
};

type SP = Promise<{
  academy?: string;
  region?: string;
  subject?: string;
  verified?: string;
  age?: string;
  type?: string;
}>;

const AGE_BAND_OPTIONS = Object.entries(AGE_BAND_LABELS) as [keyof typeof AGE_BAND_LABELS, string][];
const TUTOR_TYPE_OPTIONS = [
  { value: "native", label: "Native" },
  { value: "bilingual", label: "Bilingual" },
] as const;

export default async function TutorsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [academies, tutors] = await Promise.all([
    getAcademies(),
    getTutors({
      academySlug: sp.academy || undefined,
      region: sp.region || undefined,
      subject: sp.subject || undefined,
      verifiedOnly: sp.verified === "1",
      ageBand: (sp.age as (typeof AGE_BAND_OPTIONS)[number][0]) || undefined,
      tutorType: (sp.type as "native" | "bilingual") || undefined,
    }),
  ]);

  const regions = allRegions();
  const subjects = allSubjects();

  const select =
    "rounded-xl border border-softgray bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-brand-600">Find a Tutor</p>
        <h1 className="mt-1 font-sans text-2xl font-extrabold text-brand-700">튜터 찾기</h1>
        <p className="mt-1 text-sm text-charcoal/50">
          프로필을 직접 둘러보셔도 좋고, 마음에 드는 선생님을 찾으면 매칭을 신청해 주세요.
        </p>
      </div>

      {/* 필터 (GET) */}
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-softgray bg-warmwhite p-4">
        <label className="flex flex-col gap-1 text-xs text-charcoal/50">
          연령
          <select name="age" defaultValue={sp.age ?? ""} className={select}>
            <option value="">전체</option>
            {AGE_BAND_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-charcoal/50">
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
        <label className="flex flex-col gap-1 text-xs text-charcoal/50">
          튜터 유형
          <select name="type" defaultValue={sp.type ?? ""} className={select}>
            <option value="">전체</option>
            {TUTOR_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-charcoal/50">
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
        <label className="flex flex-col gap-1 text-xs text-charcoal/50">
          학원 (Prep)
          <select name="academy" defaultValue={sp.academy ?? ""} className={select}>
            <option value="">전체</option>
            {academies.map((a) => (
              <option key={a.id} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 py-2 text-sm text-charcoal/60">
          <input type="checkbox" name="verified" value="1" defaultChecked={sp.verified === "1"} />
          카리니 인증 튜터만
        </label>
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          검색
        </button>
        <Link href="/tutors" className="px-2 py-2 text-sm text-charcoal/35 hover:text-charcoal/60">
          초기화
        </Link>
      </form>

      <p className="text-sm text-charcoal/50">총 {tutors.length}명</p>

      {tutors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-softgray p-10 text-center text-charcoal/40">
          <p>조건에 맞는 튜터가 없습니다.</p>
          <Link href="/match" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
            대신 카리니에게 추천받기 →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => (
            <TutorCard key={t.id} tutor={t} />
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-butter-50 px-6 py-5 text-center">
        <p className="text-sm font-semibold text-brand-700">어떤 선생님이 맞을지 모르겠다면?</p>
        <p className="mt-1 text-xs text-charcoal/55">카리니가 추천해드릴게요.</p>
        <Link
          href="/match"
          className="mt-3 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          튜터 추천받기
        </Link>
      </div>
    </div>
  );
}
