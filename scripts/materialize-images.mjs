/**
 * 이미지·영상 물질화 (5단계 §7) — 4단계 curated/ → public/ 배포 자산. 현장값 하드코딩 0.
 *
 * 이 스크립트는 **현장 무관**이다. 매 현장 새로 짜지 말고 이 블록을 그대로
 * `scripts/materialize-images.mjs`로 저장해 실행한다(2단계 extract-site.mjs · 16단계 verify.mjs와 같은 방식).
 *
 * 왜 스크립트인가: 변환 기준이 전부 게이트로 못박혀 있다 —
 *   [G14-IMGNAME] {slug}- 접두 키워드 파일명 · [G16-IMGWEIGHT] 이미지 ≤800KB·영상 ≤1.5MB·OG ≤1MB
 *   [G5-OGIMG] OG는 jpg/png(webp 금지) · 5단계 §7 최대 변 2560px·품질 75~80·본문 목표 ≤300KB
 * 손으로 하면 이 넷을 동시에 맞추지 못해 "게이트 RED → 고치고 → 또 RED" 루프를 돈다.
 *
 * 사용:
 *   npm i -D sharp                  (영상 재인코딩까지 하려면 ffmpeg 추가 — 없으면 복사+경고로 진행)
 *   node scripts/materialize-images.mjs                 # 물질화(5단계)
 *   node scripts/materialize-images.mjs --report        # docs/이미지-배치표.md 갱신(11~13단계)
 *   node scripts/materialize-images.mjs --user=<원본> --slot=modelhouse   # 사용자 직접 첨부(메인 3슬롯 — 10단계)
 *
 * 옵션:
 *   --extract=extract/<현장명>   2단계/4단계 산출 폴더(미지정 시 extract/ 아래에서 curation.json 자동 탐색)
 *   --og=<파일경로>              OG 원본 지정(미지정 시 hero → common → 첫 keep 순으로 자동 선택)
 *   --target=300                본문 이미지 목표 KB(기본 300 · 5단계 §7)
 *   --hard=800                  하드 상한 KB(기본 800 · G16-IMGWEIGHT)
 *   --max-side=2560             최대 변 px(기본 2560 · 5단계 §7)
 *   --user=<원본경로>            사용자 직접 첨부 원본(메인 3슬롯 전용 — curation.json과 무관)
 *   --slot=floorplan|sales|modelhouse   --user와 함께 필수(메인 슬롯 지정 · 출력은 public/images/home/)
 *   --n=NN                      첨부 파일 번호 고정(기본: 슬롯별 자동 증가)
 *   --dry                       실제로 쓰지 않고 계획만 출력
 *
 * ⚠️ 판정은 4단계 curation.json이 정본이다. 이 스크립트는 keep만 물질화하고
 *    maybe는 건드리지 않는다(사람 확인 큐 유지 — 5단계 §7 규칙).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

let sharp = null;
try { sharp = (await import("sharp")).default; }
catch { console.error("❌ sharp 미설치 — `npm i -D sharp` 후 다시 실행."); process.exit(1); }

// ── 인자 ────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const arg = (k, d) => {
  const hit = argv.find((a) => a === `--${k}` || a.startsWith(`--${k}=`));
  if (!hit) return d;
  return hit.includes("=") ? hit.split("=").slice(1).join("=") : true;
};
const REPORT_ONLY = !!arg("report", false);
const DRY = !!arg("dry", false);
const TARGET = +arg("target", 300) * 1024;
const HARD = +arg("hard", 800) * 1024;
const MAX_SIDE = +arg("max-side", 2560);
const OG_SRC_ARG = arg("og", "");

// ── 유틸 ────────────────────────────────────────────────────────────────
const ok = (p) => fs.existsSync(p);
const dir = (p) => { if (!DRY) fs.mkdirSync(p, { recursive: true }); return p; };
const read = (p) => (ok(p) ? fs.readFileSync(p, "utf8") : "");
const rel = (...p) => p.join("/");
const kb = (n) => Math.round(n / 1024) + "KB";
function walk(d, a = []) {
  if (!ok(d)) return a;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a); else a.push(p);
  }
  return a;
}

// ── 현장값 자동 감지 ────────────────────────────────────────────────────
const SLUG = (read("src/lib/site.ts").match(/slug:\s*["']([^"']+)["']/) || [])[1] || "";
if (!SLUG) console.log("⚠️ site.ts에서 slug를 못 찾음 — {slug}- 접두 강제(G14-IMGNAME)를 적용할 수 없다. site.ts를 먼저 채울 것.");

const EXTRACT = (() => {
  const a = String(arg("extract", "") || "");
  if (a) return a;
  const hit = walk("extract").find((p) => path.basename(p) === "curation.json");
  return hit ? path.dirname(hit) : "";
})();

// ══════════════════════════════════════════════════════════════════════
// 배치표 모드 (--report) — 11~13단계용. 물질화된 자산 × src 참조를 대조해 표를 만든다.
// 사람이 쓴 "미사용 사유"는 기존 표에서 그대로 승계한다(수작업 유실 방지).
// ══════════════════════════════════════════════════════════════════════
if (REPORT_ONLY) {
  const TABLE = "docs/이미지-배치표.md";
  const prev = {};
  for (const line of read(TABLE).split("\n")) {
    const m = line.match(/^\|\s*`?([^`|]+?)`?\s*\|/);
    if (!m) continue;
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length >= 6 && cells[5]) prev[path.basename(m[1])] = cells[5];
  }
  const srcFiles = walk("src").filter((f) => /\.(tsx?|css)$/.test(f));
  const srcMap = srcFiles.map((f) => [f, read(f)]);
  const assets = walk("public/images").concat(walk("public/videos"))
    .filter((f) => /\.(webp|jpg|jpeg|png|svg|mp4|webm)$/i.test(f))
    .map((f) => "/" + path.relative("public", f).replace(/\\/g, "/"));

  const routeOf = (f) => {
    const p = f.replace(/\\/g, "/");
    const m = p.match(/^src\/app\/(.*)\/page\.tsx$/);
    if (m) return "/" + m[1];
    if (/^src\/app\/page\.tsx$/.test(p)) return "/";
    return p;
  };
  const rows = assets.map((a) => {
    const base = path.basename(a);
    const refs = srcMap.filter(([, c]) => c.includes(base)).map(([f]) => routeOf(f));
    const cat = (a.match(/^\/images\/([^/]+)\//) || [])[1] || (a.startsWith("/videos/") ? "video" : "-");
    return {
      file: a, cat,
      pages: [...new Set(refs)].join(" · ") || "—",
      used: refs.length > 0,
      // OG·포스터는 메타/영상용이라 페이지 배치 대상이 아니다 — 사람에게 사유를 묻지 않는다.
      // OG·포스터는 메타/영상용이라 페이지 배치 대상이 아니다 — 사람에게 사유를 묻지 않는다.
      why: refs.length ? "" : (/^\/images\/(og|video)\//.test(a)
        ? "메타/영상 전용 — 페이지 배치 대상 아님"
        : (prev[base] || "**(미사용 사유를 채울 것)**")),
    };
  });
  const used = rows.filter((r) => r.used).length;
  const out = [
    "# 이미지 배치표 (현장 산출물 — 범용 md 아님)",
    "",
    `> 생성: \`node scripts/materialize-images.mjs --report\` · 자산 ${rows.length}개 중 배치 ${used}개 · 미사용 ${rows.length - used}개`,
    "> **자동 채움**: 파일·카테고리·배치 페이지·사용 여부(= src에서 그 파일명을 참조하는가).",
    "> **사람 몫**: 미사용 행의 `사유` 한 줄. 재생성해도 사유는 승계된다.",
    "> ⚠️ 11단계 규칙 — 정보가 있는 검증 자산은 **사용이 default**, 제외는 예외(사유 필수).",
    '>    "안 봤으니 뺀다"·"near-dup일 것 같아서"는 사유로 불인정. 장식·배경뿐이면 `장식·정보 없음`으로.',
    "",
    "| 파일 | 카테고리 | 배치 페이지 | 사용 | 사유(미사용 시) |",
    "|---|---|---|---|---|",
    ...rows.map((r) => `| \`${r.file}\` | ${r.cat} | ${r.pages} | ${r.used ? "✅" : "—"} | ${r.why} |`),
    "",
  ].join("\n");
  if (!DRY) { dir("docs"); fs.writeFileSync(TABLE, out, "utf8"); }
  console.log(out.split("\n").slice(0, 8).join("\n"));
  console.log(`\n✅ ${TABLE} 갱신 — 자산 ${rows.length} · 배치 ${used} · 미사용 ${rows.length - used}(사유 확인 필요)`);
  process.exit(0);
}

// ══════════════════════════════════════════════════════════════════════
// 사용자 직접 첨부 모드 (--user) — 메인 3슬롯(평면도·분양/임대/조합안내·모델하우스) 전용.
// 이 슬롯은 **4단계 큐레이션 대상이 아니다**(사용자가 직접 준 파일만 사용 — 10단계 정본).
// 하는 일: webp 변환 + 용량 상한 + `{slug}-` 키워드 파일명 + **연결용 ratio 출력**.
// 저장 위치는 `public/images/home/` 고정 — 카테고리 디렉토리(서브 전용)에 넣으면 [G10-IMG]가 누출로 RED.
// curation.json을 거치지 않으므로 기본 모드(`npm run images`)를 다시 돌려도 덮어쓰이지 않는다.
// ══════════════════════════════════════════════════════════════════════
const USER_SRC = String(arg("user", "") || "");
if (USER_SRC && USER_SRC !== "true") {
  const SLOTS = ["floorplan", "sales", "modelhouse"];
  const slot = String(arg("slot", "") || "").toLowerCase();
  if (!SLOTS.includes(slot)) { console.error(`❌ --slot=${SLOTS.join("|")} 를 지정할 것(메인 3슬롯 전용).`); process.exit(1); }
  if (!ok(USER_SRC) || !fs.statSync(USER_SRC).isFile()) { console.error(`❌ 원본 파일 없음: ${USER_SRC}`); process.exit(1); }
  const outDir = dir(path.join("public", "images", "home"));
  // 같은 슬롯에 여러 장이면 -01, -02 … 자동 증가(기존 파일 덮어쓰지 않는다). --n=NN 으로 고정 지정 가능.
  const nArg = +arg("n", 0) || 0;
  const seq = String(nArg || (walk(outDir).filter((f) => new RegExp(`home-${slot}-\\d+\\.`, "i").test(path.basename(f))).length + 1)).padStart(2, "0");
  const base = `${SLUG ? SLUG + "-" : ""}home-${slot}-${seq}`;   // [G14-IMGNAME] {slug}- 접두 강제
  const meta = await sharp(USER_SRC, { failOn: "none" }).metadata().catch(() => ({}));
  const w0 = meta.width || 0, h0 = meta.height || 0;
  // 평면도·안내 패널은 대개 세로로 길다 → 폭 기준으로만 줄인다(긴 변 기준이면 폭이 깎여 치수·면적 글자가 뭉갠다).
  const panel = !!(w0 && h0 && (h0 / w0 >= 1.6 || h0 >= 2000));
  const minWidth = panel ? 1400 : 900;
  let cap = panel ? Math.min(MAX_SIDE, w0 || MAX_SIDE) : Math.min(MAX_SIDE, Math.max(w0 || MAX_SIDE, h0 || MAX_SIDE));
  const dest = path.join(outDir, base + ".webp");
  let out = null;
  outer: for (let step = 0; step < 8; step++) {
    for (const q of [80, 75, 70, 65, 60, 55, 50]) {
      const pipe = sharp(USER_SRC, { failOn: "none" }).rotate();
      const buf = await (panel
        ? pipe.resize({ width: cap, withoutEnlargement: true })                    // 높이 자유(무크롭)
        : pipe.resize(cap, cap, { fit: "inside", withoutEnlargement: true })
      ).webp({ quality: q, effort: 4 }).toBuffer();
      out = { buf, q, cap };
      if (buf.length <= TARGET) break outer;
    }
    const next = Math.round(cap * 0.85);
    if (next < minWidth) break;     // 글자 가독 하한 — 더 줄이지 않는다(초과하면 '나눠 첨부'로 보고)
    cap = next;
  }
  if (!DRY) fs.writeFileSync(dest, out.buf);
  const om = DRY ? { width: cap, height: w0 && h0 ? Math.round((cap * h0) / w0) : 0 } : await sharp(dest).metadata().catch(() => ({ width: cap, height: 0 }));
  const url = "/" + path.relative("public", dest).replace(/\\/g, "/");
  const over = out.buf.length > HARD;
  console.log(`\n✅ 사용자 첨부 변환 완료 — ${slot} 슬롯${DRY ? " (dry)" : ""}`);
  console.log(`  파일  : ${url}  (${kb(out.buf.length)} · q${out.q}${over ? " ⚠️ [G16-IMGWEIGHT] 상한 초과 — 원본을 세로로 나눠 여러 장으로 첨부할 것" : ""})`);
  console.log(`  크기  : ${om.width}×${om.height}${panel ? " (세로 패널 — 폭 유지)" : ""}`);
  console.log(`  ratio : ${om.width}/${om.height}   ← MagBlock ratio 에 이 값 그대로`);
  console.log(`  연결  : <MagBlock image="${url}" ratio={${om.width}/${om.height}} alt="{현장명} …" />   ※ placeholder prop 제거`);
  console.log(`  확인  : npm run verify -- --stage=10   → [G10-IMG] GREEN`);
  process.exit(0);
}

// ══════════════════════════════════════════════════════════════════════
// 물질화 모드 (기본) — 5단계 §7
// ══════════════════════════════════════════════════════════════════════
if (!EXTRACT || !ok(path.join(EXTRACT, "curation.json"))) {
  console.error(`❌ curation.json 없음(${EXTRACT || "extract/*"}) — 4단계 큐레이션을 먼저 끝낼 것.`);
  process.exit(1);
}
let CURATION = [];
try { CURATION = JSON.parse(read(path.join(EXTRACT, "curation.json"))); }
catch (e) { console.error("❌ curation.json 파싱 실패: " + e.message); process.exit(1); }
if (!Array.isArray(CURATION)) { console.error("❌ curation.json이 배열이 아니다."); process.exit(1); }

const keeps = CURATION.filter((r) => r["판정"] === "keep");
const maybes = CURATION.filter((r) => r["판정"] === "maybe");
const keepImgs = keeps.filter((r) => (r.kind || "image") === "image");
const keepVids = keeps.filter((r) => r.kind === "video");

// 원본 경로 해석 — curated/<category>/<baseName>.<ext> 가 정본, 못 찾으면 여러 후보로 되짚는다.
const curatedFiles = walk(path.join(EXTRACT, "curated"));
function resolveSrc(entry) {
  const base = entry.baseName || "";
  const cands = [];
  if (base) cands.push(...curatedFiles.filter((f) => path.basename(f).replace(/\.[^.]+$/, "") === base));
  if (entry.file) {
    cands.push(path.join(EXTRACT, entry.file));
    cands.push(...curatedFiles.filter((f) => path.basename(f) === path.basename(entry.file)));
  }
  return cands.find((f) => ok(f) && fs.statSync(f).isFile()) || null;
}

// 파일명 강제 — {slug}-... 아니면 접두를 붙인다(G14-IMGNAME RED 예방)
function finalBase(entry, idx) {
  let b = (entry.baseName || "").trim().replace(/\.[^.]+$/, "");
  if (!b) b = `${entry.category || "common"}-${String(idx + 1).padStart(2, "0")}`;
  if (SLUG && !b.startsWith(SLUG + "-")) b = `${SLUG}-${b}`;
  return b.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-");
}

// 세로 긴 인포그래픽 패널 = 글자 가독 우선. 다운스케일보다 품질을 먼저 낮추고,
// 최소 폭 아래로는 절대 줄이지 않는다(줄이면 면적표·스펙 글자가 뭉갠다 → 분할 대상으로 보고).
const isPanel = (w, h) => h && w && (h / w >= 1.6 || h >= 2000);
const QUALITIES = [80, 75, 70, 65, 60, 55, 50];

async function toWebp(src, dest, meta) {
  const w = meta.width || 0, h = meta.height || 0;
  const panel = isPanel(w, h);
  // ⚠️ 패널(세로 긴 인포그래픽)은 **가로폭 기준**으로 줄인다.
  //    긴 변(=높이)에 2560을 걸면 1600×4200 패널이 976×2560이 되어 폭이 40% 깎인다
  //    → 면적표·스펙·시설명 글자가 뭉개진다. 5단계 §7 "글자 가독 우선"의 실제 구현.
  //    일반 이미지만 긴 변 기준(fit:inside)으로 다운스케일한다.
  let cap = panel ? Math.min(MAX_SIDE, w || MAX_SIDE) : Math.min(MAX_SIDE, Math.max(w || MAX_SIDE, h || MAX_SIDE));
  const minWidth = panel ? 1400 : 900;   // 이 아래로는 줄이지 않는다(줄이면 정보가 사라진다)
  let best = null;
  for (let step = 0; step < 8; step++) {
    for (const q of QUALITIES) {
      const pipe = sharp(src, { failOn: "none" }).rotate();
      const resized = panel
        ? pipe.resize({ width: cap, withoutEnlargement: true })                    // 높이는 자유(무크롭)
        : pipe.resize(cap, cap, { fit: "inside", withoutEnlargement: true });
      const buf = await resized.webp({ quality: q, effort: 4 }).toBuffer();
      best = { buf, q, cap, panel };
      if (buf.length <= TARGET) { if (!DRY) fs.writeFileSync(dest, buf); return { ...best, status: "target" }; }
    }
    const next = Math.round(cap * 0.85);
    if (next < minWidth) break;         // 글자 가독 하한 — 여기서 멈추고 '분할 검토'로 보고한다
    cap = next;
  }
  // 마지막 수단(패널 한정) — 폭은 지키고 품질만 더 낮춰 하드 상한 안에 넣어본다.
  // 폭을 깎으면 글자가 사라지지만, 품질은 낮춰도 글자 '형태'는 남는다. 순서가 중요하다.
  if (panel && best.buf.length > HARD) {
    for (const q of [45, 40]) {
      const buf = await sharp(src, { failOn: "none" }).rotate()
        .resize({ width: cap, withoutEnlargement: true }).webp({ quality: q, effort: 6 }).toBuffer();
      if (buf.length < best.buf.length) best = { buf, q, cap, panel };
      if (buf.length <= HARD) break;
    }
  }
  if (!DRY) fs.writeFileSync(dest, best.buf);
  const over = best.buf.length > HARD;
  return { ...best, status: over ? "over" : "hard-ok",
    // 그래도 초과하면 폭을 깎지 말고 **세로로 분할**하라는 뜻(5단계 §7 "안 되면 분할")
    needsSplit: over && panel, slices: over && panel ? Math.ceil(best.buf.length / HARD) : 0 };
}

// ── 이미지 물질화 ───────────────────────────────────────────────────────
const report = { images: [], videos: [], og: null, unresolved: [], over: [], maybeHeld: maybes.length };
let idx = 0;
for (const e of keepImgs) {
  const src = resolveSrc(e);
  const cat = (e.category || "common").replace(/[^\w-]/g, "");
  const base = finalBase(e, idx++);
  if (!src) { report.unresolved.push({ base, file: e.file, category: cat }); continue; }
  const outDir = dir(path.join("public", "images", cat));
  const dest = path.join(outDir, base + ".webp");
  let meta = {};
  try { meta = await sharp(src, { failOn: "none" }).metadata(); } catch { /* 헤더 불명 */ }
  if (/\.svg$/i.test(src)) {                      // SVG는 변환하지 않고 그대로(벡터 = 용량 작고 확대 무손실)
    if (!DRY) fs.copyFileSync(src, path.join(outDir, base + ".svg"));
    report.images.push({ file: rel("images", cat, base + ".svg"), bytes: fs.statSync(src).size, note: "svg 원본 유지" });
    continue;
  }
  const r = await toWebp(src, dest, meta);
  const outMeta = DRY ? { width: 0, height: 0 } : await sharp(dest).metadata().catch(() => ({ width: 0, height: 0 }));
  const rec = { file: rel("images", cat, base + ".webp"), bytes: r.buf.length, q: r.q, cap: r.cap, outW: outMeta.width, outH: outMeta.height, needsSplit: r.needsSplit, slices: r.slices,
    src: path.relative(".", src).replace(/\\/g, "/"), panel: isPanel(meta.width, meta.height), status: r.status };
  report.images.push(rec);
  if (r.status === "over") report.over.push(rec);
}

