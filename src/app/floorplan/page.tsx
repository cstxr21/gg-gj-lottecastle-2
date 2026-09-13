import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import PageOutro from "@/components/PageOutro";
import SectionHeading from "@/components/SectionHeading";
import AboutThisPage from "@/components/AboutThisPage";
import { UNCONFIRMED, UNIT_MIX } from "@/lib/content";
import { residence } from "@/lib/jsonld";

/**
 * 평면도 `/floorplan` — 11단계.
 *
 * ⚠️ 도면 미공개 현장이다. 평형·구성·치수를 창작하지 않고 타입별 '평면도 준비중'
 *    placeholder를 둔다(Helpful Content·표시광고법). 도면 공개 시 교체한다.
 * ⚠️ 표기: 본문·H2·alt 기본은 `타입`(검색어), 면적 구성을 세는 자리만 `주택형`(공고 용어).
 *    `전용면적`은 그 자체가 실검색어라 `평형`으로 대체하지 않는다.
 * ⚠️ 마감재(재료·적용 위치) 섹션은 홈페이지 제작 시 제외 — 넣지 않는다.
 * ⚠️ 견본주택 인테리어 컷은 /modelhouse 전용 — 여기엔 텍스트 링크로만.
 *
 * 면적표: 2단지 입주자모집공고문이 아직 발행되지 않아 주거공용·공급·기타공용·계약면적의
 * 검증값이 없다. 있는 값(전용면적·세대수)만 표로 싣고 나머지는 "추후 안내"로 둔다 —
 * 1단지 공고문 면적을 끌어오지 않는다(절대규칙 1).
 */
export const metadata: Metadata = {
  title: { absolute: "경기광주역 롯데캐슬 시그니처 2단지 평면도 | 전용 59~246㎡" },
  description:
    "경기광주역 롯데캐슬 시그니처 2단지 평면도. 전용 59~246㎡ 타입별 세대수와 면적 구성을 비교하세요.",
  alternates: { canonical: "/floorplan" },
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 전용 59~246㎡",
    description:
      "전용 59㎡ 265세대, 84㎡ 843세대, 114㎡ 127세대. 타입별 도면은 입주자모집공고 시 공개.",
    url: "/floorplan",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 평면도 — 전용 59~246㎡ 타입 구성",
      },
    ],
  },
};

/** 도면 미공개 타입 placeholder — 라인드로잉 대신 중립 박스 */
function PlanPlaceholder({ label }: { label: string }) {
  return (
    <div className="border border-line">
      <div className="flex aspect-[4/3] items-center justify-center border-b border-dashed border-line bg-background">
        <span className="text-[16px] text-muted">평면도 준비중</span>
      </div>
      <p className="px-4 py-4 text-[17px] font-medium text-ink">{label}</p>
    </div>
  );
}

