import {createContext,useContext,useEffect,useMemo,useReducer} from 'react';
import {DATA,byId} from '../data';
import {defaultParts,favoriteParts,newRun,stepRun,updateRun} from '../game/engine';
import {starterBays,normalizeBays,allBayInstruments,byModule,placeCompatible,MIN_BAYS,MAX_BAYS} from '../data/modules';
const STORAGE_KEY='moonbound-mission-lab-fusion-v1';
const makeInitial=()=>({stage:'select',missionId:null,profileName:'Guest',points:0,history:[],adventureCue:'design',mode:'solo',team:['Flight lead'],optional:[],templateId:null,orbitId:null,launcherId:'launcher_medium',bays:[],activeBay:0,parts:{...defaultParts,instruments:[],redundancy:[]},quality:'balanced',answers:{},run:null,currentEventId:null,launchCountdown:null,reflection:{}});
function hydrate(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(v&&v.stage&&v.parts&&v.mode){const bays=normalizeBays(v.bays,v.missionId||'wildfire');return {...makeInitial(),...v,bays,parts:{...defaultParts,...v.parts,instruments:allBayInstruments(bays)},activeBay:Math.min(v.activeBay||0,bays.length-1),currentEventId:null,launchCountdown:null};}}catch{}return makeInitial();}
const defaultsFor=id=>({stage:'requirements',missionId:id,orbitId:byId(DATA.missions,id)?.orbit,templateId:({wildfire:'smallsat',lunar:'orbiter',neptune:'flagship'})[id],launcherId:({wildfire:'launcher_medium',lunar:'launcher_heavy',neptune:'launcher_heavy'})[id]});
function updateBays(s,next){const bays=normalizeBays(next,s.missionId);return {...s,bays,parts:{...s.parts,instruments:allBayInstruments(bays)},answers:{},run:null};}
function reducer(s,a){switch(a.type){
 case 'newMission':return {...makeInitial(),profileName:s.profileName,points:s.points,history:s.history,...defaultsFor(a.id),bays:starterBays(a.id)};
 case 'demoMission':{const bays=starterBays(a.id);const preset={...makeInitial(),profileName:s.profileName,points:s.points,history:s.history,...defaultsFor(a.id),stage:'operations',bays,parts:{...defaultParts,...favoriteParts[a.id],battery:a.id==='neptune'?'battery_large':'battery_medium',instruments:allBayInstruments(bays),redundancy:[]}};return {...preset,run:newRun(preset)};}
 case 'starterDesign':{const bays=starterBays(s.missionId),parts={...s.parts,...favoriteParts[s.missionId],instruments:allBayInstruments(bays)};if(s.missionId==='neptune'){parts.battery='battery_large';parts.pointing='point_precision'}return {...s,bays,activeBay:0,parts,quality:'balanced',answers:{},run:null};}
 case 'stage':return {...s,stage:a.stage};
 case 'setAdventureCue':return s.adventureCue===a.cue?s:{...s,adventureCue:a.cue};
 case 'set':return {...s,[a.key]:a.value};
 case 'part':return {...s,parts:{...s.parts,[a.key]:a.value}};
 case 'setBayRoom':{const bays=s.bays.map((b,i)=>i===a.index?{room:a.room,instruments:[]} :b);return updateBays(s,bays)}
 case 'clearBay':{const bays=s.bays.map((b,i)=>i===a.index?{room:null,instruments:[]}:b);return updateBays(s,bays)}
 case 'addBay':return s.bays.length<MAX_BAYS?{...updateBays(s,[...s.bays,{room:null,instruments:[]}]),activeBay:s.bays.length}:s;
 case 'removeBay':{if(s.bays.length<=MIN_BAYS)return s;const index=Number.isInteger(a.index)?a.index:s.bays.length-1;const bays=s.bays.filter((_,i)=>i!==index);return {...updateBays(s,bays),activeBay:Math.min(s.activeBay,bays.length-1)}}
 case 'selectBay':return {...s,activeBay:Math.min(Math.max(0,a.index),s.bays.length-1)};
 case 'bayInstrument':{const bay=s.bays[a.index],mod=byModule(bay?.room);if(!mod?.accepts.includes(a.id))return s;const bays=s.bays.map(b=>({...b,instruments:[...(b.instruments||[])]}));const chosen=bays[a.index].instruments,already=chosen.includes(a.id);if(already)chosen.splice(chosen.indexOf(a.id),1);else{const maxSlots=byId(DATA.parts.templates,s.templateId)?.slots||0;if(allBayInstruments(bays).length>=maxSlots||chosen.length>=mod.slots||allBayInstruments(bays).includes(a.id))return s;chosen.push(a.id)}return updateBays(s,bays)}
 case 'instrument':{const existing=s.bays.findIndex(b=>b.instruments?.includes(a.id));if(existing>=0)return reducer(s,{type:'bayInstrument',index:existing,id:a.id});const target=placeCompatible(s.bays,a.id);return target>=0?reducer(s,{type:'bayInstrument',index:target,id:a.id}):s;}
 case 'upgrade':return {...s,parts:{...s.parts,redundancy:s.parts.redundancy.includes(a.id)?s.parts.redundancy.filter(x=>x!==a.id):[...s.parts.redundancy,a.id]}};
 case 'optional':return {...s,optional:s.optional.includes(a.id)?s.optional.filter(x=>x!==a.id):[...s.optional,a.id]};
 case 'answer':return {...s,answers:{...s.answers,[a.question]:a.answer}};
 case 'reflect':return {...s,reflection:{...s.reflection,[a.question]:a.value}};
 case 'team':return {...s,team:a.names};
 case 'launch':return {...s,stage:'launch',launchCountdown:5,run:null};
 case 'countdown':return {...s,launchCountdown:a.count};
 case 'launchFailed':return {...s,stage:'launchFailure',launchCountdown:null};
 case 'launchSucceeded':return {...s,stage:'operations',run:newRun(s),launchCountdown:null};
 case 'roomAction':return {...s,run:updateRun({...s.run,actionsLeft:Math.max(0,s.run.actionsLeft-1)},a.effects,a.message,a.success?'good':'bad',a.details||{})};
 case 'startEvent':return {...s,currentEventId:a.id};
 case 'resolveEvent':{let r=updateRun(s.run,a.effects,a.log,a.success?'good':'warn',a.details||{});r=stepRun(r,s);r.choices=[...(r.choices||[]),{id:a.id,choice:a.choice,passed:a.success}];return {...s,run:r,currentEventId:null};}
 case 'timeoutEvent':{let r=updateRun(s.run,{charge:-8,health:-10,science:-4},'No plan was chosen before the countdown ended. An automatic protective action cost time and energy.','bad');r=stepRun(r,s);r.choices=[...(r.choices||[]),{id:a.id,choice:'Timed out',passed:false}];return {...s,run:r,currentEventId:null};}
 case 'finish':return {...s,stage:'review',run:{...s.run,ended:true,reason:a.reason||'All mission chapters completed.'},currentEventId:null};
 case 'resetRun':return {...s,stage:'check',run:null,currentEventId:null,answers:s.answers,reflection:{}};
 case 'reset':return {...makeInitial(),profileName:s.profileName,points:s.points,history:s.history};
 case 'applyProfile':return {...makeInitial(),...(a.saved||{}),profileName:a.name,points:a.points||0,history:a.history||[]};
 case 'signOut':return makeInitial();
 case 'completeAdventure':{const entry=a.entry;if(!entry?.id||(s.history||[]).some(e=>e.id===entry.id))return s;const earned=entry.success?Math.min(300,80+Math.round(entry.score*2)):Math.min(50,15+Math.round(entry.score*.3));return {...s,points:(s.points||0)+earned,history:[...(s.history||[]),{...entry,earned}]};}
 default:return s;}}
const Context=createContext(null);
export function GameProvider({children}){const [state,dispatch]=useReducer(reducer,undefined,hydrate);
 useEffect(()=>{try{const persist={...state,currentEventId:null,launchCountdown:null,stage:state.stage==='launch'?'check':state.stage};localStorage.setItem(STORAGE_KEY,JSON.stringify(persist))}catch{}},[state]);
 const value=useMemo(()=>({state,dispatch,mission:byId(DATA.missions,state.missionId)}),[state]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useGame=()=>useContext(Context);
