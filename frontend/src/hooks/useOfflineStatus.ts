import { useState, useEffect } from 'react';

export const useOfflineStatus = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            console.log('[Network] 온라인 상태로 복구되었습니다.');
        };

        const handleOffline = () => {
            setIsOffline(true);
            console.warn('[Network] 오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.');
        };

        // 이벤트 리스너 등록
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // 클린업
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return {
        isOffline,
        isOnline: !isOffline
    };
};
