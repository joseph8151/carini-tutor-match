import type { LessonPayment } from "../types";

// 결제 Provider 추상화. Toss Payments / PortOne / Stripe 등을 붙일 때는
// 이 인터페이스를 구현하는 새 모듈(예: toss.ts)만 추가하고 getPaymentProvider()의
// 분기만 바꾸면 된다 — 호출부(체크아웃 페이지, 서버 액션)는 변경할 필요가 없다.
export interface PaymentProvider {
  name: string;
  createPayment(payment: LessonPayment): Promise<LessonPayment>;
  confirmPayment(paymentId: string): Promise<LessonPayment>;
  cancelPayment(paymentId: string): Promise<LessonPayment>;
  getPaymentStatus(paymentId: string): Promise<LessonPayment>;
}
