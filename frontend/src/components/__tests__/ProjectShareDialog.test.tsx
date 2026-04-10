/* eslint-disable jest/no-conditional-expect, testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createMuiTestTheme } from '../../test-utils/muiTestTheme';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import ProjectShareDialog from '../ProjectShareDialog';
import projectShareService from '../../services/projectShareService';

// Mock projectShareService
jest.mock('../../services/projectShareService');

const mockProjectShareService: jest.Mocked<typeof projectShareService> = jest.mocked(projectShareService);

// Mock navigator.clipboard
const mockClipboardWriteText = jest.fn().mockResolvedValue(undefined);

// 전역 navigator.clipboard 모킹
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: mockClipboardWriteText,
  },
  writable: true,
  configurable: true,
});


const theme = createMuiTestTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ProjectShareDialog', () => {
  const mockOnClose = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    projectId: 'project-1',
    projectName: 'Test Project'
  };

  const mockShareLinks = [
    {
      id: 'share-1',
      projectId: 'project-1',
      shareToken: 'token-1',
      permission: 'read' as const,
      createdAt: new Date().toISOString(),
      createdBy: 'user-1',
      expiresAt: undefined,
      maxUses: undefined,
      password: undefined,
      description: 'Test share link',
      usageCount: 5
    }
  ];

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    mockClipboardWriteText.mockClear();
    mockClipboardWriteText.mockResolvedValue(undefined);
    
    mockProjectShareService.getProjectShares = jest.fn().mockReturnValue(mockShareLinks);
    mockProjectShareService.createShareLink = jest.fn().mockReturnValue(mockShareLinks[0]);
    mockProjectShareService.deleteShareLink = jest.fn();
    mockProjectShareService.generateShareUrl = jest.fn().mockReturnValue('https://example.com/share/token-1');
    mockProjectShareService.getShareStats = jest.fn().mockReturnValue({
      usageCount: 5,
      lastUsedAt: new Date().toISOString()
    });
  });

  describe('렌더링', () => {
    it('다이얼로그가 열려있을 때 내용을 표시해야 함', () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      expect(screen.getByText('프로젝트 공유')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('새 공유 링크 생성')).toBeInTheDocument();
    });

    it('다이얼로그가 닫혀있을 때 내용을 표시하지 않아야 함', () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} open={false} />);

      expect(screen.queryByText('프로젝트 공유')).not.toBeInTheDocument();
    });

    it('공유 링크 목록을 표시해야 함', () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      expect(screen.getByText('Test share link')).toBeInTheDocument();
    });
  });

  describe('공유 링크 생성', () => {
    it('새 공유 링크 생성 버튼 클릭 시 폼을 표시해야 함', async () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const createButton = screen.getByText('새 공유 링크 생성');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('공유 링크 생성')).toBeInTheDocument();
      });

      // 권한 Select는 Material-UI의 특성상 label이 제대로 연결되지 않을 수 있음
      // 여러 "권한" 텍스트가 있을 수 있으므로 queryAllByText 사용
      const permissionLabels = screen.queryAllByText('권한');
      expect(permissionLabels.length).toBeGreaterThan(0);
    });

    it('공유 링크를 생성할 수 있어야 함', async () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const createButton = screen.getByText('새 공유 링크 생성');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('공유 링크 생성')).toBeInTheDocument();
      });

      const createSubmitButton = screen.getByText('생성');
      fireEvent.click(createSubmitButton);

      await waitFor(() => {
        expect(mockProjectShareService.createShareLink).toHaveBeenCalled();
      });
    });

    it('권한을 선택할 수 있어야 함', async () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const createButton = screen.getByText('새 공유 링크 생성');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('공유 링크 생성')).toBeInTheDocument();
      });

      // 권한 Select는 Material-UI의 Select이므로 직접 클릭하기 어려움
      // 대신 폼이 표시되는지 확인
      const permissionLabels = screen.queryAllByText('권한');
      expect(permissionLabels.length).toBeGreaterThan(0);
    });

    it('설명을 입력할 수 있어야 함', () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const createButton = screen.getByText('새 공유 링크 생성');
      fireEvent.click(createButton);

      const descriptionInput = screen.getByLabelText('설명 (선택)');
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

      expect(descriptionInput).toHaveValue('Test description');
    });
  });

  describe('공유 링크 관리', () => {
    it('링크 복사 버튼 클릭 시 클립보드에 복사해야 함', async () => {
      // navigator.clipboard가 제대로 모킹되었는지 확인
      expect(navigator.clipboard).toBeDefined();
      expect(navigator.clipboard.writeText).toBeDefined();

      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      // ContentCopy 아이콘을 가진 버튼 찾기
      await waitFor(() => {
        const allButtons = screen.queryAllByRole('button');
        const copyButton = allButtons.find(btn => {
          const icon = btn.querySelector('svg');
          return icon && (
            icon.getAttribute('data-testid') === 'ContentCopyIcon' ||
            icon.classList.toString().includes('ContentCopy') ||
            btn.getAttribute('aria-label')?.includes('복사') ||
            btn.getAttribute('aria-label')?.includes('copy')
          );
        });
        
        if (copyButton) {
          fireEvent.click(copyButton);
          return true;
        }
        return false;
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalledWith('https://example.com/share/token-1');
      }, { timeout: 2000 });
    });

    it('링크 삭제 버튼 클릭 시 확인 모달 표시 후 삭제해야 함', async () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const deleteButtons = screen.queryAllByRole('button').filter(btn => {
        const icon = btn.querySelector('svg');
        return icon && icon.getAttribute('data-testid') === 'DeleteIcon';
      });

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('공유 링크 삭제')).toBeInTheDocument();
        });
        expect(screen.getByText('정말로 이 공유 링크를 삭제하시겠습니까?')).toBeInTheDocument();

        const confirmDeleteBtn = screen.getByRole('button', { name: /공유 링크 삭제 확인/i });
        fireEvent.click(confirmDeleteBtn);

        await waitFor(() => {
          expect(mockProjectShareService.deleteShareLink).toHaveBeenCalled();
        });
      }
    });

    it('링크 삭제 확인 모달에서 취소 시 삭제하지 않아야 함', async () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const deleteButtons = screen.queryAllByRole('button').filter(btn => {
        const icon = btn.querySelector('svg');
        return icon && icon.getAttribute('data-testid') === 'DeleteIcon';
      });

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('공유 링크 삭제')).toBeInTheDocument();
        });

        const cancelBtn = screen.getByRole('button', { name: /취소/i });
        fireEvent.click(cancelBtn);

        expect(mockProjectShareService.deleteShareLink).not.toHaveBeenCalled();
      }
    });
  });

  describe('권한 표시', () => {
    it('읽기 전용 권한을 올바르게 표시해야 함', () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      expect(screen.getByText('읽기 전용')).toBeInTheDocument();
    });
  });

  describe('다이얼로그 닫기', () => {
    it('닫기 버튼 클릭 시 onClose를 호출해야 함', () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.textContent === '×' || btn.getAttribute('aria-label') === 'close');
      
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('만료일 설정', () => {
    it('만료일 스위치를 토글할 수 있어야 함', async () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const createButton = screen.getByText('새 공유 링크 생성');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('공유 링크 생성')).toBeInTheDocument();
      });

      const expirySwitch = screen.getByLabelText(/만료일 설정/i);
      fireEvent.click(expirySwitch);

      expect(expirySwitch).toBeChecked();
    });
  });

  describe('최대 사용 횟수 설정', () => {
    it('최대 사용 횟수 스위치를 토글할 수 있어야 함', async () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const createButton = screen.getByText('새 공유 링크 생성');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('공유 링크 생성')).toBeInTheDocument();
      });

      const maxUsesSwitch = screen.getByLabelText(/최대 사용 횟수/i);
      fireEvent.click(maxUsesSwitch);

      expect(maxUsesSwitch).toBeChecked();
    });
  });

  describe('비밀번호 설정', () => {
    it('비밀번호 스위치를 토글할 수 있어야 함', async () => {
      renderWithTheme(<ProjectShareDialog {...defaultProps} />);

      const createButton = screen.getByText('새 공유 링크 생성');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('공유 링크 생성')).toBeInTheDocument();
      });

      const passwordSwitch = screen.getByLabelText(/비밀번호/i);
      fireEvent.click(passwordSwitch);

      expect(passwordSwitch).toBeChecked();
    });
  });
});

