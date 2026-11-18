import { co2Band } from '../lib/carvet'

export const CO2_BAND_NOTE = 'CO₂ bands are a CarVet display aid, not the NRCan CO₂ rating.'

export function Co2BandChip({ gkm }: { gkm: number }) {
  const { key, label } = co2Band(gkm)
  return <span className={`chip chip-${key}`}>{label}</span>
}
