/**
 * 샘플 대본 스타일 API
 * 워드/텍스트 문서에서 대본 추출, 톤·스타일·어투·말투 분석, 동일 스타일 대본 생성
 */

import {
  API_BASE_URL,
  API_FORM_FIELD_FILE,
  API_JSON_FIELD_DOCUMENT_HINT,
  API_JSON_FIELD_SAMPLE_SCRIPT,
  API_JSON_FIELD_SOURCE_FILENAME,
  API_JSON_FIELD_TOPIC_OR_OUTLINE,
  API_TTS_SCRIPT_STYLE_ANALYZE_PATH,
  API_TTS_SCRIPT_STYLE_EXTRACT_DOCUMENT_PATH,
  API_TTS_SCRIPT_STYLE_GENERATE_PATH,
  joinApiHealthCheckUrl,
} from '../config/api';

const BASE = API_BASE_URL.replace(/\/$/, '');

export interface ScriptStyleAnalyzeResult {
  success: boolean;
  style_summary: string;
  key_traits: string[];
}

export interface ScriptStyleGenerateResult {
  success: boolean;
  generated_script: string;
}

export interface ExtractDocumentResult {
  success: boolean;
  text: string;
  /** 대화(대사)만 추출한 텍스트. 목소리 생성용 대본에 사용 (지문/연출 제거, '이름: 대사' → 대사만) */
  dialogue_only?: string | null;
  /** 파일명 기반 추천: tone_down(톤다운·보도), corporate(기업·PR) */
  suggested_document_hint?: string | null;
}

/** 문서 유형 힌트 (톤다운안·기업보도 등) */
export type DocumentHint = 'tone_down' | 'corporate' | 'general' | '';

/**
 * 워드(docx) 또는 텍스트 파일에서 대본 텍스트 추출
 */
export async function extractScriptFromDocument(
  file: File,
  baseUrl?: string
): Promise<ExtractDocumentResult> {
  const base = (baseUrl ?? BASE).replace(/\/$/, '');
  const form = new FormData();
  form.append(API_FORM_FIELD_FILE, file);
  const res = await fetch(joinApiHealthCheckUrl(base, API_TTS_SCRIPT_STYLE_EXTRACT_DOCUMENT_PATH), {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string; error?: string };
    const msg = err.detail ?? err.error ?? `문서 추출 실패: ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<ExtractDocumentResult>;
}

/**
 * 샘플 대본의 톤·스타일·어투·말투 분석
 * documentHint: tone_down(톤다운·보도), corporate(기업·PR) 시 분석/생성 시 해당 톤 강조
 */
export async function analyzeScriptStyle(
  sampleScript: string,
  options?: { baseUrl?: string; documentHint?: DocumentHint; sourceFilename?: string }
): Promise<ScriptStyleAnalyzeResult> {
  const base = (options?.baseUrl ?? BASE).replace(/\/$/, '');
  const body: Record<string, string> = { [API_JSON_FIELD_SAMPLE_SCRIPT]: sampleScript };
  if (options?.documentHint) body[API_JSON_FIELD_DOCUMENT_HINT] = options.documentHint;
  if (options?.sourceFilename) body[API_JSON_FIELD_SOURCE_FILENAME] = options.sourceFilename;
  const res = await fetch(joinApiHealthCheckUrl(base, API_TTS_SCRIPT_STYLE_ANALYZE_PATH), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string; error?: string };
    const msg = err.detail ?? err.error ?? `스타일 분석 실패: ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<ScriptStyleAnalyzeResult>;
}

/**
 * 샘플 대본 스타일을 유지한 채 주제/개요에 맞는 새 대본 생성
 * documentHint: tone_down(톤다운·보도), corporate(기업·PR) 시 중립·격식 유지
 */
export async function generateScriptInStyle(
  sampleScript: string,
  topicOrOutline: string,
  options?: { baseUrl?: string; documentHint?: DocumentHint; sourceFilename?: string }
): Promise<ScriptStyleGenerateResult> {
  const base = (options?.baseUrl ?? BASE).replace(/\/$/, '');
  const body: Record<string, string> = {
    [API_JSON_FIELD_SAMPLE_SCRIPT]: sampleScript,
    [API_JSON_FIELD_TOPIC_OR_OUTLINE]: topicOrOutline,
  };
  if (options?.documentHint) body[API_JSON_FIELD_DOCUMENT_HINT] = options.documentHint;
  if (options?.sourceFilename) body[API_JSON_FIELD_SOURCE_FILENAME] = options.sourceFilename;
  const res = await fetch(joinApiHealthCheckUrl(base, API_TTS_SCRIPT_STYLE_GENERATE_PATH), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string; error?: string };
    const msg = err.detail ?? err.error ?? `대본 생성 실패: ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<ScriptStyleGenerateResult>;
}
