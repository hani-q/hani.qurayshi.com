// HQ logo generator. Final spec: square-cut H standing (set back 50), Q knocked over face-up
// (extruded 120, as tall as the H), Q hole 36×36 (wall 42, same width as the H's cut),
// 45° negative tail slot 30 wide, glass edges with hierarchy, two centred dot lanes on the Q's top.
const area = (p) => p.reduce((s, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return s + x * y2 - x2 * y; }, 0) / 2;
const orient = (p, ccw) => ((area(p) > 0) === ccw ? p : [...p].reverse());

export const QW = 42;
// H matches the Q block: 120 wide, stems as thick as the Q's wall (42), cut as wide as its hole (36).
const H = orient([[0,0],[42,0],[42,46],[78,46],[78,0],[120,0],[120,120],[78,120],[78,74],[42,74],[42,120],[0,120]], true);
const Q = (w) => { const u = w / Math.SQRT2, ix = 232 - QW, iy = QW;
  return orient([[112,0],[232 - u, 0],[ix - u, iy],[112 + QW, QW],[112 + QW, 120 - QW],[ix, 120 - QW],[ix, iy + u],[232, u],[232,120],[112,120]], true); };

// The two letter faces as flat 2D outlines (y up, H at x 0..120, Q at x 112..232), for the favicon.
export const faces = (slot = 16) => ({ H, Q: Q(slot) });

function setup(o) {
  const cfg = { yaw: -18, pitch: 30, D: 120, Dq: 120, hBack: 0, qBack: 0, qTilt: 90, qDx: -112, qFace: 'right', slot: 16, size: 200, ...o };
  const ry = cfg.yaw * Math.PI / 180, rx = cfg.pitch * Math.PI / 180, D = cfg.D, Dq = cfg.Dq;
  const view = ([x, y, z]) => { x -= 127; y -= 50; z += D / 2; const x1 = x * Math.cos(ry) + z * Math.sin(ry), z1 = -x * Math.sin(ry) + z * Math.cos(ry); return [x1, -(y * Math.cos(rx) - z1 * Math.sin(rx)), y * Math.sin(rx) + z1 * Math.cos(rx)]; };
  const vN = ([x, y, z]) => { const z1 = -x * Math.sin(ry) + z * Math.cos(ry); return y * Math.sin(rx) + z1 * Math.cos(rx); };
  // The Q is tipped back qTilt degrees about its base (90 = lying flat, face up).
  const qa = cfg.qTilt * Math.PI / 180, ca = Math.cos(qa), sa = Math.sin(qa);
  const L = [
    { id: 'H', c: [H], Dl: D, pt: ([x, y, z]) => [x, y, z + cfg.hBack], n: (v) => v },
    cfg.qFace === 'right'
      // Q as the cube's right face: turned 90° about the vertical axis, its face on the H's
      // right side (x = 120), reading from front (z = 0) to back, extruded into the cube.
      ? { id: 'Q', c: [Q(cfg.slot)], Dl: Dq, pt: ([x, y, z]) => [120 + z, y, -(x - 112)], n: ([x, y, z]) => [z, y, -x] }
      : { id: 'Q', c: [Q(cfg.slot)], Dl: Dq, pt: ([x, y, z]) => [x + cfg.qDx, y * ca + (z + Dq) * sa, -y * sa + z * ca + cfg.qBack], n: ([x, y, z]) => [x, y * ca + z * sa, -y * sa + z * ca] },
  ];
  const pts = [];
  for (const lt of L) for (const r of lt.c) for (const [x, y] of r) for (const z of [0, -lt.Dl]) pts.push(view(lt.pt([x, y, z])));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min((cfg.size - 24) / (bx1 - bx0), (cfg.size * 0.8 - 24) / (by1 - by0));
  const T = (p) => [(cfg.size / 2 + (p[0] - (bx0 + bx1) / 2) * k).toFixed(2), (cfg.size * 0.4 + (p[1] - (by0 + by1) / 2) * k).toFixed(2)];
  return { cfg, view, vN, L, T, k };
}

