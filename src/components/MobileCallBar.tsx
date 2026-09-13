import Link from "next/link";
import TelLink from "@/components/TelLink";
import { RESERVATION_HREF } from "@/lib/site";
import { CONTACT } from "@/lib/content";

/**
 * 하단 고정 콜바 — 7단계 §1.
 * 2분할: 좌 관심고객 등록(브론즈) | 우 전화(잉크, 아이콘+번호).
 * ⚠️ 전화만 있는 통바 금지 — 관심고객등록을 반드시 동반한다(전환 동선).
 * body의 pb-[56px]가 이 바 높이를 비워 둔다(layout.tsx).
 */
export default function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex h-14 lg:hidden">
      <Link
        href={RESERVATION_HREF}
        className="flex flex-1 items-center justify-center bg-bronze text-[15px] text-ivory"
      >
        관심고객 등록
      </Link>
      <TelLink
        location="callbar"
        className="flex flex-1 items-center justify-center gap-2 bg-ink text-[15px] text-ivory"
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
      </TelLink>
    </div>
  );
}
