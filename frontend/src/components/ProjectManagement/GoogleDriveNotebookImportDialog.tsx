/**
 * Google Drive Workspace 파일을 OAuth 액세스 토큰으로 export 후 노트북 소스로 추가합니다.
 * OAuth 팝업(`REACT_APP_GOOGLE_OAUTH_CLIENT_ID`) 또는 수동 토큰 입력을 지원합니다.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { coerceTrimmedString } from '../../utils/chatInputUtils';
import { projectService } from '../../services/projectService';
import { listGoogleDriveImportableInFolder, type GoogleDriveExportMime } from '../../services/googleDriveService';
import { INTEGRATIONS_PATH } from '../../config/routes';
import { useNavigate } from 'react-router-dom';
import {
  isGoogleDrivePickerConfigured,
  openGoogleDriveFilePicker,
  type GoogleDrivePickedItem,
} from '../../utils/googleDrivePicker';
import {
  beginGoogleDriveOAuthPopup,
  CORBU_GOOGLE_DRIVE_OAUTH_MESSAGE_TYPE,
  isGoogleDriveOAuthClientConfigured,
} from '../../utils/googleDriveOAuth';

export interface GoogleDriveNotebookImportDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  /** 소스 추가 성공 시 (부모에서 노트북 목록 갱신·토스트) */
  onSuccess?: () => void;
}

const MIME_OPTIONS: { value: GoogleDriveExportMime; label: string }[] = [
  { value: 'text/plain', label: 'Google 문서·슬라이드 (text/plain)' },
  { value: 'text/csv', label: '스프레드시트 (text/csv)' },
  { value: 'text/tab-separated-values', label: '스프레드시트 (TSV)' },
];

type DriveImportKind = 'workspace' | 'pdf';

const GOOGLE_DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';
const GOOGLE_APPS_DOCUMENT_MIME = 'application/vnd.google-apps.document';
const GOOGLE_APPS_SPREADSHEET_MIME = 'application/vnd.google-apps.spreadsheet';
const GOOGLE_APPS_PRESENTATION_MIME = 'application/vnd.google-apps.presentation';
const GOOGLE_DRIVE_PDF_MIME = 'application/pdf';

/**
 * Picker가 MIME을 넘겨 준 경우에만: 폴더 선택이 없을 때 가져오기 유형·export MIME을 맞춥니다.
 * (폴더 확장 후에는 ID만 있어 MIME을 알 수 없으므로 적용하지 않습니다.)
 */
function applyPickerDerivedImportOptions(
  picked: GoogleDrivePickedItem[],
  folderPickCount: number,
  setExportMime: React.Dispatch<React.SetStateAction<GoogleDriveExportMime>>,
  setImportKind: React.Dispatch<React.SetStateAction<DriveImportKind>>,
): void {
  if (folderPickCount > 0) return;
  const files = picked.filter((it) => it.mimeType !== GOOGLE_DRIVE_FOLDER_MIME);
  if (files.length === 0) return;
  if (!files.every((f) => typeof f.mimeType === 'string' && f.mimeType.length > 0)) return;

  const mimes = files.map((f) => f.mimeType as string);
  if (mimes.every((m) => m === GOOGLE_DRIVE_PDF_MIME)) {
    setImportKind('pdf');
    return;
  }

  const kindSet = new Set(
    mimes.map((m) => {
      if (m === GOOGLE_APPS_SPREADSHEET_MIME) return 'sheet';
      if (m === GOOGLE_APPS_DOCUMENT_MIME || m === GOOGLE_APPS_PRESENTATION_MIME) return 'docslide';
      return 'other';
    }),
  );
  if (kindSet.has('other')) return;
  if (kindSet.size !== 1) return;

  setImportKind('workspace');
  const only = [...kindSet][0];
  if (only === 'sheet') setExportMime('text/csv');
  else setExportMime('text/plain');
}

