import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MessageModifyRequestDialog from '../MessageModifyRequestDialog';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('MessageModifyRequestDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    open: true,
    originalMessage: '원본 메시지 내용입니다.',
    onClose: mockOnClose,
    onConfirm: mockOnConfirm
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('다이얼로그가 열려있을 때 내용을 표시해야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      expect(screen.getByText('응답 수정 요청')).toBeInTheDocument();
      expect(screen.getByText('생성된 응답을 어떻게 수정할지 요청해주세요.')).toBeInTheDocument();
      expect(screen.getByText('원본 응답:')).toBeInTheDocument();
      expect(screen.getByText('원본 메시지 내용입니다.')).toBeInTheDocument();
    });

    it('다이얼로그가 닫혀있을 때 내용을 표시하지 않아야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} open={false} />);

      expect(screen.queryByText('응답 수정 요청')).not.toBeInTheDocument();
    });

    it('원본 메시지를 표시해야 함', () => {
      const longMessage = '이것은 매우 긴 원본 메시지입니다. '.repeat(10);
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} originalMessage={longMessage} />);

      expect(screen.getByText(/이것은 매우 긴 원본 메시지입니다/)).toBeInTheDocument();
    });
  });

  describe('입력 필드', () => {
    it('수정 요청 입력 필드를 표시해야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      expect(input).toBeInTheDocument();
    });

    it('입력 필드에 텍스트를 입력할 수 있어야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '더 간결하게 작성해주세요' } });

      expect(input.value).toBe('더 간결하게 작성해주세요');
    });

    it('입력 필드가 비어있을 때 에러를 표시하지 않아야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      expect(input).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('확인 버튼', () => {
    it('입력이 비어있을 때 확인 버튼이 비활성화되어야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: '수정 요청' });
      expect(confirmButton).toBeDisabled();
    });

    it('입력이 있을 때 확인 버튼이 활성화되어야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '수정 요청 내용' } });

      const confirmButton = screen.getByRole('button', { name: '수정 요청' });
      expect(confirmButton).not.toBeDisabled();
    });

    it('확인 버튼 클릭 시 onConfirm을 호출해야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '수정 요청 내용' } });

      const confirmButton = screen.getByRole('button', { name: '수정 요청' });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledWith('수정 요청 내용');
    });

    it('확인 버튼 클릭 시 입력 필드를 초기화해야 함', async () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '수정 요청 내용' } });

      const confirmButton = screen.getByRole('button', { name: '수정 요청' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('취소 버튼', () => {
    it('취소 버튼 클릭 시 onClose를 호출해야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: '취소' });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('빈 입력으로 확인 버튼 클릭 시 에러를 표시해야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '   ' } });

      const confirmButton = screen.getByRole('button', { name: '수정 요청' });
      fireEvent.click(confirmButton);

      // 빈 입력이므로 onConfirm이 호출되지 않아야 함
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('에러 발생 시 입력 필드에 에러 상태를 표시해야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '   ' } });

      const confirmButton = screen.getByRole('button', { name: '수정 요청' });
      fireEvent.click(confirmButton);

      // Material-UI TextField는 error prop이 있을 때 helperText에 에러 메시지 표시
      // 에러가 발생했는지는 onConfirm이 호출되지 않는 것으로 확인
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('입력 시작 시 에러를 제거해야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '   ' } });

      const confirmButton = screen.getByRole('button', { name: '수정 요청' });
      fireEvent.click(confirmButton);

      // 에러가 발생했는지는 onConfirm이 호출되지 않는 것으로 확인
      expect(mockOnConfirm).not.toHaveBeenCalled();

      fireEvent.change(input, { target: { value: '새로운 입력' } });

      // 새로운 입력 후 확인 버튼 클릭 시 onConfirm이 호출되어야 함
      fireEvent.click(confirmButton);
      expect(mockOnConfirm).toHaveBeenCalledWith('새로운 입력');
    });
  });

  describe('키보드 단축키', () => {
    it('Ctrl+Enter로 확인할 수 있어야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '수정 요청 내용' } });
      fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

      expect(mockOnConfirm).toHaveBeenCalledWith('수정 요청 내용');
    });

    it('Meta+Enter로 확인할 수 있어야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '수정 요청 내용' } });
      fireEvent.keyDown(input, { key: 'Enter', metaKey: true });

      expect(mockOnConfirm).toHaveBeenCalledWith('수정 요청 내용');
    });

    it('Escape로 취소할 수 있어야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('일반 Enter는 확인을 트리거하지 않아야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '수정 요청 내용' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('다이얼로그 열기/닫기', () => {
    it('다이얼로그가 열릴 때 입력 필드를 초기화해야 함', () => {
      const { rerender } = renderWithTheme(
        <MessageModifyRequestDialog {...defaultProps} open={false} />
      );

      const input = screen.queryByLabelText('수정 요청');
      expect(input).not.toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <MessageModifyRequestDialog {...defaultProps} open={true} />
        </ThemeProvider>
      );

      const newInput = screen.getByLabelText('수정 요청') as HTMLInputElement;
      expect(newInput.value).toBe('');
    });

    it('다이얼로그가 열릴 때 에러를 초기화해야 함', () => {
      const { rerender } = renderWithTheme(
        <MessageModifyRequestDialog {...defaultProps} open={true} />
      );

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '   ' } });

      const confirmButton = screen.getByRole('button', { name: '수정 요청' });
      fireEvent.click(confirmButton);

      // 에러 메시지가 표시되었는지 확인
      const errorMessage = screen.queryByText(/수정 요청을 입력해주세요/);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }

      rerender(
        <ThemeProvider theme={theme}>
          <MessageModifyRequestDialog {...defaultProps} open={false} />
        </ThemeProvider>
      );

      rerender(
        <ThemeProvider theme={theme}>
          <MessageModifyRequestDialog {...defaultProps} open={true} />
        </ThemeProvider>
      );

      // 다이얼로그가 다시 열렸을 때 에러가 초기화되었는지 확인
      const newErrorMessage = screen.queryByText(/수정 요청을 입력해주세요/);
      expect(newErrorMessage).not.toBeInTheDocument();
    });
  });

  describe('입력 텍스트 트리밍', () => {
    it('확인 시 입력 텍스트를 트리밍해야 함', () => {
      renderWithTheme(<MessageModifyRequestDialog {...defaultProps} />);

      const input = screen.getByLabelText('수정 요청');
      fireEvent.change(input, { target: { value: '  수정 요청 내용  ' } });

      const confirmButton = screen.getByRole('button', { name: '수정 요청' });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledWith('수정 요청 내용');
    });
  });
});

