// Vice Cover Lab — editor wiring: photo upload, sample buttons, layout/grade/lettering
// pickers, pan/zoom sliders, export at 3 sizes, and a gallery of saved covers.
// A `?shot=` query stages a fixed scene for a screenshot instead (./shots.js).
import { drawPanel, LAYOUTS, GRADES, LETTERING } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const statusEl = document.getElementById('status');
const galleryEl = document.getElementById('gallery');

const state = {
  layout: 'stack',
  grade: 'vice',
  lettering: 'block',
  panX: 0,
  panY: 0,
  zoom: 1.2,
  photo: null,
  photoName: 'boulevard',
  seed: 7,
};

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function currentOpts() {
  return {
    layout: state.layout,
    grade: state.grade,
    lettering: state.lettering,
    title: titleEl.value,
    subtitle: subtitleEl.value,
    panX: state.panX,
    panY: state.panY,
    zoom: state.zoom,
    seed: state.seed,
  };
}

export function redraw() {
  drawPanel(ctx, state.photo, currentOpts(), canvas.width, canvas.height);
}

function bindPicker(id, key, values) {
  const el = document.getElementById(id);
  values.forEach((v) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = v;
    b.dataset.value = v;
    if (state[key] === v) b.classList.add('active');
    b.addEventListener('click', () => {
      state[key] = v;
      el.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
      redraw();
    });
    el.appendChild(b);
  });
}

bindPicker('layout-picker', 'layout', LAYOUTS);
bindPicker('grade-picker', 'grade', GRADES);
bindPicker('lettering-picker', 'lettering', LETTERING);

function bindRange(id, key, out) {
  const el = document.getElementById(id);
  const label = document.getElementById(out);
  el.addEventListener('input', () => {
    state[key] = Number(el.value);
    label.textContent = el.value;
    redraw();
  });
}
bindRange('panx', 'panX', 'panx-val');
bindRange('pany', 'panY', 'pany-val');
bindRange('zoom', 'zoom', 'zoom-val');

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.photo = await loadImage(URL.createObjectURL(file));
  state.photoName = file.name.replace(/\.[^.]+$/, '');
  redraw();
});

document.querySelectorAll('[data-sample]').forEach((b) => {
  b.addEventListener('click', async () => {
    state.photo = await loadImage(`samples/${b.dataset.sample}.png`);
    state.photoName = b.dataset.sample;
    redraw();
  });
});

[titleEl, subtitleEl].forEach((el) => el.addEventListener('input', redraw));

document.getElementById('seed').addEventListener('click', () => {
  state.seed = (state.seed * 7 + 13) % 97;
  redraw();
});

/** Export the current cover at one of the 3 sizes, then add it to the gallery. */
async function exportCover(w, h) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawPanel(off.getContext('2d'), state.photo, currentOpts(), w, h);
  const blob = await new Promise((res) => off.toBlob(res, 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vice-cover-${w}x${h}.png`;
  a.click();
  const thumb = document.createElement('img');
  thumb.src = url;
  thumb.alt = `Cover ${w}x${h}`;
  galleryEl.prepend(thumb);
  statusEl.textContent = `Saved vice-cover-${w}x${h}.png`;
}

document.getElementById('export-square').addEventListener('click', () => exportCover(1080, 1080));
document.getElementById('export-portrait').addEventListener('click', () => exportCover(1080, 1350));
document.getElementById('export-wide').addEventListener('click', () => exportCover(1920, 1080));

/** Keep the visible control values in sync with state (used by shot staging). */
export function syncControls() {
  titleEl.value = state.title ?? titleEl.value;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = String(v); };
  set('panx', state.panX);
  set('pany', state.panY);
  set('zoom', state.zoom);
  document.getElementById('panx-val').textContent = String(state.panX);
  document.getElementById('pany-val').textContent = String(state.panY);
  document.getElementById('zoom-val').textContent = String(state.zoom);
  for (const [id, key] of [['layout-picker', 'layout'], ['grade-picker', 'grade'], ['lettering-picker', 'lettering']]) {
    document.getElementById(id).querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.value === state[key]));
  }
}

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async (sample, text, sub, cfg) => {
    if (cfg.layout) state.layout = cfg.layout;
    if (cfg.grade) state.grade = cfg.grade;
    if (cfg.lettering) state.lettering = cfg.lettering;
    if (cfg.panX !== undefined) state.panX = cfg.panX;
    if (cfg.panY !== undefined) state.panY = cfg.panY;
    if (cfg.zoom !== undefined) state.zoom = cfg.zoom;
    if (cfg.seed !== undefined) state.seed = cfg.seed;
    state.photo = await loadImage(sample);
    titleEl.value = text;
    subtitleEl.value = sub;
    syncControls();
    redraw();
  }).then(() => syncControls());
} else {
  loadImage('samples/boulevard.png').then((img) => { state.photo = img; redraw(); });
}
