/**
 * Google Drive API 프록시 호출 (백엔드가 Drive REST로 export).
 */
import {
  API_BASE_URL,
  AUTH_GOOGLE_DRIVE_EXPORT_TEXT_PATH,
  AUTH_GOOGLE_DRIVE_FETCH_PDF_TEXT_PATH,
  AUTH_GOOGLE_DRIVE_LIST_IMPORTABLE_IN_FOLDER_PATH,
  AUTH_GOOGLE_DRIVE_OAUTH_TOKEN_PATH,
  joinApiHealthCheckUrl,
} from '../config/api';

export type GoogleDriveExportMime =
  | 'text/plain'
  | 'text/csv'
  | 'text/tab-separated-values';

export interface GoogleDriveExportTextOk {
  ok: true;
  content: string;
  charCount: number;
  fileId: string;
  exportMimeType: string;
}

export interface GoogleDriveExportTextErr {
  ok: false;
  errorMessage: string;
  statusCode?: number;
}

export type GoogleDriveExportTextResult = GoogleDriveExportTextOk | GoogleDriveExportTextErr;

export interface GoogleDrivePdfTextOk {
  ok: true;
  content: string;
  charCount: number;
  fileId: string;
  title: string;
}

export interface GoogleDrivePdfTextErr {
  ok: false;
  errorMessage: string;
  statusCode?: number;
}

export type GoogleDrivePdfTextResult = GoogleDrivePdfTextOk | GoogleDrivePdfTextErr;

export interface GoogleDriveOAuthExchangeOk {
  ok: true;
  accessToken: string;
  /** Google 토큰 응답 전체( refresh_token 등 포함 가능 — 저장 시 주의 ) */
  raw?: Record<string, unknown>;
}

export interface GoogleDriveOAuthExchangeErr {
  ok: false;
  errorMessage: string;
  statusCode?: number;
}

export type GoogleDriveOAuthExchangeResult = GoogleDriveOAuthExchangeOk | GoogleDriveOAuthExchangeErr;

export interface GoogleDriveFolderListOk {
  ok: true;
  fileIds: string[];
  truncated: boolean;
}

export interface GoogleDriveFolderListErr {
  ok: false;
  errorMessage: string;
  statusCode?: number;
}

export type GoogleDriveFolderListResult = GoogleDriveFolderListOk | GoogleDriveFolderListErr;

interface FetchPdfApiBody {
  success?: boolean;
  data?: {
    content?: string;
    char_count?: number;
    file_id?: string;
    title?: string;
  };
  error?: string;
  status_code?: number;
}

interface ExportTextApiBody {
  success?: boolean;
  data?: {
    content?: string;
    char_count?: number;
    file_id?: string;
    export_mime_type?: string;
  };
  error?: string;
  status_code?: number;
}

interface ListFolderApiBody {
  success?: boolean;
  data?: {
    file_ids?: unknown;
    truncated?: unknown;
    count?: unknown;
    max_folder_depth?: unknown;
  };
  detail?: unknown;
  error?: string;
  status_code?: number;
}

interface OAuthTokenApiBody {
  success?: boolean;
  data?: Record<string, unknown>;
  detail?: unknown;
  error?: string;
  status_code?: number;
}

function formatOAuthExchangeError(res: Response, json: OAuthTokenApiBody): string {
  const d = json.detail;
  if (typeof d === 'string' && d.trim()) return d.trim();
  if (Array.isArray(d) && d.length > 0 && typeof d[0] === 'object' && d[0] !== null && 'msg' in d[0]) {
    const m = (d[0] as { msg?: string }).msg;
    if (typeof m === 'string' && m.trim()) return m.trim();
  }
  if (typeof json.error === 'string' && json.error.trim()) return json.error.trim();
  return res.status === 400 ? '요청이 올바르지 않습니다.' : '토큰 교환에 실패했습니다.';
}

/**
 * Google authorization code 를 액세스 토큰으로 교환합니다(백엔드가 `client_secret` 으로 Google 에 요청).
 */
