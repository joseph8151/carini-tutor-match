"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/lib/actions";
import type { Message } from "@/lib/types";

export function MessageThread({
  inquiryId,
  initialMessages,
  meId,
}: {
  inquiryId: string;
  initialMessages: Message[];
  meId: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 상대방 메시지 반영을 위한 가벼운 폴링(near-live). Supabase 전환 시 Realtime 구독으로 교체.
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages.length]);

  async function onSubmit(formData: FormData) {
    await sendMessage(formData);
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex max-h-[55vh] min-h-[240px] flex-col gap-2 overflow-y-auto p-4">
        {initialMessages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.body}
                <span
                  className={`mt-1 block text-[10px] ${mine ? "text-brand-100" : "text-gray-400"}`}
                >
                  {new Date(m.created_at).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form ref={formRef} action={onSubmit} className="flex gap-2 border-t border-gray-100 p-3">
        <input type="hidden" name="inquiryId" value={inquiryId} />
        <input
          name="body"
          autoComplete="off"
          placeholder="메시지를 입력하세요…"
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          전송
        </button>
      </form>
    </div>
  );
}
