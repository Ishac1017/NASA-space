# MOONBOUND × MISSION LAB — Fusion Edition

**Playable educational Space Mission Design Game** based on two user-provided projects: Yafang's Moonbound V1.9 presentation/assembly design and the Mission Lab Phaser 3 + React/Vite three-mission game. This is a **React 18 + Vite 5 + Phaser 3** application. It retains the accessible multi-step configuration, pre-launch knowledge review, launch check, stage-separation animation, mission campaign, room-based alarms, game puzzles, music, post-mission review, and reports from Mission Lab while adopting Moonbound's blue/lime visual language, modular bay artwork and solar-system reference concept.

## Run it

You need Node.js 20+ and npm. Unzip the project, then:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173). Or double-click `START_WINDOWS.bat` on Windows; use `sh START_MAC_LINUX.sh` on macOS/Linux.

To run source, engineering and campaign checks: `npm run check`. To build static files for hosting: `npm run build`, then `npm run preview`. The output is in `dist/`. **Dependencies are not bundled in the ZIP**; the first `npm install` needs internet access.

## What was combined

### From Yafang's Moonbound visual and builder project

- Moonbound dark navy, high-contrast cyan/lime game UI on mission selection, design, countdown/launch, live operations and report pages.
- **Modular Assembly Hangar** with nose/end caps, selected bay preview, module catalog, **+ BAY / − BAY** and **Clear selected bay**, and **Full ship** inspection view.
- Build from **3 to 10 bays**. All room hardware affects the spacecraft's mass, cost and power draw. Instrument mounts and the template-wide instrument-slot limit still apply.
- A filterable catalogue of functional ship modules and optional crew compartments, using artwork fetched from the user's **App Visual Kit** Google Drive folder.
- An animated all-eight-planets solar-system reference viewer with pause/speed/inner-planet controls. The planets use approximate NASA/JPL orbital elements; the displayed spacecraft path is an explicit teaching overlay, not NASA telemetry.
- A device-only local profile dialog, saved mission history and points, plus existing local mission autosave. Profiles are NOT online accounts.
- **The user explicitly excluded cabin logistics**, so there is no move-supplies-between-bays task or simulated midflight stock replenishment.

### From the user's Mission Lab Phaser 3 project

- Original, more readable **Build Your Spacecraft** configuration tabs: **Instruments**, **Ship systems**, **Launch & orbit**, with a **Design Coach** showing real-time warnings at the bottom.
- Instruments are mounted in compatible installed bays, *not* chosen independently of the hull. For example, cameras go into Observation, a neutron detector into the Instrument Lab, and the Neptune probe into the Probe / Payload Bay. The complete inventory is used for feasibility checks.
- Spacecraft template choice, power/battery/computer/radio/shielding/fuel/storage/pointing controls, redundancy options, budget/weight/power checks, launch-vehicle capacity by destination, orbit choice and mission requirements.
- Prelaunch knowledge check, design feasibility feedback (quiz score does not decide rocket launch), timed rocket launch and stage sequence.
- **Phaser 3 live game** with outside space view and a second walkable spacecraft interior view. Use WASD/arrow keys, click a room to walk there, and press E/Space near alarms to operate the equipment. The interior's actual rooms and instrument markers are generated from the selected bays; it is NOT a fixed eight-room map.
- 8 different timed-event gameplay chapters for each of the three missions (24 total) with hands-on tasks, room-based alarms, resource changes, consequences, optional achievements, sound, and mission review.
- The aircraft/spacecraft moves forward along an illustrated route; Moon and Neptune flight paths do **not** oscillate backward and forward. Destination/orbit scenes and event visualization change by mission and chapter.

## The missions

1. **Earth Wildfire Watcher — beginner.** Monitor Earth using thermal infrared observations, check hotspots, handle clouds and smoke, prioritize urgent fire information, manage data storage, battery/eclipse, scheduled downlink and orbit corrections. A heat signal is a *candidate*, not proof of a wildfire.
2. **Lunar South Pole Ice Scout — intermediate.** Cross radiation belts, enter lunar polar orbit, survive far-side radio blackout, manage heaters, map shadowed regions, investigate hydrogen readings for possible ice, react to solar radiation and optionally provide relay support. Neutron/hydrogen signals by themselves do *not* prove water ice.
3. **Neptune Atmosphere Mission — advanced, replacing Mars.** Follow a long deep-space flight, avoid wasting fuel crossing the sparsely populated asteroid belt, manage slowly changing RTG power, plan around multi-hour radio delay, enter a simplified target orbit, maintain heating, release an atmospheric probe at a safe window, image a dark storm and transmit observations. Neptune has no solid surface to land on.

