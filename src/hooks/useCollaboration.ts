import { useState, useEffect, useCallback } from 'react';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActivity: Date;
}

interface CollaborationState {
  projectId: string;
  collaborators: Collaborator[];
  isSharing: boolean;
  shareUrl: string;
}

export const useCollaboration = (projectId: string) => {
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    projectId,
    collaborators: [],
    isSharing: false,
    shareUrl: ''
  });

  const [currentUser] = useState<Collaborator>({
    id: `user_${Date.now()}`,
    name: '사용자',
    avatar: '👤',
    status: 'online',
    lastActivity: new Date()
  });

  // 프로젝트 공유 시작
  const startSharing = useCallback(async () => {
    try {
      const shareUrl = `${window.location.origin}/project/${projectId}?share=true`;
      setCollaborationState(prev => ({
        ...prev,
        isSharing: true,
        shareUrl
      }));

      // 공유 URL을 클립보드에 복사
      await navigator.clipboard.writeText(shareUrl);
      
      console.log('[Collaboration] 프로젝트 공유가 시작되었습니다.');
      return shareUrl;
    } catch (error) {
      console.error('[Collaboration] 공유 시작 실패:', error);
      throw error;
    }
  }, [projectId]);

  // 프로젝트 공유 중지
  const stopSharing = useCallback(() => {
    setCollaborationState(prev => ({
      ...prev,
      isSharing: false,
      shareUrl: ''
    }));
    console.log('[Collaboration] 프로젝트 공유가 중지되었습니다.');
  }, []);

  // 협업자 추가 (시뮬레이션)
  const addCollaborator = useCallback((collaborator: Omit<Collaborator, 'id'>) => {
    const newCollaborator: Collaborator = {
      ...collaborator,
      id: `collaborator_${Date.now()}_${Math.random().toString(36).slice(2)}`
    };

    setCollaborationState(prev => ({
      ...prev,
      collaborators: [...prev.collaborators, newCollaborator]
    }));

    console.log('[Collaboration] 새로운 협업자가 추가되었습니다:', newCollaborator.name);
  }, []);

  // 협업자 제거
  const removeCollaborator = useCallback((collaboratorId: string) => {
    setCollaborationState(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(c => c.id !== collaboratorId)
    }));

    console.log('[Collaboration] 협업자가 제거되었습니다:', collaboratorId);
  }, []);

  // 사용자 상태 업데이트
  const updateUserStatus = useCallback((status: Collaborator['status']) => {
    setCollaborationState(prev => ({
      ...prev,
      collaborators: prev.collaborators.map(c => 
        c.id === currentUser.id ? { ...c, status, lastActivity: new Date() } : c
      )
    }));
  }, [currentUser.id]);

  // 실시간 활동 감지 (시뮬레이션)
  useEffect(() => {
    const interval = setInterval(() => {
      updateUserStatus('online');
    }, 30000); // 30초마다 온라인 상태 업데이트

    return () => clearInterval(interval);
  }, [updateUserStatus]);

  return {
    collaborationState,
    currentUser,
    startSharing,
    stopSharing,
    addCollaborator,
    removeCollaborator,
    updateUserStatus
  };
};
