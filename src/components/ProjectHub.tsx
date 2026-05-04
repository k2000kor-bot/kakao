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
    Popover,
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

const COLOR_LABEL_KEY = 'corbu.project.colorLabels';
const PROJECT_NOTES_KEY = 'corbu.project.notes';

function loadProjectNotes(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem(PROJECT_NOTES_KEY) || '{}'); } catch { return {}; }
}
function saveProjectNotes(notes: Record<string, string>) {
    try { localStorage.setItem(PROJECT_NOTES_KEY, JSON.stringify(notes)); } catch { /* noop */ }
}
const COLOR_PRESETS: { id: string; name: string; color: string }[] = [
    { id: 'red',    name: '빨강',  color: '#ef4444' },
    { id: 'orange', name: '주황',  color: '#f97316' },
    { id: 'yellow', name: '노랑',  color: '#eab308' },
    { id: 'green',  name: '초록',  color: '#22c55e' },
    { id: 'blue',   name: '파랑',  color: '#3b82f6' },
    { id: 'purple', name: '보라',  color: '#a855f7' },
    { id: 'pink',   name: '분홍',  color: '#ec4899' },
    { id: 'gray',   name: '회색',  color: '#6b7280' },
];

function loadColorLabels(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem(COLOR_LABEL_KEY) || '{}'); } catch { return {}; }
}
function saveColorLabels(labels: Record<string, string>) {
    try { localStorage.setItem(COLOR_LABEL_KEY, JSON.stringify(labels)); } catch { /* noop */ }
}
import { TEST_IDS } from '../constants/testIds';
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
    dueDate?: string; // ISO date string YYYY-MM-DD
    progress?: number; // 0-100 진행률
}

/** 프로젝트 진행률 바 */
function ProjectProgressBar({ progress, status, onEdit }: { progress: number; status: Project['status']; onEdit: (v: number) => void }) {
    const pct = Math.min(100, Math.max(0, Math.round(progress)));
    const color = status === 'completed' || pct === 100 ? '#10b981' : pct >= 60 ? '#6366f1' : pct >= 30 ? '#f59e0b' : '#94a3b8';
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(String(pct));
    const commit = () => {
        const v = Math.min(100, Math.max(0, Number(draft) || 0));
        onEdit(v);
        setEditing(false);
    };
    return (
        <div className="proj-progress-wrap">
            <div className="proj-progress-track" title={`진행률 ${pct}%`} aria-label={`진행률 ${pct}%`}>
                <div
                    className="proj-progress-fill"
                    style={{ width: `${pct}%`, background: color, '--proj-pct': `${pct}` } as React.CSSProperties}
                />
            </div>
            {editing ? (
                <div className="proj-progress-edit">
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onBlur={commit}
                        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
                        className="proj-progress-input"
                        autoFocus
                        aria-label="진행률 입력"
                    />
                    <span className="proj-progress-pct-sign">%</span>
                </div>
            ) : (
                <button
                    type="button"
                    className="proj-progress-label"
                    onClick={() => { setDraft(String(pct)); setEditing(true); }}
                    title="클릭하여 진행률 수정"
                    aria-label={`진행률 ${pct}% — 클릭하여 수정`}
                >
                    {pct}%
                </button>
            )}
        </div>
    );
}

