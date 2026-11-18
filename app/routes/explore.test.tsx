import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { fmt } from '../lib/carvet'
import { MODEL_FACTS, modelSetSummary } from '../lib/model-facts'
import Explore, { meta } from './explore'

// R2: strip React's text-node separators before asserting on text.
const out = renderToString(
  <MemoryRouter>
    <Explore />
  </MemoryRouter>,
).replace(/<!-- -->/g, '')

describe('Explore', () => {
  it('prerenders the static KPI cards from stats', () => {
    for (const text of [
      'Canadian light-duty vehicles, 1995–2026',
      '29,215',
      '>1995–2026</p>',
      '32 years',
      '274.2',
      'range 94–633',
      '12.04',
      'range 4.0–27.5',
      'mean 274.2 · median 267.0 · SD 66.0',
      'mean 12.04 · median 11.60 · SD 3.17',
    ]) {
      expect(out).toContain(text)
    }
  })

  it('shows the same mean combined fuel in the KPI card and the histogram', () => {
    expect(out).toContain('Mean combined fuel (L/100 km)</span><p class="font-headline-lg text-headline-lg tabular-nums">12.04</p>')
    expect(out).toContain('mean 12.04 · median 11.60 · SD 3.17')
  })

  it('shows the loading status and no canvas before the CSV loads', () => {
    expect(out).toContain('Loading the attached CSV dataset…')
    expect(out).toContain('Loading vehicle data…')
    expect(out).toContain('Preparing charts')
    expect(out).not.toContain('<canvas')
    expect(out).not.toContain('NaN')
  })

  it('distinguishes the raw records from the model dataset and labels the fuel target', () => {
    expect(out).toContain('Mean combined fuel (L/100 km)')
    expect(out).toContain('Combined fuel (L/100 km)')
    expect(out).toContain('raw merged data')
    expect(out).toContain(`${fmt(MODEL_FACTS.rawRecords)} vehicle configurations from NRCan (raw merged data). ${modelSetSummary()}`)
  })

  it('renders the static filters and data dictionary', () => {
    for (const text of [
      'X - Regular Gasoline',
      'E - Ethanol (E85)',
      'All classes',
      'Reset filters',
      'Data dictionary &amp; feature rationale',
      '4,504 distinct values.',
      'City (L/100 km), Highway (L/100 km), Combined (mpg), CO₂ emissions (g/km) and CO₂ rating',
      'Smog rating: not used in the main fuel model (69% missing, different pollutant). A separate smog rating model is planned.',
    ]) {
      expect(out).toContain(text)
    }
  })

  it('omits the superseded target labels and CO₂ derivation wording', () => {
    for (const text of ['Mean CO₂ (L/100 km)', 'Secondary target', 'calculated from', 'near-constant']) {
      expect(out).not.toContain(text)
    }
  })

  it('has the page title and description', () => {
    const m = meta({} as never)
    expect(m[0]).toEqual({ title: 'CarVet · Explore' })
    expect(m[1]).toEqual({
      name: 'description',
      content:
        'CarVet: predicting combined fuel consumption and CO₂ emissions from vehicle specifications, by Team Moneyball.',
    })
  })
})
