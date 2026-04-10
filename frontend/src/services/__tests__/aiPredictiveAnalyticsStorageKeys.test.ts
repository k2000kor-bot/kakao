/**
 * @jest-environment jsdom
 */
import {
  AI_PREDICTIVE_ANOMALIES_STORAGE_KEY,
  AI_PREDICTIVE_DECISIONS_STORAGE_KEY,
  AI_PREDICTIVE_INSIGHTS_STORAGE_KEY,
  AI_PREDICTIVE_PREDICTIONS_STORAGE_KEY,
  AI_PREDICTIVE_TRENDS_STORAGE_KEY,
} from '../aiPredictiveAnalyticsStorageKeys';
import aiPredictiveAnalyticsService, {
  AI_PREDICTIVE_ANOMALIES_STORAGE_KEY as K_ANOM,
  AI_PREDICTIVE_DECISIONS_STORAGE_KEY as K_DEC,
  AI_PREDICTIVE_INSIGHTS_STORAGE_KEY as K_INS,
  AI_PREDICTIVE_PREDICTIONS_STORAGE_KEY as K_PRED,
  AI_PREDICTIVE_TRENDS_STORAGE_KEY as K_TREND,
} from '../aiPredictiveAnalyticsService';

describe('aiPredictiveAnalyticsStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(AI_PREDICTIVE_PREDICTIONS_STORAGE_KEY).toBe('ai_predictive_predictions');
    expect(AI_PREDICTIVE_ANOMALIES_STORAGE_KEY).toBe('ai_predictive_anomalies');
    expect(AI_PREDICTIVE_TRENDS_STORAGE_KEY).toBe('ai_predictive_trends');
    expect(AI_PREDICTIVE_DECISIONS_STORAGE_KEY).toBe('ai_predictive_decisions');
    expect(AI_PREDICTIVE_INSIGHTS_STORAGE_KEY).toBe('ai_predictive_insights');
  });

  it('aiPredictiveAnalyticsService 재보내기와 동일', () => {
    expect(K_PRED).toBe(AI_PREDICTIVE_PREDICTIONS_STORAGE_KEY);
    expect(K_ANOM).toBe(AI_PREDICTIVE_ANOMALIES_STORAGE_KEY);
    expect(K_TREND).toBe(AI_PREDICTIVE_TRENDS_STORAGE_KEY);
    expect(K_DEC).toBe(AI_PREDICTIVE_DECISIONS_STORAGE_KEY);
    expect(K_INS).toBe(AI_PREDICTIVE_INSIGHTS_STORAGE_KEY);
    expect(aiPredictiveAnalyticsService).toBeDefined();
  });
});
