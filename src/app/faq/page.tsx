import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PageOutro from "@/components/PageOutro";
import SectionHeading from "@/components/SectionHeading";
import AboutThisPage from "@/components/AboutThisPage";
import { faqsByCategory, FAQS } from "@/lib/faq";
import { CONTACT, LEGAL } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * FAQ `/faq` — 13단계. 사이트 FAQ 허브.
 *
 * ⚠️ FAQPage JSON-LD는 **이 페이지에만** 둔다(홈·서브 복제 금지 = 중복 스키마 방지).
 * ⚠️ 아코디언은 `<details>/<summary>`로 만든다 — JS 없이도 답변이 정적 HTML에 남아
 *    네이버 Yeti와 AI가 추출할 수 있다(클라이언트 토글로 감추면 수집 대상에서 빠진다).
 * ⚠️ 같은 질문을 서브페이지에 복제하지 않는다.
 */
export const metadata: Metadata = {
  title: { absolute: "경기광주역 롯데캐슬 시그니처 2단지 FAQ | 자주 묻는 질문" },
  description:
    "경기광주역 롯데캐슬 시그니처 2단지 자주 묻는 질문. 분양·단지·입지·방문예약·계약을 확인하세요.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 자주 묻는 질문",
    description:
      "분양가·청약 일정·주택형·모델하우스 위치 등 21개 질문을 카테고리별로 정리했습니다.",
    url: "/faq",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 FAQ — 자주 묻는 질문",
      },
    ],
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": SITE_URL + "/faq",
  dateModified: LEGAL.lastUpdated,
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  const groups = faqsByCategory();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <PageHero title="FAQ" eyebrow="FAQ" motif="qa" path="/faq" />

      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] border-b border-line px-6 pt-16 pb-16 sm:px-10 sm:pt-20 sm:pb-20">
          <p className="text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지에 대해 자주 묻는 질문을 모았습니다. 확정되지 않은
            항목은 입주자모집공고 시점에 안내드립니다.
          </p>
        </div>
      </section>

      {groups.map((g, gi) => (
        <section key={g.category} className={gi % 2 === 0 ? "bg-surface" : "bg-background"}>
          <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
            <SectionHeading no={String(gi + 1).padStart(2, "0")} en="Q&A">
              {g.category}
            </SectionHeading>

            <div className="mt-8 border-t border-line">
              {g.items.map((f) => (
                <details key={f.q} className="group border-b border-line">
                  <summary className="tap-target flex cursor-pointer list-none items-start gap-4 py-5 text-[17px] font-medium text-ink sm:text-[18px]">
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-bronze transition-transform duration-300 group-open:rotate-45"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    >
                      +
                    </span>
                    <h3 className="text-[17px] font-medium sm:text-[18px]">{f.q}</h3>
                  </summary>
                  <p className="pb-6 pl-8 text-[17px] text-muted sm:text-[18px]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* 추가 문의 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no={String(groups.length + 1).padStart(2, "0")} en="Contact">
            추가 문의
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            여기에 없는 내용은 분양 상담실에서 안내드립니다. 방문 상담을 원하시면{" "}
            <a href="/modelhouse" className="underline underline-offset-4 hover:text-bronze">
              모델하우스 방문예약
            </a>
            을 신청해 주세요.
          </p>
          <p className="mt-8">
            <span className="text-[17px] text-muted">분양문의</span>
            <br />
            <a href={CONTACT.telHref} className="font-serif text-[34px] font-bold tracking-tight">
              {CONTACT.tel}
            </a>
          </p>
        </div>
      </section>

      <AboutThisPage topic="자주 묻는 질문">
        <p>
          경기광주역 롯데캐슬 시그니처 2단지 자주 묻는 질문은 분양 안내, 단지·주택형, 입지·교통,
          방문예약, 계약·입주 다섯 갈래로 나뉩니다. 분양 안내에서는 공급금액과 청약 일정, 청약 접수
          방법과 특별공급을 다룹니다. 공급금액은 입주자모집공고 시점 기준으로 안내드리며, 서울특별시
          복지포털 공고 기준으로 입주자모집공고는 2026년 9월 11일, 인터넷 청약은 2026년 9월 21일,
          당첨 발표는 2026년 10월 1일로 예정돼 있습니다.
        </p>
        <p>
          단지·주택형에서는 총 1,249세대 규모와 10개동 구성, 전용 59㎡부터 246㎡까지의 주택형 구성을
          안내합니다. 입지·교통에서는 경강선 경기광주역 생활권과 계획 단계인 수서광주선·GTX-D를
          구분해 설명합니다. 방문예약에서는 모델하우스 위치와 예약 방법, 관람 시간을 다루며,
          계약·입주에서는 입주 예정 시기와 계약 조건, 사업 주체를 안내합니다.
        </p>
        <p>
          확정되지 않은 항목은 임의로 안내드리지 않고 입주자모집공고 시점에 공개합니다. 분양가와
          청약 자격, 계약 조건, 전매제한, 입주 예정 시기가 여기에 해당합니다. 여기에 없는 내용이나
          개별 상담이 필요하신 경우 {CONTACT.tel}로 문의해 주시면 분양 상담실에서 안내드립니다.
        </p>
      </AboutThisPage>

      <PageOutro />
    </>
  );
}
