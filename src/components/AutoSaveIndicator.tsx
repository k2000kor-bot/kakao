import React from 'react';

interface AutoSaveIndicatorProps {
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    lastSaved: Date | null;
    backupCount: number;
    onManualSave?: () => void;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    backupCount,
    onManualSave
}) => {
    const getStatusIcon = () => {
        if (isSaving) return '💾';
        if (hasUnsavedChanges) return '⚠️';
        return '✅';
    };

    const getStatusText = () => {
        if (isSaving) return '저장 중...';
        if (hasUnsavedChanges) return '저장되지 않은 변경사항';
        return '모든 변경사항 저장됨';
    };

    const getStatusColor = () => {
        if (isSaving) return 'text-blue-600 dark:text-blue-400';
        if (hasUnsavedChanges) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const formatLastSaved = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간 전`;

        const days = Math.floor(hours / 24);
        return `${days}일 전`;
    };

    return (
        <div className="flex items-center space-x-1 text-xs">
            <span className={getStatusColor()} title={getStatusText()}>
                {getStatusIcon()}
            </span>

            {hasUnsavedChanges && !isSaving && (
                <span className="text-yellow-600 dark:text-yellow-400" title="저장되지 않은 변경사항">
                    •
                </span>
            )}

            {hasUnsavedChanges && onManualSave && (
                <button
                    onClick={onManualSave}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                    disabled={isSaving}
                    title="지금 저장"
                >
                    저장
                </button>
            )}
        </div>
    );
};

export default AutoSaveIndicator;
