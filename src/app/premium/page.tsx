import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import PageOutro from "@/components/PageOutro";
import SectionHeading from "@/components/SectionHeading";
import AboutThisPage from "@/components/AboutThisPage";
import { PREMIUM, PREMIUM_DISCLAIMER } from "@/lib/content";

/**
 * 프리미엄 `/premium` — 11단계.
 *
 * "이 단지를 왜 사는가"(브랜드·상품·종합 요약)를 다룬다.
 * ⚠️ 입지·단지 상세 워딩을 여기 복제하지 않는다(→/location·/complex, near-duplicate 금지).
 * ⚠️ 원본 CG 패널의 제외 항목: "광주 최초" 단정(표시광고법 입증 자료 없음),
 *    그린램프 라이브러리 합격 실적 수치(제3자 실적·1차 출처 0). 3단계 전사 대장 판정 그대로.
 *
 * 원본 프리미엄 페이지는 HTML 텍스트가 0이고 정보 전량이 CG 패널에 박혀 있었다 —
 * 패널은 섹션 대표 비주얼로 두되, 그 안의 fact는 아래 본문 텍스트로 전사한다(검색·AI는 이미지를 못 읽는다).
 */
export const metadata: Metadata = {
  title: { absolute: "경기광주역 롯데캐슬 시그니처 2단지 프리미엄" },
  description:
    "경기광주역 롯데캐슬 시그니처 2단지 프리미엄. 셔틀버스·다이닝·인도어 골프장·독서실을 만나보세요.",
  alternates: { canonical: "/premium" },
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 주거 서비스 5종",
    description:
      "입주민 전용 셔틀버스, 중·석식 다이닝, 인도어 골프장, 관리형 독서실, 리조트 회원가.",
    url: "/premium",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 프리미엄 — 입주민 주거 서비스 5종",
      },
    ],
  },
};

