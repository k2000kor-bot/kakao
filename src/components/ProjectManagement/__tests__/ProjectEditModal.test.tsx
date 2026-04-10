/**
 * ProjectEditModal 컴포넌트 테스트
 * 프로젝트 설정 편집 모달 렌더링·data-testid·파일·지침 섹션 확인
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectEditModal from '../ProjectEditModal';

const mockGetProject = jest.fn();
const mockUpdateProject = jest.fn();
const mockUploadProjectFile = jest.fn();
const mockGetNotebookContext = jest.fn();

jest.mock('../../../services/projectService', () => ({
  projectService: {
    getProject: (...args: unknown[]) => mockGetProject(...args),
    updateProject: (...args: unknown[]) => mockUpdateProject(...args),
    uploadProjectFile: (...args: unknown[]) => mockUploadProjectFile(...args),
    getNotebookContext: (...args: unknown[]) => mockGetNotebookContext(...args),
  },
}));

jest.mock('../../../utils/toast', () => ({
  showToast: jest.fn(),
}));

jest.mock('../../../services/fileStorageService', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      saveProjectFiles: jest.fn(),
    })),
  },
}));

jest.mock('../../../utils/errorLogger', () => ({
  errorLogger: { error: jest.fn() },
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => React.createElement('div', props, children),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});

describe('ProjectEditModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    projectId: 'proj-1',
    currentProject: { id: 'proj-1', name: '테스트 프로젝트', description: '설명', tags: ['태그1'] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockGetNotebookContext.mockResolvedValue({ source_count: 0 });
    mockGetProject.mockResolvedValue({
      id: 'proj-1',
      name: '테스트 프로젝트',
      description: '설명',
      tags: ['태그1'],
      initialGuidelines: ['가이드라인1'],
      files: [],
      instructions: '',
    });
    mockUpdateProject.mockResolvedValue({ id: 'proj-1', name: '테스트 프로젝트' });
    mockUploadProjectFile.mockResolvedValue(null);
  });

  it('isOpen이 true일 때 모달이 렌더링되고 data-testid가 있어야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);

    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();
    expect(screen.getByText('프로젝트 설정')).toBeInTheDocument();
  });

  it('isOpen이 false이면 모달이 렌더링되지 않아야 함', () => {
    render(<ProjectEditModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('project-edit-modal')).not.toBeInTheDocument();
  });

  it('프로젝트 파일 및 지침 섹션이 표시되어야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);

    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();
    expect(screen.getByText('프로젝트 파일')).toBeInTheDocument();
    expect(screen.getByText('지침 (프로젝트 내 모든 대화에 적용)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /파일 추가/ })).toBeInTheDocument();
  });

  it('getProject가 files를 반환하면 목록에 표시되어야 함', async () => {
    mockGetProject.mockResolvedValue({
      id: 'proj-1',
      name: '테스트 프로젝트',
      description: '',
      tags: [],
      initialGuidelines: [],
      files: [
        { id: 'f1', name: 'doc.pdf', type: 'document' as const, size: 1024, uploadedAt: new Date() },
      ],
      instructions: '',
    });

    render(<ProjectEditModal {...defaultProps} />);

    expect(await screen.findByText('doc.pdf')).toBeInTheDocument();
  });

  it('저장 시 updateProject에 files가 포함되어야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);

    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    const saveButton = screen.getByTestId('project-edit-save');
    await userEvent.click(saveButton);

    await waitFor(() => expect(mockUpdateProject).toHaveBeenCalled());
    expect(mockUpdateProject).toHaveBeenCalledWith(
      'proj-1',
      expect.objectContaining({
        name: '테스트 프로젝트',
        files: expect.any(Array),
      })
    );
  });

  it('파일 추가 시 projectId 있으면 uploadProjectFile 호출, 성공 시 목록에 추가', async () => {
    const uploadedFile = {
      id: 'file-1',
      name: 'doc.pdf',
      type: 'document' as const,
      size: 1024,
      uploadedAt: new Date(),
    };
    mockUploadProjectFile.mockResolvedValueOnce(uploadedFile);

    render(<ProjectEditModal {...defaultProps} />);

    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    const fileInput = screen.getByTestId('project-edit-file-input');
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(mockUploadProjectFile).toHaveBeenCalledWith('proj-1', file);
    });
    expect(await screen.findByText('doc.pdf')).toBeInTheDocument();
  });

  it('파일 추가 시 업로드 중이면 버튼이 비활성화되고 "업로드 중..."이 표시되어야 함', async () => {
    let resolveUpload: (value: unknown) => void;
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve;
    });
    mockUploadProjectFile.mockReturnValueOnce(uploadPromise);

    render(<ProjectEditModal {...defaultProps} />);

    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    const fileInput = screen.getByTestId('project-edit-file-input');
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    await userEvent.upload(fileInput, file);

    const addButton = screen.getByTestId('project-edit-file-add');
    await waitFor(() => expect(addButton).toHaveTextContent('업로드 중...'));
    expect(addButton).toBeDisabled();

    resolveUpload!({
      id: 'f1',
      name: 'a.txt',
      type: 'other',
      size: 1,
      uploadedAt: new Date(),
    });
    await waitFor(() => expect(addButton).toHaveTextContent('파일 추가'));
    expect(addButton).not.toBeDisabled();
  });

  it('운영 템플릿 적용 시 지침/가이드라인/태그가 반영되어야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);

    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /도시정비 운영 템플릿 적용/ }));

    const instructionInput = screen.getByLabelText('프로젝트 지침') as HTMLTextAreaElement;
    expect(instructionInput.value).toContain('도시정비사업 실무 관점으로 답변');
    expect(screen.getByText(/가이드라인: 4개/)).toBeInTheDocument();
    expect(screen.getByText(/태그: 4개/)).toBeInTheDocument();
  });

  it('재건축 수주 템플릿 적용 시 수주·착공 관련 지침이 반영되어야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);

    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /재건축 수주 템플릿 적용/ }));

    const instructionInput = screen.getByLabelText('프로젝트 지침') as HTMLTextAreaElement;
    expect(instructionInput.value).toContain('수주');
    expect(instructionInput.value).toContain('착공');
  });

  it('지침 히스토리 불러오기 시 입력값이 복원되어야 함', async () => {
    localStorage.setItem(
      'project-edit-history-proj-1',
      JSON.stringify([
        {
          id: 'h1',
          savedAt: new Date().toISOString(),
          instructions: '이전 버전 지침입니다.',
          guidelines: ['체크리스트 우선 응답'],
          tags: ['도시정비'],
        },
      ])
    );

    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '선택한 버전 불러오기' }));

    const instructionInput = screen.getByLabelText('프로젝트 지침') as HTMLTextAreaElement;
    expect(instructionInput.value).toContain('이전 버전 지침입니다.');
  });

  it('가이드라인 우선순위 버튼 적용 시 [필수] 접두어가 저장되어야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('guideline-priority-required-0'));
    await userEvent.click(screen.getByTestId('project-edit-save'));

    await waitFor(() => expect(mockUpdateProject).toHaveBeenCalled());
    expect(mockUpdateProject).toHaveBeenCalledWith(
      'proj-1',
      expect.objectContaining({
        initialGuidelines: expect.arrayContaining(['[필수] 가이드라인1']),
      })
    );
  });

  it('필수 가이드라인 내용이 비어 있으면 저장을 막아야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    const guidelineInput = screen.getByTestId('guideline-input-0');
    await userEvent.clear(guidelineInput);
    await userEvent.click(screen.getByTestId('guideline-priority-required-0'));
    await userEvent.click(screen.getByTestId('project-edit-save'));

    expect(mockUpdateProject).not.toHaveBeenCalled();
    expect(screen.getByTestId('guideline-validation-error')).toHaveTextContent('필수 가이드라인 1번 항목의 내용을 입력해 주세요.');
  });

  it('필수 가이드라인이 없으면 소프트 경고를 표시하되 저장은 진행되어야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('guideline-priority-recommended-0'));
    await userEvent.click(screen.getByTestId('project-edit-save'));

    await waitFor(() => expect(mockUpdateProject).toHaveBeenCalled());
    expect(screen.getByTestId('guideline-soft-warning')).toHaveTextContent('필수 가이드라인이 없습니다.');
  });

  it('필수 규칙 추천 적용 클릭 시 가이드라인이 [필수]로 승격되어야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('guideline-priority-recommended-0'));
    await userEvent.click(screen.getByTestId('guideline-apply-required-recommendation'));
    await userEvent.click(screen.getByTestId('project-edit-save'));

    await waitFor(() => expect(mockUpdateProject).toHaveBeenCalled());
    expect(mockUpdateProject).toHaveBeenCalledWith(
      'proj-1',
      expect.objectContaining({
        initialGuidelines: expect.arrayContaining(['[필수] 가이드라인1']),
      })
    );
  });

  it('선택한 가이드라인 항목이 필수 승격되어야 함', async () => {
    mockGetProject.mockResolvedValueOnce({
      id: 'proj-1',
      name: '테스트 프로젝트',
      description: '설명',
      tags: ['태그1'],
      initialGuidelines: ['가이드라인1', '가이드라인2'],
      files: [],
      instructions: '',
    });

    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    // 2번 항목을 선택 상태로 만들고 해당 항목이 필수 승격되는지 확인한다.
    await userEvent.click(screen.getByTestId('guideline-select-1'));
    await userEvent.click(screen.getByTestId('guideline-apply-required-recommendation'));
    await userEvent.click(screen.getByTestId('project-edit-save'));

    await waitFor(() => expect(mockUpdateProject).toHaveBeenCalled());
    expect(mockUpdateProject).toHaveBeenCalledWith(
      'proj-1',
      expect.objectContaining({
        initialGuidelines: expect.arrayContaining(['[필수] 가이드라인2']),
      })
    );
  });

  it('가이드라인 선택 체크 상태가 로컬 스토리지에서 복원되어야 함', async () => {
    mockGetProject.mockResolvedValueOnce({
      id: 'proj-1',
      name: '테스트 프로젝트',
      description: '설명',
      tags: ['태그1'],
      initialGuidelines: ['가이드라인1', '가이드라인2'],
      files: [],
      instructions: '',
    });
    localStorage.setItem('project-edit-guideline-selection-proj-1', JSON.stringify([1]));

    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    const checkbox1 = screen.getByTestId('guideline-select-1') as HTMLInputElement;
    await waitFor(() => {
      expect(checkbox1.checked).toBe(true);
    });
  });

  it('가이드라인 선택 관리 액션(전체 선택/선택 해제/저장값 초기화)이 동작해야 함', async () => {
    mockGetProject.mockResolvedValueOnce({
      id: 'proj-1',
      name: '테스트 프로젝트',
      description: '설명',
      tags: ['태그1'],
      initialGuidelines: ['가이드라인1', '가이드라인2'],
      files: [],
      instructions: '',
    });
    localStorage.setItem('project-edit-guideline-selection-proj-1', JSON.stringify([0]));

    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await waitFor(() => {
      expect((screen.getByTestId('guideline-select-0') as HTMLInputElement).checked).toBe(true);
    });

    await userEvent.click(screen.getByTestId('guideline-select-all'));
    await waitFor(() => expect((screen.getByTestId('guideline-select-0') as HTMLInputElement).checked).toBe(true));
    expect((screen.getByTestId('guideline-select-1') as HTMLInputElement).checked).toBe(true);

    await userEvent.click(screen.getByTestId('guideline-select-none'));
    await waitFor(() => expect((screen.getByTestId('guideline-select-0') as HTMLInputElement).checked).toBe(false));
    expect((screen.getByTestId('guideline-select-1') as HTMLInputElement).checked).toBe(false);

    await userEvent.click(screen.getByTestId('guideline-selection-reset'));
    expect(localStorage.getItem('project-edit-guideline-selection-proj-1')).toBe('[]');
  });

  it('가이드라인 품질 점검 패널이 점수와 메타를 표시해야 함', async () => {
    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    expect(screen.getByText('가이드라인 품질 점검')).toBeInTheDocument();
    expect(screen.getByText(/\d+점/)).toBeInTheDocument();
    expect(screen.getByText(/필수 0개|필수 1개|필수 2개/)).toBeInTheDocument();
  });

  it('자동 복구 적용 시 가이드라인이 정리되고 필수 규칙이 보정되어야 함', async () => {
    mockGetProject.mockResolvedValueOnce({
      id: 'proj-1',
      name: '테스트 프로젝트',
      description: '설명',
      tags: ['태그1'],
      initialGuidelines: ['가이드라인1', ' [권장] 가이드라인1 ', '', '가이드라인2'],
      files: [],
      instructions: '',
    });

    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('guideline-auto-recovery'));
    const recoveryPrompt = screen.getByTestId('guideline-auto-recovery-prompt') as HTMLTextAreaElement;
    expect(recoveryPrompt.value).toContain('[가이드라인 자동 복구 리포트]');
    const storedRecovery = localStorage.getItem('project-guideline-auto-recovery-report-proj-1');
    expect(storedRecovery).not.toBeNull();
    const parsedRecovery = JSON.parse(storedRecovery ?? '[]') as Array<{ prompt?: string; delta?: number }>;
    expect(Array.isArray(parsedRecovery)).toBe(true);
    expect(parsedRecovery[0]?.prompt).toContain('[가이드라인 자동 복구 리포트]');
    expect(typeof parsedRecovery[0]?.delta).toBe('number');
    await userEvent.click(screen.getByTestId('project-edit-save'));

    await waitFor(() => expect(mockUpdateProject).toHaveBeenCalled());
    expect(mockUpdateProject).toHaveBeenCalledWith(
      'proj-1',
      expect.objectContaining({
        initialGuidelines: expect.arrayContaining(['[필수] 가이드라인1', '[권장] 가이드라인2']),
      })
    );
  });

  it('복구 이력 2개 선택 시 A/B 비교 리포트를 생성해야 함', async () => {
    mockGetProject.mockResolvedValueOnce({
      id: 'proj-1',
      name: '테스트 프로젝트',
      description: '설명',
      tags: ['태그1'],
      initialGuidelines: ['가이드라인1', '가이드라인1', '가이드라인2'],
      files: [],
      instructions: '',
    });

    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('guideline-auto-recovery'));
    await userEvent.clear(screen.getByTestId('guideline-input-1'));
    await userEvent.type(screen.getByTestId('guideline-input-1'), '가이드라인2-수정');
    await userEvent.click(screen.getByTestId('guideline-auto-recovery'));

    const compareChecks = screen.getAllByRole('checkbox');
    await userEvent.click(compareChecks[0]);
    await userEvent.click(compareChecks[1]);
    await userEvent.click(screen.getByTestId('recovery-compare-generate'));

    const comparePrompt = screen.getByTestId('guideline-auto-recovery-compare-prompt') as HTMLTextAreaElement;
    expect(comparePrompt.value).toContain('[복구 이력 A/B 비교]');
    const storedCompare = localStorage.getItem('project-guideline-auto-recovery-compare-proj-1');
    expect(storedCompare).not.toBeNull();
  });

  it('비교 프리셋(최신 vs 직전)으로 A/B 리포트를 생성할 수 있어야 함', async () => {
    mockGetProject.mockResolvedValueOnce({
      id: 'proj-1',
      name: '테스트 프로젝트',
      description: '설명',
      tags: ['태그1'],
      initialGuidelines: ['가이드라인1', '가이드라인1', '가이드라인2'],
      files: [],
      instructions: '',
    });

    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('guideline-auto-recovery'));
    await userEvent.clear(screen.getByTestId('guideline-input-1'));
    await userEvent.type(screen.getByTestId('guideline-input-1'), '가이드라인2-수정');
    await userEvent.click(screen.getByTestId('guideline-auto-recovery'));

    await userEvent.click(screen.getByTestId('recovery-compare-preset-latest-prev'));
    await userEvent.click(screen.getByTestId('recovery-compare-generate'));

    const comparePrompt = screen.getByTestId('guideline-auto-recovery-compare-prompt') as HTMLTextAreaElement;
    expect(comparePrompt.value).toContain('[복구 이력 A/B 비교]');
    expect(comparePrompt.value).toContain('A(이전)');
    expect(comparePrompt.value).toContain('B(이후)');
  });

  it('비교 프리셋(최신 vs 품질최저점)으로 리포트를 생성할 수 있어야 함', async () => {
    mockGetProject.mockResolvedValueOnce({
      id: 'proj-1',
      name: '테스트 프로젝트',
      description: '설명',
      tags: ['태그1'],
      initialGuidelines: ['가이드라인1', '가이드라인1', '가이드라인2'],
      files: [],
      instructions: '',
    });

    render(<ProjectEditModal {...defaultProps} />);
    expect(await screen.findByTestId('project-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('guideline-auto-recovery'));
    await userEvent.clear(screen.getByTestId('guideline-input-1'));
    await userEvent.type(screen.getByTestId('guideline-input-1'), '가이드라인2-수정');
    await userEvent.click(screen.getByTestId('guideline-auto-recovery'));
    await userEvent.clear(screen.getByTestId('guideline-input-1'));
    await userEvent.click(screen.getByTestId('guideline-auto-recovery'));

    await userEvent.click(screen.getByTestId('recovery-compare-preset-latest-lowest'));
    await userEvent.click(screen.getByTestId('recovery-compare-generate'));

    const comparePrompt = screen.getByTestId('guideline-auto-recovery-compare-prompt') as HTMLTextAreaElement;
    expect(comparePrompt.value).toContain('[복구 이력 A/B 비교]');
    expect(comparePrompt.value).toContain('점수 변화(B-A)');
    expect(comparePrompt.value).toContain('[추가 요청 - 품질최저점 비교 전용]');
    expect(comparePrompt.value).toContain('리스크 원인 TOP3');
  });
});
