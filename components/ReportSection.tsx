import { writeReport } from "@/lib/actions";
import type { LessonReport } from "@/lib/types";

export function ReportSection({
  inquiryId,
  reports,
  isTutor,
  saved,
}: {
  inquiryId: string;
  reports: LessonReport[];
  isTutor: boolean;
  saved?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">수업 리포트</h2>
        <span className="text-xs text-gray-400">
          {isTutor ? "작성한 리포트는 학부모 대시보드에 표시됩니다." : "튜터가 작성한 수업 기록"}
        </span>
      </div>

      {saved && (
        <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">
          리포트가 저장되었습니다.
        </p>
      )}

      {reports.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">아직 작성된 리포트가 없습니다.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{r.date} 수업</span>
                <span className="text-xs text-gray-400">{r.tutor_name} 튜터</span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{r.content}</p>
              {r.progress_note && (
                <p className="mt-2 rounded-lg bg-white p-2 text-sm text-gray-600">
                  📈 {r.progress_note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {isTutor && (
        <form action={writeReport} className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          <input type="hidden" name="inquiryId" value={inquiryId} />
          <div className="flex gap-2">
            <input
              type="date"
              name="date"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            name="content"
            rows={2}
            required
            placeholder="수업 내용 (예: MI 기출 원서 독해 2지문 + 서술형 라이팅 첨삭)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            name="progressNote"
            rows={2}
            placeholder="진도/코멘트 (예: 라이팅 구조 안정적, 어휘 정확도 보완 필요)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            리포트 저장
          </button>
        </form>
      )}
    </section>
  );
}
