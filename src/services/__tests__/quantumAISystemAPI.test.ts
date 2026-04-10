/**
 * QuantumAISystemAPI 테스트
 */
import * as quantumModule from '../quantumAISystemAPI';
import {
  QuantumAISystemAPI,
  quantumAISystemAPI,
  type QuantumMessageRequest,
  type QuantumAnalysisRequest,
  type QuantumPredictionRequest
} from '../quantumAISystemAPI';
import {
  API_SMOKE_TEST_PATH,
  API_STATUS_PATH,
  GENERATE_QUANTUM_MESSAGE_PATH,
  QUANTUM_ANALYSIS_PATH,
  QUANTUM_PREDICTION_PATH,
} from '../../config/api';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

const pathSuffixRegex = (path: string) =>
  new RegExp(`${path.replace(/\//g, '\\/')}$`);

describe('quantumAISystemAPI 모듈 export', () => {
  it('default export는 QuantumAISystemAPI 클래스', () => {
    expect(quantumModule.default).toBe(QuantumAISystemAPI);
  });

  it('quantumAISystemAPI 편의 객체가 export됨', () => {
    expect(quantumModule.quantumAISystemAPI).toBeDefined();
    expect(typeof quantumModule.quantumAISystemAPI.generateQuantum).toBe('function');
    expect(typeof quantumModule.quantumAISystemAPI.checkStatus).toBe('function');
  });
});

