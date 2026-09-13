import { ButtonLink } from "@/components/Button";
import { RESERVATION_HREF } from "@/lib/site";

/**
 * 서브 하단 전환 CTA — 8단계 §1 · 11단계 §내부링크 시스템.
 *
 * **관심고객 등록 버튼 1개만** 둔다. 그 외 버튼·중복 CTA 금지.
 * 페이지 간 순환은 하단 버튼이 아니라 **본문 맥락 링크(0~2개)**가 담당한다(11~13단계).
 *
 * ⚠️ 밴드 배경은 반드시 밝은 톤(bg-background/bg-surface)이다.
 *    bg-ink 다크 풀폭으로 깔면 바로 아래 다크 푸터(bg-ink)와 같은 색이 인접해
 *    CTA가 푸터처럼 묻힌다(실발생 버그). 밴드는 밝게, 버튼만 어둡게.
 */
export default function PageOutro({
  title = "관심고객으로 등록하시면 분양 일정을 먼저 안내드립니다",
}: {
  title?: string;
}) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1280px] border-t border-line px-6 py-16 text-center sm:px-10 sm:py-20">
        <p className="mx-auto max-w-[30ch] font-serif text-[22px] font-semibold tracking-[-0.01em] text-ink sm:text-[26px]">
          {title}
        </p>
        <div className="mt-8">
          <ButtonLink href={RESERVATION_HREF} variant="solid">
            관심고객 등록
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
