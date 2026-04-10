/**
 * 프로젝트 편집 다이얼로그 컴포넌트
 * 프로젝트 정보 수정
 * 
 * Task-B4: 프로젝트 허브 확장
 */

import React, { useState, useEffect } from 'react';
import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Folder,
  Close,
  AttachMoney,
  School,
  Create,
  Favorite,
  Flight,
} from '@mui/icons-material';

const PROJECT_CATEGORIES = [
  { id: 'investment', label: '투자', icon: AttachMoney, color: 'var(--accent-success)' },
  { id: 'homework', label: '숙제', icon: School, color: 'var(--accent-info)' },
  { id: 'writing', label: '글쓰기', icon: Create, color: 'var(--accent-secondary)' },
  { id: 'health', label: '건강', icon: Favorite, color: 'var(--accent-error)' },
  { id: 'travel', label: '여행', icon: Flight, color: 'var(--accent-warning)' },
  { id: 'other', label: '기타', icon: Folder, color: 'var(--text-secondary)' },
];

interface Project {
  id: string;
  name: string;
  category: string;
  description?: string;
  memoryType?: 'default' | 'project_exclusive';
}

interface ProjectEditDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (projectId: string, updates: Partial<Project>) => Promise<void>;
}

const ProjectEditDialog: React.FC<ProjectEditDialogProps> = ({
  open,
  onClose,
  project,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [memoryType, setMemoryType] = useState<'default' | 'project_exclusive'>('default');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setCategory(project.category || 'other');
      setDescription(project.description || '');
      setMemoryType(project.memoryType || 'default');
    }
  }, [project, open]);

  const handleSave = async () => {
    const nameTrimmed = coerceTrimmedString(name, '');
    if (!project || !nameTrimmed) return;

    setIsSaving(true);
    try {
      await onSave(project.id, {
        name: nameTrimmed,
        category,
        description: coerceTrimmedString(description, '') || undefined,
        memoryType,
      });
      onClose();
    } catch (error) {
      errorLogger.error('프로젝트 업데이트 실패', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategory = PROJECT_CATEGORIES.find(cat => cat.id === category);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Folder />
            <Typography variant="h6">프로젝트 편집</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="닫기">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* 프로젝트 이름 */}
          <TextField
            fullWidth
            label="프로젝트 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            variant="outlined"
          />

          {/* 카테고리 선택 */}
          <FormControl fullWidth>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={category}
              label="카테고리"
              onChange={(e) => setCategory(e.target.value)}
            >
              {PROJECT_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon sx={{ fontSize: 20, color: cat.color }} />
                      <Typography>{cat.label}</Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* 설명 */}
          <TextField
            fullWidth
            label="설명 (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            variant="outlined"
            placeholder="프로젝트에 대한 설명을 입력하세요"
          />

          {/* 메모리 타입 */}
          <FormControl fullWidth>
            <InputLabel>메모리 타입</InputLabel>
            <Select
              value={memoryType}
              label="메모리 타입"
              onChange={(e) => setMemoryType(e.target.value as 'default' | 'project_exclusive')}
            >
              <MenuItem value="default">기본 (전역 메모리 공유)</MenuItem>
              <MenuItem value="project_exclusive">프로젝트 전용 (독립 메모리)</MenuItem>
            </Select>
          </FormControl>

          {/* 선택된 카테고리 미리보기 */}
          {selectedCategory && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'var(--bg-secondary)', borderRadius: 1 }}>
              <selectedCategory.icon sx={{ color: selectedCategory.color }} />
              <Typography variant="body2" color="text.secondary">
                카테고리: {selectedCategory.label}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          onClick={() => void handleSave()}
          variant="contained"
          disabled={!coerceTrimmedString(name, '') || isSaving}
        >
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectEditDialog;

