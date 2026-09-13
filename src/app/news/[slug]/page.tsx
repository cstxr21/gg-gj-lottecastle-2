import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageOutro from "@/components/PageOutro";
import SourceNote from "@/components/SourceNote";
import { POSTS } from "@/lib/news";
import { SITE, SITE_URL } from "@/lib/site";
import { LEGAL } from "@/lib/content";

/**
 * 분양소식 글 상세 `/news/[slug]` — 13단계 템플릿.
 *
 * 13단계에서는 POSTS가 빈 배열이라 생성되는 라우트가 0개다(샘플 발행 금지).
 * 실제 글은 15-A가 `lib/news.ts`에 추가하면 이 템플릿으로 자동 생성된다.
 *
 * ⚠️ title은 template을 쓰는 유일한 라우트다 — 글 제목만 주면 RootLayout이
 *    "| {현장명}"을 1회 붙인다(7단계 §1.6).
 * ⚠️ 출처는 본문 문장이 아니라 하단 SourceNote(※ 출처)로만 표기한다(6단계 §C).
 * ⚠️ 본문 맥락 링크는 말미 관련 서브 1~2개까지. 하단 전환 CTA는 PageOutro 1개.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: { type: "article", title: post.title, url: `/news/${post.slug}` },
  };
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const article = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.dateModified ?? post.date,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/news/${post.slug}` },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: "분양소식", item: SITE_URL + "/news" },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/news/${post.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <article className="bg-surface">
        <div className="mx-auto max-w-[920px] px-6 pt-28 pb-20 sm:px-10 sm:pt-32">
          {/* 에디토리얼 헤더 */}
          <p className="text-[13px] tracking-[0.2em] text-muted">
            <Link href="/" className="transition-opacity hover:opacity-60">
              홈
            </Link>
            <span className="mx-2 text-bronze">/</span>
            <Link href="/news" className="transition-opacity hover:opacity-60">
              분양소식
            </Link>
          </p>

          <p className="mt-8 flex items-center gap-3">
            <span className="font-accent text-[15px] tracking-[0.25em] text-bronze italic">
              {post.category}
            </span>
            <span className="text-[15px] text-muted">{post.date}</span>
          </p>

          <h1 className="mt-4 font-serif text-[30px] leading-tight font-bold tracking-[-0.01em] text-ink sm:text-[42px]">
            {post.title}
          </h1>

          {/* 도입 문단은 lead. summary는 카드·메타(og:description) 전용이라 본문에 겹쳐 쓰지 않는다 */}
          <p className="mt-6 text-[17px] sm:text-[18px]">{post.lead ?? post.summary}</p>

          {/* 본문 — 15-A가 sections로 채운다 */}
          <div className="mt-12 space-y-10">
            {post.sections?.map((s) => (
              <section key={s.heading}>
                <h2 className="font-serif text-[22px] font-bold tracking-[-0.01em] text-ink sm:text-[26px]">
                  {s.heading}
                </h2>
                <div className="mt-4 space-y-5 text-[17px] sm:text-[18px]">
                  {s.body.map((para) => (
                    <p key={para.slice(0, 24)}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* 본문 말미 관련 링크 — 13단계 §내부링크. 카드 블록이 아니라 문장 안 서술형 앵커 1~2개 */}
          {post.related && post.related.length > 0 ? (
            <div className="mt-10 space-y-3 text-[17px] sm:text-[18px]">
              {post.related.map((r) => (
                <p key={r.href}>
                  {r.before}
                  <Link href={r.href} className="underline underline-offset-4 hover:text-bronze">
                    {r.label}
                  </Link>
                  {r.after}
                </p>
              ))}
            </div>
          ) : null}

          {/* 출처는 본문이 아니라 여기에만 */}
          {post.sources && post.sources.length > 0 ? (
            <SourceNote className="mt-12" items={post.sources} />
          ) : null}

          <p className="mt-12 border-t border-line pt-6 text-[16px] text-muted">{LEGAL.asOfNote}</p>
        </div>
      </article>

      <PageOutro />
    </>
  );
}