/** D-Day 계산 — 오늘 기준 남은 일수 (음수 = 초과) */
function getDDay(dueDate: string): number {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function DDayBadge({ dueDate }: { dueDate: string }) {
    const days = getDDay(dueDate);
    let label: string;
    let bg: string;
    if (days < 0) { label = `D+${Math.abs(days)}`; bg = '#ef4444'; }
    else if (days === 0) { label = 'D-Day'; bg = '#f97316'; }
    else if (days <= 3) { label = `D-${days}`; bg = '#f59e0b'; }
    else if (days <= 7) { label = `D-${days}`; bg = '#3b82f6'; }
    else { label = `D-${days}`; bg = '#6b7280'; }
    return (
        <span
            className="project-dday-badge"
            style={{ '--dday-bg': bg } as React.CSSProperties}
            title={`마감일: ${dueDate}`}
            aria-label={`마감 ${label}`}
        >
            {label}
        </span>
    );
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
    const [hideArchived, setHideArchived] = useState(() => localStorage.getItem('corbu.projects.hideArchived') !== 'false');

    /* 로컬 진행률 오버레이 (localStorage 영속) */
    const PROJ_PROGRESS_KEY = 'corbu.projects.progress';
    const [progressMap, setProgressMap] = useState<Record<string, number>>(() => {
        try { return JSON.parse(localStorage.getItem(PROJ_PROGRESS_KEY) ?? '{}'); } catch { return {}; }
    });
    const updateProgress = React.useCallback((projectId: string, pct: number) => {
        setProgressMap(prev => {
            const next = { ...prev, [projectId]: pct };
            try { localStorage.setItem(PROJ_PROGRESS_KEY, JSON.stringify(next)); } catch { /* noop */ }
            return next;
        });
    }, []);
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

    // 프로젝트 메모 (스티키 노트)
    const [projectNotes, setProjectNotes] = useState<Record<string, string>>(loadProjectNotes);
    const [notePanelProjectId, setNotePanelProjectId] = useState<string | null>(null);
    const [noteDraft, setNoteDraft] = useState('');

    const openNotePanel = useCallback((e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        setNotePanelProjectId(projectId);
        setNoteDraft(projectNotes[projectId] ?? '');
    }, [projectNotes]);

    const saveNote = useCallback(() => {
        if (!notePanelProjectId) return;
        const updated = { ...projectNotes, [notePanelProjectId]: noteDraft };
        setProjectNotes(updated);
        saveProjectNotes(updated);
        setNotePanelProjectId(null);
    }, [notePanelProjectId, noteDraft, projectNotes]);

    const deleteNote = useCallback((projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = { ...projectNotes };
        delete updated[projectId];
        setProjectNotes(updated);
        saveProjectNotes(updated);
    }, [projectNotes]);

    // 색상 라벨
    const [colorLabels, setColorLabels] = useState<Record<string, string>>(loadColorLabels);
    const [colorPopoverAnchor, setColorPopoverAnchor] = useState<HTMLElement | null>(null);
    const [colorTargetProjectId, setColorTargetProjectId] = useState<string | null>(null);
    const [labelFilter, setLabelFilter] = useState<string>('all');
    const [tagFilter, setTagFilter] = useState<string | null>(null);

    const openColorPopover = useCallback((e: React.MouseEvent<HTMLElement>, projectId: string) => {
        e.stopPropagation();
        setColorTargetProjectId(projectId);
        setColorPopoverAnchor(e.currentTarget);
    }, []);

    const closeColorPopover = useCallback(() => {
        setColorPopoverAnchor(null);
        setColorTargetProjectId(null);
    }, []);

    const applyColorLabel = useCallback((colorId: string | null) => {
        if (!colorTargetProjectId) return;
        setColorLabels(prev => {
            const next = { ...prev };
            if (colorId === null) delete next[colorTargetProjectId];
            else next[colorTargetProjectId] = colorId;
            saveColorLabels(next);
            return next;
        });
        closeColorPopover();
    }, [colorTargetProjectId, closeColorPopover]);

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
    const archivedCount = useMemo(() => projects.filter(p => p.status === 'archived').length, [projects]);

    const filteredProjects = useMemo(() => {
        let filtered = [...projects];

        // 아카이브 숨기기 (statusFilter가 all일 때만)
        if (hideArchived && statusFilter === 'all') {
            filtered = filtered.filter(p => p.status !== 'archived');
        }

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

        // 색상 라벨 필터
        if (labelFilter !== 'all') {
            if (labelFilter === 'none') {
                filtered = filtered.filter(p => !colorLabels[p.id]);
            } else {
                filtered = filtered.filter(p => colorLabels[p.id] === labelFilter);
            }
        }

        // 태그 필터
        if (tagFilter) {
            filtered = filtered.filter(p => (p.tags ?? []).includes(tagFilter));
        }

        return filtered;
    }, [projects, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder, labelFilter, colorLabels, tagFilter, hideArchived]);

    // 고유 카테고리 목록
    const categories = useMemo(() => {
        const cats = new Set(projects.map(p => p.category).filter(Boolean));
        return Array.from(cats);
    }, [projects]);

    // 태그 빠른 필터
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        projects.forEach(p => (p.tags ?? []).forEach(t => tags.add(t)));
        return Array.from(tags).slice(0, 12);
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
        <Box className="project-hub" data-testid={TEST_IDS.PROJECT_HUB_ROOT}>
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
                        placeholder="프로젝트 이름·설명·태그 검색…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        inputProps={{ 'aria-label': '프로젝트 검색' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search aria-hidden="true" />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchQuery('')}
                                        aria-label="검색어 초기화"
                                        title="초기화"
                                    >
                                        ✕
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                        sx={{ mb: 1 }}
                    />
                    {/* 검색 결과 요약 + 활성 필터 배지 */}
                    {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || labelFilter !== 'all') && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                {filteredProjects.length}개 결과
                            </Typography>
                            {searchQuery && (
                                <Chip size="small" label={`"${searchQuery}"`} onDelete={() => setSearchQuery('')} sx={{ fontSize: 11 }} />
                            )}
                            {statusFilter !== 'all' && (
                                <Chip size="small" label={`상태: ${statusFilter}`} onDelete={() => setStatusFilter('all')} sx={{ fontSize: 11 }} />
                            )}
                            {categoryFilter !== 'all' && (
                                <Chip size="small" label={`카테고리: ${categoryFilter}`} onDelete={() => setCategoryFilter('all')} sx={{ fontSize: 11 }} />
                            )}
                            {labelFilter !== 'all' && (
                                <Chip size="small" label={`라벨: ${labelFilter}`} onDelete={() => setLabelFilter('all')} sx={{ fontSize: 11 }} />
                            )}
                            <Button
                                size="small"
                                onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); setLabelFilter('all'); }}
                                sx={{ fontSize: 11, minWidth: 0, px: 1, color: 'text.secondary' }}
                                aria-label="모든 필터 초기화"
                            >
                                전체 초기화
                            </Button>
                        </Box>
                    )}

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

                        {/* 아카이브 숨기기 토글 */}
                        {archivedCount > 0 && statusFilter === 'all' && (
                            <Tooltip title={hideArchived ? `보관된 프로젝트 ${archivedCount}개 표시` : '보관된 프로젝트 숨기기'}>
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => {
                                        const next = !hideArchived;
                                        setHideArchived(next);
                                        localStorage.setItem('corbu.projects.hideArchived', String(next));
                                    }}
                                    sx={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        fontSize: 12, padding: '4px 10px', borderRadius: 6,
                                        border: '1px solid', cursor: 'pointer',
                                        fontWeight: hideArchived ? 500 : 400,
                                        borderColor: hideArchived ? '#94a3b8' : '#6366f1',
                                        background: hideArchived ? 'transparent' : 'rgba(99,102,241,0.06)',
                                        color: hideArchived ? '#64748b' : '#6366f1',
                                    }}
                                >
                                    {hideArchived ? `📦 보관 ${archivedCount}개 숨김` : '📦 보관 표시 중'}
                                </Box>
                            </Tooltip>
                        )}

                        {/* 색상 라벨 필터 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                            <Tooltip title="라벨 없음">
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => setLabelFilter(labelFilter === 'none' ? 'all' : 'none')}
                                    sx={{
                                        width: 20, height: 20, borderRadius: '50%',
                                        border: labelFilter === 'none' ? '2px solid #6b7280' : '2px solid #d1d5db',
                                        background: '#e5e7eb', cursor: 'pointer', p: 0,
                                        outline: labelFilter === 'none' ? '2px solid #6b728066' : 'none',
                                    }}
                                    aria-label="라벨 없는 프로젝트 필터"
                                />
                            </Tooltip>
                            {COLOR_PRESETS.map(preset => (
                                <Tooltip key={preset.id} title={preset.name}>
                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={() => setLabelFilter(labelFilter === preset.id ? 'all' : preset.id)}
                                        sx={{
                                            width: 20, height: 20, borderRadius: '50%',
                                            border: labelFilter === preset.id ? `2px solid ${preset.color}` : '2px solid transparent',
                                            background: preset.color, cursor: 'pointer', p: 0,
                                            outline: labelFilter === preset.id ? `2px solid ${preset.color}66` : 'none',
                                            transition: 'outline 0.15s',
                                        }}
                                        aria-label={`${preset.name} 라벨 필터`}
                                    />
                                </Tooltip>
                            ))}
                        </Box>

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

                {/* 태그 빠른 필터 */}
                {allTags.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}>
                            🏷 태그:
                        </Typography>
                        {allTags.map(tag => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant={tagFilter === tag ? 'filled' : 'outlined'}
                                color={tagFilter === tag ? 'primary' : 'default'}
                                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                                sx={{ fontSize: 11, cursor: 'pointer' }}
                                aria-pressed={tagFilter === tag}
                            />
                        ))}
                        {tagFilter && (
                            <Button size="small" onClick={() => setTagFilter(null)} sx={{ fontSize: 11, minWidth: 0, px: 1, color: 'text.secondary' }}>
                                초기화
                            </Button>
                        )}
                    </Box>
                )}
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
                    <ul className="project-hub-list" aria-label="프로젝트 목록">
                        {filteredProjects.map((project) => (
                            <li key={project.id} className="project-hub-list-item">
                                <Card
                                    className="project-card project-hub-list-row"
                                    component="div"
                                    onClick={() => onProjectSelect(project)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        borderLeft: colorLabels[project.id]
                                            ? `4px solid ${COLOR_PRESETS.find(c => c.id === colorLabels[project.id])?.color || 'transparent'}`
                                            : '4px solid transparent',
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
                                                {project.dueDate && <DDayBadge dueDate={project.dueDate} />}
                                            </Box>
                                            {/* 진행률 바 */}
                                            <ProjectProgressBar
                                                progress={progressMap[project.id] ?? (project.progress ?? 0)}
                                                status={project.status}
                                                onEdit={(v) => updateProgress(project.id, v)}
                                            />
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
                                                <Tooltip title="색상 라벨">
                                                    <Box
                                                        component="button"
                                                        type="button"
                                                        onClick={(e: React.MouseEvent<HTMLElement>) => openColorPopover(e, project.id)}
                                                        sx={{
                                                            width: 18, height: 18, borderRadius: '50%', p: 0, flexShrink: 0,
                                                            background: colorLabels[project.id]
                                                                ? COLOR_PRESETS.find(c => c.id === colorLabels[project.id])?.color
                                                                : '#e5e7eb',
                                                            border: '2px solid',
                                                            borderColor: colorLabels[project.id]
                                                                ? COLOR_PRESETS.find(c => c.id === colorLabels[project.id])?.color || '#e5e7eb'
                                                                : '#d1d5db',
                                                            cursor: 'pointer',
                                                        }}
                                                        aria-label="색상 라벨 변경"
                                                    />
                                                </Tooltip>
                                                <Tooltip title={projectNotes[project.id] ? `메모: ${projectNotes[project.id].slice(0, 40)}…` : '메모 추가'}>
                                                    <Box
                                                        component="button"
                                                        type="button"
                                                        onClick={(e: React.MouseEvent) => openNotePanel(e, project.id)}
                                                        sx={{
                                                            background: projectNotes[project.id] ? 'rgba(245,158,11,0.15)' : 'none',
                                                            border: projectNotes[project.id] ? '1px solid rgba(245,158,11,0.4)' : '1px solid #e5e7eb',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: 13,
                                                            px: '6px',
                                                            py: '2px',
                                                            lineHeight: 1.4,
                                                            color: projectNotes[project.id] ? '#d97706' : '#9ca3af',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '3px',
                                                        }}
                                                        aria-label="프로젝트 메모"
                                                    >
                                                        📝
                                                    </Box>
                                                </Tooltip>
                                                {onProjectArchive && (
                                                    <Tooltip title={project.status === 'archived' ? '아카이브 해제' : '아카이브로 이동'}>
                                                        <Box
                                                            component="button"
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); onProjectArchive(project.id); }}
                                                            aria-label={project.status === 'archived' ? '아카이브 해제' : '아카이브로 이동'}
                                                            sx={{
                                                                background: 'none', border: 'none', cursor: 'pointer',
                                                                fontSize: 14, padding: '2px 4px', borderRadius: 1,
                                                                color: project.status === 'archived' ? '#6366f1' : '#94a3b8',
                                                                '&:hover': { background: 'rgba(0,0,0,0.05)' },
                                                            }}
                                                        >
                                                            {project.status === 'archived' ? '📤' : '📦'}
                                                        </Box>
                                                    </Tooltip>
                                                )}
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
                                    borderTop: colorLabels[project.id]
                                        ? `4px solid ${COLOR_PRESETS.find(c => c.id === colorLabels[project.id])?.color || 'transparent'}`
                                        : '4px solid transparent',
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Tooltip title="색상 라벨">
                                                <Box
                                                    component="button"
                                                    type="button"
                                                    onClick={(e: React.MouseEvent<HTMLElement>) => openColorPopover(e, project.id)}
                                                    sx={{
                                                        width: 16, height: 16, borderRadius: '50%', p: 0,
                                                        background: colorLabels[project.id]
                                                            ? COLOR_PRESETS.find(c => c.id === colorLabels[project.id])?.color
                                                            : '#e5e7eb',
                                                        border: '2px solid',
                                                        borderColor: colorLabels[project.id]
                                                            ? COLOR_PRESETS.find(c => c.id === colorLabels[project.id])?.color || '#e5e7eb'
                                                            : '#d1d5db',
                                                        cursor: 'pointer',
                                                    }}
                                                    aria-label="색상 라벨 변경"
                                                />
                                            </Tooltip>
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

                                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <Chip
                                            label={project.status === 'active' ? '활성' : project.status === 'archived' ? '보관됨' : '완료'}
                                            size="small"
                                            color={project.status === 'active' ? 'success' : project.status === 'archived' ? 'default' : 'primary'}
                                        />
                                        {project.category && (
                                            <Chip label={project.category} size="small" variant="outlined" />
                                        )}
                                        {project.dueDate && <DDayBadge dueDate={project.dueDate} />}
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

                                    {/* 카드 뷰 진행률 바 */}
                                    <ProjectProgressBar
                                        progress={progressMap[project.id] ?? (project.progress ?? 0)}
                                        status={project.status}
                                        onEdit={(v) => updateProgress(project.id, v)}
                                    />

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

            {/* 색상 라벨 팝오버 */}
            <Popover
                open={Boolean(colorPopoverAnchor)}
                anchorEl={colorPopoverAnchor}
                onClose={closeColorPopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                onClick={(e) => e.stopPropagation()}
            >
                <Box sx={{ p: 1.5, minWidth: 200 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                        🎨 색상 라벨
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {COLOR_PRESETS.map(preset => (
                            <Tooltip key={preset.id} title={preset.name}>
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => applyColorLabel(preset.id)}
                                    sx={{
                                        width: 28, height: 28, borderRadius: '50%', p: 0,
                                        background: preset.color,
                                        border: colorTargetProjectId && colorLabels[colorTargetProjectId] === preset.id
                                            ? `3px solid ${preset.color}`
                                            : '3px solid transparent',
                                        outline: colorTargetProjectId && colorLabels[colorTargetProjectId] === preset.id
                                            ? `2px solid ${preset.color}88`
                                            : 'none',
                                        cursor: 'pointer',
                                        transition: 'outline 0.15s',
                                        '&:hover': { opacity: 0.85 },
                                    }}
                                    aria-label={preset.name}
                                />
                            </Tooltip>
                        ))}
                    </Box>
                    {colorTargetProjectId && colorLabels[colorTargetProjectId] && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            onClick={() => applyColorLabel(null)}
                            sx={{ fontSize: '0.7rem', py: 0.25 }}
                            fullWidth
                        >
                            라벨 제거
                        </Button>
                    )}
                </Box>
            </Popover>

            {/* 프로젝트 메모 패널 */}
            {notePanelProjectId && (
                <div
                    className="ph-note-overlay"
                    onClick={() => setNotePanelProjectId(null)}
                    role="presentation"
                >
                    <div
                        className="ph-note-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="프로젝트 메모"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="ph-note-header">
                            <span className="ph-note-title">
                                📝 메모 — {filteredProjects.find(p => p.id === notePanelProjectId)?.name ?? notePanelProjectId}
                            </span>
                            {projectNotes[notePanelProjectId] && (
                                <button
                                    type="button"
                                    className="ph-note-delete"
                                    onClick={(e) => { deleteNote(notePanelProjectId, e); setNotePanelProjectId(null); }}
                                    aria-label="메모 삭제"
                                    title="메모 삭제"
                                >
                                    🗑
                                </button>
                            )}
                        </div>
                        <textarea
                            className="ph-note-textarea"
                            placeholder="이 프로젝트에 대한 메모를 입력하세요…"
                            value={noteDraft}
                            onChange={e => setNoteDraft(e.target.value)}
                            rows={6}
                            autoFocus
                        />
                        <div className="ph-note-actions">
                            <button type="button" className="ph-note-cancel" onClick={() => setNotePanelProjectId(null)}>취소</button>
                            <button type="button" className="ph-note-save" onClick={saveNote}>💾 저장</button>
                        </div>
                    </div>
                </div>
            )}

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

