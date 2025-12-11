/**
 * 타입 가드 유틸리티
 * 런타임 타입 검증을 위한 함수들
 * 
 * Task-F1: 코드 품질 개선 - 타입 안정성
 */

import type { Message, AnalysisData, ChatAPIResponse } from '../types';

/**
 * Message 타입 가드
 */
export function isMessage(obj: any): obj is Message {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    (obj.sender === 'user' || obj.sender === 'ai') &&
    typeof obj.text === 'string' &&
    typeof obj.timestamp === 'string' &&
    (obj.analysis === null || isAnalysisData(obj.analysis))
  );
}

/**
 * AnalysisData 타입 가드
 */
export function isAnalysisData(obj: any): obj is AnalysisData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.emotion_analysis === 'object' &&
    typeof obj.intent_analysis === 'object' &&
    typeof obj.success === 'boolean'
  );
}

/**
 * ChatAPIResponse 타입 가드
 */
export function isChatAPIResponse(obj: any): obj is ChatAPIResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.success === 'boolean'
  );
}

/**
 * 배열이 Message 배열인지 확인
 */
export function isMessageArray(arr: any): arr is Message[] {
  return Array.isArray(arr) && arr.every(isMessage);
}

