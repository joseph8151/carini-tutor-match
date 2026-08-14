import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getTutorById } from "@/lib/data";
import {
  listLessonPaymentsForUser,
  listMatchRequestsForUser,
  listRecommendations,
} from "@/lib/store";
import { MATCH_STATUS_LABELS, PAYMENT_READY_STATUSES } from "@/lib/match";
import { getLessonPackage } from "@/lib/lessonPackages";
import { requestReschedule } from "@/lib/actions";

export const metadata = { title: "내 대시보드 — 카리니 튜터링" };

const MENU = [
  { href: "#child", label: "My Child" },
  { href: "#tutor", label: "My Tutor" },
  { href: "#requests", label: "Matching Requests" },
  { href: "#upcoming", label: "Upcoming Lessons" },
  { href: "#history", label: "Lesson History" },
  { href: "#payments", label: "Payments" },
  { href: "#messages", label: "Messages" },
];

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  failed: "결제 실패",
  cancelled: "취소됨",
  refunded: "환불됨",
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role !== "parent") redirect("/");

  const [requests, payments] = await Promise.all([
    listMatchRequestsForUser(user.id),
    listLessonPaymentsForUser(user.id),
  ]);
  const currentRequest = requests[0] ?? null;
  const confirmed = currentRequest ? (await listRecommendations(currentRequest.id)).find((r) => r.status === "confirmed") : undefined;
  const tutor = confirmed ? await getTutorById(confirmed.tutor_id) : null;

  const activePackage = payments.find((p) => p.product_type === "package" && p.status === "paid");
  const activeSample = payments.find((p) => p.product_type === "sample" && p.status === "paid");
  const upcoming = payments.filter((p) => p.status === "paid");
  const history = payments.filter((p) => p.status === "cancelled" || p.status === "refunded" || p.status === "failed");

  let statusLabel = "매칭 시작 전";
  let statusDesc = "우리 아이에게 맞는 선생님을 찾아드릴게요.";
  if (activePackage) {
    statusLabel = "Regular Lessons Active";
    statusDesc = "정규 수업이 진행 중입니다.";
  } else if (activeSample) {
    statusLabel = "Sample Lesson Scheduled";
    statusDesc = "샘플수업 예약이 완료되었습니다.";
  } else if (currentRequest && PAYMENT_READY_STATUSES.has(currentRequest.status)) {
    statusLabel = "Tutor Confirmed";
    statusDesc = "선생님 일정이 확정되었습니다. 샘플수업을 예약해 주세요.";
  } else if (currentRequest) {
    statusLabel = "Matching In Progress";
    statusDesc = "카리니 매칭팀이 검토 중입니다.";
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-sans text-2xl font-extrabold text-brand-700">안녕하세요, {user.name}님.</h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-softgray bg-warmwhite p-5">
          <div>
            <span className="rounded-full bg-butter-100 px-3 py-1 text-xs font-semibold text-brand-700">{statusLabel}</span>
            <p className="mt-2 text-sm text-charcoal/60">{statusDesc}</p>
          </div>
          {!currentRequest && (
            <Link href="/match" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              매칭 신청하기
            </Link>
          )}
          {currentRequest && !activeSample && !activePackage && PAYMENT_READY_STATUSES.has(currentRequest.status) && (
            <Link
              href={`/checkout/sample?requestId=${currentRequest.id}`}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              샘플수업 예약
            </Link>
          )}
          {activeSample && !activePackage && (
            <Link
              href={`/checkout/package?requestId=${currentRequest?.id}`}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              정규 수업 등록
            </Link>
          )}
        </div>
      </div>

      <nav className="flex flex-wrap gap-x-4 gap-y-2 border-y border-softgray py-3 text-[13px] font-medium text-charcoal/55">
        {MENU.map((m) => (
          <a key={m.href} href={m.href} className="hover:text-brand-600">
            {m.label}
          </a>
        ))}
      </nav>

      {/* My Child */}
      <section id="child" className="scroll-mt-20">
        <h2 className="mb-3 font-bold text-brand-700">My Child</h2>
        {currentRequest ? (
          <div className="rounded-2xl border border-softgray bg-warmwhite p-5 text-sm">
            <p className="font-semibold text-charcoal/80">{currentRequest.child_age} · {currentRequest.child_grade}</p>
            <p className="mt-1 text-charcoal/55">영어 수준: {currentRequest.english_level}</p>
            <p className="mt-1 text-charcoal/55">목표: {currentRequest.goals.join(", ")}</p>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-softgray p-6 text-center text-sm text-charcoal/40">
            아직 등록된 아이 정보가 없습니다.
          </p>
        )}
      </section>

      {/* My Tutor */}
      <section id="tutor" className="scroll-mt-20">
        <h2 className="mb-3 font-bold text-brand-700">My Tutor</h2>
        {tutor ? (
          <div className="flex items-start gap-4 rounded-2xl border border-softgray bg-warmwhite p-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-butter-100 font-sans text-lg font-bold text-brand-700">
              {tutor.name[0]}
            </span>
            <div className="text-sm">
              <p className="text-[15px] font-bold text-brand-700">
                {tutor.name} 튜터 {tutor.country && <span className="font-normal text-charcoal/40">· {tutor.country}</span>}
              </p>
              {tutor.major && <p className="mt-1 text-charcoal/55">{tutor.major}</p>}
              <p className="mt-1 text-charcoal/55">수업 영역: {tutor.subjects.join(", ")}</p>
              {activeSample && <p className="mt-1 text-charcoal/40">수업 시작일: {new Date(activeSample.created_at).toLocaleDateString("ko-KR")}</p>}
              {confirmed?.available_schedule && <p className="mt-1 text-charcoal/40">다음 수업: {confirmed.available_schedule}</p>}
              <Link href={`/tutors/${tutor.id}`} className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:text-brand-700">
                프로필 보기 →
              </Link>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-softgray p-6 text-center text-sm text-charcoal/40">
            아직 확정된 선생님이 없습니다.
          </p>
        )}
      </section>

      {/* Matching Requests */}
      <section id="requests" className="scroll-mt-20">
        <h2 className="mb-3 font-bold text-brand-700">Matching Requests</h2>
        {requests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-softgray p-6 text-center text-sm text-charcoal/40">
            매칭 신청 내역이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl border border-softgray bg-warmwhite px-4 py-3 text-sm">
                <span className="text-charcoal/70">{r.child_age} · {new Date(r.created_at).toLocaleDateString("ko-KR")}</span>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-brand-700">{MATCH_STATUS_LABELS[r.status]}</span>
                  <Link href={`/match/complete?id=${r.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">자세히 →</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming Lessons */}
      <section id="upcoming" className="scroll-mt-20">
        <h2 className="mb-3 font-bold text-brand-700">Upcoming Lessons</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-softgray p-6 text-center text-sm text-charcoal/40">
            예정된 수업이 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((p) => (
              <li key={p.id} className="rounded-2xl border border-softgray bg-warmwhite p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-semibold text-charcoal/80">
                      {p.product_type === "sample" ? "샘플수업" : getLessonPackage(p.package_id ?? "")?.label ?? "정규 패키지"} · {p.tutor_name} 튜터
                    </p>
                    <p className="mt-0.5 text-xs text-charcoal/50">
                      {p.lesson_schedule ?? "일정 협의 중"} · {p.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Scheduled</span>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-brand-600 hover:text-brand-700">일정 변경 요청</summary>
                  <form action={requestReschedule} className="mt-2 flex flex-wrap gap-2">
                    <input type="hidden" name="lessonPaymentId" value={p.id} />
                    <input type="hidden" name="matchRequestId" value={p.match_request_id} />
                    <input
                      name="note"
                      required
                      placeholder="희망하는 변경 사항을 알려주세요 (예: 화요일 오후로 변경 희망)"
                      className="min-w-[200px] flex-1 rounded-xl border border-softgray bg-white px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                    />
                    <button className="rounded-xl border border-brand-600/15 bg-white px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                      요청 보내기
                    </button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lesson History */}
      <section id="history" className="scroll-mt-20">
        <h2 className="mb-3 font-bold text-brand-700">Lesson History</h2>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-softgray p-6 text-center text-sm text-charcoal/40">
            지난 내역이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border border-softgray bg-warmwhite px-4 py-3 text-sm">
                <span className="text-charcoal/60">{p.tutor_name} 튜터 · {new Date(p.created_at).toLocaleDateString("ko-KR")}</span>
                <span className="text-xs font-medium text-charcoal/40">{PAYMENT_STATUS_LABEL[p.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Payments */}
      <section id="payments" className="scroll-mt-20">
        <h2 className="mb-3 font-bold text-brand-700">Payments</h2>
        {payments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-softgray p-6 text-center text-sm text-charcoal/40">
            결제 내역이 없습니다.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-softgray">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs text-charcoal/45">
                <tr>
                  <th className="px-4 py-2.5 font-medium">상품</th>
                  <th className="px-4 py-2.5 font-medium">금액</th>
                  <th className="px-4 py-2.5 font-medium">상태</th>
                  <th className="px-4 py-2.5 font-medium">일자</th>
                </tr>
              </thead>
              <tbody className="bg-warmwhite">
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-softgray">
                    <td className="px-4 py-2.5">{p.product_type === "sample" ? "샘플수업" : getLessonPackage(p.package_id ?? "")?.label ?? "정규 패키지"}</td>
                    <td className="px-4 py-2.5 font-semibold text-brand-700">{p.amount.toLocaleString()}원</td>
                    <td className="px-4 py-2.5 text-charcoal/55">{PAYMENT_STATUS_LABEL[p.status]}</td>
                    <td className="px-4 py-2.5 text-charcoal/40">{new Date(p.created_at).toLocaleDateString("ko-KR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Messages */}
      <section id="messages" className="scroll-mt-20">
        <h2 className="mb-3 font-bold text-brand-700">Messages</h2>
        <div className="flex items-center justify-between rounded-2xl border border-softgray bg-warmwhite p-5 text-sm">
          <p className="text-charcoal/60">카리니 매칭팀 및 선생님과의 1:1 대화는 문의함에서 확인할 수 있어요.</p>
          <Link href="/inbox" className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700">
            문의함 열기 →
          </Link>
        </div>
      </section>

      <p className="text-center text-xs text-charcoal/35">
        레벨테스트 진단 · 학습 리포트 · 프리미엄 등 기존 학습 관리 기능은{" "}
        <Link href="/parent" className="font-semibold text-brand-600 hover:text-brand-700">학습 대시보드</Link>에서 확인하세요.
      </p>
    </div>
  );
}
