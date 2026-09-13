"use client";

import { track, type TrackLocation } from "@/lib/analytics";
import { CONTACT } from "@/lib/content";
import type { ReactNode } from "react";

/**
 * 전화 링크 — 클릭 시 전환 이벤트(tel_click)를 남긴다(8단계 §2).
 * 보내는 값은 이벤트명과 **위치**뿐이다. 번호를 파라미터로 넘기지 않는다.
 */
export default function TelLink({
  location,
  className = "",
  children,
}: {
  location: TrackLocation;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={CONTACT.telHref}
      aria-label={`전화 상담 ${CONTACT.tel}`}
      onClick={() => track("tel_click", location)}
      className={className}
    >
      {children}
    </a>
  );
}
