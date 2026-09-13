import type { ReactNode } from "react";

/**
 * 섹션 헤딩 — 8단계 §3.
 * 브론즈 번호(font-accent italic 15px) + font-serif bold 헤드(26px → sm:34px).
 * `no`는 선택 — 번호 없는 헤딩도 허용한다.
 */
export default function SectionHeading({
  no,
  en,
  children,
  as: As = "h2",
  className = "",
}: {
  no?: string;
  en?: string;
  children: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={className}>
      {(no || en) && (
        <p className="flex items-center gap-3">
          {no ? (
            <span className="font-accent text-[15px] tracking-widest text-bronze italic">{no}</span>
          ) : null}
          {en ? (
            <span className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">
              {en}
            </span>
          ) : null}
        </p>
      )}
      <As className="mt-3 font-serif text-[26px] font-bold tracking-[-0.01em] text-ink sm:text-[34px]">
        {children}
      </As>
    </div>
  );
}
