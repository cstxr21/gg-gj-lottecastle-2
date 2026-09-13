import type { ReactNode } from "react";

/**
 * About 블록 — 11·12·13단계 공통 정본.
 *
 * eyebrow 영문 `About This Page` + H2 `{주제} 한눈에 보기`.
 * ⚠️ About H2에 현장명 접두어를 넣지 않는다 — 현장명은 H1·title·OG·breadcrumb·첫 문단이
 *    이미 받친다. 7개 서브 About에 또 박으면 브랜드 H2 반복 = 키워드 스터핑.
 * ⚠️ **링크 0**(순수 요약). AI 인용 단위(문장)를 링크로 끊지 않는다.
 *    한 문장 = 한 fact로 자기완결하게 쓰고, 첫 문단만 현장명으로 시작한다.
 */
export default function AboutThisPage({
  topic,
  children,
}: {
  /** "{주제} 한눈에 보기"의 주제어 */
  topic: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
        <p className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">
          About This Page
        </p>
        <h2 className="mt-3 font-serif text-[26px] font-bold tracking-[-0.01em] text-ink sm:text-[34px]">
          {topic} 한눈에 보기
        </h2>
        <div className="mt-8 space-y-6 text-[17px] sm:text-[18px]">{children}</div>
      </div>
    </section>
  );
}
