const STEPS = [
  {
    n: "01",
    title: "아이 정보 알려주세요",
    desc: "나이, 영어 경험, 현재 수준, 원하는 수업을 알려주세요.",
  },
  {
    n: "02",
    title: "튜터를 추천합니다",
    desc: "아이의 성향과 목표에 맞는 선생님을 추천합니다.",
  },
  {
    n: "03",
    title: "첫 수업 시작",
    desc: "선생님과 수업을 시작하고 아이의 반응과 학습 방향을 확인합니다.",
  },
  {
    n: "04",
    title: "맞춤 커리큘럼",
    desc: "수업 진행에 따라 Reading, Speaking, Writing 등의 비중을 조정합니다.",
  },
];

export function HowItWorks() {
  return (
    <section>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold text-brand-600">How It Works</p>
        <h2 className="mt-2 font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
          어떻게 진행되나요?
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl border border-softgray bg-cream p-6">
            <p className="font-sans text-2xl font-extrabold text-butter-600">{s.n}</p>
            <h3 className="mt-3 text-[15px] font-bold text-brand-700">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
