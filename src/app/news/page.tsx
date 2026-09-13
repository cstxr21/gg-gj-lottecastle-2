import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import PageOutro from "@/components/PageOutro";
import SectionHeading from "@/components/SectionHeading";
import AboutThisPage from "@/components/AboutThisPage";
import { POSTS, PRESS } from "@/lib/news";
import { CONTACT } from "@/lib/content";

/**
 * 분양소식 `/news` — 13단계. 색인 페이지.
 *
 * ⚠️ 게재 수량은 **전량**이다 — 발행 글 전부(최대 7편) + 보도 아카이브 전부.
 *    메인은 요약(발행글 3편 + 보도 min(4, 절반))이고 전량은 이 페이지가 소유한다.
 * ⚠️ 13단계에서는 POSTS를 빈 배열로 둔다(샘플·더미 글 0편) — 실제 글은 15-A가 채운다.
 *    여기서 샘플을 넣으면 15-A분과 합쳐져 과발행된다.
 * ⚠️ 보도 근거는 카드 크레딧(매체·날짜·원문 링크)으로만 표기하고,
 *    본문 문장에 "보도에 따르면·알려졌다"류를 쓰지 않는다(6단계 §C).
 * ⚠️ RSS 피드 라우트를 만들지 않는다 — 7편에서 멈추는 사이트라 실익이 없다.
 *    색인은 sitemap + 네이버 서치어드바이저 수집요청으로 처리한다.
 */
export const metadata: Metadata = {
  title: { absolute: "경기광주역 롯데캐슬 시그니처 2단지 분양소식 | 부동산 동향" },
  description:
    "경기광주역 롯데캐슬 시그니처 2단지 분양소식. 공급정보와 언론사 보도자료를 한눈에 확인하세요.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 분양소식",
    description: "1,249세대 공급 정보와 경기광주역 일대 개발 흐름, 언론사 보도자료를 모았습니다.",
    url: "/news",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 분양소식 — 공급정보와 보도자료",
      },
    ],
  },
};

