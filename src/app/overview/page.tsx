import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import PageOutro from "@/components/PageOutro";
import SectionHeading from "@/components/SectionHeading";
import LineSpec from "@/components/LineSpec";
import AboutThisPage from "@/components/AboutThisPage";
import { PARTIES, PROJECT, SIBLING } from "@/lib/content";
import { residence } from "@/lib/jsonld";

/**
 * 사업개요 `/overview` — 11단계.
 *
 * 들어가는 것: 대표 단지 조감(항공) 쇼케이스 · 사업 개요 LineSpec · 건축 규모 · 사업주체
 * 들어가면 안 되는 것: 투시도 갤러리(→/complex) · 조경/커뮤니티/배치도 · 평면 상세
 * 🚫 구내용 이동통신설비(구내중계설비) 안내는 내용·이미지 모두 넣지 않는다 —
 *    입주자모집공고 PDF에 있어도 구매 판단과 무관한 서류상 고지라 웹사이트로 옮기지 않는다.
 *
 * 이미지 분담: 조감 aerial-01(항공)은 이 페이지, aerial-02-wide는 /complex —
 * 같은 컷을 두 서브에 중복 게재하지 않는다(near-duplicate).
 */
export const metadata: Metadata = {
  title: { absolute: "경기광주역 롯데캐슬 시그니처 2단지 사업개요" },
  description:
    "경기광주역 롯데캐슬 시그니처 2단지 사업개요. 광주시 쌍령동 10개동 1,249세대, 전용 59~246㎡, 사업주체를 확인하세요.",
  alternates: { canonical: "/overview" },
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 10개동 1,249세대",
    description:
      "지하 10층~지상 26층 10개동 1,249세대. 전용 59~246㎡, 시행 쌍령파크개발·시공 롯데건설.",
    url: "/overview",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 사업개요 — 10개동 1,249세대 단지 조감도",
      },
    ],
  },
};

