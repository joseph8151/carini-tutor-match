import Link from "next/link";
import { BookOpenCheck, FileEdit, Mic, MessageSquare, SpellCheck2, Brain } from "lucide-react";

const AREAS = [
  { icon: BookOpenCheck, label: "Reading" },
  { icon: Brain, label: "Vocabulary" },
  { icon: SpellCheck2, label: "Grammar" },
  { icon: FileEdit, label: "Writing" },
  { icon: Mic, label: "Interview" },
];

export function LevelTestPrep() {
  return (
    <section id="prep" className="scroll-mt-24 rounded-3xl border border-softgray bg-warmwhite px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold text-brand-600">Level Test Prep</p>
        <h2 className="mt-2 font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
          영어학원 · 영어유치원 Level Test Prep
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-charcoal/65">
          지원하려는 프로그램의 시험 유형을 분석하고 현재 아이의 수준에 맞춰
          Reading, Vocabulary, Grammar, Writing, Speaking 영역을 준비합니다.
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-3">
        {AREAS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-[13px] font-semibold text-brand-700"
          >
            <Icon size={14} className="text-brand-600/70" />
            {label}
          </span>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-charcoal/40">
        <MessageSquare size={13} />
        MI · 트윈클 · 에디센 · 피아이(PI) 등 주요 학원 레벨테스트 유형 데이터 보유
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/academy/mi"
          className="inline-block rounded-xl border border-brand-600/15 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          학원별 레벨테스트 정보 보기
        </Link>
      </div>
    </section>
  );
}
