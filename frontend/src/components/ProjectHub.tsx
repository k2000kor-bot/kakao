/**
 * 프로젝트 허브 컴포넌트
 * 프로젝트 검색, 필터링, 통계, 템플릿, 공유 기능 제공
 * 
 * Task-B4: 프로젝트 허브 확장
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Chip,
    Button,
    Card,
    CardContent,
    Typography,
    Menu,
    MenuItem,
    IconButton,
    Tooltip,
    Select,
    FormControl,
    InputLabel,
    Divider,
} from '@mui/material';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
    Search,
    Sort,
    Share,
    Archive,
    Delete,
    Edit,
    MoreVert,
    Add,
    GridView,
    ViewList,
    Chat as MessageSquare,
    Folder,
} from '@mui/icons-material';
// import { systemService } from '../services/projectService'; // Reserved for future use
import ProjectShareDialog from './ProjectShareDialog';
import './ProjectHub.css';

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'archived' | 'completed';
    createdAt: Date;
    updatedAt: Date;
    messageCount?: number;
    fileCount?: number;
    tags?: string[];
    category?: string;
}

interface ProjectHubProps {
    projects: Project[];
    onProjectSelect: (project: Project) => void;
    onProjectCreate: () => void;
    onProjectEdit?: (projectId: string) => void;
    onProjectDelete?: (projectId: string) => void;
    onProjectArchive?: (projectId: string) => void;
}

interface ProjectStats {
    total: number;
    active: number;
    archived: number;
    completed: number;
    totalMessages: number;
    totalFiles: number;
}

const ProjectHub: React.FC<ProjectHubProps> = ({
    projects,
    onProjectSelect,
    onProjectCreate,
    onProjectEdit,
    onProjectDelete,
    onProjectArchive,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived' | 'completed'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'messageCount'>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [_selectedTab, _setSelectedTab] = useState(0);
    void _selectedTab;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showStats, _setShowStats] = useState(true);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [projectToShare, setProjectToShare] = useState<Project | null>(null);

    // 프로젝트 통계 계산
    const stats: ProjectStats = useMemo(() => {
        return {
            total: projects.length,
            active: projects.filter(p => p.status === 'active').length,
            archived: projects.filter(p => p.status === 'archived').length,
            completed: projects.filter(p => p.status === 'completed').length,
            totalMessages: projects.reduce((sum, p) => sum + (p.messageCount || 0), 0),
            totalFiles: projects.reduce((sum, p) => sum + (p.fileCount || 0), 0),
        };
    }, [projects]);

    // 필터링 및 정렬된 프로젝트
    const filteredProjects = useMemo(() => {
        let filtered = [...projects];

        // 검색어 필터링
        if (coerceTrimmedString(searchQuery, '')) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(query) ||
                project.description?.toLowerCase().includes(query) ||
                project.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // 상태 필터링
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        // 카테고리 필터링
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        // 정렬
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'createdAt':
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
                case 'updatedAt':
                    comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
                    break;
                case 'messageCount':
                    comparison = (a.messageCount || 0) - (b.messageCount || 0);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [projects, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder]);

    // 고유 카테고리 목록
    const categories = useMemo(() => {
        const cats = new Set(projects.map(p => p.category).filter(Boolean));
        return Array.from(cats);
    }, [projects]);

    const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, project: Project) => {
        setAnchorEl(event.currentTarget);
        setSelectedProject(project);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
        setSelectedProject(null);
    }, []);

    const handleShare = useCallback((project: Project) => {
        setProjectToShare(project);
        setShowShareDialog(true);
        handleMenuClose();
    }, [handleMenuClose]);

    const formatDate = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / 86400000);

        if (days === 0) {
            return '오늘';
        } else if (days === 1) {
            return '어제';
        } else if (days < 7) {
            return `${days}일 전`;
        } else if (days < 30) {
            return `${Math.floor(days / 7)}주 전`;
        } else {
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
    };

    return (
        <Box className="project-hub" data-testid="project-hub-root">
            {/* 헤더 */}
            <Box className="project-hub-header">
                <Box className="project-hub-header-top" sx={{ mb: 2 }}>
                    <Typography component="h2" variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                        프로젝트 목록
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        검색·필터로 찾은 뒤 행을 클릭하면 해당 프로젝트 대화 화면으로 이동합니다.
                    </Typography>
                </Box>

                {/* 통계 카드 */}
                {showStats && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                        <Card className="stat-card">
                            <CardContent>
                                <Typography variant="h4" color="primary">
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    전체 프로젝트
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card className="stat-card">
                            <CardContent>
                                <Typography variant="h4" color="success.main">
                                    {stats.active}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    활성
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card className="stat-card">
                            <CardContent>
                                <Typography variant="h4" color="info.main">
                                    {stats.totalMessages}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    총 메시지
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card className="stat-card">
                            <CardContent>
                                <Typography variant="h4" color="warning.main">
                                    {stats.totalFiles}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    총 파일
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* 검색 및 필터 */}
                <Box className="project-hub-controls">
                    <TextField
                        fullWidth
                        placeholder="프로젝트 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        inputProps={{ 'aria-label': '프로젝트 검색' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search aria-hidden="true" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>상태</InputLabel>
                            <Select
                                value={statusFilter}
                                label="상태"
                                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived' | 'completed')}
                            >
                                <MenuItem value="all">전체</MenuItem>
                                <MenuItem value="active">활성</MenuItem>
                                <MenuItem value="archived">보관됨</MenuItem>
                                <MenuItem value="completed">완료</MenuItem>
                            </Select>
                        </FormControl>

                        {categories.length > 0 && (
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>카테고리</InputLabel>
                                <Select
                                    value={categoryFilter}
                                    label="카테고리"
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <MenuItem value="all">전체</MenuItem>
                                    {categories.map(cat => (
                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>정렬</InputLabel>
                            <Select
                                value={sortBy}
                                label="정렬"
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'updatedAt' | 'messageCount')}
                            >
                                <MenuItem value="name">이름</MenuItem>
                                <MenuItem value="createdAt">생성일</MenuItem>
                                <MenuItem value="updatedAt">수정일</MenuItem>
                                <MenuItem value="messageCount">메시지 수</MenuItem>
                            </Select>
                        </FormControl>

                        <IconButton
                            type="button"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            title={sortOrder === 'asc' ? '내림차순' : '오름차순'}
                            aria-label={sortOrder === 'asc' ? '내림차순으로 정렬' : '오름차순으로 정렬'}
                        >
                            <Sort aria-hidden="true" />
                        </IconButton>

                        <Box sx={{ flex: 1 }} />

                        <IconButton
                            type="button"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            title={viewMode === 'grid' ? '리스트 보기' : '그리드 보기'}
                            aria-label={viewMode === 'grid' ? '리스트 보기로 전환' : '그리드 보기로 전환'}
                        >
                            {viewMode === 'grid' ? <ViewList aria-hidden="true" /> : <GridView aria-hidden="true" />}
                        </IconButton>

                        <Button
                            type="button"
                            variant="contained"
                            startIcon={<Add aria-hidden="true" />}
                            onClick={onProjectCreate}
                            sx={{
                                bgcolor: 'var(--accent-info-figma)',
                                color: 'var(--on-accent)',
                                '&:hover': { bgcolor: 'var(--accent-info-figma-hover)' },
                            }}
                            aria-label="새 프로젝트 만들기"
                        >
                            새 프로젝트
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* 프로젝트 목록 */}
            <Box className="project-hub-content">
                {filteredProjects.length === 0 ? (
                    <Box className="empty-state" role="status" aria-live="polite">
                        <Folder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            프로젝트가 없습니다
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {searchQuery ? '검색 결과가 없습니다.' : '새 프로젝트를 만들어 시작하세요.'}
                        </Typography>
                        {!searchQuery && (
                            <Button
                                type="button"
                                variant="contained"
                                startIcon={<Add />}
                                onClick={onProjectCreate}
                                aria-label="새 프로젝트 만들기"
                            >
                                프로젝트 만들기
                            </Button>
                        )}
                    </Box>
                ) : viewMode === 'list' ? (
                    <ul className="project-hub-list" role="list" aria-label="프로젝트 목록">
                        {filteredProjects.map((project) => (
                            <li key={project.id} className="project-hub-list-item">
                                <Card
                                    className="project-card project-hub-list-row"
                                    component="div"
                                    onClick={() => onProjectSelect(project)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            '&:last-child': { pb: 1.5 },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                alignItems: 'flex-start',
                                                gap: 1.5,
                                                rowGap: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 1,
                                                    flex: '1 1 14rem',
                                                    minWidth: 0,
                                                }}
                                            >
                                                <Folder sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }} aria-hidden />
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography
                                                        component="h3"
                                                        variant="subtitle1"
                                                        sx={{ fontWeight: 600, lineHeight: 1.3 }}
                                                        title={project.name}
                                                    >
                                                        {project.name}
                                                    </Typography>
                                                    {project.description ? (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mt: 0.25,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                            }}
                                                        >
                                                            {project.description}
                                                        </Typography>
                                                    ) : null}
                                                </Box>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    gap: 0.75,
                                                    flex: '2 1 auto',
                                                }}
                                            >
                                                <Chip
                                                    label={project.status === 'active' ? '활성' : project.status === 'archived' ? '보관됨' : '완료'}
                                                    size="small"
                                                    color={project.status === 'active' ? 'success' : project.status === 'archived' ? 'default' : 'primary'}
                                                />
                                                {project.category && (
                                                    <Chip label={project.category} size="small" variant="outlined" />
                                                )}
                                                {project.tags && project.tags.length > 0 ? (
                                                    <>
                                                        {project.tags.slice(0, 2).map((tag, idx) => (
                                                            <Chip key={idx} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                        ))}
                                                        {project.tags.length > 2 ? (
                                                            <Chip label={`+${project.tags.length - 2}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                        ) : null}
                                                    </>
                                                ) : null}
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    flexWrap: 'wrap',
                                                    ml: { xs: 0, sm: 'auto' },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                    {project.messageCount !== undefined && (
                                                        <Tooltip title="메시지 수">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <MessageSquare sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                <Typography variant="caption" color="text.secondary" component="span">
                                                                    {project.messageCount}
                                                                </Typography>
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                    {project.fileCount !== undefined && (
                                                        <Tooltip title="파일 수">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Folder sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                <Typography variant="caption" color="text.secondary" component="span">
                                                                    {project.fileCount}
                                                                </Typography>
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                                    {formatDate(project.updatedAt)}
                                                </Typography>
                                                <IconButton
                                                    type="button"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMenuOpen(e, project);
                                                    }}
                                                    aria-label={`${project.name} 프로젝트 메뉴`}
                                                >
                                                    <MoreVert aria-hidden="true" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                        {filteredProjects.map((project) => (
                            <Card
                                key={project.id}
                                className="project-card"
                                onClick={() => onProjectSelect(project)}
                                sx={{
                                    cursor: 'pointer',
                                    height: '100%',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                            <Folder sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                                                {project.name}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            type="button"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMenuOpen(e, project);
                                            }}
                                            aria-label={`${project.name} 프로젝트 메뉴`}
                                        >
                                            <MoreVert aria-hidden="true" />
                                        </IconButton>
                                    </Box>

                                    {project.description && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {project.description}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={project.status === 'active' ? '활성' : project.status === 'archived' ? '보관됨' : '완료'}
                                            size="small"
                                            color={project.status === 'active' ? 'success' : project.status === 'archived' ? 'default' : 'primary'}
                                        />
                                        {project.category && (
                                            <Chip label={project.category} size="small" variant="outlined" />
                                        )}
                                    </Box>

                                    {project.tags && project.tags.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                                            {project.tags.slice(0, 3).map((tag, idx) => (
                                                <Chip key={idx} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                            ))}
                                            {project.tags.length > 3 && (
                                                <Chip label={`+${project.tags.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                            )}
                                        </Box>
                                    )}

                                    <Divider sx={{ my: 1 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            {project.messageCount !== undefined && (
                                                <Tooltip title="메시지 수">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <MessageSquare sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {project.messageCount}
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            )}
                                            {project.fileCount !== undefined && (
                                                <Tooltip title="파일 수">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Folder sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {project.fileCount}
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            )}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(project.updatedAt)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>

            {/* 프로젝트 메뉴 */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{
                    'aria-label': selectedProject ? `${selectedProject.name} 프로젝트 작업 메뉴` : '프로젝트 메뉴',
                    role: 'menu',
                }}
            >
                {onProjectEdit && (
                    <MenuItem onClick={() => {
                        if (selectedProject) onProjectEdit(selectedProject.id);
                        handleMenuClose();
                    }} role="menuitem" aria-label="프로젝트 편집">
                        <Edit sx={{ mr: 1, fontSize: 18 }} aria-hidden="true" />
                        편집
                    </MenuItem>
                )}
                <MenuItem onClick={() => {
                    if (selectedProject) handleShare(selectedProject);
                }} role="menuitem" aria-label="프로젝트 공유">
                    <Share sx={{ mr: 1, fontSize: 18 }} aria-hidden="true" />
                    공유
                </MenuItem>
                {onProjectArchive && (
                    <MenuItem onClick={() => {
                        if (selectedProject) onProjectArchive(selectedProject.id);
                        handleMenuClose();
                    }} role="menuitem" aria-label="프로젝트 보관">
                        <Archive sx={{ mr: 1, fontSize: 18 }} aria-hidden="true" />
                        보관
                    </MenuItem>
                )}
                {onProjectDelete && (
                    <MenuItem
                        onClick={() => {
                            if (selectedProject) {
                                onProjectDelete(selectedProject.id);
                            }
                            handleMenuClose();
                        }}
                        sx={{ color: 'error.main' }}
                        role="menuitem"
                        aria-label="프로젝트 삭제"
                    >
                        <Delete sx={{ mr: 1, fontSize: 18 }} aria-hidden="true" />
                        삭제
                    </MenuItem>
                )}
            </Menu>

            {/* 프로젝트 공유 다이얼로그 */}
            {projectToShare && (
                <ProjectShareDialog
                    open={showShareDialog}
                    onClose={() => {
                        setShowShareDialog(false);
                        setProjectToShare(null);
                    }}
                    projectId={projectToShare.id}
                    projectName={projectToShare.name}
                />
            )}
        </Box>
    );
};

export default ProjectHub;

