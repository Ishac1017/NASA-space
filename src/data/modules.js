/** Modular hangar. Educational mass/power/cost examples, not NASA hardware specs.
 * Art: user-provided Moonbound visual kit. The module list also drives Phaser rooms. */
export const MIN_BAYS=3, MAX_BAYS=10;
export const MODULES=[
 {id:'flight-deck',name:'Flight Deck',purpose:'Navigation computers and planned spacecraft commands.',mass:23,cost:9,draw:9,art:'flight-deck',cap:'control',slots:0,accepts:[]},
 {id:'observation',name:'Observation',purpose:'Aim cameras, thermal sensors and mapping equipment.',mass:24,cost:10,draw:10,art:'observation',cap:'observation',slots:2,accepts:['thermal_ir','visible_cam','radar','altimeter','spectrometer']},
 {id:'science-lab',name:'Instrument Lab',purpose:'Run detectors that measure hydrogen, gases and magnetic fields.',mass:29,cost:11,draw:12,art:'science-lab',cap:'sensors',slots:2,accepts:['neutron','spectrometer','magnetometer','altimeter','thermal_ir']},
 {id:'communications',name:'Communications',purpose:'Point the radio antenna and send important data to Earth.',mass:22,cost:10,draw:9,art:'communications',cap:'comms',slots:0,accepts:[]},
 {id:'power-bay',name:'Power Bay',purpose:'Manage electricity, batteries and solar/RTG output.',mass:25,cost:8,draw:5,art:'life-support',cap:'power',slots:0,accepts:[]},
 {id:'data-vault',name:'Data Vault',purpose:'Store observations until a downlink window.',mass:21,cost:7,draw:5,art:'cargo',cap:'vault',slots:0,accepts:[]},
 {id:'thermal-bay',name:'Thermal Control',purpose:'Run heaters, insulation and temperature controls.',mass:20,cost:7,draw:4,art:'airlock',cap:'thermal',slots:0,accepts:[]},
 {id:'engine-room',name:'Engine Room',purpose:'Use onboard fuel for route adjustments and arrival burns.',mass:30,cost:10,draw:5,art:'engine',cap:'engine',slots:0,accepts:[]},
 {id:'cargo',name:'Probe / Payload Bay',purpose:'Store and deploy a single-use atmospheric probe.',mass:27,cost:10,draw:4,art:'cargo',cap:'probe',slots:1,accepts:['probe']},
 {id:'navigation',name:'Navigation Bay',purpose:'Control spacecraft pointing and star tracking.',mass:19,cost:7,draw:7,art:'flight-deck',cap:'control',slots:0,accepts:[]},
 {id:'life-support',name:'Life Support',purpose:'Optional crew air and water systems.',mass:29,cost:12,draw:15,art:'life-support',cap:'power',slots:0,accepts:[]},
 {id:'airlock',name:'Airlock',purpose:'Optional crew access to outside equipment.',mass:29,cost:10,draw:5,art:'airlock',cap:'thermal',slots:0,accepts:[]},
 {id:'crew-quarters',name:'Crew Quarters',purpose:'Optional living space for a crewed mission.',mass:25,cost:9,draw:8,art:'crew-quarters',cap:'control',slots:0,accepts:[]},
 {id:'galley',name:'Galley',purpose:'Optional food-preparation area for crew.',mass:20,cost:7,draw:7,art:'galley',cap:'power',slots:0,accepts:[]},
 {id:'medical',name:'Medical',purpose:'Optional emergency-care station for crew.',mass:17,cost:7,draw:5,art:'medical',cap:'control',slots:0,accepts:[]},
 {id:'exercise',name:'Exercise',purpose:'Optional exercise area for a crew.',mass:19,cost:6,draw:5,art:'exercise',cap:'control',slots:0,accepts:[]},
 {id:'hygiene',name:'Hygiene',purpose:'Optional crew hygiene equipment.',mass:17,cost:6,draw:4,art:'hygiene',cap:'thermal',slots:0,accepts:[]},
];
export const byModule=id=>MODULES.find(m=>m.id===id);
export const INSTRUMENT_ROOMS=Object.fromEntries(['thermal_ir','visible_cam','radar','spectrometer','magnetometer','neutron','probe','altimeter'].map(id=>[id,MODULES.filter(x=>x.accepts.includes(id)).map(x=>x.id)]));
const presets={
 wildfire:[['flight-deck'],['observation','thermal_ir','visible_cam'],['science-lab'],['power-bay'],['communications'],['data-vault'],['engine-room']],
 lunar:[['flight-deck'],['observation','visible_cam'],['science-lab','neutron'],['communications'],['power-bay'],['thermal-bay'],['data-vault'],['engine-room']],
 neptune:[['flight-deck'],['observation','visible_cam'],['science-lab','magnetometer'],['cargo','probe'],['communications'],['power-bay'],['thermal-bay'],['engine-room'],['data-vault']]
};
export function starterBays(mission){return (presets[mission]||presets.wildfire).map(([room,...instruments])=>({room,instruments}));}
export function allBayInstruments(bays){return (bays||[]).flatMap(b=>b?.instruments||[])}
export function normalizeBays(bays,mission='wildfire'){
 const initial=Array.isArray(bays)&&bays.length?bays:starterBays(mission);
 const seen=new Set();return initial.slice(0,MAX_BAYS).map(item=>{const m=byModule(item?.room);const ins=[];for(const id of item?.instruments||[])if(m?.accepts.includes(id)&&!seen.has(id)&&ins.length<m.slots){seen.add(id);ins.push(id)}return {room:m?.id||null,instruments:ins}});
}
export function placeCompatible(bays,id){const found=bays.findIndex(b=>byModule(b.room)?.accepts.includes(id)&&(b.instruments||[]).length<(byModule(b.room)?.slots||0));return found}
