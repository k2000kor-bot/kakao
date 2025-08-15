import React, { useState, useEffect } from 'react';
import {
    CloudArrowUpIcon,
    CloudArrowDownIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    CogIcon,
    ArrowPathIcon,
    TrashIcon,
    PlusIcon,
    EyeIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';

interface BackupJob {
    id: string;
    name: string;
    type: 'full' | 'incremental' | 'differential';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    source: string;
    destination: string;
    size: number;
    filesCount: number;
    startTime: Date;
    endTime?: Date;
    schedule?: string;
    retention: number;
    encryption: boolean;
    compression: boolean;
    progress: number;
    error?: string;
}

interface BackupSchedule {
    id: string;
    name: string;
    jobId: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    days?: string[];
    enabled: boolean;
    lastRun?: Date;
    nextRun?: Date;
}

interface BackupStats {
    totalBackups: number;
    totalSize: number;
    successfulBackups: number;
    failedBackups: number;
    averageBackupTime: number;
    storageUsed: number;
    storageLimit: number;
}

interface AdvancedBackupSystemProps {
    onBackupStart?: (job: BackupJob) => void;
    onBackupRestore?: (jobId: string) => void;
    onBackupDelete?: (jobId: string) => void;
}

const AdvancedBackupSystem: React.FC<AdvancedBackupSystemProps> = ({
    onBackupStart,
    onBackupRestore,
    onBackupDelete
}) => {
    const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
    const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
    const [stats, setStats] = useState<BackupStats>({
        totalBackups: 0,
        totalSize: 0,
        successfulBackups: 0,
        failedBackups: 0,
        averageBackupTime: 0,
        storageUsed: 0,
        storageLimit: 0
    });
    const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'schedules' | 'restore'>('overview');
    const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
    const [isCreatingJob, setIsCreatingJob] = useState(false);

    // 시뮬레이션된 백업 작업 데이터
    useEffect(() => {
        const mockBackupJobs: BackupJob[] = [
            {
                id: '1',
                name: '전체 시스템 백업',
                type: 'full',
                status: 'completed',
                source: '/system',
                destination: '/backups/system/full_20241201',
                size: 2048576000, // 2GB
                filesCount: 15420,
                startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
                retention: 30,
                encryption: true,
                compression: true,
                progress: 100
            },
            {
                id: '2',
                name: '데이터베이스 백업',
                type: 'incremental',
                status: 'running',
                source: '/database',
                destination: '/backups/database/incremental_20241201',
                size: 524288000, // 500MB
                filesCount: 1250,
                startTime: new Date(Date.now() - 30 * 60 * 1000),
                retention: 7,
                encryption: true,
                compression: false,
                progress: 65
            },
            {
                id: '3',
                name: '사용자 파일 백업',
                type: 'differential',
                status: 'completed',
                source: '/users',
                destination: '/backups/users/differential_20241130',
                size: 1048576000, // 1GB
                filesCount: 8500,
                startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
                retention: 14,
                encryption: false,
                compression: true,
                progress: 100
            },
            {
                id: '4',
                name: '설정 파일 백업',
                type: 'full',
                status: 'failed',
                source: '/config',
                destination: '/backups/config/full_20241129',
                size: 52428800, // 50MB
                filesCount: 320,
                startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 47 * 60 * 60 * 1000),
                retention: 90,
                encryption: true,
                compression: true,
                progress: 0,
                error: '네트워크 연결 오류'
            }
        ];

        setBackupJobs(mockBackupJobs);

        // 통계 계산
        const totalSize = mockBackupJobs.reduce((acc, job) => acc + job.size, 0);
        const successfulBackups = mockBackupJobs.filter(job => job.status === 'completed').length;
        const failedBackups = mockBackupJobs.filter(job => job.status === 'failed').length;
        const averageBackupTime = mockBackupJobs
            .filter(job => job.endTime && job.status === 'completed')
            .reduce((acc, job) => acc + (job.endTime!.getTime() - job.startTime.getTime()), 0) / successfulBackups;

        setStats({
            totalBackups: mockBackupJobs.length,
            totalSize,
            successfulBackups,
            failedBackups,
            averageBackupTime,
            storageUsed: totalSize,
            storageLimit: 10737418240 // 10GB
        });
    }, []);

    // 시뮬레이션된 스케줄 데이터
    useEffect(() => {
        const mockSchedules: BackupSchedule[] = [
            {
                id: '1',
                name: '일일 전체 백업',
                jobId: '1',
                frequency: 'daily',
                time: '02:00',
                enabled: true,
                lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
                nextRun: new Date(Date.now() + 8 * 60 * 60 * 1000)
            },
            {
                id: '2',
                name: '주간 증분 백업',
                jobId: '2',
                frequency: 'weekly',
                time: '03:00',
                days: ['monday', 'wednesday', 'friday'],
                enabled: true,
                lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            },
            {
                id: '3',
                name: '월간 차등 백업',
                jobId: '3',
                frequency: 'monthly',
                time: '04:00',
                enabled: false,
                lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                nextRun: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
            }
        ];

        setSchedules(mockSchedules);
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50';
            case 'running': return 'text-blue-600 bg-blue-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'cancelled': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'full': return 'text-purple-600 bg-purple-50';
            case 'incremental': return 'text-blue-600 bg-blue-50';
            case 'differential': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const startBackup = (jobId: string) => {
        setBackupJobs(prev =>
            prev.map(job =>
                job.id === jobId ? { ...job, status: 'running', startTime: new Date(), progress: 0 } : job
            )
        );

        // 시뮬레이션된 백업 진행
        const interval = setInterval(() => {
            setBackupJobs(prev =>
                prev.map(job => {
                    if (job.id === jobId && job.status === 'running') {
                        const newProgress = job.progress + Math.random() * 20;
                        if (newProgress >= 100) {
                            clearInterval(interval);
                            return {
                                ...job,
                                status: 'completed',
                                progress: 100,
                                endTime: new Date()
                            };
                        }
                        return { ...job, progress: newProgress };
                    }
                    return job;
                })
            );
        }, 2000);

        onBackupStart?.(backupJobs.find(job => job.id === jobId)!);
    };

    const cancelBackup = (jobId: string) => {
        setBackupJobs(prev =>
            prev.map(job =>
                job.id === jobId ? { ...job, status: 'cancelled', endTime: new Date() } : job
            )
        );
    };

    const deleteBackup = (jobId: string) => {
        if (window.confirm('이 백업을 삭제하시겠습니까?')) {
            setBackupJobs(prev => prev.filter(job => job.id !== jobId));
            onBackupDelete?.(jobId);
        }
    };

    const restoreBackup = (jobId: string) => {
        if (window.confirm('이 백업을 복원하시겠습니까?')) {
            onBackupRestore?.(jobId);
        }
    };

    const toggleSchedule = (scheduleId: string) => {
        setSchedules(prev =>
            prev.map(schedule =>
                schedule.id === scheduleId ? { ...schedule, enabled: !schedule.enabled } : schedule
            )
        );
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* 백업 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 백업</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBackups}</p>
                        </div>
                        <CloudArrowUpIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">성공한 백업</p>
                            <p className="text-2xl font-bold text-green-600">{stats.successfulBackups}</p>
                        </div>
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 크기</p>
                            <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
                        </div>
                        <DocumentTextIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">저장 공간</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {Math.round((stats.storageUsed / stats.storageLimit) * 100)}%
                            </p>
                        </div>
                        <ChartBarIcon className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* 최근 백업 작업 */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">최근 백업 작업</h3>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        모든 작업 보기
                    </button>
                </div>

                <div className="space-y-3">
                    {backupJobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">{job.name}</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                        {job.status === 'completed' ? '완료' :
                                            job.status === 'running' ? '실행중' :
                                                job.status === 'pending' ? '대기' :
                                                    job.status === 'failed' ? '실패' : '취소됨'}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                                        {job.type === 'full' ? '전체' :
                                            job.type === 'incremental' ? '증분' : '차등'}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                    <span>크기: {formatFileSize(job.size)}</span>
                                    <span>파일: {job.filesCount}개</span>
                                    <span>시작: {job.startTime.toLocaleString()}</span>
                                    {job.status === 'running' && (
                                        <span>진행률: {Math.round(job.progress)}%</span>
                                    )}
                                </div>
                            </div>

                            {job.status === 'running' && (
                                <button
                                    onClick={() => cancelBackup(job.id)}
                                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    취소
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 백업 스케줄 */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">백업 스케줄</h3>
                    <button
                        onClick={() => setActiveTab('schedules')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        모든 스케줄 보기
                    </button>
                </div>

                <div className="space-y-3">
                    {schedules.slice(0, 3).map((schedule) => (
                        <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${schedule.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{schedule.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {schedule.frequency === 'daily' ? '매일' :
                                            schedule.frequency === 'weekly' ? '매주' : '매월'} {schedule.time}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-gray-500">
                                    다음 실행: {schedule.nextRun?.toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderJobs = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">백업 작업 관리</h3>
                <button
                    onClick={() => setIsCreatingJob(true)}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>새 백업 작업</span>
                </button>
            </div>

            <div className="space-y-4">
                {backupJobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="text-lg font-medium text-gray-900">{job.name}</h4>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                        {job.status === 'completed' ? '완료' :
                                            job.status === 'running' ? '실행중' :
                                                job.status === 'pending' ? '대기' :
                                                    job.status === 'failed' ? '실패' : '취소됨'}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                                        {job.type === 'full' ? '전체' :
                                            job.type === 'incremental' ? '증분' : '차등'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                    <div>
                                        <span className="font-medium">소스:</span> {job.source}
                                    </div>
                                    <div>
                                        <span className="font-medium">대상:</span> {job.destination}
                                    </div>
                                    <div>
                                        <span className="font-medium">크기:</span> {formatFileSize(job.size)}
                                    </div>
                                </div>

                                {job.status === 'running' && (
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${job.progress}%` }}
                                        />
                                    </div>
                                )}

                                {job.error && (
                                    <p className="text-sm text-red-600 mt-2">오류: {job.error}</p>
                                )}

                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                    <span>파일: {job.filesCount}개</span>
                                    <span>보관: {job.retention}일</span>
                                    {job.encryption && <span className="text-green-600">암호화</span>}
                                    {job.compression && <span className="text-blue-600">압축</span>}
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                {job.status === 'pending' && (
                                    <button
                                        onClick={() => startBackup(job.id)}
                                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        시작
                                    </button>
                                )}
                                {job.status === 'running' && (
                                    <button
                                        onClick={() => cancelBackup(job.id)}
                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        취소
                                    </button>
                                )}
                                {job.status === 'completed' && (
                                    <button
                                        onClick={() => restoreBackup(job.id)}
                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        복원
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteBackup(job.id)}
                                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSchedules = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">백업 스케줄 관리</h3>
                <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                    <PlusIcon className="w-4 h-4" />
                    <span>새 스케줄</span>
                </button>
            </div>

            <div className="space-y-4">
                {schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full ${schedule.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900">{schedule.name}</h4>
                                    <p className="text-sm text-gray-600">
                                        {schedule.frequency === 'daily' ? '매일' :
                                            schedule.frequency === 'weekly' ? '매주' : '매월'} {schedule.time}
                                        {schedule.days && ` (${schedule.days.join(', ')})`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-900">
                                        마지막 실행: {schedule.lastRun?.toLocaleDateString() || '없음'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        다음 실행: {schedule.nextRun?.toLocaleDateString() || '없음'}
                                    </p>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => toggleSchedule(schedule.id)}
                                        className={`px-3 py-1 text-sm rounded ${schedule.enabled
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                            }`}
                                    >
                                        {schedule.enabled ? '비활성화' : '활성화'}
                                    </button>
                                    <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                                        편집
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRestore = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">백업 복원</h3>

            <div className="bg-white rounded-lg border p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            복원할 백업 선택
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">백업을 선택하세요</option>
                            {backupJobs
                                .filter(job => job.status === 'completed')
                                .map((job) => (
                                    <option key={job.id} value={job.id}>
                                        {job.name} - {job.startTime.toLocaleDateString()}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            복원 대상 위치
                        </label>
                        <input
                            type="text"
                            placeholder="/restore/path"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">기존 파일 덮어쓰기</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">권한 복원</span>
                        </label>
                    </div>

                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        복원 시작
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CloudArrowUpIcon className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">고급 백업 시스템</h3>
                            <p className="text-sm text-gray-500">백업 및 복구 관리</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="설정">
                            <CogIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b">
                <nav className="flex space-x-8 px-4">
                    {[
                        { id: 'overview', name: '개요', icon: ChartBarIcon },
                        { id: 'jobs', name: '백업 작업', icon: CloudArrowUpIcon },
                        { id: 'schedules', name: '스케줄', icon: CalendarIcon },
                        { id: 'restore', name: '복원', icon: CloudArrowDownIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'jobs' && renderJobs()}
                {activeTab === 'schedules' && renderSchedules()}
                {activeTab === 'restore' && renderRestore()}
            </div>
        </div>
    );
};

export default AdvancedBackupSystem;
