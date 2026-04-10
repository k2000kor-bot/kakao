/**
 * useApiStatus 훅 테스트 — GET /api/status 호출 및 상태 반환
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { API_ENDPOINTS } from '../../config/api';
import { useApiStatus } from '../useApiStatus';

const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  jest.spyOn(global, 'fetch').mockImplementation(mockFetch as typeof fetch);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useApiStatus', () => {
  it('초기에는 loading이 true여야 함', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useApiStatus(0));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(mockFetch.mock.calls[0][0]).toBe(API_ENDPOINTS.STATUS);
  });

  it('성공 시 data, ttsSpeech, projectsAvailable를 반환해야 함', async () => {
    const statusData = {
      ok: true,
      tts: { speech: true, speech_from_source: false, speech_from_project: false, message: 'ok' },
      projects: true,
      uptime_seconds: 10,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: statusData }),
    });

    const { result } = renderHook(() => useApiStatus(0));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch.mock.calls[0][0]).toBe(API_ENDPOINTS.STATUS);
    expect(result.current.data).toEqual(statusData);
    expect(result.current.error).toBeNull();
    expect(result.current.ttsSpeech).toBe(true);
    expect(result.current.projectsAvailable).toBe(true);
  });

  it('실패 시 error를 설정하고 data는 null이어야 함', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useApiStatus(0));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
    expect(result.current.ttsSpeech).toBe(false);
    expect(result.current.projectsAvailable).toBe(false);
    expect(mockFetch.mock.calls[0][0]).toBe(API_ENDPOINTS.STATUS);
    expect(mockFetch.mock.calls[1][0]).toBe(API_ENDPOINTS.HEALTH);
  });

  it('refetch 호출 시 다시 요청해야 함', async () => {
    const statusData = {
      ok: true,
      tts: { speech: false, speech_from_source: false, speech_from_project: false, message: 'ok' },
      projects: false,
    };
    mockFetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: statusData }) });

    const { result } = renderHook(() => useApiStatus(0));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(statusData);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it('응답에 data가 없으면 json 자체를 data로 사용해야 함', async () => {
    const statusPayload = {
      ok: true,
      tts: { speech: true, speech_from_source: false, speech_from_project: false, message: 'ok' },
      projects: true,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(statusPayload),
    });

    const { result } = renderHook(() => useApiStatus(0));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(statusPayload);
    expect(result.current.error).toBeNull();
    expect(mockFetch.mock.calls[0][0]).toBe(API_ENDPOINTS.STATUS);
  });

  it('AbortError 시 연결 시간 초과 메시지를 설정해야 함', async () => {
    mockFetch
      .mockRejectedValueOnce(new DOMException('aborted', 'AbortError'))
      .mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useApiStatus(0));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('연결 시간 초과 (백엔드 확인 필요)');
    expect(mockFetch.mock.calls[0][0]).toBe(API_ENDPOINTS.STATUS);
    expect(mockFetch.mock.calls[1][0]).toBe(API_ENDPOINTS.HEALTH);
  });

  it('STATUS 실패 후 HEALTH 성공 시 data 설정·error 없음', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useApiStatus(0));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({
      ok: true,
      tts: { speech: false, speech_from_source: false, speech_from_project: false, message: '' },
      projects: true,
    });
    expect(result.current.error).toBeNull();
    expect(mockFetch.mock.calls[0][0]).toBe(API_ENDPOINTS.STATUS);
    expect(mockFetch.mock.calls[1][0]).toBe(API_ENDPOINTS.HEALTH);
  });
});
