// Vice Cover Lab — cover renderer. Draws one GTA-style cover panel onto a canvas:
// a photo cropped per-panel (panX/panY/zoom), a colour grade, a synthwave sun with a
// skyline silhouette, and big display lettering (Bebas Neue titles, Barlow Condensed
// subtitles). All drawing is deterministic: same inputs, same pixels.

export const LAYOUTS = ['stack', 'grid', 'hero', 'split', 'strip'];
export const GRADES = ['vice', 'neon', 'gold', 'noir', 'candy'];
export const LETTERING = ['block', 'outline', 'neon', 'slant'];

const GRADE_TINTS = {
  vice: { top: 'rgba(255, 45, 149, 0)', mid: 'rgba(255, 45, 149, 0.28)', bot: 'rgba(10, 10, 60, 0.72)', sun: '#ff9e00', sky: '#1a0b2e' },
  neon: { top: 'rgba(157, 0, 255, 0)', mid: 'rgba(157, 0, 255, 0.30)', bot: 'rgba(20, 0, 40, 0.75)', sun: '#ff2d95', sky: '#12002b' },
  gold: { top: 'rgba(255, 170, 0, 0)', mid: 'rgba(255, 140, 0, 0.30)', bot: 'rgba(40, 16, 0, 0.72)', sun: '#ffd166', sky: '#2b1a05' },
  noir: { top: 'rgba(0, 0, 0, 0)', mid: 'rgba(0, 0, 0, 0.35)', bot: 'rgba(0, 0, 0, 0.85)', sun: '#e10600', sky: '#0a0a0a' },
  candy: { top: 'rgba(255, 150, 200, 0)', mid: 'rgba(255, 120, 190, 0.25)', bot: 'rgba(60, 10, 60, 0.60)', sun: '#7ef0ff', sky: '#3a0f4a' },
};

/** Clamp a value into [lo, hi]. */
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/**
 * Draw `photo` into a rect with a per-panel crop. panX/panY shift the visible window
 * in [-1, 1]; zoom >= 1 magnifies. The offset is clamped so the photo never leaves a gap.
 */
export function drawPhoto(ctx, photo, x, y, w, h, panX, panY, zoom) {
  if (!photo) { ctx.fillStyle = '#241534'; ctx.fillRect(x, y, w, h); return; }
  const z = Math.max(1, zoom || 1);
  const base = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
  const pw = photo.naturalWidth * base * z;
  const ph = photo.naturalHeight * base * z;
  const maxDx = Math.max(0, (pw - w) / 2);
  const maxDy = Math.max(0, (ph - h) / 2);
  const dx = clamp((panX || 0) * maxDx, -maxDx, maxDx);
  const dy = clamp((panY || 0) * maxDy, -maxDy, maxDy);
  ctx.drawImage(photo, x + (w - pw) / 2 - dx, y + (h - ph) / 2 - dy, pw, ph);
}

/** Synthwave sun: a striped circle sinking toward the horizon line. */
export function drawSun(ctx, cx, cy, r, colour) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, colour);
  g.addColorStop(1, '#ff2d78');
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (let i = 0; i < 5; i++) {
    const y = cy + r * (0.05 + i * 0.16);
    ctx.fillRect(cx - r, y, r * 2, r * (0.03 + i * 0.012));
  }
  ctx.restore();
}

/** A jagged skyline silhouette along the bottom of a band. Deterministic from a seed. */
export function drawSkyline(ctx, x, y, w, h, colour, seed) {
  ctx.fillStyle = colour;
  let s = seed >>> 0;
  const next = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  let bx = x;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  while (bx < x + w) {
    const bw = w * (0.04 + next() * 0.09);
    const bh = h * (0.25 + next() * 0.65);
    ctx.lineTo(bx, y + h - bh);
    ctx.lineTo(bx + bw, y + h - bh);
    ctx.lineTo(bx + bw, y + h);
    bx += bw;
  }
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  // Lit windows: a few deterministic dots.
  ctx.fillStyle = 'rgba(255, 220, 130, 0.85)';
  s = seed >>> 0;
  for (let i = 0; i < 26; i++) {
    const wx = x + next() * w;
    const wy = y + h * (0.35 + next() * 0.55);
    ctx.fillRect(wx, wy, 2, 3);
  }
}

