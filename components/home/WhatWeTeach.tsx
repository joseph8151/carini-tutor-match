import {
  BookOpenCheck,
  ClipboardCheck,
  FileEdit,
  Mic,
  School,
  SpellCheck2,
  Volume2,
  Brain,
} from "lucide-react";

const SUBJECTS = [
  { icon: Volume2, label: "Phonics" },
  { icon: Mic, label: "Speaking" },
  { icon: BookOpenCheck, label: "Reading" },
  { icon: FileEdit, label: "Writing" },
  { icon: Brain, label: "Vocabulary" },
  { icon: SpellCheck2, label: "Grammar" },
  { icon: School, label: "School Prep" },
  { icon: ClipboardCheck, label: "Level Test Prep" },
];

export function WhatWeTeach() {
  return (
    <section>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold text-brand-600">What We Teach</p>
        <h2 className="mt-2 font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
          영역별로 촘촘하게 준비합니다
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SUBJECTS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2.5 rounded-2xl border border-softgray bg-warmwhite px-4 py-6 text-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-brand-600">
              <Icon size={19} />
            </span>
            <p className="text-[13px] font-semibold text-brand-700">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
