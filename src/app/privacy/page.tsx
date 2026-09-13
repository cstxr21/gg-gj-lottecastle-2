import type { Metadata } from "next";
import { CONTACT, LEGAL } from "@/lib/content";
import { SITE } from "@/lib/site";

/**
 * 개인정보처리방침 — 8단계 §8.
 *
 * 관심고객등록 폼의 **동의 대상 페이지**다(폼 동의 박스 → 이 페이지 링크).
 * 개인정보보호법상 폼을 운영하려면 본문이 실제로 있어야 한다(빈 골격 방치 금지).
 *
 * ⚠️ 개인정보 보호책임자(성명·연락처)·처리 위탁 현황은 **확보 전까지 쓰지 않는다**(창작 금지).
 *    위탁사가 확정되면(9단계 Supabase 등) 이 페이지에 위탁 항목을 추가한다.
 * ⚠️ GA4 등 행태정보 수집 도구를 붙인 현장만 그 고지를 1줄 넣는다 — 현재 gaId 미설정이라 생략.
 *
 * title은 섹션명만 준다 — RootLayout template이 "| {현장명}"을 1회 붙인다(7단계 §1.6).
 */
export const metadata: Metadata = {
  title: "개인정보처리방침",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

const ROWS: { label: string; value: string }[] = [
  { label: "수집 항목", value: "성함, 연락처, 연락 가능한 시간대" },
  { label: "이용 목적", value: "분양 상담 및 방문예약 안내" },
  {
    label: "보유 기간",
    value: "분양 종료 시 또는 동의 철회 시 지체 없이 파기합니다.",
  },
  {
    label: "제3자 제공",
    value: "제공하지 않습니다. 다만 법령에 따라 요구되는 경우는 예외로 합니다.",
  },
  {
    label: "정보주체 권리",
    value: "열람·정정·삭제·처리정지 및 동의 철회를 요청하실 수 있습니다.",
  },
  {
    label: "동의 거부",
    value: "동의를 거부하실 수 있으며, 거부 시 상담 안내가 제한됩니다.",
  },
  { label: "문의처", value: `${CONTACT.tel}` },
];

export default function PrivacyPage() {
  return (
    <main className="bg-surface">
      <div className="mx-auto max-w-[920px] px-6 pt-28 pb-20 sm:px-10 sm:pt-32">
        <h1 className="font-serif text-[26px] font-bold tracking-[-0.01em] text-ink sm:text-[34px]">
          개인정보처리방침
        </h1>

        <p className="mt-8 text-[17px]">
          {SITE.name} 분양 안내 페이지는 관심고객 등록과 방문예약 상담을 위해 아래 범위에서
          개인정보를 수집·이용합니다. 수집한 개인정보는 아래 목적 외의 용도로 이용하지 않습니다.
        </p>

        <dl className="mt-12 border-t border-line">
          {ROWS.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 border-b border-line py-5 sm:flex-row sm:gap-6"
            >
              <dt className="shrink-0 text-[15px] text-muted sm:w-40">{row.label}</dt>
              <dd className="text-[17px] font-medium text-ink sm:text-[18px]">{row.value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-12">
          <h2 className="font-serif text-[22px] font-bold tracking-[-0.01em] text-ink">
            권리 행사 방법
          </h2>
          <p className="mt-4 text-[17px]">
            열람·정정·삭제·처리정지 및 동의 철회는 대표번호 {CONTACT.tel}으로 요청하실 수 있습니다.
            요청을 받으면 지체 없이 처리하고 결과를 알려드립니다.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-[22px] font-bold tracking-[-0.01em] text-ink">
            안전성 확보 조치
          </h2>
          <p className="mt-4 text-[17px]">
            수집한 개인정보는 접근 권한이 있는 담당자에 한해 취급하며, 보유 기간이 지나면 지체 없이
            파기합니다.
          </p>
        </section>

        <p className="mt-12 border-t border-line pt-6 text-[16px] text-muted">
          시행일 {LEGAL.lastUpdated}
        </p>
      </div>
    </main>
  );
}
