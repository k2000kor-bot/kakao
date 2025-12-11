/**
 * 모바일 최적화 및 PWA 서비스
 * 모바일 디바이스 최적화 및 Progressive Web App 기능 제공
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: 'chrome' | 'safari' | 'firefox' | 'edge' | 'unknown';
  screenSize: {
    width: number;
    height: number;
  };
  pixelRatio: number;
  touchSupport: boolean;
  orientation: 'portrait' | 'landscape';
}

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  startUrl: string;
  scope: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

export interface MobileOptimizationSettings {
  enableTouchGestures: boolean;
  enableSwipeNavigation: boolean;
  enablePullToRefresh: boolean;
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  optimizeImages: boolean;
  enableLazyLoading: boolean;
  enableVirtualScrolling: boolean;
}

export class MobileOptimizationService {
  private deviceInfo: DeviceInfo | null = null;
  private pwaConfig!: PWAConfig;
  private optimizationSettings!: MobileOptimizationSettings;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.initializeDeviceDetection();
    this.initializePWAConfig();
    this.initializeOptimizationSettings();
    this.setupEventListeners();
    this.initializeServiceWorker();
  }

  /**
   * 디바이스 정보 초기화
   */
  private initializeDeviceDetection(): void {
    const userAgent = navigator.userAgent;
    const screen = window.screen;

    // 디바이스 타입 판별
    let type: DeviceInfo['type'] = 'desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      type = /iPad|Android.*Tablet/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    // OS 판별
    let os: DeviceInfo['os'] = 'unknown';
    if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'ios';
    else if (/Android/i.test(userAgent)) os = 'android';
    else if (/Windows/i.test(userAgent)) os = 'windows';
    else if (/Mac OS X/i.test(userAgent)) os = 'macos';
    else if (/Linux/i.test(userAgent)) os = 'linux';

    // 브라우저 판별
    let browser: DeviceInfo['browser'] = 'unknown';
    if (/Chrome/i.test(userAgent)) browser = 'chrome';
    else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'safari';
    else if (/Firefox/i.test(userAgent)) browser = 'firefox';
    else if (/Edge/i.test(userAgent)) browser = 'edge';

    // 화면 정보
    const screenSize = {
      width: screen.width,
      height: screen.height
    };

    // 픽셀 비율
    const pixelRatio = window.devicePixelRatio || 1;

    // 터치 지원 여부
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 방향
    const orientation = screenSize.width > screenSize.height ? 'landscape' : 'portrait';

    this.deviceInfo = {
      type,
      os,
      browser,
      screenSize,
      pixelRatio,
      touchSupport,
      orientation
    };

    console.log('디바이스 정보:', this.deviceInfo);
  }

  /**
   * PWA 설정 초기화
   */
  private initializePWAConfig(): void {
    this.pwaConfig = {
      name: 'CORBU AI',
      shortName: 'CORBU',
      description: '지능형 AI 분석 플랫폼',
      themeColor: '#8B5CF6',
      backgroundColor: '#FFFFFF',
      display: 'standalone',
      startUrl: '/',
      scope: '/',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };
  }

  /**
   * 최적화 설정 초기화
   */
  private initializeOptimizationSettings(): void {
    this.optimizationSettings = {
      enableTouchGestures: true,
      enableSwipeNavigation: true,
      enablePullToRefresh: true,
      enableOfflineMode: true,
      enablePushNotifications: false,
      optimizeImages: true,
      enableLazyLoading: true,
      enableVirtualScrolling: true
    };
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 온라인/오프라인 상태 변경
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOnlineStatusChange(false);
    });

    // 화면 방향 변경
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateOrientation();
      }, 100);
    });

    // 화면 크기 변경
    window.addEventListener('resize', () => {
      this.updateScreenSize();
    });

    // 터치 제스처 설정
    if (this.optimizationSettings.enableTouchGestures) {
      this.setupTouchGestures();
    }

    // Pull to Refresh 설정
    if (this.optimizationSettings.enablePullToRefresh) {
      this.setupPullToRefresh();
    }
  }

  /**
   * Service Worker 초기화
   */
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker 등록 성공:', this.serviceWorkerRegistration);
        
        // 업데이트 확인
        this.serviceWorkerRegistration.addEventListener('updatefound', () => {
          const newWorker = this.serviceWorkerRegistration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker 등록 실패:', error);
      }
    }
  }

  /**
   * 터치 제스처 설정
   */
  private setupTouchGestures(): void {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }
    });

    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const endTime = Date.now();
        const duration = endTime - startTime;
        const distanceX = endX - startX;
        const distanceY = endY - startY;

        // 스와이프 제스처 감지
        if (duration < 300 && Math.abs(distanceX) > 50 && Math.abs(distanceY) < 100) {
          if (distanceX > 0) {
            this.handleSwipeRight();
          } else {
            this.handleSwipeLeft();
          }
        }

        // 탭 제스처 감지
        if (duration < 200 && Math.abs(distanceX) < 10 && Math.abs(distanceY) < 10) {
          this.handleTap(endX, endY);
        }
      }
    });
  }

  /**
   * Pull to Refresh 설정
   */
  private setupPullToRefresh(): void {
    let startY = 0;
    let pullDistance = 0;
    const threshold = 80;

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (window.scrollY === 0 && startY > 0) {
        pullDistance = e.touches[0].clientY - startY;
        
        if (pullDistance > 0) {
          e.preventDefault();
          this.showPullToRefreshIndicator(pullDistance);
        }
      }
    });

    document.addEventListener('touchend', () => {
      if (pullDistance > threshold) {
        this.handlePullToRefresh();
      }
      this.hidePullToRefreshIndicator();
      startY = 0;
      pullDistance = 0;
    });
  }

  /**
   * 온라인 상태 변경 처리
   */
  private handleOnlineStatusChange(isOnline: boolean): void {
    if (isOnline) {
      this.showNotification('온라인 상태로 복구되었습니다.', 'success');
      this.syncOfflineData();
    } else {
      this.showNotification('오프라인 모드로 전환되었습니다.', 'warning');
    }
  }

  /**
   * 방향 업데이트
   */
  private updateOrientation(): void {
    if (this.deviceInfo) {
      this.deviceInfo.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      this.handleOrientationChange();
    }
  }

  /**
   * 화면 크기 업데이트
   */
  private updateScreenSize(): void {
    if (this.deviceInfo) {
      this.deviceInfo.screenSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  }

  /**
   * 오른쪽 스와이프 처리
   */
  private handleSwipeRight(): void {
    // 사이드바 열기 또는 이전 페이지로 이동
    console.log('오른쪽 스와이프');
    this.showNotification('이전 페이지로 이동', 'info');
  }

  /**
   * 왼쪽 스와이프 처리
   */
  private handleSwipeLeft(): void {
    // 사이드바 닫기 또는 다음 페이지로 이동
    console.log('왼쪽 스와이프');
    this.showNotification('다음 페이지로 이동', 'info');
  }

  /**
   * 탭 처리
   */
  private handleTap(x: number, y: number): void {
    // 탭 위치에 따른 특별한 처리
    console.log('탭 감지:', x, y);
  }

  /**
   * Pull to Refresh 처리
   */
  private handlePullToRefresh(): void {
    console.log('Pull to Refresh 실행');
    this.showNotification('새로고침 중...', 'info');
    
    // 페이지 새로고침 또는 데이터 동기화
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  /**
   * Pull to Refresh 인디케이터 표시
   */
  private showPullToRefreshIndicator(distance: number): void {
    // Pull to Refresh 인디케이터 UI 표시
    const indicator = document.getElementById('pull-to-refresh-indicator');
    if (indicator) {
      indicator.style.transform = `translateY(${Math.min(distance, 80)}px)`;
      indicator.style.opacity = Math.min(distance / 80, 1).toString();
    }
  }

  /**
   * Pull to Refresh 인디케이터 숨김
   */
  private hidePullToRefreshIndicator(): void {
    const indicator = document.getElementById('pull-to-refresh-indicator');
    if (indicator) {
      indicator.style.transform = 'translateY(0)';
      indicator.style.opacity = '0';
    }
  }

  /**
   * 방향 변경 처리
   */
  private handleOrientationChange(): void {
    // 방향 변경에 따른 UI 조정
    console.log('방향 변경:', this.deviceInfo?.orientation);
  }

  /**
   * 오프라인 데이터 동기화
   */
  private async syncOfflineData(): Promise<void> {
    // 오프라인 중에 저장된 데이터를 서버와 동기화
    console.log('오프라인 데이터 동기화 중...');
  }

  /**
   * 알림 표시
   */
  private showNotification(message: string, type: 'success' | 'warning' | 'error' | 'info'): void {
    // 토스트 알림 표시
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * 업데이트 알림 표시
   */
  private showUpdateNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 left-4 right-4 p-4 bg-blue-500 text-white rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <span>새로운 업데이트가 있습니다!</span>
        <button onclick="window.location.reload()" class="ml-4 px-3 py-1 bg-white text-blue-500 rounded">
          업데이트
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
  }

  /**
   * PWA 설치 프롬프트 표시
   */
  async showInstallPrompt(): Promise<void> {
    if ('beforeinstallprompt' in window) {
      const promptEvent = (window as any).deferredPrompt;
      if (promptEvent) {
        promptEvent.prompt();
        const result = await promptEvent.userChoice;
        if (result.outcome === 'accepted') {
          console.log('PWA 설치 승인됨');
        }
        (window as any).deferredPrompt = null;
      }
    }
  }

  /**
   * 디바이스 정보 조회
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * 모바일 디바이스 여부 확인
   */
  isMobileDevice(): boolean {
    return this.deviceInfo?.type === 'mobile' || this.deviceInfo?.type === 'tablet';
  }

  /**
   * 온라인 상태 확인
   */
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * 터치 지원 여부 확인
   */
  hasTouchSupport(): boolean {
    return this.deviceInfo?.touchSupport || false;
  }

  /**
   * 최적화 설정 조회
   */
  getOptimizationSettings(): MobileOptimizationSettings {
    return this.optimizationSettings;
  }

  /**
   * 최적화 설정 업데이트
   */
  updateOptimizationSettings(settings: Partial<MobileOptimizationSettings>): void {
    this.optimizationSettings = { ...this.optimizationSettings, ...settings };
    this.saveOptimizationSettings();
  }

  /**
   * 설정 저장
   */
  private saveOptimizationSettings(): void {
    localStorage.setItem('mobileOptimizationSettings', JSON.stringify(this.optimizationSettings));
  }

  /**
   * 설정 로드
   */
  private loadOptimizationSettings(): void {
    const saved = localStorage.getItem('mobileOptimizationSettings');
    if (saved) {
      try {
        this.optimizationSettings = { ...this.optimizationSettings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    }
  }

  /**
   * 이미지 최적화
   */
  optimizeImage(url: string, width: number, height: number): string {
    if (this.optimizationSettings.optimizeImages && this.deviceInfo) {
      const pixelRatio = this.deviceInfo.pixelRatio;
      const optimizedWidth = Math.round(width * pixelRatio);
      const optimizedHeight = Math.round(height * pixelRatio);
      
      // 실제로는 이미지 리사이징 서비스 사용
      return `${url}?w=${optimizedWidth}&h=${optimizedHeight}&q=80`;
    }
    return url;
  }

  /**
   * 푸시 알림 권한 요청
   */
  async requestPushNotificationPermission(): Promise<boolean> {
    if ('Notification' in window && this.optimizationSettings.enablePushNotifications) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * 푸시 알림 전송
   */
  sendPushNotification(title: string, body: string, icon?: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/icon-192x192.png',
        badge: '/icon-192x192.png'
      });
    }
  }

  /**
   * 오프라인 모드 활성화
   */
  enableOfflineMode(): void {
    if (this.optimizationSettings.enableOfflineMode) {
      // 오프라인 모드 활성화 로직
      console.log('오프라인 모드 활성화');
    }
  }

  /**
   * 서비스 정리
   */
  cleanup(): void {
    // 이벤트 리스너 제거
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});
    window.removeEventListener('orientationchange', () => {});
    window.removeEventListener('resize', () => {});
  }
}

// 싱글톤 인스턴스
export const mobileOptimizationService = new MobileOptimizationService();

export default mobileOptimizationService;
