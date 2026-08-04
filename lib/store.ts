import type { Inquiry, Message } from "./types";

/**
 * 인앱 문의/메시징 스토어 (MVP: 인메모리).
 * - 연락처 노출 없이 플랫폼 내에서만 대화 → 카톡 이탈 방지의 1차 관문.
 * - 단일 서버 프로세스 기준 유지. 프로덕션은 Supabase inquiries/messages 테이블로 교체 예정.
 *
 * globalThis에 보관해 dev 핫리로드에도 대화가 초기화되지 않도록 함.
 */
interface DB {
  inquiries: Inquiry[];
  messages: Message[];
  seq: number;
}

const g = globalThis as unknown as { __cariniDB?: DB };

function db(): DB {
  if (!g.__cariniDB) {
    g.__cariniDB = seedThreads();
  }
  return g.__cariniDB;
}

// 결정적(deterministic) 타임스탬프 — 빌드/시연 재현성
function seedThreads(): DB {
  const inquiries: Inquiry[] = [
    {
      id: "iq_seed_1",
      parent_id: "demo_parent",
      parent_name: "데모 학부모",
      tutor_id: "tu_1",
      tutor_name: "김서연",
      academy_slug: "mi",
      status: "open",
      created_at: "2026-08-01T09:00:00.000Z",
      last_body: "네, MI 정규반 레테 프랩 상담 가능합니다. 아이 현재 레벨이 어떻게 되나요?",
    },
  ];
  const messages: Message[] = [
    {
      id: "msg_seed_1",
      inquiry_id: "iq_seed_1",
      sender_id: "demo_parent",
      body: "안녕하세요, MI 9월 정규반 레테 대비 프랩 문의드립니다.",
      created_at: "2026-08-01T09:00:00.000Z",
    },
    {
      id: "msg_seed_2",
      inquiry_id: "iq_seed_1",
      sender_id: "tu_1",
      body: "네, MI 정규반 레테 프랩 상담 가능합니다. 아이 현재 레벨이 어떻게 되나요?",
      created_at: "2026-08-01T09:12:00.000Z",
    },
  ];
  return { inquiries, messages, seq: 100 };
}

function nowIso(): string {
  // Date.now()는 워크플로 스크립트에선 제한되지만 앱 런타임에선 정상.
  return new Date().toISOString();
}

export function listInquiriesFor(userId: string): Inquiry[] {
  return db()
    .inquiries.filter((i) => i.parent_id === userId || i.tutor_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getInquiry(id: string): Inquiry | null {
  return db().inquiries.find((i) => i.id === id) ?? null;
}

export function getMessages(inquiryId: string): Message[] {
  return db()
    .messages.filter((m) => m.inquiry_id === inquiryId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function findOpenInquiry(parentId: string, tutorId: string): Inquiry | null {
  return (
    db().inquiries.find(
      (i) => i.parent_id === parentId && i.tutor_id === tutorId && i.status !== "closed",
    ) ?? null
  );
}

export function createInquiry(input: {
  parentId: string;
  parentName: string;
  tutorId: string;
  tutorName: string;
  academySlug?: string;
  body: string;
}): Inquiry {
  const d = db();
  const existing = findOpenInquiry(input.parentId, input.tutorId);
  if (existing) {
    addMessage({ inquiryId: existing.id, senderId: input.parentId, body: input.body });
    return existing;
  }
  const iq: Inquiry = {
    id: `iq_${++d.seq}`,
    parent_id: input.parentId,
    parent_name: input.parentName,
    tutor_id: input.tutorId,
    tutor_name: input.tutorName,
    academy_slug: input.academySlug,
    status: "open",
    created_at: nowIso(),
    last_body: input.body,
  };
  d.inquiries.push(iq);
  addMessage({ inquiryId: iq.id, senderId: input.parentId, body: input.body });
  return iq;
}

export function addMessage(input: {
  inquiryId: string;
  senderId: string;
  body: string;
}): Message {
  const d = db();
  const msg: Message = {
    id: `msg_${++d.seq}`,
    inquiry_id: input.inquiryId,
    sender_id: input.senderId,
    body: input.body,
    created_at: nowIso(),
  };
  d.messages.push(msg);
  const iq = d.inquiries.find((i) => i.id === input.inquiryId);
  if (iq) iq.last_body = input.body;
  return msg;
}
