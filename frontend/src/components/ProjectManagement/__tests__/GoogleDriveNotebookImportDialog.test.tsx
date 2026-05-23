/**
 * @jest-environment jsdom
 */
import '../googleDriveNotebookImportDialogJestSetup';
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GoogleDriveNotebookImportDialog from '../GoogleDriveNotebookImportDialog';

const mockAddExport = jest.fn();
const mockAddPdf = jest.fn();

jest.mock('../../../services/projectService', () => ({
  projectService: {
    addNotebookSourceFromGoogleDriveExport: (...args: unknown[]) => mockAddExport(...args),
    addNotebookSourceFromGoogleDrivePdf: (...args: unknown[]) => mockAddPdf(...args),
  },
}));

jest.mock('../../../utils/googleDrivePicker', () => ({
  __esModule: true,
  ...jest.requireActual<typeof import('../../../utils/googleDrivePicker')>('../../../utils/googleDrivePicker'),
  openGoogleDriveFilePicker: jest.fn(),
}));

jest.mock('../../../services/googleDriveService', () => ({
  ...jest.requireActual('../../../services/googleDriveService'),
  listGoogleDriveImportableInFolder: jest.fn(),
}));

import { listGoogleDriveImportableInFolder } from '../../../services/googleDriveService';
import * as googleDrivePicker from '../../../utils/googleDrivePicker';
import { openGoogleDriveFilePicker } from '../../../utils/googleDrivePicker';

function renderDialog(
  props: Partial<React.ComponentProps<typeof GoogleDriveNotebookImportDialog>> = {},
) {
  const onClose = jest.fn();
  const onSuccess = jest.fn();
  render(
    <MemoryRouter>
      <GoogleDriveNotebookImportDialog
        open
        onClose={onClose}
        projectId="proj-1"
        onSuccess={onSuccess}
        {...props}
      />
    </MemoryRouter>,
  );
  return { onClose, onSuccess };
}

/** Picker 클릭 후 `pickerBusy` 해제까지 기다립니다. */
async function waitForPickerIdle() {
  await waitFor(() => {
    expect(screen.getByTestId('google-drive-open-picker-btn')).toHaveTextContent('Picker로 파일·폴더 선택');
  });
}

/** 일괄 힌트가 뜨는 Picker 경로: `findBy`가 `act`로 상태 반영을 기다려 콘솔 경고를 줄입니다. */
async function waitForBatchHintAfterPicker() {
  await screen.findByTestId('google-drive-picker-batch-hint');
  await waitForPickerIdle();
}

