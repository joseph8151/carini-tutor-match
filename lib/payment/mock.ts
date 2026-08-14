import { getLessonPaymentById, updateLessonPayment } from "../store";
import type { PaymentProvider } from "./provider";

// 실제 PG(Toss/PortOne/Stripe 등) 키가 없는 동안 사용하는 자리표시자 Provider.
// "결제 완료" 상태는 confirmPayment()를 명시적으로 호출했을 때만 발생한다 —
// createPayment()만으로는 절대 paid 처리하지 않는다(가짜 성공 금지).
export const mockPaymentProvider: PaymentProvider = {
  name: "mock",

  async createPayment(payment) {
    const updated = await updateLessonPayment(payment.id, { external_ref: `mock_${payment.id}` });
    return updated ?? payment;
  },

  async confirmPayment(paymentId) {
    const updated = await updateLessonPayment(paymentId, { status: "paid" });
    if (!updated) throw new Error(`LessonPayment not found: ${paymentId}`);
    return updated;
  },

  async cancelPayment(paymentId) {
    const updated = await updateLessonPayment(paymentId, { status: "cancelled" });
    if (!updated) throw new Error(`LessonPayment not found: ${paymentId}`);
    return updated;
  },

  async getPaymentStatus(paymentId) {
    const payment = await getLessonPaymentById(paymentId);
    if (!payment) throw new Error(`LessonPayment not found: ${paymentId}`);
    return payment;
  },
};

// 실제 Provider 연동 시: env에 TOSS_SECRET_KEY 등이 설정되어 있으면 그 구현을 반환하도록 분기.
export function getPaymentProvider(): PaymentProvider {
  return mockPaymentProvider;
}
