/**
 * apiHelper 유틸리티 테스트
 * API 헬퍼 함수 기능 확인
 */

import { ApiHelper } from '../apiHelper';

// fetch 모킹
global.fetch = jest.fn();

// console 메서드 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('ApiHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('safeFetch', () => {
    it('성공적인 API 호출을 처리해야 함', async () => {
      const mockData = { result: 'success' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await ApiHelper.safeFetch('http://localhost:5001/api/test');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          mode: 'cors',
        })
      );
    });

    it('HTTP 에러를 처리해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await ApiHelper.safeFetch('http://localhost:5001/api/test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 404');
    });

    it('네트워크 에러를 처리해야 함', async () => {
      const networkError = new TypeError('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      const result = await ApiHelper.safeFetch('http://localhost:5001/api/test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch');
    });

    it('알 수 없는 에러를 처리해야 함', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('Unknown error');

      const result = await ApiHelper.safeFetch('http://localhost:5001/api/test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('알 수 없는 오류');
    });

    it('커스텀 헤더를 포함해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await ApiHelper.safeFetch('http://localhost:5001/api/test', {
        headers: {
          'Authorization': 'Bearer token',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
          }),
        })
      );
    });
  });

  describe('getChatRooms', () => {
    it('채팅방 목록을 조회해야 함', async () => {
      const mockData = {
        chat_rooms: [
          { id: '1', name: 'Room 1' },
          { id: '2', name: 'Room 2' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await ApiHelper.getChatRooms();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v7/chat-rooms'),
        expect.any(Object)
      );
    });

    it('채팅방 목록 조회 실패를 처리해야 함', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await ApiHelper.getChatRooms();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

