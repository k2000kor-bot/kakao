import React, { useState, useEffect, useCallback } from 'react';
import './MobileOptimization.css';

interface MobileOptimizationProps {
    children: React.ReactNode;
}

interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    platform: string;
    screenSize: 'small' | 'medium' | 'large' | 'xlarge';
    orientation: 'portrait' | 'landscape';
    hasTouch: boolean;
    isStandalone: boolean;
    isInstallable: boolean;
}

interface NetworkInfo {
    isOnline: boolean;
    connectionType: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
}

const MobileOptimization: React.FC<MobileOptimizationProps> = ({ children }) => {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        platform: 'unknown',
        screenSize: 'large',
        orientation: 'landscape',
        hasTouch: false,
        isStandalone: false,
        isInstallable: false
    });

    const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
        isOnline: navigator.onLine,
        connectionType: 'unknown',
        effectiveType: '4g',
        downlink: 10,
        rtt: 100
    });

    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalling, setIsInstalling] = useState(false);

    /**
     * 디바이스 정보 감지
     */
    const detectDeviceInfo = useCallback((): DeviceInfo => {
        const userAgent = navigator.userAgent;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 플랫폼 감지
        const platform = /iPhone|iPad|iPod/i.test(userAgent) ? 'ios' :
            /Android/i.test(userAgent) ? 'android' :
                /Windows Phone/i.test(userAgent) ? 'windows' :
                    /Mac/i.test(userAgent) ? 'mac' :
                        /Win/i.test(userAgent) ? 'windows' :
                            /Linux/i.test(userAgent) ? 'linux' : 'unknown';

        // 디바이스 타입 감지
        const isMobile = /iPhone|Android.*Mobile|BlackBerry|Windows Phone/i.test(userAgent) || width < 768;
        const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent) || (width >= 768 && width < 1024);
        const isDesktop = !isMobile && !isTablet;

        // 화면 크기 분류
        const screenSize: DeviceInfo['screenSize'] =
            width < 480 ? 'small' :
                width < 768 ? 'medium' :
                    width < 1200 ? 'large' : 'xlarge';

        // 화면 방향
        const orientation: DeviceInfo['orientation'] = width > height ? 'landscape' : 'portrait';

        // 터치 지원
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // PWA 모드 확인
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        return {
            isMobile,
            isTablet,
            isDesktop,
            platform,
            screenSize,
            orientation,
            hasTouch,
            isStandalone,
            isInstallable: false // 나중에 업데이트
        };
    }, []);

    /**
     * 네트워크 정보 감지
     */
    const detectNetworkInfo = useCallback((): NetworkInfo => {
        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection;

        return {
            isOnline: navigator.onLine,
            connectionType: connection?.type || 'unknown',
            effectiveType: connection?.effectiveType || '4g',
            downlink: connection?.downlink || 10,
            rtt: connection?.rtt || 100
        };
    }, []);

    /**
     * 초기화
     */
    useEffect(() => {
        const updateDeviceInfo = () => {
            setDeviceInfo(detectDeviceInfo());
        };

        const updateNetworkInfo = () => {
            setNetworkInfo(detectNetworkInfo());
        };

        // 초기 감지
        updateDeviceInfo();
        updateNetworkInfo();

        // 이벤트 리스너 등록
        window.addEventListener('resize', updateDeviceInfo);
        window.addEventListener('orientationchange', updateDeviceInfo);
        window.addEventListener('online', updateNetworkInfo);
        window.addEventListener('offline', updateNetworkInfo);

        const connection = (navigator as any).connection;
        if (connection) {
            connection.addEventListener('change', updateNetworkInfo);
        }

        // PWA 설치 프롬프트 처리
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setDeviceInfo(prev => ({ ...prev, isInstallable: true }));

            // 모바일에서만 설치 프롬프트 표시
            if (detectDeviceInfo().isMobile) {
                setTimeout(() => setShowInstallPrompt(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // PWA 설치 완료 처리
        window.addEventListener('appinstalled', () => {
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
            console.log('🎉 PWA 설치 완료');
        });

        return () => {
            window.removeEventListener('resize', updateDeviceInfo);
            window.removeEventListener('orientationchange', updateDeviceInfo);
            window.removeEventListener('online', updateNetworkInfo);
            window.removeEventListener('offline', updateNetworkInfo);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

            if (connection) {
                connection.removeEventListener('change', updateNetworkInfo);
            }
        };
    }, [detectDeviceInfo, detectNetworkInfo]);

    /**
     * PWA 설치 처리
     */
    const handleInstallPWA = async () => {
        if (!deferredPrompt) return;

        setIsInstalling(true);

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ PWA 설치 수락');
            } else {
                console.log('❌ PWA 설치 거부');
            }
        } catch (error) {
            console.error('PWA 설치 오류:', error);
        } finally {
            setDeferredPrompt(null);
            setShowInstallPrompt(false);
            setIsInstalling(false);
        }
    };

    /**
     * 모바일 UI 최적화 CSS 클래스 생성
     */
    const getMobileClasses = () => {
        const classes = ['mobile-optimization'];

        if (deviceInfo.isMobile) classes.push('is-mobile');
        if (deviceInfo.isTablet) classes.push('is-tablet');
        if (deviceInfo.isDesktop) classes.push('is-desktop');
        if (deviceInfo.hasTouch) classes.push('has-touch');
        if (deviceInfo.isStandalone) classes.push('is-standalone');

        classes.push(`platform-${deviceInfo.platform}`);
        classes.push(`size-${deviceInfo.screenSize}`);
        classes.push(`orientation-${deviceInfo.orientation}`);

        if (!networkInfo.isOnline) classes.push('is-offline');
        if (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') {
            classes.push('slow-connection');
        }

        return classes.join(' ');
    };

    /**
     * 뷰포트 메타 태그 동적 업데이트
     */
    useEffect(() => {
        let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;

        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }

        // 디바이스별 최적화된 뷰포트 설정
        if (deviceInfo.isMobile) {
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        } else if (deviceInfo.isTablet) {
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes';
        } else {
            viewportMeta.content = 'width=device-width, initial-scale=1.0';
        }
    }, [deviceInfo.isMobile, deviceInfo.isTablet]);

    /**
     * 모바일 스와이프 제스처 처리
     */
    useEffect(() => {
        if (!deviceInfo.hasTouch) return;

        let startX = 0;
        let startY = 0;
        let startTime = 0;

        const handleTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();

            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const duration = endTime - startTime;

            // 스와이프 감지 (최소 거리 50px, 최대 시간 500ms)
            if (Math.abs(deltaX) > 50 && duration < 500) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 0) {
                        // 오른쪽 스와이프
                        document.dispatchEvent(new CustomEvent('swipeRight'));
                    } else {
                        // 왼쪽 스와이프
                        document.dispatchEvent(new CustomEvent('swipeLeft'));
                    }
                }
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [deviceInfo.hasTouch]);

    return (
        <div className={getMobileClasses()}>
            {/* PWA 설치 프롬프트 */}
            {showInstallPrompt && !deviceInfo.isStandalone && (
                <div className="install-prompt">
                    <div className="install-prompt-content">
                        <div className="install-prompt-icon">📱</div>
                        <div className="install-prompt-text">
                            <h3>CORBU AI 설치</h3>
                            <p>홈 화면에 추가하여 더 빠르고 편리하게 이용하세요!</p>
                        </div>
                        <div className="install-prompt-actions">
                            <button
                                onClick={handleInstallPWA}
                                disabled={isInstalling}
                                className="install-button"
                            >
                                {isInstalling ? '설치 중...' : '설치'}
                            </button>
                            <button
                                onClick={() => setShowInstallPrompt(false)}
                                className="dismiss-button"
                            >
                                나중에
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 오프라인 상태 표시 */}
            {!networkInfo.isOnline && (
                <div className="offline-banner">
                    <span className="offline-icon">📡</span>
                    <span>오프라인 모드</span>
                    <span className="offline-tip">일부 기능이 제한될 수 있습니다</span>
                </div>
            )}

            {/* 느린 연결 경고 */}
            {networkInfo.isOnline && (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') && (
                <div className="slow-connection-banner">
                    <span className="slow-icon">🐌</span>
                    <span>연결 속도가 느립니다</span>
                </div>
            )}

            {/* 메인 컨텐츠 */}
            <div className="mobile-content">
                {children}
            </div>

            {/* 모바일 네비게이션 헬퍼 */}
            {deviceInfo.isMobile && (
                <div className="mobile-navigation-hint">
                    <div className="swipe-hint">← 스와이프로 메뉴 열기</div>
                </div>
            )}
        </div>
    );
};

export default MobileOptimization;
