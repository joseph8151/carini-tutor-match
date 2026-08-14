import { MatchWizard } from "@/components/match/MatchWizard";
import { getTutorById } from "@/lib/data";

export const metadata = {
  title: "매칭 신청 — 카리니 튜터링",
  description:
    "아이의 나이, 영어 수준, 일정을 알려주시면 카리니 매칭팀이 아이에게 맞는 튜터를 추천해드립니다.",
};

export default async function MatchPage({
  searchParams,
}: {
  searchParams: Promise<{ tutorId?: string }>;
}) {
  const { tutorId } = await searchParams;
  const tutor = tutorId ? await getTutorById(tutorId) : null;

  return (
    <div className="space-y-8 py-2">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold text-brand-600">Match Request</p>
        <h1 className="mt-2 font-sans text-2xl font-extrabold leading-snug text-brand-700 sm:text-3xl">
          우리 아이에게 맞는 선생님을
          <br />
          찾아드릴게요.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal/60">
          몇 가지 정보만 알려주시면 카리니 매칭팀이 아이의 수준과 일정에 맞는
          튜터를 추천해드립니다.
        </p>
      </div>
      <MatchWizard tutorId={tutor?.id} tutorName={tutor?.name} />
    </div>
  );
}
