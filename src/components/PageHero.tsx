import Link from "next/link";
import type { ReactNode } from "react";
import { SITE, SITE_URL } from "@/lib/site";

/**
 * 서브페이지 히어로 — 7단계 §3.
 *
 * 실사를 쓰지 않는다(메인=실사와 대비). 색면 + 페이지별 **벡터 일러스트 장면**을
 * 코드로 작도한다 → 이미지 자산이 아니므로 next/image 불필요.
 *
 * 잘림 0 규칙:
 *  · preserveAspectRatio="xMidYMid meet" 고정. slice는 자르므로 금지.
 *  · 사이즈별로 장면을 따로 디자인한다 — PC/태블릿은 가로 파노라마(넓은 viewBox),
 *    모바일은 정사각 미니장면(1:1). 같은 그림을 비율만 바꿔 쓰면 반드시 어느 한쪽이 비거나 잘린다.
 *  · 중앙 컨테이너 안에 배치 + 우/상/하 여백 → 화면 끝에 닿지 않게.
 * 문구 안 가림: 텍스트=좌측, 모티프=우측 + 좌측 그라디언트 페이드.
 *
 * 깊이 3레이어: 배경(능선·구름 등 opacity 0.10) → 중경(구조 0.22) → 전경(디테일 0.40).
 */
export type Motif =
  "circle" | "map" | "bloom" | "plan" | "unit" | "doc" | "gallery" | "news" | "qa";

/**
 * 깊이 3레이어의 불투명도.
 * ⚠️ 초기값(0.10/0.22/0.40)은 #fafaf8 위 브론즈(#8c7b5e)에서 거의 보이지 않아
 *    장면이 아니라 "흐릿한 사각형 더미"로 읽혔다(스크린샷 육안 확인 후 상향).
 *    6단계 §9 주석대로 레퍼런스의 저대비는 차용하지 않는다.
 */
const S = { bg: 0.16, mid: 0.32, fg: 0.62 } as const;

/** 공통 스트로크 — 브론즈 헤어라인 */
const line = (opacity: number) => ({
  stroke: "var(--bronze)",
  strokeWidth: 1.6,
  fill: "none" as const,
  opacity,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});
const wash = (opacity: number) => ({ fill: "var(--bronze)", opacity });

/** 배경 능선 — 대부분의 장면이 공유하는 가장 뒤 레이어 */
function Ridge({ w, h }: { w: number; h: number }) {
  return (
    <g opacity={S.bg}>
      <path
        d={`M0 ${h * 0.62} L${w * 0.16} ${h * 0.44} L${w * 0.29} ${h * 0.56} L${w * 0.45} ${h * 0.34} L${w * 0.62} ${h * 0.55} L${w * 0.78} ${h * 0.4} L${w} ${h * 0.6} L${w} ${h} L0 ${h} Z`}
        fill="var(--bronze)"
      />
      <circle cx={w * 0.82} cy={h * 0.16} r={h * 0.07} fill="var(--bronze)" />
    </g>
  );
}

/**
 * 격자 배경 — 지도·배치도·평면·문서처럼 **수평선이 없는 장면**의 가장 뒤 레이어.
 * ⚠️ 이런 장면에 능선(Ridge)을 깔면 산이 화면을 지배해 "도시맵"이 아니라 "산 그림"으로 읽힌다
 *    (스크린샷 육안 확인 후 분리). 능선은 수평선이 있는 장면(스카이라인·정원·실내·인물)에만 쓴다.
 */
function Grid({ w, h }: { w: number; h: number }) {
  const cols = 8;
  const rows = 4;
  return (
    <g opacity={S.bg}>
      {Array.from({ length: cols - 1 }, (_, i) => (
        <path
          key={`c${i}`}
          d={`M${(w / cols) * (i + 1)} 0 V${h}`}
          stroke="var(--bronze)"
          strokeWidth={1}
          fill="none"
        />
      ))}
      {Array.from({ length: rows - 1 }, (_, i) => (
        <path
          key={`r${i}`}
          d={`M0 ${(h / rows) * (i + 1)} H${w}`}
          stroke="var(--bronze)"
          strokeWidth={1}
          fill="none"
        />
      ))}
    </g>
  );
}

/** 지면선 */
function Ground({ w, y }: { w: number; y: number }) {
  return <path d={`M0 ${y} H${w}`} {...line(S.mid)} />;
}

