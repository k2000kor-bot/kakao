/**
 * 프로젝트 공유 서비스
 * 프로젝트 공유 링크 생성, 관리, 접근 제어
 * 
 * Task-B4: 프로젝트 허브 확장
 */

import { API_QUERY_PARAM_SHARE } from '../config/api';
import { errorLogger } from '../utils/errorLogger';

export interface ProjectShareLink {
  id: string;
  projectId: string;
  shareToken: string; // 공유 토큰 (URL에 사용)
  permission: 'read' | 'write' | 'admin';
  expiresAt?: string; // 만료일 (ISO string)
  maxUses?: number; // 최대 사용 횟수
  currentUses: number; // 현재 사용 횟수
  password?: string; // 비밀번호 (선택)
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  description?: string; // 공유 설명
}

export interface ProjectShareAccess {
  projectId: string;
  shareToken: string;
  accessedAt: string;
  accessedBy?: string;
  ipAddress?: string;
}

class ProjectShareService {
  private readonly SHARES_KEY = 'corbu_project_shares';
  private readonly ACCESS_LOG_KEY = 'corbu_project_share_access';

  /**
   * 공유 링크 생성
   */
  createShareLink(
    projectId: string,
    options: {
      permission: 'read' | 'write' | 'admin';
      expiresAt?: Date;
      maxUses?: number;
      password?: string;
      description?: string;
      createdBy?: string;
    }
  ): ProjectShareLink {
    const shares = this.getAllShares();
    const shareToken = this.generateShareToken();

    const newShare: ProjectShareLink = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      shareToken,
      permission: options.permission,
      expiresAt: options.expiresAt?.toISOString(),
      maxUses: options.maxUses,
      currentUses: 0,
      password: options.password,
      createdAt: new Date().toISOString(),
      createdBy: options.createdBy || 'system',
      isActive: true,
      description: options.description,
    };

    shares.push(newShare);
    this.saveShares(shares);

