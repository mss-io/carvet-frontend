import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Prediction } from '../../lib/types'
import { CO2_BAND_NOTE } from '../Co2BandChip'
import { ResultsPanel } from './ResultsPanel'

const preset: Prediction = { co2: 199, comb: 8.5, city: 9.9, hwy: 7.1, label: 'Test car', source: 'preset' }

describe('ResultsPanel', () => {
  it('shows the official rating and combined fuel use for a preset', () => {
    const out = renderToString(<ResultsPanel state={{ kind: 'result', prediction: preset }} previous={null} />)
      .replace(/<!-- -->/g, '')

    for (const text of ['Official NRCan rating</h2>', 'Official NRCan rating for this tested vehicle.', 'Combined fuel use', CO2_BAND_NOTE]) {
      expect(out).toContain(text)
    }
    for (const text of ['Estimate', 'City', 'Highway', '9.9', '7.1']) {
      expect(out).not.toContain(text)
    }
  })

  it('labels a model result as an estimate', () => {
    const prediction: Prediction = { ...preset, source: 'model' }
    const out = renderToString(<ResultsPanel state={{ kind: 'result', prediction }} previous={null} />)
      .replace(/<!-- -->/g, '')

    expect(out).toContain('Estimate</h2>')
    expect(out).toContain('Estimate, not an official NRCan rating.')
    expect(out).not.toContain('Official NRCan rating')
  })

  it('prompts the user to pick an example when there is no match', () => {
    const out = renderToString(<ResultsPanel state={{ kind: 'empty' }} previous={preset} />).replace(/<!-- -->/g, '')

    expect(out).toContain('This mockup only includes the example vehicles. Pick one to see its official NRCan rating.')
    expect(out).toContain('Result</h2>')
    expect(out).not.toContain('Official NRCan rating')
    expect(out).not.toContain('Estimate, not an official NRCan rating.')
  })

  it('shows the error message without a rating footnote', () => {
    const out = renderToString(<ResultsPanel state={{ kind: 'error', message: 'Please try again.' }} previous={preset} />)
      .replace(/<!-- -->/g, '')

    expect(out).toContain('Please try again.')
    expect(out).toContain('Result</h2>')
    expect(out).not.toContain('Official NRCan rating')
    expect(out).not.toContain('Estimate, not an official NRCan rating.')
  })

  it('dims the previous official rating while a result is pending', () => {
    const out = renderToString(<ResultsPanel state={{ kind: 'pending' }} previous={preset} />).replace(/<!-- -->/g, '')

    expect(out).toContain('Official NRCan rating</h2>')
    expect(out).toContain('opacity-60')
  })
})
