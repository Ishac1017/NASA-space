import {useEffect,useRef,useState} from 'react';
import {useGame} from '../state/gameStore';
const stageTrack={select:'design',requirements:'design',craft:'design',configure:'design',quiz:'design',check:'design',launch:'launch',launchFailure:'event',operations:'orbit',review:'landing'};
export default function AudioManager(){const {state}=useGame();const [enabled,setEnabled]=useState(false),[volume,setVolume]=useState(.2);const ref=useRef(null);
const track=state.stage==='operations'?(state.adventureCue==='event'?'event':`mission_${state.missionId}`):state.currentEventId?'event':stageTrack[state.stage]||'design';
useEffect(()=>{const audio=ref.current;if(!audio)return;audio.pause();audio.src=`${import.meta.env.BASE_URL}audio/ambient_${track}.wav`;audio.volume=volume;audio.loop=true;if(enabled)audio.play().catch(()=>{});},[track,enabled]);
useEffect(()=>{if(ref.current)ref.current.volume=volume;},[volume]);
return <div className="soundbar"><audio ref={ref} preload="none"/><button aria-pressed={enabled} title={enabled?'Turn off music':'Turn on music'} onClick={()=>setEnabled(x=>!x)}>{enabled?'♫ Music on':'♪ Music off'}</button>{enabled&&<input aria-label="Music volume" type="range" min="0" max="0.5" step="0.05" value={volume} onChange={e=>setVolume(Number(e.target.value))}/>}</div>;
}