/** Lettering: title + subtitle drawn with one of four styles. */
export function drawLettering(ctx, title, subtitle, x, y, w, style, titlePx, subPx) {
  const text = (title || '').trim().toUpperCase();
  const sub = (subtitle || '').trim();
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let size = titlePx;
  const setFont = (px, bold) => { ctx.font = `${bold ? '700 ' : ''}${px}px "Barlow Condensed", "Bebas Neue", sans-serif`; };
  // Title uses Bebas Neue; measure with the fallback-safe family string.
  const titleFont = (px) => `${px}px "Bebas Neue", "Barlow Condensed", sans-serif`;
  ctx.font = titleFont(size);
  while (text && ctx.measureText(text).width > w * 0.92 && size > 14) {
    size -= 2;
    ctx.font = titleFont(size);
  }
  const ty = y;
  if (style === 'slant') {
    ctx.transform(1, 0, -0.14, 1, size * 0.12, 0);
  }
  if (style === 'outline') {
    ctx.lineWidth = Math.max(2, size * 0.06);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText(text, x + w / 2, ty);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText(text, x + w / 2, ty);
  } else if (style === 'neon') {
    ctx.shadowColor = '#ff2d95';
    ctx.shadowBlur = size * 0.35;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + w / 2, ty);
    ctx.shadowBlur = size * 0.12;
    ctx.fillText(text, x + w / 2, ty);
    ctx.shadowBlur = 0;
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.05;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + w / 2, ty);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.restore();
  if (sub) {
    ctx.save();
    ctx.textAlign = 'center';
    let sp = subPx;
    setFont(sp, false);
    while (ctx.measureText(sub).width > w * 0.8 && sp > 10) { sp -= 1; setFont(sp, false); }
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(sub, x + w / 2, y + sp + size * 0.12);
    ctx.restore();
  }
}

/**
 * Draw one full cover panel.
 * opts: { layout, grade, lettering, title, subtitle, photo, panX, panY, zoom, seed }
 */
export function drawPanel(ctx, photo, opts, w, h) {
  const grade = GRADE_TINTS[opts.grade] || GRADE_TINTS.vice;
  const layout = opts.layout || 'stack';
  const seed = opts.seed ?? 7;
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = grade.sky;
  ctx.fillRect(0, 0, w, h);

  const tint = (x, y, tw, th, from, to) => {
    const g = ctx.createLinearGradient(0, y, 0, y + th);
    g.addColorStop(0, from);
    g.addColorStop(1, to);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, tw, th);
  };

  if (layout === 'grid') {
    const cw = w / 2, ch = h / 2;
    const pans = [[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]];
    for (let i = 0; i < 4; i++) {
      drawPhoto(ctx, photo, (i % 2) * cw, Math.floor(i / 2) * ch, cw, ch, pans[i][0], pans[i][1], 1.15);
    }
    ctx.fillStyle = 'rgba(10, 5, 30, 0.35)';
    ctx.fillRect(0, 0, w, h);
    drawSun(ctx, w * 0.5, h * 0.42, Math.min(w, h) * 0.13, grade.sun);
    drawSkyline(ctx, 0, h * 0.62, w, h * 0.14, grade.sky, seed + 3);
    tint(0, h * 0.55, w, h * 0.45, grade.mid, grade.bot);
    drawLettering(ctx, opts.title, opts.subtitle, 0, h * 0.82, w, opts.lettering, h * 0.11, h * 0.035);
  } else if (layout === 'hero') {
    drawPhoto(ctx, photo, 0, 0, w, h, opts.panX, opts.panY, opts.zoom);
    drawSun(ctx, w * 0.72, h * 0.30, Math.min(w, h) * 0.16, grade.sun);
    drawSkyline(ctx, 0, h * 0.68, w, h * 0.12, grade.sky, seed + 1);
    tint(0, 0, w, h, grade.top, grade.bot);
    drawLettering(ctx, opts.title, opts.subtitle, 0, h * 0.86, w, opts.lettering, h * 0.13, h * 0.04);
  } else if (layout === 'split') {
    drawPhoto(ctx, photo, 0, 0, w * 0.58, h, opts.panX, opts.panY, opts.zoom);
    ctx.fillStyle = grade.sky;
    ctx.fillRect(w * 0.58, 0, w * 0.42, h);
    drawSun(ctx, w * 0.79, h * 0.24, Math.min(w, h) * 0.11, grade.sun);
    drawSkyline(ctx, w * 0.58, h * 0.72, w * 0.42, h * 0.10, '#14061f', seed + 5);
    tint(w * 0.58, h * 0.5, w * 0.42, h * 0.5, grade.mid, grade.bot);
    drawLettering(ctx, opts.title, opts.subtitle, w * 0.58, h * 0.52, w * 0.42, opts.lettering, h * 0.09, h * 0.032);
  } else if (layout === 'strip') {
    drawPhoto(ctx, photo, 0, 0, w, h * 0.62, opts.panX, opts.panY, opts.zoom);
    ctx.fillStyle = grade.sky;
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
    drawSun(ctx, w * 0.5, h * 0.62, Math.min(w, h) * 0.10, grade.sun);
    tint(0, h * 0.45, w, h * 0.55, grade.mid, grade.bot);
    drawLettering(ctx, opts.title, opts.subtitle, 0, h * 0.86, w, opts.lettering, h * 0.11, h * 0.035);
  } else { // stack
    drawPhoto(ctx, photo, 0, 0, w, h * 0.68, opts.panX, opts.panY, opts.zoom);
    drawSun(ctx, w * 0.5, h * 0.34, Math.min(w, h) * 0.12, grade.sun);
    drawSkyline(ctx, 0, h * 0.56, w, h * 0.12, grade.sky, seed);
    tint(0, h * 0.30, w, h * 0.70, grade.mid, grade.bot);
    drawLettering(ctx, opts.title, opts.subtitle, 0, h * 0.86, w, opts.lettering, h * 0.12, h * 0.038);
  }
  ctx.restore();
}
