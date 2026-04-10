/**
 * 사용자 친화적인 에러 메시지 유틸리티
 * 
 * Task-F1: 에러 처리 개선 및 사용자 피드백 강화
 */

import { DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL } from '../config/api';
import { coerceTrimmedString } from './chatInputUtils';

const HTTP_URL_PATTERN = /^https?:\/\/[^\s/?#]+(\/[^\s]*)?$/i;

/** http:// 또는 https://로 시작하는 유효한 URL인지 검사 */
export function isValidHttpUrl(url: string): boolean {
  const u = coerceTrimmedString(url, '');
  return typeof url === 'string' && u.length > 0 && HTTP_URL_PATTERN.test(u);
}

export interface ErrorInfo {
  type: 'network' | 'server' | 'client' | 'timeout' | 'unknown';
  message: string;
  userMessage: string;
  canRetry: boolean;
  suggestions: string[];
}

/**
 * 에러를 사용자 친화적인 메시지로 변환
 */
export function getUserFriendlyError(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // 네트워크 에러
    if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
      return {
        type: 'network',
        message: error.message,
        userMessage: '네트워크 연결에 문제가 있습니다.',
        canRetry: true,
        suggestions: [
          '인터넷 연결을 확인해주세요.',
          '방화벽이나 보안 소프트웨어를 확인해주세요.',
          '잠시 후 다시 시도해주세요.',
        ],
      };
    }
    
    // 타임아웃 에러
    if (message.includes('timeout') || message.includes('timed out')) {
      return {
        type: 'timeout',
        message: error.message,
        userMessage: '요청 시간이 초과되었습니다.',
        canRetry: true,
        suggestions: [
          '네트워크 연결 상태를 확인해주세요.',
          '잠시 후 다시 시도해주세요.',
          '서버가 일시적으로 과부하 상태일 수 있습니다.',
        ],
      };
    }
    
    // 서버 에러 (5xx)
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return {
        type: 'server',
        message: error.message,
        userMessage: '서버에서 오류가 발생했습니다.',
        canRetry: true,
        suggestions: [
          '잠시 후 다시 시도해주세요.',
          '문제가 계속되면 고객 지원팀에 문의해주세요.',
        ],
      };
    }
    
    // 프롬프트 길이 초과
    if ((message.includes('프롬프트') || message.includes('15000')) && (message.includes('깁니다') || message.includes('이하'))) {
      return {
        type: 'client',
        message: error.message,
        userMessage: '프롬프트가 너무 깁니다. 15,000자 이하로 입력해 주세요.',
        canRetry: false,
        suggestions: ['프롬프트를 15,000자 이하로 줄인 뒤 다시 시도해 주세요.'],
      };
    }

    // 잘못된 URL 형식
    if (
      message.includes('invalid url') ||
      message.includes('유효하지 않은 url') ||
      message.includes('url 형식') ||
      message.includes('올바른 url')
    ) {
      return {
        type: 'client',
        message: error.message,
        userMessage: 'URL 형식이 올바르지 않습니다.',
        canRetry: true,
        suggestions: [
          'http:// 또는 https://로 시작하는 전체 URL을 입력해 주세요.',
          `예: ${DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL}`,
        ],
      };
    }

    // 소스 추가 실패 - 비공개/크롤링 불가 URL
    if (
      message.includes('비공개') ||
      message.includes('크롤링') ||
      message.includes('접근 불가') ||
      message.includes('robots') ||
      message.includes('blocked') ||
      message.includes('crawl') ||
      message.includes('추출 불가')
    ) {
      return {
        type: 'client',
        message: error.message,
        userMessage: '해당 페이지에서 콘텐츠를 가져올 수 없습니다.',
        canRetry: true,
        suggestions: [
          '비공개·로그인 필요 페이지는 추가할 수 없습니다.',
          'robots.txt로 크롤링이 차단된 사이트일 수 있습니다.',
          '해당 페이지의 텍스트를 복사해 직접 붙여넣거나, 다른 공개 URL을 시도해 보세요.',
        ],
      };
    }

    // 소스 추가 실패 (URL·노트북 소스)
    if (message.includes('소스 추가') || message.includes('소스로 추가')) {
      return {
        type: 'client',
        message: error.message,
        userMessage: '소스를 추가할 수 없습니다.',
        canRetry: true,
        suggestions: [
          'URL이 올바른지 확인해주세요.',
          '해당 페이지에서 콘텐츠 추출이 가능한지 확인해주세요.',
          '다른 URL로 시도해보세요.',
        ],
      };
    }

    // 스튜디오 출력 생성 실패 (프로젝트 소스 부재 등)
    if (message.includes('스튜디오') || message.includes('프로젝트 소스')) {
      return {
        type: 'client',
        message: error.message,
        userMessage: '스튜디오 출력 생성에 실패했습니다.',
        canRetry: true,
        suggestions: [
          '📊 분석에서 프로젝트 소스를 먼저 추가해 주세요.',
          '소스가 분석 완료된 뒤 다시 시도해 주세요.',
          'URL·파일·웹 검색 등으로 소스를 추가할 수 있습니다.',
        ],
      };
    }

    // 정관·파일 처리 에러 (사용자 입력/업로드 관련)
    if (message.includes('정관') || message.includes('bylaws') || message.includes('추출할 항목')) {
      return {
        type: 'client',
        message: error.message,
        userMessage: '정관 등록에 실패했습니다.',
        canRetry: true,
        suggestions: [
          '100자 이상의 정관 원문을 붙여넣어 주세요.',
          '조합장·이사·감사·총회·시공자 선정·분담금·분양 등이 포함된 텍스트인지 확인해주세요.',
          'PDF에서 텍스트를 복사할 때 전체 선택 후 붙여넣기해주세요.',
        ],
      };
    }

    // 클라이언트 에러 (4xx)
    if (message.includes('400') || message.includes('401') || message.includes('403') || message.includes('404')) {
      if (message.includes('401') || message.includes('unauthorized')) {
        return {
          type: 'client',
          message: error.message,
          userMessage: '인증이 필요합니다.',
          canRetry: false,
          suggestions: [
            '다시 로그인해주세요.',
            '세션이 만료되었을 수 있습니다.',
          ],
        };
      }
      
      if (message.includes('403') || message.includes('forbidden')) {
        return {
          type: 'client',
          message: error.message,
          userMessage: '접근 권한이 없습니다.',
          canRetry: false,
          suggestions: [
            '필요한 권한이 있는지 확인해주세요.',
            '관리자에게 문의해주세요.',
          ],
        };
      }
      
      if (message.includes('404')) {
        return {
          type: 'client',
          message: error.message,
          userMessage: '요청한 리소스를 찾을 수 없습니다.',
          canRetry: false,
          suggestions: [
            'URL이 올바른지 확인해주세요.',
            '리소스가 삭제되었을 수 있습니다.',
          ],
        };
      }
      
      return {
        type: 'client',
        message: error.message,
        userMessage: '요청을 처리할 수 없습니다.',
        canRetry: false,
        suggestions: [
          '입력한 정보를 확인해주세요.',
          '잠시 후 다시 시도해주세요.',
        ],
      };
    }
  }
  
  // 알 수 없는 에러
  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : String(error),
    userMessage: '예상치 못한 오류가 발생했습니다.',
    canRetry: true,
    suggestions: [
      '페이지를 새로고침해주세요.',
      '문제가 계속되면 고객 지원팀에 문의해주세요.',
    ],
  };
}

/**
 * 에러 타입에 따른 아이콘 반환
 */
export function getErrorIcon(type: ErrorInfo['type']): string {
  const icons: Record<ErrorInfo['type'], string> = {
    network: '🌐',
    server: '⚠️',
    client: '❌',
    timeout: '⏱️',
    unknown: '❓',
  };
  return icons[type];
}

/**
 * 에러 타입에 따른 색상 반환
 */
export function getErrorColor(type: ErrorInfo['type']): string {
  const colors: Record<ErrorInfo['type'], string> = {
    network: 'var(--accent-warning)',
    server: 'var(--accent-danger)',
    client: 'var(--accent-warning)',
    timeout: 'var(--accent-warning)',
    unknown: 'var(--accent-danger)',
  };
  return colors[type];
}

