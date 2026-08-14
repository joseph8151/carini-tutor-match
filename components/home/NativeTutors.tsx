import Link from "next/link";
import { ArrowRight, GraduationCap, MapPin } from "lucide-react";
import type { Tutor } from "@/lib/types";

export function NativeTutors({ tutors }: { tutors: Tutor[] }) {
  const shown = tutors.filter((t) => t.is_native).slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <section>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold text-brand-600">Native Tutors</p>
        <h2 className="mt-2 font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
          좋은 영어는 좋은 선생님에게서
          <br className="sm:hidden" /> 시작됩니다.
        </h2>
        <p className="mt-2 text-sm text-charcoal/55">미국·캐나다 출신 원어민 튜터가 아이와 함께합니다.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <div key={t.id} className="rounded-2xl border border-softgray bg-warmwhite p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-butter-100 font-sans text-lg font-bold text-brand-700">
                {t.name[0]}
              </span>
              <div>
                <p className="text-[15px] font-bold text-brand-700">
                  {t.name} <span className="font-normal text-charcoal/40">· {t.country}</span>
                </p>
                <p className="flex items-center gap-1 text-xs text-charcoal/50">
                  <MapPin size={11} /> {t.regions.join(" · ")}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-1.5 text-[13px] text-charcoal/65">
              <GraduationCap size={15} className="mt-0.5 shrink-0 text-brand-600/60" />
              <span>
                {t.university ? `${t.university} · ` : ""}
                {t.major}
                {t.years_experience ? ` · ${t.years_experience} Years Teaching Experience` : ""}
              </span>
            </div>

            <p className="mt-3 text-xs font-semibold text-brand-600/70">Best For: {t.age_focus}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {t.subjects.slice(0, 4).map((s) => (
                <span key={s} className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-brand-700">
                  {s}
                </span>
              ))}
            </div>

            <Link
              href={`/tutors/${t.id}`}
              className="mt-5 flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:text-brand-700"
            >
              선생님 프로필 보기 <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
