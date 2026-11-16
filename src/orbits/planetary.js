/** Source: NASA/JPL Approximate Positions of the Planets (1800–2050), Table 1.
 * Earth coordinates represent the Earth-Moon barycenter; this is not Horizons.
 * Spacecraft trajectories in the game are schematic and not solved from these dots. */
export const JPL={
 Mercury:[[.38709927,.20563593,7.00497902,252.25032350,77.45779628,48.33076593],[.00000037,.00001906,-.00594749,149472.67411175,.16047689,-.12534081]],
 Venus:[[.72333566,.00677672,3.39467605,181.97909950,131.60246718,76.67984255],[.00000390,-.00004107,-.00078890,58517.81538729,.00268329,-.27769418]],
 Earth:[[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0],[.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0]],
 Mars:[[1.52371034,.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],[.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343]],
 Jupiter:[[5.20288700,.04838624,1.30439695,34.39644051,14.72847983,100.47390909],[-.00011607,-.00013253,.00183714,3034.74612775,.21252668,.20469106]],
 Saturn:[[9.53667594,.05386179,2.48599187,49.95424483,92.59887831,113.66242448],[-.00125060,-.00050991,.00193609,1222.49362201,-.41897216,-.28867794]],
 Uranus:[[19.18916464,.04725744,.77263783,313.23810451,170.95427630,74.01692503],[-.00196176,-.00004397,.00268329,428.48202785,.40805281,.04240589]],
 Neptune:[[30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574],[.00026291,.00005105,.00035372,218.45945325,-.32241464,-.00508664]],
};
// The rate terms in the official table are transcribed into data above; preserve original precision.
const rad=d=>d*Math.PI/180;
const rotations=(el,x,y)=>{const [a,e,inc,l,peri,node]=el;const o=rad(node),w=rad(peri-node),I=rad(inc);const co=Math.cos(o),so=Math.sin(o),cw=Math.cos(w),sw=Math.sin(w),ci=Math.cos(I),si=Math.sin(I);return [(cw*co-sw*so*ci)*x+(-sw*co-cw*so*ci)*y,(cw*so+sw*co*ci)*x+(-sw*so+cw*co*ci)*y,(sw*si)*x+(cw*si)*y];};
export function elements(name,date){const data=JPL[name];if(!data)return null;const century=(+date-Date.UTC(2000,0,1,12))/(86400000*36525);return data[0].map((x,i)=>x+century*data[1][i]);}
export function atEccentricAnomaly(name,date,E){const el=elements(name,date);if(!el)return [0,0,0];const [a,e]=el;return rotations(el,a*(Math.cos(E)-e),a*Math.sqrt(1-e*e)*Math.sin(E));}
export function jplPosition(name,date){const el=elements(name,date);if(!el)return [0,0,0];const [a,e,inc,l,peri]=el;const M=rad(((l-peri+180)%360+360)%360-180);let E=M+e*Math.sin(M);for(let k=0;k<16;k++){const d=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=d;if(Math.abs(d)<1e-13)break}return atEccentricAnomaly(name,date,E);}
export const PLANETS=['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];
export const COLORS={Mercury:'#b7bec6',Venus:'#e6c889',Earth:'#59c8f3',Mars:'#e99d74',Jupiter:'#ddb78a',Saturn:'#e5d4b3',Uranus:'#9cddd7',Neptune:'#779dff'};