// ── OG 이미지(1200×630 jpg — webp 금지) ─────────────────────────────────
{
  let ogSrc = OG_SRC_ARG && ok(String(OG_SRC_ARG)) ? String(OG_SRC_ARG) : null;
  if (!ogSrc) {
    const pick = keepImgs.find((e) => /hero/i.test(e.category || "")) || keepImgs.find((e) => /common/i.test(e.category || "")) || keepImgs[0];
    ogSrc = pick ? resolveSrc(pick) : null;
  }
  if (!ogSrc) console.log("⚠️ OG 원본을 못 정했다 — --og=<파일>로 지정할 것(G5-OGIMG RED).");
  else {
    const ogDir = dir(path.join("public", "images", "og"));
    const ogDest = path.join(ogDir, `${SLUG || "site"}-og.jpg`);
    let buf = null;
    for (const q of [85, 80, 74, 68]) {
      buf = await sharp(ogSrc, { failOn: "none" }).rotate()
        .resize(1200, 630, { fit: "cover", position: "attention" })
        .jpeg({ quality: q, mozjpeg: true }).toBuffer();
      if (buf.length <= 1024 * 1024) break;
    }
    if (!DRY) fs.writeFileSync(ogDest, buf);
    report.og = { file: rel("images", "og", path.basename(ogDest)), bytes: buf.length, src: path.relative(".", ogSrc).replace(/\\/g, "/") };
  }
}

