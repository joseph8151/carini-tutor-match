import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GraduationCap, Home, MapPin, MonitorSmartphone, Star } from "lucide-react";
import { getTutorById, getAcademies } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { listReviewsForTutor, isParentPremium } from "@/lib/store";
import { CariniBadge, AvailabilityTag, AcademyBadge } from "@/components/Badges";
import { InquiryForm } from "@/components/InquiryForm";
import { ReviewSection } from "@/components/ReviewSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tutor = await getTutorById(id);
  if (!tutor) return { title: "튜터를 찾을 수 없습니다" };
  return { title: `${tutor.name} 튜터 — ${tutor.regions.join(", ")}` };
}

const FAQ = [
  { q: "수업은 어떻게 시작되나요?", a: "매칭 문의를 남겨주시면 카리니 매칭팀이 아이 정보와 선생님 일정을 확인한 뒤 샘플수업 일정을 제안해드립니다." },
  { q: "가격은 어떻게 확인하나요?", a: "수업료는 매칭 제안 시 함께 안내됩니다. 지역·수업 방식·횟수에 따라 달라질 수 있어요." },
  { q: "일정을 바꾸고 싶으면 어떻게 하나요?", a: "수업 시작 후에는 대시보드에서 일정 변경을 요청하실 수 있고, 카리니가 선생님과 조율해드립니다." },
];

