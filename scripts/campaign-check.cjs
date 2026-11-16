// Offline test of all three playable campaigns with the default starter builds.
// This does not substitute for an interactive browser + Vite build test.
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../src');
function load(file,req=()=>null){const input=fs.readFileSync(path.join(root,file),'utf8');const code=ts.transpileModule(input,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const mod={exports:{}};new Function('module','exports','require',code)(mod,mod.exports,req);return mod.exports;}
const modules=load('data/modules.js'),json=name=>JSON.parse(fs.readFileSync(path.join(root,'data',`${name}.json`),'utf8'));
const DATA={parts:json('parts'),launchers:json('launchers'),missions:json('missions'),events:json('events'),orbits:json('orbits'),quiz:json('quiz')},byId=(a,id)=>a.find(x=>x.id===id);
const engine=load('game/engine.js',id=>id==='../data'?{DATA,byId}:id==='../data/modules'?modules:{guides:{}});
const fire=load('adventure/gameData.js');const episode=load('adventure/missionEpisodes.js',id=>id==='./gameData'?fire:null);
const adventure=load('adventure/adventureState.js',id=>id==='./missionEpisodes'?episode:null);
for(const mission of ['wildfire','lunar','neptune']){
 const bays=modules.starterBays(mission),state={missionId:mission,templateId:{wildfire:'smallsat',lunar:'orbiter',neptune:'flagship'}[mission],launcherId:mission==='wildfire'?'launcher_medium':'launcher_heavy',orbitId:byId(DATA.missions,mission).orbit,parts:{...engine.defaultParts,...engine.favoriteParts[mission],battery:mission==='neptune'?'battery_large':'battery_medium',instruments:modules.allBayInstruments(bays),redundancy:[]},bays,quality:'balanced'};
 const e=engine.evaluate(state);assert(!e.hard,mission+': starter build should be viable');
 let p=adventure.makeAdventure(mission,e.metrics);
 for(const ev of episode.ADVENTURES[mission].episodes){
   p=adventure.resolveChapter(p,{success:true,why:`${ev.name}: task completed`,relayAccepted:mission==='lunar',fuelSaved:true},e.metrics,state);
   assert(p.resources.health>0,mission+': failed at '+ev.id);
 }
 const met=adventure.objectives(mission,e.metrics,p);
 assert(p.finished,`${mission}: should be finished`);assert(met.every(Boolean),`${mission}: missing goals ${met.map((v,i)=>v?null:i).filter(v=>v!==null)}`);
 console.log(`${mission}: ${p.results.length} events, ${p.resources.health}% health, ${p.resources.battery}% battery, all ${met.length} objectives achieved`);
}
console.log('PASS: all three default campaigns have reachable success states.');
