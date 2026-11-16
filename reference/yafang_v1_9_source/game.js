/* MOONBOUND / Space Mission Web V1.9 Edition
 * Preserves the user-provided V1.8 static / itch.io implementation.
 * No frameworks, build step, or server needed. Works as a static web page.
 * NASA/JPL orbital elements are published approximate coefficients (1800–2050).
 * NASA SLS Block 1 stage mass/propellant/thrust/timing sourced from NASA.
 * Generic rockets, prices, events, trajectories and landings remain EDUCATIONAL.
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const A = name => `assets/${name}`;
const clamp=(v,a=0,b=100)=>Math.min(b,Math.max(a,v));
const fmt=(n,d=0)=>Number(n).toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});
const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const EARTH_R=6378.137, MU_E=398600.4418, MOON_R=1737.4, MOON_D=384400, MU_MOON=4902.8, MU_MARS=42828.37, MARS_R=3389.5;
const G0=9.80665, AU=149597870.7, MU_SUN=1.32712440018e11, J2PI=2*Math.PI;
const MS={
 Earth:{title:'Wildfire Sentinel',short:'Earth Wildfire Watch',description:'Launch a thermal-observation satellite, check fire hotspots and return urgent data to Earth.',goal:'Detect thermal anomalies and prioritize confirmed fire observations.',icon:'🌍',level:'BEGINNER',budget:290,required:'Thermal Imager',orbitTarget:535,defaultLauncher:'Light',defaultBus:'Small',modules:['observation','communications','cargo'],trip:'Earth orbit',funding:290},
 Moon:{title:'Lunar Ice Scout',short:'Lunar Ice Scout',description:'Reach lunar orbit to investigate potential water ice around the Moon’s south pole.',goal:'Compare polar observations while managing communication and eclipse constraints.',icon:'🌕',level:'INTERMEDIATE',budget:560,required:'Neutron Spectrometer',orbitTarget:535,defaultLauncher:'Heavy',defaultBus:'Medium',modules:['flight-deck','life-support','observation','communications'],trip:'Lunar transfer',funding:560},
 Mars:{title:'Mars Atmosphere Mapper',short:'Mars Atmosphere Mapper',description:'Design a robotic probe, transfer to Mars and investigate patterns in its atmosphere.',goal:'Reach Mars orbit and gather atmospheric observations before choosing an optional landing.',icon:'🔴',level:'ADVANCED',budget:680,required:'Atmospheric Camera',orbitTarget:535,defaultLauncher:'Super Heavy',defaultBus:'Medium',modules:['observation','science-lab','communications','cargo'],trip:'Interplanetary transfer',funding:680}
};
const BUSES={Small:{dry:1100,power:850,cost:30},Medium:{dry:2200,power:1550,cost:55},Large:{dry:4100,power:2800,cost:90}};
const INSTRUMENTS={'Thermal Imager':{mass:620,power:420,cost:36},'Neutron Spectrometer':{mass:520,power:310,cost:48},'Atmospheric Camera':{mass:710,power:490,cost:57},'Multispectral Camera':{mass:530,power:340,cost:40},'Radar Sensor':{mass:1300,power:1000,cost:88}};
const LAUNCHERS={Light:{scale:.72,payloadCap:7500,cost:80},Standard:{scale:1.25,payloadCap:17000,cost:115},Heavy:{scale:2.0,payloadCap:27000,cost:165},'Super Heavy':{scale:2.8,payloadCap:47000,cost:215},
 'NASA SLS Block 1':{realProfile:'sls',scale:1,payloadCap:95000,tliCap:27000,cost:210}};
// NASA SLS BLOCK 1 reference numbers. Approximate values from NASA's
// SLS Reference Guide (2022) and current official Core/Booster/ICPS facts.
// Units kg, N and seconds. The benchmark is real published hardware;
// the game's 2-D flight drawing and encounter scoring remain SIMULATIONS.
const NASA_SLS={
 source:'https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf',
 coreSource:'https://www.nasa.gov/reference/sls-space-launch-system-core-stage/',
 boosterSource:'https://www.nasa.gov/reference/sls-space-launch-system-solid-rocket-booster/',
 upperSource:'https://www.nasa.gov/reference/icps/',
 core:{dryKg:85275,propellantKg:(317000+1860000)*0.45359237,thrustN:4*416300*4.4482216153,burnSec:500,fuel:'LOX + LH2'},
 booster:{count:2,wetKg:726000,dryKg:99300,thrustN:14679000,burnSec:126,fuel:'PBAN solid'},
 upper:{wetKg:32700,dryKg:3700,thrustN:110000,burnSec:1080,fuel:'LOX + LH2'},
 leopayloadKg:95000,tliPayloadKg:27000,
};
NASA_SLS.booster.propellantKg=NASA_SLS.booster.wetKg-NASA_SLS.booster.dryKg;
NASA_SLS.upper.propellantKg=NASA_SLS.upper.wetKg-NASA_SLS.upper.dryKg;
function slsModel(payloadKg,fill){
 const r=NASA_SLS,cb=r.core,b=r.booster,u=r.upper;
 // At launch SRBs and RS-25s burn simultaneously. The boosters separate at
 // 126 seconds, core at 500 seconds, and ICPS follows; a three-event model.
 const totalPropB=b.count*b.propellantKg*fill,totalPropC=cb.propellantKg*fill,totalPropU=u.propellantKg*fill;
 const dryBoost=b.count*b.dryKg;
 const wetMass=payloadKg+dryBoost+cb.dryKg+u.dryKg+totalPropB+totalPropC+totalPropU;
 const burnBoostSec=b.burnSec*fill,burnCoreSec=cb.burnSec*fill,burnUpperSec=u.burnSec*fill;
 const flowB=b.count*b.propellantKg/b.burnSec,flowC=cb.propellantKg/cb.burnSec,flowU=u.propellantKg/u.burnSec;
 // Use the documented stage thrust and timing, with constant thrust/flow for
 // the ideal rocket equation. This is not an atmospheric 6-DOF SLS trajectory.
 const coreBurnDuringBoost=flowC*burnBoostSec;
 const mAfterMixedBurn=wetMass-totalPropB-coreBurnDuringBoost;
 const dvB=(b.count*b.thrustN+cb.thrustN)/(flowB+flowC)*Math.log(wetMass/mAfterMixedBurn);
 const afterSep=mAfterMixedBurn-dryBoost;
 const remainingCore=Math.max(0,totalPropC-coreBurnDuringBoost);
 const dvCore=cb.thrustN/flowC*Math.log(afterSep/(afterSep-remainingCore));
 const afterCoreSep=afterSep-remainingCore-cb.dryKg;
 const dvUpper=u.thrustN/flowU*Math.log(afterCoreSep/(afterCoreSep-totalPropU));
 return{profile:'nasa_sls',wetMass,boosterPropKg:totalPropB,corePropKg:totalPropC,upperPropKg:totalPropU,
  boosterBurnSec:burnBoostSec,coreBurnSec:burnCoreSec,upperBurnSec:burnUpperSec,
  idealDv:(dvB+dvCore)/1000,icpsDvPotential:dvUpper/1000,initialTwr:(b.count*b.thrustN+cb.thrustN)/(wetMass*G0),
  boosterDryKg:dryBoost,coreDryKg:cb.dryKg,upperDryKg:u.dryKg,
  source:'NASA reference hardware values; launch profile is an educational idealized model'};
}

const COMMS={Basic:{mass:95,power:90,cost:12,rate:50},'High-rate X-band':{mass:170,power:190,cost:28,rate:120}};
const TRANSFER={Earth:{fuel:0,dry:0,capture:0,cost:0,isp:355,ispCapture:355},Moon:{fuel:14500,dry:800,capture:4200,cost:80,isp:355,ispCapture:345},Mars:{fuel:25000,dry:1200,capture:9000,cost:120,isp:385,ispCapture:370}};
const MODULES={
 'flight-deck':['FLIGHT DECK','Guidance + onboard control',370,72,17],
 'life-support':['LIFE SUPPORT','Crew air and water',380,110,22],
 'galley':['GALLEY','Food and potable water',245,35,13],
 'crew-quarters':['CREW QUARTERS','Sleep systems',310,36,16],
 hygiene:['HYGIENE','Waste systems',215,20,13],
 exercise:['EXERCISE','Crew conditioning',260,40,15],
 medical:['MEDICAL','Medical preparedness',210,30,12],
 cargo:['CARGO','Secure payload storage',270,15,10],
 observation:['OBSERVATION','Cameras and targeting',330,98,28],
 'science-lab':['SCIENCE LAB','Instruments and analysis',360,120,32],
 communications:['COMMS','Antennas and computers',320,80,25],
 airlock:['AIRLOCK','Crew egress equipment',310,30,22]
};
// Fictional teaching rocket profile. Do not label these as NASA vehicle specs.

// Educational cargo transfer model. A unit is an item with illustrative mass.
// Before launch, the crew can load items from GROUND and move them through
// adjacent occupied bays. In-flight use is simplified and does not imply
// real astronaut transport through unpressurized rocket propulsion stages.
const SUPPLIES={
 battery:{label:'Backup power pack',mass:18,cost:3,icon:'🔋',hint:'In Flight Deck / Life Support: +8 electrical reserve during storm-safe mode.'},
 repair:{label:'Electronics spares',mass:12,cost:3,icon:'🛠',hint:'In Comms: reduces communication blackout penalties.'},
 science:{label:'Instrument calibration kit',mass:8,cost:2,icon:'🔬',hint:'In Observation / Science Lab: makes instrument calibration easier.'},
 provisions:{label:'Crew food & water pack',mass:16,cost:4,icon:'🥣',hint:'Crewed missions need at least one pack onboard.'}
};
const SUPPLY_KINDS=Object.keys(SUPPLIES);
const initialGroundStock=()=>({battery:2,repair:2,science:2,provisions:2});
function initialCabinCargo(rooms,crewed=0){
 const result=rooms.map(()=>({}));
 let home=rooms.indexOf('cargo');if(home<0)home=rooms.findIndex(Boolean);
 if(home>=0){result[home]={battery:1,repair:1,science:1};if(crewed)result[home].provisions=1;}
 return result;
}
function ensureCargo(b){
 if(!Array.isArray(b.cabinCargo)){b.cabinCargo=initialCabinCargo(b.rooms,b.crewed);}
 if(!b.groundStock||typeof b.groundStock!=='object'){b.groundStock=initialGroundStock();}
 while(b.cabinCargo.length<b.rooms.length)b.cabinCargo.push({});
 while(b.cabinCargo.length>b.rooms.length){
   const removed=b.cabinCargo.pop();for(const [key,n] of Object.entries(removed||{}))b.groundStock[key]=(b.groundStock[key]||0)+n;
 }
 for(let i=0;i<b.rooms.length;i++){
   b.cabinCargo[i]=b.cabinCargo[i]||{};
   for(const key of SUPPLY_KINDS)b.cabinCargo[i][key]=clamp(Math.floor(Number(b.cabinCargo[i][key])||0),0,999);
   if(!b.rooms[i]&&Object.values(b.cabinCargo[i]).some(Boolean)){
     for(const [key,n] of Object.entries(b.cabinCargo[i]))b.groundStock[key]=(b.groundStock[key]||0)+n;
     b.cabinCargo[i]={};
   }
 }
}
const cabinCapacity=k=>k==='cargo'?10:k==='galley'||k==='life-support'?5:k==='flight-deck'||k==='science-lab'?4:3;
const cargoUnits=obj=>Object.values(obj||{}).reduce((n,x)=>n+(Number(x)||0),0);
function cargoTotals(b=game.build){ensureCargo(b);const totals=Object.fromEntries(SUPPLY_KINDS.map(k=>[k,0]));
 for(let i=0;i<b.cabinCargo.length;i++)for(const k of SUPPLY_KINDS)totals[k]+=b.cabinCargo[i][k]||0;
 return totals;}
const hasCargo=(name,roomKeys)=>game.build.rooms.some((room,i)=>roomKeys.includes(room)&&((game.build.cabinCargo?.[i]?.[name]||0)>0));
let cargoUI={item:'repair',source:'GROUND',target:0};
let cargoLastMove='';
let cargoDrawerOpen=false;
let serviceDrawerOpen=true;
let referenceDrawerOpen=false;

function cargoManifest(){const b=game.build;ensureCargo(b);
 const totals=cargoTotals(b);
 const selectable=game.flight.status==='ready'||game.flight.status==='failed';
 const opts=SUPPLY_KINDS.map(k=>`<option value="${k}" ${k===cargoUI.item?'selected':''}>${SUPPLIES[k].icon} ${SUPPLIES[k].label}</option>`).join('');
 const fromOpts=`<option value="GROUND" ${cargoUI.source==='GROUND'?'selected':''}>GROUND STAGING LOCKER</option>`+
 b.rooms.map((r,i)=>r?`<option value="${i}" ${String(cargoUI.source)===String(i)?'selected':''}>BAY ${i+1} · ${MODULES[r][0]}</option>`:'').join('');
 const toOpts=b.rooms.map((r,i)=>r?`<option value="${i}" ${String(cargoUI.target)===String(i)?'selected':''}>BAY ${i+1} · ${MODULES[r][0]}</option>`:'').join('');
 const counts=b.rooms.map((r,i)=>`<div class="cargo-bay ${!r?'empty':''}" title="${r?MODULES[r][0]:'Empty bay'}">
 <b>0${i+1} · ${r?MODULES[r][0]:'EMPTY'}</b>
 ${r?`<small class="${cargoUnits(b.cabinCargo[i])>cabinCapacity(r)?'capacity-warning':''}">${cargoUnits(b.cabinCargo[i])} / ${cabinCapacity(r)} safe storage slots</small>
 <div class="cargo-item-grid">${SUPPLY_KINDS.map(k=>`<div class="cargo-item-row" title="${esc(SUPPLIES[k].hint)}"><span>${SUPPLIES[k].icon} ${esc(SUPPLIES[k].label)}</span><div class="cargo-stepper"><button type="button" aria-label="Remove ${esc(SUPPLIES[k].label)} from Bay ${i+1}" data-action="cargo-adjust" data-value="${i}:${k}:-1" ${!selectable?'disabled':''}>−</button><output>${b.cabinCargo[i][k]||0}</output><button type="button" aria-label="Add ${esc(SUPPLIES[k].label)} to Bay ${i+1}" data-action="cargo-adjust" data-value="${i}:${k}:1" ${!selectable?'disabled':''}>＋</button></div></div>`).join('')}</div>`:'<span>NO ROOM INSTALLED</span>'}
 </div>`).join('');
 return `<section class="cargo-transfer"><div class="cargo-heading"><div><span class="eyebrow">PRELAUNCH · CABIN LOGISTICS</span><h3>Edit each bay: add or remove any supply</h3></div>${tag('STOWAGE MODEL · GAME ASSUMPTIONS','lime')}</div>
 <div class="cargo-corridor" aria-label="Cabin logistics overview">${counts}</div>
 <div class="cargo-controls">
 <label>ITEM<select class="cargo-select" data-cargo="item">${opts}</select></label>
 <label>FROM<select class="cargo-select" data-cargo="source">${fromOpts}</select></label>
 <label>TO<select class="cargo-select" data-cargo="target">${toOpts}</select></label>
 <button class="btn btn-primary" data-action="move-cargo" ${!selectable?'disabled':''}>${cargoUI.source==='GROUND'?'LOAD 1 PACK':'TRANSFER 1 PACK'} →</button>
 </div>
 <div class="cargo-footnote">${esc(cargoLastMove||'Use the + / − buttons in any bay to change quantities freely in BUILD. Engineering checks flag overfilled bays; mass and cost update immediately. TRANSFER still moves packs one bay at a time.')}</div>
 <div class="cargo-summary">${SUPPLY_KINDS.map(k=>`<span>${SUPPLIES[k].icon} ${SUPPLIES[k].label}: <b>${totals[k]}</b></span>`).join('')}</div>
 <p class="muted tiny">Supply mass counts toward spacecraft payload. Loadout location can improve a solar alert, communication recovery, or science calibration. This is illustrative cargo management, not NASA inventory data.</p>
 </section>`;
}
function adjustCargo(bay,key,delta,inFlight=false){
 const b=game.build,f=game.flight;ensureCargo(b);
 if(!Number.isInteger(bay)||!b.rooms[bay]||!SUPPLIES[key]||![1,-1].includes(delta))return;
 if(inFlight){
  if(!['cruise','orbit'].includes(f.status)){setNotice('In-flight stock editing is available during cruise/orbit only.');return;}
  // Adding supplies in mid-flight is a learning sandbox tool, not a physical resupply.
 }else if(!['ready','failed'].includes(f.status)){setNotice('Modify the design before the launch countdown.');return;}
 const before=b.cabinCargo[bay][key]||0,after=clamp(before+delta,0,999);
 if(before===after)return;
 if(inFlight)f.practiceAdjusted=true;
 b.cabinCargo[bay][key]=after;
 const msg=`BAY ${bay+1}: ${SUPPLIES[key].label} ${before} → ${after}${inFlight?' · SANDBOX EDIT (not real resupply)':''}`;
 cargoLastMove=msg;
 if(inFlight){log(msg);setNotice(msg);render();}
 else{designChanged();setNotice(`${msg}. Payload mass and design feasibility recalculated.`);}
}
function moveCargo(){const b=game.build;ensureCargo(b);
 if(!['ready','failed'].includes(game.flight.status)){setNotice('Cargo is locked after launch countdown begins. Return to design for a new attempt.');return;}
 const key=cargoUI.item,source=cargoUI.source,to=Number(cargoUI.target);
 if(!SUPPLIES[key]||!Number.isInteger(to)||!b.rooms[to]){setNotice('Select an item and an installed destination bay.');return;}
 if(key==='provisions'&&!b.crewed){setNotice('Crew provisions are optional only in CREWED mode.');return;}
 const used=cargoUnits(b.cabinCargo[to]);if(used>=cabinCapacity(b.rooms[to])){setNotice('Destination bay is full. Choose a different bay or clear space.');return;}
 if(source==='GROUND'){
   if((b.groundStock[key]||0)<1){setNotice('No additional stock of that item remains in ground staging.');return;}
   b.groundStock[key]--;b.cabinCargo[to][key]=(b.cabinCargo[to][key]||0)+1;
   cargoLastMove=`GROUND → BAY ${to+1}: ${SUPPLIES[key].label} loaded (+${SUPPLIES[key].mass} kg)`;
 }else{
   const from=Number(source);
   if(!Number.isInteger(from)||!b.rooms[from]){setNotice('Select a valid occupied source bay.');return;}
   if(Math.abs(from-to)!==1){setNotice('Supply transfer requires adjacent occupied rooms connected by a hatch. Move one bay at a time.');return;}
   if((b.cabinCargo[from][key]||0)<1){setNotice('The selected source bay does not contain that supply item.');return;}
   b.cabinCargo[from][key]--;b.cabinCargo[to][key]=(b.cabinCargo[to][key]||0)+1;
   cargoLastMove=`BAY ${from+1} → BAY ${to+1}: ${SUPPLIES[key].label} transferred · payload mass unchanged`;
 }
 setNotice(cargoLastMove);designChanged();
}
const STAGES=[{dry:22000,fuel:340000,thrust:7600000,isp:300},{dry:5500,fuel:85000,thrust:900000,isp:340}];
// NASA/JPL Approximate Positions of the Major Planets, Table 1 (1800–2050).
// a [AU], e, I, L, varpi, Omega and rates per Julian century.
const JPL={
 Mercury:[[.38709927,.20563593,7.00497902,252.25032350,77.45779628,48.33076593],[.00000037,.00001906,-.00594749,149472.67411175,.16047689,-.12534081]],
 Venus:[[.72333566,.00677672,3.39467605,181.97909950,131.60246718,76.67984255],[.00000390,-.00004107,-.00078890,58517.81538729,.00268329,-.27769418]],
 Earth:[[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0],[.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0]],
 Mars:[[1.52371034,.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],[.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343]],
 Jupiter:[[5.20288700,.04838624,1.30439695,34.39644051,14.72847983,100.47390909],[-.00011607,-.00013253,-.00183714,3034.74612775,.21252668,.20469106]],
 Saturn:[[9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448],[-.00125060,-.00050991,.00193609,1222.49362201,-.41897216,-.28867794]],
 Uranus:[[19.18916464,.04725744,.77263783,313.23810451,170.95427630,74.01692503],[-.00196176,-.00004397,-.00242939,428.48202785,.40805281,.04240589]],
 Neptune:[[30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574],[.00026291,.00005105,.00035372,218.45945325,-.32241464,-.00508664]]
};
const PLANET_NAMES=['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];
const PLANET_COLORS={Mercury:'#c3cad4',Venus:'#f7d88a',Earth:'#66cdfc',Mars:'#f28c70',Jupiter:'#edbd85',Saturn:'#ecd4aa',Uranus:'#86eddf',Neptune:'#759aff'};
const PLANET_SIZES={Mercury:3.4,Venus:4.3,Earth:5,Mars:4.4,Jupiter:7.7,Saturn:7.4,Uranus:6.3,Neptune:6.3};

const rad=x=>x*Math.PI/180;
function jplPosition(body,date){
 const c=JPL[body];if(!c)return[0,0,0];
 const t=(+date-Date.UTC(2000,0,1,12))/(86400000*36525);
 const [a,e,inc,lon,peri,node]=c[0].map((v,i)=>v+t*c[1][i]);
 let M=rad(((lon-peri+180)%360+360)%360-180),E=M+e*Math.sin(M);
 for(let i=0;i<16;i++){let q=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=q;if(Math.abs(q)<1e-13)break;}
 let xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E);
 let [o,w,I]=[node,peri-node,inc].map(rad);
 let co=Math.cos(o),so=Math.sin(o),cw=Math.cos(w),sw=Math.sin(w),ci=Math.cos(I),si=Math.sin(I);
 return [(cw*co-sw*so*ci)*xp+(-sw*co-cw*so*ci)*yp,(cw*so+sw*co*ci)*xp+(-sw*so+cw*co*ci)*yp,(sw*si)*xp+(cw*si)*yp];
}
const norm=p=>Math.hypot(p[0],p[1],p[2]||0);
const angle=p=>Math.atan2(p[1],p[0]);
const wrapPi=x=>Math.atan2(Math.sin(x),Math.cos(x));
function marsWindow(){
 let now=new Date(Date.UTC(new Date().getUTCFullYear(),new Date().getUTCMonth(),new Date().getUTCDate()));
 let best={err:Infinity,when:now,days:258};
 for(let d=0;d<=960;d+=6){
   let start=new Date(+now+d*86400000);
   const ep=jplPosition('Earth',start),mp=jplPosition('Mars',new Date(+start+258*86400000));
   const a=(norm(ep)+norm(mp))/2;
   const days=Math.PI*Math.sqrt(Math.pow(a*AU,3)/MU_SUN)/86400;
   const mars=jplPosition('Mars',new Date(+start+days*86400000));
   const err=Math.abs(wrapPi(angle(mars)-angle(ep)-Math.PI));
   if(err<best.err)best={err,when:start,days,earth:ep,mars};
 }
 return best;
}
let windowCache=null;
function transferPlan(dest,orbitAltitude=535){
 if(dest==='Earth')return{days:0,dep:0,capture:0,correction:0,launchDate:new Date(),kind:'LEO'};
 if(dest==='Moon'){
  let r1=EARTH_R+orbitAltitude,r2=MOON_D,a=(r1+r2)/2;
  let dep=Math.sqrt(MU_E*(2/r1-1/a))-Math.sqrt(MU_E/r1);
  const days=Math.PI*Math.sqrt(a*a*a/MU_E)/86400;
  return{days,dep,capture:1.06,correction:.30,launchDate:new Date(),kind:'geocentric-ellipse',r1,r2,a,e:(r2-r1)/(r2+r1)};
 }
 if(!windowCache)windowCache=marsWindow();
 let w=windowCache;
 const r1=EARTH_R+orbitAltitude, rMars=MARS_R+300;
 const rEa=norm(w.earth)*AU,rMa=norm(w.mars)*AU,a=(rEa+rMa)/2;
 const vtrans=Math.sqrt(MU_SUN*(2/rEa-1/a)),vEarth=Math.sqrt(MU_SUN/rEa);
 const vinf=Math.abs(vtrans-vEarth);
 const dep=Math.sqrt(vinf*vinf+2*MU_E/r1)-Math.sqrt(MU_E/r1);
 const vmtrans=Math.sqrt(MU_SUN*(2/rMa-1/a)),vMars=Math.sqrt(MU_SUN/rMa);
 const vinfMars=Math.abs(vMars-vmtrans);
 const cap=Math.sqrt(vinfMars*vinfMars+2*MU_MARS/rMars)-Math.sqrt(MU_MARS/rMars);
 return{days:w.days,dep,capture:cap,correction:.22,launchDate:w.when,kind:'heliocentric-hohmann',earth:w.earth,mars:w.mars,a,e:(rMa-rEa)/(rMa+rEa)};
}
const stepNames=['MISSION','BUILD','REVIEW','FLIGHT','OPERATIONS','REPORT'];
const stepIDs=['mission','build','review','flight','operations','report'];
const roomFile=id=>A(id+'.webp');
function defaultBuild(dest){const m=MS[dest],rooms=m.modules.concat(Array(Math.max(0,4-m.modules.length)).fill(null));return{bus:m.defaultBus,launcher:m.defaultLauncher,instrument:m.required,comm:dest==='Earth'?'Basic':'High-rate X-band',fuel:100,battery:1,recorder:1,solar:1,shield:dest==='Earth'?0:1,crewed:0,heatshield:1,parachute:1,rooms,activeBay:0,cabinCargo:initialCabinCargo(rooms),groundStock:initialGroundStock()};}
function defaultFlight(){return{status:'ready',countdownRemaining:10,countdownCue:10,t:0,launchTime:0,stage:0,fuel1:100,fuel2:100,fuel3:100,mass:0,speed:0,alt:0,progress:0,days:0,correction:false,eventsSeen:[],activeEvent:null,resources:{power:88,health:92,comms:85,propellant:100,data:0},log:[],success:false,reason:'',scienceComplete:false,downlinked:false,landing:null,landingSite:null,landingMode:'auto',eventResult:'',paused:false,orbitalTime:0,stageFx:null,separated:false,boosterSeparated:false,coreSeparated:false,runId:null,launchEpochUTC:null,lastConsumablePeriod:0,practiceAdjusted:false};}
const game={mission:'Moon',roles:['Pilot','Scientist','Systems Engineer','Comms Officer'],step:'mission',visited:['mission'],build:defaultBuild('Moon'),quiz:{answers:{},submitted:false,score:0},flight:defaultFlight(),reviewNotes:'',noaa:null};
let lastTime=0,musicOn=false,currentTrack='',notice='Select a mission to begin.',modalOpen=false,frameNum=0,lastHudUpdate=0;
let activePlayerIndex=0, musicFade=null, fadeMix=1;
// Device-only profile support; no server authentication.

let solarOpen=false,solarPlaying=true,solarDayOffset=0,solarSpeed=1,solarScope='all',solarLastT=0;
function log(msg){let f=game.flight;f.log.unshift(msg);f.log=f.log.slice(0,35);}
function setNotice(text){notice=text;renderMessage();}
function renderMessage(){$('message').textContent=notice;}
function persist(){try{profileSave();renderProfileChip();}catch(e){setNotice('Browser storage unavailable; you can still play.');}}
function restore(){try{let saved=JSON.parse(localStorage.getItem('moonbound-web-v1'));if(!saved||!MS[saved.mission])return false;
Object.assign(game,saved);game.flight=Object.assign(defaultFlight(),saved.flight||{});game.build=Object.assign(defaultBuild(game.mission),saved.build||{});ensureCargo(game.build);game.quiz=Object.assign({answers:{},submitted:false,score:0},saved.quiz||{});return true;}catch{return false;}}
function reset(){if(!confirm('Start a new mission? Your current progress will be cleared.'))return;solarDayOffset=0;solarSpeed=1;solarPlaying=true;localStorage.removeItem('moonbound-web-v1');game.mission='Moon';game.roles=['Pilot','Scientist','Systems Engineer','Comms Officer'];game.build=defaultBuild('Moon');game.step='mission';game.visited=['mission'];game.quiz={answers:{},submitted:false,score:0};game.flight=defaultFlight();game.reviewNotes='';setNotice('New mission ready.');render();}
function activateStep(id){if(!stepIDs.includes(id))return;if(['flight','operations','report'].includes(id)&&!game.visited.includes(id))return;game.step=id;if(!game.visited.includes(id))game.visited.push(id);render();}
function go(id){game.step=id;if(!game.visited.includes(id))game.visited.push(id);render();}
function setMission(id){if(!MS[id])return;solarDayOffset=0;solarSpeed=1;solarPlaying=true;cargoUI={item:'repair',source:'GROUND',target:0};cargoLastMove='';game.mission=id;game.build=defaultBuild(id);game.quiz={answers:{},submitted:false,score:0};game.flight=defaultFlight();setNotice(`${MS[id].title} selected. Build your mission spacecraft next.`);render();}
function metrics(){
 let b=game.build,m=MS[game.mission],bus=BUSES[b.bus],launcher=LAUNCHERS[b.launcher],inst=INSTRUMENTS[b.instrument],comm=COMMS[b.comm],tr=TRANSFER[game.mission];
 ensureCargo(b);let mods=b.rooms.filter(Boolean);
 let moduleMass=mods.reduce((s,r)=>s+MODULES[r][2],0),modulePower=mods.reduce((s,r)=>s+MODULES[r][3],0),moduleCost=mods.reduce((s,r)=>s+MODULES[r][4],0);
 let extraMass=b.battery*170+b.solar*125+b.recorder*80+b.shield*240+(b.heatshield?210:0)+(b.parachute?135:0);
 let supplyTotals=cargoTotals(b);let supplyMass=SUPPLY_KINDS.reduce((n,k)=>n+supplyTotals[k]*SUPPLIES[k].mass,0);let supplyCost=SUPPLY_KINDS.reduce((n,k)=>n+supplyTotals[k]*SUPPLIES[k].cost,0);
 let vehicleMass=bus.dry+inst.mass+comm.mass+moduleMass+extraMass+supplyMass;
 let payload=vehicleMass+tr.capture+tr.dry+(launcher.realProfile==='sls'?0:tr.fuel);
 let powerUsed=inst.power+comm.power+modulePower;
 let powerCap=bus.power+b.battery*300+b.solar*320;
 let cost=bus.cost+inst.cost+comm.cost+moduleCost+launcher.cost+tr.cost+b.battery*8+b.solar*10+b.recorder*6+b.shield*12+b.heatshield*6+b.parachute*4+supplyCost;
 let stage0=STAGES[0],stage1=STAGES[1],scale=launcher.scale,fill=b.fuel/100;
 let f1,f2,d1,d2,initialMass,idealDv,twr,burn1Sec,burn2Sec,realRocket=null;
 const requiredDv=9.12+(m.orbitTarget-390)*.00020; // educational GENERIC rocket threshold; not a certified SLS criterion
 if(launcher.realProfile==='sls'){
   realRocket=slsModel(payload,fill);
   f1=realRocket.boosterPropKg;
   f2=realRocket.corePropKg;
   d1=realRocket.boosterDryKg;
   d2=realRocket.coreDryKg;
   initialMass=realRocket.wetMass;
   idealDv=realRocket.idealDv;
   twr=realRocket.initialTwr;
   burn1Sec=realRocket.boosterBurnSec;
   burn2Sec=realRocket.coreBurnSec-realRocket.boosterBurnSec;
 }else{
   f1=stage0.fuel*scale*fill;f2=stage1.fuel*scale*fill;
   d1=stage0.dry*scale;d2=stage1.dry*scale;
   initialMass=payload+f1+f2+d1+d2;
   idealDv=(stage0.isp*G0*Math.log(initialMass/(initialMass-f1))+
          stage1.isp*G0*Math.log((payload+d2+f2)/(payload+d2)))/1000;
   twr=stage0.thrust*scale/(initialMass*G0);
   burn1Sec=f1/(stage0.thrust*scale/(stage0.isp*G0));
   burn2Sec=f2/(stage1.thrust*scale/(stage1.isp*G0));
 }
 let missionModuleReq=b.crewed?['flight-deck','life-support','cargo']:[];
 let issues=[];
 if(inst!==INSTRUMENTS[m.required])issues.push('Selected science instrument does not satisfy the mission objective.');
 if(payload>launcher.payloadCap)issues.push(`Payload exceeds ${b.launcher} capacity by ${fmt(payload-launcher.payloadCap)} kg.`);
 if(realRocket&&game.mission!=='Earth'&&payload>NASA_SLS.tliPayloadKg)
  issues.push(`SLS Block 1 NASA TLI reference payload limit ≈${fmt(NASA_SLS.tliPayloadKg)} kg; this design is heavier.`);
 if(powerUsed>powerCap)issues.push('Power demand exceeds generation and battery capacity.');
 if(cost>m.budget)issues.push('Design exceeds mission budget.');
 if(twr<1.05)issues.push('Initial thrust-to-weight ratio is too low for liftoff.');
 if(!realRocket && idealDv<requiredDv)issues.push(`Ideal Δv is too low for the selected Earth parking orbit (${idealDv.toFixed(2)} km/s).`);
 for(let r of missionModuleReq)if(!b.rooms.includes(r))issues.push(`Crewed flight requires a ${MODULES[r][0]} module.`);
 if(b.crewed&&!supplyTotals.provisions)issues.push('Crewed flight requires at least one crew food/water pack in a cabin.');
 for(let i=0;i<b.rooms.length;i++)if(b.rooms[i]&&cargoUnits(b.cabinCargo[i])>cabinCapacity(b.rooms[i]))issues.push(`Bay ${i+1} exceeds its ${cabinCapacity(b.rooms[i])}-pack safe stowage allowance; redistribute or remove supplies.`);
 if(game.mission!=='Earth'&&b.recorder===0)issues.push('Deep-space science mission requires onboard data recording.');
 let warnings=[];
 if(b.shield===0&&game.mission!=='Earth')warnings.push('No radiation protection: solar-event damage will be greater.');
 if(b.battery===0)warnings.push('No battery reserve for eclipses or storm-safe mode.');
 if(b.solar===0&&game.mission!=='Earth')warnings.push('No supplementary solar generation during transfer.');
 if(game.mission==='Mars'&&!b.heatshield)warnings.push('Mars surface landing requires an entry heat shield in the landing trainer.');
 if(game.mission==='Mars'&&!b.parachute)warnings.push('Mars surface landing trainer needs a parachute plus powered descent.');
 const plan=transferPlan(game.mission,m.orbitTarget);
 // Check idealized impulsive transfer-burn reserves separately from launch performance.
 if(game.mission!=='Earth'){
  let mass=vehicleMass+tr.capture+tr.fuel+tr.dry;
  let needs=mass*(1-Math.exp(-plan.dep*1000/(tr.isp*G0)));
  if(realRocket){
    const usable=realRocket.upperPropKg;
    const massSls=payload+NASA_SLS.upper.dryKg+usable;
    const effectiveExhaustVelocity=NASA_SLS.upper.thrustN/(NASA_SLS.upper.propellantKg/NASA_SLS.upper.burnSec);
    const needSls=massSls*(1-Math.exp(-plan.dep*1000/effectiveExhaustVelocity));
    if(needSls>usable)issues.push('NASA SLS ICPS propellant is insufficient for the departure maneuver in this simplified model.');
  }else if(needs>tr.fuel)issues.push('Transfer-stage propellant cannot provide required departure Δv.');
  let captureMass=vehicleMass+tr.capture;
  let captureNeed=captureMass*(1-Math.exp(-(plan.capture+plan.correction)*1000/(tr.ispCapture*G0)));
  if(captureNeed>tr.capture)issues.push('Arrival capture + correction reserve is insufficient.');
 }
 return{payload,vehicleMass,moduleMass,supplyMass,supplyTotals,usedPower:powerUsed,powerCap,cost,budget:m.budget,twr,idealDv,requiredDv,issues,warnings,capacity:launcher.payloadCap,launchMass:initialMass,burn1Sec,burn2Sec,fuelStage1:f1,fuelStage2:f2,realRocket,plan};
}
// NASA spacecraft and mission measurements for comparison, not arbitrary
// player spacecraft components and not live telemetry.
const NASA_MISSION_BENCHMARK={
 Earth:{title:'LANDSAT 9 · EARTH OBSERVATION',facts:[['705 km','Observed mission orbit altitude'],['98.2°','Orbital inclination'],['99 min','Orbital period'],['OLI / TIRS','Science instruments']],url:'https://science.nasa.gov/mission/landsat-9/'},
 Moon:{title:'ORION · LUNAR MISSION',facts:[['11 kW','4 solar array power generation'],['4 arrays','European service module'],['7,250 kg','Artemis I usable spacecraft propellant reference']],url:'https://www.nasa.gov/reference/avionics-and-software/',url2:'https://www.nasa.gov/wp-content/uploads/2023/05/artemis-i-reference-guide-inter.pdf'},
 Mars:{title:'PERSEVERANCE · MARS ROBOTICS',facts:[['1,025 kg','Rover mass'],['110 W','MMRTG nominal electrical output'],['59 kg','Science instrument mass']],url:'https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/quick_facts/'}
};
function missionReferenceCard(){
 const x=NASA_MISSION_BENCHMARK[game.mission];
 return `<div class="real-data-card"><div class="eyebrow">REAL NASA SCIENCE MISSION · COMPARISON</div><h3>${esc(x.title)}</h3><div class="real-data-grid">${x.facts.map(p=>`<div><strong>${p[0]}</strong><small>${p[1]}</small></div>`).join('')}</div>
 <p class="muted tiny">Published data from a *different* real spacecraft for scientific comparison. These values are NOT automatically assigned to your custom mission.</p><p class="muted tiny"><a href="${x.url}" target="_blank" rel="noopener">Official mission reference</a>${x.url2?` · <a href="${x.url2}" target="_blank" rel="noopener">Orion reference guide</a>`:''}</p></div>`;
}
function nasaReferenceCard(m){
 const r=NASA_SLS,rr=m.realRocket;
 const intro=rr?`<b>${tag('NASA REFERENCE HARDWARE ACTIVE','good')}</b> Documented SLS stage masses, propellant and thrust feed the model's fuel depletion, separation, liftoff mass and idealized Δv / T/W. The ICPS is reserved for departure.`:
 'These are official NASA values for comparison; your selected generic launcher uses invented teaching parameters. Select “NASA SLS Block 1” to enable reference hardware.';
 return `<div class="real-data-card"><div class="eyebrow">NASA SLS BLOCK 1 · SOURCE-VERIFIED HARDWARE</div>
 <p class="small">${intro}</p>
 <div class="real-data-grid">
 <div><strong>${fmt(r.booster.count*r.booster.propellantKg/1000)} t</strong><small>2 SRBs · solid propellant (derived)</small></div>
 <div><strong>${fmt(r.core.propellantKg/1000)} t</strong><small>Core LOX + LH₂ propellant</small></div>
 <div><strong>${fmt(r.upper.propellantKg/1000)} t</strong><small>ICPS LOX + LH₂ propellant</small></div>
 <div><strong>${fmt((r.booster.count*r.booster.thrustN+r.core.thrustN)/1e6,2)} MN</strong><small>Combined launch thrust (derived)</small></div>
 <div><strong>126 s / 500 s</strong><small>Booster / core nominal burn</small></div>
 <div><strong>95 t / 27 t</strong><small>LEO / TLI payload reference</small></div>
 </div>
 <p class="muted tiny">NASA SLS Reference Guide and NASA stage fact sheets. The documented parameters are <b>reference hardware</b>; the game's ideal Δv, scripted altitude, costs and outcomes remain <b>educational approximations</b> — not NASA flight telemetry.</p>
 <p class="muted tiny"><a href="${r.source}" target="_blank" rel="noopener">NASA SLS reference guide</a> · <a href="${r.coreSource}" target="_blank" rel="noopener">Core</a> · <a href="${r.boosterSource}" target="_blank" rel="noopener">Boosters</a> · <a href="${r.upperSource}" target="_blank" rel="noopener">ICPS</a></p></div>`;
}
function actualFlightData(m){
 if(!m.realRocket)return `<div class="hint">Fuel and mass for the selected generic launcher are <b>educational game inputs</b>, not a real rocket specification.</div>`;
 const f=game.flight,r=m.realRocket,sl=NASA_SLS;
 return `<div class="real-flight"><div class="eyebrow">NASA SLS HARDWARE REFERENCE · SIMULATED BURN</div>
 ${resourceBar('SRB propellant',Math.round(r.boosterPropKg*f.fuel1/100),Math.round(r.boosterPropKg), 'good',' kg')}
 ${resourceBar('Core LH₂ + LOX',Math.round(r.corePropKg*f.fuel2/100),Math.round(r.corePropKg), 'good',' kg')}
 ${resourceBar('ICPS LH₂ + LOX',Math.round(r.upperPropKg*f.fuel3/100),Math.round(r.upperPropKg), 'good',' kg')}
 <p class="small">Modeled remaining mass: <b>${fmt(Math.max(0,f.status==='ready'?r.wetMass:f.mass))} kg</b> · Launch mass: <b>${fmt(r.wetMass)} kg</b></p>
 <p class="muted tiny">The boosters and core burn during ascent; ICPS fuel is retained for transfer injection. Mass drawdown uses constant-flow assumptions; trajectories remain teaching approximations.</p></div>`;
}
function resourceBar(label,value,max,color='good',suffix=''){let ratio=clamp(value/max*100);return `<div class="value-bar"><div class="value-head"><span>${esc(label)}</span><span>${fmt(value)}${suffix} / ${fmt(max)}${suffix}</span></div><div class="meter ${color}"><span style="width:${ratio}%"></span></div></div>`;}
function htmlPanel(title,body,extra=''){return `<section class="panel ${extra}"><div class="panel-title">${title}</div><div class="panel-body">${body}</div></section>`;}
function btn(text,act,value='',classes='btn-ghost',disabled=false){return `<button class="btn ${classes}" data-action="${act}" data-value="${esc(value)}" ${disabled?'disabled':''}>${text}</button>`;}
function tag(t,k=''){return `<span class="tag ${k}">${t}</span>`;}
function summaryTile(label,v){return `<div class="summary-tile"><strong>${v}</strong><small>${label}</small></div>`;}
function imageRoom(r){return `<img class="room-img" src="${r?roomFile(r):A('bay-frame.webp')}" alt="${r?MODULES[r][0]:'Empty bay'}">`;}
function navbar(){let active=stepIDs.indexOf(game.step),contents=stepNames.map((name,i)=>{
const id=stepIDs[i],done=game.visited.includes(id)&&i<active,locked=i>2&&!game.visited.includes(id);
return `<button class="step ${id===game.step?'active':''} ${done?'done':''}" data-action="nav" data-value="${id}" ${locked?'disabled':''}><span class="step-no">${done?'✓':i+1}</span>${name}</button>`;}).join('');$('progress').innerHTML=contents;}
function trackForStep(){if(game.flight.activeEvent)return'event';if(game.step==='mission'||game.step==='build'||game.step==='review')return'design';if(game.step==='report')return'orbit';if(game.step==='operations')return game.flight.landing&&game.flight.landing.status==='descending'?'landing':'orbit';if(game.step==='flight'){if(game.flight.status==='countdown'||game.flight.status==='ascent')return'launch';if(game.flight.status==='cruise')return'cruise';return'orbit';}return'design';}
function musicPlayers(){return [$('music-player'),$('music-player-secondary')];}
function musicVolume(){return Math.min(0.50,Number($('volume-slider').value)/100)*0.65;}
function chooseTrack(){
 const next=trackForStep();if(currentTrack===next)return;currentTrack=next;
 const players=musicPlayers();const target=A(`classical_${next}.mp3`);
 if(!musicOn){
   if(musicFade){clearInterval(musicFade);musicFade=null;}
   players.forEach((x,i)=>{x.pause();x.volume=i===0?musicVolume():0;});
   activePlayerIndex=0;players[0].src=target;return;
 }
 if(musicFade){clearInterval(musicFade);musicFade=null;}
 const old=players[activePlayerIndex],incoming=players[1-activePlayerIndex];
 incoming.pause();incoming.src=target;incoming.volume=0;
 incoming.play().then(()=>{
  let n=0;musicFade=setInterval(()=>{
    n=Math.min(1,n+.09);const s=n*n*(3-2*n);
    incoming.volume=musicVolume()*s;old.volume=musicVolume()*(1-s);
    if(n>=1){clearInterval(musicFade);musicFade=null;old.pause();activePlayerIndex=1-activePlayerIndex;}
  },60);
 }).catch(()=>{musicOn=false;players.forEach(x=>x.pause());updateMusicButton();setNotice('Browser blocked audio. Click MUSIC to start again.');});
}

function updateMusicButton(){$('music-toggle').innerText=musicOn?'♫ MUSIC ON':'♫ MUSIC OFF';$('music-toggle').setAttribute('aria-pressed',String(musicOn));}
function render(){
  if(game.step==='flight'){const panel=document.querySelector('.flight-service');if(panel)serviceDrawerOpen=panel.open;}
  if(game.step==='build'){
    const cargo=document.getElementById('cargo-accordion');
    const refs=document.getElementById('reference-accordion');
    if(cargo)cargoDrawerOpen=cargo.open;
    if(refs)referenceDrawerOpen=refs.open;
  }
  const previousReviewScroll=game.step==='review'
    ? Array.from(document.querySelectorAll('.review-scroll'),pane=>pane.scrollTop) : null;
  document.body.classList.toggle('review-mode',game.step==='review');
  navbar();renderMessage();
  switch(game.step){case'mission':$('view').innerHTML=renderMission();break;case'build':$('view').innerHTML=renderBuild();break;case'review':$('view').innerHTML=renderReview();break;case'flight':$('view').innerHTML=renderFlight();break;case'operations':$('view').innerHTML=renderOperations();break;case'report':$('view').innerHTML=renderReport();break;}
  if(game.step==='review' && previousReviewScroll?.length){
    document.querySelectorAll('.review-scroll').forEach((pane,i)=>{
      if(previousReviewScroll[i]!==undefined)pane.scrollTop=previousReviewScroll[i];
    });
  }
  renderProfileChip();if(signedInProfile){try{profileSave(true);}catch(_e){}}chooseTrack();
}
function renderMission(){
const cards=Object.entries(MS).map(([k,m],i)=>`<article class="mission-card ${k===game.mission?'selected':''}">
<div class="mission-cover"><img src="${A('mission_crop'+i+'.png')}" alt="${esc(m.title)} mission art: ${esc(m.trip)}" loading="eager"></div>
<div class="mission-body"><div class="meta"><span class="mission-emoji">${m.icon}</span>${tag(m.level,k===game.mission?'lime':'')}${tag(m.trip)}</div>
<h3>${m.title}</h3><p class="mission-desc">${m.description}</p><div class="divider"></div>
<div class="small"><span class="eyebrow">SCIENCE GOAL</span><p>${m.goal}</p></div>
${btn(k===game.mission?'✓ SELECTED':'CHOOSE MISSION','choose-mission',k,k===game.mission?'btn-primary btn-block':'btn-teal btn-block')}</div></article>`).join('');
const roles=game.roles.map((r,i)=>`<button class="role-chip" data-action="role" data-value="${i}"><strong>PLAYER ${i+1}</strong>${esc(r)} ↻</button>`).join('');
return `<div class="stack">
<div style="display:flex;align-items:end;justify-content:space-between;gap:12px"><div><div class="eyebrow">STEP 01 / CONTRACT BOARD</div><h1 style="font-size:28px;margin:6px 0">Choose your mission</h1><div class="muted small">Three science missions, three different sets of engineering constraints.</div></div>${tag('SOLO OR LOCAL 4-ROLE PLAY','lime')}</div>
<div class="cards">${cards}</div>
${htmlPanel('TEAM · CHOOSE FOUR ROLES',`<div class="roles-grid">${roles}</div><p class="muted small">Roles coordinate decisions on the same device. Real-time multiplayer is not implemented in this web prototype.</p><div class="hero-cta"><span class="small muted">Chosen: <b style="color:#dfff9c">${MS[game.mission].title}</b></span>${btn('CONTINUE TO SPACECRAFT BUILDER →','next-build','','btn-primary btn-lg')}</div>`)}</div>`;
}
function selector(label,field,options,selected,help=''){return `<div class="selector-block"><div class="selector-label">${label}</div><div class="choice-row">${options.map(o=>`<button class="choice ${o===selected?'selected':''}" data-action="set-field" data-field="${field}" data-value="${esc(o)}">${esc(o)}</button>`).join('')}</div>${help?`<div class="muted tiny">${help}</div>`:''}</div>`;}
function bayInspector(){
 const b=game.build,i=b.activeBay,roomKey=b.rooms[i],supplies=b.cabinCargo?.[i]||{};
 const data=roomKey?MODULES[roomKey]:null;
 const items=Object.entries(supplies).filter(([,n])=>n>0).map(([k,n])=>`${SUPPLIES[k]?.icon||'•'} ${SUPPLIES[k]?.label||k} × ${n}`);
 const capacity=roomKey?cabinCapacity(roomKey):0;
 return `<div class="bay-inspector" aria-live="polite">
  <div class="bay-inspector-image">${roomKey?`<img src="${roomFile(roomKey)}" alt="${esc(data[0])} equipment bay">`:'<span class="empty-bay-icon">+</span>'}</div>
  <div class="bay-inspector-content"><span class="eyebrow">SELECTED BAY ${i+1} OF ${b.rooms.length}</span>
    <strong>${roomKey?esc(data[0]):'EMPTY COMPARTMENT'}</strong>
    <p>${roomKey?esc(data[1]):'Choose a room from the smaller catalogue to install a module in this bay.'}</p>
    <div class="bay-inspector-chips"><span>${roomKey?`${fmt(data[2])} kg · ${fmt(data[3])} W`:'Ready to install'}</span><span>${roomKey?`${cargoUnits(supplies)} / ${capacity} storage slots`:'No cargo allowed'}</span></div>
    ${roomKey?`<small>${items.length?'Onboard: '+esc(items.join(' · ')):'No supplies currently stored here. Use CABIN LOGISTICS to load or move supplies.'}</small>`:''}
  </div>
 </div>`;
}
function renderBuild(){
const b=game.build,m=metrics(),maxBays=b.rooms.length;
const fieldControls=selector('SPACECRAFT BUS SIZE','bus',Object.keys(BUSES),b.bus,'Capacity, dry mass and budget differ by size.')+
selector('LAUNCH VEHICLE','launcher',Object.keys(LAUNCHERS),b.launcher,'NASA SLS uses published hardware values; other vehicles are fictional educational configurations.')+
selector('SCIENTIFIC INSTRUMENT','instrument',Object.keys(INSTRUMENTS),b.instrument,`Mission needs: ${MS[game.mission].required}`)+
selector('GROUND / DEEP-SPACE COMMUNICATIONS','comm',Object.keys(COMMS),b.comm)+
selector('PROPELLANT LOAD','fuel',['65','80','90','100'],String(b.fuel),`Loaded propellant: ${b.fuel}% of launcher tanks.`)+
selector('CREW CONFIGURATION','crewed',['UNCREWED','CREWED'],b.crewed?'CREWED':'UNCREWED','Crewed mode requires Flight Deck, Life Support and Cargo modules.');
const hardware=['battery','solar','recorder','shield'].map(k=>{let label={battery:'BATTERY RESERVE',solar:'SOLAR PANELS',recorder:'DATA RECORDER',shield:'RADIATION SHIELDING'}[k];return `<div class="site-card" style="margin-bottom:8px"><span>${label}</span><div class="choice-row">${btn('−','quantity',`${k}:-1`,'btn-ghost btn-sm')}${tag(b[k],'lime')}${btn('+','quantity',`${k}:1`,'btn-ghost btn-sm')}</div></div>`;}).join('');
const ship=b.rooms.map((r,i)=>`<button title="Bay ${i+1}: ${r?MODULES[r][0]:'Empty'}" class="ship-bay ${i===b.activeBay?'active':''}" data-action="bay" data-value="${i}">${b.solar>0&&i===0?`<img class="wing" src="${A('solar-wing.webp')}" alt="Solar wing">`:''}${imageRoom(r)}<div class="bay-name">${r?esc(MODULES[r][0]):`EMPTY BAY ${i+1}`}</div></button>`).join('');
const catalog=Object.keys(MODULES).map(k=>`<button class="room-card ${b.rooms[b.activeBay]===k?'selected':''}" title="${esc(MODULES[k][1])}" data-action="set-room" data-value="${k}"><img src="${roomFile(k)}" loading="lazy" alt="${esc(MODULES[k][0])}"><span>${MODULES[k][0]}</span><small>${fmt(MODULES[k][2])} kg</small></button>`).join('');
const options= htmlPanel('SPACECRAFT CONFIGURATION',fieldControls+`<div class="divider"></div><div class="eyebrow">ADDITIONAL HARDWARE</div><div style="height:10px"></div>${hardware}
<div class="selector-label">LANDING EQUIPMENT (FOR OPTIONAL DESCENT)</div><div class="choice-row" style="margin-top:7px">${btn(b.heatshield?'✓ HEAT SHIELD':'HEAT SHIELD OFF','toggle','heatshield',b.heatshield?'btn-primary btn-sm':'btn-ghost btn-sm')}${btn(b.parachute?'✓ PARACHUTE':'PARACHUTE OFF','toggle','parachute',b.parachute?'btn-primary btn-sm':'btn-ghost btn-sm')}</div>`, '');
const middle=htmlPanel('MODULAR ASSEMBLY HANGAR',`<div class="ship-stage"><div class="ship-toolbar"><div><b style="color:var(--cyan)">${MS[game.mission].title.toUpperCase()}</b><div class="muted tiny">USER-SUPPLIED MOONBOUND ART • CONCEPTUAL MODULES</div></div><div class="choice-row">${tag('SELECT BAY + FIT ROOM','lime')}${btn('⛶ FULL SHIP','ship-preview','','btn-ghost btn-sm')}</div></div>
<div class="ship-viewport"><div class="ship-row" style="--bay-count:${maxBays}"><img class="ship-end nose" src="${A('nose.webp')}" alt="Nose cap">${ship}<img class="ship-end engine" src="${A('engine.webp')}" alt="Engine cap"></div></div><div class="hangar-caption">COMPLETE SHIP · NO HORIZONTAL CROP · SELECT A BAY TO INSPECT</div></div>
${bayInspector()}
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:10px 0 8px"><div class="eyebrow">ROOMS · SELECT A BAY THEN A MODULE</div><div class="choice-row">${btn('CLEAR BAY','clear-bay','','btn-ghost btn-sm')}${btn('＋ BAY','add-bay','','btn-ghost btn-sm',maxBays>=6)}${btn('− BAY','remove-bay','','btn-ghost btn-sm',maxBays<=3)}</div></div>
<div class="room-catalog">${catalog}</div>
<details class="build-accordion" id="cargo-accordion" ${cargoDrawerOpen?'open':''}><summary><span>📦 CABIN LOGISTICS <small>Load / transfer supplies between connected rooms</small></span><span class="accordion-side">${cargoDrawerOpen?'HIDE':'OPEN'} · ${Object.values(cargoTotals(b)).reduce((a,n)=>a+n,0)} PACKS</span></summary>${cargoManifest()}</details>
<div class="hint" style="margin-top:10px">These are stylized module illustrations, not verified flight hardware. Mass, electrical and financial effects are educational game assumptions.</div>`, '');
let constraints=m.issues.map(s=>`<div class="check-row"><span class="check-icon bad">✕</span><span>${esc(s)}</span></div>`).join('')||`<div class="check-row"><span class="check-icon">✓</span><span>All preliminary engineering constraints pass.</span></div>`;
const right=htmlPanel('MISSION ENGINEERING READINESS',`<div style="display:flex;justify-content:space-between;align-items:center">${tag(m.issues.length?'NEEDS REVISION':'READY TO REVIEW',m.issues.length?'bad':'good')}${tag(MS[game.mission].level)}</div>
<div style="height:14px"></div>${resourceBar('Payload',Math.round(m.payload),m.capacity,m.payload>m.capacity?'bad':'good',' kg')}${resourceBar('Electrical draw',Math.round(m.usedPower),m.powerCap,m.usedPower>m.powerCap?'bad':'good',' W')}${resourceBar('Budget',Math.round(m.cost),m.budget,m.cost>m.budget?'bad':'good',' cr')}
<div class="chip-summary">${summaryTile('IDEAL Δv',m.idealDv.toFixed(2)+' km/s')}${summaryTile('T / W',m.twr.toFixed(2))}${summaryTile('PARKING ORBIT',MS[game.mission].orbitTarget+' km')}</div><div class="divider"></div><div class="eyebrow">ENGINEERING CHECKLIST</div><div style="height:8px"></div><div class="check-list">${constraints}</div>
${m.warnings.length?`<div class="hint notice-warn" style="margin-top:12px">${m.warnings.map(esc).join('<br>')}</div>`:''}<details class="build-accordion reference-accordion" id="reference-accordion" ${referenceDrawerOpen?'open':''}><summary>📚 NASA SOURCE DATA <span class="accordion-side">${referenceDrawerOpen?'HIDE':'OPEN'} · VERIFIED REFERENCES</span></summary>${nasaReferenceCard(m)}${missionReferenceCard()}</details>
<div class="divider"></div>${btn('CONTINUE → PDR / CDR','next-review','','btn-primary btn-lg btn-block')}
<p class="muted tiny">Engineering issues are shown before launch, but you can still attempt a launch after the knowledge review. Real physics limits govern the outcome.</p>`);
return `<div class="view-grid builder-page">${options}${middle}${right}</div>`;
}
function questions(){let b=game.build,m=MS[game.mission];const set = [
 {q:`Why is the ${b.launcher} launcher checked against your total spacecraft payload?`,options:['Mass affects propulsion and orbit insertion.','Launch cost alone determines the rocket trajectory.','Extra equipment makes fuel unnecessary.','The launcher size has no effect.'],correct:0,explain:'Added payload changes initial mass, thrust-to-weight ratio and achievable ideal Δv.'},
 {q:`Which science instrument best fits the ${m.title} objective?`,options:[m.required,'No sensor is needed.','Any instrument works equally well.','A larger antenna is a replacement for a sensor.'],correct:0,explain:'A scientific requirement determines the necessary measurement type.'},
 {q:game.mission==='Earth'?'What is the purpose of the target Earth parking orbit?':game.mission==='Moon'?'Why do we need a trans-lunar injection burn?':'Why must a Mars transfer launch account for where Mars will be later?',options:game.mission==='Earth'?['To maintain repeated Earth observation passes.','To fly in a straight line through the atmosphere.','To eliminate the need for communications.','To generate propellant.']:game.mission==='Moon'?['To raise the Earth-centered transfer apogee toward the Moon.','To stop gravity from acting.','To enter the lunar atmosphere.','To keep the rocket on the pad.']:['The planet moves during the months of travel.','Mars stops while a rocket is in flight.','Earth and Mars always align on every date.','Distance is unimportant for transfer trajectories.'],correct:0,explain:'Orbital transfer timing and velocity matter; simply choosing a destination is not enough.'},
 {q:game.mission==='Earth'?'What should a wildfire monitoring mission do when its data queue is full?':game.mission==='Moon'?'How should the spacecraft respond when the Moon blocks the direct Earth radio link?':'What is a reasonable action during a hypothetical deep-space solar particle event?',options:game.mission==='Earth'?['Prioritize urgent verified observations for downlink.','Discard every observation without review.','Ignore storage limitations.','Transmit with no ground contact.']:game.mission==='Moon'?['Store observations until geometry permits communication.','Increase transmitter power until the Moon becomes transparent.','Assume a permanent radio link.','Turn off the onboard recorder forever.']:['Enter a protective safe mode while monitoring systems.','Assume solar particles cannot affect spacecraft.','Disable every backup system permanently.','Use the camera as a radiation shield.'],correct:0,explain:'Flight operations balance scientific goals with limited data, energy, protection and communication.'}
];
 const rotations=[2,0,3,1];
 return set.map((item,i)=>{let r=rotations[i];let opts=item.options.slice(r).concat(item.options.slice(0,r));return {...item,options:opts,correct:(item.correct+item.options.length-r)%item.options.length};});
}
function renderReview(){let m=metrics(),q=questions(),quiz=game.quiz,feedback=quiz.submitted?`<div class="hint notice-good"><b>Knowledge score: ${quiz.score}/100</b> — this is independent of spacecraft feasibility. Correct answers do not guarantee a successful launch.</div>`:`<div class="hint">Choose one of four answers for each question. This checks your understanding, not your launch permit.</div>`;
const qs=q.map((it,i)=>`<article class="question-block"><h3>0${i+1} · ${esc(it.q)}</h3><div class="quiz-options">${it.options.map((opt,j)=>`<button class="quiz-option ${quiz.answers[i]===j?'selected':''} ${quiz.submitted&&j===it.correct?'correct':''} ${quiz.submitted&&quiz.answers[i]===j&&j!==it.correct?'wrong':''}" data-action="answer" data-value="${i}:${j}" ${quiz.submitted?'disabled':''}><b>${'ABCD'[j]}.</b> ${esc(opt)}</button>`).join('')}</div>${quiz.submitted?`<div class="quiz-feedback">✓ ${esc(it.explain)}</div>`:''}</article>`).join('');
let rows=m.issues.map(e=>`<div class="check-row"><span class="check-icon bad">!</span><span>${esc(e)}</span></div>`).join('')||'<div class="check-row"><span class="check-icon">✓</span><span>Design passes the educational engineering checks.</span></div>';
return `<div class="view-grid two review-page"><div class="stack review-scroll" role="region" aria-label="Prelaunch knowledge questions; scroll to see all four"><div class="review-scroll-note">↕ SCROLL IN THIS PANEL TO SEE ALL 4 QUESTIONS + GRADE ANSWERS</div>${htmlPanel('PDR / CDR · PRELAUNCH DESIGN REVIEW',`<div class="eyebrow">KNOWLEDGE ASSESSMENT</div><h2 class="section-title" style="margin-top:8px">Defend your engineering choices</h2><div class="review-answers">${qs}</div><div class="divider"></div>${feedback}<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:12px">${!quiz.submitted?btn('GRADE ANSWERS','submit-quiz','','btn-primary btn-lg'):tag('KNOWLEDGE REVIEW COMPLETE','good')}${btn('REVISE DESIGN','nav','build','btn-ghost btn-lg')}</div>`)}</div>
<div class="stack review-scroll" role="region" aria-label="Engineering feasibility and launch authorization">${htmlPanel('FLIGHT READINESS · PHYSICAL FEASIBILITY',`<div class="chip-summary">${summaryTile('LAUNCH IDEAL Δv',m.idealDv.toFixed(2)+' km/s')}${summaryTile('REQUIRED (EST.)',m.requiredDv.toFixed(2)+' km/s')}${summaryTile('T/W',m.twr.toFixed(2))}</div><div class="divider"></div><div class="eyebrow">ENGINEERING CONSTRAINTS</div><div class="check-list" style="margin-top:10px">${rows}</div><div class="hint ${m.issues.length?'notice-warn':'notice-good'}" style="margin-top:12px">${m.issues.length?'This design is likely to be rejected or fail a simulated launch. You may still attempt it, or revise the components.':'Preliminary checks pass. Launch performance and operational decisions still determine whether the mission succeeds.'}</div>`) }
${htmlPanel('LAUNCH AUTHORIZATION',`<p class="lead">${quiz.submitted?'The prelaunch knowledge review has been submitted.':'Finish the four-question review before moving to launch.'}</p>${btn('ATTEMPT LAUNCH →','authorize-launch','','btn-primary btn-lg btn-block',!quiz.submitted)}<p class="muted small">Quiz answers never change the spacecraft’s calculated mass, power or propulsion. An engineering failure may cause a launch abort.</p>`)}</div></div>`;
}
const EVENT_TYPES={
 solar:{name:'SOLAR PARTICLE ALERT',desc:'A simulated burst of energetic solar particles is approaching the spacecraft. Protect electronics and power systems.',choices:[['ENTER SAFE MODE','Reduce exposure, but temporarily suspend science.',{power:-10,health:-2}],['CONTINUE FULL SCIENCE','Keep collecting data, accepting higher electronics risk.',{power:-5,health:-33,data:8}],['REDUCE INSTRUMENT LOAD','Preserve some science while moderating risk.',{power:-7,health:-11,data:3}]]},
 comms:{name:'COMMUNICATION INTERRUPTION',desc:'The planned communications window is disrupted. Autonomous operation and data storage may preserve mission information.',choices:[['STORE DATA FOR LATER','Wait for another line-of-sight opportunity.',{power:-5,comms:9}],['RETRY AT HIGH POWER','Repeated transmissions strain the power system.',{power:-19,comms:-20}],['USE AUTONOMOUS PLAN','Preloaded commands preserve the operating timeline.',{power:-9,comms:-3}]]},
 navigation:{name:'MIDCOURSE NAVIGATION',desc:'A small mismatch in the planned encounter geometry requires a course-correction decision.',choices:[['EXECUTE TARGETING BURN','Apply a planned correction with propellant cost.',{propellant:-28}],['SKIP COURSE CORRECTION','Save fuel but accept a possible target miss.',{propellant:0}],['HALF-SIZE CORRECTION','Spend less fuel, but leave substantial targeting error.',{propellant:-14}]]},
 ground:{name:'EARTH · GROUND-STATION OUTAGE',desc:'A scheduled Earth-orbit downlink window is unavailable. Your wildfire data queue is growing.',choices:[['STORE AND PRIORITIZE','Retain verified urgent data for the next contact.',{power:-4,data:8,comms:4}],['RETRANSMIT CONTINUOUSLY','Drain the transmitter and risk packet loss.',{power:-22,comms:-13}],['SUSPEND OBSERVATIONS','Protect resources but miss a target window.',{power:9,data:-12}]]},
 eclipse:{name:'MOON · LONG ECLIPSE',desc:'The lunar spacecraft moves into a shadowed observing geometry. Batteries and thermal loads need attention.',choices:[['CONSERVE POWER','Pause nonessential instruments until solar exposure returns.',{power:6,data:-5}],['CONTINUE FULL POWER','Gather observations while accepting a deep battery draw.',{power:-24,data:12}],['SCHEDULE SHORT OBSERVATIONS','Use limited science windows with moderate battery demand.',{power:-9,data:8}]]},
 thermal:{name:'MARS · THERMAL CONTROL',desc:'The deep-space probe enters a demanding Mars observation period. Maintain safe instrument temperatures.',choices:[['TURN ON HEATERS','Spend electrical reserve to protect sensitive instruments.',{power:-13,health:7}],['DISABLE THERMAL CONTROL','Keep power but expose electronics to cold.',{power:7,health:-26}],['DUTY CYCLE INSTRUMENTS','Alternate science activity and heaters.',{power:-5,health:3,data:5}]]}
};
// Staging events are explicit in the flight timeline. The sequence remains
// visible after separation so players can review what actually detached.
function flightPhases(){
 const sls=game.build.launcher==='NASA SLS Block 1';
 if(sls)return game.mission==='Earth'?['SRB + CORE','SRB SEP','CORE BURN','CORE SEP','PAYLOAD']:['SRB + CORE','SRB SEP','CORE BURN','CORE SEP','PARKING','ICPS TLI','TRANSFER','TARGET ORBIT'];
 return game.mission==='Earth'?['STAGE 1','STAGE 1 SEP','STAGE 2','PAYLOAD']:['STAGE 1','STAGE 1 SEP','STAGE 2','PARKING','TRANSFER','TARGET ORBIT'];
}
function flightPhaseIndex(){
 const f=game.flight,fx=f.stageFx && f.stageFx.age < 3.8 ? f.stageFx:null;
 const sls=game.build.launcher==='NASA SLS Block 1';
 if(f.status==='ready'||f.status==='countdown'||f.status==='failed')return 0;
 if(sls){
  if(f.status==='ascent')return fx&&fx.type==='boosters'?1:(f.stage===0?0:2);
  if(f.status==='parking')return fx&&fx.type==='core'?3:4;
  if(f.status==='cruise')return 6;
  return game.mission==='Earth'?4:7;
 }
 if(f.status==='ascent')return fx&&fx.type==='first-stage'?1:(f.stage===0?0:2);
 if(f.status==='parking')return 3;
 if(f.status==='cruise')return 4;
 return game.mission==='Earth'?3:5;
}
function stagingReadout(){
 const f=game.flight,m=metrics(),sls=!!m.realRocket,active=f.status==='ascent';
 const completed=['parking','cruise','orbit'].includes(f.status);
 const items=sls?[
  ['SRB + CORE IGNITION','Solid boosters and liquid core burn together.',active&&f.stage===0,active&&f.stage>=1||completed],
  ['SRB SEPARATION','Discard both exhausted booster structures.',active&&f.stage===1&&!!f.stageFx&&f.stageFx.age<3.8,!!f.boosterSeparated],
  ['CORE STAGE BURN','The liquid core continues accelerating.',active&&f.stage===1,completed],
  ['CORE SEPARATION','Core dry mass is discarded.',false,!!f.coreSeparated],
  ['ICPS / PAYLOAD','Upper stage reserved for transfer; deploy payload.',completed,completed]
 ]:[
  ['STAGE 1 IGNITION','First-stage engine burns propellant.',active&&f.stage===0,active&&f.stage>=1||completed],
  ['MECO + SEPARATION','First stage is discarded; dry mass drops.',false,!!f.separated],
  ['STAGE 2 IGNITION','Upper-stage engine completes orbital injection.',active&&f.stage===1,completed],
  ['SECO + DEPLOYMENT','Upper stage shuts down and payload is deployed.',completed,completed]
 ];
 const current=f.status==='countdown'?'T−'+Math.ceil(f.countdownRemaining)+' · PRELAUNCH CHECKS':active?(sls?(f.stage===0?'SRB + CORE':'CORE STAGE'):(f.stage===0?'FIRST STAGE':'UPPER STAGE')):completed?'PAYLOAD / COAST':'AWAITING IGNITION';
 const fx=f.stageFx&&f.stageFx.age<4.8?`<div class="stage-event-live">⚡ ${esc(f.stageFx.label)}</div>`:'';
 return `<div class="staging-panel"><div class="staging-title">🚀 LIVE STAGING SEQUENCE</div><div class="staging-current">${current} <span>${f.mass?fmt(f.mass)+' kg':'READY'}</span></div>${fx}<div class="staging-rows">${items.map(([name,desc,on,done],i)=>`<div class="staging-row ${on?'burning':done?'completed':''}"><span class="staging-node">${done?'✓':on?'●':i+1}</span><div><b>${name}</b><small>${desc}</small></div></div>`).join('')}</div><p class="muted tiny">Mass and propellant are calculated in an educational staging model. SLS stage reference parameters use NASA published values.</p></div>`;
}

function flightMainButton(){let f=game.flight;
 if(f.activeEvent)return `<div class="hint notice-warn">Resolve the visible ${EVENT_TYPES[f.activeEvent].name} event before continuing.</div>`;
 if(f.status==='countdown')return `<div class="countdown-banner"><div class="countdown-big">T−${Math.ceil(f.countdownRemaining)}</div><strong>SYSTEMS GO · FINAL PRELAUNCH CHECK</strong><p>Guidance / battery / radio / secured supplies · illustrative countdown</p></div>${btn('HOLD COUNTDOWN','cancel-countdown','','btn-ghost btn-block')}`;
 if(f.status==='ready')return btn('🚀 START 10-SECOND COUNTDOWN','ignite','','btn-primary btn-lg btn-block',!game.quiz.submitted);
 if(f.status==='ascent')return `<div class="hint notice-warn">${game.build.launcher==='NASA SLS Block 1'?'SLS: boosters and core ignite together, then separate before the ICPS departure stage.':'Two-stage rocket: first stage burns and separates, followed by upper-stage ignition.'} Propellant and mass decrease as each stage burns.</div>${btn(f.paused?'▶ RESUME ASCENT':'❚❚ PAUSE ASCENT','toggle-ascent-pause','','btn-ghost btn-sm btn-block')}`;
 if(f.status==='parking')return game.mission==='Earth'?btn('GO TO SCIENCE OPERATIONS →','to-ops','','btn-primary btn-lg btn-block'):btn(`BEGIN ${game.mission.toUpperCase()} TRANSFER →`,'begin-transfer','','btn-primary btn-lg btn-block');
 if(f.status==='cruise')return f.activeEvent?`<div class="hint notice-warn">⚠ Cruise paused. Select an event response in the flight scene.</div>`:`<div class="hint">Transfer in progress. The spacecraft follows a simplified computed trajectory.</div>`;
 if(f.status==='orbit')return btn(game.mission==='Earth'?'OPEN SCIENCE OPERATIONS →':`OPEN ${game.mission.toUpperCase()} SCIENCE / LANDING →`,'to-ops','','btn-primary btn-lg btn-block');
 return `<div class="hint notice-bad">${esc(f.reason||'Mission ended without reaching the target orbit.')}</div>${btn('POST-MISSION DEBRIEF →','to-report','','btn-primary btn-lg btn-block')}${btn('REVISE SPACECRAFT ↩','nav','build','btn-teal btn-lg btn-block')}`;
}
function renderFlight(){let m=metrics(),f=game.flight,route=m.plan,mission=MS[game.mission];
const data=f.status==='countdown'?`T−${Math.ceil(f.countdownRemaining)}s · PRELAUNCH CHECKS`:f.status==='ascent'?`${m.realRocket?['SRB + CORE','CORE'][f.stage]||'CORE':'STAGE '+(f.stage+1)} · T+${fmt(f.launchTime)}s`:f.status==='cruise'?`DAY ${f.days.toFixed(1)} / ${route.days.toFixed(1)}`:f.status==='orbit'?`DESTINATION ORBIT CONFIRMED`:f.status==='failed'?`MISSION NOT ACHIEVED`:'READY';
const event=f.activeEvent&&EVENT_TYPES[f.activeEvent];
const overlay=event?`<div class="event-overlay"><div class="eyebrow" style="color:#ffb57a">⚠ LIVE GAME EVENT · FLIGHT PAUSED</div><h3>${event.name}</h3><p>${event.desc}</p><div class="event-choice-row">${event.choices.map((c,i)=>btn(c[0],'event-choice',i,'btn-alert')).join('')}</div></div>`:'';
const left=htmlPanel('FLIGHT CONTROL',`<div class="eyebrow">${mission.title.toUpperCase()}</div><h2 class="section-title" style="margin:8px 0">${mission.icon} ${game.mission} Mission</h2>
${tag(f.status.toUpperCase(),f.status==='orbit'?'good':f.status==='failed'?'bad':'warn')}<div class="divider"></div>
<div class="small muted">${game.mission==='Mars'?`Planned Mars launch window: <b>${route.launchDate.toISOString().slice(0,10)} UTC</b>`:game.mission==='Moon'?`Earth–Moon transfer: ≈ ${route.days.toFixed(2)} days`:'Earth science orbit: 535 km target apogee'}</div>
<div style="height:14px"></div>${game.mission!=='Earth'?`<div class="transfer-steps" aria-label="${game.mission} transfer sequence"><strong>${game.mission.toUpperCase()} ROUTE</strong><span class="${['ready','ascent'].includes(f.status)?'current':''}">① Launch</span><span class="${f.status==='parking'?'current':''}">② Earth parking</span><span class="${f.status==='cruise'?'current':''}">③ Transfer + correction</span><span class="${f.status==='orbit'?'current':''}">④ ${game.mission} orbit</span><div class="muted tiny">${f.status==='ready'?'Design checked → begin the launch countdown.':f.status==='countdown'?'Prelaunch countdown running: verify systems, then watch ignition.':f.status==='ascent'?'Climb to the parking orbit before departure.':f.status==='parking'?'Parking orbit reached: click BEGIN '+game.mission.toUpperCase()+' TRANSFER below.':f.status==='cruise'?'Spacecraft currently on transfer trajectory; resolve each alert.':f.status==='orbit'?'Target orbit reached; proceed to science or landing.':'Transfer mission ended without orbital capture.'}</div></div>`:''}${flightMainButton()}<div class="divider"></div>
${btn('RETURN TO DESIGN','nav','build','btn-ghost btn-block')}
<div class="divider"></div><div class="eyebrow">MISSION LOG</div><div class="log" id="mission-log" style="margin-top:9px">${f.log.length?f.log.map(x=>'• '+esc(x)).join('<br>'):'No events yet.'}</div>`);
const right=htmlPanel('SPACECRAFT SYSTEMS',`<div class="eyebrow">${esc(data)}</div><div id="staging-readout">${stagingReadout()}</div><div class="divider"></div>
<div id="telemetry-meters" class="flight-meter-group">${flightMeters()}</div><div id="real-propellant-view">${actualFlightData(m)}</div>
<div class="divider"></div><div class="eyebrow">ORBITAL & TRANSFER PLAN</div>
<div class="stack small" style="gap:7px;margin-top:10px"><div>Parking orbit: <strong>${mission.orbitTarget} km (target apogee)</strong></div><div>Departure Δv (idealized): <strong>${fmt(route.dep,2)} km/s</strong></div><div>Capture Δv (idealized): <strong>${fmt(route.capture,2)} km/s</strong></div><div>Estimated launch ideal Δv: <strong>${fmt(m.idealDv,2)} km/s</strong></div></div>
<div class="hint" style="margin-top:15px">JPL approximate planet positions inform the Mars launch window. SLS reference hardware figures come from NASA, but SLS parking-orbit timing and orbit success are guided educational checks; all orbital capture, trajectories, costs and non-SLS rockets remain educational models, not flight telemetry.</div>`);
const timeline=flightPhases().map((p,i)=>`<div class="phase-node ${i<flightPhaseIndex()?'done':i===flightPhaseIndex()?'active':''}">${p}</div>`).join('');
return `<div class="view-grid flight">${left}${htmlPanel('FLIGHT PATH · EARTH → '+game.mission.toUpperCase(),`<div class="flight-timeline" style="margin-bottom:12px">${timeline}</div><div class="flight-scene"><canvas id="flight-canvas" aria-label="Animated spacecraft mission trajectory"></canvas>${overlay}</div><div class="hint" style="margin-top:11px" id="flight-caption">${flightCaption()}</div>
${`<section class="transfer-orbit-workbench"><div class="transfer-orbit-top"><strong>☀ EIGHT PLANETS · ONE SIMULATION CLOCK</strong><span id="transfer-epoch">SIMULATION EPOCH</span></div>${orbitControls()}<canvas id="transfer-solar-canvas" aria-label="Animated NASA JPL approximate planetary orbits and simulated transfer spacecraft"></canvas><div class="transfer-explain">All eight planets move together using JPL approximate orbital elements. Date, spacecraft and planets share one simulation clock during transfer. Orbital paths are visually compressed (not to scale); spacecraft trajectory is educational, not an actual NASA ephemeris. ${btn('OPEN FULL SOLAR SYSTEM','open-solar','','btn-ghost btn-sm')}</div></section>`}
${['cruise','orbit'].includes(f.status)?renderFlightService():''}`) }${right}</div>`;
}
function flightCaption(){let f=game.flight,m=metrics();if(m.realRocket&&['ready','ascent','parking','orbit'].includes(f.status))return 'NASA SLS Block 1 reference masses / propellant / thrust / separation timing; orbital altitude and speed are illustrative, not NASA telemetry.';if(f.status==='countdown')return 'Prelaunch countdown · T−10 through ignition; checklist is a teaching visualization, not actual range control telemetry.';if(f.status==='ready')return'Launch from Earth. Two-stage propellant consumption and mass separation are calculated.';if(f.status==='ascent')return'Stage separation occurs when first-stage propellant is exhausted. Remaining vehicle mass decreases.';if(f.status==='parking')return'Parking orbit achieved. Check the transfer burn before continuing.';if(f.status==='cruise')return'Spacecraft follows an educational Earth–Moon or heliocentric transfer curve. Events affect onboard resources and navigation.';if(f.status==='orbit')return`Destination orbit achieved at ${game.mission}. Lunar/Mars local orbit is a simplified bound-orbit visualization; optional landing follows.`;return f.reason||'Mission failed; revise your design and retry.';}
function flightMeters(){let f=game.flight,r=f.resources,m=metrics();return (f.status==='ascent'&&m.realRocket?resourceBar('SRB fuel',f.fuel1,100,'good','%')+resourceBar('Core fuel',f.fuel2,100,'good','%')+resourceBar('ICPS fuel',f.fuel3,100,'good','%'):f.status==='ascent'?
 resourceBar('Stage 1 fuel',f.fuel1,100,f.fuel1<15?'warn':'good','%')+resourceBar('Stage 2 fuel',f.fuel2,100,'good','%'):
 resourceBar('Electrical',Math.round(r.power),100,r.power<30?'bad':'good','%')+resourceBar('System health',Math.round(r.health),100,r.health<35?'bad':'good','%')+resourceBar('Communications',Math.round(r.comms),100,r.comms<35?'bad':'good','%')+resourceBar('Maneuver propellant',Math.round(r.propellant),100,r.propellant<30?'warn':'good','%'));
}
const SCIENCE_TARGET={Earth:48,Moon:72,Mars:64};
function landingSites(){return game.mission==='Moon'?['Mare Plains','South Pole','Crater Rim']:game.mission==='Mars'?['Elysium Planitia','Jezero Region','Rocky Highlands']:['Pacific Recovery','Desert Landing'];}
function landingAvailable(){return game.flight.status==='orbit';}
function renderOperations(){let f=game.flight,can=landingAvailable(),m=MS[game.mission];
let target=SCIENCE_TARGET[game.mission],value=f.scienceTune??20;
let sci=htmlPanel('SCIENCE OPERATIONS · INTERACTIVE INSTRUMENT',`<div class="eyebrow">${m.title.toUpperCase()}</div><h2 class="section-title" style="margin-top:8px">${game.mission==='Earth'?'Verify thermal observations':game.mission==='Moon'?'Calibrate polar science observations':'Calibrate atmospheric imaging'}</h2><p class="lead">${game.mission==='Earth'?'Use a thermal instrument reading to identify credible hotspots; preserve a quality-controlled observation.':game.mission==='Moon'?'Tune the neutron-spectrometer calibration toward the science reference window, then acquire the observation.':'Tune the camera toward the reference band and preserve images for scientific review.'}</p>
${nasaScienceImage()}
${can?`<div class="hint notice-good">Destination orbit verified. Science instruments are available.</div>`:`<div class="hint notice-warn">Reach the required orbit before performing the mission science task.</div>`}
<div class="divider"></div><div class="selector-label">INSTRUMENT TARGETING · MOVE INTO GREEN BAND</div>
<div style="position:relative;border:1px solid #4b6292;background:#12223e;height:48px;border-radius:8px;margin-top:9px"><div style="position:absolute;left:${target-8}%;width:16%;top:0;bottom:0;background:#47c49b65;border:2px solid #70f7bb;border-radius:6px"></div><div id="science-marker" style="position:absolute;left:${value}%;top:0;bottom:0;border-left:4px solid #b8ecff"></div></div>
<label for="science-tune" class="field-label" style="margin-top:10px">INSTRUMENT ALIGNMENT <span style="color:var(--cyan)">${value}/100</span></label><input id="science-tune" type="range" min="0" max="100" value="${value}" style="width:100%;accent-color:var(--lime)" ${!can||f.scienceComplete?'disabled':''}>
<div class="muted tiny" style="margin:8px 0">${f.scienceComplete?`Observation recorded · score ${f.scienceScore}/100`:`Attempts remaining: ${3-(f.scienceAttempts||0)}`}</div>
${btn(f.scienceComplete?'OBSERVATION COMPLETE':'CAPTURE SCIENCE DATA','science-submit','','btn-primary btn-lg btn-block',!can||f.scienceComplete)}
<div class="divider"></div><div class="selector-label">GROUND / DEEP SPACE DATA RETURN</div>${resourceBar('Stored science data',Math.round(f.resources.data),100,'good','%')}
${btn(f.downlinked?'DATA RECEIVED ON EARTH ✓':'DOWNLINK VERIFIED SCIENCE','downlink','','btn-teal btn-block',!f.scienceComplete||f.downlinked)}
<p class="muted tiny">In this educational game, science score and communications constraints determine reported value. No actual sensor samples are generated.</p>`);
let land=f.landing||{status:'ready',site:landingSites()[0],h:2000,v:-80,fuel:1000};
const landPart=htmlPanel('LANDING & SURFACE OPERATIONS',`<div class="eyebrow">${game.mission==='Earth'?'EARTH RECOVERY PRACTICE':game.mission.toUpperCase()+' SURFACE LANDING'}</div><h2 class="section-title" style="margin-top:8px">${game.mission==='Moon'?'Powered lunar descent':game.mission==='Mars'?'Mars descent systems':'Earth recovery'}</h2>
<div class="landing-scene"><canvas id="landing-canvas" aria-label="Animated destination landing"></canvas></div>
<div class="selector-label" style="margin-top:12px">CHOOSE LANDING SITE</div><div class="stack" style="gap:7px;margin:9px 0">${landingSites().map(s=>`<button class="site-card ${land.site===s?'selected':''}" data-action="landing-site" data-value="${esc(s)}" ${land.status==='descending'?'disabled':''}><span>${esc(s)}</span><span>${land.site===s?'✓':''}</span></button>`).join('')}</div>
<div class="hint ${land.status==='landed'?'notice-good':land.status==='failed'?'notice-bad':'notice-warn'}">${land.status==='landed'?'SOFT TOUCHDOWN · science surface operations may begin.':land.status==='failed'?esc(land.reason||'Landing failed.'):land.status==='descending'?`Descending... ${Math.ceil(land.h)} m remaining.`:'Optional exercise. A landing is possible only after entering the destination orbit. Terminal descent is simplified; not complete EDL.'}</div>
${btn(land.status==='descending'?'DESCENT IN PROGRESS':land.status==='landed'?'LANDING COMPLETE':land.status==='failed'?'RETRY LANDING':'BEGIN LANDING','landing-start','','btn-primary btn-lg btn-block',!can||land.status==='descending'||land.status==='landed')}`);
let summary=htmlPanel('MISSION OBJECTIVES',`<div class="check-list"><div class="check-row"><span class="check-icon ${!can?'bad':''}">${can?'✓':'!'}</span> Reach required target orbit</div><div class="check-row"><span class="check-icon ${!f.scienceComplete?'bad':''}">${f.scienceComplete?'✓':'!'}</span> Complete science observation</div><div class="check-row"><span class="check-icon ${!f.downlinked?'bad':''}">${f.downlinked?'✓':'!'}</span> Return verified data</div></div><div class="divider"></div>${btn('OPEN MISSION REVIEW →','to-report','','btn-primary btn-lg btn-block',!f.scienceComplete)}<p class="muted tiny">Landing is optional unless the selected mission specifically requires it. Earth recovery is a separate training scenario.</p>`);
return `<div class="view-grid">${sci}${landPart}${summary}</div>`;
}
function reportScore(){let f=game.flight,m=metrics();return clamp(Math.round((f.status==='orbit'?35:0)+(f.scienceComplete?20*f.scienceScore/100:0)+(f.downlinked?20:0)+(game.quiz.submitted?10*game.quiz.score/100:0)+(f.status==='orbit'?Math.max(0,15-Math.max(0,(m.cost/m.budget-.8)*25)):0)),0,100);}
function renderReport(){awardLocalPoints();let f=game.flight,m=MS[game.mission],scores={Design:metrics().issues.length?0:1,Knowledge:game.quiz.score/100,Flight:f.status==='orbit'?1:0,Science:f.scienceComplete?f.scienceScore/100:0,Data:f.downlinked?1:0};
let result=(f.status==='orbit'&&f.scienceComplete&&f.downlinked)?'MISSION COMPLETE':f.status==='failed'?'MISSION FAILED':'MISSION IN PROGRESS';
const questions=['Which spacecraft design choice had the biggest impact on the mission?','How did you respond to a mission event, and why?','What would you change in your next design?'];
return `<div class="report-grid">${htmlPanel('POST-MISSION REVIEW',`<div class="eyebrow">${m.title.toUpperCase()} · DEBRIEF</div><div class="report-score">${reportScore()}<span style="font-size:18px;color:#b1bfdc"> / 100</span></div>${tag(result,result==='MISSION COMPLETE'?'good':result==='MISSION FAILED'?'bad':'warn')}${f.practiceAdjusted?'<div class="hint notice-warn">PRACTICE RUN: Onboard inventory was edited after launch. Scores are informational; local profile points are not awarded.</div>':''}<p class="small muted">Local player: ${esc(signedInProfile||'Guest')} · Points: ${signedInProfile?Number(profileDatabase()[signedInProfile]?.points||0):0} · Device-only scoring</p><p class="lead">Engineering knowledge, mission execution and science outcomes are scored separately. An unsuccessful transfer can still teach a useful lesson.</p>
<div class="divider"></div>${questions.map((q,i)=>`<label class="field-label" for="reflect-${i}" style="margin-top:14px">${i+1}. ${q}</label><textarea class="text-area" id="reflect-${i}" rows="3" data-reflect="${i}" placeholder="Record your team's reflection...">${esc((game.reflections||['','',''])[i]||'')}</textarea>`).join('')}
<div style="display:flex;flex-wrap:wrap;gap:9px;margin-top:14px">${btn('DOWNLOAD MISSION REPORT','export-report','','btn-primary btn-lg')}${btn('TRY A NEW DESIGN','new-design','','btn-teal btn-lg')}</div>`) }
${htmlPanel('MISSION OUTCOMES & FLIGHT LOG',`<div class="check-list">${Object.entries(scores).map(([k,v])=>`<div class="check-row"><span class="check-icon ${v<.6?'bad':''}">${v>.6?'✓':'○'}</span>${k}: <b>${Math.round(v*100)}%</b></div>`).join('')}</div>
<div class="divider"></div><div class="eyebrow">FLIGHT HISTORY</div><div class="log" style="margin-top:8px">${f.log.length?f.log.map(x=>'• '+esc(x)).join('<br>'):'No flight recorded.'}</div><div class="divider"></div><div class="muted small">${f.reason?`Final flight reason: ${esc(f.reason)}`:'All mission activity is educational. NASA/JPL values are used only as published planetary reference coefficients.'}</div>` )}</div>`;
}
// ------------------------- Game progression -------------------------------
function startLaunch(){const f=game.flight,m=metrics();if(!game.quiz.submitted){setNotice('Submit the PDR/CDR quiz before attempting launch.');go('review');return;}
 if(f.status!=='ready'&&f.status!=='failed')return;
 f.runId=String(Date.now())+'-'+Math.random().toString(36).slice(2,10);
 if(m.issues.length){f.status='failed';f.reason=`PRELAUNCH ABORT: ${m.issues.join(' ')}`;log('Prelaunch engineering verification failed. Revise the spacecraft configuration.');setNotice('Prelaunch abort: design constraints were not met.');render();return;}
 const runId=f.runId;Object.assign(f,defaultFlight());f.runId=runId;f.status='countdown';f.countdownRemaining=10;f.countdownCue=10;f.mass=m.launchMass;f.stage=0;
 log('PRELAUNCH: T−10 seconds. Guidance, propulsion, cabin cargo restraint and communications checks started.');
 setNotice('T−10 · PRELAUNCH COUNTDOWN — systems checking.');render();}
function cancelCountdown(){const f=game.flight;if(f.status!=='countdown')return;
 f.status='ready';f.countdownRemaining=10;f.countdownCue=10;log('COUNTDOWN HOLD: launch attempt paused; vehicle safe.');setNotice('COUNTDOWN HOLD — inspect loadout, then restart.');render();}
function countdownAdvance(dt){const f=game.flight;if(f.status!=='countdown')return;
 const before=Math.ceil(f.countdownRemaining);f.countdownRemaining=Math.max(0,f.countdownRemaining-dt);
 const after=Math.ceil(f.countdownRemaining);
 const liveCounter=document.querySelector('.countdown-big');
 if(liveCounter)liveCounter.textContent='T−'+Math.ceil(f.countdownRemaining);
 if(after<before){
  const lines={7:'T−7 · Flight computer online.',5:'T−5 · Electrical and avionics GO.',3:'T−3 · Propulsion checks complete.',1:'T−1 · Final commit to ignition.'};
  if(lines[after])log(lines[after]);
  if(after>0){setNotice('T−'+after+' · '+(after<=3?'FINAL LAUNCH COMMIT':'SYSTEMS NOMINAL'));}
 }
 if(f.countdownRemaining<=0){const m=metrics();f.status='ascent';f.launchTime=0;f.mass=m.launchMass;f.stage=0;
  log(`T+0 · LIFTOFF. ${game.build.launcher}; ${fmt(m.payload)} kg payload. ${m.realRocket?'NASA SLS reference stage bookkeeping.':'Educational two-stage launcher.'}`);
  setNotice('T+0 · ENGINES IGNITED — launch underway.');render();}
}
function beginTransfer(){let f=game.flight;if(f.status!=='parking'||game.mission==='Earth')return;solarDayOffset=0;
 let m=metrics(),p=m.plan,tr=TRANSFER[game.mission];
 let mass=m.vehicleMass+tr.capture+tr.fuel+tr.dry;
 let req=mass*(1-Math.exp(-p.dep*1000/(tr.isp*G0)));
 if(m.realRocket){
  const r=m.realRocket,initial=r.upperPropKg+NASA_SLS.upper.dryKg+m.payload;
  const effectiveExhaust=NASA_SLS.upper.thrustN/(NASA_SLS.upper.propellantKg/NASA_SLS.upper.burnSec);
  req=initial*(1-Math.exp(-p.dep*1000/effectiveExhaust));
  if(req>r.upperPropKg){f.status='failed';f.reason='NASA SLS ICPS reference propellant insufficient for the idealized departure burn.';log(f.reason);render();return;}
  f.fuel3=clamp(100*(1-req/r.upperPropKg));
  f.mass=m.payload;
  log(`ICPS INJECTION: approx ${fmt(req)} kg LH2/LOX used for Δv ${p.dep.toFixed(2)} km/s; upper stage then separated (educational impulse).`);
 }else if(req>tr.fuel){f.status='failed';f.reason='Injection stage cannot provide planned departure Δv.';log(f.reason);render();return;}
 f.status='cruise';f.launchEpochUTC=p.launchDate.toISOString();f.progress=0;f.days=0;f.eventsSeen=[];f.activeEvent=null;f.resources.propellant=100;f.correction=false;
 log(`Departure burn completed: estimated Δv ${p.dep.toFixed(2)} km/s. Transfer starts ${p.launchDate.toISOString().slice(0,10)} UTC.`);
 setNotice(`${game.mission.toUpperCase()} TRANSFER — follow the trajectory and resolve onboard events.`);render();}
function resolveEvent(index){let f=game.flight,k=f.activeEvent;if(!k)return;let ev=EVENT_TYPES[k],entry=ev.choices[index];if(!entry)return;
 const delta={...entry[2]};
 if(k==='solar' && index===0 && hasCargo('battery',['flight-deck','life-support'])){delta.power=(delta.power||0)+8;log('Cabin-installed backup battery supports storm-safe mode (+8 power).');}
 if((k==='comms'||k==='ground') && index!==1 && hasCargo('repair',['communications'])){delta.comms=(delta.comms||0)+7;log('Comms spares improve link recovery (+7 comms).');}
 if(k==='solar'&&game.build.shield&&index!==0)delta.health=Math.round((delta.health||0)*.55);
 if(k==='navigation'){
  if(index===0&&f.resources.propellant>=28){f.correction=true;log('Full midcourse correction executed; arrival geometry adjusted.');}
  else if(index===0){f.correction=false;log('Maneuver propellant reserve insufficient for full correction.');}
  else if(index===1){f.correction=false;log('Navigation correction skipped. Encounter error is expected.');}
  else{f.correction=false;log('Half correction made; full targeting accuracy not guaranteed.');}
 }
 for(let [res,amount] of Object.entries(delta))f.resources[res]=clamp(f.resources[res]+amount);
 f.eventsSeen.push(k);f.activeEvent=null;log(`${ev.name}: ${entry[0]}. ${entry[1]}`);
 if(f.resources.health<=0||f.resources.power<=0){f.status='failed';f.reason='Systems or electrical reserves depleted during cruise.';log(f.reason);}
 setNotice(`${ev.name} resolved — ${entry[0]}.`);render();}
function completeArrival(){let f=game.flight,m=metrics(),p=m.plan;
 if(!f.correction){f.status='failed';f.reason=`TARGET MISSED / FLYBY. Skipping the required navigation correction left a significant ${game.mission} encounter error.`;log(f.reason);setNotice('Target missed. Review the navigation decision and redesign if needed.');render();return;}
 // Educational impulsive arrival check using the rocket equation. Reserve includes correction.
 const tr=TRANSFER[game.mission];let mass=m.vehicleMass+tr.capture;
 let required=mass*(1-Math.exp(-(p.capture+p.correction)*1000/(tr.ispCapture*G0)));
 if(required>tr.capture){f.status='failed';f.reason='CAPTURE BURN FAILED. Arrival propellant reserve was insufficient.';log(f.reason);render();return;}
 f.status='orbit';f.success=true;f.activeEvent=game.mission==='Moon'?'eclipse':'thermal';f.orbitalTime=0;f.resources.propellant=clamp(100*(tr.capture-required)/tr.capture);
 log(`${game.mission.toUpperCase()} ORBIT achieved in educational patched-conic / two-body model. Capture Δv ≈ ${p.capture.toFixed(2)} km/s.`);
 log(`${EVENT_TYPES[f.activeEvent].name} now requires a systems decision.`);setNotice(`${game.mission.toUpperCase()} ORBIT ACHIEVED — resolve the destination systems event.`);render();}
function slsAdvance(dt,m){
 let f=game.flight,r=m.realRocket,s=NASA_SLS;
 f.launchTime+=dt*24;
 const t=f.launchTime,boosterEnd=r.boosterBurnSec,coreEnd=r.coreBurnSec,upperEnd=coreEnd+r.upperBurnSec;
 f.stage=t<boosterEnd?0:1;
 const boostUsed=r.boosterPropKg*clamp(t/boosterEnd,0,1);
 const coreUsed=r.corePropKg*clamp(t/coreEnd,0,1);
 const upperUsed=0; // ICPS propellant is reserved for departure after Earth parking orbit.
 f.fuel1=clamp(100*(1-boostUsed/Math.max(1,r.boosterPropKg)));
 f.fuel2=clamp(100*(1-coreUsed/Math.max(1,r.corePropKg)));
 f.fuel3=clamp(100*(1-upperUsed/Math.max(1,r.upperPropKg)));
 const dryDiscard=(t>=boosterEnd?r.boosterDryKg:0)+(t>=coreEnd?r.coreDryKg:0);
 f.mass=Math.max(m.payload,r.wetMass-boostUsed-coreUsed-upperUsed-dryDiscard);
 f.speed=m.idealDv*(1-Math.exp(-2.2*Math.min(1,t/coreEnd)));
 f.alt=MS[game.mission].orbitTarget*Math.pow(clamp(t/coreEnd,0,1),2.35);
 if(t>=boosterEnd&&!f.boosterSeparated){f.boosterSeparated=true;f.stageFx={type:'boosters',age:0,label:'SRB SEPARATION · TWO BOOSTERS JETTISONED',massKg:r.boosterDryKg};log(`SRB SEPARATION: 2 boosters jettisoned (~${fmt(r.boosterDryKg)} kg inert structure).`);setNotice('SRB SEPARATION — two spent boosters detached.');render();}
 if(t>=coreEnd&&!f.coreSeparated){f.coreSeparated=true;f.stageFx={type:'core',age:0,label:'CORE STAGE SEPARATION · ICPS RETAINED',massKg:r.coreDryKg};log(`CORE STAGE JETTISON: dry mass ~${fmt(r.coreDryKg)} kg; ICPS retained for translunar/deep-space injection.`);setNotice('CORE STAGE SEPARATION — ICPS retained for target transfer.');}
 if(t>=coreEnd){f.status='parking';f.mass=m.payload+NASA_SLS.upper.dryKg+r.upperPropKg;f.fuel1=0;f.fuel2=0;f.fuel3=100;f.speed=7.68;f.alt=MS[game.mission].orbitTarget;
  log(`Core stage burnout and separation. Game parking-orbit design check passed (apogee target ${MS[game.mission].orbitTarget} km). ICPS reserved for departure.`);
  if(game.mission==='Earth'){f.status='orbit';f.success=true;f.activeEvent='ground';log('Earth science payload deployed.');}
  setNotice(game.mission==='Earth'?'Earth-orbit design stage complete.':'Parking-orbit design stage complete. Begin your transfer.');render();
 }
}
function igniteAdvance(dt){let f=game.flight,m=metrics();if(f.status!=='ascent')return;
 if(m.realRocket){slsAdvance(dt,m);return;}
 f.launchTime+=dt*24;
 const t1=m.burn1Sec,t2=m.burn2Sec,t=f.launchTime;
 f.stage=t<t1?0:1;
 f.fuel1=clamp(100*(1-t/t1));f.fuel2=clamp(100*(1-Math.max(0,t-t1)/t2));
 let usedFuel=m.fuelStage1*(1-f.fuel1/100)+m.fuelStage2*(1-f.fuel2/100);
 let discarded=t>=t1?STAGES[0].dry*LAUNCHERS[game.build.launcher].scale:0;
 f.mass=m.launchMass-usedFuel-discarded;
 f.speed=m.idealDv*(1-Math.exp(-2.2*t/(t1+t2))); // visual estimate, not flight telemetry
 f.alt=MS[game.mission].orbitTarget*Math.pow(clamp(t/(t1+t2),0,1),2.35);
 if(f.stage===1&&!f.separated){f.separated=true;f.stageFx={type:'first-stage',age:0,label:'MECO · STAGE 1 SEPARATED · STAGE 2 IGNITED',massKg:discarded};log(`MECO: first-stage dry mass ${fmt(discarded)} kg jettisoned; upper-stage ignition.`);setNotice('STAGE 1 SEPARATED — upper-stage engine ignited.');render();}
 if(t>=t1+t2){f.status='parking';f.mass=m.payload;f.fuel1=0;f.fuel2=0;f.stageFx={type:'upper-stage',age:0,label:'SECO · UPPER STAGE SEPARATED · PAYLOAD DEPLOYED',massKg:STAGES[1].dry*LAUNCHERS[game.build.launcher].scale};f.speed=7.68;f.alt=MS[game.mission].orbitTarget;
 log(`Upper-stage shutdown. Educational low-Earth parking orbit verified (target apogee ${MS[game.mission].orbitTarget} km).`);
 if(game.mission==='Earth'){f.status='orbit';f.success=true;f.activeEvent='ground';log('Earth observation payload deployed. Ground-station outage training event activated.');}
 setNotice(game.mission==='Earth'?'EARTH ORBIT achieved. Perform science observations.':'PARKING ORBIT achieved. Begin the transfer mission when ready.');render();}
}
function cruiseAdvance(dt){let f=game.flight;if(f.status!=='cruise'||f.activeEvent)return;
 const incidents=[['solar',.21],['comms',.44],['navigation',.60]];
 // Fast-forward must never jump over an unanswered hazard.
 const next=incidents.find(([name])=>!f.eventsSeen.includes(name));
 const upper=next?next[1]:1;f.progress=Math.min(upper,clamp(f.progress+dt*.034,0,1));
 f.days=f.progress*metrics().plan.days;advanceConsumables();
 for(let [ev,p] of incidents){if(f.progress>=p&&!f.eventsSeen.includes(ev)){
  f.activeEvent=ev;log(`ALERT: ${EVENT_TYPES[ev].name} encountered on mission day ${f.days.toFixed(1)}.`);setNotice('SPACECRAFT ALERT — choose an action in the flight view.');render();return;}}
 if(f.progress>=1)completeArrival();
}
function startLanding(){let f=game.flight;if(f.status!=='orbit')return;
 let site=f.landing?.site||landingSites()[0];
 let body=game.mission;
 let l={status:'descending',site,alt:2000,vy:body==='Moon'?-80:body==='Mars'?-30:-10,fuel:500,dry:700,thrust:9000,isp:300,time:0,throttle:0,g:body==='Moon'?MU_MOON/(MOON_R*MOON_R)*1000:body==='Mars'?MU_MARS/(MARS_R*MARS_R)*1000:9.80665};
 if((body==='Mars'||body==='Earth')&&(!game.build.heatshield||!game.build.parachute)){
  l.status='failed';l.reason='Required heat shield or parachute missing for atmospheric descent.';
  log(`${body} landing aborted: missing entry/landing hardware.`);
 }else{log(`${body} terminal descent initiated at ${site} (educational one-dimensional practice).`);setNotice(`${body.toUpperCase()} LANDING — powered descent underway.`);}
 f.landing=l;render();}
function landingAdvance(dt){let l=game.flight.landing;if(!l||l.status!=='descending')return;
 const body=game.mission;
 for(let j=0;j<Math.max(1,Math.floor(dt*120));j++){
  let step=.10,mass=l.dry+l.fuel;
  if(body==='Earth'){
   // Simplified parachute-dominated terminal recovery; not atmospheric entry integration.
   l.vy=-Math.max(2,Math.min(10,Math.abs(l.vy)-.04));l.alt+=l.vy*step;l.time+=step;
  }else{
   let maxA=Math.max(.1,l.thrust/mass-l.g),goal=-Math.min(48,Math.max(1.45,.75*Math.sqrt(2*maxA*Math.max(0,l.alt-15))));
   let targetAcc=clamp((goal-l.vy)*.75,-maxA,maxA);
   l.throttle=clamp(mass*(l.g+targetAcc)/l.thrust,0,1);
   let demand=l.throttle*l.thrust/(l.isp*G0)*step,used=Math.min(l.fuel,demand);l.fuel-=used;
   let actual=l.throttle*(demand?used/demand:0),acc=l.thrust*actual/mass-l.g;
   l.vy+=acc*step;l.alt+=l.vy*step;l.time+=step;
  }
  if(l.alt<=0){l.alt=0;l.status=l.vy>=-3.5?'landed':'failed';if(l.status==='failed')l.reason=`Hard landing: vertical speed ${Math.abs(l.vy).toFixed(1)} m/s.`;
   log(l.status==='landed'?`Safe touchdown at ${l.site}.`:`Landing failure: ${l.reason}`);
   setNotice(l.status==='landed'?'SOFT LANDING CONFIRMED.':l.reason);render();break;}
  if(l.fuel<=0&&body!=='Earth'){l.status='failed';l.reason='Landing propellant exhausted before touchdown.';log(l.reason);render();break;}
 }
}
function reportExport(){let f=game.flight,r={project:'Moonbound web',generatedUTC:new Date().toISOString(),mission:game.mission,missionTitle:MS[game.mission].title,build:game.build,engineering:metrics(),quiz:game.quiz,flight:f,localProfile:signedInProfile||'Guest',score:reportScore(),reflections:game.reflections||['','',''],sources:['https://ssd.jpl.nasa.gov/planets/approx_pos.html','https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/'],simulationDisclosure:'Flight, events, mission hardware, cost and landing are educational simulation values; JPL published approximate orbital coefficients are a source reference. In-flight inventory overrides mark the run as practice and cannot earn profile points.',practiceRun:!!f.practiceAdjusted};
const blob=new Blob([JSON.stringify(r,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Moonbound_${game.mission}_Mission_Report.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);setNotice('Mission report downloaded as JSON.');}
// --------------------------- Event handlers -------------------------------
function designChanged(){game.quiz={answers:{},submitted:false,score:0};game.flight=defaultFlight();notice='Design updated. Revisit PDR/CDR before your next launch.';render();}
function chooseRole(index){const roleOpts=['Pilot','Scientist','Systems Engineer','Comms Officer'];let i=+index;game.roles[i]=roleOpts[(roleOpts.indexOf(game.roles[i])+1)%roleOpts.length];render();}
function handleAction(action,value,el){let b=game.build,f=game.flight;
 switch(action){
  case'nav':activateStep(value);break;
  case'choose-mission':setMission(value);break;
  case'role':chooseRole(value);break;
  case'next-build':go('build');setNotice('Choose the vehicle, instrument, power and optional modular rooms.');break;
  case'next-review':go('review');setNotice('Answer four design-review questions, then decide whether to attempt a launch.');break;
  case'set-field':{let field=el.dataset.field;let v=value;if(field==='crewed'){const prev=b.crewed;b.crewed=(v==='CREWED')?1:0;ensureCargo(b);if(!prev && b.crewed && !cargoTotals(b).provisions){let i=b.rooms.indexOf('cargo');if(i<0)i=b.rooms.findIndex(Boolean);if(i>=0)b.cabinCargo[i].provisions=1;}}else if(field==='fuel'){b.fuel=Number(v);}else{b[field]=v;}designChanged();break;}
  case'toggle':b[value]=b[value]?0:1;designChanged();break;
  case'quantity':{let[k,delta]=value.split(':');if(k in b)b[k]=clamp(b[k]+Number(delta),0,3);designChanged();break;}
  case'ship-preview':showShipPreview();break;
  case'bay':b.activeBay=Number(value);render();break;
  case'set-room':{const old=b.rooms[b.activeBay];if(old!==value && b.cabinCargo?.[b.activeBay]){ensureCargo(b);for(const [key,n] of Object.entries(b.cabinCargo[b.activeBay]))b.groundStock[key]=(b.groundStock[key]||0)+n;b.cabinCargo[b.activeBay]={};}b.rooms[b.activeBay]=value;designChanged();break;}
  case'clear-bay':{ensureCargo(b);for(const [key,n] of Object.entries(b.cabinCargo[b.activeBay]||{}))b.groundStock[key]=(b.groundStock[key]||0)+n;b.cabinCargo[b.activeBay]={};b.rooms[b.activeBay]=null;designChanged();break;}
  case'add-bay':if(b.rooms.length<6){ensureCargo(b);b.rooms.push(null);b.cabinCargo.push({});designChanged();}break;
  case'remove-bay':if(b.rooms.length>3){ensureCargo(b);const removed=b.cabinCargo.pop();for(const [key,n] of Object.entries(removed||{}))b.groundStock[key]=(b.groundStock[key]||0)+n;b.rooms.pop();b.activeBay=Math.min(b.activeBay,b.rooms.length-1);designChanged();}break;
  case'answer':{if(game.quiz.submitted)return;const[i,j]=value.split(':').map(Number);game.quiz.answers[i]=j;render();break;}
  case'submit-quiz':{let qs=questions();let answered=Object.keys(game.quiz.answers).length;if(answered<qs.length){setNotice(`Answer all four questions first (${answered}/4).`);return;}let right=qs.reduce((n,q,i)=>n+(game.quiz.answers[i]===q.correct),0);game.quiz.submitted=true;game.quiz.score=25*right;setNotice(`Knowledge score ${game.quiz.score}/100. Your engineering design is evaluated separately.`);render();break;}
  case'authorize-launch':if(game.quiz.submitted){go('flight');setNotice('Ready to attempt launch. Choose IGNITE ENGINES.');}break;
  case'ignite':startLaunch();break;
  case'cancel-countdown':cancelCountdown();break;
  case'move-cargo':moveCargo();break;
  case'cargo-adjust':{const [bay,key,delta]=value.split(':');adjustCargo(Number(bay),key,Number(delta),false);break;}
  case'flight-cargo-adjust':{const [bay,key,delta]=value.split(':');adjustCargo(Number(bay),key,Number(delta),true);break;}
  case'orbit-speed':solarSpeed=Number(value)||1;render();if(solarOpen)renderSolarInfo();break;
  case'orbit-play':solarPlaying=!solarPlaying;const sp=$('solar-play');if(sp){sp.textContent=solarPlaying?'❚❚ PAUSE':'▶ PLAY';sp.setAttribute('aria-pressed',String(solarPlaying));}render();if(solarOpen)renderSolarInfo();break;
  case'orbit-scope':solarScope=value==='inner'?'inner':'all';render();if(solarOpen)renderSolarInfo();break;
  case'toggle-ascent-pause':if(f.status==='ascent'){f.paused=!f.paused;setNotice(f.paused?'ASCENT PAUSED — inspect the stage configuration.':'ASCENT RESUMED.');render();}break;
  case'begin-transfer':beginTransfer();break;
  case'event-choice':resolveEvent(Number(value));break;
  case'open-solar':openSolar();break;
  case'flight-move-supply':flightMoveSupply();break;
  case'flight-use-supply':flightUseSupply(value);break;
  case'to-ops':if(f.activeEvent){setNotice('Resolve the destination event on the flight screen first.');break;}go('operations');setNotice('Destination operations unlocked. Collect science and optionally attempt a landing.');break;
  case'science-submit':{if(f.status!=='orbit'||f.scienceComplete)return;f.scienceAttempts=(f.scienceAttempts||0)+1;let val=f.scienceTune??20,target=SCIENCE_TARGET[game.mission];if(Math.abs(val-target)<=(hasCargo('science',['observation','science-lab'])?11:8)){f.scienceComplete=true;f.scienceScore=100;f.resources.data=100;log(`Science instrument aligned at ${val}/100; observation data recorded.`);setNotice('SCIENCE OBSERVATION COMPLETE — data ready for downlink.');}
   else if(f.scienceAttempts>=3){f.scienceComplete=true;f.scienceScore=45;f.resources.data=75;log('Instrument calibration only partially successful; a lower-quality observation was preserved.');setNotice('Instrument alignment incomplete; partial science observations retained.');}
   else setNotice(`Alignment outside reference band. ${3-f.scienceAttempts} attempts left.`);render();break;}
  case'downlink':{if(!f.scienceComplete||f.downlinked)return;f.contacts=(f.contacts||0)+1;const rate=COMMS[b.comm].rate;f.dataSent=clamp((f.dataSent||0)+rate,0,100);if(f.dataSent>=100){f.downlinked=true;log('Science data successfully downlinked to Earth in the educational communication model.');setNotice('DATA RETURN COMPLETE — you can now finish the mission report.');}
   else setNotice(`Ground contact ${f.contacts}: ${Math.round(f.dataSent)}% returned; schedule another pass.`);
   if(f.contacts>=3&&!f.downlinked){log('Contact windows exhausted before full science return.');setNotice('No further contact windows remain; partial data was returned.');}
   render();break;}
  case'landing-site':{if(!f.landing)f.landing={status:'ready',site:value};else f.landing.site=value;render();break;}
  case'landing-start':startLanding();break;
  case'to-report':go('report');setNotice('Complete the post-mission review and download your report.');break;
  case'export-report':reportExport();break;
  case'new-design':if(confirm('Return to the spacecraft builder for another attempt?')){game.quiz={answers:{},submitted:false,score:0};game.flight=defaultFlight();go('build');}break;
 }
}
document.addEventListener('click',e=>{const control=e.target.closest('[data-action]');if(control){handleAction(control.dataset.action,control.dataset.value||'',control);}});
document.addEventListener('input',e=>{if(e.target.id==='science-tune'){game.flight.scienceTune=Number(e.target.value);let text=document.querySelector('label[for="science-tune"] span');if(text)text.textContent=game.flight.scienceTune+'/100';let marker=document.getElementById('science-marker');if(marker)marker.style.left=`${game.flight.scienceTune}%`;}});
document.addEventListener('change',e=>{if(e.target.dataset.cargo){const key=e.target.dataset.cargo;cargoUI[key]=e.target.value;return;}if(e.target.dataset.flightSupply){const key=e.target.dataset.flightSupply;flightSupplyUI[key]=e.target.value;return;}if(e.target.id==='science-tune'){render();}if(e.target.dataset.reflect!==undefined){let i=Number(e.target.dataset.reflect);if(!game.reflections)game.reflections=['','',''];game.reflections[i]=e.target.value;}});
$('profile-btn').addEventListener('click',openProfile);
document.addEventListener('error',e=>{const img=e.target;if(img instanceof HTMLImageElement && img.dataset.nasaObservation==='1' && img.dataset.fallback){
 img.dataset.nasaObservation='fallback';img.src=img.dataset.fallback;
 const h=img.closest('.science-reference')?.querySelector('.nasa-image-status');
 if(h)h.textContent='NASA PHOTO UNAVAILABLE · CONCEPT ART SHOWN';
 const p=img.closest('.science-reference')?.querySelector('p');
 if(p)p.textContent='The image preview is AI-generated game artwork, NOT a NASA observation. Use the source link to view the authentic NASA record.';
}},true);
$('save-game').addEventListener('click',persist);
$('new-game').addEventListener('click',reset);
$('music-toggle').addEventListener('click',async()=>{
 musicOn=!musicOn;const players=musicPlayers();
 if(musicOn){
  if(!currentTrack){currentTrack=trackForStep();players[activePlayerIndex].src=A(`classical_${currentTrack}.mp3`);}
  players[activePlayerIndex].volume=musicVolume();
  try{await players[activePlayerIndex].play();}
  catch{musicOn=false;setNotice('Audio could not start. Click MUSIC to try again.');}
 }else{if(musicFade){clearInterval(musicFade);musicFade=null;}players.forEach(x=>x.pause());}
 updateMusicButton();
});
$('volume-slider').addEventListener('input',()=>{const players=musicPlayers();
 if(musicFade)return;players[activePlayerIndex].volume=musicVolume();
});
$('solar-toggle').addEventListener('click',openSolar);
$('solar-close').addEventListener('click',closeSolar);
$('solar-back').addEventListener('click',()=>{if(game.flight.status==='cruise'){setNotice('During transfer, the planets and spacecraft share one clock. Use speed controls instead.');return;}solarDayOffset=Math.max(-365,solarDayOffset-30);renderSolarInfo();});
$('solar-forward').addEventListener('click',()=>{if(game.flight.status==='cruise'){setNotice('During transfer, the planets and spacecraft share one clock. Use speed controls instead.');return;}solarDayOffset=Math.min(3650,solarDayOffset+30);renderSolarInfo();});
$('solar-play').addEventListener('click',()=>{solarPlaying=!solarPlaying;$('solar-play').textContent=solarPlaying?'❚❚ PAUSE':'▶ PLAY';$('solar-play').setAttribute('aria-pressed',String(solarPlaying));renderSolarInfo();});
function openSolar(){solarOpen=true;solarLastT=0;$('solar-modal').hidden=false;$('solar-toggle').setAttribute('aria-expanded','true');renderSolarInfo();}
function closeSolar(){solarOpen=false;$('solar-modal').hidden=true;$('solar-toggle').setAttribute('aria-expanded','false');}
function solarDate(){
 const f=game.flight,plan=metrics().plan,base=f.launchEpochUTC?new Date(f.launchEpochUTC):(plan.launchDate||new Date());
 // During transfer, the spacecraft timeline IS the planetary clock, not a separate animation.
 const inTransfer=f.status==='cruise';
 const days=(inTransfer?f.days:(f.status==='orbit'||f.status==='failed'?f.days:0)+solarDayOffset);
 return new Date(+base+days*86400000);
}
function orbitControls(){return `<div class="orbit-controls" aria-label="Unified orbital time and scale">
  ${btn(solarPlaying?'❚❚ PAUSE':'▶ PLAY','orbit-play','','btn-ghost btn-sm')}
  ${[1,10,100,1000].map(x=>btn(`${x}×`,'orbit-speed',String(x),solarSpeed===x?'btn-primary btn-sm':'btn-ghost btn-sm')).join('')}
  ${btn('ALL 8','orbit-scope','all',solarScope==='all'?'btn-primary btn-sm':'btn-ghost btn-sm')}
  ${btn('INNER 4','orbit-scope','inner',solarScope==='inner'?'btn-primary btn-sm':'btn-ghost btn-sm')}
 </div>`;}

function renderSolarInfo(){
 if(!solarOpen)return;
 const controls=$('solar-unified-controls');if(controls)controls.innerHTML=orbitControls();
 const date=solarDate(),f=game.flight;
 $('solar-date').textContent=date.toISOString().slice(0,10)+' UTC · JPL APPROX';
 let phase=({ready:'READY FOR LAUNCH',ascent:'EARTH ASCENT',parking:'EARTH PARKING ORBIT',cruise:'TRANSFER FLIGHT',orbit:`${game.mission.toUpperCase()} ORBIT`,failed:'TARGET MISSED / FAILED'})[f.status]||f.status.toUpperCase();
 let color=f.status==='failed'?'#ff9ba0':f.status==='orbit'?'#96ffb4':'#ffda93';
 let body=`<div class="small muted">Destination</div><div class="solar-highlight">${esc(game.mission)}</div><div class="divider"></div><div class="small muted">Flight status</div><h3 style="color:${color}">${phase}</h3>`;
 if(f.status==='cruise'){body+=`<p class="muted small">Transfer progress: ${Math.round(f.progress*100)}%. Position shown schematically in the flight scene.</p>`;}
 if(f.status==='orbit'){body+=`<p class="small">✓ Orbit insertion confirmed in the game simulation. The inset tracks your spacecraft around ${game.mission}.</p>`;}
 if(f.status==='failed'){body+=`<p class="small" style="color:#ffc6c6">${esc(f.reason||'Orbit was not achieved.')}</p><p class="muted small">No fictitious captured orbit is displayed.</p>`;}
 body+=`<p class="tiny muted">Unified clock: ${solarSpeed}× · eight planets use JPL Table 1 (1800–2050). Display radii are compressed; local spacecraft track is approximate.</p><div class="solar-orbit-note" id="solar-orbit-note"></div><div class="divider"></div><button class="btn btn-ghost btn-block" id="solar-go-flight">VIEW MY FLIGHT</button>`;
 $('solar-mission-info').innerHTML=body;
 $('solar-go-flight').addEventListener('click',()=>{closeSolar();go('flight');});
}

$('sources-btn').addEventListener('click',()=>showSources());
function showShipPreview(){
 const b=game.build,root=$('modal-root');modalOpen=true;root.hidden=false;
 const bays=b.rooms.map((room,i)=>`<div class="ship-bay ${i===b.activeBay?'active':''}" aria-label="Bay ${i+1}: ${room?MODULES[room][0]:'Empty'}">${imageRoom(room)}<div class="bay-name">${room?esc(MODULES[room][0]):'EMPTY BAY'}</div></div>`).join('');
 root.innerHTML=`<section class="modal-card ship-modal" role="dialog" aria-modal="true" aria-labelledby="full-ship-title">
 <div class="ship-dialog-head"><div><div class="eyebrow">SPACECRAFT ENGINEERING</div><h2 id="full-ship-title">COMPLETE MODULAR SPACECRAFT</h2><p>Entire vessel displayed without cropping. Close this view to select a bay, then a room.</p></div><button class="btn btn-primary" id="ship-preview-close">CLOSE ✕</button></div>
 <div class="ship-stage expanded"><div class="ship-viewport"><div class="ship-row" style="--bay-count:${b.rooms.length}"><img class="ship-end nose" src="${A('nose.webp')}" alt="Nose">${bays}<img class="ship-end engine" src="${A('engine.webp')}" alt="Engine"></div></div></div>
 <div class="hint" style="margin-top:15px">${b.rooms.filter(Boolean).length} compartments · ${MS[game.mission].title} · Artwork is conceptual; component masses and power are educational except NASA SLS benchmark values.</div>
 </section>`;
 $('ship-preview-close').addEventListener('click',closeModal);
 root.addEventListener('click',e=>{if(e.target===root)closeModal();},{once:true});
}
function showSources(){const root=$('modal-root');modalOpen=true;root.hidden=false;root.innerHTML=`<div class="modal-card" role="dialog" aria-modal="true" aria-label="Sources and disclosures"><h2>Sources & scientific limitations</h2><p>The web game distinguishes published reference information from simulated gameplay.</p><ul>
<li><a href="https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/" target="_blank" rel="noopener" style="color:#a9eeff">NASA Space Apps 2026 — Space Mission Design Game</a> (challenge inspiration).</li>
<li><a href="https://ssd.jpl.nasa.gov/planets/approx_pos.html" target="_blank" rel="noopener" style="color:#a9eeff">NASA/JPL Approximate Positions of the Major Planets</a> (published 1800–2050 coefficients).</li>
<li><a href="https://www.nasa.gov/nasa-missions/" target="_blank" rel="noopener" style="color:#a9eeff">NASA Missions</a> (mission science references).</li><li><a href="https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf" target="_blank" rel="noopener" style="color:#a9eeff">NASA SLS Reference Guide</a> (booster/core/ICPS masses, propellant loads, thrust, nominal burn durations).</li><li><a href="https://www.nasa.gov/reference/icps/" target="_blank" rel="noopener" style="color:#a9eeff">NASA ICPS</a> (upper-stage RL10 thrust and historical mission reference).</li><li><a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html" target="_blank" rel="noopener" style="color:#a9eeff">NASA Mars facts</a> (physical constants).</li><li><a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html" target="_blank" rel="noopener" style="color:#a9eeff">NASA Moon facts</a>.</li>
<li><a href="https://svs.gsfc.nasa.gov/30614/" target="_blank" rel="noopener" style="color:#a9eeff">NASA Blue Marble Earth imagery</a> (composite visual reference).</li><li><a href="https://science.nasa.gov/photojournal/the-lunar-south-pole/" target="_blank" rel="noopener" style="color:#a9eeff">LRO Lunar South Pole WAC imagery</a> (observation reference).</li><li><a href="https://science.nasa.gov/photojournal/perseverances-location-at-the-base-of-jezero-craters-rim/" target="_blank" rel="noopener" style="color:#a9eeff">MRO Jezero image</a> (real orbital image, not game landing map).</li><li><a href="https://www.swpc.noaa.gov/" target="_blank" rel="noopener" style="color:#a9eeff">NOAA Space Weather Prediction Center</a>. Game solar storms are scripted simulated incidents, not realtime NOAA alerts.</li>
</ul><p>Generic rocket stage data, spacecraft component power/costs, transfer propulsion, events, orbit capture, landing and numerical scores are <strong>educational models</strong>. The optional NASA SLS Block 1 uses sourced stage masses, propellant, thrust and burn periods in an idealized ascent bookkeeping model, not NASA flight telemetry or certified mission design. The Earth–Moon and Mars transfer animations use Kepler/Hohmann-style simplified approximations. Mars transfer launch window uses approximate JPL planet positions. Orbit capture and terminal landing are not full high-fidelity n-body/EDL simulations.</p>
<p>The 12 room sprites and hull sprites are the provided AI-generated Moonbound artwork. The six soft original piano-and-strings soundtracks are provided for the mission stages, not licensed commercial recordings. The uploaded asset disclosure identifies them as AI-generated artwork; they are not NASA photographs or NASA-designed spacecraft. All game fonts/text are editable HTML/CSS.</p>
<div class="modal-actions"><button class="btn btn-primary" id="modal-close">CLOSE</button></div></div>`;root.querySelector('#modal-close').addEventListener('click',closeModal);root.addEventListener('click',e=>{if(e.target===root)closeModal();});}
function closeModal(){modalOpen=false;$('modal-root').hidden=true;$('modal-root').innerHTML='';}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&solarOpen)closeSolar();else if(e.key==='Escape'&&modalOpen)closeModal();});
// -------------------------- Canvas visualizations -------------------------
const starSeeds=Array.from({length:190},(_,i)=>{let x=((i*67.173+11.11)%1+1)%1,y=((i*31.337+0.714)%1+1)%1;return[x,y,(i%9===0?1.5:.6),i*.17];});
function context(id){let canvas=$(id);if(!canvas)return null;let rect=canvas.getBoundingClientRect();let w=rect.width,h=rect.height;if(w<10||h<10)return null;let dpr=Math.min(2,window.devicePixelRatio||1);
if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}let c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return[c,w,h];}
function sceneStars(c,w,h,t,dense=1){c.fillStyle='#050d27';c.fillRect(0,0,w,h);let g=c.createRadialGradient(w*.5,h*.45,30,w*.5,h*.5,Math.max(w,h)*.74);g.addColorStop(0,'#142861');g.addColorStop(.55,'#0b1d46');g.addColorStop(1,'#020615');c.fillStyle=g;c.fillRect(0,0,w,h);
for(let i=0;i<starSeeds.length*dense;i++){let s=starSeeds[i%starSeeds.length],x=s[0]*w,y=s[1]*h;let a=.3+.5*Math.abs(Math.sin(t*.75+s[3]));c.fillStyle=`rgba(176,215,255,${a})`;c.beginPath();c.arc(x,y,s[2],0,J2PI);c.fill();}}
function circle(c,x,y,r,col,stroke=null){c.beginPath();c.arc(x,y,Math.max(0.1,r),0,J2PI);c.fillStyle=col;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function line(c,points,color,width=2,dash=[]){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);}
function label(c,str,x,y,color='#e7f5ff',size=12,align='left'){c.fillStyle=color;c.font=`800 ${size}px Arial, sans-serif`;c.textAlign=align;c.fillText(str,x,y);c.textAlign='left';}
function planet(c,x,y,r,kind){let colors={Earth:['#64d4f8','#07549d','#071c42'],Moon:['#cbd1d5','#6b7a86','#252b39'],Mars:['#eab17c','#a44735','#421b23'],Sun:['#fff3a4','#ffc362','#ff8022']};let pal=colors[kind]||colors.Earth;let g=c.createRadialGradient(x-r*.35,y-r*.37,r*.1,x+r*.2,y+r*.1,r*1.32);g.addColorStop(0,pal[0]);g.addColorStop(.5,pal[1]);g.addColorStop(1,pal[2]);circle(c,x,y,r,g,'#e6eefb66');
if(kind==='Earth'){c.save();c.beginPath();c.arc(x,y,r,0,J2PI);c.clip();c.fillStyle='#6ac8a2';c.beginPath();c.moveTo(x-r*.65,y-r*.45);c.lineTo(x-r*.18,y-r*.65);c.lineTo(x+r*.28,y-r*.28);c.lineTo(x+r*.10,y+r*.05);c.lineTo(x-r*.37,y+r*.28);c.closePath();c.fill();c.beginPath();c.moveTo(x+.08*r,y+.36*r);c.lineTo(x+.53*r,y+.27*r);c.lineTo(x+.25*r,y+.68*r);c.closePath();c.fill();c.restore();}
if(kind==='Moon'||kind==='Mars'){for(let i=0;i<12;i++){let a=i*2.35,rho=r*(.12+(i*17%75)/100);let xx=x+Math.cos(a)*rho,yy=y+Math.sin(a)*rho;if(Math.hypot(xx-x,yy-y)>r*.81)continue;circle(c,xx,yy,r*(.025+(i%3)*.008),kind==='Moon'?'#646d7770':'#7f392a80');}}
}
function smallShip(c,x,y,r=13,rotate=0,flame=false){c.save();c.translate(x,y);c.rotate(rotate);
let grad=c.createLinearGradient(-r,0,r,0);grad.addColorStop(0,'#7896b4');grad.addColorStop(.38,'#ecf5fe');grad.addColorStop(.65,'#819ab8');grad.addColorStop(1,'#4a668b');c.fillStyle=grad;c.strokeStyle='#ebfaff';c.lineWidth=1.4;
c.beginPath();c.moveTo(0,-r);c.lineTo(r*.72,-r*.10);c.lineTo(r*.55,r*.76);c.lineTo(-r*.55,r*.76);c.lineTo(-r*.72,-r*.10);c.closePath();c.fill();c.stroke();
c.fillStyle='#2163c8';c.fillRect(-r*.54,-r*.10,r*1.08,r*.30);c.fillStyle='#b6f7ff';c.beginPath();c.arc(0,-r*.39,r*.22,0,J2PI);c.fill();
if(flame){c.fillStyle='#ffba66';c.beginPath();c.moveTo(-r*.34,r*.73);c.lineTo(0,r*(1.6+.2*Math.sin(frameNum)));c.lineTo(r*.34,r*.73);c.closePath();c.fill();}
c.restore();}
function rocket(c,x,y,stage,t,kind='generic',burning=true){
 // Physically distinct configurations: full stack, boosterless core, or upper stage.
 // This is original schematic art, NOT a scale NASA technical drawing.
 c.save();c.translate(x,y);
 const sls=kind==='sls',full=stage===0,coreOnly=sls&&stage===1;
 const h=full?182:coreOnly?153:99,w=full?23:coreOnly?22:17;
 const top=-h*.57,bottom=h*.52;
 let metal=c.createLinearGradient(-w,0,w,0);metal.addColorStop(0,'#6f8299');metal.addColorStop(.19,'#f5f9ff');metal.addColorStop(.49,'#d2dfeb');metal.addColorStop(.75,'#97adc3');metal.addColorStop(1,'#465d77');
 // Main hull and payload fairing
 c.fillStyle=metal;c.strokeStyle='#e7f5ff';c.lineWidth=1.6;
 c.beginPath();c.moveTo(0,top-20);c.lineTo(-w,top+7);c.lineTo(-w,bottom-10);c.lineTo(w,bottom-10);c.lineTo(w,top+7);c.closePath();c.fill();c.stroke();
 c.fillStyle='#1b518b';c.fillRect(-w+3,top+25,2*w-6,11);
 c.fillStyle='#87d6ff';c.fillRect(-w*.35,top+8,w*.7,8);
 // Stage split rings: upper service bay, interstage, large primary tank.
 if(full||coreOnly){
   c.fillStyle='#435f77';c.fillRect(-w,bottom-h*.43,2*w,9);
   c.fillStyle='#b2c7db';c.fillRect(-w+3,bottom-h*.16,2*w-6,4);
   c.fillStyle='#3170b3';c.fillRect(-w+3,bottom-h*.29,2*w-6,9);
 }else{
   c.fillStyle='#516a80';c.fillRect(-w,bottom-23,2*w,7);
 }
 // Thruster nozzle (engine fire only when active burn).
 c.fillStyle='#536a84';c.strokeStyle='#e4f4ff';c.beginPath();c.moveTo(-w*.48,bottom-10);c.lineTo(-w*.65,bottom+9);c.lineTo(w*.65,bottom+9);c.lineTo(w*.48,bottom-10);c.closePath();c.fill();c.stroke();
 // SLS boosters are only attached during the initial SRB+core burn.
 if(sls&&full){for(const side of [-1,1]){
   let bx=side*(w+14);
   c.fillStyle='#f0f5fd';c.strokeStyle='#889fba';
   c.beginPath();c.moveTo(bx,top+8);c.lineTo(bx-10,top+28);c.lineTo(bx-10,bottom-6);c.lineTo(bx+10,bottom-6);c.lineTo(bx+10,top+28);c.closePath();c.fill();c.stroke();
   c.fillStyle='#2666aa';c.fillRect(bx-8,top+h*.52,16,7);
   c.fillStyle='#6f8195';c.fillRect(bx-4,bottom-6,8,8);
   let jitter=8*Math.sin(t*12+side);c.fillStyle='#ffb95d';if(burning){
   c.beginPath();c.moveTo(bx-6,bottom+2);c.lineTo(bx,bottom+33+jitter);c.lineTo(bx+6,bottom+2);c.fill();}
 }}
 const jitter=8*Math.sin(t*14);
 if(burning){c.fillStyle='#ffac50';c.beginPath();c.moveTo(-w*.38,bottom+8);c.lineTo(0,bottom+44+jitter);c.lineTo(w*.38,bottom+8);c.fill();
 c.fillStyle='#fff6ac';c.beginPath();c.moveTo(-w*.17,bottom+8);c.lineTo(0,bottom+29+jitter*.3);c.lineTo(w*.17,bottom+8);c.fill();}
 c.restore();
}
function icpsPayload(c,x,y){
 // ICPS with attached payload, not a free-flying satellite. The orbit is schematic.
 c.save();c.translate(x,y);let g=c.createLinearGradient(-15,0,15,0);g.addColorStop(0,'#6e839e');g.addColorStop(.42,'#f4f7ff');g.addColorStop(1,'#4a6380');
 c.fillStyle=g;c.strokeStyle='#e3f6ff';c.lineWidth=1.4;
 c.beginPath();c.moveTo(0,-38);c.lineTo(-15,-25);c.lineTo(-15,28);c.lineTo(15,28);c.lineTo(15,-25);c.closePath();c.fill();c.stroke();
 c.fillStyle='#286ec8';c.fillRect(-12,-13,24,7);c.fillStyle='#5b718b';c.fillRect(-14,18,28,8);
 c.fillStyle='#8194aa';c.beginPath();c.moveTo(-8,28);c.lineTo(-13,38);c.lineTo(13,38);c.lineTo(8,28);c.closePath();c.fill();
 c.restore();
}
function drawStageSeparation(c,w,h,x,y,t){
 const fx=game.flight.stageFx;
 if(!fx||fx.age>=5)return;
 const time=fx.age,fade=clamp(1-time/5,0,1);
 c.save();c.globalAlpha=fade;c.translate(x,y);
 // Detached components move away from the still-attached flight vehicle.
 const metal='#bacadb',stroke='#d9e9fa';
 if(fx.type==='boosters'){
  for(const side of [-1,1]){c.save();c.translate(side*(43+time*26),12+time*34);c.rotate(side*time*.22);
   c.fillStyle=metal;c.strokeStyle=stroke;c.lineWidth=2;c.fillRect(-8,-58,16,111);c.strokeRect(-8,-58,16,111);
   c.fillStyle='#265f95';c.fillRect(-8,-5,16,9);c.restore();}
 }else{
  const wid=fx.type==='upper-stage'?16:21,hei=fx.type==='upper-stage'?76:105;
  c.save();c.translate(-50-time*12,43+time*27);c.rotate(-.18-time*.2);
  c.fillStyle=metal;c.strokeStyle=stroke;c.lineWidth=2;c.fillRect(-wid,-hei/2,2*wid,hei);c.strokeRect(-wid,-hei/2,2*wid,hei);
  c.fillStyle='#2a659c';c.fillRect(-wid,-2,2*wid,8);c.restore();
 }
 c.restore();
 // Persistent colored banner for long enough to read the separation milestone.
 const bannerWidth=Math.min(w-30,570);
 c.fillStyle='#102b46e9';c.strokeStyle='#adf4bd';c.lineWidth=2;
 c.fillRect((w-bannerWidth)/2,62,bannerWidth,38);c.strokeRect((w-bannerWidth)/2,62,bannerWidth,38);
 label(c,fx.label,w/2,86,'#d6ffb3',Math.max(9,Math.min(13,bannerWidth/43)),'center');
}
function drawOrbit(c,w,h,body,t){let x=w*.53,y=h*.54,r=Math.min(w*.19,h*.25);planet(c,x,y,r,body);
let rad=Math.min(w*.32,h*.39),theta=t*.8;
c.strokeStyle='#7bdbfe8a';c.lineWidth=2;c.setLineDash([7,7]);c.beginPath();c.ellipse(x,y,rad,rad*.85,0,0,J2PI);c.stroke();c.setLineDash([]);
let sx=x+rad*Math.cos(theta),sy=y+rad*.85*Math.sin(theta);smallShip(c,sx,sy,15,Math.atan2(Math.cos(theta),-Math.sin(theta)));
label(c,`${body.toUpperCase()} · LOCAL ORBIT`,16,23,'#8cf1ff',14);label(c,'Illustrative two-body orbit visualization · not to scale',16,h-17,'#b6c9e7',10);
return[sx,sy];}
function drawAscent(c,w,h,t){let f=game.flight;
let x=w*.29,y=h*.69,r=Math.min(w*.27,h*.44);planet(c,x,y,r,'Earth');
c.strokeStyle='#8ce0ff80';c.setLineDash([6,6]);c.lineWidth=2;c.beginPath();c.ellipse(x,y,r*1.27,r*1.16,0,0,J2PI);c.stroke();c.setLineDash([]);
let pct=f.status==='ascent'?clamp(f.launchTime/(metrics().burn1Sec+metrics().burn2Sec),0,1):f.status==='parking'?1:0;
let xx=x+r*.62+pct*w*.25, yy=y+r*.65-pct*h*.9;
const m=metrics(),sls=!!m.realRocket;
if(f.status==='ascent'||f.status==='countdown')rocket(c,xx,yy,Math.min(f.stage,1),t,sls?'sls':'generic',f.status==='ascent');
else if(sls && f.stageFx && f.stageFx.type==='core' && f.stageFx.age<5)icpsPayload(c,xx,yy); // ICPS/payload retained
else smallShip(c,xx,yy,15,-1.2);
if(f.stageFx&&f.stageFx.age<5)drawStageSeparation(c,w,h,xx,yy,t);
 if(f.status==='countdown'){
  c.save();c.fillStyle='#020b22bb';c.strokeStyle='#a0ff69';c.lineWidth=2;c.beginPath();c.roundRect(w*.35,h*.19,w*.3,h*.22,12);c.fill();c.stroke();
  label(c,'T−'+Math.ceil(f.countdownRemaining),w*.50,h*.31,'#ddff8e',Math.min(46,w*.075),'center');
  label(c,'ALL SYSTEMS GO',w*.50,h*.36,'#e8f6ff',12,'center');c.restore();
 }
label(c,f.status==='ascent'?'ACTIVE LAUNCH · MULTISTAGE VEHICLE':f.status==='parking'||f.status==='orbit'?'STAGE SEPARATION · PAYLOAD DEPLOYED':'PRELAUNCH · STAGE SEQUENCE',16,23,'#9ceaff',14);
const name=f.status==='ascent'?(sls?(f.stage===0?'SRB + CORE BURN':'BOOSTERS RELEASED · CORE BURN'):(f.stage===0?'FIRST STAGE BURN':'FIRST STAGE RELEASED · SECOND STAGE BURN')):
 (f.status==='parking'||f.status==='orbit'?'UPPER STAGE / PAYLOAD COAST':'PREPARED FOR IGNITION');
label(c,`T+${f.launchTime.toFixed(0)} s · ${name}`,16,h-17,'#c4d6eb',11);
return[xx,yy];}
function drawMoonTransfer(c,w,h,t){let f=game.flight,p=metrics().plan,ex=w*.20,ey=h*.62,mx=w*.81,my=h*.66;
planet(c,ex,ey,Math.min(45,h*.12),'Earth');planet(c,mx,my,Math.min(27,h*.075),'Moon');
let path=[];for(let i=0;i<=130;i++){let frac=i/130,M=Math.PI*frac,E=M;
 for(let k=0;k<9;k++)E-=(E-p.e*Math.sin(E)-M)/(1-p.e*Math.cos(E));
 let a=p.a,e=p.e,x=a*(Math.cos(E)-e),y=a*Math.sqrt(1-e*e)*Math.sin(E);
 path.push([ex+((p.r1-x)/(p.r1+p.r2))*(mx-ex),ey-y/p.r2*(mx-ex)*.55]);}
 line(c,path,'#397ba6',2,[5,5]);let point=path[Math.round(f.progress*130)];line(c,path.slice(0,Math.round(f.progress*130)+1),'#7beaff',3);
 smallShip(c,point[0],point[1],13,1.2);label(c,'EARTH → MOON · TRANSFER',15,24,'#a1edff',14);label(c,'Earth–Moon two-body transfer ellipse · approximate',15,h-16,'#b9cced',10);
 return point;}
function drawMarsTransfer(c,w,h,t){let f=game.flight,p=metrics().plan;
 // Use a fixed rotated reference frame so departure Earth and arrival Mars remain
 // visible at either end of the illustrated Hohmann arc. The orbital radii and
 // transfer timing come from the computed model; this is not a JPL sky chart.
 let cx=w*.50,cy=h*.59,scale=Math.min(w*.30,h*.47)/1.52;
 let start=Math.PI;const r1=norm(p.earth),r2=norm(p.mars);
 const polarToPx=(r,a)=>[cx+r*scale*Math.cos(a),cy+r*scale*Math.sin(a)];
 planet(c,cx,cy,Math.min(18,h*.05),'Sun');
 for(let [name,r,ink] of[['EARTH',r1,'#6bcfff'],['MARS',r2,'#ff8b71']]){
  c.strokeStyle=ink+'7b';c.lineWidth=1.2;c.beginPath();c.arc(cx,cy,r*scale,0,J2PI);c.stroke();
 }
 const e=p.e,a=p.a;let path=[];
 for(let i=0;i<=140;i++){let frac=i/140,M=Math.PI*frac,E=M;
  for(let k=0;k<10;k++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
  // p.a is in kilometers; the Solar drawing uses AU for planetary radii.
  // Without /AU, Mars transfer coordinates are millions of pixels offscreen.
  let rhoAU=(a/AU)*(1-e*Math.cos(E)),v=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));
  path.push(polarToPx(rhoAU,start+v));}
 line(c,path,'#68d8fa',2.5,[7,5]);line(c,path.slice(0,Math.max(2,Math.round(f.progress*140)+1)),'#bbfaff',3.5);
 let earth=polarToPx(r1,start),mars=polarToPx(r2,start+Math.PI);
 planet(c,earth[0],earth[1],8,'Earth');planet(c,mars[0],mars[1],10,'Mars');
 label(c,'EARTH',earth[0]+10,earth[1]-13,'#88dbff',10);label(c,'MARS TARGET',mars[0]+13,mars[1]-13,'#ffaf99',10);
 let point=path[Math.round(f.progress*140)];smallShip(c,point[0],point[1],12,1);
 label(c,'EARTH → MARS · HELIOCENTRIC TRANSFER',16,25,'#9eeeff',13);
label(c,`${f.status==='parking'?'PLANNED TRANSFER · NOT YET DEPARTED':f.status==='cruise'?'TRANSIT '+Math.round(f.progress*100)+'% · DAY '+f.days.toFixed(1):f.status==='failed'?'TRAJECTORY DID NOT CAPTURE':'TRANSFER'} · ≈ ${p.days.toFixed(0)} DAY FLIGHT`,16,46,'#ffdb99',11);
label(c,'Route orientation schematic · JPL reference orbital radii · simulated Hohmann transfer',16,h-16,'#c1d2e9',10);
 return point;}
function drawHazard(c,w,h,t,ship){let f=game.flight,k=f.activeEvent;if(!k)return;
 const[shipX,shipY]=ship;
 if(k==='solar'){
  let sx=w*.13,sy=h*.22;
  for(let j=0;j<4;j++){
   let rr=18+j*16+Math.sin(t*4-j)*5;c.beginPath();c.strokeStyle=`rgba(255,145,57,${.45-j*.07})`;c.lineWidth=3;c.arc(sx,sy,rr,-Math.PI/3,Math.PI*1.5);c.stroke();}
  planet(c,sx,sy,26,'Sun');
  for(let j=0;j<55;j++){let frac=((j*.173+t*(.18+(j%4)*.025))%1),wobble=(j%9-4)*7;
   let x=sx+(shipX-sx)*frac,y=sy+(shipY-sy)*frac+wobble*Math.sin(Math.PI*frac);
   circle(c,x,y,1.4+(j%3)*.7,j%2?'#ffd183':'#ff7b6c');}
  label(c,'SOLAR PARTICLE STREAM',sx+20,sy+70,'#ffc28b',11);
 }else if(k==='comms'){
  c.strokeStyle='#8ddaff';c.lineWidth=3;c.setLineDash([4,8]);
  for(let rr=18;rr<=85;rr+=20){c.beginPath();c.arc(shipX,shipY,rr,-.9,.9);c.stroke();}c.setLineDash([]);
  label(c,'SIGNAL INTERRUPTED',shipX-65,shipY-95,'#ffbd99',12);
 }else if(k==='ground'||k==='eclipse'||k==='thermal'){
  if(k==='eclipse'){c.fillStyle='#0207168a';c.fillRect(0,0,w,h);c.strokeStyle='#a9c5f8';c.lineWidth=2;c.setLineDash([5,7]);c.beginPath();c.arc(shipX,shipY,58+7*Math.sin(t*3),0,J2PI);c.stroke();c.setLineDash([]);label(c,'ECLIPSE · POWER WARNING',shipX-110,shipY-85,'#ffcc83',11);} 
  else if(k==='thermal'){for(let i=0;i<12;i++){let a=i*.58+t*1.3,r=42+12*Math.sin(t*2+i);circle(c,shipX+r*Math.cos(a),shipY+r*Math.sin(a),2.3,'#8bcbff');}label(c,'THERMAL CONTROL ALERT',shipX-95,shipY-78,'#d3e9ff',11);} 
  else{c.strokeStyle='#ffcf85';c.lineWidth=3;c.setLineDash([5,7]);for(let r=32;r<=78;r+=19){c.beginPath();c.arc(shipX,shipY,r,-.8,.8);c.stroke();}c.setLineDash([]);label(c,'GROUND LINK INTERRUPTED',shipX-90,shipY-88,'#ffbd8f',11);} 
 }else if(k==='navigation'){
  c.strokeStyle='#ff876d';c.lineWidth=2;c.setLineDash([7,6]);c.beginPath();c.moveTo(shipX,shipY);c.lineTo(shipX+80,shipY-75);c.stroke();c.setLineDash([]);
  circle(c,shipX+80,shipY-75,7,'#ffb37a');label(c,'CORRECTION REQUIRED',shipX+18,shipY-91,'#ffd39f',12);
 }
}
function drawFlight(t){let out=context('flight-canvas');if(!out)return;const[c,w,h]=out,f=game.flight;
sceneStars(c,w,h,t);
let ship;
if(f.status==='cruise')ship=game.mission==='Moon'?drawMoonTransfer(c,w,h,t):drawMarsTransfer(c,w,h,t);
else if(f.status==='orbit')ship=drawOrbit(c,w,h,game.mission==='Earth'?'Earth':game.mission,t);
else if(f.stageFx&&f.stageFx.age<5&&(f.status==='parking'||(f.status==='orbit'&&game.mission==='Earth')))ship=drawAscent(c,w,h,t);
else if(f.status==='parking' && game.mission!=='Earth'){
 ship=game.mission==='Moon'?drawMoonTransfer(c,w,h,t):drawMarsTransfer(c,w,h,t);
 label(c,'TRANSFER TRAJECTORY PREVIEW · DEPARTURE NOT STARTED',16,50,'#d9f8a2',11);
}
else if(f.status==='failed'&&f.progress>0)ship=game.mission==='Moon'?drawMoonTransfer(c,w,h,t):drawMarsTransfer(c,w,h,t);
else ship=drawAscent(c,w,h,t);
if(f.activeEvent)drawHazard(c,w,h,t,ship);
if(f.status==='cruise')label(c,`DAY ${f.days.toFixed(1)} / ${metrics().plan.days.toFixed(1)}`,w-18,24,'#f7d18c',13,'right');
if(f.status==='orbit')label(c,'ORBITAL CAPTURE COMPLETE ✓',w-20,26,'#b0ffb3',12,'right');
if(f.status==='failed')label(c,'MISSION FAILED / TARGET MISSED',w-20,28,'#ff9ba0',12,'right');
}

// Solar overview: NASA/JPL Table 1 positions for planets. The spacecraft
// mission inset is an independent EDUCATIONAL simulation, not JPL telemetry.
// ------- V1.9 synchronized, multi-planet two-dimensional orrery -------
// Published JPL 1800–2050 approximate heliocentric elements, not Horizons
// spacecraft ephemerides. Distances compressed on-screen for legibility.
function jplEllipsePoint(body,date,E){
 const row=JPL[body],T=(+date-Date.UTC(2000,0,1,12))/(86400000*36525);
 const[a,e,I,L,peri,node]=row[0].map((v,i)=>v+T*row[1][i]);
 const xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E);
 const o=rad(node),w=rad(peri-node),inc=rad(I);
 const co=Math.cos(o),so=Math.sin(o),cw=Math.cos(w),sw=Math.sin(w),ci=Math.cos(inc),si=Math.sin(inc);
 return[(cw*co-sw*so*ci)*xp+(-sw*co-cw*so*ci)*yp,(cw*so+sw*co*ci)*xp+(-sw*so+cw*co*ci)*yp,0];
}
function solarPoint(p,cx,cy,radius,scope){
 const distance=Math.hypot(p[0],p[1]);
 // Logarithmic radial compression lets Mercury and Neptune both fit in one canvas.
 // Never use screen-space radii for physics / transfer delta-v calculations.
 const factor=scope==='inner'?distance/1.83:Math.log1p(4*distance)/Math.log1p(4*30.5);
 const a=Math.atan2(p[1],p[0]);
 return[cx+factor*radius*Math.cos(a),cy-factor*radius*Math.sin(a)];
}
function drawOrrery(c,w,h,date,scope=solarScope){
 const cx=w*.425,cy=h*.51,radius=Math.min(w*.395,h*.445);
 const names=scope==='inner'?PLANET_NAMES.slice(0,4):PLANET_NAMES;
 const project=p=>solarPoint(p,cx,cy,radius,scope);
 c.save();c.strokeStyle='#234f7f';c.lineWidth=1;c.setLineDash([2,8]);
 c.beginPath();c.moveTo(cx-radius-15,cy);c.lineTo(cx+radius+15,cy);c.moveTo(cx,cy-radius-15);c.lineTo(cx,cy+radius+15);c.stroke();c.restore();
 const pts={};
 for(const name of names){
  const points=[];
  for(let i=0;i<=100;i++)points.push(project(jplEllipsePoint(name,date,J2PI*i/100)));
  line(c,points,PLANET_COLORS[name]+'78',1.1);
  const p=jplPosition(name,date),pos=project(p);pts[name]=pos;
  let r=PLANET_SIZES[name]*(w<480?.78:1);
  circle(c,pos[0],pos[1],r,PLANET_COLORS[name],'#f2f5ff');
  if(name==='Saturn'){
   c.save();c.strokeStyle='#f0d1a6';c.lineWidth=1.3;c.beginPath();c.ellipse(pos[0],pos[1],r*1.9,r*.67,-.22,0,J2PI);c.stroke();c.restore();
  }
  label(c,name.toUpperCase(),Math.min(w-75,pos[0]+r+5),Math.max(13,pos[1]-r-3),PLANET_COLORS[name],w<650?8:9);
 }
 planet(c,cx,cy,Math.max(7,Math.min(13,radius*.065)),'Sun');
 return{cx,cy,radius,project,pts};
}
function marsTransferVector(plan,frac){
 const e=plan.e,a=plan.a/AU,M=Math.PI*clamp(frac,0,1);
 let E=M;
 for(let n=0;n<18;n++){
  const delta=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=delta;if(Math.abs(delta)<1e-12)break;
 }
 const nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));
 const theta=angle(plan.earth)+nu,r=a*(1-e*Math.cos(E));
 return[r*Math.cos(theta),r*Math.sin(theta),0];
}
function drawSolarMission(c,w,h,t,orrery,compact=false){
 const f=game.flight,mission=game.mission,plan=metrics().plan;
 if(mission==='Mars'){
  const visible=[];
  for(let k=0;k<=90;k++)visible.push(orrery.project(marsTransferVector(plan,k/90)));
  line(c,visible,'#5cdfff',1.8,[5,5]);
  const frac=clamp(['cruise','failed'].includes(f.status)?f.progress:f.status==='orbit'?1:0,0,1);
  line(c,visible.slice(0,Math.max(2,Math.ceil(frac*90)+1)),'#ceff83',2.9);
  const p=orrery.project(marsTransferVector(plan,frac));smallShip(c,p[0],p[1],compact?7:10,frac*Math.PI/2);
  const future=jplPosition('Mars',new Date(+plan.launchDate+plan.days*86400000));
  const target=orrery.project(future);
  c.save();c.strokeStyle='#ffc07c';c.lineWidth=1.5;c.setLineDash([3,4]);c.beginPath();c.arc(target[0],target[1],compact?7:11,0,J2PI);c.stroke();c.restore();
 }else if(orrery.pts.Earth){
  const e=orrery.pts.Earth,theta=(f.days+solarDayOffset+f.orbitalTime*.2)*.9;
  const r=compact?10:14;
  c.save();c.strokeStyle='#abf2ff';c.lineWidth=1;c.setLineDash([2,4]);c.beginPath();c.arc(e[0],e[1],r,0,J2PI);c.stroke();c.restore();
  if(f.status!=='failed')smallShip(c,e[0]+r*Math.cos(theta),e[1]+r*Math.sin(theta),compact?5:7,theta);
 }
}
function drawMoonInset(c,w,h,t,compact){
 const f=game.flight,plan=metrics().plan;
 const bw=Math.min(compact?158:240,w*.40),bh=Math.min(compact?114:175,h*.43);
 const bx=w-bw-12,by=h-bh-12;
 c.save();c.fillStyle='rgba(7,25,51,.94)';c.strokeStyle='#467aab';c.lineWidth=1.2;c.fillRect(bx,by,bw,bh);c.strokeRect(bx,by,bw,bh);c.restore();
 label(c,'EARTH–MOON LOCAL VIEW',bx+9,by+17,'#9beaff',compact?8:10);
 const ex=bx+bw*.35,ey=by+bh*.57,rr=bw*.27;
 planet(c,ex,ey,compact?12:18,'Earth');
 c.save();c.strokeStyle='#5f88be';c.setLineDash([4,3]);c.beginPath();c.arc(ex,ey,rr,0,J2PI);c.stroke();c.restore();
 const moonPhase=(f.days+solarDayOffset)/(27.321661)*J2PI;
 planet(c,ex+rr*Math.cos(moonPhase),ey+rr*Math.sin(moonPhase),compact?5:7,'Moon');
 const prog=clamp(['cruise','failed'].includes(f.status)?f.progress:f.status==='orbit'?1:0,0,1);
 const path=[];for(let k=0;k<=55;k++){const u=k/55;path.push([ex+rr*u,ey-rr*.46*Math.sin(Math.PI*u)]);}
 line(c,path,'#78dffc',1.7,[3,3]);
 const ship=path[Math.round(55*prog)];smallShip(c,ship[0],ship[1],compact?5:8);
 label(c,'SIMULATED LOCAL TRANSFER',bx+9,by+bh-9,'#d9e7ff',compact?8:9);
}
function drawSolarSystem(t){
 const ctx=context('solar-canvas');if(!ctx)return;
 const[c,w,h]=ctx,date=solarDate();sceneStars(c,w,h,t,.7);
 const orrery=drawOrrery(c,w,h,date);
 drawSolarMission(c,w,h,t,orrery);
 label(c,'SOLAR SYSTEM · JPL TABLE 1 · EIGHT PLANETS',14,25,'#b1f0ff',w<650?10:13);
 label(c,date.toISOString().slice(0,10)+' UTC · '+solarSpeed+'× '+(solarPlaying?'RUNNING':'PAUSED'),14,44,'#ccdcfa',10);
 if(game.mission==='Moon')drawMoonInset(c,w,h,t,false);
 else{
  const f=game.flight;
  const status=f.status==='cruise'?`CRUISE ${Math.round(f.progress*100)}% · ${f.days.toFixed(1)} DAYS`:f.status==='orbit'?'ARRIVAL ORBIT · EDUCATIONAL':f.status==='failed'?'TRANSFER FAILED':f.status.toUpperCase();
  label(c,status,14,h-32,f.status==='failed'?'#ffa3a6':'#d7ff95',w<650?9:11);
 }
 label(c,'Orbital distances compressed · planet elements: JPL 1800–2050 · transfers: illustrative',14,h-12,'#c2cee9',w<650?8:9);
}
function drawLanding(t){let out=context('landing-canvas');if(!out)return;const[c,w,h]=out,f=game.flight,l=f.landing||{status:'ready',alt:2000,vy:0,site:landingSites()[0]},body=game.mission;
let isMars=body==='Mars',isEarth=body==='Earth';let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,isMars?'#1b1027':isEarth?'#1b4978':'#080d2f');g.addColorStop(1,isMars?'#79402f':isEarth?'#79b2c6':'#202a4a');c.fillStyle=g;c.fillRect(0,0,w,h);
for(let s of starSeeds.slice(0,isEarth?10:70)){c.fillStyle='#cfdef8aa';c.fillRect(s[0]*w,s[1]*h,s[2],s[2]);}
if(body==='Moon')planet(c,w*.81,h*.20,24,'Earth');
if(body==='Mars'){circle(c,w*.81,h*.20,13,'#d9c9ae');label(c,'PHOBOS (ILLUSTRATIVE)',w*.81-84,h*.20+26,'#e4c0a2',9);}
const ground=h*.79;c.fillStyle=isMars?'#94462f':isEarth?'#275b80':'#535c6d';c.beginPath();c.moveTo(0,ground);for(let i=0;i<=20;i++)c.lineTo(i*w/20,ground+Math.sin(i*1.9)*12+Math.cos(i*.8)*8);c.lineTo(w,h);c.lineTo(0,h);c.fill();
c.fillStyle=isMars?'#c4774b':isEarth?'#5198b7':'#929ca7';c.fillRect(0,ground+18,w,h-ground);
for(let j=0;j<14;j++){let x=(j*73)%w,y=ground+23+(j*23)%(h-ground-20);c.beginPath();c.ellipse(x,y,7+(j%3)*4,2.5,0,0,J2PI);c.fillStyle=isMars?'#572d2b':'#52596a';c.fill();}
let progress=clamp(1-(l.alt/2000),0,1);let shipX=w*.48,shipY=h*.19+progress*(ground-h*.22);if(l.status==='landed')shipY=ground-21;
// Original illustrated lander, retained as a training vehicle.
c.save();c.translate(shipX,shipY);c.strokeStyle='#c7dcf4';c.lineWidth=3;
c.beginPath();c.moveTo(-19,9);c.lineTo(-35,25);c.lineTo(-50,25);c.moveTo(19,9);c.lineTo(35,25);c.lineTo(50,25);c.stroke();
let lg=c.createLinearGradient(-24,-20,24,25);lg.addColorStop(0,'#f4f7ff');lg.addColorStop(.5,'#899fba');lg.addColorStop(1,'#33496c');c.fillStyle=lg;c.fillRect(-20,-16,40,37);
c.fillStyle='#3b97d9';c.fillRect(-33,-3,11,16);c.fillRect(22,-3,11,16);c.fillStyle='#f0c886';c.fillRect(-9,-10,18,15);
if(l.status==='descending'&&body!=='Earth'){c.fillStyle='#ffbb6c';c.beginPath();c.moveTo(-9,22);c.lineTo(0,45+12*Math.sin(t*19));c.lineTo(9,22);c.fill();}c.restore();
if(body==='Earth'&&l.status==='descending'){c.beginPath();c.arc(shipX,shipY-50,58,Math.PI,2*Math.PI);c.strokeStyle='#e4eeff';c.lineWidth=6;c.stroke();line(c,[[shipX-55,shipY-49],[shipX-18,shipY-14]],'#fff',2);line(c,[[shipX+55,shipY-49],[shipX+18,shipY-14]],'#fff',2);}
label(c,`${body.toUpperCase()} · TERMINAL DESCENT TRAINER`,16,25,'#abefff',14);
label(c,l.status==='descending'?`ALT ${fmt(l.alt)} m  ·  VERTICAL SPEED ${l.vy.toFixed(1)} m/s`:l.status.toUpperCase(),16,h-18,'#fcf0d1',11);
}
// Subtle animated star background (separate from flight scene).
function drawPageStars(t){let out=context('star-bg');if(!out)return;let[c,w,h]=out;c.clearRect(0,0,w,h);let grad=c.createRadialGradient(w*.38,h*.35,30,w*.38,h*.4,w*.9);grad.addColorStop(0,'#11265a');grad.addColorStop(1,'#040814');c.fillStyle=grad;c.fillRect(0,0,w,h);for(let i=0;i<160;i++){let s=starSeeds[i];c.fillStyle=`rgba(155,194,255,${.11+.18*Math.abs(Math.sin(t*.16+s[3]))})`;c.fillRect(s[0]*w,s[1]*h,s[2],s[2]);}}
function updateHUD(){if(game.step!=='flight')return;let stageBox=$('staging-readout');if(stageBox)stageBox.innerHTML=stagingReadout();let box=$('telemetry-meters');if(box)box.innerHTML=flightMeters();let realBox=$('real-propellant-view');if(realBox && game.flight.status==='ascent' && metrics().realRocket)realBox.innerHTML=actualFlightData(metrics());let cap=$('flight-caption');if(cap)cap.textContent=flightCaption();}
function animate(timestamp){const t=timestamp/1000;let dt=lastTime?Math.min(.09,t-lastTime):0;lastTime=t;frameNum++;
if(!modalOpen && (!solarOpen || solarPlaying)){if(game.flight.stageFx&&game.flight.stageFx.age<5&&!game.flight.paused)game.flight.stageFx.age+=dt;
 if(game.flight.status==='countdown')countdownAdvance(dt);
 if(game.flight.status==='ascent'&&!game.flight.paused)igniteAdvance(dt);else if(game.flight.status==='cruise' && solarPlaying)cruiseAdvance(dt*solarSpeed);
 if(game.flight.landing&&game.flight.landing.status==='descending')landingAdvance(dt);
 if(game.flight.status==='orbit'&&solarPlaying)game.flight.orbitalTime+=dt*solarSpeed;
}
// Outside transfer, show continuously running planet positions in the same preview epoch.
if(solarPlaying&&game.flight.status!=='cruise'&&!modalOpen)solarDayOffset=Math.min(3650,solarDayOffset+dt*2*solarSpeed);
if(game.step==='flight'){drawFlight(t);drawFlightSolarMonitor(t);}if(game.step==='operations')drawLanding(t);
if(solarOpen){drawSolarSystem(t);$('solar-date').textContent=solarDate().toISOString().slice(0,10)+' UTC · JPL APPROX';}
if(t-lastHudUpdate>.33){updateHUD();lastHudUpdate=t;}drawPageStars(t);
requestAnimationFrame(animate);}
// -------------------- V1.8: device-only profiles and score history --------------------
// Static itch.io hosting has no server/database. Authentication here is ONLY a
// per-browser demo. Credentials are never transmitted, but a user with access
// to this browser's storage can tamper with profiles and scores.
const PROFILE_KEY='moonbound.localProfiles.v18';
let signedInProfile=null;
let profileError='';
function profileDatabase(){try{const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');return p && typeof p==='object' && !Array.isArray(p)?p:{};}catch{return {};}}
function saveProfileDatabase(p){localStorage.setItem(PROFILE_KEY,JSON.stringify(p));}
function profileSnapshot(){return {mission:game.mission,roles:game.roles,step:game.step,visited:game.visited,build:game.build,quiz:game.quiz,flight:game.flight,reviewNotes:game.reviewNotes,reflections:game.reflections||['','',''],scoredRunId:game.scoredRunId||null};}
function loadProfileSnapshot(s){if(!s||!MS[s.mission])return;Object.assign(game,s);game.flight=Object.assign(defaultFlight(),s.flight||{});game.build=Object.assign(defaultBuild(game.mission),s.build||{});ensureCargo(game.build);game.quiz=Object.assign({answers:{},submitted:false,score:0},s.quiz||{});}
function profileSave(quiet=false){const snap=profileSnapshot();if(signedInProfile){let db=profileDatabase();let entry=db[signedInProfile];if(entry){entry.saved=snap;entry.updatedUTC=new Date().toISOString();saveProfileDatabase(db);}}else{localStorage.setItem('moonbound-web-v1',JSON.stringify(snap));}if(!quiet)setNotice(signedInProfile?'Profile progress saved on this device.':'Guest progress saved in this browser.');}
function renderProfileChip(){const chip=$('profile-btn');if(!chip)return;let profile=profileDatabase()[signedInProfile];chip.textContent=profile?`👤 ${signedInProfile} · ${profile.points||0} PTS`:'👤 GUEST';chip.title='Local profile only · no cloud synchronization';}
function hashB64(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes)));}
function decodeB64(str){return Uint8Array.from(atob(str),c=>c.charCodeAt(0));}
async function deriveLocalVerifier(password,saltBase64){if(!crypto?.subtle)throw new Error('Secure context required. Open from itch.io or localhost.');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const out=await crypto.subtle.deriveBits({name:'PBKDF2',salt:decodeB64(saltBase64),iterations:180000,hash:'SHA-256'},key,256);
 return hashB64(out);
}
function openProfile(){modalOpen=true;const root=$('modal-root');root.hidden=false;const db=profileDatabase(),names=Object.keys(db);
 let person=signedInProfile?db[signedInProfile]:null;
 root.innerHTML=`<div class="modal-card account-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
  <div class="modal-head"><h2 id="profile-title">${person?'My Mission Profile':'Local Player Sign-in'}</h2><button class="btn btn-ghost btn-sm" id="profile-close">✕ CLOSE</button></div>
  <p class="muted small">DEVICE-ONLY DEMO: profiles and scores are stored in this browser. No online account, password recovery, global leaderboard or cross-device sync. Never reuse an important password.</p>
  ${person?`<div class="profile-stat-row"><div class="profile-stat"><strong>${Number(person.points)||0}</strong>Points</div><div class="profile-stat"><strong>${(person.history||[]).length}</strong>Missions</div><div class="profile-stat"><strong>${(person.history||[]).filter(x=>x.complete).length}</strong>Successes</div></div><div class="profile-history">${(person.history||[]).slice(-6).reverse().map(h=>`<p>${esc(h.mission)} · ${h.complete?'COMPLETED':'ATTEMPTED'} · +${h.points} pts · ${esc(h.date)}</p>`).join('')||'<p>No scored missions yet.</p>'}</div><div class="profile-actions"><button class="btn btn-primary" id="profile-save">SAVE PROGRESS</button><button class="btn btn-ghost" id="profile-logout">SIGN OUT</button></div>`:
  `<p class="small muted">${names.length?`Existing local profiles: ${names.map(esc).join(', ')}`:'Create your first local profile below.'}</p><form id="profile-form" class="profile-form"><label>Player name<input id="local-user" autocomplete="username" maxlength="22" placeholder="3–22 letters, numbers, _ or -" required></label>
   <label>Local passphrase<input id="local-pass" type="password" autocomplete="current-password" minlength="8" placeholder="At least 8 characters" required></label>
   <p class="tiny muted">The passphrase is salted and processed using PBKDF2/SHA-256 (180,000 iterations). Local score data is not tamper-proof.</p>
   <div class="profile-actions"><button type="button" class="btn btn-ghost" id="profile-register">CREATE LOCAL PROFILE</button><button type="submit" class="btn btn-primary">SIGN IN</button></div></form>`}
  <p id="profile-feedback" class="small" aria-live="polite" style="color:#ffd394">${esc(profileError)}</p>
 </div>`;
 const close=()=>{modalOpen=false;root.hidden=true;root.innerHTML='';profileError='';};
 $('profile-close').addEventListener('click',close);
 if(person){$('profile-save').addEventListener('click',()=>{profileSave();openProfile();});$('profile-logout').addEventListener('click',()=>{profileSave(true);signedInProfile=null;const saved=JSON.parse(localStorage.getItem('moonbound-web-v1')||'null');if(saved)loadProfileSnapshot(saved);else {game.mission='Moon';game.roles=['Pilot','Scientist','Systems Engineer','Comms Officer'];game.step='mission';game.visited=['mission'];game.build=defaultBuild('Moon');game.quiz={answers:{},submitted:false,score:0};game.flight=defaultFlight();game.reflections=['','',''];}render();close();setNotice('Signed out. Guest game restored.');});}
 else{
  const work=async(create)=>{const name=$('local-user').value.trim(),password=$('local-pass').value;if(!/^[a-zA-Z0-9_-]{3,22}$/.test(name)){$('profile-feedback').textContent='Use a 3–22 character name: letters, numbers, _ or -.';return;}
   if(password.length<8){$('profile-feedback').textContent='Use at least 8 characters for the local passphrase.';return;}
   const p=profileDatabase();try{if(create){if(p[name])throw Error('This local profile already exists. Sign in instead.');
       const salt=hashB64(crypto.getRandomValues(new Uint8Array(16))),verifier=await deriveLocalVerifier(password,salt);
       p[name]={salt,verifier,points:0,history:[],saved:profileSnapshot(),createdUTC:new Date().toISOString()};saveProfileDatabase(p);
     }else{if(!p[name])throw Error('No local profile found for that name.');const verifier=await deriveLocalVerifier(password,p[name].salt);if(verifier!==p[name].verifier)throw Error('Incorrect local passphrase.');if(p[name].saved)loadProfileSnapshot(p[name].saved);}
     signedInProfile=name;render();close();renderProfileChip();setNotice(`Local profile ${name} active. Progress and scores stay on this device.`);
   }catch(error){const node=$('profile-feedback');if(node)node.textContent=error.message;}};
  $('profile-register').addEventListener('click',()=>work(true));$('profile-form').addEventListener('submit',e=>{e.preventDefault();work(false);});
 }
}
function awardLocalPoints(){if(!signedInProfile)return;const f=game.flight;if(f.practiceAdjusted||!f.runId||!['orbit','failed'].includes(f.status))return;
 // Award for a concluded attempt or an achieved mission; never for a draft.
 if(f.status==='orbit'&&!(f.scienceComplete&&f.downlinked))return;
 const p=profileDatabase(),entry=p[signedInProfile];if(!entry)return;
 if((entry.history||[]).some(x=>x.id===f.runId))return;
 const complete=f.status==='orbit'&&f.scienceComplete&&f.downlinked;
 const earned=complete?Math.min(300,80+Math.round(reportScore()*2)):Math.min(50,15+Math.round(reportScore()*.3));
 entry.points=(entry.points||0)+earned;entry.history=entry.history||[];entry.history.push({id:f.runId,mission:game.mission,points:earned,complete,date:new Date().toISOString().slice(0,10)});
 entry.saved=profileSnapshot();saveProfileDatabase(p);renderProfileChip();setNotice(`Mission recorded: +${earned} local profile points.`);
}
// -------------------- V1.8: in-flight maintenance / onboard supplies --------------------
let flightSupplyUI={item:'repair',from:0,to:1};
function renderFlightService(){const f=game.flight,b=game.build;ensureCargo(b);
 const active=['cruise','orbit'].includes(f.status),key=f.activeEvent;
 const choices=b.rooms.map((r,i)=>r?`<option value="${i}" ${Number(flightSupplyUI.from)===i?'selected':''}>${i+1} · ${esc(MODULES[r][0])}</option>`:'').join('');
 const targets=b.rooms.map((r,i)=>r?`<option value="${i}" ${Number(flightSupplyUI.to)===i?'selected':''}>${i+1} · ${esc(MODULES[r][0])}</option>`:'').join('');
 const itemopts=SUPPLY_KINDS.map(k=>`<option value="${k}" ${flightSupplyUI.item===k?'selected':''}>${esc(SUPPLIES[k].label)}</option>`).join('');
 const manifest=b.rooms.map((r,i)=>`<div class="service-bay ${r?'':'service-bay-empty'}"><strong>BAY ${i+1} · ${r?esc(MODULES[r][0]):'Empty'}</strong>${r?`<small>${cargoUnits(b.cabinCargo[i])} / ${cabinCapacity(r)} safe slots</small>${SUPPLY_KINDS.map(k=>`<div class="cargo-item-row"><span>${SUPPLIES[k].icon} ${esc(SUPPLIES[k].label)}</span><div class="cargo-stepper"><button type="button" aria-label="Remove ${esc(SUPPLIES[k].label)} from Bay ${i+1}" data-action="flight-cargo-adjust" data-value="${i}:${k}:-1">−</button><output>${b.cabinCargo[i][k]||0}</output><button type="button" aria-label="Add ${esc(SUPPLIES[k].label)} to Bay ${i+1}" data-action="flight-cargo-adjust" data-value="${i}:${k}:1">＋</button></div></div>`).join('')}`:'No installed room'}</div>`).join('');
 const help=active?'Use + / − to freely edit cabin stocks for scenario testing. Such mid-flight edits mark this run as PRACTICE and disable profile point awards. Realistic moving still requires adjacent bays and consumes power; repairs consume actual packs.':'Cabin servicing unlocks during cruise or at the destination. Prelaunch logistics remain in BUILD.';
 return `<details class="flight-service" ${key||serviceDrawerOpen?'open':''}><summary><strong>🛠 CABIN OPERATIONS / REPAIR WORKSHOP</strong> · ${key?'ACTIVE HAZARD':'MANIFEST'} · ${f.practiceAdjusted?'PRACTICE MODE':'STANDARD'}</summary><div class="service-bay-grid" style="margin-top:9px">${manifest}</div>
 <div class="service-controls"><label>SUPPLY<select data-flight-supply="item">${itemopts}</select></label><label>FROM<select data-flight-supply="from">${choices}</select></label><label>TO<select data-flight-supply="to">${targets}</select></label>${btn('MOVE ONE BAY','flight-move-supply','','btn-ghost btn-sm',!active)}</div>
 ${key==='solar'?btn('🔋 USE STORM BACKUP POWER','flight-use-supply','battery','btn-primary btn-sm'):
 key==='comms'||key==='ground'?btn('🛠 REPAIR COMMUNICATIONS','flight-use-supply','repair','btn-primary btn-sm'):
 key==='thermal'?btn('🔧 THERMAL CONTROL CHECK','flight-use-supply','repair','btn-primary btn-sm'):
 key==='navigation'?'<p class="tiny muted">Navigation requires the flight computer targeting maneuver shown above; spares alone cannot correct the trajectory.</p>':''}
 <p class="service-help">${esc(help)}</p><p class="service-help">${tag('MID-FLIGHT +/- = PRACTICE MODE', 'warn')} No cargo materializes in space during an authentic mission. Editing in-flight quantities is a deliberate simulation control.</p></details>`;
}
function flightMoveSupply(){let f=game.flight,b=game.build;ensureCargo(b);if(!['cruise','orbit'].includes(f.status)){setNotice('In-flight cargo transfer is available during cruise or destination operations.');return;}
 const src=Number(flightSupplyUI.from),dest=Number(flightSupplyUI.to),key=flightSupplyUI.item;
 if(!b.rooms[src]||!b.rooms[dest]||Math.abs(src-dest)!==1){setNotice('Cabin cargo may move only one bay at a time between connected installed rooms.');return;}
 if(!(b.cabinCargo[src]?.[key]>0)){setNotice('Selected source does not contain that supply.');return;}
 if(cargoUnits(b.cabinCargo[dest])>=cabinCapacity(b.rooms[dest])){setNotice('Destination bay has no free stowage slots.');return;}
 if(f.resources.power<2){setNotice('Insufficient electrical reserve for automated cabin handling.');return;}
 b.cabinCargo[src][key]--;b.cabinCargo[dest][key]=(b.cabinCargo[dest][key]||0)+1;
 f.resources.power=clamp(f.resources.power-1);if(f.status==='cruise')f.days+=.02;
 log(`CABIN LOGISTICS: ${SUPPLIES[key].label} moved Bay ${src+1} → Bay ${dest+1}; power -1.`);setNotice('Cabin transfer complete. Hardware moved without changing total payload mass.');render();
}
function flightUseSupply(key){let f=game.flight,b=game.build;ensureCargo(b);let event=f.activeEvent;
 if(!event){setNotice('No active hazard requires an emergency repair.');return;}
 const eligible=event==='solar'&&key==='battery'?['flight-deck','life-support']:['communications','cargo','life-support'];
 if(key==='repair'&&!['comms','ground','thermal'].includes(event)){setNotice('Electronic spares do not solve this event.');return;}
 const from=b.rooms.findIndex((r,i)=>eligible.includes(r)&&(b.cabinCargo[i]?.[key]||0)>0);
 if(from<0){setNotice(`No accessible ${SUPPLIES[key].label} is stowed in the appropriate bay. Transfer one there first.`);return;}
 b.cabinCargo[from][key]--;f.resources.power=clamp(f.resources.power-2);
 resolveEvent(0); // selected safe response continues the existing educational event rules
 if(key==='battery'){f.resources.power=clamp(f.resources.power+8);f.resources.health=clamp(f.resources.health+7);}
 else {f.resources.comms=clamp(f.resources.comms+14);f.resources.health=clamp(f.resources.health+4);}
 log(`ONBOARD REPAIR: one ${SUPPLIES[key].label} used from Bay ${from+1}; resources adjusted.`);
 setNotice('Cabin maintenance applied; stored supply consumed.');render();
}
// Fictional crew consumption rule. Vacuum coasting does not burn propulsion fuel.
function advanceConsumables(){const f=game.flight;if(f.status!=='cruise')return;
 const day=Math.floor(f.days/30);if(!Number.isFinite(day)||day<1)return;
 const last=f.lastConsumablePeriod||0;if(day<=last)return;f.lastConsumablePeriod=day;
 // Count every month crossed, including at 1000x simulation speed.
 for(let month=last+1;month<=day;month++){
  if(game.build.crewed){let b=game.build;ensureCargo(b);const i=b.cabinCargo.findIndex(x=>(x.provisions||0)>0);
   if(i>=0){b.cabinCargo[i].provisions--;log(`CREW CONSUMABLES: one food/water pack used during month ${month}.`);}
   else{f.resources.health=clamp(f.resources.health-6);log(`CREW CONSUMABLES LOW: month ${month}; health -6 (game assumption).`);}}
  if(game.build.solar===0){f.resources.power=clamp(f.resources.power-2);log(`CRUISE ENERGY: electrical reserve declined in month ${month} without supplementary solar generation.`);}
 }
}
// -------------------- V1.8 NASA images: sourced scientific references --------------------
const NASA_OBSERVATIONS={
 Earth:{title:'Blue Marble · MODIS Earth composite',source:'NASA Goddard Space Flight Center / Terra MODIS',date:'Composite of 2001 imagery; visualization 2002',image:'https://svs.gsfc.nasa.gov/vis/a030000/a030600/a030614/blue_marble_modis_north_america_print.jpg',url:'https://svs.gsfc.nasa.gov/30614/'},
 Moon:{title:'LRO · Lunar South Pole',source:'NASA/GSFC/Arizona State University · LROC WAC mosaic',date:'Published September 27, 2010',image:'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia13/pia13523/PIA13523.jpg',url:'https://science.nasa.gov/photojournal/the-lunar-south-pole/'},
 Mars:{title:'MRO / HiRISE · Jezero Crater rim',source:'NASA/JPL-Caltech/University of Arizona/ESA',date:'Image added August 27, 2024',image:'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia26/pia26402/PIA26402.jpg',url:'https://science.nasa.gov/photojournal/perseverances-location-at-the-base-of-jezero-craters-rim/'}
};
function nasaScienceImage(){const o=NASA_OBSERVATIONS[game.mission];return `<div class="science-reference"><img loading="lazy" data-nasa-observation="1" data-fallback="${A('mission_crop'+({Earth:0,Moon:1,Mars:2}[game.mission])+'.png')}" src="${o.image}" alt="${esc(o.title)} — real NASA science reference if loaded"><div><h4 class="nasa-image-status">NASA SCIENCE IMAGE · OFFICIAL REFERENCE</h4><strong>${esc(o.title)}</strong><p>${esc(o.source)}. ${esc(o.date)}.</p><p>For learning and comparison only. The instrument reading, observation score and events below are still teaching simulations.</p><a href="${o.url}" target="_blank" rel="noopener noreferrer">OPEN NASA SOURCE & CREDIT ↗</a></div></div>`;}

// -------------------- V1.8 synchronized Solar-System flight monitor --------------------
// The PLANET dots are JPL Table-1 positions for an explicitly displayed epoch.
// The SHIP trajectory uses a simplified two-body transfer, not a spacecraft
// ephemeris. We intentionally do not interpret approximate planets as telemetry.
let lastFlightSolarPaint=-100;
function drawFlightSolarMonitor(t){
 if(t-lastFlightSolarPaint<.095)return;lastFlightSolarPaint=t;
 const view=context('transfer-solar-canvas');if(!view)return;
 const[c,w,h]=view,date=solarDate(),f=game.flight,plan=metrics().plan;
 sceneStars(c,w,h,t,.48);
 const orrery=drawOrrery(c,w,h,date);
 drawSolarMission(c,w,h,t,orrery,true);
 label(c,'ALL PLANETS · SHARED TIME',12,20,'#b4f3ff',11);
 label(c,date.toISOString().slice(0,10)+' UTC · '+solarSpeed+'× '+(solarPlaying?'PLAY':'PAUSE'),12,37,'#cbdcfb',10);
 if(game.mission==='Moon')drawMoonInset(c,w,h,t,true);
 else if(game.mission==='Mars'){
  const text=f.status==='cruise'?`SHIP · DAY ${f.days.toFixed(1)} / ${plan.days.toFixed(1)}`:
   f.status==='orbit'?'TRANSFER COMPLETE / ARRIVAL':f.status==='failed'?'TRAJECTORY NOT CAPTURED':'MARS TRANSFER PREVIEW';
  label(c,text,12,h-25,'#d9ff9d',10);
 }else label(c,'EARTH SATELLITE / ALL PLANETS MOVING',12,h-25,'#dbffab',10);
 label(c,'Schematic projection: not to scale, not spacecraft tracking',12,h-10,'#b0c3e0',9);
 const dateNode=$('transfer-epoch');if(dateNode)dateNode.textContent=date.toISOString().slice(0,10)+' UTC';
}

// -------------------------------------------------------------------------
const loaded=restore();if(loaded){notice='Saved browser session restored. Continue your mission.';}else{notice='Choose a mission, then build and launch a spacecraft.';}
render();requestAnimationFrame(animate);
})();
