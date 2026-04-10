/**
 * GET /api/status — 백엔드 기능별 사용 가능 여부 (TTS, 프로젝트 등)
 * 타임아웃(8초)으로 백엔드 미응답 시에도 UI가 멈추지 않도록 함.
 */
import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';

const STATUS_FETCH_TIMEOUT_MS = 8000;

export interface ApiStatusResult {
  ok: boolean;
  tts: {
    speech: boolean;
    speech_from_source: boolean;
    speech_from_project: boolean;
    message: string;
  };
  projects: boolean;
  uptime_seconds?: number;
}

export function useApiStatus(refreshIntervalMs = 0) {
  const [data, setData] = useState<ApiStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), STATUS_FETCH_TIMEOUT_MS);
    try {
      setError(null);
      let res = await fetch(API_ENDPOINTS.STATUS, { signal: ac.signal });
      if (!res.ok) {
        const statusFailed = res.status;
        res = await fetch(API_ENDPOINTS.HEALTH, { signal: ac.signal });
        if (res.ok) {
          setData({ ok: true, tts: { speech: false, speech_from_source: false, speech_from_project: false, message: '' }, projects: true });
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }
        throw new Error(`Status ${statusFailed}`);
      }
      clearTimeout(timeoutId);
      const json = await res.json();
      setData(json.data ?? json);
    } catch (e) {
      clearTimeout(timeoutId);
      try {
        const healthRes = await fetch(API_ENDPOINTS.HEALTH, { cache: 'no-store' });
        if (healthRes.ok) {
          setData({ ok: true, tts: { speech: false, speech_from_source: false, speech_from_project: false, message: '' }, projects: true });
          setError(null);
          setLoading(false);
          return;
        }
      } catch {
        // health도 실패 시 아래 error 유지
      }
      if (e instanceof Error) {
        setError(e.name === 'AbortError' ? '연결 시간 초과 (백엔드 확인 필요)' : e.message);
      } else {
        setError(String(e));
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    if (refreshIntervalMs > 0) {
      const id = setInterval(fetchStatus, refreshIntervalMs);
      return () => clearInterval(id);
    }
  }, [fetchStatus, refreshIntervalMs]);

  return {
    data,
    loading,
    error,
    ttsSpeech: data?.tts?.speech ?? false,
    projectsAvailable: data?.projects ?? false,
    refetch: fetchStatus,
  };
}
