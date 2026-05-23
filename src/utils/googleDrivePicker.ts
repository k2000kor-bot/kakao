/**
 * Google Drive Picker — `gapi` 동적 로드 후 파일 선택.
 *
 * 빌드 시 **`REACT_APP_GOOGLE_API_KEY`**(Google Cloud Console → API 키, Picker/Drive 사용 허용)가 있어야 합니다.
 * 사용자 Drive 목록을 보려면 **액세스 토큰**에 `https://www.googleapis.com/auth/drive.readonly` 등이 포함되어 있어야 합니다.
 */

function loadScriptOnce(src: string): Promise<void> {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`스크립트를 불러오지 못했습니다: ${src}`));
    document.head.appendChild(s);
  });
}

const GAPI_SCRIPT = 'https://apis.google.com/js/api.js';

let pickerApiPromise: Promise<void> | null = null;

/** Picker UI를 열 수 있는지(프론트 API 키 설정 여부). */
export function isGoogleDrivePickerConfigured(): boolean {
  return Boolean(typeof process !== 'undefined' && process.env.REACT_APP_GOOGLE_API_KEY?.trim());
}

/** `gapi` + `picker` 모듈 로드(멱등). */
export function loadGooglePickerApi(): Promise<void> {
  if (pickerApiPromise) return pickerApiPromise;
  pickerApiPromise = (async () => {
    type GapiLoad = (name: string, opts: { callback: () => void; onerror: () => void }) => void;
    const w = window as unknown as { gapi?: { load: GapiLoad } };
    if (!w.gapi?.load) {
      await loadScriptOnce(GAPI_SCRIPT);
    }
    const gapi = (window as unknown as { gapi: { load: GapiLoad } }).gapi;
    await new Promise<void>((resolve, reject) => {
      gapi.load('picker', {
        callback: () => resolve(),
        onerror: () => reject(new Error('Google Picker 모듈 로드에 실패했습니다.')),
      });
    });
  })();
  return pickerApiPromise;
}

type PickerCallbackData = Record<string, unknown>;

/** Picker에서 고른 항목(파일 또는 폴더). `mimeType` 이 없으면 폴더 확장을 하지 않습니다. */
export type GoogleDrivePickedItem = { id: string; mimeType?: string };

/**
 * Drive 파일 선택 대화상자를 엽니다.
 * `onPicked`에는 선택한 항목이 전달됩니다. **비동기** 함수를 넘기면 완료될 때까지 기다립니다.
 */
export async function openGoogleDriveFilePicker(
  oauthToken: string,
  onPicked: (items: GoogleDrivePickedItem[]) => void | Promise<void>,
  onError?: (message: string) => void,
): Promise<void> {
  const developerKey = process.env.REACT_APP_GOOGLE_API_KEY?.trim();
  if (!developerKey) {
    onError?.('REACT_APP_GOOGLE_API_KEY 가 .env 에 없습니다. Google Cloud Console에서 API 키를 만든 뒤 CRA 빌드에 주입하세요.');
    return;
  }
  const tok = oauthToken.trim();
  if (!tok) {
    onError?.('액세스 토큰을 먼저 입력한 뒤 Picker를 여세요.');
    return;
  }
  try {
    await loadGooglePickerApi();
  } catch (e) {
    onError?.(e instanceof Error ? e.message : String(e));
    return;
  }

  const google = (window as unknown as { google?: { picker?: GooglePickerNs } }).google;
  if (!google?.picker) {
    onError?.('window.google.picker 를 사용할 수 없습니다.');
    return;
  }

  const { picker: P } = google;

  let resolvePickFlow: ((value: void | PromiseLike<void>) => void) | null = null;
  const pickFlowDone = new Promise<void>((resolve) => {
    resolvePickFlow = resolve;
  });
  const finishPickFlow = () => {
    const r = resolvePickFlow;
    resolvePickFlow = null;
    r?.();
  };

  const callback = (data: PickerCallbackData) => {
    void (async () => {
      try {
        if (data[P.Response.ACTION] === P.Action.PICKED) {
          const docs = data[P.Response.DOCUMENTS] as Array<{ id?: string; mimeType?: string }> | undefined;
          const items: GoogleDrivePickedItem[] = (docs ?? [])
            .map((d) => ({
              id: typeof d?.id === 'string' ? d.id.trim() : '',
              mimeType: typeof d?.mimeType === 'string' ? d.mimeType.trim() : undefined,
            }))
            .filter((x) => x.id.length > 0);
          if (items.length > 0) {
            const ret = onPicked(items);
            if (ret != null && typeof (ret as Promise<void>).then === 'function') {
              try {
                await (ret as Promise<void>);
              } catch {
                onError?.('Picker 후 처리 중 오류가 발생했습니다.');
              }
            }
          }
        }
      } catch {
        onError?.('Picker 응답을 처리하지 못했습니다.');
      } finally {
        finishPickFlow();
      }
    })();
  };

  const view = new P.DocsView()
    .setIncludeFolders(true)
    .setMimeTypes(
      [
        'application/vnd.google-apps.folder',
        'application/vnd.google-apps.document',
        'application/vnd.google-apps.presentation',
        'application/vnd.google-apps.spreadsheet',
        'application/pdf',
      ].join(','),
    );

  let b: PickerBuilderChain = new P.PickerBuilder().addView(view).setOAuthToken(tok).setDeveloperKey(developerKey);
  const multi = P.Feature?.MULTISELECT_ENABLED;
  if (multi != null && typeof b.enableFeature === 'function') {
    b = b.enableFeature(multi);
  }
  const appId =
    process.env.REACT_APP_GOOGLE_PICKER_APP_ID?.trim() || process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID?.trim();
  if (appId && typeof b.setAppId === 'function') {
    b = b.setAppId(appId);
  }
  const built = b.setCallback(callback).build();
  built.setVisible(true);
  await pickFlowDone;
}

/** `window.google.picker` 최소 타입(외부 스크립트). */
interface DocsViewChain {
  setIncludeFolders: (b: boolean) => DocsViewChain;
  setMimeTypes: (m: string) => DocsViewChain;
}

interface PickerBuilderChain {
  addView: (v: unknown) => PickerBuilderChain;
  setOAuthToken: (t: string) => PickerBuilderChain;
  setDeveloperKey: (k: string) => PickerBuilderChain;
  enableFeature?: (feature: unknown) => PickerBuilderChain;
  /** Picker Quota / App ID — Google 문서에 따라 OAuth 클라이언트 ID 또는 프로젝트 번호. */
  setAppId?: (id: string) => PickerBuilderChain;
  setCallback: (cb: (d: PickerCallbackData) => void) => { build: () => { setVisible: (v: boolean) => void } };
}

interface GooglePickerNs {
  Response: { ACTION: string; DOCUMENTS: string };
  Action: { PICKED: string; CANCEL: string };
  /** `google.picker.Feature` — 다중 선택 등. */
  Feature?: { MULTISELECT_ENABLED?: unknown };
  PickerBuilder: new () => PickerBuilderChain;
  DocsView: new () => DocsViewChain;
}
