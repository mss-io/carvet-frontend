# Phase 2 model alignment (text and data fixes)

Date: 2026-11-18
Status: approved 2026-11-18 (revised: mockup honesty, Compare scope)

## Intent

Bring the CarVet frontend in line with the DATA440 Phase 2 modelling decisions recorded in `CarVet.ipynb`: Combined (L/100 km) is now the target, CO2 is derived from it, record counts reflect deduplication, and the notebook's model metrics are published. Text and data fixes only.

CarVet is a course mockup, not a full working website: Predict shows official NRCan ratings for the example (preset) vehicles in `stats.json` only, and the real model will be connected in a later phase. There is no backend, no prediction API and no real model in this build, and all UI text must be honest about that.

## Goals

1. Combined (L/100 km) is the primary target wherever the model is described; CO2 (g/km) is described as calculated from it with a near-constant factor per fuel type.
2. Data dictionary matches the notebook's column decisions.
3. Record counts distinguish raw (29,215), duplicates removed (3,393), model set (25,822), train (20,657), test (5,165).
4. Predict shows only what the model will predict, labels presets as official NRCan ratings, says clearly that this mockup only covers the example vehicles, and carries a visible "Mockup" note.
5. Explore KPI label fixed.
6. "About the model" names the model and its CV results, labelled as DATA440 notebook results; hold-out test results pending.
7. CO2 bands are labelled as a CarVet display aid.
8. Compare page gets the same wording and em-dash fixes.

## Non-goals

- Building or connecting the prediction API.
- Any backend, API or real model inference (this build is a mockup).
- Smog rating prediction UI (waits for the separate smog notebook and its exported model).
- Changing `predict()`'s signature in `app/lib/data.ts` or the `Prediction` type.
- Deduplicating data in Explore or regenerating `app/data/stats.json`.
- Reordering Explore cards or layout.

## Anti-goals

- Explore figures that no longer match the CSV they are computed from.
- The same figure (counts, metrics) written differently on different pages.
- Any UI text claiming the model predicts City/Highway or CO2 directly.
- UI text implying the mockup runs a real model or can predict any vehicle configuration.

## Constraints

- Canadian spelling, metric units, no em-dashes in UI prose.
- AGENTS.md rules: theme tokens, `en-CA` number formatting, no hand edits to generated files, React Compiler (no manual memo), tests via `renderToString`.
- Verification: `npm run lint && npm run typecheck && npm test && npm run build && npm run check:build`.

## Approaches

- **Chosen: edit text and markup in place**, with a small constants module for model facts. Cheapest, keeps mockup layout, one source for numbers.
- Reorder Explore so fuel leads: rejected, breaks mockup parity for little gain.
- Route figures through `stats.json`: rejected, it is generated from the mockup and must not be hand-edited.

Explore handling of 29,215 vs 25,822 (decided by the user, option A): label Explore as raw merged data and add one line about the deduplicated model set. `stats.json` stays as is; `quality.duplicates: 0` is correct for raw data (the notebook finds 0 duplicates before dropping columns, 3,393 after).

## Design

- **Model facts module:** `app/lib/model-facts.ts` holds the counts (29,215 raw, 3,393 duplicates, 25,822 model set, 20,657 train, 5,165 test) and the CV metrics (MAE 0.459 L/100 km, RMSE 0.671, R² 0.955, model name Random Forest, test results pending). Home, Predict and Explore all read counts from it; no page hard-codes 25,822 or 3,393. The CV metrics are labelled as results from the DATA440 notebook, not measured by this website.
- **Target wording (model descriptions only: Home, Predict, About the model):**
  - Home "How it works": "Target: combined fuel consumption (L/100 km). CO₂ (g/km) is calculated from it using a near-constant factor per fuel type."
  - Home hero paragraph reworded to match (no em-dash), describing what the CarVet model is designed to do, not what this build does.
  - Predict "About these estimates" says the same, and that the model is not connected in this mockup.
  - Meta descriptions reworded without em-dashes.
- **Explore wording (describes official NRCan data, not model output):**
  - Hero box: "Primary target" / "Combined fuel (L/100 km)".
  - Chart eyebrows (both `staticCards` and `deriveView` in `explore-view.ts`): fuel histogram "Primary target", CO2 histogram "Secondary output". No "calculated from fuel use" wording on Explore. Card order unchanged.
- **Data dictionary (`DataDictionary.tsx`):**
  - Leakage card lists exactly: City (L/100 km), Highway (L/100 km), Combined (mpg), CO2 emissions (g/km), CO2 rating. Combined (L/100 km) noted as the target. No smog mention.
  - Dropped card stays "Model name" (4,504 distinct values).
  - Smog rating gets its own note: "Smog rating: not used in the main fuel model (69% missing, different pollutant). A separate smog rating model is planned."
