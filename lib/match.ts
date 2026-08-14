import { z } from "zod";

// 매칭 신청 4-Step 위저드 — 선택지 상수 (폼과 서버 액션이 공유)
export const CHILD_AGE_OPTIONS = ["만 2세", "만 3세", "만 4세", "만 5세", "만 6세", "만 7세", "초등 1-2학년", "초등 3-4학년", "초등 5-6학년"] as const;
export const LOCATION_OPTIONS = ["서초", "강남", "반포", "대치동", "목동", "분당", "판교", "광교", "수지", "송도", "기타", "온라인"] as const;
export const LESSON_TYPE_OPTIONS = [
  { value: "visit", label: "방문 수업" },
  { value: "online", label: "온라인 수업" },
  { value: "either", label: "둘 다 가능" },
] as const;
export const ENGLISH_LEVEL_OPTIONS = [
  "Beginner (처음 시작)",
  "Basic Conversation",
  "Phonics",
  "Reading",
  "Intermediate",
  "Advanced",
  "잘 모르겠어요",
] as const;
export const GOAL_OPTIONS = [
  "영어 노출",
  "Speaking",
  "Phonics",
  "Reading",
  "Writing",
  "Grammar",
  "School English",
  "English Kindergarten Prep",
  "Academy Level Test Prep",
  "International School Prep",
] as const;
export const LESSONS_PER_WEEK_OPTIONS = ["주 1회", "주 2회", "주 3회+"] as const;
export const DAY_OPTIONS = ["월", "화", "수", "목", "금", "토", "일"] as const;
export const TIME_OPTIONS = ["Morning", "Afternoon", "Evening", "Specific Time"] as const;
export const TUTOR_PREFERENCE_OPTIONS = [
  { value: "none", label: "No Preference" },
  { value: "female", label: "Female Tutor Preferred" },
  { value: "male", label: "Male Tutor Preferred" },
  { value: "native", label: "Native Tutor Preferred" },
] as const;

// Step 1: 아이 정보
export const step1Schema = z.object({
  child_age: z.enum(CHILD_AGE_OPTIONS, { message: "아이 나이를 선택해 주세요." }),
  child_grade: z.string().trim().min(1, "학년/기관 정보를 입력해 주세요.").max(40),
});

// Step 2: 영어 수준과 목표
export const step2Schema = z.object({
  english_level: z.enum(ENGLISH_LEVEL_OPTIONS, { message: "현재 영어 수준을 선택해 주세요." }),
  goals: z.array(z.enum(GOAL_OPTIONS)).min(1, "수업 목표를 1개 이상 선택해 주세요."),
});

// Step 3: 지역과 일정
export const step3Schema = z.object({
  location: z.string().trim().min(1, "지역을 선택해 주세요."),
  lesson_type: z.enum(["visit", "online", "either"], { message: "수업 방식을 선택해 주세요." }),
  lessons_per_week: z.enum(LESSONS_PER_WEEK_OPTIONS, { message: "원하는 수업 횟수를 선택해 주세요." }),
  preferred_days: z.array(z.enum(DAY_OPTIONS)).min(1, "원하는 요일을 1개 이상 선택해 주세요."),
  preferred_times: z.array(z.enum(TIME_OPTIONS)).min(1, "선호 시간대를 1개 이상 선택해 주세요."),
});

// Step 4: 튜터 선호 및 연락처
export const step4Schema = z.object({
  tutor_preference: z.enum(["none", "female", "male", "native"]),
  requested_tutor_id: z.string().optional(),
  requested_tutor_name: z.string().optional(),
  notes: z.string().max(500).optional(),
  parent_name: z.string().trim().min(2, "이름을 입력해 주세요.").max(30),
  mobile: z
    .string()
    .trim()
    .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, "올바른 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)"),
});

export const matchRequestSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);

export type MatchRequestInput = z.infer<typeof matchRequestSchema>;

export const MATCH_STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema, step4Schema] as const;

export const MATCH_STEP_TITLES = ["아이 정보", "영어 수준과 목표", "지역과 일정", "튜터 선호 및 연락처"] as const;

// 운영자 매칭 파이프라인 상태
export const MATCH_STATUS_LABELS = {
  new: "신규 접수",
  reviewing: "검토 중",
  tutor_contacting: "튜터 컨택 중",
  tutor_confirmed: "튜터 일정 확정",
  proposal_sent: "매칭 제안 발송",
  payment_pending: "결제 대기",
  paid: "결제 완료",
  lesson_scheduled: "수업 일정 확정",
  completed: "수업 완료",
  cancelled: "취소",
} as const;

export const MATCH_STATUS_ORDER = Object.keys(MATCH_STATUS_LABELS) as (keyof typeof MATCH_STATUS_LABELS)[];
