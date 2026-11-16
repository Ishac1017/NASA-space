export default function Meters({ items }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))' }}>
      {items.map((m) => (
        <div className="card" key={m.label}>
          <div className="muted" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{m.label}</span><span>{m.value}{m.unit || ''}</span></div>
          {m.bar !== false && <div className="bar"><div style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }} /></div>}
        </div>
      ))}
    </div>
  );
}
