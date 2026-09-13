import type { MetadataRoute } from "next";
import { LAST_UPDATED, NAV, SITE_URL } from "@/lib/site";
import { POSTS } from "@/lib/news";

/**
 * sitemap.xml — 14단계 §산출물 4.
 *
 * 모든 페이지의 절대 URL + lastmod. 분양가·일정이 바뀌면 site.ts의 LAST_UPDATED를
 * 올려 재수집 신호를 살린다(옛 날짜에 고정되면 크롤러가 다시 올 이유가 없다).
 * 발행 글은 각 글의 dateModified(없으면 date)를 lastmod로 쓴다.
 *
 * ⚠️ hreflang은 다국어 사이트용이라 넣지 않는다.
 * ⚠️ /privacy는 robots noindex라 sitemap에서 제외한다(색인 요청과 모순 방지).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = new Date(LAST_UPDATED);

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: base, changeFrequency: "weekly", priority: 1 },
    ...NAV.map((n) => ({
      url: `${SITE_URL}${n.href}`,
      lastModified: base,
      changeFrequency: "weekly" as const,
      priority: n.href === "/sales" || n.href === "/modelhouse" ? 0.9 : 0.8,
    })),
  ];

  const posts: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${SITE_URL}/news/${p.slug}`,
    lastModified: new Date(p.dateModified ?? p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...pages, ...posts];
}
