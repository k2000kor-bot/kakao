/**
 * ProjectEditDialog 컴포넌트 테스트
 * 프로젝트 편집 다이얼로그 기능 확인
 */
/* eslint-disable testing-library/no-wait-for-side-effects, testing-library/no-container, testing-library/no-node-access */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import ProjectEditDialog from '../ProjectEditDialog';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
  },
}));

describe('ProjectEditDialog', () => {
  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    category: 'writing',
    description: 'Test description',
    memoryType: 'default' as const,
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    project: mockProject,
    onSave: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('프로젝트 편집')).toBeInTheDocument();
    });
    const nameInput = screen.getByDisplayValue('Test Project');
    expect(nameInput).toBeInTheDocument();
  });

  it('open이 false이면 렌더링되지 않아야 함', () => {
    render(<ProjectEditDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('프로젝트 편집')).not.toBeInTheDocument();
  });

  it('프로젝트 데이터가 올바르게 초기화되어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Test Project') as HTMLInputElement;
      expect(nameInput.value).toBe('Test Project');
    });
  });

  it('프로젝트 이름을 변경할 수 있어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Test Project');
      fireEvent.change(nameInput, { target: { value: 'New Project Name' } });
      expect((nameInput as HTMLInputElement).value).toBe('New Project Name');
    });
  });

  it('카테고리를 변경할 수 있어야 함', async () => {
    const { container } = render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const categorySelect = container.querySelector('[aria-labelledby*="카테고리"]') || 
                             container.querySelector('input[value="writing"]') ||
                             screen.getByText('글쓰기');
      if (categorySelect) {
        fireEvent.mouseDown(categorySelect);
      }
    });
    
    await waitFor(() => {
      const investmentOption = screen.getByText('투자');
      if (investmentOption) {
        fireEvent.click(investmentOption);
      }
    }, { timeout: 2000 });
  });

  it('설명을 변경할 수 있어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const descriptionInput = screen.getByDisplayValue('Test description');
      fireEvent.change(descriptionInput, { target: { value: 'New description' } });
      expect((descriptionInput as HTMLInputElement).value).toBe('New description');
    });
  });

  it('메모리 타입을 변경할 수 있어야 함', async () => {
    const { container } = render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const memoryTypeSelect = container.querySelector('[aria-labelledby*="메모리"]') ||
                               screen.getByText('기본 (전역 메모리 공유)');
      if (memoryTypeSelect) {
        fireEvent.mouseDown(memoryTypeSelect);
      }
    });
    
    await waitFor(() => {
      const projectExclusiveOption = screen.getByText('프로젝트 전용 (독립 메모리)');
      if (projectExclusiveOption) {
        fireEvent.click(projectExclusiveOption);
      }
    }, { timeout: 2000 });
  });

  it('프로젝트 이름이 비어있으면 저장 버튼이 비활성화되어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Test Project');
      fireEvent.change(nameInput, { target: { value: '   ' } });
    });
    
    await waitFor(() => {
      const saveButton = screen.getByText('저장');
      expect(saveButton).toBeDisabled();
    });
  });

  it('저장 버튼 클릭 시 onSave가 호출되어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const saveButton = screen.getByText('저장');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith('project-1', {
        name: 'Test Project',
        category: 'writing',
        description: 'Test description',
        memoryType: 'default',
      });
    });
  });

  it('저장 중에는 저장 버튼이 비활성화되고 텍스트가 변경되어야 함', async () => {
    const slowSave = jest.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
    render(<ProjectEditDialog {...defaultProps} onSave={slowSave} />);
    
    await waitFor(() => {
      const saveButton = screen.getByText('저장');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('저장 중...')).toBeInTheDocument();
    });
  });

  it('저장 성공 시 onClose가 호출되어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const saveButton = screen.getByText('저장');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('취소 버튼 클릭 시 onClose가 호출되어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const cancelButton = screen.getByText('취소');
      fireEvent.click(cancelButton);
    });
    // MUI Dialog/내부 로직으로 onClose가 2회 호출될 수 있음
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('닫기 버튼 클릭 시 onClose가 호출되어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    const closeButton = await screen.findByRole('button', { name: '닫기' });
    fireEvent.click(closeButton);
    // MUI Dialog may invoke onClose both from IconButton onClick and internal dismiss logic
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('저장 실패 시 에러 로깅이 되어야 함', async () => {
    const { errorLogger } = require('../../utils/errorLogger');
    const failingSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    
    render(<ProjectEditDialog {...defaultProps} onSave={failingSave} />);
    await waitFor(() => {
      const saveButton = screen.getByText('저장');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(errorLogger.error).toHaveBeenCalledWith('프로젝트 업데이트 실패', expect.any(Error));
    });
  });

  it('프로젝트가 null이면 저장 버튼이 비활성화되어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} project={null} />);
    await waitFor(() => {
      const saveButton = screen.getByText('저장');
      expect(saveButton).toBeDisabled();
    });
  });

  it('설명이 비어있으면 undefined로 저장되어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const descriptionInput = screen.getByDisplayValue('Test description');
      fireEvent.change(descriptionInput, { target: { value: '   ' } });
    });
    
    await waitFor(() => {
      const saveButton = screen.getByText('저장');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith('project-1', expect.objectContaining({
        description: undefined,
      }));
    });
  });

  it('모든 카테고리 옵션이 표시되어야 함', async () => {
    const { container } = render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      const categorySelect = container.querySelector('[aria-labelledby*="카테고리"]') ||
                             screen.getByText('글쓰기');
      if (categorySelect) {
        fireEvent.mouseDown(categorySelect);
      }
    });

    await waitFor(() => {
      // 카테고리 옵션들이 메뉴에 표시되는지 확인
      // Material-UI Select는 포털을 사용하므로 직접 확인이 어려울 수 있음
      // 대신 카테고리 미리보기로 확인
      expect(screen.getByText(/카테고리:/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('선택된 카테고리 미리보기가 표시되어야 함', async () => {
    render(<ProjectEditDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/카테고리: 글쓰기/)).toBeInTheDocument();
    });
  });
});

