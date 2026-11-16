import {useGame} from './state/gameStore';
import MissionSelect from './screens/MissionSelect';
import Requirements from './screens/Requirements';
import SpacecraftSelect from './screens/SpacecraftSelect';
import Configure from './screens/Configure';
import DesignReview from './screens/DesignReview';
import LaunchResult from './screens/LaunchResult';
import LaunchSequence from './screens/LaunchSequence';
import MissionControl from './screens/MissionControl';
import MissionAdventure from './adventure/MissionAdventure';
import MissionReview from './screens/MissionReview';
import AudioManager from './components/AudioManager';
import ProfileManager from './components/ProfileManager';
const screens={select:MissionSelect,requirements:Requirements,craft:SpacecraftSelect,configure:Configure,quiz:DesignReview,check:LaunchResult,launch:LaunchSequence,launchFailure:LaunchSequence,operations:MissionControl,review:MissionReview};
export default function App(){const {state,dispatch}=useGame();const Screen=state.stage==='operations'?MissionAdventure:(screens[state.stage]||MissionSelect);return <div className={`game-shell mission-${state.missionId||'select'}`}><div className="stars stars-one"/><div className="stars stars-two"/><AudioManager/><header className="topbar"><button className="brand" onClick={()=>dispatch({type:'reset'})} title="Back to mission choices"><span className="brand-badge">✦</span><span>MOON<strong>BOUND ✦</strong><small>SPACE MISSION DESIGN GAME · FUSION</small></span></button><div className="topbar-actions"><span className="build-tag">EDUCATIONAL SIMULATOR · NOT REAL FLIGHT CONTROL</span><ProfileManager/><button className="text-button" onClick={()=>{if(window.confirm('Start over and return to mission selection?'))dispatch({type:'reset'})}}>↺ New game</button></div></header><main><Screen/></main><footer className="footer">Made for learning about mission trade-offs. Game prices, launch limits, time scales and scores are simplified examples. <a href="https://science.nasa.gov/" target="_blank" rel="noreferrer">Explore real NASA missions ↗</a></footer></div>}