const GoogleDriveNotebookImportDialog: React.FC<GoogleDriveNotebookImportDialogProps> = ({
  open,
  onClose,
  projectId,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [importKind, setImportKind] = useState<DriveImportKind>('workspace');
  const [fileId, setFileId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [title, setTitle] = useState('Google Drive');
  const [exportMime, setExportMime] = useState<GoogleDriveExportMime>('text/plain');
  const [pdfFilenameHint, setPdfFilenameHint] = useState('document.pdf');
  const [submitting, setSubmitting] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);
  /** 수동「폴더 내부 파일 나열」API 호출 중 */
  const [folderExpandBusy, setFolderExpandBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  /** Picker에서 2개 이상 선택 시 일괄 가져오기용(순서 유지) */
  const [pickerBatchIds, setPickerBatchIds] = useState<string[]>([]);
  /** 일괄 가져오기 진행 중일 때만 설정(단건 제출에는 사용하지 않음) */
  const [batchImportProgress, setBatchImportProgress] = useState<{ current: number; total: number } | null>(null);
  /** 일괄 소스 제목의 번호 시작값(0부터). 중간 실패 후 이어 붙일 때 실패 인덱스로 맞춤 */
  const [batchTitleStartIndex, setBatchTitleStartIndex] = useState(0);
  /** 폴더 확장 API가 상한으로 잘렸는지(최대 500개) */
  const [folderListTruncated, setFolderListTruncated] = useState(false);
  /** 폴더 나열 시 `list-importable-in-folder` 의 `max_folder_depth`(1=직계만). Picker·수동 나열 공통 */
  const [folderScanDepth, setFolderScanDepth] = useState(1);
  const prevOpenRef = useRef(false);
  /** 일괄 루프에서 다음 항목으로 넘어가기 전에 확인(비동기 호출 중에는 완료까지 대기) */
  const batchImportCancelRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setPickerBatchIds([]);
      setBatchImportProgress(null);
      setBatchTitleStartIndex(0);
      setFolderListTruncated(false);
      setFolderScanDepth(1);
      setFolderExpandBusy(false);
      batchImportCancelRef.current = false;
    }
    prevOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onMsg = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      const d = ev.data;
      if (!d || typeof d !== 'object' || (d as { type?: string }).type !== CORBU_GOOGLE_DRIVE_OAUTH_MESSAGE_TYPE) {
        return;
      }
      const token = typeof (d as { access_token?: string }).access_token === 'string' ? (d as { access_token: string }).access_token.trim() : '';
      const err = typeof (d as { error?: string }).error === 'string' ? (d as { error: string }).error.trim() : '';
      if (token) {
        setAccessToken(token);
        setFormError(null);
      } else if (err) {
        setFormError(
          err === 'access_denied' || err === 'OAuth 오류: access_denied'
            ? 'Google 로그인이 취소되었습니다.'
            : err === 'invalid_state'
              ? '로그인 세션이 맞지 않습니다. 다시 시도해 주세요.'
              : `OAuth: ${err}`,
        );
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [open]);

  const dedupeDriveFileIds = useCallback((ids: string[]) => {
    const seen = new Set<string>();
    return ids
      .map((x) => coerceTrimmedString(x, ''))
      .filter((t) => {
        if (!t || seen.has(t)) return false;
        seen.add(t);
        return true;
      });
  }, []);

  const applyDriveListingResult = useCallback(
    (rawIds: string[], truncatedAny: boolean, emptyMessage: string) => {
      const unique = dedupeDriveFileIds(rawIds);
      if (unique.length === 0) {
        setFormError(emptyMessage);
        setFileId('');
        setPickerBatchIds([]);
        setBatchTitleStartIndex(0);
        return;
      }
      setFolderListTruncated(truncatedAny);
      setFileId(unique[0] ?? '');
      setPickerBatchIds(unique.length > 1 ? [...unique] : []);
      setBatchTitleStartIndex(0);
      setFormError(null);
    },
    [dedupeDriveFileIds],
  );

  const handleExpandFolderFromIdField = useCallback(async () => {
    const fid = coerceTrimmedString(fileId, '');
    const tok = coerceTrimmedString(accessToken, '');
    if (!fid || !tok) {
      setFormError('파일 ID(폴더)·액세스 토큰을 모두 입력한 뒤 나열해 주세요. 토큰은 아래 입력란에 있습니다.');
      return;
    }
    setFormError(null);
    setFolderExpandBusy(true);
    try {
      const listed = await listGoogleDriveImportableInFolder({
        accessToken: tok,
        folderId: fid,
        maxFolderDepth: folderScanDepth,
      });
      if (!listed.ok) {
        setFormError(listed.errorMessage);
        return;
      }
      applyDriveListingResult(
        listed.fileIds,
        listed.truncated,
        '폴더 안에 가져올 수 있는 문서·슬라이드·시트·PDF가 없거나, 입력한 ID가 폴더가 아닐 수 있습니다.',
      );
    } finally {
      setFolderExpandBusy(false);
    }
  }, [fileId, accessToken, folderScanDepth, applyDriveListingResult]);

  const handleSubmit = useCallback(async () => {
    const fid = coerceTrimmedString(fileId, '');
    const tok = coerceTrimmedString(accessToken, '');
    const ttl = coerceTrimmedString(title, '') || 'Google Drive';
    if (!fid || !tok) {
      setFormError('파일 ID와 액세스 토큰을 입력해 주세요.');
      return;
    }
    if (importKind === 'pdf') {
      const hint = coerceTrimmedString(pdfFilenameHint, '') || 'document.pdf';
      if (!hint.toLowerCase().endsWith('.pdf')) {
        setFormError('PDF 가져오기는 파일 이름 힌트가 .pdf 로 끝나야 합니다.');
        return;
      }
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const result =
        importKind === 'pdf'
          ? await projectService.addNotebookSourceFromGoogleDrivePdf(projectId, {
              accessToken: tok,
              fileId: fid,
              title: ttl,
              filenameHint: coerceTrimmedString(pdfFilenameHint, '') || 'document.pdf',
            })
          : await projectService.addNotebookSourceFromGoogleDriveExport(projectId, {
              accessToken: tok,
              fileId: fid,
              title: ttl,
              exportMimeType: exportMime,
            });
      if (!result) {
        setFormError('가져오기에 실패했습니다. 토큰·파일 ID·Drive API 스코프를 확인해 주세요.');
        return;
      }
      onSuccess?.();
      onClose();
      setFileId('');
      setAccessToken('');
      setTitle('Google Drive');
      setExportMime('text/plain');
      setPdfFilenameHint('document.pdf');
      setImportKind('workspace');
      setPickerBatchIds([]);
      setBatchTitleStartIndex(0);
    } finally {
      setSubmitting(false);
    }
  }, [projectId, fileId, accessToken, title, exportMime, importKind, pdfFilenameHint, onSuccess, onClose]);

  const handleBatchImport = useCallback(async () => {
    const ids = pickerBatchIds;
    const tok = coerceTrimmedString(accessToken, '');
    const ttl = coerceTrimmedString(title, '') || 'Google Drive';
    const validIds = ids.map((id) => id.trim()).filter((id) => id.length > 0);
    if (validIds.length < 1 || !tok) {
      setFormError('일괄 가져오기는 유효한 파일 ID와 액세스 토큰이 필요합니다.');
      return;
    }
    if (importKind === 'pdf') {
      const hint = coerceTrimmedString(pdfFilenameHint, '') || 'document.pdf';
      if (!hint.toLowerCase().endsWith('.pdf')) {
        setFormError('PDF 가져오기는 파일 이름 힌트가 .pdf 로 끝나야 합니다.');
        return;
      }
    }
    setFormError(null);
    setSubmitting(true);
    setBatchImportProgress(null);
    batchImportCancelRef.current = false;
    let succeeded = 0;
    try {
      const hint = coerceTrimmedString(pdfFilenameHint, '') || 'document.pdf';
      const n = validIds.length;
      for (let i = 0; i < n; i += 1) {
        if (batchImportCancelRef.current) {
          setFormError(
            succeeded > 0
              ? `일괄 가져오기를 중단했습니다. ${succeeded}개까지 노트북에 반영되었습니다.`
              : '일괄 가져오기를 중단했습니다.',
          );
          if (succeeded > 0) onSuccess?.();
          setPickerBatchIds([]);
          setBatchTitleStartIndex(0);
          setFileId('');
          return;
        }
        const fid = validIds[i];
        setBatchImportProgress({ current: i + 1, total: n });
        const titleOrdinal = batchTitleStartIndex + i + 1;
        const pieceTitle = batchTitleStartIndex + n > 1 ? `${ttl} (${titleOrdinal})` : ttl;
        const result =
          importKind === 'pdf'
            ? await projectService.addNotebookSourceFromGoogleDrivePdf(projectId, {
                accessToken: tok,
                fileId: fid,
                title: pieceTitle,
                filenameHint: hint,
              })
            : await projectService.addNotebookSourceFromGoogleDriveExport(projectId, {
                accessToken: tok,
                fileId: fid,
                title: pieceTitle,
                exportMimeType: exportMime,
              });
        if (!result) {
          const idHint = fid.length > 14 ? `${fid.slice(0, 12)}…` : fid;
          const remaining = validIds.slice(i);
          setPickerBatchIds(remaining);
          setFileId(validIds[i] ?? '');
          setBatchTitleStartIndex((prev) => prev + i);
          const retryHint =
            remaining.length >= 2
              ? ` 남은 ${remaining.length}개는「선택한 ${remaining.length}개 일괄 가져오기」를 다시 눌러 이어서 시도할 수 있습니다.`
              : ' 남은 1개는「노트북에 추가」로 가져올 수 있습니다.';
          setFormError(
            succeeded > 0
              ? `${succeeded}개까지 추가했습니다. ${i + 1}/${n}번째(ID ${idHint})에서 실패했습니다. 토큰·파일 형식·스코프를 확인해 주세요.${retryHint}`
              : `일괄 가져오기: ${i + 1}/${n}번째(ID ${idHint})에서 실패했습니다. 토큰·파일 ID·스코프를 확인해 주세요.${retryHint}`,
          );
          if (succeeded > 0) onSuccess?.();
          return;
        }
        succeeded += 1;
        if (batchImportCancelRef.current) {
          setFormError(
            succeeded > 0
              ? `일괄 가져오기를 중단했습니다. ${succeeded}개까지 노트북에 반영되었습니다.`
              : '일괄 가져오기를 중단했습니다.',
          );
          if (succeeded > 0) onSuccess?.();
          setPickerBatchIds([]);
          setBatchTitleStartIndex(0);
          setFileId('');
          return;
        }
      }
      onSuccess?.();
      onClose();
      setFileId('');
      setAccessToken('');
      setTitle('Google Drive');
      setExportMime('text/plain');
      setPdfFilenameHint('document.pdf');
      setImportKind('workspace');
      setPickerBatchIds([]);
      setBatchTitleStartIndex(0);
    } finally {
      batchImportCancelRef.current = false;
      setBatchImportProgress(null);
      setSubmitting(false);
    }
  }, [
    pickerBatchIds,
    batchTitleStartIndex,
    accessToken,
    title,
    importKind,
    pdfFilenameHint,
    exportMime,
    projectId,
    onSuccess,
    onClose,
  ]);

  const requestBatchImportCancel = useCallback(() => {
    batchImportCancelRef.current = true;
  }, []);

  if (!open) return null;

  return (
    <div
      className="bw-std-popup-overlay"
      onClick={() => !submitting && onClose()}
      role="presentation"
      data-testid="google-drive-notebook-import-overlay"
    >
      <div
        className="bw-std-popup-panel"
        style={{ maxWidth: 440, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gd-import-title"
        data-testid="google-drive-notebook-import-dialog"
      >
        <div className="bw-std-popup-panel-header">
          <h2 id="gd-import-title" style={{ margin: 0, fontSize: 18 }}>
            Google Drive에서 소스 추가
          </h2>
        </div>
        <div className="bw-std-popup-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Drive <strong>파일 ID</strong>와 읽기 스코프가 포함된 <strong>액세스 토큰</strong>이 필요합니다. 문서·슬라이드·시트는
            export, 저장된 PDF는 다운로드 후 서버에서 텍스트를 뽑습니다. Picker로 <strong>폴더</strong>를 고르거나, 폴더 ID를 직접
            넣고 <strong>폴더 내부 파일 나열</strong>을 누르면 아래 <strong>폴더 탐색 깊이</strong>만큼 하위 폴더를 더 내려가며 가져올
            파일을 모읍니다(깊이 1=직계만, 한 번에 최대 500개). 연동 설정은{' '}
            <button
              type="button"
              style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--link-color, #2563eb)', textDecoration: 'underline' }}
              onClick={() => {
                onClose();
                navigate(INTEGRATIONS_PATH);
              }}
            >
              연동
            </button>
            화면에서 확인할 수 있습니다.
          </p>
          {isGoogleDriveOAuthClientConfigured() ? (
            <button
              type="button"
              className="bw-btn-secondary"
              style={{ alignSelf: 'flex-start', fontSize: 13 }}
              disabled={submitting || oauthBusy}
              data-testid="google-drive-oauth-popup-btn"
              onClick={() => {
                setFormError(null);
                setOauthBusy(true);
                try {
                  const begun = beginGoogleDriveOAuthPopup();
                  if (!begun) {
                    setFormError('OAuth 준비에 실패했습니다. 브라우저 저장소·환경 변수를 확인해 주세요.');
                    return;
                  }
                  const w = window.open(begun.url, 'corbu_gdrive_oauth', 'width=520,height=720');
                  if (!w) {
                    setFormError('팝업이 차단되었습니다. 이 사이트의 팝업을 허용한 뒤 다시 눌러 주세요.');
                  }
                } finally {
                  setOauthBusy(false);
                }
              }}
            >
              {oauthBusy ? '연결 준비 중…' : 'Google로 액세스 토큰 받기 (팝업)'}
            </button>
          ) : (
            <p className="bw-detail-note" style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>
              팝업 로그인을 쓰려면 빌드 시 <code>REACT_APP_GOOGLE_OAUTH_CLIENT_ID</code> 를 넣고, Google Cloud Console
              승인된 리디렉션 URI에 <code>{typeof window !== 'undefined' ? window.location.origin : ''}/oauth/google/drive/callback</code>{' '}
              를 등록하세요(백엔드 <code>GOOGLE_CLIENT_ID</code> 와 동일 클라이언트).
            </p>
          )}
          <fieldset style={{ margin: 0, padding: 0, border: 'none' }}>
            <legend className="bw-label-block" style={{ marginBottom: 6 }}>
              가져오기 유형
            </legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="radio"
                  name="gd-import-kind"
                  checked={importKind === 'workspace'}
                  onChange={() => {
                    setImportKind('workspace');
                    setPickerBatchIds([]);
                    setBatchTitleStartIndex(0);
                  }}
                  disabled={submitting}
                />
                Google 문서·스프레드시트 (export)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="radio"
                  name="gd-import-kind"
                  checked={importKind === 'pdf'}
                  onChange={() => {
                    setImportKind('pdf');
                    setPickerBatchIds([]);
                    setBatchTitleStartIndex(0);
                  }}
                  disabled={submitting}
                />
                PDF 파일 (Drive에 저장된 PDF)
              </label>
            </div>
          </fieldset>
          <label className="bw-label-block" htmlFor="gd-import-title-input">
            소스 제목
          </label>
          <input
            id="gd-import-title-input"
            className="bw-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
            disabled={submitting}
          />
          <label className="bw-label-block" htmlFor="gd-import-file-id">
            파일 ID
          </label>
          <input
            id="gd-import-file-id"
            className="bw-input"
            type="text"
            value={fileId}
            onChange={(e) => {
              setFileId(e.target.value);
              setPickerBatchIds([]);
              setBatchTitleStartIndex(0);
            }}
            placeholder="예: 1abc…xyz (폴더 ID는 나열 후 일괄 가져오기)"
            autoComplete="off"
            disabled={submitting || folderExpandBusy}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="bw-label-block" htmlFor="gd-folder-scan-depth" style={{ marginBottom: 0 }}>
              폴더 탐색 깊이 (폴더 나열 시)
            </label>
            <select
              id="gd-folder-scan-depth"
              className="bw-input"
              data-testid="google-drive-folder-scan-depth"
              value={folderScanDepth}
              onChange={(e) => setFolderScanDepth(Number.parseInt(e.target.value, 10) || 1)}
              disabled={submitting || pickerBusy || folderExpandBusy}
            >
              <option value={1}>1 — 선택 폴더 바로 아래만</option>
              <option value={2}>2 — 한 단계 하위 폴더까지</option>
              <option value={3}>3 — 두 단계 하위까지</option>
              <option value={4}>4 — 세 단계 하위까지</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
            <button
              type="button"
              className="bw-btn-secondary"
              style={{ fontSize: 13 }}
              disabled={submitting || pickerBusy || folderExpandBusy}
              data-testid="google-drive-expand-folder-from-id-btn"
              onClick={() => void handleExpandFolderFromIdField()}
            >
              {folderExpandBusy ? '폴더 나열 중…' : '폴더 내부 파일 나열'}
            </button>
            <p className="bw-detail-note" style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>
              위 칸에 <strong>폴더</strong> ID를 넣고, 아래 <strong>액세스 토큰</strong>까지 입력한 뒤 누르면 가져올 파일 ID 목록이
              채워집니다.
            </p>
          </div>
          {isGoogleDrivePickerConfigured() ? (
            <button
              type="button"
              className="bw-btn-secondary"
              style={{ alignSelf: 'flex-start', fontSize: 13 }}
              disabled={submitting || pickerBusy || folderExpandBusy}
              data-testid="google-drive-open-picker-btn"
              onClick={async () => {
                setFormError(null);
                setPickerBusy(true);
                try {
                  await openGoogleDriveFilePicker(
                    accessToken,
                    async (picked: GoogleDrivePickedItem[]) => {
                      const tokInner = coerceTrimmedString(accessToken, '');
                      if (!tokInner) {
                        setFormError('Picker 결과를 적용하려면 액세스 토큰이 필요합니다.');
                        return;
                      }
                      setFolderListTruncated(false);
                      const fileLike: string[] = [];
                      const folderIds: string[] = [];
                      for (const it of picked) {
                        if (it.mimeType === GOOGLE_DRIVE_FOLDER_MIME) {
                          folderIds.push(it.id);
                        } else {
                          fileLike.push(it.id);
                        }
                      }
                      const merged: string[] = [...fileLike];
                      let truncatedAny = false;
                      for (const folderFid of folderIds) {
                        const listed = await listGoogleDriveImportableInFolder({
                          accessToken: tokInner,
                          folderId: folderFid,
                          maxFolderDepth: folderScanDepth,
                        });
                        if (!listed.ok) {
                          setFormError(listed.errorMessage);
                          setFileId('');
                          setPickerBatchIds([]);
                          setBatchTitleStartIndex(0);
                          return;
                        }
                        merged.push(...listed.fileIds);
                        if (listed.truncated) truncatedAny = true;
                      }
                      applyPickerDerivedImportOptions(picked, folderIds.length, setExportMime, setImportKind);
                      applyDriveListingResult(
                        merged,
                        truncatedAny,
                        folderIds.length > 0
                          ? '선택한 폴더에 가져올 수 있는 문서·슬라이드·시트·PDF가 없습니다.'
                          : '선택한 항목에서 파일 ID를 확인하지 못했습니다.',
                      );
                    },
                    (msg) => setFormError(msg),
                  );
                } finally {
                  setPickerBusy(false);
                }
              }}
            >
              {pickerBusy ? 'Picker 준비 중…' : 'Picker로 파일·폴더 선택'}
            </button>
          ) : (
            <p className="bw-detail-note" style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>
              Google Picker로 고르려면 빌드 시 <code>REACT_APP_GOOGLE_API_KEY</code> 를 설정하면 &quot;Picker로 파일·폴더
              선택&quot; 버튼이 나타납니다.
            </p>
          )}
          {pickerBatchIds.length > 1 ? (
            <p
              className="bw-detail-note"
              style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}
              data-testid="google-drive-picker-batch-hint"
            >
              {batchTitleStartIndex > 0 ? (
                <>
                  이미 추가된 건은 <strong>{batchTitleStartIndex}건</strong>으로 보고, 아직 가져오지 않은{' '}
                  <strong>{pickerBatchIds.length}개</strong>를 이어서 처리합니다. 소스 제목 번호는{' '}
                  <strong>({batchTitleStartIndex + 1})</strong>부터 붙습니다.
                </>
              ) : (
                <>
                  준비된 <strong>{pickerBatchIds.length}개</strong>의 파일 ID가 있습니다. 동일 토큰·가져오기 유형으로 모두
                  노트북에 넣으려면 아래 <strong>일괄 가져오기</strong>를 누르세요. 소스 제목은 &quot;제목 (1)&quot; 형식으로
                  붙습니다.
                </>
              )}{' '}
              {folderListTruncated ? (
                <>
                  <strong>참고:</strong> 폴더 안 파일이 많아 일부만(최대 500개) 포함했습니다. 나머지는 다른 폴더로
                  나누어 가져오세요.{' '}
                </>
              ) : null}
              PDF 일괄 시 파일 이름 힌트는 모든 항목에 동일하게 적용됩니다. 중간에 실패하면 남은 ID만 남고 같은
              버튼으로 재시도할 수 있습니다.
            </p>
          ) : null}
          <label className="bw-label-block" htmlFor="gd-import-token">
            액세스 토큰
          </label>
          <input
            id="gd-import-token"
            className="bw-input"
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="ya29…"
            autoComplete="off"
            disabled={submitting || folderExpandBusy}
          />
          {importKind === 'workspace' ? (
            <>
              <label className="bw-label-block" htmlFor="gd-import-mime">
                보내기 형식
              </label>
              <select
                id="gd-import-mime"
                className="bw-input"
                value={exportMime}
                onChange={(e) => setExportMime(e.target.value as GoogleDriveExportMime)}
                disabled={submitting}
              >
                {MIME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label className="bw-label-block" htmlFor="gd-import-pdf-name">
                PDF 파일 이름 힌트
              </label>
              <input
                id="gd-import-pdf-name"
                className="bw-input"
                type="text"
                value={pdfFilenameHint}
                onChange={(e) => setPdfFilenameHint(e.target.value)}
                placeholder="document.pdf"
                autoComplete="off"
                disabled={submitting}
              />
            </>
          )}
          {batchImportProgress ? (
            <p
              role="status"
              aria-live="polite"
              data-testid="google-drive-batch-progress"
              style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}
            >
              일괄 가져오기: {batchImportProgress.current}/{batchImportProgress.total} 처리 중…
            </p>
          ) : null}
          {formError ? (
            <p role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--error-color, #b91c1c)' }}>
              {formError}
            </p>
          ) : null}
        </div>
        <div
          className="bw-std-popup-actions"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}
        >
          <button type="button" className="bw-btn-secondary" onClick={onClose} disabled={submitting}>
            취소
          </button>
          {batchImportProgress && submitting ? (
            <button
              type="button"
              className="bw-btn-secondary"
              onClick={requestBatchImportCancel}
              data-testid="google-drive-batch-cancel-btn"
            >
              일괄 중단
            </button>
          ) : null}
          {pickerBatchIds.length > 1 ? (
            <button
              type="button"
              className="bw-btn-secondary"
              onClick={() => void handleBatchImport()}
              disabled={submitting || folderExpandBusy}
              data-testid="google-drive-batch-import-btn"
            >
              {submitting ? '일괄 가져오는 중…' : `선택한 ${pickerBatchIds.length}개 일괄 가져오기`}
            </button>
          ) : null}
          <button
            type="button"
            className="bw-btn-primary"
            onClick={() => void handleSubmit()}
            disabled={submitting || folderExpandBusy}
          >
            {submitting ? '가져오는 중…' : '노트북에 추가'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveNotebookImportDialog;
