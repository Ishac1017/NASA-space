export const TWO = Math.PI * 2;
export const rad = (d) => (d * Math.PI) / 180;
export const norm = (a) => ((a % TWO) + TWO) % TWO;
export const START = rad(40);
export function inside(theta, zone) {
  const a = norm(theta), f = norm(rad(zone.from)), e = norm(rad(zone.to));
  return f <= e ? a >= f && a <= e : a >= f || a <= e;
}
export function zonePoints(orbit, zone, cx, cy, steps = 24) {
  const span = norm(rad(zone.to) - rad(zone.from));
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = rad(zone.from) + (span * i) / steps;
    pts.push(`${(cx + orbit.a * Math.cos(t)).toFixed(1)},${(cy + orbit.b * Math.sin(t)).toFixed(1)}`);
  }
  return pts.join(' ');
}
