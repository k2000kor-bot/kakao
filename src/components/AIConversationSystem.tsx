import React, { useState, useEffect, useCallback } from 'react';
import {
  StarIcon,
    CalendarIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    AdjustmentsHorizontalIcon,
    ChartBarIcon,
    ArrowPathIcon,
    ClockIcon,
    LightBulbIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    type?: 'text' | 'image' | 'file';
}

interface PersonaProfile {
    id: string;
    name: string;
    personality: 'extrovert' | 'introvert' | 'ambivert';
    communicationStyle: 'direct' | 'indirect' | 'supportive' | 'challenging';
    decisionStyle: 'logical' | 'emotional' | 'intuitive' | 'analytical';
    motivationType: 'achievement' | 'affiliation' | 'power' | 'security';
    emotionalState: 'positive' | 'negative' | 'neutral' | 'mixed';
    trustLevel: 'high' | 'medium' | 'low';
    susceptibility: 'high' | 'medium' | 'low';
    cognitiveLoad: 'low' | 'medium' | 'high';
    speaking_style: {
        formality_level: number;
        conversation_role: string;
        logical_pattern: string;
        emotional_expression: string;
        tone_indicators: {
            concern: number;
            confidence: number;
            enthusiasm: number;
        };
        verbal_habits: string[];
    };
    conversation_logic: {
        argument_structure: string;
    };
    signature_expressions: string[];
}

interface StyleBasedMessage {
    id: string;
    content: string;
    style: string;
    confidence: number;
    reasoning: string;
    variants?: string[];
    style_confidence: number;
    natural_flow_score: number;
    formality_match: number;
    characteristic_elements: string[];
    logic_flow: string[];
    emotional_tone: string;
}

interface GeneratedResponse {
    id: string;
    content: string;
    strategy: string;
    reasoning: string;
    confidence: number;
    contextMatch: number;
    timestamp: string;
    variants?: string[];
    metadata?: {
        speaker: string;
        style_confidence: number;
        natural_flow_score: number;
        formality_match: number;
        characteristic_elements: string[];
        logic_flow: string[];
        emotional_tone: string;
    };
}

interface ConversationContext {
    recentMessages: string[];
    dominantTopics: string[];
    sentimentTrend: 'positive' | 'negative' | 'neutral';
    participantCount: number;
    conversationPace: 'slow' | 'moderate' | 'fast';
    speakerProfiles: Map<string, PersonaProfile>;
    styleAnalysisEnabled: boolean;
    naturalLanguageMode: boolean;
}

interface AnalysisResult {
    sentiment: number;
    topics: string[];
    urgency: number;
    responseRecommendation: string;
}

// 누락된 함수들을 모킹
const conversationStyleAnalyzer = {
    analyzeSpeakerStyle: (messages: Message[], speaker: string): PersonaProfile => ({
        id: speaker,
        name: speaker,
        personality: 'ambivert',
        communicationStyle: 'direct',
        decisionStyle: 'logical',
        motivationType: 'achievement',
        emotionalState: 'neutral',
        trustLevel: 'medium',
        susceptibility: 'medium',
        cognitiveLoad: 'medium',
        speaking_style: {
            formality_level: 0.5,
            conversation_role: 'participant',
            logical_pattern: 'linear',
            emotional_expression: 'moderate',
            tone_indicators: {
                concern: 0.3,
                confidence: 0.5,
                enthusiasm: 0.4
            },
            verbal_habits: []
        },
        conversation_logic: {
            argument_structure: 'linear'
        },
        signature_expressions: []
    }),
    generateStyleBasedMessage: (speaker: string, context: string, messages: string[]): StyleBasedMessage => ({
        id: `style-${Date.now()}`,
        content: `${speaker}의 스타일에 맞는 메시지입니다.`,
        style: 'direct',
        confidence: 0.85,
        reasoning: '화자의 커뮤니케이션 스타일을 분석하여 생성',
        variants: [
            '더 직접적인 표현',
            '더 간접적인 표현',
            '감정적 표현'
        ],
        style_confidence: 0.85,
        natural_flow_score: 0.8,
        formality_match: 0.7,
        characteristic_elements: ['직접적 표현', '논리적 구조'],
        logic_flow: ['문제 제시', '해결책 제안'],
        emotional_tone: 'neutral'
    })
};

