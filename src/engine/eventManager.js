import { DATA } from '../data';
export function findEvent(trigger, mission, fired) {
  return DATA.events.find((e) =>
    mission.eventPool.includes(e.id) && !(fired.has(e.id) && !e.repeat) && e.trigger.type === trigger.type &&
    (trigger.type === 'zone' ? e.trigger.zone === trigger.zone : e.trigger.lap === trigger.lap)) || null;
}
export function resolveOption(event, index, metrics) {
  const opt = event.options[index];
  const ok = !opt.needs || metrics[opt.needs.stat] >= opt.needs.min;
  return { ok, ...(ok ? opt.pass : opt.fail || opt.pass), label: opt.label };
}
