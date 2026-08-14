import { BookOpen, Brain, Mic, SpellCheck2, Sprout } from "lucide-react";

const DIMENSIONS = [
  { icon: BookOpen, label: "Reading 수준" },
  { icon: Mic, label: "Speaking 자신감" },
  { icon: SpellCheck2, label: "Phonics 이해도" },
  { icon: Brain, label: "Vocabulary" },
  { icon: Sprout, label: "학습 성향" },
];

export function PersonalizedSection() {
  return (
    <section className="grid gap-10 rounded-3xl bg-warmwhite px-6 py-12 sm:px-10 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-xs font-semibold text-brand-600">Personalized Matching</p>
        <h2 className="mt-2 font-sans text-2xl font-extrabold leading-snug text-brand-700 sm:text-3xl">
          수업은 아이마다
          <br />
          달라야 합니다.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-charcoal/65">
          같은 6세라도 영어 수준은 모두 다릅니다. 카리니 튜터링은 나이만 보고
          수업을 정하지 않습니다. 현재 Reading 수준, Speaking 자신감, Phonics
          이해도, Vocabulary, 학습 성향을 확인하고 아이에게 맞는 선생님과
          수업 방향을 매칭합니다.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DIMENSIONS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-2xl border border-softgray bg-cream px-3 py-5 text-center"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-butter-100 text-brand-600">
              <Icon size={17} />
            </span>
            <p className="text-[12.5px] font-semibold text-brand-700">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
