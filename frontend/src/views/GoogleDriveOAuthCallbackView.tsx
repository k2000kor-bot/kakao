/**
 * Google OAuth 리디렉트 전용(팝업). code → 백엔드 교환 후 `postMessage` 로 부모에 토큰 전달.
 */
import React, { useEffect, useState } from 'react';
import { exchangeGoogleDriveOAuthCode } from '../services/googleDriveService';
import {
  CORBU_GOOGLE_DRIVE_OAUTH_MESSAGE_TYPE,
  getGoogleDriveOAuthRedirectUri,
  GOOGLE_DRIVE_OAUTH_STATE_STORAGE_KEY,
} from '../utils/googleDriveOAuth';

const GoogleDriveOAuthCallbackView: React.FC = () => {
  const [message, setMessage] = useState('Google Drive 연동 처리 중…');

  useEffect(() => {
    let cancelled = false;

    const notifyOpener = (payload: { access_token?: string; error?: string }) => {
      if (!window.opener) return;
      window.opener.postMessage(
        { type: CORBU_GOOGLE_DRIVE_OAUTH_MESSAGE_TYPE, ...payload },
        window.location.origin,
      );
    };

    const finish = () => {
      try {
        window.close();
      } catch {
        /* ignore */
      }
    };

    void (async () => {
      if (!window.opener) {
        setMessage('이 창은 Google 로그인 팝업으로만 사용됩니다. 브라우저에서 이 탭을 닫고, 앱에서 「Google로 액세스 토큰 받기」를 다시 눌러 주세요.');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get('error');
      const oauthDesc = params.get('error_description');
      if (oauthError) {
        const detail = oauthError === 'access_denied' ? 'access_denied' : oauthDesc?.trim() || oauthError;
        notifyOpener({ error: detail });
        setMessage('로그인이 완료되지 않았습니다. 이 창을 닫아 주세요.');
        finish();
        return;
      }

      const code = params.get('code')?.trim();
      const state = params.get('state')?.trim();
      let expected: string | null = null;
      try {
        expected = sessionStorage.getItem(GOOGLE_DRIVE_OAUTH_STATE_STORAGE_KEY);
        sessionStorage.removeItem(GOOGLE_DRIVE_OAUTH_STATE_STORAGE_KEY);
      } catch {
        expected = null;
      }

      if (!code || !state || !expected || state !== expected) {
        notifyOpener({ error: 'invalid_state' });
        setMessage('요청이 만료되었거나 잘못되었습니다. 이 창을 닫고 다시 시도해 주세요.');
        finish();
        return;
      }

      const redirectUri = getGoogleDriveOAuthRedirectUri();
      const result = await exchangeGoogleDriveOAuthCode({ code, redirectUri });
      if (cancelled) return;

      if (result.ok) {
        notifyOpener({ access_token: result.accessToken });
        setMessage('완료되었습니다. 이 창은 자동으로 닫힙니다.');
      } else {
        const reason = result.errorMessage.trim() || '알 수 없는 오류';
        notifyOpener({ error: reason });
        const short = reason.length > 200 ? `${reason.slice(0, 197)}…` : reason;
        setMessage(`토큰 교환에 실패했습니다: ${short} — 이 창을 닫고 연동·리디렉트 URI·백엔드 로그를 확인해 주세요.`);
      }
      finish();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', fontSize: 14, lineHeight: 1.5, color: '#1f2937' }}>
      {message}
    </div>
  );
};

export default GoogleDriveOAuthCallbackView;