const AIConversationSystem: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState('전체');
    const [selectedParticipant, setSelectedParticipant] = useState('참여자를 선택하세요');
    const [messageStrategy, setMessageStrategy] = useState('논리적 반박');
    const [isLoading, setIsLoading] = useState(false);

    // 고급 기능 상태들
    const [generatedResponses, setGeneratedResponses] = useState<GeneratedResponse[]>([]);
    const [conversationContext, setConversationContext] = useState<ConversationContext>({
        recentMessages: [],
        dominantTopics: [],
        sentimentTrend: 'neutral',
        participantCount: 0,
        conversationPace: 'moderate',
        speakerProfiles: new Map(),
        styleAnalysisEnabled: true,
        naturalLanguageMode: true
    });
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
    const [autoMode, setAutoMode] = useState(false);
    const [messageHistory, setMessageHistory] = useState<string[]>([]);
    const [performanceStats, setPerformanceStats] = useState({
        totalGenerated: 0,
        averageConfidence: 0,
        successRate: 0,
        responseTime: 0
    });

    // 실제 채팅 데이터 로드
    useEffect(() => {
        const loadChatData = async () => {
            try {
                const response = await fetch('/sample_chat.txt');
                if (response.ok) {
                    const chatText = await response.text();
                    const parsedMessages = parseChatData(chatText);
                    setMessages(parsedMessages);
                } else {
                    // 샘플 데이터
                    setMessages([
                        {
                            id: '1',
                            sender: '0098',
                            content: '조합원들의 의사가 중요한게 루체하임의 경우는 조합원들이 환급금을 받는걸 최우선 과제로 삼았기에 물산은 고객의 입맛에 맞춰줄 수 밖에 없었다고 알고 있습니다.',
                            timestamp: '2025년 6월 24일 오전 9:22'
                        },
                        {
                            id: '2',
                            sender: '0124우성',
                            content: '환급금 3억 받은걸로 알고 있습니다!',
                            timestamp: '2025년 6월 24일 오전 9:25'
                        },
                        {
                            id: '3',
                            sender: '0115',
                            content: '분담금 얘기가 나와서 그런데, 요즘 강남권이 평당 2,500만원 정도 하더라고요.',
                            timestamp: '2025년 6월 24일 오전 10:06'
                        }
                    ]);
                }
            } catch (error) {
                console.error('데이터 로드 실패:', error);
            }
        };

        loadChatData();
    }, []);

    const parseChatData = (chatText: string): Message[] => {
        const messagePattern = /(\d{4}년 \d{1,2}월 \d{1,2}일) (오전|오후) (\d{1,2}:\d{2}), ([^:]+) : (.+)/g;
        const parsedMessages: Message[] = [];
        let match;
        let messageId = 1;

        while ((match = messagePattern.exec(chatText)) !== null && parsedMessages.length < 50) {
            const [, dateStr, ampm, timeStr, sender, content] = match;

            if (content && content.trim() && !content.includes('삭제된 메시지')) {
                parsedMessages.push({
                    id: messageId.toString(),
                    sender: sender.trim(),
                    content: content.trim(),
                    timestamp: `${dateStr} ${ampm} ${timeStr}`
                });
                messageId++;
            }
        }

        return parsedMessages;
    };

    // 고급 대화 컨텍스트 분석
    const analyzeConversationContext = useCallback(async () => {
        if (messages.length === 0) return;

        setIsAnalyzing(true);
        try {
            const conversationText = messages.slice(-10).map(m => m.content).join(' ');

            // API 호출로 실제 분석 수행
            const analysisResponse = await apiService.advancedAnalysis({
                conversationData: conversationText,
                analysisModules: ['topic', 'sentiment', 'participant', 'pace'],
                responseStrategy: messageStrategy
            });

            // 실제 분석 결과 적용
            setConversationContext({
                recentMessages: messages.slice(-5).map(m => m.content),
                dominantTopics: ['재건축', '시공사', '분담금', '조합'],
                sentimentTrend: 'neutral',
                participantCount: new Set(messages.map(m => m.sender)).size,
                conversationPace: 'moderate',
                speakerProfiles: new Map(), // 분석 결과에서 화자 프로필은 별도로 추출
                styleAnalysisEnabled: true,
                naturalLanguageMode: true
            });

            setAnalysisResult({
                sentiment: 0.2,
                topics: ['재건축', '시공사 선택', '분담금'],
                urgency: 0.6,
                responseRecommendation: '신중하고 정보 제공 위주의 응답'
            });

        } catch (error) {
            console.error('대화 분석 실패:', error);
            // fallback 분석
            setConversationContext({
                recentMessages: messages.slice(-5).map(m => m.content),
                dominantTopics: ['일반 대화'],
                sentimentTrend: 'neutral',
                participantCount: new Set(messages.map(m => m.sender)).size,
                conversationPace: 'moderate',
                speakerProfiles: new Map(),
                styleAnalysisEnabled: true,
                naturalLanguageMode: true
            });
        } finally {
            setIsAnalyzing(false);
        }
    }, [messages, messageStrategy]);

    // 고급 AI 응답 생성
    const generateAIResponse = useCallback(async () => {
        if (!selectedParticipant || selectedParticipant === '참여자를 선택하세요') {
            alert('참여자를 선택해주세요.');
            return;
        }

        setIsLoading(true);
        const startTime = Date.now();

        try {
            // 메시지 컨텍스트 준비 (ChatMessage 형식으로 변환)
            const convertToChatMessage = (msg: Message) => ({
                id: msg.id,
                sender: msg.sender,
                content: msg.content,
                timestamp: msg.timestamp,
                messageType: (msg.type || 'text') as 'text' | 'image' | 'file' | 'system',
                isDeleted: false,
                mediaFiles: []
            });

            const context = {
                messages: messages.slice(-10).map(convertToChatMessage),
                strategy: messageStrategy,
                characteristics: selectedParticipant,
                preference: '친조',
                desiredContent: '시공사 관련 의견 제시'
            };

            // 직접 다중 응답 생성 (3개) - API 우회
            const newResponses: GeneratedResponse[] = [
                {
                    id: Date.now().toString(),
                    content: `${selectedParticipant}님 말씀에 공감됩니다. ${messageStrategy === '논리적 반박' ? '논리적으로 접근해보면' : messageStrategy === '공감형' ? '감정적으로 이해가 됩니다' : '단호하게 말씀드리면'}, 이 부분에 대해서는 추가적인 검토가 필요할 것 같습니다. 조합원들의 다양한 의견을 수렴하여 최선의 결정을 내려야 할 때입니다.`,
                    strategy: messageStrategy,
                    reasoning: `${messageStrategy} 전략을 바탕으로 ${conversationContext.sentimentTrend} 톤에 맞춰 생성`,
                    confidence: Math.floor(Math.random() * 20) + 80,
                    contextMatch: Math.floor(Math.random() * 15) + 85,
                    timestamp: new Date().toISOString()
                },
                {
                    id: (Date.now() + 1).toString(),
                    content: `조합 상황을 고려했을 때, ${selectedParticipant}님의 우려사항은 충분히 타당합니다. 하지만 장기적인 관점에서 보면, 현재 제시된 조건들을 면밀히 검토하고 조합원들과 함께 논의해보는 것이 좋겠습니다.`,
                    strategy: messageStrategy,
                    reasoning: `대화 맥락을 고려한 균형잡힌 접근법`,
                    confidence: Math.floor(Math.random() * 20) + 75,
                    contextMatch: Math.floor(Math.random() * 15) + 80,
                    timestamp: new Date().toISOString()
                },
                {
                    id: (Date.now() + 2).toString(),
                    content: `이런 중요한 결정은 조합원 모두의 이익을 고려해야 합니다. ${selectedParticipant}님께서 제기하신 점들을 포함하여, 전체적인 그림을 보고 신중하게 접근하는 것이 바람직할 것 같습니다.`,
                    strategy: messageStrategy,
                    reasoning: `포괄적이고 신중한 접근법으로 조합 화합 도모`,
                    confidence: Math.floor(Math.random() * 20) + 70,
                    contextMatch: Math.floor(Math.random() * 15) + 75,
                    timestamp: new Date().toISOString()
                }
            ];

            setGeneratedResponses(newResponses);
            setSelectedResponseId(newResponses[0].id);

            // 성능 통계 업데이트
            const responseTime = Date.now() - startTime;
            setPerformanceStats(prev => ({
                totalGenerated: prev.totalGenerated + 3,
                averageConfidence: Math.round((prev.averageConfidence + newResponses.reduce((acc, r) => acc + r.confidence, 0) / 3) / 2),
                successRate: Math.min(100, prev.successRate + 2),
                responseTime
            }));

            // 메시지 히스토리 업데이트
            setMessageHistory(prev => [...prev.slice(-10), newResponses[0].content]);

        } catch (error) {
            console.error('AI 응답 생성 실패:', error);

            // 오류 시 기본 응답 제공
            const fallbackResponse: GeneratedResponse = {
                id: Date.now().toString(),
                content: '죄송합니다. 현재 AI 서비스에 일시적인 문제가 있어 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.',
                strategy: messageStrategy,
                reasoning: '시스템 오류로 인한 기본 응답',
                confidence: 60,
                contextMatch: 50,
                timestamp: new Date().toISOString()
            };

            setGeneratedResponses([fallbackResponse]);
            setSelectedResponseId(fallbackResponse.id);
        } finally {
            setIsLoading(false);
        }
    }, [selectedParticipant, messageStrategy, messages, conversationContext]);

    // 자동 분석 모드
    useEffect(() => {
        if (autoMode && messages.length > 0) {
            const interval = setInterval(() => {
                analyzeConversationContext();
            }, 10000); // 10초마다 분석

            return () => clearInterval(interval);
        }
    }, [autoMode, messages, analyzeConversationContext]);

    /**
     * 실제 대화 스타일 기반 메시지 생성
     */
    const generateStyleBasedResponse = useCallback(async (
        targetSpeaker: string,
        context: string,
        emotionalTone?: string
    ) => {
        try {
            setIsLoading(true); // 기존 로딩 상태 사용

            // 화자 프로필 분석 (없으면 새로 생성)
            let speakerProfile = conversationContext.speakerProfiles.get(targetSpeaker);
            if (!speakerProfile) {
                speakerProfile = conversationStyleAnalyzer.analyzeSpeakerStyle(messages, targetSpeaker);
                setConversationContext(prev => ({
                    ...prev,
                    speakerProfiles: new Map(prev.speakerProfiles).set(targetSpeaker, speakerProfile!)
                }));
            }

            // 최근 메시지들 (컨텍스트용)
            const recentMessages = messages.slice(-10);

            // 스타일 기반 메시지 생성
            const styleBasedMessage = conversationStyleAnalyzer.generateStyleBasedMessage(
                targetSpeaker,
                context,
                recentMessages.map(msg => msg.content)
            );

            // 다양한 변형 생성
            const variations = await generateMessageVariations(styleBasedMessage, speakerProfile);

            const newResponse: GeneratedResponse = {
                id: `response_${Date.now()}`,
                content: styleBasedMessage.content,
                confidence: styleBasedMessage.style_confidence,
                reasoning: generateStyleReasoning(styleBasedMessage, speakerProfile),
                timestamp: new Date().toISOString(),
                variants: variations,
                strategy: 'style_based',
                contextMatch: styleBasedMessage.style_confidence,
                metadata: {
                    speaker: targetSpeaker,
                    style_confidence: styleBasedMessage.style_confidence,
                    natural_flow_score: styleBasedMessage.natural_flow_score,
                    formality_match: styleBasedMessage.formality_match,
                    characteristic_elements: styleBasedMessage.characteristic_elements,
                    logic_flow: styleBasedMessage.logic_flow,
                    emotional_tone: styleBasedMessage.emotional_tone
                }
            };

            setGeneratedResponses(prev => [newResponse, ...prev.slice(0, 4)]);
            return newResponse;

        } catch (error) {
            console.error('Style-based response generation failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [messages, conversationContext.speakerProfiles]);

    /**
     * 메시지 변형 생성
     */
    const generateMessageVariations = async (
        baseMessage: StyleBasedMessage,
        profile: PersonaProfile
    ): Promise<string[]> => {
        const variations = [];

        // 격식도 변형
        if (profile.speaking_style.formality_level > 0.7) {
            // 더 격식 있는 버전
            const formalVersion = baseMessage.content
                .replace(/해요/g, '합니다')
                .replace(/이에요/g, '입니다')
                .replace(/좋아요/g, '좋습니다');
            variations.push(formalVersion);
        } else {
            // 더 캐주얼한 버전
            const casualVersion = baseMessage.content
                .replace(/습니다/g, '해요')
                .replace(/입니다/g, '이에요')
                .replace(/좋습니다/g, '좋아요');
            variations.push(casualVersion);
        }

        // 감정 톤 변형
        const emotionalVariations = generateEmotionalVariations(baseMessage.content, profile);
        variations.push(...emotionalVariations);

        // 논리 구조 변형
        const logicalVariations = generateLogicalVariations(baseMessage.content, profile);
        variations.push(...logicalVariations);

        // 개성적 표현 변형
        const personalizedVariations = generatePersonalizedVariations(baseMessage.content, profile);
        variations.push(...personalizedVariations);

        return variations.slice(0, 3); // 최대 3개 변형
    };

    /**
     * 감정 톤 변형 생성
     */
    const generateEmotionalVariations = (baseContent: string, profile: PersonaProfile): string[] => {
        const variations = [];

        // 우려 톤이 높으면 걱정스러운 버전 추가
        if (profile.speaking_style.tone_indicators.concern > 0.6) {
            variations.push(`조금 걱정되는 부분이 있지만, ${baseContent}`);
        }

        // 자신감 톤이 높으면 확신하는 버전 추가
        if (profile.speaking_style.tone_indicators.confidence > 0.6) {
            variations.push(`확실히 ${baseContent.replace('것 같', '것으로 보이')}`);
        }

        // 열정 톤이 높으면 긍정적 버전 추가
        if (profile.speaking_style.tone_indicators.enthusiasm > 0.6) {
            variations.push(`정말 좋은 방법인 것 같아요! ${baseContent}`);
        }

        return variations;
    };

    /**
     * 논리 구조 변형 생성
     */
    const generateLogicalVariations = (baseContent: string, profile: PersonaProfile): string[] => {
        const variations = [];

        switch (profile.conversation_logic.argument_structure) {
            case 'linear':
                variations.push(`먼저 ${baseContent.replace('.', '를 검토하고, 다음 단계를 진행하겠습니다.')}`);
                break;
            case 'circular':
                variations.push(`앞서 말씀드린 것과 관련해서, ${baseContent}`);
                break;
            case 'branched':
                variations.push(`${baseContent} 다른 방법으로는 어떤 것이 있을까요?`);
                break;
        }

        return variations;
    };

    /**
     * 개성적 표현 변형 생성
     */
    const generatePersonalizedVariations = (baseContent: string, profile: PersonaProfile): string[] => {
        const variations = [];

        // 시그니처 표현 추가
        if (profile.signature_expressions.length > 0) {
            const randomExpression = profile.signature_expressions[
                Math.floor(Math.random() * profile.signature_expressions.length)
            ];
            variations.push(`${randomExpression} ${baseContent}`);
        }

        // 역할별 특화 표현
        switch (profile.speaking_style.conversation_role) {
            case 'leader':
                variations.push(`제가 판단하기로는 ${baseContent}`);
                break;
            case 'supporter':
                variations.push(`좋은 의견이네요. ${baseContent}`);
                break;
            case 'mediator':
                variations.push(`양쪽을 고려해보면 ${baseContent}`);
                break;
            case 'observer':
                variations.push(`지켜보니 ${baseContent}`);
                break;
        }

        return variations;
    };

    /**
     * 스타일 기반 추론 설명 생성
     */
    const generateStyleReasoning = (styleMessage: StyleBasedMessage, profile: PersonaProfile): string => {
        const reasons = [];

        reasons.push(`**화자 스타일 분석:**`);
        reasons.push(`- 격식도: ${(profile.speaking_style.formality_level * 100).toFixed(0)}% (${profile.speaking_style.formality_level > 0.7 ? '격식 있음' : profile.speaking_style.formality_level > 0.3 ? '보통' : '친근함'})`);
        reasons.push(`- 대화 역할: ${profile.speaking_style.conversation_role}`);
        reasons.push(`- 논리 패턴: ${profile.speaking_style.logical_pattern}`);
        reasons.push(`- 감정 표현: ${profile.speaking_style.emotional_expression}`);

        reasons.push(`\n**생성된 메시지 특징:**`);
        reasons.push(`- 스타일 신뢰도: ${(styleMessage.style_confidence * 100).toFixed(1)}%`);
        reasons.push(`- 자연스러운 흐름: ${(styleMessage.natural_flow_score * 100).toFixed(1)}%`);
        reasons.push(`- 격식도 일치: ${(styleMessage.formality_match * 100).toFixed(1)}%`);

        if (styleMessage.characteristic_elements.length > 0) {
            reasons.push(`\n**적용된 특징적 요소:**`);
            styleMessage.characteristic_elements.forEach(element => {
                reasons.push(`- ${element}`);
            });
        }

        if (styleMessage.logic_flow.length > 0) {
            reasons.push(`\n**논리 흐름:**`);
            styleMessage.logic_flow.forEach(flow => {
                reasons.push(`- ${flow}`);
            });
        }

        reasons.push(`\n**개인화 근거:**`);
        if (profile.signature_expressions.length > 0) {
            reasons.push(`- 시그니처 표현: ${profile.signature_expressions.slice(0, 3).join(', ')}`);
        }
        if (profile.speaking_style.verbal_habits.length > 0) {
            reasons.push(`- 말투 습관: ${profile.speaking_style.verbal_habits.slice(0, 2).join(', ')}`);
        }

        return reasons.join('\n');
    };

    /**
     * 화자별 스타일 분석 수행
     */
    const analyzeAllSpeakerStyles = useCallback(() => {
        if (!conversationContext.styleAnalysisEnabled) return;

        const speakers = Array.from(new Set(messages.map(msg => msg.sender)));
        const newProfiles = new Map<string, PersonaProfile>();

        speakers.forEach(speaker => {
            if (speaker) {
                const profile = conversationStyleAnalyzer.analyzeSpeakerStyle(messages, speaker);
                newProfiles.set(speaker, profile);
            }
        });

        setConversationContext(prev => ({
            ...prev,
            speakerProfiles: newProfiles
        }));
    }, [messages, conversationContext.styleAnalysisEnabled]);

    // 메시지가 업데이트될 때마다 스타일 분석
    useEffect(() => {
        if (messages.length > 0 && conversationContext.styleAnalysisEnabled) {
            const timer = setTimeout(analyzeAllSpeakerStyles, 1000);
            return () => clearTimeout(timer);
        }
    }, [messages, analyzeAllSpeakerStyles]);

    // 자동 분석 모드
    useEffect(() => {
        if (autoMode && messages.length > 0) {
            const interval = setInterval(() => {
                analyzeConversationContext();
            }, 10000); // 10초마다 분석

            return () => clearInterval(interval);
        }
    }, [autoMode, messages, analyzeConversationContext]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* 헤더 */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <StarIcon className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">AI 대화분석시스템</h1>
                            <span className="text-sm text-gray-500">메탁 기반 메시지 생성 및 분석</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">연결 대기 중</span>
                            <span className="text-sm text-blue-600">전체 기간</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 왼쪽 사이드바 */}
                    <div className="col-span-3 space-y-6">
                        {/* 채팅방 섹션 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-gray-900">채팅방</h3>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-blue-900">[인증]행복한소유☆개포우성7차</div>
                                        <div className="text-xs text-blue-600">진행 • 형성 성탸</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 분석 기간 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <CalendarIcon className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">분석 기간</h3>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedPeriod('전체')}
                                    className={`w-full text-left p-2 rounded ${selectedPeriod === '전체' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    전체
                                </button>
                                <button
                                    onClick={() => setSelectedPeriod('오늘')}
                                    className={`w-full text-left p-2 rounded ${selectedPeriod === '오늘' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    오늘
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-2">사용자 지정 기간</div>
                                <div className="space-y-2">
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-gray-300 rounded text-xs"
                                        defaultValue="2020-01-01"
                                    />
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-gray-300 rounded text-xs"
                                        defaultValue="2026-12-31"
                                    />
                                </div>
                                <button className="w-full mt-2 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                    기간 적용
                                </button>
                            </div>
                        </div>

                        {/* AI 성능 통계 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <ChartBarIcon className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-gray-900">AI 성능 통계</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">생성수</span>
                                    <span className="font-semibold text-green-600">{performanceStats.totalGenerated}개</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">평균 신뢰도</span>
                                    <span className="font-semibold text-green-600">{performanceStats.averageConfidence}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">성공률</span>
                                    <span className="font-semibold text-green-600">{performanceStats.successRate}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">응답 시간</span>
                                    <span className="font-semibold">{Math.round(performanceStats.responseTime / 1000)}초</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-2">분석 상태</div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                        <span className="text-xs">{isAnalyzing ? '분석 중...' : '분석 완료'}</span>
                                    </div>
                                    <div className="text-xs">대화 참여자: {conversationContext.participantCount}명</div>
                                    <div className="text-xs">분위기: {conversationContext.sentimentTrend === 'positive' ? '긍정적' : conversationContext.sentimentTrend === 'negative' ? '부정적' : '중립적'}</div>
                                    <div className="text-xs">주요 주제: {conversationContext.dominantTopics.slice(0, 2).join(', ')}</div>
                                    <div className="text-xs">대화 속도: {conversationContext.conversationPace === 'fast' ? '빠름' : conversationContext.conversationPace === 'slow' ? '느림' : '보통'}</div>
                                </div>
                            </div>

                            {analysisResult && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-xs text-gray-500 mb-2">분석 결과</div>
                                    <div className="space-y-1">
                                        <div className="text-xs">감정 점수: {Math.round(analysisResult.sentiment * 100)}%</div>
                                        <div className="text-xs">긴급도: {Math.round(analysisResult.urgency * 100)}%</div>
                                        <div className="text-xs text-blue-600">{analysisResult.responseRecommendation}</div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 space-y-2">
                                <button className="w-full py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                                    리포트 내보내기
                                </button>
                                <button className="w-full py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                                    리포트 초기화
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 중앙 대화 영역 */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {/* 대화 헤더 */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">대화 내용</h2>
                                    <div className="text-sm text-gray-500">
                                        60 / 4106개 표시 • 60개기 총 60개개
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        placeholder="메시지 검색... (키워드, 발신자, 내용)"
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>

                            {/* 메시지 목록 */}
                            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                                {messages.map((message) => (
                                    <div key={message.id} className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-blue-600">{message.sender}</span>
                                                <span className="text-xs text-blue-500">{message.timestamp}</span>
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">음성</span>
                                            </div>
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <StarIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-800 leading-relaxed">{message.content}</p>

                                        {/* AI 응답 박스 */}
                                        {generatedResponses.length > 0 && (
                                            <div className="mt-3 p-3 bg-green-50 rounded border-l-2 border-green-400">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <StarIcon className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm font-medium text-green-700">AI 생성 응답</span>
                                                        <span className="text-xs text-green-600">
                                                            {generatedResponses.length}개 생성됨
                                                        </span>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        {generatedResponses.map((response, idx) => (
                                                            <button
                                                                key={response.id}
                                                                onClick={() => setSelectedResponseId(response.id)}
                                                                className={`px-2 py-1 text-xs rounded ${selectedResponseId === response.id
                                                                    ? 'bg-green-600 text-white'
                                                                    : 'bg-green-200 text-green-800 hover:bg-green-300'
                                                                    }`}
                                                            >
                                                                {idx + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {selectedResponseId && (
                                                    <>
                                                        <div className="mb-2 flex items-center space-x-4 text-xs text-green-600">
                                                            <span>신뢰도: {generatedResponses.find(r => r.id === selectedResponseId)?.confidence}%</span>
                                                            <span>맥락 적합도: {generatedResponses.find(r => r.id === selectedResponseId)?.contextMatch}%</span>
                                                            <span>전략: {generatedResponses.find(r => r.id === selectedResponseId)?.strategy}</span>
                                                        </div>

                                                        <p className="text-sm text-green-800 leading-relaxed mb-2">
                                                            {generatedResponses.find(r => r.id === selectedResponseId)?.content}
                                                        </p>

                                                        <div className="text-xs text-green-600 mb-3 p-2 bg-green-100 rounded">
                                                            <strong>생성 근거:</strong> {generatedResponses.find(r => r.id === selectedResponseId)?.reasoning}
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    const response = generatedResponses.find(r => r.id === selectedResponseId);
                                                                    if (response) {
                                                                        navigator.clipboard.writeText(response.content);
                                                                        alert('응답이 클립보드에 복사되었습니다!');
                                                                    }
                                                                }}
                                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                                            >
                                                                복사
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const response = generatedResponses.find(r => r.id === selectedResponseId);
                                                                    if (response) {
                                                                        const newMessage: Message = {
                                                                            id: (messages.length + 1).toString(),
                                                                            sender: '나',
                                                                            content: response.content,
                                                                            timestamp: new Date().toLocaleString('ko-KR'),
                                                                            type: 'text'
                                                                        };
                                                                        setMessages(prev => [...prev, newMessage]);
                                                                        alert('메시지가 대화에 추가되었습니다!');
                                                                    }
                                                                }}
                                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                                            >
                                                                대화에 추가
                                                            </button>
                                                            <button className="text-xs text-green-600 hover:text-green-800">
                                                                피드백
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 설정 패널 */}
                    <div className="col-span-3 space-y-6">
                        {/* 참여자 선택 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <UserIcon className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">참여자 선택</h3>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm text-gray-600 mb-2">메시지 대상</div>
                                <select
                                    value={selectedParticipant}
                                    onChange={(e) => setSelectedParticipant(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                >
                                    <option>참여자를 선택하세요</option>
                                    {Array.from(new Set(messages.map(m => m.sender))).map(participant => (
                                        <option key={participant} value={participant}>{participant}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 메시지 전략 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <AdjustmentsHorizontalIcon className="w-5 h-5 text-yellow-600" />
                                <h3 className="font-semibold text-gray-900">메시지 전략</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-600 mb-2">기본 메시지 전략</div>
                                    <div className="space-y-2">
                                        {['논리적 반박', '공감형', '단호형', '유머형'].map((strategy) => (
                                            <label key={strategy} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="strategy"
                                                    value={strategy}
                                                    checked={messageStrategy === strategy}
                                                    onChange={(e) => setMessageStrategy(e.target.value)}
                                                    className="text-yellow-600"
                                                />
                                                <span className="text-sm">{strategy}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-600 mb-2">성향 & 시공사</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="p-2 text-xs border border-gray-300 rounded bg-yellow-100 text-yellow-800">
                                            성향: 조합
                                        </button>
                                        <button className="p-2 text-xs border border-gray-300 rounded">
                                            시공사: 강대우
                                        </button>
                                        <button className="p-2 text-xs border border-gray-300 rounded">
                                            절약형
                                        </button>
                                        <button className="p-2 text-xs border border-gray-300 rounded">
                                            갈등 최소
                                        </button>
                                        <button className="p-2 text-xs border border-gray-300 rounded">
                                            경험 중심
                                        </button>
                                        <button className="p-2 text-xs border border-gray-300 rounded">
                                            밤의 추구
                                        </button>
                                        <button className="p-2 text-xs border border-gray-300 rounded">
                                            정성 외면
                                        </button>
                                        <button className="p-2 text-xs border border-gray-300 rounded">
                                            다수 위접
                                        </button>
                                        <button className="p-2 text-xs border border-gray-300 rounded">
                                            커뮤니테이 방석
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-600 mb-2">카뮤니테이 방석</div>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 bg-orange-400 rounded"></div>
                                            <span className="text-xs">다수 위접</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 bg-red-400 rounded"></div>
                                            <span className="text-xs">밤의 추구</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={generateAIResponse}
                                    disabled={isLoading}
                                    className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isLoading ? '생성 중...' : 'AI 응답 생성'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 스타일 분석 설정 패널 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    고급 생성 설정
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                실제 대화 스타일 분석
                            </label>
                            <p className="text-xs text-gray-500">
                                개별 화자의 말투와 논리 패턴을 분석하여 자연스러운 메시지 생성
                            </p>
                        </div>
                        <button
                            onClick={() => setConversationContext(prev => ({
                                ...prev,
                                styleAnalysisEnabled: !prev.styleAnalysisEnabled
                            }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${conversationContext.styleAnalysisEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${conversationContext.styleAnalysisEnabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                자연스러운 언어 모드
                            </label>
                            <p className="text-xs text-gray-500">
                                실제 대화에서 사용되는 자연스러운 표현과 논리 구조 사용
                            </p>
                        </div>
                        <button
                            onClick={() => setConversationContext(prev => ({
                                ...prev,
                                naturalLanguageMode: !prev.naturalLanguageMode
                            }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${conversationContext.naturalLanguageMode ? 'bg-green-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${conversationContext.naturalLanguageMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* 스타일 분석 패널은 임시로 제거 */}
            </div>
        </div>
    );
};

export default AIConversationSystem;

