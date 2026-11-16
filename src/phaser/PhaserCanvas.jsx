import {useEffect,useRef,useState} from 'react';
import {makeInteriorScene,makeSpaceScene} from './scenes';
/** A real Phaser 3 game instance lives in this React component. React handles menus and HUD. */
export default function PhaserCanvas({variant='space',missionId,episodeIndex=0,eventId='',alarmRoom='',alarm=false,probeReleased=false,paused=false,disabled=false,onTask=()=>{},onNear=()=>{},onPosition=()=>{},startPosition={x:968,y:155},navigateTarget='',instanceKey=0,rooms=[]}){
 const root=useRef(null),game=useRef(null),props=useRef(null),[ready,setReady]=useState(false),[error,setError]=useState(false);
 props.current={variant,missionId,episodeIndex,eventId,alarmRoom,alarm,probeReleased,paused,disabled,onTask,onNear,onPosition,startPosition,rooms,base:import.meta.env.BASE_URL};
 useEffect(()=>{let cancelled=false;let running=null;setReady(false);setError(false);
  import('phaser').then(({default:Phaser})=>{if(cancelled||!root.current)return;const scene=variant==='inside'?makeInteriorScene(Phaser,()=>props.current):makeSpaceScene(Phaser,()=>props.current);
   running=new Phaser.Game({type:Phaser.AUTO,parent:root.current,width:1120,height:620,backgroundColor:'#071225',antialias:true,pixelArt:false,render:{transparent:false},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:1120,height:620},scene:[scene],audio:{noAudio:true}});game.current=running;setReady(true);
  }).catch(e=>{console.error('Phaser could not start:',e);if(!cancelled){setReady(false);setError(true)}});
  return()=>{cancelled=true;try{running?.destroy(true)}catch{}if(game.current===running)game.current=null};
 },[variant,missionId,instanceKey]);
 useEffect(()=>{if(!navigateTarget||variant!=='inside')return;let tries=0;const id=window.setInterval(()=>{tries++;try{const scene=game.current?.scene.getScene('Interior');if(scene?.sys.isActive()&&scene.avatar){scene.goToRoom(navigateTarget.split('|')[0]);window.clearInterval(id)}}catch{}if(tries>30)window.clearInterval(id)},140);return()=>window.clearInterval(id)},[navigateTarget,variant,instanceKey]);
 return <div className={`phaser-mount phaser-${variant}`}><div ref={root} className="phaser-stage" role="img" aria-label={variant==='inside'?'Playable top-down spacecraft interior with a controllable astronaut':`Animated ${missionId} space mission route`}/>{!ready&&<div className="phaser-loading">{error?'Could not start Phaser. Check that npm install completed successfully.':'Preparing flight graphics…'}</div>}</div>;
}
