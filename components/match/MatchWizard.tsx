"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CHILD_AGE_OPTIONS,
  DAY_OPTIONS,
  ENGLISH_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  LESSONS_PER_WEEK_OPTIONS,
  LESSON_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  MATCH_STEP_SCHEMAS,
  MATCH_STEP_TITLES,
  TIME_OPTIONS,
  TUTOR_PREFERENCE_OPTIONS,
  matchRequestSchema,
} from "@/lib/match";
import { submitMatchRequest } from "@/lib/actions";

type FormState = {
  child_age: string;
  child_grade: string;
  english_level: string;
  goals: string[];
  location: string;
  lesson_type: "" | "visit" | "online" | "either";
  lessons_per_week: string;
  preferred_days: string[];
  preferred_times: string[];
  tutor_preference: "none" | "female" | "male" | "native";
  requested_tutor_id?: string;
  requested_tutor_name?: string;
  notes: string;
  parent_name: string;
  mobile: string;
};

function initialState(tutorId?: string, tutorName?: string): FormState {
  return {
    child_age: "",
    child_grade: "",
    english_level: "",
    goals: [],
    location: "",
    lesson_type: "",
    lessons_per_week: "",
    preferred_days: [],
    preferred_times: [],
    tutor_preference: "none",
    requested_tutor_id: tutorId,
    requested_tutor_name: tutorName,
    notes: "",
    parent_name: "",
    mobile: "",
  };
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-softgray bg-white text-charcoal/70 hover:border-brand-300"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold text-brand-700">{label}</p>
      {children}
    </div>
  );
}

export function MatchWizard({ tutorId, tutorName }: { tutorId?: string; tutorName?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => initialState(tutorId, tutorName));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function goNext() {
    const schema = MATCH_STEP_SCHEMAS[step];
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, MATCH_STEP_TITLES.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit() {
    const parsed = matchRequestSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await submitMatchRequest(parsed.data);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/match/complete?id=${res.id}`);
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {MATCH_STEP_TITLES.map((title, i) => (
          <div key={title} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i <= step ? "bg-brand-600 text-white" : "bg-softgray text-charcoal/40"
                }`}
              >
                {i + 1}
              </span>
              <span className={`hidden text-[11px] sm:block ${i === step ? "font-semibold text-brand-700" : "text-charcoal/35"}`}>
                {title}
              </span>
            </div>
            {i < MATCH_STEP_TITLES.length - 1 && (
              <span className={`h-px w-8 sm:w-12 ${i < step ? "bg-brand-600" : "bg-softgray"}`} />
            )}
          </div>
        ))}
      </div>

      {form.requested_tutor_name && (
        <p className="mb-5 rounded-xl bg-butter-50 px-4 py-2.5 text-center text-[13px] font-medium text-brand-700">
          {form.requested_tutor_name} 튜터로 매칭 문의 중입니다
        </p>
      )}

      <div className="rounded-3xl border border-softgray bg-warmwhite p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-6">
            <Field label="아이 나이">
              <div className="flex flex-wrap gap-2">
                {CHILD_AGE_OPTIONS.map((o) => (
                  <Pill key={o} active={form.child_age === o} onClick={() => set("child_age", o)}>
                    {o}
                  </Pill>
                ))}
              </div>
            </Field>
            <Field label="학년 / 기관 (예: 6세 어린이집, 초등 2학년)">
              <input
                value={form.child_grade}
                onChange={(e) => set("child_grade", e.target.value)}
                placeholder="예: 초등 2학년"
                className="w-full rounded-xl border border-softgray bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <Field label="현재 영어 수준">
              <div className="flex flex-wrap gap-2">
                {ENGLISH_LEVEL_OPTIONS.map((o) => (
                  <Pill key={o} active={form.english_level === o} onClick={() => set("english_level", o)}>
                    {o}
                  </Pill>
                ))}
              </div>
            </Field>
            <Field label="수업 목표 (복수 선택 가능)">
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((o) => (
                  <Pill key={o} active={form.goals.includes(o)} onClick={() => set("goals", toggle(form.goals, o))}>
                    {o}
                  </Pill>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Field label="지역">
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((o) => (
                  <Pill key={o} active={form.location === o} onClick={() => set("location", o)}>
                    {o}
                  </Pill>
                ))}
              </div>
            </Field>
            <Field label="수업 방식">
              <div className="flex flex-wrap gap-2">
                {LESSON_TYPE_OPTIONS.map((o) => (
                  <Pill key={o.value} active={form.lesson_type === o.value} onClick={() => set("lesson_type", o.value)}>
                    {o.label}
                  </Pill>
                ))}
              </div>
            </Field>
            <Field label="원하는 수업 횟수">
              <div className="flex flex-wrap gap-2">
                {LESSONS_PER_WEEK_OPTIONS.map((o) => (
                  <Pill key={o} active={form.lessons_per_week === o} onClick={() => set("lessons_per_week", o)}>
                    {o}
                  </Pill>
                ))}
              </div>
            </Field>
            <Field label="원하는 요일 (복수 선택 가능)">
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((o) => (
                  <Pill key={o} active={form.preferred_days.includes(o)} onClick={() => set("preferred_days", toggle(form.preferred_days, o))}>
                    {o}
                  </Pill>
                ))}
              </div>
            </Field>
            <Field label="선호 시간대 (복수 선택 가능)">
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((o) => (
                  <Pill key={o} active={form.preferred_times.includes(o)} onClick={() => set("preferred_times", toggle(form.preferred_times, o))}>
                    {o}
                  </Pill>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Field label="선호 튜터">
              <div className="flex flex-wrap gap-2">
                {TUTOR_PREFERENCE_OPTIONS.map((o) => (
                  <Pill key={o.value} active={form.tutor_preference === o.value} onClick={() => set("tutor_preference", o.value)}>
                    {o.label}
                  </Pill>
                ))}
              </div>
            </Field>
            <Field label="추가 요청사항 (선택)">
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                placeholder="아이 성향, 참고하면 좋을 내용을 자유롭게 남겨주세요."
                className="w-full rounded-xl border border-softgray bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="보호자 이름">
                <input
                  value={form.parent_name}
                  onChange={(e) => set("parent_name", e.target.value)}
                  placeholder="이름"
                  className="w-full rounded-xl border border-softgray bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                />
              </Field>
              <Field label="휴대폰 번호">
                <input
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full rounded-xl border border-softgray bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                />
              </Field>
            </div>
          </div>
        )}

        {error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-600">{error}</p>}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-charcoal/50 transition hover:text-charcoal disabled:opacity-0"
          >
            이전
          </button>
          {step < MATCH_STEP_TITLES.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-xl bg-brand-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="rounded-xl bg-brand-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "신청 중..." : "매칭 신청 완료"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