- **Record counts:**
  - Home Approach card and Predict "About these estimates": the DATA440 model is trained on 20,657 of 25,822 unique records (3,393 duplicates removed from 29,215 raw), 5,165 held out for testing.
  - Explore hero: figures labelled as raw merged data, plus a line that the model uses 25,822 records after removing 3,393 duplicates (both from `model-facts.ts`).
  - Home "Built on 29,215 NRCan records" chip and the banner's dataset mention stay (raw total is accurate there).
- **Predict (`ResultsPanel.tsx`, `predict.tsx`):**
  - City and Highway boxes removed; Fuel use shows combined only.
  - Preset result (`source: 'preset'`): heading and footnote say "Official NRCan rating", not an estimate.
  - Empty state (non-preset input, `predict()` returns null): "This mockup only includes the example vehicles. Pick one to see its official NRCan rating." Running cost shows the missing-value placeholder.
  - A small, visible "Mockup" note near the Predict hero: "Mockup: shows official NRCan ratings for the example vehicles only. The CarVet model will be connected in a later phase."
  - Hero subtitle reworded so it does not promise results for any vehicle's specs.
- **Compare (`compare.tsx`, `CarCards.tsx`, `CompareResults.tsx`, `compare-state.ts`):**
  - Checked: no CO2-as-primary-target wording and no City/Highway values; it already shows official NRCan data ("Based on official NRCan data"). No model wording added.
  - Em-dashes removed from prose: meta description, empty-cards message, "already added" note, winner headline, "CO₂ emissions — lower is better" eyebrow.
  - Unit label "L/100km" written as "L/100 km" in the specs table and car cards, for consistency with the rest of the site.
- **Explore KPI:** "Mean combined fuel (L/100 km)".
- **About the model (Home):** Approach card names Random Forest; new full-width Performance card with the three 5-fold CV metrics on the training set, labelled "From the DATA440 notebook", and "Hold-out test results: pending".
- **CO2 band note:** visible line "CO₂ bands are a CarVet display aid, not the NRCan CO₂ rating." under the band bar on Predict and on Home's example card; the band tooltip text updated to match.
- **Other honesty fixes (from the mockup rule):**
  - Home example card footnote: drop "For untested configurations, CarVet returns an estimate"; say the real model will be connected in a later phase.
  - Site footer "Estimates are not official NRCan ratings." reworded so it does not imply this build produces estimates (e.g. "CarVet is a course mockup. Values shown are official NRCan ratings.").
  - Home "What CarVet helps you do" goals and the action banner stay as project aims, but must not claim the current build predicts any configuration.
- **Em-dashes:** removed from all UI prose on every page, including the header data-source strip. The "—" missing-value placeholder stays.
- **AGENTS.md:** Mockup parity section lists these Phase 2 text changes as intentional differences.
- **Tests:** update affected assertions in `home.test.tsx`, `predict.test.tsx`, `explore.test.tsx`, `explore-view.test.ts`, `compare.test.tsx`, `compare-state.test.ts`; add tests for the preset and empty Predict labels, the Mockup note, the model-facts module (counts add up, raw total equals `stats.kpis.records`), and a guard against em-dashes in prerendered pages (the guard allows a standalone "—" missing-value placeholder and fails only on em-dashes inside prose).

## Follow-up fixes (2026-11-18)

- **Home "Licence & privacy":** "NRCan data under Open Government Licence – Canada. Public, non-personal data. When the API is connected, inputs will be validated and rate-limited."
- **Home "Maintenance":** "Vehicle technology shifted 1995–2026 (concept drift). Planned: retrain each year when NRCan publishes a new model year, with coverage of the shift to hybrids and EVs."
- **Explore KPI row:**
  - Mean combined fuel shows the same value as the fuel histogram (12.04: 2 decimals, en-CA), via one shared formatter (`fmtMeanFuel` in `explore-view.ts`) used by both, before and after the CSV loads.
  - Model years shows "1995–2026" with sub-label "32 years" (both derived from the data).
- **Predict:** heading "Predict fuel use and CO₂."; the details section is titled "About the model". The meta title ("CarVet · Predict") and description already lead with fuel use, so they are unchanged.

## Left to the builder

- Exact markup and spacing of the Performance card, Mockup note, smog note and band notes, using existing card styles and theme tokens.
- Exact wording of small labels not quoted above, within the constraints and anti-goals.
