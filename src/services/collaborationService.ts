export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  lastActive: Date;
}

export interface ProjectShare {
  id: string;
  projectId: string;
  sharedBy: string;
  sharedWith: string;
  permissions: 'read' | 'write' | 'admin';
  sharedAt: Date;
  expiresAt?: Date;
  message?: string;
}

export interface Comment {
  id: string;
  projectId: string;
  targetType: 'project' | 'chat' | 'message' | 'knowledge';
  targetId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string; // 답글용
  mentions: string[]; // 멘션된 사용자 ID들
  reactions: { [userId: string]: string }; // 이모지 반응
  isResolved?: boolean; // 해결됨 표시
}

export interface Mention {
  id: string;
  projectId: string;
  targetType: 'project' | 'chat' | 'message' | 'knowledge';
  targetId: string;
  mentionedBy: string;
  mentionedUser: string;
  createdAt: Date;
  isRead: boolean;
  context: string; // 멘션된 컨텍스트
}

export interface CollaborationActivity {
  id: string;
  projectId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted' | 'shared' | 'commented' | 'mentioned';
  targetType: 'project' | 'chat' | 'message' | 'knowledge' | 'comment';
  targetId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

class CollaborationService {
  private readonly USERS_KEY = 'collaboration_users_';
  private readonly SHARES_KEY = 'project_shares_';
  private readonly COMMENTS_KEY = 'project_comments_';
  private readonly MENTIONS_KEY = 'project_mentions_';
  private readonly ACTIVITIES_KEY = 'project_activities_';

  // 사용자 관리
  getProjectUsers(projectId: string): CollaborationUser[] {
    const key = this.USERS_KEY + projectId;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  addProjectUser(projectId: string, user: Omit<CollaborationUser, 'joinedAt' | 'lastActive'>): CollaborationUser {
    const users = this.getProjectUsers(projectId);
    const newUser: CollaborationUser = {
      ...user,
      joinedAt: new Date(),
      lastActive: new Date()
    };
    
    users.push(newUser);
    this.saveProjectUsers(projectId, users);
    return newUser;
  }

  updateUserActivity(projectId: string, userId: string): void {
    const users = this.getProjectUsers(projectId);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].lastActive = new Date();
      this.saveProjectUsers(projectId, users);
    }
  }

  // 프로젝트 공유
  shareProject(projectId: string, shareData: Omit<ProjectShare, 'id' | 'sharedAt'>): ProjectShare {
    const shares = this.getProjectShares(projectId);
    const newShare: ProjectShare = {
      ...shareData,
      id: this.generateId(),
      sharedAt: new Date()
    };
    
    shares.push(newShare);
    this.saveProjectShares(projectId, shares);
    
    // 활동 로그 추가
    this.addActivity(projectId, shareData.sharedBy, 'shared', 'project', projectId, {
      sharedWith: shareData.sharedWith,
      permissions: shareData.permissions
    });
    
    return newShare;
  }

  getProjectShares(projectId: string): ProjectShare[] {
    const key = this.SHARES_KEY + projectId;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // 댓글 관리
  addComment(projectId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'reactions'>): Comment {
    const comments = this.getProjectComments(projectId);
    const newComment: Comment = {
      ...commentData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      reactions: {}
    };
    
    comments.push(newComment);
    this.saveProjectComments(projectId, comments);
    
    // 활동 로그 추가
    this.addActivity(projectId, commentData.authorId, 'commented', commentData.targetType, commentData.targetId, {
      content: commentData.content.substring(0, 100)
    });
    
    // 멘션 처리
    this.processMentions(projectId, newComment);
    
    return newComment;
  }

  getProjectComments(projectId: string, targetType?: string, targetId?: string): Comment[] {
    const key = this.COMMENTS_KEY + projectId;
    const data = localStorage.getItem(key);
    const comments: Comment[] = data ? JSON.parse(data) : [];
    
    if (targetType && targetId) {
      return comments.filter(c => c.targetType === targetType && c.targetId === targetId);
    }
    
    return comments;
  }

  updateComment(projectId: string, commentId: string, updates: Partial<Comment>): Comment | null {
    const comments = this.getProjectComments(projectId);
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex !== -1) {
      comments[commentIndex] = {
        ...comments[commentIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      this.saveProjectComments(projectId, comments);
      return comments[commentIndex];
    }
    
    return null;
  }

  deleteComment(projectId: string, commentId: string): boolean {
    const comments = this.getProjectComments(projectId);
    const filteredComments = comments.filter(c => c.id !== commentId);
    
    if (filteredComments.length !== comments.length) {
      this.saveProjectComments(projectId, filteredComments);
      return true;
    }
    
    return false;
  }

  // 멘션 처리
  processMentions(projectId: string, comment: Comment): void {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(comment.content)) !== null) {
      const username = match[1];
      const users = this.getProjectUsers(projectId);
      const user = users.find(u => u.name.toLowerCase().includes(username.toLowerCase()));
      
      if (user) {
        mentions.push(user.id);
        
        // 멘션 알림 생성
        this.addMention(projectId, {
          projectId: projectId,
          targetType: comment.targetType,
          targetId: comment.targetId,
          mentionedBy: comment.authorId,
          mentionedUser: user.id,
          context: comment.content.substring(Math.max(0, match.index - 50), match.index + 50)
        });
      }
    }
    
    // 댓글 업데이트
    if (mentions.length > 0) {
      this.updateComment(projectId, comment.id, { mentions });
    }
  }

