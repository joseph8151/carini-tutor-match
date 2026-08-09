import Link from "next/link";

export const metadata = {
  title: "학습 센터 — 진단 테스트 · 월 구독 프렙 · 성장 로드맵",
  description:
    "카리니 프랩 센터: 시험 대비(테스트 프랩)와 매일 공부가 함께 되는 온라인 스쿨. 진단으로 정확히 알고(SR·MAP·빅10 레테), AI 월 구독 프렙으로 실력을 올려요. 만 2세 파닉스부터 네이티브급까지, 전국 어디서나.",
};

/* ─────────────────────────  일러스트 (자체 제작 SVG)  ───────────────────────── */

function MissionArt() {
  return (
    <svg viewBox="0 0 440 300" className="h-full w-full" role="img" aria-label="지역을 잇는 카리니 네트워크">
      <defs>
        <radialGradient id="glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#d9e6ff" />
          <stop offset="100%" stopColor="#eef4ff" />
        </radialGradient>
      </defs>
      <rect width="440" height="300" rx="20" fill="url(#glow)" />
      <circle cx="220" cy="150" r="92" fill="#fff" stroke="#c9dbff" strokeWidth="2" />
      <ellipse cx="220" cy="150" rx="92" ry="34" fill="none" stroke="#c9dbff" strokeWidth="1.5" />
      <ellipse cx="220" cy="150" rx="60" ry="92" fill="none" stroke="#c9dbff" strokeWidth="1.5" />
      <line x1="128" y1="150" x2="312" y2="150" stroke="#c9dbff" strokeWidth="1.5" />
      {[[70, 70], [360, 80], [70, 240], [370, 230], [210, 40]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M220 150 Q ${(220 + x) / 2} ${(150 + y) / 2 - 30} ${x} ${y}`} fill="none" stroke="#3b6cff" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          <circle cx={x} cy={y} r="7" fill="#3b6cff" />
          <circle cx={x} cy={y} r="12" fill="#3b6cff" opacity="0.15" />
        </g>
      ))}
      <circle cx="220" cy="150" r="10" fill="#1f40b8" />
      <circle cx="220" cy="150" r="18" fill="#1f40b8" opacity="0.15" />
    </svg>
  );
}

function DiagnosticArt() {
  const c = 2 * Math.PI * 46;
  return (
    <svg viewBox="0 0 440 260" className="h-full w-full" role="img" aria-label="진단 리포트">
      <rect width="440" height="260" rx="20" fill="#eef4ff" />
      <rect x="36" y="34" width="368" height="192" rx="16" fill="#fff" stroke="#e0e8ff" strokeWidth="2" />
      <g transform="translate(120,130)">
        <circle r="46" fill="none" stroke="#e5ecff" strokeWidth="14" />
        <circle r="46" fill="none" stroke="#3b6cff" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${c * 0.88} ${c}`} transform="rotate(-90)" />
        <text y="-2" textAnchor="middle" fontSize="30" fontWeight="800" fill="#1f40b8">88</text>
        <text y="20" textAnchor="middle" fontSize="12" fill="#8aa0c8">또래 백분위</text>
      </g>
      <g transform="translate(210,86)">
        {[["리딩", 120, "#3b6cff"], ["보카", 92, "#5b84ff"], ["그래머", 140, "#2a54e6"], ["라이팅", 78, "#8aa8ff"]].map(([label, w, col], i) => (
          <g key={i} transform={`translate(0,${i * 34})`}>
            <text x="0" y="10" fontSize="12" fill="#6b7a99">{label as string}</text>
            <rect x="46" y="1" width="150" height="11" rx="5.5" fill="#eef0f4" />
            <rect x="46" y="1" width={w as number} height="11" rx="5.5" fill={col as string} />
          </g>
        ))}
      </g>
    </svg>
  );
}

function LearningArt() {
  return (
    <svg viewBox="0 0 440 260" className="h-full w-full" role="img" aria-label="레벨별 학습 코스">
      <rect width="440" height="260" rx="20" fill="#eef4ff" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={40 + i * 68} y={200 - i * 34} width="60" height={16 + i * 34} rx="6" fill={i === 4 ? "#1f40b8" : "#3b6cff"} opacity={0.55 + i * 0.11} />
      ))}
      <path d="M56 176 C 150 150, 250 96, 372 44" fill="none" stroke="#1f40b8" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 8" />
      <path d="M360 40 l 16 4 l -8 14 z" fill="#1f40b8" />
      <g transform="translate(250,158)">
        <rect x="0" y="-20" width="150" height="40" rx="20" fill="#fff" stroke="#c9dbff" strokeWidth="2" />
        <text x="16" y="6" fontSize="16" fontWeight="800" fill="#3b6cff">AI ∞</text>
        <text x="58" y="5" fontSize="11" fill="#6b7a99">매일 새 문제</text>
      </g>
    </svg>
  );
}

