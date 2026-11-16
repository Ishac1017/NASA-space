import React from 'react';
/** Art-directed animated route, not a physically propagated spacecraft trajectory. */
export default function EarthView({step=0,alarm=false,paused=false,orbit=0,eventId=''}){
 const a=((orbit*4.1)-65)*Math.PI/180;
 const sx=430+287*Math.cos(a),sy=246+145*Math.sin(a);
 const front=Math.sin(a)>0;
 return <div className={`wf-world ${alarm?'wf-world-alarm':''} ${eventId==='eclipse'?'wf-world-eclipse':''}`} aria-label="Animated view of a satellite following a simplified low Earth orbit">
  <div className="wf-stars wf-stars-a"/><div className="wf-stars wf-stars-b"/>
  <img className="wf-horizon-art" src="/visual-kit/layer_earth_horizon.png" alt=""/>
  <svg viewBox="0 0 860 475" role="img" aria-label="Earth, an orbit path, and a moving satellite" className="wf-orbit-svg">
    <defs>
      <radialGradient id="wfEarth"><stop offset="0" stopColor="#1677b6"/><stop offset=".7" stopColor="#074b91"/><stop offset="1" stopColor="#001836"/></radialGradient>
      <radialGradient id="wfGlow"><stop offset="70%" stopColor="#1a9cea" stopOpacity="0"/><stop offset="95%" stopColor="#17bfff" stopOpacity=".1"/><stop offset="100%" stopColor="#4ed7ff" stopOpacity=".38"/></radialGradient>
      <clipPath id="wfEarthClip"><circle cx="430" cy="246" r="154"/></clipPath>
      <filter id="wfBlur"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <ellipse cx="430" cy="246" rx="287" ry="145" fill="none" stroke="#419ed5" opacity=".36" strokeDasharray="6 8" strokeWidth="2"/>
    <ellipse cx="430" cy="246" rx="323" ry="180" fill="none" stroke="#5bc9ff" opacity=".10" strokeDasharray="2 12"/>
    <circle cx="430" cy="246" r="189" fill="url(#wfGlow)"/>
    <circle cx="430" cy="246" r="154" fill="url(#wfEarth)" stroke="#62cffa" strokeWidth="2.5"/>
    <g clipPath="url(#wfEarthClip)">
      <g className={paused?'':'wf-continents'}>
        <path d="M310 139 Q340 102 386 118 L397 134 379 158 392 176 371 191 383 219 366 253 348 245 338 218 323 201 307 178Z" fill="#277d77" opacity=".88"/>
        <path d="M377 226 Q408 216 421 245 414 273 403 285 405 320 383 355 364 346 358 323 367 293 350 265Z" fill="#2d9078" opacity=".82"/>
        <path d="M452 130 Q501 102 540 126 L565 143 558 170 536 174 521 204 480 207 459 191 439 169Z" fill="#35927a" opacity=".9"/>
        <path d="M484 210 522 209 Q554 230 549 257 L521 280 506 324 480 348 473 311 459 291Z" fill="#287c72" opacity=".86"/>
        <path d="M544 302 Q577 298 585 324 568 343 541 344 L525 324Z" fill="#3b9e84" opacity=".8"/>
      </g>
      <g fill="none" stroke="#d4f7ff" strokeLinecap="round" opacity=".22" strokeWidth="7">
        <path d="M292 215 Q374 179 447 210 T583 185"/><path d="M305 280 Q365 264 433 284 T580 271"/><path d="M337 163 Q389 137 462 151"/>
      </g>
      {eventId==='clouds'&&<g className="wf-cloud-sweep" opacity=".82"><ellipse cx="356" cy="198" rx="86" ry="22" fill="#e0ebf5" opacity=".56"/><ellipse cx="507" cy="278" rx="100" ry="27" fill="#e7f4ff" opacity=".47"/><ellipse cx="451" cy="151" rx="67" ry="19" fill="#d4e6f6" opacity=".52"/></g>}
      {step>=1&&<g><circle cx="375" cy="208" r="17" fill="#ff6836" opacity=".17" filter="url(#wfBlur)"/><circle cx="375" cy="208" r="5" fill="#ff9b4c"/><circle cx="375" cy="208" r="15" fill="none" stroke="#ff9b52" strokeDasharray="3 5" className="wf-firepulse"/></g>}
      {eventId==='eclipse'&&<g clipPath="url(#wfEarthClip)"><rect x="425" y="83" width="171" height="321" fill="#000a1d" opacity=".72"/><path d="M426 86 Q404 251 426 402" stroke="#9adaf2" strokeWidth="3" fill="none" opacity=".45"/></g>}
      {step>=6&&<g><circle cx="523" cy="284" r="24" fill="#fc924d" opacity=".19" filter="url(#wfBlur)"/><circle cx="523" cy="284" r="6" fill="#ffae65"/></g>}
    </g>
    <g opacity=".52"><path d="M430 74 V38 M430 418 V448 M241 246 H210 M619 246 H652" stroke="#73b7d9" strokeWidth="1"/><path d="M211 246 l9 -4 v8z M649 246 l-9 -4 v8z" fill="#76cbe4"/></g>
    {eventId==='contact'&&<path d={`M ${sx} ${sy} Q 620 230 570 340`} fill="none" stroke="#80ffe4" strokeWidth="2.5" strokeDasharray="5 8" className="wf-beacon"/>}
    <g transform="translate(570 340)"><path d="M0 -26 V-3 L18 6" fill="none" stroke="#72cbf7" opacity=".4" strokeDasharray="3 5"/><circle r="5" fill="#98feef"/><circle r="14" fill="none" stroke="#73e2d3" opacity=".65" className="wf-beacon"/><text x="-9" y="33" fill="#9ddee9" fontSize="12" textAnchor="middle">GROUND STATION</text></g>
    <g transform={`translate(${sx} ${sy}) rotate(${-38+(orbit*4.1)})`} className={front?'wf-sat-front':'wf-sat-back'}>
      <circle r="25" fill="#80d4ff" opacity=".16"/><rect x="-37" y="-12" width="28" height="24" fill="#2f91c0" stroke="#b0e9ff" strokeWidth="2"/><rect x="9" y="-12" width="28" height="24" fill="#2f91c0" stroke="#b0e9ff" strokeWidth="2"/>
      <path d="M-30 -11 V11 M-20 -11 V11 M20 -11 V11 M30 -11 V11" stroke="#bbf0ff" opacity=".35"/><rect x="-8" y="-9" width="16" height="18" rx="2" fill="#deedf5" stroke="#88b9d5"/><path d="M0 -10 V-23 L7 -28" stroke="#f3fbff" strokeWidth="2" fill="none"/><circle cx="7" cy="-28" r="3" fill="#a2f8e4"/>
    </g>
    {alarm&&<g transform="translate(65 84)"><rect x="0" y="0" width="196" height="43" rx="8" fill="#5b262e" stroke="#ff726d"/><circle cx="18" cy="20" r="5" fill="#ff8080" className="wf-firepulse"/><text x="32" y="26" fill="#ffdfd7" fontWeight="700" fontSize="12">MISSION ALERT ACTIVE</text></g>}
  </svg>
  <div className="wf-world-top"><span className="wf-caps">LIVE MISSION VIEW <i className="wf-live-dot"/></span><span className="wf-altitude">≈ 550 km ALTITUDE · SIMULATED SSO</span></div>
  <div className="wf-world-bottom"><span>EARTH · LOW POLAR ORBIT</span><span>ORBIT PATH IS ILLUSTRATIVE</span></div>
 </div>
}
