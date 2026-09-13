import { after, NextResponse } from "next/server";
import { getSupabase, type Inquiry } from "@/lib/supabase";
import { SITE } from "@/lib/site";

/**
 * 관심고객등록 접수 — 9단계 §5.
 *
 * 1) 검증(성함·연락처·동의 필수)
 * 2) Supabase `inquiries` insert (현장 식별자 = site.ts slug)
 * 3) **즉시 응답** — 저장 결과 기준. 텔레그램 왕복을 기다리지 않는다.
 * 4) 텔레그램은 응답 직후 after()로 백그라운드 발송(실패는 서버 로그에만)
 *
 * ⚠️ TELEGRAM_BOT_TOKEN은 서버 전용 비밀값이다. NEXT_PUBLIC_ 접두를 붙이지 않는다 —
 *    붙는 순간 클라이언트 번들에 박혀 봇이 탈취된다(16단계 G16-SECRET이 검사).
 */

// 비밀값을 읽으므로 정적 최적화 대상이 되면 안 된다
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PHONE_RE = /^0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}$/;

type Body = {
  name?: unknown;
  phone?: unknown;
  preferredTime?: unknown;
  agreed?: unknown;
};

const asText = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function notifyTelegram(row: Inquiry) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    `🏠 ${SITE.name} 관심고객등록`,
    `👤 성함: ${row.name}`,
    `📞 연락처: ${row.phone}`,
    `🕐 연락 가능 시간: ${row.preferred_time ?? "-"}`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) {
      console.error("[contact] telegram 발송 실패", res.status, await res.text());
    }
  } catch (e) {
    console.error("[contact] telegram 예외", e);
  }
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = asText(body.name, 40);
  const phone = asText(body.phone, 20);
  const preferredTime = asText(body.preferredTime, 40) || null;
  const agreed = body.agreed === true;

  if (name.length < 2) {
    return NextResponse.json({ error: "성함을 두 글자 이상 입력해 주세요" }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "연락처를 올바르게 입력해 주세요" }, { status: 400 });
  }
  if (!agreed) {
    return NextResponse.json({ error: "개인정보 수집·이용에 동의해 주세요" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    // 환경변수 누락 — 로컬이면 .env.local, 배포면 호스팅 Environment Variables 미등록(§3-5)
    console.error("[contact] Supabase 환경변수 누락 — .env.local / 호스팅 환경변수 확인");
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 503 });
  }

  const row: Inquiry = {
    site: SITE.slug,
    name,
    phone,
    preferred_time: preferredTime,
    agreed,
    source: req.headers.get("referer"),
    user_agent: req.headers.get("user-agent"),
  };

  const { error } = await supabase.from("inquiries").insert(row);
  if (error) {
    console.error("[contact] Supabase insert 실패", error.code, error.message);
    return NextResponse.json(
      { error: "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  // 저장이 끝났으면 바로 응답하고, 알림은 응답 뒤에 보낸다(대기시간 미포함)
  after(() => notifyTelegram(row));

  return NextResponse.json({ ok: true });
}
