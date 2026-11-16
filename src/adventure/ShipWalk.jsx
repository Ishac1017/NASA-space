import {useEffect,useMemo,useRef,useState} from 'react';
import {ROOMS} from './gameData';
const move=(n,target,step)=>Math.abs(target-n)<=step?target:n+Math.sign(target-n)*step;
const roomAt=(pos)=>ROOMS.find(r=>Math.hypot(pos.x-r.x,pos.y-r.y)<14);
const walkable=(x,y)=>y>=43&&y<=57||ROOMS.some(r=>Math.abs(x-r.x)<10.8&&(r.kind==='top'?y>=5&&y<=45:y>=55&&y<=95));
export default function ShipWalk({alarmRoom,alarmName,onTask,onLeave,disabled=false}){
 const [pos,setPos]=useState({x:86,y:25});
 const [destination,setDestination]=useState('');
 const keys=useRef(new Set());
 const active=ROOMS.find(r=>r.id===alarmRoom);
 const near=active&&Math.hypot(pos.x-active.x,pos.y-active.y)<12;
 const current=roomAt(pos);
 const taskRef=useRef(onTask);taskRef.current=onTask;
 const nearRef=useRef(false);nearRef.current=!!near;
 useEffect(()=>{
  if(disabled)return;
  const down=(e)=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','e'].includes(k)){e.preventDefault();if(k==='e'&&nearRef.current){taskRef.current();return;}keys.current.add(k);}};
  const up=(e)=>keys.current.delete(e.key.toLowerCase());
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);keys.current.clear()};
 },[disabled]);
 useEffect(()=>{
  if(disabled)return;
  const timer=setInterval(()=>setPos(p=>{
   const k=keys.current;const dx=Number(k.has('arrowright')||k.has('d'))-Number(k.has('arrowleft')||k.has('a'));
   const dy=Number(k.has('arrowdown')||k.has('s'))-Number(k.has('arrowup')||k.has('w'));
   if(dx||dy){setDestination('');const rate=.91/(Math.hypot(dx,dy)||1);let x=Math.max(4,Math.min(96,p.x+dx*rate)),y=Math.max(6,Math.min(94,p.y+dy*rate));if(!walkable(x,y)){if(walkable(x,p.y))y=p.y;else if(walkable(p.x,y))x=p.x;else return p;}return {x,y};}
   const r=ROOMS.find(room=>room.id===destination);if(!r)return p;
   let x=p.x,y=p.y;const step=.83;
   if(Math.abs(p.x-r.x)>1.2&&Math.abs(p.y-50)>1.4){y=move(y,50,step);}
   else if(Math.abs(p.x-r.x)>1.2){y=50;x=move(x,r.x,step);}
   else {x=r.x;y=move(y,r.y,step);}
   return {x,y};
  }),27);
  return()=>clearInterval(timer);
 },[destination,disabled]);
 useEffect(()=>{if(!destination)return;const r=ROOMS.find(room=>room.id===destination);if(r&&Math.hypot(pos.x-r.x,pos.y-r.y)<1.3)setDestination('');},[pos,destination]);
 const path=useMemo(()=>active?`M ${pos.x} ${pos.y} L ${pos.x} 50 L ${active.x} 50 L ${active.x} ${active.y}`:'',[pos.x,pos.y,active]);
 return <section className="wf-interior">
  <div className="wf-interior-top"><div><span className="wf-kicker">SPACECRAFT INTERIOR · LEVEL 01</span><h2>Walk to the alert</h2><p>Use <strong>W A S D</strong> / arrow keys, or click any room to walk there. Press <strong>E</strong> near the flashing console.</p></div><button className="wf-btn wf-btn-outline" onClick={onLeave}>↗ Return to live orbit view</button></div>
  <div className="wf-map-layout">
   <div className="wf-ship-map" role="group" aria-label="Walkable spacecraft with eight connected rooms">
    <div className="wf-map-frame"/><div className="wf-corridor"/><div className="wf-corridor-light"/>
    {ROOMS.map((r,i)=><button key={r.id} type="button" className={`wf-room wf-room-${r.kind} ${r.id===alarmRoom?'wf-room-alarm':''} ${current?.id===r.id?'wf-room-current':''}`} style={{left:`${r.x-11.3}%`,top:r.kind==='top'?'2.5%':'56%',width:'22.6%',height:'41.5%'}} onClick={()=>setDestination(r.id)} title={`Walk to ${r.label}`} aria-label={`Walk to ${r.label}`}>
      {r.art?<img src={`/visual-kit/rooms/${r.art}`} alt=""/>:<div className="wf-engine-art"><span>◉</span><i/><i/><i/></div>}
      <span className="wf-room-label"><b>{r.icon}</b> {r.label}</span>
      {r.id===alarmRoom&&<span className="wf-room-signal">!</span>}
    </button>)}
    {ROOMS.map(r=><div key={r.id} className="wf-hatch" style={{left:`calc(${r.x}% - 9px)`,top:r.kind==='top'?'43.3%':'55%'}}/>)}
    <svg className="wf-navigation-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={path} fill="none" stroke="#74e8e5" strokeWidth=".34" strokeLinecap="round" strokeDasharray="1 1" opacity=".9"/></svg>
    <div className="wf-avatar" style={{left:`${pos.x}%`,top:`${pos.y}%`}} aria-label="Your astronaut"><span className="wf-avatar-visor"/><span className="wf-avatar-body"/><small>YOU</small></div>
    {near&&<button className="wf-interact" style={{left:`${active.x}%`,top:`${active.y<50?active.y+12:active.y-17}%`}} onClick={onTask}>E · USE CONSOLE</button>}
   </div>
   <aside className="wf-interior-side">
    <span className="wf-kicker">CREW NAVIGATION</span>
    <div className="wf-nav-target"><div className="wf-radar-ring">◎</div><strong>{active?.label||'No active alarm'}</strong><p>{active?.desc||'Explore the ship while everything is running normally.'}</p></div>
    <div className="wf-nav-status"><span>YOUR LOCATION</span><b>{current?.label||'Central corridor'}</b></div>
    <div className="wf-nav-status"><span>CURRENT ALARM</span><b className={active?'wf-danger':'wf-success'}>{alarmName||'All clear'}</b></div>
    {active&&<button className="wf-btn wf-btn-bright wf-full" onClick={()=>setDestination(active.id)}>⌖ Navigate to {active.label}</button>}
    {near&&<button className="wf-btn wf-btn-warning wf-full" onClick={onTask}>⚡ Operate equipment</button>}
    <p className="wf-ship-hint">The dotted route shows how to get from your astronaut to the alarm. Each room is connected by the central corridor.</p>
    <div className="wf-mobile-pad" aria-label="Touch movement controls"><button onClick={()=>setPos(p=>({...p,y:Math.max(6,p.y-5)}))}>↑</button><div><button onClick={()=>setPos(p=>({...p,x:Math.max(4,p.x-5)}))}>←</button><button onClick={()=>setPos(p=>({...p,y:Math.min(94,p.y+5)}))}>↓</button><button onClick={()=>setPos(p=>({...p,x:Math.min(96,p.x+5)}))}>→</button></div></div>
   </aside>
  </div>
 </section>;
}
