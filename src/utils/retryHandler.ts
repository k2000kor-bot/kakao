/**
 * 재시도 핸들러 유틸리티
 * 네트워크 오류 및 일시적 오류에 대한 자동 재시도 로직 제공
 */

export interface RetryOptions {
  /**
   * 최대 재시도 횟수
   */
  maxRetries?: number;
  
  /**
   * 초기 재시도 지연 시간 (ms)
   */
  initialDelay?: number;
  
  /**
   * 지연 시간 증가 배수 (exponential backoff)
   */
  backoffMultiplier?: number;
  
  /**
   * 최대 지연 시간 (ms)
   */
  maxDelay?: number;
  
  /**
   * 재시도 가능한 에러 조건
   */
  retryable?: (error: any) => boolean;
  
  /**
   * 재시도 전 콜백
   */
  onRetry?: (attempt: number, error: any) => void;
  
  /**
   * 재시도 실패 후 콜백
   */
  onFailure?: (error: any, attempts: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
}

/**
 * 기본 재시도 가능 여부 판단
 */
const defaultRetryable = (error: any): boolean => {
  // 네트워크 오류
  if (!navigator.onLine) {
    return true;
  }
  
  // 타임아웃 오류
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return true;
  }
  
  // 네트워크 연결 실패
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
    return true;
  }
  
  // 5xx 서버 오류 (일시적 오류)
  if (error?.response?.status >= 500 && error?.response?.status < 600) {
    return true;
  }
  
  // 429 Too Many Requests
  if (error?.response?.status === 429) {
    return true;
  }
  
  return false;
};

/**
 * 지연 시간 계산 (exponential backoff)
 */
const calculateDelay = (
  attempt: number,
  initialDelay: number,
  backoffMultiplier: number,
  maxDelay: number
): number => {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  return Math.min(delay, maxDelay);
};

/**
 * 재시도 가능한 함수 실행
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 10000,
    retryable = defaultRetryable,
    onRetry,
    onFailure,
  } = options;

  let lastError: any;
  let attempts = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;

    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts,
      };
    } catch (error) {
      lastError = error;

      // 마지막 시도이거나 재시도 불가능한 에러인 경우
      if (attempt >= maxRetries || !retryable(error)) {
        if (onFailure) {
          onFailure(error, attempts);
        }
        return {
          success: false,
          error,
          attempts,
        };
      }

      // 재시도 전 콜백
      if (onRetry) {
        onRetry(attempts, error);
      }

      // 지연 시간 계산 및 대기
      const delay = calculateDelay(attempt, initialDelay, backoffMultiplier, maxDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (onFailure) {
    onFailure(lastError, attempts);
  }

  return {
    success: false,
    error: lastError,
    attempts,
  };
}

/**
 * API 호출 재시도 래퍼
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const result = await retry(apiCall, {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    ...options,
  });

  if (!result.success) {
    throw result.error;
  }

  return result.data!;
}

/**
 * 네트워크 상태 모니터링
 */
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: Set<(online: boolean) => void> = new Set();
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach((listener) => listener(online));
  }
}

/**
 * 네트워크 상태 확인 후 재시도
 */
export async function retryWithNetworkCheck<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const monitor = NetworkMonitor.getInstance();

  // 오프라인 상태면 온라인 상태가 될 때까지 대기
  if (!monitor.getOnlineStatus()) {
    return new Promise((resolve) => {
      const unsubscribe = monitor.subscribe((online) => {
        if (online) {
          unsubscribe();
          retry(fn, options).then(resolve);
        }
      });
    });
  }

  return retry(fn, options);
}

