/**
 * 파이프라인 튜닝·내부 보안 상태 조회 (관리자 도구)
 */
import {
  API_BASE_URL,
  API_LLM_INTERNAL_SECURITY_PATH,
  API_PIPELINE_TUNING_PATH,
  FALLBACK_API_ORIGIN,
  joinApiHealthCheckUrl,
} from '../config/api';

export interface PipelineTuningResponse {
  success: boolean;
  config?: Record<string, unknown>;
  writable?: boolean;
}

export interface LlmInternalSecurityResponse {
  success: boolean;
  airgap?: boolean;
  deepseek_cloud_blocked?: boolean;
  outbound_collection_blocked?: boolean;
}

const pipelineApiOrigin = () => (API_BASE_URL || FALLBACK_API_ORIGIN).replace(/\/$/, '');

/** GET /api/pipeline-tuning */
export async function fetchPipelineTuning(): Promise<PipelineTuningResponse | null> {
  try {
    const res = await fetch(joinApiHealthCheckUrl(pipelineApiOrigin(), API_PIPELINE_TUNING_PATH), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as PipelineTuningResponse;
  } catch {
    return null;
  }
}

/** GET /api/llm-internal-security */
export async function fetchLlmInternalSecurity(): Promise<LlmInternalSecurityResponse | null> {
  try {
    const res = await fetch(joinApiHealthCheckUrl(pipelineApiOrigin(), API_LLM_INTERNAL_SECURITY_PATH), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as LlmInternalSecurityResponse;
  } catch {
    return null;
  }
}
