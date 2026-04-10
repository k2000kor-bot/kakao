/**
 * 의도·키워드 분석 API (POST /api/intent/analyze)
 * FastAPI main_server 또는 Flask main.py 동일 응답 형식
 */

import { API_BASE_URL, API_JSON_FIELD_MESSAGE, INTENT_ANALYZE_PATH, joinApiHealthCheckUrl } from '../config/api';
import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface IntentResult {
  intent: { type: string; confidence: number };
  keywords: string[];
}

export interface IntentAnalyzeResponse {
  success: boolean;
  data?: IntentResult;
  error?: string;
}

/**
 * 메시지의 의도·키워드만 분석 (대화 응답 생성 없음)
 */
export async function analyzeIntent(message: string): Promise<IntentResult> {
  const trimmed = coerceTrimmedString(message || '', '');
  if (!trimmed) {
    throw new Error('메시지가 비어있습니다.');
  }
  const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, INTENT_ANALYZE_PATH), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [API_JSON_FIELD_MESSAGE]: trimmed }),
  });
  const data: IntentAnalyzeResponse = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `의도 분석 실패: ${res.status}`);
  }
  if (!data.success || !data.data) {
    throw new Error(data.error || '의도 분석 결과 없음');
  }
  return data.data;
}
