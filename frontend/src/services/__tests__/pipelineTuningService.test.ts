/**
 * pipelineTuningService — GET /api/pipeline-tuning, /api/llm-internal-security
 */
import {
  API_LLM_INTERNAL_SECURITY_PATH,
  API_PIPELINE_TUNING_PATH,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
} from '../../config/api';
import { fetchPipelineTuning, fetchLlmInternalSecurity } from '../pipelineTuningService';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const tuningFetchUrl = () => joinApiHealthCheckUrl(resolveApiBaseUrl(), API_PIPELINE_TUNING_PATH);
const securityFetchUrl = () => joinApiHealthCheckUrl(resolveApiBaseUrl(), API_LLM_INTERNAL_SECURITY_PATH);

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('pipelineTuningService', () => {
  describe('fetchPipelineTuning', () => {
    it('성공 시 JSON을 PipelineTuningResponse로 반환', async () => {
      const body = { success: true, config: { quality_presets: {} }, writable: false };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(body),
      });

      const result = await fetchPipelineTuning();

      expect(result).toEqual(body);
      expect(global.fetch).toHaveBeenCalledWith(
        tuningFetchUrl(),
        expect.objectContaining({
          headers: { Accept: 'application/json' },
        })
      );
    });

    it('HTTP 비정상(ok false)이면 null', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      });

      expect(await fetchPipelineTuning()).toBeNull();
    });

    it('네트워크 오류 시 null', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('fail'));

      expect(await fetchPipelineTuning()).toBeNull();
    });
  });

  describe('fetchLlmInternalSecurity', () => {
    it('성공 시 JSON을 LlmInternalSecurityResponse로 반환', async () => {
      const body = {
        success: true,
        airgap: true,
        deepseek_cloud_blocked: true,
        outbound_collection_blocked: true,
      };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(body),
      });

      const result = await fetchLlmInternalSecurity();

      expect(result).toEqual(body);
      expect(global.fetch).toHaveBeenCalledWith(
        securityFetchUrl(),
        expect.objectContaining({
          headers: { Accept: 'application/json' },
        })
      );
    });

    it('HTTP 비정상이면 null', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      expect(await fetchLlmInternalSecurity()).toBeNull();
    });

    it('예외 시 null', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('network'));

      expect(await fetchLlmInternalSecurity()).toBeNull();
    });
  });
});
