/**
 * Generates the HQ mark from scripts/hq-logo.mjs into src/data/hq-logo.json:
 *   logo      - inner SVG (viewBox 0 0 200 160) of the tipped N2b mark, coloured through
 *               CSS variables --hq-h / --hq-q (letters) and --hq-hd / --hq-qd (dots), so the
 *               page can cycle palettes by changing variables only.
 *   palettes  - each palette's dark and light colours (light is darkened for white grounds).
 * It also writes public/favicon.svg (flat red H + yellow Q faces) and public/app-icon.svg (the 3D
 * mark in red and yellow). The PNG/ICO icons are browser renders of those two files.
 *
 * Usage: node scripts/gen-hq-logo.mjs
 */
import { writeFileSync } from "fs";
import { glass, tip, faces } from "./hq-logo.mjs";

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
const RED = "#E3001B", YELLOW = "#F7B500";

// Favicon: just the two letter faces, filled flat (red H, yellow Q), no glass, edges or blur, so
// it stays crisp at 16px. y is flipped for SVG, which puts the Q's tail slot at bottom right.
{
  const { H, Q } = faces();
  const gap = 14, qShift = 120 + gap - 112;
  const path = (pts, dx = 0) => "M" + pts.map(([x, y]) => `${x + dx} ${120 - y}`).join(" L") + " Z";
  const w = 120 + gap + 120;
  writeFileSync("public/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 ${-(w - 120) / 2 - 6} ${w + 12} ${w + 12}"><path d="${path(H)}" fill="${RED}"/><path d="${path(Q, qShift)}" fill="${YELLOW}" fill-rule="evenodd"/></svg>\n`);
}

// App icon (home screens, large tiles): the page's 3D mark in red and yellow on a dark rounded
// square, lines thickened. Source for apple-touch-icon.png and the web-app manifest icons
// (icon-192.png, icon-512.png), used when the site is installed or saved to a home screen/desktop.
{
  const o = { colors: { H: RED, Q: YELLOW }, dots: { H: RED, Q: YELLOW }, strokeScale: 3.2 };
  const art = tip(glass(o), 28).replaceAll("var(--ink)", INK).replaceAll("var(--bgc)", BG);
  const [x, y, w, h] = viewBox, side = Math.max(w, h) * 1.02, cx = x + w / 2, cy = y + h / 2;
  const vb = [cx - side / 2, cy - side / 2, side, side].map((v) => +v.toFixed(2));
  writeFileSync("public/app-icon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}"><rect x="${vb[0]}" y="${vb[1]}" width="${side.toFixed(2)}" height="${side.toFixed(2)}" rx="${(side * 0.22).toFixed(2)}" fill="${BG}"/>${art}</svg>\n`);
}

writeFileSync(
  "src/data/hq-logo.json",
  JSON.stringify({
    logo,
    viewBox,
    palettes: palettes.map((p) => ({ name: p.name, dark: { h: p.h, q: p.q, hd: p.hd, qd: p.qd }, light: { h: darken(p.h), q: darken(p.q), hd: darken(p.hd), qd: darken(p.qd) } })),
  }) + "\n",
);
console.log(`✓ Wrote src/data/hq-logo.json (${palettes.length} palettes)`);
