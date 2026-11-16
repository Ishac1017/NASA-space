import {useEffect,useMemo,useReducer,useRef,useState} from 'react';
import {useGame} from '../state/gameStore';
import {evaluate} from '../game/engine';
import EarthView from './EarthView';
import ShipWalk from './ShipWalk';
import TaskConsole from './TaskConsole';
import {EPISODES,ROOMS,BASE_LESSONS,clamp} from './gameData';
import './wildfire.css';
const SAVE='mission-lab-wildfire-adventure-v1';
function init(metrics){return {started:false,completed:false,failed:false,episode:0,alert:false,view:'outside',paused:false,resources:{battery:metrics.batteryWh>=3000?100:metrics.batteryWh>=1500?88:72,health:94,fuel:88,data:12,detected:0,delivered:0,images:0},logs:[{kind:'info',text:'Your spacecraft reached low Earth orbit. Begin the first observation pass.'}],results:[],observations:[],time:0,year:0};}
function gameplay(s,a){switch(a.type){
 case 'start':return {...s,started:true,alert:true};
 case 'tick':return {...s,time:s.time+1};
 case 'view':return {...s,view:a.view};
 case 'pause':return {...s,paused:!s.paused};
 case 'next':return {...s,alert:true,view:'outside',year:Math.min(3,Math.round(s.episode/EPISODES.length*3*10)/10),logs:[{kind:'alarm',text:`New alarm: ${EPISODES[s.episode]?.name||''}`},...s.logs]};
 case 'resolve':{
  const {effects,outcome,limit}=a;
  const r={...s.resources};
  for(const [k,v] of Object.entries(effects)){r[k]=['detected','delivered','images'].includes(k)?Math.max(0,(r[k]||0)+v):k==='data'?Math.max(0,(r[k]||0)+v):clamp((r[k]||0)+v,0,100)}
  let excess=0;if(r.data>limit){excess=r.data-limit;r.data=limit;r.health=clamp(r.health-6)}
  if(r.battery===0)r.health=clamp(r.health-15);
  const nextEpisode=s.episode+1;const hasFailed=r.health<=0;
  return {...s,episode:nextEpisode,resources:r,alert:false,view:'outside',failed:hasFailed,completed:hasFailed||nextEpisode>=EPISODES.length,year:Math.round(nextEpisode/EPISODES.length*3*10)/10,results:[...s.results,{id:EPISODES[s.episode].id,good:outcome.success,message:outcome.why,lesson:EPISODES[s.episode].learn}],observations:[...s.observations,...(a.observation?[a.observation]:[])],logs:[{kind:outcome.success?'good':'bad',text:outcome.why},...(excess?[{kind:'bad',text:`Data storage overflowed: ${excess} data units were lost.`}]:[]),...s.logs]};
 }
 default:return s;
 }}