describe('QuantumAISystemAPI', () => {
  beforeEach(() => {
    installJestFetchMock();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    restoreGlobalFetch(originalFetch);
    jest.restoreAllMocks();
  });

  describe('getStatus', () => {
    it('서버 상태 확인 성공', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      });

      const result = await QuantumAISystemAPI.getStatus();

      expect(result).toEqual({ status: 'healthy' });
    });

    it('getStatus는 /api/status 엔드포인트로 fetch 호출', async () => {
      const mockFetch = jest.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      });

      await QuantumAISystemAPI.getStatus();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toMatch(pathSuffixRegex(API_STATUS_PATH));
      expect(mockFetch.mock.calls[0][1].headers).toMatchObject({ 'Content-Type': 'application/json' });
    });

    it('서버 응답 실패 시 에러 throw', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(QuantumAISystemAPI.getStatus()).rejects.toThrow();
    });

    it('응답 ok이어도 json() 실패 시 에러 전파', async () => {
      const parseError = new SyntaxError('Unexpected token');
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(parseError),
      });

      await expect(QuantumAISystemAPI.getStatus()).rejects.toThrow(parseError);
    });

    it('fetch 자체 실패 시 에러 전파', async () => {
      const networkError = new Error('Network request failed');
      jest.mocked(global.fetch).mockRejectedValueOnce(networkError);

      await expect(QuantumAISystemAPI.getStatus()).rejects.toThrow('Network request failed');
    });
  });

  describe('generateQuantumMessage', () => {
    it('양자 메시지 생성 성공', async () => {
      const mockMessage = {
        id: 'msg-1',
        original_message: 'hello',
        quantum_message: 'quantum hello',
        analytics: {},
        timestamp: new Date().toISOString()
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: mockMessage })
      });

      const request: QuantumMessageRequest = {
        original_message: 'hello',
        user_id: 'user-1'
      };

      const result = await QuantumAISystemAPI.generateQuantumMessage(request);

      expect(result.success).toBe(true);
      expect(result.message).toEqual(mockMessage);
    });

    it('generateQuantumMessage는 POST /api/generate-quantum-message로 요청 body 전송', async () => {
      const mockFetch = jest.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: { id: '1', original_message: 'x', quantum_message: 'y', analytics: {}, timestamp: '' } })
      });
      const request: QuantumMessageRequest = { original_message: 'hello', user_id: 'u1' };

      await QuantumAISystemAPI.generateQuantumMessage(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toMatch(pathSuffixRegex(GENERATE_QUANTUM_MESSAGE_PATH));
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
      expect(JSON.parse(mockFetch.mock.calls[0][1].body as string)).toEqual(request);
    });

    it('generateQuantumMessage는 선택 필드(context, recent_messages)를 body에 포함', async () => {
      const mockFetch = jest.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: { id: '1', original_message: 'hi', quantum_message: 'q', analytics: {}, timestamp: '' } })
      });
      const request: QuantumMessageRequest = {
        original_message: 'hi',
        user_id: 'u1',
        context: 'some context',
        recent_messages: [{ content: 'prev', sender: 'user', timestamp: '2024-01-01T00:00:00Z' }],
      };

      await QuantumAISystemAPI.generateQuantumMessage(request);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
      expect(body.context).toBe('some context');
      expect(body.recent_messages).toHaveLength(1);
      expect(body.recent_messages[0].content).toBe('prev');
    });
  });

  describe('quantumAnalysis', () => {
    it('양자 분석 성공', async () => {
      const mockAnalysis = { entanglement_score: 0.8 };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, analysis: mockAnalysis })
      });

      const request: QuantumAnalysisRequest = {
        messages: [{ content: 'hi', sender: 'user', timestamp: '' }],
        user_id: 'user-1'
      };

      const result = await QuantumAISystemAPI.quantumAnalysis(request);

      expect(result.success).toBe(true);
      expect(result.analysis).toEqual(mockAnalysis);
    });

    it('quantumAnalysis는 POST /api/quantum-analysis로 요청 body 전송', async () => {
      const mockFetch = jest.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, analysis: {} })
      });
      const request: QuantumAnalysisRequest = {
        messages: [{ content: 'hi', sender: 'user', timestamp: '' }],
        user_id: 'user-1'
      };

      await QuantumAISystemAPI.quantumAnalysis(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toMatch(pathSuffixRegex(QUANTUM_ANALYSIS_PATH));
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
      expect(JSON.parse(mockFetch.mock.calls[0][1].body as string)).toEqual(request);
    });

    it('quantumAnalysis는 선택 필드(analysis_dimensions)를 body에 포함', async () => {
      const mockFetch = jest.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, analysis: {} })
      });
      const request: QuantumAnalysisRequest = {
        messages: [{ content: 'a', sender: 'user', timestamp: '' }],
        user_id: 'u1',
        analysis_dimensions: ['entanglement', 'coherence'],
      };

      await QuantumAISystemAPI.quantumAnalysis(request);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
      expect(body.analysis_dimensions).toEqual(['entanglement', 'coherence']);
    });
  });

  describe('quantumPrediction', () => {
    it('양자 예측 성공', async () => {
      const mockPrediction = { probability: 0.9 };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, prediction: mockPrediction })
      });

      const request: QuantumPredictionRequest = {
        user_id: 'user-1',
        prediction_type: 'response_time',
        quantum_context: {}
      };

      const result = await QuantumAISystemAPI.quantumPrediction(request);

      expect(result.success).toBe(true);
      expect(result.prediction).toEqual(mockPrediction);
    });

    it('quantumPrediction은 POST /api/quantum-prediction으로 요청 body 전송', async () => {
      const mockFetch = jest.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, prediction: {} })
      });
      const request: QuantumPredictionRequest = {
        user_id: 'user-1',
        prediction_type: 'response_time',
        quantum_context: {}
      };

      await QuantumAISystemAPI.quantumPrediction(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toMatch(pathSuffixRegex(QUANTUM_PREDICTION_PATH));
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
      expect(JSON.parse(mockFetch.mock.calls[0][1].body as string)).toEqual(request);
    });

    it('quantumPrediction은 quantum_context를 body에 포함', async () => {
      const mockFetch = jest.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, prediction: {} })
      });
      const request: QuantumPredictionRequest = {
        user_id: 'u1',
        prediction_type: 'success_rate',
        quantum_context: { horizon: '7d', model: 'v2' },
      };

      await QuantumAISystemAPI.quantumPrediction(request);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
      expect(body.quantum_context).toEqual({ horizon: '7d', model: 'v2' });
    });
  });

  describe('testConnection', () => {
    it('연결 성공 시 true 반환', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      const result = await QuantumAISystemAPI.testConnection();

      expect(result).toBe(true);
    });

    it('연결 실패 시 false 반환', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await QuantumAISystemAPI.testConnection();

      expect(result).toBe(false);
    });
  });
});

