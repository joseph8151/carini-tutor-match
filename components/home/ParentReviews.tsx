const REVIEWS = [
  {
    body: "영어를 알아듣기는 했지만 말하는 걸 어려워했는데 선생님을 만나고 먼저 영어로 이야기하는 시간이 많아졌어요.",
    meta: "7세 학부모",
  },
  {
    body: "영유 레벨테스트 준비 때문에 시작했는데 부족했던 Reading과 Vocabulary를 정확하게 잡아주셨어요.",
    meta: "6세 학부모",
  },
  {
    body: "아이 성향까지 고려해서 선생님을 매칭해주셔서 적응이 훨씬 수월했어요.",
    meta: "초등 1학년 학부모",
  },
];

export function ParentReviews() {
  return (
    <section>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold text-brand-600">Parent Review</p>
        <h2 className="mt-2 font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
          학부모님들의 이야기
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {REVIEWS.map((r) => (
          <div key={r.meta} className="rounded-2xl border border-softgray bg-cream p-6">
            <p className="text-[14px] leading-relaxed text-charcoal/75">&ldquo;{r.body}&rdquo;</p>
            <p className="mt-4 text-xs font-medium text-charcoal/40">{r.meta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
