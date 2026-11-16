import {roomArt,roomLabels,roomHelp} from '../game/missionGuide';
const rooms=['power','comms','control','vault','instr','thermal','engine','nav','hull'];
export default function ShipView({selected,onSelect,alertRoom=null}){
return <div className="room-map" aria-label="Clickable spacecraft systems">{rooms.map((id,i)=><button className={`room-tile ${id===selected?'chosen':''} ${id===alertRoom?'needs-help':''}`} onClick={()=>onSelect(id)} key={id} aria-pressed={selected===id} title={roomHelp[id]}><span className="room-art"><img src={`${import.meta.env.BASE_URL}images/${roomArt[id]}`} alt="" loading="lazy"/></span><span className="room-name">{roomLabels[id]}</span>{id===alertRoom&&<span className="room-pulse"/>}</button>)}</div>;
}
