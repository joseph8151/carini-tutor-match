import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { publicQuestions, CATEGORY_LABEL } from "@/lib/diagnosis";
import { submitDiagnosis } from "@/lib/actions";

export const metadata = { title: "레벨 진단 진행 중" };

export default async function DiagnosisTest() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/diagnosis/test");
  const questions = publicQuestions();

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold">레벨 진단 테스트</h1>
        <p className="mt-1 text-sm text-gray-500">
          각 문항에서 알맞은 답을 고르세요. 총 {questions.length}문항이에요.
        </p>
      </div>

      <form action={submitDiagnosis} className="space-y-5">
        {questions.map((q, i) => (
          <fieldset key={q.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            <legend className="sr-only">문항 {i + 1}</legend>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {CATEGORY_LABEL[q.category]}
              </span>
            </div>
            {q.passage && (
              <p className="mb-2 rounded-lg bg-gray-50 p-3 text-sm italic text-gray-700">{q.passage}</p>
            )}
            <p className="font-medium">{q.prompt}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 text-sm hover:border-brand-400 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
                >
                  <input type="radio" name={`q_${q.id}`} value={oi} className="accent-brand-600" />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <button className="w-full rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white hover:bg-brand-700">
          제출하고 결과 보기
        </button>
      </form>
    </div>
  );
}