/* ────────────────────────────────────────────────────────────────────
   01 circle — 사업개요: 건축 스카이라인 · 크레인
   ──────────────────────────────────────────────────────────────────── */
function SceneCircle({ w, h }: { w: number; h: number }) {
  const g = h * 0.86;
  return (
    <>
      <Ridge w={w} h={h} />
      {/* 중경 — 배후 동 */}
      <g opacity={S.mid}>
        <rect x={w * 0.08} y={h * 0.44} width={w * 0.1} height={g - h * 0.44} {...wash(1)} />
        <rect x={w * 0.2} y={h * 0.52} width={w * 0.08} height={g - h * 0.52} {...wash(1)} />
        <rect x={w * 0.72} y={h * 0.48} width={w * 0.11} height={g - h * 0.48} {...wash(1)} />
      </g>
      {/* 전경 — 주동 3개 + 층선 */}
      <g {...line(S.fg)}>
        <rect x={w * 0.32} y={h * 0.26} width={w * 0.13} height={g - h * 0.26} />
        <rect x={w * 0.47} y={h * 0.36} width={w * 0.12} height={g - h * 0.36} />
        <rect x={w * 0.61} y={h * 0.3} width={w * 0.09} height={g - h * 0.3} />
        {[0.34, 0.44, 0.54, 0.64, 0.74].map((t) => (
          <path key={t} d={`M${w * 0.32} ${h * t} H${w * 0.45}`} />
        ))}
        {[0.46, 0.56, 0.66, 0.76].map((t) => (
          <path key={t} d={`M${w * 0.47} ${h * t} H${w * 0.59}`} />
        ))}
        {/* 크레인 */}
        <path d={`M${w * 0.79} ${g} V${h * 0.18} M${w * 0.66} ${h * 0.18} H${w * 0.9}`} />
        <path d={`M${w * 0.79} ${h * 0.18} L${w * 0.84} ${h * 0.1} L${w * 0.79} ${h * 0.1}`} />
        <path d={`M${w * 0.72} ${h * 0.18} V${h * 0.32}`} />
        <rect x={w * 0.7} y={h * 0.32} width={w * 0.04} height={h * 0.06} />
      </g>
      <Ground w={w} y={g} />
    </>
  );
}

/* 02 map — 입지: 도시맵 · 도로 · 전철 · 핀 · 나침반 */
function SceneMap({ w, h }: { w: number; h: number }) {
  return (
    <>
      <Grid w={w} h={h} />
      {/* 중경 — 블록 */}
      <g opacity={S.mid}>
        {[
          [0.1, 0.3, 0.12, 0.14],
          [0.26, 0.22, 0.1, 0.1],
          [0.62, 0.28, 0.13, 0.13],
          [0.78, 0.54, 0.11, 0.14],
          [0.18, 0.62, 0.14, 0.12],
        ].map(([x, y, bw, bh], i) => (
          <rect key={i} x={w * x} y={h * y} width={w * bw} height={h * bh} fill="var(--bronze)" />
        ))}
      </g>
      {/* 전경 — 도로 · 철도 · 핀 · 나침반 */}
      <g {...line(S.fg)}>
        <path d={`M0 ${h * 0.56} C ${w * 0.3} ${h * 0.46} ${w * 0.6} ${h * 0.7} ${w} ${h * 0.5}`} />
        <path d={`M${w * 0.42} 0 V${h}`} />
        <path d={`M0 ${h * 0.78} H${w}`} strokeDasharray="7 6" />
        {/* 전철 노선 + 역 */}
        <path d={`M${w * 0.08} ${h * 0.2} L${w * 0.5} ${h * 0.34} L${w * 0.92} ${h * 0.22}`} />
        {[0.08, 0.5, 0.92].map((t, i) => (
          <circle key={t} cx={w * t} cy={h * (i === 1 ? 0.34 : i === 0 ? 0.2 : 0.22)} r={4.5} />
        ))}
        {/* 위치 핀 — 원 + 아래로 모이는 두 변(물방울). 끝점을 정확히 닫아 풍선처럼 부풀지 않게 한다 */}
        <g transform={`translate(${w * 0.55} ${h * 0.44})`}>
          <circle cx={0} cy={0} r={h * 0.075} />
          <path d={`M-${h * 0.065} ${h * 0.037} L0 ${h * 0.17} L${h * 0.065} ${h * 0.037}`} />
          <circle cx={0} cy={0} r={h * 0.028} {...wash(S.fg)} stroke="none" />
          <ellipse cx={0} cy={h * 0.19} rx={h * 0.05} ry={h * 0.013} opacity={0.45} />
        </g>
        {/* 나침반 */}
        <circle cx={w * 0.86} cy={h * 0.76} r={h * 0.1} />
        <path
          d={`M${w * 0.86} ${h * 0.68} L${w * 0.888} ${h * 0.78} L${w * 0.86} ${h * 0.84} L${w * 0.832} ${h * 0.78} Z`}
        />
      </g>
    </>
  );
}

