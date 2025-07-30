import React, { useState, useEffect, useCallback } from 'react';
import {
    SparklesIcon,
    CpuChipIcon,
    LightBulbIcon,
    CogIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    FireIcon,
    StarIcon,
    HeartIcon,
    RocketLaunchIcon,
    BeakerIcon,
    ChartBarIcon,
    EyeIcon,
    BoltIcon,
    MegaphoneIcon
} from '@heroicons/react/24/outline';

interface UltraAdvancedMessageGeneratorProps {
    selectedRoomId: string;
}

interface AdvancedGenerationSettings {
    // 기본 설정
    tone: string;
    length: string;
    emotion: string;
    context: string;
    style: string;
    formality: string;

    // 고급 설정
    personality: string;
    urgency: string;
    complexity: string;
    creativity: string;
    empathy: string;
    humor: string;

    // AI 모델 설정
    aiModel: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;

    // 컨텍스트 설정
    conversationHistory: boolean;
    userProfile: boolean;
    topicAnalysis: boolean;
    sentimentAnalysis: boolean;
    responsePattern: boolean;

    // 실시간 학습 설정
    adaptiveLearning: boolean;
    personalizationLevel: string;
    learningRate: number;
    memoryRetention: number;

    // 강화된 기능들
    multiModelCollaboration: boolean;
    realTimeEmotionAdaptation: boolean;
    contextOptimization: boolean;
    behaviorPatternLearning: boolean;
    qualityPrediction: boolean;
    abTesting: boolean;
    realTimeFeedback: boolean;
    predictiveAnalysis: boolean;
    emotionalIntelligence: boolean;
    conversationFlowOptimization: boolean;
    writingStyleAnalysis: boolean;
    vocabularyEnhancement: boolean;
    grammarStructureCheck: boolean;
    expressionImprovement: boolean;
    sentenceLengthOptimization: boolean;
    keywordDensityAnalysis: boolean;
    emotionalExpressionEnhancement: boolean;
    clarityPrecisionImprovement: boolean;
    sentenceStructureAnalysis: boolean;
    toneConsistencyCheck: boolean;
    logicalFlowAnalysis: boolean;
    emotionalImpactMeasurement: boolean;

    // 다양한 글쓰기 스타일 분석
    appealLetterAnalysis: boolean;
    columnAnalysis: boolean;
    counterArgumentAnalysis: boolean;
    urgentAppealAnalysis: boolean;
}

interface GeneratedMessage {
    id: string;
    content: string;
    quality: number;
    confidence: number;
    processingTime: number;
    aiInsights: string;
    alternatives: string[];
    context: {
        detectedEmotion: string;
        conversationTone: string;
        userIntent: string;
        suggestedTopics: string[];
        learningInsights: string[];
        personalizationScore: number;
        emotionalIntelligence: number;
        conversationFlow: string;
        predictiveAccuracy: number;
        behaviorPattern: string;
        qualityPrediction: number;
        abTestResult: string;
    };
    metadata: {
        model: string;
        settings: AdvancedGenerationSettings;
        timestamp: Date;
        learningData: {
            userPreference: string;
            effectivenessScore: number;
            adaptationLevel: string;
            emotionalResponse: string;
            behaviorChange: string;
            qualityTrend: string;
        };
        collaborationData: {
            primaryModel: string;
            secondaryModels: string[];
            consensusScore: number;
            modelAgreement: number;
        };
    };
}

interface ConversationContext {
    recentMessages: string[];
    userProfile: {
        name: string;
        preferences: string[];
        communicationStyle: string;
        learningHistory: {
            effectiveResponses: string[];
            ineffectiveResponses: string[];
            preferredTones: string[];
            avoidedTopics: string[];
            emotionalPatterns: string[];
            behaviorChanges: string[];
            qualityPreferences: string[];
        };
        emotionalState: {
            currentMood: string;
            stressLevel: number;
            engagementLevel: number;
            satisfactionScore: number;
        };
        behaviorPatterns: {
            responseTime: number;
            messageLength: number;
            emojiUsage: string;
            topicPreferences: string[];
            interactionStyle: string;
        };
    };
    conversationTone: string;
    detectedTopics: string[];
    sentimentScore: number;
    learningProgress: {
        totalInteractions: number;
        successRate: number;
        adaptationSpeed: number;
        personalizationLevel: string;
        emotionalIntelligence: number;
        qualityImprovement: number;
        behaviorLearning: number;
    };
    predictiveData: {
        nextMessageProbability: number;
        userSatisfactionPrediction: number;
        conversationContinuation: number;
        emotionalResponsePrediction: string;
    };
}

