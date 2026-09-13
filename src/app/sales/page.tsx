import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PageOutro from "@/components/PageOutro";
import SectionHeading from "@/components/SectionHeading";
import LineSpec from "@/components/LineSpec";
import AboutThisPage from "@/components/AboutThisPage";
import {
  CONTACT,
  LEGAL,
  PARTIES,
  PRICE,
  SCHEDULE,
  SUBSCRIPTION_CLOSED,
  UNCONFIRMED,
  UNIT_MIX,
} from "@/lib/content";
import { residence } from "@/lib/jsonld";

/**
 * 분양안내 `/sales` — 12단계. 분양가·청약·일정 상세는 **이 페이지에만** 둔다.
 *
 * 🚫 인지세·부동산 거래신고(신고기한·신고필증) 안내는 내용·표·이미지 모두 넣지 않는다 —
 *    당첨 후 계약 단계에서 계약서와 함께 안내되는 절차 사항이지 방문자가 사이트에서 찾는
 *    정보가 아니다. 홈페이지 유의사항은 분양가·일정 시점 표기 / CG 고지 / 3주체·광고심의필까지.
 * ⚠️ '최저가·확정·완판·직결' 단정과 비교 표현을 쓰지 않는다(표시광고법).
 * ⚠️ 분양가 미공개 → Offer/AggregateOffer JSON-LD를 만들지 않는다(창작 0).
 *
 * 대표 비주얼: 12단계는 미사용 자산을 public/images/sales/로 재활용하라고 하지만,
 * 이 현장은 콘텐츠 자산 7장이 모두 다른 페이지에 배치돼 **재활용할 미사용분이 없다**.
 * 다른 페이지 이미지를 빌려오면 near-duplicate라 이미지를 두지 않고 배치표에 기록했다.
 */
export const metadata: Metadata = {
  title: { absolute: "경기광주역 롯데캐슬 시그니처 2단지 분양안내 | 분양가·청약·일정" },
  description:
    "경기광주역 롯데캐슬 시그니처 2단지 분양가·청약 자격·일정을 입주자모집공고 기준 확인. 상담 1800-9570.",
  alternates: { canonical: "/sales" },
  openGraph: {
    title: "경기광주역 롯데캐슬 시그니처 2단지 민영주택 분양",
    description:
      "1,249세대 민영주택. 분양가·청약 자격·계약 조건은 입주자모집공고 기준으로 안내드립니다.",
    url: "/sales",
    images: [
      {
        url: "/images/og/gg-gj-lottecastle-2-og.jpg",
        width: 1200,
        height: 630,
        alt: "경기광주역 롯데캐슬 시그니처 2단지 분양안내 — 1,249세대 민영주택 공급",
      },
    ],
  },
};