/* 03 bloom — 프리미엄: 정원 · 꽃 · 나비 · 새 */
function SceneBloom({ w, h }: { w: number; h: number }) {
  const g = h * 0.84;
  const petal = (cx: number, cy: number, r: number) => (
    <g key={`${cx}-${cy}`}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse
          key={a}
          cx={cx}
          cy={cy - r * 0.62}
          rx={r * 0.3}
          ry={r * 0.62}
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.22} />
    </g>
  );
  return (
    <>
      <Ridge w={w} h={h} />
      {/* 중경 — 관목 덩어리 */}
      <g opacity={S.mid}>
        <ellipse cx={w * 0.2} cy={g} rx={w * 0.14} ry={h * 0.16} fill="var(--bronze)" />
        <ellipse cx={w * 0.74} cy={g} rx={w * 0.17} ry={h * 0.13} fill="var(--bronze)" />
      </g>
      <g {...line(S.fg)}>
        {/* 줄기 */}
        <path
          d={`M${w * 0.34} ${g} C ${w * 0.33} ${h * 0.6} ${w * 0.37} ${h * 0.52} ${w * 0.36} ${h * 0.4}`}
        />
        <path
          d={`M${w * 0.5} ${g} C ${w * 0.49} ${h * 0.66} ${w * 0.53} ${h * 0.58} ${w * 0.52} ${h * 0.5}`}
        />
        <path
          d={`M${w * 0.64} ${g} C ${w * 0.63} ${h * 0.58} ${w * 0.67} ${h * 0.48} ${w * 0.66} ${h * 0.34}`}
        />
        {/* 잎 */}
        <path
          d={`M${w * 0.35} ${h * 0.66} c -${w * 0.05} -${h * 0.02} -${w * 0.06} ${h * 0.06} 0 ${h * 0.06}`}
        />
        <path
          d={`M${w * 0.65} ${h * 0.6} c ${w * 0.05} -${h * 0.02} ${w * 0.06} ${h * 0.06} 0 ${h * 0.06}`}
        />
        {/* 꽃 */}
        {petal(w * 0.36, h * 0.38, h * 0.11)}
        {petal(w * 0.52, h * 0.48, h * 0.085)}
        {petal(w * 0.66, h * 0.32, h * 0.095)}
        {/* 나비 */}
        <g transform={`translate(${w * 0.82} ${h * 0.38})`}>
          <path d={`M0 0 c -${h * 0.05} -${h * 0.07} -${h * 0.1} -${h * 0.01} 0 ${h * 0.05}`} />
          <path d={`M0 0 c ${h * 0.05} -${h * 0.07} ${h * 0.1} -${h * 0.01} 0 ${h * 0.05}`} />
          <path d={`M0 -${h * 0.02} V${h * 0.05}`} />
        </g>
        {/* 새 */}
        <path
          d={`M${w * 0.16} ${h * 0.2} q ${h * 0.04} -${h * 0.04} ${h * 0.08} 0 q ${h * 0.04} -${h * 0.04} ${h * 0.08} 0`}
        />
      </g>
      <Ground w={w} y={g} />
    </>
  );
}

