// 카카오페이 단건결제 연동 (신규 오픈 API).
// 실제 결제창은 ready 응답의 next_redirect_pc_url 로 이동해 표시된다.
// 키(KAKAOPAY_SECRET_KEY) 미설정 시 isKakaoPayConfigured=false → 데모 경로.

const SECRET = process.env.KAKAOPAY_SECRET_KEY;
const CID = process.env.KAKAOPAY_CID || "TC0ONETIME"; // 테스트 CID
const API = "https://open-api.kakaopay.com";

export const isKakaoPayConfigured = Boolean(SECRET);

interface PendingOrder {
  userId: string;
  planId: string;
  tid?: string;
}

const g = globalThis as unknown as { __kakaoOrders?: Map<string, PendingOrder> };
function orders(): Map<string, PendingOrder> {
  return (g.__kakaoOrders ??= new Map());
}

export function getPendingOrder(orderId: string): PendingOrder | undefined {
  return orders().get(orderId);
}

function authHeaders() {
  return { Authorization: `SECRET_KEY ${SECRET}`, "Content-Type": "application/json" };
}

// 결제 준비 → 결제창 URL 반환
export async function kakaoReady(input: {
  orderId: string;
  userId: string;
  planId: string;
  itemName: string;
  amount: number;
  origin: string;
}): Promise<{ redirectUrl: string } | { error: string }> {
  if (!SECRET) return { error: "unconfigured" };
  try {
    const res = await fetch(`${API}/online/v1/payment/ready`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        cid: CID,
        partner_order_id: input.orderId,
        partner_user_id: input.userId,
        item_name: input.itemName,
        quantity: 1,
        total_amount: input.amount,
        tax_free_amount: 0,
        approval_url: `${input.origin}/api/kakaopay/approve?order=${input.orderId}`,
        cancel_url: `${input.origin}/api/kakaopay/cancel?order=${input.orderId}`,
        fail_url: `${input.origin}/api/kakaopay/fail?order=${input.orderId}`,
      }),
    });
    if (!res.ok) return { error: `ready_${res.status}` };
    const data = (await res.json()) as { tid: string; next_redirect_pc_url: string };
    orders().set(input.orderId, { userId: input.userId, planId: input.planId, tid: data.tid });
    return { redirectUrl: data.next_redirect_pc_url };
  } catch {
    return { error: "network" };
  }
}

// 결제 승인 → 승인된 주문 정보 반환
export async function kakaoApprove(
  orderId: string,
  pgToken: string,
): Promise<{ userId: string; planId: string } | { error: string }> {
  const o = orders().get(orderId);
  if (!SECRET || !o?.tid) return { error: "invalid_order" };
  try {
    const res = await fetch(`${API}/online/v1/payment/approve`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        cid: CID,
        tid: o.tid,
        partner_order_id: orderId,
        partner_user_id: o.userId,
        pg_token: pgToken,
      }),
    });
    if (!res.ok) return { error: `approve_${res.status}` };
    orders().delete(orderId);
    return { userId: o.userId, planId: o.planId };
  } catch {
    return { error: "network" };
  }
}
