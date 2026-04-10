/**
 * UltimateMessageAPI 테스트
 */
import {
  UltimateMessageAPI,
  ultimateMessageAPI,
  type UltimateMessageRequest,
  type UserProfileRequest
} from '../ultimateMessageAPI';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

describe('UltimateMessageAPI', () => {
  beforeEach(() => {
    installJestFetchMock();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    restoreGlobalFetch(originalFetch);
    jest.restoreAllMocks();
  });

  describe('getStatus', () => {
    it('시스템 상태 조회 성공', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      });

      const result = await UltimateMessageAPI.getStatus();

      expect(result).toEqual({ status: 'healthy' });
    });
  });

  describe('healthCheck', () => {
    it('헬스 체크 성공', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true })
      });

      const result = await UltimateMessageAPI.healthCheck();

      expect(result).toBeDefined();
    });
  });

  describe('getMessageFormats', () => {
    it('메시지 형식 목록 조회', async () => {
      const mockFormats = { email: '이메일', sms: '문자' };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, formats: mockFormats })
      });

      const result = await UltimateMessageAPI.getMessageFormats();

      expect(result.success).toBe(true);
      expect(result.formats).toEqual(mockFormats);
    });
  });

  describe('getStrategies', () => {
    it('전략 목록 조회', async () => {
      const mockStrategies = { direct: '직접적' };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, strategies: mockStrategies })
      });

      const result = await UltimateMessageAPI.getStrategies();

      expect(result.success).toBe(true);
      expect(result.strategies).toEqual(mockStrategies);
    });
  });

  describe('getTones', () => {
    it('톤 목록 조회', async () => {
      const mockTones = { formal: '공식적' };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, tones: mockTones })
      });

      const result = await UltimateMessageAPI.getTones();

      expect(result.success).toBe(true);
      expect(result.tones).toEqual(mockTones);
    });
  });

  describe('generateUltimateMessage', () => {
    it('궁극적 메시지 생성', async () => {
      const mockMessage = {
        id: 'msg-1',
        original_message: 'hello',
        generated_message: '안녕하세요',
        analytics: {},
        timestamp: new Date().toISOString()
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: mockMessage })
      });

      const request: UltimateMessageRequest = {
        original_message: 'hello'
      };

      const result = await UltimateMessageAPI.generateUltimateMessage(request);

      expect(result.success).toBe(true);
      expect(result.message).toEqual(mockMessage);
    });
  });

  describe('updateUserProfile', () => {
    it('사용자 프로필 업데이트', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'updated' })
      });

      const request: UserProfileRequest = {
        user_id: 'u1',
        preferred_formats: [],
        communication_style: 'formal',
        strategy_preferences: [],
        tone_preferences: []
      };

      const result = await UltimateMessageAPI.updateUserProfile(request);

      expect(result.success).toBe(true);
      expect(result.message).toBe('updated');
    });
  });

  describe('getUserProfile', () => {
    it('사용자 프로필 조회', async () => {
      const mockProfile = {
        user_id: 'u1',
        preferred_formats: [],
        communication_style: 'formal',
        strategy_preferences: [],
        tone_preferences: [],
        created_at: '',
        updated_at: ''
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, profile: mockProfile })
      });

      const result = await UltimateMessageAPI.getUserProfile('u1');

      expect(result.success).toBe(true);
      expect(result.profile).toEqual(mockProfile);
    });
  });

  describe('testConnection', () => {
    it('연결 성공 시 true', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      const result = await UltimateMessageAPI.testConnection();

      expect(result).toBe(true);
    });

    it('연결 실패 시 false', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await UltimateMessageAPI.testConnection();

      expect(result).toBe(false);
    });
  });
});

describe('ultimateMessageAPI convenience functions', () => {
  beforeEach(() => {
    installJestFetchMock();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    restoreGlobalFetch(originalFetch);
    jest.restoreAllMocks();
  });

  it('getFormats 형식 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, formats: { a: 'A' } })
    });

    const result = await ultimateMessageAPI.getFormats();

    expect(result).toEqual({ a: 'A' });
  });

  it('checkStatus healthy 시 true', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'healthy' })
    });

    const result = await ultimateMessageAPI.checkStatus();

    expect(result).toBe(true);
  });

  it('checkStatus 실패 시 false', async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error('offline'));

    const result = await ultimateMessageAPI.checkStatus();

    expect(result).toBe(false);
  });
});
