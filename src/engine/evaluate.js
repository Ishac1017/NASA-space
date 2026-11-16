import { DATA, byId } from '../data';
const sum=(xs,k)=>xs.reduce((v,x)=>v+(x[k]||0),0);
export function evaluate(state){
 const P=DATA.parts, tpl=byId(P.templates,state.templateId)||{baseMass:0,baseCost:0,slots:0,powerCeiling:0};
 const inst=state.parts.instruments.map(id=>byId(P.instruments,id)).filter(Boolean);
 const cats=['battery','power','comms','shielding','storage','computer','thermal','propulsion','pointing','fuel','batteryType'];
 const chosen=cats.map(c=>byId(P[c],state.parts[c])||{}), all=[...inst,...chosen,...(state.parts.redundancy||[]).map(id=>byId(P.redundancy,id)).filter(Boolean)];
 const pick=c=>byId(P[c],state.parts[c])||{};
 const power=pick('power'),comms=pick('comms'),shield=pick('shielding'),battery=pick('battery'),storage=pick('storage');
 const mission=byId(DATA.missions,state.missionId),launcher=byId(DATA.launchers,state.launcherId)||{cost:0};
 const solarFactor=state.missionId==='neptune'?1/900:state.missionId==='lunar'?1:1;
 const rawOutput=(power.output||0)*(power.id==='rtg'?1:solarFactor);
 const powerOutput=Math.min(rawOutput,tpl.powerCeiling), powerDraw=sum(all,'draw');
 const has=id=>inst.some(i=>i.id===id)?1:0;
 const metrics={mass:tpl.baseMass+sum(all,'mass'),cost:tpl.baseCost+sum(all,'cost'),totalCost:tpl.baseCost+sum(all,'cost')+launcher.cost,powerOutput:Math.round(powerOutput*10)/10,powerDraw,powerMargin:powerOutput>0?Math.round(100*(powerOutput-powerDraw)/powerOutput):-100,dataPerLap:sum(inst,'data')*10,downlinkPerLap:(comms.downlink||0)*15,dataBalance:(comms.downlink||0)*15-sum(inst,'data')*10,storageCap:storage.capacity||0,batteryWh:battery.wh||0,shielding:shield.level||0,scienceValue:sum(inst,'science'),instrumentCount:inst.length,slots:tpl.slots,hasRadar:has('radar'),hasThermal:has('thermal_ir'),hasCamera:has('visible_cam'),hasProbe:has('probe'),hasIce:has('neutron')||has('radar')?1:0,hasMapping:has('visible_cam')||has('radar')||has('altimeter')?1:0,hasRTG:power.id==='rtg'?1:0,hasAutonomy:state.parts.computer==='computer_auto'?1:0,hasRelay:(state.parts.redundancy||[]).includes('relay')?1:0,thermalQuality:state.parts.thermal==='thermal_passive'?0:1,lifetime:state.run?.lap||0};
 const ops={'>=':(a,b)=>a>=b,'<=':(a,b)=>a<=b,'==':(a,b)=>a===b};
 const reqs=mission?[...mission.baseRequirements,...mission.optionalRequirements.filter(r=>state.optional.includes(r.id))]:[];
 return {metrics,requirements:reqs.map(r=>({...r,actual:metrics[r.metric],pass:ops[r.op](metrics[r.metric],r.value)}))};
}