/* 04 plan — 단지: 배치도 · 나무 · 연못 · 벤치 */
function ScenePlan({ w, h }: { w: number; h: number }) {
  return (
    <>
      <Grid w={w} h={h} />
      {/* 중경 — 대지 경계 + 동 배치(평면 뷰) */}
      <g opacity={S.mid}>
        <rect
          x={w * 0.08}
          y={h * 0.16}
          width={w * 0.84}
          height={h * 0.68}
          fill="var(--bronze)"
          opacity={0.35}
        />
      </g>
      <g {...line(S.fg)}>
        <rect x={w * 0.08} y={h * 0.16} width={w * 0.84} height={h * 0.68} />
        {/* 동 */}
        {[
          [0.14, 0.22, 0.16, 0.08],
          [0.34, 0.22, 0.12, 0.08],
          [0.5, 0.24, 0.18, 0.07],
          [0.74, 0.3, 0.12, 0.1],
          [0.14, 0.62, 0.14, 0.08],
          [0.36, 0.66, 0.16, 0.07],
          [0.62, 0.62, 0.1, 0.11],
        ].map(([x, y, bw, bh], i) => (
          <rect key={i} x={w * x} y={h * y} width={w * bw} height={h * bh} />
        ))}
        {/* 보행로 */}
        <path
          d={`M${w * 0.08} ${h * 0.5} C ${w * 0.34} ${h * 0.42} ${w * 0.62} ${h * 0.58} ${w * 0.92} ${h * 0.48}`}
          strokeDasharray="6 5"
        />
        {/* 연못 */}
        <ellipse cx={w * 0.83} cy={h * 0.7} rx={w * 0.075} ry={h * 0.08} />
        <ellipse cx={w * 0.83} cy={h * 0.7} rx={w * 0.045} ry={h * 0.045} opacity={0.6} />
        {/* 나무 */}
        {[0.3, 0.44, 0.58].map((t) => (
          <g key={t}>
            <circle cx={w * t} cy={h * 0.46} r={h * 0.045} />
            <path d={`M${w * t} ${h * 0.505} v${h * 0.03}`} />
          </g>
        ))}
        {/* 벤치 */}
        <g transform={`translate(${w * 0.18} ${h * 0.49})`}>
          <path d={`M0 0 h${w * 0.075}`} />
          <path d={`M0 ${h * 0.032} h${w * 0.075}`} />
          <path d={`M${w * 0.012} 0 v${h * 0.045} M${w * 0.063} 0 v${h * 0.045}`} />
        </g>
      </g>
    </>
  );
}

/* 05 unit — 평면도: 평면 + 가구 */
function SceneUnit({ w, h }: { w: number; h: number }) {
  return (
    <>
      <Grid w={w} h={h} />
      <g opacity={S.mid}>
        <rect
          x={w * 0.12}
          y={h * 0.18}
          width={w * 0.76}
          height={h * 0.64}
          fill="var(--bronze)"
          opacity={0.35}
        />
      </g>
      <g {...line(S.fg)}>
        {/* 외벽 · 내벽 */}
        <rect x={w * 0.12} y={h * 0.18} width={w * 0.76} height={h * 0.64} />
        <path d={`M${w * 0.46} ${h * 0.18} V${h * 0.56}`} />
        <path d={`M${w * 0.46} ${h * 0.56} H${w * 0.88}`} />
        <path d={`M${w * 0.12} ${h * 0.58} H${w * 0.46}`} />
        {/* 문 스윙 */}
        <path
          d={`M${w * 0.46} ${h * 0.3} a ${h * 0.08} ${h * 0.08} 0 0 1 ${h * 0.08} ${h * 0.08}`}
        />
        {/* 소파 · 테이블 */}
        <rect x={w * 0.17} y={h * 0.26} width={w * 0.14} height={h * 0.09} />
        <rect x={w * 0.2} y={h * 0.4} width={w * 0.09} height={h * 0.06} />
        {/* 침대 */}
        <rect x={w * 0.53} y={h * 0.24} width={w * 0.13} height={h * 0.18} />
        <path d={`M${w * 0.53} ${h * 0.3} H${w * 0.66}`} />
        {/* 주방 라인 */}
        <path d={`M${w * 0.53} ${h * 0.66} H${w * 0.84}`} />
        <rect x={w * 0.56} y={h * 0.62} width={w * 0.05} height={h * 0.04} />
        {/* 치수선 */}
        <path d={`M${w * 0.12} ${h * 0.88} H${w * 0.88}`} opacity={0.7} />
        <path
          d={`M${w * 0.12} ${h * 0.86} v${h * 0.04} M${w * 0.88} ${h * 0.86} v${h * 0.04}`}
          opacity={0.7}
        />
      </g>
    </>
  );
}

