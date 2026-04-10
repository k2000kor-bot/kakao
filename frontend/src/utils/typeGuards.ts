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
export function isMessage(obj: unknown): obj is Message {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Message).id === 'number' &&
    ((obj as Message).sender === 'user' || (obj as Message).sender === 'ai') &&
    typeof (obj as Message).text === 'string' &&
    typeof (obj as Message).timestamp === 'string' &&
    ((obj as Message).analysis === null || isAnalysisData((obj as Message).analysis))
  );
}

/**
 * AnalysisData 타입 가드
 */
export function isAnalysisData(obj: unknown): obj is AnalysisData {
  const o = obj as AnalysisData;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof o?.emotion_analysis === 'object' &&
    typeof o?.intent_analysis === 'object' &&
    typeof o?.success === 'boolean'
  );
}

/**
 * ChatAPIResponse 타입 가드
 */
export function isChatAPIResponse(obj: unknown): obj is ChatAPIResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ChatAPIResponse).success === 'boolean'
  );
}

/**
 * 배열이 Message 배열인지 확인
 */
export function isMessageArray(arr: unknown): arr is Message[] {
  return Array.isArray(arr) && arr.every(isMessage);
}

