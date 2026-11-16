// Create labelled, clearly simulated pictures in the browser. Not NASA imagery.
export function makeObservation(missionId='wildfire',kind='image'){
 const c=document.createElement('canvas');c.width=440;c.height=260;const x=c.getContext('2d');
 const bg=x.createLinearGradient(0,0,440,260);
 if(missionId==='neptune'){bg.addColorStop(0,'#0b2d68');bg.addColorStop(.45,'#549cd9');bg.addColorStop(1,'#122e79');}
 else if(missionId==='lunar'){bg.addColorStop(0,'#292e42');bg.addColorStop(.5,'#89909d');bg.addColorStop(1,'#262d3b');}
 else{bg.addColorStop(0,'#2c675d');bg.addColorStop(.5,'#99bb6a');bg.addColorStop(1,'#35494b');}
 x.fillStyle=bg;x.fillRect(0,0,440,260);
 if(missionId==='wildfire'){
  for(let i=0;i<8;i++){x.fillStyle='rgba(41,56,33,.42)';x.beginPath();x.ellipse((i*117)%460,(i*69)%280,64,33,(i%3)*.6,0,Math.PI*2);x.fill();}
  for(const [cx,cy,r] of [[150,92,44],[233,167,37],[309,123,27]]){const g=x.createRadialGradient(cx,cy,3,cx,cy,r);g.addColorStop(0,'#fff7ad');g.addColorStop(.24,'#ff6439');g.addColorStop(1,'rgba(231,40,29,0)');x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);}
  x.fillStyle='rgba(241,248,255,.25)';x.fillRect(0,55,440,12);
 } else if(missionId==='lunar'){
  for(let i=0;i<19;i++){const cx=(i*109+39)%440,cy=(i*73+14)%260,r=7+(i*7)%30;x.fillStyle='rgba(28,34,48,.45)';x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill();x.strokeStyle='rgba(219,225,230,.35)';x.lineWidth=3;x.beginPath();x.arc(cx-3,cy-3,r+1,Math.PI*1.05,Math.PI*1.86);x.stroke();}
  x.fillStyle='rgba(93,218,255,.23)';x.beginPath();x.arc(291,168,36,0,Math.PI*2);x.fill();
 } else{
  for(let i=0;i<10;i++){x.strokeStyle=i%2?'rgba(198,239,255,.24)':'rgba(16,40,107,.33)';x.lineWidth=9+i%3*4;x.beginPath();x.moveTo(0,24+i*27);x.bezierCurveTo(130,0+i*24,290,76+i*20,440,10+i*30);x.stroke();}
  x.fillStyle='#1d417b';x.beginPath();x.ellipse(235,133,67,29,-.27,0,Math.PI*2);x.fill();x.strokeStyle='#b8e4ff';x.lineWidth=5;x.beginPath();x.ellipse(235,133,72,35,-.27,0,Math.PI*2);x.stroke();
 }
 x.fillStyle='rgba(1,12,30,.78)';x.fillRect(0,0,440,28);x.fillStyle='#cdefff';x.font='12px monospace';x.fillText(kind==='scan'?'SIMULATED SENSOR MAP':'SIMULATED OBSERVATION · GAME DATA',13,19);
 x.strokeStyle='#e8fcff';x.globalAlpha=.35;x.lineWidth=1;x.strokeRect(14,39,412,208);x.globalAlpha=1;
 return c.toDataURL('image/png');
}
