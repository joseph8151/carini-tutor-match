import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTutorById, getAcademies } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { listReviewsForTutor } from "@/lib/store";
import { VerifiedBadge, TierBadge, AcademyBadge } from "@/components/Badges";
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
  return { title: `${tutor.name} 튜터 — ${tutor.regions.join(", ")} 레테 전문` };
}

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
  const reviews = listReviewsForTutor(tutor.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <nav className="text-sm text-gray-400">
        <Link href="/tutors" className="hover:text-brand-600">
          튜터 찾기
        </Link>{" "}
        / <span className="text-gray-600">{tutor.name} 튜터</span>
      </nav>

      <header className="rounded-3xl border border-gray-200 bg-white p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold">{tutor.name} 튜터</h1>
          {tutor.is_verified && <VerifiedBadge />}
          <TierBadge tier={tutor.subscription_tier} />
        </div>
        <p className="mt-2 text-sm text-gray-500">{tutor.regions.join(" · ")}</p>
        <p className="mt-4 text-gray-700">{tutor.bio}</p>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">★ {tutor.rating_avg.toFixed(1)}</p>
            <p className="text-xs text-gray-400">평점</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{tutor.pass_count}</p>
            <p className="text-xs text-gray-400">인증 합격 실적</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(tutor.response_rate * 100)}%
            </p>
            <p className="text-xs text-gray-400">응답률</p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-3 font-bold">전문 학원 · 인증 뱃지</h2>
        {tutor.badges.length ? (
          <div className="flex flex-wrap gap-2">
            {tutor.badges.map((b) => (
              <AcademyBadge key={b.academy_id} label={b.label} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">아직 인증된 실적 뱃지가 없습니다.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {tutor.academy_slugs.map((slug) => {
            const ac = academies.find((a) => a.slug === slug);
            if (!ac) return null;
            return (
              <Link
                key={slug}
                href={`/academy/${slug}`}
                className="text-sm text-brand-600 hover:underline"
              >
                {ac.name} 레테 정보 →
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-3 font-bold">과목</h2>
        <div className="flex flex-wrap gap-2">
          {tutor.subjects.map((s) => (
            <span key={s} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              {s}
            </span>
          ))}
        </div>
      </section>

      <ReviewSection
        tutorId={tutor.id}
        tutorName={tutor.name}
        reviews={reviews}
        canReview={user?.role === "parent"}
        saved={ok === "review"}
      />

      {/* 문의 (인앱 메시징) */}
      <div className="sticky bottom-4">
        <InquiryForm
          tutorId={tutor.id}
          tutorName={tutor.name}
          academySlug={tutor.academy_slugs[0]}
          baseRate={tutor.base_rate}
          error={err}
        />
      </div>
    </div>
  );
}
