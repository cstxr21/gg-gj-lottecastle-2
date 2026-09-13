import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

/**
 * 버튼 — 8단계 §1.
 * radius 0(Circle 제외) · 터치 48px 지향 · 라벨 한글 주 + 영문/숫자 보조.
 * 브론즈 버튼 텍스트 14px 미만 금지(6단계 §A-2).
 */
export type ButtonVariant = "primary" | "solid" | "text" | "bronze";

const BASE =
  "tap-target inline-flex items-center justify-center gap-2 text-[17px] transition-opacity";

const VARIANT: Record<ButtonVariant, string> = {
  // 1px 보더 · 투명 배경 · hover opacity
  primary: "border border-current px-5 py-3 hover:opacity-60",
  // 모바일 CTA 통바·폼 제출(풀폭 가능)
  solid: "bg-ink px-5 py-4 text-ivory hover:opacity-90",
  // underline offset 4px · hover 브론즈
  text: "underline underline-offset-4 hover:text-bronze",
  bronze: "bg-bronze px-5 py-4 text-ivory hover:opacity-90",
};

type CommonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: CommonProps & {
  href: Route | { pathname: Route; hash?: string };
  "aria-label"?: string;
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "solid",
  className = "",
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${BASE} ${VARIANT[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/**
 * Circle(어텐션) — 히어로 단일 핵심 전환용 원형 CTA.
 * 이미지 위에 올라가므로 웜톤 원 + 잉크 글자(흰색은 떠 보이고 다크는 묻힌다).
 * 글로우는 motion-safe 한정 — reduced-motion에서는 정지한다(6단계 §B).
 */
export function CircleCta({
  href,
  label,
  sub,
  className = "",
}: {
  href: Route | { pathname: Route; hash?: string };
  label: string;
  sub?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex h-[136px] w-[136px] items-center justify-center rounded-full sm:h-[160px] sm:w-[160px] ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-bronze/40 motion-safe:animate-ping"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-bronze/30 motion-safe:animate-pulse"
      />
      <span className="relative flex h-full w-full flex-col items-center justify-center rounded-full bg-[#e8ddc9] text-ink transition-transform duration-300 group-hover:scale-105">
        <span className="text-[17px] font-medium">{label}</span>
        {sub ? (
          <span className="mt-1 font-accent text-[14px] tracking-[0.2em] italic">{sub}</span>
        ) : null}
      </span>
    </Link>
  );
}
