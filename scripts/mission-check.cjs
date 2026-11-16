const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'),fs=require('fs'),path=require('path'),assert=require('assert');const root=path.resolve(__dirname,'../src');
function transpile(pathname,resolve){const source=fs.readFileSync(pathname,'utf8'),code=ts.transpileModule(source,{fileName:pathname,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const module={exports:{}};new Function('module','exports','require',code)(module,module.exports,resolve);return module.exports;}
const modules=transpile(path.join(root,'data/modules.js'),()=>{});
const json=name=>JSON.parse(fs.readFileSync(path.join(root,`data/${name}.json`),'utf8'));
const DATA={parts:json('parts'),launchers:json('launchers'),missions:json('missions'),events:json('events'),orbits:json('orbits'),quiz:json('quiz')};
const byId=(a,id)=>a.find(x=>x.id===id);
const engine=transpile(path.join(root,'game/engine.js'),id=>id==='../data'?{DATA,byId}:id==='../data/modules'?modules:id==='./missionGuide'?{guides:{}}:null);
const layout=transpile(path.join(root,'phaser/scenes.js'),id=>id==='../data/modules'?modules:null);
for(const id of ['wildfire','lunar','neptune']){
 const bays=modules.starterBays(id);const template=({wildfire:'smallsat',lunar:'orbiter',neptune:'flagship'})[id],parts={...engine.defaultParts,...engine.favoriteParts[id],battery:id==='neptune'?'battery_large':'battery_medium',instruments:modules.allBayInstruments(bays),redundancy:[]};const state={missionId:id,stage:'configure',templateId:template,launcherId:id==='wildfire'?'launcher_medium':'launcher_heavy',orbitId:byId(DATA.missions,id).orbit,parts,bays,quality:'balanced'};
 const result=engine.evaluate(state),m=result.metrics;
 console.log(`${id}: ${bays.length} bays; ${m.slotCount}/${m.slots} tools; ${m.mass} kg / ${result.launcher.capacity[state.orbitId]} kg; ${m.cost}M / ${result.mission.budgetCap}M; electrical ${m.powerDraw} W / ${m.powerOutput} W; hard=${result.hard}`);
 const hard=result.issues.filter(x=>x.severity==='hard');assert(!hard.length,`${id}: ${hard.map(x=>x.text).join('; ')}`);
 const rooms=layout.buildRoomLayout(bays);assert.equal(rooms.length,bays.length);const required=id==='wildfire'?'observation':id==='lunar'?'sensors':'observation';assert(!layout.resolveAlarmRoom(required,rooms).missing);assert(modules.allBayInstruments(bays).every(inst=>bays.some(b=>b.instruments.includes(inst))));
 const extra=modules.normalizeBays([...bays,...Array(12).fill({room:'galley',instruments:[]})],id);assert.equal(extra.length,10);
}

const fire=transpile(path.join(root,'adventure/gameData.js'),()=>null);
const eps=transpile(path.join(root,'adventure/missionEpisodes.js'),id=>id==='./gameData'?fire:null);
for(const missionId of ['wildfire','lunar','neptune']){
  const rooms=layout.buildRoomLayout(modules.starterBays(missionId));
  const problems=eps.ADVENTURES[missionId].episodes.filter(event=>layout.resolveAlarmRoom(event.room,rooms).missing);
  console.log(`${missionId}: ${eps.ADVENTURES[missionId].episodes.length} events, missing rooms: ${problems.map(e=>e.room).join(', ')||'none'}`);
  assert(!problems.length,`Missing task room for ${missionId}`);
}
console.log('PASS: templates/engines, 10-bay cap, and interior room mapping for all three missions.');
