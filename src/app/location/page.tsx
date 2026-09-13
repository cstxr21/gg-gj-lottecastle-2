import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import PageOutro from "@/components/PageOutro";
import SectionHeading from "@/components/SectionHeading";
import LineSpec from "@/components/LineSpec";
import SourceNote from "@/components/SourceNote";
import AboutThisPage from "@/components/AboutThisPage";
import { CONTACT, NEIGHBORHOOD, TRANSIT } from "@/lib/content";
import { residence } from "@/lib/jsonld";

/**
 * 입지환경 `/location` — 11단계. 입지 강점 상세는 **이 페이지에만** 둔다.
 *
 * ⚠️ 길찾기 버튼(MapLinks) 미사용 — 위치는 입지 안내도·약도 이미지와 주소 텍스트로만 안내한다.
 * ⚠️ 현재 이용 가능한 노선과 계획·예정 노선을 **반드시 분리**한다(3단계 factcheck 불일치 항목).
 *    사이트 원본 패널의 '수서 2정거장·강남 4정거장'은 미개통 노선 기준이라
 *    현 경강선 기준 수치와 한 면에 섞으면 소비자 오인이다.
 * ⚠️ 쌍령공원 면적(약 51만㎡)과 쌍령1·2지구 세대수는 3단계에서 게재 제외로 판정 — 쓰지 않는다.
 */
const SITE_PLACE = CONTACT.places.find((p) => p.key === "site")!;

export const metadata: Metadata = {
  title: { absolute: "경기광주역 롯데캐슬 시그니처 2단지 입지환경 | 교통·생활·개발호재" },
  description:
    "경기광주역 롯데캐슬 시그니처 2단지 입지환경. 경강선 경기광주역, 쌍령공원과 생활인프라를 확인하세요.",
  alternates: { canonical: "/location" },
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 경강선 역세권",
    description:
      "경강선 경기광주역에서 판교 4정거장. 쌍령공원 인접, 역세권 복합개발 2029년 완공 목표.",
    url: "/location",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 입지환경 — 경강선 경기광주역 생활권",
      },
    ],
  },
};