/* 06 doc — 분양안내: 문서 · 표 · 차트 */
function SceneDoc({ w, h }: { w: number; h: number }) {
  return (
    <>
      <Grid w={w} h={h} />
      <g opacity={S.mid}>
        <rect x={w * 0.16} y={h * 0.16} width={w * 0.34} height={h * 0.68} fill="var(--bronze)" />
      </g>
      <g {...line(S.fg)}>
        {/* 뒷장 · 앞장 */}
        <rect x={w * 0.2} y={h * 0.12} width={w * 0.34} height={h * 0.68} />
        <rect x={w * 0.13} y={h * 0.2} width={w * 0.34} height={h * 0.68} />
        {[0.3, 0.38, 0.46, 0.54, 0.62].map((t) => (
          <path key={t} d={`M${w * 0.17} ${h * t} H${w * 0.4}`} />
        ))}
        <path d={`M${w * 0.17} ${h * 0.7} H${w * 0.32}`} opacity={0.7} />
        {/* 표 */}
        <rect x={w * 0.58} y={h * 0.18} width={w * 0.3} height={h * 0.26} />
        <path d={`M${w * 0.58} ${h * 0.26} H${w * 0.88}`} />
        <path d={`M${w * 0.68} ${h * 0.18} V${h * 0.44} M${w * 0.78} ${h * 0.18} V${h * 0.44}`} />
        {/* 막대 차트 */}
        <path d={`M${w * 0.58} ${h * 0.82} H${w * 0.9}`} />
        {[
          [0.61, 0.2],
          [0.68, 0.32],
          [0.75, 0.26],
          [0.82, 0.38],
        ].map(([x, bh]) => (
          <rect key={x} x={w * x} y={h * (0.82 - bh)} width={w * 0.045} height={h * bh} />
        ))}
      </g>
    </>
  );
}

/* 07 gallery — 모델하우스: 거실 인테리어 */
function SceneGallery({ w, h }: { w: number; h: number }) {
  const g = h * 0.82;
  return (
    <>
      <Ridge w={w} h={h} />
      <g opacity={S.mid}>
        <rect
          x={w * 0.1}
          y={h * 0.14}
          width={w * 0.8}
          height={g - h * 0.14}
          fill="var(--bronze)"
          opacity={0.4}
        />
      </g>
      <g {...line(S.fg)}>
        {/* 벽 · 바닥 */}
        <path d={`M${w * 0.1} ${h * 0.14} H${w * 0.9} V${g} H${w * 0.1} Z`} />
        <path d={`M${w * 0.1} ${g} H${w * 0.9}`} />
        {/* 창 + 커튼 */}
        <rect x={w * 0.58} y={h * 0.24} width={w * 0.26} height={h * 0.34} />
        <path d={`M${w * 0.71} ${h * 0.24} V${h * 0.58}`} />
        <path
          d={`M${w * 0.56} ${h * 0.22} V${h * 0.62} M${w * 0.86} ${h * 0.22} V${h * 0.62}`}
          opacity={0.7}
        />
        {/* 소파 */}
        <path d={`M${w * 0.16} ${h * 0.62} h${w * 0.26} v${h * 0.14} h-${w * 0.26} Z`} />
        <path d={`M${w * 0.16} ${h * 0.62} v-${h * 0.1} h${w * 0.26} v${h * 0.1}`} />
        <path d={`M${w * 0.25} ${h * 0.52} V${h * 0.62} M${w * 0.33} ${h * 0.52} V${h * 0.62}`} />
        {/* 테이블 + 화병 */}
        <ellipse cx={w * 0.5} cy={h * 0.72} rx={w * 0.07} ry={h * 0.035} />
        <path d={`M${w * 0.5} ${h * 0.66} v${h * 0.05}`} />
        <path d={`M${w * 0.5} ${h * 0.66} q -${h * 0.03} -${h * 0.06} ${h * 0.01} -${h * 0.08}`} />
        {/* 펜던트 조명 */}
        <path d={`M${w * 0.38} ${h * 0.14} V${h * 0.28}`} />
        <path
          d={`M${w * 0.34} ${h * 0.28} h${w * 0.08} l-${w * 0.02} ${h * 0.06} h-${w * 0.04} Z`}
        />
        {/* 액자 */}
        <rect x={w * 0.16} y={h * 0.24} width={w * 0.12} height={h * 0.16} />
      </g>
    </>
  );
}

