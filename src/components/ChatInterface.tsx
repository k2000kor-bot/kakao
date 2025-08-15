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


interface ChatInterfaceProps {
    currentSession: ChatSession | null;
    currentProject: Project | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentSession, currentProject }) => {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const formatPredictiveAnalysis = (analysis: any) => {
        let result = '## 🔮 예측 분석 결과\n\n';
        if (analysis.trends) {
            result += `### 📈 대화 트렌드\n`;
            result += `- **트렌드**: ${analysis.trends.trend}\n`;
            result += `- **신뢰도**: ${Math.round(analysis.trends.confidence * 100)}%\n`;
            result += `- **예측**: ${analysis.trends.prediction}개 메시지\n`;
            result += `- **기간**: ${analysis.trends.timeframe}\n\n`;
        }
        return result;
    };

    const formatPatternAnalysis = (analysis: any) => {
        let result = '## 🔍 패턴 분석 결과\n\n';
        if (analysis.conversation && analysis.conversation.length > 0) {
            result += `### 💬 대화 패턴\n`;
            analysis.conversation.forEach((pattern: any) => {
                result += `- **${pattern.type}**: ${pattern.context} (신뢰도: ${Math.round(pattern.confidence * 100)}%)\n`;
            });
            result += '\n';
        }
        return result;
    };

    const formatAutomationResults = (results: any) => {
        let result = '## 🤖 자동화 실행 결과\n\n';
        if (results.workflows && results.workflows.length > 0) {
            result += `### ⚙️ 워크플로우 실행\n`;
            results.workflows.forEach((workflow: any) => {
                result += `- **${workflow.action}**: ${workflow.message}\n`;
            });
            result += '\n';
        }
        return result;
    };

    const speakResponse = (text: string) => {
        if (voiceRecognitionService.isSynthesisSupported()) {
            voiceRecognitionService.speak(text, {
                voice: 'ko-KR',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0
            });
            setIsSpeaking(true);
            setTimeout(() => {
                setIsSpeaking(false);
            }, text.length * 100);
        }
    };

    const handleSendMessage = async () => {
        console.log('handleSendMessage 호출됨', { inputMessage, currentSession, responseMode });
        if (!inputMessage.trim()) {
            console.log('메시지가 비어있음');
            return;
        }

        const userMessage = { role: 'user' as const, content: inputMessage, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            let response = '';

            // 시세 조회 질문 감지 및 처리
            const realEstateMatch = inputMessage.match(/시세|부동산|집값|매매가|강남|서초|마포|송파|영등포|종로|중구|용산|성동|광진|투자|등급|히스토리|알림/);
            if (realEstateMatch) {
                // 대시보드 질문 감지
                const dashboardMatch = inputMessage.match(/대시보드|전체|모든|통계|현황|요약/);
                if (dashboardMatch) {
                    response = await realEstateService.generateMarketDashboard();
                } else {
                    // 시세 예측 질문 감지
                    const predictMatch = inputMessage.match(/예측|미래|앞으로|향후|몇개월|개월후/);
                    if (predictMatch) {
                        const regionMatch = inputMessage.match(/(강남|서초|마포|송파|영등포|종로|중구|강남구|서초구|마포구|송파구|영등포구|종로구)/);
                        const monthMatch = inputMessage.match(/(\d+)개월/);
                        const months = monthMatch ? parseInt(monthMatch[1]) : 6;

                        if (regionMatch) {
                            const region = regionMatch[1];
                            response = await realEstateService.predictMarketTrend(region, months);
                        } else {
                            response = `어떤 지역의 시세 예측을 원하시나요?\n\n사용 가능한 지역: ${realEstateService.getAvailableRegions().join(', ')}\n\n예시: "강남구 6개월 후 예측", "서초구 향후 시세 예측"`;
                        }
                    } else {
                        // 시세 비교 질문 감지
                        const compareMatch = inputMessage.match(/비교|vs|대비|차이/);
                        if (compareMatch) {
                            const regions = realEstateService.getAvailableRegions();
                            const mentionedRegions = regions.filter(region =>
                                inputMessage.includes(region.replace('구', '')) || inputMessage.includes(region)
                            );

                            if (mentionedRegions.length >= 2) {
                                response = await realEstateService.compareRegions(mentionedRegions);
                            } else {
                                response = `어떤 지역들을 비교하고 싶으신가요?\n\n사용 가능한 지역: ${regions.join(', ')}\n\n예시: "강남구와 서초구 시세 비교", "마포구 vs 송파구"`;
                            }
                        } else {
                            const regionMatch = inputMessage.match(/(강남|서초|마포|송파|영등포|종로|중구|용산|성동|광진|강남구|서초구|마포구|송파구|영등포구|종로구|용산구|성동구|광진구)/);
                            if (regionMatch) {
                                const region = regionMatch[1];
                                const result = await realEstateService.getRealEstateData(region);

                                if (result.success && result.data) {
                                    response = realEstateService.generateSummary(result.data);
                                } else {
                                    response = `죄송합니다. ${region} 지역의 시세 정보를 찾을 수 없습니다.\n\n사용 가능한 지역: ${realEstateService.getAvailableRegions().join(', ')}`;
                                }
                            } else {
                                // 투자 등급 질문 감지
                                const gradeMatch = inputMessage.match(/투자.*등급|등급.*투자/);
                                if (gradeMatch) {
                                    const regionMatch = inputMessage.match(/(강남|서초|마포|송파|영등포|종로|중구|용산|성동|광진|강남구|서초구|마포구|송파구|영등포구|종로구|용산구|성동구|광진구)/);
                                    if (regionMatch) {
                                        const region = regionMatch[1];
                                        const grade = realEstateService.getInvestmentGrade(region);
                                        response = `🏆 **${region} 투자 등급 평가**\n\n`;
                                        response += `📊 **등급**: ${grade.grade}\n`;
                                        response += `📈 **점수**: ${grade.score}/100점\n`;
                                        response += `📋 **평가 요소**:\n`;
                                        grade.factors.forEach(factor => {
                                            response += `   • ${factor}\n`;
                                        });
                                    } else {
                                        response = `어떤 지역의 투자 등급을 알고 싶으신가요?\n\n사용 가능한 지역: ${realEstateService.getAvailableRegions().join(', ')}\n\n예시: "강남구 투자 등급", "서초구 투자 평가"`;
                                    }
                                } else {
                                    // 히스토리 질문 감지
                                    const historyMatch = inputMessage.match(/히스토리|변화|추이|과거/);
                                    if (historyMatch) {
                                        const regionMatch = inputMessage.match(/(강남|서초|마포|송파|영등포|종로|중구|용산|성동|광진|강남구|서초구|마포구|송파구|영등포구|종로구|용산구|성동구|광진구)/);
                                        if (regionMatch) {
                                            const region = regionMatch[1];
                                            const history = await realEstateService.getPriceHistory(region);
                                            response = `📈 **${region} 시세 히스토리 (최근 6개월)**\n\n`;
                                            history.forEach(item => {
                                                const date = new Date(item.date).toLocaleDateString('ko-KR');
                                                const price = (item.price / 100000000).toFixed(1);
                                                const trendIcon = item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➡️';
                                                response += `${date}: ${price}억원 ${trendIcon}\n`;
                                            });
                                        } else {
                                            response = `어떤 지역의 시세 히스토리를 보고 싶으신가요?\n\n사용 가능한 지역: ${realEstateService.getAvailableRegions().join(', ')}\n\n예시: "강남구 히스토리", "서초구 시세 변화"`;
                                        }
                                    } else {
                                        // 알림 설정 질문 감지
                                        const alertMatch = inputMessage.match(/알림|모니터링|감시/);
                                        if (alertMatch) {
                                            const regionMatch = inputMessage.match(/(강남|서초|마포|송파|영등포|종로|중구|용산|성동|광진|강남구|서초구|마포구|송파구|영등포구|종로구|용산구|성동구|광진구)/);
                                            if (regionMatch) {
                                                const region = regionMatch[1];
                                                realEstateService.startMonitoring([region], { priceChange: 1.0 });
                                                response = `🔔 **${region} 시세 알림 설정 완료**\n\n`;
                                                response += `• 가격 변화 1% 이상 시 알림\n`;
                                                response += `• 시장 상태 변화 시 알림\n`;
                                                response += `• 30초마다 모니터링 중\n\n`;
                                                response += `알림을 받으시려면 브라우저 알림을 허용해주세요.`;
                                            } else {
                                                response = `어떤 지역의 시세 알림을 설정하시겠습니까?\n\n사용 가능한 지역: ${realEstateService.getAvailableRegions().join(', ')}\n\n예시: "강남구 알림 설정", "서초구 모니터링"`;
                                            }
                                        } else {
                                            response = `어떤 지역의 시세를 알고 싶으신가요?\n\n사용 가능한 지역: ${realEstateService.getAvailableRegions().join(', ')}\n\n예시: "강남구 시세 알려줘", "서초 부동산 시세는?"`;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                switch (responseMode) {
                    case 'basic':
                        response = `기본 응답: "${inputMessage}"에 대한 답변입니다. 현재 시간은 ${new Date().toLocaleString('ko-KR')}입니다.`;
                        break;
                    case 'intelligent':
                        if (currentSession) {
                            response = await intelligentResponseEngine.generateIntelligentResponse(inputMessage, currentSession, currentProject);
                        } else {
                            response = '세션이 선택되지 않았습니다.';
                        }
                        break;
                    case 'advanced':
                        if (currentSession) {
                            response = await advancedAnalysisEngine.generateAdvancedResponse(inputMessage, currentSession, currentProject);
                        } else {
                            response = '세션이 선택되지 않았습니다.';
                        }
                        break;
                    case 'adaptive':
                        if (currentSession) {
                            const adaptiveResponse = await adaptiveLearningEngine.generateAdaptiveResponse(inputMessage, '', 'default-user', currentSession, currentProject);
                            response = adaptiveResponse.content;
                        } else {
                            response = '세션이 선택되지 않았습니다.';
                        }
                        break;
                    case 'external':
                        if (currentSession) {
                            const aiResponse = await externalAIService.generateResponse(inputMessage, currentSession, currentProject, aiConfig);
                            response = aiResponse.content;
                        } else {
                            response = '세션이 선택되지 않았습니다.';
                        }
                        break;
                    case 'predictive':
                        const allSessions = await chatSessionService.loadAllChatSessions();
                        const sessionsArray = Object.values(allSessions) as ChatSession[];
                        const predictiveAnalysis = await predictiveAnalysisEngine.runFullAnalysis('default-user', sessionsArray, currentProject);
                        response = formatPredictiveAnalysis(predictiveAnalysis);
                        break;
                    case 'pattern':
                        const allSessionsForPattern = await chatSessionService.loadAllChatSessions();
                        const sessionsArrayForPattern = Object.values(allSessionsForPattern) as ChatSession[];
                        const patternAnalysis = await patternRecognitionEngine.runFullPatternAnalysis(sessionsArrayForPattern, currentProject);
                        response = formatPatternAnalysis(patternAnalysis);
                        break;
                    case 'web_research':
                        try {
                            const webResearchResult = await webResearchService.performWebResearch(inputMessage, {
                                project_id: currentProject?.id || 'gaeposung_project',
                                user_id: 'default_user',
                                conversation_history: messages.map(msg => ({
                                    role: msg.role,
                                    content: msg.content,
                                    timestamp: msg.timestamp
                                })),
                                uploaded_files: []
                            });
                            response = webResearchService.formatWebResearchResponse(webResearchResult);
                        } catch (error) {
                            console.error('웹 연구 분석 오류:', error);
                            response = '죄송합니다. 웹 연구 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
                        }
                        break;
                    case 'conversational_qa':
                        try {
                            console.log('대화형 QA 모드 시작:', inputMessage);
                            const qaResult = await conversationalQAService.askQuestion(inputMessage, {
                                project_id: currentProject?.id || 'gaeposung_project',
                                user_id: 'default_user',
                                session_id: currentSession?.id || 'default_session',
                                conversation_history: messages.map(msg => ({
                                    role: msg.role,
                                    content: msg.content,
                                    timestamp: msg.timestamp
                                })),
                                uploaded_files: []
                            });
                            console.log('대화형 QA 결과:', qaResult);
                            response = conversationalQAService.formatConversationalResponse(qaResult);
                            console.log('포맷된 응답:', response);
                        } catch (error) {
                            console.error('대화형 QA 오류:', error);
                            response = '죄송합니다. 대화형 QA 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
                        }
                        break;
                    case 'automation':
                        if (currentSession) {
                            const workflowContext = {
                                session: currentSession,
                                project: currentProject,
                                userMessage: inputMessage,
                                aiResponse: '',
                                userPatterns: {},
                                projectData: {},
                                timestamp: new Date()
                            };
                            const automationResults = await automationWorkflowEngine.runFullAutomation(workflowContext);
                            response = formatAutomationResults(automationResults);
                        } else {
                            response = '세션이 선택되지 않았습니다.';
                        }
                        break;
                }
            }

            const assistantMessage = { role: 'assistant' as const, content: response, timestamp: new Date() };
            setMessages(prev => [...prev, assistantMessage]);

            // 세션에 메시지 저장
            if (currentSession) {
                const userMessageForSession = {
                    content: inputMessage,
                    isUser: true,
                    timestamp: new Date().toISOString(),
                    sender: 'user'
                };
                const assistantMessageForSession = {
                    content: response,
                    isUser: false,
                    timestamp: new Date().toISOString(),
                    sender: 'assistant'
                };

                await chatSessionService.addMessage(currentSession.id, userMessageForSession);
                await chatSessionService.addMessage(currentSession.id, assistantMessageForSession);
            }

            // 음성 합성으로 응답 읽기 (설정에 따라)
            if (aiConfig.autoSpeak) {
                speakResponse(response);
            }

        } catch (error) {
            console.error('응답 생성 중 오류:', error);
            const errorMessage = { role: 'assistant' as const, content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.', timestamp: new Date() };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        console.log('키 입력 감지', e.key, e.shiftKey);
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log('Enter 키 감지, 메시지 전송 시도');
            handleSendMessage();
        }
    };

    const startVoiceRecognition = () => {
        if (voiceRecognitionService.isRecognitionSupported()) {
            voiceRecognitionService.startRecognition({
                language: currentLocale,
                continuous: false,
                interimResults: false,
                maxAlternatives: 1
            });
        } else {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
        }
    };

    const stopVoiceRecognition = () => {
        voiceRecognitionService.stopRecognition();
    };

    const handleLocaleChange = (locale: string) => {
        i18nService.setLocale(locale);
    };

    const formatMessageTime = (timestamp: Date) => {
        return i18nService.formatDate(timestamp, {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!currentSession) {
        return (
            <div className="chat-interface">
                <div className="no-session-message">
                    {i18nService.t('chat.noSession')}
                </div>
            </div>
        );
    }

    return (
        <div className="chat-interface">
            <div className="chat-header">
                <h2>{currentSession.title}</h2>
                <div className="chat-controls">
                    <select
                        value={currentLocale}
                        onChange={(e) => handleLocaleChange(e.target.value)}
                        className="locale-selector"
                    >
                        {availableLocales.map(locale => (
                            <option key={locale.code} value={locale.code}>
                                {locale.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                        className={`voice-button ${isListening ? 'listening' : ''}`}
                        disabled={!voiceRecognitionService.isRecognitionSupported()}
                        title={isListening ? i18nService.t('voice.stopListening') : i18nService.t('voice.startListening')}
                    >
                        {isListening ? '🔴' : '🎤'}
                    </button>

                    <button
                        onClick={() => isSpeaking ? voiceRecognitionService.stopSpeaking() : null}
                        className={`speak-button ${isSpeaking ? 'speaking' : ''}`}
                        disabled={!isSpeaking}
                        title={i18nService.t('voice.stopSpeaking')}
                    >
                        {isSpeaking ? '🔊' : '🔇'}
                    </button>

                    <button
                        onClick={() => setShowAlerts(true)}
                        className="alerts-button"
                        title="부동산 시세 알림"
                    >
                        🔔 {unreadAlertsCount > 0 && <span className="alert-badge">{unreadAlertsCount}</span>}
                    </button>
                </div>
            </div>

            <div className="response-mode-selector">
                {responseMode === 'conversational_qa' && (
                    <div className="mode-description">
                        <p>💬 <strong>대화형 QA 모드</strong>: 질문을 분석하고 관련 정보를 자동으로 찾아 답변합니다.</p>
                    </div>
                )}
                {responseMode === 'web_research' && (
                    <div className="mode-description">
                        <p>🌐 <strong>웹 연구 모드</strong>: 웹 검색을 통해 실시간 정보를 수집하고 분석합니다.</p>
                    </div>
                )}
                <button
                    className={responseMode === 'basic' ? 'active' : ''}
                    onClick={() => setResponseMode('basic')}
                >
                    {i18nService.t('ai.modes.basic')}
                </button>
                <button
                    className={responseMode === 'intelligent' ? 'active' : ''}
                    onClick={() => setResponseMode('intelligent')}
                >
                    {i18nService.t('ai.modes.intelligent')}
                </button>
                <button
                    className={responseMode === 'advanced' ? 'active' : ''}
                    onClick={() => setResponseMode('advanced')}
                >
                    {i18nService.t('ai.modes.advanced')}
                </button>
                <button
                    className={responseMode === 'adaptive' ? 'active' : ''}
                    onClick={() => setResponseMode('adaptive')}
                >
                    {i18nService.t('ai.modes.adaptive')}
                </button>
                <button
                    className={responseMode === 'external' ? 'active' : ''}
                    onClick={() => setResponseMode('external')}
                >
                    {i18nService.t('ai.modes.external')}
                </button>
                <button
                    className={responseMode === 'predictive' ? 'active' : ''}
                    onClick={() => setResponseMode('predictive')}
                >
                    🔮 예측
                </button>
                <button
                    className={responseMode === 'pattern' ? 'active' : ''}
                    onClick={() => setResponseMode('pattern')}
                >
                    🔍 패턴
                </button>
                <button
                    className={responseMode === 'web_research' ? 'active' : ''}
                    onClick={() => setResponseMode('web_research')}
                >
                    🌐 웹연구
                </button>
                <button
                    className={responseMode === 'conversational_qa' ? 'active' : ''}
                    onClick={() => setResponseMode('conversational_qa')}
                >
                    💬 대화형QA
                </button>
                <button
                    className={responseMode === 'automation' ? 'active' : ''}
                    onClick={() => setResponseMode('automation')}
                >
                    🤖 자동화
                </button>
                {responseMode === 'external' && (
                    <button
                        className="model-selector-button"
                        onClick={() => setShowModelSelector(true)}
                    >
                        ⚙️ {i18nService.t('ai.modelSettings')}
                    </button>
                )}
            </div>

            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        <div className="message-content">
                            <div className="message-text">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        // 코드 블록 스타일링
                                        code: (props: any) => {
                                            const { node, inline, className, children, ...restProps } = props;
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline ? (
                                                <pre className="code-block">
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            ) : (
                                                <code className="inline-code" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        // 링크 스타일링
                                        a: ({ node, children, href, ...props }) => (
                                            <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link" {...props}>
                                                {children}
                                            </a>
                                        ),
                                        // 테이블 스타일링
                                        table: ({ node, children, ...props }) => (
                                            <div className="table-container">
                                                <table className="markdown-table" {...props}>
                                                    {children}
                                                </table>
                                            </div>
                                        )
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                            <div className="message-time">{formatMessageTime(message.timestamp)}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant">
                        <div className="message-content">
                            <div className="loading-indicator">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                {i18nService.t('chat.thinking')}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <div className="input-wrapper">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={i18nService.t('chat.inputPlaceholder')}
                        disabled={isLoading}
                        className="message-input"
                    />
                    <div className="input-actions">
                        <button
                            onClick={() => {
                                console.log('전송 버튼 클릭됨');
                                handleSendMessage();
                            }}
                            disabled={!inputMessage.trim() || isLoading}
                            className="send-button"
                        >
                            {i18nService.t('chat.send')}
                        </button>
                    </div>
                </div>
            </div>

            {showModelSelector && (
                <div className="model-selector-overlay" onClick={() => setShowModelSelector(false)}>
                    <div className="model-selector-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{i18nService.t('ai.modelSettings')}</h3>
                            <button
                                className="close-button"
                                onClick={() => setShowModelSelector(false)}
                            >
                                ×
                            </button>
                        </div>
                        <AIModelSelector
                            currentConfig={aiConfig}
                            onConfigChange={setAiConfig}
                        />
                    </div>
                </div>
            )}

            <RealEstateAlerts
                isVisible={showAlerts}
                onClose={() => {
                    setShowAlerts(false);
                    setUnreadAlertsCount(0);
                }}
            />
        </div>
    );
};

export default ChatInterface;
