/**
 * ProjectsPage 컴포넌트 테스트
 * 프로젝트 목록·로딩·헤더 렌더링·선택·생성 확인
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProjectsPage from './ProjectsPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockGetProjects = jest.fn();
const mockCreateProject = jest.fn();
const mockUpdateProject = jest.fn();
const mockDeleteProject = jest.fn();

jest.mock('../services/projectService', () => ({
  projectService: {
    getProjects: (...args: unknown[]) => mockGetProjects(...args),
    createProject: (...args: unknown[]) => mockCreateProject(...args),
    updateProject: (...args: unknown[]) => mockUpdateProject(...args),
    deleteProject: (...args: unknown[]) => mockDeleteProject(...args),
  },
}));

jest.mock('../components/ProjectManagement/ProjectEditModal', () => ({
  __esModule: true,
  default: function MockProjectEditModal({ isOpen }: { isOpen: boolean }) {
    if (!isOpen) return null;
    return <div data-testid="project-edit-modal">ProjectEditModal</div>;
  },
}));

jest.mock('../components/ProjectManagement/ProjectCreateModal', () => ({
  __esModule: true,
  default: function MockProjectCreateModal({
    isOpen,
    onClose,
    onSubmit,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; category: string; memoryType: string }) => Promise<void>;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="project-create-modal" role="dialog" aria-label="프로젝트 만들기">
        <button type="button" onClick={onClose} aria-label="닫기">닫기</button>
        <button
          type="button"
          onClick={() => onSubmit({ name: '테스트', category: 'travel', memoryType: 'default' }).catch(() => {})}
          aria-label="프로젝트 만들기"
        >
          프로젝트 만들기
        </button>
      </div>
    );
  },
}));

describe('ProjectsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProjects.mockResolvedValue([
      {
        id: 'p1',
        name: '테스트 프로젝트',
        description: '설명',
        type: 'conversation',
        status: 'active',
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
      },
    ]);
  });

  it('로딩 완료 후 프로젝트 제목과 목록을 보여준다', async () => {
    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { level: 2, name: '프로젝트 목록' })).toBeInTheDocument();
    expect(screen.getByText('테스트 프로젝트')).toBeInTheDocument();
  });

  it('getProjects 실패 시 빈 목록으로 렌더한다', async () => {
    mockGetProjects.mockRejectedValue(new Error('API 오류'));

    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { level: 2, name: '프로젝트 목록' })).toBeInTheDocument();
  });

  it('빈 프로젝트 목록일 때 헤더만 렌더한다', async () => {
    mockGetProjects.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { level: 2, name: '프로젝트 목록' })).toBeInTheDocument();
    expect(screen.queryByText('테스트 프로젝트')).not.toBeInTheDocument();
  });

  it('빈 목록일 때 빈 상태 문구와 새 프로젝트 만들기 버튼이 보인다', async () => {
    mockGetProjects.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 2, name: '프로젝트 목록' });
    expect(screen.getByText('프로젝트가 없습니다')).toBeInTheDocument();
    expect(screen.getByText(/새 프로젝트를 만들어 시작하세요/)).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', { name: '새 프로젝트 만들기' });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('프로젝트 카드 클릭 시 해당 프로젝트 상세로 이동한다', async () => {
    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await screen.findByText('테스트 프로젝트');
    await userEvent.click(screen.getByText('테스트 프로젝트'));

    expect(mockNavigate).toHaveBeenCalledWith('/projects/p1');
  });

  it('로딩 중에 스켈레톤을 표시한다', async () => {
    let resolve: (value: unknown) => void;
    mockGetProjects.mockImplementation(
      () => new Promise((r) => { resolve = r; })
    );

    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('status', { name: '카드 로딩 중' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: '프로젝트 목록' })).not.toBeInTheDocument();

    resolve!([]);
    await screen.findByRole('heading', { level: 2, name: '프로젝트 목록' });
  });

  it('createProject 실패 시 편집 모달이 열리지 않는다', async () => {
    mockCreateProject.mockRejectedValue(new Error('생성 실패'));

    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 2, name: '프로젝트 목록' });
    await userEvent.click(screen.getAllByRole('button', { name: '새 프로젝트 만들기' })[0]);
    const createModal = await screen.findByTestId('project-create-modal');
    await userEvent.click(within(createModal).getByRole('button', { name: '프로젝트 만들기' }));

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalled();
    });
    expect(screen.queryByTestId('project-edit-modal')).not.toBeInTheDocument();
  });

  it('새 프로젝트 버튼 클릭 후 만들기 모달에서 제출 시 생성 성공하면 편집 모달이 열린다', async () => {
    mockCreateProject.mockResolvedValue({
      id: 'new-1',
      name: '테스트 프로젝트',
      description: '',
      type: 'conversation',
      status: 'active',
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    });

    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 2, name: '프로젝트 목록' });
    await userEvent.click(screen.getAllByRole('button', { name: '새 프로젝트 만들기' })[0]);
    const createModal = await screen.findByTestId('project-create-modal');
    await userEvent.click(within(createModal).getByRole('button', { name: '프로젝트 만들기' }));

    await waitFor(() => {
      expect(screen.getByTestId('project-edit-modal')).toBeInTheDocument();
    });
    expect(mockCreateProject).toHaveBeenCalled();
  });
});
