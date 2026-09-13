import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import PageOutro from "@/components/PageOutro";
import SectionHeading from "@/components/SectionHeading";
import LineSpec from "@/components/LineSpec";
import AboutThisPage from "@/components/AboutThisPage";
import { NEIGHBORHOOD, SIBLING, UNCONFIRMED } from "@/lib/content";
import { residence } from "@/lib/jsonld";

/**
 * 단지안내 `/complex` — 11단계.
 *
 * 이미지 분담: 조감 aerial-02-wide는 이 페이지, aerial-01(항공)은 /overview —
 * 같은 컷을 두 서브에 중복 게재하지 않는다(near-duplicate).
 *
 * ⚠️ TITLE 꼬리: 문서 템플릿은 `| 배치도·조경·커뮤니티`지만, 이 현장은 단지배치도·조경계획·
 *    커뮤니티 구성이 **아직 공개되지 않았다**. 없는 콘텐츠를 title로 광고하면 오인 표시라
 *    꼬리를 붙이지 않는다(/premium의 '서비스 확정 전 플레이스홀더 꼬리 삭제'와 같은 판단).
 *    자료가 공개되면 그때 꼬리를 붙인다.
 * ⚠️ 대지면적·연면적·건폐율·용적률·특별공급 배분은 2단지 공고문 미발행이라 전사할 값이 없다.
 *    1단지 공고문 값(양벌동·1,077세대 기준)을 끌어오지 않는다(절대규칙 1).
 */
export const metadata: Metadata = {
  title: { absolute: "경기광주역 롯데캐슬 시그니처 2단지 단지안내" },
  description:
    "경기광주역 롯데캐슬 시그니처 2단지 단지안내. 쌍령공원과 맞닿은 10개동 1,249세대 배치를 살펴보세요.",
  alternates: { canonical: "/complex" },
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 10개동 배치",
    description: "쌍령공원과 경계를 맞댄 10개동 1,249세대. 지하 10층~지상 최고 26층 규모.",
    url: "/complex",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 단지안내 — 공원과 맞닿은 10개동 배치",
      },
    ],
  },
};

