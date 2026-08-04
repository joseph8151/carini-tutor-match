import { writeReview } from "@/lib/actions";
import type { Review } from "@/lib/types";

function Stars({ n }: { n: number }) {
  return <span className="text-amber-500">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export function ReviewSection({
  tutorId,
  tutorName,
  reviews,
  canReview,
  saved,
}: {
  tutorId: string;
  tutorName: string;
  reviews: Review[];
  canReview: boolean;
  saved?: boolean;
}) {
  return (
    <section id="review" className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">합격 후기 ({reviews.length})</h2>
      </div>

      {saved && (
        <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">
          후기가 등록되었습니다. 감사합니다!
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">아직 후기가 없습니다.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm">
                <Stars n={r.rating} />
                {r.is_verified_pass && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    ✓ 합격 인증
                  </span>
                )}
                <span className="ml-auto text-xs text-gray-400">{r.parent_name}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{r.body}</p>
            </li>
          ))}
        </ul>
      )}

      {canReview && (
        <form action={writeReview} className="mt-5 space-y-2 border-t border-gray-100 pt-4">
          <input type="hidden" name="tutorId" value={tutorId} />
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500">
              평점
              <select
                name="rating"
                defaultValue="5"
                className="ml-2 rounded-lg border border-gray-300 px-2 py-1 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    ★ {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-gray-600">
              <input type="checkbox" name="pass" value="1" />
              실제 합격했어요 (합격 인증)
            </label>
          </div>
          <textarea
            name="body"
            rows={3}
            required
            placeholder={`${tutorName} 튜터와의 수업 후기를 남겨주세요.`}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            후기 등록
          </button>
        </form>
      )}
    </section>
  );
}
