/**
 * Advanced Notification Service
 * 고급 알림 서비스
 */

export interface NotificationData {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info' | 'security' | 'performance' | 'ai';
    title: string;
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    actions?: NotificationAction[];
    autoClose?: boolean;
    duration?: number;
    persistent?: boolean;
}

export interface NotificationAction {
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationSettings {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    desktop: boolean;
    categories: {
        system: boolean;
        security: boolean;
        performance: boolean;
        ai: boolean;
        user: boolean;
    };
    autoClose: boolean;
    duration: number;
}

class NotificationService {
    private notifications: NotificationData[] = [];
    private listeners: Map<string, Function[]> = new Map();
    private settings: NotificationSettings = {
        enabled: true,
        sound: true,
        vibration: true,
        desktop: true,
        categories: {
            system: true,
            security: true,
            performance: true,
            ai: true,
            user: true,
        },
        autoClose: true,
        duration: 5000,
    };
    private maxNotifications = 50;
    private audioContext: AudioContext | null = null;

    constructor() {
        this.initializeAudio();
        this.requestNotificationPermission();
        this.loadSettings();
    }

    private initializeAudio(): void {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
            console.warn('오디오 컨텍스트 초기화 실패:', error);
        }
    }

    private async requestNotificationPermission(): Promise<void> {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                await Notification.requestPermission();
            } catch (error) {
                console.warn('알림 권한 요청 실패:', error);
            }
        }
    }

    private loadSettings(): void {
        try {
            const saved = localStorage.getItem('notificationSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('알림 설정 로드 실패:', error);
        }
    }

    private saveSettings(): void {
        try {
            localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('알림 설정 저장 실패:', error);
        }
    }

    public addNotification(notification: Omit<NotificationData, 'id' | 'timestamp'>): string {
        if (!this.settings.enabled) return '';

        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fullNotification: NotificationData = {
            ...notification,
            id,
            timestamp: new Date().toISOString(),
            autoClose: notification.autoClose ?? this.settings.autoClose,
            duration: notification.duration ?? this.settings.duration,
        };

        // 카테고리 필터링
        if (!this.settings.categories[fullNotification.category as keyof typeof this.settings.categories]) {
            return '';
        }

        this.notifications.unshift(fullNotification);

        // 최대 알림 수 제한
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }

        // 이벤트 발생
        this.emit('notificationAdded', fullNotification);
        this.emit('notificationsChanged', this.notifications);

        // 사운드 재생
        if (this.settings.sound) {
            this.playNotificationSound(fullNotification.type);
        }

        // 진동
        if (this.settings.vibration && 'vibrate' in navigator) {
            this.vibrate(fullNotification.priority);
        }

        // 데스크톱 알림
        if (this.settings.desktop && Notification.permission === 'granted') {
            this.showDesktopNotification(fullNotification);
        }

        // 자동 닫기
        if (fullNotification.autoClose && !fullNotification.persistent) {
            setTimeout(() => {
                this.removeNotification(id);
            }, fullNotification.duration);
        }

        return id;
    }

    public removeNotification(id: string): void {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index > -1) {
            const notification = this.notifications[index];
            this.notifications.splice(index, 1);
            this.emit('notificationRemoved', notification);
            this.emit('notificationsChanged', this.notifications);
        }
    }

    public clearAllNotifications(): void {
        this.notifications = [];
        this.emit('notificationsChanged', this.notifications);
    }

    public clearNotificationsByCategory(category: string): void {
        this.notifications = this.notifications.filter(n => n.category !== category);
        this.emit('notificationsChanged', this.notifications);
    }

    public getNotifications(): NotificationData[] {
        return [...this.notifications];
    }

    public getNotificationsByCategory(category: string): NotificationData[] {
        return this.notifications.filter(n => n.category === category);
    }

    public getUnreadCount(): number {
        return this.notifications.length;
    }

    public getUnreadCountByCategory(category: string): number {
        return this.getNotificationsByCategory(category).length;
    }

    public updateSettings(newSettings: Partial<NotificationSettings>): void {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.emit('settingsChanged', this.settings);
    }

    public getSettings(): NotificationSettings {
        return { ...this.settings };
    }

    private playNotificationSound(type: string): void {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // 타입별 다른 사운드
            const frequencies = {
                success: [523.25, 659.25, 783.99], // C5, E5, G5
                warning: [440, 466.16], // A4, A#4
                error: [220, 196], // A3, G3
                info: [523.25], // C5
                security: [880, 1108.73], // A5, C#6
                performance: [659.25, 783.99, 880], // E5, G5, A5
                ai: [523.25, 659.25, 783.99, 880], // C5, E5, G5, A5
            };

            const freq = frequencies[type as keyof typeof frequencies] || frequencies.info;

            freq.forEach((frequency, index) => {
                setTimeout(() => {
                    oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime);
                    gainNode.gain.setValueAtTime(0.1, this.audioContext!.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.2);
                }, index * 100);
            });

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + freq.length * 0.1 + 0.2);

        } catch (error) {
            console.warn('알림 사운드 재생 실패:', error);
        }
    }

    private vibrate(priority: string): void {
        if (!('vibrate' in navigator)) return;

        const patterns = {
            low: [100],
            medium: [200, 100, 200],
            high: [300, 100, 300, 100, 300],
            critical: [500, 200, 500, 200, 500, 200, 500],
        };

        const pattern = patterns[priority as keyof typeof patterns] || patterns.medium;
        navigator.vibrate(pattern);
    }

    private showDesktopNotification(notification: NotificationData): void {
        if (Notification.permission !== 'granted') return;

        try {
            const desktopNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: notification.id,
                requireInteraction: notification.persistent,
                silent: !this.settings.sound,
            });

            desktopNotification.onclick = () => {
                window.focus();
                desktopNotification.close();
                this.emit('notificationClicked', notification);
            };

            // 자동 닫기
            if (!notification.persistent) {
                setTimeout(() => {
                    desktopNotification.close();
                }, notification.duration);
            }

        } catch (error) {
            console.warn('데스크톱 알림 표시 실패:', error);
        }
    }

    // 이벤트 리스너 관리
    public on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    public off(event: string, callback: Function): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    private emit(event: string, data: any): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    // 편의 메서드들
    public success(title: string, message: string, options?: Partial<NotificationData>): string {
        return this.addNotification({
            type: 'success',
            title,
            message,
            priority: 'medium',
            category: 'system',
            ...options,
        });
    }

    public warning(title: string, message: string, options?: Partial<NotificationData>): string {
        return this.addNotification({
            type: 'warning',
            title,
            message,
            priority: 'high',
            category: 'system',
            ...options,
        });
    }

    public error(title: string, message: string, options?: Partial<NotificationData>): string {
        return this.addNotification({
            type: 'error',
            title,
            message,
            priority: 'critical',
            category: 'system',
            persistent: true,
            ...options,
        });
    }

    public info(title: string, message: string, options?: Partial<NotificationData>): string {
        return this.addNotification({
            type: 'info',
            title,
            message,
            priority: 'low',
            category: 'system',
            ...options,
        });
    }

    public security(title: string, message: string, options?: Partial<NotificationData>): string {
        return this.addNotification({
            type: 'security',
            title,
            message,
            priority: 'high',
            category: 'security',
            persistent: true,
            ...options,
        });
    }

    public performance(title: string, message: string, options?: Partial<NotificationData>): string {
        return this.addNotification({
            type: 'performance',
            title,
            message,
            priority: 'medium',
            category: 'performance',
            ...options,
        });
    }

    public ai(title: string, message: string, options?: Partial<NotificationData>): string {
        return this.addNotification({
            type: 'ai',
            title,
            message,
            priority: 'medium',
            category: 'ai',
            ...options,
        });
    }
}

