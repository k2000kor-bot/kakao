import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    SpeakerWaveIcon,
    UserIcon,
    ClockIcon,
    LightBulbIcon,
    CogIcon,
    ArrowPathIcon,
    XCircleIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface SynthesisTask {
    id: string;
    text: string;
    voice: string;
    language: string;
    speed: number;
    pitch: number;
    output: string;
    quality: number;
    processingTime: number;
    timestamp: string;
    insights: SynthesisInsight[];
}

interface SynthesisInsight {
    id: string;
    type: 'prosody' | 'intonation' | 'articulation' | 'emotion' | 'clarity' | 'naturalness';
    title: string;
    description: string;
    confidence: number;
    value: any;
}

interface VoiceModel {
    id: string;
    name: string;
    gender: 'male' | 'female' | 'neutral';
    language: string;
    quality: number;
    speed: number;
    status: 'active' | 'training' | 'inactive';
    lastUpdated: string;
    usage: number;
    emotionSupport: boolean;
}

interface SynthesisSettings {
    enableRealTime: boolean;
    enableEmotionControl: boolean;
    enableProsodyControl: boolean;
    defaultLanguage: string;
    defaultSpeed: number;
    defaultPitch: number;
    qualityLevel: 'low' | 'medium' | 'high';
}

interface AdvancedAIVoiceSynthesisProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIVoiceSynthesis: React.FC<AdvancedAIVoiceSynthesisProps> = ({
    isActive,
    onToggle
}) => {
    const [synthesisTasks, setSynthesisTasks] = useState<SynthesisTask[]>([
        {
            id: 'task-1',
            text: '안녕하세요! AI 음성 합성 시스템에 오신 것을 환영합니다. 이 시스템은 자연스러운 음성 생성을 제공합니다.',
            voice: '김지영',
            language: 'ko',
            speed: 1.0,
            pitch: 1.0,
            output: 'audio-output-1.mp3',
            quality: 94.2,
            processingTime: 2.1,
            timestamp: '5분 전',
            insights: [
                {
                    id: 'insight-1',
                    type: 'prosody',
                    title: '자연스러운 억양',
                    description: '한국어의 자연스러운 억양 패턴 적용',
                    confidence: 91.7,
                    value: 'natural_prosody'
                },
                {
                    id: 'insight-2',
                    type: 'emotion',
                    title: '친근한 톤',
                    description: '환영 메시지에 적합한 친근한 톤',
                    confidence: 89.3,
                    value: 'friendly_tone'
                }
            ]
        },
        {
            id: 'task-2',
            text: 'Welcome to our advanced AI voice synthesis system. This technology provides high-quality, natural-sounding speech synthesis.',
            voice: 'John Smith',
            language: 'en',
            speed: 1.1,
            pitch: 1.05,
            output: 'audio-output-2.mp3',
            quality: 96.8,
            processingTime: 1.8,
            timestamp: '12분 전',
            insights: [
                {
                    id: 'insight-3',
                    type: 'articulation',
                    title: '명확한 발음',
                    description: '영어 단어의 명확한 발음과 강세',
                    confidence: 94.1,
                    value: 'clear_articulation'
                }
            ]
        },
        {
            id: 'task-3',
            text: 'AI音声合成システムへようこそ。このシステムは自然な音声生成を提供します。',
            voice: '田中花子',
            language: 'ja',
            speed: 0.95,
            pitch: 0.98,
            output: 'audio-output-3.mp3',
            quality: 92.5,
            processingTime: 2.3,
            timestamp: '25분 전',
            insights: [
                {
                    id: 'insight-4',
                    type: 'intonation',
                    title: '일본어 억양',
                    description: '일본어의 특유한 억양과 톤',
                    confidence: 93.2,
                    value: 'japanese_intonation'
                }
            ]
        }
    ]);

    const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([
        {
            id: 'model-1',
            name: '김지영',
            gender: 'female',
            language: 'ko',
            quality: 94.2,
            speed: 1.0,
            status: 'active',
            lastUpdated: '1일 전',
            usage: 2150,
            emotionSupport: true
        },
        {
            id: 'model-2',
            name: 'John Smith',
            gender: 'male',
            language: 'en',
            quality: 96.8,
            speed: 1.1,
            status: 'active',
            lastUpdated: '2일 전',
            usage: 1800,
            emotionSupport: true
        },
        {
            id: 'model-3',
            name: '田中花子',
            gender: 'female',
            language: 'ja',
            quality: 92.5,
            speed: 0.95,
            status: 'active',
            lastUpdated: '1주일 전',
            usage: 1650,
            emotionSupport: false
        },
        {
            id: 'model-4',
            name: 'Maria Garcia',
            gender: 'female',
            language: 'es',
            quality: 91.7,
            speed: 1.05,
            status: 'training',
            lastUpdated: '3일 전',
            usage: 950,
            emotionSupport: true
        }
    ]);

    const [synthesisSettings, setSynthesisSettings] = useState<SynthesisSettings>({
        enableRealTime: true,
        enableEmotionControl: true,
        enableProsodyControl: true,
        defaultLanguage: 'ko',
        defaultSpeed: 1.0,
        defaultPitch: 1.0,
        qualityLevel: 'high'
    });

    const [inputText, setInputText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('김지영');
    const [speed, setSpeed] = useState(1.0);
    const [pitch, setPitch] = useState(1.0);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [activeTab, setActiveTab] = useState<'synthesize' | 'tasks' | 'voices' | 'insights' | 'settings'>('synthesize');

    useEffect(() => {
        // 실시간 음성 합성 시뮬레이션
        const interval = setInterval(() => {
            const sampleTexts = [
                '실시간 음성 합성이 진행 중입니다.',
                'AI 시스템이 자연스러운 음성을 생성합니다.',
                '고품질 음성 합성 기술을 제공합니다.'
            ];

            const newTask: SynthesisTask = {
                id: `task-${Date.now()}`,
                text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
                voice: voiceModels[Math.floor(Math.random() * voiceModels.length)].name,
                language: 'ko',
                speed: Math.random() * 0.4 + 0.8,
                pitch: Math.random() * 0.4 + 0.8,
                output: `audio-output-${Date.now()}.mp3`,
                quality: Math.floor(Math.random() * 20) + 80,
                processingTime: Math.random() * 2 + 1,
                timestamp: '방금 전',
                insights: [
                    {
                        id: `insight-${Date.now()}`,
                        type: 'prosody',
                        title: '실시간 억양',
                        description: '실시간 음성 합성의 자연스러운 억양',
                        confidence: Math.floor(Math.random() * 20) + 80,
                        value: 'realtime_prosody'
                    }
                ]
            };

            setSynthesisTasks(prev => [newTask, ...prev.slice(0, 9)]);
        }, 15000);

        return () => clearInterval(interval);
    }, [voiceModels]);

    const synthesizeText = () => {
        if (!inputText.trim()) return;

        setIsSynthesizing(true);

        // 음성 합성 시뮬레이션
        setTimeout(() => {
            const newTask: SynthesisTask = {
                id: `task-${Date.now()}`,
                text: inputText,
                voice: selectedVoice,
                language: 'ko',
                speed: speed,
                pitch: pitch,
                output: `audio-output-${Date.now()}.mp3`,
                quality: Math.floor(Math.random() * 20) + 80,
                processingTime: Math.random() * 2 + 1,
                timestamp: '방금 전',
                insights: [
                    {
                        id: `insight-${Date.now()}`,
                        type: 'naturalness',
                        title: '자연스러운 음성',
                        description: '자연스러운 음성 합성 품질',
                        confidence: Math.floor(Math.random() * 20) + 80,
                        value: 'natural_speech'
                    }
                ]
            };

            setSynthesisTasks(prev => [newTask, ...prev]);
            setIsSynthesizing(false);
            setInputText('');
        }, 3000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'training': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getGenderIcon = (gender: string) => {
        switch (gender) {
            case 'male': return <UserIcon className="w-4 h-4" />;
            case 'female': return <UserIcon className="w-4 h-4" />;
            case 'neutral': return <UserIcon className="w-4 h-4" />;
            default: return <UserIcon className="w-4 h-4" />;
        }
    };

    const getQualityColor = (quality: number) => {
        if (quality >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (quality >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (quality >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <SpeakerWaveIcon className="w-5 h-5" />
                    <span>음성 합성</span>
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
                                <SpeakerWaveIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 음성 합성 시스템</h3>
                                <p className="text-gray-400 text-sm">텍스트를 자연스러운 음성으로 변환</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{synthesisTasks.length}개 작업</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                aria-label="음성 합성 시스템 닫기"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'synthesize', label: '합성', icon: SpeakerWaveIcon },
                        { id: 'tasks', label: '작업', icon: ClockIcon },
                        { id: 'voices', label: '음성', icon: UserIcon },
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
                    {activeTab === 'synthesize' && (
                        <div className="space-y-6">
                            {/* 음성 합성 인터페이스 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 합성</h4>

                                {/* 텍스트 입력 */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">합성할 텍스트</label>
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="음성으로 변환할 텍스트를 입력하세요..."
                                        className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>

                                {/* 음성 설정 */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">음성 선택</label>
                                        <select
                                            value={selectedVoice}
                                            onChange={(e) => setSelectedVoice(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            aria-label="음성 선택"
                                        >
                                            {voiceModels.map(voice => (
                                                <option key={voice.id} value={voice.name}>
                                                    {voice.name} ({voice.language})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">속도: {speed.toFixed(1)}x</label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2.0"
                                            step="0.1"
                                            value={speed}
                                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                            className="w-full"
                                            aria-label="음성 속도 조절"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">피치: {pitch.toFixed(1)}x</label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2.0"
                                            step="0.1"
                                            value={pitch}
                                            onChange={(e) => setPitch(parseFloat(e.target.value))}
                                            className="w-full"
                                            aria-label="음성 피치 조절"
                                        />
                                    </div>
                                </div>

                                {/* 합성 버튼 */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={synthesizeText}
                                        disabled={isSynthesizing || !inputText.trim()}
                                        className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        {isSynthesizing ? (
                                            <>
                                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                                <span>음성 합성 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <SpeakerWaveIcon className="w-5 h-5" />
                                                <span>음성 합성</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* 음성 품질 지표 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 품질 지표</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-emerald-600">94.2%</div>
                                        <div className="text-sm text-gray-600">평균 품질</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">1.8초</div>
                                        <div className="text-sm text-gray-600">평균 처리 시간</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">4개</div>
                                        <div className="text-sm text-gray-600">활성 음성</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">3개</div>
                                        <div className="text-sm text-gray-600">지원 언어</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 합성 작업</h4>
                                <div className="space-y-4">
                                    {synthesisTasks.map(task => (
                                        <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{task.voice}</h5>
                                                    <p className="text-sm text-gray-500">{task.timestamp} • {task.language}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getQualityColor(task.quality)}`}>
                                                    {task.quality}%
                                                </span>
                                            </div>
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-700 line-clamp-2">{task.text}</p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-gray-600">속도: {task.speed}x</span>
                                                    <span className="text-gray-600">피치: {task.pitch}x</span>
                                                    <span className="text-gray-600">처리시간: {task.processingTime.toFixed(1)}초</span>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                    재생
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'voices' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 모델</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {voiceModels.map(voice => (
                                        <div key={voice.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    {getGenderIcon(voice.gender)}
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{voice.name}</h5>
                                                        <p className="text-sm text-gray-500">{voice.gender} • {voice.language}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(voice.status)}`}>
                                                    {voice.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-sm mb-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">품질:</span>
                                                    <span className="font-semibold text-gray-900">{voice.quality}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">속도:</span>
                                                    <span className="font-semibold text-gray-900">{voice.speed}x</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">사용 횟수:</span>
                                                    <span className="font-semibold text-gray-900">{voice.usage.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">감정 지원:</span>
                                                    <span className="font-semibold text-gray-900">{voice.emotionSupport ? '예' : '아니오'}</span>
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 합성 인사이트</h4>
                                <div className="space-y-4">
                                    {synthesisTasks.flatMap(task => task.insights).map(insight => (
                                        <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                                </div>
                                                <span className="text-sm text-gray-500">{insight.confidence}%</span>
                                            </div>
                                            <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                                <strong>분석 결과:</strong> {insight.value}
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">음성 합성 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">실시간 합성</h5>
                                            <p className="text-sm text-gray-600">실시간 음성 합성 활성화</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${synthesisSettings.enableRealTime
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {synthesisSettings.enableRealTime ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">감정 제어</h5>
                                            <p className="text-sm text-gray-600">음성 감정 제어 활성화</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${synthesisSettings.enableEmotionControl
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {synthesisSettings.enableEmotionControl ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">품질 수준</h5>
                                            <p className="text-sm text-gray-600">음성 합성 품질 설정</p>
                                        </div>
                                        <select
                                            value={synthesisSettings.qualityLevel}
                                            onChange={(e) => setSynthesisSettings(prev => ({ ...prev, qualityLevel: e.target.value as any }))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            aria-label="음성 품질 수준 선택"
                                        >
                                            <option value="low">낮음</option>
                                            <option value="medium">보통</option>
                                            <option value="high">높음</option>
                                        </select>
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

export default AdvancedAIVoiceSynthesis; 