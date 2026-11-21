// Fixed scenes for screenshots: ?shot=editor shows the page with a sample photo;
// ?shot=cover shows the cover alone. Each shot carries its own per-panel crop
// (panX/panY/zoom) so the photo never shows the same centred crop twice.
// window.__shotReady is set once painted.
const SCENES = {
  cover: { photo: 'boulevard', caption: 'Neon Nights', sub: 'LEONIDA • 2026', layout: 'hero', grade: 'neon', lettering: 'neon', panX: -0.55, panY: -0.2, zoom: 1.35, seed: 11 },
  editor: { photo: 'pier', caption: 'Sunset Heist', sub: 'A Vice Story', layout: 'stack', grade: 'vice', lettering: 'block', panX: 0.5, panY: 0.3, zoom: 1.3, seed: 23 },
  square: { photo: 'pier', caption: 'Sunset Heist', sub: 'Vice City', layout: 'stack', grade: 'gold', lettering: 'outline', panX: -0.2, panY: 0.45, zoom: 1.45, seed: 41 },
  portrait: { photo: 'boulevard', caption: 'Boulevard Queen', sub: 'Neon District', layout: 'split', grade: 'candy', lettering: 'slant', panX: 0.2, panY: 0.35, zoom: 1.25, seed: 59 },
};

export async function runShot(shot, query, load) {
  const scene = SCENES[shot] || SCENES.cover;
  const photo = query.get('photo') || scene.photo;
  const caption = query.get('caption') || scene.caption;
  const sub = query.get('sub') || scene.sub;
  const cfg = {
    layout: query.get('layout') || scene.layout,
    grade: query.get('grade') || scene.grade,
    lettering: query.get('lettering') || scene.lettering,
    panX: Number(query.get('panx') ?? scene.panX),
    panY: Number(query.get('pany') ?? scene.panY),
    zoom: Number(query.get('zoom') ?? scene.zoom),
    seed: Number(query.get('seed') ?? scene.seed),
  };
  if (shot === 'cover' || shot === 'square' || shot === 'portrait') document.body.classList.add('shot-cover');
  await load(`samples/${photo}.png`, caption, sub, cfg);
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
