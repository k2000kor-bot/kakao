import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatSession } from '../types/chat';
import { Project } from '../types/project';
import chatSessionService from '../services/chatSessionService';
import intelligentResponseEngine from '../services/intelligentResponseEngine';
import advancedAnalysisEngine from '../services/advancedAnalysisEngine';
import adaptiveLearningEngine from '../services/adaptiveLearningEngine';
import externalAIService from '../services/externalAIService';
import voiceRecognitionService from '../services/voiceRecognitionService';
import i18nService from '../services/i18nService';
import predictiveAnalysisEngine from '../services/predictiveAnalysisEngine';
import patternRecognitionEngine from '../services/patternRecognitionEngine';
import automationWorkflowEngine from '../services/automationWorkflowEngine';
import realEstateService from '../services/realEstateService';
import webResearchService from '../services/webResearchService';
import conversationalQAService from '../services/conversationalQAService';
import AIModelSelector from './AIModelSelector';
import RealEstateAlerts from './RealEstateAlerts';
import ConstructionCompanyBiasAnalysis from './ConstructionCompanyBiasAnalysis';
import PredictiveAnalytics from './PredictiveAnalytics';
import AdvancedImageAnalysis from './AdvancedImageAnalysis';
import AdvancedFileLearningHub from './AdvancedFileLearningHub';
import AIResponseQualityAnalyzer from '../messages/AIResponseQualityAnalyzer';
import AdvancedMessageComposer from '../messages/AdvancedMessageComposer';
import IntelligentMessageSuggester from '../messages/IntelligentMessageSuggester';
import MessageTemplateLibrary from '../messages/MessageTemplateLibrary';
import ResponseTemplateManager from '../messages/ResponseTemplateManager';
import ComprehensiveAnalysisSystem from './ComprehensiveAnalysisSystem';
import DetailedConversationalAI from './DetailedConversationalAI';

interface UnifiedChatInterfaceProps {
    currentSession: ChatSession | null;
    currentProject: Project | null;
}