// ── 영상 물질화 ─────────────────────────────────────────────────────────
const ffmpeg = (() => {
  try { execSync("ffmpeg -version", { stdio: "pipe" }); return "ffmpeg"; } catch { return null; }
})();
if (keepVids.length && !ffmpeg) console.log("⚠️ ffmpeg 없음 — 영상은 재인코딩 없이 복사한다(용량 상한 1.5MB 초과 시 report에 표기).");
let vi = 0;
for (const e of keepVids) {
  const src = resolveSrc(e);
  const base = finalBase(e, vi++);
  if (!src) { report.unresolved.push({ base, file: e.file, category: "video" }); continue; }
  const vDir = dir(path.join("public", "videos"));
  const dest = path.join(vDir, base + ".mp4");
  try {
    if (ffmpeg && !DRY) {
      execSync(`ffmpeg -y -i "${src}" -c:v libx264 -crf 30 -preset slow -vf "scale='min(1280,iw)':-2" -c:a aac -b:a 96k -movflags +faststart "${dest}"`, { stdio: "pipe" });
    } else if (!DRY) fs.copyFileSync(src, dest);
    const bytes = DRY ? fs.statSync(src).size : fs.statSync(dest).size;
    // 포스터 프레임(LCP·지연로드용) — public/images/video/*.webp
    const pDir = dir(path.join("public", "images", "video"));
    const poster = path.join(pDir, base + "-poster.webp");
    if (ffmpeg && !DRY) {
      const tmp = path.join(pDir, base + "-tmp.png");
      execSync(`ffmpeg -y -ss 1 -i "${dest}" -frames:v 1 "${tmp}"`, { stdio: "pipe" });
      const pbuf = await sharp(tmp).resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
      fs.writeFileSync(poster, pbuf); fs.unlinkSync(tmp);
    }
    const rec = { file: rel("videos", base + ".mp4"), bytes, poster: ffmpeg ? rel("images", "video", base + "-poster.webp") : null, reencoded: !!ffmpeg };
    report.videos.push(rec);
    if (bytes > 1.5 * 1024 * 1024) report.over.push({ ...rec, status: "over" });
  } catch (err) {
    report.unresolved.push({ base, file: e.file, category: "video", error: String(err).slice(0, 120) });
  }
}

