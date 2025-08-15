import React, { useState, useEffect } from 'react';

interface TeamMember {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'away' | 'busy';
    currentTask?: string;
    progress?: number;
}

interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    progress: number;
}

interface Activity {
    id: string;
    user: string;
    action: string;
    details: string;
    timestamp: string;
    type: 'task' | 'message' | 'file' | 'meeting';
}

interface EnhancedCollaborationProps {
    onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
    onMemberStatusChange: (memberId: string, status: TeamMember['status']) => void;
    onActivityLog: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

const EnhancedCollaboration: React.FC<EnhancedCollaborationProps> = ({
    onTaskUpdate,
    onMemberStatusChange,
    onActivityLog
}) => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        {
            id: '1',
            name: '김철수',
            avatar: '👨‍💻',
            status: 'online',
            currentTask: '프론트엔드 개발',
            progress: 75
        },
        {
            id: '2',
            name: '이영희',
            avatar: '👩‍💻',
            status: 'busy',
            currentTask: '백엔드 API 개발',
            progress: 60
        },
        {
            id: '3',
            name: '박민수',
            avatar: '👨‍🎨',
            status: 'away',
            currentTask: 'UI/UX 디자인',
            progress: 90
        },
        {
            id: '4',
            name: '정수진',
            avatar: '👩‍🔬',
            status: 'offline',
            currentTask: 'AI 모델 최적화',
            progress: 45
        }
    ]);

    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            title: '프론트엔드 컴포넌트 개발',
            description: 'React 컴포넌트 라이브러리 구축',
            assignee: '김철수',
            status: 'in-progress',
            priority: 'high',
            dueDate: '2025-02-15',
            progress: 75
        },
        {
            id: '2',
            title: '백엔드 API 설계',
            description: 'RESTful API 엔드포인트 구현',
            assignee: '이영희',
            status: 'in-progress',
            priority: 'high',
            dueDate: '2025-02-10',
            progress: 60
        },
        {
            id: '3',
            title: 'UI/UX 디자인 시스템',
            description: '디자인 시스템 및 컴포넌트 가이드',
            assignee: '박민수',
            status: 'completed',
            priority: 'medium',
            dueDate: '2025-02-05',
            progress: 100
        },
        {
            id: '4',
            title: 'AI 모델 성능 최적화',
            description: '머신러닝 모델 성능 개선',
            assignee: '정수진',
            status: 'pending',
            priority: 'low',
            dueDate: '2025-02-20',
            progress: 0
        }
    ]);

    const [activities, setActivities] = useState<Activity[]>([
        {
            id: '1',
            user: '김철수',
            action: '작업 시작',
            details: '프론트엔드 컴포넌트 개발을 시작했습니다.',
            timestamp: '2025-01-27 14:30',
            type: 'task'
        },
        {
            id: '2',
            user: '이영희',
            action: '파일 업로드',
            details: 'API 문서를 업로드했습니다.',
            timestamp: '2025-01-27 14:25',
            type: 'file'
        },
        {
            id: '3',
            user: '박민수',
            action: '작업 완료',
            details: 'UI/UX 디자인 시스템을 완료했습니다.',
            timestamp: '2025-01-27 14:20',
            type: 'task'
        }
    ]);

    const [selectedTab, setSelectedTab] = useState<'members' | 'tasks' | 'activities'>('members');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // 실시간 상태 업데이트 시뮬레이션
    useEffect(() => {
        const interval = setInterval(() => {
            setTeamMembers(prev => prev.map(member => ({
                ...member,
                progress: member.progress ? Math.min(100, member.progress + Math.random() * 5) : member.progress
            })));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleTaskProgressUpdate = (taskId: string, newProgress: number) => {
        const updatedTasks = tasks.map(task =>
            task.id === taskId
                ? { ...task, progress: newProgress, status: newProgress >= 100 ? 'completed' : task.status }
                : task
        );
        setTasks(updatedTasks);
        onTaskUpdate(taskId, { progress: newProgress });
    };

    const handleMemberStatusChange = (memberId: string, newStatus: TeamMember['status']) => {
        setTeamMembers(prev => prev.map(member =>
            member.id === memberId ? { ...member, status: newStatus } : member
        ));
        onMemberStatusChange(memberId, newStatus);
    };

    const getStatusColor = (status: TeamMember['status']) => {
        switch (status) {
            case 'online': return '#10b981';
            case 'offline': return '#6b7280';
            case 'away': return '#f59e0b';
            case 'busy': return '#dc2626';
            default: return '#6b7280';
        }
    };

    const getTaskStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'pending': return '#6b7280';
            case 'in-progress': return '#3b82f6';
            case 'completed': return '#10b981';
            case 'overdue': return '#dc2626';
            default: return '#6b7280';
        }
    };

    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'low': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'high': return '#dc2626';
            default: return '#6b7280';
        }
    };

    return (
        <div className="enhanced-collaboration">
            <div className="collaboration-header">
                <h2>👥 팀 협업</h2>
                <div className="tab-navigation">
                    <button
                        className={`tab-btn ${selectedTab === 'members' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('members')}
                    >
                        팀원 ({teamMembers.length})
                    </button>
                    <button
                        className={`tab-btn ${selectedTab === 'tasks' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('tasks')}
                    >
                        작업 ({tasks.length})
                    </button>
                    <button
                        className={`tab-btn ${selectedTab === 'activities' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('activities')}
                    >
                        활동 ({activities.length})
                    </button>
                </div>
            </div>

            <div className="collaboration-content">
                {selectedTab === 'members' && (
                    <div className="members-section">
                        <div className="members-grid">
                            {teamMembers.map(member => (
                                <div key={member.id} className="member-card">
                                    <div className="member-header">
                                        <div className="member-avatar">{member.avatar}</div>
                                        <div className="member-info">
                                            <h3>{member.name}</h3>
                                            <div className="member-status">
                                                <span
                                                    className="status-indicator"
                                                    style={{ backgroundColor: getStatusColor(member.status) }}
                                                ></span>
                                                <span className="status-text">
                                                    {member.status === 'online' && '온라인'}
                                                    {member.status === 'offline' && '오프라인'}
                                                    {member.status === 'away' && '자리비움'}
                                                    {member.status === 'busy' && '바쁨'}
                                                </span>
                                            </div>
                                        </div>
                                        <select
                                            value={member.status}
                                            onChange={(e) => handleMemberStatusChange(member.id, e.target.value as TeamMember['status'])}
                                            className="status-select"
                                        >
                                            <option value="online">온라인</option>
                                            <option value="away">자리비움</option>
                                            <option value="busy">바쁨</option>
                                            <option value="offline">오프라인</option>
                                        </select>
                                    </div>
                                    {member.currentTask && (
                                        <div className="member-task">
                                            <h4>현재 작업</h4>
                                            <p>{member.currentTask}</p>
                                            {member.progress !== undefined && (
                                                <div className="task-progress">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${member.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="progress-text">{Math.round(member.progress)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedTab === 'tasks' && (
                    <div className="tasks-section">
                        <div className="tasks-header">
                            <h3>프로젝트 작업</h3>
                            <button className="add-task-btn">+ 새 작업</button>
                        </div>
                        <div className="tasks-list">
                            {tasks.map(task => (
                                <div key={task.id} className="task-card">
                                    <div className="task-header">
                                        <h4>{task.title}</h4>
                                        <div className="task-meta">
                                            <span
                                                className="priority-badge"
                                                style={{ backgroundColor: getPriorityColor(task.priority) }}
                                            >
                                                {task.priority === 'low' && '낮음'}
                                                {task.priority === 'medium' && '보통'}
                                                {task.priority === 'high' && '높음'}
                                            </span>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: getTaskStatusColor(task.status) }}
                                            >
                                                {task.status === 'pending' && '대기'}
                                                {task.status === 'in-progress' && '진행중'}
                                                {task.status === 'completed' && '완료'}
                                                {task.status === 'overdue' && '지연'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="task-description">{task.description}</p>
                                    <div className="task-details">
                                        <span className="task-assignee">담당자: {task.assignee}</span>
                                        <span className="task-due-date">마감일: {task.dueDate}</span>
                                    </div>
                                    <div className="task-progress-section">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${task.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">{task.progress}%</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={task.progress}
                                            onChange={(e) => handleTaskProgressUpdate(task.id, parseInt(e.target.value))}
                                            className="progress-slider"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedTab === 'activities' && (
                    <div className="activities-section">
                        <div className="activities-list">
                            {activities.map(activity => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-icon">
                                        {activity.type === 'task' && '📋'}
                                        {activity.type === 'message' && '💬'}
                                        {activity.type === 'file' && '📁'}
                                        {activity.type === 'meeting' && '📅'}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-header">
                                            <span className="activity-user">{activity.user}</span>
                                            <span className="activity-action">{activity.action}</span>
                                        </div>
                                        <p className="activity-details">{activity.details}</p>
                                        <span className="activity-time">{activity.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedCollaboration;
