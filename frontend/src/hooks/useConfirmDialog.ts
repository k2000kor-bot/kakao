/**
 * 확인 다이얼로그 훅
 * 간편하게 확인 다이얼로그를 사용할 수 있게 해주는 훅
 */

import { useState, useCallback } from 'react';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'warning' | 'info' | 'success';
  showCancel?: boolean;
}

export interface ConfirmDialogState extends ConfirmDialogOptions {
  open: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    open: false,
    message: '',
  });

  const showConfirm = useCallback(
    (
      options: ConfirmDialogOptions,
      onConfirm?: () => void,
      onCancel?: () => void
    ) => {
      setDialogState({
        ...options,
        open: true,
        onConfirm,
        onCancel,
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    closeDialog();
  }, [dialogState, closeDialog]);

  const handleCancel = useCallback(() => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
    closeDialog();
  }, [dialogState, closeDialog]);

  return {
    dialogState,
    showConfirm,
    closeDialog,
    handleConfirm,
    handleCancel,
  };
};

