/**
 * scriptStyleAPI 테스트
 * extractScriptFromDocument, analyzeScriptStyle, generateScriptInStyle 호출 검증
 */

import { File as NodeBufferFile } from 'buffer';
import {
  extractScriptFromDocument,
  analyzeScriptStyle,
  generateScriptInStyle,
} from '../scriptStyleAPI';
import {
  API_BASE_URL,
  API_JSON_FIELD_DOCUMENT_HINT,
  API_JSON_FIELD_SAMPLE_SCRIPT,
  API_JSON_FIELD_SOURCE_FILENAME,
  API_JSON_FIELD_TOPIC_OR_OUTLINE,
  API_TTS_SCRIPT_STYLE_ANALYZE_PATH,
  API_TTS_SCRIPT_STYLE_EXTRACT_DOCUMENT_PATH,
  API_TTS_SCRIPT_STYLE_GENERATE_PATH,
  joinApiHealthCheckUrl,
} from '../../config/api';
import { restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

/** `scriptStyleAPI.ts`의 `BASE`와 동일 */
const scriptStyleBase = () => API_BASE_URL.replace(/\/$/, '');

const mockFetch = jest.fn();
const originalFetch = globalThis.fetch;

beforeAll(() => {
  if (typeof globalThis.File === 'undefined') {
    (globalThis as unknown as { File: typeof NodeBufferFile }).File = NodeBufferFile;
  }
  class ScriptStyleTestFormData {
    append(_name: string, _value: unknown): void {
      /* extractScriptFromDocument는 fetch 모킹만 검증 */
    }
  }
  const FD = ScriptStyleTestFormData as unknown as typeof FormData;
  (globalThis as unknown as { FormData: typeof FormData }).FormData = FD;
  if (typeof window !== 'undefined') {
    (window as unknown as { FormData: typeof FormData }).FormData = FD;
  }
});

beforeEach(() => {
  mockFetch.mockClear();
  mockFetch.mockReset();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  if (typeof window !== 'undefined') {
    window.fetch = globalThis.fetch;
  }
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
});

describe('scriptStyleAPI', () => {
  describe('extractScriptFromDocument', () => {
    it('POST /api/tts/script-style/extract-document 호출 후 text 반환', async () => {
      const result = { success: true, text: '추출된 대본 텍스트' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(result),
      });

      const file = new File(['content'], 'sample.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const out = await extractScriptFromDocument(file);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(scriptStyleBase(), API_TTS_SCRIPT_STYLE_EXTRACT_DOCUMENT_PATH),
        expect.objectContaining({ method: 'POST' })
      );
      expect(out.success).toBe(true);
      expect(out.text).toBe('추출된 대본 텍스트');
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: '빈 파일입니다.' }),
      });

      const file = new File([], 'empty.txt', { type: 'text/plain' });
      await expect(extractScriptFromDocument(file)).rejects.toThrow('빈 파일입니다.');
    });

    it('res.ok false이고 json() 실패 시 status 기반 fallback 메시지 throw', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const file = new File(['x'], 'a.txt', { type: 'text/plain' });
      await expect(extractScriptFromDocument(file)).rejects.toThrow('문서 추출 실패: 503');
    });

    it('suggested_document_hint(tone_down) 포함 시 반환', async () => {
      const result = {
        success: true,
        text: '보도자료 본문',
        suggested_document_hint: 'tone_down',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(result),
      });

      const file = new File(['보도자료 본문'], '톤다운안_수정본.txt', { type: 'text/plain' });
      const out = await extractScriptFromDocument(file);

      expect(out.success).toBe(true);
      expect(out.text).toBe('보도자료 본문');
      expect(out.suggested_document_hint).toBe('tone_down');
    });
  });

  describe('analyzeScriptStyle', () => {
    it('POST /api/tts/script-style/analyze 호출 후 style_summary 반환', async () => {
      const result = {
        success: true,
        style_summary: '차분한 나레이션 톤, 격식체',
        key_traits: ['톤: 차분', '어투: 격식'],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(result),
      });

      const out = await analyzeScriptStyle('샘플 대본 텍스트');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(scriptStyleBase(), API_TTS_SCRIPT_STYLE_ANALYZE_PATH),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [API_JSON_FIELD_SAMPLE_SCRIPT]: '샘플 대본 텍스트' }),
        })
      );
      expect(out.success).toBe(true);
      expect(out.style_summary).toBe('차분한 나레이션 톤, 격식체');
      expect(out.key_traits).toHaveLength(2);
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: '스타일 분석 실패' }),
      });

      await expect(analyzeScriptStyle('샘플')).rejects.toThrow('스타일 분석 실패');
    });

    it('res.ok false이고 json() 실패 시 status 기반 fallback 메시지 throw', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Parse error')),
      });

      await expect(analyzeScriptStyle('샘플')).rejects.toThrow('스타일 분석 실패: 500');
    });

    it('documentHint·sourceFilename 전달 시 요청 body에 포함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, style_summary: '', key_traits: [] }),
      });

      await analyzeScriptStyle('샘플', {
        documentHint: 'tone_down',
        sourceFilename: '톤다운안_수정본.txt',
      });

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
      expect(callBody[API_JSON_FIELD_SAMPLE_SCRIPT]).toBe('샘플');
      expect(callBody[API_JSON_FIELD_DOCUMENT_HINT]).toBe('tone_down');
      expect(callBody[API_JSON_FIELD_SOURCE_FILENAME]).toBe('톤다운안_수정본.txt');
    });
  });

  describe('generateScriptInStyle', () => {
    it('POST /api/tts/script-style/generate 호출 후 generated_script 반환', async () => {
      const result = {
        success: true,
        generated_script: '생성된 대본 내용입니다.',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(result),
      });

      const out = await generateScriptInStyle('참조 대본', '발표 오프닝');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(scriptStyleBase(), API_TTS_SCRIPT_STYLE_GENERATE_PATH),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [API_JSON_FIELD_SAMPLE_SCRIPT]: '참조 대본',
            [API_JSON_FIELD_TOPIC_OR_OUTLINE]: '발표 오프닝',
          }),
        })
      );
      expect(out.success).toBe(true);
      expect(out.generated_script).toBe('생성된 대본 내용입니다.');
    });

    it('baseUrl 옵션 적용 시 해당 URL로 요청', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, generated_script: '' }),
      });

      await generateScriptInStyle('a', 'b', { baseUrl: 'https://custom.api' });

      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl('https://custom.api', API_TTS_SCRIPT_STYLE_GENERATE_PATH),
        expect.any(Object)
      );
    });

    it('documentHint·sourceFilename 전달 시 요청 body에 포함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, generated_script: '' }),
      });

      await generateScriptInStyle('참조', '주제', {
        documentHint: 'corporate',
        sourceFilename: '기업_보도자료.docx',
      });

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
      expect(callBody[API_JSON_FIELD_SAMPLE_SCRIPT]).toBe('참조');
      expect(callBody[API_JSON_FIELD_TOPIC_OR_OUTLINE]).toBe('주제');
      expect(callBody[API_JSON_FIELD_DOCUMENT_HINT]).toBe('corporate');
      expect(callBody[API_JSON_FIELD_SOURCE_FILENAME]).toBe('기업_보도자료.docx');
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'topic_or_outline가 비어 있습니다.' }),
      });

      await expect(
        generateScriptInStyle('참조', '')
      ).rejects.toThrow('topic_or_outline가 비어 있습니다.');
    });

    it('res.ok false이고 json() 실패 시 status 기반 fallback 메시지 throw', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: () => Promise.reject(new Error('Network')),
      });

      await expect(generateScriptInStyle('참조', '주제')).rejects.toThrow('대본 생성 실패: 502');
    });
  });
});
