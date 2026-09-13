import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import LineSpec from "@/components/LineSpec";
import AboutThisPage from "@/components/AboutThisPage";
import InterestForm from "@/components/InterestForm";
import { CONTACT, MODEL_HOUSE } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * 모델하우스 `/modelhouse` — 12단계.
 *
 * 구성: 히어로 → 2단(좌 Modelhouse Information / 우 Reservation Form) → 위치안내 표
 *      → 갤러리(약도) → 관람 3STEP → 분양상담 → FAQ 링크 → About
 *
 * ⚠️ 하단 관심고객등록 섹션을 두지 않는다 — 상단 예약 폼(#reservation) + 고정 헤더 CTA로
 *    전환을 단일화한다. 두꺼운 관심고객등록 블록은 메인 1곳에만(10단계).
 *    그래서 이 페이지에는 PageOutro도 두지 않는다(하단 CTA 띠 신설 0).
 * ⚠️ 표기 통일: 본문 기본은 **모델하우스**(검색어), `견본주택`은 좌측 소개 첫 줄에서 1회만 병기.
 *    모집공고를 직접 인용하는 자리만 원문 용어를 쓴다.
 * ⚠️ 길찾기 버튼(MapLinks) 미사용 — 위치는 주소 텍스트 + 약도 + LocalBusiness JSON-LD로.
 * ⚠️ 지번 전체(`MH.address`)는 **역할이 다른 4곳에만** 노출한다 — ①좌측 📍 위치 안내(NAP),
 *    ②위치안내 섹션 단답 문장(생성형 검색 인용용), ③3곳 비교 표, ④About 요약.
 *    인트로·figcaption·alt에는 시·동 또는 랜드마크까지만 쓴다(같은 지번 반복 = 스터핑).
 *    새로 주소를 쓸 일이 생기면 문자열을 박지 말고 `MH.address`를 참조한다.
 * ⚠️ E-모델하우스/360° VR 자산이 없으므로 해당 문구·링크를 넣지 않는다(없는 기능 안내 = 허위).
 * ⚠️ 관람시간은 견본주택 범용 기본값 10:00~18:00 — 모집공고의 계약/유상옵션 방문 시간과 별개다.
 */
const MH = CONTACT.places.find((p) => p.key === "modelhouse")!;
const GALLERY = CONTACT.places.find((p) => p.key === "gallery")!;
const SITE_PLACE = CONTACT.places.find((p) => p.key === "site")!;

export const metadata: Metadata = {
  title: { absolute: "경기광주역 롯데캐슬 시그니처 2단지 모델하우스 | 방문예약·분양상담" },
  description: `경기광주역 롯데캐슬 시그니처 2단지 모델하우스 방문예약. ${MH.address}. 상담 ${CONTACT.tel}.`,
  alternates: { canonical: "/modelhouse" },
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 모델하우스 예약",
    description: `모델하우스 관람 ${MODEL_HOUSE.hours} · ${MODEL_HOUSE.hoursNote}으로 운영합니다. 방문예약 후 1:1 분양 상담.`,
    url: "/modelhouse",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 모델하우스 — 방문 안내",
      },
    ],
  },
};

/**
 * NAP(이름·주소·전화) 구조화 데이터 — **이 페이지 1곳에만** 둔다(다른 페이지 복제 금지).
 * 페이지에 실제로 보이는 주소·전화와 1:1로 일치시킨다(미노출 정보 단독 표기 금지).
 * 운영시간은 현장 고지값이 아니라 범용 기본값이라 openingHoursSpecification을 넣지 않는다.
 */
const LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "경기광주역 롯데캐슬 시그니처 2단지 모델하우스",
  url: SITE_URL + "/modelhouse",
  telephone: CONTACT.tel,
  address: {
    "@type": "PostalAddress",
    addressCountry: "KR",
    addressRegion: "경기도",
    addressLocality: "광주시",
    streetAddress: "탄벌동 494",
  },
  geo: { "@type": "GeoCoordinates", latitude: MH.lat, longitude: MH.lng },
};

