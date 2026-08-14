import Link from "next/link";
import { Baby, BookOpen, Home, Sparkles, Users } from "lucide-react";

export function Hero() {
  return (
    <section className="grid gap-10 rounded-3xl bg-butter-100 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-14">
      <div>
        <p className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-brand-600">
          유아 · 초등 전문 1:1 영어 튜터링
        </p>
        <h1 className="mt-5 font-sans text-3xl font-extrabold leading-[1.25] text-brand-700 sm:text-4xl lg:text-[2.65rem]">
          우리 아이의 첫 영어,
          <br />
          좋은 선생님과 시작하세요.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-charcoal/70">
          만 2세부터 초등학생까지. 미국·캐나다 출신 원어민 선생님과 함께하는
          1:1 맞춤 영어 튜터링.
        </p>

        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-brand-700/80">
          <li className="flex items-center gap-1.5">
            <Users size={15} /> Native English Tutors
          </li>
          <li className="flex items-center gap-1.5">
            <Sparkles size={15} /> 1:1 Personalized Lessons
          </li>
          <li className="flex items-center gap-1.5">
            <Baby size={15} /> Ages 2 – Elementary
          </li>
          <li className="flex items-center gap-1.5">
            <Home size={15} /> Home & Online Lessons
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/match"
            className="rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            우리 아이 선생님 찾기
          </Link>
          <Link
            href="/#programs"
            className="rounded-xl border border-brand-600/15 bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            수업 프로그램 보기
          </Link>
        </div>
        <Link
          href="/match"
          className="mt-4 inline-block text-[13px] font-semibold text-brand-600/80 underline decoration-brand-600/30 underline-offset-4 hover:text-brand-700"
        >
          샘플수업 신청 →
        </Link>
      </div>

      <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl bg-cream shadow-sm lg:max-w-none">
        <div className="absolute -left-8 -top-10 h-40 w-40 rounded-full bg-sage-300/60" />
        <div className="absolute -bottom-10 -right-6 h-44 w-44 rounded-full bg-butter-300/50" />
        <div className="absolute inset-6 flex flex-col justify-between rounded-2xl bg-white/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-brand-600">
            <BookOpen size={20} />
            <span className="text-sm font-semibold">Today&apos;s Lesson</span>
          </div>
          <div className="space-y-2">
            <div className="h-2.5 w-3/4 rounded-full bg-brand-100" />
            <div className="h-2.5 w-1/2 rounded-full bg-brand-100" />
            <div className="h-2.5 w-2/3 rounded-full bg-sage-300" />
          </div>
          <div className="flex gap-2">
            {["A", "B", "C"].map((c) => (
              <span
                key={c}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-butter-200 font-sans text-sm font-bold text-brand-700"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const TRUST_POINTS = [
  { icon: Users, label: "미국·캐나다\nNative Tutors" },
  { icon: Sparkles, label: "1:1\nPersonalized" },
  { icon: Baby, label: "Ages 2+" },
  { icon: Home, label: "Home & Online" },
];

export function TrustBar() {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {TRUST_POINTS.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-2 rounded-2xl border border-softgray bg-warmwhite px-4 py-5 text-center"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-butter-100 text-brand-600">
            <Icon size={18} />
          </span>
          <p className="whitespace-pre-line text-[13px] font-semibold leading-snug text-brand-700">{label}</p>
        </div>
      ))}
    </section>
  );
}
