import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { listInquiriesFor, lockedInquiryIds } from "@/lib/store";
import { getTutorById } from "@/lib/data";

export const metadata = { title: "문의함" };

export default async function InboxPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/inbox");

  const inquiries = listInquiriesFor(user.id);
  const isTutor = user.role === "tutor";

  // 무료 티어 튜터: 열람 한도 초과 대화 잠금
  let locked = new Set<string>();
  if (isTutor) {
    const me = await getTutorById(user.id);
    locked = lockedInquiryIds(user.id, me?.subscription_tier ?? "free");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">문의함</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isTutor ? "학부모 문의에 답장하세요." : "튜터와의 상담 내역입니다."} 모든 대화는
          플랫폼 안에서 안전하게 보관됩니다.
        </p>
      </div>

      {locked.size > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <span>
            무료 등급은 최근 문의만 열람됩니다. 잠긴 문의 {locked.size}건을 열려면 업그레이드하세요.
          </span>
          <Link
            href="/tutor/subscription"
            className="whitespace-nowrap rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700"
          >
            업그레이드
          </Link>
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          아직 문의가 없습니다.{" "}
          {!isTutor && (
            <Link href="/tutors" className="text-brand-600 hover:underline">
              튜터 찾기 →
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {inquiries.map((iq) => {
            const other = isTutor ? iq.parent_name : `${iq.tutor_name} 튜터`;
            const isLocked = locked.has(iq.id);
            const inner = (
              <div className={`block px-5 py-4 ${isLocked ? "opacity-60" : "hover:bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {isLocked && "🔒 "}
                    {other}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(iq.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                  {isLocked ? "업그레이드하면 내용을 볼 수 있습니다." : iq.last_body}
                </p>
              </div>
            );
            return (
              <li key={iq.id}>
                {isLocked ? inner : <Link href={`/inbox/${iq.id}`}>{inner}</Link>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
