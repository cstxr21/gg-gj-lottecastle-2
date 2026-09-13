"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { track, type TrackLocation } from "@/lib/analytics";
import { LEGAL } from "@/lib/content";

/**
 * 관심고객등록 / 방문예약 폼 — 8단계 §2.
 *
 * 제출은 9단계에서 `/api/contact`로 연결했다 — Supabase `inquiries` 저장 + 텔레그램 알림.
 * 라우트가 검증·저장·알림을 담당하고, 이 컴포넌트는 입력·검증·상태 표시를 맡는다.
 *
 * 별도 페이지를 만들지 않고 메인 하단 + 모델하우스(`/modelhouse#reservation`)에서 재사용한다.
 * ⚠️ 앵커(id="reservation" + scroll-mt-24)는 2단 래퍼나 좌측 컬럼이 아니라 **이 폼 자체**에 건다
 *    (모바일 세로 스택에서 좌측 정보가 아니라 입력부로 직행해야 한다 — 12단계).
 */

/** 연락 가능한 시간대 — 8단계 §2 정본 선택지 */
const TIME_SLOTS = [
  "오전 9–12시",
  "오후 12–15시",
  "오후 15–18시",
  "저녁 18시 이후",
  "아무때나",
] as const;

/**
 * 연락처 자동 하이픈 — 숫자만 추출해 `-`를 삽입한다.
 * 02(서울)는 국번 2자리, 그 외는 3자리. 11자리=3-4-4, 10자리=3-3-4.
 */
export function formatPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

/** 하이픈이 포함된 값을 그대로 통과시킨다 */
const PHONE_RE = /^0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}$/;

const FIELD =
  "w-full border border-line bg-surface px-4 py-3 text-[17px] text-ink outline-none focus:border-bronze focus:border-2 focus:px-[15px] focus:py-[11px]";
const LABEL = "block text-[16px] font-medium text-ink";

export default function InterestForm({
  eyebrow,
  title,
  note,
  location = "home_section",
  id,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  note?: string;
  /** 전환 추적용 위치 파라미터 — 개인정보는 절대 보내지 않는다 */
  location?: TrackLocation;
  id?: string;
  className?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slot, setSlot] = useState<string>(TIME_SLOTS[4]);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; agree?: string }>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");
  /**
   * 중복 발송 방지(9단계 §5) — setState는 비동기라 더블클릭 사이에 sending이 아직 false다.
   * ref로 **동기 잠금**을 걸어야 연타 2중 접수가 막힌다. 버튼 disabled는 보조 수단.
   */
  const submittingRef = useRef(false);

  function validate() {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "성함을 두 글자 이상 입력해 주세요";
    if (!PHONE_RE.test(phone.trim())) next.phone = "연락처를 올바르게 입력해 주세요";
    if (!agree) next.agree = "개인정보 수집·이용에 동의해 주세요";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return; // 동기 잠금 — 연타 2중 접수 차단
    if (!validate()) return;
    submittingRef.current = true;
    setSending(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, preferredTime: slot, agreed: agree }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setSubmitError(data?.error ?? "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setDone(true);
      // 성공(200) 뒤에만 전환 이벤트 — 이벤트명과 위치만 보낸다(입력값 전송 금지).
      track("form_submit_success", location);
    } catch {
      setSubmitError("네트워크 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      submittingRef.current = false;
      setSending(false);
    }
  }

  if (done) {
    return (
      <div id={id} className={`scroll-mt-24 border border-line bg-surface p-6 sm:p-8 ${className}`}>
        <p className="text-[17px] font-medium text-ink">등록이 접수되었습니다.</p>
        <p className="mt-3 text-[17px] text-muted">
          담당자가 확인 후 순차적으로 연락드립니다. 문의는 {LEGAL.contactHint}
        </p>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      noValidate
      className={`scroll-mt-24 border border-line bg-surface p-6 sm:p-8 ${className}`}
    >
      {(eyebrow || title || note) && (
        <div className="mb-8">
          {eyebrow ? (
            <p className="font-accent text-[15px] tracking-[0.3em] text-bronze italic">{eyebrow}</p>
          ) : null}
          {title ? (
            <h2 className="mt-3 font-serif text-[26px] font-bold tracking-[-0.01em] text-ink">
              {title}
            </h2>
          ) : null}
          {note ? <p className="mt-3 text-[17px] text-muted">{note}</p> : null}
        </div>
      )}

      <div className="flex flex-col gap-7">
        <div>
          {/* 라벨은 필드 위 한글 16px 고정 — 플레이스홀더로 대체하지 않는다(§2) */}
          <label htmlFor="if-name" className={LABEL}>
            성함
          </label>
          <input
            id="if-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "if-name-err" : undefined}
            className={`mt-2 ${FIELD}`}
          />
          {errors.name ? (
            <p id="if-name-err" className="mt-2 text-[16px] font-medium text-ink">
              ! {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="if-phone" className={LABEL}>
            연락처
          </label>
          <input
            id="if-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={13}
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-1234-5678"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "if-phone-err" : undefined}
            className={`mt-2 ${FIELD}`}
          />
          {errors.phone ? (
            <p id="if-phone-err" className="mt-2 text-[16px] font-medium text-ink">
              ! {errors.phone}
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend className={LABEL}>연락 가능한 시간대</legend>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {TIME_SLOTS.map((t) => (
              <label key={t} className="tap-target flex items-center gap-2 text-[17px]">
                <input
                  type="radio"
                  name="slot"
                  value={t}
                  checked={slot === t}
                  onChange={() => setSlot(t)}
                  className="h-5 w-5 accent-[var(--bronze)]"
                />
                {t}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 개인정보 동의 — 수집항목·이용목적·보유기간을 테두리 박스로 분리(개인정보보호법) */}
        <div className="border border-line p-4 sm:p-5">
          <p className="text-[16px] font-medium text-ink">개인정보 수집·이용 동의</p>
          <dl className="mt-3 space-y-1 text-[16px] text-muted">
            <div className="flex gap-2">
              <dt className="shrink-0">수집 항목</dt>
              <dd className="text-ink">성함, 연락처, 연락 가능한 시간대</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">이용 목적</dt>
              <dd className="text-ink">분양 상담 및 방문예약 안내</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">보유 기간</dt>
              <dd className="text-ink">분양 종료 시 또는 동의 철회 시 지체 없이 파기</dd>
            </div>
          </dl>
          <p className="mt-3 text-[16px] text-muted">
            동의를 거부하실 수 있으며, 거부 시 상담 안내가 제한됩니다. 자세한 내용은{" "}
            <Link href={LEGAL.privacyHref} className="text-ink underline underline-offset-4">
              개인정보처리방침
            </Link>
            에서 확인하실 수 있습니다.
          </p>
          <label className="tap-target mt-4 flex items-center gap-3 text-[17px]">
            <input
              type="checkbox"
              name="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              aria-invalid={!!errors.agree}
              className="h-5 w-5 accent-[var(--bronze)]"
            />
            <span className="font-medium text-ink">개인정보 수집·이용에 동의합니다</span>
          </label>
          {errors.agree ? (
            <p className="mt-2 text-[16px] font-medium text-ink">! {errors.agree}</p>
          ) : null}
        </div>

        {submitError ? (
          <p role="alert" className="text-[16px] font-medium text-ink">
            ! {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={sending}
          className="tap-target w-full bg-ink px-5 py-4 text-[17px] text-ivory transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {sending ? "전송 중…" : "등록하기"}
        </button>
      </div>
    </form>
  );
}