export default function ComplexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            residence({
              path: "/complex",
              name: "경기광주역 롯데캐슬 시그니처 2단지 단지안내",
              description: "쌍령공원과 경계를 맞댄 10개동 1,249세대 단지 구성.",
            }),
          ),
        }}
      />

      <PageHero title="단지안내" eyebrow="Complex" motif="plan" path="/complex" />

      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] border-b border-line px-6 pt-16 pb-16 sm:px-10 sm:pt-20 sm:pb-20">
          <p className="text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지는 쌍령공원과 경계를 맞대고 10개동이 배치됩니다.
            확정된 단지 구성 정보를 안내드립니다.
          </p>
        </div>
      </section>

      {/* 단지 전경 — 조감 와이드 컷 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 pt-16 sm:px-10">
          <figure>
            <Image
              src="/images/hero/gg-gj-lottecastle-2-hero-aerial-02-wide.webp"
              alt="경기광주역 롯데캐슬 시그니처 2단지 단지 전경 — 공원과 맞닿은 동 배치"
              width={1540}
              height={876}
              sizes="(min-width:1280px) 1200px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-[16px] text-muted">
              단지 전경 — 이미지는 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 단지 규모 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="01" en="Scale">
            단지 구성 — 10개동 1,249세대
          </SectionHeading>
          <LineSpec
            className="mt-8"
            numbered={false}
            rows={[
              { label: "동수", value: "10개동" },
              { label: "총 세대수", value: "1,249세대" },
              { label: "층수", value: "지하 10층 ~ 지상 최고 26층" },
              { label: "전용면적", value: "59㎡ ~ 246㎡" },
              { label: "단지배치도", value: UNCONFIRMED },
              { label: "커뮤니티 구성", value: UNCONFIRMED },
            ]}
          />
        </div>
      </section>

      {/* 공원 인접 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="02" en="Park">
            쌍령공원과 맞닿은 배치
          </SectionHeading>
          <div className="mt-8 space-y-5 text-[17px] sm:text-[18px]">
            <p>
              경기광주역 롯데캐슬 시그니처 2단지는 쌍령공원과 경계를 맞대고 조성됩니다. 공원은
              민간공원 특례사업으로 조성되며, 단지는 그 사업의 두 블록 가운데 한 곳에 들어섭니다.
            </p>
            <p>
              단지 배치와 조경 계획은 인허가 및 실제 시공 과정에서 변경될 수 있습니다. 확정된
              배치도와 조경 계획은 입주자모집공고 시점 기준으로 안내드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* 주변 환경 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="03" en="Around">
            주변 환경
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            단지 서측으로 광주시 워터파크와 광주시 G-스타디움, 광주시민체육관이 자리합니다. 도보
            생활권에는 광주중앙고와 광주푸른초가 있습니다.
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-3 border-t border-line pt-6 text-[17px] sm:grid-cols-2">
            {NEIGHBORHOOD.facilities.map((f) => (
              <li key={f} className="flex gap-3 border-b border-line pb-3">
                <span aria-hidden="true" className="text-bronze">
                  ·
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[16px] text-muted">{NEIGHBORHOOD.schoolNote}</p>
        </div>
      </section>

      {/* 이웃 단지 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="04" en="Twin Block">
            1단지와 이루는 2,326세대
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            바로 옆 {SIBLING.name}는 {SIBLING.households.toLocaleString()}세대 규모입니다. 두 단지는
            같은 시행사가 추진하는 사업의 1·2블록으로, 합하면 2,326세대가 됩니다. 1단지는 양벌동,
            2단지는 쌍령동에 각각 자리합니다.
          </p>
        </div>
      </section>

      <AboutThisPage topic="단지">
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 경기도 광주시 쌍령동 산 54-29 일대에 10개동으로
          배치되는 아파트입니다. 총 세대수는 1,249세대이며 지하 10층에서 지상 최고 26층까지
          계획됐습니다. 공급 주택형은 전용 59㎡부터 246㎡까지로, 전용 59㎡ 265세대, 전용 84㎡
          843세대, 전용 114㎡ 127세대에 펜트하우스와 복층형이 더해집니다.
        </p>
        <p>
          단지는 쌍령공원과 경계를 맞대고 조성됩니다. 공원은 민간공원 특례사업으로 조성되며 단지는
          그 사업의 두 블록 가운데 한 곳입니다. 서측으로는 광주시 워터파크와 광주시 G-스타디움,
          광주시민체육관이 있고 경기도광주종합터미널도 생활권 안에 있습니다. 도보 생활권에는
          광주중앙고와 광주푸른초가 위치하며, 학교 배정에 관한 사항은 해당 교육청의 결정에 따릅니다.
          바로 옆 경기광주역 롯데캐슬 시그니처 1단지는 1,077세대 규모로 두 블록을 합하면 2,326세대가
          됩니다.
        </p>
        <p>
          입주민을 위해서는 경기광주역까지 오가는 전용 셔틀버스와 전문 식음업체가 운영하는 중식·석식
          다이닝, 단지 내 실내 인도어 골프장, 대치동 그린램프 라이브러리의 관리형 독서실이 계획돼
          있습니다. 다만 이 서비스들은 관계사·관계기관 사정에 따라 변경되거나 취소될 수 있습니다.
          생활권 철도는 경강선 경기광주역이며, 현재 운행 중인 경강선을 이용하면 판교역까지
          4정거장입니다.
        </p>
        <p>
          두 블록은 구성이 다릅니다. 경기광주역 롯데캐슬 시그니처 1단지는 지하 7층에서 지상 32층까지
          7개동 1,077세대로 계획됐고, 2단지는 지하 10층에서 지상 최고 26층까지 10개동 1,249세대로
          계획됐습니다. 1단지가 더 높고 동수가 적은 구성이라면, 2단지는 층수를 낮추고 동수를 늘린
          구성입니다. 1단지의 입주 예정 시기는 2030년 10월이며, 2단지의 입주 예정 시기는 별도로
          안내됩니다.
        </p>
        <p>
          단지배치도와 조경 계획, 커뮤니티 시설 구성은 입주자모집공고 시점 기준으로 안내드립니다.
          대지면적과 연면적, 건폐율과 용적률도 같은 시점에 확정됩니다. 동별 층수와 세대 구성, 주차
          계획 역시 공고 시점에 공개됩니다. 배치와 조경은 인허가 및 실제 시공 과정에서 변경될 수
          있어 확정 내용은 입주자모집공고와 견본주택에서 확인하셔야 합니다. 견본주택은 경기 광주시
          탄벌동 494에 있으며, 단지 관련 상담은 1800-9570으로 문의해 주세요.
        </p>
      </AboutThisPage>

      <PageOutro />
    </>
  );
}