For each mission, the recommended starter design fits the example mission's launch mass, budget, electrical and instrument limits. You can still build incompatible ships and attempt launch to learn from a failed engineering check.

## How to play

Choose a mission → select a spacecraft → build/resize your ship in the modular hangar → click instrument-compatible bays and install sensors → select its systems and launcher → review the knowledge questions → attempt launch → watch the transfer and animated event scenes → **Open spacecraft** for an alarm → walk to the highlighted module and operate equipment → complete the mission → fill in the report / replay or redesign.

**Walk controls:** WASD or arrow keys; click a room for auto-walk; E/Space to operate nearby alarm equipment; switch between Live View and Open Spacecraft with on-screen controls. You can pause the game.

## Important limitations

This is an educational video game, not flight software. It includes simplified rocket launch performance, event/resource costs, spacecraft sizes, power budgets and trajectories. All game currency, probe descent parameters, and image/measurement scores are *made-up teaching numbers*. The walking repair character is a **virtual engineer/avatar** for teaching—Earth, Moon, and Neptune spacecraft in these scenarios are robotic, not staffed with a person who can physically walk inside them. The Moon, Earth and Neptune orbital imagery and spacecraft routes are not JPL Horizons spacecraft ephemerides. An illustrated route's progress is driven by game chapters, and its geometry is compressed for readability.

NASA/JPL background information is distinguished from the game models:

- https://ssd.jpl.nasa.gov/planets/approx_pos.html — NASA/JPL approximate positions of the planets, Table 1 (1800–2050)
- https://science.nasa.gov/neptune/neptune-facts/ — Neptune environment, sunlight, and physical structure
- https://science.nasa.gov/mission/voyager/planetary-voyage/ — deep-space exploration and travel context
- https://science.nasa.gov/moon/moon-water-and-ices/ — lunar water/ice evidence
- https://science.nasa.gov/resource/shadows-near-the-moons-south-pole/ — lunar polar lighting
- https://firms.modaps.eosdis.nasa.gov/ — NASA FIRMS thermal anomaly/fire monitoring
- https://docs.phaser.io/phaser/getting-started/installation — Phaser 3

The original Moonbound NASA SLS specialist launch model and optional Moon landing trainer remain in the preserved `reference` source; they are not integrated as playable components in this fusion release. They were not silently represented as working features.

No network API key or backend is required for gameplay. User profiles and achievements are only stored in the current browser and can be edited or erased by anyone with device/storage access. The browser's Web Crypto API requires localhost or HTTPS for local passphrase verifiers; do not reuse a real password.

## Project map

- `src/components/ModularHangar.jsx` — modular hangar and bay-specific instrument mounting.
- `src/data/modules.js` — 17 modules, equipment compatibility, starter bay layouts and max-10 limit.
- `src/screens/Configure.jsx` — readable 3-tab ship system controls + Design Coach.
- `src/state/gameStore.jsx` — shared game state, player profiles and dynamic bay actions.
- `src/game/engine.js` — ship budgets, masses, energy and launch checks.
- `src/phaser/scenes.js` — changing animated mission environments and dynamic interactive ship interior.
- `src/phaser/PhaserCanvas.jsx` — actual Phaser 3 canvas wired to React.
- `src/adventure/MissionAdventure.jsx` — live mission, alarms, objectives, reports, and navigation.
- `src/adventure/missionEpisodes.js` — 24 mission episodes.
- `src/adventure/adventureState.js` — resource and mission win-state logic.
- `src/adventure/TaskConsole.jsx`, `AdvancedTaskConsole.jsx` — playable equipment tasks.
- `src/components/SolarSystemViewer.jsx` — 8-planet animated orbital reference.
- `src/components/ProfileManager.jsx` — device-local profiles and progress.
- `public/moonbound/` — original user-supplied Moonbound/Google Drive imagery.
- `public/visual-kit/`, `public/audio/` — original Mission Lab sprites and audio.
- `reference/yafang_v1_9_source/` — original uploaded Yafang code and notes **for reference, not loaded into the app**.
- `scripts/` — offline project and campaign validation; `QA_REPORT.md` — test results.

## Credit and originality

Visual room/shell sprites and banners come from user-provided, AI-generated Moonbound concept art. Phaser/React implementation is AI-assisted; soundtracks come from the earlier user-provided game assets. NASA provides external reference science, not game certification or endorsement. The `reference` directory keeps original author material separate from the rewritten active React app.
