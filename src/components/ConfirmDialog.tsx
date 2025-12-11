/**
 * 확인 다이얼로그 컴포넌트
 * alert와 window.confirm을 대체하는 모던한 다이얼로그
 */

import React, { useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  Warning,
  Error as ErrorIcon,
  Info,
  CheckCircle,
  Close,
} from '@mui/icons-material';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'warning' | 'info' | 'success';
  showCancel?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = '확인',
  cancelText = '취소',
  confirmColor,
  showCancel = true,
}) => {
  const icon = useMemo(() => {
    switch (type) {
      case 'error':
        return <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} aria-hidden="true" />;
      case 'warning':
        return <Warning sx={{ fontSize: 48, color: 'warning.main' }} aria-hidden="true" />;
      case 'info':
        return <Info sx={{ fontSize: 48, color: 'info.main' }} aria-hidden="true" />;
      case 'success':
        return <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} aria-hidden="true" />;
      default:
        return <Warning sx={{ fontSize: 48, color: 'warning.main' }} aria-hidden="true" />;
    }
  }, [type]);

  const confirmColorValue = useMemo((): 'primary' | 'error' | 'warning' | 'info' | 'success' => {
    if (confirmColor) return confirmColor;
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  }, [confirmColor, type]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      role="dialog"
      aria-modal="true"
    >
      <DialogTitle id="confirm-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {icon}
            <Typography variant="h6" component="h2">{title}</Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={onClose}
            aria-label="다이얼로그 닫기"
            type="button"
          >
            <Close aria-hidden="true" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent id="confirm-dialog-description">
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions role="group" aria-label="다이얼로그 액션">
        {showCancel && (
          <Button 
            onClick={onClose} 
            variant="outlined"
            aria-label={cancelText}
            type="button"
          >
            {cancelText}
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={confirmColorValue}
          autoFocus
          aria-label={confirmText}
          type="button"
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