export function glass(o = {}) {
  const { view, vN, L, T } = setup(o);
  const faces = [];
  for (const lt of L) {
    const W = (p) => view(lt.pt(p)), vis = (n) => vN(lt.n(n)) > 0.001;
    faces.push({ id: lt.id, cap: true, rings: lt.c.map((r) => r.map(([x, y]) => W([x, y, 0]))), vis: vis([0, 0, 1]) });
    faces.push({ id: lt.id, cap: true, back: true, rings: lt.c.map((r) => r.map(([x, y]) => W([x, y, -lt.Dl]))), vis: vis([0, 0, -1]) });
    for (const r of lt.c) r.forEach(([x, y], i) => { const [x2, y2] = r[(i + 1) % r.length]; const m = Math.hypot(x2 - x, y2 - y); const n = [(y2 - y) / m, -(x2 - x) / m, 0];
      faces.push({ id: lt.id, cap: false, rings: [[W([x, y, 0]), W([x2, y2, 0]), W([x2, y2, -lt.Dl]), W([x, y, -lt.Dl])]], vis: vis(n), up: lt.n(n)[1] > 0.9 }); });
  }
  for (const f of faces) { const p = f.rings.flat(); f.depth = p.reduce((s, q) => s + q[2], 0) / p.length; }
  faces.sort((a, b) => a.depth - b.depth);
  const d = (rings) => rings.map((r) => 'M' + r.map(T).map((p) => p.join(' ')).join(' L') + ' Z').join(' ');
  // Depth fades: each side face gets a gradient running from its front edge (full strength)
  // to its back edge (almost gone), for both the fill and the edge lines. The back cap,
  // which sits entirely at the far end, is drawn at the faded strength.
  const uid = 'g' + Math.random().toString(36).slice(2, 7);
  let defs = '', n = 0, acc = '';
  // Frosted faces: everything drawn behind a letter face is repeated, blurred and clipped
  // to that face, over a wash of the page colour, so the face reads as diffused glass.
  defs += `<filter id="${uid}-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.6"/></filter>`;
  defs += `<filter id="${uid}-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0"/></filter>`;
  const frost = (f, col) => {
    const id = `${uid}-c${n++}`;
    defs += `<clipPath id="${id}"><path d="${d(f.rings)}" clip-rule="evenodd"/></clipPath>`;
    defs += `<linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:${col};stop-opacity:.38"/><stop offset=".55" style="stop-color:${col};stop-opacity:.22"/><stop offset="1" style="stop-color:${col};stop-opacity:.14"/></linearGradient>`;
    return `<g clip-path="url(#${id})"><rect x="-50" y="-50" width="300" height="260" fill="var(--bgc)" fill-opacity=".85"/><g filter="url(#${uid}-blur)" opacity=".9">${acc}</g><rect x="-50" y="-50" width="300" height="260" filter="url(#${uid}-grain)" opacity=".05"/><path d="${d(f.rings)}" fill="url(#${id}-sheen)" fill-rule="evenodd"/></g>`;
  };
  const body = faces.map((f) => {
    const fop = !f.vis ? 0.03 : f.cap ? 0.32 : f.up ? 0.2 : 0.08;
    const sop = !f.vis ? 0.06 : f.cap ? 0.95 : 0.45;
    // strokeScale thickens every line, for small renderings such as the favicon.
    const sw = (!f.vis ? 0.5 : f.cap ? 1.8 : 0.8) * (o.strokeScale ?? 1);
    const col = (o.colors && o.colors[f.id]) || 'var(--ink)';
    let out;
    if (f.back) out = `<path d="${d(f.rings)}" fill="${col}" fill-opacity="0.015" fill-rule="evenodd" stroke="${col}" stroke-opacity="0.05" stroke-width="0.4" stroke-linejoin="round"/>`;
    else if (f.cap && f.vis) out = frost(f, col) + `<path d="${d(f.rings)}" fill="none" stroke="${col}" stroke-opacity="${sop}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    else if (f.cap) out = `<path d="${d(f.rings)}" fill="${col}" fill-opacity="${fop}" fill-rule="evenodd" stroke="${col}" stroke-opacity="${sop}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    if (out !== undefined) { acc += out; return out; }
    const [a, b, c, e] = f.rings[0].map(T).map((p) => p.map(Number));
    const x1 = (a[0] + b[0]) / 2, y1 = (a[1] + b[1]) / 2, x2 = (c[0] + e[0]) / 2, y2 = (c[1] + e[1]) / 2;
    if (Math.hypot(x2 - x1, y2 - y1) < 0.01) return '';
    const id = `${uid}-${n++}`, stop = (off, op) => `<stop offset="${off}" style="stop-color:${col};stop-opacity:${op}"/>`;
    const grad = (gid, op, end) => `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}">${stop(0, op)}${stop(1, op * end)}</linearGradient>`;
    defs += grad(id + 'f', fop, 0) + grad(id + 's', sop, 0);
    out = `<path d="${d(f.rings)}" fill="url(#${id}f)" stroke="url(#${id}s)" stroke-width="${sw}" stroke-linejoin="round"/>`;
    acc += out;
    return out;
  }).join('');
  return `<defs>${defs}</defs>${body}`;
}

