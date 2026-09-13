import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MagBlock from "@/components/MagBlock";
import InterestForm from "@/components/InterestForm";
import SourceNote from "@/components/SourceNote";
import { RESERVATION_HREF, SITE } from "@/lib/site";
import { CONTACT, SIBLING } from "@/lib/content";
import { homePosts, homePress } from "@/lib/news";
import { homeFaqs } from "@/lib/faq";
import { residence } from "@/lib/jsonld";

/**
 * 메인(`/`) — 10단계.
 *
 * 구성 순서(§구성 순서 정본):
 *   Hero → 인트로 → 섹션 매거진 블록 01~07 → 분양소식 → FAQ → 관심고객등록(폼) → ABOUT → 다크 푸터
 * 배경은 surface(흰) ↔ background(아이보리) 교차, 같은 색 인접 금지, 마지막이 다크 푸터.
 *
 * ⚠️ title을 여기서 주지 않는다 — RootLayout의 title.default가 홈 정본이다(7단계 §1.6).
 *    `{현장명} | 분양 홈페이지`는 10단계 TITLE 정본이며 확정 후 READ-ONLY다.
 * ⚠️ 메인은 **요약 허브**다. 각 섹션은 2~3문장 티저 + 서브 링크까지만 — 상세는 서브가 갖는다.
 * ⚠️ 분양가 금액은 메인 어디에도 적지 않는다(`/sales` 정본).
 */

export const metadata: Metadata = {
  // ⚠️ title은 layout의 title.default가 홈 정본이다(10단계 TITLE · READ-ONLY) — 여기서 주지 않는다.
  description:
    "경기광주역 롯데캐슬 시그니처 2단지 분양안내·방문예약. 광주시 쌍령동 1,249세대. 상담 1800-9570.",
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 아파트 1,249세대",
    description:
      "쌍령공원과 맞닿은 경기 광주시 쌍령동 아파트. 10개동 1,249세대, 전용 59~246㎡ 공급.",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 조감도 — 10개동 1,249세대",
      },
    ],
  },
};

const HERO_STATS = [
  { label: "세대수", value: "1,249세대" },
  { label: "규모", value: "지하 10층 ~ 지상 26층 · 10개동" },
  { label: "전용면적", value: "59㎡ ~ 246㎡" },
  { label: "위치", value: "경기 광주시 쌍령동" },
];

