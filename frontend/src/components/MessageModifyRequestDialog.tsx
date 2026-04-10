/**
 * 메시지 수정 요청 다이얼로그
 * 생성된 응답에 대한 수정 요청을 입력받는 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { coerceTrimmedString } from '../utils/chatInputUtils';

interface MessageModifyRequestDialogProps {
  open: boolean;
  originalMessage: string;
  onClose: () => void;
  onConfirm: (modifyRequest: string) => void;
}

export const MessageModifyRequestDialog: React.FC<MessageModifyRequestDialogProps> = ({
  open,
  originalMessage,
  onClose,
  onConfirm,
}) => {
  const [modifyRequest, setModifyRequest] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setModifyRequest('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    const trimmed = coerceTrimmedString(modifyRequest, '');
    if (!trimmed) {
      setError('수정 요청을 입력해주세요.');
      return;
    }

    onConfirm(trimmed);
    setModifyRequest('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'var(--bg-primary, #ffffff)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div">
          응답 수정 요청
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          생성된 응답을 어떻게 수정할지 요청해주세요.
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            원본 응답:
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: 'var(--bg-secondary, #f8fafc)',
              borderRadius: 1,
              maxHeight: 200,
              overflow: 'auto',
              border: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'var(--text-secondary, #64748b)',
              }}
            >
              {originalMessage}
            </Typography>
          </Box>
        </Box>

        <TextField
          autoFocus
          fullWidth
          multiline
          rows={4}
          label="수정 요청"
          placeholder="예: 더 간결하게 작성해주세요, 전문 용어를 쉽게 설명해주세요, 예시를 추가해주세요 등"
          value={modifyRequest}
          onChange={(e) => {
            setModifyRequest(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyPress}
          error={!!error}
          helperText={error || 'Ctrl+Enter로 확인, Esc로 취소'}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'var(--bg-primary, #ffffff)',
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          취소
        </Button>
        <Button
          onClick={() => handleConfirm()}
          variant="contained"
          disabled={!coerceTrimmedString(modifyRequest, '')}
          sx={{
            bgcolor: 'var(--accent-primary, #667eea)',
            '&:hover': {
              bgcolor: 'var(--accent-primary-hover, #5568d3)',
            },
          }}
        >
          수정 요청
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageModifyRequestDialog;

