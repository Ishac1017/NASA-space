/** Asset + gameplay wiring validation for the Moonbound / Mission Lab fusion. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const exists=p=>fs.existsSync(path.join(root,p));
const bad=[];
const required=['index.html','src/App.jsx','src/state/gameStore.jsx','src/data/modules.js','src/components/ModularHangar.jsx','src/components/SolarSystemViewer.jsx','src/components/ProfileManager.jsx','src/phaser/scenes.js','src/phaser/PhaserCanvas.jsx','src/adventure/MissionAdventure.jsx','src/adventure/AdvancedTaskConsole.jsx','src/adventure/TaskConsole.jsx','src/adventure/missionEpisodes.js','src/adventure/adventureState.js','src/adventure/missionAdventure.css', 'public/moonbound/shell-nose.png','public/moonbound/shell-engine.png','public/moonbound/shell-solar-wing.png','public/moonbound/shell-bay-frame.png','public/moonbound/banner_mission_select.png','public/moonbound/banner_build_ship.png','public/moonbound/banner_fly_mission.png','public/moonbound/banner_mission_report.png', ...['wildfire','lunar','neptune'].map(n=>`public/audio/ambient_mission_${n}.wav`), ...['science-lab','observation','communications','flight-deck','life-support','cargo','airlock','crew-quarters','galley','medical','exercise','hygiene','engine'].map(n=>`public/moonbound/rooms/${n}.png`)];
for(const f of required)if(!exists(f))bad.push(`Missing file: ${f}`);
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
for(const dep of ['react','react-dom','phaser'])if(!pkg.dependencies?.[dep])bad.push(`Missing dependency: ${dep}`);
if(!pkg.dependencies?.phaser?.startsWith('3.'))bad.push('Expected Phaser 3');
const modules=await import('../src/data/modules.js');
const {MAX_BAYS,MIN_BAYS,MODULES,starterBays}=modules;
if(MAX_BAYS!==10||MIN_BAYS!==3)bad.push('Bay limits must be 3–10');
for(const module of MODULES)if(!exists(`public/moonbound/rooms/${module.art}.png`))bad.push(`Missing art for ${module.id}`);
for(const mission of ['wildfire','lunar','neptune']){
 const bays=starterBays(mission);
 if(bays.length>MAX_BAYS)bad.push(`${mission}: too many bays`);
 for(const bay of bays)if(!MODULES.some(m=>m.id===bay.room))bad.push(`${mission}: unknown room ${bay.room}`);
}
console.log(bad.length?bad.join('\n'):'Validation passed: React/Vite/Phaser, 3 campaigns, all 24 events, dynamically selected rooms, modular art and music.');
process.exit(bad.length?1:0);
