import { useEffect, useRef, useState } from 'react';
import { TWO, START, inside, norm, rad, zonePoints } from '../engine/angle';
const CX = 300, CY = 200, R = 46;
const ZCOL = { eclipse: '#6b7794', groundStation: '#2fb872', radiation: '#e0961c' };
export default function OrbitMap({ orbit, missionId, paused, onZone, onLap }) {
  const [pos, setPos] = useState({ x: CX + orbit.a * Math.cos(START), y: CY + orbit.b * Math.sin(START) });
  const theta = useRef(START), lapRef = useRef(0), zoneRef = useRef(null);
  const cb = useRef({}), pausedRef = useRef(paused), orbitRef = useRef(orbit);
  cb.current = { onZone, onLap }; pausedRef.current = paused; orbitRef.current = orbit;
  useEffect(() => {
    let raf, last = 0;
    const frame = (t) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      if (!pausedRef.current) {
        const o = orbitRef.current;
        theta.current += o.speed * dt;
        setPos({ x: CX + o.a * Math.cos(theta.current), y: CY + o.b * Math.sin(theta.current) });
        const lap = Math.floor((theta.current - START) / TWO);
        if (lap > lapRef.current) { lapRef.current = lap; cb.current.onLap(lap); }
        const z = o.zones.find((zz) => inside(theta.current, zz));
        if ((z ? z.id : null) !== zoneRef.current) { zoneRef.current = z ? z.id : null; if (z) cb.current.onZone(z); }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  const skip = () => {
    const d = orbit.zones.map((z) => norm(rad(z.from) - theta.current)).filter((x) => x > 0.2);
    theta.current += (d.length ? Math.min(...d) : 1) - 0.12; zoneRef.current = null;
  };
  return (
    <div>
      <div className="stage">
        <svg viewBox="0 0 600 400" role="img" aria-label="Spacecraft orbiting a planet with eclipse, ground station and radiation zones">
          <ellipse cx={CX} cy={CY} rx={orbit.a} ry={orbit.b} fill="none" stroke="var(--orbit)" strokeDasharray="4 5" />
          {orbit.zones.map((z) => <polyline key={z.id} points={zonePoints(orbit, z, CX, CY)} fill="none" stroke={ZCOL[z.type]} strokeWidth="9" strokeLinecap="round" opacity=".85" />)}
          <defs><radialGradient id="planetGlow" cx="32%" cy="28%"><stop offset="0" stopColor={missionId==='neptune'?'#a9d8fc':missionId==='lunar'?'#e0e2e6':'#82d3ed'}/><stop offset="1" stopColor={missionId==='neptune'?'#174ba4':missionId==='lunar'?'#666b7d':'#144b93'}/></radialGradient></defs><circle cx={CX} cy={CY} r={R} fill="url(#planetGlow)" /><circle cx={CX-12} cy={CY-13} r="8" fill="#ffffff" opacity=".13"/><text x={CX} y={CY+R+23} textAnchor="middle" fill="#dcecff" fontSize="14">{missionId==='neptune'?'NEPTUNE':missionId==='lunar'?'MOON':'EARTH'}</text>
          <g transform={`translate(${pos.x} ${pos.y}) rotate(${theta.current*180/Math.PI+90})`}><path d="M 0 -12 L 7 9 L 0 5 L -7 9 Z" fill="#ffc857" stroke="#fff" strokeWidth="1.4"/><path d="M -13 0 L -4 0 M 4 0 L 13 0" stroke="#8ccaff" strokeWidth="4"/></g>
        </svg>
      </div>
      <div className="row muted" style={{ marginTop: 8 }}>
        {orbit.zones.map((z) => <span key={z.id}><span style={{ color: ZCOL[z.type] }}>&#9632;</span> {z.label}</span>)}
        <button onClick={skip} style={{ marginLeft: 'auto' }}>Skip to next zone</button>
      </div>
    </div>
  );
}
