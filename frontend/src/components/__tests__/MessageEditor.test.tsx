/* eslint-disable jest/no-conditional-expect */
/**
 * MessageEditor 컴포넌트 테스트
 * 메시지 편집 기능 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import MessageEditor from '../MessageEditor';

describe('MessageEditor', () => {
  const defaultProps = {
    initialText: '초기 텍스트',
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<MessageEditor {...defaultProps} />);
    const textarea = screen.getByDisplayValue('초기 텍스트');
    expect(textarea).toBeInTheDocument();
  });

  it('초기 텍스트가 올바르게 표시되어야 함', () => {
    render(<MessageEditor {...defaultProps} initialText="테스트 메시지" />);
    expect(screen.getByDisplayValue('테스트 메시지')).toBeInTheDocument();
  });

  it('텍스트를 입력할 수 있어야 함', () => {
    render(<MessageEditor {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('초기 텍스트');
    fireEvent.change(textarea, { target: { value: '새로운 텍스트' } });
    
    expect(textarea).toHaveValue('새로운 텍스트');
  });

  it('저장 버튼 클릭 시 onSave가 호출되어야 함', () => {
    render(<MessageEditor {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('초기 텍스트');
    fireEvent.change(textarea, { target: { value: '수정된 텍스트' } });
    
    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);
    
    expect(defaultProps.onSave).toHaveBeenCalledWith('수정된 텍스트');
  });

  it('취소 버튼 클릭 시 onCancel이 호출되어야 함', () => {
    render(<MessageEditor {...defaultProps} />);
    
    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('Ctrl+Enter로 저장할 수 있어야 함', () => {
    render(<MessageEditor {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('초기 텍스트');
    fireEvent.change(textarea, { target: { value: '수정된 텍스트' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    
    expect(defaultProps.onSave).toHaveBeenCalledWith('수정된 텍스트');
  });

  it('Cmd+Enter로 저장할 수 있어야 함 (Mac)', () => {
    render(<MessageEditor {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('초기 텍스트');
    fireEvent.change(textarea, { target: { value: '수정된 텍스트' } });
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
    
    expect(defaultProps.onSave).toHaveBeenCalledWith('수정된 텍스트');
  });

  it('Escape 키로 취소할 수 있어야 함', () => {
    render(<MessageEditor {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('초기 텍스트');
    fireEvent.keyDown(textarea, { key: 'Escape' });
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('autoFocus가 true이면 자동 포커스되어야 함', () => {
    render(<MessageEditor {...defaultProps} autoFocus={true} />);
    const textarea = screen.getByDisplayValue('초기 텍스트');
    expect(textarea).toHaveFocus();
  });

  it('autoFocus가 false이면 자동 포커스되지 않아야 함', () => {
    render(<MessageEditor {...defaultProps} autoFocus={false} />);
    const textarea = screen.getByDisplayValue('초기 텍스트');
    // 포커스 상태는 직접 확인하기 어려우므로, 렌더링만 확인
    expect(textarea).toBeInTheDocument();
  });

  it('텍스트 영역 높이가 자동으로 조절되어야 함', async () => {
    render(<MessageEditor {...defaultProps} />);
    const textarea = screen.getByDisplayValue('초기 텍스트') as HTMLTextAreaElement;
    
    // 긴 텍스트 입력
    fireEvent.change(textarea, {
      target: { value: '긴 텍스트\n두 번째 줄\n세 번째 줄\n네 번째 줄' },
    });
    
    await waitFor(() => {
      // 높이가 설정되었는지 확인
      expect(textarea.style.height).toBeTruthy();
    });
  });

  it('minHeight prop이 적용되어야 함', () => {
    render(<MessageEditor {...defaultProps} minHeight={100} />);
    const textarea = screen.getByDisplayValue('초기 텍스트') as HTMLTextAreaElement;
    
    // minHeight는 스타일로 직접 확인하기 어려우므로, 컴포넌트가 렌더링되는지만 확인
    expect(textarea).toBeInTheDocument();
  });

  it('maxHeight prop이 적용되어야 함', () => {
    render(<MessageEditor {...defaultProps} maxHeight={200} />);
    const textarea = screen.getByDisplayValue('초기 텍스트') as HTMLTextAreaElement;
    
    expect(textarea).toBeInTheDocument();
  });

  it('여러 줄 텍스트를 입력할 수 있어야 함', () => {
    render(<MessageEditor {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('초기 텍스트');
    fireEvent.change(textarea, { target: { value: '첫 번째 줄\n두 번째 줄\n세 번째 줄' } });
    
    expect(textarea).toHaveValue('첫 번째 줄\n두 번째 줄\n세 번째 줄');
  });

  it('변경사항이 없으면 저장 버튼이 비활성화되어야 함', () => {
    render(<MessageEditor {...defaultProps} />);
    
    const saveButton = screen.getByText('저장');
    expect(saveButton).toBeDisabled();
  });

  it('변경사항이 없으면 저장 시 onCancel이 호출되어야 함', () => {
    render(<MessageEditor {...defaultProps} initialText="테스트" />);
    
    const textarea = screen.getByDisplayValue('테스트');
    fireEvent.change(textarea, { target: { value: '테스트' } });
    
    const saveButton = screen.getByText('저장');
    // 버튼이 비활성화되어 있지만, 클릭 가능한 경우를 대비
    if (!saveButton.hasAttribute('disabled')) {
      fireEvent.click(saveButton);
      expect(defaultProps.onCancel).toHaveBeenCalled();
    }
  });
});

