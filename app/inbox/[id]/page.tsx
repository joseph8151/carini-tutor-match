import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getInquiry, getMessages } from "@/lib/store";
import { MessageThread } from "@/components/MessageThread";

export const metadata = { title: "대화" };

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/inbox/${id}`);

  const iq = getInquiry(id);
  if (!iq || (iq.parent_id !== user.id && iq.tutor_id !== user.id)) notFound();

  const messages = getMessages(id);
  const isTutor = user.role === "tutor";
  const other = isTutor ? iq.parent_name : `${iq.tutor_name} 튜터`;

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
          <span className="font-bold">{other}</span>
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
    </div>
  );
}
