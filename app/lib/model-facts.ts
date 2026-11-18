import { fmt } from './carvet'

export const MODEL_FACTS = {
  name: 'Random Forest',
  rawRecords: 29215,
  duplicatesRemoved: 3393,
  modelRecords: 25822,
  trainRecords: 20657,
  testRecords: 5165,
  cv: { folds: 5, mae: 0.459, rmse: 0.671, r2: 0.955 },
} as const

export const NOTEBOOK_SOURCE = 'From the DATA440 notebook, not measured by this website.'

export function trainingSummary(): string {
  const f = MODEL_FACTS
  return `The DATA440 model is trained on ${fmt(f.trainRecords)} of ${fmt(f.modelRecords)} unique NRCan records (${fmt(f.duplicatesRemoved)} duplicates removed from ${fmt(f.rawRecords)} raw); ${fmt(f.testRecords)} held out for testing.`
}

export function cvSummary(): string {
  const { cv } = MODEL_FACTS
  return `${cv.folds}-fold cross-validation on the training set: MAE ${fmt(cv.mae, 3)} L/100 km, RMSE ${fmt(cv.rmse, 3)} L/100 km, R² ${fmt(cv.r2, 3)}.`
}

export function modelSetSummary(): string {
  const f = MODEL_FACTS
  return `The model uses ${fmt(f.modelRecords)} of them after removing ${fmt(f.duplicatesRemoved)} duplicates.`
}
