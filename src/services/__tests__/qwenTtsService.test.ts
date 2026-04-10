/**
 * qwenTtsService 테스트
 * getQwenTtsConfig, speakQwenTts, getProjectVoiceSources 등 TTS API 호출 검증
 */

import { Blob as NodeBlob, File as NodeBufferFile } from 'buffer';
import {
  getQwenTtsConfig,
  speakQwenTts,
  speakQwenTtsWithVoiceClone,
  speakQwenTtsWithVoiceCloneAndPlay,
  speakQwenTtsScriptInVoice,
  speakQwenTtsAndPlay,
  speakQwenTtsFromSourceUrl,
  speakQwenTtsScriptFromSourceUrl,
  speakQwenTtsFromProject,
  addProjectVoiceSource,
  deleteProjectVoiceSource,
  getQwenTtsVoices,
  getQwenTtsSituations,
  getProjectVoiceSources,
  TTS_SITUATION_LABELS,
  TTS_SCRIPT_DIALOGUE_SITUATIONS,
  VOICE_CLONE_MAX_NEW_TOKENS,
  PLAYBACK_RATE_DEFAULT,
  PLAYBACK_RATE_MIN,
  PLAYBACK_RATE_MAX,
  type TtsSituation,
} from '../qwenTtsService';
import {
  API_BASE_URL,
  API_PROJECTS_LIST_PATH,
  API_PROJECT_VOICE_SOURCES_SEGMENT,
  API_TTS_CONFIG_PATH,
  API_TTS_SPEECH_PATH,
  API_TTS_SPEECH_FROM_SOURCE_PATH,
  API_TTS_VOICES_PATH,
  API_TTS_SITUATIONS_PATH,
  joinApiHealthCheckUrl,
} from '../../config/api';
import { restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

if (typeof globalThis.Blob === 'undefined') {
  (globalThis as unknown as { Blob: typeof NodeBlob }).Blob = NodeBlob;
}
if (typeof globalThis.File === 'undefined') {
  (globalThis as unknown as { File: typeof NodeBufferFile }).File = NodeBufferFile;
}

const mockFetch = jest.fn();
const originalFetch = globalThis.fetch;

beforeEach(() => {
  mockFetch.mockClear();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  if (typeof window !== 'undefined') {
    window.fetch = globalThis.fetch;
  }
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
});

describe('qwenTtsService', () => {
  describe('getQwenTtsConfig', () => {
    it('GET /api/tts/config 호출 후 설정 객체 반환', async () => {
      const config = { success: true, available: true, base_url_configured: true, message: '' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(config),
      });

      const result = await getQwenTtsConfig();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(joinApiHealthCheckUrl(API_BASE_URL, API_TTS_CONFIG_PATH));
      expect(result).toEqual(config);
      expect(result.available).toBe(true);
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(getQwenTtsConfig()).rejects.toThrow(/TTS config failed/);
    });
  });

  describe('speakQwenTts', () => {
    it('POST /api/tts/speech 호출 후 Blob 반환', async () => {
      const blob = new Blob(['audio'], { type: 'audio/mp3' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(blob),
      });

      const result = await speakQwenTts('안녕하세요', { situation: 'narration' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, API_TTS_SPEECH_PATH),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { input: string; situation: string };
      expect(body.input).toBe('안녕하세요');
      expect(body.situation).toBe('narration');
      expect(result).toBe(blob);
    });

    it('CustomVoice + voiceId 기본값 적용', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });

      await speakQwenTts('테스트');

      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { task_type: string; voice: string };
      expect(body.task_type).toBe('CustomVoice');
      expect(body.voice).toBe('Vivian');
    });

    it('speed 옵션 적용 시 body.speed 포함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await speakQwenTts('텍스트', { speed: 1.5 });
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { speed: number };
      expect(body.speed).toBe(1.5);
    });

    it('refAudio가 data URL 문자열이면 body.ref_audio에 그대로 전달', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      const dataUrl = 'data:audio/wav;base64,abc';
      await speakQwenTts('텍스트', { refAudio: dataUrl, taskType: 'Base' });
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { ref_audio: string };
      expect(body.ref_audio).toBe(dataUrl);
    });

    it('refAudio가 File이면 FileReader로 data URL 변환 후 body.ref_audio 전달', async () => {
      const dataUrl = 'data:audio/wav;base64,xyz';
      const mockReadAsDataURL = jest.fn(function (this: { onload?: () => void; result: string }) {
        this.result = dataUrl;
        queueMicrotask(() => this.onload?.({} as ProgressEvent));
      });
      const FileReaderMock = jest.fn().mockImplementation(function (
        this: { readAsDataURL: () => void; onload?: () => void; result: string }
      ) {
        this.readAsDataURL = mockReadAsDataURL;
        this.result = '';
        this.onload = undefined;
        return this;
      });
      (global as unknown as { FileReader: typeof FileReader }).FileReader = FileReaderMock as unknown as typeof FileReader;

      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      const file = new File(['audio'], 'ref.wav', { type: 'audio/wav' });
      await speakQwenTts('텍스트', { refAudio: file, taskType: 'Base' });

      expect(mockReadAsDataURL).toHaveBeenCalled();
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { ref_audio: string };
      expect(body.ref_audio).toBe(dataUrl);
    });

    it('res.ok false 시 errBody.error 또는 detail 또는 statusText로 에러 메시지', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: () => Promise.resolve({ error: 'TTS 서버 오류' }),
      });
      await expect(speakQwenTts('텍스트')).rejects.toThrow(/TTS failed: 502 - TTS 서버 오류/);
    });

    it('res.ok false이고 errBody.detail 있으면 detail 사용', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'input too long' }),
      });
      await expect(speakQwenTts('텍스트')).rejects.toThrow(/input too long/);
    });

    it('res.ok false이고 json 실패 시 statusText 사용', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.reject(new Error('Parse')),
      });
      await expect(speakQwenTts('텍스트')).rejects.toThrow(/503 - Service Unavailable/);
    });

    it('taskType Base이고 refAudio 없으면 throw', async () => {
      await expect(speakQwenTts('텍스트', { taskType: 'Base' })).rejects.toThrow(/refAudio가 필요합니다/);
    });

    it('instructions·maxNewTokens·xVectorOnlyMode·qualityPreset 전달 시 body에 포함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await speakQwenTts('텍스트', {
        refAudio: 'data:audio/wav;base64,x',
        taskType: 'Base',
        qualityPreset: 'voice_clone_max',
        maxNewTokens: 512,
        xVectorOnlyMode: true,
        instructions: '#명료하게',
      });
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as Record<string, unknown>;
      expect(body.quality_preset).toBe('voice_clone_max');
      expect(body.max_new_tokens).toBe(512);
      expect(body.x_vector_only_mode).toBe(true);
      expect(body.instructions).toBe('#명료하게');
    });
  });

  describe('speakQwenTtsWithVoiceClone', () => {
    it('speakQwenTts에 qualityPreset voice_clone_max, refAudio, situation 등 전달', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await speakQwenTtsWithVoiceClone('대본', 'data:audio/wav;base64,ref', {
        refText: '참조 대본',
        situation: 'narration',
      });
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as Record<string, unknown>;
      expect(body.quality_preset).toBe('voice_clone_max');
      expect(body.task_type).toBe('Base');
      expect(body.ref_audio).toBe('data:audio/wav;base64,ref');
      expect(body.ref_text).toBe('참조 대본');
      expect(body.situation).toBe('narration');
      expect(body.enhance_ref_audio).toBe(true);
      expect(body.naturalness_mode).toBe('natural');
    });
  });

  describe('speakQwenTtsScriptInVoice', () => {
    it('situation 기본값 drama_dialogue로 speakQwenTtsWithVoiceClone 호출', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await speakQwenTtsScriptInVoice('대사 텍스트', 'data:audio/wav;base64,x');
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { situation: string };
      expect(body.situation).toBe('drama_dialogue');
    });
  });

  describe('speakQwenTtsWithVoiceCloneAndPlay', () => {
    it('speakQwenTtsAndPlay에 voice_clone_max·refAudio·onStart/onEnd 전달', async () => {
      const blob = new Blob(['audio'], { type: 'audio/mp3' });
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(blob) });
      const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURL = jest.fn();
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      const mockPause = jest.fn();
      const mockAudio = {
        play: mockPlay,
        pause: mockPause,
        currentTime: 0,
        playbackRate: 1,
      } as unknown as HTMLAudioElement;
      const OriginalURL = global.URL;
      const OriginalAudio = (global as unknown as { Audio: typeof Audio }).Audio;
      (global as unknown as { URL: { createObjectURL: typeof createObjectURL; revokeObjectURL: typeof revokeObjectURL } }).URL = {
        createObjectURL,
        revokeObjectURL,
      };
      (global as unknown as { Audio: typeof Audio }).Audio = jest.fn(() => mockAudio) as unknown as typeof Audio;

      const onStart = jest.fn();
      const onEnd = jest.fn();
      const result = await speakQwenTtsWithVoiceCloneAndPlay('텍스트', 'data:audio/wav;base64,ref', {
        refText: '참조',
        onStart,
        onEnd,
      });

      expect(onStart).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, API_TTS_SPEECH_PATH),
        expect.any(Object)
      );
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { quality_preset: string; ref_audio: string };
      expect(body.quality_preset).toBe('voice_clone_max');
      expect(body.ref_audio).toBe('data:audio/wav;base64,ref');
      result.stop();
      expect(onEnd).toHaveBeenCalled();

      global.URL = OriginalURL;
      (global as unknown as { Audio: typeof Audio }).Audio = OriginalAudio;
    });

    it('TTS 실패 시 onError 호출 후 rethrow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'TTS 오류' }),
      });
      const onError = jest.fn();
      await expect(
        speakQwenTtsWithVoiceCloneAndPlay('텍스트', 'data:audio/wav;base64,ref', { onError })
      ).rejects.toThrow(/TTS failed: 500 - TTS 오류/);
      expect(onError).toHaveBeenCalledWith(expect.stringMatching(/TTS failed: 500 - TTS 오류/));
    });
  });

  describe('speakQwenTtsAndPlay', () => {
    it('blob 생성 후 createObjectURL·Audio로 재생하고 stop 반환', async () => {
      const blob = new Blob(['audio'], { type: 'audio/mp3' });
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(blob) });
      const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURL = jest.fn();
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      const mockPause = jest.fn();
      const mockAudio = {
        play: mockPlay,
        pause: mockPause,
        currentTime: 0,
        playbackRate: 1,
        onended: undefined as (() => void) | undefined,
        onerror: undefined as (() => void) | undefined,
      } as unknown as HTMLAudioElement;
      const OriginalURL = global.URL;
      const OriginalAudio = (global as unknown as { Audio: typeof Audio }).Audio;
      (global as unknown as { URL: { createObjectURL: typeof createObjectURL; revokeObjectURL: typeof revokeObjectURL } }).URL = {
        createObjectURL,
        revokeObjectURL,
      };
      (global as unknown as { Audio: typeof Audio }).Audio = jest.fn(() => mockAudio) as unknown as typeof Audio;

      const onStart = jest.fn();
      const onEnd = jest.fn();
      const result = await speakQwenTtsAndPlay('텍스트', { onStart, onEnd });

      expect(onStart).toHaveBeenCalled();
      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(mockPlay).toHaveBeenCalled();
      expect(result.stop).toBeDefined();
      result.stop();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(onEnd).toHaveBeenCalled();

      global.URL = OriginalURL;
      (global as unknown as { Audio: typeof Audio }).Audio = OriginalAudio;
    });

    it('playbackRate 3 전달 시 0.5~2로 클램프되어 audio.playbackRate 적용', async () => {
      const blob = new Blob(['audio'], { type: 'audio/mp3' });
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(blob) });
      const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURL = jest.fn();
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      const mockPause = jest.fn();
      const mockAudio = {
        play: mockPlay,
        pause: mockPause,
        currentTime: 0,
        playbackRate: 1,
      } as unknown as HTMLAudioElement;
      const OriginalURL = global.URL;
      const OriginalAudio = (global as unknown as { Audio: typeof Audio }).Audio;
      (global as unknown as { URL: { createObjectURL: typeof createObjectURL; revokeObjectURL: typeof revokeObjectURL } }).URL = {
        createObjectURL,
        revokeObjectURL,
      };
      (global as unknown as { Audio: typeof Audio }).Audio = jest.fn(() => mockAudio) as unknown as typeof Audio;

      await speakQwenTtsAndPlay('텍스트', { playbackRate: 3 });

      expect(mockAudio.playbackRate).toBe(2);

      global.URL = OriginalURL;
      (global as unknown as { Audio: typeof Audio }).Audio = OriginalAudio;
    });

    it('audio.onended 호출 시 stop·onEnd 실행', async () => {
      const blob = new Blob(['audio'], { type: 'audio/mp3' });
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(blob) });
      const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURL = jest.fn();
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      const mockPause = jest.fn();
      let onendedCallback: (() => void) | undefined;
      const mockAudio = {
        play: mockPlay,
        pause: mockPause,
        currentTime: 0,
        playbackRate: 1,
        set onended(fn: () => void) {
          onendedCallback = fn;
        },
        get onended() {
          return onendedCallback;
        },
      } as unknown as HTMLAudioElement;
      const OriginalURL = global.URL;
      const OriginalAudio = (global as unknown as { Audio: typeof Audio }).Audio;
      (global as unknown as { URL: { createObjectURL: typeof createObjectURL; revokeObjectURL: typeof revokeObjectURL } }).URL = {
        createObjectURL,
        revokeObjectURL,
      };
      (global as unknown as { Audio: typeof Audio }).Audio = jest.fn(() => mockAudio) as unknown as typeof Audio;

      const onEnd = jest.fn();
      await speakQwenTtsAndPlay('텍스트', { onEnd });
      expect(onendedCallback).toBeDefined();
      onendedCallback!();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(onEnd).toHaveBeenCalled();

      global.URL = OriginalURL;
      (global as unknown as { Audio: typeof Audio }).Audio = OriginalAudio;
    });

    it('audio.onerror 호출 시 stop·onError 실행', async () => {
      const blob = new Blob(['audio'], { type: 'audio/mp3' });
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(blob) });
      const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURL = jest.fn();
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      const mockPause = jest.fn();
      let onerrorCallback: (() => void) | undefined;
      const mockAudio = {
        play: mockPlay,
        pause: mockPause,
        currentTime: 0,
        playbackRate: 1,
        set onerror(fn: () => void) {
          onerrorCallback = fn;
        },
        get onerror() {
          return onerrorCallback;
        },
      } as unknown as HTMLAudioElement;
      const OriginalURL = global.URL;
      const OriginalAudio = (global as unknown as { Audio: typeof Audio }).Audio;
      (global as unknown as { URL: { createObjectURL: typeof createObjectURL; revokeObjectURL: typeof revokeObjectURL } }).URL = {
        createObjectURL,
        revokeObjectURL,
      };
      (global as unknown as { Audio: typeof Audio }).Audio = jest.fn(() => mockAudio) as unknown as typeof Audio;

      const onError = jest.fn();
      await speakQwenTtsAndPlay('텍스트', { onError });
      expect(onerrorCallback).toBeDefined();
      onerrorCallback!();
      expect(onError).toHaveBeenCalledWith('오디오 재생 실패');

      global.URL = OriginalURL;
      (global as unknown as { Audio: typeof Audio }).Audio = OriginalAudio;
    });

    it('speakQwenTts 성공 후 audio.play() reject 시 revoke·onError·rethrow', async () => {
      const blob = new Blob(['audio'], { type: 'audio/mp3' });
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(blob) });
      const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURL = jest.fn();
      const mockPlay = jest.fn().mockRejectedValue(new Error('play failed'));
      const mockPause = jest.fn();
      const mockAudio = {
        play: mockPlay,
        pause: mockPause,
        currentTime: 0,
        playbackRate: 1,
      } as unknown as HTMLAudioElement;
      const OriginalURL = global.URL;
      const OriginalAudio = (global as unknown as { Audio: typeof Audio }).Audio;
      (global as unknown as { URL: { createObjectURL: typeof createObjectURL; revokeObjectURL: typeof revokeObjectURL } }).URL = {
        createObjectURL,
        revokeObjectURL,
      };
      (global as unknown as { Audio: typeof Audio }).Audio = jest.fn(() => mockAudio) as unknown as typeof Audio;

      const onError = jest.fn();
      await expect(speakQwenTtsAndPlay('텍스트', { onError })).rejects.toThrow('play failed');
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(onError).toHaveBeenCalledWith('play failed');

      global.URL = OriginalURL;
      (global as unknown as { Audio: typeof Audio }).Audio = OriginalAudio;
    });
  });

  describe('speakQwenTtsFromSourceUrl', () => {
    it('POST speech-from-source 호출, speed·situation body 포함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await speakQwenTtsFromSourceUrl('대본', 'https://youtube.com/watch?v=1', {
        speed: 1.2,
        situation: 'movie_dialogue',
      });
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, API_TTS_SPEECH_FROM_SOURCE_PATH),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { source_url: string; input: string; speed: number; situation: string };
      expect(body.source_url).toBe('https://youtube.com/watch?v=1');
      expect(body.input).toBe('대본');
      expect(body.speed).toBe(1.2);
      expect(body.situation).toBe('movie_dialogue');
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: () => Promise.resolve({ detail: 'TTS from source failed' }),
      });
      await expect(
        speakQwenTtsFromSourceUrl('텍스트', 'https://example.com/video')
      ).rejects.toThrow(/TTS from source failed/);
    });
  });

  describe('speakQwenTtsScriptFromSourceUrl', () => {
    it('situation 기본값 drama_dialogue로 speech-from-source 호출', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await speakQwenTtsScriptFromSourceUrl('대사', 'https://tiktok.com/xxx');
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { situation: string };
      expect(body.situation).toBe('drama_dialogue');
    });

    it('instructions 전달 시 body에 instructions 포함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await speakQwenTtsScriptFromSourceUrl('대사', 'https://youtube.com/watch?v=1', {
        instructions: '서러운듯 울먹이며',
      });
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { input: string; instructions: string };
      expect(body.instructions).toBe('서러운듯 울먹이며');
      expect(body.input).toBe('대사');
    });
  });

  describe('speakQwenTtsFromProject', () => {
    it('POST speech-from-project 호출, project_id·speed 포함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await speakQwenTtsFromProject('텍스트', 'proj-1', { speed: 0.9, voiceSourceId: 'vs1' });
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { project_id: string; input: string; speed: number; voice_source_id: string };
      expect(body.project_id).toBe('proj-1');
      expect(body.input).toBe('텍스트');
      expect(body.speed).toBe(0.9);
      expect(body.voice_source_id).toBe('vs1');
    });

    it('instructions 전달 시 body에 instructions 포함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await speakQwenTtsFromProject('텍스트', 'proj-1', { instructions: '명료하게' });
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as { project_id: string; input: string; instructions: string };
      expect(body.instructions).toBe('명료하게');
      expect(body.input).toBe('텍스트');
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'project not found' }),
      });
      await expect(speakQwenTtsFromProject('텍스트', 'proj-1')).rejects.toThrow(/TTS from project failed/);
    });
  });

  describe('addProjectVoiceSource', () => {
    it('POST /api/projects/:id/voice-sources 호출, url·ref_text 전달', async () => {
      const data = { success: true, data: { voice_source: { id: 'vs1', url: 'https://youtube.com/v=1', created_at: '' } } };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) });
      const result = await addProjectVoiceSource('proj-1', 'https://youtube.com/watch?v=1', { refText: '자막' });
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_VOICE_SOURCES_SEGMENT}`),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ url: 'https://youtube.com/watch?v=1', ref_text: '자막' }),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data.voice_source.id).toBe('vs1');
    });

    it('name·referenceUrl·startSeconds·endSeconds 전달 시 body에 포함', async () => {
      const data = { success: true, data: { voice_source: { id: 'vs2', url: '', created_at: '' } } };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) });
      await addProjectVoiceSource('proj-1', 'https://youtube.com/watch?v=2', {
        name: '화자1',
        referenceUrl: 'https://youtube.com/watch?v=ref',
        startSeconds: 10,
        endSeconds: 60,
      });
      const callBody = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
      const body = JSON.parse(callBody) as Record<string, unknown>;
      expect(body.name).toBe('화자1');
      expect(body.reference_url).toBe('https://youtube.com/watch?v=ref');
      expect(body.start_seconds).toBe(10);
      expect(body.end_seconds).toBe(60);
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });
      await expect(addProjectVoiceSource('proj-1', 'invalid')).rejects.toThrow(/Add voice source failed/);
    });
  });

  describe('deleteProjectVoiceSource', () => {
    it('DELETE /api/projects/:id/voice-sources/:sourceId 호출', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await deleteProjectVoiceSource('proj-1', 'vs1');
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_VOICE_SOURCES_SEGMENT}/vs1`),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
      await expect(deleteProjectVoiceSource('proj-1', 'vs1')).rejects.toThrow(/Delete voice source failed/);
    });
  });

  describe('getProjectVoiceSources', () => {
    it('GET /api/projects/:id/voice-sources 호출 후 목록 반환', async () => {
      const data = {
        success: true,
        data: [{ id: 'vs1', url: 'https://youtube.com/watch?v=1', created_at: '2024-01-01' }],
        count: 1,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(data),
      });

      const result = await getProjectVoiceSources('proj-1');

      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_VOICE_SOURCES_SEGMENT}`)
      );
      expect(result).toEqual(data);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].url).toContain('youtube');
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(getProjectVoiceSources('proj-1')).rejects.toThrow(/Voice sources failed/);
    });
  });

  describe('getQwenTtsVoices', () => {
    it('GET /api/tts/voices 호출 후 목록 반환', async () => {
      const data = { success: true, voices: ['Vivian', 'Emma'] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(data),
      });

      const result = await getQwenTtsVoices();

      expect(mockFetch).toHaveBeenCalledWith(joinApiHealthCheckUrl(API_BASE_URL, API_TTS_VOICES_PATH));
      expect(result).toEqual(data);
      expect(result.voices).toHaveLength(2);
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

      await expect(getQwenTtsVoices()).rejects.toThrow(/TTS voices failed/);
    });
  });

  describe('getQwenTtsSituations', () => {
    it('GET /api/tts/situations 호출 후 상황 목록 반환', async () => {
      const data = {
        success: true,
        situations: [{ id: 'narration', label: '나레이션', instructions_preview: '...' }],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(data),
      });

      const result = await getQwenTtsSituations();

      expect(mockFetch).toHaveBeenCalledWith(joinApiHealthCheckUrl(API_BASE_URL, API_TTS_SITUATIONS_PATH));
      expect(result.success).toBe(true);
      expect(result.situations).toHaveLength(1);
      expect(result.situations[0].id).toBe('narration');
    });

    it('res.ok false 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(getQwenTtsSituations()).rejects.toThrow(/TTS situations failed/);
    });
  });

  describe('상수 export', () => {
    it('TTS_SITUATION_LABELS에 narration, news 등 키 존재', () => {
      expect(TTS_SITUATION_LABELS.narration).toBe('나레이션');
      expect(TTS_SITUATION_LABELS.news).toBe('뉴스/앵커');
      expect(TTS_SITUATION_LABELS.drama_dialogue).toBe('드라마 대사');
    });

    it('TTS_SCRIPT_DIALOGUE_SITUATIONS가 movie_dialogue, drama_dialogue, film_acting 포함', () => {
      expect(TTS_SCRIPT_DIALOGUE_SITUATIONS).toContain('movie_dialogue' as TtsSituation);
      expect(TTS_SCRIPT_DIALOGUE_SITUATIONS).toContain('drama_dialogue' as TtsSituation);
      expect(TTS_SCRIPT_DIALOGUE_SITUATIONS).toContain('film_acting' as TtsSituation);
      expect(TTS_SCRIPT_DIALOGUE_SITUATIONS).toHaveLength(3);
    });

    it('VOICE_CLONE_MAX_NEW_TOKENS·PLAYBACK_RATE 상수 값 검증', () => {
      expect(VOICE_CLONE_MAX_NEW_TOKENS).toBe(4096);
      expect(PLAYBACK_RATE_DEFAULT).toBe(1);
      expect(PLAYBACK_RATE_MIN).toBe(0.5);
      expect(PLAYBACK_RATE_MAX).toBe(2);
    });
  });
});
