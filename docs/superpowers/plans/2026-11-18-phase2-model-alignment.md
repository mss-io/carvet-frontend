# Phase 2 Model Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update CarVet's UI text and labels so they match the DATA440 Phase 2 model decisions and are honest that this build is a mockup with preset vehicles only.

**Architecture:** In-place text and markup edits in existing route and component files. One new pure module, `app/lib/model-facts.ts`, holds counts, metrics and the shared sentences built from them, so Home, Predict and Explore read one source. No data pipeline, backend or `stats.json` changes.

**Tech Stack:** React Router 8 (prerendered, `ssr: false`), React 19 with React Compiler, Tailwind, Vitest (`renderToString`).

**Spec:** `docs/superpowers/specs/2026-11-18-phase2-model-alignment-design.md`

## Global Constraints

- Canadian spelling, metric units (`L/100 km` with a space).
- No em-dash (`—`) in UI prose, including meta descriptions, `title` attributes and option labels. A standalone `—` missing-value placeholder (`fmt`, `formatMoney`, `explore-view` `fmtMax`, CarPicker `BLANK`, ResultsPanel value fallbacks) stays.
- Mockup honesty: no UI text may imply this build runs a real model or can predict any vehicle configuration.
- CO₂ is described as calculated from fuel use with a "near-constant factor per fuel type" only where the model is described (Home, Predict). Never on Explore.
- Numbers formatted with `en-CA` (use `fmt` from `app/lib/carvet.ts`).
- Theme tokens only, no hex colours in JSX. No `useMemo`/`useCallback`.
- Do not hand-edit `app/data/stats.json`, `app/data/cars.json`, `app/components/icons.ts`.
- `predict()` signature and the `Prediction` type in `app/lib/types.ts` stay unchanged.
- Component tests strip `<!-- -->` before asserting text.
- Shared meta description (all four routes): `CarVet: predicting combined fuel consumption and CO₂ emissions from vehicle specifications, by Team Moneyball.`
- Band note copy: `CO₂ bands are a CarVet display aid, not the NRCan CO₂ rating.`
- Work on branch `phase2-model-alignment` (create it from `main` before Task 1; the spec and this plan go in Task 1's commit).

## Review Focus

1. A preset edited and then edited back to its exact specs: `predict()` returns `source: 'preset'`, so the panel must say "Official NRCan rating". (Task 4, ResultsPanel `source: 'preset'` test.)
2. Empty state after a preset was shown: no stale "Official NRCan rating" label, mockup message shown. (Task 4, empty test.)
3. Pending state after a preset: heading follows the dimmed previous result. (Task 4, pending test.)
4. Counts drifting apart: raw minus duplicates equals the model set, train plus test equals it, and `stats.kpis.records` equals the raw total. (Task 1.)
5. Em-dashes creeping back into prose while placeholders stay allowed. (Task 5, guard test with its own positive and negative cases.)

---

### Task 1: Model facts module

**Files:**
- Create: `app/lib/model-facts.ts`
- Test: `app/lib/model-facts.test.ts`

**Interfaces:**
- Produces:
  - `MODEL_FACTS` (`as const`): `{ name: 'Random Forest', rawRecords: 29215, duplicatesRemoved: 3393, modelRecords: 25822, trainRecords: 20657, testRecords: 5165, cv: { folds: 5, mae: 0.459, rmse: 0.671, r2: 0.955 } }`
  - `NOTEBOOK_SOURCE = 'From the DATA440 notebook, not measured by this website.'`
  - `trainingSummary(): string`
  - `cvSummary(): string`
  - `modelSetSummary(): string`

- [ ] **Step 1: Create the branch and write the failing tests**

```bash
git switch -c phase2-model-alignment
```

```ts
import { describe, expect, it } from 'vitest'
import { stats } from './data'
import { MODEL_FACTS as F, cvSummary, modelSetSummary, trainingSummary } from './model-facts'

describe('model facts', () => {
  it('counts are consistent', () => {
    expect(F.rawRecords - F.duplicatesRemoved).toBe(F.modelRecords)
    expect(F.trainRecords + F.testRecords).toBe(F.modelRecords)
    expect(stats.kpis.records).toBe(F.rawRecords)
  })
  it('training summary', () => {
    expect(trainingSummary()).toBe(
      'The DATA440 model is trained on 20,657 of 25,822 unique NRCan records (3,393 duplicates removed from 29,215 raw); 5,165 held out for testing.',
    )
  })
  it('cv summary', () => {
    expect(cvSummary()).toBe('5-fold cross-validation on the training set: MAE 0.459 L/100 km, RMSE 0.671 L/100 km, R² 0.955.')
  })
  it('model set summary', () => {
    expect(modelSetSummary()).toBe('The model uses 25,822 of them after removing 3,393 duplicates.')
  })
})
```

- [ ] **Step 2: Run** `npx vitest run app/lib/model-facts.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement** `model-facts.ts`, building the strings with `fmt` (`fmt(x, 3)` for metrics).
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** spec, plan and module: `feat: add Phase 2 model facts module`.

---

### Task 2: Home page and site footer

**Files:**
- Modify: `app/routes/home.tsx`, `app/components/Co2BandChip.tsx`, `app/components/SiteFooter.tsx`
- Test: `app/routes/home.test.tsx`, `app/components/shell.test.tsx`

**Interfaces:**
- Consumes: `MODEL_FACTS`, `NOTEBOOK_SOURCE`, `trainingSummary()`, `cvSummary()` (Task 1).
- Produces: `export const CO2_BAND_NOTE = 'CO₂ bands are a CarVet display aid, not the NRCan CO₂ rating.'` in `Co2BandChip.tsx`.

- [ ] **Step 1: Update `home.test.tsx`**
  - Add to the "fills the dynamic slots" list: `'Target: combined fuel consumption (L/100 km). CO₂ (g/km) is calculated from it using a near-constant factor per fuel type.'`, `trainingSummary()`, `'Random Forest'`, `cvSummary()`, `NOTEBOOK_SOURCE`, `'Hold-out test results: pending'`, `CO2_BAND_NOTE`, `'The CarVet model will be connected in a later phase.'`, `'is designed to predict'`.
  - New test: output does not contain `'trained on 29,215'`, `'primary)'`, `'CarVet returns an estimate'`, `'Estimate a vehicle'`.
  - Meta test: the shared meta description.
- [ ] **Step 2: Update `shell.test.tsx`**: footer contains `'CarVet is a course mockup. Values shown are official NRCan ratings.'` and not `'Estimates are not official NRCan ratings.'`.
- [ ] **Step 3: Run** `npx vitest run app/routes/home.test.tsx app/components/shell.test.tsx`. Expected: FAIL on the new strings.
- [ ] **Step 4: Implement**
  - `Co2BandChip.tsx`: add the `CO2_BAND_NOTE` export.
  - `SiteFooter.tsx`: second line becomes `CarVet is a course mockup. Values shown are official NRCan ratings.`
  - `home.tsx`:
    - Meta: shared string.
    - Hero paragraph: `Official ratings only exist for vehicle configurations that have been tested and published. CarVet is designed to predict combined fuel consumption (L/100 km) for any configuration from seven specifications, and to calculate CO₂ (g/km) from it, helping sustainability teams, buyers and fleet managers compare options before purchase.`
    - Example card footnote: `Official NRCan rated values for a tested vehicle. The CarVet model will be connected in a later phase.` Add a second `<p>` with `CO2_BAND_NOTE`, same style.
    - "How it works" subtitle: `Supervised regression. ` followed by the Target sentence from Step 1.
    - `modelCards` Approach text: `` `${MODEL_FACTS.name} regression on seven vehicle specifications. ${trainingSummary()}` ``
    - New Performance card above the four model cards, full width (`md:col-span-2`), same `card` styles, icon `chart-column`: title `Performance`, a `text-tertiary` line `NOTEBOOK_SOURCE`, body `cvSummary()`, then `Hold-out test results: pending`.
    - Action banner: heading `Explore vehicle emissions`; text `Try the example vehicles on Predict, compare cars side by side, or explore the 29,215-record dataset.`
    - Goals list: unchanged (project aims).
- [ ] **Step 5: Run** the Step 3 command. Expected: PASS.
- [ ] **Step 6: Commit** `feat(home): Phase 2 target, counts, notebook performance and mockup wording`.

---

### Task 3: Explore page

**Files:**
- Modify: `app/routes/explore.tsx`, `app/components/explore/KpiCards.tsx`, `app/components/explore/DataDictionary.tsx`, `app/components/explore/explore-view.ts` (`deriveView` eyebrows ~L323/L329, `staticCards` ~L416/L422)
- Test: `app/routes/explore.test.tsx`, `app/components/explore/explore-view.test.ts`

**Interfaces:**
- Consumes: `modelSetSummary()` (Task 1).

- [ ] **Step 1: Update tests**
  - `explore-view.test.ts`: every `co2Hist` eyebrow expectation becomes `'Secondary output'`; every `fuelHist` eyebrow becomes `'Primary target'` (static and derived views).
  - `explore.test.tsx`: expect `'Mean combined fuel (L/100 km)'`, `'Combined fuel (L/100 km)'`, `'raw merged data'`, `modelSetSummary()`, `'City (L/100 km), Highway (L/100 km), Combined (mpg), CO₂ emissions (g/km) and CO₂ rating'`, `'Smog rating: not used in the main fuel model (69% missing, different pollutant). A separate smog rating model is planned.'`. Expect none of `'Mean CO₂ (L/100 km)'`, `'Secondary target'`, `'calculated from'`, `'near-constant'`. Meta: shared string.
- [ ] **Step 2: Run** `npx vitest run app/routes/explore.test.tsx app/components/explore/explore-view.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement**
  - `explore.tsx` hero paragraph: `` `29,215 vehicle configurations from NRCan (raw merged data). ${modelSetSummary()} Battery-electric and plug-in hybrid vehicles are published separately and excluded: they use different rating measures and have no tailpipe CO₂ value.` `` Target box value `Combined fuel (L/100 km)`. Meta: shared string.
  - `KpiCards.tsx`: label `Mean combined fuel (L/100 km)`; Records card gets `<p className={NOTE}>raw merged data</p>`.
  - `explore-view.ts`: eyebrows as in Step 1. Titles and chart data unchanged.
  - `DataDictionary.tsx`:
    - Used card: `Model year, make, vehicle class, engine size, cylinders, transmission, fuel type: all known before a vehicle is tested. Target: Combined (L/100 km).`
    - Dropped card heading stays `Model name`, body unchanged.
    - Leakage card heading `Other fuel and CO₂ columns`; body: `City (L/100 km), Highway (L/100 km), Combined (mpg), CO₂ emissions (g/km) and CO₂ rating are part of the target, the target in other units, or derived from it. They do not exist for untested vehicles.` No smog mention.
    - Below the grid, a `font-body-sm text-body-sm text-on-surface-variant` note with the smog sentence from Step 1.
- [ ] **Step 4: Run** the Step 2 command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(explore): Phase 2 target, raw-data label and data dictionary`.

---

### Task 4: Predict page

**Files:**
- Modify: `app/components/predict/ResultsPanel.tsx`, `app/routes/predict.tsx`, `app/components/predict/VehicleForm.tsx:158`
- Create test: `app/components/predict/ResultsPanel.test.tsx`
- Test: `app/routes/predict.test.tsx`

**Interfaces:**
- Consumes: `MODEL_FACTS`, `trainingSummary()` (Task 1); `CO2_BAND_NOTE` (Task 2).
- Produces: `EMPTY_MESSAGE = 'This mockup only includes the example vehicles. Pick one to see its official NRCan rating.'`; `export const MOCKUP_NOTE = 'Mockup: shows official NRCan ratings for the example vehicles only. The CarVet model will be connected in a later phase.'` in `predict.tsx`. `ResultsPanel` props unchanged.

- [ ] **Step 1: Write `ResultsPanel.test.tsx`** rendering `<ResultsPanel state previous />` with a fixture `Prediction` (`co2: 199, comb: 8.5, city: 9.9, hwy: 7.1, label: 'Test car'`):
  - `source: 'preset'` result: contains `'Official NRCan rating'` and `CO2_BAND_NOTE`; not `'Estimate'`, `'City'`, `'Highway'`, `'9.9'`, `'7.1'`.
  - `source: 'model'` result: contains `'Estimate, not an official NRCan rating.'`; not `'Official NRCan rating'`.
  - `{ kind: 'empty' }`, previous preset: contains `EMPTY_MESSAGE` and heading `'Result'`; not `'Official NRCan rating'`.
  - `{ kind: 'pending' }`, previous preset: contains `'Official NRCan rating'` and `'opacity-60'`.
- [ ] **Step 2: Update `predict.test.tsx`**: default preset expects `'Official NRCan rating'` instead of `'Estimate, not an official NRCan rating.'`; expects `MOCKUP_NOTE`, `trainingSummary()`, `'near-constant factor per fuel type'`, `'The model is not connected in this mockup.'`, `'Pick an example vehicle'`; not `'29,215 NRCan lab-tested'`, not `"Enter a vehicle's specs"`; meta is the shared string.
- [ ] **Step 3: Run** `npx vitest run app/components/predict app/routes/predict.test.tsx`. Expected: FAIL.
- [ ] **Step 4: Implement `ResultsPanel.tsx`**
  - `const official = shown?.source === 'preset' && state.kind !== 'empty' && state.kind !== 'error'`.
  - Heading: `official ? 'Official NRCan rating' : shown ? 'Estimate' : 'Result'`.
  - Remove the City/Highway grid. Fuel use eyebrow becomes `Combined fuel use`.
  - Under the Low/Severe labels: `<p className="font-label-sm text-label-sm text-tertiary">{CO2_BAND_NOTE}</p>`. Tooltip: `Bands: under 100 low · 100–165 moderate · 165–225 elevated · over 225 severe (g/km). A CarVet display aid, not the NRCan CO₂ rating.`
  - Footnote: official → `Official NRCan rating for this tested vehicle.`; non-official with a shown result → `Estimate, not an official NRCan rating.`; empty/error → none.
- [ ] **Step 5: Implement `predict.tsx`**
  - Meta: shared string.
  - Hero subtitle: `Pick an example vehicle to see its official NRCan rating, fuel use and running cost.`
  - Below the subtitle: `<p className="estimate-note"><Icon name="info" /> {MOCKUP_NOTE}</p>`.
  - "About these estimates" paragraph 1: `` `When connected, the ${MODEL_FACTS.name} model will predict combined fuel consumption (L/100 km) from seven specs, and CO₂ (g/km) will be calculated from it using a near-constant factor per fuel type. ${trainingSummary()}` ``
  - Paragraph 2: `The model is not connected in this mockup. Example vehicles show their official NRCan rating. CarVet uses public data and collects no personal information.`
- [ ] **Step 6: `VehicleForm.tsx:158`**: option label `` `${f.code}: ${f.label}` ``.
- [ ] **Step 7: Run** the Step 3 command. Expected: PASS.
- [ ] **Step 8: Commit** `feat(predict): official rating label, mockup note and message, drop city/highway`.

---

### Task 5: Compare, header, em-dash guard, AGENTS.md, full verification

**Files:**
- Modify: `app/routes/compare.tsx` (meta), `app/components/SiteHeader.tsx:77`, `app/components/compare/CarCards.tsx:21,46`, `app/components/compare/CompareResults.tsx:29,61,81`, `app/lib/compare-state.ts:14`, `AGENTS.md`
- Test: `app/routes/compare.test.tsx`, `app/lib/compare-state.test.ts`, `app/components/shell.test.tsx`; create `app/routes/no-em-dash.test.tsx`

**Interfaces:**
- Produces (test-local helper in `no-em-dash.test.tsx`): `proseEmDashes(html: string): string[]`. It splits on tags (`/<[^>]*>/`) for text nodes and adds the values of `title`, `aria-label`, `alt`, `placeholder` and `content` attributes. It returns each trimmed segment that contains `—` and is not exactly `—`.

- [ ] **Step 1: Write `no-em-dash.test.tsx`**
  - Helper self-tests: `proseEmDashes('<span>—</span>')` → `[]`; `proseEmDashes('<p>a — b</p>')` → `['a — b']`; `proseEmDashes('<span title="x — y">1</span>')` → `['x — y']`.
  - For Home (in `MemoryRouter`), Explore, Predict, Compare, SiteHeader and SiteFooter rendered with `renderToString` (copy each existing test's render setup): `expect(proseEmDashes(html)).toEqual([])`.
  - For each route's `meta()`: the description contains no `—`.
- [ ] **Step 2: Update existing tests** to the new copy in Step 4: `compare.test.tsx` (empty-cards message), `compare-state.test.ts` (already-added note), `shell.test.tsx` (`DATA` constant).
- [ ] **Step 3: Run** `npx vitest run app/routes app/lib/compare-state.test.ts app/components/shell.test.tsx`. Expected: FAIL on Compare/header strings and the guard.
- [ ] **Step 4: Replace copy**
  - SiteHeader: `Data source: Natural Resources Canada Fuel Consumption Ratings, Open Government Licence – Canada`
  - CarCards L21: `No cars yet. Use the selector above to add your first car.`; L46 unit `L/100 km`.
  - CompareResults L29: `` `🏆 ${gName}: greenest & cheapest to run` ``; L61: `Fuel combined (L/100 km)`; L81: `CO₂ emissions (lower is better)`.
  - compare-state: `This car is already added. Pick a different model or version.`
  - compare meta: shared string.
- [ ] **Step 5: AGENTS.md** under "Mockup parity", replace the "one intentional difference" bullet with two bullets. First: Predict's submit calls `predict()`, which only matches the example vehicles; there is no backend or real model in this build. Second: the Phase 2 text changes are intentional (Combined L/100 km target, deduplicated counts from `app/lib/model-facts.ts`, notebook performance card, Predict official-rating and mockup labels, no City/Highway, CO₂ band note, no em-dashes in prose); see `docs/superpowers/specs/2026-11-18-phase2-model-alignment-design.md`.
- [ ] **Step 6: Run** `grep -rn "—" app --include=*.tsx --include=*.ts | grep -v test`. Expected: only placeholder uses and code comments.
- [ ] **Step 7: Run** `npm run lint && npm run typecheck && npm test && npm run build && npm run check:build`. Expected: all pass.
- [ ] **Step 8: Visual check** with `npm run preview`. Check Home, Explore, Predict and Compare. On Predict, start from the default preset, then edit the engine size and submit: the mockup message should appear, with no stale official label.
- [ ] **Step 9: Commit** `chore: Compare and header wording, em-dash guard, document Phase 2 differences`.
