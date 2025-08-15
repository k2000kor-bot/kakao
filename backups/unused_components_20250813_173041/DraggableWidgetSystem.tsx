import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import {
    StarIcon,
    FireIcon,
    BoltIcon,
    EyeIcon,
    HeartIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    CogIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    BeakerIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    ArrowPathIcon,
    LightBulbIcon,
    HandRaisedIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    PlayIcon,
    PauseIcon,
    ChartBarIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface WidgetPosition {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
}

interface DraggableWidgetSystemProps {
    isActive: boolean;
    onToggle: () => void;
}

const DraggableWidgetSystem: React.FC<DraggableWidgetSystemProps> = ({
    isActive,
    onToggle
}) => {
    const [widgetPositions, setWidgetPositions] = useState<WidgetPosition[]>([
        { id: 'brainwave', x: 0, y: 0, width: 300, height: 400, isMinimized: false, isMaximized: false },
        { id: 'profiling', x: 320, y: 0, width: 300, height: 400, isMinimized: false, isMaximized: false },
        { id: 'ai-learning', x: 640, y: 0, width: 300, height: 400, isMinimized: false, isMaximized: false },
        { id: 'prediction', x: 960, y: 0, width: 300, height: 400, isMinimized: false, isMaximized: false }
    ]);

    const [activeWidget, setActiveWidget] = useState<string | null>(null);

    const handleDrag = (id: string, data: any) => {
        setWidgetPositions(prev => prev.map(widget =>
            widget.id === id
                ? { ...widget, x: data.x, y: data.y }
                : widget
        ));
    };

    const toggleMinimize = (id: string) => {
        setWidgetPositions(prev => prev.map(widget =>
            widget.id === id
                ? { ...widget, isMinimized: !widget.isMinimized, isMaximized: false }
                : widget
        ));
    };

    const toggleMaximize = (id: string) => {
        setWidgetPositions(prev => prev.map(widget =>
            widget.id === id
                ? { ...widget, isMaximized: !widget.isMaximized, isMinimized: false }
                : { ...widget, isMaximized: false }
        ));
    };

    const getWidgetContent = (id: string) => {
        switch (id) {
            case 'brainwave':
                return (
                    <div className="h-full overflow-y-auto">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">실시간 뇌파 분석</h3>
                                <button className="text-gray-500 hover:text-gray-700">
                                    <PauseIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>알파파 (33.3Hz)</span>
                                        <span>33%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-gray-400 h-2 rounded-full" style={{ width: '33%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>베타파 (61.5Hz)</span>
                                        <span>62%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>감마파 (59.3Hz)</span>
                                        <span>59%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '59%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>세타파 (2.3Hz)</span>
                                        <span>2%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '2%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>델타파 (15.1Hz)</span>
                                        <span>15%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">뇌파 조작 모드</h4>
                                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                                    <li>• 알파파 ↑ = 이완 상태 (조작 용이)</li>
                                    <li>• 베타파 ↑ = 활성 상태 (저항 증가)</li>
                                    <li>• 감마파 ↑ = 집중 상태 (설득 최적)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'profiling':
                return (
                    <div className="h-full overflow-y-auto">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">타겟 프로파일링</h3>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">취약성 지표</h4>
                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>조작 취약도</span>
                                                <span>78%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-red-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>저항력</span>
                                                <span>34%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>감정 안정성</span>
                                                <span>42%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">인지 편향</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">확증편향</button>
                                        <button className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">앵커링</button>
                                        <button className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">가용성휴리스틱</button>
                                        <button className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">손실회피</button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">약점 & 트리거</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">약점:</h5>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-2">
                                                <li>• 경제적불안</li>
                                                <li>• 사회적고립</li>
                                                <li>• 미래걱정</li>
                                                <li>• 가족우려</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">트리거 워드:</h5>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">인간</span>
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">회사</span>
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">날씨</span>
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">기분</span>
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">미래</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'ai-learning':
                return (
                    <div className="h-full overflow-y-auto">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI 학습 진화</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">161</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">완료 세션</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">92%</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">성공률</div>
                                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs mt-1">학습 중</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>진화 레벨 7.4</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '74%' }}></div>
                                    </div>
                                </div>

                                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        실시간 학습 중... 새로운 조작 패턴 발견
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'prediction':
                return (
                    <div className="h-full overflow-y-auto">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">실시간 효과 예측</h3>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">예측 중</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">성공 예측</h4>
                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>즉시 순응도</span>
                                                <span>90%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>장기 영향력</span>
                                                <span>83%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '83%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">위험 예측</h4>
                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>탐지 위험도</span>
                                                <span>14%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-red-500 h-2 rounded-full" style={{ width: '14%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        AI 예측 엔진 실행 중...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>위젯을 찾을 수 없습니다.</div>;
        }
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 left-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                >
                    <ArrowsPointingOutIcon className="w-5 h-5" />
                    <span>드래그 위젯</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-7xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <ArrowsPointingOutIcon className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">드래그 가능한 위젯 시스템</h3>
                        </div>
                        <button
                            onClick={onToggle}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* 위젯 영역 */}
                <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {widgetPositions.map(widget => (
                        <Draggable
                            key={widget.id}
                            defaultPosition={{ x: widget.x, y: widget.y }}
                            onStop={(e: any, data: any) => handleDrag(widget.id, data)}
                            bounds="parent"
                            handle=".drag-handle"
                        >
                            <div
                                className={`absolute bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 ${widget.isMinimized ? 'h-12' : widget.isMaximized ? 'w-full h-full' : ''
                                    }`}
                                style={{
                                    width: widget.isMaximized ? '100%' : widget.width,
                                    height: widget.isMinimized ? '48px' : widget.isMaximized ? '100%' : widget.height,
                                    zIndex: activeWidget === widget.id ? 10 : 1
                                }}
                                onClick={() => setActiveWidget(widget.id)}
                            >
                                {/* 위젯 헤더 */}
                                <div className="drag-handle bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 px-4 py-2 rounded-t-lg cursor-move flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {widget.id === 'brainwave' && '뇌파 시뮬레이터'}
                                            {widget.id === 'profiling' && '고급 타겟 프로파일링'}
                                            {widget.id === 'ai-learning' && 'AI 학습 진화'}
                                            {widget.id === 'prediction' && '실시간 효과 예측'}
                                        </span>
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">expert</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMinimize(widget.id);
                                            }}
                                            className="text-gray-500 hover:text-gray-700 p-1"
                                        >
                                            <ArrowsPointingInIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMaximize(widget.id);
                                            }}
                                            className="text-gray-500 hover:text-gray-700 p-1"
                                        >
                                            <ArrowsPointingOutIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* 위젯 컨텐츠 */}
                                {!widget.isMinimized && (
                                    <div className="p-4 h-full">
                                        {getWidgetContent(widget.id)}
                                    </div>
                                )}
                            </div>
                        </Draggable>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DraggableWidgetSystem; 