    return newShare;
  }

  /**
   * 공유 링크 조회
   */
  getShareLink(shareToken: string): ProjectShareLink | null {
    const shares = this.getAllShares();
    return shares.find(s => s.shareToken === shareToken && s.isActive) || null;
  }

  /**
   * 프로젝트의 모든 공유 링크 조회
   */
  getProjectShares(projectId: string): ProjectShareLink[] {
    const shares = this.getAllShares();
    return shares.filter(s => s.projectId === projectId && s.isActive);
  }

  /**
   * 공유 링크 업데이트
   */
  updateShareLink(
    shareId: string,
    updates: Partial<Omit<ProjectShareLink, 'id' | 'projectId' | 'shareToken' | 'createdAt' | 'createdBy'>>
  ): boolean {
    const shares = this.getAllShares();
    const index = shares.findIndex(s => s.id === shareId);

    if (index === -1) return false;

    shares[index] = {
      ...shares[index],
      ...updates,
    };

    this.saveShares(shares);
    return true;
  }

  /**
   * 공유 링크 삭제 (비활성화)
   */
  deleteShareLink(shareId: string): boolean {
    return this.updateShareLink(shareId, { isActive: false });
  }

  /**
   * 공유 링크 접근 검증
   */
  validateShareAccess(shareToken: string, password?: string): {
    valid: boolean;
    shareLink: ProjectShareLink | null;
    reason?: string;
  } {
    const shareLink = this.getShareLink(shareToken);

    if (!shareLink) {
      return {
        valid: false,
        shareLink: null,
        reason: '공유 링크를 찾을 수 없습니다.',
      };
    }

    // 만료 확인
    if (shareLink.expiresAt) {
      const expiresAt = new Date(shareLink.expiresAt);
      if (new Date() > expiresAt) {
        return {
          valid: false,
          shareLink: null,
          reason: '공유 링크가 만료되었습니다.',
        };
      }
    }

    // 사용 횟수 확인
    if (shareLink.maxUses && shareLink.currentUses >= shareLink.maxUses) {
      return {
        valid: false,
        shareLink: null,
        reason: '공유 링크의 최대 사용 횟수를 초과했습니다.',
      };
    }

    // 비밀번호 확인
    if (shareLink.password && shareLink.password !== password) {
      return {
        valid: false,
        shareLink: null,
        reason: '비밀번호가 일치하지 않습니다.',
      };
    }

    return {
      valid: true,
      shareLink,
    };
  }

  /**
   * 공유 링크 접근 기록
   */
  recordAccess(shareToken: string, accessedBy?: string, ipAddress?: string): void {
    const shareLink = this.getShareLink(shareToken);
    if (!shareLink) return;

    // 사용 횟수 증가
    this.updateShareLink(shareLink.id, {
      currentUses: shareLink.currentUses + 1,
    });

    // 접근 로그 기록
    const accessLogs = this.getAccessLogs();
    const access: ProjectShareAccess = {
      projectId: shareLink.projectId,
      shareToken,
      accessedAt: new Date().toISOString(),
      accessedBy,
      ipAddress,
    };

    accessLogs.push(access);

    // 최대 1000개까지만 보관
    if (accessLogs.length > 1000) {
      accessLogs.shift();
    }

    this.saveAccessLogs(accessLogs);
  }

  /**
   * 공유 링크 URL 생성
   */
  generateShareUrl(shareToken: string): string {
    return `${window.location.origin}?${API_QUERY_PARAM_SHARE}=${encodeURIComponent(shareToken)}`;
  }

  /**
   * 공유 링크 통계 조회
   */
  getShareStats(shareId: string): {
    totalAccesses: number;
    uniqueAccesses: number;
    lastAccessed?: string;
  } {
    const shareLink = this.getShareLinkById(shareId);
    if (!shareLink) {
      return { totalAccesses: 0, uniqueAccesses: 0 };
    }

    const accessLogs = this.getAccessLogs();
    const shareAccesses = accessLogs.filter(
      log => log.shareToken === shareLink.shareToken
    );

    const uniqueAccesses = new Set(
      shareAccesses.map(log => log.accessedBy || log.ipAddress)
    ).size;

    const lastAccessed = shareAccesses.length > 0
      ? shareAccesses[shareAccesses.length - 1].accessedAt
      : undefined;

    return {
      totalAccesses: shareAccesses.length,
      uniqueAccesses,
      lastAccessed,
    };
  }

  /**
   * 공유 토큰 생성
   */
  private generateShareToken(): string {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  /**
   * ID로 공유 링크 조회
   */
  private getShareLinkById(shareId: string): ProjectShareLink | null {
    const shares = this.getAllShares();
    return shares.find(s => s.id === shareId) || null;
  }

  /**
   * 모든 공유 링크 조회
   */
  private getAllShares(): ProjectShareLink[] {
    try {
      const sharesJson = localStorage.getItem(this.SHARES_KEY);
      return sharesJson ? JSON.parse(sharesJson) : [];
    } catch (error) {
      errorLogger.error('공유 링크 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'projectShareService',
        action: 'getAllShares',
      });
      return [];
    }
  }

  /**
   * 공유 링크 저장
   */
  private saveShares(shares: ProjectShareLink[]): void {
    try {
      localStorage.setItem(this.SHARES_KEY, JSON.stringify(shares));
    } catch (error) {
      errorLogger.error('공유 링크 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'projectShareService',
        action: 'saveShares',
        sharesCount: shares.length,
      });
    }
  }

  /**
   * 접근 로그 조회
   */
  private getAccessLogs(): ProjectShareAccess[] {
    try {
      const logsJson = localStorage.getItem(this.ACCESS_LOG_KEY);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      errorLogger.error('접근 로그 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'projectShareService',
        action: 'getAccessLogs',
      });
      return [];
    }
  }

  /**
   * 접근 로그 저장
   */
  private saveAccessLogs(logs: ProjectShareAccess[]): void {
    try {
      localStorage.setItem(this.ACCESS_LOG_KEY, JSON.stringify(logs));
    } catch (error) {
      errorLogger.error('접근 로그 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'projectShareService',
        action: 'saveAccessLog',
        logsCount: logs.length,
      });
    }
  }
}

// 싱글톤 인스턴스
const projectShareService = new ProjectShareService();

export default projectShareService;

