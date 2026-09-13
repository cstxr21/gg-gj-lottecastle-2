/**
 * 마스터 검증 게이트 (1~16단계 완료조건 1커맨드 강제) — config-driven, 현장값 하드코딩 0.
 *
 * 동작:
 *  1) docs/일-*단계-*.md의 `## 완료조건 (기계 판정)` 블록에서 `[Gxx-KEY] ... | auto|manual | blocker|권고` 게이트ID·심각도를 파싱.
 *  2) 각 ID가 아래 CHECKS에 구현돼 있는지 검사(미구현 = RED — 완료조건만 적고 검사 안 만든 누락을 잡음).
 *  3) auto = 실제 실행(빌드결과 .next·public·src·site.ts 읽어 PASS/FAIL+근거). manual = reports/manual-evidence.json 증거 필수.
 *  4) 하나라도 FAIL/미구현/증거없음 = 전체 RED → "완료/배포" 금지.
 *
 * 신규 현장: docs 프로세스 md 전체 복붙 → 이 스크립트를 scripts/verify.mjs로 저장(16단계 md 코드블록이 원본) →
 *           content.ts/site.ts를 그 현장 값으로 채움 → `npm run verify`. 라우트·슬러그는 자동 감지.
 *
 * 두 가지 실행 모드(빌드 시간 절약):
 *  · `npm run verify`        = 빌드 안 함(수 초). .next를 읽는 게이트 26개는 ⏭미판정, 소스·public·reports 게이트만 판정.
 *                              중간 단계 반복용 — `-- --stage=N`과 함께 쓴다.
 *  · `npm run verify:build`  = `next build` 후 전체 판정. 단계 마감·배포 판정은 반드시 이것.
 *  ※ .next가 src/public보다 오래되면(stale) 빌드 게이트를 자동 ⏭ — 옛 빌드로 거짓 GREEN이 나지 않게.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const APP = ".next/server/app";
const ok = (p) => fs.existsSync(p);
const read = (p) => (ok(p) ? fs.readFileSync(p, "utf8") : "");
const len = (s) => [...(s || "")].length;
function walk(d, a = []) {
  if (!ok(d)) return a;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else a.push(p);
  }
  return a;
}

// ── config 자동 감지 (현장값 하드코딩 금지) ─────────────────────────────
const SLUG = (read("src/lib/site.ts").match(/slug:\s*["']([^"']+)["']/) || [])[1] || "";
// 현장명(한글) — 본문 형태소 매칭 게이트(G14-BRANDDENS)의 대상 토큰. BRAND.short 우선, 없으면 첫 name 필드.
const BRAND_NAME = (read("src/lib/site.ts").match(/short:\s*["']([^"']+)["']/) || read("src/lib/site.ts").match(/name:\s*["']([^"']+)["']/) || [])[1] || "";
const ROUTES = ok(APP)
  ? fs.readdirSync(APP).filter((f) => f.endsWith(".html") && !f.startsWith("_")).map((f) => f.replace(".html", ""))
  : [];
const html = (r) => read(path.join(APP, r + ".html"));
const CONTENT_ROUTES = ROUTES.filter((r) => r !== "privacy");
// ⚠️ ROUTES는 **최상위 .html만** 본다(readdirSync 비재귀) — 구조 게이트(breadcrumb·meta·jsonld·내부링크)의 대상은
//    9개 주요 라우트라 그게 맞다. 그러나 **문구 게이트**가 이걸 쓰면 `/news/[slug]`·`/blog/[slug]` 같은
//    하위 페이지를 통째로 놓친다. 실측(현장 26곳, 2026-08-03): 빌드 499페이지 중 **240개가 하위 폴더**,
//    문구 위반의 **43%가 그 안**에 있었다. → 문구 검사(G6-VOICE·G14-ABUSE)는 아래 ALL_PAGES를 쓴다.
const ALL_PAGES = (() => {
  if (!ok(APP)) return [];
  const out = [];
  const walk = (dir, prefix) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) { walk(path.join(dir, e.name), prefix + e.name + "/"); continue; }
      if (!e.name.endsWith(".html") || e.name.startsWith("_")) continue;
      out.push(prefix + e.name.replace(".html", ""));
    }
  };
  walk(APP, "");
  return out.filter((r) => r !== "privacy");
})();
// ── 빌드 필요 여부 (빌드 시간 절약의 핵심) ───────────────────────────────
// 이 스크립트의 게이트 69개 중 .next(빌드 결과)를 읽는 건 아래 29개뿐 — 나머지 40개는 src·public·reports만 본다.
// 그래서 `npm run verify`(빌드 없음)는 수 초에 끝나고, 빌드가 있어야만 판정 가능한 게이트만 ⏭미판정으로 남긴다.
// 최종 판정(단계 마감·배포)은 `npm run verify:build` — ⏭가 0이어야 "완료/배포"다.
const NEEDS_BUILD = new Set([
  "G1-BUILD", "G5-ROUTES", "G6-VOICE", "G8-SOURCENOTE",
  "G10-HEROCTA", "G10-ABOUT", "G10-SCHEDULE", "G10-IMG",
  "G11-BREADCRUMB", "G11-LINKS", "G11-FLOORPLAN-IMG",
  "G12-FORM", "G12-SCHEDULE", "G12-TERM",
  "G13-NEWS", "G13-FAQ-DEDUP", "G13-VOLUME",
  "G14-META", "G14-JSONLD", "G14-OGIMG", "G14-LINKTEXT", "G14-3PARTY", "G14-ABUSE", "G14-PLACEHOLDER", "G14-BRANDDENS", "G14-ALTKW",
  "G16-UNUSED", "G16-SECRET", "G16-FONT",
]);
// ⚠️ 새 게이트를 CHECKS에 추가할 때 그 fn이 html()·ROUTES·ALL_PAGES·allHtml·.next 를 읽으면 **반드시 여기에도 ID를 넣는다.**
//    빠뜨리면 빌드 없이 돌릴 때 "빈 HTML = 위반 0"으로 거짓 GREEN이 난다.
const BUILT = ok(APP);
// stale 판정: .next(BUILD_ID mtime)가 src·public 최신 변경보다 오래되면 옛 빌드 기준이라 빌드 게이트를 믿을 수 없다.
const newestMs = (files) => files.reduce((t, f) => { try { return Math.max(t, fs.statSync(f).mtimeMs); } catch { return t; } }, 0);
const BUILD_MS = ok(".next/BUILD_ID") ? fs.statSync(".next/BUILD_ID").mtimeMs : (BUILT ? fs.statSync(APP).mtimeMs : 0);
const SRC_MS = newestMs(walk("src").concat(walk("public")));
const STALE = BUILT && SRC_MS > BUILD_MS + 1000;
const FRESH = BUILT && !STALE;   // FRESH일 때만 빌드 의존 게이트를 판정한다

// 2단계 <SAVE_PATH> 산출물 경로 — `extract/<현장명>/`이라 폴더명이 현장마다 달라 고정할 수 없다.
const extractFile = (name) => walk("extract").find((p) => path.basename(p) === name) || null;

// 본문 텍스트 추출 — <style>·<script>를 "내용째" 제거한 뒤 태그 제거.
// ⚠️ 태그만 지우면(`/<[^>]*>/g`) 인라인 CSS의 `width:100%`나 RSC 페이로드·JSON-LD가
//    본문으로 남아 문구 가드(G14-ABUSE·모집일정)가 오탐한다.
const stripCode = (h) => h
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<[^>]*>/g, " ")
  .replace(/\s+/g, " ");

// route → 기대 JSON-LD @type (14단계 스펙 — 현장 무관 규칙)
// 문자열=필수, 배열=any-of(둘 중 하나면 OK). sales의 Offer/AggregateOffer는 분양가 공개 시에만 생성(미공개=Residence 단독)이라 필수 매핑에서 제외 — 공개 시 검사는 아래 fn에서 선택적으로.
const JSONLD_MAP = {
  index: ["Residence"], overview: ["Residence"], location: ["Residence"],
  complex: ["Residence"], floorplan: ["Residence"],
  sales: ["Residence"], modelhouse: [["RealEstateAgent", "LocalBusiness"]], faq: ["FAQPage"],
};

const allHtml = ROUTES.map(html).join("\n");
const srcFiles = walk("src").filter((f) => /\.(tsx?|css)$/.test(f));
const srcText = srcFiles.map(read).join("\n");

// ── 검사 레지스트리: id → { stage, auto, fn } ──────────────────────────
// fn 은 { pass:boolean, ev:string } 반환. manual 은 fn 없음(증거파일로 판정).
const EVI = (() => { try { return JSON.parse(read("reports/manual-evidence.json")); } catch { return {}; } })();
// manual 증거 조회 — 두 형식 모두 수용:
//  (1) 평면: EVI["G6-READABLE"] = "증거 문자열"
//  (2) 중첩(실제 산출 형식): EVI["STAGE-3"].manualGates["G6-READABLE"] = "..." / 게이트id가 top-level 객체 키(EVI["G2-EXTRACT"]={status,summary,evidence})
function manualEvidence(id) {
  const asStr = (x) => (typeof x === "string" && x.trim() ? x.trim() : "");
  if (asStr(EVI[id])) return asStr(EVI[id]);
  const direct = EVI[id];
  if (direct && typeof direct === "object") {
    if (/pass/i.test(direct.status || "") || asStr(direct.summary) || (direct.evidence && Object.keys(direct.evidence).length))
      return asStr(direct.summary) || `status=${direct.status || "?"}`;
  }
  for (const v of Object.values(EVI)) {
    if (v && typeof v === "object")
      for (const bucket of [v.manualGates, v.autoGates, v.gates])
        if (bucket && asStr(bucket[id])) return asStr(bucket[id]);
  }
  return "";
}

const CHECKS = {
  // ── 1단계 세팅 ──
  "G1-BUILD": { stage: "1단계 세팅", auto: true, fn: () => ({ pass: ROUTES.length >= 9, ev: `라우트 HTML ${ROUTES.length}개(.next/server/app)` }) },
  "G1-STRUCT": { stage: "1단계 세팅", auto: true, fn: () => {
    const has = ok("src/lib") && ok("src/components") && /@\/\*/.test(read("tsconfig.json"));
    return { pass: has, ev: `src/lib·src/components·@/* alias ${has ? "존재" : "누락"}` };
  } },
  "G1-DEPS": { stage: "1단계 세팅", auto: true, fn: () => {
    const pj = read("package.json"); const tw = /"tailwindcss":\s*"[^"]*4/.test(pj);
    return { pass: tw, ev: `tailwindcss v4 ${tw ? "설치" : "미확인"}` };
  } },
  "G1-SCRIPTS": { stage: "1단계 세팅", auto: true, fn: () => {
    // 빌드 시간 계약: verify는 빌드를 물지 않는다(수 초 반복) · 빌드 포함 판정은 verify:build 하나로 모은다.
    // verify가 `next build`를 포함하면 단계마다 풀빌드가 돌아 작업 시간의 대부분이 빌드로 나간다 → RED.
    let s = {}; try { s = JSON.parse(read("package.json")).scripts || {}; } catch { /* 파싱 실패 */ }
    const miss = ["typecheck", "verify", "verify:build"].filter((k) => !s[k]);
    const fast = !/next build/.test(s.verify || "");
    const buildy = /next build/.test(s["verify:build"] || "");
    return { pass: miss.length === 0 && fast && buildy, ev: miss.length
      ? `package.json scripts 누락: ${miss} (typecheck=tsc --noEmit · verify=node scripts/verify.mjs · verify:build=next build && node scripts/verify.mjs)`
      : !fast ? "verify가 next build를 포함 — 빌드는 verify:build로 분리할 것(중간 단계 반복이 느려진다)"
      : !buildy ? "verify:build에 next build 없음 — 배포 판정이 빌드 없이 통과할 위험"
      : "typecheck·verify(빌드 미포함)·verify:build 존재" };
  } },

  // ── 2단계/3단계/4단계 추출·검증·큐레이션 (대부분 manual) ──
  "G2-EXTRACT": { stage: "2단계 추출", auto: false },
  "G2-COMPLETE": { stage: "2단계 추출", auto: true, fn: () => {
    // 2단계 [완료 조건] ①②의 기계 강제 — report.txt에 찍힌 '상한 도달·미방문 N건'을
    // 사람이 눈으로 읽고 그냥 넘어가던 구멍을 막는다. 근거는 추출기가 쓴 manifest.json.
    // (BFS 상한을 80p로 낮췄기 때문에 이 게이트가 없으면 큰 사이트에서 조용히 덜 긁어온다.)
    const p = extractFile("manifest.json");
    if (!p) return { pass: false, ev: "extract/*/manifest.json 없음 — 2단계 추출기 미실행(scripts/extract-site.mjs)" };
    let m = null; try { m = JSON.parse(read(p)); } catch { /* 파싱 실패 */ }
    if (!m || !Array.isArray(m.pages)) return { pass: false, ev: `${p} 형식 오류(pages 배열 없음)` };
    if (m.pages.length === 0) return { pass: false, ev: `${p} 저장된 페이지 0건 — 추출 실패` };
    const frontier = Array.isArray(m.frontier) ? m.frontier.length : 0;   // 발견했지만 못 간 URL
    const fails = Object.entries(m.status || {}).filter(([, v]) => v !== "ok").map(([k]) => k);
    const empty = m.pages.filter((x) => (x.chars || 0) < 30).map((x) => x.url);
    const n = frontier + fails.length + empty.length;
    return { pass: n === 0, ev: n
      ? `페이지 ${m.pages.length}건 · 미방문 frontier ${frontier}건(상한 도달이면 --max-pages 올려 재실행 — resume이라 이어받는다) · 방문실패 ${fails.length}건${fails.length ? " " + fails.slice(0, 3) : ""} · 빈 텍스트 ${empty.length}건${empty.length ? " " + empty.slice(0, 3) : ""}`
      : `페이지 ${m.pages.length}건 전량 방문 · 미방문 0 · 실패 0 · 빈 텍스트 0 (이미지 ${(m.images || []).length}·영상 ${(m.videos || []).length}·문서 ${(m.docs || []).length})` };
  } },
  "G3-FACT": { stage: "3단계 검증", auto: false },
  "G3-EVIDENCE": { stage: "3단계 검증", auto: false },
  "G3-LEDGER": { stage: "3단계 검증", auto: false },
  "G3-KEYWORD": { stage: "3단계 검증", auto: true, fn: () => {
    // 3단계 직후 키워드 리서치(⑨ scripts/keywords.mjs)의 수행 증거. 5단계 URL·메뉴 라벨과 10~13단계 title 정본이 이걸 입력으로 확정되고
    // title은 READ-ONLY라 14단계에 가서 처음 하면 되돌릴 수 없다 → 3단계 blocker로 시점을 강제한다.
    // ⚠️ 쿼리 0건은 FAIL이 아니다 — 분양 초기엔 현장명 검색량 자체가 없는 게 정상이라 "수행 여부"만 본다.
    let j; try { j = JSON.parse(read("reports/keywords.json")); } catch { j = null; }
    if (!j) return { pass: false, ev: "reports/keywords.json 없음 — `node scripts/keywords.mjs` 를 3단계 직후(5단계 전)에 실행할 것" };
    const miss = ["brand", "collectedAt", "queries", "assigned"].filter((k) => j[k] === undefined);
    if (miss.length) return { pass: false, ev: `keywords.json 필드 누락: ${miss.join(",")}` };
    if (!Array.isArray(j.queries)) return { pass: false, ev: "keywords.json queries가 배열이 아님" };
    const owned = Object.keys(j.assigned || {}).length;
    return { pass: true, ev: `키워드 리서치 수행됨(${j.collectedAt}) — 자동완성 쿼리 ${j.queries.length}개 · 페이지 배정 ${owned}축${j.queries.length ? "" : " (신규 현장: 쿼리 0건 = 정상)"}` };
  } },
  // ── 자동 판정 보조(2026-08-03) ─────────────────────────────────────────
  // ⚠️ 기존 manual 게이트는 **하나도 auto로 내리지 않았다** — 사람 눈 대조·육안 확인이 실제 안전장치라
  //    내리는 순간 거짓 GREEN이 난다. 대신 그 manual 항목의 **기계로 판정 가능한 절반**을 아래가 먼저 잡아
  //    사람이 볼 차례가 오기 전에 형식 미비를 걸러낸다(사람 대기 단축이 목적, 대체가 아니다).
  "G3-FACTJSON": { stage: "3단계 검증", auto: true, fn: () => {
    const p = extractFile("factcheck.json");
    if (!p) return { pass: false, ev: "extract/*/factcheck.json 없음 — 3단계 산출물 미생성" };
    let rows = null; try { rows = JSON.parse(read(p)); } catch { /* 파싱 실패 */ }
    if (!Array.isArray(rows) || rows.length === 0) return { pass: false, ev: `${p} 배열 아님 또는 0건` };
    const HARD = (r) => r.status === "일치" || r.status === "불일치";
    const meta = rows.filter((r) => !r.status || !r.source || !r.checkedAt);
    const noEv = rows.filter((r) => HARD(r) && (!r.quote || !r.sourceLocator || !r.verifyMethod));
    const guess = rows.filter((r) => r.verifyMethod === "추론" && HARD(r));
    const n = meta.length + noEv.length + guess.length;
    return { pass: n === 0, ev: n
      ? `${rows.length}건 중 status/source/checkedAt 누락 ${meta.length} · 확정라벨인데 quote·sourceLocator·verifyMethod 누락 ${noEv.length} · verifyMethod=추론인데 확정라벨 ${guess.length} (3단계 ⑤-신뢰)`
      : `factcheck ${rows.length}건 필수필드·발췌 완비 · 추론=확정라벨 0` };
  } },
  "G4-CURATIONJSON": { stage: "4단계 큐레이션", auto: true, fn: () => {
    const p = extractFile("curation.json");
    if (!p) return { pass: false, ev: "extract/*/curation.json 없음 — 4단계 산출물 미생성" };
    let rows = null; try { rows = JSON.parse(read(p)); } catch { /* 파싱 실패 */ }
    if (!Array.isArray(rows) || rows.length === 0) return { pass: false, ev: `${p} 배열 아님 또는 0건` };
    const V = ["keep", "drop", "maybe"];
    const undecided = rows.filter((r) => !V.includes(r["판정"]));
    const keeps = rows.filter((r) => r["판정"] === "keep");
    const noName = keeps.filter((r) => !r.baseName);
    const noWhy = rows.filter((r) => r["판정"] === "drop" && !r["사유"]);
    const n = undecided.length + noName.length + noWhy.length;
    return { pass: n === 0, ev: n
      ? `${rows.length}건 중 미판정 ${undecided.length} · keep인데 baseName 없음 ${noName.length} · drop인데 사유 없음 ${noWhy.length}`
      : `전수 판정 완료(전체 ${rows.length} · keep ${keeps.length}) · baseName·사유 누락 0` };
  } },
  "G3-SINGLESRC": { stage: "3단계 검증", auto: true, fn: () => {
    // 현장 수치는 content.ts 단일소스 — docs 페이지 md에 세대수/분양가 같은 raw 수치가 흩어지면 안 됨(이 게이트 문서 제외)
    const has = ok("src/lib/content.ts");
    return { pass: has, ev: `content.ts 단일소스 ${has ? "존재" : "누락"}` };
  } },
  "G4-CURATION": { stage: "4단계 큐레이션", auto: false },

  // ── 5단계 디자인시스템 ──
  "G5-ROUTES": { stage: "5단계 디자인", auto: true, fn: () => {
    const need = ["overview", "location", "premium", "complex", "floorplan", "sales", "modelhouse", "news", "faq"];
    const miss = need.filter((r) => !ROUTES.includes(r));
    return { pass: miss.length === 0, ev: miss.length ? `누락 라우트: ${miss}` : `핵심 라우트 전부 존재` };
  } },
  "G5-TOKENS": { stage: "5단계 디자인", auto: true, fn: () => {
    const g = read("src/app/globals.css"); const has = /--bronze/.test(g) && /--ink|--foreground/.test(g);
    return { pass: has, ev: `globals.css 디자인 토큰 ${has ? "정의" : "누락"}` };
  } },
  "G5-OGIMG": { stage: "5단계 디자인", auto: true, fn: () => {
    // site.ts ogImage는 문자열(`ogImage: '/images/og/...'`) 또는 객체(`ogImage: { path: '...' }`) 둘 다 수용
    const s = read("src/lib/site.ts");
    const m = s.match(/ogImage\s*:\s*["']([^"']+)["']/) || s.match(/ogImage[\s\S]{0,120}?path:\s*["']([^"']+)["']/);
    const p = m ? path.join("public", m[1]) : null;
    const okFile = p && ok(p) && /\.(jpg|jpeg|png)$/i.test(p); // OG는 webp 금지
    return { pass: !!okFile, ev: p ? `${m[1]} ${ok(p) ? "" : "(파일없음)"} ${/\.webp$/i.test(p) ? "(webp금지위반)" : ""}`.trim() : "og 경로 미파싱" };
  } },
  "G5-MATERIALIZE": { stage: "5단계 디자인", auto: true, fn: () => {
    // 5단계 §7 물질화 완결성. **누락을 잡는 게 목적**이다 —
    // 용량 초과는 G16-IMGWEIGHT가 배포 직전에 또 보지만, "keep 했는데 public에 없는 이미지"는
    // 어느 게이트도 못 잡는다(G16-UNUSED는 반대 방향, G14-IMG404는 페이지가 참조해야 걸림).
    // 근거는 scripts/materialize-images.mjs가 쓴 reports/materialize.json — 손으로 변환했으면 근거가 없어 RED.
    const cp = extractFile("curation.json");
    if (!cp) return { pass: false, ev: "extract/*/curation.json 없음 — 4단계 큐레이션 미완료" };
    let rows = []; try { rows = JSON.parse(read(cp)); } catch { /* 파싱 실패 */ }
    const keepImgs = rows.filter((r) => r["판정"] === "keep" && (r.kind || "image") === "image").length;
    let rep = null; try { rep = JSON.parse(read("reports/materialize.json")); } catch { /* 없음 */ }
    if (!rep) return { pass: false, ev: `reports/materialize.json 없음 — 'npm run images' 미실행(수동 변환 금지, 5단계 §7). keep 이미지 ${keepImgs}건 대기` };
    const made = (rep.images || []).length, un = (rep.unresolved || []).length, over = (rep.over || []).length;
    const pass = un === 0 && over === 0 && made === keepImgs && keepImgs > 0;
    return { pass, ev: pass
      ? `keep ${keepImgs}건 전부 물질화 · 원본 못 찾음 0 · 용량 상한 초과 0 (OG ${rep.og ? "✓" : "✗"})`
      : [
          made !== keepImgs ? `물질화 ${made}건 ≠ keep ${keepImgs}건(누락 ${keepImgs - made})` : "",
          un ? `원본 못 찾음 ${un}건: ${(rep.unresolved || []).slice(0, 3).map((u) => u.base)} — curation.json baseName ↔ curated/ 실제 파일명 불일치` : "",
          over ? `용량 상한 초과 ${over}건: ${(rep.over || []).slice(0, 3).map((o) => o.file)} — 세로 패널은 폭을 줄이지 말고 분할할 것` : "",
        ].filter(Boolean).join(" · ") };
  } },
  "G5-PLACEHOLDER-SRC": { stage: "5단계 디자인", auto: true, fn: () => {
    const c = read("src/lib/content.ts") + read("src/lib/site.ts");
    // {현장명}류 한글 전반 + {N}·{NN}·{YYYY}·{slug}류 영문 화이트리스트(코드 구조분해 {children} 오탐 방지 위해 영문은 알려진 토큰만)
    const hits = (c.match(/\{[가-힣]{2,}\}|\{(N|NN|YYYY|MM|DD|slug|date|tel|url|addr|domain)\}/g) || []);
    return { pass: hits.length === 0, ev: hits.length ? `미치환 placeholder: ${[...new Set(hits)].slice(0, 5)}` : "config placeholder 0" };
  } },

  // ── 6단계 전역규칙 ──
  "G6-VOICE": { stage: "6단계 전역", auto: true, fn: () => {
    // 6단계 §C — 사이트는 "정보를 주는 주체". 제작 과정·자료 사정·출처가 본문에 드러나면 신뢰가 무너진다.
    // 3부류를 잡는다: ① 출처 자백(신뢰 근거를 제3자에게 넘김) ② 편집 변명(제작자·발주자 보고체) ③ 자료 사정(내부 사정).
    // ⚠️ 정상 안내문("모집공고 시 안내", "추후 안내")은 대상 아님 — 그건 정본 형식이다.
    // ⚠️ 출처 표기 자체는 금지가 아니다 — 하단 ※ 주석·매체 크레딧("출처: {매체} {날짜}")이 정본, 본문 문장 안에 섞는 것만 금지.
    // ⚠️ 아래 토큰 목록은 **실제 현장 26곳·빌드 547페이지로 검증**해 오탐을 걸러낸 결과다(2026-08-03).
    //    자동 검사에서 뺀 것 — 문맥상 정상 고지가 압도적이라 걸면 법정 문구를 지우게 된다. 6단계 §C 판정표로 사람이 본다:
    //      · "본 페이지는"      → 광고 LP 면책("본 페이지는 광고 안내를 위한 홍보 페이지이며…")
    //      · 단독 "참고용으로"  → CG 면책("배치는 참고용으로 실제와 다를 수 있습니다")
    //      · "참고하시기 바랍니다"·"점 참고"·"검토가 필요" → 방문자 대상 안내·단서(처리방침 링크·개별 통보·세무 검토)
    //      · "기사"             → 뉴스 카드 메타·매체 크레딧
    //    "로 확인됩니다"는 "것으로 확인됩니다"로 좁혔다 — "계약 기준으로 확인됩니다"(정상)를 걸지 않기 위해.
    const text = ALL_PAGES.map((r) => stripCode(html(r))).join(" "); // 하위 news/blog 글까지 전수
    const BAD = [
      // ① 출처 자백 — 출처는 3단계 수집·검증 대장 + 하단 ※로
      "보도에 따르면", "보도된 바", "기사에 따르면", "기사에서 확인",
      "알려졌", "알려진 바", "전해졌", "전해집니다", "것으로 확인됩니다",
      // ② 편집 변명(제작자 시점)
      "참고용으로 둔", "참고용으로 작성", "사실을 밝혀", "밝혀 둡니다", "밝혀둡니다",
      "남겨 두었", "남겨두었", "비워 두었", "비워두었",
      "정리하였습니다", "정리했습니다", "반영해 두었", "반영하였습니다",
      // ③ 자료 사정 → 안내 일정으로 전환
      "원본 자료", "자료에 표기", "표기가 없어", "표기되어 있지 않",
      "기재되어 있지 않", "명시되어 있지 않", "자료마다 달라",
      "확인이 필요한 항목", "확인이 어려워", "확인이 어렵습니다",
      "공개되지 않아", "확인되지 않아", "안내드리기 어렵",
      "추후 보완",
    ];
    const hits = BAD.filter((w) => text.includes(w));
    return { pass: hits.length === 0, ev: hits.length
      ? `출처 자백·편집 변명·자료 사정 문구 ${hits.length}건: ${hits.slice(0, 6)} — 6단계 §C(정보를 주는 주체). 출처는 하단 ※로, 미확정은 값 자리에 "모집공고 시 안내"로`
      : `출처 자백·편집 변명·자료 사정 노출 0(정보 제공 주체 시점 유지)` };
  } },
  "G6-A11Y": { stage: "6단계 전역", auto: true, fn: () => {
    const g = read("src/app/globals.css");
    const rm = /prefers-reduced-motion/.test(g), fv = /:focus-visible/.test(g), wb = /word-break:\s*keep-all/.test(g);
    return { pass: rm && fv && wb, ev: `reduced-motion ${rm ? "✓" : "✗"}·focus-visible ${fv ? "✓" : "✗"}·keep-all ${wb ? "✓" : "✗"}` };
  } },
  "G6-READABLE": { stage: "6단계 전역", auto: false },

  // ── 7단계/8단계 레이아웃·컴포넌트 ──
  "G7-HERO": { stage: "7단계 레이아웃", auto: false },
  "G7-CHROME": { stage: "7단계 레이아웃", auto: true, fn: () => {
    const h = ok("src/components/Header.tsx"), f = ok("src/components/Footer.tsx");
    return { pass: h && f, ev: `Header ${h ? "✓" : "✗"}·Footer ${f ? "✓" : "✗"}` };
  } },
  "G7-FOOTER3": { stage: "7단계 레이아웃", auto: true, fn: () => {
    // 푸터에 3주체 + 광고심의필 + 최종갱신 자리
    const f = read("src/components/Footer.tsx");
    const three = /developer|contractor|trust|시행|시공|신탁/.test(f);
    const ad = /광고심의|심의필/.test(f); const upd = /LAST_UPDATED|최종 갱신|갱신/.test(f);
    return { pass: three && upd, ev: `3주체 ${three ? "✓" : "✗"}·광고심의 ${ad ? "✓" : "✗"}·갱신일 ${upd ? "✓" : "✗"}` };
  } },
  "G8-PRIVACY": { stage: "8단계 컴포넌트", auto: true, fn: () => {
    const p = read("src/app/privacy/page.tsx");
    const filled = p.length > 400 && /수집|이용 목적|보유/.test(p);
    return { pass: filled, ev: `/privacy 본문 ${filled ? "작성됨" : "빈 골격/누락"}` };
  } },
  "G8-FORM": { stage: "8단계 컴포넌트", auto: true, fn: () => {
    const f = read("src/components/InterestForm.tsx");
    const fields = /name=.?name|성함/.test(f) && /phone|연락처/.test(f) && /agree|동의/.test(f) && /privacy/.test(f);
    return { pass: fields, ev: `폼 필드(성함·연락처·동의·처리방침링크) ${fields ? "✓" : "누락"}` };
  } },
  "G8-SOURCENOTE": { stage: "8단계 컴포넌트", auto: true, fn: () => {
    // 8단계 §9 — 출처는 본문 문장이 아니라 하단 ※ 주석으로 나간다(6단계 §C).
    // ⚠️ 컴포넌트가 없으면 실행 AI는 출처를 본문에 섞거나(=G6-VOICE 위반) 통째로 버린다. 자리부터 강제한다.
    const comp = ok("src/components/SourceNote.tsx");
    // 렌더된 ※ 출처의 **형식**만 본다 — 언론 근거 0건인 현장은 0개가 정상(빈 ※ 금지가 8단계 §9 규칙).
    const rendered = ALL_PAGES.map((r) => stripCode(html(r))).join(" ");
    const notes = rendered.match(/※\s*출처[^※]{0,120}/g) || [];
    const noDate = notes.filter((n) => !/\d{4}\s?[.\-/]\s?\d{1,2}/.test(n));
    return { pass: comp && noDate.length === 0, ev:
      `SourceNote 컴포넌트 ${comp ? "✓" : "✗(8단계 §9 미구현 — 출처 둘 자리 없음)"} · 렌더된 ※ 출처 ${notes.length}건`
      + (noDate.length ? ` · 날짜 빠진 표기 ${noDate.length}건: ${noDate.slice(0, 2)}` : "") };
  } },
  // ── 10단계 메인 ──
  "G10-HEROCTA": { stage: "10단계 메인", auto: true, fn: () => {
    // 히어로 관심고객등록 진입점은 **1개**(10단계 §Hero — 기본 CTA쌍 ↔ 원형 어텐션 CTA 택1).
    // 히어로를 태그로 자를 수 없어(마크업 규약 없음) 두 CTA의 고유 서명으로 판정한다:
    //  · 기본 CTA쌍 = 데스크탑 전용 `hidden min-[1360px]:flex`
    //  · 원형 CTA   = 데스크탑 전용 `hidden lg:block` + `rounded-full`
    //  → "#reservation 링크 중 (단독 hidden) 또는 (rounded-full)" = 히어로 CTA 후보.
    // ⚠️ `lg:hidden`·`md:hidden`(모바일 콜바 등)은 제외 — 앞에 `:`가 붙으면 데스크탑 노출용이 아니다.
    const h = html("index");
    if (!h) return { pass: false, ev: "index.html 없음(빌드 확인)" };
    const HIDDEN = /class="[^"]*(?<![:\w-])hidden(?![:\w-])[^"]*"/i;
    const anchors = [...h.matchAll(/<a\b[^>]*>/gi)].map((m) => m[0]).filter((a) => /#reservation/.test(a));
    const hero = anchors.filter((a) => HIDDEN.test(a) || /rounded-full/.test(a));
    const pass = hero.length <= 1;
    return { pass, ev: pass
      ? `히어로 관심고객등록 진입점 ${hero.length}개(≤1) · 페이지 내 #reservation 링크 ${anchors.length}개`
      : `히어로 관심고객등록 진입점 ${hero.length}개 — 기본 CTA쌍과 원형 CTA를 둘 다 구현(10단계 §Hero: 택1, 원형 채택 시 쌍에는 전화만)` };
  } },
  "G10-ABOUT": { stage: "10단계 메인", auto: true, fn: () => {
    const h = html("index"); const has = /About This Page/i.test(h);
    return { pass: has, ev: `메인 About This Page 섹션 ${has ? "✓" : "누락"}` };
  } },
  "G10-SCHEDULE": { stage: "10단계 메인", auto: true, fn: () => scheduleGuard(["index"]) },
  "G10-HEROCSS": { stage: "10단계 메인", auto: true, fn: () => {
    // Tailwind arbitrary 값에 **공백**이 들어가면 클래스 토큰이 거기서 끊겨 CSS가 통째로 무효가 된다.
    // 10단계 Hero의 `min-h-[calc(100svh_-_56px)]`에서 언더스코어를 빠뜨려 높이가 0이 된 실발생 버그.
    const bad = [];
    for (const f of srcFiles) {
      if (!f.endsWith(".tsx") && !f.endsWith(".ts")) continue;
      const s = read(f);
      let i = 0;
      while ((i = s.indexOf("[calc(", i)) !== -1) {
        const end = s.indexOf("]", i);
        if (end === -1) break;
        const frag = s.slice(i, end + 1);
        if (frag.includes(" ")) bad.push(path.basename(f) + ": " + frag.slice(0, 40));
        i = end + 1;
      }
    }
    return { pass: bad.length === 0, ev: bad.length
      ? `arbitrary calc()에 공백 ${bad.length}곳(클래스 무효 → 레이아웃 붕괴): ${bad.slice(0, 3)} — 공백을 _(언더스코어)로 바꿀 것`
      : "arbitrary calc() 공백 0(언더스코어 규약 준수)" };
  } },
  "G10-IMG": { stage: "10단계 메인", auto: true, fn: () => {
    // 메인 3슬롯(평면도·분양/임대/조합안내·모델하우스)은 **사용자 직접 첨부 전용**이다(10단계 §MagBlock).
    // 정상 상태는 슬롯별로 둘 중 하나 — ① placeholder 박스 유지(첨부 전 · 기본) ② 사용자 첨부 이미지 연결(public/images/home/).
    //   → 사용자가 자기 이미지를 넣어도 GREEN이어야 한다. 위반은 "4단계 카테고리 이미지(서브 전용)를 메인에 임의로 꽂은 경우"뿐.
    const h = html("index");
    const SLOTS = ["floorplan", "sales", "modelhouse"];
    const isUserDir = (f) => /public[\\/]+images[\\/]+home[\\/]/i.test(f);      // 사용자 첨부 전용 디렉토리 — 누출 검사 제외
    const catRe = /(?:^|[-_])(floorplan|type|sales|modelhouse)(?:[-_]|\.)/i;    // 4단계 {slug}-{category}-{NN} 명명 기준
    const imgs = walk("public/images").filter((f) => /\.(webp|jpg|jpeg|png|svg)$/i.test(f) && !isUserDir(f) && catRe.test(path.basename(f)));
    const leaked = imgs.filter((f) => h.includes(path.basename(f))).map((f) => path.basename(f));
    // 슬롯 충족 = 사용자 첨부 이미지가 메인에 실제 렌더됐거나(filled), 아직 첨부 전이면 placeholder 박스가 남아 있거나(ph).
    const userImgs = walk("public/images/home").filter((f) => /\.(webp|jpg|jpeg|png|svg)$/i.test(f));
    const filled = SLOTS.filter((s) => userImgs.some((f) => new RegExp(`home-${s}-`, "i").test(path.basename(f)) && h.includes(path.basename(f))));
    const ph = (h.match(/사용자 첨부 예정/g) || []).length;   // 박스 1개당 1회 — 8단계 §6 문구 정본이 판정 기준
    const covered = filled.length + ph;
    const pass = leaked.length === 0 && covered >= SLOTS.length;
    return { pass, ev: leaked.length
      ? `메인 금지 섹션 이미지 노출 ${leaked.length}건: ${leaked.slice(0, 4)} — 4단계 floorplan/type/sales/modelhouse 카테고리 이미지는 서브 전용(사용자 첨부는 public/images/home/)`
      : pass ? `메인 3슬롯 충족 — 사용자 첨부 ${filled.length}${filled.length ? `(${filled})` : ""} · placeholder ${ph} · 임의 카테고리 이미지 0 ✓`
      : `3슬롯 미충족(사용자 첨부 ${filled.length} + placeholder ${ph} < 3) — 첨부 전 슬롯은 placeholder 박스("이미지 준비 중 · 사용자 첨부 예정") 유지, 첨부분은 public/images/home/{slug}-home-{slot}-NN 를 연결할 것` };
  } },

  // ── 11단계 서브 단지정보 ──
  "G11-BREADCRUMB": { stage: "11단계 서브", auto: true, fn: () => {
    // 11단계 §구조 2 — Breadcrumb JSON-LD는 **전 서브에 1개**(홈=depth1 제외 · 중복 생성 금지).
    // 구글 Search Console "탐색경로" 오류의 전형적 원인을 함께 막는다:
    //  · item 이 상대경로(`/overview`) — 구글은 **절대 URL**을 요구한다
    //  · name / position 누락, position 이 1부터 연속이 아님
    //  · 같은 페이지에 BreadcrumbList 2개(PageHero 자동 생성 + 수동 추가)
    // ※ JSON 파싱 실패·@context 누락은 [G14-JSONLD]가 따로 잡으므로 여기선 건너뛴다.
    const bad = [];
    for (const r of CONTENT_ROUTES.filter((x) => x !== "index")) {
      const crumbs = [];
      for (const m of html(r).matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
        let o; try { o = JSON.parse(m[1]); } catch { continue; }
        const items = Array.isArray(o) ? o : (Array.isArray(o["@graph"]) ? [o, ...o["@graph"]] : [o]);
        for (const x of items) if (x && x["@type"] === "BreadcrumbList") crumbs.push(x);
      }
      if (crumbs.length === 0) { bad.push(`${r}:BreadcrumbList 없음`); continue; }
      if (crumbs.length > 1) bad.push(`${r}:BreadcrumbList ${crumbs.length}개(중복 생성 금지)`);
      const el = crumbs[0].itemListElement;
      if (!Array.isArray(el) || el.length < 2) {
        bad.push(`${r}:itemListElement ` + (Array.isArray(el) ? el.length + "개(<2)" : "배열 아님"));
        continue;
      }
      el.forEach((it, i) => {
        if (!it || typeof it !== "object") { bad.push(`${r}#${i + 1}:항목 형식 오류`); return; }
        if (Number(it.position) !== i + 1) bad.push(`${r}#${i + 1}:position ${it.position === undefined ? "누락" : it.position}(1부터 연속이어야)`);
        if (!String(it.name || "").trim()) bad.push(`${r}#${i + 1}:name 누락`);
        if (it.item !== undefined) {
          const u = typeof it.item === "string" ? it.item : (it.item && (it.item["@id"] || it.item.url));
          if (!/^https?:\/\//.test(String(u || ""))) bad.push(`${r}#${i + 1}:item 절대URL 아님(${String(u).slice(0, 30)})`);
        }
      });
    }
    return { pass: bad.length === 0, ev: bad.length
      ? `탐색경로(Breadcrumb) 문제 ${bad.length}건: ${bad.slice(0, 6)}`
      : `전 서브 BreadcrumbList 1개 · position/name/절대URL OK` };
  } },
  "G11-LINKS": { stage: "11단계 서브", auto: true, fn: () => orphanCheck() },
  "G11-IMGUSE": { stage: "11단계 서브", auto: false },
  "G11-CONTENT": { stage: "11단계 서브", auto: false },
  "G11-FLOORPLAN-IMG": { stage: "11단계 서브", auto: true, fn: () => {
    // 평면도 도면 자산이 실재하면 /floorplan이 그 도면을 실제로 렌더해야 PASS(placeholder 대체 금지).
    // 도면 자산 미존재(진짜 미공개)면 placeholder 허용 → PASS. (11단계 §95 · images.ts 매니페스트 미등록 재발 방지)
    const isPlaceholder = (b) => /^(type|placeholder|준비중)[-_]?\d*\./i.test(b);
    const assets = walk("public/images/floorplan").filter((f) => /\.(webp|jpg|jpeg|png|svg)$/i.test(f));
    const real = assets.filter((f) => !isPlaceholder(path.basename(f)));
    if (real.length === 0) return { pass: true, ev: "평면도 도면 자산 없음 → placeholder 허용(미공개)" };
    if (!ROUTES.includes("floorplan")) return { pass: false, ev: `평면도 도면 ${real.length}개 존재하나 /floorplan 라우트 없음` };
    const h = html("floorplan");
    const shown = real.filter((f) => h.includes(path.basename(f)));
    return { pass: shown.length > 0, ev: shown.length ? `평면도 도면 ${real.length}개 중 ${shown.length}개 /floorplan 렌더 ✓` : `평면도 도면 ${real.length}개 존재하나 /floorplan 미렌더(placeholder만) — images.ts 매니페스트 미등록 의심` };
  } },

  // ── 12단계 분양·모델하우스 ──
  "G12-FORM": { stage: "12단계 분양", auto: true, fn: () => {
    const m = html("modelhouse");
    const has = /reservation/.test(m) && /privacy/.test(m) && ok("src/app/api/contact/route.ts");
    return { pass: has, ev: `예약 anchor·처리방침·api/contact ${has ? "✓" : "누락"}` };
  } },
  "G12-SCHEDULE": { stage: "12단계 분양", auto: true, fn: () => scheduleGuard(["sales", "modelhouse"]) },

  // ── 13단계 소식·FAQ ──
  "G13-NEWS": { stage: "13단계 소식", auto: true, fn: () => {
    const newsRoutes = ok(path.join(APP, "news")) ? fs.readdirSync(path.join(APP, "news")).filter((f) => f.endsWith(".html")) : [];
    const index = len(html("news")) > 0; // /news 색인 구조 존재(POSTS 빈 배열이어도 통과 — 13단계는 구조만, 샘플 발행 금지)
    const article = newsRoutes.length === 0 || newsRoutes.some((f) => /"@type":"NewsArticle"/.test(read(path.join(APP, "news", f)))); // 발행글이 있으면 NewsArticle JSON-LD 필수
    const rssGone = !ok("src/app/rss.xml/route.ts"); // 15단계 7편 체제 — RSS 미사용(색인은 sitemap + 웹페이지 수집요청)
    return { pass: index && article, ev: `구조(색인 ${index ? "✓" : "✗"}·rss 미사용 ${rssGone ? "✓" : "⚠ 잔존 — 삭제 권고"})·발행글 ${newsRoutes.length}편(13단계=샘플 0편)·NewsArticle ${article ? "✓" : "✗"}` };
  } },
  "G13-FAQ-DEDUP": { stage: "13단계 소식", auto: true, fn: () => {
    // FAQPage 스키마는 /faq 에만
    const others = CONTENT_ROUTES.filter((r) => r !== "faq" && /"@type":"FAQPage"/.test(html(r)));
    return { pass: /"@type":"FAQPage"/.test(html("faq")) && others.length === 0, ev: others.length ? `FAQPage 중복 노출: ${others}` : `FAQPage = /faq 단독` };
  } },
  "G13-CONTENT": { stage: "13단계 소식", auto: false },
  "G13-VOLUME": { stage: "13단계 소식", auto: true, fn: () => {
    const faqQ = (html("faq").match(/"@type":"Question"/g) || []).length;
    const posts = ALL_PAGES.filter((r) => r.startsWith("news/"));
    const texts = posts.map((r) => stripCode(html(r)));
    // 페이지 텍스트엔 헤더·푸터가 섞인다 → 글들의 **공통 접두·접미(=크롬)** 를 빼고 본문만 센다.
    let pre = 0, suf = 0;
    if (texts.length >= 2) {
      const a = texts[0];
      while (pre < a.length && texts.every((t) => t[pre] === a[pre])) pre++;
      while (suf < a.length - pre && texts.every((t) => t[t.length - 1 - suf] === a[a.length - 1 - suf])) suf++;
    }
    const thin = texts.map((t, i) => [posts[i], t.length - pre - suf]).filter((x) => x[1] < 800);
    const pass = posts.length > 0 && faqQ >= 12 && thin.length === 0;
    return { pass, ev: `FAQ 질문 ${faqQ}개(≥12) · 발행글 ${posts.length}편`
      + (thin.length ? ` · 800자 미만 ${thin.length}편: ${thin.slice(0, 3).map((x) => `${x[0]}(${x[1]}자)`)}` : " · 전부 800자+")
      + (texts.length >= 2 ? ` [크롬 ${pre + suf}자 제외 기준]` : " [글 1편 — 크롬 미분리]") };
  } },

  // ── 14단계 SEO/GEO ──
  "G14-OUT6": { stage: "14단계 SEO", auto: true, fn: () => {
    // robots는 정적 public/robots.txt로 통일 (Daum 인증 토큰 주석 삽입 가능)
    const need = ["public/robots.txt", "src/app/sitemap.ts", "public/llms.txt"]; // rss route 제외 — 15단계 7편 체제로 RSS 미사용
    const miss = need.filter((f) => !ok(f));
    return { pass: miss.length === 0, ev: miss.length ? `산출물 누락: ${miss}` : `robots·sitemap·llms 존재` };
  } },
  "G14-META": { stage: "14단계 SEO", auto: true, fn: () => {
    const bad = [];
    for (const r of CONTENT_ROUTES) {
      const h = html(r);
      const d = (h.match(/name="description" content="([^"]*)"/) || [])[1] || "";
      const o = (h.match(/property="og:title" content="([^"]*)"/) || [])[1] || "";
      const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
      if (len(d) > 80) bad.push(`${r} desc ${len(d)}>80`);
      if (len(o) > 40) bad.push(`${r} og ${len(o)}>40`);
      if (o && o === t) bad.push(`${r} og==title`);
      if (!/rel="canonical"/.test(h)) bad.push(`${r} canonical없음`);
      // 7단계 §1.6 실발생 버그 — layout metadata.title.template + 페이지 title 문자열을 함께 주면
      // `{현장명} 사업개요 | {현장명}`처럼 브랜드가 2번 붙는다. 마지막 세그먼트가 앞부분에 이미 있으면 중복.
      const segs = t.split("|").map((s) => s.trim()).filter(Boolean);
      if (segs.length >= 2 && segs.slice(1).some((s) => s.length >= 2 && segs[0].includes(s)))
        bad.push(`${r} title 브랜드 중복("${t}") — 7단계 §1.6 title.absolute로 template 우회할 것`);
      // 전환 페이지(메인·분양·모델하우스)는 설명에 상담번호(전화) 노출 필수 — {전화}가 실번호로 렌더됐는지 검사(≤80은 위에서 강제).
      if (["index", "sales", "modelhouse"].includes(r) && !/\d{3,4}-\d{4}/.test(d)) bad.push(`${r} desc 상담번호(전화) 없음`);
      // 홈 title 꼬리 강제 — 10단계 정본 `{현장명} | 분양 홈페이지`(사용자 사전 결정). layout title.default를
      // 브랜드 단독으로 되돌리거나 꼬리를 다른 말로 바꾸면 여기서 RED. ※title 값 자체는 READ-ONLY(변경 금지, 검사만).
      if (r === "index" && !/\|\s*분양 홈페이지\s*$/.test(t))
        bad.push(`index title 꼬리 누락("${t}") — 7단계 §1.6 title.default = "{현장명} | 분양 홈페이지"`);
    }
    // 글 상세(/news/[slug])도 검사 — 최상위만 보면 발행 글(운영 최대 7편)의 desc 80자 초과·canonical 누락이 새는 구멍.
    // 15단계 excerpt ≤80자(엄수) 규칙의 기계 강제. ※og:title 40자는 글 상세엔 미적용(글제목+브랜드 접미 구조상 초과가 정상 — 15단계 title 25~40자 권장과 충돌 방지).
    const newsDir = path.join(APP, "news");
    if (ok(newsDir)) for (const f of fs.readdirSync(newsDir).filter((x) => x.endsWith(".html"))) {
      const h = read(path.join(newsDir, f));
      const d = (h.match(/name="description" content="([^"]*)"/) || [])[1] || "";
      if (len(d) > 80) bad.push(`news/${f} desc ${len(d)}>80`);
      if (!/rel="canonical"/.test(h)) bad.push(`news/${f} canonical없음`);
    }
    return { pass: bad.length === 0, ev: bad.length ? bad.join(", ") : `전 라우트(+news 글 상세) 메타 길이·구분·canonical OK` };
  } },
  "G14-JSONLD": { stage: "14단계 SEO", auto: true, fn: () => {
    const has = (h, t) => new RegExp(`"@type":"${t}"`).test(h);
    const bad = [];
    // ── 블록 유효성 (검색엔진이 통째로 무시하는 두 원인 — @type 글자만 보던 과거엔 통과했음) ──
    //  ① JSON.parse 성공  ② @context 에 schema.org 선언
    //  깨진 JSON·@context 누락은 "@type 누락"과 원인이 다르므로 따로 표기해 오진을 막는다.
    for (const r of CONTENT_ROUTES) {
      const blocks = [...html(r).matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
      blocks.forEach((raw, i) => {
        let o;
        try { o = JSON.parse(raw); }
        catch (e) {
          const esc = /&quot;|&#34;|&amp;/.test(raw);
          bad.push(`${r}#${i + 1}:JSON파싱실패` + (esc
            ? "(HTML 이스케이프 흔적 — React 자식 대신 dangerouslySetInnerHTML+JSON.stringify로 주입할 것)"
            : `(${e.message.slice(0, 40)})`));
          return;
        }
        const items = Array.isArray(o) ? o : (Array.isArray(o["@graph"]) ? [o, ...o["@graph"]] : [o]);
        if (!items.some((x) => x && /schema\.org/.test(JSON.stringify(x["@context"] || ""))))
          bad.push(`${r}#${i + 1}:@context 누락(schema.org 미선언 → 검색엔진이 블록 통째로 무시)`);
      });
    }
    for (const [r, types] of Object.entries(JSONLD_MAP)) {
      if (!ROUTES.includes(r)) continue;
      const h = html(r);
      for (const t of types) {
        // 배열 = any-of(둘 중 하나면 OK, 예: modelhouse RealEstateAgent|LocalBusiness)
        if (Array.isArray(t)) { if (!t.some((x) => has(h, x))) bad.push(`${r}:${t.join("|")}`); }
        else if (!has(h, t)) bad.push(`${r}:${t}`);
      }
    }
    // 모델하우스 LocalBusiness/RealEstateAgent = NAP 단일 출처 → address(PostalAddress)·telephone 필수(주소 공개 시 생성, 12·14단계). @type만 있고 필드 누락 방지.
    if (ROUTES.includes("modelhouse")) {
      const mh = html("modelhouse");
      if (/"@type":"(RealEstateAgent|LocalBusiness)"/.test(mh)) {
        if (!/"@type":"PostalAddress"/.test(mh)) bad.push("modelhouse:address(PostalAddress)누락");
        if (!/"telephone":/.test(mh)) bad.push("modelhouse:telephone누락");
      }
    }
    // ※ sales의 Offer/AggregateOffer는 분양가 공개 시에만 생성(미공개=Residence 단독)이라 기계 필수 검사에서 제외 — 공개 현장의 Offer 누락은 사람 검수(12단계)가 본다.
    return { pass: bad.length === 0, ev: bad.length ? `JSON-LD 문제 ${bad.length}건: ${bad}` : `페이지별 @type 매핑 OK` };
  } },
  "G14-OGIMG": { stage: "14단계 SEO", auto: true, fn: () => {
    const urls = [...allHtml.matchAll(/property="og:image" content="([^"]*)"/g)].map((m) => m[1]);
    const bad = urls.filter((u) => { const p = u.replace(/^https?:\/\/[^/]+/, ""); return !ok(path.join("public", p)); });
    return { pass: bad.length === 0, ev: bad.length ? `og:image 파일없음: ${[...new Set(bad)].slice(0, 3)}` : `og:image ${urls.length}개 실존` };
  } },
  "G14-IMG404": { stage: "14단계 SEO", auto: true, fn: () => {
    const refs = new Set();
    for (const m of srcText.matchAll(/\/images\/[\w./-]+\.(webp|jpg|jpeg|png|svg)/gi)) refs.add(m[0]);
    const bad = [...refs].filter((r) => !ok(path.join("public", r)));
    return { pass: bad.length === 0, ev: bad.length ? `이미지404: ${bad.slice(0, 3)}` : `이미지 참조 ${refs.size}개 실존` };
  } },
  "G14-IMGNAME": { stage: "14단계 SEO", auto: true, fn: () => {
    const imgs = walk("public/images").concat(walk("public/videos"))
      .filter((f) => /\.(webp|jpg|jpeg|png|svg|mp4)$/i.test(f) && !/\/og\//.test(f.replace(/\\/g, "/")));
    const meaningless = imgs.filter((f) => /^(image|img|photo|pic|untitled|test|dsc|screenshot|capture)[-_]?\d*\./i.test(path.basename(f)));
    const nonSlug = SLUG ? imgs.filter((f) => !path.basename(f).startsWith(SLUG + "-")) : [];
    // v6[배포 전 키워드 파일명 강제]: 사용(=배포)되는 모든 이미지·영상은 {slug}-{배치/키워드} 파일명이어야 PASS(하드 RED). image/img/test류 의미없는명도 RED. slug 미감지(SLUG="")면 강제 불가 → nonSlug=[]로 면제. (배포·색인된 운영 사이트로 전환 시엔 캐시·og 안정성 위해 이 강제를 끄고 alt로 커버 — 별도 운영 규칙)
    const pass = meaningless.length === 0 && nonSlug.length === 0;
    const ev = pass
      ? `사용 이미지 전부 {slug}- 키워드 파일명 OK(${imgs.length}개)`
      : `의미없는명 ${meaningless.length}(예: ${meaningless.slice(0, 3).map((f) => path.basename(f))}) · {slug}-접두아님 ${nonSlug.length}(예: ${nonSlug.slice(0, 3).map((f) => path.basename(f))})`;
    return { pass, ev };
  } },
  "G14-LINKTEXT": { stage: "14단계 SEO", auto: true, fn: () => {
    const bad = [];
    for (const r of CONTENT_ROUTES) {
      for (const m of html(r).matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
        const txt = m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        if (/^(전체 보기|여기|더보기|more|클릭|바로가기|자세히)$/i.test(txt)) bad.push(`${r}:"${txt}"`);
      }
    }
    return { pass: bad.length === 0, ev: bad.length ? `비서술 앵커: ${bad}` : `비서술 앵커 0` };
  } },
  "G14-3PARTY": { stage: "14단계 SEO", auto: true, fn: () => {
    // 3주체 표기가 빌드 결과에 살아있나(시행/시공, 가능시 신탁)
    const has = /시행|시공|신탁|건설|조합|신탁\(주\)/.test(allHtml);
    return { pass: has, ev: `시행/시공 3주체 표기 ${has ? "빌드에 존재" : "누락"}` };
  } },
  "G14-ABUSE": { stage: "14단계 SEO", auto: true, fn: () => {
    // 본문 텍스트만(태그 제거) — 과장·단정·없는기능. 하위 news/blog 글까지 전수(ALL_PAGES).
    const text = ALL_PAGES.map((r) => stripCode(html(r))).join(" ");
    const hits = [];
    for (const w of ["최저가", "최저 분양가", "확정 프리미엄", "완판", "직결"]) if (text.includes(w)) hits.push(w);
    for (const w of ["360 VR", "360° VR", "E-모델하우스", "VR 모델하우스"]) if (text.includes(w)) hits.push(w);
    return { pass: hits.length === 0, ev: hits.length ? `과장/없는기능 표현: ${hits}` : `최저가·확정·완판·직결·가짜VR 0` };
  } },
  "G14-PLACEHOLDER": { stage: "14단계 SEO", auto: true, fn: () => {
    const hits = [];
    for (const r of ROUTES) {
      const h = html(r);
      // 한글 placeholder 전반 + 영문 알려진 토큰(JSON-LD·인라인 JS의 {"key": 류는 따옴표가 붙어 미매칭 — 오탐 없음)
      if (/\{[가-힣]{2,}\}|\{(N|NN|YYYY|MM|DD|slug|date|tel|url|addr|domain)\}|TODO|lorem ipsum/i.test(h)) hits.push(r);
    }
    return { pass: hits.length === 0, ev: hits.length ? `placeholder 잔존: ${hits}` : `placeholder/창작 0` };
  } },

  // ── 15단계 분양소식 ──
  "G15-POSTS": { stage: "15단계 분양소식", auto: true, fn: () => {
    const n = read("src/lib/news.ts");
    const slugs = [...n.matchAll(/slug:\s*["']([^"']+)["']/g)].map((m) => m[1]);
    const dups = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    const badDate = [...n.matchAll(/date:\s*["']([^"']+)["']/g)].map((m) => m[1]).filter((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d));
    return { pass: dups.length === 0 && badDate.length === 0, ev: `글 ${slugs.length}편·slug중복 ${dups.length}·날짜오류 ${badDate.length}` };
  } },
  "G15-COUNT": { stage: "15단계 분양소식", auto: true, fn: () => {
    // 7편 상한(15단계 §0) = 지역 롱테일 4(15-A) + 현장 사건 뉴스 3(15-B). 배분 자체는 수동(G15-ANGLE)이 보고 여기선 총량만 본다.
    const n = read("src/lib/news.ts");
    const dates = [...n.matchAll(/date:\s*["'](\d{4}-\d{2}-\d{2})["']/g)].map((m) => m[1]);
    const count = dates.length;
    const firstDeploy = count > 0 && new Set(dates).size === 1; // 첫 배포 = 전 글 동일 t=0 날짜(15-A 지역 롱테일). 운영 누적(날짜 분산) 시 배분 검사 면제.
    const overCap = count > 7;
    const seedBad = firstDeploy && (count < 2 || count > 4);     // 15-A는 2~4편(빈 /news 금지 · 사건 슬롯 선점 금지)
    const pass = !overCap && !seedBad;
    return { pass, ev: overCap ? `${count}편 — 7편 상한 초과(15단계 §0)` : seedBad ? `첫 배포 ${count}편 — 15-A 지역 롱테일은 2~4편이어야 한다` : `${count}편 / 상한 7편` };
  } },
  "G15-ANGLE": { stage: "15단계 분양소식", auto: false },
  "G15-LOCALFACT": { stage: "15단계 분양소식", auto: false },

  // ── 16단계 배포 ──
  "G12-TERM": { stage: "12단계 분양", auto: true, fn: () => {
    // 네이버에 실제로 치는 말은 `모델하우스`인데 원본이 입주자모집공고라 본문이 `견본주택`으로 채워진다(12단계 ★표기 통일).
    // 이건 노출 '자격'이 아니라 **본문 형태소 매칭**에 직접 걸리는 항목이라 소유 페이지에서 검색어가 우세해야 한다.
    // ⚠️ 치환 게이트지 분량 게이트가 아니다 — 문장을 추가해 횟수를 늘리는 건 스터핑(G14-BRANDDENS가 별도로 잡는다).
    // ⚠️ 현장이 `갤러리·홍보관` 명칭을 쓰면 이 게이트의 대상어도 그 명칭으로 바꿔야 한다.
    if (!ROUTES.includes("modelhouse")) return { pass: true, ev: "/modelhouse 라우트 없음 → 대상 아님(G5-ROUTES가 별도 판정)" };
    const t = stripCode(html("modelhouse"));
    const n = (w) => (t.match(new RegExp(w, "g")) || []).length;
    const kw = n("모델하우스"), law = n("견본주택");
    const pass = kw >= law * 2;
    return { pass, ev: `모델하우스 ${kw}회 : 견본주택 ${law}회` + (pass ? " ✓" : " — 검색어가 법령어에 밀림. 본문 단어만 치환(분량 유지), 첫 등장 1회만 `모델하우스(견본주택)` 병기") };
  } },
  "G14-BRANDDENS": { stage: "14단계 SEO", auto: true, fn: () => {
    // 현장명이 title·H1·alt·JSON-LD 같은 기계 판독 자리에만 몰리고 본문 텍스트엔 없으면 네이버 본문 매칭에서 그대로 손해(14단계 §브랜드 토큰 본문 밀도).
    // 원인은 본문이 브랜드를 "본 단지·본 현장·이 단지"로 받아버리는 것 → 보강 순서는 ①대명사 환원 ②문단 첫 주어 복원 ③(메인만)요약 블록.
    // ⚠️ "N회 목표표"를 만들어 채우지 말 것 — 100자 미만은 스터핑으로 같이 경고한다.
    if (!BRAND_NAME) return { pass: true, ev: "site.ts에서 현장명(BRAND.short)을 못 읽음 → 판정 보류. site.ts를 먼저 채울 것" };
    const RE = BRAND_NAME.split(/\s+/).join("\\s*");   // 표기 변형(띄어쓰기 유무)까지 흡수 — 현장명은 한글이라 정규식 메타문자 이스케이프 불필요
    const thin = [], stuff = [];
    for (const r of CONTENT_ROUTES) {
      const t = stripCode(html(r));
      if (t.length < 800) continue;                       // 크롬만 있는 얇은 페이지는 밀도 판정 대상 아님
      const c = (t.match(new RegExp(RE, "g")) || []).length;
      const per = c ? Math.round(t.length / c) : Infinity;
      if (per > 400) thin.push(`${r} ${c}회/${t.length}자(${c ? per + "자당 1회" : "0회"})`);
      else if (per < 100) stuff.push(`${r} ${per}자당 1회`);
    }
    return { pass: thin.length === 0, ev: (thin.length ? `밀도 미달(400자 초과): ${thin.join(" · ")} — 대명사 환원 필요` : `전 라우트 400자당 1회 이상 ✓(목표 250자)`) + (stuff.length ? ` / ⚠️스터핑 점검: ${stuff.join(" · ")}` : "") };
  } },
  "G14-ALTKW": { stage: "14단계 SEO", auto: true, fn: () => {
    // "{현장명} 모델하우스"·"{현장명} 평면도"는 통합검색에 **이미지 영역이 함께 뜨는 쿼리**다.
    // alt가 법령어(견본주택)·영문·장식문구면 그 영역 매칭에서 빠진다. 파일명(G14-IMGNAME)은 영문 slug라 한글 쿼리를 못 받으므로 alt가 유일한 한글 신호.
    const NEED = { modelhouse: "모델하우스", floorplan: "평면도" };
    const bad = [], okList = [];
    for (const [r, kw] of Object.entries(NEED)) {
      if (!ROUTES.includes(r)) continue;
      const alts = [...html(r).matchAll(/<img[^>]*\salt="([^"]*)"/g)].map((m) => m[1]).filter((a) => a.trim());
      if (alts.length === 0) { bad.push(`${r}: alt 있는 <img> 0개`); continue; }
      const hit = alts.filter((a) => a.includes(kw)).length;
      if (hit < alts.length) bad.push(`${r}: alt ${alts.length}개 중 "${kw}" 포함 ${hit}개`);
      else okList.push(`${r} ${alts.length}개 ✓`);
    }
    return { pass: bad.length === 0, ev: bad.length ? bad.join(" · ") + " — alt에 그 페이지 주력 한글 검색어를 넣을 것(법령어·영문만으론 이미지검색 매칭 0)" : (okList.join(" · ") || "대상 라우트 없음") };
  } },
  "G16-LASTMOD": { stage: "16단계 배포", auto: true, fn: () => {
    // lastmod가 옛 날짜에 고정되면 크롤러가 다시 올 이유가 없다. 분양은 분양가·일정·분양단계가 계속 바뀌는데 재수집 신호만 죽어 있는 상태가 흔하다.
    // 판정 대상은 "기준일 값" — 재배포 때 site.ts updatedAt을 갱신하면 전 페이지 lastmod가 같이 올라간다(14단계 §config BRAND.updatedAt).
    const sm = read("src/app/sitemap.ts");
    if (!sm) return { pass: true, ev: "src/app/sitemap.ts 없음 → 대상 아님(존재 판정은 G14-OUT6)" };
    const upd = (read("src/lib/site.ts").match(/updatedAt:\s*["'](20\d\d-\d\d-\d\d)/) || [])[1];
    const hard = (sm.match(/["'](20\d\d-\d\d-\d\d)/) || [])[1];
    const base = upd || hard;
    if (!base) return { pass: false, ev: "lastmod 기준일을 못 찾음 — site.ts에 updatedAt: \"YYYY-MM-DD\" 를 두고 sitemap.ts가 그걸 쓰게 할 것" };
    const days = Math.floor((Date.now() - Date.parse(base)) / 86400000);
    return { pass: days <= 90, ev: `lastmod 기준일 ${base} (${days}일 전)${upd ? "" : " ※sitemap.ts 하드코딩 — site.ts updatedAt로 옮길 것"}` + (days <= 90 ? " ✓" : " — 90일 초과 고정. 재배포 시 갱신할 것") };
  } },
  "G16-ESLINT": { stage: "16단계 배포", auto: true, fn: () => {
    try { execSync("npx eslint src", { cwd: ROOT, stdio: "pipe" }); return { pass: true, ev: "eslint 0" }; }
    catch (e) { const out = (e.stdout?.toString() || "") + (e.stderr?.toString() || ""); return { pass: false, ev: `eslint 에러/경고: ${out.split("\n").filter((l) => /error|warning/i.test(l)).slice(0, 3).join(" | ")}` }; }
  } },
  "G16-UNUSED": { stage: "16단계 배포", auto: true, fn: () => {
    const hay = walk(".next/server").concat(walk(".next/static"), srcFiles, walk("public").filter((f) => /\.(txt|xml|json)$/.test(f)))
      .map(read).join("\n");
    const imgs = walk("public/images").concat(walk("public/videos")).filter((f) => /\.(webp|jpg|jpeg|png|svg|mp4)$/i.test(f))
      .map((f) => "/" + path.relative("public", f).replace(/\\/g, "/"));
    // 경계 매칭: basename 앞에 `/`(리터럴 경로)·`2F`/`2f`(%2F 인코딩)·따옴표가 와야 진짜 참조.
    // "jannae01"⊃"annae01" 같은 부분문자열 충돌(거짓음성) 방지.
    const used = (b) => hay.includes("/" + b) || hay.includes("2F" + b) || hay.includes("2f" + b) || hay.includes('"' + b) || hay.includes("'" + b);
    const unused = imgs.filter((i) => !used(path.basename(i)));
    return { pass: unused.length === 0, ev: unused.length ? `미사용 자산 ${unused.length}: ${unused.slice(0, 4).map((u) => path.basename(u))}` : `미사용 자산 0` };
  } },
  "G16-PERF": { stage: "16단계 배포", auto: true, fn: () => {
    let j; try { j = JSON.parse(read("reports/lighthouse.json")); } catch { return { pass: false, ev: "reports/lighthouse.json 없음 — 로딩속도 미측정(RED)" }; }
    const d = j.desktop?.home, m = j.mobile?.home;
    // 홈만으론 부족 — 이미지 최다 서브(complex·modelhouse 등) 1개 이상 실측 필수(서브 LCP 회귀 방지)
    const subs = Object.keys(j.desktop || {}).filter((k) => k !== "home" && typeof j.desktop[k]?.perf === "number");
    const has = d && typeof d.perf === "number" && typeof d.lcpSec === "number" && m && typeof m.perf === "number" && subs.length >= 1;
    const flag = d && d.lcpSec > (j.thresholds?.lcpSec ?? 2.5) ? " [데스크탑 LCP 임계초과=플래그]" : "";
    return { pass: !!has, ev: has ? `실측 기록됨(데스크탑 Perf ${d.perf}/LCP ${d.lcpSec}s, 모바일 Perf ${m.perf}, 서브: ${subs.join(",")})${flag}` : "실측값 누락 — 홈(데스크탑+모바일) + 이미지 무거운 서브 1개 이상 필요" };
  } },
  "G16-IMGWEIGHT": { stage: "16단계 배포", auto: true, fn: () => {
    // 전송량·LCP '원인' 상한(결정론): 본문 이미지 ≤800KB(목표는 5단계 §7 ≤300KB) · 영상 ≤1.5MB(6단계 목표 ≤1MB) · OG ≤1MB(14단계 규격)
    const files = walk("public/images").concat(walk("public/videos")).filter((f) => /\.(webp|jpg|jpeg|png|mp4|webm)$/i.test(f));
    const over = files.filter((f) => {
      const s = fs.statSync(f).size;
      const isVideo = /\.(mp4|webm)$/i.test(f);
      const isOg = /[\\/]og[\\/]/.test(f);
      const lim = isVideo ? 1.5 * 1024 * 1024 : isOg ? 1024 * 1024 : 800 * 1024;
      return s > lim;
    });
    return { pass: over.length === 0, ev: over.length
      ? `용량 초과 ${over.length}건: ${over.slice(0, 4).map((f) => path.basename(f) + "(" + Math.round(fs.statSync(f).size / 1024) + "KB)")} — 다운스케일/재인코딩 필요`
      : `배포 자산 용량 상한 통과(이미지≤800KB·영상≤1.5MB·OG≤1MB, ${files.length}개)` };
  } },
  "G16-LCP": { stage: "16단계 배포", auto: true, fn: () => {
    // LCP 개선 '원인' 강제(결정론): 히어로 등 above-fold를 next/image로 렌더하면 최소 1곳에 priority 힌트가 있어야 함.
    // next/image 미사용(배경이미지 방식)이면 강제 불가 → 면제(PASS). ※ 점수 미달은 여전히 #13 플래그, 이건 '원인'을 막는 것.
    const imgFiles = srcFiles.filter((f) => /from\s+["']next\/image["']/.test(read(f)));
    if (imgFiles.length === 0) return { pass: true, ev: "next/image 미사용 → priority 강제 면제(배경이미지 방식 가능)" };
    const hasPriority = imgFiles.some((f) => /\bpriority\b/.test(read(f)));
    return { pass: hasPriority, ev: hasPriority ? `next/image ${imgFiles.length}파일 중 priority 힌트 존재(히어로 LCP)` : `next/image ${imgFiles.length}파일에 priority 0 — 히어로 LCP 힌트 누락(개선 필요)` };
  } },
  "G16-CLS": { stage: "16단계 배포", auto: true, fn: () => {
    // CLS 개선 '원인' 강제(결정론): raw <img>는 next/image 우회 → 치수 없으면 레이아웃 시프트. width+height 또는 fill 없는 raw <img> 0.
    const bad = [];
    for (const f of srcFiles.filter((f) => /\.tsx?$/.test(f))) {
      for (const m of read(f).matchAll(/<img\b[^>]*>/gi)) {
        const tag = m[0];
        const dims = /\bwidth[=\s]/.test(tag) && /\bheight[=\s]/.test(tag);
        if (!dims && !/\bfill\b/.test(tag)) bad.push(path.basename(f));
      }
    }
    return { pass: bad.length === 0, ev: bad.length ? `치수 없는 raw <img> ${bad.length}곳(CLS 위험): ${[...new Set(bad)].slice(0, 4)} — next/image 또는 width/height 부여` : `raw <img> 치수 누락 0(next/image·명시치수 → CLS 원인 제거)` };
  } },
  "G16-FONT": { stage: "16단계 배포", auto: true, fn: () => {
    // 폰트 블로킹 방지(결정론): 웹폰트는 next/font(self-host+swap) 경유. 외부 fonts.googleapis/gstatic를 <link>/@import로 직접 로드하면 렌더 블로킹 → RED.
    const usesNextFont = /from\s+["']next\/font/.test(srcText);
    const rawFontLink = /<link[^>]+fonts\.(googleapis|gstatic)\.com/i.test(allHtml) || /@import[^;]*fonts\.googleapis/i.test(srcText);
    const pass = usesNextFont || !rawFontLink;
    return { pass, ev: usesNextFont ? "next/font 사용(self-host+swap)" : rawFontLink ? "외부 웹폰트 <link>/@import 직접 로드(렌더 블로킹) — next/font 전환 필요" : "외부 웹폰트 직접 로드 0(next/font 또는 시스템폰트)" };
  } },
  "G16-SECRET": { stage: "16단계 배포", auto: true, fn: () => {
    const stat = walk(".next/static").map(read).join("\n");
    const tok = read(".env.local").match(/TELEGRAM_BOT_TOKEN=([^\s]+)/);
    const leak = tok && stat.includes(tok[1]);
    return { pass: !leak, ev: leak ? "⚠️ 텔레그램 토큰 클라번들 노출!" : "비밀값 클라번들 비노출" };
  } },
  "G16-ANALYTICS": { stage: "16단계 배포", auto: true, fn: () => {
    // GA4 도입 현장만 검사 — site.ts gaId 빈값 = 미도입(면제·스크립트 0이 정상). 규정 = 8단계 §2 전환 추적.
    const gaId = (read("src/lib/site.ts").match(/gaId:\s*["'](G-[A-Z0-9]+)["']/) || [])[1] || "";
    if (!gaId) return { pass: true, ev: "gaId 미설정 → 측정 미도입 현장(면제)" };
    const helper = ok("src/lib/analytics.ts");
    const hasEvents = /form_submit_success/.test(srcText) && /tel_click/.test(srcText);
    // track() 인자에 개인정보 필드(성함·연락처 값) 전달 흔적 = 개인정보보호법 위험 → RED
    const leak = /track\s*\([^)]*(성함|연락처|이름|\bphone\b)/i.test(srcText);
    const pass = helper && hasEvents && !leak;
    return { pass, ev: !helper ? "gaId 설정됐으나 src/lib/analytics.ts 헬퍼 없음"
      : !hasEvents ? "gaId 설정됐으나 form_submit_success·tel_click 추적 호출 누락"
      : leak ? "⚠️ track() 인자에 개인정보 필드 흔적 — 이벤트명·위치 파라미터만 전송할 것"
      : `GA4 ${gaId} 추적 존재·개인정보 유출 흔적 0` };
  } },
  "G16-DEVICE": { stage: "16단계 배포", auto: false },
};

// ── 헬퍼: 청약 지난일정 나열 가드 ──
// 금지: 지난 청약 "일정 나열"(청약단계어 바로 옆에 완전한 날짜) + 미분양 urgency 표현.
// 허용(승인된 정식 표현): "잔여 세대를 대상으로 선착순 동·호 지정 계약"(잔여세대 자체는 OK), "특별공급 N세대"(공급 물량).
function scheduleGuard(routes) {
  const hits = [];
  for (const r of routes) {
    const text = stripCode(html(r));
    // 청약단계어 바로 뒤에 완전한 날짜 = 일정 나열로 간주. 숫자형(YYYY.MM.DD)과 한글형(YYYY년 M월 D일) 둘 다 검출. "특별공급 96세대"는 날짜 아니라 불검출.
    if (/(특별\s*공급|1\s*순위|2\s*순위|당첨자\s*발표|정당\s*계약|청약\s*접수)\s*[:：(]?\s*(\d{4}[.\-]\s?\d{1,2}[.\-]\s?\d{1,2}|\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일)/.test(text)) hits.push(`${r}:지난청약일정나열`);
    // 미분양 urgency — '잔여세대' 단독은 승인 표현이라 제외, 소진/미분양/할인/마감임박만 검출.
    if (/미분양|소진\s*임박|소진에 따라|할인\s*분양|미계약\s*세대|선착순\s*마감\s*임박/.test(text)) hits.push(`${r}:미분양인식표현`);
  }
  return { pass: hits.length === 0, ev: hits.length ? hits.join(", ") : `지난 청약 일정 나열·미분양 urgency 0(선착순 정식표기 OK)` };
}
// ── 헬퍼: 내부링크 orphan + 본문 같은 URL 중복 (홈=index는 루트 href="/"로 항상 도달 → orphan 대상 제외) ──
// orphan은 전역 nav 포함(크롤 경로 보장)으로 판정하되, '같은 URL 1회'(11단계 §내부링크)는 본문 기준으로 기계 강제:
// 헤더·푸터·nav를 제거한 본문에서 같은 내부 URL 2회+ = FAIL(전환 CTA #reservation·홈 "/"·뉴스 목록 카드는 제외).
function orphanCheck() {
  const stripChrome = (h) => h
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ");
  const inbound = {};
  CONTENT_ROUTES.filter((r) => r !== "index").forEach((r) => (inbound[r] = 0));
  const dup = [];
  for (const r of ROUTES) {
    const full = html(r);
    for (const m of full.matchAll(/href="\/([\w-]+)(?:[/#][^"]*)?"/g)) {
      const t = m[1]; if (t in inbound && t !== r) inbound[t]++;
    }
    const seen = {};
    for (const m of stripChrome(full).matchAll(/href="(\/[\w-]+(?:\/[\w-]+)?)(#[^"]*)?"/g)) {
      const p = m[1], hash = m[2] || "";
      if (p === "/" || hash.includes("reservation")) continue;      // 홈 breadcrumb·전환 CTA 예외
      if (r === "news" && /^\/news\//.test(p)) continue;             // 뉴스 색인의 글 목록 카드 예외
      seen[p] = (seen[p] || 0) + 1;
    }
    for (const [p, n] of Object.entries(seen)) if (n > 1) dup.push(`${r}:${p}×${n}`);
  }
  const orphans = Object.entries(inbound).filter(([, n]) => n === 0).map(([r]) => r);
  const pass = orphans.length === 0 && dup.length === 0;
  return { pass, ev: pass ? `orphan 0 · 본문 같은 URL 중복 0` : `${orphans.length ? "orphan: " + orphans + " · " : ""}${dup.length ? "본문 URL 중복: " + dup.slice(0, 4).join(", ") : ""}` };
}

// ── docs에서 게이트ID 파싱 (커버리지 강제) ──────────────────────────────
function parseGateIds() {
  const ids = {};
  for (const f of (ok("docs") ? fs.readdirSync("docs") : []).filter((f) => /^일-.*\.md$/.test(f))) {
    const c = read(path.join("docs", f));
    // 섹션 헤더는 줄머리(^## 완료조건 (기계 판정))로만 — COMMON 문단의 인라인 언급 무시.
    const idx = c.search(/^## 완료조건 \(기계 판정\)/m);
    if (idx === -1) continue;
    const after = c.slice(idx).replace(/^## 완료조건 \(기계 판정\)/m, "");
    const end = after.search(/\n## |\n---/);
    const block = end === -1 ? after : after.slice(0, end);
    for (const m of block.matchAll(/\[(G[0-9][0-9A-Za-z-]*)\][^\n]*?\|\s*(auto|manual)(?:\s*\|\s*(blocker|권고))?/g)) {
      ids[m[1]] = { file: f, kind: m[2], sev: m[3] === "권고" ? "warn" : "blocker" };   // 3번째 필드 = 심각도. 미표기는 blocker(라벨 누락이 조용히 통과하지 않게).
    }
  }
  return ids;
}

// ── 단계 필터 (--stage=N) ───────────────────────────────────────────────
// 중간 단계 작업 중엔 그 단계까지만 판정한다(필터 없으면 1~16 전체 = 배포 게이트).
//   node scripts/verify.mjs --stage=7      → G1~G7만 판정 (누적)
//   node scripts/verify.mjs --stage=10-13  → G10~G13만 판정 (구간)
// ⚠️ 부분 GREEN은 "그 단계 완료"일 뿐 "배포 가능"이 아니다(출력이 구분해 찍는다).
// ⚠️ 라우트 스캐폴드(5단계) 전에는 G1-BUILD(라우트≥9)가 구조상 RED — 1~4단계는
//    manual 증거(reports/manual-evidence.json) 중심이라 이 필터는 5단계부터 실용적.
const STAGE_ARG = (process.argv.find((a) => a.startsWith("--stage=")) || "").split("=")[1] || "";
const [SMIN, SMAX] = (() => {
  if (!STAGE_ARG) return [1, 16];
  const m = STAGE_ARG.match(/^(\d{1,2})(?:-(\d{1,2}))?$/);
  if (!m) { console.log(`❌ --stage 형식 오류: "${STAGE_ARG}" (예: --stage=7 · --stage=10-13)`); process.exit(1); }
  return m[2] ? [+m[1], +m[2]] : [1, +m[1]];   // --stage=7 = 1~7단계 누적
})();
const stageOf = (id) => +((id.match(/^G(\d{1,2})/) || [])[1] || 0);

// ── 실행 ────────────────────────────────────────────────────────────────
console.log(`══ 마스터 검증 게이트 (${SMIN}~${SMAX}단계${STAGE_ARG ? " — 부분 판정" : ""}) ══`);
console.log(`slug=${SLUG || "(미감지)"} · 라우트 ${ROUTES.length}개\n`);

// ── 자기검사: NEEDS_BUILD 커버리지 (거짓 GREEN 방지의 마지막 잠금) ──────
// 빌드 결과를 읽는 검사인데 NEEDS_BUILD에 빠져 있으면, 빌드 없이 돌릴 때 빈 HTML을 읽고
// "위반 0 = PASS"가 되어 거짓 GREEN이 난다. 목록 관리를 사람 기억에 맡기지 않고
// 각 게이트 fn의 소스(fn.toString())에서 기계로 잡는다 — 새 게이트를 추가해도 빠뜨릴 수 없다.
const BUILD_TOKENS = [
  /\bhtml\s*\(/, /\bROUTES\b/, /\bCONTENT_ROUTES\b/, /\bALL_PAGES\b/, /\ballHtml\b/,
  /\bAPP\b/, /\.next\//, /\bscheduleGuard\s*\(/, /\borphanCheck\s*\(/,
];
const nbLeak = Object.entries(CHECKS)
  .filter(([id, c]) => c.auto && c.fn && !NEEDS_BUILD.has(id) && BUILD_TOKENS.some((re) => re.test(c.fn.toString())))
  .map(([id]) => id);
const nbGhost = [...NEEDS_BUILD].filter((id) => !CHECKS[id]);
if (nbLeak.length) {
  console.log(`❌ 스크립트 계약 위반 — 빌드 결과를 읽는데 NEEDS_BUILD에 없는 게이트 ${nbLeak.length}개: ${nbLeak.join(", ")}`);
  console.log("   이대로 두면 `npm run verify`(빌드 없음)에서 빈 HTML을 읽어 '위반 0'으로 통과한다(거짓 GREEN).");
  console.log("   → 위 ID를 NEEDS_BUILD에 추가한 뒤 다시 실행할 것.");
  process.exit(1);
}
if (nbGhost.length) console.log(`⚠️ NEEDS_BUILD에 있으나 CHECKS에 없는 ID(오타 의심): ${nbGhost.join(", ")}\n`);

// ── 빌드 모드 ───────────────────────────────────────────────────────────
// FRESH(.next가 소스 최신 변경 이후 빌드)가 아니면 빌드 의존 게이트는 판정 불가 → ⏭미판정.
// 배포 판정(필터 없음)은 ⏭를 허용하지 않는다 — 반드시 `npm run verify:build`.
if (!FRESH) {
  const why = BUILT ? ".next가 src/public 변경보다 오래됨(stale)" : ".next/server/app 없음";
  if (!STAGE_ARG) {
    console.log(`❌ ${why} — 배포 판정은 최신 빌드가 필수다. \`npm run verify:build\` 실행. (G1-BUILD RED)`);
    process.exit(1);
  }
  console.log(`⏭ ${why} — 빌드 의존 게이트 ${NEEDS_BUILD.size}개는 건너뛰고 소스 게이트만 판정한다(빠른 반복용).`);
  console.log(`   단계를 마감할 때 1회만 \`npm run verify:build -- --stage=${STAGE_ARG}\`로 전체 판정할 것.\n`);
}

const declared = parseGateIds();
const allDeclaredIds = Object.keys(declared);
const declaredIds = allDeclaredIds.filter((id) => stageOf(id) >= SMIN && stageOf(id) <= SMAX);
const deferred = allDeclaredIds.length - declaredIds.length;
const results = [];
const fail = [];      // blocker FAIL — 진행/배포를 막는다
const warn = [];      // 권고 FAIL — 출력에만 남기고 막지 않는다(다음 배포 개선)
const skipped = [];   // 빌드 없음/stale로 미판정된 빌드 의존 게이트

// 1) 선언된 게이트ID 전부 검사 (미구현 = RED)
//    심각도(blocker|권고)는 docs 선언 3번째 필드에서 온다. 권고 FAIL은 exit code를 바꾸지 않는다.
for (const id of declaredIds) {
  const sev = declared[id].sev || "blocker";
  const bucket = sev === "warn" ? warn : fail;
  const impl = CHECKS[id];
  // 미구현은 심각도와 무관하게 계약 위반(선언 ↔ 검사 1:1) → 항상 blocker.
  if (!impl) { results.push({ id, sev: "blocker", stage: "?", pass: false, ev: `미구현 — docs(${declared[id].file})에 선언됐으나 CHECKS에 없음` }); fail.push(id); continue; }
  if (!FRESH && NEEDS_BUILD.has(id)) {   // 빌드 결과 없음/stale → 판정 불가(FAIL 아님, 미판정)
    results.push({ id, sev, stage: impl.stage, skip: true, ev: "미판정 — 빌드 필요(npm run verify:build)" });
    skipped.push(id); continue;
  }
  if (impl.auto) {
    let r; try { r = impl.fn(); } catch (e) { r = { pass: false, ev: "검사 예외: " + e.message }; }
    results.push({ id, sev, stage: impl.stage, pass: r.pass, ev: r.ev });
    if (!r.pass) bucket.push(id);
  } else {
    const e = manualEvidence(id);
    const has = e.length > 0;
    results.push({ id, sev, stage: impl.stage, pass: has, ev: has ? `manual 증거: ${e}` : "manual 증거 없음(reports/manual-evidence.json)" });
    if (!has) bucket.push(id);
  }
}
// 2) 구현됐으나 어느 md에도 선언 안 된 검사 (orphan 검사 — 경고)
//    ※ 단계 필터와 무관하게 "전체 선언분"과 대조 (필터 때문에 미선언으로 오탐하지 않게)
const orphanChecks = Object.keys(CHECKS).filter((id) => !allDeclaredIds.includes(id));

// ── 출력 (단계별 그룹) ──
const byStage = {};
for (const r of results) (byStage[r.stage] ||= []).push(r);
for (const stage of Object.keys(byStage)) {
  console.log(`── ${stage} ──`);
  for (const r of byStage[stage]) console.log(`  ${r.skip ? "⏭" : r.pass ? "✅" : r.sev === "warn" ? "⚠️" : "❌"} ${r.id}: ${r.ev}`);
}
if (orphanChecks.length) console.log(`\n⚠️ docs 미선언 검사(완료조건에 ID 추가 필요): ${orphanChecks.join(", ")}`);

console.log("\n──────────────────────────────");
// 권고 FAIL은 항상 따로 요약한다 — 막지는 않지만 묻히지도 않게.
if (warn.length) console.log(`⚠️ 권고 ${warn.length}건(진행 가능 · 다음 배포 개선): ${warn.join(", ")}`);
if (fail.length === 0 && declaredIds.length > 0) {
  if (STAGE_ARG) {
    const judged = declaredIds.length - skipped.length;
    console.log(`✅ GREEN(부분) — ${SMIN}~${SMAX}단계 blocker 게이트 전부 PASS(판정 ${judged}개)${skipped.length ? ` · ⏭ 빌드 의존 ${skipped.length}개 미판정` : ""}.`);
    if (skipped.length) console.log(`   ⏭ ${skipped.join(", ")} → 단계 마감 1회: \`npm run verify:build -- --stage=${STAGE_ARG}\` 가 GREEN이어야 "${SMAX}단계 완료".`);
    console.log(`   미판정 ${deferred}개(다른 단계) 남음 → "${SMAX}단계 완료"까지만. "배포 가능" 아님 — 배포 판정은 필터 없이 \`npm run verify:build\`.`);
  } else {
    console.log(`✅ GREEN — 선언 게이트 ${declaredIds.length}개 중 blocker 전부 PASS.${warn.length ? ` (권고 ${warn.length}건은 배포 차단 아님)` : ""} (완료/배포 가능)`);
  }
  process.exit(0);
} else {
  if (declaredIds.length === 0) console.log(`❌ 판정 대상 게이트 0개 — docs에 \`## 완료조건 (기계 판정)\` + [Gxx-*]가 없거나, --stage=${STAGE_ARG} 범위에 해당 게이트가 없음.`);
  console.log(`❌ RED — blocker FAIL ${fail.length}건: ${fail.join(", ")}`);
  if (skipped.length) console.log(`   ⏭ 빌드 의존 ${skipped.length}개는 미판정(빌드 없음/stale): ${skipped.join(", ")}`);
  console.log(`   (blocker가 GREEN이기 전엔 "${STAGE_ARG ? SMAX + "단계 완료" : "완료/배포 가능"}"라 말하지 말 것. 권고는 막지 않는다.)`);
  process.exit(1);
}
