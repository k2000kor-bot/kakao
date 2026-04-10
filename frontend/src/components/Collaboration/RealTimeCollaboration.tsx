import React, { useState } from 'react';
import './RealTimeCollaboration.css';
import { getCollaboratorRoleStyle, getCollaboratorStatusColor } from '../../styles/themeColors';
import {
    Users,
    UserPlus,
    Share2,
    Link,
    Copy,
    Eye,
    Lock,
    Edit,
    Trash2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { coerceTrimmedString } from '../../utils/chatInputUtils';

interface Collaborator {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    status: 'online' | 'offline' | 'away';
    lastSeen: Date;
    permissions: string[];
}

interface ShareLink {
    id: string;
    url: string;
    password?: string;
    expiresAt?: Date;
    accessCount: number;
    maxAccess?: number;
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

interface RealTimeCollaborationProps {
    projectId: string;
    projectName: string;
    collaborators: Collaborator[];
    shareLinks: ShareLink[];
    onInviteCollaborator: (email: string, role: string) => void;
    onRemoveCollaborator: (id: string) => void;
    onUpdateRole: (id: string, role: string) => void;
    onCreateShareLink: (options: unknown) => void;
    onDeleteShareLink: (id: string) => void;
    onCopyLink: (url: string) => void;
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
    projectId: _projectId,
    projectName,
    collaborators,
    shareLinks,
    onInviteCollaborator,
    onRemoveCollaborator,
    onUpdateRole,
    onCreateShareLink,
    onDeleteShareLink,
    onCopyLink
}) => {
    const [activeTab, setActiveTab] = useState<'collaborators' | 'sharing'>('collaborators');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [shareOptions, setShareOptions] = useState({
        password: '',
        expiresIn: '7d',
        maxAccess: 10,
        allowEdit: false
    });

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'owner': return '소유자';
            case 'admin': return '관리자';
            case 'editor': return '편집자';
            case 'viewer': return '뷰어';
            default: return role;
        }
    };

    const handleInvite = () => {
        const email = coerceTrimmedString(inviteEmail, '');
        if (email) {
            onInviteCollaborator(email, inviteRole);
            setInviteEmail('');
            setInviteRole('viewer');
            setShowInviteModal(false);
        }
    };

    const handleCreateShareLink = () => {
        onCreateShareLink(shareOptions);
        setShareOptions({
            password: '',
            expiresIn: '7d',
            maxAccess: 10,
            allowEdit: false
        });
        setShowShareModal(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        onCopyLink(text);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const tabs = [
        { id: 'collaborators', name: '협업자', icon: Users },
        { id: 'sharing', name: '공유', icon: Share2 }
    ] as const;

    return (
        <div className="rtc-root" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* 헤더 */}
            <div className="rtc-header">
                <div>
                    <h2 className="rtc-title">실시간 협업</h2>
                    <p className="rtc-desc">프로젝트 "{projectName}"의 협업 및 공유를 관리하세요</p>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="rtc-tabs">
                <nav style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rtc-tab ${activeTab === tab.id ? 'active' : ''}`}>
                                <IconComponent className="h-4 w-4" aria-hidden />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* 탭 내용 */}
            <AnimatePresence mode="wait">
                {activeTab === 'collaborators' && (
                    <motion.div
                        key="collaborators"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* 협업자 초대 */}
                        <div className="rtc-card" style={{ padding: 'var(--spacing-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                                <h3 className="rtc-title" style={{ fontSize: 'var(--font-size-lg)' }}>협업자 초대</h3>
                                <button type="button" onClick={() => setShowInviteModal(true)} className="bw-btn-primary">
                                    <UserPlus className="h-4 w-4" aria-hidden />
                                    <span>초대하기</span>
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <Users className="h-4 w-4" aria-hidden />
                                    <span>총 {collaborators.length}명</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-success)' }} />
                                    <span>{collaborators.filter(c => c.status === 'online').length}명 온라인</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <Edit className="h-4 w-4" aria-hidden />
                                    <span>{collaborators.filter(c => c.role === 'editor' || c.role === 'admin').length}명 편집 가능</span>
                                </div>
                            </div>
                        </div>

                        {/* 협업자 목록 */}
                        <div className="rtc-card">
                            <div style={{ padding: 'var(--spacing-lg)', borderBottom: 'var(--border-width) solid var(--border-color)' }}>
                                <h3 className="rtc-title" style={{ fontSize: 'var(--font-size-lg)' }}>협업자 목록</h3>
                            </div>
                            <div>
                                {collaborators.map((collaborator) => {
                                    const roleStyle = getCollaboratorRoleStyle(collaborator.role);
                                    const statusColor = getCollaboratorStatusColor(collaborator.status);
                                    return (
                                        <div key={collaborator.id} className="rtc-row">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-info-muted)', color: 'var(--accent-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                                                            {collaborator.name.charAt(0)}
                                                        </div>
                                                        <div className="rtc-status-dot" style={{ backgroundColor: statusColor }} aria-hidden />
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                            <h4 style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{collaborator.name}</h4>
                                                            <span className="rtc-badge" style={roleStyle}>{getRoleLabel(collaborator.role)}</span>
                                                        </div>
                                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{collaborator.email}</p>
                                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                            {collaborator.status === 'online' ? '온라인' : collaborator.status === 'away' ? '자리비움' : `마지막 접속: ${formatDate(collaborator.lastSeen)}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                    <select value={collaborator.role} onChange={(e) => onUpdateRole(collaborator.id, e.target.value)} className="bw-input" style={{ width: 'auto', minWidth: 90, padding: 'var(--spacing-xs) var(--spacing-sm)' }}>
                                                        <option value="viewer">뷰어</option>
                                                        <option value="editor">편집자</option>
                                                        <option value="admin">관리자</option>
                                                    </select>
                                                    <button type="button" onClick={() => onRemoveCollaborator(collaborator.id)} className="bw-btn-ghost" style={{ color: 'var(--accent-error)' }}>
                                                        <Trash2 className="h-4 w-4" aria-hidden />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'sharing' && (
                    <motion.div
                        key="sharing"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* 공유 링크 생성 */}
                        <div className="rtc-card" style={{ padding: 'var(--spacing-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                                <h3 className="rtc-title" style={{ fontSize: 'var(--font-size-lg)' }}>공유 링크</h3>
                                <button type="button" onClick={() => setShowShareModal(true)} className="bw-btn-primary">
                                    <Link className="h-4 w-4" aria-hidden />
                                    <span>링크 생성</span>
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <Link className="h-4 w-4" aria-hidden />
                                    <span>총 {shareLinks.length}개 링크</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-success)' }} />
                                    <span>{shareLinks.filter(l => l.isActive).length}개 활성</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <Eye className="h-4 w-4" aria-hidden />
                                    <span>총 {shareLinks.reduce((sum, link) => sum + link.accessCount, 0)}회 접근</span>
                                </div>
                            </div>
                        </div>

                        {/* 공유 링크 목록 */}
                        <div className="rtc-card">
                            <div style={{ padding: 'var(--spacing-lg)', borderBottom: 'var(--border-width) solid var(--border-color)' }}>
                                <h3 className="rtc-title" style={{ fontSize: 'var(--font-size-lg)' }}>공유 링크 목록</h3>
                            </div>
                            <div>
                                {shareLinks.map((link) => (
                                    <div key={link.id} className="rtc-row">
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                                    <Link className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} aria-hidden />
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</span>
                                                    {link.password && <Lock className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} aria-hidden />}
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: link.isActive ? 'var(--accent-success)' : 'var(--text-tertiary)' }} />
                                                </div>
                                                <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    <span>접근: {link.accessCount}회</span>
                                                    {link.maxAccess && <span>최대: {link.maxAccess}회</span>}
                                                    <span>생성: {formatDate(link.createdAt)}</span>
                                                    {link.expiresAt && <span>만료: {formatDate(link.expiresAt)}</span>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                <button type="button" onClick={() => copyToClipboard(link.url)} className="bw-btn-ghost" title="링크 복사">
                                                    <Copy className="h-4 w-4" aria-hidden />
                                                </button>
                                                <button type="button" onClick={() => onDeleteShareLink(link.id)} className="bw-btn-ghost" style={{ color: 'var(--accent-error)' }} title="링크 삭제">
                                                    <Trash2 className="h-4 w-4" aria-hidden />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 협업자 초대 모달 */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bw-modal-overlay" onClick={() => setShowInviteModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bw-modal-panel" style={{ width: 384 }} onClick={(e) => e.stopPropagation()}>
                            <div className="bw-modal-header">
                                <h3 className="bw-modal-title">협업자 초대</h3>
                                <button type="button" onClick={() => setShowInviteModal(false)} className="bw-btn-ghost"><X className="h-5 w-5" aria-hidden /></button>
                            </div>
                            <div className="bw-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                <div>
                                    <label className="as-label" style={{ marginBottom: 'var(--spacing-xs)', display: 'block' }}>이메일 주소</label>
                                    <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="collaborator@example.com" className="bw-input" />
                                </div>
                                <div>
                                    <label className="as-label" style={{ marginBottom: 'var(--spacing-xs)', display: 'block' }}>역할</label>
                                    <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="bw-input">
                                        <option value="viewer">뷰어 - 읽기만 가능</option>
                                        <option value="editor">편집자 - 읽기 및 편집 가능</option>
                                        <option value="admin">관리자 - 모든 권한</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bw-modal-footer">
                                <button type="button" onClick={() => setShowInviteModal(false)} className="bw-btn-secondary">취소</button>
                                <button type="button" onClick={() => void handleInvite()} disabled={!coerceTrimmedString(inviteEmail, '')} className="bw-btn-primary">초대하기</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 공유 링크 생성 모달 */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bw-modal-overlay" onClick={() => setShowShareModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bw-modal-panel" style={{ width: 384 }} onClick={(e) => e.stopPropagation()}>
                            <div className="bw-modal-header">
                                <h3 className="bw-modal-title">공유 링크 생성</h3>
                                <button type="button" onClick={() => setShowShareModal(false)} className="bw-btn-ghost"><X className="h-5 w-5" aria-hidden /></button>
                            </div>
                            <div className="bw-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                <div>
                                    <label className="as-label" style={{ marginBottom: 'var(--spacing-xs)', display: 'block' }}>비밀번호 (선택사항)</label>
                                    <input type="text" value={shareOptions.password} onChange={(e) => setShareOptions({ ...shareOptions, password: e.target.value })} placeholder="링크 접근을 위한 비밀번호" className="bw-input" />
                                </div>
                                <div>
                                    <label className="as-label" style={{ marginBottom: 'var(--spacing-xs)', display: 'block' }}>만료 기간</label>
                                    <select value={shareOptions.expiresIn} onChange={(e) => setShareOptions({ ...shareOptions, expiresIn: e.target.value })} className="bw-input">
                                        <option value="1d">1일</option>
                                        <option value="7d">7일</option>
                                        <option value="30d">30일</option>
                                        <option value="never">만료 없음</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="as-label" style={{ marginBottom: 'var(--spacing-xs)', display: 'block' }}>최대 접근 횟수</label>
                                    <input type="number" value={shareOptions.maxAccess} onChange={(e) => setShareOptions({ ...shareOptions, maxAccess: Number(e.target.value) })} min={1} className="bw-input" />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                                    <input type="checkbox" checked={shareOptions.allowEdit} onChange={(e) => setShareOptions({ ...shareOptions, allowEdit: e.target.checked })} style={{ accentColor: 'var(--accent-info)' }} />
                                    편집 권한 허용
                                </label>
                            </div>
                            <div className="bw-modal-footer">
                                <button type="button" onClick={() => setShowShareModal(false)} className="bw-btn-secondary">취소</button>
                                <button type="button" onClick={handleCreateShareLink} className="bw-btn-primary">링크 생성</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RealTimeCollaboration;
