/**
 * apiHelper 유틸리티 테스트
 * API 헬퍼 함수 기능 확인
 */

import { ApiHelper } from '../apiHelper';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import {
  API_BASE_URL,
  API_SMOKE_TEST_PATH,
  API_STATUS_PATH,
  API_UPLOAD_CHAT_PATH,
  API_V7_CHAT_MESSAGES_PATH_PREFIX,
  API_V7_CHAT_ROOMS_PATH,
  joinApiHealthCheckUrl,
} from '../../config/api';

const TEST_URL = joinApiHealthCheckUrl(API_BASE_URL, API_SMOKE_TEST_PATH);

// fetch 모킹
installJestFetchMock();

// console 메서드 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('ApiHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('safeFetch', () => {
    it('성공적인 API 호출을 처리해야 함', async () => {
      const mockData = { result: 'success' };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await ApiHelper.safeFetch(TEST_URL);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        TEST_URL,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          mode: 'cors',
        })
      );
    });

    it('HTTP 에러를 처리해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await ApiHelper.safeFetch(TEST_URL);

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 404');
    });

    it('네트워크 에러를 처리해야 함', async () => {
      const networkError = new TypeError('Failed to fetch');
      jest.mocked(global.fetch).mockRejectedValueOnce(networkError);

      const result = await ApiHelper.safeFetch(TEST_URL);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch');
    });

    it('알 수 없는 에러를 처리해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce('Unknown error');

      const result = await ApiHelper.safeFetch(TEST_URL);

      expect(result.success).toBe(false);
      expect(result.error).toBe('알 수 없는 오류');
    });

    it('에러 메시지가 비어 있으면 알 수 없는 오류로 반환해야 함', async () => {
      const emptyMessageError = new Error();
      emptyMessageError.message = '';
      jest.mocked(global.fetch).mockRejectedValueOnce(emptyMessageError);

      const result = await ApiHelper.safeFetch(TEST_URL);

      expect(result.success).toBe(false);
      expect(result.error).toBe('알 수 없는 오류');
    });

    it('커스텀 헤더를 포함해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await ApiHelper.safeFetch(TEST_URL, {
        headers: {
          'Authorization': 'Bearer token',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        TEST_URL,
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
    it('대화방 목록을 조회해야 함', async () => {
      const mockData = {
        chat_rooms: [
          { id: '1', name: 'Room 1' },
          { id: '2', name: 'Room 2' },
        ],
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await ApiHelper.getChatRooms();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, API_V7_CHAT_ROOMS_PATH),
        expect.any(Object)
      );
    });

    it('대화방 목록 조회 실패를 처리해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await ApiHelper.getChatRooms();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getChatMessages', () => {
    it('대화방 메시지를 조회해야 함', async () => {
      const roomId = 'room-1';
      const mockData = { messages: [{ id: '1', text: 'Hello' }] };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await ApiHelper.getChatMessages(roomId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, `${API_V7_CHAT_MESSAGES_PATH_PREFIX}/room-1`),
        expect.any(Object)
      );
    });

    it('roomId에 특수문자가 있으면 인코딩되어 요청해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      });

      await ApiHelper.getChatMessages('a/b');

      const expectedMessagesUrl = joinApiHealthCheckUrl(
        API_BASE_URL,
        `${API_V7_CHAT_MESSAGES_PATH_PREFIX}/${encodeURIComponent('a/b')}`,
      );
      expect(global.fetch).toHaveBeenCalledWith(expectedMessagesUrl, expect.any(Object));
    });

    it('메시지 조회 실패를 처리해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Timeout'));

      const result = await ApiHelper.getChatMessages('room-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Timeout');
    });
  });

  describe('checkServerHealth', () => {
    it('모든 서버 상태를 확인해야 함', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true });

      const result = await ApiHelper.checkServerHealth();

      expect(result).toEqual({
        main: true,
        advanced: true,
        message: true,
        upload: true,
      });
      expect(global.fetch).toHaveBeenCalledTimes(4);
      const calls = jest.mocked(global.fetch).mock.calls;
      expect(calls[0][0]).toBe(joinApiHealthCheckUrl(API_BASE_URL));
      expect(calls[1][0]).toBe(joinApiHealthCheckUrl(API_BASE_URL, API_V7_CHAT_ROOMS_PATH));
      expect(calls[2][0]).toBe(joinApiHealthCheckUrl(API_BASE_URL, API_STATUS_PATH));
      expect(calls[3][0]).toBe(joinApiHealthCheckUrl(API_BASE_URL, '/'));
    });

    it('일부 서버 연결 실패 시 해당 키만 false여야 함', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: false });

      const result = await ApiHelper.checkServerHealth();

      expect(result.main).toBe(true);
      expect(result.advanced).toBe(false);
      expect(result.message).toBe(true);
      expect(result.upload).toBe(false);
      const calls = jest.mocked(global.fetch).mock.calls;
      expect(calls[0][0]).toBe(joinApiHealthCheckUrl(API_BASE_URL));
      expect(calls[1][0]).toBe(joinApiHealthCheckUrl(API_BASE_URL, API_V7_CHAT_ROOMS_PATH));
      expect(calls[2][0]).toBe(joinApiHealthCheckUrl(API_BASE_URL, API_STATUS_PATH));
      expect(calls[3][0]).toBe(joinApiHealthCheckUrl(API_BASE_URL, '/'));
    });
  });

  describe('uploadChatFile', () => {
    it('파일 업로드 성공 시 data를 반환해야 함', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockData = { id: 'file-1', name: 'test.txt' };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await ApiHelper.uploadChatFile(file);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, API_UPLOAD_CHAT_PATH),
        expect.objectContaining({
          method: 'POST',
          mode: 'cors',
          body: expect.any(FormData),
        })
      );
    });

    it('업로드 실패(HTTP 에러) 시 success false와 에러 메시지를 반환해야 함', async () => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
      });

      const result = await ApiHelper.uploadChatFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 413');
    });

    it('네트워크 오류 시 fallback 에러 메시지를 반환해야 함', async () => {
      const file = new File(['x'], 'a.txt', { type: 'text/plain' });
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

      const result = await ApiHelper.uploadChatFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch');
    });
  });
});

