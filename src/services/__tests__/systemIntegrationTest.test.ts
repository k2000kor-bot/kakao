/**
 * SystemIntegrationTest 테스트
 */
import systemIntegrationTest from '../systemIntegrationTest';
import enhancedBackendAPI from '../enhancedBackendAPI';

jest.mock('../enhancedBackendAPI', () => ({
  __esModule: true,
  default: {
    checkBackendStatus: jest.fn(),
    generateHighQualityResponse: jest.fn()
  }
}));

describe('SystemIntegrationTest', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkBackendStatus', () => {
    it('백엔드 상태 확인 - 전체 사용 가능', async () => {
      jest.mocked(enhancedBackendAPI.checkBackendStatus).mockResolvedValue({
        ultimate: true,
        enhanced: true,
        standard: true
      });

      const result = await systemIntegrationTest.checkBackendStatus();

      expect(result).toEqual({
        ultimate: true,
        enhanced: true,
        standard: true,
        overall: true
      });
    });

    it('백엔드 상태 확인 - 일부만 사용 가능', async () => {
      jest.mocked(enhancedBackendAPI.checkBackendStatus).mockResolvedValue({
        ultimate: false,
        enhanced: true,
        standard: true
      });

      const result = await systemIntegrationTest.checkBackendStatus();

      expect(result.ultimate).toBe(false);
      expect(result.enhanced).toBe(true);
      expect(result.standard).toBe(true);
      expect(result.overall).toBe(true);
    });

    it('백엔드 상태 확인 - 전부 비활성', async () => {
      jest.mocked(enhancedBackendAPI.checkBackendStatus).mockResolvedValue({
        ultimate: false,
        enhanced: false,
        standard: false
      });

      const result = await systemIntegrationTest.checkBackendStatus();

      expect(result.overall).toBe(false);
    });

    it('백엔드 상태 확인 - API 오류 시', async () => {
      jest.mocked(enhancedBackendAPI.checkBackendStatus).mockRejectedValue(new Error('연결 실패'));

      await expect(systemIntegrationTest.checkBackendStatus()).rejects.toThrow('연결 실패');
    });
  });
});