function useMissionAudio(){const [on,setOn]=useState(false);const ctx=useRef(null);const tone=(freq=650,duration=.15,kind='sine')=>{if(!on)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const a=ctx.current||new C();ctx.current=a;if(a.state==='suspended')a.resume();const osc=a.createOscillator(),gain=a.createGain();osc.type=kind;osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,a.currentTime);gain.gain.exponentialRampToValueAtTime(.065,a.currentTime+.025);gain.gain.exponentialRampToValueAtTime(.0001,a.currentTime+duration);osc.connect(gain).connect(a.destination);osc.start();osc.stop(a.currentTime+duration+.02)}catch{}};return {on,setOn,tone}}
function Stat({label,value,color,icon,unit='%'}){return <div className="wf-stat"><div className="wf-stat-title"><span>{icon} {label}</span><b>{Math.round(value)}{unit}</b></div><div className="wf-stat-track"><div className={`wf-stat-fill ${color}`} style={{width:`${clamp(value)}%`}}/></div></div>}
function Routes({current=0}){return <div className="wf-route"><div className="wf-route-line"/>{['LAUNCH','POLAR ORBIT','FIRE SCAN','GROUND LINK','MISSION REPORT'].map((x,i)=><div key={x} className={`wf-route-node ${i<Math.min(4,current)?'past':''} ${i===Math.min(4,current)?'active':''}`}><span>{i<Math.min(4,current)?'✓':i+1}</span><small>{x}</small></div>)}</div>}
function Debrief({game,metrics,onRestart}){
 const ok=game.resources.health>0&&game.resources.detected>=2&&game.resources.delivered>=1&&metrics.hasThermal&&!game.failed;
 const completed=game.results.filter(x=>x.good).length;const pct=Math.round(completed/EPISODES.length*100);
 return <div className="wf-adventure wf-debrief">
  <div className="wf-result-hero"><span className="wf-kicker">THREE-YEAR SIMULATED MISSION COMPLETE</span><h1>{ok?'Mission accomplished. Earth received your fire report.':'Mission review: what can we improve?'}</h1><p>{ok?'Your spacecraft collected heat observations, handled mission emergencies, and delivered useful information to Earth.':'Your engineering choices and operations affected the mission. Review the lost opportunities, then rebuild and try again.'}</p><div className="wf-result-stats"><div><strong>{game.resources.detected}</strong><span>Heat anomalies flagged</span></div><div><strong>{game.resources.delivered}</strong><span>Reports delivered</span></div><div><strong>{game.resources.health}%</strong><span>Spacecraft condition</span></div><div><strong>{pct}%</strong><span>Tasks completed</span></div></div></div>
  <div className="wf-review-grid"><section className="wf-panel"><h2>Mission story</h2>{EPISODES.map((e,i)=>{const result=game.results[i];return <div className="wf-review-row" key={e.id}><span className={result?.good?'wf-success':'wf-danger'}>{result?.good?'✓':'!'}</span><div><strong>{e.name}</strong><p>{result?.message||'No attempt recorded.'}</p><small>{e.learn}</small></div></div>})}</section><section className="wf-panel"><h2>Your design matters</h2><div className="wf-design-review"><div>Thermal camera <strong>{metrics.hasThermal?'INSTALLED':'MISSING'}</strong></div><div>Radar <strong>{metrics.hasRadar?'INSTALLED':'NOT INSTALLED'}</strong></div><div>Onboard storage <strong>{metrics.storage} units</strong></div><div>Power generator <strong>{metrics.powerOutput} W</strong></div><div>Radio capacity <strong>{metrics.downlink} game units</strong></div></div><h3>What you learned</h3>{BASE_LESSONS.map((x,i)=><p className="wf-lesson-list" key={i}><span>✦</span>{x}</p>)}<h3>Final crew reflection</h3><label className="wf-reflection">What would you change on your next spacecraft?<textarea placeholder="Example: I would choose a larger data vault, because..."/></label><button className="wf-btn wf-btn-bright wf-full" onClick={onRestart}>↻ Design another spacecraft</button><p className="wf-note">All scenes, observations, costs, energy and event values in this game are educational simulations, not live satellite data.</p><a className="wf-source-link" href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noreferrer">Explore NASA's real FIRMS fire-detection system ↗</a></section></div>
 </div>
}
export default function WildfireAdventure(){
 const {state,dispatch}=useGame();const metrics=useMemo(()=>evaluate(state).metrics,[state]);
 const [g,send]=useReducer(gameplay,metrics,init);
 const [task,setTask]=useState(false),[help,setHelp]=useState(false);
 const {on:audioOn,setOn:setAudioOn,tone}=useMissionAudio();
 const alarm=g.alert?EPISODES[g.episode]:null;const current=EPISODES[g.episode]||null;
 useEffect(()=>{if(!g.started||g.paused||task||g.completed)return;const id=setInterval(()=>send({type:'tick'}),900);return()=>clearInterval(id)},[g.started,g.paused,g.completed,task]);
 useEffect(()=>{if(g.alert&&g.started)tone(760,.18,'triangle')},[g.alert]);
 const resolve=outcome=>{
  const i=g.episode;const good=outcome.success;
  let effects={battery:-3,health:good?1:-7,fuel:0,data:0,detected:0,delivered:0,images:0};let observation=null;
  if(i===0){effects.battery-=3;if(!good)effects.health-=4}
  if(i===1){if(good){effects.data+=33;effects.detected+=2;effects.images+=1;observation={type:'thermal',label:'Flagged thermal anomalies',year:g.year}}else effects.battery-=5}
  if(i===2){if(good){effects.data+=11;effects.images+=metrics.hasRadar?1:0}else effects.data+=5}
  if(i===3){effects.data+=good?-14:22;effects.health+=good?0:-4;}
  if(i===4){if(good){effects.delivered+=1;effects.data-=Math.min(g.resources.data,25);effects.battery-=5;}else{effects.battery-=8}}
  if(i===5){effects.battery+=good?10:-19;effects.health+=good?3:-7}
  if(i===6){if(good){effects.delivered+=g.resources.data>0?1:0;effects.detected+=1;effects.data-=Math.min(g.resources.data,18);effects.battery-=5}else effects.health-=8}
  if(i===7){effects.fuel-=good?9:16;effects.health+=good?4:-5}
  // Real design decisions influence the accelerated game.
  if(metrics.powerBalance<0)effects.battery-=9;
  if(metrics.batteryWh<=500&&i===5)effects.battery-=10;
  if(metrics.hasThermal===false&&i===1){effects.detected=0;effects.data=0}
  if(metrics.hasRadar&&i===2&&good)effects.data+=5;
  if(state.parts?.redundancy?.includes('spare_battery')&&i===5)effects.battery+=7;
  if(state.parts?.pointing!=='point_precision'&&i===4)effects.battery-=4;
  if(state.parts?.redundancy?.includes('backup_computer')&&i===6)effects.health+=3;
  if(good)tone(840,.22);else tone(260,.3,'sawtooth');
  send({type:'resolve',outcome,effects,limit:metrics.storage,observation});setTask(false);
 };
 if(g.completed)return <Debrief game={g} metrics={metrics} onRestart={()=>{if(window.confirm('Return to the workshop and build a new spacecraft?'))dispatch({type:'reset'})}}/>;
 return <div className="wf-adventure">
  <header className="wf-adventure-header"><div><span className="wf-kicker"><i className="wf-live-dot"/> MISSION OPERATIONS · EARTH WILDFIRE WATCHER</span><h1>You're flying the spacecraft.</h1><p>Find possible wildfires, protect your satellite, and send important information back to Earth.</p></div><div className="wf-header-actions"><button className="wf-btn wf-btn-quiet" onClick={()=>setHelp(v=>!v)}>{help?'Close tips':'? How to play'}</button><button className="wf-btn wf-btn-quiet" onClick={()=>setAudioOn(v=>!v)}>{audioOn?'♫ Alarms on':'♪ Alarms off'}</button><button className="wf-btn wf-btn-quiet" onClick={()=>send({type:'pause'})}>{g.paused?'▶ Resume':'Ⅱ Pause'}</button></div></header>
  {help&&<section className="wf-help"><strong>How to play:</strong> Begin the campaign → read the alarm → select Open spacecraft → click the glowing room → wait for your astronaut to arrive (or use WASD/arrow keys) → press E or Use Console → operate the controls. Return to the outside view between passes. Your power, storage, fuel and spacecraft condition change because of your choices.</section>}
  <div className="wf-status-row"><div className="wf-chip"><b>MISSION YEAR</b><strong>{g.year.toFixed(1)} / 3.0</strong></div><div className="wf-chip"><b>ORBIT PASS</b><strong>{Math.min(g.episode+1,EPISODES.length)} / {EPISODES.length}</strong></div><div className="wf-chip"><b>HEAT CLUES</b><strong>{g.resources.detected}</strong></div><div className="wf-chip"><b>REPORTS HOME</b><strong>{g.resources.delivered}</strong></div><div className={`wf-chip wf-chip-alert ${alarm?'lit':''}`}><b>CREW ALARM</b><strong>{alarm?'● NEEDS ACTION':'● ALL CLEAR'}</strong></div></div>
  <div className="wf-game-layout"><section className="wf-main-view">
   <div className="wf-view-head"><div className="wf-view-switch"><button className={g.view==='outside'?'active':''} onClick={()=>send({type:'view',view:'outside'})}>◉ LIVE EARTH VIEW</button><button className={g.view==='inside'?'active':''} onClick={()=>send({type:'view',view:'inside'})}>▦ OPEN SPACECRAFT</button></div><span className="wf-view-note">{g.view==='outside'?'CAMERA 01 — EXTERNAL ORBIT':'CAMERA 02 — SPACECRAFT DECK'}</span></div>
   <div style={{display:g.view==='outside'?'block':'none'}}><EarthView step={g.episode} eventId={alarm?.id||current?.id||''} alarm={!!alarm} orbit={g.time%257} paused={g.paused}/><div className="wf-world-actions"><div><strong>{alarm?alarm.name:g.started?'Ready for next orbit':'Your spacecraft is in orbit'}</strong><p>{alarm?alarm.description:'The satellite circles Earth while your mission progresses through three accelerated years.'}</p></div><button className="wf-btn wf-btn-bright" onClick={()=>send({type:'view',view:'inside'})}>↳ Open spacecraft</button></div></div>
   <div style={{display:g.view==='inside'?'block':'none'}}><ShipWalk disabled={task||g.view!=='inside'} alarmRoom={alarm?.room} alarmName={alarm?.name} onLeave={()=>send({type:'view',view:'outside'})} onTask={()=>{if(alarm){tone(570,.1);setTask(true)}}}/></div>
   <div className="wf-mission-route"><span className="wf-kicker">YOUR FLIGHT PATH</span><Routes current={g.episode<1?0:g.episode<3?1:g.episode<5?2:g.episode<7?3:4}/></div>
  </section><aside className="wf-sidebar">
    <section className={`wf-alarm-panel ${alarm?'active':''}`}><div className="wf-alarm-heading"><span>{alarm?'⚠ INCOMING ALARM':'✦ MISSION CONTROL'}</span><b>{alarm?alarm.signal:'READY'}</b></div><h2>{alarm?.name||(!g.started?'Welcome, Commander':'Orbit pass complete')}</h2><p>{alarm?.brief||(!g.started?'Your first mission is to search Earth for possible active fires. You will need to explore your spacecraft and operate its equipment.':'Nice work. Your spacecraft is ready for the next part of the mission.')}</p><div className="wf-destination"><span>GO TO</span><strong>{alarm?ROOMS.find(r=>r.id===alarm.room)?.label:!g.started?'Mission Control':'NEXT PASS'}</strong></div>{!g.started?<button className="wf-btn wf-btn-warning wf-full" onClick={()=>{send({type:'start'});tone(640,.2)}}>▶ Begin wildfire campaign</button>:alarm?<button className="wf-btn wf-btn-warning wf-full" onClick={()=>send({type:'view',view:'inside'})}>⚠ Open spacecraft to respond</button>:<button className="wf-btn wf-btn-bright wf-full" onClick={()=>{send({type:'next'});tone(640,.2)}}>▶ Start next orbit pass</button>}</section>
    <section className="wf-resource-panel"><div className="wf-side-title"><h3>Spacecraft health</h3><small>REAL CHOICES → VISIBLE EFFECTS</small></div><Stat label="Battery energy" icon="ϟ" value={g.resources.battery} color={g.resources.battery<25?'danger':'blue'}/><Stat label="Spacecraft condition" icon="◆" value={g.resources.health} color={g.resources.health<30?'danger':'green'}/><Stat label="Fuel remaining" icon="➤" value={g.resources.fuel} color="amber"/><Stat label="Data storage filled" icon="▤" value={100*g.resources.data/Math.max(1,metrics.storage)} color={g.resources.data/metrics.storage>.8?'danger':'purple'} unit="%"/><div className="wf-resource-foot"><span>{Math.round(g.resources.data)}/{metrics.storage} data units stored</span><span>{metrics.powerOutput} W generator</span></div></section>
    <section className="wf-alert-log"><div className="wf-side-title"><h3>Mission log</h3><small>NEWEST FIRST</small></div>{g.logs.slice(0,4).map((x,i)=><p className={`wf-log-${x.kind}`} key={i}><span>{x.kind==='good'?'✓':x.kind==='bad'?'!':'•'}</span>{x.text}</p>)}</section>
   </aside></div>
  <div className="wf-bottom-panels"><section className="wf-mini-panel"><span className="wf-kicker">WHAT COUNTS AS A SUCCESS?</span><div className="wf-obj-grid"><div><b className={metrics.hasThermal?'wf-success':'wf-danger'}>{metrics.hasThermal?'✓':'○'}</b><span>Carry a thermal camera</span></div><div><b className={g.resources.detected>=2?'wf-success':'wf-muted'}>{g.resources.detected>=2?'✓':'○'}</b><span>Flag at least 2 heat clues</span></div><div><b className={g.resources.delivered>=1?'wf-success':'wf-muted'}>{g.resources.delivered>=1?'✓':'○'}</b><span>Send 1 report to Earth</span></div><div><b className="wf-muted">◉</b><span>Stay operational for 3 game years</span></div></div></section><section className="wf-mini-panel"><span className="wf-kicker">WHY THIS MATTERS</span><p>NASA's <a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noreferrer">FIRMS</a> shares satellite heat detections that can support wildfire monitoring. It warns that thermal anomalies may have other causes and that clouds can hide fires. Your observations are simulated and should never be used for emergency decisions.</p></section></div>
  {task&&alarm&&<TaskConsole key={alarm.id} episode={alarm} metrics={metrics} resources={g.resources} onResolve={resolve} onExit={()=>setTask(false)}/>}
  </div>;
}