// 싱글톤 인스턴스
export const notificationService = new NotificationService();

// 시스템 이벤트 리스너
export class SystemNotificationListener {
    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // 페이지 가시성 변경
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                notificationService.info('시스템', '페이지가 백그라운드로 이동되었습니다');
            } else {
                notificationService.info('시스템', '페이지가 포그라운드로 복귀했습니다');
            }
        });

        // 온라인/오프라인 상태
        window.addEventListener('online', () => {
            notificationService.success('네트워크', '인터넷 연결이 복구되었습니다');
        });

        window.addEventListener('offline', () => {
            notificationService.error('네트워크', '인터넷 연결이 끊어졌습니다', { persistent: true });
        });

        // 페이지 언로드 전
        window.addEventListener('beforeunload', () => {
            notificationService.info('시스템', '페이지를 떠나고 있습니다');
        });

        // 에러 이벤트
        window.addEventListener('error', (event) => {
            notificationService.error('JavaScript 오류', event.message, {
                persistent: true,
                actions: [
                    {
                        label: '새로고침',
                        action: () => window.location.reload(),
                        variant: 'primary',
                    },
                ],
            });
        });

        // Promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            notificationService.error('Promise 오류', event.reason?.message || '알 수 없는 오류', {
                persistent: true,
            });
        });
    }
}

// 시스템 알림 리스너 초기화
new SystemNotificationListener();
