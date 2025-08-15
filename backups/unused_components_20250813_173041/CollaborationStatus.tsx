import React, { useState, useEffect } from 'react';
import { realtimeCollaboration, UserStatus, CollaborationMessage } from '../services/realtimeCollaboration';

interface CollaborationStatusProps {
    projectId?: string;
    projectName?: string;
}

const CollaborationStatus: React.FC<CollaborationStatusProps> = ({
    projectId,
    projectName
}) => {
    const [activeUsers, setActiveUsers] = useState<UserStatus[]>([]);
    const [recentMessages, setRecentMessages] = useState<CollaborationMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

    useEffect(() => {
        // 연결 상태 모니터링
        const checkConnection = () => {
            setIsConnected(realtimeCollaboration.isConnected());
        };

        const interval = setInterval(checkConnection, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // 사용자 상태 업데이트 리스너
        realtimeCollaboration.on('userStatus', (users: UserStatus[]) => {
            setActiveUsers(users);
        });

        // 메시지 리스너
        realtimeCollaboration.on('message', (message: CollaborationMessage) => {
            setRecentMessages(prev => [message, ...prev.slice(0, 9)]); // 최근 10개만 유지
        });

        // 프로젝트 업데이트 리스너
        realtimeCollaboration.on('projectUpdate', (data: any) => {
            if (data.projectId === projectId) {
                setActiveUsers(data.activeUsers || []);
            }
        });

        // 초기 연결 시도
        if (!isConnected && projectId) {
            setConnectionStatus('connecting');
            realtimeCollaboration.connect('user-' + Date.now(), '사용자')
                .then(() => {
                    setConnectionStatus('connected');
                    realtimeCollaboration.joinProject(projectId);
                })
                .catch(() => {
                    setConnectionStatus('disconnected');
                });
        }

        return () => {
            if (projectId) {
                realtimeCollaboration.leaveProject();
            }
        };
    }, [projectId, isConnected]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'busy': return 'bg-red-500';
            case 'offline': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'online': return '온라인';
            case 'away': return '자리비움';
            case 'busy': return '바쁨';
            case 'offline': return '오프라인';
            default: return '알 수 없음';
        }
    };

    const getMessageIcon = (type: string) => {
        switch (type) {
            case 'file': return '📁';
            case 'analysis': return '📊';
            case 'insight': return '💡';
            case 'status': return '🔄';
            default: return '💬';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            {/* 연결 상태 */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">협업 상태</h3>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                    <span className="text-sm text-gray-600">
                        {connectionStatus === 'connected' ? '연결됨' :
                            connectionStatus === 'connecting' ? '연결 중' : '연결 끊김'}
                    </span>
                </div>
            </div>

            {/* 활성 사용자 */}
            <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">활성 사용자 ({activeUsers.length})</h4>
                <div className="space-y-2">
                    {activeUsers.map((user, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></div>
                            <span className="text-sm text-gray-900">{user.username}</span>
                            <span className="text-xs text-gray-500">({getStatusText(user.status)})</span>
                        </div>
                    ))}
                    {activeUsers.length === 0 && (
                        <p className="text-sm text-gray-500">활성 사용자가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 최근 활동 */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">최근 활동</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    {recentMessages.map((message, index) => (
                        <div key={index} className="flex items-start space-x-2">
                            <span className="text-sm">{getMessageIcon(message.type)}</span>
                            <div className="flex-1">
                                <div className="flex items-center space-x-1">
                                    <span className="text-xs font-medium text-blue-600">{message.sender}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-700">{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {recentMessages.length === 0 && (
                        <p className="text-sm text-gray-500">최근 활동이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 프로젝트 정보 */}
            {projectName && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">프로젝트 정보</h4>
                    <div className="text-sm text-gray-600">
                        <p>프로젝트: {projectName}</p>
                        <p>참여자: {activeUsers.length}명</p>
                        <p>활동: {recentMessages.length}개</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollaborationStatus; 