// ── 리포트 ──────────────────────────────────────────────────────────────
if (!DRY) { dir("reports"); fs.writeFileSync("reports/materialize.json", JSON.stringify(report, null, 2), "utf8"); }
const totalKeepImg = keepImgs.length;
const lines = [
  `▶ 물질화 완료${DRY ? " (dry-run — 파일 안 씀)" : ""} — slug=${SLUG || "(미감지)"} · 원본 ${EXTRACT}`,
  `  이미지 ${report.images.length}/${totalKeepImg}개 → public/images/  (목표 ≤${kb(TARGET)} · 하드 ≤${kb(HARD)})`,
  `  영상   ${report.videos.length}/${keepVids.length}개 → public/videos/${ffmpeg ? " (H.264 재인코딩 + 포스터)" : " (복사만 — ffmpeg 없음)"}`,
  report.og ? `  OG     ${report.og.file} ${kb(report.og.bytes)} (jpg — webp 금지)` : `  OG     ❌ 미생성 — G5-OGIMG RED`,
  `  maybe  ${report.maybeHeld}건 보류(사람 확인 큐 — 임의 keep 금지)`,
];
if (report.unresolved.length) {
  lines.push(`  ⚠️ 원본 못 찾음 ${report.unresolved.length}건: ${report.unresolved.slice(0, 5).map((u) => u.base).join(", ")}`);
  lines.push(`     → curation.json의 baseName과 curated/<category>/ 실제 파일명이 어긋났다. 4단계 ③ 리네임을 확인할 것.`);
}
if (report.over.length) {
  lines.push(`  ⚠️ 용량 상한 초과 ${report.over.length}건(G16-IMGWEIGHT RED 대상):`);
  for (const o of report.over.slice(0, 6)) lines.push(`     · ${o.file} ${kb(o.bytes)}${o.outW ? ` (${o.outW}x${o.outH})` : ""}` + (o.needsSplit
    ? ` [세로 패널 — 폭 ${o.outW}px는 글자 가독 때문에 줄이지 않았다. **세로 ${o.slices}등분**해 나눠 배치할 것(5단계 §7 "안 되면 분할")]`
    : " [원본 자체가 과대 — 4단계에서 더 작은 원본으로 교체 검토]"));
}
const panels = report.images.filter((i) => i.panel).length;
lines.push(`  세로 인포그래픽 패널 ${panels}개 — 최소 폭 1400px 유지(글자 가독 우선, 품질을 먼저 낮춤)`);
lines.push(`  근거: reports/materialize.json`);
console.log(lines.join("\n"));
if (report.over.length || report.unresolved.length) process.exit(1);
