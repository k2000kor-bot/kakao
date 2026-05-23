/**
 * SettingsView 테스트 — 설정 화면 렌더·테마·알림·LLM·정보
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SettingsView from './SettingsView';
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
      } as Response),
    );
  });

  it('설정 뷰가 렌더되고 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>,
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
      </MemoryRouter>,
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
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: '다크 모드' }));
    await userEvent.click(screen.getByRole('button', { name: '라이트 모드' }));
    expect(mockSetMode).toHaveBeenCalledWith('dark');
    expect(mockSetMode).toHaveBeenCalledWith('light');
  });

  it('알림 섹션에 토글이 있다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 2, name: '알림' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /이메일 요약/ })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /브라우저 푸시/ })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /제품 공지/ })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
  });

  it('알림 토글 클릭 시 localStorage에 저장한다', async () => {
    localStorage.removeItem('corbu.settings.notify.push');
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
    const pushSwitch = screen.getByRole('switch', { name: /브라우저 푸시/ });
    expect(pushSwitch).not.toBeChecked();
    await userEvent.click(pushSwitch);
    expect(localStorage.getItem('corbu.settings.notify.push')).toBe('1');
  });

  it('LLM 엔진 섹션이 있고 DeepSeek 설정 가이드 링크가 있다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'LLM 엔진' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /DeepSeek 설정 가이드/ })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/DeepSeek \(API\)/)).toBeInTheDocument();
    });
  });

  it('정보 섹션과 사용 가이드 링크가 있다', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 2, name: '정보' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /사용 가이드/ })).toBeInTheDocument();
  });
});
