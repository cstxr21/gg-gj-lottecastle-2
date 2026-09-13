/**
 * 사이트 완전 추출기 (2단계 ⓪~③ 자동화 + ④ OCR 후보 산출) — 현장값 하드코딩 0.
 *
 * 이 스크립트는 **현장 무관**이다. 매 현장 새로 작성하지 말고 이 블록을 그대로
 * `scripts/extract-site.mjs`로 저장해 인자만 바꿔 실행한다(작성·디버깅 시간 = 0).
 *
 * 사용:
 *   npm i -D playwright && npx playwright install chromium     (브라우저는 머신 단위 캐시 — 최초 1회만 느리다)
 *   node scripts/extract-site.mjs --url=https://example.com --out=extract/<현장명>
 *
 * 옵션(기본값):
 *   --max-pages=80      BFS 상한. 분양/임대/조합 현장 사이트는 보통 10~30페이지다.
 *                       상한에 걸리면 report에 남으므로, 실제로 더 크면 그때 올린다(크롤 트랩 방어).
 *   --concurrency=4     페이지 방문 워커 수(동일 호스트 예의 · 429/503 시 자동 감속)
 *   --idle=10000        networkidle 대기 상한(ms). 초과 시 domcontentloaded + 3s로 진행.
 *                       ※ 캐러셀·배경영상·트래커가 있는 사이트는 networkidle이 영원히 안 잡힌다.
 *                          60s로 두면 페이지마다 60초를 통째로 버린다 — 10s면 충분하다.
 *   --mobile=auto       auto|on|off. auto = 모바일 분리 자산(_m·m. 호스트) 정황이 있을 때만 2뷰포트.
 *   --force             resume 무시(전량 재수집). 기본은 resume ON — manifest 해시로 완료분 skip.
 *   --max-assets=0      다운로드 자산 상한(0=무제한, 사고 방어용)
 *   --scope=<경로접두사> 페이지 BFS를 이 경로 아래로 제한(기본: 없음 = origin 전체).
 *                       한 도메인에 현장이 수백 개 얹힌 건설사 통합 포털(예: /APT/<현장코드>/)에서
 *                       same-origin BFS가 남의 현장으로 번져 상한을 통째로 태우는 것을 막는다.
 *                       예: --scope=/APT/<현장코드>/  ※ 자산(이미지·문서)은 공용 경로(/files/ 등)에
 *                       있으므로 스코프를 적용하지 않는다 — 페이지 BFS에만 건다.
 *
 * 산출물: pages/ images/ videos/ docs/ ocr.json manifest.json report.txt
 * ④ 래스터 OCR은 이 스크립트가 채우지 않는다 — ocr.json의 needsOcr=true 항목을
 *    비전 LLM이 채운다(2단계 프롬프트 ④ 참조). 이 스크립트는 후보 선별·SVG 직접 파싱까지.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { chromium } from "playwright";

// ── 인자 ────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const arg = (k, d) => {
  const hit = argv.find((a) => a === `--${k}` || a.startsWith(`--${k}=`));
  if (!hit) return d;
  return hit.includes("=") ? hit.split("=").slice(1).join("=") : true;
};
const TARGET = String(arg("url", "") || "");
if (!TARGET) {
  console.error("❌ --url=<대상 사이트> 필수. 예: node scripts/extract-site.mjs --url=https://example.com --out=extract/mysite");
  process.exit(1);
}
const OUT = String(arg("out", "extract/site"));
const MAX_PAGES = +arg("max-pages", 80);
const CONC = Math.max(1, +arg("concurrency", 4));
const IDLE_MS = +arg("idle", 10000);
const MOBILE_MODE = String(arg("mobile", "auto"));
const FORCE = !!arg("force", false);
const MAX_ASSETS = +arg("max-assets", 0);

const SCOPE = String(arg("scope", "") || "");

const ORIGIN = new URL(TARGET).origin;
const HOST = new URL(TARGET).hostname;

// ── 경로 스코프(멀티현장 포털 방어) ──────────────────────────────────────
// 한 도메인에 현장이 수백 개 얹힌 포털(건설사 통합 분양 사이트 등)에서는 same-origin BFS가
// 남의 현장으로 번져 상한을 통째로 태운다. --scope=/<현장 경로 접두사>/ 로 접두사를 주면
// 그 아래만 크롤한다. 자산(이미지·문서)은 보통 /files/ 같은 공용 경로에 있으므로 스코프를
// 적용하지 않는다 — 페이지 BFS에만 건다.
const inScope = (u) => {
  if (!SCOPE) return true;
  try { return new URL(u).pathname.startsWith(SCOPE); } catch { return false; }
};

// ── 유틸 ────────────────────────────────────────────────────────────────
const dir = (p) => { fs.mkdirSync(p, { recursive: true }); return p; };
const sha = (b) => crypto.createHash("sha1").update(b).digest("hex").slice(0, 16);
const rel = (...p) => p.join("/");   // manifest·ocr.json에 적는 경로는 항상 슬래시(윈도우 역슬래시 금지 — 3·4단계가 그대로 읽는다)
const jw = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2), "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();

// URL 정규화: 해시 제거·기본포트 제거·trailing slash 통일(쿼리는 라우트 식별자라 보존)
function norm(u) {
  try {
    const x = new URL(u, TARGET);
    x.hash = "";
    if (x.pathname.length > 1 && x.pathname.endsWith("/")) x.pathname = x.pathname.slice(0, -1);
    return x.toString();
  } catch { return null; }
}
// URL → 저장 폴더명(쿼리 포함, 덮어쓰기 금지)
function slugOf(u) {
  const x = new URL(u);
  let s = (x.pathname + (x.search ? "__" + x.search.slice(1) : "")).replace(/^\/+/, "");
  s = s.replace(/[^\w가-힣.\-=&_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return (s || "index").slice(0, 120);
}

// ── 차단 목록(⓪ 리소스 차단) — 콘텐츠 자산은 절대 차단하지 않는다 ───────
const BLOCK_URL = [
  /google-analytics\.com/i, /googletagmanager\.com/i, /doubleclick\.net/i, /googlesyndication/i,
  /facebook\.(net|com)/i, /connect\.facebook/i, /criteo\./i, /taboola\./i, /outbrain\./i,
  /hotjar\./i, /clarity\.ms/i, /wcs\.naver\.net/i, /adfit\.daum/i, /ad\.doubleverify/i,
  /adservice\./i, /adsystem\./i, /scorecardresearch/i, /newrelic/i, /sentry\.io/i,
];
const blocked = { font: 0, tracker: 0 };

// ── 크롤 트랩 방어(과거 사고: 언론사 CMS 경로 무한 증식) ────────────────
// 기사 미러/게시판 상세는 leaf — 본문·이미지만 저장하고 그 안의 <a>는 큐에 넣지 않는다.
const LEAF_RE = /(pr_view|board_view|bbs_view|view\.php|article(View|_view)|_view\.asp|\/view\/)/i;
// 전역 SKIP — 대상 origin 안에 있어도 크롤하지 않는 외부 CMS 경로 패턴
const SKIP_RE = /(\/news\/article|\/bbs\/|\/board\/list|sc_section_code|sc_sub_section_code|\/tag\/|\/search)/i;
const ASSET_EXT_RE = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|ico|mp4|webm|mov|pdf|hwp|hwpx|docx?|xlsx?|pptx?|zip|txt|xml|json|css|js|woff2?|ttf|eot)(\?|$)/i;
// XHR 전용 엔드포인트 — 페이지가 아니다. 인라인 script에서 경로 문자열로 발견돼 큐에 들어가면
// 빈 텍스트 페이지로 저장돼 [완료 조건]②·G2-COMPLETE를 거짓 RED로 만든다(응답 본문은 ⓪ API 후킹이 이미 api/에 저장).
const XHR_EXT_RE = /\.(ajax|action|jsonp|do\.json)(\?|$)/i;
const DOC_EXT_RE = /\.(pdf|hwp|hwpx|docx?|xlsx?|pptx?|zip)(\?|$)/i;

// ── 산출 폴더 ───────────────────────────────────────────────────────────
dir(OUT); dir(path.join(OUT, "pages")); dir(path.join(OUT, "images"));
dir(path.join(OUT, "videos")); dir(path.join(OUT, "docs"));

// ── manifest(resume·dedup 인덱스) ───────────────────────────────────────
const MF_PATH = path.join(OUT, "manifest.json");
const emptyMf = () => ({
  target: TARGET, startedAt: nowIso(), finishedAt: null,
  pages: [], images: [], videos: [], docs: [], api: [],
  externalAssets: [], aliases: [], iframes: [], queryRoutes: [],
  frontier: [],                        // 발견했지만 아직 방문 못 한 URL — 중단 후 재실행 인계용
  hashes: {}, status: {}, notes: [],
});
let MF = emptyMf();
if (!FORCE && fs.existsSync(MF_PATH)) {
  try {
    const prev = JSON.parse(fs.readFileSync(MF_PATH, "utf8"));
    if (prev && prev.target === TARGET) { MF = { ...emptyMf(), ...prev, startedAt: nowIso(), finishedAt: null }; }
  } catch { /* 손상된 manifest는 무시하고 새로 */ }
}
const doneUrl = (u) => !FORCE && MF.status[u] === "ok";
const seenHash = (h) => !FORCE && !!MF.hashes[h];

