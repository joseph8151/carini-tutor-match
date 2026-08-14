import Link from "next/link";

export function FinalCta() {
  return (
    <section className="rounded-3xl bg-butter-100 px-6 py-14 text-center sm:px-10">
      <h2 className="font-sans text-2xl font-extrabold text-brand-700 sm:text-3xl">
        우리 아이에게 맞는 선생님,
        <br className="sm:hidden" /> 카리니에서 찾아보세요.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-charcoal/65">
        아이의 나이와 현재 영어 수준을 알려주시면 수업 목표에 맞는 튜터를
        추천해드립니다.
      </p>
      <Link
        href="/match"
        className="mt-7 inline-block rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        튜터 추천받기
      </Link>
    </section>
  );
}
