/**
 * unifiedMessageAPI 테스트
 */
import UnifiedMessageAPI, { messageAPI } from '../unifiedMessageAPI';

const mockFetch = jest.fn();

describe('unifiedMessageAPI', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    (global as { fetch?: jest.Mock }).fetch = mockFetch;
  });

  afterEach(() => {
    delete (global as { fetch?: jest.Mock }).fetch;
  });

  describe('UnifiedMessageAPI', () => {
    it('getStatus 호출', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      });

      const result = await UnifiedMessageAPI.getStatus();

      expect(result.status).toBe('healthy');
    });

    it('healthCheck 호출', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await UnifiedMessageAPI.healthCheck();

      expect(result.success).toBe(true);
    });

    it('getMessageFormats 호출', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            formats: { formal: '격식형', casual: '친근형' }
          })
      });

      const result = await UnifiedMessageAPI.getMessageFormats();

      expect(result.success).toBe(true);
      expect(result.formats).toBeDefined();
    });

    it('testConnection 성공 시 true', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      const result = await UnifiedMessageAPI.testConnection();

      expect(result).toBe(true);
    });

    it('testConnection 실패 시 false', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await UnifiedMessageAPI.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('messageAPI', () => {
    it('getFormats 호출', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            formats: { greeting: '인사' }
          })
      });

      const result = await messageAPI.getFormats();

      expect(result).toBeDefined();
      expect(result.greeting).toBe('인사');
    });

    it('checkStatus 성공 시 true', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      });

      const result = await messageAPI.checkStatus();

      expect(result).toBe(true);
    });

    it('checkStatus 실패 시 false', async () => {
      mockFetch.mockRejectedValue(new Error('Fail'));

      const result = await messageAPI.checkStatus();

      expect(result).toBe(false);
    });
  });
});