export default function LocationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            residence({
              path: "/location",
              name: "경기광주역 롯데캐슬 시그니처 2단지 입지환경",
              description: "경강선 경기광주역 생활권과 쌍령공원 인접 입지.",
            }),
          ),
        }}
      />

      <PageHero title="입지환경" eyebrow="Location" motif="map" path="/location" />

      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] border-b border-line px-6 pt-16 pb-16 sm:px-10 sm:pt-20 sm:pb-20">
          <p className="text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지는 경강선 경기광주역 생활권에 자리합니다. 현재 운행
            중인 노선과 계획 단계의 노선을 나누어 안내드립니다.
          </p>
        </div>
      </section>

      {/* 입지 안내도 — 세로 인포그래픽 무크롭 풀와이드 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 pt-16 sm:px-10">
          <figure>
            <Image
              src="/images/location/gg-gj-lottecastle-2-location-best-location-01.webp"
              alt="경기광주역 롯데캐슬 시그니처 2단지 입지 안내도 — 경강선·수서광주선·GTX-D 광역 노선도"
              width={1160}
              height={1543}
              sizes="(min-width:1280px) 1200px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-[16px] text-muted">
              입지 안내도 — 지역도는 이해를 돕기 위해 제작한 것으로 실제와 차이가 있습니다.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 현재 이용 가능한 교통 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="01" en="Transit Now">
            경강선 경기광주역 교통환경
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            지금 이용할 수 있는 노선은 경강선입니다. 경기광주역에서 판교역까지 4정거장, 강남역까지는
            환승을 포함해 8정거장입니다.
          </p>
          <LineSpec
            className="mt-8"
            numbered={false}
            rows={TRANSIT.current.items.map((i) => ({ label: i.label, value: i.value }))}
          />
        </div>
      </section>

      {/* 계획·예정 노선 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="02" en="Planned">
            계획·예정 노선 — 수서광주선과 GTX-D
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            수서광주선은 아직 개통 전인 예정 노선이고, GTX-D는 국가철도망 구축계획 반영을 목표로
            절차가 진행 중인 계획 노선입니다. 아래 정거장 수는 두 노선이 개통된 경우를 전제한 계획
            기준 수치로, 개통 여부와 시점은 관계기관 결정에 따릅니다.
          </p>
          <LineSpec
            className="mt-8"
            numbered={false}
            rows={TRANSIT.planned.items.map((i) => ({ label: i.label, value: i.value }))}
          />
          <p className="mt-8 text-[17px]">
            광역 접근 소요시간은 신분당선 이용 시 강남에서 판교까지 약 13분, 경강선 이용 시 판교에서
            경기광주까지 약 14분입니다.
          </p>
        </div>
      </section>

      {/* 생활 인프라 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="03" en="Infra">
            생활 인프라 — 공원·체육·학교
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            단지는 쌍령공원과 경계를 맞대고 조성됩니다. 서측으로는 광주시 워터파크와 광주시
            G-스타디움, 광주시민체육관이 있고, 경기도광주종합터미널도 생활권 안에 있습니다.
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

      {/* 개발호재 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="04" en="Development">
            개발호재 — 경기광주역세권 복합개발
          </SectionHeading>
          <div className="mt-8 space-y-5 text-[17px] sm:text-[18px]">
            <p>
              경기광주역 일대에서는 문화·업무·상업 기능을 묶는 역세권 복합개발이 2029년 완공을
              목표로 추진되고 있습니다. 개발계획은 관계기관의 사정에 따라 변경되거나 취소될 수
              있으며, 이는 사업 주체와 무관합니다.
            </p>
            <p>
              쌍령공원은 민간공원 특례사업으로 조성되며, 경기광주역 롯데캐슬 시그니처 2단지는 그
              사업의 두 블록 가운데 한 곳에 들어섭니다.
            </p>
          </div>
        </div>
      </section>

      {/* 현장 위치 약도 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="05" en="Site Map">
            현장 위치
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            현장 주소는 {SITE_PLACE.address}입니다. 견본주택은 현장과 다른 곳에 있으니{" "}
            <a href="/modelhouse" className="underline underline-offset-4 hover:text-bronze">
              견본주택 위치
            </a>
            를 따로 확인해 주세요.
          </p>
          {/* 원본이 560px 폭이라 컨테이너(880px)에 맞춰 늘리면 1.5배 확대되어 흐려진다 —
              실제 폭을 상한으로 두어 업스케일을 막는다 */}
          <figure className="mt-8 max-w-[560px]">
            <Image
              src="/images/location/gg-gj-lottecastle-2-location-site-map-02.webp"
              alt="경기광주역 롯데캐슬 시그니처 2단지 현장 위치 안내도 — 쌍령공원 인접"
              width={560}
              height={440}
              sizes="(min-width:560px) 560px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-[16px] text-muted">
              현장 위치 안내도 — 실제와 차이가 있을 수 있습니다.
            </figcaption>
          </figure>

          <SourceNote
            className="mt-12"
            items={[
              {
                media: "한국경제",
                date: "2026.08.26",
                url: "https://www.hankyung.com/article/202608263783i",
              },
              {
                media: "전문건설신문",
                date: "2026.03.06",
                url: "https://www.kscnews.co.kr/news/articleView.html?idxno=36412",
              },
              {
                media: "문화일보",
                date: "2023.12.05",
                url: "https://www.munhwa.com/news/view.html?no=2023120501032627042002",
              },
              {
                media: "경인일보",
                date: "2025.05.12",
                url: "https://www.kyeongin.com/article/1739202",
              },
            ]}
          />
        </div>
      </section>

      <AboutThisPage topic="입지">
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 경기도 광주시 쌍령동 산 54-29 일대에 자리합니다.
          생활권 철도는 경강선 경기광주역입니다. 현재 운행 중인 경강선을 이용하면 경기광주역에서
          판교역까지 4정거장이며, 강남역까지는 환승을 포함해 8정거장입니다. 신분당선을 이용하면
          강남에서 판교까지 약 13분, 경강선으로 판교에서 경기광주까지 약 14분이 걸립니다.
        </p>
        <p>
          수서광주선은 개통 전인 예정 노선이고 GTX-D는 국가철도망 구축계획 반영을 목표로 절차가 진행
          중인 계획 노선입니다. 두 노선이 개통될 경우 수서역까지 2정거장, 강남역까지 4정거장으로
          계획돼 있으나 개통 여부와 시점은 관계기관 결정에 따릅니다. 경기광주역 일대에서는
          문화·업무·상업 기능을 묶는 역세권 복합개발이 2029년 완공을 목표로 추진되고 있으며, 그 뒤를
          잇는 2단계 사업도 예정돼 있습니다. 개발계획은 관계기관의 사정에 따라 변경되거나 취소될 수
          있으며 이는 사업 주체와 무관합니다.
        </p>
        <p>
          단지는 쌍령공원과 경계를 맞대고 조성됩니다. 쌍령공원은 민간공원 특례사업으로 조성되며,
          경기광주역 롯데캐슬 시그니처 2단지는 그 사업의 두 블록 가운데 한 곳에 들어섭니다. 서측으로
          광주시 워터파크와 광주시 G-스타디움, 광주시민체육관이 있고 경기도광주종합터미널도 생활권
          안에 있습니다. 도보 생활권에는 광주중앙고와 광주푸른초가 위치하며, 인근에 양벌고가
          가칭으로 개교를 앞두고 있습니다. 학교 배정에 관한 사항은 해당 교육청의 결정에 따르며 이는
          사업 주체와 무관합니다.
        </p>
        <p>
          현장 주변 도로는 경충대로와 성남이천로가 지나고, 경안천이 단지 북측으로 흐릅니다. 현장
          주소는 경기 광주시 쌍령동 산 54-29이며, 바로 옆 1단지는 양벌동에 자리해 두 단지가 서로
          다른 블록에 들어섭니다. 광주시청과 이마트도 생활권 범위 안에 있습니다.
        </p>
        <p>
          현장 안내도에는 광주종합운동장과 광주시 워터파크, 광주시민체육관이 단지 서측에 표기돼
          있습니다. 교육시설로는 광주중앙고와 광주푸른초 외에 역동초와 경안중, ICT폴리텍대학이 함께
          표기됩니다. 행정시설로는 쌍령동 행정복지센터가 인근에 있습니다. 주변 주거지로는 광주쌍령
          서희스타힐스와 광주센트럴푸르지오가 자리해 이미 형성된 생활권과 이어집니다.
        </p>
        <p>
          현장과 견본주택은 서로 다른 곳에 있습니다. 견본주택은 경기 광주시 탄벌동 494로 경충대로와
          회안대로에서 접근할 수 있고, 성남 야탑역 인근 분당테마폴리스 1층 107호에서도 홍보관을
          운영합니다. 야탑 홍보관은 성남종합버스터미널과 가깝습니다. 방문 전 예약해 주시면 대기 없이
          상담받으실 수 있으며, 상담은 {CONTACT.tel}로 안내드립니다.
        </p>
      </AboutThisPage>

      <PageOutro />
    </>
  );
}
