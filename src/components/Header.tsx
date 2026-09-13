"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, RESERVATION_HREF, SITE } from "@/lib/site";
import { CONTACT } from "@/lib/content";
import { track } from "@/lib/analytics";

/** SVG 라인 아이콘 — 이미지 자산이 아니라 코드로 작도(7단계 §1) */
function IconPhone({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.2 3.5h3l1.6 4-2 1.4a12.5 12.5 0 0 0 6.3 6.3l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // 홈 최상단만 투명. 24px 넘게 스크롤하면 솔리드로(7단계 §1)
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // 오버레이 닫기는 링크 클릭에서 직접 처리한다.
  // pathname 변화를 보는 useEffect로 닫으면 setState가 이펙트 본문에서 호출돼
  // 연쇄 렌더가 발생한다(react-hooks/set-state-in-effect).

  // 오버레이가 열린 동안 뒤 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const solid = !isHome || scrolled;

  return (
    // ⚠️ 오버레이는 <header>의 **형제**로 렌더한다(7단계 §1).
    //    헤더가 솔리드일 때 backdrop-blur(=backdrop-filter)가 걸리는데, backdrop-filter는
    //    자식 position:fixed의 기준을 뷰포트가 아닌 그 요소로 바꾸는 containing block을 만든다.
    //    오버레이가 헤더 자식이면 fixed inset-0이 헤더 박스(~64px)에 갇혀 메뉴가 안 보인다.
    //    홈 최상단은 bg-transparent라 blur가 없어 버그가 안 보인다 → "서브에서만 안 됨"으로 오인하기 쉽다.
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          solid ? "border-b border-line bg-ivory/95 text-ink backdrop-blur" : "text-white"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-5 px-6 sm:px-10 xl:gap-6">
          {/*
            로고는 단지명 전체(20자)라 데스크탑에서 가장 넓은 항목이다.
            17px로 두면 로고+메뉴 9개+CTA 2개 합이 컨테이너 내부 폭(1200px)을 넘어
            첫 메뉴 항목과 겹친다(실측 1238px). 데스크탑은 15px로 낮춰 폭을 확보한다.
          */}
          <Link
            href="/"
            className="tap-target flex shrink-0 items-center font-serif text-[17px] font-bold tracking-tight whitespace-nowrap lg:text-[15px]"
          >
            {SITE.name}
          </Link>

          {/* 데스크탑 메뉴 — 한글 라벨 15px만(번호·영문 없음) */}
          <nav
            aria-label="주요 메뉴"
            className="ml-auto hidden items-center gap-4 lg:flex xl:gap-5"
          >
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-12 items-center text-[15px] tracking-[0.02em] whitespace-nowrap transition-opacity hover:opacity-60 ${
                    active ? "text-bronze" : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 우측 CTA 2개 — 모바일 숨김 */}
          <div className="ml-auto hidden shrink-0 items-center gap-2 lg:ml-4 lg:inline-flex">
            <a
              href={CONTACT.telHref}
              aria-label={`전화 상담 ${CONTACT.tel}`}
              onClick={() => track("tel_click", "header")}
              className="tap-target flex h-12 items-center gap-2 border border-current px-4 text-[15px] whitespace-nowrap transition-opacity hover:opacity-60"
            >
              <IconPhone className="h-4 w-4" />
              {CONTACT.tel}
            </a>
            <Link
              href={RESERVATION_HREF}
              className="tap-target flex h-12 items-center bg-bronze px-5 text-[15px] whitespace-nowrap text-ivory transition-opacity hover:opacity-90"
            >
              관심고객등록
            </Link>
          </div>

          {/* 모바일 햄버거 */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={open}
            className="tap-target ml-auto flex items-center justify-center lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background text-ink lg:hidden">
          <div className="flex h-16 shrink-0 items-center gap-4 border-b border-line px-6">
            <span className="font-serif text-[17px] font-bold tracking-tight">{SITE.name}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="메뉴 닫기"
              className="tap-target ml-auto flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                strokeLinecap="round"
                aria-hidden="true"
                className="h-6 w-6"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* 구분선 리스트 — 번호(브론즈 italic) + 한글 24px + 영문 보조. 번호는 모바일에만 */}
          <nav aria-label="전체 메뉴" className="flex-1 overflow-y-auto px-6">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-line py-4"
              >
                <span className="font-accent text-[15px] text-bronze italic">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-[24px]">{item.label}</span>
                <span className="font-accent text-[13px] tracking-[0.25em] text-muted italic">
                  {item.en}
                </span>
              </Link>
            ))}
          </nav>

          {/* 하단 가로 2분할 CTA — 전화만 있는 통바 금지(전환 동선) */}
          <div className="flex shrink-0 border-t border-line">
            <Link
              href={RESERVATION_HREF}
              onClick={() => setOpen(false)}
              className="flex h-14 flex-1 items-center justify-center bg-bronze text-[15px] text-ivory"
            >
              관심고객 등록
            </Link>
            <a
              href={CONTACT.telHref}
              aria-label={`전화 상담 ${CONTACT.tel}`}
              onClick={() => track("tel_click", "header")}
              className="flex h-14 flex-1 items-center justify-center gap-2 bg-ink text-[15px] text-ivory"
            >
              <IconPhone className="h-4 w-4" />
              {CONTACT.tel}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