export async function exchangeGoogleDriveOAuthCode(params: {
  code: string;
  redirectUri: string;
}): Promise<GoogleDriveOAuthExchangeResult> {
  try {
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, AUTH_GOOGLE_DRIVE_OAUTH_TOKEN_PATH), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        code: params.code.trim(),
        redirect_uri: params.redirectUri.trim(),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as OAuthTokenApiBody;
    const token =
      res.ok &&
      json.success &&
      json.data &&
      typeof (json.data as { access_token?: string }).access_token === 'string'
        ? String((json.data as { access_token: string }).access_token).trim()
        : '';
    if (token) {
      return {
        ok: true,
        accessToken: token,
        raw: json.data && typeof json.data === 'object' ? (json.data as Record<string, unknown>) : undefined,
      };
    }
    return {
      ok: false,
      errorMessage: formatOAuthExchangeError(res, json),
      statusCode: typeof json.status_code === 'number' ? json.status_code : res.status,
    };
  } catch (e) {
    return {
      ok: false,
      errorMessage: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Google 문서·스프레드시트 등 Workspace 파일 본문을 텍스트로 가져옵니다.
 * `access_token`은 Drive 읽기 스코프가 포함된 OAuth 액세스 토큰입니다.
 */
export async function exportGoogleDriveFileText(params: {
  accessToken: string;
  fileId: string;
  exportMimeType?: GoogleDriveExportMime;
}): Promise<GoogleDriveExportTextResult> {
  const exportMimeType = params.exportMimeType ?? 'text/plain';
  try {
    const res = await fetch(
      joinApiHealthCheckUrl(API_BASE_URL, AUTH_GOOGLE_DRIVE_EXPORT_TEXT_PATH),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_token: params.accessToken.trim(),
          file_id: params.fileId.trim(),
          export_mime_type: exportMimeType,
        }),
      },
    );
    const json = (await res.json()) as ExportTextApiBody;
    if (res.ok && json.success && json.data && typeof json.data.content === 'string') {
      return {
        ok: true,
        content: json.data.content,
        charCount: typeof json.data.char_count === 'number' ? json.data.char_count : json.data.content.length,
        fileId: String(json.data.file_id ?? params.fileId.trim()),
        exportMimeType: String(json.data.export_mime_type ?? exportMimeType),
      };
    }
    const msg =
      (typeof json.error === 'string' && json.error.trim()) ||
      (res.status === 400 ? '요청이 올바르지 않습니다.' : 'Drive 텍스트 추출에 실패했습니다.');
    return {
      ok: false,
      errorMessage: msg,
      statusCode: typeof json.status_code === 'number' ? json.status_code : res.status,
    };
  } catch (e) {
    return {
      ok: false,
      errorMessage: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Drive에 올라간 PDF 바이너리를 `alt=media`로 받아 서버에서 텍스트를 추출합니다.
 */
export async function fetchGoogleDrivePdfText(params: {
  accessToken: string;
  fileId: string;
  /** `.pdf` 로 끝나야 함 */
  filenameHint?: string;
}): Promise<GoogleDrivePdfTextResult> {
  const filenameHint = (params.filenameHint || 'document.pdf').trim();
  try {
    const res = await fetch(
      joinApiHealthCheckUrl(API_BASE_URL, AUTH_GOOGLE_DRIVE_FETCH_PDF_TEXT_PATH),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_token: params.accessToken.trim(),
          file_id: params.fileId.trim(),
          filename_hint: filenameHint,
        }),
      },
    );
    const json = (await res.json()) as FetchPdfApiBody;
    if (res.ok && json.success && json.data && typeof json.data.content === 'string') {
      return {
        ok: true,
        content: json.data.content,
        charCount: typeof json.data.char_count === 'number' ? json.data.char_count : json.data.content.length,
        fileId: String(json.data.file_id ?? params.fileId.trim()),
        title:
          typeof json.data.title === 'string' && json.data.title.trim()
            ? json.data.title.trim()
            : filenameHint.replace(/\.pdf$/i, '').trim() || 'PDF',
      };
    }
    const msg =
      (typeof json.error === 'string' && json.error.trim()) ||
      (res.status === 400 ? '요청이 올바르지 않습니다.' : 'Drive PDF 추출에 실패했습니다.');
    return {
      ok: false,
      errorMessage: msg,
      statusCode: typeof json.status_code === 'number' ? json.status_code : res.status,
    };
  } catch (e) {
    return {
      ok: false,
      errorMessage: e instanceof Error ? e.message : String(e),
    };
  }
}

function formatDriveListFolderError(res: Response, json: ListFolderApiBody): string {
  const d = json.detail;
  if (typeof d === 'string' && d.trim()) return d.trim();
  if (Array.isArray(d) && d.length > 0 && typeof d[0] === 'object' && d[0] !== null && 'msg' in d[0]) {
    const m = (d[0] as { msg?: string }).msg;
    if (typeof m === 'string' && m.trim()) return m.trim();
  }
  if (typeof json.error === 'string' && json.error.trim()) return json.error.trim();
  return res.status === 400 ? '요청이 올바르지 않습니다.' : 'Drive 폴더 목록을 가져오지 못했습니다.';
}

/**
 * 폴더 **직계** 자식 중 노트북으로 가져올 수 있는 파일 ID만 반환합니다(문서·슬라이드·시트·PDF).
 */
export async function listGoogleDriveImportableInFolder(params: {
  accessToken: string;
  folderId: string;
  /** 1=직계만, 2 이상=하위 폴더 BFS(백엔드 `max_folder_depth`) */
  maxFolderDepth?: number;
}): Promise<GoogleDriveFolderListResult> {
  const depth =
    typeof params.maxFolderDepth === 'number' && Number.isFinite(params.maxFolderDepth)
      ? Math.min(8, Math.max(1, Math.floor(params.maxFolderDepth)))
      : 1;
  try {
    const res = await fetch(
      joinApiHealthCheckUrl(API_BASE_URL, AUTH_GOOGLE_DRIVE_LIST_IMPORTABLE_IN_FOLDER_PATH),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_token: params.accessToken.trim(),
          folder_id: params.folderId.trim(),
          max_folder_depth: depth,
        }),
      },
    );
    const json = (await res.json().catch(() => ({}))) as ListFolderApiBody;
    if (res.ok && json.success && json.data && Array.isArray(json.data.file_ids)) {
      const fileIds = json.data.file_ids
        .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
        .map((x) => x.trim());
      const truncated = Boolean(json.data.truncated);
      return { ok: true, fileIds, truncated };
    }
    return {
      ok: false,
      errorMessage: formatDriveListFolderError(res, json),
      statusCode: typeof json.status_code === 'number' ? json.status_code : res.status,
    };
  } catch (e) {
    return {
      ok: false,
      errorMessage: e instanceof Error ? e.message : String(e),
    };
  }
}
