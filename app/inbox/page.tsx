import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { listInquiriesFor } from "@/lib/store";

export const metadata = { title: "문의함" };

export default async function InboxPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/inbox");

  const inquiries = listInquiriesFor(user.id);
  const isTutor = user.role === "tutor";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">문의함</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isTutor ? "학부모 문의에 답장하세요." : "튜터와의 상담 내역입니다."} 모든 대화는
          플랫폼 안에서 안전하게 보관됩니다.
        </p>
      </div>

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
            return (
              <li key={iq.id}>
                <Link href={`/inbox/${iq.id}`} className="block px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{other}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(iq.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-gray-500">{iq.last_body}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
