import { SITE, SITE_URL } from "@/lib/site";
import { CONTACT, PARTIES, PROJECT, UNIT_MIX } from "@/lib/content";

/**
 * 구조화 데이터 — 14단계 §산출물 2.
 *
 * ⚠️ 주입은 반드시 `dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}`.
 *    React 자식으로 넣으면 `"`가 `&quot;`로 이스케이프돼 JSON이 깨진다.
 * ⚠️ 모든 블록 최상위에 `@context`가 있어야 한다 — 없으면 검색엔진이 블록을 통째로 버린다.
 * ⚠️ **페이지에 보이지 않는 정보를 넣지 않는다**(Google Rich Results 위반).
 *    그래서 additionalProperty는 확정 fact와 "추후 안내" 표기까지만 담는다.
 * ⚠️ 부차 entity(Organization 단독·WebSite·SiteNavigationElement)는 만들지 않는다.
 */

const SITE_PLACE = CONTACT.places.find((p) => p.key === "site")!;

const prop = (name: string, value: string) => ({
  "@type": "PropertyValue" as const,
  name,
  value,
});

/**
 * 단지 entity — 홈·사업개요·입지·단지안내·평면도·분양안내가 공유한다.
 * 사업지는 LocalBusiness가 아니다(모델하우스 NAP과 타입을 섞지 않는다).
 */
export function residence(page: { path: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    "@id": SITE_URL + page.path,
    name: page.name,
    alternateName: [...SITE.alternateName],
    description: page.description,
    url: SITE_URL + page.path,
    telephone: CONTACT.tel,
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressRegion: "경기도",
      addressLocality: "광주시",
      streetAddress: "쌍령동 산 54-29",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_PLACE.lat,
      longitude: SITE_PLACE.lng,
    },
    numberOfAccommodationUnits: UNIT_MIX.total,
    additionalProperty: [
      prop("사업유형", "아파트"),
      prop("주택 유형", "민영주택"),
      prop("사업형태", "개발사업"),
      prop("총 세대수", "1,249세대"),
      prop("동수", "10개동"),
      prop("층수", "지하 10층 ~ 지상 최고 26층"),
      prop("전용면적", "59㎡ ~ 246㎡"),
      prop(
        "주택형 구성",
        "전용 59㎡ 265세대 · 84㎡ 843세대 · 114㎡ 127세대 · 159㎡ 4세대 · 109~246㎡ 10세대",
      ),
      prop("시행위탁자", PARTIES.developer.name),
      prop("시행수탁자", PARTIES.trustee.name),
      prop("시공자", PARTIES.builder.name),
      prop("분양 방식", "관리형 토지신탁"),
      prop("분양가", "입주자모집공고 시점 기준 추후 안내"),
      prop("청약 자격", "입주자모집공고 시점 기준 추후 안내"),
      prop("입주 예정", "입주자모집공고 시점 기준 추후 안내"),
      prop("입주자모집공고일", "2026년 9월 11일 (예정)"),
    ],
  };
}

/** 사업개요 페이지용 — 확정 제원을 그대로 노출하므로 PROJECT 표와 1:1 */
export const projectRows = PROJECT.map((f) => prop(f.label, f.value));
