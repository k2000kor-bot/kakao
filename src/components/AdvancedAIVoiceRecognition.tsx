import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    MicrophoneIcon,
    SpeakerWaveIcon,
    ShieldCheckIcon,
    EyeIcon,
    FireIcon,
    BoltIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
    UserIcon,
    ServerIcon,
    CloudIcon,
    CogIcon,
    ArrowPathIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    PlusIcon,
    MinusIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    Bars3Icon,
    Squares2X2Icon,
    ViewColumnsIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    Cog6ToothIcon,
    WrenchScrewdriverIcon,
    HeartIcon,
    LightBulbIcon,
    BookOpenIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    SignalIcon,
    WifiIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ChartPieIcon,
    PresentationChartLineIcon,
    ChartBarIcon,
    TableCellsIcon,
    CubeIcon,
    CubeTransparentIcon,
    SwatchIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon,
    RectangleStackIcon,
    CircleStackIcon,
    QueueListIcon,
    ListBulletIcon,
    Bars4Icon,
    Bars3BottomLeftIcon,
    Bars3BottomRightIcon,
    Bars3CenterLeftIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface VoiceSession {
    id: string;
    title: string;
    duration: number;
    language: string;
    accuracy: number;
    status: 'recording' | 'processing' | 'completed' | 'failed';
    transcript: string;
    insights: VoiceInsight[];
    timestamp: string;
}

interface VoiceInsight {
    id: string;
    type: 'emotion' | 'sentiment' | 'keyword' | 'intent' | 'speaker' | 'quality';
    title: string;
    description: string;
    confidence: number;
    value: any;
}

interface VoiceModel {
    id: string;
    name: string;
    language: string;
    accuracy: number;
    status: 'active' | 'training' | 'inactive';
    lastUpdated: string;
    usage: number;
}

interface VoiceSettings {
    language: string;
    model: string;
    sensitivity: number;
    noiseReduction: boolean;
    realTimeProcessing: boolean;
    autoSave: boolean;
}

interface AdvancedAIVoiceRecognitionProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIVoiceRecognition: React.FC<AdvancedAIVoiceRecognitionProps> = ({
    isActive,
    onToggle
}) => {
    const [voiceSessions, setVoiceSessions] = useState<VoiceSession[]>([
        {
            id: 'session-1',
            title: 'AI 시스템 분석 회의',
            duration: 1250,
            language: 'ko',
            accuracy: 94.2,
            status: 'completed',
            transcript: '안녕하세요. 오늘은 AI 시스템의 성능 분석에 대해 논의하겠습니다. 현재 시스템의 정확도는 94.2%로 매우 우수한 수준입니다. 하지만 응답 시간을 더 개선할 수 있는 방안을 모색해보겠습니다.',
            insights: [
                {
                    id: 'insight-1',
                    type: 'emotion',
                    title: '감정 분석',
                    description: '전문적이고 긍정적인 톤',
                    confidence: 87.5,
                    value: 'positive'
                },
                {
                    id: 'insight-2',
                    type: 'keyword',
                    title: '주요 키워드',
                    description: 'AI, 시스템, 성능, 분석, 개선',
                    confidence: 92.1,
                    value: ['AI', '시스템', '성능', '분석', '개선']
                },
                {
                    id: 'insight-3',
                    type: 'intent',
                    title: '의도 분석',
                    description: '정보 공유 및 논의',
                    confidence: 89.3,
                    value: 'discussion'
                }
            ],
            timestamp: '10분 전'
        },
        {
            id: 'session-2',
            title: '사용자 피드백 인터뷰',
            duration: 890,
            language: 'ko',
            accuracy: 91.8,
            status: 'completed',
            transcript: '사용자 인터페이스가 매우 직관적이고 사용하기 편리합니다. 다만 일부 기능의 응답 속도를 개선하면 더 좋을 것 같습니다.',
            insights: [
                {
                    id: 'insight-4',
                    type: 'sentiment',
                    title: '감정 분석',
                    description: '긍정적이지만 개선 요청 포함',
                    confidence: 85.7,
                    value: 'positive_with_suggestions'
                },
                {
                    id: 'insight-5',
                    type: 'keyword',
                    title: '주요 키워드',
                    description: '인터페이스, 직관적, 편리, 기능, 응답 속도',
                    confidence: 88.9,
                    value: ['인터페이스', '직관적', '편리', '기능', '응답 속도']
                }
            ],
            timestamp: '25분 전'
        }
    ]);

    const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([
        {
            id: 'model-1',
            name: 'Korean Speech Recognition v2.1',
            language: 'ko',
            accuracy: 94.2,
            status: 'active',
            lastUpdated: '2일 전',
            usage: 1250
        },
        {
            id: 'model-2',
            name: 'English Speech Recognition v1.8',
            language: 'en',
            accuracy: 91.5,
            status: 'active',
            lastUpdated: '1주일 전',
            usage: 890
        },
        {
            id: 'model-3',
            name: 'Japanese Speech Recognition v1.5',
            language: 'ja',
            accuracy: 89.7,
            status: 'training',
            lastUpdated: '3일 전',
            usage: 450
        }
    ]);

    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
        language: 'ko',
        model: 'Korean Speech Recognition v2.1',
        sensitivity: 75,
        noiseReduction: true,
        realTimeProcessing: true,
        autoSave: true
    });

    const [isRecording, setIsRecording] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [activeTab, setActiveTab] = useState<'recording' | 'sessions' | 'models' | 'insights' | 'settings'>('recording');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
                // 실시간 음성 인식 시뮬레이션
                const sampleTexts = [
                    '안녕하세요. AI 음성 인식 시스템입니다.',
                    '현재 음성 인식 정확도는 94.2%입니다.',
                    '실시간 처리 기능이 활성화되어 있습니다.',
                    '노이즈 감소 기능이 작동 중입니다.'
                ];
                const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
                setCurrentTranscript(prev => prev + ' ' + randomText);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startRecording = () => {
        setIsRecording(true);
        setRecordingTime(0);
        setCurrentTranscript('');
    };

    const stopRecording = () => {
        setIsRecording(false);
        const newSession: VoiceSession = {
            id: `session-${Date.now()}`,
            title: `음성 세션 ${voiceSessions.length + 1}`,
            duration: recordingTime,
            language: voiceSettings.language,
            accuracy: 94.2,
            status: 'completed',
            transcript: currentTranscript,
            insights: [
                {
                    id: `insight-${Date.now()}`,
                    type: 'sentiment',
                    title: '감정 분석',
                    description: '중립적이고 정보 전달 중심',
                    confidence: 87.5,
                    value: 'neutral'
                }
            ],
            timestamp: '방금 전'
        };
        setVoiceSessions(prev => [newSession, ...prev]);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'completed':
                return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'training':
            case 'processing':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'failed':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'inactive':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <MicrophoneIcon className="w-5 h-5" />
                    <span>음성 인식</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-7xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-900 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <MicrophoneIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 음성 인식 시스템</h3>
                                <p className="text-gray-400 text-sm">실시간 음성 인식 및 분석</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{voiceSessions.length}개 세션</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'recording', label: '녹음', icon: MicrophoneIcon },
                        { id: 'sessions', label: '세션', icon: ClockIcon },
                        { id: 'models', label: '모델', icon: CpuChipIcon },
                        { id: 'insights', label: '인사이트', icon: LightBulbIcon },
                        { id: 'settings', label: '설정', icon: CogIcon }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${activeTab === id
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'recording' && (
                        <div className="space-y-6">
                            {/* 실시간 녹음 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-center mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">실시간 음성 인식</h4>
                                    <div className="flex items-center justify-center space-x-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-gray-900">{formatTime(recordingTime)}</div>
                                            <div className="text-sm text-gray-500">녹음 시간</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-emerald-600">{voiceSettings.model === 'Korean Speech Recognition v2.1' ? '94.2' : '91.5'}%</div>
                                            <div className="text-sm text-gray-500">정확도</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center space-x-4">
                                        {!isRecording ? (
                                            <button
                                                onClick={startRecording}
                                                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors flex items-center space-x-2"
                                            >
                                                <MicrophoneIcon className="w-5 h-5" />
                                                <span>녹음 시작</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={stopRecording}
                                                className="bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors flex items-center space-x-2"
                                            >
                                                <StopIcon className="w-5 h-5" />
                                                <span>녹음 중지</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 실시간 트랜스크립트 */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-3">실시간 트랜스크립트</h5>
                                    <div className="bg-white p-4 rounded border min-h-32">
                                        <p className="text-gray-700 leading-relaxed">
                                            {currentTranscript || '음성 인식 결과가 여기에 표시됩니다...'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 음성 품질 지표 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 품질 지표</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-emerald-600">94.2%</div>
                                        <div className="text-sm text-gray-600">인식 정확도</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">-12dB</div>
                                        <div className="text-sm text-gray-600">노이즈 레벨</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">85%</div>
                                        <div className="text-sm text-gray-600">신호 품질</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">1.2초</div>
                                        <div className="text-sm text-gray-600">응답 시간</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 세션</h4>
                                <div className="space-y-4">
                                    {voiceSessions.map(session => (
                                        <div key={session.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{session.title}</h5>
                                                    <p className="text-sm text-gray-500">{session.timestamp} • {formatTime(session.duration)}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-700 line-clamp-3">{session.transcript}</p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-gray-600">정확도: {session.accuracy}%</span>
                                                    <span className="text-gray-600">언어: {session.language}</span>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                    상세 보기
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'models' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 인식 모델</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {voiceModels.map(model => (
                                        <div key={model.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{model.name}</h5>
                                                    <p className="text-sm text-gray-500">언어: {model.language}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(model.status)}`}>
                                                    {model.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-sm mb-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">정확도:</span>
                                                    <span className="font-semibold text-gray-900">{model.accuracy}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">사용 횟수:</span>
                                                    <span className="font-semibold text-gray-900">{model.usage.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">업데이트:</span>
                                                    <span className="font-semibold text-gray-900">{model.lastUpdated}</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                                    사용
                                                </button>
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    설정
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 분석 인사이트</h4>
                                <div className="space-y-4">
                                    {voiceSessions.flatMap(session => session.insights).map(insight => (
                                        <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                                </div>
                                                <span className="text-sm text-gray-500">{insight.confidence}%</span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <strong>분석 결과:</strong> {JSON.stringify(insight.value)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 인식 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">언어 설정</h5>
                                            <p className="text-sm text-gray-600">음성 인식 언어 선택</p>
                                        </div>
                                        <select
                                            value={voiceSettings.language}
                                            onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            aria-label="언어 설정 선택"
                                        >
                                            <option value="ko">한국어</option>
                                            <option value="en">English</option>
                                            <option value="ja">日本語</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">노이즈 감소</h5>
                                            <p className="text-sm text-gray-600">배경 소음 자동 제거</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${voiceSettings.noiseReduction
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {voiceSettings.noiseReduction ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">실시간 처리</h5>
                                            <p className="text-sm text-gray-600">실시간 음성 인식 처리</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${voiceSettings.realTimeProcessing
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {voiceSettings.realTimeProcessing ? '활성화' : '비활성화'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIVoiceRecognition; 