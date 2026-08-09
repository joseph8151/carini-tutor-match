// 레벨 진단 테스트 — 문제 은행 + 채점 로직 (외부 AI 없이 동작하는 MVP).
export type DiagCategory = "reading" | "vocab" | "grammar";

export interface DiagQuestion {
  id: string;
  category: DiagCategory;
  level: 1 | 2 | 3 | 4 | 5;
  passage?: string;
  prompt: string;
  options: string[];
  answer: number; // 정답 인덱스 (서버에서만 사용, 클라이언트로 노출 금지)
}

export const CATEGORY_LABEL: Record<DiagCategory, string> = {
  reading: "리딩",
  vocab: "보카",
  grammar: "그래머",
};

export const QUESTIONS: DiagQuestion[] = [
  // Reading
  { id: "r1", category: "reading", level: 2, passage: "Mina has a red bike. She rides it to school every day.", prompt: "How does Mina go to school?", options: ["By bus", "By bike", "On foot", "By car"], answer: 1 },
  { id: "r2", category: "reading", level: 3, passage: "The library is quiet. Students read books there after class.", prompt: "Where do the students read books?", options: ["At home", "In the park", "In the library", "In the gym"], answer: 2 },
  { id: "r3", category: "reading", level: 4, passage: "Although it was raining hard, the team kept practicing for the final match.", prompt: "What can we infer about the team?", options: ["They canceled practice", "They were determined", "It was sunny", "They already lost"], answer: 1 },
  { id: "r4", category: "reading", level: 5, passage: "The author argues that curiosity, not talent, is what truly drives long-term success.", prompt: "The author's main point is that success depends most on ___.", options: ["talent", "luck", "curiosity", "money"], answer: 2 },
  // Vocab
  { id: "v1", category: "vocab", level: 2, prompt: "A place where you borrow books is a ___.", options: ["kitchen", "library", "garden", "station"], answer: 1 },
  { id: "v2", category: "vocab", level: 3, prompt: "Choose the word closest in meaning to \"happy\".", options: ["glad", "sad", "angry", "tired"], answer: 0 },
  { id: "v3", category: "vocab", level: 4, prompt: "The scientist made an important ___ about the disease.", options: ["discovery", "furniture", "weather", "corner"], answer: 0 },
  { id: "v4", category: "vocab", level: 5, prompt: "Choose the word closest in meaning to \"reluctant\".", options: ["eager", "unwilling", "cheerful", "honest"], answer: 1 },
  // Grammar
  { id: "g1", category: "grammar", level: 2, prompt: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1 },
  { id: "g2", category: "grammar", level: 3, prompt: "They have lived here ___ 2019.", options: ["since", "for", "in", "at"], answer: 0 },
  { id: "g3", category: "grammar", level: 4, prompt: "If I ___ more time, I would travel the world.", options: ["have", "had", "has", "having"], answer: 1 },
  { id: "g4", category: "grammar", level: 5, prompt: "Hardly ___ she arrived when the phone rang.", options: ["had", "has", "did", "was"], answer: 0 },
];

// 클라이언트로 보낼 때 정답 제거
export function publicQuestions() {
  return QUESTIONS.map(({ answer: _a, ...rest }) => rest);
}

export interface DiagnosisScore {
  overall: number; // 0~100
  percentile: number; // 1~99
  level: number; // 1~5 추천 시작 레벨
  byCategory: Record<DiagCategory, number>; // 0~100
  passReady: boolean; // 상위권 레테 도전 가능
  weakest: DiagCategory;
  recommendation: string;
}

const COURSE: Record<DiagCategory, string> = {
  reading: "논픽션 독해 정독 코스",
  vocab: "어휘 자동화 코스",
  grammar: "문법 정확도·서술형 교정 코스",
};

// answers: { [questionId]: 선택 인덱스 } — 미응답/오답은 0점
export function scoreDiagnosis(answers: Record<string, number>): DiagnosisScore {
  const totalWeight = QUESTIONS.reduce((s, q) => s + q.level, 0);
  let earned = 0;
  const catCorrect: Record<DiagCategory, number> = { reading: 0, vocab: 0, grammar: 0 };
  const catTotal: Record<DiagCategory, number> = { reading: 0, vocab: 0, grammar: 0 };

  for (const q of QUESTIONS) {
    catTotal[q.category] += 1;
    if (answers[q.id] === q.answer) {
      earned += q.level;
      catCorrect[q.category] += 1;
    }
  }

  const overall = Math.round((earned / totalWeight) * 100);
  const percentile = Math.max(1, Math.min(99, Math.round(overall * 0.9 + 5)));
  const level = overall >= 85 ? 5 : overall >= 70 ? 4 : overall >= 55 ? 3 : overall >= 40 ? 2 : 1;
  const byCategory: Record<DiagCategory, number> = {
    reading: Math.round((catCorrect.reading / catTotal.reading) * 100),
    vocab: Math.round((catCorrect.vocab / catTotal.vocab) * 100),
    grammar: Math.round((catCorrect.grammar / catTotal.grammar) * 100),
  };
  const weakest = (Object.keys(byCategory) as DiagCategory[]).reduce((a, b) =>
    byCategory[a] <= byCategory[b] ? a : b,
  );
  const passReady = overall >= 78;
  const recommendation = `가장 약한 영역은 ${CATEGORY_LABEL[weakest]}예요. ${COURSE[weakest]}부터 시작을 추천해요.`;

  return { overall, percentile, level, byCategory, passReady, weakest, recommendation };
}