const UltraAdvancedMessageGenerator: React.FC<UltraAdvancedMessageGeneratorProps> = ({ selectedRoomId }) => {
    const [inputMessage, setInputMessage] = useState('');
    const [settings, setSettings] = useState<AdvancedGenerationSettings>({
        // 기본 설정
        tone: 'friendly',
        length: 'medium',
        emotion: 'neutral',
        context: 'general',
        style: 'conversational',
        formality: 'casual',

        // 고급 설정
        personality: 'helpful',
        urgency: 'normal',
        complexity: 'moderate',
        creativity: 'balanced',
        empathy: 'high',
        humor: 'light',

        // AI 모델 설정
        aiModel: 'gpt-4',
        temperature: 0.7,
        maxTokens: 150,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,

        // 컨텍스트 설정
        conversationHistory: true,
        userProfile: true,
        topicAnalysis: true,
        sentimentAnalysis: true,
        responsePattern: true,

        // 실시간 학습 설정
        adaptiveLearning: true,
        personalizationLevel: 'high',
        learningRate: 0.8,
        memoryRetention: 0.9,

        // 강화된 기능들
        multiModelCollaboration: true,
        realTimeEmotionAdaptation: true,
        contextOptimization: true,
        behaviorPatternLearning: true,
        qualityPrediction: true,
        abTesting: true,
        realTimeFeedback: true,
        predictiveAnalysis: true,
        emotionalIntelligence: true,
        conversationFlowOptimization: true,
        writingStyleAnalysis: true,
        vocabularyEnhancement: true,
        grammarStructureCheck: true,
        expressionImprovement: true,
        sentenceLengthOptimization: true,
        keywordDensityAnalysis: true,
        emotionalExpressionEnhancement: true,
        clarityPrecisionImprovement: true,
        sentenceStructureAnalysis: true,
        toneConsistencyCheck: true,
        logicalFlowAnalysis: true,
        emotionalImpactMeasurement: true,

        // 다양한 글쓰기 스타일 분석
        appealLetterAnalysis: true,
        columnAnalysis: true,
        counterArgumentAnalysis: true,
        urgentAppealAnalysis: true,
    });

    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState('empathy');
    const [analysisResults, setAnalysisResults] = useState<any>(null);
    const [conversationContext, setConversationContext] = useState<ConversationContext>({
        recentMessages: [],
        userProfile: {
            name: '사용자',
            preferences: ['친근함', '도움'],
            communicationStyle: '직설적',
            learningHistory: {
                effectiveResponses: [
                    '정말 이해가 됩니다. 그런 상황이면 누구나 그렇게 느끼실 수 있어요.',
                    '함께 해결책을 찾아보시죠. 단계별로 접근해보면 좋을 것 같아요.',
                    '정말 잘하고 계세요! 이런 어려운 상황에서도 포기하지 않고 계시는 게 대단해요.'
                ],
                ineffectiveResponses: [
                    '그렇군요.',
                    '알겠습니다.',
                    '네, 맞습니다.'
                ],
                preferredTones: ['친근함', '공감적', '격려적'],
                avoidedTopics: ['정치', '종교', '민감한 개인정보'],
                emotionalPatterns: ['긍정적 감정', '공감', '격려'],
                behaviorChanges: ['더 긍정적인 반응', '더 공감적인 대화', '더 격려적인 대화'],
                qualityPreferences: ['명확함', '공감적', '실용적']
            },
            emotionalState: {
                currentMood: '평온',
                stressLevel: 0.3,
                engagementLevel: 0.8,
                satisfactionScore: 0.9
            },
            behaviorPatterns: {
                responseTime: 1.2,
                messageLength: 100,
                emojiUsage: '😄',
                topicPreferences: ['일상', '취미', '여가'],
                interactionStyle: '직설적'
            }
        },
        conversationTone: '친근함',
        detectedTopics: ['일반'],
        sentimentScore: 0.5,
        learningProgress: {
            totalInteractions: 15,
            successRate: 0.85,
            adaptationSpeed: 0.7,
            personalizationLevel: '고도화',
            emotionalIntelligence: 0.7,
            qualityImprovement: 0.8,
            behaviorLearning: 0.6
        },
        predictiveData: {
            nextMessageProbability: 0.8,
            userSatisfactionPrediction: 0.9,
            conversationContinuation: 0.95,
            emotionalResponsePrediction: '긍정적'
        }
    });

    // 고급 옵션들
    const toneOptions = [
        { value: 'friendly', label: '친근한', description: '따뜻하고 친근한 톤', icon: HeartIcon },
        { value: 'professional', label: '전문적인', description: '전문적이고 신뢰감 있는 톤', icon: StarIcon },
        { value: 'enthusiastic', label: '열정적인', description: '에너지 넘치는 톤', icon: FireIcon },
        { value: 'empathetic', label: '공감하는', description: '이해하고 공감하는 톤', icon: HeartIcon },
        { value: 'analytical', label: '분석적', description: '논리적이고 분석적인 톤', icon: CpuChipIcon },
        { value: 'creative', label: '창의적', description: '독창적이고 창의적인 톤', icon: SparklesIcon },
        { value: 'authoritative', label: '권위적', description: '신뢰감 있는 권위적 톤', icon: StarIcon }
    ];

    const formatOptions = [
        { value: 'empathy', label: '공감형', description: '상대방 감정에 공감하는 메시지' },
        { value: 'solution', label: '해결형', description: '문제 해결에 초점을 맞춘 메시지' },
        { value: 'encouragement', label: '격려형', description: '동기부여와 격려를 담은 메시지' },
        { value: 'information', label: '정보형', description: '유용한 정보를 제공하는 메시지' },
        { value: 'question', label: '질문형', description: '대화를 이끌어가는 질문형 메시지' },
        { value: 'humor', label: '유머형', description: '재미있고 가벼운 톤의 메시지' },
        { value: 'gaslighting', label: '가스라이팅', description: '심리적 조작 메시지', warning: true }
    ];

    const personalityOptions = [
        { value: 'helpful', label: '도움이 되는', description: '실용적이고 도움이 되는 성격' },
        { value: 'warm', label: '따뜻한', description: '따뜻하고 친근한 성격' },
        { value: 'intelligent', label: '지적인', description: '똑똑하고 분석적인 성격' },
        { value: 'creative', label: '창의적인', description: '독창적이고 창의적인 성격' },
        { value: 'confident', label: '자신감 있는', description: '자신감 있고 확신에 찬 성격' }
    ];

    const urgencyOptions = [
        { value: 'low', label: '낮음', description: '여유로운 톤' },
        { value: 'normal', label: '보통', description: '일반적인 톤' },
        { value: 'high', label: '높음', description: '긴급한 톤' },
        { value: 'critical', label: '긴급', description: '매우 긴급한 톤' }
    ];

    const complexityOptions = [
        { value: 'simple', label: '간단', description: '쉽고 이해하기 쉬운' },
        { value: 'moderate', label: '보통', description: '일반적인 수준' },
        { value: 'complex', label: '복잡', description: '상세하고 정교한' },
        { value: 'expert', label: '전문적', description: '전문가 수준의' }
    ];

    const creativityOptions = [
        { value: 'conservative', label: '보수적', description: '안전하고 전통적인' },
        { value: 'balanced', label: '균형잡힌', description: '적절한 창의성' },
        { value: 'creative', label: '창의적', description: '독창적이고 새로운' },
        { value: 'innovative', label: '혁신적', description: '혁신적이고 파격적인' }
    ];

    const empathyOptions = [
        { value: 'low', label: '낮음', description: '객관적이고 논리적' },
        { value: 'moderate', label: '보통', description: '적절한 공감' },
        { value: 'high', label: '높음', description: '깊은 공감과 이해' },
        { value: 'extreme', label: '극도', description: '극도의 공감과 감정적 연결' }
    ];

    const humorOptions = [
        { value: 'none', label: '없음', description: '진지한 톤' },
        { value: 'light', label: '가벼운', description: '가벼운 유머' },
        { value: 'moderate', label: '보통', description: '적절한 유머' },
        { value: 'playful', label: '장난스러운', description: '재미있고 장난스러운' }
    ];

    const aiModelOptions = [
        { value: 'gpt-4', label: 'GPT-4', description: '가장 강력한 모델' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: '빠르고 효율적인 모델' },
        { value: 'claude-3', label: 'Claude-3', description: '안전하고 신뢰할 수 있는 모델' },
        { value: 'gemini-pro', label: 'Gemini Pro', description: '구글의 최신 모델' }
    ];

    const personalizationLevelOptions = [
        { value: 'low', label: '낮음', description: '기본적인 개인화' },
        { value: 'medium', label: '보통', description: '적절한 개인화' },
        { value: 'high', label: '높음', description: '고도화된 개인화' },
        { value: 'extreme', label: '극도', description: '최고 수준 개인화' }
    ];

    const generateUltraAdvancedMessage = async () => {
        if (!inputMessage.trim()) return;

        setIsGenerating(true);
        const startTime = Date.now();

        try {
            // 실시간 감정 분석
            const emotionAnalysis = analyzeRealTimeEmotion(inputMessage);
            const behaviorPrediction = predictUserBehavior(inputMessage, conversationContext);
            const contextOptimization1 = optimizeConversationContext(inputMessage, conversationContext);

            // 새로운 초고도화 기능들
            const realTimeLearning = analyzeRealTimeLearning(inputMessage, conversationContext);
            const emotionalIntelligence = enhanceEmotionalIntelligence(inputMessage, conversationContext);
            const conversationFlow = optimizeConversationFlow(inputMessage, conversationContext);

            // 새로운 글쓰기 강화 기능들
            const writingStyle = analyzeWritingStyle(inputMessage, conversationContext);
            const vocabularyEnhancement = enhanceVocabulary(inputMessage, conversationContext);
            const grammarStructure = checkGrammarAndStructure(inputMessage, conversationContext);
            const expressionImprovement = improveExpression(inputMessage, conversationContext);
            const contextOptimization2 = optimizeContextFit(inputMessage, conversationContext);

            // 추가된 글쓰기 강화 기능들
            const sentenceLength = optimizeSentenceLength(inputMessage, conversationContext);
            const keywordDensity = analyzeKeywordDensity(inputMessage, conversationContext);
            const emotionalExpression = enhanceEmotionalExpression(inputMessage, conversationContext);
            const clarityPrecision = improveClarityAndPrecision(inputMessage, conversationContext);

            // 추가된 고급 글쓰기 강화 기능들
            const sentenceStructure = analyzeSentenceStructure(inputMessage, conversationContext);
            const toneConsistency = checkToneConsistency(inputMessage, conversationContext);
            const logicalFlow = analyzeLogicalFlow(inputMessage, conversationContext);
            const emotionalImpact = measureEmotionalImpact(inputMessage, conversationContext);

            // 다양한 글쓰기 스타일 분석
            const appealLetter = analyzeAppealLetter(inputMessage, conversationContext);
            const column = analyzeColumn(inputMessage, conversationContext);
            const counterArgument = analyzeCounterArgument(inputMessage, conversationContext);
            const urgentAppeal = analyzeUrgentAppeal(inputMessage, conversationContext);

            // 분석 결과를 하나의 객체로 저장
            setAnalysisResults({
                emotionAnalysis,
                behaviorPrediction,
                contextOptimization: contextOptimization1,
                realTimeLearning,
                emotionalIntelligence,
                conversationFlow,
                writingStyle,
                vocabularyEnhancement,
                grammarStructure,
                expressionImprovement,
                contextOptimization2,
                sentenceLength,
                keywordDensity,
                emotionalExpression,
                clarityPrecision,
                sentenceStructure,
                toneConsistency,
                logicalFlow,
                emotionalImpact,
                appealLetter,
                column,
                counterArgument,
                urgentAppeal
            });

            // 기본 응답 생성
            const baseResponse = generateAdvancedResponse(inputMessage, settings, conversationContext);

            // 강화된 기능들 적용
            const abTestResult = settings.abTesting ? runABTest(inputMessage, settings) : 'A/B 테스트 비활성화';

            // 적응적 응답 생성
            let finalResponse = generateAdaptiveResponse(inputMessage, settings, conversationContext);

            // 다중 모델 협업 (활성화된 경우)
            if (settings.multiModelCollaboration) {
                finalResponse = generateMultiModelResponse(inputMessage, settings);
            }

            // 실시간 감정 적응 (활성화된 경우)
            if (settings.realTimeEmotionAdaptation) {
                finalResponse += `\n\n[감정 적응: ${emotionAnalysis.emotion} 감지됨 (강도: ${emotionAnalysis.intensity}, 신뢰도: ${emotionAnalysis.confidence}%)]`;
            }

            // 컨텍스트 최적화 (활성화된 경우)
            if (settings.contextOptimization) {
                finalResponse += `\n\n[컨텍스트 최적화: ${contextOptimization1}]`;
            }

            // 행동 예측 (활성화된 경우)
            if (settings.predictiveAnalysis) {
                finalResponse += `\n\n[행동 예측: ${behaviorPrediction.nextAction}, 예상 응답시간: ${behaviorPrediction.responseTime}초]`;
            }

            const processingTime = Date.now() - startTime;
            const quality = Math.min(95, 70 + Math.random() * 25);
            const confidence = Math.min(98, 75 + Math.random() * 23);

            const newMessage: GeneratedMessage = {
                id: Date.now().toString(),
                content: finalResponse,
                quality,
                confidence,
                processingTime,
                aiInsights: generateAIInsights(inputMessage, settings),
                alternatives: generateAlternatives(inputMessage, settings),
                context: {
                    detectedEmotion: emotionAnalysis.emotion,
                    conversationTone: analyzeConversationTone(inputMessage),
                    userIntent: analyzeUserIntent(inputMessage),
                    suggestedTopics: generateSuggestedTopics(inputMessage),
                    learningInsights: generateLearningInsights(inputMessage, conversationContext),
                    personalizationScore: calculatePersonalizationScore(inputMessage, conversationContext),
                    emotionalIntelligence: emotionalIntelligence.empathyScore,
                    conversationFlow: conversationFlow.flowScore.toString(),
                    predictiveAccuracy: calculatePredictiveAccuracy(inputMessage, conversationContext),
                    behaviorPattern: analyzeBehaviorPattern(inputMessage, conversationContext),
                    qualityPrediction: predictMessageQuality(inputMessage, settings),
                    abTestResult
                },
                metadata: {
                    model: settings.aiModel,
                    settings,
                    timestamp: new Date(),
                    learningData: {
                        userPreference: detectUserPreference(inputMessage),
                        effectivenessScore: calculateEffectivenessScore(inputMessage),
                        adaptationLevel: determineAdaptationLevel(conversationContext),
                        emotionalResponse: `감정 지능: ${emotionalIntelligence}%`,
                        behaviorChange: analyzeBehaviorPattern(inputMessage, conversationContext),
                        qualityTrend: `품질 예측: ${predictMessageQuality(inputMessage, settings)}%`
                    },
                    collaborationData: {
                        primaryModel: settings.aiModel,
                        secondaryModels: ['GPT-4', 'Claude-3', 'Gemini-Pro'],
                        consensusScore: Math.min(95, 80 + Math.random() * 15),
                        modelAgreement: Math.min(90, 75 + Math.random() * 15)
                    }
                }
            };

            setGeneratedMessages(prev => [newMessage, ...prev]);
            updateLearningData(newMessage);

            // 실시간 피드백 생성
            if (settings.realTimeFeedback) {
                const feedback = generateRealTimeFeedback(newMessage);
                console.log('실시간 피드백:', feedback);
            }

        } catch (error) {
            console.error('메시지 생성 오류:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateAdvancedResponse = (input: string, settings: AdvancedGenerationSettings, context: ConversationContext): string => {
        const responses = {
            empathy: [
                "정말 이해가 됩니다. 그런 상황이면 누구나 그렇게 느끼실 수 있어요. 함께 해결책을 찾아보시죠.",
                "그런 마음이 드시는 게 당연해요. 충분히 공감합니다. 어떻게 도움을 드릴 수 있을까요?",
                "정말 힘드셨겠어요. 그런 감정을 느끼시는 게 자연스럽습니다. 함께 극복해보시죠."
            ],
            solution: [
                "이 문제를 해결하기 위해 몇 가지 방법을 제안드릴게요. 먼저 상황을 정리해보시죠.",
                "효과적인 해결책을 찾기 위해 단계별로 접근해보는 게 어떨까요?",
                "이런 경우에는 체계적인 접근이 도움이 될 것 같아요. 구체적인 계획을 세워보시죠."
            ],
            encouragement: [
                "정말 잘하고 계세요! 이런 어려운 상황에서도 포기하지 않고 계시는 게 대단해요.",
                "분명히 해낼 수 있을 거예요. 당신의 능력을 믿어요. 화이팅!",
                "조금씩 차근차근 하다 보면 좋은 결과가 있을 거예요. 지금까지 정말 수고하셨어요."
            ],
            information: [
                "이와 관련해서 유용한 정보를 알려드릴게요. 참고하시면 도움이 될 것 같아요.",
                "이런 경우에는 이런 방법들이 효과적이라고 알려져 있어요. 확인해보세요.",
                "최신 정보에 따르면 이런 접근 방식이 좋다고 해요. 참고하시면 좋을 것 같아요."
            ],
            question: [
                "어떻게 생각하시나요? 다른 관점에서도 생각해보시면 어떨까요?",
                "이런 부분에 대해서는 어떻게 생각하시는지 궁금해요. 의견을 들려주세요.",
                "혹시 이런 방법도 고려해보셨나요? 어떻게 생각하시나요?"
            ],
            humor: [
                "ㅋㅋㅋ 그런 상황이면 정말 웃프죠! 그래도 긍정적으로 생각해보시죠 😄",
                "아, 그런 일이 있었군요! 웃음으로 넘어가는 게 최고죠 ㅎㅎ",
                "그런 상황이면 정말 어이없죠 ㅋㅋ 그래도 재미있게 해결해보시죠!"
            ]
        };

        const selectedResponses = responses[selectedFormat as keyof typeof responses] || responses.empathy;
        return selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
    };

    const generateAIInsights = (input: string, settings: AdvancedGenerationSettings): string => {
        const insights = [
            "사용자의 감정 상태가 긍정적입니다. 공감적 접근이 효과적일 것 같습니다.",
            "대화 맥락을 분석한 결과, 정보 제공보다는 감정적 지지가 필요해 보입니다.",
            "사용자의 의사소통 스타일이 직설적입니다. 명확하고 간결한 응답이 적합합니다.",
            "이전 대화 패턴을 보면 전문적인 조언을 선호하는 경향이 있습니다.",
            "감정 분석 결과, 현재 스트레스 수준이 높습니다. 안정감을 주는 메시지가 좋겠습니다."
        ];
        return insights[Math.floor(Math.random() * insights.length)];
    };

    const generateAlternatives = (input: string, settings: AdvancedGenerationSettings): string[] => {
        return [
            "다른 관점에서 접근해보면 어떨까요?",
            "이런 방법도 고려해보시는 건 어떨까요?",
            "혹시 이런 방향으로도 생각해보셨나요?"
        ];
    };

    const detectEmotion = (input: string): string => {
        const emotions = ['기쁨', '슬픔', '분노', '걱정', '평온', '흥미', '놀람'];
        return emotions[Math.floor(Math.random() * emotions.length)];
    };

    const analyzeConversationTone = (input: string): string => {
        const tones = ['친근함', '공식적', '격식있음', '편안함', '열정적'];
        return tones[Math.floor(Math.random() * tones.length)];
    };

    const analyzeUserIntent = (input: string): string => {
        const intents = ['정보 요청', '감정 표현', '조언 요청', '일상 대화', '문제 해결'];
        return intents[Math.floor(Math.random() * intents.length)];
    };

    const generateSuggestedTopics = (input: string): string[] => {
        return ['관련 경험', '유사한 사례', '실용적 조언', '감정적 지지'];
    };

    const generateLearningInsights = (input: string, context: ConversationContext): string[] => {
        const insights = [
            `사용자 선호도 분석: ${context.userProfile.learningHistory.preferredTones.join(', ')} 톤 선호`,
            `학습 진행률: ${context.learningProgress.successRate * 100}% 성공률`,
            `개인화 수준: ${context.learningProgress.personalizationLevel}`,
            `적응 속도: ${context.learningProgress.adaptationSpeed * 100}%`,
            `효과적인 응답 패턴: ${context.userProfile.learningHistory.effectiveResponses.length}개 학습됨`
        ];
        return insights;
    };

    const calculatePersonalizationScore = (input: string, context: ConversationContext): number => {
        const baseScore = 70;
        const learningBonus = context.learningProgress.successRate * 20;
        const adaptationBonus = context.learningProgress.adaptationSpeed * 10;
        return Math.min(100, baseScore + learningBonus + adaptationBonus);
    };

    const detectUserPreference = (input: string): string => {
        const preferences = ['친근함', '전문성', '공감', '실용성', '창의성'];
        return preferences[Math.floor(Math.random() * preferences.length)];
    };

    const calculateEffectivenessScore = (input: string): number => {
        return Math.random() * 40 + 60; // 60-100
    };

    const determineAdaptationLevel = (context: ConversationContext): string => {
        const levels = ['초보', '중급', '고급', '전문가'];
        const index = Math.floor(context.learningProgress.adaptationSpeed * 4);
        return levels[Math.min(index, 3)];
    };

    const updateLearningData = (message: GeneratedMessage) => {
        // 학습 데이터 업데이트 로직
        console.log('학습 데이터 업데이트:', message);
    };

    // 강화된 기능들
    const generateMultiModelResponse = (input: string, settings: AdvancedGenerationSettings): string => {
        // 다중 AI 모델 협업 시스템
        const models = ['GPT-4', 'Claude-3', 'Gemini-Pro'];
        const responses = models.map(model => `[${model}] ${input}에 대한 응답`);
        return responses.join('\n\n');
    };

    const analyzeEmotionalIntelligence = (input: string, context: ConversationContext): number => {
        // 감정 지능 분석
        const emotionalKeywords = ['감사', '기쁨', '슬픔', '화남', '걱정', '희망'];
        const score = emotionalKeywords.filter(keyword => input.includes(keyword)).length * 20;
        return Math.min(score, 100);
    };

    const predictConversationFlow = (input: string, context: ConversationContext): string => {
        // 대화 흐름 예측
        const flowPatterns = {
            '질문': '답변',
            '감정표현': '공감',
            '정보요청': '설명',
            '불만': '해결책'
        };

        for (const [pattern, response] of Object.entries(flowPatterns)) {
            if (input.includes(pattern)) {
                return response;
            }
        }
        return '일반적 대화';
    };

    const calculatePredictiveAccuracy = (input: string, context: ConversationContext): number => {
        // 예측 정확도 계산
        const baseAccuracy = 75;
        const contextBonus = context.recentMessages.length * 2;
        const emotionalBonus = context.userProfile.emotionalState.engagementLevel * 0.5;
        return Math.min(baseAccuracy + contextBonus + emotionalBonus, 100);
    };

    const analyzeBehaviorPattern = (input: string, context: ConversationContext): string => {
        // 사용자 행동 패턴 분석
        const patterns = {
            '짧은 메시지': input.length < 20,
            '긴 메시지': input.length > 100,
            '이모지 사용': /[\u{1F600}-\u{1F64F}]/u.test(input),
            '질문형': input.includes('?'),
            '감정표현': /[ㅠㅠ|ㅋㅋ|ㅎㅎ]/.test(input)
        };

        const detectedPatterns = Object.entries(patterns)
            .filter(([_, detected]) => detected)
            .map(([pattern, _]) => pattern);

        return detectedPatterns.join(', ') || '일반적 패턴';
    };

    const predictMessageQuality = (input: string, settings: AdvancedGenerationSettings): number => {
        // 메시지 품질 예측
        let quality = 70;

        // 설정에 따른 품질 조정
        if (settings.emotionalIntelligence) quality += 10;
        if (settings.contextOptimization) quality += 8;
        if (settings.behaviorPatternLearning) quality += 7;
        if (settings.qualityPrediction) quality += 5;

        return Math.min(quality, 100);
    };

    const runABTest = (input: string, settings: AdvancedGenerationSettings): string => {
        // A/B 테스트 실행
        const testVariants = [
            '공식적 톤',
            '친근한 톤',
            '감정적 톤',
            '정보 중심 톤'
        ];

        const selectedVariant = testVariants[Math.floor(Math.random() * testVariants.length)];
        return `A/B 테스트 결과: ${selectedVariant} 선택됨`;
    };

    const generateRealTimeFeedback = (message: GeneratedMessage): string => {
        // 실시간 피드백 생성
        const feedbacks = [
            '사용자 반응이 긍정적입니다',
            '감정적 연결이 강화되었습니다',
            '대화 흐름이 자연스럽습니다',
            '개인화 수준이 높습니다'
        ];

        return feedbacks[Math.floor(Math.random() * feedbacks.length)];
    };

    const analyzeConversationOptimization = (input: string, context: ConversationContext): string => {
        // 대화 최적화 분석
        const optimizations = [];

        if (context.sentimentScore < 0.3) optimizations.push('감정적 지원 필요');
        if (context.recentMessages.length < 3) optimizations.push('컨텍스트 확장 필요');
        if (context.userProfile.emotionalState.stressLevel > 0.7) optimizations.push('스트레스 완화 필요');

        return optimizations.join(', ') || '최적화 불필요';
    };

    // 추가 고도화 기능들
    const analyzeRealTimeEmotion = (input: string): { emotion: string; intensity: number; confidence: number } => {
        // 실시간 감정 분석
        const emotionKeywords = {
            '기쁨': ['😊', '😄', '😃', '좋아', '행복', '기쁘', '즐거'],
            '슬픔': ['😢', '😭', '😔', '슬프', '우울', '힘들', 'ㅠㅠ'],
            '화남': ['😠', '😡', '화나', '짜증', '분노', '열받'],
            '걱정': ['😰', '😨', '걱정', '불안', '긴장', '무서'],
            '평온': ['😌', '😴', '편안', '차분', '평온', '안정']
        };

        let detectedEmotion = '중립';
        let maxIntensity = 0;
        let confidence = 0;

        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            const matches = keywords.filter(keyword => input.includes(keyword)).length;
            if (matches > maxIntensity) {
                maxIntensity = matches;
                detectedEmotion = emotion;
                confidence = Math.min(100, matches * 25);
            }
        }

        return { emotion: detectedEmotion, intensity: maxIntensity, confidence };
    };

    const optimizeConversationContext = (input: string, context: ConversationContext): string => {
        // 대화 맥락 최적화
        const optimizations = [];

        // 감정 상태에 따른 최적화
        const emotionAnalysis = analyzeRealTimeEmotion(input);
        if (emotionAnalysis.emotion === '슬픔' || emotionAnalysis.emotion === '화남') {
            optimizations.push('공감적 응답 필요');
        }

        // 대화 길이에 따른 최적화
        if (input.length < 10) {
            optimizations.push('간결한 응답 권장');
        } else if (input.length > 100) {
            optimizations.push('상세한 응답 권장');
        }

        // 사용자 참여도에 따른 최적화
        if (context.userProfile.emotionalState.engagementLevel < 0.5) {
            optimizations.push('참여도 향상 필요');
        }

        return optimizations.join(', ') || '최적화 불필요';
    };

    const predictUserBehavior = (input: string, context: ConversationContext): {
        nextAction: string;
        responseTime: number;
        messageLength: number;
        emotionalResponse: string;
    } => {
        // 사용자 행동 예측
        const patterns = {
            '질문형': input.includes('?'),
            '감정표현': /[\u{1F600}-\u{1F64F}]/u.test(input),
            '긴급': /[!]{2,}/.test(input),
            '정보요청': /[어떻게|언제|어디서|무엇을]/.test(input)
        };

        let nextAction = '일반적 응답';
        let responseTime = 2.0;
        let messageLength = 50;
        let emotionalResponse = '중립';

        if (patterns['질문형']) {
            nextAction = '답변 제공';
            responseTime = 1.5;
            messageLength = 80;
        }

        if (patterns['감정표현']) {
            nextAction = '감정적 공감';
            responseTime = 1.0;
            messageLength = 60;
            emotionalResponse = '공감적';
        }

        if (patterns['긴급']) {
            nextAction = '즉시 응답';
            responseTime = 0.5;
            messageLength = 40;
            emotionalResponse = '긴급';
        }

        return { nextAction, responseTime, messageLength, emotionalResponse };
    };

    const generateAdaptiveResponse = (input: string, settings: AdvancedGenerationSettings, context: ConversationContext): string => {
        // 적응적 응답 생성
        const emotionAnalysis = analyzeRealTimeEmotion(input);
        const behaviorPrediction = predictUserBehavior(input, context);
        const contextOptimization = optimizeConversationContext(input, context);

        let response = generateAdvancedResponse(input, settings, context);

        // 감정에 따른 적응
        if (emotionAnalysis.emotion === '슬픔') {
            response += '\n\n[감정적 지원: 슬픔 감지됨 - 위로와 격려 제공]';
        } else if (emotionAnalysis.emotion === '화남') {
            response += '\n\n[감정적 지원: 분노 감지됨 - 공감과 해결책 제시]';
        }

        // 행동 예측에 따른 적응
        if (behaviorPrediction.nextAction === '즉시 응답') {
            response = '[긴급 응답] ' + response;
        }

        return response;
    };

    const handleFeedback = (messageId: string, feedback: 'positive' | 'negative' | 'neutral') => {
        setGeneratedMessages(prev =>
            prev.map(msg =>
                msg.id === messageId
                    ? { ...msg, quality: feedback === 'positive' ? msg.quality + 5 : msg.quality - 5 }
                    : msg
            )
        );
    };

    const getQualityColor = (quality: number): string => {
        if (quality >= 90) return 'text-green-600';
        if (quality >= 80) return 'text-blue-600';
        if (quality >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceColor = (confidence: number): string => {
        if (confidence >= 90) return 'text-green-600';
        if (confidence >= 80) return 'text-blue-600';
        if (confidence >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    // 초고도화 기능들
    const analyzeRealTimeLearning = (input: string, context: ConversationContext): {
        learningScore: number;
        adaptationRate: number;
        patternRecognition: string;
        improvementAreas: string[];
    } => {
        // 실시간 학습 분석
        const learningKeywords = ['배우', '이해', '알겠', '새로', '처음', '모르'];
        const adaptationKeywords = ['맞춤', '개인', '특별', '나만', '저만'];
        const patternKeywords = ['반복', '자주', '늘', '항상', '보통'];

        let learningScore = 0;
        let adaptationRate = 0;
        let patternRecognition = '기본 패턴';
        const improvementAreas: string[] = [];

        // 학습 점수 계산
        learningKeywords.forEach(keyword => {
            if (input.includes(keyword)) learningScore += 15;
        });

        // 적응률 계산
        adaptationKeywords.forEach(keyword => {
            if (input.includes(keyword)) adaptationRate += 20;
        });

        // 패턴 인식
        if (patternKeywords.some(keyword => input.includes(keyword))) {
            patternRecognition = '반복 패턴 감지';
        }

        // 개선 영역 식별
        if (input.length < 10) improvementAreas.push('메시지 길이 확장');
        if (!/[\u{1F600}-\u{1F64F}]/u.test(input)) improvementAreas.push('감정 표현 추가');
        if (!input.includes('?')) improvementAreas.push('질문형 응답 권장');

        return {
            learningScore: Math.min(100, learningScore),
            adaptationRate: Math.min(100, adaptationRate),
            patternRecognition,
            improvementAreas
        };
    };

    const enhanceEmotionalIntelligence = (input: string, context: ConversationContext): {
        empathyScore: number;
        emotionalAwareness: number;
        socialSkills: number;
        emotionalRegulation: number;
    } => {
        // 감정적 지능 강화
        const empathyKeywords = ['이해', '공감', '같이', '함께', '위로'];
        const awarenessKeywords = ['느끼', '생각', '마음', '기분', '감정'];
        const socialKeywords = ['관계', '사람', '친구', '가족', '동료'];
        const regulationKeywords = ['차분', '진정', '조절', '관리', '통제'];

        let empathyScore = 0;
        let emotionalAwareness = 0;
        let socialSkills = 0;
        let emotionalRegulation = 0;

        // 공감 능력
        empathyKeywords.forEach(keyword => {
            if (input.includes(keyword)) empathyScore += 20;
        });

        // 감정 인식
        awarenessKeywords.forEach(keyword => {
            if (input.includes(keyword)) emotionalAwareness += 15;
        });

        // 사회적 기술
        socialKeywords.forEach(keyword => {
            if (input.includes(keyword)) socialSkills += 15;
        });

        // 감정 조절
        regulationKeywords.forEach(keyword => {
            if (input.includes(keyword)) emotionalRegulation += 20;
        });

        return {
            empathyScore: Math.min(100, empathyScore),
            emotionalAwareness: Math.min(100, emotionalAwareness),
            socialSkills: Math.min(100, socialSkills),
            emotionalRegulation: Math.min(100, emotionalRegulation)
        };
    };

    const optimizeConversationFlow = (input: string, context: ConversationContext): {
        flowScore: number;
        coherenceLevel: number;
        engagementRate: number;
        naturalnessScore: number;
    } => {
        // 대화 흐름 최적화
        const flowKeywords = ['그리고', '또한', '또한', '게다가', '더욱이'];
        const coherenceKeywords = ['따라서', '그래서', '그러므로', '결과적으로'];
        const engagementKeywords = ['어떻게', '무엇을', '언제', '어디서', '왜'];
        const naturalKeywords = ['그래', '맞아', '좋아', '알겠어', '그렇구나'];

        let flowScore = 0;
        let coherenceLevel = 0;
        let engagementRate = 0;
        let naturalnessScore = 0;

        // 흐름 점수
        flowKeywords.forEach(keyword => {
            if (input.includes(keyword)) flowScore += 15;
        });

        // 일관성 수준
        coherenceKeywords.forEach(keyword => {
            if (input.includes(keyword)) coherenceLevel += 20;
        });

        // 참여도
        engagementKeywords.forEach(keyword => {
            if (input.includes(keyword)) engagementRate += 15;
        });

        // 자연스러움
        naturalKeywords.forEach(keyword => {
            if (input.includes(keyword)) naturalnessScore += 20;
        });

        return {
            flowScore: Math.min(100, flowScore),
            coherenceLevel: Math.min(100, coherenceLevel),
            engagementRate: Math.min(100, engagementRate),
            naturalnessScore: Math.min(100, naturalnessScore)
        };
    };

    // 추가 초고도화 기능들
    const analyzePersonalizedLearning = (input: string, context: ConversationContext): {
        personalizationScore: number;
        userPreferenceMatch: number;
        learningEfficiency: number;
        adaptationSpeed: number;
    } => {
        // 개인화 학습 분석
        const personalKeywords = ['나', '저', '우리', '내', '제'];
        const preferenceKeywords = ['좋아', '싫어', '선호', '선택', '원해'];
        const learningKeywords = ['배우', '알겠', '이해', '새로', '처음'];
        const adaptationKeywords = ['맞춤', '특별', '개인', '나만', '저만'];

        let personalizationScore = 0;
        let userPreferenceMatch = 0;
        let learningEfficiency = 0;
        let adaptationSpeed = 0;

        // 개인화 점수
        personalKeywords.forEach(keyword => {
            if (input.includes(keyword)) personalizationScore += 15;
        });

        // 사용자 선호도 매칭
        preferenceKeywords.forEach(keyword => {
            if (input.includes(keyword)) userPreferenceMatch += 20;
        });

        // 학습 효율성
        learningKeywords.forEach(keyword => {
            if (input.includes(keyword)) learningEfficiency += 15;
        });

        // 적응 속도
        adaptationKeywords.forEach(keyword => {
            if (input.includes(keyword)) adaptationSpeed += 20;
        });

        return {
            personalizationScore: Math.min(100, personalizationScore),
            userPreferenceMatch: Math.min(100, userPreferenceMatch),
            learningEfficiency: Math.min(100, learningEfficiency),
            adaptationSpeed: Math.min(100, adaptationSpeed)
        };
    };

    const analyzeEmotionalAdaptation = (input: string, context: ConversationContext): {
        emotionalSensitivity: number;
        moodMatching: number;
        empathyLevel: number;
        emotionalStability: number;
    } => {
        // 감정적 적응 분석
        const sensitivityKeywords = ['느끼', '생각', '마음', '기분', '감정'];
        const moodKeywords = ['기쁘', '슬프', '화나', '걱정', '편안'];
        const empathyKeywords = ['이해', '공감', '같이', '함께', '위로'];
        const stabilityKeywords = ['차분', '진정', '조절', '관리', '통제'];

        let emotionalSensitivity = 0;
        let moodMatching = 0;
        let empathyLevel = 0;
        let emotionalStability = 0;

        // 감정적 민감도
        sensitivityKeywords.forEach(keyword => {
            if (input.includes(keyword)) emotionalSensitivity += 15;
        });

        // 기분 매칭
        moodKeywords.forEach(keyword => {
            if (input.includes(keyword)) moodMatching += 20;
        });

        // 공감 수준
        empathyKeywords.forEach(keyword => {
            if (input.includes(keyword)) empathyLevel += 15;
        });

        // 감정적 안정성
        stabilityKeywords.forEach(keyword => {
            if (input.includes(keyword)) emotionalStability += 20;
        });

        return {
            emotionalSensitivity: Math.min(100, emotionalSensitivity),
            moodMatching: Math.min(100, moodMatching),
            empathyLevel: Math.min(100, empathyLevel),
            emotionalStability: Math.min(100, emotionalStability)
        };
    };

    const analyzeContextOptimization = (input: string, context: ConversationContext): {
        contextAwareness: number;
        relevanceScore: number;
        coherenceLevel: number;
        naturalnessScore: number;
    } => {
        // 맥락 최적화 분석
        const awarenessKeywords = ['상황', '맥락', '배경', '환경', '조건'];
        const relevanceKeywords = ['관련', '적절', '맞는', '올바른', '정확한'];
        const coherenceKeywords = ['일관', '연결', '흐름', '논리', '체계'];
        const naturalKeywords = ['자연', '편안', '부드럽', '매끄럽', '유연'];

        let contextAwareness = 0;
        let relevanceScore = 0;
        let coherenceLevel = 0;
        let naturalnessScore = 0;

        // 맥락 인식
        awarenessKeywords.forEach(keyword => {
            if (input.includes(keyword)) contextAwareness += 15;
        });

        // 관련성 점수
        relevanceKeywords.forEach(keyword => {
            if (input.includes(keyword)) relevanceScore += 20;
        });

        // 일관성 수준
        coherenceKeywords.forEach(keyword => {
            if (input.includes(keyword)) coherenceLevel += 15;
        });

        // 자연스러움 점수
        naturalKeywords.forEach(keyword => {
            if (input.includes(keyword)) naturalnessScore += 20;
        });

        return {
            contextAwareness: Math.min(100, contextAwareness),
            relevanceScore: Math.min(100, relevanceScore),
            coherenceLevel: Math.min(100, coherenceLevel),
            naturalnessScore: Math.min(100, naturalnessScore)
        };
    };

    // 글쓰기 강화 기능들
    const analyzeWritingStyle = (input: string, context: ConversationContext): {
        styleScore: number;
        toneAppropriateness: number;
        formalityLevel: number;
        clarityScore: number;
    } => {
        // 문체 분석
        const formalKeywords = ['드리다', '해드리다', '감사합니다', '죄송합니다', '부탁드립니다'];
        const casualKeywords = ['해줘', '고마워', '미안해', '좋아', '알았어'];
        const clearKeywords = ['명확히', '구체적으로', '정확히', '분명히', '상세히'];
        const politeKeywords = ['부탁', '감사', '죄송', '고맙', '미안'];

        let styleScore = 0;
        let toneAppropriateness = 0;
        let formalityLevel = 0;
        let clarityScore = 0;

        // 문체 점수
        if (input.length > 20) styleScore += 20;
        if (input.includes('.')) styleScore += 15;
        if (input.includes('!') || input.includes('?')) styleScore += 10;

        // 어조 적절성
        formalKeywords.forEach(keyword => {
            if (input.includes(keyword)) toneAppropriateness += 15;
        });

        casualKeywords.forEach(keyword => {
            if (input.includes(keyword)) toneAppropriateness += 10;
        });

        // 격식 수준
        politeKeywords.forEach(keyword => {
            if (input.includes(keyword)) formalityLevel += 20;
        });

        // 명확성 점수
        clearKeywords.forEach(keyword => {
            if (input.includes(keyword)) clarityScore += 15;
        });

        return {
            styleScore: Math.min(100, styleScore),
            toneAppropriateness: Math.min(100, toneAppropriateness),
            formalityLevel: Math.min(100, formalityLevel),
            clarityScore: Math.min(100, clarityScore)
        };
    };

    const enhanceVocabulary = (input: string, context: ConversationContext): {
        vocabularyScore: number;
        synonymUsage: number;
        expressionVariety: number;
        wordChoice: number;
    } => {
        // 어휘 다양화
        const richVocabulary = ['따라서', '그러므로', '결과적으로', '또한', '게다가', '더욱이'];
        const synonyms = ['좋다', '훌륭하다', '훌륭한', '훌륭한', '훌륭한'];
        const expressions = ['생각하다', '고려하다', '검토하다', '검토하다', '검토하다'];
        const wordChoices = ['적절한', '적합한', '맞는', '올바른', '정확한'];

        let vocabularyScore = 0;
        let synonymUsage = 0;
        let expressionVariety = 0;
        let wordChoice = 0;

        // 어휘 점수
        richVocabulary.forEach(word => {
            if (input.includes(word)) vocabularyScore += 15;
        });

        // 동의어 사용
        synonyms.forEach(synonym => {
            if (input.includes(synonym)) synonymUsage += 20;
        });

        // 표현 다양성
        expressions.forEach(expression => {
            if (input.includes(expression)) expressionVariety += 15;
        });

        // 단어 선택
        wordChoices.forEach(choice => {
            if (input.includes(choice)) wordChoice += 20;
        });

        return {
            vocabularyScore: Math.min(100, vocabularyScore),
            synonymUsage: Math.min(100, synonymUsage),
            expressionVariety: Math.min(100, expressionVariety),
            wordChoice: Math.min(100, wordChoice)
        };
    };

    const checkGrammarAndStructure = (input: string, context: ConversationContext): {
        grammarScore: number;
        structureScore: number;
        flowScore: number;
        coherenceScore: number;
    } => {
        // 문법 및 구조 검토
        const grammarPatterns = ['입니다', '습니다', '니다', '니다', '니다'];
        const structurePatterns = ['첫째', '둘째', '셋째', '마지막으로', '결론적으로'];
        const flowPatterns = ['그리고', '또한', '게다가', '더욱이', '특히'];
        const coherencePatterns = ['따라서', '그래서', '그러므로', '결과적으로', '이에 따라'];

        let grammarScore = 0;
        let structureScore = 0;
        let flowScore = 0;
        let coherenceScore = 0;

        // 문법 점수
        grammarPatterns.forEach(pattern => {
            if (input.includes(pattern)) grammarScore += 20;
        });

        // 구조 점수
        structurePatterns.forEach(pattern => {
            if (input.includes(pattern)) structureScore += 20;
        });

        // 흐름 점수
        flowPatterns.forEach(pattern => {
            if (input.includes(pattern)) flowScore += 15;
        });

        // 일관성 점수
        coherencePatterns.forEach(pattern => {
            if (input.includes(pattern)) coherenceScore += 20;
        });

        return {
            grammarScore: Math.min(100, grammarScore),
            structureScore: Math.min(100, structureScore),
            flowScore: Math.min(100, flowScore),
            coherenceScore: Math.min(100, coherenceScore)
        };
    };

    const improveExpression = (input: string, context: ConversationContext): {
        expressivenessScore: number;
        creativityScore: number;
        impactScore: number;
        memorabilityScore: number;
    } => {
        // 표현력 향상
        const expressiveWords = ['생생한', '감동적인', '인상적인', '특별한', '독특한'];
        const creativePhrases = ['새로운 관점', '혁신적인', '창의적인', '독창적인', '특별한'];
        const impactfulWords = ['중요한', '핵심적인', '결정적인', '필수적인', '근본적인'];
        const memorablePhrases = ['기억에 남는', '잊을 수 없는', '특별한', '유일한', '독특한'];

        let expressivenessScore = 0;
        let creativityScore = 0;
        let impactScore = 0;
        let memorabilityScore = 0;

        // 표현력 점수
        expressiveWords.forEach(word => {
            if (input.includes(word)) expressivenessScore += 20;
        });

        // 창의성 점수
        creativePhrases.forEach(phrase => {
            if (input.includes(phrase)) creativityScore += 20;
        });

        // 임팩트 점수
        impactfulWords.forEach(word => {
            if (input.includes(word)) impactScore += 20;
        });

        // 기억에 남는 점수
        memorablePhrases.forEach(phrase => {
            if (input.includes(phrase)) memorabilityScore += 20;
        });

        return {
            expressivenessScore: Math.min(100, expressivenessScore),
            creativityScore: Math.min(100, creativityScore),
            impactScore: Math.min(100, impactScore),
            memorabilityScore: Math.min(100, memorabilityScore)
        };
    };

    const optimizeContextFit = (input: string, context: ConversationContext): {
        contextScore: number;
        relevanceScore: number;
        appropriatenessScore: number;
        timingScore: number;
    } => {
        // 맥락 적합성 최적화
        const contextKeywords = ['상황', '맥락', '배경', '환경', '조건'];
        const relevantWords = ['관련된', '적절한', '맞는', '올바른', '정확한'];
        const appropriateWords = ['적절한', '적합한', '맞는', '올바른', '정확한'];
        const timingWords = ['시기', '때', '순간', '기회', '시점'];

        let contextScore = 0;
        let relevanceScore = 0;
        let appropriatenessScore = 0;
        let timingScore = 0;

        // 맥락 점수
        contextKeywords.forEach(keyword => {
            if (input.includes(keyword)) contextScore += 20;
        });

        // 관련성 점수
        relevantWords.forEach(word => {
            if (input.includes(word)) relevanceScore += 20;
        });

        // 적절성 점수
        appropriateWords.forEach(word => {
            if (input.includes(word)) appropriatenessScore += 20;
        });

        // 타이밍 점수
        timingWords.forEach(word => {
            if (input.includes(word)) timingScore += 20;
        });

        return {
            contextScore: Math.min(100, contextScore),
            relevanceScore: Math.min(100, relevanceScore),
            appropriatenessScore: Math.min(100, appropriatenessScore),
            timingScore: Math.min(100, timingScore)
        };
    };

    const optimizeSentenceLength = (input: string, context: ConversationContext): {
        optimalLength: number;
        currentLength: number;
        readabilityScore: number;
        complexityScore: number;
    } => {
        // 문장 길이 최적화
        const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgLength = sentences.length > 0 ? sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length : 0;

        // 최적 길이 (한국어 기준: 15-25자)
        const optimalLength = 20;
        const currentLength = Math.round(avgLength);

        // 가독성 점수 (길이가 적절할수록 높은 점수)
        const readabilityScore = Math.max(0, 100 - Math.abs(currentLength - optimalLength) * 3);

        // 복잡성 점수 (너무 짧거나 길면 낮은 점수)
        const complexityScore = currentLength >= 10 && currentLength <= 30 ? 100 :
            currentLength >= 5 && currentLength <= 40 ? 80 : 60;

        return {
            optimalLength,
            currentLength,
            readabilityScore: Math.min(100, Math.max(0, readabilityScore)),
            complexityScore: Math.min(100, Math.max(0, complexityScore))
        };
    };

    const analyzeKeywordDensity = (input: string, context: ConversationContext): {
        keywordDensity: number;
        importantWords: string[];
        topicRelevance: number;
        focusScore: number;
    } => {
        // 키워드 밀도 분석
        const importantKeywords = ['중요한', '핵심', '필수', '근본', '주요', '특별', '독특', '혁신', '창의', '효과'];
        const topicKeywords = ['분석', '검토', '고려', '생각', '계획', '전략', '방안', '해결', '개선', '발전'];

        const words = input.split(/\s+/);
        const totalWords = words.length;

        let keywordCount = 0;
        let topicCount = 0;
        const foundKeywords: string[] = [];

        words.forEach(word => {
            if (importantKeywords.some(keyword => word.includes(keyword))) {
                keywordCount++;
                foundKeywords.push(word);
            }
            if (topicKeywords.some(keyword => word.includes(keyword))) {
                topicCount++;
            }
        });

        const keywordDensity = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
        const topicRelevance = totalWords > 0 ? (topicCount / totalWords) * 100 : 0;
        const focusScore = keywordDensity + topicRelevance;

        return {
            keywordDensity: Math.min(100, keywordDensity),
            importantWords: foundKeywords.slice(0, 5), // 상위 5개만
            topicRelevance: Math.min(100, topicRelevance),
            focusScore: Math.min(100, focusScore)
        };
    };

    const enhanceEmotionalExpression = (input: string, context: ConversationContext): {
        emotionalIntensity: number;
        empathyLevel: number;
        positivityScore: number;
        engagementScore: number;
    } => {
        // 감정 표현 강화
        const positiveWords = ['좋은', '훌륭한', '멋진', '감사', '행복', '즐거운', '기쁜', '희망', '성공', '성취'];
        const empatheticWords = ['이해', '공감', '동감', '함께', '지원', '도움', '배려', '관심', '신뢰', '믿음'];
        const engagingWords = ['흥미', '재미', '신기', '특별', '독특', '새로운', '혁신', '창의', '놀라운', '인상적'];

        let positiveCount = 0;
        let empatheticCount = 0;
        let engagingCount = 0;

        positiveWords.forEach(word => {
            if (input.includes(word)) positiveCount++;
        });

        empatheticWords.forEach(word => {
            if (input.includes(word)) empatheticCount++;
        });

        engagingWords.forEach(word => {
            if (input.includes(word)) engagingCount++;
        });

        const emotionalIntensity = (positiveCount + empatheticCount + engagingCount) * 10;
        const empathyLevel = empatheticCount * 20;
        const positivityScore = positiveCount * 20;
        const engagementScore = engagingCount * 20;

        return {
            emotionalIntensity: Math.min(100, emotionalIntensity),
            empathyLevel: Math.min(100, empathyLevel),
            positivityScore: Math.min(100, positivityScore),
            engagementScore: Math.min(100, engagementScore)
        };
    };

    const improveClarityAndPrecision = (input: string, context: ConversationContext): {
        clarityScore: number;
        precisionScore: number;
        specificityScore: number;
        accuracyScore: number;
    } => {
        // 명확성과 정확성 향상
        const clarityWords = ['명확히', '구체적으로', '정확히', '분명히', '상세히', '자세히', '정확한', '명확한'];
        const precisionWords = ['정확한', '정밀한', '세밀한', '꼼꼼한', '철저한', '완벽한', '이상적인', '최적의'];
        const specificityWords = ['특정', '구체', '상세', '세부', '개별', '각각', '개별적', '구체적'];
        const accuracyWords = ['정확', '올바른', '바른', '정당한', '합리적인', '논리적인', '과학적인'];

        let clarityCount = 0;
        let precisionCount = 0;
        let specificityCount = 0;
        let accuracyCount = 0;

        clarityWords.forEach(word => {
            if (input.includes(word)) clarityCount++;
        });

        precisionWords.forEach(word => {
            if (input.includes(word)) precisionCount++;
        });

        specificityWords.forEach(word => {
            if (input.includes(word)) specificityCount++;
        });

        accuracyWords.forEach(word => {
            if (input.includes(word)) accuracyCount++;
        });

        return {
            clarityScore: Math.min(100, clarityCount * 15),
            precisionScore: Math.min(100, precisionCount * 15),
            specificityScore: Math.min(100, specificityCount * 15),
            accuracyScore: Math.min(100, accuracyCount * 15)
        };
    };

    const analyzeSentenceStructure = (input: string, context: ConversationContext): {
        structureScore: number;
        complexityLevel: number;
        readabilityIndex: number;
        flowCoherence: number;
    } => {
        // 문장 구조 분석
        const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = input.split(/\s+/);

        // 문장당 평균 단어 수
        const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;

        // 구조 점수 (적절한 문장 길이와 복잡성)
        const structureScore = avgWordsPerSentence >= 5 && avgWordsPerSentence <= 15 ? 100 :
            avgWordsPerSentence >= 3 && avgWordsPerSentence <= 20 ? 80 :
                avgWordsPerSentence >= 2 && avgWordsPerSentence <= 25 ? 60 : 40;

        // 복잡성 수준 (문장 수와 단어 수 기반)
        const complexityLevel = sentences.length <= 3 ? 30 :
            sentences.length <= 5 ? 60 :
                sentences.length <= 8 ? 80 : 100;

        // 가독성 지수 (단어 길이와 문장 길이 기반)
        const avgWordLength = words.length > 0 ? words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;
        const readabilityIndex = avgWordLength <= 4 ? 100 :
            avgWordLength <= 6 ? 80 :
                avgWordLength <= 8 ? 60 : 40;

        // 흐름 일관성 (문장 간 연결성)
        const flowCoherence = sentences.length > 1 ? 85 : 100;

        return {
            structureScore: Math.min(100, Math.max(0, structureScore)),
            complexityLevel: Math.min(100, Math.max(0, complexityLevel)),
            readabilityIndex: Math.min(100, Math.max(0, readabilityIndex)),
            flowCoherence: Math.min(100, Math.max(0, flowCoherence))
        };
    };

    const checkToneConsistency = (input: string, context: ConversationContext): {
        toneConsistency: number;
        formalityLevel: number;
        politenessScore: number;
        appropriatenessScore: number;
    } => {
        // 어조 일관성 검사
        const formalWords = ['입니다', '습니다', '하겠습니다', '감사합니다', '죄송합니다'];
        const informalWords = ['야', '어', '해', '해요', '이야'];
        const politeWords = ['부탁드립니다', '감사합니다', '죄송합니다', '알겠습니다'];

        let formalCount = 0;
        let informalCount = 0;
        let politeCount = 0;

        formalWords.forEach(word => {
            if (input.includes(word)) formalCount++;
        });

        informalWords.forEach(word => {
            if (input.includes(word)) informalCount++;
        });

        politeWords.forEach(word => {
            if (input.includes(word)) politeCount++;
        });

        // 어조 일관성 (한 가지 어조가 우세하면 높은 점수)
        const totalToneWords = formalCount + informalCount;
        const toneConsistency = totalToneWords > 0 ?
            Math.max(formalCount, informalCount) / totalToneWords * 100 : 100;

        // 격식 수준
        const formalityLevel = formalCount > informalCount ? 100 :
            formalCount === informalCount ? 50 :
                formalCount < informalCount ? 20 : 50;

        // 정중함 점수
        const politenessScore = politeCount * 25;

        // 적절성 점수 (상황에 맞는 어조)
        const appropriatenessScore = context.userProfile?.communicationStyle === 'formal' ?
            (formalCount > informalCount ? 100 : 60) :
            context.userProfile?.communicationStyle === 'casual' ?
                (informalCount > formalCount ? 100 : 60) : 80;

        return {
            toneConsistency: Math.min(100, Math.max(0, toneConsistency)),
            formalityLevel: Math.min(100, Math.max(0, formalityLevel)),
            politenessScore: Math.min(100, Math.max(0, politenessScore)),
            appropriatenessScore: Math.min(100, Math.max(0, appropriatenessScore))
        };
    };

    const analyzeLogicalFlow = (input: string, context: ConversationContext): {
        logicalCoherence: number;
        argumentStrength: number;
        conclusionClarity: number;
        reasoningQuality: number;
    } => {
        // 논리적 흐름 분석
        const logicalConnectors = ['따라서', '그러므로', '결과적으로', '이유로', '때문에', '그래서', '그런데', '하지만', '그러나'];
        const argumentWords = ['분석', '검토', '고려', '생각', '계획', '전략', '방안', '해결', '개선', '발전'];
        const conclusionWords = ['결론', '요약', '정리', '마무리', '결과', '최종', '완료', '종료'];

        let connectorCount = 0;
        let argumentCount = 0;
        let conclusionCount = 0;

        logicalConnectors.forEach(word => {
            if (input.includes(word)) connectorCount++;
        });

        argumentWords.forEach(word => {
            if (input.includes(word)) argumentCount++;
        });

        conclusionWords.forEach(word => {
            if (input.includes(word)) conclusionCount++;
        });

        // 논리적 일관성
        const logicalCoherence = connectorCount > 0 ? Math.min(100, connectorCount * 20) : 70;

        // 논증 강도
        const argumentStrength = argumentCount > 0 ? Math.min(100, argumentCount * 15) : 60;

        // 결론 명확성
        const conclusionClarity = conclusionCount > 0 ? Math.min(100, conclusionCount * 25) : 50;

        // 추론 품질
        const reasoningQuality = (logicalCoherence + argumentStrength + conclusionClarity) / 3;

        return {
            logicalCoherence: Math.min(100, Math.max(0, logicalCoherence)),
            argumentStrength: Math.min(100, Math.max(0, argumentStrength)),
            conclusionClarity: Math.min(100, Math.max(0, conclusionClarity)),
            reasoningQuality: Math.min(100, Math.max(0, reasoningQuality))
        };
    };

    const measureEmotionalImpact = (input: string, context: ConversationContext): {
        emotionalIntensity: number;
        empathyLevel: number;
        persuasionPower: number;
        memorabilityScore: number;
    } => {
        // 감정적 임팩트 측정
        const emotionalWords = ['감동', '감사', '행복', '기쁨', '희망', '사랑', '믿음', '신뢰', '감동적', '특별한'];
        const empatheticWords = ['이해', '공감', '동감', '함께', '지원', '도움', '배려', '관심', '신뢰', '믿음'];
        const persuasiveWords = ['중요한', '필수', '근본', '핵심', '특별', '독특', '혁신', '창의', '효과', '성과'];
        const memorableWords = ['특별한', '독특한', '새로운', '혁신적인', '창의적인', '인상적인', '놀라운', '훌륭한'];

        let emotionalCount = 0;
        let empatheticCount = 0;
        let persuasiveCount = 0;
        let memorableCount = 0;

        emotionalWords.forEach(word => {
            if (input.includes(word)) emotionalCount++;
        });

        empatheticWords.forEach(word => {
            if (input.includes(word)) empatheticCount++;
        });

        persuasiveWords.forEach(word => {
            if (input.includes(word)) persuasiveCount++;
        });

        memorableWords.forEach(word => {
            if (input.includes(word)) memorableCount++;
        });

        const emotionalIntensity = emotionalCount * 15;
        const empathyLevel = empatheticCount * 15;
        const persuasionPower = persuasiveCount * 15;
        const memorabilityScore = memorableCount * 20;

        return {
            emotionalIntensity: Math.min(100, Math.max(0, emotionalIntensity)),
            empathyLevel: Math.min(100, Math.max(0, empathyLevel)),
            persuasionPower: Math.min(100, Math.max(0, persuasionPower)),
            memorabilityScore: Math.min(100, Math.max(0, memorabilityScore))
        };
    };

    // 다양한 글쓰기 스타일 분석 함수들
    const analyzeAppealLetter = (input: string, context: ConversationContext): {
        emotionalAppeal: number;
        logicalStructure: number;
        urgencyLevel: number;
        credibilityScore: number;
    } => {
        // 호소문 분석
        const emotionalWords = ['절실히', '간곡히', '부디', '제발', '꼭', '반드시', '필수', '시급', '긴급'];
        const logicalWords = ['이유로', '때문에', '따라서', '결과적으로', '분석에 따르면', '조사 결과'];
        const urgencyWords = ['시급', '긴급', '즉시', '당장', '지금', '바로', '서둘러', '서두르다'];
        const credibilityWords = ['공식', '공인', '인증', '검증', '확인', '보장', '약속', '보증'];

        let emotionalCount = 0;
        let logicalCount = 0;
        let urgencyCount = 0;
        let credibilityCount = 0;

        emotionalWords.forEach(word => {
            if (input.includes(word)) emotionalCount++;
        });

        logicalWords.forEach(word => {
            if (input.includes(word)) logicalCount++;
        });

        urgencyWords.forEach(word => {
            if (input.includes(word)) urgencyCount++;
        });

        credibilityWords.forEach(word => {
            if (input.includes(word)) credibilityCount++;
        });

        return {
            emotionalAppeal: Math.min(100, emotionalCount * 20),
            logicalStructure: Math.min(100, logicalCount * 25),
            urgencyLevel: Math.min(100, urgencyCount * 30),
            credibilityScore: Math.min(100, credibilityCount * 25)
        };
    };

    const analyzeColumn = (input: string, context: ConversationContext): {
        insightDepth: number;
        analysisQuality: number;
        readabilityScore: number;
        engagementLevel: number;
    } => {
        // 칼럼 분석
        const insightWords = ['분석', '검토', '고찰', '연구', '조사', '탐구', '심화', '심층', '전문적'];
        const analysisWords = ['비교', '대조', '평가', '판단', '결론', '요약', '정리', '종합'];
        const readabilityWords = ['명확', '간결', '이해', '설명', '예시', '구체', '상세'];
        const engagementWords = ['흥미', '관심', '주목', '집중', '몰입', '매력', '매혹'];

        let insightCount = 0;
        let analysisCount = 0;
        let readabilityCount = 0;
        let engagementCount = 0;

        insightWords.forEach(word => {
            if (input.includes(word)) insightCount++;
        });

        analysisWords.forEach(word => {
            if (input.includes(word)) analysisCount++;
        });

        readabilityWords.forEach(word => {
            if (input.includes(word)) readabilityCount++;
        });

        engagementWords.forEach(word => {
            if (input.includes(word)) engagementCount++;
        });

        return {
            insightDepth: Math.min(100, insightCount * 20),
            analysisQuality: Math.min(100, analysisCount * 25),
            readabilityScore: Math.min(100, readabilityCount * 30),
            engagementLevel: Math.min(100, engagementCount * 25)
        };
    };

    const analyzeCounterArgument = (input: string, context: ConversationContext): {
        refutationStrength: number;
        evidenceQuality: number;
        logicalCoherence: number;
        persuasiveness: number;
    } => {
        // 반문 분석
        const refutationWords = ['하지만', '그러나', '반면', '반대로', '다르게', '틀리다', '잘못', '오해'];
        const evidenceWords = ['증거', '사실', '데이터', '통계', '검증', '확인', '입증', '보증'];
        const logicalWords = ['논리', '이유', '근거', '원인', '결과', '따라서', '그러므로'];
        const persuasiveWords = ['설득', '확신', '믿음', '신뢰', '동의', '수용', '인정'];

        let refutationCount = 0;
        let evidenceCount = 0;
        let logicalCount = 0;
        let persuasiveCount = 0;

        refutationWords.forEach(word => {
            if (input.includes(word)) refutationCount++;
        });

        evidenceWords.forEach(word => {
            if (input.includes(word)) evidenceCount++;
        });

        logicalWords.forEach(word => {
            if (input.includes(word)) logicalCount++;
        });

        persuasiveWords.forEach(word => {
            if (input.includes(word)) persuasiveCount++;
        });

        return {
            refutationStrength: Math.min(100, refutationCount * 25),
            evidenceQuality: Math.min(100, evidenceCount * 25),
            logicalCoherence: Math.min(100, logicalCount * 20),
            persuasiveness: Math.min(100, persuasiveCount * 25)
        };
    };

    const analyzeUrgentAppeal = (input: string, context: ConversationContext): {
        urgencyIntensity: number;
        actionOrientation: number;
        emotionalImpact: number;
        mobilizationPower: number;
    } => {
        // 촉구글 분석
        const urgencyWords = ['지금', '당장', '바로', '즉시', '서둘러', '긴급', '시급', '필수', '반드시'];
        const actionWords = ['행동', '실행', '참여', '지원', '협력', '참가', '동참', '참여'];
        const emotionalWords = ['절실', '간곡', '부탁', '요청', '호소', '간청', '탄원', '청원'];
        const mobilizationWords = ['함께', '연대', '단결', '협력', '지원', '후원', '참여', '동참'];

        let urgencyCount = 0;
        let actionCount = 0;
        let emotionalCount = 0;
        let mobilizationCount = 0;

        urgencyWords.forEach(word => {
            if (input.includes(word)) urgencyCount++;
        });

        actionWords.forEach(word => {
            if (input.includes(word)) actionCount++;
        });

        emotionalWords.forEach(word => {
            if (input.includes(word)) emotionalCount++;
        });

        mobilizationWords.forEach(word => {
            if (input.includes(word)) mobilizationCount++;
        });

        return {
            urgencyIntensity: Math.min(100, urgencyCount * 25),
            actionOrientation: Math.min(100, actionCount * 25),
            emotionalImpact: Math.min(100, emotionalCount * 25),
            mobilizationPower: Math.min(100, mobilizationCount * 25)
        };
    };

    // 글쓰기 스타일 템플릿 시스템
    const writingStyleTemplates = {
        appealLetter: {
            name: "호소문",
            description: "감정적 호소와 논리적 구조를 갖춘 호소문 스타일",
            keywords: ["절실히", "간곡히", "부디", "제발", "꼭", "반드시", "시급", "긴급"],
            structure: "문제 제기 → 감정적 호소 → 논리적 근거 → 구체적 요청",
            example: "저희는 절실히 도움이 필요합니다. 이 문제는 시급한 해결이 요구되며, 부디 관심을 가져주시기 바랍니다."
        },
        column: {
            name: "칼럼",
            description: "전문적 분석과 통찰을 제공하는 칼럼 스타일",
            keywords: ["분석", "검토", "고찰", "연구", "조사", "탐구", "전문적"],
            structure: "주제 소개 → 전문적 분석 → 통찰 제시 → 결론",
            example: "이번 사례를 분석해보면 흥미로운 패턴이 발견됩니다. 전문가들의 견해를 종합해보면..."
        },
        counterArgument: {
            name: "반문",
            description: "상대방 주장에 대한 논리적 반박과 반론",
            keywords: ["하지만", "그러나", "반면", "반대로", "틀리다", "잘못", "오해"],
            structure: "상대방 주장 → 반박 근거 → 논리적 분석 → 대안 제시",
            example: "하지만 이는 잘못된 해석입니다. 실제 데이터를 보면 다른 결과가 나옵니다."
        },
        urgentAppeal: {
            name: "촉구글",
            description: "즉각적인 행동을 촉구하는 긴급성 있는 글",
            keywords: ["지금", "당장", "바로", "즉시", "서둘러", "긴급", "시급"],
            structure: "긴급성 강조 → 행동 촉구 → 구체적 방법 → 동참 요청",
            example: "지금 당장 행동에 나서야 합니다. 함께 힘을 모아 이 문제를 해결해주세요."
        },
        formalReport: {
            name: "공식 보고서",
            description: "공식적이고 객관적인 보고서 스타일",
            keywords: ["공식", "공인", "인증", "검증", "확인", "보장", "약속"],
            structure: "개요 → 객관적 사실 → 분석 → 결론 → 권고사항",
            example: "공식 검증 결과에 따르면, 이 사안은 다음과 같은 특징을 보입니다."
        },
        persuasiveEssay: {
            name: "설득문",
            description: "독자를 설득하는 논리적이고 감정적인 글",
            keywords: ["설득", "확신", "믿음", "신뢰", "동의", "수용", "인정"],
            structure: "관심 유발 → 논리적 근거 → 감정적 호소 → 행동 촉구",
            example: "이 제안이 여러분에게 가져다 줄 혜택을 생각해보시기 바랍니다."
        },
        creativeStory: {
            name: "창작문",
            description: "창의적이고 감동적인 스토리텔링",
            keywords: ["상상", "꿈", "희망", "감동", "감동적", "특별한", "기적"],
            structure: "도입 → 전개 → 위기 → 절정 → 결말",
            example: "그날, 우리는 특별한 순간을 경험했습니다. 마치 꿈을 꾸는 것 같았죠."
        },
        technicalDocument: {
            name: "기술 문서",
            description: "정확하고 상세한 기술적 설명",
            keywords: ["기술", "기술적", "정확", "정밀", "상세", "구체", "명확"],
            structure: "개요 → 기술적 설명 → 상세 분석 → 결론",
            example: "이 기술의 핵심은 정밀한 제어 시스템에 있습니다. 구체적으로 설명하면..."
        }
    };

    const applyWritingStyleTemplate = (input: string, style: keyof typeof writingStyleTemplates): string => {
        const template = writingStyleTemplates[style];
        if (!template) return input;

        // 템플릿에 따른 스타일 적용
        let enhancedText = input;

        // 키워드 강화
        template.keywords.forEach(keyword => {
            if (!enhancedText.includes(keyword)) {
                // 문맥에 맞게 키워드 추가
                if (keyword.includes('절실') || keyword.includes('간곡')) {
                    enhancedText = enhancedText.replace(/\.$/, ` ${keyword}히 부탁드립니다.`);
                } else if (keyword.includes('지금') || keyword.includes('당장')) {
                    enhancedText = enhancedText.replace(/\.$/, ` ${keyword} 행동에 나서야 합니다.`);
                } else if (keyword.includes('하지만') || keyword.includes('그러나')) {
                    enhancedText = `하지만 ${enhancedText}`;
                }
            }
        });

        return enhancedText;
    };

    const getWritingStyleSuggestions = (input: string): Array<{ style: string; score: number; reason: string }> => {
        const suggestions: Array<{ style: string; score: number; reason: string }> = [];

        // 각 스타일별 적합성 점수 계산
        Object.entries(writingStyleTemplates).forEach(([key, template]) => {
            let score = 0;
            let reasons = [];

            // 키워드 매칭 점수
            const keywordMatches = template.keywords.filter(keyword =>
                input.toLowerCase().includes(keyword.toLowerCase())
            ).length;
            score += keywordMatches * 20;

            // 문장 길이와 복잡성 고려
            if (input.length > 100) score += 10;
            if (input.includes('분석') || input.includes('연구')) score += 15;
            if (input.includes('부탁') || input.includes('요청')) score += 15;
            if (input.includes('하지만') || input.includes('그러나')) score += 20;

            if (score > 0) {
                suggestions.push({
                    style: template.name,
                    score: Math.min(100, score),
                    reason: `${keywordMatches}개 키워드 매칭, ${template.description}`
                });
            }
        });

        return suggestions.sort((a, b) => b.score - a.score);
    };

    // 실시간 글쓰기 품질 모니터링 시스템
    const [realTimeQuality, setRealTimeQuality] = useState<{
        overallScore: number;
        readability: number;
        grammar: number;
        style: number;
        suggestions: string[];
    }>({
        overallScore: 0,
        readability: 0,
        grammar: 0,
        style: 0,
        suggestions: []
    });

    const analyzeRealTimeQuality = useCallback((text: string) => {
        if (!text.trim()) {
            setRealTimeQuality({
                overallScore: 0,
                readability: 0,
                grammar: 0,
                style: 0,
                suggestions: []
            });
            return;
        }

        // 실시간 품질 분석
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const avgSentenceLength = words / sentences || 0;

        // 가독성 점수 (20-25단어가 최적)
        const readabilityScore = Math.max(0, 100 - Math.abs(avgSentenceLength - 22.5) * 4);

        // 문법 점수 (기본적인 문법 검사)
        const grammarErrors = (text.match(/[가-힣]+[이|가|을|를|은|는]/g) || []).length;
        const grammarScore = Math.max(0, 100 - grammarErrors * 10);

        // 스타일 점수 (다양한 표현 사용)
        const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
        const styleScore = Math.min(100, (uniqueWords / words) * 100);

        const overallScore = Math.round((readabilityScore + grammarScore + styleScore) / 3);

        // 개선 제안 생성
        const suggestions = [];
        if (avgSentenceLength > 30) suggestions.push("문장이 너무 깁니다. 더 짧게 나누어보세요.");
        if (avgSentenceLength < 10) suggestions.push("문장이 너무 짧습니다. 더 자세히 설명해보세요.");
        if (grammarErrors > 2) suggestions.push("문법을 점검해보세요.");
        if (styleScore < 50) suggestions.push("다양한 표현을 사용해보세요.");
        if (text.length < 20) suggestions.push("좀 더 구체적으로 작성해보세요.");

        setRealTimeQuality({
            overallScore,
            readability: Math.round(readabilityScore),
            grammar: Math.round(grammarScore),
            style: Math.round(styleScore),
            suggestions
        });
    }, []);

    // 실시간 분석 실행
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            analyzeRealTimeQuality(inputMessage);
        }, 500); // 0.5초 딜레이

        return () => clearTimeout(timeoutId);
    }, [inputMessage, analyzeRealTimeQuality]);

    // 자동 글쓰기 개선 시스템
    const autoImproveWriting = (text: string): string => {
        let improvedText = text;

        // 문장 길이 최적화
        const sentences = improvedText.split(/[.!?]+/).filter(s => s.trim());
        const optimizedSentences = sentences.map(sentence => {
            const words = sentence.trim().split(/\s+/);
            if (words.length > 25) {
                // 긴 문장을 두 개로 나누기
                const midPoint = Math.floor(words.length / 2);
                return words.slice(0, midPoint).join(' ') + '. ' + words.slice(midPoint).join(' ');
            }
            return sentence.trim();
        });
        improvedText = optimizedSentences.join('. ') + '.';

        // 반복되는 단어 개선
        const wordCounts: { [key: string]: number } = {};
        const words = improvedText.toLowerCase().split(/\s+/);
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        // 반복되는 단어를 동의어로 교체
        const synonyms: { [key: string]: string[] } = {
            '좋다': ['훌륭하다', '훌륭한', '훌륭하게'],
            '나쁘다': ['안좋다', '안좋은', '안좋게'],
            '크다': ['거대하다', '거대한', '거대하게'],
            '작다': ['작은', '작게', '소규모'],
            '많다': ['풍부하다', '풍부한', '풍부하게'],
            '적다': ['부족하다', '부족한', '부족하게']
        };

        Object.entries(wordCounts).forEach(([word, count]) => {
            if (count > 2 && synonyms[word]) {
                const alternatives = synonyms[word];
                const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
                improvedText = improvedText.replace(new RegExp(word, 'gi'), replacement);
            }
        });

        // 문장 시작 다양화
        const sentenceStarters = ['또한', '그리고', '또한', '더욱이', '특히', '특별히', '구체적으로'];
        const sentences2 = improvedText.split(/[.!?]+/).filter(s => s.trim());
        const improvedSentences = sentences2.map((sentence, index) => {
            if (index > 0 && sentence.trim().length > 10) {
                const starter = sentenceStarters[Math.floor(Math.random() * sentenceStarters.length)];
                return starter + ', ' + sentence.trim();
            }
            return sentence.trim();
        });
        improvedText = improvedSentences.join('. ') + '.';

        return improvedText;
    };

    const handleAutoImprove = () => {
        if (inputMessage.trim()) {
            const improvedText = autoImproveWriting(inputMessage);
            setInputMessage(improvedText);
        }
    };

    // 지능형 글쓰기 어시스턴트 시스템
    const [writingAssistant, setWritingAssistant] = useState<{
        isActive: boolean;
        suggestions: string[];
        tips: string[];
        examples: string[];
        currentFocus: string;
    }>({
        isActive: false,
        suggestions: [],
        tips: [],
        examples: [],
        currentFocus: ''
    });

    const activateWritingAssistant = () => {
        setWritingAssistant(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const generateWritingSuggestions = (text: string): string[] => {
        const suggestions = [];

        if (text.length < 10) {
            suggestions.push("좀 더 구체적으로 설명해보세요.");
        }

        if (text.includes('좋다') || text.includes('나쁘다')) {
            suggestions.push("더 구체적인 표현을 사용해보세요. (예: 훌륭하다, 우수하다, 부족하다)");
        }

        if (text.split('.').length > 3) {
            suggestions.push("문장을 더 짧게 나누어보세요.");
        }

        if (!text.includes('그리고') && !text.includes('또한') && !text.includes('특히')) {
            suggestions.push("문장 연결어를 사용해보세요. (예: 그리고, 또한, 특히)");
        }

        return suggestions;
    };

    const generateWritingTips = (text: string): string[] => {
        const tips = [];

        if (text.length > 0) {
            tips.push("💡 명확하고 구체적인 표현을 사용하세요.");
            tips.push("💡 문장은 20-25단어 정도가 가장 읽기 쉽습니다.");
            tips.push("💡 감정을 담아서 더 생생하게 표현해보세요.");
            tips.push("💡 독자가 이해하기 쉽게 설명해보세요.");
        }

        return tips;
    };

    const generateWritingExamples = (text: string): string[] => {
        const examples = [];

        if (text.includes('문제')) {
            examples.push("이 문제는 시급한 해결이 요구됩니다.");
            examples.push("이 문제에 대한 구체적인 해결책을 제시해야 합니다.");
        }

        if (text.includes('제안')) {
            examples.push("저희는 다음과 같은 제안을 드립니다.");
            examples.push("이 제안이 여러분의 요구사항에 부합할 것입니다.");
        }

        if (text.includes('도움')) {
            examples.push("부디 도움을 주시기 바랍니다.");
            examples.push("여러분의 도움이 절실히 필요합니다.");
        }

        return examples;
    };

    // 실시간 어시스턴트 업데이트
    useEffect(() => {
        if (writingAssistant.isActive && inputMessage) {
            const suggestions = generateWritingSuggestions(inputMessage);
            const tips = generateWritingTips(inputMessage);
            const examples = generateWritingExamples(inputMessage);

            setWritingAssistant(prev => ({
                ...prev,
                suggestions,
                tips,
                examples
            }));
        }
    }, [inputMessage, writingAssistant.isActive]);

    // 고급 문체 분석 시스템
    const [styleAnalysis, setStyleAnalysis] = useState<{
        formality: number;
        politeness: number;
        emotion: number;
        clarity: number;
        engagement: number;
        styleType: string;
        improvements: string[];
    }>({
        formality: 0,
        politeness: 0,
        emotion: 0,
        clarity: 0,
        engagement: 0,
        styleType: '',
        improvements: []
    });

    const analyzeWritingStyleRealTime = (text: string) => {
        if (!text.trim()) return;

        // 격식 수준 분석
        const formalWords = ['드리다', '부탁드립니다', '감사합니다', '죄송합니다', '알겠습니다'];
        const informalWords = ['해', '야', '어', '응', '그래'];

        let formalityScore = 50;
        formalWords.forEach(word => {
            if (text.includes(word)) formalityScore += 10;
        });
        informalWords.forEach(word => {
            if (text.includes(word)) formalityScore -= 10;
        });
        formalityScore = Math.max(0, Math.min(100, formalityScore));

        // 정중함 분석
        const politeWords = ['부탁', '감사', '죄송', '알겠습니다', '드리다'];
        const impoliteWords = ['야', '어', '응', '그래'];

        let politenessScore = 50;
        politeWords.forEach(word => {
            if (text.includes(word)) politenessScore += 15;
        });
        impoliteWords.forEach(word => {
            if (text.includes(word)) politenessScore -= 15;
        });
        politenessScore = Math.max(0, Math.min(100, politenessScore));

        // 감정 분석
        const positiveWords = ['좋다', '훌륭하다', '감사', '행복', '기쁘다'];
        const negativeWords = ['나쁘다', '힘들다', '어렵다', '불편', '문제'];

        let emotionScore = 50;
        positiveWords.forEach(word => {
            if (text.includes(word)) emotionScore += 10;
        });
        negativeWords.forEach(word => {
            if (text.includes(word)) emotionScore -= 10;
        });
        emotionScore = Math.max(0, Math.min(100, emotionScore));

        // 명확성 분석
        const clarityScore = Math.min(100, Math.max(0, 100 - (text.length / 2)));

        // 참여도 분석
        const questionMarks = (text.match(/\?/g) || []).length;
        const engagementScore = Math.min(100, 50 + (questionMarks * 10));

        // 스타일 타입 결정
        let styleType = '일반';
        if (formalityScore > 70) styleType = '공식';
        else if (formalityScore < 30) styleType = '친근';
        if (emotionScore > 70) styleType += ' + 감정적';
        else if (emotionScore < 30) styleType += ' + 객관적';

        // 개선 제안
        const improvements = [];
        if (formalityScore < 40) improvements.push("더 격식있는 표현을 사용해보세요.");
        if (politenessScore < 40) improvements.push("더 정중한 표현을 사용해보세요.");
        if (clarityScore < 60) improvements.push("더 명확하고 간결하게 작성해보세요.");
        if (engagementScore < 50) improvements.push("독자와의 소통을 위해 질문을 추가해보세요.");

        setStyleAnalysis({
            formality: formalityScore,
            politeness: politenessScore,
            emotion: emotionScore,
            clarity: clarityScore,
            engagement: engagementScore,
            styleType,
            improvements
        });
    };

    // 실시간 스타일 분석
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            analyzeWritingStyleRealTime(inputMessage);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [inputMessage]);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">초고도화 메시지 생성</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <CpuChipIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600">AI 최적화 + 실시간 학습</span>
                </div>
            </div>

            {/* 학습 진행률 표시 */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <LightBulbIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">실시간 학습 진행률</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        {conversationContext.learningProgress.totalInteractions}회 상호작용
                    </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white rounded p-2">
                        <div className="text-blue-600 font-medium">성공률</div>
                        <div className="text-lg font-bold">{(conversationContext.learningProgress.successRate * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-white rounded p-2">
                        <div className="text-green-600 font-medium">적응 속도</div>
                        <div className="text-lg font-bold">{(conversationContext.learningProgress.adaptationSpeed * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-white rounded p-2">
                        <div className="text-purple-600 font-medium">개인화 수준</div>
                        <div className="text-lg font-bold">{conversationContext.learningProgress.personalizationLevel}</div>
                    </div>
                </div>
            </div>

            {/* 입력 영역 */}
            <div className="mb-6">
                <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                />
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex space-x-1 mb-4">
                {['기본 설정', '고급 설정', 'AI 설정', '학습 설정', '강화 기능'].map((tab, index) => (
                    <button
                        key={tab}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 설정 패널들 */}
            <div className="space-y-4 mb-6">
                {/* 기본 설정 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">톤</label>
                        <select
                            value={settings.tone}
                            onChange={(e) => setSettings(prev => ({ ...prev, tone: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                        >
                            {toneOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">메시지 형식</label>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                        >
                            {formatOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 고급 설정 */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">성격</label>
                        <select
                            value={settings.personality}
                            onChange={(e) => setSettings(prev => ({ ...prev, personality: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                        >
                            {personalityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">긴급도</label>
                        <select
                            value={settings.urgency}
                            onChange={(e) => setSettings(prev => ({ ...prev, urgency: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                        >
                            {urgencyOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">복잡도</label>
                        <select
                            value={settings.complexity}
                            onChange={(e) => setSettings(prev => ({ ...prev, complexity: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                        >
                            {complexityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* AI 설정 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">AI 모델</label>
                        <select
                            value={settings.aiModel}
                            onChange={(e) => setSettings(prev => ({ ...prev, aiModel: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                        >
                            {aiModelOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">창의성 (Temperature)</label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={settings.temperature}
                            onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                            className="w-full"
                        />
                        <span className="text-sm text-gray-600">{settings.temperature}</span>
                    </div>
                </div>

                {/* 학습 설정 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">개인화 수준</label>
                        <select
                            value={settings.personalizationLevel}
                            onChange={(e) => setSettings(prev => ({ ...prev, personalizationLevel: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                        >
                            {personalizationLevelOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">학습률</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings.learningRate}
                            onChange={(e) => setSettings(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                            className="w-full"
                        />
                        <span className="text-sm text-gray-600">{settings.learningRate}</span>
                    </div>
                </div>

                {/* 강화 기능 설정 */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <RocketLaunchIcon className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">강화된 AI 기능</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.multiModelCollaboration}
                                onChange={(e) => setSettings(prev => ({ ...prev, multiModelCollaboration: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">다중 모델 협업</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.realTimeEmotionAdaptation}
                                onChange={(e) => setSettings(prev => ({ ...prev, realTimeEmotionAdaptation: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">실시간 감정 적응</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.contextOptimization}
                                onChange={(e) => setSettings(prev => ({ ...prev, contextOptimization: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">컨텍스트 최적화</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.behaviorPatternLearning}
                                onChange={(e) => setSettings(prev => ({ ...prev, behaviorPatternLearning: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">행동 패턴 학습</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.qualityPrediction}
                                onChange={(e) => setSettings(prev => ({ ...prev, qualityPrediction: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">품질 예측</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.abTesting}
                                onChange={(e) => setSettings(prev => ({ ...prev, abTesting: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">A/B 테스트</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.realTimeFeedback}
                                onChange={(e) => setSettings(prev => ({ ...prev, realTimeFeedback: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">실시간 피드백</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.predictiveAnalysis}
                                onChange={(e) => setSettings(prev => ({ ...prev, predictiveAnalysis: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">예측 분석</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.emotionalIntelligence}
                                onChange={(e) => setSettings(prev => ({ ...prev, emotionalIntelligence: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">감정 지능</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.conversationFlowOptimization}
                                onChange={(e) => setSettings(prev => ({ ...prev, conversationFlowOptimization: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">대화 흐름 최적화</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.writingStyleAnalysis}
                                onChange={(e) => setSettings(prev => ({ ...prev, writingStyleAnalysis: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">글쓰기 문체 분석</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.vocabularyEnhancement}
                                onChange={(e) => setSettings(prev => ({ ...prev, vocabularyEnhancement: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">어휘 다양화</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.grammarStructureCheck}
                                onChange={(e) => setSettings(prev => ({ ...prev, grammarStructureCheck: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">문법 및 구조 검토</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.expressionImprovement}
                                onChange={(e) => setSettings(prev => ({ ...prev, expressionImprovement: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">표현력 향상</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.contextOptimization}
                                onChange={(e) => setSettings(prev => ({ ...prev, contextOptimization: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">맥락 적합성 최적화</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.sentenceLengthOptimization}
                                onChange={(e) => setSettings(prev => ({ ...prev, sentenceLengthOptimization: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">문장 길이 최적화</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.keywordDensityAnalysis}
                                onChange={(e) => setSettings(prev => ({ ...prev, keywordDensityAnalysis: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">키워드 밀도 분석</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.emotionalExpressionEnhancement}
                                onChange={(e) => setSettings(prev => ({ ...prev, emotionalExpressionEnhancement: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">감정 표현 강화</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.clarityPrecisionImprovement}
                                onChange={(e) => setSettings(prev => ({ ...prev, clarityPrecisionImprovement: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">명확성과 정확성 향상</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.sentenceStructureAnalysis}
                                onChange={(e) => setSettings(prev => ({ ...prev, sentenceStructureAnalysis: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">문장 구조 분석</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.toneConsistencyCheck}
                                onChange={(e) => setSettings(prev => ({ ...prev, toneConsistencyCheck: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">어조 일관성 검사</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.logicalFlowAnalysis}
                                onChange={(e) => setSettings(prev => ({ ...prev, logicalFlowAnalysis: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">논리적 흐름 분석</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={settings.emotionalImpactMeasurement}
                                onChange={(e) => setSettings(prev => ({ ...prev, emotionalImpactMeasurement: e.target.checked }))}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">감정적 임팩트 측정</span>
                        </label>

                        {/* 다양한 글쓰기 스타일 기능들 */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">📝 다양한 글쓰기 스타일</h4>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={settings.appealLetterAnalysis}
                                    onChange={(e) => setSettings(prev => ({ ...prev, appealLetterAnalysis: e.target.checked }))}
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700">호소문 분석</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={settings.columnAnalysis}
                                    onChange={(e) => setSettings(prev => ({ ...prev, columnAnalysis: e.target.checked }))}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">칼럼 분석</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={settings.counterArgumentAnalysis}
                                    onChange={(e) => setSettings(prev => ({ ...prev, counterArgumentAnalysis: e.target.checked }))}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">반문 분석</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={settings.urgentAppealAnalysis}
                                    onChange={(e) => setSettings(prev => ({ ...prev, urgentAppealAnalysis: e.target.checked }))}
                                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                                />
                                <span className="text-sm text-gray-700">촉구글 분석</span>
                            </label>
                        </div>

                        {/* 글쓰기 스타일 템플릿 선택 */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">🎨 글쓰기 스타일 템플릿</h4>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const enhancedText = applyWritingStyleTemplate(inputMessage, e.target.value as keyof typeof writingStyleTemplates);
                                        setInputMessage(enhancedText);
                                    }
                                }}
                            >
                                <option value="">스타일 템플릿 선택...</option>
                                {Object.entries(writingStyleTemplates).map(([key, template]) => (
                                    <option key={key} value={key}>{template.name} - {template.description}</option>
                                ))}
                            </select>

                            {/* 스타일 제안 */}
                            {inputMessage && (
                                <div className="mt-3">
                                    <h5 className="text-xs font-medium text-gray-700 mb-2">💡 추천 스타일</h5>
                                    <div className="space-y-1">
                                        {getWritingStyleSuggestions(inputMessage).slice(0, 3).map((suggestion, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                                <div>
                                                    <span className="text-xs font-medium text-gray-800">{suggestion.style}</span>
                                                    <p className="text-xs text-gray-600">{suggestion.reason}</p>
                                                </div>
                                                <div className="text-xs font-bold text-blue-600">{suggestion.score}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 생성 버튼 */}
            <button
                onClick={generateUltraAdvancedMessage}
                disabled={isGenerating || !inputMessage.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
                {isGenerating ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>학습 중 생성...</span>
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5" />
                        <span>초고도화 메시지 생성</span>
                    </>
                )}
            </button>

            {/* 생성된 메시지들 */}
            <div className="mt-6 space-y-4">
                {generatedMessages.map((message) => (
                    <div key={message.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
                                <span className="font-medium text-gray-900">생성된 메시지</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${getQualityColor(message.quality)}`}>
                                    품질: {message.quality.toFixed(1)}%
                                </span>
                                <span className={`text-sm font-medium ${getConfidenceColor(message.confidence)}`}>
                                    신뢰도: {message.confidence.toFixed(1)}%
                                </span>
                                <span className="text-sm font-medium text-purple-600">
                                    개인화: {message.context.personalizationScore.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-800 mb-3">{message.content}</p>

                        {/* AI 인사이트 */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <LightBulbIcon className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-900">AI 인사이트</span>
                            </div>
                            <p className="text-sm text-blue-800">{message.aiInsights}</p>
                        </div>

                        {/* 학습 인사이트 */}
                        <div className="bg-green-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <CpuChipIcon className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-green-900">학습 인사이트</span>
                            </div>
                            <div className="space-y-1">
                                {message.context.learningInsights.map((insight, index) => (
                                    <p key={index} className="text-xs text-green-800">{insight}</p>
                                ))}
                            </div>
                        </div>

                        {/* 컨텍스트 정보 */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-green-50 rounded-lg p-2">
                                <span className="text-xs font-medium text-green-700">감정: {message.context.detectedEmotion}</span>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-2">
                                <span className="text-xs font-medium text-purple-700">톤: {message.context.conversationTone}</span>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-2">
                                <span className="text-xs font-medium text-orange-700">의도: {message.context.userIntent}</span>
                            </div>
                            <div className="bg-pink-50 rounded-lg p-2">
                                <span className="text-xs font-medium text-pink-700">처리시간: {(message.processingTime / 1000).toFixed(1)}초</span>
                            </div>
                        </div>

                        {/* 학습 데이터 */}
                        <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <StarIcon className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-900">학습 데이터</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-yellow-800">선호도:</span>
                                    <div className="text-yellow-700">{message.metadata.learningData.userPreference}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-yellow-800">효과성:</span>
                                    <div className="text-yellow-700">{message.metadata.learningData.effectivenessScore.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-yellow-800">적응 수준:</span>
                                    <div className="text-yellow-700">{message.metadata.learningData.adaptationLevel}</div>
                                </div>
                            </div>
                        </div>

                        {/* 강화된 기능 결과 */}
                        <div className="bg-purple-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <RocketLaunchIcon className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-900">강화된 AI 기능 결과</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-purple-800">감정 지능:</span>
                                    <div className="text-purple-700">{message.context.emotionalIntelligence}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-800">대화 흐름:</span>
                                    <div className="text-purple-700">{message.context.conversationFlow}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-800">예측 정확도:</span>
                                    <div className="text-purple-700">{message.context.predictiveAccuracy.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-800">행동 패턴:</span>
                                    <div className="text-purple-700">{message.context.behaviorPattern}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-800">품질 예측:</span>
                                    <div className="text-purple-700">{message.context.qualityPrediction.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-800">A/B 테스트:</span>
                                    <div className="text-purple-700">{message.context.abTestResult}</div>
                                </div>
                            </div>
                        </div>

                        {/* 다중 모델 협업 데이터 */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <CpuChipIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">다중 모델 협업</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-blue-800">주 모델:</span>
                                    <div className="text-blue-700">{message.metadata.collaborationData.primaryModel}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">합의 점수:</span>
                                    <div className="text-blue-700">{message.metadata.collaborationData.consensusScore.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">모델 일치도:</span>
                                    <div className="text-blue-700">{message.metadata.collaborationData.modelAgreement.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">보조 모델:</span>
                                    <div className="text-blue-700">{message.metadata.collaborationData.secondaryModels.join(', ')}</div>
                                </div>
                            </div>
                        </div>

                        {/* 실시간 감정 분석 결과 */}
                        <div className="bg-pink-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <HeartIcon className="w-4 h-4 text-pink-600" />
                                <span className="text-sm font-medium text-pink-900">실시간 감정 분석</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-pink-800">감지된 감정:</span>
                                    <div className="text-pink-700">{message.context.detectedEmotion}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-pink-800">감정 지능:</span>
                                    <div className="text-pink-700">{message.context.emotionalIntelligence}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-pink-800">대화 흐름:</span>
                                    <div className="text-pink-700">{message.context.conversationFlow}</div>
                                </div>
                            </div>
                        </div>

                        {/* 행동 예측 결과 */}
                        <div className="bg-indigo-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <EyeIcon className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-medium text-indigo-900">행동 예측 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-indigo-800">예측 정확도:</span>
                                    <div className="text-indigo-700">{message.context.predictiveAccuracy.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-indigo-800">행동 패턴:</span>
                                    <div className="text-indigo-700">{message.context.behaviorPattern}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-indigo-800">품질 예측:</span>
                                    <div className="text-indigo-700">{message.context.qualityPrediction.toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-indigo-800">A/B 테스트:</span>
                                    <div className="text-indigo-700">{message.context.abTestResult}</div>
                                </div>
                            </div>
                        </div>

                        {/* 실시간 학습 분석 결과 */}
                        <div className="bg-green-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <BoltIcon className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">실시간 학습 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-green-800">학습 점수:</span>
                                    <div className="text-green-700">{analysisResults?.realTimeLearning?.learningScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-green-800">적응률:</span>
                                    <div className="text-green-700">{analysisResults?.realTimeLearning?.adaptationRate || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-green-800">패턴 인식:</span>
                                    <div className="text-green-700">{analysisResults?.realTimeLearning?.patternRecognition || '분석 중'}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-green-800">개선 영역:</span>
                                    <div className="text-green-700">{analysisResults?.realTimeLearning?.improvementAreas?.join(', ') || '분석 중'}</div>
                                </div>
                            </div>
                        </div>

                        {/* 감정적 지능 강화 결과 */}
                        <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <HeartIcon className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-900">감정적 지능 강화</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-yellow-800">공감 능력:</span>
                                    <div className="text-yellow-700">{analysisResults?.emotionalIntelligence?.empathyScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-yellow-800">감정 인식:</span>
                                    <div className="text-yellow-700">{analysisResults?.emotionalIntelligence?.emotionalAwareness || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-yellow-800">사회적 기술:</span>
                                    <div className="text-yellow-700">{analysisResults?.emotionalIntelligence?.socialSkills || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-yellow-800">감정 조절:</span>
                                    <div className="text-yellow-700">{analysisResults?.emotionalIntelligence?.emotionalRegulation || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 대화 흐름 최적화 결과 */}
                        <div className="bg-cyan-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <ChartBarIcon className="w-4 h-4 text-cyan-600" />
                                <span className="text-sm font-medium text-cyan-900">대화 흐름 최적화</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-cyan-800">흐름 점수:</span>
                                    <div className="text-cyan-700">{analysisResults?.conversationFlow?.flowScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-cyan-800">일관성 수준:</span>
                                    <div className="text-cyan-700">{analysisResults?.conversationFlow?.coherenceLevel || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-cyan-800">참여도:</span>
                                    <div className="text-cyan-700">{analysisResults?.conversationFlow?.engagementRate || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-cyan-800">자연스러움:</span>
                                    <div className="text-cyan-700">{analysisResults?.conversationFlow?.naturalnessScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 글쓰기 문체 분석 결과 */}
                        <div className="bg-orange-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <DocumentTextIcon className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-900">글쓰기 문체 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-orange-800">문체 점수:</span>
                                    <div className="text-orange-700">{analysisResults?.writingStyle?.styleScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-orange-800">어조 적절성:</span>
                                    <div className="text-orange-700">{analysisResults?.writingStyle?.toneAppropriateness || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-orange-800">격식 수준:</span>
                                    <div className="text-orange-700">{analysisResults?.writingStyle?.formalityLevel || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-orange-800">명확성 점수:</span>
                                    <div className="text-orange-700">{analysisResults?.writingStyle?.clarityScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 어휘 다양화 결과 */}
                        <div className="bg-teal-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <SparklesIcon className="w-4 h-4 text-teal-600" />
                                <span className="text-sm font-medium text-teal-900">어휘 다양화</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-teal-800">어휘 점수:</span>
                                    <div className="text-teal-700">{analysisResults?.vocabularyEnhancement?.vocabularyScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-teal-800">동의어 사용:</span>
                                    <div className="text-teal-700">{analysisResults?.vocabularyEnhancement?.synonymUsage || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-teal-800">표현 다양성:</span>
                                    <div className="text-teal-700">{analysisResults?.vocabularyEnhancement?.expressionVariety || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-teal-800">단어 선택:</span>
                                    <div className="text-teal-700">{analysisResults?.vocabularyEnhancement?.wordChoice || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 문법 및 구조 검토 결과 */}
                        <div className="bg-lime-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircleIcon className="w-4 h-4 text-lime-600" />
                                <span className="text-sm font-medium text-lime-900">문법 및 구조 검토</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-lime-800">문법 점수:</span>
                                    <div className="text-lime-700">{analysisResults?.grammarStructure?.grammarScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-lime-800">구조 점수:</span>
                                    <div className="text-lime-700">{analysisResults?.grammarStructure?.structureScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-lime-800">흐름 점수:</span>
                                    <div className="text-lime-700">{analysisResults?.grammarStructure?.flowScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-lime-800">일관성 점수:</span>
                                    <div className="text-lime-700">{analysisResults?.grammarStructure?.coherenceScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 표현력 향상 결과 */}
                        <div className="bg-violet-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <StarIcon className="w-4 h-4 text-violet-600" />
                                <span className="text-sm font-medium text-violet-900">표현력 향상</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-violet-800">표현력 점수:</span>
                                    <div className="text-violet-700">{analysisResults?.expressionImprovement?.expressivenessScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-violet-800">창의성 점수:</span>
                                    <div className="text-violet-700">{analysisResults?.expressionImprovement?.creativityScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-violet-800">임팩트 점수:</span>
                                    <div className="text-violet-700">{analysisResults?.expressionImprovement?.impactScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-violet-800">기억에 남는 점수:</span>
                                    <div className="text-violet-700">{analysisResults?.expressionImprovement?.memorabilityScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 맥락 적합성 최적화 결과 */}
                        <div className="bg-amber-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <CogIcon className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium text-amber-900">맥락 적합성 최적화</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-amber-800">맥락 점수:</span>
                                    <div className="text-amber-700">{analysisResults?.contextOptimization2?.contextScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-amber-800">관련성 점수:</span>
                                    <div className="text-amber-700">{analysisResults?.contextOptimization2?.relevanceScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-amber-800">적절성 점수:</span>
                                    <div className="text-amber-700">{analysisResults?.contextOptimization2?.appropriatenessScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-amber-800">타이밍 점수:</span>
                                    <div className="text-amber-700">{analysisResults?.contextOptimization2?.timingScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 문장 길이 최적화 결과 */}
                        <div className="bg-indigo-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <DocumentTextIcon className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-medium text-indigo-900">문장 길이 최적화</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-indigo-800">최적 길이:</span>
                                    <div className="text-indigo-700">{analysisResults?.sentenceLength?.optimalLength || 0}자</div>
                                </div>
                                <div>
                                    <span className="font-medium text-indigo-800">현재 길이:</span>
                                    <div className="text-indigo-700">{analysisResults?.sentenceLength?.currentLength || 0}자</div>
                                </div>
                                <div>
                                    <span className="font-medium text-indigo-800">가독성 점수:</span>
                                    <div className="text-indigo-700">{analysisResults?.sentenceLength?.readabilityScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-indigo-800">복잡성 점수:</span>
                                    <div className="text-indigo-700">{analysisResults?.sentenceLength?.complexityScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 키워드 밀도 분석 결과 */}
                        <div className="bg-emerald-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <SparklesIcon className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-900">키워드 밀도 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-emerald-800">키워드 밀도:</span>
                                    <div className="text-emerald-700">{(analysisResults?.keywordDensity?.keywordDensity || 0).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-emerald-800">주제 관련성:</span>
                                    <div className="text-emerald-700">{(analysisResults?.keywordDensity?.topicRelevance || 0).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-emerald-800">집중도 점수:</span>
                                    <div className="text-emerald-700">{(analysisResults?.keywordDensity?.focusScore || 0).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-emerald-800">중요 키워드:</span>
                                    <div className="text-emerald-700">{analysisResults?.keywordDensity?.importantWords?.join(', ') || '분석 중'}</div>
                                </div>
                            </div>
                        </div>

                        {/* 감정 표현 강화 결과 */}
                        <div className="bg-rose-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <HeartIcon className="w-4 h-4 text-rose-600" />
                                <span className="text-sm font-medium text-rose-900">감정 표현 강화</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-rose-800">감정 강도:</span>
                                    <div className="text-rose-700">{analysisResults?.emotionalExpression?.emotionalIntensity || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-rose-800">공감 수준:</span>
                                    <div className="text-rose-700">{analysisResults?.emotionalExpression?.empathyLevel || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-rose-800">긍정성 점수:</span>
                                    <div className="text-rose-700">{analysisResults?.emotionalExpression?.positivityScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-rose-800">참여도 점수:</span>
                                    <div className="text-rose-700">{analysisResults?.emotionalExpression?.engagementScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 명확성과 정확성 향상 결과 */}
                        <div className="bg-slate-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircleIcon className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-medium text-slate-900">명확성과 정확성 향상</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-slate-800">명확성 점수:</span>
                                    <div className="text-slate-700">{analysisResults?.clarityPrecision?.clarityScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-slate-800">정밀성 점수:</span>
                                    <div className="text-slate-700">{analysisResults?.clarityPrecision?.precisionScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-slate-800">구체성 점수:</span>
                                    <div className="text-slate-700">{analysisResults?.clarityPrecision?.specificityScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-slate-800">정확성 점수:</span>
                                    <div className="text-slate-700">{analysisResults?.clarityPrecision?.accuracyScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 문장 구조 분석 결과 */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">문장 구조 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-blue-800">구조 점수:</span>
                                    <div className="text-blue-700">{analysisResults?.sentenceStructure?.structureScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">복잡성 수준:</span>
                                    <div className="text-blue-700">{analysisResults?.sentenceStructure?.complexityLevel || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">가독성 지수:</span>
                                    <div className="text-blue-700">{analysisResults?.sentenceStructure?.readabilityIndex || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">흐름 일관성:</span>
                                    <div className="text-blue-700">{analysisResults?.sentenceStructure?.flowCoherence || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 어조 일관성 검사 결과 */}
                        <div className="bg-purple-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <CogIcon className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-900">어조 일관성 검사</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-purple-800">어조 일관성:</span>
                                    <div className="text-purple-700">{analysisResults?.toneConsistency?.toneConsistency || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-800">격식 수준:</span>
                                    <div className="text-purple-700">{analysisResults?.toneConsistency?.formalityLevel || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-800">정중함 점수:</span>
                                    <div className="text-purple-700">{analysisResults?.toneConsistency?.politenessScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-800">적절성 점수:</span>
                                    <div className="text-purple-700">{analysisResults?.toneConsistency?.appropriatenessScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 논리적 흐름 분석 결과 */}
                        <div className="bg-green-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <ChartBarIcon className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">논리적 흐름 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-green-800">논리적 일관성:</span>
                                    <div className="text-green-700">{analysisResults?.logicalFlow?.logicalCoherence || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-green-800">논증 강도:</span>
                                    <div className="text-green-700">{analysisResults?.logicalFlow?.argumentStrength || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-green-800">결론 명확성:</span>
                                    <div className="text-green-700">{analysisResults?.logicalFlow?.conclusionClarity || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-green-800">추론 품질:</span>
                                    <div className="text-green-700">{analysisResults?.logicalFlow?.reasoningQuality || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 감정적 임팩트 측정 결과 */}
                        <div className="bg-pink-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <HeartIcon className="w-4 h-4 text-pink-600" />
                                <span className="text-sm font-medium text-pink-900">감정적 임팩트 측정</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-pink-800">감정 강도:</span>
                                    <div className="text-pink-700">{analysisResults?.emotionalImpact?.emotionalIntensity || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-pink-800">공감 수준:</span>
                                    <div className="text-pink-700">{analysisResults?.emotionalImpact?.empathyLevel || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-pink-800">설득력:</span>
                                    <div className="text-pink-700">{analysisResults?.emotionalImpact?.persuasionPower || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-pink-800">기억에 남는 점수:</span>
                                    <div className="text-pink-700">{analysisResults?.emotionalImpact?.memorabilityScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 호소문 분석 결과 */}
                        <div className="bg-orange-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <DocumentTextIcon className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-900">호소문 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-orange-800">감정적 호소:</span>
                                    <div className="text-orange-700">{analysisResults?.appealLetter?.emotionalAppeal || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-orange-800">논리적 구조:</span>
                                    <div className="text-orange-700">{analysisResults?.appealLetter?.logicalStructure || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-orange-800">긴급성 수준:</span>
                                    <div className="text-orange-700">{analysisResults?.appealLetter?.urgencyLevel || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-orange-800">신뢰도 점수:</span>
                                    <div className="text-orange-700">{analysisResults?.appealLetter?.credibilityScore || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 칼럼 분석 결과 */}
                        <div className="bg-indigo-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <ChartBarIcon className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-medium text-indigo-900">칼럼 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-indigo-800">통찰 깊이:</span>
                                    <div className="text-indigo-700">{analysisResults?.column?.insightDepth || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-indigo-800">분석 품질:</span>
                                    <div className="text-indigo-700">{analysisResults?.column?.analysisQuality || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-indigo-800">가독성 점수:</span>
                                    <div className="text-indigo-700">{analysisResults?.column?.readabilityScore || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-indigo-800">몰입도:</span>
                                    <div className="text-indigo-700">{analysisResults?.column?.engagementLevel || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 반문 분석 결과 */}
                        <div className="bg-red-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium text-red-900">반문 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-red-800">반박 강도:</span>
                                    <div className="text-red-700">{analysisResults?.counterArgument?.refutationStrength || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-red-800">증거 품질:</span>
                                    <div className="text-red-700">{analysisResults?.counterArgument?.evidenceQuality || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-red-800">논리적 일관성:</span>
                                    <div className="text-red-700">{analysisResults?.counterArgument?.logicalCoherence || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-red-800">설득력:</span>
                                    <div className="text-red-700">{analysisResults?.counterArgument?.persuasiveness || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 촉구글 분석 결과 */}
                        <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <MegaphoneIcon className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-900">촉구글 분석</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-medium text-yellow-800">긴급성 강도:</span>
                                    <div className="text-yellow-700">{analysisResults?.urgentAppeal?.urgencyIntensity || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-yellow-800">행동 지향성:</span>
                                    <div className="text-yellow-700">{analysisResults?.urgentAppeal?.actionOrientation || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-yellow-800">감정적 임팩트:</span>
                                    <div className="text-yellow-700">{analysisResults?.urgentAppeal?.emotionalImpact || 0}%</div>
                                </div>
                                <div>
                                    <span className="font-medium text-yellow-800">동원력:</span>
                                    <div className="text-yellow-700">{analysisResults?.urgentAppeal?.mobilizationPower || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* 글쓰기 스타일 템플릿 정보 */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <DocumentTextIcon className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-900">글쓰기 스타일 템플릿</span>
                            </div>
                            <div className="space-y-2">
                                {getWritingStyleSuggestions(inputMessage).slice(0, 3).map((suggestion, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-bold text-purple-800">{suggestion.style}</span>
                                                <span className="text-xs text-purple-600">({suggestion.score}% 적합)</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{suggestion.reason}</p>
                                        </div>
                                        <button
                                            className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                            onClick={() => {
                                                const templateKey = Object.keys(writingStyleTemplates).find(key =>
                                                    writingStyleTemplates[key as keyof typeof writingStyleTemplates].name === suggestion.style
                                                );
                                                if (templateKey) {
                                                    const enhancedText = applyWritingStyleTemplate(inputMessage, templateKey as keyof typeof writingStyleTemplates);
                                                    setInputMessage(enhancedText);
                                                }
                                            }}
                                        >
                                            적용
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 피드백 버튼 */}
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleFeedback(message.id, 'positive')}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                >
                                    <CheckCircleIcon className="w-3 h-3" />
                                    <span>좋음</span>
                                </button>
                                <button
                                    onClick={() => handleFeedback(message.id, 'negative')}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                    <XCircleIcon className="w-3 h-3" />
                                    <span>나쁨</span>
                                </button>
                                <button
                                    onClick={() => handleFeedback(message.id, 'neutral')}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    <span>보통</span>
                                </button>
                            </div>
                            <span className="text-xs text-gray-500">
                                {message.metadata.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 윤리적 경고 */}
            {selectedFormat === 'gaslighting' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium text-red-800">윤리적 경고</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                        가스라이팅은 심리적 조작을 의미하며, 윤리적으로 문제가 될 수 있습니다.
                        건전한 대화를 위해 다른 형식을 선택해주세요.
                    </p>
                </div>
            )}

            {/* 실시간 글쓰기 품질 모니터링 */}
            {inputMessage && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <ChartBarIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">실시간 글쓰기 품질</span>
                        <div className="ml-auto">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${realTimeQuality.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                                realTimeQuality.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {realTimeQuality.overallScore}점
                            </span>
                        </div>
                    </div>

                    {/* 품질 지표 */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                            <div className="text-xs text-gray-600">가독성</div>
                            <div className="text-sm font-bold text-blue-700">{realTimeQuality.readability}%</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-600">문법</div>
                            <div className="text-sm font-bold text-green-700">{realTimeQuality.grammar}%</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-600">스타일</div>
                            <div className="text-sm font-bold text-purple-700">{realTimeQuality.style}%</div>
                        </div>
                    </div>

                    {/* 개선 제안 */}
                    {realTimeQuality.suggestions.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">💡 개선 제안</div>
                            <div className="space-y-1">
                                {realTimeQuality.suggestions.map((suggestion, index) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border">
                                        <SparklesIcon className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-gray-700">{suggestion}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 자동 글쓰기 개선 버튼 */}
            <button
                onClick={handleAutoImprove}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
            >
                자동 글쓰기 개선
            </button>

            {/* 자동 글쓰기 개선 버튼 */}
            {inputMessage && (
                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <SparklesIcon className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">자동 글쓰기 개선</span>
                        </div>
                        <button
                            onClick={handleAutoImprove}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                            자동 개선
                        </button>
                    </div>
                    <div className="text-xs text-gray-600">
                        문장 길이 최적화, 반복 단어 개선, 문장 시작 다양화를 자동으로 수행합니다.
                    </div>
                </div>
            )}

            {/* 지능형 글쓰기 어시스턴트 버튼 */}
            <button
                onClick={activateWritingAssistant}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
            >
                {writingAssistant.isActive ? "어시스턴트 끄기" : "어시스턴트 켜기"}
            </button>

            {/* 어시스턴트 제안 */}
            {writingAssistant.isActive && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <ChartBarIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">어시스턴트 제안</span>
                        <div className="ml-auto">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${writingAssistant.suggestions.length > 0 ? 'bg-green-100 text-green-800' :
                                writingAssistant.tips.length > 0 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {writingAssistant.suggestions.length > 0 ? "제안" : writingAssistant.tips.length > 0 ? "팁" : "없음"}
                            </span>
                        </div>
                    </div>

                    {/* 제안 및 팁 */}
                    {writingAssistant.suggestions.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">💡 제안</div>
                            <div className="space-y-1">
                                {writingAssistant.suggestions.map((suggestion, index) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border">
                                        <SparklesIcon className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-gray-700">{suggestion}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {writingAssistant.tips.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">💡 팁</div>
                            <div className="space-y-1">
                                {writingAssistant.tips.map((tip, index) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border">
                                        <HeartIcon className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-gray-700">{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 예시 */}
                    {writingAssistant.examples.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">💡 예시</div>
                            <div className="space-y-1">
                                {writingAssistant.examples.map((example, index) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border">
                                        <BeakerIcon className="w-3 h-3 text-teal-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-gray-700">{example}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 현재 집중 주제 */}
                    {writingAssistant.currentFocus && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">💡 현재 집중 주제</div>
                            <div className="text-sm text-gray-600">{writingAssistant.currentFocus}</div>
                        </div>
                    )}
                </div>
            )}

            {/* 고급 문체 분석 */}
            {inputMessage && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <DocumentTextIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">고급 문체 분석</span>
                        <div className="ml-auto">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-purple-100 text-purple-800">
                                {styleAnalysis.styleType}
                            </span>
                        </div>
                    </div>

                    {/* 문체 지표 */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center">
                            <div className="text-xs text-gray-600">격식</div>
                            <div className="text-sm font-bold text-purple-700">{styleAnalysis.formality}%</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-600">정중함</div>
                            <div className="text-sm font-bold text-green-700">{styleAnalysis.politeness}%</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-600">감정</div>
                            <div className="text-sm font-bold text-red-700">{styleAnalysis.emotion}%</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-600">명확성</div>
                            <div className="text-sm font-bold text-blue-700">{styleAnalysis.clarity}%</div>
                        </div>
                        <div className="text-center col-span-2">
                            <div className="text-xs text-gray-600">참여도</div>
                            <div className="text-sm font-bold text-orange-700">{styleAnalysis.engagement}%</div>
                        </div>
                    </div>

                    {/* 개선 제안 */}
                    {styleAnalysis.improvements.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">💡 개선 제안</div>
                            <div className="space-y-1">
                                {styleAnalysis.improvements.map((improvement, index) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border">
                                        <ExclamationTriangleIcon className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-gray-700">{improvement}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UltraAdvancedMessageGenerator; 