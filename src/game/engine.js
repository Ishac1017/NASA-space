import {DATA,byId} from '../data';
import {guides} from './missionGuide';
import {byModule,allBayInstruments,MAX_BAYS} from '../data/modules';
const num=(o,k)=>Number(o?.[k]||0);
const sum=(a,k)=>a.reduce((n,x)=>n+num(x,k),0);
export const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,Math.round(v)));
export const defaultParts={instruments:[],power:'solar_small',battery:'battery_medium',batteryType:'battery_standard',comms:'comms_medium',shielding:'shield_standard',storage:'storage_medium',computer:'computer_basic',thermal:'thermal_heaters',propulsion:'prop_chemical',fuel:'fuel_medium',pointing:'point_precision',redundancy:[]};
export const categories=[
 ['shielding','Outer Shield','Protect the equipment from radiation and debris.'],
 ['power','Power Bay','Makes electrical power to run your spacecraft.'],
 ['battery','Battery','Stores extra energy for a period without electricity.'],
 ['batteryType','Battery life','Long-life cells cost more, but age more slowly.'],
 ['comms','Radio Room','Controls how quickly you can send measurements home.'],
 ['computer','Flight Computer','Runs planned commands when Earth cannot respond.'],
 ['thermal','Temperature Control','Keeps delicate sensors warm or cool enough.'],
 ['propulsion','Engines','Small onboard thrusters adjust your path after launch.'],
 ['fuel','Fuel Tank','More propellant means more corrections but a heavier ship.'],
 ['pointing','Navigation','Accurate pointing helps cameras and radio dishes.'],
 ['storage','Data Vault','Stores observations until a radio pass is available.'],
];
export const favoriteParts={wildfire:{power:'solar_large',comms:'comms_medium',storage:'storage_large',instruments:['thermal_ir','visible_cam'],computer:'computer_basic'},lunar:{power:'solar_large',comms:'comms_medium',storage:'storage_large',instruments:['neutron','visible_cam'],computer:'computer_hardened'},neptune:{power:'rtg',comms:'comms_large',storage:'storage_large',instruments:['visible_cam','probe','magnetometer'],computer:'computer_auto',thermal:'thermal_advanced'}};
export function evaluate(s){
 const t=byId(DATA.parts.templates,s.templateId)||DATA.parts.templates[0];
 const inst=(s.parts?.instruments||[]).map(id=>byId(DATA.parts.instruments,id)).filter(Boolean);
 const chosen=categories.map(([cat])=>byId(DATA.parts[cat],s.parts?.[cat])||{});
 const extras=(s.parts?.redundancy||[]).map(id=>byId(DATA.parts.redundancy,id)).filter(Boolean);
 const modules=(s.bays||[]).map(b=>byModule(b.room)).filter(Boolean);
 const all=[...inst,...chosen,...extras,...modules];
 const p=byId(DATA.parts.power,s.parts?.power)||{};
 const battery=byId(DATA.parts.battery,s.parts?.battery)||{};
 const comms=byId(DATA.parts.comms,s.parts?.comms)||{};
 const storage=byId(DATA.parts.storage,s.parts?.storage)||{};
 const launcher=byId(DATA.launchers,s.launcherId)||DATA.launchers[1];
 const orbit=byId(DATA.orbits,s.orbitId);
 const mission=byId(DATA.missions,s.missionId);
 const solarFactor=s.missionId==='neptune'?1/900:1;
 const powerOutput=Math.round(Math.min(t.powerCeiling,num(p,'output')*(p.id==='rtg'?1:solarFactor))*10)/10;
 const qualityScale=s.quality==='detail'?1.7:s.quality==='fast'?.65:1;
 const draw=Math.round((sum(inst,'draw')*qualityScale+sum(chosen,'draw')+sum(extras,'draw')+sum(modules,'draw'))*10)/10;
 const mass=t.baseMass+sum(all,'mass');
 const cost=t.baseCost+sum(all,'cost')+launcher.cost;
 // A stored descent probe does not generate atmosphere data until it is released.
 const dataGeneration=Math.round(sum(inst.filter(i=>i.id!=='probe'),'data')*qualityScale*10);
 const downlink=Math.round(num(comms,'downlink')*15);
 const has=id=>inst.some(x=>x.id===id);
 const metrics={mass,cost,moduleCount:modules.length,bayCount:s.bays?.length||0,moduleMass:sum(modules,'mass'),moduleCost:sum(modules,'cost'),modulePower:sum(modules,'draw'),installedBays:(s.bays||[]).filter(b=>b.room).length,powerOutput,powerDraw:draw,powerBalance:Math.round((powerOutput-draw)*10)/10,powerCeiling:t.powerCeiling,slots:t.slots,slotCount:inst.length,batteryWh:battery.wh||0,storage:storage.capacity||0,dataGeneration,downlink,dataGap:dataGeneration-downlink,shield: num(byId(DATA.parts.shielding,s.parts?.shielding),'level'),reliability:num(byId(DATA.parts.computer,s.parts?.computer),'reliability'),hasThermal:has('thermal_ir'),hasCamera:has('visible_cam'),hasRadar:has('radar'),hasNeutron:has('neutron'),hasIce:has('radar')||has('neutron'),hasProbe:has('probe'),hasMap:has('visible_cam')||has('radar')||has('altimeter'),hasRTG:p.id==='rtg',auto:s.parts?.computer==='computer_auto',relay:(s.parts?.redundancy||[]).includes('relay'),thermalActive:s.parts?.thermal!=='thermal_passive',precise:s.parts?.pointing==='point_precision',fuelBonus:num(byId(DATA.parts.fuel,s.parts?.fuel),'fuel'),targetOrbit:!!mission&&s.orbitId===mission.orbit};
 const cap=launcher.capacity[s.orbitId]||0;
 const issues=[];
 const check=(severity,text,learn)=>issues.push({severity,text,learn});
 if((s.bays||[]).length>MAX_BAYS)check('hard',`Only ${MAX_BAYS} modular bays can be installed.`,'Remove a bay.');
 if((s.bays||[]).filter(b=>!b.room).length)check('warning','One or more empty bays have no module installed.','Fit a room or remove the empty bay; it will not be walkable.');
 if(JSON.stringify(allBayInstruments(s.bays))!==JSON.stringify(s.parts?.instruments||[]))check('hard','Instrument list is out of sync with installed bays.','Use the modular hangar to configure instruments.');
 if(inst.length>t.slots)check('hard',`${inst.length} sensors cannot fit in ${t.slots} instrument slots.`,'Choose a larger spacecraft or remove instruments.');
 for(const b of s.bays||[]){const mod=byModule(b.room);if((b.instruments||[]).length>(mod?.slots||0) || (b.instruments||[]).some(id=>!mod?.accepts.includes(id)))check('hard','An instrument is installed in an incompatible bay.','Choose a compatible instrument bay.');}
 if(mass>cap)check('hard',`${mass} kg is heavier than this launch vehicle’s ${cap} kg game limit for this destination.`,'Choose a stronger launcher or lighter equipment.');
 if(!cap)check('hard','This launcher cannot reach the chosen destination in this game.','Choose a launcher with a nonzero destination capacity.');
 if(draw>t.powerCeiling)check('hard',`Your equipment asks for ${draw} W, but this spacecraft can handle at most ${t.powerCeiling} W.`,'Choose a bigger spacecraft or lower-power equipment.');
 if(cost>num(mission,'budgetCap'))check('warning',`Cost $${cost}M is over your $${mission?.budgetCap}M game budget.`,'In real missions, money can stop development. Here you may still try launching with a lower starting condition.');
 if(powerOutput<draw)check('warning',`Your equipment asks for ${draw} W, but the generator makes only ${powerOutput} W near the destination.`,'Batteries can bridge short gaps, but cannot make up a permanent power shortfall.');
 if(powerOutput===0)check('warning','No useful electricity is reaching the spacecraft.','Sunlight at Neptune is too weak for these example solar arrays.');
 if(!metrics.targetOrbit)check('warning',`This orbit is not suited to the selected destination or mission goal.`,'The spacecraft can launch, but it may never reach its intended target.');
 if(s.parts?.comms==='comms_large'&&!metrics.precise)check('warning','The large radio dish needs accurate spacecraft pointing.','Add precision pointing in the Navigation room so the dish can stay aimed at Earth.');
 if(s.quality==='detail'&&!metrics.precise)check('warning','Fine-detail images need better camera pointing.','Choose precision pointing or use a less demanding picture mode.');
 if(metrics.dataGap>0)check('warning',`Sensors may create ${dataGeneration} data units per chapter, but radio can send only ${downlink}.`,'Choose more storage, better radio, or fewer data-hungry sensors.');
 if(s.missionId==='wildfire'&&!(s.bays||[]).some(b=>b.room==='observation'))check('warning','No Observation Bay: the wildfire camera needs a place to operate.','Install an Observation Bay.');
 if(s.missionId==='lunar'&&!(s.bays||[]).some(b=>['science-lab','observation'].includes(b.room)))check('warning','Add an Observation or Instrument Lab bay to operate lunar detectors.','Mission tasks happen inside the installed rooms.');
 if(s.missionId==='neptune'&&!(s.bays||[]).some(b=>b.room==='cargo'))check('warning','Neptune atmospheric probe needs a Probe / Payload Bay.','Install a Probe / Payload Bay before departure.');
 if(s.missionId==='neptune'&&!metrics.hasRTG)check('warning','A solar-only Neptune orbiter has too little power with this model.','An RTG works even in the dark.');
 if(s.missionId==='neptune'&&!metrics.auto)check('warning','At Neptune, radio messages take hours. A basic computer will struggle to act alone.','Plan automatic commands before critical events.');
 if(s.missionId==='wildfire'&&!metrics.hasThermal)check('warning','You have no heat camera to detect fire hot spots.','The mission can run, but cannot meet its main goal.');
 if(s.missionId==='lunar'&&!metrics.hasIce)check('warning','You have no sensor for searching for possible lunar ice.','A neutron detector looks for hydrogen; radar offers complementary clues.');
 if(s.missionId==='neptune'&&!metrics.hasProbe)check('warning','You did not pack the required atmosphere probe.','You cannot release equipment you did not bring.');
 return {metrics,issues,hard:issues.some(x=>x.severity==='hard'),launcher,mission,template:t,orbit};
}
export function requirements(s, run){
 const m=evaluate(s).metrics;
 const life=(run?.cycle||0)>=(s.missionId==='wildfire'?4:6)&&run?.health>0;
 const goals=s.missionId==='wildfire'?[['Carry a heat-sensing infrared camera',m.hasThermal],['Take two checked heat images',(run?.images||0)>=2],['Send a report to Earth',(run?.delivered||0)>=1],['Operate for the whole three-year simulation',life]]:s.missionId==='lunar'?[['Carry an ice-search instrument',m.hasIce],['Carry a surface-mapping instrument',m.hasMap],['Make a surface image/map',(run?.images||0)>=1],['Complete a hydrogen or ice-search scan',(run?.scans||0)>=1],['Complete the orbiting campaign',life]]:[['Bring a visible camera',m.hasCamera],['Bring an atmospheric probe',m.hasProbe],['Use a power source that works at Neptune',m.hasRTG],['Take a Neptune cloud picture',(run?.images||0)>=1],['Release the atmospheric probe',(run?.probes||0)>=1],['Finish the cruise and Neptune encounters',life]];
 return goals.map(([text,met])=>({text,met:!!met}));
}
export function newRun(s){
 const {metrics:m,issues}=evaluate(s);
 const powerPenalty=m.powerBalance<0?16:0;
 const warningsPenalty=issues.filter(x=>x.severity==='warning').length*2;
 return {cycle:0,battery:clamp((m.batteryWh>=3000?100:m.batteryWh>=1500?93:77)-powerPenalty),capacity:m.storage,health:clamp(100-warningsPenalty),fuel:clamp(90+(m.fuelBonus||0)/10),data:10,discoveries:0,images:0,scans:0,probes:0,delivered:0,actionsLeft:3,ended:false,reason:'',logs:[{type:'info',text:'Spacecraft started. Pick a room to complete tasks, then begin the first chapter.'}],photoHistory:[], choices:[], timeUsed:0};
}
export function updateRun(run,effects={},message,tag='info',details={}){
 if(!run)return run;
 let next={...run,logs:[...(run.logs||[])],photoHistory:[...(run.photoHistory||[])]};
 const keys={charge:'battery',health:'health',fuel:'fuel',data:'data',science:'discoveries',image:'images',probe:'probes',scan:'scans',delivered:'delivered'};
 for(const [k,v] of Object.entries(effects)){
  const dst=keys[k]||k;
  if(['battery','health','fuel','data','discoveries','images','probes','scans','delivered'].includes(dst))next[dst]=['battery','health','fuel'].includes(dst)?clamp((next[dst]||0)+v):Math.max(0,Math.round((next[dst]||0)+v));
 }
 if(next.data>(next.capacity||100)){next.health=clamp(next.health-5); next.data=next.capacity||100; next.logs.unshift({type:'bad',text:'The data vault overflowed. Some observations were lost. Choose more storage or send data earlier.'});}
 if(message)next.logs.unshift({type:tag,text:message});
 if(details.picture)next.photoHistory.unshift({label:details.picture,chapter:run.cycle+1,mission:details.mission,src:details.src||null});
 if(next.battery===0)next.health=clamp(next.health-15);
 if(next.health<=0){next.ended=true;next.reason='The spacecraft stopped working after taking too much damage.';}
 return next;
}
export function stepRun(run,s){
 const m=evaluate(s).metrics;
 const outputNow=s.missionId==='neptune'&&m.hasRTG?m.powerOutput*(1-0.02*Math.min(12,run.cycle*2)):m.powerOutput;
 const energyDiff=outputNow-m.powerDraw;
 // Game resources are percentages, not real spacecraft battery thermal or orbit simulation.
 const recharge=energyDiff>=0?3:-Math.min(15,5+Math.abs(energyDiff)/15);
 const eclipse=s.missionId==='neptune'?0:4;
 const batteryCost=clamp(recharge-eclipse-(m.batteryWh<1000?3:0)+(s.parts.batteryType==='battery_longlife'?1:0),-25,10);
 const storageIncrease=m.slotCount?Math.max(2,Math.round(m.dataGap/18)+5):2;
 let next=updateRun(run,{charge:batteryCost,fuel:-2,data:storageIncrease},'New chapter: regular operations use fuel, energy and storage.','info');
 if(next.battery<=15)next=updateRun(next,{health:-12},'Low battery stressed the equipment.','bad');
 return {...next,cycle:run.cycle+1,actionsLeft:3,timeUsed:run.timeUsed+1};
}
export function optionalGoals(s,run){
 const m=evaluate(s).metrics;const chosen=s.optional||[];
 return chosen.map(id=>({
  radar:{text:'Carry a radar for all-weather land mapping',met:m.hasRadar},
  data:{text:'Record no more data per chapter than the radio can send',met:m.dataGap<=0},
  relay:{text:'Carry a data relay for helping a partner',met:m.relay&&!!run?.choices?.some(x=>x.id==='partner_relay'&&x.passed)},
  autonomy:{text:'Use an autonomous computer for delayed commands',met:m.auto&&!!run?.choices?.some(x=>x.id==='comm_delay'&&x.passed)},
 }[id]||{text:id,met:false}));
}
export function finalScore(s,run){
 const goals=requirements(s,run); const done=goals.filter(x=>x.met).length;
 const max=goals.length;
 const reachedFull=run?.cycle===(s.missionId==='wildfire'?4:6);
 const survived=(run?.health||0)>0&&reachedFull;
 const success=survived&&done===max&&evaluate(s).metrics.targetOrbit;
 const points=Math.max(0,Math.round((run?.discoveries||0)+done*16+(survived?35:0)+((run?.health||0)/4)+(run?.delivered||0)*5));
 const optional=optionalGoals(s,run);const bonus=optional.filter(x=>x.met).length*12;return {goals,optional,done,max,survived,success,points:points+bonus};
}
export function instrumentLink(id,mission){
 const links={thermal_ir:'Detect heat and possible wildfires',visible_cam:'Take cloud, storm, or surface pictures',radar:'Map land through clouds or investigate crater surfaces',spectrometer:'Compare gases or materials',magnetometer:'Record a planet’s magnetic field',neutron:'Look for a hydrogen clue to possible lunar ice',probe:'Directly measure Neptune’s atmosphere during descent',altimeter:'Measure lunar terrain heights'};
 const tag={wildfire:['thermal_ir','visible_cam','radar'],lunar:['neutron','radar','visible_cam','altimeter'],neptune:['visible_cam','probe','magnetometer','spectrometer']};
 return `${links[id]||'Collect useful measurements'}${tag[mission]?.includes(id)?' · USEFUL HERE':' · EXTRA STUDY'}`;
}
export const sampleSources=[
 ['Neptune Facts','https://science.nasa.gov/neptune/neptune-facts/'],
 ['Voyager 2','https://science.nasa.gov/mission/voyager/planetary-voyage/'],
 ['LRO Spacecraft and Instruments','https://science.nasa.gov/mission/lro/spacecraft-and-instruments/'],
 ['Lunar Polar Shadows','https://science.nasa.gov/resource/shadows-near-the-moons-south-pole/'],
 ['NASA FIRMS','https://firms.modaps.eosdis.nasa.gov/'],
];
