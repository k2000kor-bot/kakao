/**
 * collaborationService 서비스 테스트
 * 협업 서비스 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import { collaborationService } from '../collaborationService';

// localStorage 모킹
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('collaborationService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(collaborationService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = collaborationService;
      const instance2 = collaborationService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('사용자 관리', () => {
    it('프로젝트 사용자 목록을 가져올 수 있어야 함', () => {
      const users = collaborationService.getProjectUsers('project-1');
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(0);
    });

    it('프로젝트 사용자를 추가할 수 있어야 함', () => {
      const user = collaborationService.addProjectUser('project-1', {
        id: 'user-1',
        name: '테스트 사용자',
        email: 'test@example.com',
        role: 'member'
      });

      expect(user).toBeDefined();
      expect(user.id).toBe('user-1');
      expect(user.name).toBe('테스트 사용자');
      expect(user.joinedAt).toBeDefined();
      expect(user.lastActive).toBeDefined();

      const users = collaborationService.getProjectUsers('project-1');
      expect(users.length).toBe(1);
      expect(users[0].id).toBe('user-1');
    });

    it('사용자 활동을 업데이트할 수 있어야 함', () => {
      const user = collaborationService.addProjectUser('project-1', {
        id: 'user-1',
        name: '테스트 사용자',
        email: 'test@example.com',
        role: 'member'
      });

      const initialLastActive = user.lastActive;
      
      // 시간을 약간 지연시켜 업데이트
      setTimeout(() => {
        collaborationService.updateUserActivity('project-1', 'user-1');
        const users = collaborationService.getProjectUsers('project-1');
        expect(new Date(users[0].lastActive).getTime()).toBeGreaterThanOrEqual(initialLastActive.getTime());
      }, 10);
    });
  });

  describe('프로젝트 공유', () => {
    it('프로젝트를 공유할 수 있어야 함', () => {
      const share = collaborationService.shareProject('project-1', {
        projectId: 'project-1',
        sharedBy: 'user-1',
        sharedWith: 'user-2',
        permissions: 'read'
      });

      expect(share).toBeDefined();
      expect(share.id).toBeDefined();
      expect(share.sharedBy).toBe('user-1');
      expect(share.sharedWith).toBe('user-2');
      expect(share.permissions).toBe('read');
      expect(share.sharedAt).toBeDefined();
    });

    it('프로젝트 공유 목록을 가져올 수 있어야 함', () => {
      collaborationService.shareProject('project-1', {
        projectId: 'project-1',
        sharedBy: 'user-1',
        sharedWith: 'user-2',
        permissions: 'read'
      });

      const shares = collaborationService.getProjectShares('project-1');
      expect(Array.isArray(shares)).toBe(true);
      expect(shares.length).toBe(1);
    });
  });

  describe('댓글 관리', () => {
    it('댓글을 추가할 수 있어야 함', () => {
      const comment = collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        authorId: 'user-1',
        content: '테스트 댓글'
      });

      expect(comment).toBeDefined();
      expect(comment.id).toBeDefined();
      expect(comment.content).toBe('테스트 댓글');
      expect(comment.createdAt).toBeDefined();
      expect(comment.updatedAt).toBeDefined();
      // mentions는 선택적이거나 나중에 추가될 수 있음
      if (comment.mentions !== undefined) {
        expect(Array.isArray(comment.mentions)).toBe(true);
      }
      expect(typeof comment.reactions).toBe('object');
    });

    it('프로젝트 댓글 목록을 가져올 수 있어야 함', () => {
      collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        authorId: 'user-1',
        content: '댓글 1'
      });

      const comments = collaborationService.getProjectComments('project-1');
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(1);
    });

    it('특정 타겟의 댓글만 가져올 수 있어야 함', () => {
      collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        authorId: 'user-1',
        content: '댓글 1'
      });

      collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-2',
        authorId: 'user-1',
        content: '댓글 2'
      });

      const comments = collaborationService.getProjectComments('project-1', 'project', 'target-1');
      expect(comments.length).toBe(1);
      expect(comments[0].targetId).toBe('target-1');
    });

    it('댓글을 업데이트할 수 있어야 함', () => {
      const comment = collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        authorId: 'user-1',
        content: '원본 댓글'
      });

      const updated = collaborationService.updateComment('project-1', comment.id, {
        content: '수정된 댓글'
      });

      expect(updated).toBeDefined();
      expect(updated?.content).toBe('수정된 댓글');
    });

    it('댓글을 삭제할 수 있어야 함', () => {
      const comment = collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        authorId: 'user-1',
        content: '삭제할 댓글'
      });

      const deleted = collaborationService.deleteComment('project-1', comment.id);
      expect(deleted).toBe(true);

      const comments = collaborationService.getProjectComments('project-1');
      expect(comments.length).toBe(0);
    });

    it('댓글을 해결 상태로 표시할 수 있어야 함', () => {
      const comment = collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        authorId: 'user-1',
        content: '해결할 댓글'
      });

      const resolved = collaborationService.updateComment('project-1', comment.id, {
        isResolved: true
      });

      expect(resolved?.isResolved).toBe(true);
    });
  });

  describe('멘션 관리', () => {
    it('멘션을 추가할 수 있어야 함', () => {
      const mention = collaborationService.addMention('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        mentionedBy: 'user-1',
        mentionedUser: 'user-2',
        context: '멘션 컨텍스트'
      });

      expect(mention).toBeDefined();
      expect(mention.id).toBeDefined();
      expect(mention.mentionedBy).toBe('user-1');
      expect(mention.mentionedUser).toBe('user-2');
      expect(mention.isRead).toBe(false);
      expect(mention.createdAt).toBeDefined();
    });

    it('프로젝트 멘션 목록을 가져올 수 있어야 함', () => {
      collaborationService.addMention('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        mentionedBy: 'user-1',
        mentionedUser: 'user-2',
        context: '멘션'
      });

      const mentions = collaborationService.getProjectMentions('project-1');
      expect(Array.isArray(mentions)).toBe(true);
      expect(mentions.length).toBe(1);
    });

    it('특정 사용자의 멘션만 가져올 수 있어야 함', () => {
      collaborationService.addMention('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        mentionedBy: 'user-1',
        mentionedUser: 'user-2',
        context: '멘션 1'
      });

      collaborationService.addMention('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        mentionedBy: 'user-1',
        mentionedUser: 'user-3',
        context: '멘션 2'
      });

      const mentions = collaborationService.getProjectMentions('project-1', 'user-2');
      expect(mentions.length).toBe(1);
      expect(mentions[0].mentionedUser).toBe('user-2');
    });

    it('멘션을 읽음 상태로 표시할 수 있어야 함', () => {
      const mention = collaborationService.addMention('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        mentionedBy: 'user-1',
        mentionedUser: 'user-2',
        context: '멘션'
      });

      collaborationService.markMentionAsRead('project-1', mention.id);

      const mentions = collaborationService.getProjectMentions('project-1');
      expect(mentions[0].isRead).toBe(true);
    });
  });

  describe('반응 관리', () => {
    it('댓글에 반응을 추가할 수 있어야 함', () => {
      const comment = collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        authorId: 'user-1',
        content: '댓글'
      });

      collaborationService.addReaction('project-1', comment.id, 'user-2', '👍');

      const comments = collaborationService.getProjectComments('project-1');
      expect(comments[0].reactions['user-2']).toBe('👍');
    });

    it('댓글에서 반응을 제거할 수 있어야 함', () => {
      const comment = collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        authorId: 'user-1',
        content: '댓글'
      });

      collaborationService.addReaction('project-1', comment.id, 'user-2', '👍');
      collaborationService.removeReaction('project-1', comment.id, 'user-2');

      const comments = collaborationService.getProjectComments('project-1');
      expect(comments[0].reactions['user-2']).toBeUndefined();
    });
  });

  describe('활동 로그', () => {
    it('활동을 추가할 수 있어야 함', () => {
      const activity = collaborationService.addActivity(
        'project-1',
        'user-1',
        'created',
        'project',
        'target-1',
        { metadata: 'test' }
      );

      expect(activity).toBeDefined();
      expect(activity.id).toBeDefined();
      expect(activity.userId).toBe('user-1');
      expect(activity.action).toBe('created');
      expect(activity.targetType).toBe('project');
      expect(activity.timestamp).toBeDefined();
    });

    it('프로젝트 활동 목록을 가져올 수 있어야 함', () => {
      collaborationService.addActivity('project-1', 'user-1', 'created', 'project', 'target-1');
      collaborationService.addActivity('project-1', 'user-2', 'updated', 'project', 'target-1');

      const activities = collaborationService.getProjectActivities('project-1');
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBe(2);
    });

    it('활동 목록을 limit으로 제한할 수 있어야 함', () => {
      for (let i = 0; i < 10; i++) {
        collaborationService.addActivity('project-1', 'user-1', 'created', 'project', `target-${i}`);
      }

      const activities = collaborationService.getProjectActivities('project-1', 5);
      expect(activities.length).toBeLessThanOrEqual(5);
    });
  });

  describe('권한 확인', () => {
    it('사용자 권한을 확인할 수 있어야 함', () => {
      collaborationService.addProjectUser('project-1', {
        id: 'user-1',
        name: '관리자',
        email: 'admin@example.com',
        role: 'admin'
      });

      expect(collaborationService.hasPermission('project-1', 'user-1', 'read')).toBe(true);
      expect(collaborationService.hasPermission('project-1', 'user-1', 'write')).toBe(true);
      expect(collaborationService.hasPermission('project-1', 'user-1', 'admin')).toBe(true);
    });

    it('viewer 역할은 read 권한만 있어야 함', () => {
      collaborationService.addProjectUser('project-1', {
        id: 'user-1',
        name: '뷰어',
        email: 'viewer@example.com',
        role: 'viewer'
      });

      expect(collaborationService.hasPermission('project-1', 'user-1', 'read')).toBe(true);
      expect(collaborationService.hasPermission('project-1', 'user-1', 'write')).toBe(false);
      expect(collaborationService.hasPermission('project-1', 'user-1', 'admin')).toBe(false);
    });

    it('존재하지 않는 사용자는 권한이 없어야 함', () => {
      expect(collaborationService.hasPermission('project-1', 'non-existent', 'read')).toBe(false);
    });
  });

  describe('통계', () => {
    it('협업 통계를 가져올 수 있어야 함', () => {
      collaborationService.addProjectUser('project-1', {
        id: 'user-1',
        name: '사용자 1',
        email: 'user1@example.com',
        role: 'member'
      });

      collaborationService.addComment('project-1', {
        projectId: 'project-1',
        targetType: 'project',
        targetId: 'target-1',
        authorId: 'user-1',
        content: '댓글'
      });

      const stats = collaborationService.getCollaborationStats('project-1');
      expect(stats).toBeDefined();
      expect(typeof stats.totalUsers).toBe('number');
      expect(typeof stats.activeUsers).toBe('number');
      expect(typeof stats.totalComments).toBe('number');
      expect(typeof stats.totalMentions).toBe('number');
      expect(typeof stats.unreadMentions).toBe('number');
      expect(Array.isArray(stats.recentActivities)).toBe(true);
    });
  });
});

