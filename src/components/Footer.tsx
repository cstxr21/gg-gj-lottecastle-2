import Link from "next/link";
import TelLink from "@/components/TelLink";
import { LAST_UPDATED, NAV, SITE } from "@/lib/site";
import { CONTACT, LEGAL, PARTIES } from "@/lib/content";

/**
 * 다크 푸터 — 7단계 §2.
 * 표시광고법 필수(6단계 전역가드 ⟨3주체⟩): 시행위탁자·시행수탁자(신탁)·시공자 3주체 + 광고심의필 번호.
 * ⚠️ 광고심의필 번호(PARTIES.adReviewNo)는 아직 미확보라 빈 값이면 렌더하지 않는다.
 *    없는 번호를 지어내지 않는다(절대규칙 1). 확보되면 content.ts만 채우면 여기 자동 노출.
 */
export default function Footer() {
  const parties = [PARTIES.developer, PARTIES.builder, PARTIES.trustee];

  return (
    <footer className="mt-auto bg-ink text-ivory">
      <div className="mx-auto max-w-[1280px] px-6 py-16 sm:px-10 sm:py-20">
        <p className="font-serif text-[22px] font-semibold tracking-tight">{SITE.name}</p>

        <nav aria-label="푸터 메뉴" className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] opacity-80 transition-opacity hover:opacity-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 border-t border-white/15 pt-8">
          <dl className="flex flex-wrap gap-x-8 gap-y-2">
            {parties.map((p) => (
              <div key={p.role} className="flex items-baseline gap-2">
                <dt className="text-[15px] opacity-60">{p.role}</dt>
                <dd className="text-[17px] font-medium">{p.name}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-[17px] font-medium">
            <span className="opacity-60">분양문의</span>{" "}
            <TelLink location="footer" className="underline underline-offset-4">
              {CONTACT.tel}
            </TelLink>
          </p>
        </div>

        <div className="mt-10 space-y-2 border-t border-white/15 pt-8 text-[15px] opacity-70">
          <p>{LEGAL.asOfNote}</p>
          <p>{LEGAL.cgNote}</p>
          {PARTIES.adReviewNo ? <p>광고심의필 {PARTIES.adReviewNo}</p> : null}
          <p>최종 갱신: {LAST_UPDATED}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href={LEGAL.privacyHref} className="text-[15px] underline underline-offset-4">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
