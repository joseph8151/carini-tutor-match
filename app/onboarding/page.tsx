import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { chooseRole } from "@/lib/actions";

export const metadata = { title: "역할 선택" };

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/onboarding");
  if (user.role) redirect(user.role === "tutor" ? "/inbox" : "/tutors");

  const asParent = chooseRole.bind(null, "parent");
  const asTutor = chooseRole.bind(null, "tutor");

  return (
    <div className="mx-auto max-w-md space-y-6 py-12 text-center">
      <h1 className="text-2xl font-bold">어떤 목적으로 오셨나요?</h1>
      <p className="text-sm text-gray-500">역할에 따라 맞춤 화면을 제공합니다.</p>
      <div className="grid gap-4">
        <form action={asParent}>
          <button className="w-full rounded-2xl border border-gray-200 bg-white p-6 text-left transition hover:border-brand-500 hover:shadow-sm">
            <p className="text-lg font-bold">학부모예요</p>
            <p className="mt-1 text-sm text-gray-500">
              목표 학원 레테에 맞는 인증 튜터를 찾고 문의합니다.
            </p>
          </button>
        </form>
        <form action={asTutor}>
          <button className="w-full rounded-2xl border border-gray-200 bg-white p-6 text-left transition hover:border-brand-500 hover:shadow-sm">
            <p className="text-lg font-bold">튜터예요</p>
            <p className="mt-1 text-sm text-gray-500">
              프로필·실적을 등록하고 학부모 문의를 받습니다.
            </p>
          </button>
        </form>
      </div>
    </div>
  );
}
