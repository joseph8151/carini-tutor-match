// 수업 상품(샘플수업 / 정규 패키지) 정의 — 가격을 체크아웃 화면에 하드코딩하지 않고
// 이 파일에서만 관리한다. 실제 운영 전환 시 이 값들을 Admin이 수정 가능한 DB 테이블로
// 옮기고, 아래 조회 함수들의 구현만 그 DB 조회로 교체하면 된다.

export const SAMPLE_LESSON_PRICE = 30000; // 원, 1회
export const SAMPLE_LESSON_DURATION_MIN = 40;

export interface LessonPackageOption {
  id: string;
  label: string;
  lessons: number;
  price: number; // 원
}

export const LESSON_PACKAGES: LessonPackageOption[] = [
  { id: "pkg_4", label: "4회 패키지", lessons: 4, price: 200000 },
  { id: "pkg_8", label: "8회 패키지", lessons: 8, price: 380000 },
  { id: "pkg_10", label: "10회 패키지", lessons: 10, price: 460000 },
  { id: "pkg_12", label: "12회 패키지", lessons: 12, price: 540000 },
];

export function getLessonPackage(id: string): LessonPackageOption | null {
  return LESSON_PACKAGES.find((p) => p.id === id) ?? null;
}
