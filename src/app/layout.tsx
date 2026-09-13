import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Cormorant_Garamond } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCallBar from "@/components/MobileCallBar";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SITE, SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * 폰트 — 5단계 §3. 전부 next/font 경유(G16-FONT: 외부 폰트 link·@import 0).
 * CJK는 서브셋이 커서 preload를 끈다(Next 권장) — 전 서브셋을 담되 프리로드하지 않는다.
 * Light(200~300)는 로드하지 않는다 — 읽는 텍스트 가독성(6단계 §A·G6-READABLE).
 */
const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
  preload: false,
});

const notoSerifKr = Noto_Serif_KR({
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
  preload: false,
});

/** 장식 영문 전용 — 핵심 정보에 쓰지 않는다(5단계 §5) */
const cormorant = Cormorant_Garamond({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

/**
 * 7단계 §1.6 — 브랜드명 중복 금지.
 *  · default  = 홈(/)의 정본 title (10단계 TITLE)
 *  · template = 자식 페이지 title 뒤에 "| {현장명}"을 자동으로 1회 붙인다
 * ⚠️ 둘은 서로 다른 문자열이다. template을 "%s | 분양 홈페이지"로 바꾸지 말 것.
 * ⚠️ 서브·메인은 title.absolute로 전체값을 박아 template을 우회한다(안 그러면 브랜드 2회).
 *    template을 쓰는 라우트는 news/[slug](글제목만) + privacy 같은 단순 페이지뿐이다.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} | 분양 홈페이지`,
    template: `%s | ${SITE.name}`,
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: "/",
    title: `${SITE.name} | 분양 홈페이지`,
    images: [
      {
        url: SITE.ogImage.path,
        width: SITE.ogImage.width,
        height: SITE.ogImage.height,
        alt: SITE.ogImage.alt,
      },
    ],
  },
  // 토큰은 발급된 것만 렌더한다 — 빈 값이면 메타 태그 자체를 내보내지 않는다.
  ...(SITE.verification.naver || SITE.verification.google
    ? {
        verification: {
          ...(SITE.verification.google ? { google: SITE.verification.google } : {}),
          ...(SITE.verification.naver
            ? { other: { "naver-site-verification": SITE.verification.naver } }
            : {}),
        },
      }
    : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={SITE.lang}
      className={`${notoSansKr.variable} ${notoSerifKr.variable} ${cormorant.variable} h-full antialiased`}
    >
      {/* pb-[56px] = 모바일 콜바(h-14) 공간 — 콜바가 본문 마지막 줄을 덮지 않게(7단계 §1) */}
      <body className="flex min-h-full flex-col pb-[56px] lg:pb-0">
        <Header />
        {/* 헤더가 fixed라 본문을 헤더 높이(h-16)만큼 내린다. 단 히어로가 헤더 뒤로 비치는
            홈·서브 히어로는 각자 pt로 처리하므로 여기서는 레이아웃만 잡는다. */}
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
        <MobileCallBar />
        {/* GA4 — gaId가 설정된 현장에서만 삽입한다(8단계 §2). 빈 값이면 스크립트 0바이트·에러 0.
            측정 호출은 src/lib/analytics.ts의 track() 하나로 모은다(개인정보 파라미터 금지). */}
        {SITE.gaId ? <GoogleAnalytics gaId={SITE.gaId} /> : null}
      </body>
    </html>
  );
}