export default function PremiumPage() {
  return (
    <>
      <PageHero title="프리미엄" eyebrow="Premium" motif="bloom" path="/premium" />

      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] border-b border-line px-6 pt-16 pb-16 sm:px-10 sm:pt-20 sm:pb-20">
          <p className="text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지는 이동과 식사, 여가와 교육을 단지 안에서 잇는 다섯
            가지 주거 서비스를 계획하고 있습니다.
          </p>
        </div>
      </section>

      {/* 서비스 5종 — 패널의 fact를 HTML 텍스트로 전사 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="01" en="Castle Service">
            입주민을 위한 다섯 가지 주거 서비스
          </SectionHeading>

          <div className="mt-10 space-y-10">
            {PREMIUM.map((p, i) => (
              <article key={p.key} className="border-t border-line pt-8">
                <p className="flex items-center gap-3">
                  <span className="font-accent text-[15px] tracking-widest text-bronze italic">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-accent text-[15px] tracking-[0.25em] text-bronze italic">
                    {p.eyebrow}
                  </span>
                </p>
                <h3 className="mt-3 font-serif text-[20px] font-semibold text-ink sm:text-[22px]">
                  {p.title}
                </h3>
                <p className="mt-3 text-[17px] sm:text-[18px]">{p.body}</p>
              </article>
            ))}
          </div>

          <p className="mt-10 border-t border-line pt-6 text-[16px] text-muted">
            {PREMIUM_DISCLAIMER}
          </p>
        </div>
      </section>

      {/* 원본 CG 패널 — 세로 인포그래픽 무크롭 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10">
          <figure>
            <Image
              src="/images/premium/gg-gj-lottecastle-2-premium-castle-service-01.webp"
              alt="경기광주역 롯데캐슬 시그니처 2단지 캐슬 서비스 안내 — 셔틀버스·다이닝·인도어 골프장·독서실·리조트 회원가"
              width={1160}
              height={2279}
              sizes="(min-width:1280px) 1200px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-[16px] text-muted">
              캐슬 서비스 안내 — 이미지는 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 브랜드·상품 요약 (입지·단지는 요약 1~2줄 + 링크만) */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="02" en="Why Here">
            브랜드와 규모
          </SectionHeading>
          <div className="mt-8 space-y-5 text-[17px] sm:text-[18px]">
            <p>
              경기광주역 롯데캐슬 시그니처 2단지는 롯데건설이 시공하는 롯데캐슬 브랜드 단지입니다.
              1,249세대 규모로, 바로 옆 1단지와 합하면 2,326세대의 브랜드 타운을 이룹니다.
            </p>
            <p>
              단지는 쌍령공원과 맞닿아 있고 경강선 경기광주역 생활권에 자리합니다. 교통과 주변
              환경의 구체적인 내용은{" "}
              <a href="/location" className="underline underline-offset-4 hover:text-bronze">
                입지환경 안내
              </a>
              에서 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <AboutThisPage topic="프리미엄">
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 입주민을 위한 다섯 가지 주거 서비스를 계획하고
          있습니다. 첫째는 입주민 전용 셔틀버스로, 경기광주역까지 출퇴근과 이동을 지원합니다. 둘째는
          L 다이닝 서비스로, 전문 식음업체가 운영하는 중식·석식 다이닝을 단지 안에서 제공하는
          구성입니다. 셋째는 단지 내 실내 인도어 골프장으로, 실내 스크린 골프와 함께 실제
          탄도·구질을 확인할 수 있도록 계획됐습니다.
        </p>
        <p>
          넷째는 관리형 독서실입니다. 대치동 그린램프 라이브러리가 단지 내에 입점할 예정입니다.
          다섯째는 롯데리조트 울산의 특별회원가 혜택으로, 해당 리조트는 2027년 7월 오픈이 예정돼
          있습니다. 다섯 가지 서비스는 모두 계획 단계이며, 세부 사항은 관계사 또는 관계기관의 사정에
          따라 변경되거나 취소될 수 있습니다. 확정 내용은 입주자모집공고와 견본주택에서 확인하셔야
          합니다.
        </p>
        <p>
          다섯 서비스는 이동과 식사, 여가와 교육이라는 생활의 네 축을 단지 안에서 잇는 구성입니다.
          셔틀버스는 경기광주역까지의 이동을, 다이닝 서비스는 매일의 식사를, 인도어 골프장은 여가를,
          관리형 독서실은 자녀 교육을 각각 담당합니다. 리조트 회원가 혜택은 단지 밖 여가까지 범위를
          넓힌 항목입니다.
        </p>
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 지하 10층에서 지상 최고 26층까지 10개동, 총 1,249세대
          규모입니다. 시공은 롯데건설 주식회사가 맡는 롯데캐슬 브랜드 단지이며, 시행은 주식회사
          쌍령파크개발, 신탁은 신한자산신탁 주식회사입니다. 바로 옆 경기광주역 롯데캐슬 시그니처
          1단지 1,077세대와 합하면 2,326세대의 브랜드 타운을 이룹니다. 공급 주택형은 전용 59㎡부터
          246㎡까지로 물량의 중심은 전용 84㎡ 843세대입니다.
        </p>
        <p>
          원본 안내물에는 이 다섯 서비스가 2단지만의 구성으로 소개돼 있습니다. 다만 서비스 운영은
          관계사와의 계약과 인허가 절차를 거쳐 확정되므로, 계획 단계의 내용을 확정된 것으로
          안내드리지 않습니다. 실제 시공 시 변경될 수 있는 항목이며, 확정 여부와 운영 조건은
          입주자모집공고와 견본주택에서 확인하셔야 합니다.
        </p>
        <p>
          마감재 사양과 특화 시스템 항목, 커뮤니티 시설 구성은 입주자모집공고 시점 기준으로
          안내드립니다. 확정 전 사양을 안내드리지 않으며, 공고가 게시되면 세부 내용을 함께
          공개합니다. 실제 사양과 공간은 견본주택에서 직접 확인하실 수 있습니다. 분양 상담과 방문
          예약은 1800-9570으로 문의해 주세요.
        </p>
      </AboutThisPage>

      <PageOutro />
    </>
  );
}
