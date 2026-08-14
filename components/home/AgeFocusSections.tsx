const KINDER_STEPS = ["Phonics", "Story Reading", "Speaking", "Vocabulary", "Classroom English"];
const ELEMENTARY_STEPS = ["Reading Comprehension", "Vocabulary", "Grammar", "Writing", "Speaking"];

export function KinderEnglish() {
  return (
    <section id="kinder-english" className="scroll-mt-24 rounded-3xl bg-sage-100 px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold text-brand-600">Kindergarten English</p>
        <h2 className="mt-2 font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
          영어유치원 전, 무엇을 준비해야 할까요?
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-charcoal/65">
          처음부터 문제집 중심으로 시작할 필요는 없습니다. 듣고, 말하고, 소리를
          이해하고, 책에 흥미를 느끼는 것부터 시작합니다.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {KINDER_STEPS.map((s) => (
          <span key={s} className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-brand-700">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}

export function ElementaryEnglish() {
  return (
    <section id="elementary-english" className="scroll-mt-24 rounded-3xl bg-butter-50 px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold text-brand-600">Elementary English</p>
        <h2 className="mt-2 font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
          초등 영어는 읽기에서 학습으로 연결됩니다.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-charcoal/65">
          Reading을 기반으로 Vocabulary, Grammar, Writing, Speaking을 균형 있게
          키워 학교 영어와 그 다음 단계까지 자연스럽게 이어줍니다.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {ELEMENTARY_STEPS.map((s) => (
          <span key={s} className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-brand-700">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
