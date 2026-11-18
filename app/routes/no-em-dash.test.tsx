import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { CompareResults } from '../components/compare/CompareResults'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { stats } from '../lib/data'
import Compare, { meta as compareMeta } from './compare'
import Explore, { meta as exploreMeta } from './explore'
import Home, { meta as homeMeta } from './home'
import Predict, { meta as predictMeta } from './predict'

function proseEmDashes(html: string): string[] {
  const segments = html.split(/<[^>]*>/)
  for (const [tag] of html.matchAll(/<[^>]*>/g)) {
    for (const [, value] of tag.matchAll(/\s(?:title|aria-label|alt|placeholder|content)="([^"]*)"/g)) {
      segments.push(value)
    }
  }
  return segments.map((segment) => segment.trim()).filter((segment) => segment.includes('—') && segment !== '—')
}

describe('proseEmDashes', () => {
  it('allows a standalone missing-value placeholder', () => {
    expect(proseEmDashes('<span>—</span>')).toEqual([])
  })

  it('finds em-dashes in text nodes', () => {
    expect(proseEmDashes('<p>a — b</p>')).toEqual(['a — b'])
  })

  it('finds em-dashes in user-facing attributes', () => {
    expect(proseEmDashes('<span title="x — y">1</span>')).toEqual(['x — y'])
  })
})

describe('no em-dashes in UI prose', () => {
  it.each([
    ['Home', () => <MemoryRouter><Home /></MemoryRouter>],
    ['Explore', () => <MemoryRouter><Explore /></MemoryRouter>],
    ['Predict', () => <Predict />],
    ['Compare', () => <Compare />],
    ['SiteHeader', () => <MemoryRouter initialEntries={['/compare']}><SiteHeader /></MemoryRouter>],
    ['SiteFooter', () => <SiteFooter />],
  ] as const)('%s renders without prose em-dashes', (_name, render) => {
    const html = renderToString(render()).replace(/<!-- -->/g, '')
    expect(proseEmDashes(html)).toEqual([])
  })

  it('renders Compare results without prose em-dashes when annual distance is missing', () => {
    const selected = stats.presets.predict.slice(0, 2).map(({ record }) => record)
    const html = renderToString(<CompareResults selected={selected} km={null} price={1.65} />).replace(/<!-- -->/g, '')
    expect(proseEmDashes(html)).toEqual([])
  })

  it.each([
    ['Home', homeMeta],
    ['Explore', exploreMeta],
    ['Predict', predictMeta],
    ['Compare', compareMeta],
  ] as const)('%s has a description without em-dashes', (_name, meta) => {
    const description = meta({} as never).find((entry) => entry.name === 'description')
    expect(description?.content).toMatch(/^[^—]+$/)
  })
})
