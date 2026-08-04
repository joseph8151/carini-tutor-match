import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getAcademies } from "@/lib/data";
import { listMockTests, listMockBookings } from "@/lib/store";
import { bookMockTest } from "@/lib/actions";

export const metadata = { title: "모의 레테" };

export default async function MockTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const user = await getSessionUser();
  const academies = await getAcademies();
  const tests = listMockTests();
  const booked = new Set(
    user?.role === "parent" ? listMockBookings(user.id).map((b) => b.mock_id) : [],
  );
  const academyName = (slug: string) => academies.find((a) => a.slug === slug)?.name ?? slug;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">모의 레테</h1>
        <p className="mt-1 text-sm text-gray-500">
          실제 학원 레테 유형과 동일하게 구성한 모의고사로 실전 감각을 점검하세요.
        </p>
      </div>

      {ok && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          모의 레테가 신청되었습니다. 대시보드에서 일정을 확인하세요.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {tests.map((m) => {
          const isBooked = booked.has(m.id);
          return (
            <div key={m.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-xs text-gray-400">{academyName(m.academy_slug)}</p>
              <h2 className="mt-1 font-bold">{m.name}</h2>
              <p className="mt-2 text-sm text-gray-500">시험일 {m.date}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-brand-600">{m.price.toLocaleString()}원</span>
                {user?.role === "parent" ? (
                  isBooked ? (
                    <span className="text-sm font-semibold text-emerald-600">신청 완료 ✓</span>
                  ) : (
                    <form action={bookMockTest}>
                      <input type="hidden" name="mockId" value={m.id} />
                      <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                        신청
                      </button>
                    </form>
                  )
                ) : (
                  <Link href="/login?next=/mock-tests" className="text-sm text-brand-600 hover:underline">
                    로그인 후 신청
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
