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
