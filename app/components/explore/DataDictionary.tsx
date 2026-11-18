const HEAD = 'flex justify-between font-label-md text-label-md'
const BODY = 'font-body-sm text-body-sm text-on-surface-variant mt-2'

export function DataDictionary() {
  return (
    <section className="flex flex-col gap-space-md">
      <div>
        <span className="eyebrow">Methodology</span>
        <h2 className="font-headline-sm text-headline-sm">Data dictionary &amp; feature rationale</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="card">
          <p className={HEAD}>
            7 input features <span className="chip chip-low">Used</span>
          </p>
          <p className={BODY}>
            Model year, make, vehicle class, engine size, cylinders, transmission, fuel type: all known before a vehicle is
            tested. Target: Combined (L/100 km).
          </p>
        </div>
        <div className="card">
          <p className={HEAD}>
            Model name <span className="chip bg-slate-100 text-slate-600">Dropped</span>
          </p>
          <p className={BODY}>
            4,504 distinct values. Its signal is already captured by make and vehicle class, and it would not generalise to new
            model names.
          </p>
        </div>
        <div className="card">
          <p className={HEAD}>
            Other fuel and CO₂ columns <span className="chip chip-severe">Leakage</span>
          </p>
          <p className={BODY}>
            City (L/100 km), Highway (L/100 km), Combined (mpg), CO₂ emissions (g/km) and CO₂ rating are part of the target,
            the target in other units, or derived from it. They do not exist for untested vehicles.
          </p>
        </div>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Smog rating: not used in the main fuel model (69% missing, different pollutant). A separate smog rating model is planned.
      </p>
    </section>
  )
}
