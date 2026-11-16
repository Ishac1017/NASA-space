import { DATA, byId } from '../data';
import { evaluate } from './evaluate';
export function launchCheck(state){
 const {metrics:m,requirements}=evaluate(state),mission=byId(DATA.missions,state.missionId),launcher=byId(DATA.launchers,state.launcherId);
 const cap=launcher?.capacity[state.orbitId]??0,items=[],add=(level,text)=>items.push({level,text});
 m.instrumentCount>m.slots?add('fail',`${m.instrumentCount} instruments exceed ${m.slots} slots.`):add('ok','Instrument slots fit.');
 m.instrumentCount===0&&add('warn','No scientific instruments selected.');
 m.powerMargin<0?add('fail',`Power demand ${m.powerDraw} W exceeds generation ${m.powerOutput} W.`):m.powerMargin<10?add('warn',`Only ${m.powerMargin}% power margin.`):add('ok',`${m.powerMargin}% power margin.`);
 m.mass>cap?add('fail',`Mass ${m.mass} kg exceeds ${launcher?.name} capacity ${cap} kg.`):add('ok',`Mass ${m.mass} kg fits launcher capacity ${cap} kg.`);
 m.totalCost>mission.budgetCap?add('fail',`$${m.totalCost}M exceeds $${mission.budgetCap}M budget.`):add('ok',`$${m.totalCost}M within budget.`);
 state.orbitId!==mission.orbit&&add('warn',`Selected orbit differs from the recommended ${byId(DATA.orbits,mission.orbit)?.name}.`);
 m.dataBalance<0&&add('warn',`Data generation exceeds downlink by ${-m.dataBalance} units per cycle.`);
 requirements.filter(r=>!r.pass&&r.metric!=='lifetime').forEach(r=>add('warn',`Mission requirement unmet: ${r.text}.`));
 return {items,hasFail:items.some(i=>i.level==='fail')};
}
