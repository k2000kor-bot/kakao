/**
 * CORBU AI PWA(Progressive Web App) 서비스
 * Service Worker 관리, 오프라인 지원, 푸시 알림, 백그라운드 동기화
 */

export interface PWAConfig {
    enableServiceWorker: boolean;
    enablePushNotifications: boolean;
    enableBackgroundSync: boolean;
    cacheStrategy: 'networkFirst' | 'cacheFirst' | 'staleWhileRevalidate';
    offlinePageUrl: string;
    notificationIcon: string;
    vapidPublicKey?: string;
}

export interface InstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAStatus {
    isServiceWorkerSupported: boolean;
    isServiceWorkerRegistered: boolean;
    isInstallable: boolean;
    isInstalled: boolean;
    isOnline: boolean;
    hasUpdate: boolean;
    registrationInfo?: ServiceWorkerRegistration;
}

export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
    data?: any;
}

class PWAService {
    private config: PWAConfig;
    private registration: ServiceWorkerRegistration | null = null;
    private deferredPrompt: InstallPromptEvent | null = null;
    private isUpdateAvailable: boolean = false;
    private subscribers: Set<(status: PWAStatus) => void> = new Set();
    private offlineQueue: Array<{ url: string; options: RequestInit }> = [];

    constructor() {
        this.config = {
            enableServiceWorker: true,
            enablePushNotifications: true,
            enableBackgroundSync: true,
            cacheStrategy: 'networkFirst',
            offlinePageUrl: '/offline',
            notificationIcon: '/icons/icon-192x192.png'
        };

        this.initialize();
    }

    /**
     * PWA 시스템 초기화
     */
    private async initialize(): Promise<void> {
        if (!this.isServiceWorkerSupported()) {
            console.warn('[PWA] Service Worker가 지원되지 않습니다.');
            return;
        }

        try {
            // Service Worker 등록
            await this.registerServiceWorker();

            // 설치 프롬프트 이벤트 리스너
            this.setupInstallPromptListener();

            // 온라인/오프라인 상태 모니터링
            this.setupNetworkStatusMonitoring();

            // 앱 업데이트 확인
            this.checkForUpdates();

            console.log('[PWA] 🎉 PWA 서비스가 초기화되었습니다.');
        } catch (error) {
            console.error('[PWA] ❌ 초기화 실패:', error);
        }
    }

    /**
     * Service Worker 지원 여부 확인
     */
    private isServiceWorkerSupported(): boolean {
        return 'serviceWorker' in navigator;
    }

