# Real NASA hardware in Moonbound Web V1.3

This version preserves the V1.2 independent scrollable PDR/CDR quiz, restored JPL Solar System viewer, and original classical-style audio. It adds one optional launch configuration based on published NASA SLS Block 1 hardware.

## Values used in the selectable **NASA SLS Block 1** profile

- **Two solid rocket boosters**: each about 726,000 kg wet, 99,300 kg dry. Each contains ~626,700 kg of PBAN solid propellant, derived by subtraction. 126-second nominal burn. Launch thrust about 14,679,000 N *per booster*.
- **SLS core**: about 85,275 kg dry; 317,000 lb liquid hydrogen + 1,860,000 lb liquid oxygen (about 987,500 kg total). Four RS-25 engines at approximately 416,300 lbf sea-level thrust each; approx. 500-second nominal core burn.
- **ICPS**: approximately 32,700 kg wet, 3,700 kg dry, ~29,000 kg LH2/LOX propellant. RL10 engine maximum thrust 110,000 N. Its modeled 1,080-second burn approximates the long Artemis I translunar-injection burn rather than reproducing an engine throttle curve.
- **Capacity benchmark**: NASA SLS Block 1 circa 95,000 kg to LEO and 27,000 kg to translunar injection. These are public reference capabilities, not a guarantee for an arbitrary game trajectory.

When the SLS profile is selected, these masses, burn durations and engine thrust values change the game's fuel depletion, displayed remaining mass, idealized delta-v and thrust-to-weight estimate. The game still uses a scripted 2D altitude/speed visualization, simple Tsiolkovsky ideal-velocity calculations, simplified orbital checks and educational costs. It is NOT an actual SLS ascent trajectory or NASA flight telemetry.

Generic Light, Standard, Heavy, and Super Heavy launchers are still entirely hypothetical.

## Sources

- NASA [SLS Reference Guide (2022)](https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf)
- NASA [SLS Core Stage](https://www.nasa.gov/reference/sls-space-launch-system-core-stage/)
- NASA [SLS Solid Rocket Boosters](https://www.nasa.gov/reference/sls-space-launch-system-solid-rocket-booster/)
- NASA [Interim Cryogenic Propulsion Stage](https://www.nasa.gov/reference/icps/)
- NASA [Moon Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html)
- NASA [Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html)

## Itch.io upload
Upload the ZIP containing `index.html` at the root to the existing HTML project. Replace the old upload. Do not mark the game as NASA-endorsed.

## Mission comparison cards

These are **real NASA mission benchmarks**, shown for context and not used to overwrite fictional player bus/instrument specifications:

- Earth: [Landsat 9](https://science.nasa.gov/mission/landsat-9/) altitude 705 km, inclination 98.2°, period 99 minutes, OLI / TIRS.
- Moon: [Orion](https://www.nasa.gov/reference/avionics-and-software/) service-module electrical production ~11 kW from four arrays; [Artemis I Reference Guide](https://www.nasa.gov/wp-content/uploads/2023/05/artemis-i-reference-guide-inter.pdf) usable spacecraft propellant ~7,250 kg.
- Mars: [Perseverance](https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/quick_facts/) rover mass ~1,025 kg, MMRTG output ~110 W, 59 kg of scientific instruments.

**SLS flight model correction:** boosters + core burn to a game parking-orbit check. The core then separates; ICPS keeps its loaded propellant until the idealized departure maneuver (`BEGIN TRANSFER`). Do not interpret the animation as NASA's actual SLS flight timetable or full orbit-raising / TLI sequence.

## V1.8 planetary visualization and genuine observations

- **NASA/JPL approximate planetary positions**: [JPL Approximate Positions of the Planets, Table 1, 1800–2050](https://ssd.jpl.nasa.gov/planets/approx_pos.html). Used for offline planetary reference dots in Solar view and inline cruise monitor. The Earth elements approximate the Earth–Moon barycenter. Never label as live spacecraft telemetry.
- **NASA/JPL Horizons**: [Horizons](https://ssd.jpl.nasa.gov/horizons/), a higher-accuracy future validation source; not used for high-precision live trajectory propagation in this static build.
- **Earth imagery**: [NASA SVS Blue Marble 30614](https://svs.gsfc.nasa.gov/30614/). Used as an online reference image if reachable.
- **Moon imagery**: [NASA Lunar South Pole, Photojournal PIA13523](https://science.nasa.gov/photojournal/the-lunar-south-pole/).
- **Mars imagery**: [Mars Reconnaissance Orbiter / Jezero Crater rim, Photojournal PIA26402](https://science.nasa.gov/photojournal/perseverances-location-at-the-base-of-jezero-craters-rim/).

These image URLs are remote on purpose. If a remote image cannot load, the game shows an explicitly labeled AI-generated concept-art fallback. Image references must not be mistaken for game-generated science data. The in-flight transfer path is a simplified educational approximation; stage and crew/cargo gameplay parameters not listed above remain game assumptions.
