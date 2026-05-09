/**
 * SettingsView 테스트 — 설정 화면 렌더·테마·LLM 엔진 영역
 */
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SettingsView from './SettingsView';
import {
  SIDEBAR_CONTEXT_FILTER_STORAGE_KEY,
  SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT,
  SIDEBAR_CONTEXT_RESTORE_KEY,
  SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT,
  SIDEBAR_CONTEXT_TOAST_KEY,
  SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT,
  type SidebarContextFilterUpdatedDetail,
} from '../constants/sidebarContextFilterEvent';
import { installJestFetchMock } from '../test-utils/installJestFetchMock';

const mockSetMode = jest.fn();
jest.mock('../components/ThemeProvider', () => ({
  useTheme: () => ({ isDarkMode: false, setMode: mockSetMode }),
}));

describe('SettingsView', () => {
  beforeEach(() => {
    mockSetMode.mockReset();
    installJestFetchMock();
    jest.mocked(global.fetch).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy', llm_provider: 'deepseek' }),
      } as Response)
    );
  });

  it('설정 뷰가 렌더되고 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    expect(screen.getByText(/앱 테마와 기본 옵션을 변경할 수 있습니다/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
  });

  it('테마 섹션과 라이트/다크 버튼이 있다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '테마' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '테마 선택' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '라이트 모드' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다크 모드' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
  });

  it('테마 칩 클릭 시 setMode를 호출한다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
    const darkBtn = screen.getByRole('button', { name: '다크 모드' });
    const lightBtn = screen.getByRole('button', { name: '라이트 모드' });

    await userEvent.click(darkBtn);
    await userEvent.click(lightBtn);

    expect(mockSetMode).toHaveBeenCalledWith('dark');
    expect(mockSetMode).toHaveBeenCalledWith('light');
  });

  it('알림 섹션에 토글이 있다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '알림' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /이메일 요약/ })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
  });

  it('인터페이스 섹션에 사이드바 필터 시작 방식 라디오가 있다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );
    expect(screen.getByRole('group', { name: '사이드바 필터 피드백 설정' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '사이드바 필터 프리셋' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: '사이드바 필터 시작 방식' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '마지막 상태 복원' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '항상 전체로 시작' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
  });

  it('사이드바 필터 전환 토스트 스위치를 토글하면 설정이 저장된다', async () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
    const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
    expect(toastSwitch).toBeChecked();
    await userEvent.click(toastSwitch);
    expect(toastSwitch).not.toBeChecked();
    expect(localStorage.getItem(SIDEBAR_CONTEXT_TOAST_KEY)).toBe('0');
  });

  it('저장된 사이드바 컨텍스트 필터를 미리보기로 표시한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'agent');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      expect(screen.getByText(/현재 저장된 필터:/)).toBeInTheDocument();
      expect(screen.getByText('에이전트')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('사이드바 컨텍스트 필터 업데이트 이벤트를 받으면 미리보기를 즉시 갱신한다', async () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('전체')).toBeInTheDocument();

      act(() => {
        window.dispatchEvent(new CustomEvent(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, { detail: { filter: 'project' } }));
      });
      await waitFor(() => {
        expect(screen.getByText('프로젝트')).toBeInTheDocument();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('사이드바 컨텍스트 필터 업데이트 이벤트 detail이 없으면 저장값으로 미리보기를 동기화한다', async () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('전체')).toBeInTheDocument();

      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'agent');
      act(() => {
        window.dispatchEvent(new CustomEvent(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, { detail: {} }));
      });
      await waitFor(() => {
        expect(screen.getByText('에이전트')).toBeInTheDocument();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('사이드바 컨텍스트 필터 업데이트 이벤트 detail.filter가 유효하지 않으면 저장값으로 미리보기를 동기화한다', async () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('전체')).toBeInTheDocument();

      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
      act(() => {
        window.dispatchEvent(new CustomEvent(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, { detail: { filter: 'unknown' } }));
      });
      await waitFor(() => {
        expect(screen.getByText('프로젝트')).toBeInTheDocument();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 key가 다르면 사이드바 필터 미리보기를 변경하지 않는다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'agent');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('에이전트')).toBeInTheDocument();
      const allBtn = screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' });
      const agentBtn = screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' });
      const projectBtn = screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' });
      expect(allBtn).toHaveAttribute('aria-pressed', 'false');
      expect(agentBtn).toHaveAttribute('aria-pressed', 'true');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'false');

      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'unrelated-key',
            newValue: '1',
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('에이전트')).toBeInTheDocument();
      });
      expect(screen.queryByText('프로젝트')).not.toBeInTheDocument();
      expect(allBtn).toHaveAttribute('aria-pressed', 'false');
      expect(agentBtn).toHaveAttribute('aria-pressed', 'true');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'false');
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 key가 null이면 저장값 기준으로 사이드바 필터 미리보기를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'agent');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('에이전트')).toBeInTheDocument();
      const allBtn = screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' });
      const agentBtn = screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' });
      const projectBtn = screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' });
      expect(allBtn).toHaveAttribute('aria-pressed', 'false');
      expect(agentBtn).toHaveAttribute('aria-pressed', 'true');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'false');

      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: null,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('프로젝트')).toBeInTheDocument();
      });
      expect(allBtn).toHaveAttribute('aria-pressed', 'false');
      expect(agentBtn).toHaveAttribute('aria-pressed', 'false');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'true');
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 key가 null이고 저장값이 잘못되면 사이드바 필터 미리보기를 전체로 정규화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('프로젝트')).toBeInTheDocument();

      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'invalid-filter');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: null,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('전체')).toBeInTheDocument();
      });
      expect(screen.queryByText('프로젝트')).not.toBeInTheDocument();
      expect(screen.queryByText('에이전트')).not.toBeInTheDocument();
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 key가 필터 키이고 저장값이 잘못되면 미리보기를 전체로 정규화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'agent');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('에이전트')).toBeInTheDocument();

      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'invalid-filter');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_FILTER_STORAGE_KEY,
            newValue: 'invalid-filter',
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('전체')).toBeInTheDocument();
      });
      expect(screen.queryByText('에이전트')).not.toBeInTheDocument();
      expect(screen.queryByText('프로젝트')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 key가 필터 키이고 값이 제거되면 미리보기를 전체로 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('프로젝트')).toBeInTheDocument();

      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_FILTER_STORAGE_KEY,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('전체')).toBeInTheDocument();
      });
      expect(screen.queryByText('프로젝트')).not.toBeInTheDocument();
      expect(screen.queryByText('에이전트')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 newValue가 null이어도 실제 저장값이 있으면 저장값 기준으로 필터 미리보기를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'all');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('전체')).toBeInTheDocument();
      const allBtn = screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' });
      const agentBtn = screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' });
      const projectBtn = screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' });
      expect(allBtn).toHaveAttribute('aria-pressed', 'true');

      // 이벤트 newValue는 null이지만 실제 저장값은 agent
      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'agent');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_FILTER_STORAGE_KEY,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('에이전트')).toBeInTheDocument();
      });
      expect(allBtn).toHaveAttribute('aria-pressed', 'false');
      expect(agentBtn).toHaveAttribute('aria-pressed', 'true');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'false');
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 key가 필터 키이고 유효한 값이면 미리보기를 즉시 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'all');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('전체')).toBeInTheDocument();
      const allBtn = screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' });
      const agentBtn = screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' });
      const projectBtn = screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' });
      expect(allBtn).toHaveAttribute('aria-pressed', 'true');
      expect(agentBtn).toHaveAttribute('aria-pressed', 'false');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'false');

      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_FILTER_STORAGE_KEY,
            newValue: 'project',
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('프로젝트')).toBeInTheDocument();
      });
      expect(screen.queryByText('에이전트')).not.toBeInTheDocument();
      expect(allBtn).toHaveAttribute('aria-pressed', 'false');
      expect(agentBtn).toHaveAttribute('aria-pressed', 'false');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'true');
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 newValue와 저장값이 달라도 저장값 기준으로 필터 미리보기를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'all');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('전체')).toBeInTheDocument();

      // 이벤트 payload는 project지만 실제 저장값은 agent로 두어 저장값 우선 동기화 계약을 검증
      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'agent');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_FILTER_STORAGE_KEY,
            newValue: 'project',
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('에이전트')).toBeInTheDocument();
      });
      expect(screen.queryByText('프로젝트')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 newValue가 잘못된 값이어도 저장값 기준으로 필터 미리보기를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'all');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('전체')).toBeInTheDocument();

      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_FILTER_STORAGE_KEY,
            newValue: 'invalid-filter',
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('프로젝트')).toBeInTheDocument();
      });
      expect(screen.queryByText('에이전트')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('storage 이벤트 newValue가 유효해도 저장값이 잘못되면 필터 미리보기를 전체로 정규화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('프로젝트')).toBeInTheDocument();

      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'invalid-filter');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_FILTER_STORAGE_KEY,
            newValue: 'project',
          }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('전체')).toBeInTheDocument();
      });
      expect(screen.queryByText('프로젝트')).not.toBeInTheDocument();
      expect(screen.queryByText('에이전트')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('사이드바 필터 전체로 초기화 버튼이 저장값을 all로 변경한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      expect(screen.getByText('프로젝트')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' }));
      expect(localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY)).toBe('all');
      expect(screen.getByText('전체')).toBeInTheDocument();
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('사이드바 필터 프리셋 버튼으로 에이전트/프로젝트를 바로 설정할 수 있다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'all');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const agentBtn = screen.getByRole('button', { name: '사이드바 필터 에이전트로 설정' });
      const projectBtn = screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' });
      const allBtn = screen.getByRole('button', { name: '사이드바 필터 전체로 초기화' });
      expect(allBtn).toHaveAttribute('aria-pressed', 'true');
      expect(agentBtn).toHaveAttribute('aria-pressed', 'false');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'false');

      await userEvent.click(agentBtn);
      expect(localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY)).toBe('agent');
      expect(screen.getByText('에이전트')).toBeInTheDocument();
      expect(agentBtn).toHaveAttribute('aria-pressed', 'true');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'false');
      expect(allBtn).toHaveAttribute('aria-pressed', 'false');

      await userEvent.click(projectBtn);
      expect(localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY)).toBe('project');
      expect(screen.getByText('프로젝트')).toBeInTheDocument();
      expect(agentBtn).toHaveAttribute('aria-pressed', 'false');
      expect(projectBtn).toHaveAttribute('aria-pressed', 'true');
      expect(allBtn).toHaveAttribute('aria-pressed', 'false');
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('사이드바 필터 프리셋 버튼 클릭 시 컨텍스트 업데이트 이벤트 detail.filter를 발행한다', async () => {
    const onUpdated = jest.fn();
    window.addEventListener(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, onUpdated as EventListener);
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      await userEvent.click(screen.getByRole('button', { name: '사이드바 필터 프로젝트로 설정' }));
      await waitFor(() => {
        expect(onUpdated).toHaveBeenCalled();
        const lastCall = onUpdated.mock.calls.at(-1)?.[0] as CustomEvent<SidebarContextFilterUpdatedDetail>;
        expect(lastCall?.detail?.filter).toBe('project');
      });
    } finally {
      window.removeEventListener(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, onUpdated as EventListener);
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('사이드바 필터 시작 방식을 항상 전체로 바꾸면 저장값과 필터 업데이트 이벤트를 함께 반영한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
    const onUpdated = jest.fn();
    window.addEventListener(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, onUpdated as EventListener);
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('radio', { name: '항상 전체로 시작' }));
      expect(localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY)).toBe('all');

      await waitFor(() => {
        expect(onUpdated).toHaveBeenCalled();
        const lastCall = onUpdated.mock.calls.at(-1)?.[0] as CustomEvent<SidebarContextFilterUpdatedDetail>;
        expect(lastCall?.detail?.filter).toBe('all');
      });
    } finally {
      window.removeEventListener(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, onUpdated as EventListener);
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    }
  });

  it('사이드바 필터 시작 방식을 마지막 상태 복원으로 바꾸면 필터 저장값을 덮어쓰지 않는다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '1');
    let onUpdated: jest.Mock | null = null;
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('radio', { name: '항상 전체로 시작' }));
      expect(localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY)).toBe('all');

      onUpdated = jest.fn();
      window.addEventListener(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, onUpdated as EventListener);
      localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
      await userEvent.click(screen.getByRole('radio', { name: '마지막 상태 복원' }));
      expect(localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY)).toBe('project');
      expect(onUpdated).not.toHaveBeenCalled();
    } finally {
      if (onUpdated) {
        window.removeEventListener(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, onUpdated as EventListener);
      }
      localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('복원 설정 업데이트 이벤트 detail이 유효하지 않으면 저장값으로 라디오 상태를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(restoreRadio).toBeChecked();
      expect(allRadio).not.toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new CustomEvent(SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT, { detail: { restoreEnabled: 'invalid' } }),
        );
      });
      await waitFor(() => {
        expect(allRadio).toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('복원 설정 업데이트 이벤트 detail boolean 값을 우선 반영한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(restoreRadio).toBeChecked();
      expect(allRadio).not.toBeChecked();

      act(() => {
        window.dispatchEvent(
          new CustomEvent(SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT, { detail: { restoreEnabled: false } }),
        );
      });
      await waitFor(() => {
        expect(allRadio).toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('복원 설정 업데이트 이벤트 detail=true 값을 우선 반영한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(allRadio).toBeChecked();
      expect(restoreRadio).not.toBeChecked();

      act(() => {
        window.dispatchEvent(
          new CustomEvent(SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT, { detail: { restoreEnabled: true } }),
        );
      });
      await waitFor(() => {
        expect(restoreRadio).toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('storage 이벤트 key가 다르면 복원 라디오 상태를 변경하지 않는다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(restoreRadio).toBeChecked();
      expect(allRadio).not.toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'unrelated-key',
            newValue: '1',
          }),
        );
      });

      await waitFor(() => {
        expect(restoreRadio).toBeChecked();
      });
      expect(allRadio).not.toBeChecked();
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('storage 이벤트 key가 null이면 저장값 기준으로 복원 라디오 상태를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(restoreRadio).toBeChecked();
      expect(allRadio).not.toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: null,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(allRadio).toBeChecked();
      });
      expect(restoreRadio).not.toBeChecked();
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it("storage 이벤트 key가 null이고 복원 저장값이 비정상 문자열이면 현재 규칙대로 '복원 ON'으로 해석한다", async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(allRadio).toBeChecked();
      expect(restoreRadio).not.toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, 'invalid');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: null,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(restoreRadio).toBeChecked();
      });
      expect(allRadio).not.toBeChecked();
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('storage 이벤트 key가 복원 설정 키면 복원 라디오 상태를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(restoreRadio).toBeChecked();
      expect(allRadio).not.toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_RESTORE_KEY,
            newValue: '0',
          }),
        );
      });

      await waitFor(() => {
        expect(allRadio).toBeChecked();
      });
      expect(restoreRadio).not.toBeChecked();
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('storage 이벤트 newValue와 저장값이 달라도 저장값 기준으로 복원 라디오를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(restoreRadio).toBeChecked();
      expect(allRadio).not.toBeChecked();

      // 이벤트 payload는 restoreEnabled=true에 해당하지만, 실제 저장값은 0으로 두어 저장값 우선 동기화 확인
      localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_RESTORE_KEY,
            newValue: '1',
          }),
        );
      });

      await waitFor(() => {
        expect(allRadio).toBeChecked();
      });
      expect(restoreRadio).not.toBeChecked();
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('storage 이벤트 newValue가 null이어도 저장값 기준으로 복원 라디오를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(restoreRadio).toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_RESTORE_KEY,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(allRadio).toBeChecked();
      });
      expect(restoreRadio).not.toBeChecked();
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('storage 이벤트 newValue가 잘못된 값이어도 저장값 기준으로 복원 라디오를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const restoreRadio = screen.getByRole('radio', { name: '마지막 상태 복원' });
      const allRadio = screen.getByRole('radio', { name: '항상 전체로 시작' });
      expect(allRadio).toBeChecked();
      expect(restoreRadio).not.toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '1');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_RESTORE_KEY,
            newValue: 'invalid',
          }),
        );
      });

      await waitFor(() => {
        expect(restoreRadio).toBeChecked();
      });
      expect(allRadio).not.toBeChecked();
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    }
  });

  it('토스트 설정 업데이트 이벤트 detail이 유효하지 않으면 저장값으로 스위치 상태를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new CustomEvent(SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT, { detail: { enabled: 'invalid' } }),
        );
      });
      await waitFor(() => {
        expect(toastSwitch).not.toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it('토스트 설정 업데이트 이벤트 detail boolean 값을 우선 반영한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '0');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).not.toBeChecked();

      act(() => {
        window.dispatchEvent(
          new CustomEvent(SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT, { detail: { enabled: true } }),
        );
      });
      await waitFor(() => {
        expect(toastSwitch).toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it('토스트 설정 업데이트 이벤트 detail=false 값을 우선 반영한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).toBeChecked();

      act(() => {
        window.dispatchEvent(
          new CustomEvent(SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT, { detail: { enabled: false } }),
        );
      });
      await waitFor(() => {
        expect(toastSwitch).not.toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it('storage 이벤트 key가 다르면 토스트 스위치 상태를 변경하지 않는다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'unrelated-key',
            newValue: '1',
          }),
        );
      });

      await waitFor(() => {
        expect(toastSwitch).toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it('storage 이벤트 key가 null이면 저장값 기준으로 토스트 스위치 상태를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: null,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(toastSwitch).not.toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it("storage 이벤트 key가 null이고 토스트 저장값이 비정상 문자열이면 현재 규칙대로 ON으로 해석한다", async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '0');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).not.toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, 'invalid');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: null,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(toastSwitch).toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it('storage 이벤트 key가 토스트 설정 키면 토스트 스위치 상태를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_TOAST_KEY,
            newValue: '0',
          }),
        );
      });

      await waitFor(() => {
        expect(toastSwitch).not.toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it('storage 이벤트 newValue와 저장값이 달라도 저장값 기준으로 토스트 스위치를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).toBeChecked();

      // 이벤트 payload는 enabled=true에 해당하지만 실제 저장값은 0으로 두어 저장값 우선 동기화 확인
      localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_TOAST_KEY,
            newValue: '1',
          }),
        );
      });

      await waitFor(() => {
        expect(toastSwitch).not.toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it('storage 이벤트 newValue가 null이어도 저장값 기준으로 토스트 스위치를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '1');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '0');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_TOAST_KEY,
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        expect(toastSwitch).not.toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it('storage 이벤트 newValue가 잘못된 값이어도 저장값 기준으로 토스트 스위치를 동기화한다', async () => {
    localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '0');
    try {
      render(
        <MemoryRouter>
          <SettingsView />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
      });
      const toastSwitch = screen.getByRole('switch', { name: '사이드바 필터 전환 토스트' });
      expect(toastSwitch).not.toBeChecked();

      localStorage.setItem(SIDEBAR_CONTEXT_TOAST_KEY, '1');
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SIDEBAR_CONTEXT_TOAST_KEY,
            newValue: 'invalid',
          }),
        );
      });

      await waitFor(() => {
        expect(toastSwitch).toBeChecked();
      });
    } finally {
      localStorage.removeItem(SIDEBAR_CONTEXT_TOAST_KEY);
    }
  });

  it('프로필 아바타 카테고리 칩은 선택 상태를 aria-pressed로 표시한다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /편집/ }));
    const allCategoryChip = screen.getByRole('button', { name: '전체' });
    const peopleCategoryChip = screen.getByRole('button', { name: '사람' });
    expect(allCategoryChip).toHaveAttribute('aria-pressed', 'true');
    expect(peopleCategoryChip).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(peopleCategoryChip);
    expect(allCategoryChip).toHaveAttribute('aria-pressed', 'false');
    expect(peopleCategoryChip).toHaveAttribute('aria-pressed', 'true');
  });

  it('글꼴 크기 칩은 선택 상태를 aria-pressed로 표시하고 저장한다', async () => {
    localStorage.removeItem('corbu.settings.fontSize');
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });

    const normalChip = screen.getByRole('button', { name: '보통' });
    const largeChip = screen.getByRole('button', { name: '크게' });
    expect(normalChip).toHaveAttribute('aria-pressed', 'true');
    expect(largeChip).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(largeChip);
    expect(localStorage.getItem('corbu.settings.fontSize')).toBe('16px');
    expect(normalChip).toHaveAttribute('aria-pressed', 'false');
    expect(largeChip).toHaveAttribute('aria-pressed', 'true');
  });

  it('LLM 엔진 섹션이 있고 LLM·노트북 설정 가이드 링크가 있다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: 'LLM 엔진' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LLM 및 노트북 설정 가이드/ })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
  });
});
