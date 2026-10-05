/**
 * Generates the HQ mark from scripts/hq-logo.mjs into src/data/hq-logo.json:
 *   logo      - inner SVG (viewBox 0 0 200 160) of the tipped N2b mark, coloured through
 *               CSS variables --hq-h / --hq-q (letters) and --hq-hd / --hq-qd (dots), so the
 *               page can cycle palettes by changing variables only.
 *   palettes  - each palette's dark and light colours (light is darkened for white grounds).
 *   favicons  - one data: URI per palette: the top view of the mark on a dark tile.
 *
 * Usage: node scripts/gen-hq-logo.mjs
 */
import { writeFileSync } from "fs";
import { glass, hTop, tip } from "./hq-logo.mjs";

const palettes = [
  { name: "Mono", h: null, q: null, hd: null, qd: null },
  { name: "FlowSense", h: "#3587C7", q: "#329A6D", hd: null, qd: null },
  { name: "Clay", h: null, q: null, hd: "#C48A7C", qd: "#C48A7C" },
  { name: "PlayStation", h: "#E3001B", q: "#F7B500", hd: "#00A99D", qd: "#2A5BD7" },
  { name: "N64", h: "#1F6FD0", q: "#E2231A", hd: "#0F9D58", qd: "#F7B500" },
  { name: "NeXT", h: "#F04E23", q: "#FFDE00", hd: "#19AF68", qd: "#E0068C" },
  { name: "Site", h: "#3587C7", q: "#329A6D", hd: "#C48A7C", qd: null },
  { name: "Primaries", h: "#E3001B", q: "#1F6FD0", hd: "#F7B500", qd: "#0F9D58" },
];

// Light grounds: darken, yellows more, so outlines and dots hold on white.
const darken = (hex) => {
  if (!hex) return null;
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = r > 200 && g > 150 && b < 90 ? 0.62 : 0.74;
  return "#" + [r, g, b].map((v) => Math.round(v * f).toString(16).padStart(2, "0")).join("");
};

const vars = { colors: { H: "var(--hq-h)", Q: "var(--hq-q)" }, dots: { H: "var(--hq-hd)", Q: "var(--hq-qd)" } };
const art = glass(vars);
const logo = tip(art, 28);

// Tight viewBox: project every path point through the tip (rotate 28°, scale .8 about
// 100,80) and pad for the stroke, so no orientation of the mark is ever clipped.
const viewBox = (() => {
  const nums = [...art.matchAll(/ d="([^"]+)"/g)].flatMap((m) => m[1].match(/-?\d+(?:\.\d+)?/g).map(Number));
  const a = 28 * Math.PI / 180, c = Math.cos(a) * 0.8, sn = Math.sin(a) * 0.8;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const dx = nums[i] - 100, dy = nums[i + 1] - 80, X = 100 + dx * c - dy * sn, Y = 80 + dx * sn + dy * c;
    x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y);
  }
  const pad = 3;
  return [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad].map((v) => +v.toFixed(2));
})();

const INK = "#F1F1F1", BG = "#0D0D0D";
const favicon = (p) => {
  const o = { pitch: 90, yaw: 0, colors: { H: p.h || INK, Q: p.q || INK }, dots: { H: p.hd || INK, Q: p.qd || INK } };
  const art = (glass(o) + hTop(o)).replaceAll("var(--ink)", INK).replaceAll("var(--bgc)", BG);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><rect x="4" y="4" width="192" height="152" rx="22" fill="${BG}"/><g transform="translate(14 11) scale(.86)">${art}</g></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
};

writeFileSync(
  "src/data/hq-logo.json",
  JSON.stringify({
    logo,
    viewBox,
    palettes: palettes.map((p) => ({ name: p.name, dark: { h: p.h, q: p.q, hd: p.hd, qd: p.qd }, light: { h: darken(p.h), q: darken(p.q), hd: darken(p.hd), qd: darken(p.qd) } })),
    favicons: palettes.map(favicon),
  }) + "\n",
);
console.log(`✓ Wrote src/data/hq-logo.json (${palettes.length} palettes)`);
