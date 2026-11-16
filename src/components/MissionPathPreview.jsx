const PATHS={
 wildfire:{labels:['Earth launch','Polar orbit','Spot heat','Report home'],name:'Around Earth'},
 lunar:{labels:['Earth launch','Lunar transfer','Polar passes','Map ice clues'],name:'To the Moon'},
 neptune:{labels:['Earth launch','Long cruise','Neptune pass','Probe drop'],name:'Into deep space'}
};
export default function MissionPathPreview({missionId}){
 const p=PATHS[missionId]||PATHS.wildfire;
 return <div className={`path-preview path-preview-${missionId}`}>
 <div className="path-preview-head"><span>MISSION ROUTE</span><strong>{p.name}</strong></div>
 <svg viewBox="0 0 290 98" aria-label={p.labels.join(' to ')} role="img">
   <defs><linearGradient id={`route-${missionId}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#76e9d2"/><stop offset="1" stopColor="#76aaff"/></linearGradient></defs>
   {missionId==='wildfire'&&<><circle cx="145" cy="51" r="34" fill="#16618c" stroke="#6ccff0" strokeWidth="1.4"/><path d="M122 36 Q130 20 148 32 L145 46 132 48 135 66 116 57Z M158 36 L168 37 170 51 161 57 169 72 152 67Z" fill="#48b19a"/><ellipse cx="145" cy="51" rx="111" ry="32" fill="none" stroke={`url(#route-${missionId})`} strokeWidth="2.2" strokeDasharray="5 6"/><circle cx="245" cy="37" r="7" fill="#ffe3ab" stroke="#ffffff" strokeWidth="1.2"/></>}
   {missionId==='lunar'&&<><circle cx="48" cy="52" r="25" fill="#156b9d" stroke="#6fcff0" strokeWidth="2"/><path d="M36 40L49 35 58 50 44 61 32 54Z" fill="#51a68e"/><path d="M79 54 Q150 -10 219 40" fill="none" stroke="#8fcce8" strokeDasharray="5 6" strokeWidth="2.5"/><circle cx="238" cy="50" r="30" fill="#8d93a3" stroke="#dce7ef" strokeWidth="2"/><circle cx="222" cy="42" r="7" fill="#59606e"/><circle cx="251" cy="64" r="11" fill="#626977"/><circle cx="243" cy="31" r="4" fill="#626977"/><ellipse cx="238" cy="50" rx="40" ry="18" stroke="#9eeff3" fill="none" strokeDasharray="4 5"/></>}
   {missionId==='neptune'&&<><circle cx="33" cy="50" r="17" fill="#17668c" stroke="#8bf9f1"/><path d="M52 50 Q135 -8 247 43" stroke="#90d0fc" strokeWidth="2.5" strokeDasharray="5 7" fill="none"/><circle cx="252" cy="50" r="35" fill="#225ca5" stroke="#9ceaff" strokeWidth="1.5"/><path d="M220 39 Q250 28 286 43 M220 63 Q250 55 286 67" stroke="#9be5fb" strokeWidth="6" opacity=".35" fill="none"/><circle cx="217" cy="49" r="7" fill="#fff3c8"/></>}
 </svg>
 <div className="path-preview-labels">{p.labels.map((label,i)=><span key={i}><b>{i+1}</b>{label}</span>)}</div>
 </div>;
}
