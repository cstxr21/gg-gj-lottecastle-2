// scripts/keywords.mjs — 3단계 직후 키워드 리서치(자동)
// 네이버 자동완성 = 실입력 쿼리. 초성 스윕으로 목록을 소진시켜 현장명 롱테일을 전량 수집한다.
import fs from "node:fs";

const argName = process.argv[2];
const siteTs = (() => { try { return fs.readFileSync("src/lib/site.ts", "utf8"); } catch { return ""; } })();
const NAME = argName
  || (siteTs.match(/short:\s*["']([^"']+)["']/) || [])[1]
  || (siteTs.match(/name:\s*["']([^"']+)["']/) || [])[1];
if (!NAME) { console.error("현장명을 못 찾음 — 인자로 넘기거나 site.ts를 먼저 채울 것"); process.exit(1); }

// 초성 14 + 숫자 10 + 무접미 = 25회 조회로 자동완성 목록을 소진시킨다.
const SEEDS = ["", ..."ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ".split(""), ..."0123456789".split("")];
const ORDER = new Map();          // 쿼리 → 최초 노출 순위(자동완성 상단일수록 수요 큼)
const ac = async (q) => {
  const u = "https://ac.search.naver.com/nx/ac?st=100&r_format=json&r_enc=UTF-8&q_enc=UTF-8&frm=nv&q=" + encodeURIComponent(q);
  const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } });
  const j = await r.json();
  return (j.items || []).flat().map((it) => it[0]);
};
for (const s of SEEDS) {
  try {
    const hits = await ac(NAME + (s ? " " + s : ""));
    hits.forEach((h, i) => { if (!ORDER.has(h)) ORDER.set(h, ORDER.size + i); });
  } catch (e) { console.error("조회 실패:", s, e.message); }
}
const queries = [...ORDER.keys()].filter((k) => k.replace(/\s/g, "") !== NAME.replace(/\s/g, ""));

// 페이지 소유권 배정 — 한 키워드는 한 페이지만 소유한다(14단계 §키워드 소유권).
const BUCKETS = {
  sales:      ["분양가", "가격", "분양", "청약", "계약금", "중도금", "분담금"],
  modelhouse: ["모델하우스", "견본주택", "갤러리", "홍보관", "방문", "예약"],
  floorplan:  ["평면도", "평면", "타입", "㎡", "평", "구조"],
  location:   ["위치", "주소", "입지", "교통", "역", "학군"],
  complex:    ["단지", "세대", "동", "층수", "커뮤니티", "조경", "주차"],
  overview:   ["시행", "시공", "건설사", "입주", "준공", "일정", "사업"],
  news:       ["미분양", "잔여", "선착순", "후기", "소식"],
};
const assigned = {}; const unassigned = [];
for (const q of queries) {
  const tail = q.replace(NAME, "").replace(/\s+/g, " ").trim();
  const hit = Object.entries(BUCKETS).find(([, words]) => words.some((w) => tail.includes(w)));
  if (hit) (assigned[hit[0]] ||= []).push(q); else unassigned.push(q);
}

const out = {
  brand: NAME,
  collectedAt: new Date().toISOString().slice(0, 10),
  source: "naver-autocomplete(ac.search.naver.com) 초성 스윕 " + SEEDS.length + "회",
  note: "자동완성 노출 = 실입력 쿼리 증거. 월간검색수 숫자는 미포함(필요 시 검색광고 키워드도구 병행).",
  queries,                                  // 자동완성 순서 = 수요 순서 근사
  assigned,                                 // 페이지별 소유 키워드
  unassigned,                               // 어느 페이지도 안 가진 것 → 서브 본문 보강 후보(10~13단계)
  absent: Object.keys(BUCKETS).filter((p) => !assigned[p]),   // 자동완성에 안 뜬 축 = title 꼬리에 쓰지 말 것
};
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/keywords.json", JSON.stringify(out, null, 2), "utf8");
console.log(`[${NAME}] 자동완성 쿼리 ${queries.length}개`);
for (const [p, ks] of Object.entries(assigned)) console.log(`  ${p.padEnd(11)} ${ks.join(" · ")}`);
if (unassigned.length) console.log(`  (미배정 → 서브 본문 보강 후보) ${unassigned.join(" · ")}`);
if (out.absent.length) console.log(`  ⚠️ 자동완성 미노출 축: ${out.absent.join(" · ")} — title 꼬리·분양소식 주제로 쓰지 말 것`);