    /**
     * Service Worker 등록
     */
    private async registerServiceWorker(): Promise<void> {
        if (!this.config.enableServiceWorker) return;

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js');

            console.log('[PWA] ✅ Service Worker 등록 완료:', this.registration.scope);

            // 상태 변경 리스너
            this.registration.addEventListener('updatefound', () => {
                console.log('[PWA] 🔄 새로운 Service Worker 버전 발견');
                this.handleServiceWorkerUpdate();
            });

            // Service Worker 메시지 리스너
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event);
            });

            this.notifySubscribers();
        } catch (error) {
            console.error('[PWA] ❌ Service Worker 등록 실패:', error);
            throw error;
        }
    }

    /**
     * Service Worker 업데이트 처리
     */
    private handleServiceWorkerUpdate(): void {
        if (!this.registration?.installing) return;

        const newWorker = this.registration.installing;

        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.isUpdateAvailable = true;
                this.notifySubscribers();

                // 사용자에게 업데이트 알림
                this.showUpdateNotification();
            }
        });
    }

    /**
     * Service Worker 메시지 처리
     */
    private handleServiceWorkerMessage(event: MessageEvent): void {
        const { data } = event;

        if (data.type === 'CACHE_UPDATED') {
            console.log('[PWA] 📦 캐시가 업데이트되었습니다.');
        }

        if (data.type === 'OFFLINE_FALLBACK') {
            console.log('[PWA] 📡 오프라인 모드로 전환되었습니다.');
        }
    }

    /**
     * 설치 프롬프트 리스너 설정
     */
    private setupInstallPromptListener(): void {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e as InstallPromptEvent;
            this.notifySubscribers();
            console.log('[PWA] 📱 설치 프롬프트 준비됨');
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.notifySubscribers();
            console.log('[PWA] 🎉 앱이 설치되었습니다.');
        });
    }

    /**
     * 네트워크 상태 모니터링 설정
     */
    private setupNetworkStatusMonitoring(): void {
        const updateOnlineStatus = () => {
            this.notifySubscribers();

            if (navigator.onLine) {
                console.log('[PWA] 🌐 온라인 상태로 전환');
                this.processOfflineQueue();
            } else {
                console.log('[PWA] 📡 오프라인 상태로 전환');
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }

    /**
     * 앱 업데이트 확인
     */
    private async checkForUpdates(): Promise<void> {
        if (!this.registration) return;

        try {
            await this.registration.update();
            console.log('[PWA] 🔍 업데이트 확인 완료');
        } catch (error) {
            console.error('[PWA] ❌ 업데이트 확인 실패:', error);
        }
    }

    /**
     * PWA 설치 프롬프트 표시
     */
    public async showInstallPrompt(): Promise<boolean> {
        if (!this.deferredPrompt) {
            console.warn('[PWA] 설치 프롬프트를 사용할 수 없습니다.');
            return false;
        }

        try {
            await this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;

            console.log(`[PWA] 설치 프롬프트 결과: ${outcome}`);

            this.deferredPrompt = null;
            this.notifySubscribers();

            return outcome === 'accepted';
        } catch (error) {
            console.error('[PWA] ❌ 설치 프롬프트 실패:', error);
            return false;
        }
    }

    /**
     * 앱 업데이트 적용
     */
    public async applyUpdate(): Promise<void> {
        if (!this.registration?.waiting) return;

        try {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

            // 페이지 새로고침으로 새 버전 활성화
            window.location.reload();
        } catch (error) {
            console.error('[PWA] ❌ 업데이트 적용 실패:', error);
        }
    }

    /**
     * 푸시 알림 권한 요청
     */
    public async requestNotificationPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.warn('[PWA] 푸시 알림이 지원되지 않습니다.');
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            console.log(`[PWA] 알림 권한: ${permission}`);
            return permission;
        } catch (error) {
            console.error('[PWA] ❌ 알림 권한 요청 실패:', error);
            return 'denied';
        }
    }

    /**
     * 푸시 구독 등록
     */
    public async subscribeToPush(): Promise<PushSubscription | null> {
        if (!this.registration || !this.config.vapidPublicKey) {
            console.warn('[PWA] 푸시 구독 설정이 완료되지 않았습니다.');
            return null;
        }

        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey)
            });

            console.log('[PWA] ✅ 푸시 구독 완료');
            return subscription;
        } catch (error) {
            console.error('[PWA] ❌ 푸시 구독 실패:', error);
            return null;
        }
    }

    /**
     * 로컬 알림 표시
     */
    public async showNotification(options: NotificationOptions): Promise<void> {
        if (!this.registration) {
            console.warn('[PWA] Service Worker가 등록되지 않았습니다.');
            return;
        }

        const permission = await this.requestNotificationPermission();
        if (permission !== 'granted') {
            console.warn('[PWA] 알림 권한이 거부되었습니다.');
            return;
        }

        try {
            await this.registration.showNotification(options.title, {
                body: options.body,
                icon: options.icon || this.config.notificationIcon,
                badge: options.badge,
                tag: options.tag,
                requireInteraction: options.requireInteraction,
                actions: options.actions,
                data: options.data
            });

            console.log('[PWA] 📢 알림 표시 완료');
        } catch (error) {
            console.error('[PWA] ❌ 알림 표시 실패:', error);
        }
    }

    /**
     * 백그라운드 동기화 등록
     */
    public async registerBackgroundSync(tag: string): Promise<void> {
        if (!this.registration) {
            console.warn('[PWA] Service Worker가 등록되지 않았습니다.');
            return;
        }

        try {
            // Background Sync API가 지원되는 경우에만 사용
            if ('sync' in this.registration) {
                await (this.registration as any).sync.register(tag);
                console.log(`[PWA] 🔄 백그라운드 동기화 등록: ${tag}`);
            } else {
                console.warn('[PWA] ⚠️ 백그라운드 동기화가 지원되지 않습니다.');
            }
        } catch (error) {
            console.error('[PWA] ❌ 백그라운드 동기화 등록 실패:', error);
        }
    }

    /**
     * 오프라인 큐에 요청 추가
     */
    public addToOfflineQueue(url: string, options: RequestInit = {}): void {
        this.offlineQueue.push({ url, options });
        console.log(`[PWA] 📦 오프라인 큐에 추가: ${url}`);
    }

    /**
     * 오프라인 큐 처리
     */
    private async processOfflineQueue(): Promise<void> {
        if (this.offlineQueue.length === 0) return;

        console.log(`[PWA] 🔄 오프라인 큐 처리 시작 (${this.offlineQueue.length}개 항목)`);

        const queue = [...this.offlineQueue];
        this.offlineQueue = [];

        for (const { url, options } of queue) {
            try {
                await fetch(url, options);
                console.log(`[PWA] ✅ 큐 항목 처리 완료: ${url}`);
            } catch (error) {
                console.error(`[PWA] ❌ 큐 항목 처리 실패: ${url}`, error);
                // 실패한 항목은 다시 큐에 추가
                this.offlineQueue.push({ url, options });
            }
        }
    }

    /**
     * 업데이트 알림 표시
     */
    private async showUpdateNotification(): Promise<void> {
        await this.showNotification({
            title: 'CORBU AI 업데이트',
            body: '새로운 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?',
            tag: 'app-update',
            requireInteraction: true,
            actions: [
                {
                    action: 'update',
                    title: '업데이트'
                },
                {
                    action: 'dismiss',
                    title: '나중에'
                }
            ]
        });
    }

    /**
     * PWA 상태 조회
     */
    public getStatus(): PWAStatus {
        return {
            isServiceWorkerSupported: this.isServiceWorkerSupported(),
            isServiceWorkerRegistered: !!this.registration,
            isInstallable: !!this.deferredPrompt,
            isInstalled: window.matchMedia('(display-mode: standalone)').matches,
            isOnline: navigator.onLine,
            hasUpdate: this.isUpdateAvailable,
            registrationInfo: this.registration || undefined
        };
    }

    /**
     * 상태 변경 구독
     */
    public subscribe(callback: (status: PWAStatus) => void): () => void {
        this.subscribers.add(callback);

        // 초기 상태 전달
        callback(this.getStatus());

        // 구독 해제 함수 반환
        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * 구독자들에게 상태 변경 알림
     */
    private notifySubscribers(): void {
        const status = this.getStatus();
        this.subscribers.forEach(callback => callback(status));
    }

    /**
     * VAPID 키 변환 유틸리티
     */
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * 설정 업데이트
     */
    public updateConfig(newConfig: Partial<PWAConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('[PWA] 설정 업데이트 완료');
    }

    /**
     * Service Worker에 메시지 전송
     */
    public async sendMessageToServiceWorker(message: any): Promise<void> {
        if (!this.registration?.active) return;

        try {
            this.registration.active.postMessage(message);
            console.log('[PWA] 📨 Service Worker에 메시지 전송:', message);
        } catch (error) {
            console.error('[PWA] ❌ Service Worker 메시지 전송 실패:', error);
        }
    }

    /**
     * 캐시 관리
     */
    public async clearCache(): Promise<void> {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('[PWA] 🗑️ 캐시 정리 완료');
        } catch (error) {
            console.error('[PWA] ❌ 캐시 정리 실패:', error);
        }
    }

    /**
     * PWA 설치 상태 확인
     */
    public isInstalled(): boolean {
        return window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
    }

    /**
     * 네트워크 상태 확인
     */
    public isOnline(): boolean {
        return navigator.onLine;
    }
}

// 싱글톤 인스턴스 생성
export const pwaService = new PWAService();

export default pwaService;