  addMention(projectId: string, mentionData: Omit<Mention, 'id' | 'createdAt' | 'isRead'>): Mention {
    const mentions = this.getProjectMentions(projectId);
    const newMention: Mention = {
      ...mentionData,
      id: this.generateId(),
      createdAt: new Date(),
      isRead: false
    };
    
    mentions.push(newMention);
    this.saveProjectMentions(projectId, mentions);
    
    return newMention;
  }

  getProjectMentions(projectId: string, userId?: string): Mention[] {
    const key = this.MENTIONS_KEY + projectId;
    const data = localStorage.getItem(key);
    const mentions: Mention[] = data ? JSON.parse(data) : [];
    
    if (userId) {
      return mentions.filter(m => m.mentionedUser === userId);
    }
    
    return mentions;
  }

  markMentionAsRead(projectId: string, mentionId: string): void {
    const mentions = this.getProjectMentions(projectId);
    const mentionIndex = mentions.findIndex(m => m.id === mentionId);
    
    if (mentionIndex !== -1) {
      mentions[mentionIndex].isRead = true;
      this.saveProjectMentions(projectId, mentions);
    }
  }

  // 반응 관리
  addReaction(projectId: string, commentId: string, userId: string, emoji: string): void {
    const comments = this.getProjectComments(projectId);
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex !== -1) {
      comments[commentIndex].reactions[userId] = emoji;
      this.saveProjectComments(projectId, comments);
    }
  }

  removeReaction(projectId: string, commentId: string, userId: string): void {
    const comments = this.getProjectComments(projectId);
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex !== -1) {
      delete comments[commentIndex].reactions[userId];
      this.saveProjectComments(projectId, comments);
    }
  }

  // 활동 로그
  addActivity(
    projectId: string,
    userId: string,
    action: CollaborationActivity['action'],
    targetType: CollaborationActivity['targetType'],
    targetId: string,
    metadata?: Record<string, unknown>
  ): CollaborationActivity {
    const activities = this.getProjectActivities(projectId);
    const newActivity: CollaborationActivity = {
      id: this.generateId(),
      projectId,
      userId,
      action,
      targetType,
      targetId,
      timestamp: new Date(),
      metadata
    };
    
    activities.push(newActivity);
    this.saveProjectActivities(projectId, activities);
    
    return newActivity;
  }

  getProjectActivities(projectId: string, limit: number = 50): CollaborationActivity[] {
    const key = this.ACTIVITIES_KEY + projectId;
    const data = localStorage.getItem(key);
    const activities: CollaborationActivity[] = data ? JSON.parse(data) : [];
    
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // 권한 확인
  hasPermission(projectId: string, userId: string, permission: 'read' | 'write' | 'admin'): boolean {
    const users = this.getProjectUsers(projectId);
    const user = users.find(u => u.id === userId);
    
    if (!user) return false;
    
    const permissionLevels = {
      'viewer': 1,
      'member': 2,
      'admin': 3,
      'owner': 4
    };
    
    const requiredLevel = {
      'read': 1,
      'write': 2,
      'admin': 3
    };
    
    return permissionLevels[user.role] >= requiredLevel[permission];
  }

  // 통계
  getCollaborationStats(projectId: string) {
    const users = this.getProjectUsers(projectId);
    const comments = this.getProjectComments(projectId);
    const mentions = this.getProjectMentions(projectId);
    const activities = this.getProjectActivities(projectId);
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => {
        const lastActive = new Date(u.lastActive);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastActive > oneWeekAgo;
      }).length,
      totalComments: comments.length,
      totalMentions: mentions.length,
      unreadMentions: mentions.filter(m => !m.isRead).length,
      recentActivities: activities.slice(0, 10)
    };
  }

  // 유틸리티 메서드들
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveProjectUsers(projectId: string, users: CollaborationUser[]): void {
    const key = this.USERS_KEY + projectId;
    localStorage.setItem(key, JSON.stringify(users));
  }

  private saveProjectShares(projectId: string, shares: ProjectShare[]): void {
    const key = this.SHARES_KEY + projectId;
    localStorage.setItem(key, JSON.stringify(shares));
  }

  private saveProjectComments(projectId: string, comments: Comment[]): void {
    const key = this.COMMENTS_KEY + projectId;
    localStorage.setItem(key, JSON.stringify(comments));
  }

  private saveProjectMentions(projectId: string, mentions: Mention[]): void {
    const key = this.MENTIONS_KEY + projectId;
    localStorage.setItem(key, JSON.stringify(mentions));
  }

  private saveProjectActivities(projectId: string, activities: CollaborationActivity[]): void {
    const key = this.ACTIVITIES_KEY + projectId;
    localStorage.setItem(key, JSON.stringify(activities));
  }
}

export const collaborationService = new CollaborationService();
export default collaborationService;
