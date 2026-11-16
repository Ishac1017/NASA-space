// Player-facing explanations. NASA links verify the scientific background.
// All spacecraft prices, launch capacities, points and timelines in this game are classroom values.
export const guides = {
  wildfire: {
    icon:'🌍', kicker:'EARTH • BEGINNER', years:'3 simulated years · 8 playable events', tint:'#49d4ba',
    briefing:'Find possible wildfires from space, check the observations, and get useful reports to people on the ground.',
    purpose:'Your satellite scans Earth with a heat-sensing camera. It must keep working and send its most urgent findings to ground teams.',
    learn:[
      ['Find heat', 'An infrared camera looks at heat emitted by the land. A hot spot can be a fire, but it needs a quality check.'],
      ['Handle clouds', 'Clouds can block thermal and ordinary photos. Radar can see the ground through clouds, but cannot directly measure fire heat.'],
      ['Send useful data', 'A satellite cannot send unlimited pictures during a short pass over a ground station. Choose what matters most.']],
    missionTasks:['Take at least two heat images','Send at least one checked observation to Earth','Keep your spacecraft operating for the full three-year campaign'],
    chapters:['Start-up: calibrate the camera','A cloudy day above a fire','Storage gets too full','Major fire emergency'],
    sources:[['NASA FIRMS active fire data','https://firms.modaps.eosdis.nasa.gov/'],['NASA Earthdata — active fire detection','https://www.earthdata.nasa.gov/data/tools/firms']],
    idea:'A hot pixel is a clue, not automatic proof of a wildfire.',
  },
  lunar: {
    icon:'🌙', kicker:'MOON • INTERMEDIATE', years:'8 playable mission events', tint:'#c8d9ff',
    briefing:'Circle the Moon and look for evidence of possible ice inside very dark polar craters.',
    purpose:'Make a map of the south pole and measure clues to water ice. Some crater floors never receive sunlight.',
    learn:[
      ['Look for hydrogen', 'A neutron detector can map hydrogen. Hydrogen can be associated with water, but one reading cannot prove ice.'],
      ['Map dark craters', 'Cameras, radar and laser altimeters show different things. Combining measurements gives stronger evidence.'],
      ['Plan for no signal', 'The Moon itself blocks direct radio contact when an orbiter is behind it. Store your findings until contact returns.']],
    missionTasks:['Make at least one surface image or map','Complete one ice-search scan','Complete the eight lunar mission events'],
    chapters:['Travel through the Van Allen belts','Behind the Moon: radio blackout','From sunlight into shadow','Possible ice signal','Solar particle storm','Another mission asks for relay help'],
    sources:[['NASA Lunar Reconnaissance Orbiter instruments','https://science.nasa.gov/mission/lro/spacecraft-and-instruments/'],['NASA Moon polar shadows','https://science.nasa.gov/resource/shadows-near-the-moons-south-pole/']],
    idea:'Neutron measurements suggest hydrogen; other evidence is needed to establish water ice.',
  },
  neptune: {
    icon:'🪐', kicker:'NEPTUNE • ADVANCED', years:'More than a decade of travel · 8 events', tint:'#8bb9ff',
    briefing:'Build an imagined Neptune orbiter, photograph moving clouds, and drop one probe into the atmosphere.',
    purpose:'Survive a very long trip, work with extremely weak sunlight, and collect cloud pictures and direct atmospheric measurements.',
    learn:[
      ['Weak sunlight', 'Neptune is about 30 times farther from the Sun than Earth. Sunlight is about 900 times weaker, so choose an RTG generator.'],
      ['Hours of radio delay', 'A message takes roughly four hours one way between Earth and Neptune, depending on their positions. Upload plans in advance.'],
      ['No landing surface', 'Neptune has no solid surface to land on. Your orbiter stays above the planet; its one-use probe falls through the atmosphere.']],
    missionTasks:['Take at least one picture of Neptune’s clouds','Release the one-use atmospheric probe during its window','Keep your ship working through all eight mission events'],
    chapters:['Cross the mostly empty asteroid belt','Power slowly falls during a long cruise','Plan commands despite radio delay','Cold equipment near Neptune','Atmospheric probe release window','A new dark storm appears'],
    sources:[['NASA Neptune facts','https://science.nasa.gov/neptune/neptune-facts/'],['NASA Voyager 2 trip to Neptune','https://science.nasa.gov/mission/voyager/planetary-voyage/']],
    idea:'Voyager 2 flew past Neptune in 1989. This game explores a more demanding imagined orbiter and probe mission.',
  },
};
export const eventInfo = {
  calibration:{scene:'calibration',phase:'EARLY OPERATIONS',task:'sequence',lesson:'Calibration checks how an instrument measures signals. Without it, numbers may be wrong even when the camera still works.'},
  cloud_smoke:{scene:'clouds',phase:'EARTH OBSERVATIONS',task:'aim',lesson:'Radar can map the surface despite clouds and smoke. It cannot replace infrared measurements of the heat from an active fire.'},
  data_overload:{scene:'data',phase:'DATA MANAGEMENT',task:'sort',lesson:'When storage or the radio link is limited, urgent and reliable observations should be sent first.'},
  fire_emergency:{scene:'wildfire',phase:'EMERGENCY RESPONSE',task:'aim',lesson:'A fast delivery of checked satellite data is more useful than a big pile of images that arrive too late.'},
  van_allen:{scene:'radiation',phase:'EARTH–MOON TRANSFER',task:'wire',lesson:'Earth’s Van Allen belts contain trapped energetic particles. A spacecraft crossing them can protect sensitive systems.'},
  far_blackout:{scene:'blackout',phase:'MOON ORBIT',task:'sort',lesson:'A radio needs a clear path or a suitable relay. Radio waves cannot pass straight through the Moon.'},
  lunar_thermal:{scene:'eclipse',phase:'MOON ORBIT',task:'wire',lesson:'The spacecraft needs both insulation and carefully managed heat, especially during shadowed parts of orbit.'},
  ice_signal:{scene:'ice',phase:'POLAR SURVEY',task:'aim',lesson:'An unusual neutron count points to hydrogen. Repeat scans and combine different measurements before concluding ice is present.'},
  solar_storm:{scene:'radiation',phase:'SPACE WEATHER',task:'sequence',lesson:'A safe mode can turn off vulnerable equipment during a solar particle event, at the cost of missing observations.'},
  partner_relay:{scene:'signal',phase:'COOPERATION',task:'align',lesson:'Helping another mission uses your antenna time and radio bandwidth. Collaboration has real resource costs.'},
  asteroid_belt:{scene:'asteroids',phase:'DEEP-SPACE CRUISE',task:'timing',lesson:'Asteroids are separated by vast distances; a spacecraft normally does not weave around a crowded field of rocks.'},
  rtg_decay:{scene:'power',phase:'DEEP-SPACE CRUISE',task:'wire',lesson:'An RTG makes power from natural radioactive heat. Its output slowly drops over years, so power margins matter.'},
  comm_delay:{scene:'signal',phase:'ARRIVAL PLANNING',task:'sequence',lesson:'At Neptune, a round-trip exchange takes about eight hours (varies with distance). Onboard preplanned commands are essential.'},
  neptune_cold:{scene:'eclipse',phase:'NEPTUNE ARRIVAL',task:'wire',lesson:'Cold can disable a sensor just as surely as a broken circuit. Heaters cost electricity, so thermal and power plans are linked.'},
  probe_window:{scene:'probe',phase:'NEPTUNE ATMOSPHERE',task:'timing',lesson:'The one-use probe enters the atmosphere and sends measurements to the parent spacecraft. It does not land on a solid surface.'},
  dark_storm:{scene:'storm',phase:'NEPTUNE WEATHER',task:'aim',lesson:'Neptune’s dark vortices can appear or disappear. A camera can follow their changing shape, if the pointing and data budget allow.'},
};
export const roomLabels={power:'Power Bay',comms:'Radio Room',vault:'Data Vault',instr:'Camera & Sensors',control:'Flight Computer',thermal:'Temperature Control',engine:'Engines',nav:'Navigation',hull:'Outer Shield'};
export const roomHelp={
 power:'Choose which systems receive electricity. Solar panels need sunlight; a radioactive heat generator also works in the dark.',
 comms:'Aim the radio dish toward Earth and send stored messages during a contact window.',
 vault:'Pick which stored pictures and measurements are the most urgent to transmit.',
 instr:'Point a camera at your target and take a picture, or measure hydrogen near the Moon.',
 control:'Give the computer a safe step-by-step command sequence, even when Earth cannot answer immediately.',
 thermal:'Manage heaters and insulation so cold or hot parts stay within safe temperatures.',
 engine:'Fire small thrusters to change the spacecraft’s path. Every correction uses fuel.',
 nav:'Point your spacecraft accurately toward a target or toward Earth.',
 hull:'Protect important electronics during a burst of space radiation.',
};
export const roomArt={power:'solar-wing-160.png',comms:'communications-160.png',vault:'cargo-160.png',instr:'observation-160.png',control:'flight-deck-160.png',thermal:'science-lab-160.png',engine:'engine-160.png',nav:'nose-160.png',hull:'airlock-160.png'};
export const quizzes={
 wildfire:[
 {q:'What should you use to find very hot places on Earth?',choices:['A magnet sensor','A heat-sensing infrared camera','A fuel meter','A star tracker'],answer:1,why:'Infrared images show heat. A hot spot still needs checking before calling it a fire.'},
 {q:'Clouds hide the ground. What can a radar picture help you see?',choices:['The surface through clouds','The exact temperature of a flame','The inside of the Sun','A live video from firefighters'],answer:0,why:'Radar can see the land through clouds. It does not directly measure fire heat.'},
 {q:'A ground station contact lasts only a few minutes. What should you send first?',choices:['Everything in random order','Only blank pictures','Checked, urgent fire observations','The oldest engineering log'],answer:2,why:'Important, time-sensitive and trustworthy data are most useful first.'}],
 lunar:[
 {q:'A neutron detector measures extra hydrogen. What does that tell you?',choices:['There is definitely a lake','There may be water ice; other measurements are needed','The crater is warm','The camera is broken'],answer:1,why:'Hydrogen is evidence worth studying, but it is not an ice proof by itself.'},
 {q:'Your orbiter goes behind the Moon. Why might its radio stop reaching Earth?',choices:['The Moon blocks the radio line of sight','The Sun turns off','The battery instantly breaks','Earth disappears'],answer:0,why:'You need to save the data and send it when the spacecraft comes back into view.'},
 {q:'What does a laser altimeter help produce?',choices:['A supply of fuel','A map of surface heights','Pictures of heat from wildfires','A stronger radio signal'],answer:1,why:'Laser measurements help map crater shapes and slopes.'}],
 neptune:[
 {q:'Which generator can supply electricity even far from sunlight?',choices:['Small solar panels','An RTG radioisotope generator','No generator','A camera flash'],answer:1,why:'Neptune gets about 1/900 of the sunlight Earth does. An RTG is designed for long dark journeys.'},
 {q:'Why do we send an automatic command sequence in advance?',choices:['Neptune rotates too quickly','Radio messages take hours each way','A computer cannot store data','A probe has wings'],answer:1,why:'You cannot control a spacecraft live when each signal takes several hours.'},
 {q:'What happens to the atmospheric probe at Neptune?',choices:['It lands on rock','It studies atmosphere while falling inward','It becomes a moon','It drives across a desert'],answer:1,why:'Neptune has no solid surface for a conventional landing.'}],
};