export function lanes(o = {}) {
  const { view, L, T, k, cfg } = setup(o);
  const Qp = (x, y) => T(view(L[1].pt([x, y, 0])));
  const half = cfg.slot / 2, ixy = (232 - QW) - QW;
  const nearCut = (x, y) => x - y > ixy - 20 && Math.abs(x + y - 232) / Math.SQRT2 < half + 8;
  let g = '';
  for (const off of [QW / 3, (2 * QW) / 3]) {
    const c = [[112 + off, off], [232 - off, off], [232 - off, 120 - off], [112 + off, 120 - off]];
    for (let i = 0; i < 4; i++) { const [ax, ay] = c[i], [bx, by] = c[(i + 1) % 4]; const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 13));
      for (let j = 0; j < n; j++) { const x = ax + (bx - ax) * j / n, y = ay + (by - ay) * j / n; if (nearCut(x, y)) continue; const s = Qp(x, y); g += `<circle cx="${s[0]}" cy="${s[1]}" r="${(1.8 * k).toFixed(2)}"/>`; } }
  }
  return `<g fill="${(o.dots && o.dots.Q) || 'var(--ink)'}" opacity=".7">${g}</g>`;
}

// Dots on the H's front face: two centred columns per stem, 2×2 on the crossbar, rows shared.
export function hDots(o = {}) {
  const { view, L, T, k } = setup(o);
  const Hp = (x, y) => T(view(L[0].pt([x, y, 0])));
  const rows = [7.5, 22.5, 37.5, 52.5, 67.5, 82.5, 97.5, 112.5];
  let g = '';
  for (const x of [14, 28, 92, 106]) for (const y of rows) { const s = Hp(x, y); g += `<circle cx="${s[0]}" cy="${s[1]}" r="${(1.8 * k).toFixed(2)}"/>`; }
  for (const x of [40.5, 55.5]) for (const y of [52.5, 67.5]) { const s = Hp(x, y); g += `<circle cx="${s[0]}" cy="${s[1]}" r="${(1.8 * k).toFixed(2)}"/>`; }
  return `<g fill="${(o.dots && o.dots.H) || 'var(--ink)'}" opacity=".7">${g}</g>`;
}

export function hTop(o = {}) {
  const { view, L, T, cfg } = setup(o);
  const Hp = (p) => T(view(L[0].pt(p)));
  const lane = [[42, 74, 0], [78, 74, 0], [78, 74, -cfg.D], [42, 74, -cfg.D]].map((p) => Hp(p).join(',')).join(' ');
  const seg = (x0, x1, w, op = 1) => { const a = Hp([x0, 120, 0]), b = Hp([x1, 120, 0]); return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="var(--ink)" stroke-opacity="${op}" stroke-width="${w}"/>`; };
  return `<polygon points="${lane}" fill="var(--bgc)" fill-opacity=".45"/>${seg(0, 42, 3.2)}${seg(78, 120, 3.2)}${seg(42, 78, 1.6, 0.7)}`;
}

export const tile = (svg) => `<rect x="4" y="4" width="192" height="152" rx="22" fill="var(--bgc)" stroke="var(--ink)" stroke-opacity=".35" stroke-width="2"/><g transform="translate(14 11) scale(.86)">${svg}</g>`;
export const logo = (o = {}) => glass(o) + lanes(o);
export const favicon = () => { const o = { pitch: 90, yaw: 0 }; return tile(glass(o) + lanes(o) + hTop(o)); };
export const tip = (svg, deg, s = 0.8) => `<g transform="translate(100 80) rotate(${deg}) scale(${s}) translate(-100 -80)">${svg}</g>`;
