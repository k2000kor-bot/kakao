/**
 * @jest-environment jsdom
 */
import {
  exchangeGoogleDriveOAuthCode,
  exportGoogleDriveFileText,
  fetchGoogleDrivePdfText,
  listGoogleDriveImportableInFolder,
} from '../googleDriveService';
import {
  API_BASE_URL,
  AUTH_GOOGLE_DRIVE_EXPORT_TEXT_PATH,
  AUTH_GOOGLE_DRIVE_FETCH_PDF_TEXT_PATH,
  AUTH_GOOGLE_DRIVE_LIST_IMPORTABLE_IN_FOLDER_PATH,
  AUTH_GOOGLE_DRIVE_OAUTH_TOKEN_PATH,
  joinApiHealthCheckUrl,
} from '../../config/api';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('googleDriveService', () => {
  it('exportGoogleDriveFileText 성공 시 본문·메타를 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          file_id: 'f1',
          export_mime_type: 'text/plain',
          content: 'hello',
          char_count: 5,
        },
      }),
    } as unknown as Response);

    const r = await exportGoogleDriveFileText({
      accessToken: 'tok',
      fileId: 'f1',
    });

    expect(r.ok).toBe(true);
    if (!r.ok) {
      throw new Error('expected exportGoogleDriveFileText success');
    }
    expect(r.content).toBe('hello');
    expect(r.charCount).toBe(5);
    expect(r.fileId).toBe('f1');
    expect(global.fetch).toHaveBeenCalledWith(
      joinApiHealthCheckUrl(API_BASE_URL, AUTH_GOOGLE_DRIVE_EXPORT_TEXT_PATH),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          access_token: 'tok',
          file_id: 'f1',
          export_mime_type: 'text/plain',
        }),
      }),
    );
  });

  it('exportGoogleDriveFileText 실패 시 ok:false', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({ success: false, error: 'bad', status_code: 502 }),
    } as unknown as Response);

    const r = await exportGoogleDriveFileText({
      accessToken: 'x',
      fileId: 'y',
      exportMimeType: 'text/csv',
    });

    expect(r.ok).toBe(false);
    if (r.ok) {
      throw new Error('expected exportGoogleDriveFileText failure');
    }
    expect(r.errorMessage).toBe('bad');
    expect(r.statusCode).toBe(502);
  });

  it('fetchGoogleDrivePdfText 성공 시 본문·제목을 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          file_id: 'fp1',
          title: 'Rep',
          content: 'pdf text',
          char_count: 8,
        },
      }),
    } as unknown as Response);

    const r = await fetchGoogleDrivePdfText({
      accessToken: 'tok',
      fileId: 'fp1',
      filenameHint: 'x.pdf',
    });

    expect(r.ok).toBe(true);
    if (!r.ok) {
      throw new Error('expected fetchGoogleDrivePdfText success');
    }
    expect(r.content).toBe('pdf text');
    expect(r.title).toBe('Rep');
    expect(global.fetch).toHaveBeenCalledWith(
      joinApiHealthCheckUrl(API_BASE_URL, AUTH_GOOGLE_DRIVE_FETCH_PDF_TEXT_PATH),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          access_token: 'tok',
          file_id: 'fp1',
          filename_hint: 'x.pdf',
        }),
      }),
    );
  });

  it('exchangeGoogleDriveOAuthCode 성공 시 accessToken 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { access_token: 'ya29.test', token_type: 'Bearer', expires_in: 3599 },
      }),
    } as unknown as Response);

    const r = await exchangeGoogleDriveOAuthCode({ code: 'authcode', redirectUri: 'http://localhost:3000/oauth/google/drive/callback' });

    expect(r.ok).toBe(true);
    if (!r.ok) {
      throw new Error('expected exchangeGoogleDriveOAuthCode success');
    }
    expect(r.accessToken).toBe('ya29.test');
    expect(global.fetch).toHaveBeenCalledWith(
      joinApiHealthCheckUrl(API_BASE_URL, AUTH_GOOGLE_DRIVE_OAUTH_TOKEN_PATH),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          code: 'authcode',
          redirect_uri: 'http://localhost:3000/oauth/google/drive/callback',
        }),
      }),
    );
  });

  it('exchangeGoogleDriveOAuthCode 실패 시 ok:false', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({ detail: 'invalid_grant' }),
    } as unknown as Response);

    const r = await exchangeGoogleDriveOAuthCode({ code: 'bad', redirectUri: 'http://x/cb' });

    expect(r.ok).toBe(false);
    if (r.ok) {
      throw new Error('expected exchangeGoogleDriveOAuthCode failure');
    }
    expect(r.errorMessage).toBe('invalid_grant');
  });

  it('listGoogleDriveImportableInFolder 성공 시 fileIds·truncated 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { file_ids: ['a', 'b'], truncated: true },
      }),
    } as unknown as Response);

    const r = await listGoogleDriveImportableInFolder({
      accessToken: 'tok',
      folderId: 'fold1',
    });

    expect(r.ok).toBe(true);
    if (!r.ok) {
      throw new Error('expected listGoogleDriveImportableInFolder success');
    }
    expect(r.fileIds).toEqual(['a', 'b']);
    expect(r.truncated).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      joinApiHealthCheckUrl(API_BASE_URL, AUTH_GOOGLE_DRIVE_LIST_IMPORTABLE_IN_FOLDER_PATH),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ access_token: 'tok', folder_id: 'fold1', max_folder_depth: 1 }),
      }),
    );
  });

  it('exchangeGoogleDriveOAuthCode 실패 시 main_server 의 error 필드를 메시지로 사용', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: 'redirect_uri 의 path 는 SPA OAuth 콜백과 같아야 합니다.',
        status_code: 400,
      }),
    } as unknown as Response);

    const r = await exchangeGoogleDriveOAuthCode({
      code: 'c',
      redirectUri: 'http://localhost:3000/wrong/callback',
    });

    expect(r.ok).toBe(false);
    if (r.ok) {
      throw new Error('expected exchangeGoogleDriveOAuthCode failure (main_server error)');
    }
    expect(r.errorMessage).toContain('redirect_uri');
    expect(r.errorMessage).toContain('SPA');
  });
});
