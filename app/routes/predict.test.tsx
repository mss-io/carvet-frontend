import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { trainingSummary } from '../lib/model-facts'
import Predict, { meta, MOCKUP_NOTE } from './predict'

// R2: strip React's text-node separators before asserting on text.
const out = renderToString(<Predict />).replace(/<!-- -->/g, '')

describe('Predict', () => {
  it('prerenders the default RAV4 preset without reading the hash', () => {
    for (const text of ['2024 Toyota RAV4 AWD', 'Official NRCan rating', '$2,805', 'aria-pressed="true"']) {
      expect(out).toContain(text)
    }
    expect(out).not.toContain('Estimate, not an official NRCan rating.')
    expect(out).not.toContain('NaN')
  })

  it('explains the mockup scope and future model', () => {
    expect(MOCKUP_NOTE).toBe(
      'Mockup: shows official NRCan ratings for the example vehicles only. The CarVet model will be connected in a later phase.',
    )
    for (const text of [
      MOCKUP_NOTE,
      trainingSummary(),
      'near-constant factor per fuel type',
      'The model is not connected in this mockup.',
      'Pick an example vehicle',
    ]) {
      expect(out).toContain(text)
    }
    expect(out).not.toContain('29,215 NRCan lab-tested')
    expect(out).not.toContain("Enter a vehicle's specs")
  })

  it('uses colons in the fuel option labels', () => {
    expect(out).toContain('X: Regular gasoline')
    expect(out).not.toContain('X — Regular gasoline')
  })

  it('has the page title and description', () => {
    const m = meta({} as never)
    expect(m[0]).toEqual({ title: 'CarVet · Predict' })
    expect(m[1]).toEqual({
      name: 'description',
      content: 'CarVet: predicting combined fuel consumption and CO₂ emissions from vehicle specifications, by Team Moneyball.',
    })
  })
})
