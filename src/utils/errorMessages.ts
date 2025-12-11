/**
 * 사용자 친화적인 에러 메시지 유틸리티
 * 
 * Task-F1: 에러 처리 개선 및 사용자 피드백 강화
 */

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