export default function OverviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            residence({
              path: "/overview",
              name: "경기광주역 롯데캐슬 시그니처 2단지 사업개요",
              description:
                "지하 10층에서 지상 최고 26층까지 10개동, 총 1,249세대 규모의 아파트 사업 개요.",
            }),
          ),
        }}
      />

      <PageHero title="사업개요" eyebrow="Overview" motif="circle" path="/overview" />

      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] border-b border-line px-6 pt-16 pb-16 sm:px-10 sm:pt-20 sm:pb-20">
          <p className="text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지는 경기도 광주시 쌍령동 산 54-29 일대에 들어서는
            아파트입니다. 지하 10층에서 지상 최고 26층까지 10개동, 총 1,249세대 규모로 공급됩니다.
          </p>
        </div>
      </section>

      {/* 대표 조감(항공) 쇼케이스 — 풀와이드 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 pt-16 sm:px-10">
          <figure>
            <Image
              src="/images/hero/gg-gj-lottecastle-2-hero-aerial-01.webp"
              alt="경기광주역 롯데캐슬 시그니처 2단지 단지 조감도 — 쌍령공원과 맞닿은 10개동 배치"
              width={1632}
              height={1153}
              sizes="(min-width:1280px) 1200px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-[16px] text-muted">
              단지 조감도 — 이미지는 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 브랜드 스토리 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="01" en="Brand">
            공원과 경계를 맞댄 롯데캐슬
          </SectionHeading>
          <div className="mt-8 space-y-5 text-[17px] sm:text-[18px]">
            <p>
              경기광주역 롯데캐슬 시그니처 2단지는 쌍령공원과 경계를 맞대고 조성됩니다. 단지의 한쪽
              면이 공원으로 열려 있어, 동 배치와 보행 동선이 공원 쪽을 향하도록 계획됩니다.
            </p>
            <p>
              바로 옆 {SIBLING.name}와 함께 두 블록에 나뉘어 들어서며, 두 단지를 합하면 2,326세대
              규모가 됩니다. 두 단지는 같은 시행사가 추진하는 쌍령공원 조성 사업의 1·2블록입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 사업 개요 표 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="02" en="Project Data">
            사업 개요 — 1,249세대 · 전용 59~246㎡ · 지하 10층~지상 26층
          </SectionHeading>
          <LineSpec
            className="mt-8"
            rows={PROJECT.map((f) => ({ label: f.label, value: f.value }))}
          />
          <p className="mt-6 text-[16px] text-muted">
            전용면적 구성은 한국경제·스마트비즈 2026년 8월 26일 보도 기준이며, 확정 수치는
            입주자모집공고 기준으로 안내드립니다.
          </p>
        </div>
      </section>

      {/* 건축 규모 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="03" en="Scale">
            건축 규모 — 10개동, 지하 10층부터 지상 최고 26층까지
          </SectionHeading>
          <div className="mt-8 space-y-5 text-[17px] sm:text-[18px]">
            <p>
              경기광주역 롯데캐슬 시그니처 2단지는 10개동으로 구성되며 지상 최고 26층까지
              올라갑니다. 지하는 10개 층으로 계획돼 주차와 부대시설이 지하에 배치됩니다.
            </p>
            <p>
              공급 주택형은 전용 59㎡부터 246㎡까지입니다. 전용 59㎡ 265세대, 84㎡ 843세대, 114㎡
              127세대가 주력이며 여기에 전용 159㎡ 펜트하우스 4세대와 전용 109~246㎡ 복층형 10세대가
              더해져 총 1,249세대를 이룹니다. 타입별 상세 면적과 도면은{" "}
              <a href="/floorplan" className="underline underline-offset-4 hover:text-bronze">
                타입별 평면도
              </a>
              에서 안내드립니다.
            </p>
            <p>
              대지면적·연면적·건폐율·용적률은 입주자모집공고 시점 기준으로 안내드립니다. 입주 예정
              시기도 같은 시점에 확정됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 사업 주체 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="04" en="Parties">
            사업 주체 — 시행·시공·신탁
          </SectionHeading>
          <LineSpec
            className="mt-8"
            numbered={false}
            rows={[
              { label: "시행 (시행위탁자)", value: PARTIES.developer.name },
              { label: "시공", value: PARTIES.builder.name },
              { label: "신탁 (시행수탁자)", value: PARTIES.trustee.name },
            ]}
          />
          <p className="mt-6 text-[16px] text-muted">
            관리형 토지신탁 방식으로 진행되며, 사업 주체는 입주자모집공고 기준으로 확정 안내됩니다.
          </p>
        </div>
      </section>

      <AboutThisPage topic="사업개요">
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 경기도 광주시 쌍령동 산 54-29 일대에 공급되는
          아파트입니다. 지하 10층에서 지상 최고 26층까지 10개동으로 구성되며 총 세대수는
          1,249세대입니다. 단지는 쌍령공원과 경계를 맞대고 들어서며, 서측으로 광주시 워터파크와
          G-스타디움, 광주시민체육관이 자리합니다. 생활권 철도는 경강선 경기광주역입니다. 사업형태는
          개발사업입니다.
        </p>
        <p>
          공급 주택형은 전용 59㎡부터 246㎡까지입니다. 전용 59㎡가 265세대, 전용 84㎡가 843세대,
          전용 114㎡가 127세대로 물량의 중심은 전용 84㎡입니다. 여기에 전용 159㎡ 펜트하우스 4세대와
          전용 109~246㎡ 복층형 10세대가 더해집니다. 같은 전용면적이라도 평면이 A·B로 나뉘며, 타입별
          상세 면적과 도면은 입주자모집공고 시점에 공개됩니다. 대지면적·연면적·건폐율·용적률 역시
          같은 시점 기준으로 안내드립니다.
        </p>
        <p>
          시행은 주식회사 쌍령파크개발이 맡고 시공은 롯데건설 주식회사가 담당합니다. 신탁은
          신한자산신탁 주식회사가 맡는 관리형 토지신탁 방식으로, 시행위탁자가 시행수탁자에게 시행을
          위탁해 진행하는 구조입니다. 바로 옆 경기광주역 롯데캐슬 시그니처 1단지는 1,077세대
          규모이며 양벌동에 자리합니다. 쌍령동의 2단지와 합하면 두 블록을 더해 2,326세대가 됩니다.
          두 단지는 같은 시행사가 추진하는 쌍령공원 민간공원 특례사업의 1·2블록입니다.
        </p>
        <p>
          경기광주역 롯데캐슬 시그니처 2단지의 생활권 철도는 경강선 경기광주역입니다. 현재 운행 중인
          경강선을 이용하면 경기광주역에서 판교역까지 4정거장이며, 강남역까지는 환승을 포함해
          8정거장입니다. 수서광주선과 GTX-D는 각각 예정·계획 단계의 노선으로 개통 여부와 시점은
          관계기관 결정에 따릅니다. 견본주택은 경기 광주시 탄벌동 494에 있고, 성남 야탑역 인근
          분당테마폴리스 1층 107호에서도 홍보관을 운영합니다.
        </p>
        <p>
          공급금액과 납부 일정, 청약 자격과 접수 방법은 입주자모집공고 기준으로 안내드립니다. 입주
          예정 시기도 같은 시점에 확정되며, 입주 일자는 공정에 따라 변동될 수 있어 확정 후 개별
          통보됩니다. 분양 상담과 방문 예약은 1800-9570으로 문의해 주세요.
        </p>
      </AboutThisPage>

      <PageOutro />
    </>
  );
}