export default function FloorplanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            residence({
              path: "/floorplan",
              name: "경기광주역 롯데캐슬 시그니처 2단지 평면도",
              description: "전용 59㎡부터 246㎡까지 타입별 세대수와 면적 구성.",
            }),
          ),
        }}
      />

      <PageHero title="평면도" eyebrow="Floor Plan" motif="unit" path="/floorplan" />

      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] border-b border-line px-6 pt-16 pb-16 sm:px-10 sm:pt-20 sm:pb-20">
          <p className="text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지는 전용 59㎡부터 246㎡까지 공급됩니다. 타입별 세대수와
            면적 구성을 안내드리며, 상세 도면은 입주자모집공고 시점에 공개됩니다.
          </p>
        </div>
      </section>

      {/*
        평면도 안내 일러스트 — 메인 05 슬롯과 같은 사용자 첨부 자산.
        ⚠️ 실도면이 아니다. alt·캡션에 일러스트임을 밝히고, 실도면을 받으면 이 자리를 교체한다.
        이 페이지에 이미지 요소가 최소 1개 있어야 "{현장명} 평면도" 통합검색의 이미지 영역 후보에 오른다
        (G14-ALTKW — 파일명은 영문 slug라 한글 쿼리를 못 받고 alt가 유일한 한글 신호).
      */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 pt-16 sm:px-10">
          <figure>
            <Image
              src="/images/home/gg-gj-lottecastle-2-home-floorplan-01.webp"
              alt="경기광주역 롯데캐슬 시그니처 2단지 평면도 안내 일러스트 — 거실과 침실, 주방, 욕실 배치를 그린 주호 평면 선화"
              width={2560}
              height={1920}
              sizes="(min-width:1280px) 1200px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-[16px] text-muted">
              이해를 돕기 위한 평면도 일러스트이며 실제 평면과 다릅니다. 타입별 상세 도면은
              입주자모집공고 기준으로 안내드립니다.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 전용면적 구성 — 면적표 HTML table */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="01" en="Unit Mix">
            전용면적 구성 — 59㎡·84㎡·114㎡ 등 5개 주택형
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            물량의 중심은 전용 84㎡로 843세대입니다. 전용 59㎡가 265세대, 전용 114㎡가 127세대이며
            여기에 펜트하우스와 복층형이 더해져 총 1,249세대를 이룹니다.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <caption className="sr-only">
                경기광주역 롯데캐슬 시그니처 2단지 전용면적별 세대수
              </caption>
              <thead>
                <tr className="border-y border-line">
                  <th scope="col" className="py-4 pr-4 text-[15px] font-medium text-muted">
                    전용면적
                  </th>
                  <th scope="col" className="py-4 pr-4 text-[15px] font-medium text-muted">
                    세대수
                  </th>
                  <th scope="col" className="py-4 pr-4 text-[15px] font-medium text-muted">
                    주거공용·공급·계약면적
                  </th>
                </tr>
              </thead>
              <tbody>
                {UNIT_MIX.rows.map((r) => (
                  <tr key={r.type} className="border-b border-line">
                    <th
                      scope="row"
                      className="py-5 pr-4 text-[17px] font-medium text-ink sm:text-[18px]"
                    >
                      {r.type}
                    </th>
                    <td className="py-5 pr-4 text-[17px] font-medium text-ink sm:text-[18px]">
                      {r.households.toLocaleString()}세대
                    </td>
                    <td className="py-5 pr-4 text-[16px] text-muted">{UNCONFIRMED}</td>
                  </tr>
                ))}
                <tr className="border-b border-line">
                  <th scope="row" className="py-5 pr-4 text-[17px] font-medium text-ink">
                    합계
                  </th>
                  <td className="py-5 pr-4 text-[17px] font-medium text-ink">
                    {UNIT_MIX.total.toLocaleString()}세대
                  </td>
                  <td className="py-5 pr-4" />
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-[16px] text-muted">
            타입별 세대수는 스마트비즈·전문건설신문 보도 기준이며, 주거공용·공급·기타공용·계약면적과
            확정 세대수는 입주자모집공고 기준으로 안내드립니다.
          </p>
        </div>
      </section>

      {/* 타입별 평면도 — 도면 미공개 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="02" en="Plans">
            타입별 평면도 — 전용 59㎡·84㎡·114㎡
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            같은 전용면적이라도 평면이 A·B 등으로 나뉩니다. 서울특별시 장애인 특별공급 공고에는
            59A·59B·84A2·84C·84E 타입이 표기돼 있으나 전체 타입 목록은 아니며, 확정 타입 구성과
            도면은 입주자모집공고 시점에 공개됩니다.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PlanPlaceholder label="전용 59㎡ 타입" />
            <PlanPlaceholder label="전용 84㎡ 타입" />
            <PlanPlaceholder label="전용 114㎡ 타입" />
            <PlanPlaceholder label="전용 159㎡ 펜트하우스" />
            <PlanPlaceholder label="전용 109~246㎡ 복층형" />
          </div>

          <p className="mt-8 text-[16px] text-muted">
            도면이 공개되면 타입별 평면도로 교체해 안내드립니다.
          </p>
        </div>
      </section>

      {/* 안내 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="03" en="Guide">
            공간 확인 안내
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            실제 공간 구성은 견본주택에서 직접 확인하실 수 있습니다. 방문 일정은{" "}
            <a href="/modelhouse" className="underline underline-offset-4 hover:text-bronze">
              견본주택 방문 안내
            </a>
            에서 신청해 주세요.
          </p>
        </div>
      </section>

      <AboutThisPage topic="주택형">
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 전용 59㎡부터 246㎡까지 공급되는 아파트입니다. 전용
          59㎡가 265세대, 전용 84㎡가 843세대, 전용 114㎡가 127세대이며 전용 159㎡ 펜트하우스
          4세대와 전용 109~246㎡ 복층형 10세대가 더해져 총 1,249세대를 이룹니다. 물량의 중심은 전용
          84㎡로 전체의 약 3분의 2를 차지합니다.
        </p>
        <p>
          같은 전용면적이라도 평면은 A·B 등으로 나뉩니다. 서울특별시 장애인 특별공급 기관추천
          공고에는 59A·59B·84A2·84C·84E 타입이 표기돼 있으나 이는 해당 특별공급 대상 주택형이며 전체
          타입 목록은 아닙니다. 타입별 주거공용면적과 공급면적, 기타공용면적과 계약면적, 그리고 확정
          세대수는 입주자모집공고 시점 기준으로 안내드립니다. 평면 도면도 같은 시점에 공개되며, 공개
          전까지는 치수와 실 구성을 안내드리지 않습니다.
        </p>
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 지하 10층에서 지상 최고 26층까지 10개동으로
          구성됩니다. 전용 84㎡가 843세대로 전체의 약 3분의 2를 차지해 국민주택 규모가 공급의
          중심이며, 전용 59㎡ 265세대가 그다음입니다. 전용 114㎡ 이상은 127세대에 펜트하우스와
          복층형을 더해 소수만 공급됩니다. 전용 84㎡와 59㎡가 전체의 대부분을 차지하는 구성이라,
          타입 선택의 폭은 이 두 면적대에서 가장 넓습니다. 실제 공간 구성과 마감 사양은 견본주택에서
          직접 확인하실 수 있으며, 방문 상담은 1800-9570으로 문의해 주세요.
        </p>
      </AboutThisPage>

      <PageOutro />
    </>
  );
}
