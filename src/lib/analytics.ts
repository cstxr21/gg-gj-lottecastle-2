/**
 * 전환 추적 헬퍼 — 8단계 §2.
 *
 * site.ts의 gaId가 설정된 현장에서만 동작한다. 빈 값이면 완전한 no-op
 * (스크립트도 안 실린다 — layout.tsx에서 조건부 삽입).
 *
 * ⚠️ **개인정보를 이벤트 파라미터로 보내지 않는다**(개인정보보호법).
 *    보내는 것은 이벤트명과 **위치 파라미터**(어느 표면에서 눌렸는지)뿐이다.
 *    입력값(성함·연락처 등)은 어떤 형태로도 전달 금지 — 16단계 G16-ANALYTICS가 검사한다.
 */
import { SITE } from "@/lib/site";

type Gtag = (command: "event", name: string, params?: Record<string, string>) => void;

/** 이벤트가 발생한 표면 — 어디서 전환이 일어나는지만 구분한다 */
export type TrackLocation =
  "header" | "hero" | "callbar" | "footer" | "home_section" | "modelhouse";

export type TrackEvent = "form_submit_success" | "tel_click";

export function track(event: TrackEvent, location: TrackLocation): void {
  if (!SITE.gaId) return;
  if (typeof window === "undefined") return;
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof g !== "function") return;
  g("event", event, { location });
}
