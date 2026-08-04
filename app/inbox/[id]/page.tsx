import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import {
  getInquiry,
  getMessages,
  getPaymentForInquiry,
  listReportsForInquiry,
  lockedInquiryIds,
} from "@/lib/store";
import { getTutorById } from "@/lib/data";
import { MessageThread } from "@/components/MessageThread";
import { ReportSection } from "@/components/ReportSection";
import { PaymentBox } from "@/components/PaymentBox";

export const metadata = { title: "대화" };

export default async function ThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/inbox/${id}`);

  const iq = getInquiry(id);
  if (!iq || (iq.parent_id !== user.id && iq.tutor_id !== user.id)) notFound();

  const isTutor = user.role === "tutor";
  const other = isTutor ? iq.parent_name : `${iq.tutor_name} 튜터`;

  // 무료 티어 튜터: 열람 한도 초과 대화는 페이월
  if (isTutor) {
    const me = await getTutorById(user.id);
    if (lockedInquiryIds(user.id, me?.subscription_tier ?? "free").has(id)) {
      return (
        <div className="mx-auto max-w-2xl space-y-4">
          <nav className="text-sm text-gray-400">
            <Link href="/inbox" className="hover:text-brand-600">
              문의함
            </Link>{" "}
            / <span className="text-gray-600">잠긴 문의</span>
          </nav>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-lg font-bold text-amber-800">🔒 열람 한도를 초과했습니다</p>
            <p className="mt-2 text-sm text-amber-700">
              무료 등급은 최근 문의만 열람할 수 있습니다. 프로 이상으로 업그레이드하면 모든 문의에
              답장할 수 있습니다.
            </p>
            <Link
              href="/tutor/subscription"
              className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
            >
              업그레이드하기
            </Link>
          </div>
        </div>
      );
    }
  }

  const messages = getMessages(id);
  const reports = listReportsForInquiry(id);
  const payment = getPaymentForInquiry(id);
  const tutor = await getTutorById(iq.tutor_id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <nav className="text-sm text-gray-400">
        <Link href="/inbox" className="hover:text-brand-600">
          문의함
        </Link>{" "}
        / <span className="text-gray-600">{other}</span>
      </nav>

      <header className="rounded-2xl border border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="font-bold">
            {iq.priority && (
              <span className="mr-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                ⚡ 우선 문의
              </span>
            )}
            {other}
          </span>
          {iq.academy_slug && (
            <Link
              href={`/academy/${iq.academy_slug}`}
              className="text-xs text-brand-600 hover:underline"
            >
              {iq.academy_slug.toUpperCase()} 레테
            </Link>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          연락처 노출 없이 플랫폼 내에서 상담 중입니다.
        </p>
      </header>

      <MessageThread inquiryId={id} initialMessages={messages} meId={user.id} />

      <PaymentBox
        inquiryId={id}
        payment={payment}
        isParent={user.role === "parent"}
        suggestedAmount={tutor?.base_rate ?? 60000}
      />

      <ReportSection
        inquiryId={id}
        reports={reports}
        isTutor={isTutor}
        saved={ok === "report"}
      />
    </div>
  );
}