/* 08 news — 분양소식: 기사 카드 · 말풍선 */
function SceneNews({ w, h }: { w: number; h: number }) {
  return (
    <>
      <Grid w={w} h={h} />
      <g opacity={S.mid}>
        <rect x={w * 0.14} y={h * 0.24} width={w * 0.32} height={h * 0.46} fill="var(--bronze)" />
      </g>
      <g {...line(S.fg)}>
        {/* 카드 3장 */}
        <rect x={w * 0.1} y={h * 0.3} width={w * 0.3} height={h * 0.46} />
        <rect x={w * 0.13} y={h * 0.2} width={w * 0.3} height={h * 0.46} />
        <rect x={w * 0.17} y={h * 0.36} width={w * 0.22} height={h * 0.14} opacity={0.7} />
        {[0.56, 0.62].map((t) => (
          <path key={t} d={`M${w * 0.17} ${h * t} H${w * 0.39}`} />
        ))}
        <path d={`M${w * 0.17} ${h * 0.68} H${w * 0.31}`} opacity={0.7} />
        {/* 말풍선 */}
        <path
          d={`M${w * 0.56} ${h * 0.2} h${w * 0.3} a${h * 0.03} ${h * 0.03} 0 0 1 ${h * 0.03} ${h * 0.03} v${h * 0.22} a${h * 0.03} ${h * 0.03} 0 0 1 -${h * 0.03} ${h * 0.03} h-${w * 0.22} l-${w * 0.05} ${h * 0.08} v-${h * 0.08} h-${w * 0.03} a${h * 0.03} ${h * 0.03} 0 0 1 -${h * 0.03} -${h * 0.03} v-${h * 0.22} a${h * 0.03} ${h * 0.03} 0 0 1 ${h * 0.03} -${h * 0.03} Z`}
        />
        {[0.3, 0.38].map((t) => (
          <path key={t} d={`M${w * 0.61} ${h * t} H${w * 0.83}`} />
        ))}
        {/* 하단 태그 */}
        <rect x={w * 0.58} y={h * 0.62} width={w * 0.12} height={h * 0.07} />
        <rect x={w * 0.73} y={h * 0.62} width={w * 0.15} height={h * 0.07} opacity={0.7} />
      </g>
    </>
  );
}

/* 09 qa — FAQ: 말풍선 · 물음표 · 사람 */
function SceneQa({ w, h }: { w: number; h: number }) {
  const g = h * 0.86;
  return (
    <>
      <Ridge w={w} h={h} />
      {/* 중경 — 실내 바닥면. (초기엔 큰 원을 뒀으나 답변 말풍선과 겹쳐 얼룩처럼 읽혀 교체) */}
      <g opacity={S.mid}>
        <path
          d={`M${w * 0.1} ${g} L${w * 0.22} ${h * 0.5} H${w * 0.9} L${w} ${g} Z`}
          fill="var(--bronze)"
          opacity={0.5}
        />
      </g>
      <g {...line(S.fg)}>
        {/* 질문 말풍선 */}
        <path
          d={`M${w * 0.14} ${h * 0.2} h${w * 0.26} v${h * 0.24} h-${w * 0.18} l-${w * 0.06} ${h * 0.08} v-${h * 0.08} h-${w * 0.02} Z`}
        />
        <text
          x={w * 0.27}
          y={h * 0.37}
          textAnchor="middle"
          fontSize={h * 0.16}
          fill="var(--bronze)"
          stroke="none"
          fontFamily="serif"
        >
          ?
        </text>
        {/* 답변 말풍선 */}
        <path
          d={`M${w * 0.5} ${h * 0.5} h${w * 0.3} v${h * 0.22} h-${w * 0.06} l-${w * 0.06} ${h * 0.08} v-${h * 0.08} h-${w * 0.18} Z`}
        />
        {[0.58, 0.65].map((t) => (
          <path key={t} d={`M${w * 0.54} ${h * t} H${w * 0.76}`} />
        ))}
        {/* 사람 */}
        <g transform={`translate(${w * 0.28} ${g})`}>
          <circle cx={0} cy={-h * 0.26} r={h * 0.06} />
          <path d={`M0 -${h * 0.2} V-${h * 0.06}`} />
          <path d={`M-${w * 0.05} -${h * 0.14} H${w * 0.05}`} />
          <path
            d={`M0 -${h * 0.06} l-${w * 0.035} ${h * 0.06} M0 -${h * 0.06} l${w * 0.035} ${h * 0.06}`}
          />
        </g>
      </g>
      <Ground w={w} y={g} />
    </>
  );
}

