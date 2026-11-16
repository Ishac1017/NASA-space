# Moonbound Web V1.9 — Synchronized Solar System + Editable Cabin Supplies

## What changed relative to the **uploaded V1.8**

This is a direct incremental upgrade of `Moonbound_Web_V1_8_Itchio_Ready(1).zip` and **not a rewrite**. All existing mission selection, rocket engineering, educational PDR/CDR quiz, launch countdown/staging, Moon/Mars transfer, alerts, repair decisions, lunar/Mars landing practice, profile storage/points, NASA image references, music, and report export are retained.

### 1. All eight planets move together

- Mercury, Venus, Earth–Moon barycenter (shown as Earth), Mars, Jupiter, Saturn, Uranus and Neptune now use **JPL Table 1** approximate Keplerian elements and secular rates (valid 1800–2050).
- Flight has a **solar monitor for all three missions**, even before launch; the full-screen Solar System modal uses the same coordinate calculations.
- A common simulated epoch drives planetary positions and the spacecraft's illustrated Mars trajectory. **Cruise time does not have an independent calendar clock.** The lunar local-view inset is an explicitly simplified approximation; JPL Table 1 does not supply accurate Moon positions.
- **1× / 10× / 100× / 1000×** controls let players fast-forward the game's pre-existing accelerated teaching timeline. When the game is in transfer, time acceleration advances both the spacecraft and all planetary positions; unanswered hazards interrupt progress and are never skipped over by fast-forward.
- **ALL 8 / INNER 4** provides a legible overview at different scales. To make all eight planets visible at once, distances are **logarithmically compressed visually**, not used to modify physics or game mechanics.
- The Solar System overlay and in-flight monitor share the same epoch. The ±30-day controls are available for previews, but do not permit teleporting the clock during an active transfer.

### 2. Cabin stock quantities: add and remove at any time

**Before launch**: BUILD → *CABIN LOGISTICS* → open the accordion. Every occupied bay has rows for backup battery packs, electronics spares, science calibration kits, and crew food/water packs. Click **−** or **＋** to edit the selected bay's stock. Quantities range from 0 to 999 per supply kind per bay.

All changes immediately affect **mass, cost, engineering feasibility and the PDR/CDR authorization reset**. You can create any proposed manifest, but exceeding the per-room **safe stowage capacity** will flag the design and cause a prelaunch engineering abort unless corrected. Existing **LOAD / TRANSFER** logic remains as an optional logistics minigame (adjacent bays, finite ground staging for the original LOAD control).

**During flight**: FLIGHT → *CABIN OPERATIONS / REPAIR WORKSHOP*. Every installed bay also has **− / ＋** stock controls. Adding or removing supplies instantly is a **scenario editor**, not a physical resupply. The run is marked **PRACTICE** and cannot earn local profile points. The pre-existing **MOVE ONE BAY** action continues to simulate physical stowage transfers, and repair buttons still consume the actually stored items. This separation prevents fictional mid-flight replenishment from being represented as realistic mission performance.

### Deployment to itch.io

1. Upload `Moonbound_Web_V1_9_Itchio_Ready.zip` as the new HTML5 file for your existing game. `index.html` is at the **top level of the ZIP**.
2. It requires no Node, Phaser or React runtime dependencies; all original local graphics and music are included. Remote NASA image previews still require Internet access, with local concept-art fallbacks.
3. Use the preview and hard-refresh the itch.io iframe; select a mission and test BUILD supplies and the Flight Solar monitor.
4. Local profiles are **device-local demos** (not online/cloud identities); do not reuse important passwords.

### Important scientific disclosures

NASA/JPL planetary data come from <https://ssd.jpl.nasa.gov/planets/approx_pos.html>, *Approximate Positions of the Planets*, Table 1. These coefficients are approximate ephemerides, not exact JPL Horizons vectors. Earth uses the **Earth/Moon barycenter**. Spacecraft transfer, resource usage, rocket behavior except sourced SLS reference inputs, landing, costs, scoring, and incident outcomes are educational approximations. Compressed plot distances do not constitute a physically scaled solar system. The simulation clocks are game clocks, not real-time celestial motion.

### Validation and limitations

- `node --check game.js` **passed**.
- `node tests/verify_v19.js` **passed** in the packaged offline Node/VM harness: eight valid planetary locations, per-bay stock adjustments, mass updates, stowage failure, shared cruise epoch, Practice Run designation, and canvas-function smoke tests with a stub drawing context.
- Actual Chromium page navigation is blocked by the testing environment's browser administrator policy. Hence **the finished V1.9 was not browser-interaction tested on itch.io or a live server**. Perform a manual end-to-end deployment check before submission.
- This release deliberately retains V1.8's lightweight HTML/CSS/JavaScript architecture to avoid breaking its gameplay and itch.io packaging. It does **not** claim to have converted the project to Phaser 3 / React / Vite; that would be a separate migration.