// ── 이미지 치수 파서(의존성 0 — ④ 트리아지의 최소 조건 판정용) ──────────
function imageSize(buf) {
  try {
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };  // PNG
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };    // GIF
    if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") {                      // WebP
      const t = buf.slice(12, 16).toString("ascii");
      if (t === "VP8X") return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
      if (t === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      if (t === "VP8L") {
        const b = buf.readUInt32LE(21);
        return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
      }
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {                                                                                 // JPEG
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
          return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
  } catch { /* 헤더 파싱 실패 = 미상 */ }
  return { w: 0, h: 0 };
}

// ── 브라우저 ────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const stats = {
  visited: 0, skipped: 0, failed: [], emptyText: [], dedupPages: 0, dedupAssets: 0,
  resumeSkipped: 0, apiCaptured: 0, downloads: 0, downloadFail: [], externalSkipped: 0,
  interactions: 0, states: 0, throttled: 0, mobileRun: false, mobileReason: "",
};
const pageHashes = new Set();
const assetQueue = new Map();   // url → {kind, from}
const pendingDocs = new Set();

async function makeContext(viewport, ua) {
  const ctx = await browser.newContext({
    viewport, userAgent: ua, ignoreHTTPSErrors: true,
    locale: "ko-KR", timezoneId: "Asia/Seoul",
  });
  // ⓪ 리소스 차단 — 트래커/광고/분석/웹폰트만. 콘텐츠 자산(image/video/pdf)은 통과.
  await ctx.route("**/*", (route) => {
    const req = route.request();
    const u = req.url();
    if (req.resourceType() === "font") { blocked.font++; return route.abort(); }
    if (BLOCK_URL.some((re) => re.test(u))) { blocked.tracker++; return route.abort(); }
    return route.continue();
  });
  return ctx;
}

