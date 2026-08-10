// 결제 상품(요금제) 정의 — 공개 요금 페이지·결제·승인에서 공용 사용.
export type PlanId = "tutor_pro" | "tutor_premium" | "parent_premium";

export interface Plan {
  id: PlanId;
  name: string;
  audience: "tutor" | "parent";
  price: number; // 원/월
  tier?: "pro" | "premium"; // 튜터 구독 등급
  summary: string;
  perks: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  tutor_pro: {
    id: "tutor_pro",
    name: "튜터 프로",
    audience: "tutor",
    price: 29000,
    tier: "pro",
    summary: "검색 상위 노출 + 문의 무제한",
    perks: ["검색 상위 노출", "문의 무제한 열람", "수업 리포트 작성", "노출/문의 통계"],
  },
  tutor_premium: {
    id: "tutor_premium",
    name: "튜터 프리미엄",
    audience: "tutor",
    price: 59000,
    tier: "premium",
    summary: "최상위 고정 노출 + 전문 뱃지 강조",
    perks: ["최상위 고정 노출", "학원별 전문 뱃지 강조", "실적 하이라이트", "우선 매칭권 공급"],
  },
  parent_premium: {
    id: "parent_premium",
    name: "학부모 프리미엄",
    audience: "parent",
    price: 19000,
    summary: "우선 매칭 + 상세 합격 후기 열람",
    perks: ["우선 매칭 (우선 매칭권 지급)", "상세 합격 후기 전문 열람", "레테 일정 알림", "모의 레테 우선 신청"],
  },
};

export const PLAN_LIST: Plan[] = [PLANS.tutor_pro, PLANS.tutor_premium, PLANS.parent_premium];

export function getPlan(id: string): Plan | null {
  return (PLANS as Record<string, Plan>)[id] ?? null;
}
