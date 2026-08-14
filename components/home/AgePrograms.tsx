import { BookMarked, Puzzle, School, Sparkles } from "lucide-react";

const PROGRAMS = [
  {
    icon: Puzzle,
    bg: "bg-cream",
    tag: "Toddler",
    age: "만 2–4세",
    title: "놀이 속에서 첫 영어를 만나요",
    desc: "놀이와 상호작용 중심으로 영어를 자연스럽게 접하는 첫 단계.",
  },
  {
    icon: Sparkles,
    bg: "bg-butter-50",
    tag: "Kindergarten",
    age: "만 5–7세",
    title: "듣고 말하는 힘을 키워요",
    desc: "Phonics · Speaking · Reading · Vocabulary를 균형 있게 시작합니다.",
  },
  {
    icon: BookMarked,
    bg: "bg-sage-100",
    tag: "Elementary",
    age: "초등학생",
    title: "읽기에서 학습으로 연결해요",
    desc: "Reading · Writing · Grammar · Speaking · School English까지 확장.",
  },
  {
    icon: School,
    bg: "bg-softgray",
    tag: "Prep",
    age: "입학 · 레벨테스트",
    title: "목표 학원 레벨테스트를 준비해요",
    desc: "영어유치원 및 영어학원 입학·레벨테스트(레테) 대비.",
  },
];

export function AgePrograms() {
  return (
    <section id="programs" className="scroll-mt-24">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold text-brand-600">Age-Based Programs</p>
        <h2 className="mt-2 font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
          연령별 맞춤 프로그램
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROGRAMS.map((p) => (
          <div key={p.tag} className={`rounded-2xl border border-softgray ${p.bg} p-6`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600">
              <p.icon size={19} />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand-600/70">{p.tag}</p>
            <p className="text-xs text-charcoal/50">{p.age}</p>
            <h3 className="mt-2 text-[15px] font-bold text-brand-700">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