/** 언론사별로 묶고 각 묶음 안에서 최신순 */
function pressByMedia() {
  const map = new Map<string, typeof PRESS>();
  for (const p of PRESS) {
    const list = map.get(p.media) ?? [];
    list.push(p);
    map.set(p.media, list);
  }
  return [...map.entries()]
    .map(([media, items]) => ({
      media,
      items: [...items].sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.items[0].date.localeCompare(a.items[0].date));
}

export default function NewsPage() {
  const groups = pressByMedia();

  return (
    <>
      <PageHero title="분양소식" eyebrow="News" motif="news" path="/news" />

      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] border-b border-line px-6 pt-16 pb-16 sm:px-10 sm:pt-20 sm:pb-20">
          <p className="text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지의 공급 정보와 경기광주역 일대의 개발 흐름을
            전해드립니다. 단지를 다룬 언론사 보도도 함께 모아 두었습니다.
          </p>
        </div>
      </section>

      {/* 발행 글 — 15-A에서 채운다. 0편이면 렌더하지 않는다(빈 섹션 금지) */}
      {POSTS.length > 0 ? (
        <section className="bg-surface">
          <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10">
            <SectionHeading no="01" en="Posts">
              최신 공급정보
            </SectionHeading>
            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              {POSTS.map((p) => (
                <article key={p.slug} className="border-t border-line pt-6">
                  <p className="text-[15px] text-muted">
                    {p.category} · {p.date}
                  </p>
                  <h3 className="mt-2 font-serif text-[20px] font-semibold text-ink sm:text-[22px]">
                    <Link href={`/news/${p.slug}`} className="hover:text-bronze">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-[17px] text-muted">{p.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 언론 보도 아카이브 — 언론사별 H3, 전량 */}
      <section className={POSTS.length > 0 ? "bg-background" : "bg-surface"}>
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no={POSTS.length > 0 ? "02" : "01"} en="Press">
            경기광주역 롯데캐슬 시그니처 2단지 관련 보도자료
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            단지를 다룬 언론사 보도를 매체별로 모았습니다. 제목을 누르면 원문으로 이동합니다.
          </p>

          <div className="mt-10 space-y-10">
            {groups.map((g) => (
              <div key={g.media} className="border-t border-line pt-6">
                <h3 className="font-serif text-[20px] font-semibold text-ink">{g.media}</h3>
                <ul className="mt-4 space-y-4">
                  {g.items.map((p) => (
                    <li key={p.url} className="border-b border-line pb-4">
                      <p className="text-[15px] text-muted">{p.date}</p>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener"
                        className="mt-1 block text-[17px] font-medium text-ink underline underline-offset-4 sm:text-[18px]"
                      >
                        {p.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-10 border-t border-line pt-4 text-[16px] text-muted">
            ※ 보도자료의 저작권은 각 언론사에 있으며, 제목과 게재일만 표기하고 원문으로 연결합니다.
          </p>
        </div>
      </section>

      {/* 운영 방향 */}
      <section className={POSTS.length > 0 ? "bg-surface" : "bg-background"}>
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no={POSTS.length > 0 ? "03" : "02"} en="Notice">
            소식 안내
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            공급금액과 청약 일정 등 확정되지 않은 정보는 입주자모집공고 시점에 안내드립니다. 개별
            상담이 필요하시면 {CONTACT.tel}로 문의해 주세요.
          </p>
        </div>
      </section>

      <AboutThisPage topic="분양소식">
        <p>
          경기광주역 롯데캐슬 시그니처 2단지 분양소식에서는 단지의 공급 정보와 경기광주역 일대의
          개발 흐름을 전해드립니다. 단지는 경기도 광주시 쌍령동 산 54-29 일대에 지하 10층에서 지상
          최고 26층까지 10개동, 총 1,249세대 규모로 공급되는 아파트입니다. 공급 주택형은 전용
          59㎡부터 246㎡까지이며 물량의 중심은 전용 84㎡ 843세대입니다.
        </p>
        <p>
          언론사 보도자료는 매체별로 모아 게재일과 제목을 표기하고 원문으로 연결합니다. 현재
          한국경제, 스마트비즈, 아시아투데이, 전문건설신문, 경인일보, 문화일보 여섯 매체의 보도를
          모아 두었습니다. 보도 시기는 2023년 12월부터 2026년 8월까지 걸쳐 있습니다. 초기 보도는
          쌍령공원 민간공원 특례사업과 경기광주역세권 복합개발 추진 현황을 다루고, 2026년 보도는
          단지의 공급 규모와 타입 구성, 분양 시기를 다룹니다.
        </p>
        <p>
          보도에서 확인된 주요 내용은 지하 10층에서 지상 최고 26층까지 10개동 1,249세대라는 공급
          규모, 전용 59㎡ 265세대·84㎡ 843세대·114㎡ 127세대에 펜트하우스와 복층형이 더해지는 타입
          구성, 그리고 바로 옆 1단지 1,077세대와 합해 2,326세대를 이룬다는 점입니다. 경기광주역
          일대의 역세권 복합개발은 2029년 완공을 목표로 추진되고 있습니다. 보도자료의 저작권은 각
          언론사에 있으며, 본 페이지는 제목과 게재일만 표기하고 본문은 원문으로 연결합니다.
        </p>
        <p>
          공급금액과 청약 자격, 계약 조건과 입주 예정 시기는 입주자모집공고 시점 기준으로
          안내드립니다. 확정 전 수치를 안내드리지 않으며, 공고가 게시되면 내용을 갱신합니다. 개별
          상담과 모델하우스 방문 예약은 {CONTACT.tel}로 문의해 주세요.
        </p>
      </AboutThisPage>

      <PageOutro />
    </>
  );
}