const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({ currentSession, currentProject }) => {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date; type?: string; data?: any }>>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [responseMode, setResponseMode] = useState<'basic' | 'intelligent' | 'advanced' | 'adaptive' | 'external' | 'predictive' | 'pattern' | 'automation' | 'web_research' | 'conversational_qa'>('conversational_qa');
    const [aiConfig, setAiConfig] = useState(externalAIService.getDefaultConfig());
    const [showModelSelector, setShowModelSelector] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentLocale, setCurrentLocale] = useState(i18nService.getLocale());
    const [availableLocales] = useState(i18nService.getSupportedLocales());
    const [showAlerts, setShowAlerts] = useState(false);
    const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

    // 통합 기능 상태
    const [activeFeatures, setActiveFeatures] = useState<{
        biasAnalysis: boolean;
        predictiveAnalytics: boolean;
        imageAnalysis: boolean;
        fileLearning: boolean;
        realEstateAlerts: boolean;
        messageQuality: boolean;
        messageComposer: boolean;
        messageSuggester: boolean;
        templateLibrary: boolean;
        responseManager: boolean;
        comprehensiveAnalysis: boolean;
    }>({
        biasAnalysis: false,
        predictiveAnalytics: false,
        imageAnalysis: false,
        fileLearning: false,
        realEstateAlerts: false,
        messageQuality: false,
        messageComposer: false,
        messageSuggester: false,
        templateLibrary: false,
        responseManager: false,
        comprehensiveAnalysis: false
    });

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [analysisResults, setAnalysisResults] = useState<any>({});
    
    // 종합 분석 시스템 초기화
    const comprehensiveAnalysis = ComprehensiveAnalysisSystem();
    
    // 대화형 AI 시스템 초기화
    const conversationalAI = DetailedConversationalAI();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentSession) {
            const convertedMessages = (currentSession.messages || []).map(msg => ({
                role: msg.isUser ? 'user' as const : 'assistant' as const,
                content: msg.content,
                timestamp: new Date(msg.timestamp)
            }));
            setMessages(convertedMessages);
        }
    }, [currentSession]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        voiceRecognitionService.onResult((result) => {
            if (result.transcript) {
                setInputMessage(result.transcript);
                setIsListening(false);
            }
        });

        voiceRecognitionService.onError((error) => {
            console.error('음성 인식 에러:', error);
            setIsListening(false);
        });

        voiceRecognitionService.onStart(() => setIsListening(true));
        voiceRecognitionService.onEnd(() => setIsListening(false));

        i18nService.onLocaleChange((locale) => {
            setCurrentLocale(locale);
        });

        // 알림 구독
        const handleAlert = (alert: any) => {
            setUnreadAlertsCount(prev => prev + 1);
        };
        realEstateService.subscribeToAlerts(handleAlert);

        return () => {
            voiceRecognitionService.stopRecognition();
            voiceRecognitionService.stopSpeaking();
            realEstateService.unsubscribeFromAlerts(handleAlert);
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

        // 자동 기능 감지 및 활성화
    const detectAndActivateFeatures = (message: string) => {
        const features = {
            biasAnalysis: /시공사|성향|편향|분석/.test(message),
            predictiveAnalytics: /예측|미래|트렌드|분석/.test(message),
            imageAnalysis: /이미지|사진|그림|분석/.test(message),
            fileLearning: /파일|학습|문서|PDF|엑셀/.test(message),
            realEstateAlerts: /부동산|매물|가격|시세/.test(message),
            messageQuality: /품질|품질분석|응답품질/.test(message),
            messageComposer: /메시지작성|작성|컴포저/.test(message),
            messageSuggester: /제안|추천|메시지제안/.test(message),
            templateLibrary: /템플릿|라이브러리|양식/.test(message),
            responseManager: /응답관리|응답템플릿/.test(message),
            comprehensiveAnalysis: /종합분석|통합분석|전체분석|성향분석|여론분석|카카오분석/.test(message)
        };
        
        setActiveFeatures(features);
        return features;
    };

    // 통합 메시지 처리
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !currentSession) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        // 사용자 메시지 추가
        const userMsg = {
            role: 'user' as const,
            content: userMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);

        // 기능 감지 및 활성화
        const detectedFeatures = detectAndActivateFeatures(userMessage);

        try {
            let response = '';
            let responseData: any = {};

            // 기본 AI 응답 생성
            switch (responseMode) {
                case 'intelligent':
                    if (currentSession) {
                        response = await intelligentResponseEngine.generateIntelligentResponse(userMessage, currentSession, currentProject);
                    } else {
                        response = '세션이 선택되지 않았습니다.';
                    }
                    break;
                case 'advanced':
                    if (currentSession) {
                        response = await advancedAnalysisEngine.generateAdvancedResponse(userMessage, currentSession, currentProject);
                    } else {
                        response = '세션이 선택되지 않았습니다.';
                    }
                    break;
                case 'adaptive':
                    if (currentSession) {
                        const adaptiveResponse = await adaptiveLearningEngine.generateAdaptiveResponse(userMessage, '', 'default-user', currentSession, currentProject);
                        response = adaptiveResponse.content;
                    } else {
                        response = '세션이 선택되지 않았습니다.';
                    }
                    break;
                case 'external':
                    if (currentSession) {
                        const aiResponse = await externalAIService.generateResponse(userMessage, currentSession, currentProject, aiConfig);
                        response = aiResponse.content;
                    } else {
                        response = '세션이 선택되지 않았습니다.';
                    }
                    break;
                case 'predictive':
                    const predictiveResult = await predictiveAnalysisEngine.analyzeTrends(userMessage, currentSession || undefined, currentProject);
                    response = formatPredictiveAnalysis(predictiveResult);
                    responseData = { type: 'predictive', data: predictiveResult };
                    break;
                case 'pattern':
                    const patternResult = await patternRecognitionEngine.analyzePatterns(userMessage, currentSession || undefined, currentProject);
                    response = formatPatternAnalysis(patternResult);
                    responseData = { type: 'pattern', data: patternResult };
                    break;
                case 'web_research':
                    try {
                        const researchResult = await webResearchService.researchTopic(userMessage);
                        response = formatWebResearchResult(researchResult);
                        responseData = { type: 'web_research', data: researchResult };
                    } catch (error) {
                        console.error('웹 연구 분석 오류:', error);
                        response = '죄송합니다. 웹 연구 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
                    }
                    break;
                case 'conversational_qa':
                    try {
                        const qaResult = await conversationalQAService.askQuestion(userMessage, currentSession || undefined, currentProject);
                        response = qaResult.answer;
                        responseData = { type: 'conversational_qa', data: qaResult };
                    } catch (error) {
                        console.error('대화형 QA 분석 오류:', error);
                        response = '죄송합니다. 대화형 QA 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
                    }
                    break;
                default:
                    response = '기본 응답: ' + userMessage;
            }

            // 활성화된 기능에 따른 추가 분석
            if (detectedFeatures.biasAnalysis) {
                const biasResult = await simulateBiasAnalysis(userMessage);
                response += '\n\n' + biasResult;
                responseData.biasAnalysis = biasResult;
            }

            if (detectedFeatures.predictiveAnalytics) {
                const predictiveResult = await simulatePredictiveAnalysis(userMessage);
                response += '\n\n' + predictiveResult;
                responseData.predictiveAnalytics = predictiveResult;
            }

            if (detectedFeatures.imageAnalysis && uploadedFiles.length > 0) {
                const imageResult = await simulateImageAnalysis(uploadedFiles[0]);
                response += '\n\n' + imageResult;
                responseData.imageAnalysis = imageResult;
            }
            
            if (detectedFeatures.comprehensiveAnalysis) {
                const comprehensiveResult = await comprehensiveAnalysis.runComprehensiveAnalysis(userMessage);
                const formattedResult = comprehensiveAnalysis.formatAnalysisResult(comprehensiveResult);
                response += '\n\n' + formattedResult;
                responseData.comprehensiveAnalysis = comprehensiveResult;
            }
            
            // 대화형 AI를 통한 상세 설명 추가
            if (responseData.comprehensiveAnalysis || responseData.biasAnalysis || responseData.predictiveAnalytics) {
                const analysisType = responseData.comprehensiveAnalysis ? 'comprehensive' : 
                                   responseData.biasAnalysis ? 'construction_bias' : 'predictive';
                const analysisResult = responseData.comprehensiveAnalysis || responseData.biasAnalysis || responseData.predictiveAnalytics;
                
                try {
                    const detailedResponse = await conversationalAI.generateDetailedResponse(userMessage, analysisResult, analysisType);
                    const conversationalResponse = conversationalAI.formatConversationalResponse(detailedResponse);
                    response += '\n\n' + conversationalResponse;
                } catch (error) {
                    console.error('대화형 AI 응답 생성 오류:', error);
                }
            }

            // 응답 메시지 추가
            const assistantMsg = {
                role: 'assistant' as const,
                content: response,
                timestamp: new Date(),
                type: responseData.type,
                data: responseData
            };
            setMessages(prev => [...prev, assistantMsg]);

            // 세션 업데이트
            if (currentSession) {
                await chatSessionService.addMessage(currentSession.id, userMessage, true);
                await chatSessionService.addMessage(currentSession.id, response, false);
            }

        } catch (error) {
            console.error('메시지 처리 오류:', error);
            setError('메시지 처리 중 오류가 발생했습니다.');

            const errorMsg = {
                role: 'assistant' as const,
                content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // 시뮬레이션 함수들
    const simulateBiasAnalysis = async (message: string) => {
        return `## 🏗️ 시공사 성향 분석 결과

**분석된 메시지**: "${message}"

### 📊 분석 결과
- **대우건설**: 긍정적 성향 (72% 신뢰도)
- **삼성물산**: 중립적 성향 (45% 신뢰도)
- **현대건설**: 부정적 성향 (28% 신뢰도)

### 🎯 주요 발견사항
- 대우건설에 대한 긍정적 언급이 가장 많음
- 기술력과 안전성에 대한 평가가 높음
- 공사비 관련 우려사항이 일부 발견됨`;
    };

    const simulatePredictiveAnalysis = async (message: string) => {
        return `## 🔮 예측 분석 결과

**분석 주제**: "${message}"

### 📈 예측 결과
- **단기 전망 (1-3개월)**: 긍정적 트렌드 예상
- **중기 전망 (3-6개월)**: 안정적 성장 예상
- **장기 전망 (6-12개월)**: 점진적 개선 예상

### 🎯 주요 예측 지표
- 시장 신뢰도: 78% (상승 예상)
- 투자 매력도: 85% (유지 예상)
- 리스크 지수: 22% (하락 예상)`;
    };

    const simulateImageAnalysis = async (file: File) => {
        return `## 🖼️ 이미지 분석 결과

**파일명**: ${file.name}

### 📦 감지된 객체
- 사람 (95% 신뢰도)
- 컴퓨터 (87% 신뢰도)
- 책상 (92% 신뢰도)

### 📝 추출된 텍스트
- "CORBU.AI"
- "지능형 분석 플랫폼"

### 😊 감정 분석
- 집중 (78% 신뢰도)
- 만족 (65% 신뢰도)`;
    };

    const formatPredictiveAnalysis = (analysis: any) => {
        let result = '## 🔮 예측 분석 결과\n\n';
        if (analysis.trends) {
            result += `### 📈 대화 트렌드\n`;
            result += `- **트렌드**: ${analysis.trends.trend}\n`;
            result += `- **신뢰도**: ${(analysis.trends.confidence * 100).toFixed(1)}%\n`;
            result += `- **예측 기간**: ${analysis.trends.timeframe}\n\n`;
        }
        return result;
    };

    const formatPatternAnalysis = (analysis: any) => {
        let result = '## 🔍 패턴 분석 결과\n\n';
        if (analysis.patterns) {
            result += `### 🔄 발견된 패턴\n`;
            analysis.patterns.forEach((pattern: any, index: number) => {
                result += `${index + 1}. **${pattern.name}**: ${pattern.description}\n`;
                result += `   - 빈도: ${pattern.frequency}\n`;
                result += `   - 신뢰도: ${(pattern.confidence * 100).toFixed(1)}%\n\n`;
            });
        }
        return result;
    };

    const formatWebResearchResult = (research: any) => {
        let result = '## 🌐 웹 연구 결과\n\n';
        if (research.sources) {
            result += `### 📚 정보 소스\n`;
            research.sources.forEach((source: any, index: number) => {
                result += `${index + 1}. **${source.title}**\n`;
                result += `   - URL: ${source.url}\n`;
                result += `   - 신뢰도: ${(source.reliability * 100).toFixed(1)}%\n`;
                result += `   - 요약: ${source.summary}\n\n`;
            });
        }
        return result;
    };

    // 파일 업로드 처리
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setUploadedFiles(Array.from(files));
        }
    };

    // 음성 인식 시작/중지
    const toggleVoiceRecognition = () => {
        if (isListening) {
            voiceRecognitionService.stopRecognition();
        } else {
            voiceRecognitionService.startRecognition();
        }
    };

    // 음성 합성 시작/중지
    const toggleVoiceSynthesis = () => {
        if (isSpeaking) {
            voiceRecognitionService.stopSpeaking();
        } else {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
                voiceRecognitionService.speak(lastMessage.content);
            }
        }
    };

    return (
        <div className="unified-chat-interface">
            {/* 헤더 */}
            <div className="chat-header">
                <div className="header-left">
                    <h2>🤖 CORBU.AI 통합 분석 시스템</h2>
                    <p>모든 AI 기능이 통합된 지능형 분석 플랫폼</p>
                </div>
                <div className="header-right">
                    <button
                        className={`voice-button ${isListening ? 'listening' : ''}`}
                        onClick={toggleVoiceRecognition}
                        title={isListening ? '음성 인식 중지' : '음성 인식 시작'}
                    >
                        {isListening ? '🎤' : '🎙️'}
                    </button>
                    <button
                        className={`voice-button ${isSpeaking ? 'speaking' : ''}`}
                        onClick={toggleVoiceSynthesis}
                        title={isSpeaking ? '음성 합성 중지' : '음성 합성 시작'}
                    >
                        {isSpeaking ? '🔊' : '🔈'}
                    </button>
                    <button
                        className="model-selector-button"
                        onClick={() => setShowModelSelector(!showModelSelector)}
                    >
                        ⚙️ AI 모델
                    </button>
                </div>
            </div>

            {/* 활성 기능 표시 */}
            {Object.values(activeFeatures).some(Boolean) && (
                <div className="active-features">
                    <h3>🔄 활성화된 기능</h3>
                    <div className="features-grid">
                        {activeFeatures.biasAnalysis && (
                            <div className="feature-badge bias">🏗️ 시공사 성향 분석</div>
                        )}
                        {activeFeatures.predictiveAnalytics && (
                            <div className="feature-badge predictive">🔮 예측 분석</div>
                        )}
                        {activeFeatures.imageAnalysis && (
                            <div className="feature-badge image">🖼️ 이미지 분석</div>
                        )}
                        {activeFeatures.fileLearning && (
                            <div className="feature-badge learning">🧠 파일 학습</div>
                        )}
                        {activeFeatures.realEstateAlerts && (
                            <div className="feature-badge realestate">🏠 부동산 알림</div>
                        )}
                        {activeFeatures.messageQuality && (
                            <div className="feature-badge quality">📊 응답 품질 분석</div>
                        )}
                        {activeFeatures.messageComposer && (
                            <div className="feature-badge composer">✍️ 메시지 작성</div>
                        )}
                        {activeFeatures.messageSuggester && (
                            <div className="feature-badge suggester">💡 메시지 제안</div>
                        )}
                        {activeFeatures.templateLibrary && (
                            <div className="feature-badge template">📚 템플릿 라이브러리</div>
                        )}
                        {activeFeatures.responseManager && (
                            <div className="feature-badge manager">⚙️ 응답 관리</div>
                        )}
                        {activeFeatures.comprehensiveAnalysis && (
                            <div className="feature-badge comprehensive">🔬 종합 분석</div>
                        )}
                    </div>
                </div>
            )}

            {/* 파일 업로드 영역 */}
            <div className="file-upload-section">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
                <button
                    className="file-upload-button"
                    onClick={() => fileInputRef.current?.click()}
                >
                    📁 파일 업로드
                </button>
                {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                        {uploadedFiles.map((file, index) => (
                            <span key={index} className="file-badge">
                                {file.name} ({(file.size / 1024).toFixed(1)}KB)
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* 메시지 영역 */}
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        <div className="message-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code: (props: any) => {
                                        const { node, inline, className, children, ...restProps } = props;
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline ? (
                                            <pre className="code-block">
                                                <code className={className} {...restProps}>
                                                    {children}
                                                </code>
                                            </pre>
                                        ) : (
                                            <code className="inline-code" {...restProps}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                        <div className="message-timestamp">
                            {message.timestamp.toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant">
                        <div className="loading-indicator">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <p>AI가 분석하고 있습니다...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="input-section">
                <div className="input-container">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="메시지를 입력하세요... (시공사, 예측, 이미지, 파일, 부동산 등 키워드로 자동 기능 활성화)"
                        className="message-input"
                        rows={3}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="send-button"
                    >
                        {isLoading ? '전송 중...' : '전송'}
                    </button>
                </div>
            </div>

            {/* AI 모델 선택기 */}
            {showModelSelector && (
                <AIModelSelector
                    currentMode={responseMode}
                    onModeChange={setResponseMode}
                    aiConfig={aiConfig}
                    onConfigChange={setAiConfig}
                    onClose={() => setShowModelSelector(false)}
                />
            )}

            {/* 부동산 알림 */}
            {showAlerts && (
                <RealEstateAlerts
                    onClose={() => setShowAlerts(false)}
                />
            )}

            {/* 오류 메시지 */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
};

export default UnifiedChatInterface;
