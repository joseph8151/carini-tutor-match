import Link from "next/link";
import { GraduationCap, MapPin } from "lucide-react";
import type { Tutor } from "@/lib/types";
import { CariniBadge, AvailabilityTag } from "./Badges";

const TUTOR_TYPE_LABEL = { native: "Native English Tutor", bilingual: "Bilingual Tutor", korean: undefined } as const;

export function TutorCard({ tutor }: { tutor: Tutor }) {
  const typeLabel = tutor.tutor_type ? TUTOR_TYPE_LABEL[tutor.tutor_type] : undefined;

  return (
    <Link
      href={`/tutors/${tutor.id}`}
      className="block rounded-2xl border border-softgray bg-warmwhite p-5 transition hover:border-brand-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-butter-100 font-sans text-[15px] font-bold text-brand-700">
            {tutor.name[0]}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-[15px] font-bold text-brand-700">{tutor.name} 튜터</h3>
              {tutor.country && <span className="text-xs text-charcoal/40">· {tutor.country}</span>}
            </div>
            {typeLabel && <p className="text-xs font-medium text-brand-600/70">{typeLabel}</p>}
          </div>
        </div>
        {tutor.is_verified && <CariniBadge />}
      </div>

      {(tutor.university || tutor.major || tutor.years_experience) && (
        <div className="mt-3 flex items-start gap-1.5 text-[12.5px] text-charcoal/60">
          <GraduationCap size={14} className="mt-0.5 shrink-0 text-brand-600/50" />
          <span>
            {tutor.university ? `${tutor.university} · ` : ""}
            {tutor.major}
            {tutor.years_experience ? ` · ${tutor.years_experience} Years Experience` : ""}
          </span>
        </div>
      )}

      <p className="mt-3 line-clamp-2 text-sm text-charcoal/60">{tutor.bio}</p>

      {tutor.age_focus && <p className="mt-3 text-xs font-semibold text-brand-600/70">Best For: {tutor.age_focus}</p>}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {tutor.subjects.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-brand-700">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-softgray pt-3 text-sm">
        <span className="flex items-center gap-1 text-[12.5px] text-charcoal/50">
          <MapPin size={12} /> {tutor.regions.join(" · ")}
        </span>
        <AvailabilityTag status={tutor.availability} />
      </div>
      <p className="mt-2 text-right text-[12px] text-charcoal/35">수업료 보기 →</p>
    </Link>
  );
}