describe('quantumAISystemAPI convenience functions', () => {
  beforeEach(() => {
    installJestFetchMock();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    restoreGlobalFetch(originalFetch);
    jest.restoreAllMocks();
  });

  it('generateQuantum 메시지 반환', async () => {
    const mockMessage = {
      id: 'msg-1',
      original_message: 'hi',
      quantum_message: 'quantum hi',
      analytics: {},
      timestamp: new Date().toISOString()
    };

    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: mockMessage })
    });

    const result = await quantumAISystemAPI.generateQuantum({
      original_message: 'hi',
      user_id: 'user-1'
    });

    expect(result).toEqual(mockMessage);
  });

  it('checkStatus healthy 시 true', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'healthy' })
    });

    const result = await quantumAISystemAPI.checkStatus();

    expect(result).toBe(true);
  });

  it('checkStatus 실패 시 false', async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error('offline'));

    const result = await quantumAISystemAPI.checkStatus();

    expect(result).toBe(false);
  });

  it('checkStatus가 status가 healthy가 아니면 false', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'degraded' }),
    });

    const result = await quantumAISystemAPI.checkStatus();

    expect(result).toBe(false);
  });

  it('quantumAnalysis 편의 함수는 analysis만 반환', async () => {
    const mockAnalysis = { entanglement_score: 0.7 };

    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, analysis: mockAnalysis }),
    });

    const result = await quantumAISystemAPI.quantumAnalysis({
      messages: [{ content: 'test', sender: 'user', timestamp: '' }],
      user_id: 'user-1',
    });

    expect(result).toEqual(mockAnalysis);
  });

  it('quantumPrediction 편의 함수는 prediction만 반환', async () => {
    const mockPrediction = { probability: 0.85 };

    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, prediction: mockPrediction }),
    });

    const result = await quantumAISystemAPI.quantumPrediction({
      user_id: 'user-1',
      prediction_type: 'success_rate',
      quantum_context: {},
    });

    expect(result).toEqual(mockPrediction);
  });

  it('testEndpoint 성공 시 응답 반환', async () => {
    const mockResponse = { ok: true };

    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await quantumAISystemAPI.testEndpoint();

    expect(result).toEqual(mockResponse);
  });

  it('testEndpoint는 /api/test 엔드포인트로 fetch 호출', async () => {
    const mockFetch = jest.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await quantumAISystemAPI.testEndpoint();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toMatch(pathSuffixRegex(API_SMOKE_TEST_PATH));
  });

  it('testEndpoint 실패 시 에러 throw', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({ ok: false, status: 502 });

    await expect(quantumAISystemAPI.testEndpoint()).rejects.toThrow();
  });

  it('generateQuantum 실패 시 에러 throw', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(
      quantumAISystemAPI.generateQuantum({ original_message: 'x', user_id: 'u1' }),
    ).rejects.toThrow();
  });

  it('quantumAnalysis 편의 함수 실패 시 에러 throw', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(
      quantumAISystemAPI.quantumAnalysis({
        messages: [{ content: 'x', sender: 'user', timestamp: '' }],
        user_id: 'u1',
      }),
    ).rejects.toThrow();
  });

  it('quantumPrediction 편의 함수 실패 시 에러 throw', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(
      quantumAISystemAPI.quantumPrediction({
        user_id: 'u1',
        prediction_type: 'response_time',
        quantum_context: {},
      }),
    ).rejects.toThrow();
  });
});
