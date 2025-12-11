/**
 * 프로젝트 템플릿 선택 컴포넌트
 * 템플릿 목록 표시 및 선택 기능
 * 
 * Task-B4: 프로젝트 허브 확장
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Star,
  History,
  Folder,
  MoreVert,
  Edit,
  Delete,
  FileCopy,
  TrendingUp,
} from '@mui/icons-material';
import projectTemplateService, { ProjectTemplate } from '../services/projectTemplateService';
import './ProjectTemplateSelector.css';

interface ProjectTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
  onSaveAsTemplate?: (projectData: any) => void;
}

const ProjectTemplateSelector: React.FC<ProjectTemplateSelectorProps> = ({
  open,
  onClose,
  onSelectTemplate,
  onSaveAsTemplate,
}) => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, selectedTab]);

  const loadTemplates = () => {
    let loadedTemplates: ProjectTemplate[] = [];
    
    switch (selectedTab) {
      case 0: // 전체
        loadedTemplates = projectTemplateService.getAllTemplates();
        break;
      case 1: // 인기
        loadedTemplates = projectTemplateService.getPopularTemplates(20);
        break;
      case 2: // 최근
        loadedTemplates = projectTemplateService.getRecentTemplates(20);
        break;
    }

    if (searchQuery.trim()) {
      loadedTemplates = projectTemplateService.searchTemplates(searchQuery);
    }

    setTemplates(loadedTemplates);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: ProjectTemplate) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleSelectTemplate = (template: ProjectTemplate) => {
    projectTemplateService.incrementUsageCount(template.id);
    onSelectTemplate(template);
    onClose();
  };

  const handleDeleteTemplate = () => {
    if (selectedTemplate) {
      projectTemplateService.deleteTemplate(selectedTemplate.id);
      loadTemplates();
      handleMenuClose();
      setShowDeleteConfirm(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">프로젝트 템플릿 선택</Typography>
            <IconButton size="small" onClick={onClose}>
              <Box component="span" sx={{ fontSize: 20 }}>×</Box>
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* 검색 */}
          <TextField
            fullWidth
            placeholder="템플릿 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* 탭 */}
          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="전체" />
            <Tab label="인기" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="최근" icon={<History />} iconPosition="start" />
          </Tabs>

          {/* 템플릿 목록 */}
          <Box className="template-list">
            {filteredTemplates.length === 0 ? (
              <Box className="empty-state">
                <Folder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  템플릿이 없습니다
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {searchQuery ? '검색 결과가 없습니다.' : '새 템플릿을 만들어 시작하세요.'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="template-card"
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {template.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {template.description}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, template);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={template.category}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        {template.tags.slice(0, 2).map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {template.tags.length > 2 && (
                          <Chip
                            label={`+${template.tags.length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>

                      {template.guidelines.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            지침: {template.guidelines.length}개
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Tooltip title="사용 횟수">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Star sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {template.usageCount}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTemplate(template);
                          }}
                        >
                          사용하기
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 템플릿 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedTemplate) {
              handleSelectTemplate(selectedTemplate);
            }
            handleMenuClose();
          }}
        >
          <FileCopy sx={{ mr: 1, fontSize: 18 }} />
          사용하기
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowDeleteConfirm(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1, fontSize: 18 }} />
          삭제
        </MenuItem>
      </Menu>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>템플릿 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 "{selectedTemplate?.name}" 템플릿을 삭제하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>취소</Button>
          <Button onClick={handleDeleteTemplate} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectTemplateSelector;

