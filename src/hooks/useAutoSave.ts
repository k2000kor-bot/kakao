import { useEffect, useRef, useCallback } from 'react';

interface AutoSaveConfig {
    interval?: number; // 자동 저장 간격 (ms)
    maxBackups?: number; // 최대 백업 개수
    enabled?: boolean; // 자동 저장 활성화 여부
}

interface AutoSaveState {
    lastSaved: Date | null;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    backupCount: number;
}

export const useAutoSave = <T>(
    data: T,
    key: string,
    config: AutoSaveConfig = {}
) => {
    const {
        interval = 30000, // 30초
        maxBackups = 5,
        enabled = true
    } = config;

    const stateRef = useRef<AutoSaveState>({
        lastSaved: null,
        isSaving: false,
        hasUnsavedChanges: false,
        backupCount: 0
    });

    const dataRef = useRef<T>(data);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // 데이터가 변경될 때마다 자동 저장 예약
    useEffect(() => {
        if (!enabled || !data) return;

        dataRef.current = data;
        stateRef.current.hasUnsavedChanges = true;

        // 기존 타이머 클리어
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // 새로운 타이머 설정
        timeoutRef.current = setTimeout(() => {
            saveData();
        }, interval);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, interval, enabled]);

    // 데이터 저장
    const saveData = useCallback(async () => {
        if (!enabled || !dataRef.current) return;

        try {
            stateRef.current.isSaving = true;

            // 현재 데이터를 로컬 스토리지에 저장
            const timestamp = new Date().toISOString();
            const backupKey = `${key}_backup_${timestamp}`;

            localStorage.setItem(backupKey, JSON.stringify({
                data: dataRef.current,
                timestamp,
                version: '1.0'
            }));

            // 최신 데이터 저장
            localStorage.setItem(key, JSON.stringify({
                data: dataRef.current,
                timestamp,
                version: '1.0'
            }));

            // 백업 정리
            cleanupOldBackups();

            stateRef.current.lastSaved = new Date();
            stateRef.current.hasUnsavedChanges = false;
            stateRef.current.backupCount = getBackupCount();

            console.log('[AutoSave] 데이터가 자동 저장되었습니다:', timestamp);
        } catch (error) {
            console.error('[AutoSave] 자동 저장 실패:', error);
        } finally {
            stateRef.current.isSaving = false;
        }
    }, [key, enabled]);

    // 백업 개수 계산
    const getBackupCount = useCallback(() => {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith(`${key}_backup_`)) {
                count++;
            }
        }
        return count;
    }, [key]);

    // 오래된 백업 정리
    const cleanupOldBackups = useCallback(() => {
        const backups: Array<{ key: string; timestamp: string }> = [];

        // 모든 백업 찾기
        for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith(`${key}_backup_`)) {
                try {
                    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
                    backups.push({
                        key: storageKey,
                        timestamp: data.timestamp || '1970-01-01T00:00:00.000Z'
                    });
                } catch (error) {
                    // 잘못된 데이터는 삭제
                    localStorage.removeItem(storageKey);
                }
            }
        }

        // 타임스탬프로 정렬하고 오래된 것들 삭제
        backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        for (let i = maxBackups; i < backups.length; i++) {
            localStorage.removeItem(backups[i].key);
        }
    }, [key, maxBackups]);

    // 데이터 복구
    const restoreData = useCallback(() => {
        try {
            const savedData = localStorage.getItem(key);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                console.log('[AutoSave] 데이터가 복구되었습니다:', parsed.timestamp);
                return parsed.data;
            }
        } catch (error) {
            console.error('[AutoSave] 데이터 복구 실패:', error);
        }
        return null;
    }, [key]);

    // 백업 목록 가져오기
    const getBackups = useCallback(() => {
        const backups: Array<{ key: string; timestamp: string; data: T }> = [];

        for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith(`${key}_backup_`)) {
                try {
                    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
                    backups.push({
                        key: storageKey,
                        timestamp: data.timestamp,
                        data: data.data
                    });
                } catch (error) {
                    // 잘못된 데이터는 무시
                }
            }
        }

        return backups.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [key]);

    // 특정 백업에서 복구
    const restoreFromBackup = useCallback((backupKey: string) => {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (backupData) {
                const parsed = JSON.parse(backupData);
                console.log('[AutoSave] 백업에서 복구되었습니다:', parsed.timestamp);
                return parsed.data;
            }
        } catch (error) {
            console.error('[AutoSave] 백업 복구 실패:', error);
        }
        return null;
    }, []);

    // 수동 저장
    const manualSave = useCallback(async () => {
        await saveData();
    }, [saveData]);

    // 모든 백업 삭제
    const clearAllBackups = useCallback(() => {
        for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith(`${key}_backup_`)) {
                localStorage.removeItem(storageKey);
            }
        }
        stateRef.current.backupCount = 0;
        console.log('[AutoSave] 모든 백업이 삭제되었습니다.');
    }, [key]);

    // 컴포넌트 언마운트 시 저장
    useEffect(() => {
        return () => {
            if (stateRef.current.hasUnsavedChanges) {
                saveData();
            }
        };
    }, [saveData]);

    return {
        state: stateRef.current,
        saveData: manualSave,
        restoreData,
        getBackups,
        restoreFromBackup,
        clearAllBackups,
        isEnabled: enabled
    };
};
