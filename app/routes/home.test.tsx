import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { CO2_BAND_NOTE } from '../components/Co2BandChip'
import { cvSummary, NOTEBOOK_SOURCE, trainingSummary } from '../lib/model-facts'
import Home, { meta } from './home'

// R2: strip React's text-node separators before asserting on text.
const out = renderToString(
  <MemoryRouter>
    <Home />
  </MemoryRouter>,
).replace(/<!-- -->/g, '')

describe('Home', () => {
  it('fills the dynamic slots from stats', () => {
    for (const text of [
      '29,215',
      '2024 Toyota RAV4 AWD',
      'Sport utility vehicle: Small · 2.5 L · 4 cyl · AS8 · fuel X',
      '199',
      '8.5',
      '$2,805',
      '0.8–8.4 L',
      '56 makes',
      '17 NRCan classes',
      '30 NRCan codes',
      'Target: combined fuel consumption (L/100 km). CO₂ (g/km) is calculated from it using a near-constant factor per fuel type.',
      trainingSummary(),
      'Random Forest',
      cvSummary(),
      NOTEBOOK_SOURCE,
      'Hold-out test results: pending',
      CO2_BAND_NOTE,
      'The CarVet model will be connected in a later phase.',
      'is designed to predict',
    ]) {
      expect(out).toContain(text)
    }
  })

  it('omits the previous training, target and prediction claims', () => {
    for (const text of ['trained on 29,215', 'primary)', 'CarVet returns an estimate', 'Estimate a vehicle']) {
      expect(out).not.toContain(text)
    }
  })

  it('renders the CO2 band chip for the example record', () => {
    expect(out).toMatch(/class="chip chip-[a-z]+"/)
  })

  it('links to predict, explore and compare', () => {
    for (const href of ['/predict', '/explore', '/compare']) {
      expect(out).toContain(`href="${href}"`)
    }
  })

  it('keeps the title and adds the mockup description', () => {
    const m = meta({} as never)
    expect(m).toContainEqual({ title: 'CarVet · Home' })
    expect(m).toContainEqual({
      name: 'description',
      content:
        'CarVet: predicting combined fuel consumption and CO₂ emissions from vehicle specifications, by Team Moneyball.',
    })
  })
})
