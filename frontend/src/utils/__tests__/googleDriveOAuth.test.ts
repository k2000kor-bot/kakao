/**
 * @jest-environment jsdom
 */
import {
  beginGoogleDriveOAuthPopup,
  buildGoogleDriveOAuthAuthorizeUrl,
  getGoogleDriveOAuthRedirectUri,
  GOOGLE_DRIVE_OAUTH_STATE_STORAGE_KEY,
  isGoogleDriveOAuthClientConfigured,
} from '../googleDriveOAuth';
import { GOOGLE_DRIVE_OAUTH_CALLBACK_PATH } from '../../config/routes';

describe('googleDriveOAuth', () => {
  const originalClient = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;

  afterEach(() => {
    if (originalClient === undefined) {
      delete process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;
    } else {
      process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID = originalClient;
    }
    sessionStorage.clear();
  });

  it('isGoogleDriveOAuthClientConfigured 는 클라이언트 ID 유무에 따름', () => {
    delete process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;
    expect(isGoogleDriveOAuthClientConfigured()).toBe(false);
    process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID = 'cid.apps.googleusercontent.com';
    expect(isGoogleDriveOAuthClientConfigured()).toBe(true);
  });

  it('getGoogleDriveOAuthRedirectUri 는 origin + 콜백 경로', () => {
    expect(getGoogleDriveOAuthRedirectUri()).toBe(`http://localhost${GOOGLE_DRIVE_OAUTH_CALLBACK_PATH}`);
  });

  it('buildGoogleDriveOAuthAuthorizeUrl 은 Google 호스트·state·scope 를 포함', () => {
    process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID = 'test-client.apps.googleusercontent.com';
    const url = buildGoogleDriveOAuthAuthorizeUrl('state-xyz');
    expect(url).toBeTruthy();
    expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    const u = new URL(url!);
    expect(u.searchParams.get('client_id')).toBe('test-client.apps.googleusercontent.com');
    expect(u.searchParams.get('state')).toBe('state-xyz');
    expect(u.searchParams.get('scope')).toContain('drive.readonly');
    expect(u.searchParams.get('redirect_uri')).toBe(`http://localhost${GOOGLE_DRIVE_OAUTH_CALLBACK_PATH}`);
  });

  it('beginGoogleDriveOAuthPopup 은 sessionStorage 에 state 저장', () => {
    process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID = 'id.apps.googleusercontent.com';
    const begun = beginGoogleDriveOAuthPopup();
    expect(begun).not.toBeNull();
    expect(begun?.url).toContain('accounts.google.com');
    expect(sessionStorage.getItem(GOOGLE_DRIVE_OAUTH_STATE_STORAGE_KEY)).toBeTruthy();
  });
});
