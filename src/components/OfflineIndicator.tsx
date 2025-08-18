import React from 'react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const OfflineIndicator: React.FC = () => {
    const { isOffline } = useOfflineStatus();

    if (!isOffline) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium">
            <div className="flex items-center justify-center space-x-2">
                <span>📡</span>
                <span>오프라인 상태입니다. 인터넷 연결을 확인해주세요.</span>
            </div>
        </div>
    );
};

export default OfflineIndicator;
