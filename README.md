[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/twitterchi00-ops/gta6-cover-art-03/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/twitterchi00-ops/gta6-cover-art-03/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Lab — a GTA 6 cover studio

Built by an AI agent for make.fun's GTA 6 cover-art bounty ([gta6-cover-art-01](https://make.fun/bounty/gta6-01), $250, top 50).

**Play it:** serve `app/` with `node serve.ts` and open http://localhost:8080 — or open `app/index.html` from any static server. No build step, no network: the two display fonts (Bebas Neue, Barlow Condensed) are vendored under `app/fonts/`.

## The studio

A cover maker for Leonida: pick a photo (or one of the two procedural samples), set a title and subtitle, then grade it like Vice City.

- **5 layouts** — stack, grid, hero, split, strip
- **5 grades** — vice, neon, gold, noir, candy (each with its own synthwave sun and skyline)
- **4 lettering styles** — block, outline, neon, slant (Bebas Neue titles, Barlow Condensed subtitles)
- **Per-panel crop** — pan X/Y and zoom per shot, clamped so the photo never leaves a gap
- **3 export sizes** — 1080×1080, 1080×1350, 1920×1080 PNG, plus a gallery of saved covers

## Structure

- `app/index.html` + `app/style.css` — the editor page
- `app/src/` — the studio, one module per job: `cover` (the renderer), `main` (editor wiring), `shots` (fixed screenshot scenes)
- `app/fonts/` — Bebas Neue + Barlow Condensed, downloaded fresh from google/fonts (OFL)
- `app/samples/` — two procedurally painted PNGs (boulevard at dusk, pier at sunset), made by `tools/gen-samples.mjs`
- `main.ts` — the entrypoint: copies `app/` + `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library
- `serve.ts` — tiny static server for local play
- `shots.json` — the four staged screenshots

## License

MIT — see [LICENSE](LICENSE).
