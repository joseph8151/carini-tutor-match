import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getLessonPaymentById, listLessonPaymentsForRequest } from "@/lib/store";
import { LESSON_PACKAGES } from "@/lib/lessonPackages";

export const metadata = { title: "결제 완료 — 카리니 튜터링" };

export default async function LessonPaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const { paymentId } = await searchParams;
  const payment = paymentId ? await getLessonPaymentById(paymentId) : null;

  if (!payment || payment.status !== "paid") {
    return (
      <div className="mx-auto max-w-md space-y-4 py-10 text-center">
        <p className="text-charcoal/60">결제 완료 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isSample = payment.product_type === "sample";
  const alreadyHasSample = isSample
    ? true
    : (await listLessonPaymentsForRequest(payment.match_request_id)).some(
        (p) => p.product_type === "sample" && p.status === "paid"
      );

  return (
    <div className="mx-auto max-w-md space-y-8 py-6 text-center">
      <div>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-butter-100 text-brand-600">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="mt-5 font-sans text-2xl font-extrabold text-brand-700">결제가 완료되었습니다.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal/65">
          {payment.tutor_name} 튜터와 {isSample ? "샘플수업" : "정규 수업"}이 곧 시작됩니다.
        </p>
      </div>

      {isSample && (
        <div className="rounded-2xl bg-butter-50 px-6 py-5">
          <p className="text-sm font-semibold text-brand-700">샘플수업이 끝나면 정규 수업으로 이어가 보세요.</p>
          <Link
            href={`/checkout/package?requestId=${payment.match_request_id}`}
            className="mt-3 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            정규 수업 등록하기
          </Link>
        </div>
      )}
      {!isSample && alreadyHasSample && (
        <p className="text-sm text-charcoal/50">
          {LESSON_PACKAGES.find((p) => p.id === payment.package_id)?.label} 등록이 완료되었습니다.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/tutors" className="rounded-xl border border-brand-600/15 bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          튜터 더 둘러보기
        </Link>
        <Link href="/" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
