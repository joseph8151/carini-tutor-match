import type { SubscriptionTier } from "@/lib/types";

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
      ✓ 실적 인증
    </span>
  );
}

export function TierBadge({ tier }: { tier: SubscriptionTier }) {
  if (tier === "free") return null;
  const map = {
    premium: { label: "프리미엄", cls: "bg-amber-100 text-amber-800" },
    pro: { label: "프로", cls: "bg-brand-100 text-brand-700" },
  } as const;
  const { label, cls } = map[tier];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export function AcademyBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
      {label}
    </span>
  );
}
