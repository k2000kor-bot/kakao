/**
 * Google Drive용 OAuth 2.0 authorization code 플로우(팝업).
 *
 * 빌드 시 **`REACT_APP_GOOGLE_OAUTH_CLIENT_ID`** 가 있어야 하며, Google Cloud Console의
 * OAuth 클라이언트 **승인된 리디렉션 URI**에 **`{origin}/oauth/google/drive/callback`** 을 등록해야 합니다.
 * 백엔드 **`GOOGLE_CLIENT_ID`·`GOOGLE_CLIENT_SECRET`** 은 동일 클라이언트와 맞춥니다.
 */
import { GOOGLE_DRIVE_OAUTH_CALLBACK_PATH } from '../config/routes';

export const CORBU_GOOGLE_DRIVE_OAUTH_MESSAGE_TYPE = 'corbu-google-drive-oauth-token' as const;

export const GOOGLE_DRIVE_OAUTH_STATE_STORAGE_KEY = 'corbu_gdrive_oauth_state';

export function isGoogleDriveOAuthClientConfigured(): boolean {
  return Boolean(typeof process !== 'undefined' && process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID?.trim());
}

export function getGoogleDriveOAuthRedirectUri(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${GOOGLE_DRIVE_OAUTH_CALLBACK_PATH}`;
}

function generateState(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function buildGoogleDriveOAuthAuthorizeUrl(state: string): string | null {
  const clientId = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID?.trim();
  if (!clientId || typeof window === 'undefined') return null;
  const redirectUri = getGoogleDriveOAuthRedirectUri();
  const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.searchParams.set('client_id', clientId);
  u.searchParams.set('redirect_uri', redirectUri);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', 'https://www.googleapis.com/auth/drive.readonly');
  u.searchParams.set('state', state);
  u.searchParams.set('access_type', 'offline');
  u.searchParams.set('prompt', 'consent');
  return u.toString();
}

export interface BeginGoogleDriveOAuthPopupResult {
  url: string;
  state: string;
}

/** `sessionStorage` 에 state 를 저장한 뒤 인가 URL 을 만듭니다. */
export function beginGoogleDriveOAuthPopup(): BeginGoogleDriveOAuthPopupResult | null {
  if (!isGoogleDriveOAuthClientConfigured()) return null;
  const state = generateState();
  try {
    sessionStorage.setItem(GOOGLE_DRIVE_OAUTH_STATE_STORAGE_KEY, state);
  } catch {
    return null;
  }
  const url = buildGoogleDriveOAuthAuthorizeUrl(state);
  if (!url) return null;
  return { url, state };
}