export default async function TutorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { err, ok } = await searchParams;
  const [tutor, academies, user] = await Promise.all([
    getTutorById(id),
    getAcademies(),
    getSessionUser(),
  ]);
  if (!tutor) notFound();
  const reviews = await listReviewsForTutor(tutor.id);
  const canSeeDetail =
    user?.role === "admin" ||
    user?.role === "tutor" ||
    (user?.role === "parent" && (await isParentPremium(user.id)));

  const matchHref = `/match?tutorId=${tutor.id}&tutorName=${encodeURIComponent(tutor.name)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-28">
      <nav className="text-sm text-charcoal/40">
        <Link href="/tutors" className="hover:text-brand-600">
          튜터 찾기
        </Link>{" "}
        / <span className="text-charcoal/60">{tutor.name} 튜터</span>
      </nav>

      {/* 헤더 */}
      <header className="rounded-3xl border border-softgray bg-warmwhite p-8">
        <div className="flex flex-wrap items-start gap-5">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-butter-100 font-sans text-2xl font-bold text-brand-700">
            {tutor.name[0]}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-brand-700">{tutor.name} 튜터</h1>
              {tutor.is_verified && <CariniBadge />}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-charcoal/55">
              {tutor.country && <span>{tutor.country}</span>}
              {tutor.years_experience && <span>경력 {tutor.years_experience}년</span>}
              {tutor.major && <span>{tutor.major}</span>}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-semibold text-brand-700">
                <Star size={14} className="fill-butter-500 text-butter-500" /> {tutor.rating_avg.toFixed(1)}
              </span>
              <AvailabilityTag status={tutor.availability} />
            </div>
          </div>
        </div>

        {tutor.age_focus && (
          <p className="mt-5 text-sm font-semibold text-brand-600/80">Best For: {tutor.age_focus}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tutor.subjects.map((s) => (
            <span key={s} className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-brand-700">
              {s}
            </span>
          ))}
        </div>
      </header>

      {/* About */}
      <section className="rounded-2xl border border-softgray bg-warmwhite p-6">
        <h2 className="mb-3 font-bold text-brand-700">About Tutor</h2>
        <p className="text-[15px] leading-relaxed text-charcoal/70">{tutor.bio}</p>
      </section>

      {/* Recommended For */}
      <section className="rounded-2xl border border-softgray bg-warmwhite p-6">
        <h2 className="mb-3 font-bold text-brand-700">Recommended For</h2>
        <ul className="space-y-1.5 text-[14px] text-charcoal/65">
          {tutor.age_focus && <li>· {tutor.age_focus} 아이</li>}
          <li>· {tutor.subjects.slice(0, 3).join(", ")} 중심 수업을 원하는 경우</li>
          {tutor.academy_slugs.length > 0 && (
            <li>
              ·{" "}
              {tutor.academy_slugs
                .map((slug) => academies.find((a) => a.slug === slug)?.name)
                .filter(Boolean)
                .join(", ")}{" "}
              레벨테스트를 준비 중인 경우
            </li>
          )}
        </ul>
      </section>

      {/* Experience / 전문 학원 인증 뱃지 (레테 프랩 튜터) */}
      {(tutor.university || tutor.badges.length > 0) && (
        <section className="rounded-2xl border border-softgray bg-warmwhite p-6">
          <h2 className="mb-3 font-bold text-brand-700">Experience</h2>
          {tutor.university && (
            <p className="flex items-center gap-2 text-sm text-charcoal/65">
              <GraduationCap size={16} className="text-brand-600/60" />
              {tutor.university} · {tutor.major}
            </p>
          )}
          {tutor.badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tutor.badges.map((b) => (
                <AcademyBadge key={b.academy_id} label={b.label} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Service Area */}
      <section className="rounded-2xl border border-softgray bg-warmwhite p-6">
        <h2 className="mb-3 font-bold text-brand-700">Service Area</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal/65">
          <span className="flex items-center gap-1.5">
            <MapPin size={15} className="text-brand-600/60" /> {tutor.regions.join(" · ")}
          </span>
          {tutor.lesson_modes && (
            <span className="flex items-center gap-1.5">
              {tutor.lesson_modes.includes("visit") && (
                <span className="flex items-center gap-1"><Home size={14} className="text-brand-600/60" />방문</span>
              )}
              {tutor.lesson_modes.includes("online") && (
                <span className="flex items-center gap-1"><MonitorSmartphone size={14} className="text-brand-600/60" />온라인</span>
              )}
            </span>
          )}
        </div>
      </section>

      <ReviewSection
        tutorId={tutor.id}
        tutorName={tutor.name}
        reviews={reviews}
        canReview={user?.role === "parent"}
        canSeeDetail={canSeeDetail}
        saved={ok === "review"}
      />

      {/* FAQ */}
      <section className="rounded-2xl border border-softgray bg-warmwhite p-6">
        <h2 className="mb-3 font-bold text-brand-700">FAQ</h2>
        <div className="divide-y divide-softgray">
          {FAQ.map((f) => (
            <div key={f.q} className="py-3">
              <p className="text-[14px] font-semibold text-charcoal/80">{f.q}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-charcoal/55">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 추가 1:1 문의 (기존 인앱 메시징 — 보조 채널) */}
      <details className="rounded-2xl border border-softgray bg-warmwhite p-6">
        <summary className="cursor-pointer font-bold text-brand-700">다른 문의사항이 있으신가요?</summary>
        <div className="mt-4">
          <InquiryForm
            tutorId={tutor.id}
            tutorName={tutor.name}
            academySlug={tutor.academy_slugs[0]}
            baseRate={tutor.base_rate}
            error={err}
          />
        </div>
      </details>

      {/* Desktop sticky CTA */}
      <div className="fixed inset-x-0 bottom-6 z-10 hidden justify-end lg:flex">
        <div className="mr-[max(1rem,calc((100vw-48rem)/2))] flex gap-3 rounded-2xl border border-softgray bg-warmwhite/95 p-3 shadow-sm backdrop-blur">
          <Link
            href="/tutors"
            className="rounded-xl border border-brand-600/15 bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            비슷한 튜터 추천받기
          </Link>
          <Link
            href={matchHref}
            className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            이 선생님 매칭 문의
          </Link>
        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-softgray bg-warmwhite p-3 lg:hidden">
        <Link
          href={matchHref}
          className="block rounded-xl bg-brand-600 py-3.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          이 선생님 매칭 문의
        </Link>
      </div>
    </div>
  );
}
