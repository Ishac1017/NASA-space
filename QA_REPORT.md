# MOONBOUND × MISSION LAB Fusion — QA Report

## Verified in this environment (2026-11-15)

- `npm run check`: **PASS**, including file/art/audio checks, JavaScript/JSX TypeScript-parser checks (**46 source JS/JSX files, no parse errors**), all three starter-loadout feasibility checks, 10-bay cap, 24 event-to-installed-room mappings, and 24-event end-to-end *pure gameplay state* simulations of successful default builds.
- **Artwork:** 23 downloaded Moonbound PNGs passed image-decode validation. User-provided Yafang code and related reference files kept under `reference/yafang_v1_9_source/` without being executed by the game.
- **Earth starter:** 7 bays, 2/2 instruments, 665 kg / 2,000 kg capacity, $383M / $420M budget, 205 W / 300 W available. All 8 events and 4 mission goals achievable in the offline test.
- **Moon starter:** 8 bays, 2/4 instruments, 1,345 kg / 3,000 kg capacity, $715M / $750M budget, 189 W / 1,000 W. All 8 events and 5 goals achievable.
- **Neptune starter:** 9 bays, 3/6 instruments, 3,291 kg / 3,500 kg capacity, $1,590M / $1,600M budget, 228 W / 250 W. All 8 events and 6 goals achievable.
- **Dynamic geometry:** Each starter event resolves to an installed module rather than an old fixed room ID. Empty/uninstalled bays cannot be walked into as normal rooms.
- **Setup:** `package.json` uses React 18, Vite 5 and Phaser 3.90, and `START_WINDOWS.bat` / `START_MAC_LINUX.sh` install dependencies and start Vite.

## Not verified in this environment

- `npm install` failed while reaching the npm registry (`EAI_AGAIN`, network/DNS unavailable); this was an environment restriction, not a proof that the dependencies are invalid.
- Therefore a full Vite production compilation and real interactive browser test were **not possible** here. Source parse/static files and pure campaign logic do not establish that every Phaser animation, input/resize handler, profile flow or mini-game behaves perfectly in a real browser.
- On a machine with internet access, run `npm install && npm run check && npm run build && npm run dev`, then check the three full campaigns in Chrome/Firefox and mobile widths.

## Scope / modeling boundaries

- Ship masses, energy, launch capacity, costs and scoring are illustrative game values; drawing a transfer curve does not validate a real transfer orbit. Planet positions in the Solar System viewer use approximate JPL orbital coefficients but the spacecraft route is schematic and not official NASA telemetry.
- Original Moonbound cabin logistics are intentionally **not ported** as explicitly requested. The Mars game mission is replaced by Neptune. The original uploaded Yafang source is archived separately for comparison and later revisions.
- This release is a functional code project intended for user iteration, not a flight-grade simulation or independently browser-tested production release.
