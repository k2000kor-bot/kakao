/**
 * projectShareService 서비스 테스트
 * 프로젝트 공유 서비스 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import projectShareService, { ProjectShareLink } from '../projectShareService';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

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
    },
  };
})();

// window.location 모킹
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com',
  },
  writable: true,
});

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('projectShareService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(projectShareService).toBeDefined();
    });
  });

  describe('createShareLink', () => {
    it('공유 링크를 생성할 수 있어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      expect(shareLink).toBeDefined();
      expect(shareLink.id).toBeDefined();
      expect(shareLink.projectId).toBe('project-123');
      expect(shareLink.shareToken).toBeDefined();
      expect(shareLink.permission).toBe('read');
      expect(shareLink.currentUses).toBe(0);
      expect(shareLink.isActive).toBe(true);
      expect(shareLink.createdBy).toBe('system');
    });

    it('모든 옵션을 포함하여 공유 링크를 생성할 수 있어야 함', () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'write',
        expiresAt,
        maxUses: 10,
        password: 'password123',
        description: '테스트 공유',
        createdBy: 'user-123',
      });

      expect(shareLink.permission).toBe('write');
      expect(shareLink.expiresAt).toBe(expiresAt.toISOString());
      expect(shareLink.maxUses).toBe(10);
      expect(shareLink.password).toBe('password123');
      expect(shareLink.description).toBe('테스트 공유');
      expect(shareLink.createdBy).toBe('user-123');
    });
  });

  describe('getShareLink', () => {
    it('공유 링크를 조회할 수 있어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      const retrieved = projectShareService.getShareLink(shareLink.shareToken);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(shareLink.id);
    });

    it('비활성화된 공유 링크는 조회되지 않아야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      projectShareService.deleteShareLink(shareLink.id);

      const retrieved = projectShareService.getShareLink(shareLink.shareToken);
      expect(retrieved).toBeNull();
    });

    it('존재하지 않는 공유 링크는 null을 반환해야 함', () => {
      const retrieved = projectShareService.getShareLink('nonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('getProjectShares', () => {
    it('프로젝트의 모든 공유 링크를 조회할 수 있어야 함', () => {
      projectShareService.createShareLink('project-123', {
        permission: 'read',
      });
      projectShareService.createShareLink('project-123', {
        permission: 'write',
      });
      projectShareService.createShareLink('project-456', {
        permission: 'read',
      });

      const shares = projectShareService.getProjectShares('project-123');
      expect(shares.length).toBe(2);
      shares.forEach(share => {
        expect(share.projectId).toBe('project-123');
        expect(share.isActive).toBe(true);
      });
    });

    it('비활성화된 공유 링크는 포함되지 않아야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      projectShareService.deleteShareLink(shareLink.id);

      const shares = projectShareService.getProjectShares('project-123');
      expect(shares.length).toBe(0);
    });
  });

  describe('updateShareLink', () => {
    it('공유 링크를 업데이트할 수 있어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      const updated = projectShareService.updateShareLink(shareLink.id, {
        permission: 'write',
        description: '업데이트된 설명',
      });

      expect(updated).toBe(true);
      const retrieved = projectShareService.getShareLink(shareLink.shareToken);
      expect(retrieved?.permission).toBe('write');
      expect(retrieved?.description).toBe('업데이트된 설명');
    });

    it('존재하지 않는 공유 링크 업데이트는 false를 반환해야 함', () => {
      const result = projectShareService.updateShareLink('nonexistent', {
        permission: 'read',
      });

      expect(result).toBe(false);
    });
  });

  describe('deleteShareLink', () => {
    it('공유 링크를 삭제(비활성화)할 수 있어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      const deleted = projectShareService.deleteShareLink(shareLink.id);
      expect(deleted).toBe(true);

      const retrieved = projectShareService.getShareLink(shareLink.shareToken);
      expect(retrieved).toBeNull();
    });

    it('존재하지 않는 공유 링크 삭제는 false를 반환해야 함', () => {
      const result = projectShareService.deleteShareLink('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('validateShareAccess', () => {
    it('유효한 공유 링크는 접근이 허용되어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      const validation = projectShareService.validateShareAccess(shareLink.shareToken);
      expect(validation.valid).toBe(true);
      expect(validation.shareLink).not.toBeNull();
    });

    it('비밀번호가 있는 공유 링크는 올바른 비밀번호로 접근할 수 있어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
        password: 'password123',
      });

      const validation = projectShareService.validateShareAccess(
        shareLink.shareToken,
        'password123'
      );
      expect(validation.valid).toBe(true);
    });

    it('비밀번호가 틀리면 접근이 거부되어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
        password: 'password123',
      });

      const validation = projectShareService.validateShareAccess(
        shareLink.shareToken,
        'wrongpassword'
      );
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('비밀번호가 일치하지 않습니다.');
    });

    it('만료된 공유 링크는 접근이 거부되어야 함', () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() - 1); // 어제 만료

      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
        expiresAt,
      });

      const validation = projectShareService.validateShareAccess(shareLink.shareToken);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('공유 링크가 만료되었습니다.');
    });

    it('최대 사용 횟수를 초과한 공유 링크는 접근이 거부되어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
        maxUses: 2,
      });

      // 사용 횟수 증가
      projectShareService.recordAccess(shareLink.shareToken);
      projectShareService.recordAccess(shareLink.shareToken);

      const validation = projectShareService.validateShareAccess(shareLink.shareToken);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('공유 링크의 최대 사용 횟수를 초과했습니다.');
    });

    it('존재하지 않는 공유 링크는 접근이 거부되어야 함', () => {
      const validation = projectShareService.validateShareAccess('nonexistent');
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('공유 링크를 찾을 수 없습니다.');
    });
  });

  describe('recordAccess', () => {
    it('공유 링크 접근을 기록할 수 있어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      const initialUses = shareLink.currentUses;
      projectShareService.recordAccess(shareLink.shareToken, 'user-123', '192.168.1.1');

      const retrieved = projectShareService.getShareLink(shareLink.shareToken);
      expect(retrieved?.currentUses).toBe(initialUses + 1);
    });

    it('존재하지 않는 공유 링크 접근은 기록되지 않아야 함', () => {
      expect(() => {
        projectShareService.recordAccess('nonexistent');
      }).not.toThrow();
    });
  });

  describe('generateShareUrl', () => {
    it('공유 링크 URL을 생성할 수 있어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      const url = projectShareService.generateShareUrl(shareLink.shareToken);
      expect(url).toContain(shareLink.shareToken);
      expect(url).toContain('share=');
    });

    it('생성된 URL은 origin과 쿼리 share=토큰 형식이어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-456', {
        permission: 'read',
      });
      const url = projectShareService.generateShareUrl(shareLink.shareToken);
      expect(url).toBe(`https://example.com?share=${shareLink.shareToken}`);
    });
  });

  describe('getShareStats', () => {
    it('공유 링크 통계를 조회할 수 있어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      projectShareService.recordAccess(shareLink.shareToken, 'user-1');
      projectShareService.recordAccess(shareLink.shareToken, 'user-2');

      const stats = projectShareService.getShareStats(shareLink.id);
      expect(stats.totalAccesses).toBe(2);
      expect(stats.uniqueAccesses).toBeGreaterThan(0);
    });

    it('접근 기록이 없으면 0을 반환해야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      const stats = projectShareService.getShareStats(shareLink.id);
      expect(stats.totalAccesses).toBe(0);
      expect(stats.uniqueAccesses).toBe(0);
    });

    it('존재하지 않는 공유 링크는 빈 통계를 반환해야 함', () => {
      const stats = projectShareService.getShareStats('nonexistent');
      expect(stats.totalAccesses).toBe(0);
      expect(stats.uniqueAccesses).toBe(0);
    });

    it('마지막 접근 시간을 반환해야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      projectShareService.recordAccess(shareLink.shareToken);

      const stats = projectShareService.getShareStats(shareLink.id);
      expect(stats.lastAccessed).toBeDefined();
    });
  });

  describe('localStorage 통합', () => {
    it('공유 링크가 localStorage에 저장되어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      const stored = localStorage.getItem('corbu_project_shares');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed.some((s: ProjectShareLink) => s.id === shareLink.id)).toBe(true);
    });

    it('접근 로그가 localStorage에 저장되어야 함', () => {
      const shareLink = projectShareService.createShareLink('project-123', {
        permission: 'read',
      });

      projectShareService.recordAccess(shareLink.shareToken);

      const stored = localStorage.getItem('corbu_project_share_access');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBeGreaterThan(0);
    });
  });
});

