/**
 * 메인 사용자첨부 슬롯용 **제작 아트보드** 렌더러 — 평면도(05)·분양안내(06).
 *
 * 사용자 실자료(실도면·공고 이미지)가 오기 전까지 쓰는 자체 제작 패널이다.
 * 실자료를 받으면 이 산출물을 버리고 원본을 `--user`로 물질화한다.
 *
 * 사용:
 *   node scripts/design-boards/render.mjs
 *   node scripts/materialize-images.mjs --user=<out>/floorplan.png --slot=floorplan --n=01
 *   node scripts/materialize-images.mjs --user=<out>/sales.png     --slot=sales     --n=01
 *
 * ⚠️ 아트보드는 **실제 렌더 폭 1:1(640×480)**로 짜고 deviceScaleFactor로만 배율을 올린다.
 *    MagBlock 이미지 칸은 lg에서 ≈584px다. 1600px로 크게 짜서 축소하면 본문이 8px대로
 *    뭉개져 읽히지 않는다(6단계 §A 본문 하한과 같은 이유).
 * ⚠️ 금액·날짜·전화번호는 아트보드에 넣지 않는다 — 메인 분양가 금지(/sales 정본)이고,
 *    값이 바뀔 때마다 이미지 재제작이 필요해진다. 텍스트는 HTML 쪽(MagBlock caption 포함)에 둔다.
 * ⚠️ 배경은 투명(omitBackground)이다 — 섹션 배경이 흰(bg-surface)·아이보리(bg-background)로 갈리므로
 *    바탕을 칠하면 한쪽에서 네모가 드러난다. webp는 알파를 유지한다.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(path.join(process.cwd(), "package.json"));
const { chromium } = require("playwright");

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const out = path.join(dir, "out");
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 640, height: 480 }, deviceScaleFactor: 4 });

for (const name of ["floorplan", "sales"]) {
  await page.goto(pathToFileURL(path.join(dir, `${name}.html`)).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(out, `${name}.png`);
  await page.screenshot({ path: file, omitBackground: true });
  console.log("rendered", file, "(2560×1920)");
}
await browser.close();
