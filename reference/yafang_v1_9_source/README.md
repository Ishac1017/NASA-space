# MOONBOUND Web V1.9 — Eight-Planet Simulator + Editable Cabin Inventory

**New V1.9 release:** See [README_V1_9.md](README_V1_9.md) or [中文说明](README_V1_9_中文.md) for installation, inventory +/- instructions, orbital synchronization, scientific limitations and validation. All original V1.8 components are retained. The notes below describe the previous V1.8 baseline, and its validation claims do not apply to new V1.9 changes.

---

# MOONBOUND Web V1.8 — Enhanced Solar, Local Profiles and In-flight Maintenance

Playable browser-based educational game for the NASA Space Apps Challenge 2026 **Space Mission Design Game** challenge. This build retains the V1.7 core gameplay while adding linked Solar animation in the Flight stage, inventory-based in-flight maintenance, individual local profiles and points, and sourced NASA science imagery references.

## How to run

Open `index.html` in a modern browser or run `python3 -m http.server 8000` inside the extracted directory and browse to `http://localhost:8000`. All packaged images and original music are local. External NASA reference pictures may require Internet access.

**To update itch.io:** On the existing game's Edit game page, replace the HTML5 ZIP; do not create a second project. The ZIP must have `index.html` at its root. Save, preview and hard refresh. A mobile viewport is supported; full screen is recommended for desktop.

## Game loop

**MISSION → BUILD → REVIEW → FLIGHT → OPERATIONS → REPORT.** Choose an Earth, Moon or Mars mission; configure spacecraft bus, launcher (including NASA SLS Block 1 reference), instrument, propellant, power and rooms; conduct four-question PDR/CDR; test feasibility; use T−10 countdown and multi-stage ignition; transfer to destination; manage events; collect/downlink teaching data; debrief and score.

## Improvements in V1.8

1. **Flight-page Solar monitor.** While transferring to Moon/Mars, Solar System reference positions and a spacecraft path marker animate directly within Flight. Body positions are from published JPL 1800–2050 approximate elements where applicable; drawn transfer/capture are separately marked educational approximations, not spacecraft telemetry.
2. **In-flight cabin service.** During cruise and orbit, supplies can travel between adjacent connected rooms. Spare electronics and backup power are consumed by selected in-flight repair actions. Crewed mode consumes an illustrative food/water pack every 30 simulated days. Supplies have educational impacts on game resource health.
3. **Local profile and points.** Create local name + passphrase, sign in/out, save progress, see points and run history. Web Crypto PBKDF2-SHA256 salted passphrase verifier is used where the browser supports secure-context crypto. Score history is de-duplicated by run ID. **Not an online identity platform.** No cross-device sync, password reset or anti-cheat; local storage is accessible to the device user and may be cleared or modified. Do not reuse an important password.
4. **NASA science media references.** Operations page links to NASA Blue Marble, an LRO South Pole picture, and an MRO Jezero region image with source/dating. Where remote images fail, the app clearly substitutes AI **concept art** and retains the NASA link. The science minigame's numbers do not become NASA measured observations.
5. **Resilience and learning.** Failed missions now have a debreif entry. The existing mission-choice panels, responsive builder, PDR/CDR, countdown/staging, Moon/Mars transfers, visual alerts, landing, Solar System modal, and classical-style original music remain in place.

## Source separation

See `REAL_NASA_DATA.md` for SLS, planetary and image sources. Generic rockets, game-bus parameters, mission costs, consumed resources, solar storm penalties, orbital maneuvers, automatic landing, and numeric scores are classroom examples. This is not a certified launch simulation or NASA-sponsored product.

## Validation

- `node --check game.js` passed.
- Chromium integration tests executed Earth, Moon and Mars mission launches and destination capture; the Solar monitor, maintenance panel, source-image fallback and responsive 390 px layout displayed without uncaught JS errors.
- A browser test fixture exercised local-profile UI create/logout/login and points de-duplication with mocked storage/crypto because headless `about:blank` sandbox restricts secure-origin Web Crypto and `localStorage`. **Actual on-site HTTPS login has not been independently verified**; test it on itch.io before publishing.
- Screenshots named `preview_*.png` are captures of the actual V1.8 game running in Chromium. They are supplied separately for submission/reporting and are not necessary for the executable ZIP.

## Scope and next steps

Next steps: production OAuth/email auth with a backend, server-side scoring and recovery, 3D JPL Horizons/GMAT validated numerical propagation, credible EDL heat/atmosphere models, more calibrated NASA data layers with caching and citations, and multiplayer collaboration with accessibility testing.

## Credits

Visual ship sprites, cinematic covers, original music, code and report include AI-assisted elements. NASA science references retain individual official source links. See `AI_DISCLOSURE.md`.
