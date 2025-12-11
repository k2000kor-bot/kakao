/**
 * 프로젝트 공유 다이얼로그 컴포넌트
 * 공유 링크 생성 및 관리
 * 
 * Task-B4: 프로젝트 허브 확장
 */

import React, { useState, useEffect } from 'react';
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
    Switch,
    FormControlLabel,
    Typography,
    Box,
    Chip,
    IconButton,
    InputAdornment,
    Divider,
    Alert,
    Tooltip,
} from '@mui/material';
import {
    ContentCopy,
    Delete,
    Link as LinkIcon,
    Visibility,
    Edit,
    AdminPanelSettings,
    Lock,
    CalendarToday,
    People,
    BarChart,
} from '@mui/icons-material';
import projectShareService, { ProjectShareLink } from '../services/projectShareService';
import './ProjectShareDialog.css';

interface ProjectShareDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
}

const ProjectShareDialog: React.FC<ProjectShareDialogProps> = ({
    open,
    onClose,
    projectId,
    projectName,
}) => {
    const [shareLinks, setShareLinks] = useState<ProjectShareLink[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newShare, setNewShare] = useState({
        permission: 'read' as 'read' | 'write' | 'admin',
        expiresAt: '',
        maxUses: '',
        password: '',
        description: '',
        hasExpiry: false,
        hasMaxUses: false,
        hasPassword: false,
    });
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
    const [selectedShare, setSelectedShare] = useState<ProjectShareLink | null>(null);

    useEffect(() => {
        if (open) {
            loadShareLinks();
        }
    }, [open, projectId]);

    const loadShareLinks = () => {
        const shares = projectShareService.getProjectShares(projectId);
        setShareLinks(shares);
    };

    const handleCreateShare = () => {
        const shareLink = projectShareService.createShareLink(projectId, {
            permission: newShare.permission,
            expiresAt: newShare.hasExpiry && newShare.expiresAt
                ? new Date(newShare.expiresAt)
                : undefined,
            maxUses: newShare.hasMaxUses && newShare.maxUses
                ? parseInt(newShare.maxUses, 10)
                : undefined,
            password: newShare.hasPassword && newShare.password
                ? newShare.password
                : undefined,
            description: newShare.description || undefined,
            createdBy: 'current_user', // 실제로는 현재 사용자 ID
        });

        loadShareLinks();
        setShowCreateForm(false);
        setNewShare({
            permission: 'read',
            expiresAt: '',
            maxUses: '',
            password: '',
            description: '',
            hasExpiry: false,
            hasMaxUses: false,
            hasPassword: false,
        });
    };

    const handleCopyLink = (shareLink: ProjectShareLink) => {
        const url = projectShareService.generateShareUrl(shareLink.shareToken);
        navigator.clipboard.writeText(url).then(() => {
            setCopiedLinkId(shareLink.id);
            setTimeout(() => setCopiedLinkId(null), 2000);
        });
    };

    const handleDeleteShare = (shareId: string) => {
        if (window.confirm('정말로 이 공유 링크를 삭제하시겠습니까?')) {
            projectShareService.deleteShareLink(shareId);
            loadShareLinks();
        }
    };

    const getPermissionIcon = (permission: string) => {
        switch (permission) {
            case 'read':
                return <Visibility />;
            case 'write':
                return <Edit />;
            case 'admin':
                return <AdminPanelSettings />;
            default:
                return <LinkIcon />;
        }
    };

    const getPermissionLabel = (permission: string) => {
        switch (permission) {
            case 'read':
                return '읽기 전용';
            case 'write':
                return '읽기/쓰기';
            case 'admin':
                return '관리자';
            default:
                return permission;
        }
    };

    const getPermissionColor = (permission: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        switch (permission) {
            case 'read':
                return 'default';
            case 'write':
                return 'primary';
            case 'admin':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '만료 없음';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getShareStats = (shareLink: ProjectShareLink) => {
        return projectShareService.getShareStats(shareLink.id);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon />
                        <Typography variant="h6">프로젝트 공유</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose}>
                        <Box component="span" sx={{ fontSize: 20 }}>×</Box>
                    </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {projectName}
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                {/* 공유 링크 생성 버튼 */}
                {!showCreateForm && (
                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<LinkIcon />}
                            onClick={() => setShowCreateForm(true)}
                            fullWidth
                        >
                            새 공유 링크 생성
                        </Button>
                    </Box>
                )}

                {/* 공유 링크 생성 폼 */}
                {showCreateForm && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            공유 링크 생성
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>권한</InputLabel>
                            <Select
                                value={newShare.permission}
                                label="권한"
                                onChange={(e) => setNewShare({ ...newShare, permission: e.target.value as any })}
                            >
                                <MenuItem value="read">읽기 전용</MenuItem>
                                <MenuItem value="write">읽기/쓰기</MenuItem>
                                <MenuItem value="admin">관리자</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="설명 (선택)"
                            value={newShare.description}
                            onChange={(e) => setNewShare({ ...newShare, description: e.target.value })}
                            sx={{ mb: 2 }}
                            placeholder="이 공유 링크에 대한 설명을 입력하세요"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newShare.hasExpiry}
                                    onChange={(e) => setNewShare({ ...newShare, hasExpiry: e.target.checked })}
                                />
                            }
                            label="만료일 설정"
                            sx={{ mb: 1 }}
                        />

                        {newShare.hasExpiry && (
                            <TextField
                                fullWidth
                                type="datetime-local"
                                value={newShare.expiresAt}
                                onChange={(e) => setNewShare({ ...newShare, expiresAt: e.target.value })}
                                sx={{ mb: 2 }}
                                InputLabelProps={{ shrink: true }}
                            />
                        )}

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newShare.hasMaxUses}
                                    onChange={(e) => setNewShare({ ...newShare, hasMaxUses: e.target.checked })}
                                />
                            }
                            label="최대 사용 횟수 제한"
                            sx={{ mb: 1 }}
                        />

                        {newShare.hasMaxUses && (
                            <TextField
                                fullWidth
                                type="number"
                                label="최대 사용 횟수"
                                value={newShare.maxUses}
                                onChange={(e) => setNewShare({ ...newShare, maxUses: e.target.value })}
                                sx={{ mb: 2 }}
                                inputProps={{ min: 1 }}
                            />
                        )}

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newShare.hasPassword}
                                    onChange={(e) => setNewShare({ ...newShare, hasPassword: e.target.checked })}
                                />
                            }
                            label="비밀번호 보호"
                            sx={{ mb: 1 }}
                        />

                        {newShare.hasPassword && (
                            <TextField
                                fullWidth
                                type="password"
                                label="비밀번호"
                                value={newShare.password}
                                onChange={(e) => setNewShare({ ...newShare, password: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                        )}

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleCreateShare}
                                disabled={newShare.hasPassword && !newShare.password}
                            >
                                생성
                            </Button>
                            <Button onClick={() => setShowCreateForm(false)}>취소</Button>
                        </Box>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* 공유 링크 목록 */}
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    공유 링크 목록 ({shareLinks.length})
                </Typography>

                {shareLinks.length === 0 ? (
                    <Box className="empty-state">
                        <LinkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                            공유 링크가 없습니다
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            새 공유 링크를 생성하여 프로젝트를 공유하세요.
                        </Typography>
                    </Box>
                ) : (
                    <Box className="share-links-list">
                        {shareLinks.map((shareLink) => {
                            const stats = getShareStats(shareLink);
                            const shareUrl = projectShareService.generateShareUrl(shareLink.shareToken);

                            return (
                                <Box key={shareLink.id} className="share-link-card">
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                {getPermissionIcon(shareLink.permission)}
                                                <Chip
                                                    label={getPermissionLabel(shareLink.permission)}
                                                    size="small"
                                                    color={getPermissionColor(shareLink.permission)}
                                                />
                                                {shareLink.password && (
                                                    <Tooltip title="비밀번호 보호됨">
                                                        <Lock sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                            {shareLink.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    {shareLink.description}
                                                </Typography>
                                            )}
                                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        만료: {formatDate(shareLink.expiresAt)}
                                                    </Typography>
                                                </Box>
                                                {shareLink.maxUses && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <People sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            사용: {shareLink.currentUses}/{shareLink.maxUses}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={shareUrl}
                                                    InputProps={{
                                                        readOnly: true,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleCopyLink(shareLink)}
                                                                    title="링크 복사"
                                                                >
                                                                    {copiedLinkId === shareLink.id ? (
                                                                        <Box sx={{ color: 'success.main' }}>✓</Box>
                                                                    ) : (
                                                                        <ContentCopy sx={{ fontSize: 16 }} />
                                                                    )}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Tooltip title={`총 ${stats.totalAccesses}회 접근, ${stats.uniqueAccesses}명의 고유 사용자`}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <BarChart sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {stats.totalAccesses}회 접근
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                                {stats.lastAccessed && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        마지막 접근: {formatDate(stats.lastAccessed)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteShare(shareLink.id)}
                                            color="error"
                                            title="삭제"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProjectShareDialog;

