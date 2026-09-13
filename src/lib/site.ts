/**
 * 사이트 공통 메타 — 5단계 §8 정본.
 *
 * 현장 fact의 집은 여기와 content.ts 둘뿐이다(3단계 §산출물이 5단계의 입력).
 * 페이지 md·컴포넌트에 수치를 흩뿌리지 않는다(G3-SINGLESRC).
 */

/**
 * 배포 도메인 (사용자 확정, 2026-09-12).
 * canonical·sitemap·OG 절대 URL이 전부 이 값을 쓴다(14단계).
 * ⚠️ www 포함형으로 통일한다 — 5단계 §8 "www 포함/제외 일관".
 *    non-www(gallerycenter.co.kr)로도 접속된다면 배포 시 www로 301 리다이렉트를 걸어
 *    canonical과 실제 접근 URL이 어긋나지 않게 한다.
 * 프리뷰 배포는 `NEXT_PUBLIC_SITE_URL`로 덮어쓴다.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gallerycenter.co.kr"
).replace(/\/+$/, "");

export const SITE = {
  /** 이미지 파일명 접두·자산 경로 기준 (G14-IMGNAME이 강제) */
  slug: "gg-gj-lottecastle-2",

  /** 공식 단지명 — 3단계 factcheck '단지명' 일치. 창작·축약 금지 */
  name: "경기광주역 롯데캐슬 시그니처 2단지",
  /** 본문 브랜드 토큰 */
  short: "경기광주역 롯데캐슬 시그니처 2단지",

  /**
   * 표기 변형 — 5단계 §8 alternateName[].
   * 근거: reports/keywords.json brandVariants(네이버 자동완성 실입력 쿼리).
   * ⚠️ '광주 롯데캐슬 시그니처'는 광역시 광주와 혼동 구간이라 제외.
   */
  alternateName: [
    // 공백 제거형 — 네이버 형태소에서 실제로 검색이 갈리는 유일한 변형
    "경기광주역롯데캐슬시그니처2단지",
    // 자동완성에서 확인된 통용 약칭(reports/keywords.json brandVariants)
    "경기광주역 롯데캐슬 2단지",
    "경기광주역 롯데캐슬 시그니처",
    "경기광주 롯데캐슬 2단지",
  ],

  locale: "ko_KR",
  lang: "ko",

  /**
   * OG 이미지 — 1200×630. **jpg 고정(webp 금지)**: SNS OG 크롤러가 webp를
   * 미리보기로 렌더하지 못한다(G5-OGIMG). scripts/materialize-images.mjs가 생성.
   */
  ogImage: {
    path: "/images/og/gg-gj-lottecastle-2-og.jpg",
    width: 1200,
    height: 630,
    alt: "경기광주역 롯데캐슬 시그니처 2단지 조감도",
  },

  /**
   * 검색엔진 소유확인 토큰 — 우리 계정으로 발급받은 값만 넣는다.
   * ⚠️ 원사이트(롯데건설)의 토큰을 복사하지 않는다. 미발급이면 빈 문자열로 두고
   *    빈 값일 때는 메타 태그를 렌더하지 않는다(14단계).
   */
  verification: {
    naver: "",
    google: "",
  },

  /** GA4 측정 ID. 빈 값 = 미도입 현장(G16-ANALYTICS 면제) */
  gaId: "",

  /**
   * 갱신 기준일 — sitemap lastmod와 푸터 "최종 갱신"의 단일 소스(G16-LASTMOD).
   * ⚠️ 재배포(분양가·일정·분양단계 변경)마다 **여기만** 올린다. 옛 날짜에 고정해 두면
   *    크롤러가 다시 올 이유가 없어져 재수집 신호가 죽는다(90일 초과 시 게이트 RED).
   */
  updatedAt: "2026-09-12",
} as const;

/** 9 라우트 — 5단계 §1. 관심고객등록은 별도 페이지가 아니라 메인 하단 + 모델하우스 예약 폼 */
export const NAV = [
  { href: "/overview", label: "사업개요", en: "Overview", motif: "circle" },
  { href: "/location", label: "입지환경", en: "Location", motif: "map" },
  { href: "/premium", label: "프리미엄", en: "Premium", motif: "bloom" },
  { href: "/complex", label: "단지안내", en: "Complex", motif: "plan" },
  { href: "/floorplan", label: "평면도", en: "Floor Plan", motif: "unit" },
  { href: "/sales", label: "분양안내", en: "Sales Guide", motif: "doc" },
  { href: "/modelhouse", label: "모델하우스", en: "Model House", motif: "gallery" },
  { href: "/news", label: "분양소식", en: "News", motif: "news" },
  { href: "/faq", label: "FAQ", en: "FAQ", motif: "qa" },
] as const;

export type NavItem = (typeof NAV)[number];

/**
 * 관심고객등록 동선 — 7단계 §5-1. 별도 페이지를 만들지 않고 전부 이 앵커로 모은다.
 * id="reservation"은 모델하우스 **우측 예약 폼 자체**에 붙인다(2단 래퍼·좌측 컬럼 금지).
 */
export const RESERVATION_HREF = { pathname: "/modelhouse", hash: "reservation" } as const;

/**
 * 푸터 "최종 갱신" 표기(7단계 §2) · sitemap lastmod 기준일(14단계).
 * 값의 정본은 `SITE.updatedAt` 하나다 — 두 곳에 날짜를 두면 한쪽만 올라가 어긋난다.
 */
export const LAST_UPDATED: string = SITE.updatedAt;

/**
 * 내부링크 순환(7단계 §5-3) — 입지 → 평면도 → 분양안내 → 모델하우스 → 관심고객등록으로 흐르게 한다.
 * 각 서브 하단의 "다음" 링크가 이 표를 쓴다. 11~13단계가 본문을 채울 때도 이 순서를 유지한다.
 */
export const NEXT_LINK: Record<string, { href: string; label: string }> = {
  "/overview": { href: "/location", label: "입지환경" },
  "/location": { href: "/floorplan", label: "평면도" },
  "/floorplan": { href: "/sales", label: "분양안내" },
  "/sales": { href: "/modelhouse", label: "모델하우스" },
  "/premium": { href: "/complex", label: "단지안내" },
  "/complex": { href: "/floorplan", label: "평면도" },
  "/news": { href: "/faq", label: "FAQ" },
  "/faq": { href: "/modelhouse", label: "모델하우스" },
};
