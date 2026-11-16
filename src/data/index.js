import missions from './missions.json';
import parts from './parts.json';
import orbits from './orbits.json';
import launchers from './launchers.json';
import events from './events.json';
import quiz from './quiz.json';
export const DATA = { missions, parts, orbits, launchers, events, quiz };
export const byId = (arr, id) => (arr || []).find((x) => x.id === id);
export function validateData() {
  const errs = [];
  missions.forEach((m) => {
    if (!byId(orbits, m.orbit)) errs.push(`Mission ${m.id}: unknown orbit "${m.orbit}"`);
    (m.eventPool || []).forEach((e) => { if (!byId(events, e)) errs.push(`Mission ${m.id}: unknown event "${e}"`); });
  });
  events.forEach((e) => { if (!e.options || !e.options.length) errs.push(`Event ${e.id}: no options`); });
  return errs;
}