const STEPS = [
  {
    no: "01",
    title: "온라인 방문예약 신청",
    body: "성함과 연락처, 연락 가능한 시간대를 남겨 주세요. 방문이 어려우시면 연락처만 남기셔도 됩니다.",
  },
  {
    no: "02",
    title: "담당자 확인 연락",
    body: "남겨 주신 시간대에 맞춰 담당자가 연락드려 방문 일정을 확정합니다.",
  },
  {
    no: "03",
    title: "모델하우스 방문 · 상담",
    body: "확정된 일정에 방문하시면 평면과 공간 구성을 직접 보시면서 1:1 상담을 받으실 수 있습니다.",
  },
];

const BENEFITS = [
  "실물 모델하우스에서 평면·공간 구성 직접 확인",
  "단지 계획과 주거 서비스 현장 설명",
  "타입별 공급 세대수와 선택 기준 즉시 상담",
  "1:1 맞춤 분양 상담 + 방문 일정 조율",
];

export default function ModelhousePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS) }}
      />

      <PageHero title="모델하우스" eyebrow="Model House" motif="gallery" path="/modelhouse" />

      {/* 2단 — 좌 정보(인트로 역할) / 우 예약 폼 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 py-16 sm:px-10 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex h-full flex-col justify-center">
              <p className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">
                Modelhouse Information
              </p>
              <h2 className="mt-3 font-serif text-[26px] font-bold tracking-[-0.01em] text-ink sm:text-[34px]">
                경기광주역 롯데캐슬 시그니처 2단지 모델하우스
              </h2>
              <p className="mt-4 text-[17px] font-medium text-ink sm:text-[18px]">
                모델하우스(견본주택) · 경기 광주시 탄벌동
              </p>

              <p className="mt-6 text-[17px] sm:text-[18px]">
                도면과 사진으로는 실제 크기와 동선이 잘 가늠되지 않습니다. 모델하우스에 오시면 평면
                구성과 수납, 창을 통해 들어오는 빛까지 직접 보시면서 확인하실 수 있습니다. 아래
                양식으로 방문을 신청해 주시면 담당자가 일정을 잡아 드립니다.
              </p>

              <ul className="mt-8 space-y-3 text-[17px]">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span aria-hidden="true" className="text-bronze">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 space-y-6 border-t border-line pt-8">
                <p className="text-[17px]">
                  <span className="text-muted">📍 위치 안내</span>
                  <br />
                  <span className="font-medium text-ink sm:text-[18px]">{MH.address}</span>
                  <br />
                  <span className="text-muted">
                    관람 {MODEL_HOUSE.hours} · 방문 시 사전 예약 권장
                  </span>
                </p>
                <p>
                  <span className="text-[17px] text-muted">📞 방문·분양 문의</span>
                  <br />
                  <a
                    href={CONTACT.telHref}
                    className="font-serif text-[34px] font-bold tracking-tight"
                  >
                    {CONTACT.tel}
                  </a>
                  <br />
                  <span className="text-[17px] text-muted">
                    선예약 후 방문 안내 · 타입·잔여 현황 상담
                  </span>
                </p>
              </div>
            </div>

            {/* 앵커는 2단 래퍼·좌측 컬럼이 아니라 이 폼 자체에 붙는다 */}
            <InterestForm
              id="reservation"
              location="modelhouse"
              eyebrow="Reservation Form"
              title="방문예약 신청"
              note="담당자가 확인 후 연락드려 방문 일정을 확정합니다. 방문이 어려우시면 연락처만 남겨 주셔도 분양 상담드립니다."
            />
          </div>
        </div>
      </section>

      {/* 위치 안내 — 인용용 한 문장 + 안내 이미지 + 표 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="01" en="Location">
            모델하우스 위치안내
          </SectionHeading>

          {/* 생성형 검색(네이버 AI 등) 인용을 위한 단답형 한 문장 — 표보다 앞에 둔다. */}
          <p className="mt-8 text-[18px] font-medium text-ink sm:text-[20px]">
            경기광주역 롯데캐슬 시그니처 2단지 모델하우스는 {MH.address}에 위치해 있습니다. 방문 전{" "}
            {CONTACT.tel}으로 연락 주시면 대기 없이 상담 안내를 도와드립니다.
          </p>

          <figure className="mt-8">
            <Image
              src="/images/home/gg-gj-lottecastle-2-home-modelhouse-01.webp"
              alt="경기광주역 롯데캐슬 시그니처 2단지 모델하우스 방문 안내"
              width={1586}
              height={992}
              sizes="(min-width:920px) 880px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-[16px] text-muted">
              모델하우스 방문 안내 — 이미지는 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.
            </figcaption>
          </figure>

          <LineSpec
            className="mt-8"
            numbered={false}
            rows={[
              { label: "모델하우스", value: MH.address },
              { label: "홍보관", value: GALLERY.address },
              { label: "현장", value: SITE_PLACE.address },
              { label: "관람 시간", value: `${MODEL_HOUSE.hours} · ${MODEL_HOUSE.hoursNote}` },
              { label: "문의", value: CONTACT.tel },
            ]}
          />
          <p className="mt-6 text-[16px] text-muted">
            경기광주역 롯데캐슬 시그니처 2단지 모델하우스와 현장은 서로 다른 곳에 있습니다. 방문하실
            곳의 주소를 위 표에서 확인해 주세요.
          </p>
        </div>
      </section>

      {/* 갤러리 — 약도 2컷 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10">
          <SectionHeading no="02" en="Gallery">
            모델하우스 안내
          </SectionHeading>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <figure>
              <Image
                src="/images/modelhouse/gg-gj-lottecastle-2-modelhouse-map-01.webp"
                alt="경기광주역 롯데캐슬 시그니처 2단지 모델하우스 위치 안내도 — 광주시 탄벌동 494"
                width={560}
                height={440}
                sizes="(min-width:640px) 560px, 100vw"
                className="h-auto w-full"
              />
              <figcaption className="mt-3 text-[16px] text-muted">
                모델하우스 약도 — 통미로·경충대로 인근
              </figcaption>
            </figure>
            <figure>
              <Image
                src="/images/modelhouse/gg-gj-lottecastle-2-modelhouse-map-02-yatap.webp"
                alt="경기광주역 롯데캐슬 시그니처 2단지 모델하우스 야탑 홍보관 위치 안내도 — 성남시 분당구 야탑역 인근"
                width={560}
                height={440}
                sizes="(min-width:640px) 560px, 100vw"
                className="h-auto w-full"
              />
              <figcaption className="mt-3 text-[16px] text-muted">
                야탑 홍보관 약도 — 수인분당선 야탑역 인근
              </figcaption>
            </figure>
          </div>

          <p className="mt-8 text-[16px] text-muted">
            모델하우스 약도에는 통미로·경충대로·회안대로와 탄벌중·경안초·광주초·광주중,
            경기도광주종합터미널이 표기돼 있습니다. 야탑 홍보관 약도에는 야탑역과
            성남종합버스터미널, 탄천종합운동장이 표기돼 있습니다.
          </p>
        </div>
      </section>

      {/* 관람 예약 3 STEP */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="03" en="How to Visit">
            관람 예약 방법
          </SectionHeading>
          <ol className="mt-10 space-y-8">
            {STEPS.map((s) => (
              <li key={s.no} className="border-t border-line pt-6">
                <p className="font-accent text-[15px] tracking-widest text-bronze italic">{s.no}</p>
                <h3 className="mt-2 font-serif text-[20px] font-semibold text-ink sm:text-[22px]">
                  {s.title}
                </h3>
                <p className="mt-2 text-[17px] sm:text-[18px]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 분양 상담 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="04" en="Consult">
            분양 상담
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지의 공급 조건과 일정이 궁금하시면 분양 상담실에서
            안내드립니다. 공급금액과 청약 자격은{" "}
            <a href="/sales" className="underline underline-offset-4 hover:text-bronze">
              분양안내
            </a>
            에서 확인하실 수 있습니다.
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

      {/* FAQ 링크 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="05" en="FAQ">
            자주 묻는 질문
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            방문과 청약, 공급 조건에 대해 자주 묻는 질문을{" "}
            <a href="/faq" className="underline underline-offset-4 hover:text-bronze">
              자주 묻는 질문
            </a>
            에 모아 두었습니다.
          </p>
        </div>
      </section>

      <AboutThisPage topic="모델하우스">
        <p>
          경기광주역 롯데캐슬 시그니처 2단지 모델하우스는 {MH.address}에 위치해 있습니다. 관람
          시간은 10:00부터 18:00까지이며 사전 예약 관람으로 운영합니다. {GALLERY.address}에서도
          홍보관을 운영하고 있어, 성남 방향에서 오시는 분은 야탑역 인근 홍보관을 이용하실 수
          있습니다. 단지 현장은 {SITE_PLACE.address}로 모델하우스와는 다른 곳에 있습니다.
        </p>
        <p>
          방문은 온라인 예약으로 신청하실 수 있습니다. 성함과 연락처, 연락 가능한 시간대를 남겨
          주시면 담당자가 그 시간대에 맞춰 연락드려 방문 일정을 확정합니다. 확정된 일정에
          모델하우스에 오시면 평면과 공간 구성을 직접 보시면서 1:1 상담을 받으실 수 있습니다. 방문이
          어려우신 경우 연락처만 남겨 주셔도 분양 상담을 도와드립니다. 예약 없이 방문하시면 상담
          대기가 생길 수 있어 사전 예약을 권해 드립니다.
        </p>
        <p>
          모델하우스 약도에는 통미로와 경충대로, 회안대로가 표기돼 있고
          탄벌중·경안초·광주초·광주중과 광주경찰서, 경기도광주종합터미널이 함께 표기됩니다. 야탑
          홍보관 약도에는 야탑역과 성남종합버스터미널, 탄천종합운동장과 NC백화점이 표기돼 있습니다.
          두 곳 모두 대중교통으로 접근하실 수 있으며, 어느 쪽이 편하신지에 따라 방문 장소를
          선택하시면 됩니다.
        </p>
        <p>
          방문 절차는 세 단계입니다. 먼저 온라인으로 방문예약을 신청하시면, 남겨 주신 시간대에 맞춰
          담당자가 연락드려 일정을 확정합니다. 확정된 일정에 모델하우스로 오시면 평면과 공간 구성을
          보시면서 상담을 받으실 수 있습니다. 관람 시간은 10:00부터 18:00까지입니다. 예약 시 남겨
          주시는 정보는 성함과 연락처, 연락 가능한 시간대이며 분양 상담과 방문예약 안내 목적으로만
          이용합니다.
        </p>
        <p>
          야탑 홍보관은 수인분당선 야탑역 인근에 있어 성남 방면에서 오시는 분이 이용하기 편합니다.
          광주 방면에서 오시는 분은 탄벌동 모델하우스가 가깝습니다. 두 곳 모두 같은 번호로 예약하실
          수 있으며, 어느 곳으로 방문하실지는 예약 시 상담 과정에서 정하시면 됩니다.
        </p>
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 지하 10층에서 지상 최고 26층까지 10개동, 총 1,249세대
          규모의 아파트입니다. 공급 주택형은 전용 59㎡부터 246㎡까지이며 물량의 중심은 전용 84㎡
          843세대입니다. 모델하우스에서는 타입별 구성과 선택 기준을 함께 상담받으실 수 있습니다.
          공급금액과 청약 자격, 계약 조건은 입주자모집공고 기준으로 안내드립니다. 방문 예약과 분양
          상담은 1800-9570으로 문의해 주세요.
        </p>
      </AboutThisPage>
    </>
  );
}