export default function HomePage() {
  const posts = homePosts();
  const press = homePress();
  const faqs = homeFaqs();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            residence({
              path: "/",
              name: "경기광주역 롯데캐슬 시그니처 2단지",
              description:
                "경기도 광주시 쌍령동 산 54-29 일대에 공급되는 아파트. 지하 10층~지상 최고 26층 10개동, 총 1,249세대.",
            }),
          ),
        }}
      />

      {/*
        Hero — 이미지(정적) 채택. 4단계 hero keep 컷(단지 조감 CG).
        높이: 데스크탑 lg:h-screen · 모바일 min-h-[calc(100svh_-_56px)]
        ⚠️ arbitrary 값의 언더스코어는 필수다. 공백이면 클래스가 통째로 무효가 돼 높이가 0이 된다(G10-HEROCSS).
      */}
      <section className="relative min-h-[calc(100svh_-_56px)] lg:h-screen">
        <Image
          src="/images/hero/gg-gj-lottecastle-2-hero-aerial-01.webp"
          alt="경기광주역 롯데캐슬 시그니처 2단지 단지 조감도"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/*
          스크림 — 카피가 앉는 쪽만 덮는다(10단계 §Hero: 헤드는 차분한 배경 위).
          이 조감 CG는 화면 중앙·우측이 밝은 타워 면이라, 스크림 없이는 흰 글자가 타워 위에서
          읽히지 않는다(육안 확인 후 보강). 불투명 바가 아니라 그라디언트라 CG는 그대로 보인다.
        */}
        {/* 상단 — 밝은 하늘 위 흰 헤더 글자 가독 확보 */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/55 to-transparent" />
        {/* 하단 — 모바일은 카피가 화면 대부분을 차지하므로 더 깊게 */}
        <div className="absolute inset-x-0 bottom-0 h-[88%] bg-gradient-to-t from-ink/85 via-ink/55 to-transparent lg:h-2/3 lg:from-ink/75 lg:via-ink/25" />
        {/* 좌측 — 데스크탑에서 헤드가 앉는 좌측 숲 영역을 한 번 더 가라앉힌다 */}
        <div className="absolute inset-y-0 left-0 hidden w-[72%] bg-gradient-to-r from-ink/65 via-ink/25 to-transparent lg:block" />

        <div className="relative mx-auto flex min-h-[calc(100svh_-_56px)] max-w-[1280px] flex-col justify-end px-6 pt-28 pb-16 text-white sm:px-10 lg:h-screen lg:pb-20">
          <p className="flex items-center gap-3">
            <span className="h-px w-8 bg-white/80" />
            <span className="font-accent text-[16px] tracking-[0.3em] italic sm:text-[18px]">
              Gyeonggi Gwangju Station
            </span>
          </p>
          {/* 폭을 제한해 2줄로 떨어뜨린다 — 한 줄로 두면 헤드가 화면을 가로질러 타워 위에 얹힌다 */}
          <h1 className="mt-5 max-w-[12ch] font-serif text-[38px] leading-[1.15] font-semibold tracking-[-0.01em] sm:text-[56px] xl:text-[72px]">
            {SITE.name}
          </h1>
          <p className="mt-5 max-w-[34ch] text-[17px] sm:text-[18px]">
            쌍령공원과 맞닿은 경기 광주시 쌍령동, 지하 10층 ~ 지상 최고 26층 10개동 1,249세대
          </p>

          {/* 핵심지표 — 무거운 불투명 바 대신 헤어라인 행 */}
          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-white/30 pt-6 sm:grid-cols-4">
            {HERO_STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-[15px] text-white/70">{s.label}</dt>
                <dd className="mt-1 text-[17px] font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>

          {/* 히어로 CTA 2개 — 모바일·태블릿 숨김(하단 콜바와 중복) */}
          <div className="mt-10 hidden items-center gap-3 min-[1360px]:flex">
            <Link
              href={RESERVATION_HREF}
              className="tap-target inline-flex items-center bg-bronze px-7 py-4 text-[17px] text-ivory transition-opacity hover:opacity-90"
            >
              관심고객 등록
            </Link>
            <a
              href={CONTACT.telHref}
              aria-label={`전화 상담 ${CONTACT.tel}`}
              className="tap-target inline-flex items-center gap-2 border border-white px-7 py-4 text-[17px] transition-opacity hover:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path d="M6.2 3.5h3l1.6 4-2 1.4a12.5 12.5 0 0 0 6.3 6.3l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
              </svg>
              {CONTACT.tel}
            </a>
          </div>
        </div>
      </section>

      {/* 인트로 — 브랜드 컨셉 한 줄 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 text-center sm:px-10">
          <h2 className="font-serif text-[26px] leading-relaxed font-semibold tracking-[-0.01em] sm:text-[34px]">
            공원을 마당처럼 쓰는 집
          </h2>
          <p className="mt-6 text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지는 쌍령공원과 경계를 맞대고 들어섭니다. 단지 안에서
            생활을 마치고, 문을 나서면 공원과 경기광주역 생활권이 이어집니다.
          </p>
        </div>
      </section>

      {/* 01 — 사업개요 */}
      <MagBlock
        no="01"
        en="Overview"
        title="사업개요"
        image="/images/hero/gg-gj-lottecastle-2-hero-aerial-02-wide.webp"
        alt="경기광주역 롯데캐슬 시그니처 2단지 조감도"
        ratio={1540 / 876}
        bg="bg-background"
        href="/overview"
        linkLabel="사업개요 자세히 보기"
      >
        <p>
          경기 광주시 쌍령동 산 54-29 일대에 들어서는 아파트로, 지하 10층에서 지상 최고 26층까지
          10개동, 총 1,249세대 규모입니다. 시행은 주식회사 쌍령파크개발이 맡습니다.
        </p>
        <p className="mt-4">
          바로 옆 1단지 1,077세대와 이어져 두 블록을 합치면 2,326세대 규모가 됩니다. 입주 예정
          시기는 입주자모집공고 시점 기준으로 안내드립니다.
        </p>
      </MagBlock>

      {/* 02 — 입지환경 */}
      <MagBlock
        no="02"
        en="Location"
        title="입지환경 및 미래가치"
        image="/images/location/gg-gj-lottecastle-2-location-best-location-01.webp"
        alt="경기광주역 롯데캐슬 시그니처 2단지 입지 안내도 — 경강선·수서광주선·GTX-D 노선"
        ratio={1160 / 1543}
        reverse
        bg="bg-surface"
        href="/location"
        linkLabel="입지환경 자세히 보기"
      >
        <p>
          현재 운행 중인 경강선 경기광주역을 이용하면 판교역까지 4정거장입니다. 수서광주선과 GTX-D는
          각각 예정·계획 단계의 노선으로, 개통 여부와 시점은 관계기관 결정에 따릅니다.
        </p>
        <p className="mt-4">
          경기광주역 일대에서는 문화·업무·상업 기능을 묶는 역세권 복합개발이 2029년 완공을 목표로
          추진되고 있습니다.
        </p>
        <SourceNote
          className="mt-8"
          items={[
            {
              media: "한국경제",
              date: "2026.08.26",
              url: "https://www.hankyung.com/article/202608263783i",
            },
            {
              media: "문화일보",
              date: "2023.12.05",
              url: "https://www.munhwa.com/news/view.html?no=2023120501032627042002",
            },
          ]}
        />
      </MagBlock>

      {/* 03 — 프리미엄 */}
      <MagBlock
        no="03"
        en="Premium"
        title="프리미엄"
        image="/images/premium/gg-gj-lottecastle-2-premium-castle-service-01.webp"
        alt="경기광주역 롯데캐슬 시그니처 2단지 캐슬 서비스 안내 — 셔틀버스·다이닝·인도어 골프장"
        ratio={1160 / 2279}
        bg="bg-background"
        href="/premium"
        linkLabel="프리미엄 자세히 보기"
      >
        <p>
          입주민 전용 셔틀버스와 중식·석식 다이닝, 단지 내 실내 인도어 골프장, 관리형 독서실까지
          다섯 가지 주거 서비스를 계획하고 있습니다.
        </p>
        <p className="mt-4">
          세부 사항은 관계사·관계기관 사정에 따라 변경될 수 있어 확정 내용은 입주자모집공고와
          견본주택에서 안내드립니다.
        </p>
      </MagBlock>

      {/* 04 — 단지안내 */}
      <MagBlock
        no="04"
        en="Complex"
        title="단지안내"
        image="/images/location/gg-gj-lottecastle-2-location-site-map-02.webp"
        alt="경기광주역 롯데캐슬 시그니처 2단지 현장 위치 안내도 — 쌍령공원 인접"
        ratio={560 / 440}
        reverse
        bg="bg-surface"
        href="/complex"
        linkLabel="단지안내 자세히 보기"
      >
        <p>
          10개동이 쌍령공원과 경계를 맞대고 배치됩니다. 단지 서측으로 광주시 워터파크와 G-스타디움,
          광주시민체육관이 자리합니다.
        </p>
        <p className="mt-4">
          동 배치와 조경·커뮤니티 구성은 인허가 및 실제 시공 과정에서 변경될 수 있습니다.
        </p>
      </MagBlock>

      {/*
        05 — 평면도: 사용자 직접 첨부 고정 슬롯. 실도면 수령 전이라 **아이소메트릭 절개 일러스트**를 그려 넣었다.
        ⚠️ 4단계에서 keep한 카테고리 이미지를 여기 끌어오지 않는다(서브 전용).
        ⚠️ 처음엔 탑뷰 평면 선화로 그렸다가 폐기했다 — 문 스윙·치수선·방위표·위생기구를 갖추는 순간
           실제 분양 평면도의 관례를 전부 갖게 돼 "이 단지 평면이 이렇다"로 읽힌다. 캡션으로 막을 수준이
           아니라서 도면 관례를 버리고 입체 그림으로 바꿨다. 탑뷰로 되돌리지 말 것.
        선화 언어는 PageHero.tsx와 같다(브론즈 헤어라인 · 격자 배경).
        원본은 scripts/design-boards/floorplan.html — 렌더 폭 1:1(640×480)로 짜고 4배로 뽑는다.
      */}
      <MagBlock
        no="05"
        en="Floor Plan"
        title="평면도"
        image="/images/home/gg-gj-lottecastle-2-home-floorplan-01.webp"
        alt="경기광주역 롯데캐슬 시그니처 2단지 평면도 안내 일러스트 — 거실과 침실, 주방, 발코니를 입체로 그린 주거공간 그림"
        ratio={2560 / 1920}
        caption="이해를 돕기 위한 일러스트이며 실제 평면·인테리어와 다릅니다. 타입별 상세 도면과 면적은 입주자모집공고 기준으로 안내드립니다."
        bg="bg-background"
        href="/floorplan"
        linkLabel="평면도 자세히 보기"
      >
        <p>
          전용 59㎡ 265세대, 84㎡ 843세대, 114㎡ 127세대에 펜트하우스와 복층형이 더해집니다. 가장
          많은 물량은 전용 84㎡입니다.
        </p>
        <p className="mt-4">
          같은 전용면적도 A·B로 평면이 나뉩니다. 타입별 상세 도면과 면적은 입주자모집공고 시점
          기준으로 안내드립니다.
        </p>
      </MagBlock>

      {/*
        06 — 분양안내: 사용자 직접 첨부 고정 슬롯. 공고 전이라 **분양 상담 데스크 선화**를 그려 넣었다.
        ⚠️ 금액·날짜·전화번호는 그림에 넣지 않는다 — 메인 분양가 금지(`/sales` 정본)이고,
           공고 전 일정은 전부 미확정이라 달력에 숫자를 그리면 미확정 일정을 고지한 꼴이 된다.
        원본은 scripts/design-boards/sales.html.
      */}
      <MagBlock
        no="06"
        en="Sales Guide"
        title="분양안내"
        image="/images/home/gg-gj-lottecastle-2-home-sales-01.webp"
        alt="경기광주역 롯데캐슬 시그니처 2단지 분양안내 일러스트 — 입주자모집공고와 계약서, 도장, 열쇠를 그린 분양 상담 데스크"
        ratio={2560 / 1920}
        caption="이해를 돕기 위한 일러스트입니다. 공급금액과 분양 일정은 입주자모집공고 기준으로 안내드립니다."
        bg="bg-surface"
        href="/sales"
        linkLabel="분양가·일정 안내"
      >
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 민영주택으로 공급됩니다. 공급금액과 납부 일정, 공급
          조건은 입주자모집공고 기준으로 안내드립니다.
        </p>
        <p className="mt-4">
          청약 자격과 접수 방법은 한국부동산원 청약홈을 통해 진행되며, 상담이 필요하시면 분양
          상담실로 문의해 주세요.
        </p>
      </MagBlock>

      {/*
        07 — 모델하우스: 사용자 직접 첨부 슬롯. 사용자가 제공한 배너를
        `npm run images -- --user --slot=modelhouse`로 변환해 연결했다(public/images/home/).
        ⚠️ 이미지에 전화번호가 인쇄돼 있으나, 번호는 아래 섹션·푸터·콜바에 HTML 텍스트 + tel: 링크로
           따로 제공한다(이미지 속 번호는 검색엔진이 읽지 못하고 번호 변경 시 재제작이 필요하다).
      */}
      <MagBlock
        no="07"
        en="Model House"
        title="모델하우스"
        image="/images/home/gg-gj-lottecastle-2-home-modelhouse-01.webp"
        alt="경기광주역 롯데캐슬 시그니처 2단지 모델하우스 방문 안내"
        ratio={1586 / 992}
        reverse
        bg="bg-background"
        href="/modelhouse"
        linkLabel="모델하우스 방문 안내"
      >
        <p>
          견본주택은 경기 광주시 탄벌동 494에 있습니다. 성남 야탑역 인근 분당테마폴리스 1층
          107호에서도 홍보관을 운영합니다.
        </p>
        <p className="mt-4">
          사전 예약 후 방문하시면 대기 없이 상담받으실 수 있습니다. 방문 예약과 분양 상담은{" "}
          <a href={CONTACT.telHref} className="font-medium underline underline-offset-4">
            {CONTACT.tel}
          </a>
          로 문의해 주세요.
        </p>
      </MagBlock>

      {/* 분양소식 + 언론 보도 2단 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">News</p>
              <h2 className="mt-3 font-serif text-[26px] font-bold tracking-[-0.01em] sm:text-[34px]">
                분양소식
              </h2>
            </div>
            <Link
              href="/news"
              className="text-[17px] underline underline-offset-4 hover:text-bronze"
            >
              분양소식 더보기
            </Link>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
            {posts.length > 0 ? (
              <ul className="space-y-6">
                {posts.map((p) => (
                  <li key={p.slug} className="border-b border-line pb-6">
                    <p className="text-[15px] text-muted">
                      {p.category} · {p.date}
                    </p>
                    <Link href={`/news/${p.slug}`} className="mt-2 block text-[18px] font-medium">
                      {p.title}
                    </Link>
                    <p className="mt-2 text-[17px] text-muted">{p.summary}</p>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* 보도 0건이면 이 자리는 렌더하지 않는다(빈 섹션 금지) */}
            {press.length > 0 ? (
              <div className={posts.length > 0 ? "" : "lg:col-span-2"}>
                <p className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">Press</p>
                <ul className="mt-5 space-y-5">
                  {press.map((p) => (
                    <li key={p.url} className="border-b border-line pb-5">
                      <p className="text-[15px] text-muted">
                        {p.media} · {p.date}
                      </p>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener"
                        className="mt-2 block text-[18px] font-medium underline underline-offset-4"
                      >
                        {p.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* FAQ 미리보기 — FAQPage JSON-LD는 /faq에만 둔다 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">FAQ</p>
              <h2 className="mt-3 font-serif text-[26px] font-bold tracking-[-0.01em] sm:text-[34px]">
                자주 묻는 질문
              </h2>
            </div>
            <Link
              href="/faq"
              className="text-[17px] underline underline-offset-4 hover:text-bronze"
            >
              전체 질문 보기
            </Link>
          </div>

          <dl className="mt-10 border-t border-line">
            {faqs.map((f) => (
              <div key={f.q} className="border-b border-line py-6">
                <dt className="text-[18px] font-medium text-ink">{f.q}</dt>
                <dd className="mt-3 text-[17px] text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 관심고객등록 — 푸터 바로 위 최종 전환 CTA(ABOUT 직전) */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex h-full flex-col justify-center">
              <p className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">
                Register
              </p>
              <h2 className="mt-3 font-serif text-[26px] font-bold tracking-[-0.01em] sm:text-[34px]">
                관심고객등록
              </h2>
              <p className="mt-6 text-[17px]">
                경기광주역 롯데캐슬 시그니처 2단지의 분양 일정·공급 조건 등 핵심 안내를 관심고객으로
                등록하신 분께 가장 먼저 전해 드립니다. 성함과 연락처만 남겨 주시면 분양 상담실에서
                빠르게 연락드려 안내합니다.
              </p>

              <ul className="mt-8 space-y-3 text-[17px]">
                {[
                  "분양 일정·입주자모집공고 안내",
                  "전용 59㎡ ~ 246㎡ 공급 정보",
                  "모델하우스(견본주택) 방문 예약",
                  "1:1 맞춤 분양 상담",
                ].map((b) => (
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
                  <span className="text-muted">📍 모델하우스</span>
                  <br />
                  <span className="font-medium">경기 광주시 탄벌동 494</span>
                  <br />
                  <span className="text-muted">관람 10:00 ~ 18:00 · 사전 예약 관람</span>
                </p>
                <p>
                  <span className="text-[17px] text-muted">📞 분양문의</span>
                  <br />
                  <a
                    href={CONTACT.telHref}
                    className="font-serif text-[34px] font-bold tracking-tight"
                  >
                    {CONTACT.tel}
                  </a>
                  <br />
                  <span className="text-[17px] text-muted">선 예약 후 방문 안내</span>
                </p>
              </div>
            </div>

            <InterestForm
              location="home_section"
              eyebrow="Reservation Form"
              title="관심고객 등록"
              note="담당자가 확인 후 순차적으로 연락드립니다."
            />
          </div>
        </div>
      </section>

      {/* ABOUT — 푸터 바로 위 마지막 정보 블록. 내부링크 0(순수 요약) */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <p className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">
            About This Page
          </p>
          <h2 className="mt-3 font-serif text-[26px] font-bold tracking-[-0.01em] sm:text-[34px]">
            한눈에 보는 단지 정보
          </h2>

          <div className="mt-8 space-y-6 text-[17px] sm:text-[18px]">
            <p>
              경기광주역 롯데캐슬 시그니처 2단지는 경기도 광주시 쌍령동 산 54-29 일대에 분양하는
              아파트로, 총 1,249세대 규모입니다. 지하 10층에서 지상 최고 26층까지 10개동으로
              구성되며, 쌍령공원과 경계를 맞대고 들어섭니다. 서측으로는 광주시 워터파크와
              G-스타디움, 광주시민체육관이 자리하고, 생활권 철도는 경강선 경기광주역입니다. 현재
              운행 중인 경강선을 이용하면 판교역까지 4정거장이며, 수서광주선과 GTX-D는 각각
              예정·계획 단계의 노선입니다. 도보 생활권에는 광주중앙고와 광주푸른초가 있고,
              경기도광주종합터미널도 가깝습니다. 인근 학교는 위치를 안내한 것으로 학교 배정에 관한
              사항은 해당 교육청의 결정에 따릅니다.
            </p>
            <p>
              주택형은 전용 59㎡부터 246㎡까지로, 전용 59㎡ 265세대, 84㎡ 843세대, 114㎡ 127세대에
              펜트하우스와 복층형이 더해집니다. 물량의 중심은 전용 84㎡입니다. 입주민을 위해서는
              경기광주역까지 오가는 전용 셔틀버스, 전문 식음업체가 운영하는 중식·석식 다이닝, 단지
              내 실내 인도어 골프장, 대치동 그린램프 라이브러리의 관리형 독서실이 계획돼 있습니다.
              다만 이 서비스들은 관계사·관계기관 사정에 따라 변경되거나 취소될 수 있어 확정 내용은
              입주자모집공고와 견본주택에서 확인하셔야 합니다. 사업형태는 개발사업이며, 시공은
              롯데건설 주식회사가 맡습니다. 시행은 주식회사 쌍령파크개발, 신탁은 신한자산신탁
              주식회사가 맡는 관리형 토지신탁 방식입니다.
            </p>
            <p>
              경기광주역 롯데캐슬 시그니처 2단지는 민영주택으로 공급되며, 청약 접수는 한국부동산원
              청약홈을 통해 진행됩니다. 공급금액과 납부 일정, 입주 예정 시기는 입주자모집공고 시점
              기준으로 안내드리며, 자세한 금액은 분양안내에서 확인하실 수 있습니다. 바로 옆 1단지{" "}
              {SIBLING.households.toLocaleString()}세대와 합하면 두 블록을 더해 2,326세대 규모의
              주거 타운을 이룹니다. 모델하우스와 홍보관의 위치, 관람 시간은 모델하우스 안내에서
              확인하실 수 있으며, 방문 예약과 분양 상담은 {CONTACT.tel}로 안내드립니다.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
