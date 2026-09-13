/**
 * 라인 디스플레이 — 8단계 §4.
 * 사업개요·공급정보 등 "라벨/값" 표는 전부 이 컴포넌트로 통일한다.
 * 값(dd)은 17~18px · text-ink · medium — 핵심 정보 가독성(6단계 §A-2).
 */
export type LineSpecRow = {
  label: string;
  value: string;
  /** 하단 ※ 주석으로 나갈 출처가 있는 행 표시용(값 자체엔 출처를 섞지 않는다) */
  note?: string;
};

export default function LineSpec({
  rows,
  numbered = true,
  className = "",
}: {
  rows: readonly LineSpecRow[];
  numbered?: boolean;
  className?: string;
}) {
  return (
    <dl className={`border-t border-line ${className}`}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="flex flex-col gap-1 border-b border-line py-5 sm:flex-row sm:gap-6"
        >
          <dt className="flex shrink-0 items-baseline gap-2 sm:w-40">
            {numbered ? (
              <span className="font-accent text-[15px] text-bronze italic">
                {String(i + 1).padStart(2, "0")}
              </span>
            ) : null}
            <span className="text-[15px] text-muted">{row.label}</span>
          </dt>
          <dd className="text-[17px] font-medium text-ink sm:text-[18px]">
            {row.value}
            {row.note ? (
              <span className="mt-1 block text-[15px] text-muted">{row.note}</span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
