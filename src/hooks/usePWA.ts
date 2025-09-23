import { useState, useEffect } from 'react';

export interface PWAInfo {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  installPrompt: any;
  swRegistration: ServiceWorkerRegistration | null;
  swUpdateAvailable: boolean;
}

export const usePWA = (): PWAInfo & {
  installApp: () => Promise<void>;
  updateApp: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
} => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  useEffect(() => {
    // PWA 설치 상태 확인
    const checkInstallStatus = () => {
      // Standalone 모드 확인 (iOS Safari)
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(isStandaloneMode);
      
      // Android Chrome의 경우
      const isAndroidChrome = /Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent);
      const isInstalledOnAndroid = isAndroidChrome && (window.navigator as any).standalone === true;
      
      setIsInstalled(isStandaloneMode || isInstalledOnAndroid);
    };

    checkInstallStatus();

    // 네트워크 상태 모니터링
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA 설치 프롬프트 이벤트
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // PWA 설치 완료 이벤트
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setCanInstall(false);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setSwRegistration(registration);
          
          // 업데이트 확인
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setSwUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker 등록 실패:', error);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!installPrompt) {
      throw new Error('앱 설치가 지원되지 않습니다.');
    }

    try {
      const result = await installPrompt.prompt();
      console.log('PWA 설치 프롬프트 결과:', result);
      
      if (result.outcome === 'accepted') {
        console.log('PWA 설치 승인됨');
      } else {
        console.log('PWA 설치 거부됨');
      }
      
      setInstallPrompt(null);
      setIsInstallable(false);
      setCanInstall(false);
    } catch (error) {
      console.error('PWA 설치 실패:', error);
      throw error;
    }
  };

  const updateApp = async (): Promise<void> => {
    if (!swRegistration) {
      throw new Error('Service Worker가 등록되지 않았습니다.');
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // 새 Service Worker 활성화 후 페이지 새로고침
        window.location.reload();
      }
    } catch (error) {
      console.error('앱 업데이트 실패:', error);
      throw error;
    }
  };

  const checkForUpdates = async (): Promise<void> => {
    if (!swRegistration) {
      throw new Error('Service Worker가 등록되지 않았습니다.');
    }

    try {
      await swRegistration.update();
    } catch (error) {
      console.error('업데이트 확인 실패:', error);
      throw error;
    }
  };

  return {
    isInstalled,
    isInstallable,
    isOnline,
    isStandalone,
    canInstall,
    installPrompt,
    swRegistration,
    swUpdateAvailable,
    installApp,
    updateApp,
    checkForUpdates
  };
};

export default usePWA;
