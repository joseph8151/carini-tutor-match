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

// 고객 화면용 단일 인증 뱃지 — 여러 뱃지를 나열하지 않고 하나로 요약한다.
export function CariniBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-butter-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
      ✓ 카리니 인증 튜터
    </span>
  );
}

const AVAILABILITY_MAP = {
  available: { label: "매칭 가능", dot: "bg-emerald-500" },
  limited: { label: "자리 적음", dot: "bg-butter-600" },
  waitlist: { label: "대기 등록", dot: "bg-charcoal/30" },
} as const;

export function AvailabilityTag({ status = "available" }: { status?: keyof typeof AVAILABILITY_MAP }) {
  const { label, dot } = AVAILABILITY_MAP[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-charcoal/55">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
