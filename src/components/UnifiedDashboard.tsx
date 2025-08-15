import React, { useState, useEffect } from 'react';


interface DashboardStats {
    totalProjects: number;
    activeProjects: number;
    totalFiles: number;
    totalConversations: number;
    aiResponses: number;
    systemHealth: number;
}

interface RecentActivity {
    id: string;
    type: 'project' | 'file' | 'conversation' | 'ai_response';
    title: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error' | 'info';
}

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: string;
    action: () => void;
    color: string;
}

interface UnifiedDashboardProps {
    onNavigate: (view: string, data?: any) => void;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ onNavigate }) => {
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 12,
        activeProjects: 8,
        totalFiles: 156,
        totalConversations: 89,
        aiResponses: 234,
        systemHealth: 98
    });

    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
        {
            id: '1',
            type: 'project',
            title: '개포우성_실명방',
            description: '새로운 파일이 업로드되었습니다',
            timestamp: '2분 전',
            status: 'success'
        },
        {
            id: '2',
            type: 'ai_response',
            title: 'CORBU.AI 응답',
            description: '92% 신뢰도로 고품질 응답 생성',
            timestamp: '5분 전',
            status: 'success'
        },
        {
            id: '3',
            type: 'conversation',
            title: '삼성 홍보 반박',
            description: '대화 요약이 완료되었습니다',
            timestamp: '10분 전',
            status: 'info'
        },
        {
            id: '4',
            type: 'file',
            title: '설계 오류 분석',
            description: 'PDF 파일 분석 중',
            timestamp: '15분 전',
            status: 'warning'
        }
    ]);

    const [projects] = useState([
        {
            id: '1',
            name: '개포우성_실명방',
            description: '개포우성 아파트 재건축 프로젝트',
            status: 'active',
            progress: 75,
            files: 20,
            participants: 8,
            lastUpdated: '2분 전',
            priority: 'high',
            category: '재건축',
            tags: ['아파트', '재건축', '시공사']
        },
        {
            id: '2',
            name: '잠실우성_대화요약',
            description: '잠실우성 아파트 대화 분석 프로젝트',
            status: 'active',
            progress: 60,
            files: 15,
            participants: 5,
            lastUpdated: '1시간 전',
            priority: 'medium',
            category: '분석',
            tags: ['분석', '대화', '요약']
        },
        {
            id: '3',
            name: '삼성홍보_반박자료',
            description: '삼성 홍보 반박 자료 작성 프로젝트',
            status: 'completed',
            progress: 100,
            files: 8,
            participants: 3,
            lastUpdated: '3시간 전',
            priority: 'high',
            category: '홍보',
            tags: ['홍보', '반박', '자료']
        },
        {
            id: '4',
            name: 'DA설계_의견수렴',
            description: 'DA 설계 의견 수렴 프로젝트',
            status: 'active',
            progress: 45,
            files: 12,
            participants: 6,
            lastUpdated: '30분 전',
            priority: 'medium',
            category: '설계',
            tags: ['설계', '의견', '수렴']
        }
    ]);

    const quickActions: QuickAction[] = [
        {
            id: 'ultimate_ai',
            title: 'CORBU.AI',
            description: '모든 AI 기능을 통합한 고신뢰도 응답',
            icon: '🧠',
            action: () => onNavigate('ultimate'),
            color: 'linear-gradient(135deg, #667eea, #764ba2)'
        },
        {
            id: 'new_project',
            title: '새 프로젝트',
            description: '새로운 프로젝트 생성 및 관리',
            icon: '📁',
            action: () => onNavigate('project', { projectId: 'new' }),
            color: 'linear-gradient(135deg, #48bb78, #38a169)'
        },
        {
            id: 'file_analysis',
            title: '파일 분석',
            description: '다양한 파일 형식 분석 및 처리',
            icon: '📊',
            action: () => onNavigate('analysis'),
            color: 'linear-gradient(135deg, #ed8936, #dd6b20)'
        },
        {
            id: 'conversation',
            title: '대화 관리',
            description: '실시간 대화 및 요약 관리',
            icon: '💬',
            action: () => onNavigate('chat'),
            color: 'linear-gradient(135deg, #4299e1, #3182ce)'
        },
        {
            id: 'guidelines',
            title: '지침 관리',
            description: '프로젝트 지침 및 가이드라인',
            icon: '📋',
            action: () => onNavigate('guidelines'),
            color: 'linear-gradient(135deg, #9f7aea, #805ad5)'
        },
        {
            id: 'system_status',
            title: '시스템 상태',
            description: '전체 시스템 상태 및 성능 모니터링',
            icon: '⚡',
            action: () => onNavigate('status'),
            color: 'linear-gradient(135deg, #f56565, #e53e3e)'
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'info': return 'ℹ️';
            default: return '📌';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'project': return '📁';
            case 'file': return '📄';
            case 'conversation': return '💬';
            case 'ai_response': return '🤖';
            default: return '📌';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return '#48bb78';
            case 'warning': return '#ed8936';
            case 'error': return '#f56565';
            case 'info': return '#4299e1';
            default: return '#a0aec0';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#e53e3e';
            case 'medium': return '#d69e2e';
            case 'low': return '#38a169';
            default: return '#718096';
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'high': return '높음';
            case 'medium': return '보통';
            case 'low': return '낮음';
            default: return '미정';
        }
    };

    return (
        <div className="unified-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>CORBU.AI 통합 대시보드</h1>
                    <p>모든 AI 기능을 한 곳에서 관리하고 모니터링하세요</p>
                </div>
                <div className="header-actions">
                    <button className="refresh-button">
                        <span>🔄</span>
                        새로고침
                    </button>
                    <button className="settings-button">
                        <span>⚙️</span>
                        설정
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon">📁</div>
                    <div className="stat-content">
                        <h3>{stats.totalProjects}</h3>
                        <p>전체 프로젝트</p>
                    </div>
                    <div className="stat-trend positive">+12%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🚀</div>
                    <div className="stat-content">
                        <h3>{stats.activeProjects}</h3>
                        <p>활성 프로젝트</p>
                    </div>
                    <div className="stat-trend positive">+5%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-content">
                        <h3>{stats.totalFiles}</h3>
                        <p>총 파일 수</p>
                    </div>
                    <div className="stat-trend positive">+23%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-content">
                        <h3>{stats.totalConversations}</h3>
                        <p>대화 수</p>
                    </div>
                    <div className="stat-trend positive">+8%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🤖</div>
                    <div className="stat-content">
                        <h3>{stats.aiResponses}</h3>
                        <p>AI 응답</p>
                    </div>
                    <div className="stat-trend positive">+45%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-content">
                        <h3>{stats.systemHealth}%</h3>
                        <p>시스템 건강도</p>
                    </div>
                    <div className="stat-trend positive">+2%</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h2>빠른 액션</h2>
                    <div className="quick-actions-grid">
                        {quickActions.map((action) => (
                            <div
                                key={action.id}
                                className="quick-action-card"
                                onClick={action.action}
                                style={{ background: action.color }}
                            >
                                <div className="action-icon">{action.icon}</div>
                                <div className="action-content">
                                    <h3>{action.title}</h3>
                                    <p>{action.description}</p>
                                </div>
                                <div className="action-arrow">→</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Projects Section */}
                <div className="projects-section">
                    <div className="projects-header">
                        <h2>프로젝트 목록</h2>
                        <div className="projects-actions">
                            <button className="filter-button active">전체</button>
                            <button className="filter-button">진행중</button>
                            <button className="filter-button">완료</button>
                        </div>
                    </div>
                    <div className="projects-grid">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="project-card"
                                onClick={() => onNavigate('project', { projectId: project.id })}
                            >
                                <div className="project-header">
                                    <div className="project-icon">📁</div>
                                    <div className="project-status">
                                        <span className={`status-dot ${project.status}`}></span>
                                        {project.status === 'active' ? '진행중' : '완료'}
                                    </div>
                                </div>
                                <div className="project-content">
                                    <div className="project-title-section">
                                        <h3>{project.name}</h3>
                                        <span
                                            className="priority-badge"
                                            style={{ backgroundColor: getPriorityColor(project.priority) }}
                                        >
                                            {getPriorityText(project.priority)}
                                        </span>
                                    </div>
                                    <p>{project.description}</p>
                                    <div className="project-tags">
                                        {project.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="tag">{tag}</span>
                                        ))}
                                        {project.tags.length > 3 && (
                                            <span className="tag more">+{project.tags.length - 3}</span>
                                        )}
                                    </div>
                                    <div className="project-metrics">
                                        <div className="metric">
                                            <span className="metric-label">진행률</span>
                                            <span className="metric-value">{project.progress}%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">파일</span>
                                            <span className="metric-value">{project.files}개</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">참여자</span>
                                            <span className="metric-value">{project.participants}명</span>
                                        </div>
                                    </div>
                                    <div className="project-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="project-footer">
                                        <span className="last-updated">마지막 업데이트: {project.lastUpdated}</span>
                                        <div className="project-arrow">→</div>
                                    </div>
                                </div>
                                <div className="project-hover-overlay">
                                    <div className="hover-actions">
                                        <button className="hover-action-btn" title="즉시 열기">
                                            📂
                                        </button>
                                        <button className="hover-action-btn" title="새 탭에서 열기">
                                            🔗
                                        </button>
                                        <button className="hover-action-btn" title="즐겨찾기">
                                            ⭐
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities & System Status */}
                <div className="bottom-section">
                    <div className="recent-activities">
                        <h2>최근 활동</h2>
                        <div className="activities-list">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-icon">
                                        {getTypeIcon(activity.type)}
                                    </div>
                                    <div className="activity-content">
                                        <h4>{activity.title}</h4>
                                        <p>{activity.description}</p>
                                        <span className="activity-time">{activity.timestamp}</span>
                                    </div>
                                    <div
                                        className="activity-status"
                                        style={{ color: getStatusColor(activity.status) }}
                                    >
                                        {getStatusIcon(activity.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="system-status">
                        <h2>시스템 상태</h2>
                        <div className="status-grid">
                            <div className="status-item">
                                <div className="status-header">
                                    <span className="status-icon">🧠</span>
                                    <span className="status-title">CORBU.AI 시스템</span>
                                </div>
                                <div className="status-indicator online">온라인</div>
                                <div className="status-metrics">
                                    <span>신뢰도: 92%</span>
                                    <span>응답시간: 0.3초</span>
                                </div>
                            </div>
                            <div className="status-item">
                                <div className="status-header">
                                    <span className="status-icon">📁</span>
                                    <span className="status-title">파일 처리 시스템</span>
                                </div>
                                <div className="status-indicator online">온라인</div>
                                <div className="status-metrics">
                                    <span>처리량: 156개</span>
                                    <span>성공률: 98%</span>
                                </div>
                            </div>
                            <div className="status-item">
                                <div className="status-header">
                                    <span className="status-icon">💬</span>
                                    <span className="status-title">대화 관리 시스템</span>
                                </div>
                                <div className="status-indicator online">온라인</div>
                                <div className="status-metrics">
                                    <span>활성 대화: 89개</span>
                                    <span>응답률: 95%</span>
                                </div>
                            </div>
                            <div className="status-item">
                                <div className="status-header">
                                    <span className="status-icon">📊</span>
                                    <span className="status-title">분석 엔진</span>
                                </div>
                                <div className="status-indicator online">온라인</div>
                                <div className="status-metrics">
                                    <span>분석 중: 12개</span>
                                    <span>정확도: 94%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="floating-action-button" onClick={() => onNavigate('ultimate')}>
                <span>🤖</span>
                <span className="fab-label">CORBU.AI</span>
            </div>
        </div>
    );
};

export default UnifiedDashboard;
