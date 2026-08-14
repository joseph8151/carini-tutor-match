import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import {
  listMatchRequests,
  listRecommendations,
  listRescheduleRequestsForMatchRequest,
  MAX_RECOMMENDATIONS_PER_REQUEST,
} from "@/lib/store";
import { getTutors } from "@/lib/data";
import { changeMatchStatus, addTutorRecommendation, resolveReschedule } from "@/lib/actions";
import { MATCH_STATUS_LABELS, MATCH_STATUS_ORDER, PAYMENT_READY_STATUSES } from "@/lib/match";

export const metadata = { title: "매칭 신청 관리 — 어드민" };

export default async function AdminMatchesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/matches");
  if (user.role !== "admin") redirect("/");

  const [requests, tutors] = await Promise.all([listMatchRequests(), getTutors()]);
  const recsByRequest = Object.fromEntries(
    await Promise.all(requests.map(async (r) => [r.id, await listRecommendations(r.id)] as const))
  );
  const reschedulesByRequest = Object.fromEntries(
    await Promise.all(
      requests.map(async (r) => [r.id, await listRescheduleRequestsForMatchRequest(r.id)] as const)
    )
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-extrabold text-brand-700">매칭 신청 관리</h1>
        <p className="mt-1 text-sm text-charcoal/50">
          신청 1건당 최대 {MAX_RECOMMENDATIONS_PER_REQUEST}명까지 튜터를 추천할 수 있습니다. 결제는 튜터 일정 확정
          이후에만 활성화됩니다.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-softgray p-10 text-center text-charcoal/40">
          접수된 매칭 신청이 없습니다.
        </div>
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => {
            const recs = recsByRequest[r.id] ?? [];
            const canAddMore = recs.length < MAX_RECOMMENDATIONS_PER_REQUEST;
            const paymentReady = PAYMENT_READY_STATUSES.has(r.status);
            const openReschedules = (reschedulesByRequest[r.id] ?? []).filter((rr) => rr.status === "open");

            return (
              <li key={r.id} className="rounded-2xl border border-softgray bg-warmwhite p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-brand-700">
                      {r.parent_name}님 · {r.child_age}
                      {r.child_grade ? ` (${r.child_grade})` : ""}
                    </p>
                    <p className="mt-1 text-xs text-charcoal/40">
                      {r.id} · {new Date(r.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <span className="rounded-full bg-butter-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    {MATCH_STATUS_LABELS[r.status]}
                  </span>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-2 text-[13px] text-charcoal/65 sm:grid-cols-2">
                  <div><dt className="inline font-semibold text-charcoal/45">연락처: </dt><dd className="inline">{r.mobile}</dd></div>
                  <div><dt className="inline font-semibold text-charcoal/45">지역/방식: </dt><dd className="inline">{r.location} · {r.lesson_type === "visit" ? "방문" : r.lesson_type === "online" ? "온라인" : "방문/온라인 둘다"}</dd></div>
                  <div><dt className="inline font-semibold text-charcoal/45">목표: </dt><dd className="inline">{r.goals.join(", ")}</dd></div>
                  <div><dt className="inline font-semibold text-charcoal/45">희망 일정: </dt><dd className="inline">{r.lessons_per_week} · {r.preferred_days.join("")}요일 · {r.preferred_times.join(", ")}</dd></div>
                  <div><dt className="inline font-semibold text-charcoal/45">선호 튜터: </dt><dd className="inline">{r.requested_tutor_name ?? "지정 없음"}</dd></div>
                  <div><dt className="inline font-semibold text-charcoal/45">영어 수준: </dt><dd className="inline">{r.english_level}</dd></div>
                </dl>
                {r.notes && <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[13px] text-charcoal/60">메모: {r.notes}</p>}

                {openReschedules.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-xl bg-amber-50 p-3">
                    <p className="text-xs font-bold text-amber-700">일정 변경 요청 ({openReschedules.length}건)</p>
                    {openReschedules.map((rr) => (
                      <div key={rr.id} className="flex items-center justify-between gap-2 rounded-lg bg-white p-2.5 text-[13px]">
                        <span className="text-charcoal/70">{rr.note}</span>
                        <form action={resolveReschedule}>
                          <input type="hidden" name="id" value={rr.id} />
                          <button className="shrink-0 rounded-lg border border-softgray px-2.5 py-1 text-xs font-semibold text-charcoal/50 hover:bg-softgray">
                            처리 완료
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}

                {/* 상태 변경 */}
                <form action={changeMatchStatus} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="rounded-xl border border-softgray bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    {MATCH_STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {MATCH_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                    상태 변경
                  </button>
                  <span className={`text-xs font-medium ${paymentReady ? "text-emerald-600" : "text-charcoal/35"}`}>
                    {paymentReady ? "샘플수업 결제 활성화 가능" : "튜터 일정 확정 전 — 결제 비활성"}
                  </span>
                </form>

                {/* 추천 튜터 */}
                <div className="mt-4 rounded-xl bg-cream p-4">
                  <p className="text-xs font-bold text-brand-700">추천 튜터 ({recs.length}/{MAX_RECOMMENDATIONS_PER_REQUEST})</p>
                  {recs.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {recs.map((rec) => (
                        <li key={rec.id} className="rounded-lg bg-white p-3 text-[13px]">
                          <p className="font-semibold text-brand-700">{rec.tutor_name}</p>
                          <p className="mt-0.5 text-charcoal/60">{rec.admin_reason}</p>
                          {rec.available_schedule && (
                            <p className="mt-0.5 text-charcoal/40">가능 일정: {rec.available_schedule}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {canAddMore && (
                    <form action={addTutorRecommendation} className="mt-3 space-y-2">
                      <input type="hidden" name="matchRequestId" value={r.id} />
                      <div className="flex flex-wrap gap-2">
                        <select
                          name="tutorId"
                          required
                          className="rounded-xl border border-softgray bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                        >
                          <option value="">튜터 선택</option>
                          {tutors.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} 튜터
                            </option>
                          ))}
                        </select>
                        <input
                          name="schedule"
                          placeholder="가능 일정 (예: 화/목 오후 4시)"
                          className="flex-1 rounded-xl border border-softgray bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <textarea
                        name="reason"
                        required
                        rows={2}
                        placeholder="추천 이유 (예: 유아 Speaking 경험이 많고 현재 화/목 오후 방문수업이 가능합니다.)"
                        className="w-full rounded-xl border border-softgray bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                      />
                      <button className="rounded-xl border border-brand-600/15 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                        추천 추가
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