export default function SalesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            residence({
              path: "/sales",
              name: "경기광주역 롯데캐슬 시그니처 2단지 분양안내",
              description: "1,249세대 민영주택 공급 개요와 분양 일정.",
            }),
          ),
        }}
      />

      <PageHero title="분양안내" eyebrow="Sales Guide" motif="doc" path="/sales" />

      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] border-b border-line px-6 pt-16 pb-16 sm:px-10 sm:pt-20 sm:pb-20">
          <p className="text-[17px] sm:text-[18px]">
            경기광주역 롯데캐슬 시그니처 2단지는 민영주택으로 공급됩니다. 공급 개요와 확인된 일정을
            안내드리며, 공급금액과 계약 조건은 입주자모집공고 기준으로 안내드립니다.
          </p>
        </div>
      </section>

      {/* 공급 개요 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="01" en="Supply">
            공급 개요 — 1,249세대 · 전용 59~246㎡
          </SectionHeading>
          <LineSpec
            className="mt-8"
            numbered={false}
            rows={[
              { label: "단지명", value: "경기광주역 롯데캐슬 시그니처 2단지" },
              { label: "대지위치", value: "경기도 광주시 쌍령동 산 54-29 일대" },
              { label: "건축규모", value: "지하 10층 ~ 지상 최고 26층, 10개동" },
              { label: "총 세대수", value: "1,249세대" },
              { label: "전용면적", value: "59㎡ ~ 246㎡" },
              { label: "주택 유형", value: "민영주택" },
            ]}
          />

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <caption className="sr-only">전용면적별 공급 세대수</caption>
              <thead>
                <tr className="border-y border-line">
                  <th scope="col" className="py-4 pr-4 text-[15px] font-medium text-muted">
                    전용면적
                  </th>
                  <th scope="col" className="py-4 pr-4 text-[15px] font-medium text-muted">
                    세대수
                  </th>
                </tr>
              </thead>
              <tbody>
                {UNIT_MIX.rows.map((r) => (
                  <tr key={r.type} className="border-b border-line">
                    <th scope="row" className="py-4 pr-4 text-[17px] font-medium text-ink">
                      {r.type}
                    </th>
                    <td className="py-4 pr-4 text-[17px] font-medium text-ink">
                      {r.households.toLocaleString()}세대
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-[16px] text-muted">
            타입별 세대수는 스마트비즈·전문건설신문 보도 기준이며, 확정 세대수는 입주자모집공고
            기준으로 안내드립니다.
          </p>
        </div>
      </section>

      {/* 분양가 · 청약 자격 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="02" en="Price & Eligibility">
            분양가와 청약 자격
          </SectionHeading>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="border border-line bg-surface p-6">
              <p className="text-[15px] text-muted">분양가</p>
              <p className="mt-2 text-[17px] font-medium text-ink sm:text-[18px]">{PRICE.value}</p>
              <p className="mt-3 text-[16px] text-muted">{PRICE.note}</p>
            </div>
            <div className="border border-line bg-surface p-6">
              <p className="text-[15px] text-muted">청약 자격</p>
              <p className="mt-2 text-[17px] font-medium text-ink sm:text-[18px]">{UNCONFIRMED}</p>
              <p className="mt-3 text-[16px] text-muted">
                거주 요건과 순위 기준은 입주자모집공고에 게재됩니다.
              </p>
            </div>
            <div className="border border-line bg-surface p-6">
              <p className="text-[15px] text-muted">납부 일정</p>
              <p className="mt-2 text-[17px] font-medium text-ink sm:text-[18px]">{UNCONFIRMED}</p>
              <p className="mt-3 text-[16px] text-muted">
                계약금·중도금·잔금 비율도 같은 시점에 공개됩니다.
              </p>
            </div>
            <div className="border border-line bg-surface p-6">
              <p className="text-[15px] text-muted">계약 조건</p>
              <p className="mt-2 text-[17px] font-medium text-ink sm:text-[18px]">{UNCONFIRMED}</p>
              <p className="mt-3 text-[16px] text-muted">
                전매제한과 재당첨 제한도 공고 기준으로 안내드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 분양 일정 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="03" en="Schedule">
            분양 일정
          </SectionHeading>
          {SUBSCRIPTION_CLOSED ? (
            <p className="mt-8 text-[17px] sm:text-[18px]">
              정규 청약이 종료되어 현재 선착순 분양 중입니다. 청약통장과 순위에 관계없이 동·호를
              지정해 계약하실 수 있습니다.
            </p>
          ) : (
            <>
              <p className="mt-8 text-[17px] sm:text-[18px]">
                청약 접수는 한국부동산원 청약홈을 통해 진행됩니다. 아래 일정은 서울특별시 복지포털에
                게재된 기관추천 특별공급 공고 기준이며, 모두 예정 일정입니다.
              </p>
              <LineSpec
                className="mt-8"
                numbered={false}
                rows={SCHEDULE.items.map((i) => ({ label: i.label, value: i.value }))}
              />
              <p className="mt-6 text-[16px] text-muted">{SCHEDULE.sourceNote}</p>
            </>
          )}
        </div>
      </section>

      {/* 사업 주체 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="04" en="Parties">
            사업 주체
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
        </div>
      </section>

      {/* 유의사항 */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="05" en="Notice">
            유의사항
          </SectionHeading>
          <ul className="mt-8 space-y-4 border-t border-line pt-6 text-[17px]">
            <li className="border-b border-line pb-4">{LEGAL.asOfNote}</li>
            <li className="border-b border-line pb-4">{LEGAL.cgNote}</li>
            <li className="border-b border-line pb-4">
              단지 계획과 시설 구성은 인허가 및 실제 시공 과정에서 변경될 수 있습니다.
            </li>
            <li className="border-b border-line pb-4">
              일정은 사업 진행 상황에 따라 변경될 수 있으며, 확정 일정은 입주자모집공고를 확인해
              주세요.
            </li>
          </ul>
        </div>
      </section>

      {/* 분양 상담 */}
      <section className="bg-background">
        <div className="mx-auto max-w-[920px] px-6 py-20 sm:px-10">
          <SectionHeading no="06" en="Consult">
            분양 상담
          </SectionHeading>
          <p className="mt-8 text-[17px] sm:text-[18px]">
            공급 조건과 타입 선택에 대한 상담은 분양 상담실에서 안내드립니다. 실제 공간을 보고
            싶으시면{" "}
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

      <AboutThisPage topic="분양">
        <p>
          경기광주역 롯데캐슬 시그니처 2단지는 경기도 광주시 쌍령동 산 54-29 일대에 공급되는
          민영주택입니다. 총 세대수는 1,249세대이며 지하 10층에서 지상 최고 26층까지 10개동으로
          구성됩니다. 공급 주택형은 전용 59㎡부터 246㎡까지로, 전용 59㎡ 265세대, 전용 84㎡ 843세대,
          전용 114㎡ 127세대에 전용 159㎡ 펜트하우스 4세대와 전용 109~246㎡ 복층형 10세대가
          더해집니다. 물량의 중심은 전용 84㎡입니다.
        </p>
        <p>
          공급금액과 납부 일정은 입주자모집공고 기준으로 안내드립니다. 확정 전 금액을 안내드리지
          않으며, 공고가 게시되면 주택형별 공급금액과 계약금·중도금·잔금 비율을 함께 공개합니다.
          청약 자격과 거주 요건, 순위 기준, 전매제한과 재당첨 제한도 같은 공고에 게재됩니다. 청약
          접수는 한국부동산원 청약홈을 통해 진행되며, 청약 자격과 접수 방법에 대한 문의는 청약홈
          콜센터에서도 안내받으실 수 있습니다.
        </p>
        <p>
          서울특별시 복지포털에 게재된 기관추천 특별공급 공고 기준으로 입주자모집공고는 2026년 9월
          11일, 인터넷 청약은 2026년 9월 21일, 당첨 발표는 2026년 10월 1일로 예정돼 있습니다. 모두
          예정 일정이며 사업 진행 상황에 따라 변경될 수 있습니다. 계약 일정과 입주 예정 시기는
          입주자모집공고 시점 기준으로 안내드립니다.
        </p>
        <p>
          특별공급도 함께 진행됩니다. 서울특별시 복지포털에 게재된 기관추천 특별공급 공고에 따르면
          서울시 장애인 특별공급으로 59A·59B·84A2·84C·84E 주택형에 각 1세대씩 총 5세대가 배정돼
          있습니다. 이는 해당 특별공급 대상 주택형이며 단지 전체의 타입 목록은 아닙니다. 기관추천 외
          특별공급 유형과 유형별 배정 세대수는 입주자모집공고에 게재됩니다.
        </p>
        <p>
          경기광주역 롯데캐슬 시그니처 2단지의 사업형태는 개발사업입니다. 바로 옆 경기광주역
          롯데캐슬 시그니처 1단지 1,077세대와 합하면 두 블록을 더해 2,326세대 규모가 됩니다.
          모델하우스는 경기 광주시 탄벌동 494에 있고, 성남시 분당구 분당테마폴리스 1층 107호에서도
          홍보관을 운영합니다. 단지 현장은 경기 광주시 쌍령동 산 54-29로 모델하우스와는 다른 곳에
          있습니다.
        </p>
        <p>
          시행은 주식회사 쌍령파크개발이 맡고 시공은 롯데건설 주식회사가 담당합니다. 신탁은
          신한자산신탁 주식회사가 맡는 관리형 토지신탁 방식입니다. 단지 계획과 시설 구성은 인허가 및
          실제 시공 과정에서 변경될 수 있으며, 페이지에 실린 이미지는 이해를 돕기 위한 것으로 실제와
          다를 수 있습니다. 공급 조건과 타입 선택 상담, 모델하우스 방문 예약은 1800-9570으로 문의해
          주세요.
        </p>
      </AboutThisPage>

      <PageOutro />
    </>
  );
}