function GrowthArt() {
  const pts = [
    { x: 40, y: 175, m: "1" },
    { x: 160, y: 130, m: "3" },
    { x: 280, y: 78, m: "6" },
    { x: 400, y: 34, m: "12" },
  ];
  return (
    <svg viewBox="0 0 440 210" className="h-full w-full" role="img" aria-label="1·3·6·12개월 성장 곡선">
      <defs>
        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b6cff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b6cff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[45, 90, 135, 180].map((y) => (
        <line key={y} x1="20" y1={y} x2="420" y2={y} stroke="#eef0f4" strokeWidth="1" />
      ))}
      <path d="M40 175 C 100 150, 110 140, 160 130 S 240 95, 280 78 S 360 45, 400 34 L 400 190 L 40 190 Z" fill="url(#fill)" />
      <path d="M40 175 C 100 150, 110 140, 160 130 S 240 95, 280 78 S 360 45, 400 34" fill="none" stroke="#3b6cff" strokeWidth="3" strokeLinecap="round" />
      {pts.map((p) => (
        <g key={p.m}>
          <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke="#3b6cff" strokeWidth="3" />
          <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1f40b8">{p.m}개월</text>
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────  데이터  ───────────────────────── */

const DIAGNOSIS = [
  { code: "SR", name: "SR 리딩 레벨테스트", desc: "렉사일 기반으로 읽기 레벨·정확도·이해도를 지수로 측정해 현재 리딩 위치를 정밀 진단해요." },
  { code: "MAP", name: "MAP (리딩·수학·랭귀지)", desc: "문항 난이도가 실시간 조절되는 적응형 평가. 국제학교·미국 기준 또래 백분위로 위치를 파악해요." },
  { code: "빅10", name: "빅10 학원 입학 레테", desc: "MI·트윈클·에디센·PI 등 실제 학원 레테 유형을 그대로 모의해 합격권 여부를 판정해요." },
];

const REPORT = [
  { t: "또래 백분위", d: "전국·동학년 대비 우리 아이의 위치를 한눈에." },
  { t: "유형별 분석", d: "리딩·보카·그래머·라이팅 강약점을 세부 항목까지." },
  { t: "합격권 진단", d: "목표 학원·레벨 대비 현재 격차와 도달 예상 시점." },
  { t: "AI 맞춤 처방", d: "약점 유형별로 학습 코스를 자동 배정해 바로 연결." },
];

const DOMAINS = [
  { icon: "🔤", t: "파닉스", d: "소리-철자 규칙과 읽기 유창성의 기초" },
  { icon: "📖", t: "리딩", d: "픽션·논픽션 정독/속독과 독해 전략" },
  { icon: "🧠", t: "보카", d: "빈출 어휘 자동화와 문맥 추론" },
  { icon: "✏️", t: "그래머", d: "문법 정확도와 서술형 오류 교정" },
  { icon: "🎧", t: "받아쓰기", d: "듣기·철자·집중력 (딕테이션)" },
  { icon: "✍️", t: "라이팅", d: "문단·에세이·요약 구조화 + 첨삭" },
  { icon: "🗣️", t: "스피킹", d: "발화·인터뷰·디베이트 대비" },
];

const LADDER = ["만 2세 유아 파닉스", "초등 리딩·보카", "라이팅 입문", "상위권 학원 레테", "네이티브급"];

const HOW = [
  { t: "진단 테스트", d: "SR·MAP·빅10 레테로 실력과 약점을 데이터로 확인" },
  { t: "AI 맞춤 처방", d: "시작 레벨과 7영역 코스를 자동 배정" },
  { t: "매일 학습", d: "AI가 레벨에 맞춰 새 문제를 무한 생성" },
  { t: "성장 리포트", d: "백분위·레벨 변화·약점 개선을 투명하게" },
  { t: "레테 합격", d: "인증 튜터 프랩 + 모의 레테로 실전까지" },
];

const WHY = [
  { icon: "🌏", t: "지역 격차 해소", d: "대치동 프렙 수준을 지방·해외 어디서나 온라인으로." },
  { icon: "🤖", t: "AI 무한 생성", d: "아이 레벨에 맞춰 매일 새 문제를 끝없이 만들어요." },
  { icon: "✅", t: "검증된 데이터", d: "실제 합격 인증 튜터 + 학원별 최신 레테 유형." },
  { icon: "📶", t: "연속 레벨 체계", d: "만 2세 파닉스부터 네이티브급까지 끊김 없이." },
  { icon: "🔁", t: "진단↔학습 선순환", d: "진단으로 알고, 학습으로 올리고, 다시 진단으로 확인." },
  { icon: "📊", t: "투명한 성장 리포트", d: "부모가 실제 변화를 데이터로 확인해요." },
];

const FAQ = [
  { q: "몇 살부터 시작할 수 있나요?", a: "만 2세 유아 파닉스부터 시작합니다. AI가 아이 수준을 진단해 딱 맞는 단계부터 출발해요." },
  { q: "지방이나 해외에서도 되나요?", a: "네. 전국·해외 어디서나 온라인으로 대치동 프렙학원 수준의 학습을 받을 수 있어요." },
  { q: "학원 레테 준비가 되나요?", a: "SR·MAP 진단으로 실력을 확인하고, 빅10 학원별 레테 유형 프랩과 모의 레테로 실전까지 대비합니다." },
  { q: "하루에 얼마나 학습하나요?", a: "매일 15~30분 루틴을 권장해요. AI가 아이 컨디션과 정답률에 맞춰 분량과 난이도를 조절합니다." },
  { q: "성장은 어떻게 확인하나요?", a: "성장 리포트에서 또래 백분위, 레벨 변화, 약점 개선 추이를 주기적으로 확인할 수 있어요." },
];

const TIMELINE = [
  { m: "1개월", title: "습관과 기초", desc: "매일 학습 루틴이 잡히고, 약점 유형을 파악해 기초를 다져요.", detail: "파닉스·기초 문법을 점검하고 학습 리듬을 만듭니다. '무엇을 모르는지'가 명확해지는 시기예요." },
  { m: "3개월", title: "눈에 띄는 향상", desc: "보통 레벨 1~2단계 상승, 오답이 크게 줄고 리딩·라이팅이 탄탄해져요.", detail: "어휘가 자동화되고 독해 속도가 붙습니다. 문장 단위 라이팅이 안정됩니다." },
  { m: "6개월", title: "상위 레벨 진입", desc: "상위 레벨에 올라 국제학교·빅10 학원 레벨테스트에 도전할 실력이 돼요.", detail: "에세이 구조화와 서술형 대비가 가능해집니다. 학원별 레테 유형 프랩을 시작할 단계예요." },
  { m: "12개월", title: "최상위·합격권", desc: "원어민에 가까운 표현력으로, 목표 학원 레테 합격권에 진입해요.", detail: "디베이트·논픽션·서술형 라이팅을 실전 수준으로. 상위 학원 레테를 실전 감각으로 대비합니다." },
];

const LEVELS = [
  { icon: "🌱", band: "기초 다지기", who: "초1~초3 · 파닉스~기초 리딩", signals: ["알파벳·파닉스는 뗐지만 문장 읽기는 아직 서툴러요", "영어에 흥미는 있으나 매일 하는 습관이 없어요"], start: "학습 루틴 형성 + 사이트워드·기초 어휘 + 짧은 원서 리딩부터 시작합니다." },
  { icon: "📖", band: "리딩 확장", who: "초3~초5 · 짧은 원서 독해 가능", signals: ["그림책·챕터북 초반을 읽어요", "어휘·독해 정확도가 들쭉날쭉해요"], start: "어휘 자동화 + 논픽션 독해 + 정독 훈련으로 정확도를 끌어올립니다." },
  { icon: "✍️", band: "라이팅 입문", who: "초5~중1 · 문장 쓰기 가능", signals: ["간단한 문장은 쓰지만 문단·에세이는 어려워요", "학원 레테 라이팅에서 막혀요"], start: "문단 구조 + 서술형/요약 라이팅 + 1:1 첨삭으로 쓰기를 완성합니다." },
  { icon: "🎯", band: "상위권 레테 도전", who: "중등 · 학원 입학시험 준비", signals: ["대치·목동·송도 상위 학원(MI·트윈클·에디센·PI) 레테를 앞뒀어요", "원서 리딩·서술형은 되지만 실전 감각이 필요해요"], start: "학원별 레테 유형 프랩 + 모의 레테 + 인증 튜터 1:1로 합격을 준비합니다." },
];

/* ─────────────────────────  페이지  ───────────────────────── */

export default function LearningCenterPage() {
  return (
    <div className="space-y-16">
      {/* 미션 */}
      <section className="grid items-center gap-8 rounded-3xl bg-gradient-to-br from-brand-50 to-white p-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-brand-600">🌏 우리의 큰 목표</p>
          <h1 className="mt-2 text-2xl font-extrabold leading-snug sm:text-3xl">
            어디에 살든,
            <br />
            최고 수준의 영어 교육을.
          </h1>
          <p className="mt-4 text-gray-600">
            서울 대치동·목동, 송도 국제학교를 목표로 하는 아이들이 지방 어디서나 같은 수준으로
            준비할 수 있게 — <b>AI로 사교육 격차를 좁히는 것</b>이 카리니의 목표예요.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white px-3 py-1.5 text-brand-700 shadow-sm">만 2세 ~ 네이티브급</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-brand-700 shadow-sm">7개 학습 영역</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-brand-700 shadow-sm">전국·해외 어디서나</span>
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
          <MissionArt />
        </div>
      </section>

      {/* 두 가지 서비스 */}
      <section>
        <div className="text-center">
          <p className="text-sm font-semibold text-brand-600">🏫 카리니 프랩 센터</p>
          <h2 className="mt-2 text-2xl font-bold">시험 대비도, 매일 공부도 되는 온라인 스쿨</h2>
          <p className="mt-2 text-gray-500">
            레테·학원 시험 대비(<b>테스트 프랩</b>)와 꾸준한 자기주도 공부(<b>스터디</b>)를 한 곳에서.
            카리니 프랩 센터는 <b>진단 테스트</b>와 <b>학습 센터</b> 두 축으로 운영해요.
          </p>
        </div>
        <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-3 text-sm font-semibold">
          <span className="rounded-full bg-brand-600 px-4 py-2 text-white">🎯 진단</span>
          <span className="text-gray-400">→</span>
          <span className="rounded-full bg-brand-600 px-4 py-2 text-white">📚 학습</span>
          <span className="text-gray-400">→</span>
          <span className="rounded-full bg-emerald-500 px-4 py-2 text-white">🏆 합격</span>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {/* 진단 */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="aspect-[440/260]"><DiagnosticArt /></div>
            <div className="p-6">
              <h3 className="text-lg font-bold">🎯 진단 테스트</h3>
              <p className="mt-2 text-sm text-gray-600">
                실력과 약점을 <b>데이터로 정확히</b> 진단해요. 세 가지 공인·실전 테스트로 현재 위치를 확인합니다.
              </p>
              <ul className="mt-4 space-y-2">
                {DIAGNOSIS.map((t) => (
                  <li key={t.code} className="flex gap-3 rounded-xl bg-gray-50 p-3">
                    <span className="mt-0.5 rounded-md bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">{t.code}</span>
                    <span className="text-sm text-gray-700"><b>{t.name}</b><br className="hidden sm:block" /> {t.desc}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/diagnosis"
                className="mt-4 block rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
              >
                무료 레벨 진단 시작 →
              </Link>
            </div>
          </div>
          {/* 학습 */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="aspect-[440/260]"><LearningArt /></div>
            <div className="p-6">
              <h3 className="text-lg font-bold">📚 학습 센터 · 월 구독 프렙 프로그램</h3>
              <p className="mt-2 text-sm text-gray-600">
                만 2세 유아 파닉스부터 <b>네이티브급</b>까지, AI가 아이 레벨에 맞춰 <b>매일 새 문제를 무한 생성</b>해요.
              </p>
              <p className="mt-3 text-xs font-semibold text-gray-500">레벨 체계</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                {LADDER.map((l, i) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">{l}</span>
                    {i < LADDER.length - 1 && <span className="text-gray-300">›</span>}
                  </span>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
                국제학교 입시·대치동 빅10 학원 준비까지, <b>전국 어디서나 프렙학원 수준으로.</b>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 진단 리포트 상세 */}
      <section>
        <h2 className="text-2xl font-bold">진단 결과 리포트에 담기는 것</h2>
        <p className="mt-2 max-w-2xl text-gray-500">숫자 하나로 끝나지 않아요. 왜 이 레벨인지, 무엇을 하면 되는지까지 알려드려요.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REPORT.map((r, i) => (
            <div key={r.t} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{i + 1}</div>
              <h3 className="mt-3 font-bold">{r.t}</h3>
              <p className="mt-1 text-sm text-gray-600">{r.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7개 학습 영역 */}
      <section>
        <h2 className="text-2xl font-bold">매일 오르는 7개 학습 영역</h2>
        <p className="mt-2 max-w-2xl text-gray-500">한 영역만 잘해선 부족해요. 카리니는 7개 영역을 레벨별 코스로 균형 있게 올려요.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOMAINS.map((d) => (
            <div key={d.t} className="rounded-2xl border border-gray-200 bg-white p-5">
              <span className="text-2xl">{d.icon}</span>
              <h3 className="mt-2 font-bold">{d.t}</h3>
              <p className="mt-1 text-sm text-gray-600">{d.d}</p>
            </div>
          ))}
          <div className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white">
            <p className="text-2xl font-extrabold">AI ∞</p>
            <p className="mt-1 text-sm text-brand-100">아이 레벨에 맞춰 매일 새 문제를 무한 생성</p>
          </div>
        </div>
      </section>

      {/* 이용 방법 */}
      <section>
        <h2 className="text-2xl font-bold">이렇게 진행돼요</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {HOW.map((s, i) => (
            <div key={s.t} className="relative rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</div>
              <h3 className="mt-3 font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 시작 수준 가이드 */}
      <section>
        <h2 className="text-2xl font-bold">어떤 수준의 아이가 시작하면 좋을까요?</h2>
        <p className="mt-2 max-w-2xl text-gray-500">
          카리니는 <b>파닉스를 뗀 초등부터 상위권 레테를 준비하는 중등까지</b> 단계별로 맞춰 시작합니다. 아이의 현재 신호를 보고 맞는 단계를 찾아보세요.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {LEVELS.map((lv) => (
            <div key={lv.band} className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lv.icon}</span>
                <div>
                  <h3 className="font-bold">{lv.band}</h3>
                  <p className="text-xs text-gray-400">{lv.who}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500">이런 신호가 보이면</p>
                <ul className="mt-1 space-y-1 text-sm text-gray-700">
                  {lv.signals.map((s) => (
                    <li key={s} className="flex gap-2"><span className="text-brand-400">•</span>{s}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-700">{lv.start}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-gray-300 p-5">
          <p className="text-sm text-gray-600"><b>잘 모르겠다면?</b> 시작 위치를 함께 찾아드려요. 인증 튜터가 아이 수준을 진단하고 맞는 단계부터 시작합니다.</p>
          <Link href="/tutors" className="ml-auto rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">튜터 찾기 →</Link>
        </div>
      </section>

      {/* 성장 로드맵 */}
      <section>
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-brand-600">📈 학습 센터, 꾸준히 하면</p>
            <h2 className="mt-2 text-2xl font-bold">매일 조금씩, 레벨을 올려가며</h2>
            <p className="mt-2 text-gray-500">꾸준히 학습했을 때 기대되는 변화예요. 성장 속도는 아이마다 다르지만, 방향은 같아요.</p>
          </div>
          <div className="aspect-[2/1] rounded-2xl border border-gray-200 bg-white p-4"><GrowthArt /></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map((t, i) => (
            <div key={t.m} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</div>
              <p className="mt-3 text-xs font-semibold text-brand-600">{t.m}</p>
              <h3 className="font-bold">{t.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{t.desc}</p>
              <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-500">{t.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400">* 성장 속도는 아이마다 달라요. <b>성장 리포트</b>로 실제 변화를 확인할 수 있어요.</p>
      </section>

      {/* 왜 카리니 */}
      <section>
        <h2 className="text-2xl font-bold">왜 카리니일까요?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.t} className="rounded-2xl border border-gray-200 bg-white p-6">
              <span className="text-2xl">{w.icon}</span>
              <h3 className="mt-2 font-bold">{w.t}</h3>
              <p className="mt-1 text-sm text-gray-600">{w.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 성장 리포트 */}
      <section className="grid items-center gap-8 rounded-3xl bg-gray-50 p-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-brand-600">📊 성장 리포트</p>
          <h2 className="mt-2 text-2xl font-bold">변화가 눈에 보여야, 꾸준할 수 있어요</h2>
          <p className="mt-3 text-gray-600">
            매주·매월 <b>또래 백분위</b>, <b>레벨 변화</b>, <b>약점 개선 추이</b>를 부모님 대시보드에서 확인해요. 다음에 무엇을 하면 되는지도 함께 제안해요.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li className="flex gap-2"><span className="text-brand-500">✓</span> 영역별 정답률·소요시간 추이</li>
            <li className="flex gap-2"><span className="text-brand-500">✓</span> 레벨 상승 그래프와 목표 대비 위치</li>
            <li className="flex gap-2"><span className="text-brand-500">✓</span> 다음 학습·레테 대비 AI 제안</li>
          </ul>
        </div>
        <div className="aspect-[2/1] rounded-2xl border border-gray-200 bg-white p-4"><GrowthArt /></div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-bold">자주 묻는 질문</h2>
        <div className="mt-5 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {f.q}
                <span className="text-gray-300 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-12 text-center text-white">
        <h2 className="text-2xl font-extrabold">지금 우리 아이 시작 단계를 확인하세요</h2>
        <p className="mt-2 text-brand-100">진단으로 정확히, 학습으로 꾸준히, 인증 튜터로 실전까지 — 카리니에서.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/tutors" className="rounded-xl bg-white px-5 py-3 font-semibold text-brand-700 hover:bg-brand-50">튜터 찾기</Link>
          <Link href="/pricing" className="rounded-xl border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">요금 안내</Link>
        </div>
      </section>
    </div>
  );
}
