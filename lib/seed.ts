import type { Academy, LevelTest, MockTest, TestSchedule, Tutor } from "./types";

// 상위권 영어학원 (대치/분당/광교). MVP 시연용 시드 데이터.
export const academies: Academy[] = [
  {
    id: "ac_mi",
    name: "MI 영어",
    slug: "mi",
    region: "대치동",
    description:
      "대치동 최상위권 영어학원. 원서 리딩과 라이팅 비중이 높고 레테 통과 난이도가 높기로 유명합니다.",
  },
  {
    id: "ac_twinkle",
    name: "트윈클",
    slug: "twinkle",
    region: "대치동",
    description:
      "초등 상위권 대상 영어학원. 어휘·문법 정확도와 스피드 리딩 위주의 레벨테스트가 특징입니다.",
  },
  {
    id: "ac_edisen",
    name: "에디센",
    slug: "edisen",
    region: "분당",
    description:
      "분당권 대표 영어학원. 디베이트·에세이 라이팅 역량을 레테에서 집중적으로 평가합니다.",
  },
  {
    id: "ac_pi",
    name: "피아이(PI)",
    slug: "pi",
    region: "광교",
    description:
      "광교 신도시 상위권 영어학원. 논픽션 독해와 서술형 라이팅 중심의 프랩이 요구됩니다.",
  },
];

export const levelTests: LevelTest[] = [
  {
    id: "lt_mi_1",
    academy_id: "ac_mi",
    name: "MI 정규반 레벨테스트",
    format_summary: "원서 지문 독해 + 서술형 라이팅 2문항 + 어휘. 90분.",
    difficulty: 5,
    updated_at: "2026-07-20",
  },
  {
    id: "lt_twinkle_1",
    academy_id: "ac_twinkle",
    name: "트윈클 입학 레테",
    format_summary: "스피드 리딩 + 문법 객관식 + 받아쓰기(딕테이션). 60분.",
    difficulty: 3,
    updated_at: "2026-07-15",
  },
  {
    id: "lt_edisen_1",
    academy_id: "ac_edisen",
    name: "에디센 디베이트반 레테",
    format_summary: "에세이 라이팅 1편 + 구술 인터뷰. 75분.",
    difficulty: 4,
    updated_at: "2026-07-18",
  },
  {
    id: "lt_pi_1",
    academy_id: "ac_pi",
    name: "PI 프랩 레벨테스트",
    format_summary: "논픽션 독해 + 서술형 요약 라이팅 + 어휘. 80분.",
    difficulty: 4,
    updated_at: "2026-07-10",
  },
];

export const testSchedules: TestSchedule[] = [
  { id: "ts_1", academy_id: "ac_mi", test_date: "2026-08-23", apply_deadline: "2026-08-16", note: "9월 정규반 편성" },
  { id: "ts_2", academy_id: "ac_twinkle", test_date: "2026-08-17", apply_deadline: "2026-08-12", note: "초등부 신규반" },
  { id: "ts_3", academy_id: "ac_edisen", test_date: "2026-08-30", apply_deadline: "2026-08-23", note: "가을학기 디베이트반" },
  { id: "ts_4", academy_id: "ac_pi", test_date: "2026-09-06", apply_deadline: "2026-08-30", note: "프랩 집중반" },
];

export const mockTests: MockTest[] = [
  { id: "mk_mi", academy_slug: "mi", name: "MI 정규반 모의 레테", price: 40000, date: "2026-08-16" },
  { id: "mk_twinkle", academy_slug: "twinkle", name: "트윈클 입학 모의 레테", price: 30000, date: "2026-08-13" },
  { id: "mk_edisen", academy_slug: "edisen", name: "에디센 디베이트 모의 레테", price: 45000, date: "2026-08-24" },
  { id: "mk_pi", academy_slug: "pi", name: "PI 프랩 모의 레테", price: 40000, date: "2026-08-30" },
];

export const tutors: Tutor[] = [
  {
    id: "tu_1",
    name: "김서연",
    bio: "MI·트윈클 레테 프랩 6년. 대치동 원서 리딩 라이팅 전문. 최근 2년 합격률 강조.",
    regions: ["대치동", "도곡동"],
    subjects: ["리딩", "라이팅", "어휘"],
    academy_slugs: ["mi", "twinkle"],
    base_rate: 90000,
    rating_avg: 4.9,
    response_rate: 0.98,
    subscription_tier: "premium",
    is_verified: true,
    badges: [
      { academy_id: "ac_mi", label: "MI 레테 합격 인증" },
      { academy_id: "ac_twinkle", label: "트윈클 전문" },
    ],
    pass_count: 23,
  },
  {
    id: "tu_2",
    name: "이준호",
    bio: "에디센 디베이트·에세이 라이팅 첨삭 전문. 구술 인터뷰 대비 모의 진행.",
    regions: ["분당", "판교"],
    subjects: ["라이팅", "스피킹", "디베이트"],
    academy_slugs: ["edisen"],
    base_rate: 80000,
    rating_avg: 4.7,
    response_rate: 0.92,
    subscription_tier: "pro",
    is_verified: true,
    badges: [{ academy_id: "ac_edisen", label: "에디센 레테 합격 인증" }],
    pass_count: 11,
  },
  {
    id: "tu_3",
    name: "박지민",
    bio: "PI 프랩 논픽션 독해·서술형 요약 전문. 광교/수지 방문 가능.",
    regions: ["광교", "수지"],
    subjects: ["리딩", "라이팅"],
    academy_slugs: ["pi"],
    base_rate: 70000,
    rating_avg: 4.6,
    response_rate: 0.88,
    subscription_tier: "pro",
    is_verified: true,
    badges: [{ academy_id: "ac_pi", label: "PI 레테 합격 인증" }],
    pass_count: 8,
  },
  {
    id: "tu_4",
    name: "최유진",
    bio: "초등 트윈클 입학 레테 대비. 문법 정확도·딕테이션 집중 지도.",
    regions: ["대치동"],
    subjects: ["문법", "어휘"],
    academy_slugs: ["twinkle"],
    base_rate: 55000,
    rating_avg: 4.4,
    response_rate: 0.8,
    subscription_tier: "free",
    is_verified: false,
    badges: [],
    pass_count: 3,
  },
  {
    id: "tu_5",
    name: "정하람",
    bio: "MI 정규반 라이팅 서술형 대비. 원서 정독 훈련. 대치동 대면.",
    regions: ["대치동", "역삼동"],
    subjects: ["라이팅", "리딩"],
    academy_slugs: ["mi"],
    base_rate: 100000,
    rating_avg: 4.8,
    response_rate: 0.95,
    subscription_tier: "premium",
    is_verified: true,
    badges: [{ academy_id: "ac_mi", label: "MI 레테 합격 인증" }],
    pass_count: 15,
  },
];
