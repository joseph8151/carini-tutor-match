import Link from "next/link";
import { getMatchRequestById, listLessonPaymentsForRequest } from "@/lib/store";
import { LESSON_PACKAGES } from "@/lib/lessonPackages";
import { startPackageCheckout } from "@/lib/actions";

export const metadata = { title: "정규 수업 등록 — 카리니 튜터링" };

export default async function PackageCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const { requestId } = await searchParams;
  const request = requestId ? await getMatchRequestById(requestId) : null;

  if (!request) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
        <p className="text-charcoal/60">신청 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const payments = await listLessonPaymentsForRequest(request.id);
  const sampleDone = payments.some((p) => p.product_type === "sample" && p.status === "paid");

  if (!sampleDone) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
        <p className="font-bold text-brand-700">샘플수업 결제를 먼저 완료해 주세요.</p>
        <Link
          href={`/checkout/sample?requestId=${request.id}`}
          className="inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          샘플수업 예약하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-4">
      <div className="text-center">
        <p className="text-xs font-semibold text-brand-600">Regular Lesson Package</p>
        <h1 className="mt-2 font-sans text-2xl font-extrabold text-brand-700">정규 수업 패키지 등록</h1>
        <p className="mt-2 text-sm text-charcoal/55">원하시는 횟수의 패키지를 선택해 주세요.</p>
      </div>

      <div className="space-y-3">
        {LESSON_PACKAGES.map((pkg) => (
          <form key={pkg.id} action={startPackageCheckout} className="rounded-2xl border border-softgray bg-warmwhite p-5">
            <input type="hidden" name="requestId" value={request.id} />
            <input type="hidden" name="packageId" value={pkg.id} />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-brand-700">{pkg.label}</p>
                <p className="text-xs text-charcoal/45">회당 {Math.round(pkg.price / pkg.lessons).toLocaleString()}원</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-brand-700">{pkg.price.toLocaleString()}원</p>
                <button className="mt-1 rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                  선택하기
                </button>
              </div>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
