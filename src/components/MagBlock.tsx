import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

/**
 * 섹션 매거진 블록 — 8단계 §6. 메인·서브 "이미지+내용" 섹션의 정본.
 *
 * ⚠️ 이미지엔 링크·hover 줌이 없다 — 이동은 linkLabel로만(과거 사양 폐기).
 * ⚠️ 같은 섹션을 "상단 카드 네비 + 하단 텍스트"로 이중 배치하지 않는다. 이 블록 하나로 통합.
 *
 * 이미지 잘림 방지(§5): 컨테이너 비율을 **각 이미지의 실제 비율**(ratio = w/h)에 맞춘다.
 * 고정 aspect(4/3 등)로 묶고 object-cover를 걸면 비율이 다른 컷이 전부 잘린다.
 */
export default function MagBlock({
  no,
  en,
  title,
  image,
  alt,
  ratio,
  href,
  linkLabel,
  reverse = false,
  bg = "bg-surface",
  sizes = "(min-width:1024px) 50vw, 100vw",
  caption,
  placeholder = false,
  children,
}: {
  no?: string;
  en?: string;
  title: string;
  image?: string;
  alt?: string;
  /** 실제 이미지 비율 w/h. placeholder일 때는 박스 비율 */
  ratio?: number;
  href?: Route | { pathname: Route; hash?: string };
  linkLabel?: string;
  reverse?: boolean;
  bg?: string;
  sizes?: string;
  caption?: string;
  /**
   * 사용자 직접 첨부 슬롯 전용(메인 평면도·분양안내·모델하우스 3슬롯 — 10단계 정본).
   * ⚠️ placeholder와 image를 **동시에 주지 않는다** — 교체 누락이 조용히 묻힌다.
   */
  placeholder?: boolean;
  children?: ReactNode;
}) {
  if (placeholder && image) {
    throw new Error(
      "MagBlock: placeholder와 image를 동시에 지정할 수 없다(8단계 §6). 사용자 이미지를 받았으면 placeholder를 제거할 것.",
    );
  }

  const boxStyle = ratio ? { aspectRatio: String(ratio) } : undefined;

  return (
    <section className={bg}>
      <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className={reverse ? "lg:order-2" : ""}>
            {placeholder ? (
              // ⚠️ 문구는 게이트 판정 문자열이다([G10-IMG]가 박스 1개당 1회로 센다).
              //    바꾸거나 박스당 2회 이상 쓰지 말 것.
              <div
                className={`flex items-center justify-center border border-dashed border-line bg-background ${ratio ? "" : "aspect-[4/3]"}`}
                style={boxStyle}
              >
                <span className="text-[15px] text-muted sm:text-[16px]">
                  이미지 준비 중 · 사용자 첨부 예정
                </span>
              </div>
            ) : image ? (
              <figure>
                <div className="relative w-full" style={boxStyle}>
                  <Image
                    src={image}
                    alt={alt ?? title}
                    fill
                    sizes={sizes}
                    className="object-cover"
                  />
                </div>
                {/* 캡션은 이미지 아래 단색 배경에 16px+(§5) */}
                {caption ? (
                  <figcaption className="mt-3 text-[16px] text-muted">{caption}</figcaption>
                ) : null}
              </figure>
            ) : null}
          </div>

          <div className={reverse ? "lg:order-1" : ""}>
            {(no || en) && (
              <p className="flex items-center gap-3">
                {no ? (
                  <span className="font-accent text-[15px] tracking-widest text-bronze italic">
                    {no}
                  </span>
                ) : null}
                {en ? (
                  <span className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">
                    {en}
                  </span>
                ) : null}
              </p>
            )}
            <h2 className="mt-3 font-serif text-[26px] font-bold tracking-[-0.01em] text-ink sm:text-[34px]">
              {title}
            </h2>
            {children ? <div className="mt-6 text-[17px]">{children}</div> : null}
            {href && linkLabel ? (
              <p className="mt-8">
                <Link
                  href={href}
                  className="text-[17px] underline underline-offset-4 hover:text-bronze"
                >
                  {linkLabel}
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
