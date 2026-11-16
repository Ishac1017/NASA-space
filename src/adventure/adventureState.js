import {ADVENTURES} from './missionEpisodes';
export const bounded=(x,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(x)));
export function makeAdventure(missionId,m){return {missionId,runId:(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`),started:false,index:0,alert:false,view:'space',paused:false,finished:false,failed:false,time:0,resources:{battery:bounded((m.batteryWh>=3000?98:m.batteryWh>=1500?86:73)-(m.powerBalance<0?12:0)),health:94,fuel:bounded(65+(m.fuelBonus||0)*.22),data:8,images:0,scans:0,probes:0,delivered:0,clues:0,maps:0,goodwill:0},evidence:[],results:[],log:[{kind:'info',text:'Flight confirmed. Your spacecraft is ready for its first mission operations.'}]}}
export function objectives(missionId,m,p){const r=p.resources;const survived=r.health>0&&!p.failed&&p.index>=ADVENTURES[missionId].episodes.length;switch(missionId){case 'wildfire':return [!!m.hasThermal,r.clues>=2,r.delivered>=1,survived];case 'lunar':return [!!m.hasIce,!!m.hasMap,r.maps>=1,r.scans>=1,survived];case 'neptune':return [!!m.hasCamera,!!m.hasProbe,!!m.hasRTG,r.images>=1,r.probes>=1&&r.delivered>=1,survived];default:return []}}
export function resolveChapter(play,action,m,config){const missionId=play.missionId,index=play.index,episode=ADVENTURES[missionId].episodes[index];if(!episode)return play;let good=!!action.success,r={...play.resources},d={battery:-4,health:good?0:-9,fuel:0,data:0,images:0,scans:0,probes:0,delivered:0,clues:0,maps:0,goodwill:0};
 if(missionId==='wildfire'){
  if(index===0)d.battery-=3;
  if(index===1&&good){d.clues+=2;d.images+=1;d.data+=28}
  if(index===2&&good){d.data+=m.hasRadar?16:7;d.images+=1}
  if(index===3){d.data+=good?-12:20}
  if(index===4&&good){d.delivered++;d.data-=Math.min(25,r.data)}
  if(index===5){d.battery+=good?13:-22;d.health+=good?2:-6}
  if(index===6&&good){d.clues++;d.delivered+=r.data>0?1:0;d.data-=Math.min(18,r.data)}
  if(index===7){d.fuel-=good?9:17;d.health+=good?1:-5}
  if(index===1&&!m.hasThermal){d.clues=0;d.images=0;d.data=0}
 }else if(missionId==='lunar'){
  if(index===0){d.health+=good?-(m.shield<3?3:0):-(m.shield>=4?4:13)}
  if(index===1){d.fuel-=good?13:25;d.health+=good?0:-8}
  if(index===2){d.data+=good?12:-8;d.battery-=4}
  if(index===3){d.battery-=good?9:18;d.health+=good?2:-8}
  if(index===4&&good){d.maps++;d.images++;d.data+=19}
  if(index===5&&good){d.scans++;d.clues+=3;d.data+=16}
  if(index===6){d.health+=good?(m.shield<3?-3:0):(m.shield>=4?-4:-13);d.battery-=4}
  if(index===7){if(good&&action.relayAccepted){d.goodwill+=1;d.battery-=8;d.data+=3;}else if(good){d.battery+=2}}
 }else if(missionId==='neptune'){
  if(index===0){d.fuel-=action.fuelSaved?0:7;d.health+=good?0:-3}
  if(index===1){d.battery+=good?4:-19;d.health+=good?0:-6}
  if(index===2){d.battery-=good?(m.auto?2:7):10;d.health+=good?0:-8}
  if(index===3){d.fuel-=good?18:30;d.health+=good?0:-16}
  if(index===4){d.battery-=good?9:18;d.health+=good?0:-12}
  if(index===5&&good){d.probes++;d.data+=30;d.battery-=8}
  if(index===6&&good){d.images++;d.data+=20;d.battery-=5}
  if(index===7&&good){d.delivered++;d.data-=Math.min(r.data,43);d.battery-=9}
  if(!m.hasRTG)d.battery-=17;
 }
 if(m.powerBalance<0)d.battery-=missionId==='neptune'?10:6;
 if(config?.parts?.batteryType==='battery_standard'&&index>=4)d.battery-=2;
 if(config?.parts?.redundancy?.includes('spare_battery')&&index===4)d.battery+=5;
 if(config?.parts?.redundancy?.includes('backup_computer')&&episode.room==='control'&&!good)d.health+=4;
 const limits={battery:[0,100],health:[0,100],fuel:[0,100],data:[0,Math.max(0,m.storage||50)]};let over=0;
 for(const [key,val] of Object.entries(d)){if(key==='data'){const v=r.data+val;over=Math.max(0,v-(m.storage||50));r.data=bounded(v,0,m.storage||50);}else if(limits[key])r[key]=bounded(r[key]+val,...limits[key]);else r[key]=Math.max(0,(r[key]||0)+val)}
 if(over>0)r.health=bounded(r.health-5);if(r.battery===0)r.health=bounded(r.health-12);
 let newIndex=index+1;let failed=r.health<=0;let done=failed||newIndex>=ADVENTURES[missionId].episodes.length;
 const msg=action.why||(good?'Task finished.':'The attempt was unsuccessful.');
 const result={id:episode.id,name:episode.name,success:good,why:msg,lesson:episode.learn};
 const evidence=[];
 if(good){if(d.images>0)evidence.push({kind:missionId==='neptune'?'neptune':missionId==='lunar'?'moon':'earth',icon:'⌖',title:missionId==='neptune'?'Neptune cloud photograph':missionId==='lunar'?'Polar crater map':'Thermal observation',note:`Game record · Chapter ${index+1}`});if(d.scans>0)evidence.push({kind:'moon',icon:'◈',title:'Hydrogen candidate map',note:'Interpretation only · not confirmed ice'});if(d.probes>0)evidence.push({kind:'neptune',icon:'⇣',title:'Atmospheric probe telemetry',note:'Simulated atmospheric descent readings'})} 
 return {...play,index:newIndex,alert:false,view:'space',finished:done,failed,resources:r,evidence:[...(play.evidence||[]),...evidence],results:[...play.results,result],log:[{kind:good?'good':'bad',text:msg},...(over?[{kind:'bad',text:`Storage overflowed. ${over} data units could not be kept.`}]:[]),...play.log]};
}
export function progressReducer(s,a){switch(a.type){case 'begin':return {...s,started:true,alert:true};case 'view':return {...s,view:a.value};case 'pause':return {...s,paused:!s.paused};case 'tick':return {...s,time:s.time+1};case 'next':return {...s,alert:true,view:'space',log:[{kind:'alarm',text:`New alarm: ${ADVENTURES[s.missionId].episodes[s.index]?.name}`},...s.log]};case 'resolve':return resolveChapter(s,a.outcome,a.metrics,a.config);case 'restart':return makeAdventure(s.missionId,a.metrics);default:return s}}