const SCENES: Record<Motif, (d: { w: number; h: number }) => ReactNode> = {
  circle: SceneCircle,
  map: SceneMap,
  bloom: SceneBloom,
  plan: ScenePlan,
  unit: SceneUnit,
  doc: SceneDoc,
  gallery: SceneGallery,
  news: SceneNews,
  qa: SceneQa,
};

export default function PageHero({
  title,
  eyebrow,
  motif,
  path,
}: {
  title: string;
  eyebrow: string;
  motif: Motif;
  /** 이 페이지의 경로(예: "/overview"). BreadcrumbList JSON-LD 생성에 쓴다 */
  path: string;
}) {
  const Scene = SCENES[motif];

  /**
   * Breadcrumb JSON-LD — 11단계 §구조 2. **전 서브에 1개**만 둔다.
   * 페이지에서 따로 BreadcrumbList를 또 만들면 중복이 되어 G11-BREADCRUMB가 RED다.
   * ⚠️ item은 반드시 절대 URL — 상대경로면 구글 Search Console '탐색경로' 오류가 난다.
   */
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: title, item: SITE_URL + path },
    ],
  };

  return (
    <section className="relative overflow-hidden border-b border-line bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="relative mx-auto max-w-[1280px] px-6 pt-28 pb-16 sm:px-10 sm:pt-32 sm:pb-20">
        {/*
          모티프는 PC와 모바일을 **별도 컨테이너**로 둔다.
          하나의 박스에 비율만 다른 두 SVG를 넣으면, 세로로 긴 모바일 박스에서 정사각 장면이
          가로폭에 맞춰 축소되며(meet) 상하에 큰 빈 공간이 생긴다. 모바일은 박스 자체를
          정사각(aspect-square)으로 만들고 세로 중앙에 두어 빈 공간을 없앤다.
        */}

        {/* 모바일 — 정사각 미니장면. 박스를 꽉 채우고 세로 중앙 정렬 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-6 w-[44%] -translate-y-1/2 lg:hidden"
        >
          <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" className="h-auto w-full">
            <Scene w={400} h={400} />
          </svg>
          {/* 좌측 페이드 — 문구와 겹치는 왼쪽 끝만 빠르게 지우고 장면 본체는 살린다 */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--background)_0%,transparent_42%)]" />
        </div>

        {/* PC·태블릿 — 가로 파노라마. 중앙 컨테이너 안 + 상/하/우 여백으로 화면 끝에 닿지 않게 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 right-10 bottom-6 hidden w-[62%] lg:block"
        >
          <svg viewBox="0 0 800 380" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
            <Scene w={800} h={380} />
          </svg>
          {/* 좌측 페이드 — 문구와 겹치는 왼쪽 끝만 빠르게 지우고 장면 본체는 살린다.
              via-background/70 처럼 중간까지 불투명하게 깔면 장면 절반이 통째로 지워진다. */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--background)_0%,transparent_34%)]" />
        </div>

        <div className="relative z-10 max-w-[56%] lg:max-w-[56%]">
          <p className="flex items-center gap-3">
            <span className="h-px w-8 bg-bronze" />
            <span className="font-accent text-[15px] tracking-[0.3em] text-bronze italic sm:text-[18px]">
              {eyebrow}
            </span>
          </p>

          {/*
            H1 = {현장명} {페이지명}. 두 block span 사이에 명시 공백({' '})을 둔다 —
            없으면 textContent가 "{현장명}{페이지명}"으로 붙어 키워드 토큰이 깨진다(14단계 §검증).
            시각적으로는 block이라 그대로 두 줄이다.
          */}
          <h1 className="mt-5">
            <span className="block text-[15px] text-muted">{SITE.name}</span>{" "}
            <span className="block font-serif text-[38px] leading-tight font-semibold tracking-[-0.01em] sm:text-7xl">
              {title}
            </span>
          </h1>

          <p className="mt-6 text-[13px] tracking-[0.2em] text-muted">
            <Link href="/" className="transition-opacity hover:opacity-60">
              홈
            </Link>
            <span className="mx-2 text-bronze">/</span>
            {title}
          </p>
        </div>
      </div>
    </section>
  );
}
