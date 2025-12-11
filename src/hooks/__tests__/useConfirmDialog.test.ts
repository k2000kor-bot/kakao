/**
 * useConfirmDialog 훅 테스트
 * 확인 다이얼로그 훅의 정상 작동 확인
 */

import { renderHook, act } from '@testing-library/react';
import { useConfirmDialog } from '../useConfirmDialog';

describe('useConfirmDialog', () => {
  it('초기 상태가 올바르게 설정되어야 함', () => {
    const { result } = renderHook(() => useConfirmDialog());

    expect(result.current.dialogState.open).toBe(false);
    expect(result.current.dialogState.message).toBe('');
  });

  it('showConfirm을 호출하면 다이얼로그가 열려야 함', () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.showConfirm({
        message: '정말 삭제하시겠습니까?',
        title: '삭제 확인',
      });
    });

    expect(result.current.dialogState.open).toBe(true);
    expect(result.current.dialogState.message).toBe('정말 삭제하시겠습니까?');
    expect(result.current.dialogState.title).toBe('삭제 확인');
  });

  it('handleConfirm을 호출하면 onConfirm 콜백이 실행되어야 함', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const onConfirm = jest.fn();

    act(() => {
      result.current.showConfirm(
        {
          message: '정말 삭제하시겠습니까?',
        },
        onConfirm
      );
    });

    act(() => {
      result.current.handleConfirm();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.dialogState.open).toBe(false);
  });

  it('handleCancel을 호출하면 onCancel 콜백이 실행되어야 함', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const onCancel = jest.fn();

    act(() => {
      result.current.showConfirm(
        {
          message: '정말 삭제하시겠습니까?',
        },
        undefined,
        onCancel
      );
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(result.current.dialogState.open).toBe(false);
  });

  it('closeDialog를 호출하면 다이얼로그가 닫혀야 함', () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.showConfirm({
        message: '정말 삭제하시겠습니까?',
      });
    });

    expect(result.current.dialogState.open).toBe(true);

    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.dialogState.open).toBe(false);
  });

  it('다양한 타입의 다이얼로그를 설정할 수 있어야 함', () => {
    const { result } = renderHook(() => useConfirmDialog());

    const types: Array<'warning' | 'error' | 'info' | 'success'> = [
      'warning',
      'error',
      'info',
      'success',
    ];

    types.forEach((type) => {
      act(() => {
        result.current.showConfirm({
          message: '테스트 메시지',
          type,
        });
      });

      expect(result.current.dialogState.type).toBe(type);
    });
  });

  it('커스텀 확인/취소 버튼 텍스트를 설정할 수 있어야 함', () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.showConfirm({
        message: '정말 삭제하시겠습니까?',
        confirmText: '삭제',
        cancelText: '취소',
      });
    });

    expect(result.current.dialogState.confirmText).toBe('삭제');
    expect(result.current.dialogState.cancelText).toBe('취소');
  });
});

