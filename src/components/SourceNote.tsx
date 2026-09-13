/**
 * 출처 주석 — 8단계 §9.
 *
 * 근거 매체를 **본문 문장에 섞지 않고** 모아 두는 자리다(6단계 §C 출처 자백 금지).
 * 섹션 또는 페이지 본문 맨 아래 1개.
 *
 * ⚠️ 다는 대상은 **언론에서 온 서사·호재·시장맥락뿐**이다.
 *    1차 문서(입주자모집공고·건축물대장·지자체 고시)에서 온 확정 fact엔 달지 않는다 —
 *    그건 시점 단서와 공고문 링크로 이미 근거가 선다.
 * ⚠️ items가 비면 **아무것도 렌더하지 않는다**(빈 ※ 금지).
 */
export type SourceItem = {
  media: string;
  /** YYYY.MM.DD */
  date: string;
  url?: string;
};

export default function SourceNote({
  items,
  className = "",
}: {
  items: readonly SourceItem[];
  className?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <p className={`border-t border-line pt-4 text-[15px] text-muted sm:text-[16px] ${className}`}>
      ※ 출처:{" "}
      {items.map((it, i) => (
        <span key={`${it.media}-${it.date}`}>
          {i > 0 ? " · " : ""}
          {it.url ? (
            <a
              href={it.url}
              target="_blank"
              rel="noopener"
              className="underline underline-offset-4"
            >
              {it.media}
            </a>
          ) : (
            it.media
          )}
          ({it.date})
        </span>
      ))}
    </p>
  );
}
