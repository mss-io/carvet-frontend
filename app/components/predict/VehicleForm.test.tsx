import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { stats } from '../../lib/data'
import { VehicleForm } from './VehicleForm'

const r = stats.presets.predict[0].record
const values = { year: r.year, make: r.make, cls: r.cls, engine: r.engine.toFixed(1), cyl: r.cyl, trans: r.trans, fuel: r.fuel }
const render = (pending: boolean) =>
  renderToString(<VehicleForm values={values} pending={pending} onChange={() => {}} onSubmit={() => {}} />).replace(/<!-- -->/g, '')

describe('VehicleForm', () => {
  it('shows a lookup label while pending, not an estimate', () => {
    expect(render(true)).toContain('Checking…')
    expect(render(true)).not.toContain('Estimating')
    expect(render(false)).toContain('Predict')
  })
})
