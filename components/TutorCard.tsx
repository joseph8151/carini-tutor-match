import Link from "next/link";
import type { Tutor } from "@/lib/types";
import { VerifiedBadge, TierBadge, AcademyBadge } from "./Badges";

export function TutorCard({ tutor }: { tutor: Tutor }) {
  return (
    <Link
      href={`/tutors/${tutor.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold">{tutor.name} 튜터</h3>
            {tutor.is_verified && <VerifiedBadge />}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{tutor.regions.join(" · ")}</p>
        </div>
        <TierBadge tier={tutor.subscription_tier} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-gray-600">{tutor.bio}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tutor.badges.map((b) => (
          <AcademyBadge key={b.academy_id} label={b.label} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
        <span className="font-semibold text-gray-900">
          ★ {tutor.rating_avg.toFixed(1)}
          <span className="ml-2 font-normal text-gray-400">합격 {tutor.pass_count}건</span>
        </span>
        <span className="font-semibold text-brand-600">
          {tutor.base_rate.toLocaleString()}원<span className="text-xs text-gray-400">/회</span>
        </span>
      </div>
    </Link>
  );
}