describe('GoogleDriveNotebookImportDialog', () => {
  let isPickerConfiguredSpy: jest.SpyInstance<boolean, []>;
  beforeEach(() => {
    isPickerConfiguredSpy = jest.spyOn(googleDrivePicker, 'isGoogleDrivePickerConfigured').mockReturnValue(true);
    mockAddExport.mockReset();
    mockAddPdf.mockReset();
    mockAddExport.mockResolvedValue(true);
    mockAddPdf.mockResolvedValue(true);
    jest.mocked(openGoogleDriveFilePicker).mockReset();
    jest.mocked(listGoogleDriveImportableInFolder).mockReset();
    jest.mocked(listGoogleDriveImportableInFolder).mockResolvedValue({ ok: true, fileIds: [], truncated: false });
    jest.mocked(openGoogleDriveFilePicker).mockImplementation(
      async (_tok: string, onPicked: (items: { id: string; mimeType?: string }[]) => void | Promise<void>) => {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 0);
        });
        await onPicked([
          { id: 'batch-a', mimeType: 'application/vnd.google-apps.document' },
          { id: 'batch-b', mimeType: 'application/vnd.google-apps.document' },
        ]);
      },
    );
  });

  afterEach(() => {
    isPickerConfiguredSpy.mockRestore();
  });

  it('open이 false이면 다이얼로그를 렌더하지 않음', () => {
    render(
      <MemoryRouter>
        <GoogleDriveNotebookImportDialog open={false} onClose={() => {}} projectId="p1" />
      </MemoryRouter>,
    );
    expect(screen.queryByTestId('google-drive-notebook-import-dialog')).not.toBeInTheDocument();
  });

  it('open이 true이면 제목과 다이얼로그가 보임', () => {
    render(
      <MemoryRouter>
        <GoogleDriveNotebookImportDialog open onClose={() => {}} projectId="p1" />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('google-drive-notebook-import-dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Google Drive에서 소스 추가' })).toBeInTheDocument();
  });

  it('파일 ID·토큰 없이 노트북에 추가 시 검증 오류', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: '노트북에 추가' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('파일 ID와 액세스 토큰');
    expect(mockAddExport).not.toHaveBeenCalled();
  });

  it('단건 export 성공 시 API 호출 후 닫고 onSuccess', async () => {
    const { onClose, onSuccess } = renderDialog();
    await userEvent.type(screen.getByLabelText('파일 ID'), 'file-one');
    await userEvent.type(screen.getByLabelText('액세스 토큰'), 'ya29.secret');
    await userEvent.click(screen.getByRole('button', { name: '노트북에 추가' }));
    await waitFor(() => expect(mockAddExport).toHaveBeenCalledTimes(1));
    expect(mockAddExport).toHaveBeenCalledWith('proj-1', {
      accessToken: 'ya29.secret',
      fileId: 'file-one',
      title: 'Google Drive',
      exportMimeType: 'text/plain',
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalled();
  });

  it('Picker로 2개 선택 후 일괄 가져오기 시 제목 번호·순서대로 export 호출', async () => {
    const { onClose, onSuccess } = renderDialog();
    await userEvent.type(screen.getByLabelText('액세스 토큰'), 'tok-batch');
    await userEvent.click(screen.getByTestId('google-drive-open-picker-btn'));
    await waitForBatchHintAfterPicker();
    await userEvent.click(screen.getByTestId('google-drive-batch-import-btn'));
    await waitFor(() => expect(mockAddExport).toHaveBeenCalledTimes(2));
    expect(mockAddExport).toHaveBeenNthCalledWith(1, 'proj-1', {
      accessToken: 'tok-batch',
      fileId: 'batch-a',
      title: 'Google Drive (1)',
      exportMimeType: 'text/plain',
    });
    expect(mockAddExport).toHaveBeenNthCalledWith(2, 'proj-1', {
      accessToken: 'tok-batch',
      fileId: 'batch-b',
      title: 'Google Drive (2)',
      exportMimeType: 'text/plain',
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('Picker에서 스프레드시트만 선택 시 보내기 형식이 text/csv로 맞춰지고 일괄 export에 반영된다', async () => {
    jest.mocked(openGoogleDriveFilePicker).mockImplementationOnce(
      async (_tok: string, onPicked: (items: { id: string; mimeType?: string }[]) => void | Promise<void>) => {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 0);
        });
        await onPicked([
          { id: 'sh1', mimeType: 'application/vnd.google-apps.spreadsheet' },
          { id: 'sh2', mimeType: 'application/vnd.google-apps.spreadsheet' },
        ]);
      },
    );
    const { onClose, onSuccess } = renderDialog();
    await userEvent.type(screen.getByLabelText('액세스 토큰'), 'tok-sheet');
    await userEvent.click(screen.getByTestId('google-drive-open-picker-btn'));
    await waitForBatchHintAfterPicker();
    const mimeSelect = screen.getByLabelText('보내기 형식') as HTMLSelectElement;
    expect(mimeSelect.value).toBe('text/csv');
    await userEvent.click(screen.getByTestId('google-drive-batch-import-btn'));
    await waitFor(() => expect(mockAddExport).toHaveBeenCalledTimes(2));
    expect(mockAddExport).toHaveBeenNthCalledWith(1, 'proj-1', {
      accessToken: 'tok-sheet',
      fileId: 'sh1',
      title: 'Google Drive (1)',
      exportMimeType: 'text/csv',
    });
    expect(mockAddPdf).not.toHaveBeenCalled();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('Picker에서 PDF만 선택 시 가져오기 유형이 PDF로 바뀌고 일괄 PDF 경로로 호출된다', async () => {
    jest.mocked(openGoogleDriveFilePicker).mockImplementationOnce(
      async (_tok: string, onPicked: (items: { id: string; mimeType?: string }[]) => void | Promise<void>) => {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 0);
        });
        await onPicked([
          { id: 'pdf-a', mimeType: 'application/pdf' },
          { id: 'pdf-b', mimeType: 'application/pdf' },
        ]);
      },
    );
    const { onClose, onSuccess } = renderDialog();
    await userEvent.type(screen.getByLabelText('액세스 토큰'), 'tok-pdf');
    await userEvent.click(screen.getByTestId('google-drive-open-picker-btn'));
    await waitForBatchHintAfterPicker();
    expect(screen.getByRole('radio', { name: /PDF 파일/ })).toBeChecked();
    expect(screen.queryByLabelText('보내기 형식')).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId('google-drive-batch-import-btn'));
    await waitFor(() => expect(mockAddPdf).toHaveBeenCalledTimes(2));
    expect(mockAddExport).not.toHaveBeenCalled();
    expect(mockAddPdf).toHaveBeenNthCalledWith(1, 'proj-1', {
      accessToken: 'tok-pdf',
      fileId: 'pdf-a',
      title: 'Google Drive (1)',
      filenameHint: 'document.pdf',
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('일괄 가져오기에서 첫 항목 실패 시 오류 안내·재호출 1회', async () => {
    mockAddExport.mockResolvedValueOnce(false);
    renderDialog();
    await userEvent.type(screen.getByLabelText('액세스 토큰'), 'tok-x');
    await userEvent.click(screen.getByTestId('google-drive-open-picker-btn'));
    await waitForBatchHintAfterPicker();
    await userEvent.click(screen.getByTestId('google-drive-batch-import-btn'));
    await waitFor(() => expect(mockAddExport).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('alert')).toHaveTextContent('1/2');
    expect(screen.getByRole('alert')).toHaveTextContent('일괄 가져오기');
  });

  it('파일 ID·토큰 입력 후「폴더 내부 파일 나열」시 목록 API 호출·일괄 힌트', async () => {
    jest.mocked(listGoogleDriveImportableInFolder).mockResolvedValueOnce({
      ok: true,
      fileIds: ['x1', 'x2'],
      truncated: false,
    });
    renderDialog();
    await userEvent.type(screen.getByLabelText('파일 ID'), 'my-folder-id');
    await userEvent.type(screen.getByLabelText('액세스 토큰'), 'tok-manual');
    await userEvent.click(screen.getByTestId('google-drive-expand-folder-from-id-btn'));
    await waitFor(() =>
      expect(listGoogleDriveImportableInFolder).toHaveBeenCalledWith({
        accessToken: 'tok-manual',
        folderId: 'my-folder-id',
        maxFolderDepth: 1,
      }),
    );
    expect(await screen.findByTestId('google-drive-picker-batch-hint')).toHaveTextContent('2개');
  });

  it('폴더 탐색 깊이 선택 후 폴더 Picker 시 maxFolderDepth 전달', async () => {
    jest.mocked(openGoogleDriveFilePicker).mockImplementationOnce(
      async (_tok: string, onPicked: (items: { id: string; mimeType?: string }[]) => void | Promise<void>) => {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 0);
        });
        await onPicked([{ id: 'folderZ', mimeType: 'application/vnd.google-apps.folder' }]);
      },
    );
    jest.mocked(listGoogleDriveImportableInFolder).mockResolvedValueOnce({
      ok: true,
      fileIds: ['d1'],
      truncated: false,
    });
    renderDialog();
    await userEvent.selectOptions(screen.getByTestId('google-drive-folder-scan-depth'), '3');
    await userEvent.type(screen.getByLabelText('액세스 토큰'), 'tok-depth');
    await userEvent.click(screen.getByTestId('google-drive-open-picker-btn'));
    await waitForPickerIdle();
    await waitFor(() =>
      expect(listGoogleDriveImportableInFolder).toHaveBeenCalledWith({
        accessToken: 'tok-depth',
        folderId: 'folderZ',
        maxFolderDepth: 3,
      }),
    );
  });

  it('Picker에서 폴더 선택 시 목록 API로 확장·일괄 힌트(잘림 안내)', async () => {
    jest.mocked(openGoogleDriveFilePicker).mockImplementationOnce(
      async (_tok: string, onPicked: (items: { id: string; mimeType?: string }[]) => void | Promise<void>) => {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 0);
        });
        await onPicked([{ id: 'folderZ', mimeType: 'application/vnd.google-apps.folder' }]);
      },
    );
    jest.mocked(listGoogleDriveImportableInFolder).mockResolvedValueOnce({
      ok: true,
      fileIds: ['doc1', 'doc2'],
      truncated: true,
    });
    renderDialog();
    await userEvent.type(screen.getByLabelText('액세스 토큰'), 'tok-folder');
    await userEvent.click(screen.getByTestId('google-drive-open-picker-btn'));
    await waitForBatchHintAfterPicker();
    await waitFor(() =>
      expect(listGoogleDriveImportableInFolder).toHaveBeenCalledWith({
        accessToken: 'tok-folder',
        folderId: 'folderZ',
        maxFolderDepth: 1,
      }),
    );
    expect(screen.getByTestId('google-drive-picker-batch-hint')).toHaveTextContent('2개');
    expect(screen.getByTestId('google-drive-picker-batch-hint')).toHaveTextContent('500');
  });

  it('일괄 진행 중 중단 클릭 시 첫 건만 반영 후 중단 메시지', async () => {
    let resolveFirst!: (v: boolean) => void;
    const firstDone = new Promise<boolean>((resolve) => {
      resolveFirst = resolve;
    });
    mockAddExport.mockImplementationOnce(() => firstDone);
    mockAddExport.mockResolvedValueOnce(true);

    renderDialog();
    await userEvent.type(screen.getByLabelText('액세스 토큰'), 'tok-cancel');
    await userEvent.click(screen.getByTestId('google-drive-open-picker-btn'));
    await waitForBatchHintAfterPicker();
    await userEvent.click(screen.getByTestId('google-drive-batch-import-btn'));
    await waitFor(() => expect(screen.getByTestId('google-drive-batch-progress')).toHaveTextContent('1/2'));
    await userEvent.click(screen.getByTestId('google-drive-batch-cancel-btn'));
    resolveFirst(true);
    expect(await screen.findByRole('alert')).toHaveTextContent('일괄 가져오기를 중단');
    await waitFor(() => expect(mockAddExport).toHaveBeenCalledTimes(1));
  });
});
