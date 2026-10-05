const METRICS = [
  ['45+', 'Years of combined advisory perspective'],
  ['250+', 'Client conversations supported'],
  ['100%', 'Confidential first discussions'],
  ['24 hrs', 'Typical response target'],
]

export default function MetricStrip() {
  return (
    <section className="metric-strip" aria-label="Company highlights">
      {METRICS.map(([value, label]) => (
        <div key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  )
}
