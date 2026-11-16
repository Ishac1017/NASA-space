/* Phaser 3 animated route and walkable spacecraft scenes. Visuals are educational. */
import {byModule,starterBays} from '../data/modules';
/** Two rows of five positions; empty bays are not accessible rooms. */
export function buildRoomLayout(bays){return (bays||[]).slice(0,10).flatMap((bay,i)=>{
 const mod=byModule(bay.room);if(!mod)return [];
 const col=i%5,row=Math.floor(i/5);return [{id:`bay-${i}`,bayIndex:i,module:mod.id,cap:mod.cap,label:mod.name.toUpperCase(),art:mod.art,info:mod.purpose,row,x:114+223*col,y:row?467:155,instruments:[...(bay.instruments||[])]}];
});}
export const ROOM_LAYOUT=buildRoomLayout(starterBays('neptune'));
/** Translate a mission's needed system into an actual installed bay. */
export function resolveAlarmRoom(capability,rooms){
 const aliases={control:['flight-deck','navigation','crew-quarters'],sensors:['science-lab','observation'],observation:['observation','science-lab'],comms:['communications'],power:['power-bay','life-support'],vault:['data-vault','cargo'],thermal:['thermal-bay','life-support','airlock'],engine:['engine-room','flight-deck'],probe:['cargo']};
 const preferred=(aliases[capability]||[]);const exact=rooms.find(r=>r.cap===capability),alternative=rooms.find(r=>preferred.includes(r.module));const target=exact||alternative||rooms.find(r=>r.module==='flight-deck')||rooms[0];
 return {id:target?.id||'',label:target?.label||'NO ROOM FITTED',missing:!exact&&!alternative,required:capability};
}
const C={background:0x071329,steel:0x172b46,blue:0x35bafc,aqua:0x6af2de,muted:'#9bc6db',white:'#edf8ff',gold:0xffcd73,pink:0xff6880};
const rng=(n)=>{const t=Math.sin(n*91.342+76.335)*43758.5453;return t-Math.floor(t)};
function label(s,x,y,value,size=14,color=C.white,opts={}){return s.add.text(x,y,value,{fontFamily:'Trebuchet MS, Arial, sans-serif',fontSize:`${size}px`,fontStyle:opts.bold?'bold':'normal',color,stroke:'#061124',strokeThickness:opts.bold?2:0,align:opts.align||'left',wordWrap:opts.width?{width:opts.width}:undefined}).setOrigin(opts.center?0.5:0,opts.center?0.5:0).setDepth(opts.depth||5)}
function starfield(s,num=110){const stars=[];for(let i=0;i<num;i++){const x=rng(i+1)*1120,y=rng(i+888)*620,r=.5+rng(i+199)*1.8;const star=s.add.circle(x,y,r,0xb3daff,.20+rng(i+337)*.70).setDepth(-2);stars.push(star)}return stars}
function spacecraft(s,x,y,scale=1){const root=s.add.container(x,y).setDepth(6).setScale(scale);const shadow=s.add.circle(0,0,31,0x36cfff,.12), left=s.add.rectangle(-38,0,45,24,0x2674b2).setStrokeStyle(2,0x9edffb),right=s.add.rectangle(38,0,45,24,0x2674b2).setStrokeStyle(2,0x9edffb),center=s.add.rectangle(0,0,29,29,0xe9eef5).setStrokeStyle(2,0x7bbde3),antenna=s.add.line(0,0,0,-13,0,-35,0xb5faf6).setLineWidth(3),tip=s.add.circle(0,-35,4,0x73f9dc);root.add([shadow,left,right,center,antenna,tip]);return root}
function planet(s,x,y,r,color,kind){
 const haze=s.add.circle(x,y,r+19,color,.10).setDepth(0),body=s.add.circle(x,y,r,color,1).setStrokeStyle(3,kind==='moon'?0xcdd4e0:0x5fc5ee,.75).setDepth(1);
 if(kind==='earth'){
  const g=s.add.graphics().setDepth(2);g.fillStyle(0x318c74,.93);g.fillEllipse(x-r*.30,y-r*.30,r*.75,r*.35);g.fillEllipse(x+r*.28,y-r*.09,r*.5,r*.55);g.fillEllipse(x-r*.06,y+r*.39,r*.29,r*.52);g.fillStyle(0xb9f8ff,.21);g.fillEllipse(x-r*.14,y-r*.53,r*1.3,r*.13);g.fillEllipse(x+r*.08,y+r*.2,r*1.65,r*.18);g.fillStyle(0x092750,.44);g.fillEllipse(x+r*.53,y,r*.65,r*1.73);
 }else if(kind==='moon'){
  const g=s.add.graphics().setDepth(2);for(let i=0;i<13;i++){const px=x+(rng(i+4)-.5)*r*1.45,py=y+(rng(i+79)-.5)*r*1.45;if(Math.hypot(px-x,py-y)>r*.86)continue;const rr=5+rng(i+39)*18;g.fillStyle(0x7b8699,.65);g.fillCircle(px,py,rr);g.lineStyle(2,0xd4dce7,.48);g.strokeCircle(px-2,py-2,rr);}g.fillStyle(0x252f41,.91);g.fillEllipse(x-r*.18,y+r*.42,r*.78,r*.31);g.lineStyle(3,0x8bdaf7,.45);g.strokeEllipse(x-r*.18,y+r*.42,r*.78,r*.31);
 }else if(kind==='neptune'){
  const g=s.add.graphics().setDepth(2);for(let i=0;i<8;i++){g.fillStyle(i%2?0xa1d8f5:0x3074b5,.19+i*.018);g.fillEllipse(x,y-r*.68+i*r*.2,r*1.71,r*.13)}g.fillStyle(0x0b3a75,.96);g.fillEllipse(x-r*.19,y+r*.16,r*.44,r*.23);g.lineStyle(2,0xa7d5f2,.54);g.strokeEllipse(x-r*.19,y+r*.16,r*.54,r*.32);
 }
 return {body,haze};
}
// Educational transfer splines. Ship progress increases with completed chapters;
// unlike a back-and-forth animation the spacecraft does not reverse direction.
const cubic=(a,b,c,d,u)=>{const v=1-u;return a*v*v*v+3*b*v*v*u+3*c*v*u*u+d*u*u*u};
function transferPoint(mission,u){u=Math.max(0,Math.min(1,u));
 if(mission==='lunar')return {x:cubic(205,315,591,774,u),y:cubic(252,124,151,269,u)};
 return {x:cubic(173,285,609,735,u),y:cubic(285,170,160,292,u)};
}
export function makeSpaceScene(Phaser,read){return class SpaceScene extends Phaser.Scene{
 constructor(){super({key:'Space'});this.elapsed=0;this.displayProgress=0;}
 preload(){this.load.image('earthHorizon',`${read().base}visual-kit/layer_earth_horizon.png`)}
 create(){const {missionId,episodeIndex=0}=read();this.stars=starfield(this,118);this.add.rectangle(560,310,1120,620,0x08142c,.18).setDepth(-1);this.group=this.add.container(0,0);this.motion=spacecraft(this,200,230,1);this.orbit=this.add.graphics().setDepth(0);this.routeBright=this.add.graphics().setDepth(2);this.fx=this.add.graphics().setDepth(3);this.mission=missionId;this.episode=episodeIndex;
   if(missionId==='wildfire')this.drawEarth();if(missionId==='lunar')this.drawMoon();if(missionId==='neptune')this.drawNeptune();
   label(this,30,30,missionId==='wildfire'?'EARTH / LOW POLAR ORBIT':missionId==='lunar'?'EARTH → MOON / POLAR ORBIT':'EARTH → OUTER SOLAR SYSTEM → NEPTUNE',18,C.white,{bold:true});
   label(this,30,58,'STYLIZED ANIMATED FLIGHT PATH · TIME AND DISTANCE NOT TO SCALE',11,'#a5c9df');
   this.add.rectangle(560,594,1118,46,0x081b37,.84).setDepth(8);
   this.status=label(this,23,580,'',13,'#c3edfc',{depth:9});
   this.tip=label(this,1088,580,'YOUR SPACECRAFT ●',13,'#a4f3d9',{bold:true,depth:9});this.tip.setOrigin(1,0);
   this.alert=label(this,560,95,'⚠ SPACECRAFT ALARM — OPEN THE SHIP',17,'#ffcb8e',{bold:true,center:true,depth:9});
   this.tweens.add({targets:this.motion,scaleX:1.12,scaleY:1.12,duration:1100,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 }
 drawEarth(){planet(this,552,330,184,0x126ca5,'earth');this.orbit.lineStyle(3,0x72d9ff,.5);this.orbit.strokeEllipse(552,330,690,380);this.orbit.lineStyle(1,0x7df3dc,.18);this.orbit.strokeEllipse(552,330,740,417);label(this,551,511,'EARTH',16,'#a6e9fc',{bold:true,center:true});
  this.add.circle(737,424,6,0x73ffcb).setDepth(4);label(this,740,441,'GROUND STATION',12,'#9debdc',{center:true});
  const g=this.add.graphics().setDepth(3);g.fillStyle(0xff8536,.83);g.fillCircle(465,290,7);g.lineStyle(2,0xffbd6d,.65);g.strokeCircle(465,290,18);this.tweens.add({targets:this.add.circle(465,290,21,0xffa94d,.16).setDepth(4),scale:1.5,alpha:0,yoyo:true,repeat:-1,duration:1600});
  label(this,56,500,'One orbit takes about 90–100 minutes in low Earth orbit.\nThis game speeds up years into short chapters.',13,'#d4ebff',{width:270});
 }
 drawMoon(){planet(this,176,310,62,0x2778b6,'earth');planet(this,831,322,175,0x9ba3b2,'moon');this.orbit.lineStyle(3,0x7fdaf0,.54);this.orbit.beginPath();for(let i=0;i<=80;i++){const pt=transferPoint('lunar',i/80);if(i===0)this.orbit.moveTo(pt.x,pt.y);else this.orbit.lineTo(pt.x,pt.y)}this.orbit.strokePath();this.orbit.lineStyle(2,0x79ecd7,.60);this.orbit.strokeEllipse(831,322,500,350);
  label(this,165,400,'EARTH',14,'#8cdbf4',{center:true});label(this,827,504,'LUNAR SOUTH POLE',14,'#e1eafa',{center:true,bold:true});
  label(this,365,121,'TRANSFER PATH',13,'#c4dbff');label(this,55,540,'The shaded crater floors may stay dark year-round.',13,'#bdd9f3');
  for(let i=0;i<3;i++){const cx=768+i*43,cy=425-i*10;this.add.circle(cx,cy,11,0x101e33,.45).setDepth(3)}
 }
 drawNeptune(){const arriving=this.episode>=3;planet(this,890,306,168,0x266db5,'neptune');planet(this,150,325,42,0x2579ac,'earth');planet(this,465,318,69,0xa68661,'gas');
  this.orbit.lineStyle(3,0x9bcaeb,.48);this.orbit.beginPath();for(let i=0;i<=80;i++){const pt=transferPoint('neptune',i/80);if(i===0)this.orbit.moveTo(pt.x,pt.y);else this.orbit.lineTo(pt.x,pt.y)}this.orbit.strokePath();this.orbit.lineStyle(2,0x79e9f6,.54);this.orbit.strokeEllipse(890,306,402,337);
  label(this,150,396,'EARTH',12,'#b2ddf4',{center:true});label(this,465,400,'JUPITER (ILLUSTRATIVE LANDMARK)',12,'#b5d9e8',{center:true});label(this,886,502,'NEPTUNE',18,'#a8d8ff',{bold:true,center:true});
  label(this,62,518,'Neptune is about 30 times farther from the Sun than Earth.',13,'#c1e3f7');
  {this.probe=this.add.container(777,260).setDepth(7);const p1=this.add.triangle(0,0,0,-16,-9,10,9,10,0xf1c378).setStrokeStyle(2,0xffffff),p2=this.add.circle(0,-17,6,0x76e4f0);this.probe.add([p1,p2]);}
 }
 drawTrail(which,active){this.routeBright.clear();if(!active)return;this.routeBright.lineStyle(4,0x9dfde0,.95);this.routeBright.beginPath();for(let j=0;j<=80;j++){const u=this.displayProgress*j/80,pt=transferPoint(which,u);if(j===0)this.routeBright.moveTo(pt.x,pt.y);else this.routeBright.lineTo(pt.x,pt.y)}this.routeBright.strokePath();}
 update(_,delta){const p=read();if(p.paused)return;this.elapsed+=delta*.001;const t=this.elapsed;const {missionId,episodeIndex=0,eventId=''}=p;
   this.stars.forEach((star,i)=>{star.alpha=.28+.38*(1+Math.sin(t*(.5+rng(i)*1.3)+i))*.5;star.x=star.x<0?1120:star.x-(.08+rng(i)*.18)*delta/16});
   if(missionId==='wildfire'){const a=t*.40-.6;this.motion.setPosition(552+345*Math.cos(a),330+190*Math.sin(a)).setRotation(a+.45);this.status.setText('ORBIT VIEW  •  HEAT SPOTS ARE POSSIBLE FIRES, NOT CONFIRMATION');}
   if(missionId==='lunar'){
      const arrival=episodeIndex>=2;
      if(!arrival){const goal=Math.min(1,(episodeIndex+.7)/2);this.displayProgress+=(goal-this.displayProgress)*Math.min(1,delta*.0025);const pt=transferPoint('lunar',this.displayProgress);this.motion.setPosition(pt.x,pt.y).setRotation(.75);this.status.setText(`EARTH → MOON TRANSFER  •  ROUTE ${(100*this.displayProgress).toFixed(0)}%  •  ENGINEERING TRAJECTORY SCHEMATIC`);}
      else{const a=t*.32-1;this.motion.setPosition(831+250*Math.cos(a),322+175*Math.sin(a)).setRotation(a+.6);this.status.setText('LUNAR POLAR ORBIT  •  SHADOWED CRATERS CAN REMAIN VERY COLD');}
      this.drawTrail('lunar',!arrival);
   }
   if(missionId==='neptune'){
      const arrival=episodeIndex>=3;
      if(!arrival){const goal=Math.min(1,(episodeIndex+.85)/3);this.displayProgress+=(goal-this.displayProgress)*Math.min(1,delta*.002);const pt=transferPoint('neptune',this.displayProgress);this.motion.setPosition(pt.x,pt.y).setRotation(.75);this.status.setText(`DEEP-SPACE TRANSFER  •  ROUTE ${(this.displayProgress*100).toFixed(0)}%  •  YEARS OF TRAVEL`);}
      else{const a=t*.28+.7;this.motion.setPosition(890+201*Math.cos(a),306+167*Math.sin(a)).setRotation(a+.4);this.status.setText('NEPTUNE ORBIT / ENCOUNTER  •  DELAYED RADIO COMMANDS · NO SOLID SURFACE');}
      this.drawTrail('neptune',!arrival);

     if(this.probe){this.probe.visible=!!p.probeReleased;this.probe.x=867+14*Math.sin(t*.2);this.probe.y=190+Math.min(260,Math.max(0,t-episodeIndex*3)*8);this.probe.setRotation(.2+Math.sin(t)*.18);}}
   this.alert.setVisible(!!p.alarm);this.alert.setAlpha(.60+.40*Math.sin(t*5)**2);
   this.fx.clear();if(eventId==='solar' || eventId==='radiation'){this.fx.lineStyle(2,0xff7d7d,.28);for(let i=0;i<4;i++){this.fx.strokeEllipse(600,315,240+i*80+17*Math.sin(t*2+i),100+i*64)}}
   if(eventId==='blackout'){this.fx.fillStyle(0x000b20,.47);this.fx.fillEllipse(956,335,205,440)}
   if(eventId==='storm'){this.fx.lineStyle(5,0x7fccff,.33);this.fx.strokeEllipse(850,323,150+12*Math.sin(t*2),80+10*Math.cos(t*2));}
   if(eventId==='belt'){
     // Only a handful of distant objects: the belt is mostly EMPTY space.
     for(let i=0;i<7;i++){const x=260+i*70+12*Math.sin(t*.4+i),y=185+22*(i%3)+13*Math.cos(t*.65+i),r=2+(i%3)*2;this.fx.fillStyle(0xc3a9a0,.65);this.fx.fillCircle(x,y,r)}
   }
   if(eventId==='rtg'){this.fx.lineStyle(3,0xffd284,.65);for(let i=0;i<3;i++)this.fx.strokeCircle(this.motion.x,this.motion.y,43+i*11+4*Math.sin(t*2+i));}
   if(eventId==='delay'||eventId==='relay'||eventId==='downlink'||eventId==='contact'){
     this.fx.lineStyle(2,0x82f8df,.45);this.fx.beginPath();this.fx.moveTo(this.motion.x,this.motion.y);this.fx.lineTo(missionId==='neptune'?150:missionId==='lunar'?176:737,missionId==='wildfire'?424:310);this.fx.strokePath();
     const k=(t*.11)%1;const ex=missionId==='neptune'?150:missionId==='lunar'?176:737,ey=missionId==='wildfire'?424:310;this.fx.fillStyle(0x91fbe0,.88);this.fx.fillCircle(this.motion.x+(ex-this.motion.x)*k,this.motion.y+(ey-this.motion.y)*k,4);
   }
   if(eventId==='cold'){this.fx.fillStyle(0x9aefff,.5);for(let i=0;i<24;i++){const a=i*2.4+t*.3,r=45+(i%5)*8;this.fx.fillCircle(this.motion.x+Math.cos(a)*r,this.motion.y+Math.sin(a)*r,1.7)}}
   if(eventId==='ice'){this.fx.fillStyle(0x9beeff,.8);for(const [x,y] of [[764,409],[814,429],[864,394]])this.fx.fillCircle(x,y,4+Math.sin(t*3+x)*1.6)}
   if(eventId==='probe'){this.fx.lineStyle(3,0xf8d89b,.56);this.fx.strokeEllipse(890,306,248+14*Math.sin(t*3),221+10*Math.cos(t*3));}
   if(eventId==='eclipse'){this.fx.fillStyle(0x021026,.28);this.fx.fillRect(550,143,178,340)}
   if(eventId==='firstfire'||eventId==='emergency'){this.fx.lineStyle(2,0xffaf6d,.52);this.fx.strokeCircle(465,290,19+8*Math.sin(t*3)**2)}
   if(eventId==='clouds'){
     this.fx.fillStyle(0xc7dcf5,.19);for(let i=0;i<7;i++){const x=400+i*69+Math.sin(t*.35+i)*15,y=260+(i%3)*28;this.fx.fillEllipse(x,y,105,28)}
   }
   if(eventId==='overflow'){for(let i=0;i<15;i++){const u=((i*.13+t*.12)%1),a=i*2.17;this.fx.fillStyle(i%3?0x7cd8ef:0xffc67f,.55);this.fx.fillRect(this.motion.x-73+140*u,this.motion.y-60+Math.sin(a)*49,7,6)}}
   if(eventId==='calibration'||eventId==='map'){
     this.fx.lineStyle(2,0x8cffe8,.45);for(let i=0;i<5;i++){const offset=((i*14+t*16)%77);this.fx.lineBetween(this.motion.x-43,this.motion.y+20+offset,this.motion.x+43,this.motion.y+20+offset)}
     this.fx.lineStyle(2,0xdfffa7,.64);this.fx.strokeCircle(this.motion.x,this.motion.y+62,15+8*Math.sin(t*2)**2);
   }
   if(eventId==='orbit'||eventId==='arrival'||eventId==='orbitfix'){
     const f=0.4+0.5*Math.abs(Math.sin(t*12));this.fx.fillStyle(0xff9c49,f);this.fx.fillTriangle(this.motion.x-7,this.motion.y+20,this.motion.x+7,this.motion.y+20,this.motion.x,this.motion.y+56+15*Math.sin(t*9)**2);
     this.fx.lineStyle(3,0xfbdd8a,.8);this.fx.strokeCircle(this.motion.x,this.motion.y,44+7*Math.sin(t*3));
   }
   if(eventId==='storm'){
     this.fx.fillStyle(0x0a3765,.58);this.fx.fillEllipse(860+Math.sin(t*.3)*16,354,58,29);this.fx.lineStyle(2,0xa4dcf3,.75);this.fx.strokeEllipse(860+Math.sin(t*.3)*16,354,71,38);
   }
   if(eventId==='probe'&&missionId==='neptune'){
     this.fx.lineStyle(2,0xfbe7af,.8);this.fx.lineBetween(this.motion.x,this.motion.y,872,231);this.fx.fillStyle(0xe8d1a3,.75);this.fx.fillTriangle(874,232,863,213,886,213);
   }


 }
}}
const between=(n,a,b)=>Math.max(a,Math.min(b,n));
export function makeInteriorScene(Phaser,read){return class InteriorScene extends Phaser.Scene{
 constructor(){super({key:'Interior'});this.goal=null;this.pos={x:114,y:155};this.lastReport=0;this.pulse=0;this.layout=[];}
 preload(){const rooms=read().rooms||ROOM_LAYOUT,seen=new Set();for(const r of rooms){if(seen.has(r.art))continue;seen.add(r.art);const path=`${read().base}moonbound/rooms/${r.art}.png`;if(!this.textures.exists(`room-${r.art}`))this.load.image(`room-${r.art}`,path)}}
 create(){const p=read();this.layout=p.rooms||ROOM_LAYOUT;const spawn=this.layout.find(r=>r.module==='flight-deck')||this.layout[0];if(!spawn){label(this,560,260,'No room installed. Return to the hangar and add a module.',22,'#ffd4a4',{center:true});return}
  const starting=p.startPosition||spawn;if(this.layout.some(r=>Math.hypot(r.x-starting.x,r.y-starting.y)<130))this.pos={...starting};else this.pos={x:spawn.x,y:spawn.y};
  starfield(this,53);
  const g=this.add.graphics().setDepth(0);g.fillStyle(0x102b46,1);g.fillRoundedRect(11,10,1098,597,25);g.lineStyle(5,0x4788ad,.85);g.strokeRoundedRect(13,11,1094,593,22);
  g.fillStyle(0x223f53,.98);g.fillRoundedRect(21,270,1078,80,12);g.lineStyle(3,0x9bd4db,.45);g.lineBetween(35,281,1087,281);g.lineBetween(35,341,1087,341);
  for(let x=37;x<1085;x+=33){g.fillStyle(0x66cbbb,.16);g.fillRoundedRect(x,305,19,10,3)}
  this.rooms=[];
  for(const room of this.layout){const {x,y}=room;
   const tile=this.add.rectangle(x,y,207,225,0x152b4c,.96).setStrokeStyle(3,0x4c769e,.75).setDepth(1);
   const key=`room-${room.art}`;let image=this.textures.exists(key)?this.add.image(x,y,key).setDisplaySize(192,188).setDepth(2):this.add.rectangle(x,y,191,190,0x315e81).setDepth(2);
   this.add.rectangle(x,y+84,192,35,0x061328,.85).setDepth(3);
   const head=label(this,x,y+84,`BAY ${room.bayIndex+1}  ${room.label}`,12,'#effbff',{bold:true,center:true,depth:5});
   const hatch=this.add.rectangle(x,room.row?354:267,41,17,0x74d1d1,.80).setDepth(3);
   const touch=this.add.rectangle(x,y,209,223,0x000000,.001).setInteractive({useHandCursor:true}).setDepth(6);
   touch.on('pointerdown',()=>this.goToRoom(room.id));touch.on('pointerover',()=>tile.setStrokeStyle(4,0x9cefc9,.9));touch.on('pointerout',()=>tile.setStrokeStyle(3,0x4c769e,.75));
   const marker=this.add.circle(x,y-76,13,0xff776f,.74).setDepth(7);
   this.rooms.push({room,tile,touch,marker,head,hatch});
   if(room.instruments.length)label(this,x,y-95,`${room.instruments.length} SENSOR${room.instruments.length>1?'S':''}`,10,'#dfff91',{bold:true,center:true,depth:5});
  }
  this.trail=this.add.graphics().setDepth(7);
  this.avatar=this.add.container(this.pos.x,this.pos.y).setDepth(10);
  const aura=this.add.circle(0,13,24,0x41ccfd,.20),backpack=this.add.rectangle(-18,9,12,28,0x8facc4),body=this.add.ellipse(0,12,33,38,0xe8f1fb),legs=[this.add.rectangle(-9,31,9,14,0x7896c1),this.add.rectangle(9,31,9,14,0x7896c1)],head=this.add.circle(0,-11,21,0xe9f1fe).setStrokeStyle(3,0x5a82ac),visor=this.add.ellipse(4,-11,28,17,0x4bace6),shine=this.add.circle(11,-16,4,0xd9feff,.95);
  this.avatar.add([aura,backpack,...legs,body,head,visor,shine]);this.avatar.add(label(this,0,45,'YOU',12,'#c2ffe8',{center:true,bold:true,depth:11}));
  this.arrowKeys=this.input.keyboard.addKeys({up:'W',down:'S',left:'A',right:'D',Up:'UP',Down:'DOWN',Left:'LEFT',Right:'RIGHT'});
  this.input.keyboard.on('keydown-E',()=>{if(this.nearAlarm())read().onTask?.()});
  this.input.keyboard.on('keydown-SPACE',ev=>{ev.preventDefault();if(this.nearAlarm())read().onTask?.()});
  this.updateRoomStatus();
 }
 safe(x,y){const hall=y>=265&&y<=350&&x>=22&&x<=1100;const vertical=this.layout.some(r=>Math.abs(x-r.x)<=94&&(r.row===0?y>=34&&y<=287:y>=337&&y<=585));return hall||vertical}
 setPos(x,y){let xx=between(x,23,1098),yy=between(y,31,592);if(!this.safe(xx,yy)){if(this.safe(xx,this.pos.y))yy=this.pos.y;else if(this.safe(this.pos.x,yy))xx=this.pos.x;else return;}this.pos={x:xx,y:yy};this.avatar.setPosition(xx,yy)}
 goToRoom(id){const room=this.layout.find(r=>r.id===id);if(room)this.goal={id,x:room.x,y:room.y}}
 nearAlarm(){const r=this.layout.find(r=>r.id===read().alarmRoom);return !!r&&Math.hypot(this.pos.x-r.x,this.pos.y-r.y)<92}
 updateRoomStatus(){const closest=this.layout.find(r=>Math.hypot(r.x-this.pos.x,r.y-this.pos.y)<116);const place=closest?.label||'CENTRAL CORRIDOR';if(this.time.now-this.lastReport>180){this.lastReport=this.time.now;read().onPosition?.({...this.pos});read().onNear?.(this.nearAlarm(),place)}}
 update(_,dt){const p=read();if(p.paused||p.disabled||!this.avatar)return;const k=this.arrowKeys,s=dt*.34;const dx=(k.right.isDown||k.Right.isDown?1:0)-(k.left.isDown||k.Left.isDown?1:0),dy=(k.down.isDown||k.Down.isDown?1:0)-(k.up.isDown||k.Up.isDown?1:0);
  if(dx||dy){this.goal=null;const n=Math.hypot(dx,dy)||1;this.setPos(this.pos.x+dx*s/n,this.pos.y+dy*s/n);this.avatar.scaleX=dx<0?-.98:.98;this.avatar.scaleY=1+.019*Math.sin(this.time.now*.026)}
  else if(this.goal){const g=this.goal;let tx=this.pos.x,ty=this.pos.y;if(Math.abs(this.pos.y-308)>7&&Math.abs(this.pos.x-g.x)>8)ty=308;else if(Math.abs(this.pos.x-g.x)>4){tx=g.x;ty=308}else{tx=g.x;ty=g.y}
   const vx=tx-this.pos.x,vy=ty-this.pos.y,d=Math.hypot(vx,vy),v=dt*.47;if(d>2)this.setPos(this.pos.x+vx/d*Math.min(v,d),this.pos.y+vy/d*Math.min(v,d));else if(Math.hypot(this.pos.x-g.x,this.pos.y-g.y)<10){this.setPos(g.x,g.y);this.goal=null}}
  this.updateRoomStatus();this.pulse+=dt*.003;this.trail.clear();const alarm=this.layout.find(r=>r.id===p.alarmRoom);
  for(const item of this.rooms){const active=item.room.id===p.alarmRoom;item.marker.setVisible(active);item.tile.setStrokeStyle(active?4:3,active?0xffab6b:0x4c769e,active?.65+.32*Math.sin(this.pulse*4)**2:.73);if(active)item.marker.setAlpha(.50+.49*Math.sin(this.pulse*4)**2)}
  if(alarm){this.trail.lineStyle(3,0x7decc9,.54);this.trail.beginPath();this.trail.moveTo(this.pos.x,this.pos.y);this.trail.lineTo(this.pos.x,309);this.trail.lineTo(alarm.x,309);this.trail.lineTo(alarm.x,alarm.y);this.trail.strokePath();if(this.nearAlarm()&&this.time.now%850<430){this.trail.fillStyle(0xffd48c,.19);this.trail.fillCircle(alarm.x,alarm.y,67)}}
 }
}}
