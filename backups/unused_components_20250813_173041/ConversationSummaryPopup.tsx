import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChartBarIcon, UserGroupIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, CalendarIcon, ClockIcon as ClockIconSolid } from '@heroicons/react/24/outline';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useModalClose } from '../hooks/useModalClose';

interface ConversationSummaryPopupProps {
    isOpen: boolean;
    onClose: () => void;
    dateRange?: [Date | null, Date | null];
}

interface SummaryData {
    success: boolean;
    summary: any;
    formatted_summary: string;
    period: string;
    total_messages: number;
    total_participants: number;
    topics_count: number;
    error?: string;
}

const ConversationSummaryPopup: React.FC<ConversationSummaryPopupProps> = ({ isOpen, onClose, dateRange: initialDateRange }) => {
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(
        initialDateRange || [null, null]
    );
    const [startDate, endDate] = dateRange;
    const [autoApply, setAutoApply] = useState(false);

    const { modalRef, handleClose } = useModalClose({
        isOpen,
        onClose
    });

    // 팝업이 열릴 때 요약 데이터 로드
    useEffect(() => {
        if (isOpen) {
            loadSummaryData();
        }
    }, [isOpen]);

    // 날짜 범위가 변경될 때 자동 적용
    useEffect(() => {
        if (autoApply && startDate && endDate) {
            loadSummaryData();
        }
    }, [dateRange, autoApply]);

    const loadSummaryData = async () => {
        setIsLoading(true);
        setError(null);
        setSummaryData(null);

        try {
            const [startDate, endDate] = dateRange || [null, null];
            const start = startDate ? startDate.toISOString().slice(0, 10) : undefined;
            const end = endDate ? endDate.toISOString().slice(0, 10) : undefined;

            // 정확한 시간까지 포함한 datetime 파라미터
            const start_datetime = startDate ? startDate.toISOString().slice(0, 19).replace('T', ' ') : undefined;
            const end_datetime = endDate ? endDate.toISOString().slice(0, 19).replace('T', ' ') : undefined;

            const chatFile = '../chat_rooms/[인증]행복한소유☆개포우성7차/[인증]행복한소유☆개포우성7차.txt';

            const response = await axios.post('/api/v1/summarize', {
                chat_file: chatFile,
                start_date: start,
                end_date: end,
                start_datetime: start_datetime,
                end_datetime: end_datetime
            });

            if (response.data && response.data.success) {
                setSummaryData(response.data);
            } else {
                setError(response.data.error || '요약 생성에 실패했습니다.');
            }
        } catch (err: any) {
            setError(err.message || 'API 호출 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateRangeChange = (update: [Date | null, Date | null]) => {
        setDateRange(update);
    };

    // 빠른 날짜 선택 함수들
    const setQuickDateRange = (type: string) => {
        const now = new Date();
        let start: Date | null = null;
        let end: Date | null = null;

        switch (type) {
            case 'today':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                break;
            case 'yesterday':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
                break;
            case 'thisWeek':
                const dayOfWeek = now.getDay();
                const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                break;
            case 'lastWeek':
                const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                const dayOfLastWeek = lastWeekStart.getDay();
                const daysFromLastMonday = dayOfLastWeek === 0 ? 6 : dayOfLastWeek - 1;
                start = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate() - daysFromLastMonday);
                end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59);
                break;
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                break;
            case 'lastMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                break;
            case 'custom':
                // 사용자가 직접 선택하도록 함
                return;
        }

        setDateRange([start, end]);
    };

    const formatDateTime = (date: Date) => {
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'bg-green-100 text-green-800';
            case 'negative': return 'bg-red-100 text-red-800';
            case 'concern': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'rising':
                return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
            case 'falling':
                return <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />;
            default:
                return <ChartBarIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* 헤더 */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ChartBarIcon className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-bold text-gray-800">대화 요약 분석</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="대화 요약 분석 모달 닫기"
                        title="ESC 키로도 닫을 수 있습니다"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 날짜 범위 선택 */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="space-y-4">
                        {/* 빠른 선택 버튼들 */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                <ClockIconSolid className="w-4 h-4 mr-1" />
                                빠른 선택:
                            </span>
                            {[
                                { key: 'today', label: '오늘' },
                                { key: 'yesterday', label: '어제' },
                                { key: 'thisWeek', label: '이번 주' },
                                { key: 'lastWeek', label: '지난 주' },
                                { key: 'thisMonth', label: '이번 달' },
                                { key: 'lastMonth', label: '지난 달' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setQuickDateRange(key)}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* 상세 날짜 선택 */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">기간 선택:</span>
                            </div>
                            <DatePicker
                                selectsRange
                                startDate={startDate}
                                endDate={endDate}
                                onChange={handleDateRangeChange}
                                isClearable={true}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="날짜 범위 선택"
                                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={autoApply}
                                    onChange={(e) => setAutoApply(e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-600">자동 적용</span>
                            </label>
                            <button
                                onClick={loadSummaryData}
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                {isLoading ? '생성 중...' : '요약 생성'}
                            </button>
                        </div>

                        {/* 선택된 기간 표시 */}
                        {startDate && endDate && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center space-x-2 text-sm">
                                    <ClockIcon className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-blue-800">선택된 기간:</span>
                                    <span className="text-blue-700">
                                        {formatDateTime(startDate)} ~ {formatDateTime(endDate)}
                                    </span>
                                </div>
                                <div className="mt-1 text-xs text-blue-600">
                                    총 {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}일
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 로딩 상태 */}
                {isLoading && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">대화 요약을 생성하고 있습니다...</p>
                    </div>
                )}

                {/* 오류 상태 */}
                {error && (
                    <div className="p-8 text-center">
                        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 font-medium mb-2">오류가 발생했습니다</p>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={loadSummaryData}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {/* 요약 데이터 표시 */}
                {summaryData && !isLoading && (
                    <div className="p-6 space-y-6">
                        {/* 기본 정보 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                                <ChartBarIcon className="w-5 h-5 text-blue-500" />
                                <span>요약 정보</span>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {summaryData.total_messages.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">총 메시지</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {summaryData.total_participants}
                                    </div>
                                    <div className="text-sm text-gray-600">참여자</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {summaryData.topics_count}
                                    </div>
                                    <div className="text-sm text-gray-600">주요 주제</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {summaryData.period}
                                    </div>
                                    <div className="text-sm text-gray-600">분석 기간</div>
                                </div>
                            </div>
                        </div>

                        {/* 상세 요약 */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                                <ClockIcon className="w-5 h-5 text-green-500" />
                                <span>상세 요약</span>
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <pre className="whitespace-pre-line text-sm text-gray-800 font-mono leading-relaxed">
                                    {summaryData.formatted_summary}
                                </pre>
                            </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    // 요약 결과 다운로드 로직
                                    const dataStr = JSON.stringify(summaryData, null, 2);
                                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                    const url = URL.createObjectURL(dataBlob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `대화요약_${startDate?.toISOString().split('T')[0] || '전체'}_${endDate?.toISOString().split('T')[0] || '전체'}.json`;
                                    link.click();
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                요약 결과 다운로드
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationSummaryPopup; 