// 네트워크 응답 후킹 — 페이지 시작 전 등록해야 초기 요청을 놓치지 않는다.
function hookResponses(page, pageUrl, apiBucket) {
  page.on("response", async (res) => {
    try {
      const u = res.url();
      const ct = (res.headers()["content-type"] || "").toLowerCase();
      const st = res.status();
      if (st === 429 || st === 503) stats.throttled++;
      if (u.startsWith("data:") || BLOCK_URL.some((re) => re.test(u))) return;
      if (/application\/json|text\/json/.test(ct) && res.request().resourceType() === "xhr") {
        const body = await res.text().catch(() => "");
        if (body && body.length > 2) { apiBucket.push({ url: u, body }); stats.apiCaptured++; }
        return;
      }
      if (/^image\//.test(ct)) return void assetQueue.set(u, { kind: "image", from: pageUrl });
      if (/^video\//.test(ct)) return void assetQueue.set(u, { kind: "video", from: pageUrl });
      if (/application\/pdf|officedocument|msword|excel|hancom|zip/.test(ct) || DOC_EXT_RE.test(u))
        return void assetQueue.set(u, { kind: "doc", from: pageUrl });
    } catch { /* 응답 소비 실패는 무시 */ }
  });
}

// ── ② 페이지 처리 ───────────────────────────────────────────────────────
async function visit(ctx, url, viewportTag) {
  const apiBucket = [];
  const page = await ctx.newPage();
  hookResponses(page, url, apiBucket);
  let finalUrl = url;
  try {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: IDLE_MS });
    } catch {
      // networkidle이 안 잡히는 사이트(캐러셀·배경영상·라이브챗)가 흔하다 → 즉시 fallback
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
      await sleep(3000);
    }
    finalUrl = norm(page.url()) || url;

    // 끝까지 스크롤(무한스크롤 포함) — 높이가 안정될 때까지, 상한 30회
    let last = 0;
    for (let i = 0; i < 30; i++) {
      const h = await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); return document.body.scrollHeight; }).catch(() => 0);
      if (h === last) break;
      last = h; await sleep(400);
    }
    await sleep(1500);

    const slug = slugOf(finalUrl) + (viewportTag === "m" ? "__m" : "");

    const grab = () => page.evaluate(() => ({
      text: document.body ? document.body.innerText : "",
      html: document.documentElement.outerHTML,
      title: document.title,
      canonical: (document.querySelector('link[rel=canonical]') || {}).href || "",
      meta: Object.fromEntries([...document.querySelectorAll("meta")].map((m) => [m.getAttribute("name") || m.getAttribute("property") || "", m.getAttribute("content") || ""]).filter(([k]) => k)),
      headings: [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => h.tagName + ": " + h.innerText.trim()).filter((t) => t.length > 4),
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent || ""),
      attrs: [...document.querySelectorAll("[alt],[title],[aria-label],[placeholder],label")]
        .map((e) => [e.getAttribute("alt"), e.getAttribute("title"), e.getAttribute("aria-label"), e.getAttribute("placeholder"), e.tagName === "LABEL" ? e.innerText : ""].filter(Boolean).join(" | "))
        .filter((s) => s.trim().length > 1),
      links: [...document.querySelectorAll("a[href]")].map((a) => a.href),
      // JS 내비게이션까지 파싱(과거 누락 원인 ① — 페이지 통째 누락).
      // 속성값은 따옴표 없이 그대로 오므로(`data-href="/foo"` → "/foo") **값 자체를 후보로** 넘긴다.
      // onclick·인라인 <script>는 문자열 안에 경로가 있으므로 원문을 넘겨 따옴표 패턴으로 뽑는다.
      attrLinks: [...document.querySelectorAll("[data-href],[data-url],[data-link],[data-target],[data-page],[data-move]")]
        .flatMap((e) => ["data-href", "data-url", "data-link", "data-target", "data-page", "data-move"].map((a) => e.getAttribute(a)))
        .filter((v) => v && /^[./]/.test(v)),
      scriptText: [...document.querySelectorAll("[onclick]")].map((e) => e.getAttribute("onclick")).join(" ")
        + " " + [...document.querySelectorAll("script:not([src])")].map((s) => s.textContent || "").join(" ").slice(0, 200000),
      // 쿼리/파라미터 조합 후보(탭·필터·정렬 select) — 앵커로 노출되지 않는 라우트를 만든다.
      selectCombos: [...document.querySelectorAll("select[name]")]
        .flatMap((s) => [...s.querySelectorAll("option[value]")].slice(0, 20)
          .map((o) => (o.getAttribute("value") || "").trim())
          .filter((v) => v && v.length < 40)
          .map((v) => location.pathname + "?" + encodeURIComponent(s.getAttribute("name")) + "=" + encodeURIComponent(v)))
        .slice(0, 40),
      // ③ DOM 자산(네트워크 후킹으로 안 잡히는 background-image·srcset·poster)
      domAssets: (() => {
        const out = [];
        for (const i of document.querySelectorAll("img")) { if (i.currentSrc) out.push(i.currentSrc); if (i.src) out.push(i.src); if (i.srcset) i.srcset.split(",").forEach((s) => out.push(s.trim().split(/\s+/)[0])); }
        for (const s of document.querySelectorAll("picture source[srcset]")) s.srcset.split(",").forEach((x) => out.push(x.trim().split(/\s+/)[0]));
        for (const v of document.querySelectorAll("video")) { if (v.poster) out.push(v.poster); if (v.src) out.push(v.src); for (const s of v.querySelectorAll("source[src]")) out.push(s.src); }
        for (const e of document.querySelectorAll("*")) {
          const bg = getComputedStyle(e).backgroundImage;
          if (bg && bg !== "none") for (const m of bg.matchAll(/url\(["']?(.*?)["']?\)/g)) out.push(new URL(m[1], location.href).href);
        }
        for (const im of document.querySelectorAll("image")) { const h = im.getAttribute("href") || im.getAttribute("xlink:href"); if (h) out.push(new URL(h, location.href).href); }
        return [...new Set(out)].filter((u) => u && !u.startsWith("data:"));
      })(),
      // 문서(PDF·공고문) — content-type만 보면 놓치는 버튼/스크립트 뒤 파일
      docHints: [...document.querySelectorAll("a[href],[onclick],[data-href],[data-file],[data-url]")]
        .map((e) => [e.getAttribute("href"), e.getAttribute("onclick"), e.getAttribute("data-href"), e.getAttribute("data-file"), e.getAttribute("data-url")].filter(Boolean).join(" "))
        .join(" "),
      iframes: [...document.querySelectorAll("iframe[src]")].map((f) => f.src),
      mobileHints: [...document.querySelectorAll("link[rel=alternate],a[href]")].map((e) => e.getAttribute("href") || "").join(" "),
    })).catch(() => null);

    const snap = await grab();
    if (!snap) throw new Error("페이지 평가 실패");

    // 본문 해시 dedup(같은 내용 다른 URL은 alias로 병합)
    const bodyHash = sha(snap.text.replace(/\s+/g, " ").trim() || snap.html);
    if (pageHashes.has(bodyHash)) {
      MF.aliases.push({ url: finalUrl, sameAs: bodyHash });
      MF.status[url] = "ok"; MF.status[finalUrl] = "ok";   // 처리 완료로 표시(안 하면 재실행마다 frontier에 남는다)
      stats.dedupPages++;
      await page.close();
      return { finalUrl, snap, leaf: true };
    }
    pageHashes.add(bodyHash);

    const pdir = dir(path.join(OUT, "pages", slug));   // 폴더는 저장이 확정된 뒤에만 만든다(빈 폴더 방지)
    fs.writeFileSync(path.join(pdir, "page.html"), snap.html, "utf8");
    fs.writeFileSync(path.join(pdir, "text.txt"), snap.text, "utf8");
    fs.writeFileSync(path.join(pdir, "attrs.txt"), snap.attrs.join("\n"), "utf8");
    jw(path.join(pdir, "meta.json"), {
      url: finalUrl, requestedUrl: url, viewport: viewportTag, title: snap.title,
      canonical: snap.canonical, meta: snap.meta, headings: snap.headings, jsonld: snap.jsonld,
      bodyHash, capturedAt: nowIso(),
    });
    if (!snap.text || snap.text.trim().length < 30) stats.emptyText.push(finalUrl);

    // ② 인터랙션 — 탭/슬라이드/아코디언/더보기. 상태별 innerText를 매번 저장.
    const SELECTORS = [
      "[role=tab]", ".tab a", ".tab button", ".tabs a", ".tabs button", "[data-tab]",
      ".swiper-pagination-bullet", ".slick-dots li", "[class*=carousel] [class*=next]", "[class*=swiper] [class*=next]",
      "summary", "[class*=accordion] [class*=head]", "[class*=acco] button",
      "[class*=more]:not(a[href^=http])", "[data-toggle]", "[aria-expanded]",
    ];
    const stateSeen = new Set([bodyHash]);
    for (const sel of SELECTORS) {
      let els = [];
      try { els = await page.$$(sel); } catch { continue; }
      for (const el of els.slice(0, 12)) {                 // 셀렉터당 ≤12개
        try {
          await el.click({ timeout: 2500 });
          stats.interactions++;
          await sleep(250);                                // 간격 0.25s
          const t = await page.evaluate(() => (document.body ? document.body.innerText : "")).catch(() => "");
          const h = sha(t.replace(/\s+/g, " ").trim());
          if (t && !stateSeen.has(h)) {                    // 직전 상태와 같으면 저장 생략
            stateSeen.add(h);
            const key = sha(sel + h).slice(0, 8);
            fs.writeFileSync(path.join(pdir, `text.${key}.txt`), t, "utf8");
            stats.states++;
          }
        } catch { /* 클릭 불가 요소는 건너뜀 */ }
      }
    }

    // API 응답 저장(SPA 정본)
    if (apiBucket.length) {
      const adir = dir(path.join(pdir, "api"));
      apiBucket.forEach((a, i) => {
        const name = sha(a.url) + "-" + i + ".json";
        fs.writeFileSync(path.join(adir, name), a.body, "utf8");
        MF.api.push({ page: finalUrl, url: a.url, file: rel("pages", slug, "api", name) });
      });
    }

    // ③ 자산 큐에 DOM 자산·문서 힌트 추가
    for (const u of snap.domAssets) {
      const abs = norm(u); if (!abs) continue;
      const kind = /\.(mp4|webm|mov)(\?|$)/i.test(abs) ? "video" : DOC_EXT_RE.test(abs) ? "doc" : "image";
      if (!assetQueue.has(abs)) assetQueue.set(abs, { kind, from: finalUrl });
    }
    for (const m of String(snap.docHints).matchAll(/(https?:\/\/[^\s"'()]+|\/[^\s"'()]+)\.(pdf|hwp|hwpx|docx?|xlsx?|pptx?|zip)/gi)) {
      const abs = norm(m[0]); if (abs) { assetQueue.set(abs, { kind: "doc", from: finalUrl }); pendingDocs.add(abs); }
    }
    for (const f of snap.iframes) if (f && !f.startsWith(ORIGIN)) MF.iframes.push({ page: finalUrl, src: f });

    MF.pages.push({ url: finalUrl, slug, viewport: viewportTag, bodyHash, chars: snap.text.length, states: stateSeen.size - 1 });
    MF.status[url] = "ok"; MF.status[finalUrl] = "ok";
    if (new URL(finalUrl).search) MF.queryRoutes.push(finalUrl);

    await page.close();
    return { finalUrl, snap, leaf: LEAF_RE.test(finalUrl) };
  } catch (e) {
    stats.failed.push({ url, error: String(e).slice(0, 160) });
    MF.status[url] = "fail";
    await page.close().catch(() => {});
    return null;
  }
}

// ── ① 페이지 발견 + BFS(워커 풀) ────────────────────────────────────────
async function seedUrls(ctx) {
  const seeds = new Set([norm(TARGET)]);
  const p = await ctx.newPage();
  for (const f of ["/robots.txt", "/sitemap.xml", "/sitemap_index.xml"]) {
    try {
      const r = await p.request.get(ORIGIN + f, { timeout: 15000 });
      if (!r.ok()) continue;
      const body = await r.text();
      for (const m of body.matchAll(/https?:\/\/[^\s<"']+/g)) {
        const u = norm(m[0]);
        if (u && u.startsWith(ORIGIN) && !ASSET_EXT_RE.test(u) && !XHR_EXT_RE.test(u) && !SKIP_RE.test(u) && inScope(u)) seeds.add(u);
      }
      if (f === "/robots.txt") for (const m of body.matchAll(/Sitemap:\s*(\S+)/gi)) {
        const r2 = await p.request.get(m[1], { timeout: 15000 }).catch(() => null);
        if (r2 && r2.ok()) for (const mm of (await r2.text()).matchAll(/<loc>([^<]+)<\/loc>/g)) {
          const u = norm(mm[1]);
          if (u && u.startsWith(ORIGIN) && !SKIP_RE.test(u) && inScope(u)) seeds.add(u);
        }
      }
    } catch { /* 없으면 그만 */ }
  }
  await p.close();
  return [...seeds].filter(Boolean);
}

async function crawl(ctx, viewportTag) {
  // resume: 지난 실행에서 발견했지만 아직 못 간 frontier를 먼저 넣는다.
  // (이게 없으면 중간에 끊긴 크롤을 재실행할 때 seed만 skip하고 나머지를 영영 재발견 못 한다)
  const queue = [...new Set([...(FORCE ? [] : MF.frontier || []), ...(await seedUrls(ctx))])].filter(Boolean).filter(inScope);
  const enqueued = new Set(queue);
  let cursor = 0;
  let capped = false;
  let sinceSave = 0;

  const worker = async () => {
    while (true) {
      if (cursor >= queue.length) return;
      const url = queue[cursor++];
      if (!url) continue;
      if (doneUrl(url)) { stats.resumeSkipped++; continue; }
      if (MF.pages.length >= MAX_PAGES) { capped = true; return; }
      if (stats.throttled > 0) await sleep(Math.min(4000, stats.throttled * 500));   // 429/503 자동 감속

      const r = await visit(ctx, url, viewportTag);
      stats.visited++;
      if (++sinceSave >= 10) {   // 중간 체크포인트 — 크래시·중단해도 여기까지는 resume된다
        sinceSave = 0;
        MF.frontier = [...enqueued].filter((u) => MF.status[u] !== "ok");
        jw(MF_PATH, MF);
      }
      if (!r || r.leaf) continue;    // 기사 미러/게시판 상세 = leaf → 내부 링크를 큐에 넣지 않는다

      const found = new Set(r.snap.links);
      for (const v of r.snap.attrLinks || []) found.add(v);                      // data-* 속성값(따옴표 없음)
      for (const v of r.snap.selectCombos || []) found.add(v);                   // select 기반 쿼리 조합
      for (const m of String(r.snap.scriptText).matchAll(/['"`](\/[^'"`\s<>]{1,200})['"`]/g)) found.add(m[1]);  // onclick·인라인 script 안 경로
      for (const raw of found) {
        const u = norm(raw);
        if (!u || !u.startsWith(ORIGIN)) continue;
        if (ASSET_EXT_RE.test(u) || XHR_EXT_RE.test(u) || SKIP_RE.test(u)) continue;
        if (!inScope(u)) continue;                                              // --scope 밖(남의 현장·포털 공용) = 큐에 넣지 않음
        if (enqueued.has(u) || doneUrl(u)) continue;
        enqueued.add(u); queue.push(u);
      }
    }
  };
  await Promise.all(Array.from({ length: CONC }, worker));
  MF.frontier = [...enqueued].filter((u) => MF.status[u] !== "ok");   // 남은 frontier를 다음 실행에 인계
  return { capped, discovered: enqueued.size, remaining: MF.frontier.length };
}

// ── ③ 다운로드 ─────────────────────────────────────────────────────────
// 규칙: 이미지·영상은 **동일 출처만**(외부는 URL만 기록 — 언론사 임베드 사진·광고 오염 방지)
//       문서(PDF·공고문·약관)는 **외부도 받는다**(3단계 사실대조의 정본이 되므로 예외)
async function download(ctx) {
  const req = ctx.request;
  const entries = [...assetQueue.entries()];
  const list = MAX_ASSETS > 0 ? entries.slice(0, MAX_ASSETS) : entries;
  let i = 0;

  const worker = async () => {
    while (i < list.length) {
      const [url, meta] = list[i++];
      const sameOrigin = (() => { try { return new URL(url).hostname === HOST; } catch { return false; } })();
      if ((meta.kind === "image" || meta.kind === "video") && !sameOrigin) {
        MF.externalAssets.push({ url, kind: meta.kind, from: meta.from });
        stats.externalSkipped++;
        continue;
      }
      try {
        const r = await req.get(url, { timeout: meta.kind === "image" ? 60000 : 180000 });
        if (!r.ok()) { stats.downloadFail.push({ url, status: r.status() }); continue; }
        const buf = Buffer.from(await r.body());
        const h = sha(buf);
        if (seenHash(h)) { stats.dedupAssets++; continue; }
        const ct = (r.headers()["content-type"] || "").split(";")[0];
        const urlExt = (url.match(/\.([a-z0-9]{2,5})(\?|$)/i) || [])[1];
        const ext = (urlExt || (ct.split("/")[1] || "bin")).toLowerCase().replace("jpeg", "jpg");
        const folder = meta.kind === "image" ? "images" : meta.kind === "video" ? "videos" : "docs";
        const file = path.join(OUT, folder, `${h}.${ext}`);
        dir(path.dirname(file));                        // 쓰기 직전 폴더 보장(ENOENT 방어)
        fs.writeFileSync(file, buf);
        MF.hashes[h] = rel(folder, `${h}.${ext}`);
        const rec = { file: rel(folder, `${h}.${ext}`), url, hash: h, bytes: buf.length, from: meta.from, contentType: ct };
        if (meta.kind === "image") { const d = imageSize(buf); rec.w = d.w; rec.h = d.h; MF.images.push(rec); }
        else if (meta.kind === "video") MF.videos.push(rec);
        else MF.docs.push(rec);
        stats.downloads++;
      } catch (e) {
        stats.downloadFail.push({ url, error: String(e).slice(0, 120) });
      }
    }
  };
  await Promise.all(Array.from({ length: CONC }, worker));
}

// ── ④ OCR 후보 산출 (SVG는 직접 파싱, 래스터는 비전 LLM에 넘길 목록) ────
// ⚠️ 트리아지로 "사진 같아 보인다"고 빼지 않는다 — 분양/임대/조합 CG 인포그래픽 패널이
//    사진으로 오분류되면 그게 곧 정보 누락이다(2단계 ④ 규칙). 최소 조건(한 변 ≥200px)만 건다.
function buildOcrCandidates() {
  const out = [];
  for (const img of MF.images) {
    const abs = path.join(OUT, img.file);
    if (!fs.existsSync(abs)) continue;
    const isSvg = /\.svg$/i.test(img.file);
    let svgText = null, outlined = false;
    if (isSvg) {
      const s = fs.readFileSync(abs, "utf8");
      const texts = [...s.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi)].map((m) => m[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
      svgText = texts;
      outlined = texts.length === 0;              // 아웃라인 SVG(글자→패스) → 래스터처럼 비전 OCR로
    }
    const w = img.w || 0, h = img.h || 0;
    const minSide = Math.min(w || 9999, h || 9999);
    const tooSmall = w && h && minSide < 200;      // 치수 미상은 제외하지 않는다(안전 측)
    const ratio = w && h ? +(Math.max(w, h) / Math.min(w, h)).toFixed(2) : 0;
    const needsOcr = !tooSmall && (!isSvg || outlined);
    out.push({
      file: img.file, hash: img.hash, url: img.url, from: img.from,
      w, h, ratio, bytes: img.bytes,
      svg: isSvg ? { text: svgText, outlined } : null,
      needsOcr,
      skipReason: needsOcr ? null : (tooSmall ? "한 변 <200px" : "SVG <text> 직접 파싱 완료"),
      // 힌트: 비전 LLM이 고밀도 표/세로 긴 CG 패널을 크롭 재판독할지 판단하는 재료(제외 기준 아님)
      hint: { likelyPanel: (h >= 1200) || (ratio >= 1.8) || (w >= 1400), highDensity: bytesPerPixel(img) },
      llm: null, crosscheck: null, mismatch: null, recheck: false,
    });
  }
  return out;
}
function bytesPerPixel(img) {
  if (!img.w || !img.h || !img.bytes) return null;
  return +(img.bytes / (img.w * img.h)).toFixed(4);
}

// ── 모바일 2뷰포트 판정(항상 2회 돌리지 않는다) ─────────────────────────
function shouldRunMobile() {
  if (MOBILE_MODE === "on") return { run: true, reason: "--mobile=on 강제" };
  if (MOBILE_MODE === "off") return { run: false, reason: "--mobile=off 지정" };
  const hay = MF.pages.map((p) => p.url).join(" ") + " " + MF.images.map((i) => i.url).join(" ");
  if (/(^|[\/_.])m\.[a-z0-9-]+\./i.test(hay) || /_m[\/.]/i.test(hay) || /\/mobile\//i.test(hay))
    return { run: true, reason: "모바일 분리 자산/호스트(_m·m.·/mobile/) 정황 발견" };
  return { run: false, reason: "모바일 분리 자산·라우트 정황 없음 → PC 단일(2배 작업 제거)" };
}

// ── 실행 ────────────────────────────────────────────────────────────────
const t0 = Date.now();
console.log(`▶ 추출 시작: ${TARGET} → ${OUT}`);
console.log(`  max-pages=${MAX_PAGES} concurrency=${CONC} idle=${IDLE_MS}ms resume=${!FORCE}`);

const pcCtx = await makeContext({ width: 1440, height: 900 });
const pcRes = await crawl(pcCtx, "pc");
await pcCtx.close();

const mob = shouldRunMobile();
stats.mobileRun = mob.run; stats.mobileReason = mob.reason;
if (mob.run) {
  const mCtx = await makeContext({ width: 390, height: 844 }, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1");
  await crawl(mCtx, "m");
  await mCtx.close();
}

const dlCtx = await makeContext({ width: 1440, height: 900 });
await download(dlCtx);
await dlCtx.close();
await browser.close();

const ocr = buildOcrCandidates();
jw(path.join(OUT, "ocr.json"), ocr);
MF.finishedAt = nowIso();
jw(MF_PATH, MF);

// ── report.txt (2단계 [완료 조건] 자가검증) ─────────────────────────────
const secs = Math.round((Date.now() - t0) / 1000);
const domImgs = MF.images.length + stats.externalSkipped;
const report = [
  `# 추출 리포트 — ${TARGET}`,
  `생성: ${nowIso()} · 소요 ${Math.floor(secs / 60)}분 ${secs % 60}초`,
  ``,
  `## ① 페이지`,
  `경로 스코프: ${SCOPE ? SCOPE + " 아래만 크롤(--scope) — 멀티현장 포털에서 남의 현장으로 번지는 것 방지" : "(없음) origin 전체"}`,
  `발견 URL ${pcRes.discovered}건 · 방문 ${stats.visited}건 · 저장 ${MF.pages.length}건 · 본문중복 병합 ${stats.dedupPages}건`,
  `미방문(실패) ${stats.failed.length}건${stats.failed.length ? ": " + stats.failed.slice(0, 10).map((f) => f.url + " (" + f.error + ")").join(" / ") : ""}`,
  pcRes.capped
    ? `⚠️ BFS 상한 ${MAX_PAGES}p 도달 · 미방문 frontier ${pcRes.remaining}건 — --max-pages를 올려 재실행하면 이어서 받는다(resume). **상한에 걸린 채 "미방문 0"이라고 하지 말 것.**`
    : `상한(${MAX_PAGES}p) 미도달 · 미방문 frontier ${pcRes.remaining}건 — 발견분 전량 처리`,
  `쿼리/파라미터 라우트 ${MF.queryRoutes.length}건${MF.queryRoutes.length ? ": " + MF.queryRoutes.slice(0, 8).join(", ") : ""}`,
  ``,
  `## ② 텍스트`,
  `빈 텍스트 페이지 ${stats.emptyText.length}건${stats.emptyText.length ? ": " + stats.emptyText.slice(0, 8).join(", ") : ""}`,
  `인터랙션 클릭 ${stats.interactions}회 → 상태별 텍스트 ${stats.states}개 추가 저장`,
  `API(XHR JSON) 캡처 ${stats.apiCaptured}건 — SPA는 이게 정본(클릭 루프 우회)`,
  `모바일 2뷰포트: ${stats.mobileRun ? "실행" : "미실행"} — ${stats.mobileReason}`,
  ``,
  `## ③ 다운로드`,
  `이미지 ${MF.images.length} · 영상 ${MF.videos.length} · 문서 ${MF.docs.length} · 해시중복 생략 ${stats.dedupAssets} · resume 생략 ${stats.resumeSkipped}`,
  `실패 ${stats.downloadFail.length}건${stats.downloadFail.length ? ": " + stats.downloadFail.slice(0, 6).map((d) => d.url + " " + (d.status || d.error)).join(" / ") : ""}`,
  `외부 호스팅 이미지/영상: ${stats.externalSkipped}건 URL만 기록(다운로드 안 함) — images/ 내 외부 출처 0건이어야 정상`,
  `DOM+네트워크 이미지 후보 ${domImgs}건 중 동일출처 ${MF.images.length}건 저장`,
  `공식 1차 문서(PDF·공고문·약관 등): ${MF.docs.length}건 ${MF.docs.length ? "확보 — " + MF.docs.slice(0, 6).map((d) => path.basename(d.file) + " ← " + d.url).join(" / ") : "**0건 — 미확보 사유를 사람이 기재할 것**(버튼/JS 뒤 파일 여부 재확인). 3단계 정본 인계 불가"}`,
  `cross-origin iframe(수집 불가) ${MF.iframes.length}건${MF.iframes.length ? ": " + [...new Set(MF.iframes.map((i) => i.src))].slice(0, 5).join(", ") : ""}`,
  ``,
  `## ④ 이미지 속 텍스트 — 후보 산출까지(전사는 비전 LLM 단계)`,
  `OCR 대상 ${ocr.filter((o) => o.needsOcr).length}건 / 전체 이미지 ${ocr.length}건`,
  `  · SVG <text> 직접 파싱 ${ocr.filter((o) => o.svg && !o.svg.outlined).length}건`,
  `  · 아웃라인 SVG(글자→패스) → 래스터 OCR 전환 ${ocr.filter((o) => o.svg && o.svg.outlined).length}건`,
  `  · 제외 ${ocr.filter((o) => !o.needsOcr).length}건(사유: 한 변 <200px 또는 SVG 파싱 완료) — **"사진 같아서" 제외는 0건이다**`,
  `  · 고밀도/세로 긴 CG 패널 힌트 ${ocr.filter((o) => o.hint.likelyPanel).length}건 → 크롭 재판독 우선 대상(요약 금지)`,
  `교차검증(Tesseract): 이 스크립트는 실행하지 않음 — 비전 LLM 단계에서 실행/미실행을 명시할 것(묵시적 생략 금지)`,
  ``,
  `## 효율`,
  `차단 리소스: 웹폰트 ${blocked.font}건 · 트래커/광고 ${blocked.tracker}건`,
  `429/503 감속 발동 ${stats.throttled}회`,
  ``,
  `## 다음`,
  `1) ocr.json의 needsOcr=true 항목을 비전 LLM으로 전사(문맥 grounding: 같은 페이지 text.txt·헤딩·고유명사 동봉, 출력은 구조화 JSON).`,
  `2) 고밀도 표·도면은 크롭/확대 재판독으로 셀 단위 전사.`,
  `3) 위 ①~④ 미달 항목이 있으면 옵션을 조정해 재실행(resume이라 완료분은 건너뛴다).`,
].join("\n");
fs.writeFileSync(path.join(OUT, "report.txt"), report, "utf8");

console.log("\n" + report);
console.log(`\n✅ 추출 완료 → ${OUT}  (pages ${MF.pages.length} · images ${MF.images.length} · docs ${MF.docs.length} · ${secs}s)`);
