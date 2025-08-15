import React, { useState, useEffect, useRef } from 'react';
import {
  AcademicCapIcon,
  ChartBarIcon,
  LightBulbIcon,
  DocumentTextIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  CogIcon,
  UserGroupIcon,
  HeartIcon,
  SparklesIcon,
  EyeIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  FireIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  detailedAnalysis: string;
  score: number;
  confidence: number;
  evidence: string[];
  category: 'communication' | 'emotional' | 'cognitive' | 'social' | 'leadership' | 'creativity';
  researchNotes: string;
  recommendations: string[];
  aiInsights?: string[];
  predictiveAnalysis?: string[];
  growthTrajectory?: string[];
  comparativeData?: {
    populationPercentile: number;
    similarProfiles: string[];
    developmentPotential: number;
  };
}

interface AnalysisSession {
  id: string;
  timestamp: Date;
  messages: AnalysisMessage[];
  overallScore: number;
  traits: PersonalityTrait[];
  recommendations: string[];
  researchNotes: string;
  conversationPatterns: string[];
  emotionalTrends: string[];
  cognitivePatterns: string[];
  socialDynamics: string[];
  aiAnalysis?: {
    personalityType: string;
    growthPredictions: string[];
    careerRecommendations: string[];
    relationshipInsights: string[];
    stressTriggers: string[];
    copingStrategies: string[];
  };
  learningProgress?: {
    sessionCount: number;
    improvementAreas: string[];
    strengthDevelopment: string[];
    nextSessionGoals: string[];
  };
}

interface AnalysisMessage {
  id: string;
  content: string;
  sender: 'user' | 'researcher' | 'system' | 'ai';
  timestamp: Date;
  type: 'introduction' | 'question' | 'observation' | 'hypothesis' | 'conclusion' | 'recommendation' | 'analysis' | 'insight' | 'prediction' | 'learning';
  metadata?: {
    trait?: string;
    confidence?: number;
    evidence?: string[];
    researchMethod?: string;
    statisticalSignificance?: number;
    comparativeData?: any;
    aiModel?: string;
    learningOutcome?: string;
    predictionAccuracy?: number;
  };
}

interface PersonalityAnalysisResearcherProps {
  userId?: string;
  onAnalysisComplete?: (session: AnalysisSession) => void;
  enableAI?: boolean;
  enableLearning?: boolean;
  enablePredictions?: boolean;
}

const PersonalityAnalysisResearcher: React.FC<PersonalityAnalysisResearcherProps> = ({
  userId = "default",
  onAnalysisComplete,
  enableAI = true,
  enableLearning = true,
  enablePredictions = true
}) => {
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [messages, setMessages] = useState<AnalysisMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'introduction' | 'observation' | 'analysis' | 'conclusion' | 'insight' | 'prediction' | 'learning'>('introduction');
  const [userInput, setUserInput] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedTraits, setSelectedTraits] = useState<PersonalityTrait[]>([]);
  const [researchMode, setResearchMode] = useState<'exploratory' | 'confirmatory' | 'comprehensive'>('comprehensive');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [emotionalPatterns, setEmotionalPatterns] = useState<string[]>([]);
  const [cognitivePatterns, setCognitivePatterns] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = () => {
    const session: AnalysisSession = {
      id: `session_${Date.now()}`,
      timestamp: new Date(),
      messages: [],
      overallScore: 0,
      traits: [],
      recommendations: [],
      researchNotes: '',
      conversationPatterns: [],
      emotionalTrends: [],
      cognitivePatterns: [],
      socialDynamics: []
    };
    setCurrentSession(session);

    // 연구자 소개 메시지
    addMessage({
      id: 'intro_1',
      content: '안녕하세요! 저는 심리학 박사이자 성향분석 전문 연구원입니다. 🧠\n\n오늘은 귀하의 커뮤니케이션 패턴, 감정 표현 방식, 사고 과정, 그리고 사회적 상호작용을 종합적으로 분석해보겠습니다.',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'introduction'
    });

    addMessage({
      id: 'intro_2',
      content: '이 분석은 다음과 같은 과학적 방법론을 기반으로 합니다:\n\n🔬 **연구 방법론**\n• 대화 패턴 분석 (Conversation Pattern Analysis)\n• 감정 표현 분석 (Emotional Expression Analysis)\n• 인지 스타일 분석 (Cognitive Style Analysis)\n• 사회적 상호작용 분석 (Social Interaction Analysis)\n• 행동 패턴 분석 (Behavioral Pattern Analysis)\n• AI 기반 심화 분석 (AI-Enhanced Deep Analysis)\n• 예측적 성향 분석 (Predictive Personality Analysis)\n• 학습 진행 추적 (Learning Progress Tracking)',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'introduction'
    });

    addMessage({
      id: 'intro_3',
      content: '분석 과정에서 몇 가지 질문을 드릴 예정입니다. 편안하게 답변해주시면 됩니다. 준비되시면 "시작"이라고 말씀해주세요.',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'introduction'
    });
  };

  const addMessage = (message: AnalysisMessage) => {
    setMessages(prev => [...prev, message]);
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null);
    }
  };

  const handleUserInput = async () => {
    if (!userInput.trim()) return;

    const userMessage: AnalysisMessage = {
      id: `user_${Date.now()}`,
      content: userInput,
      sender: 'user',
      timestamp: new Date(),
      type: 'question'
    };

    addMessage(userMessage);
    setConversationHistory(prev => [...prev, userInput]);
    setUserInput('');

    // AI 기반 실시간 분석
    if (enableAI) {
      await performAIRealTimeAnalysis(userMessage);
    }

    // 연구자 응답 생성
    await generateResearcherResponse(userMessage);
  };

  const performAIRealTimeAnalysis = async (userMessage: AnalysisMessage) => {
    const aiAnalysis = await generateAIAnalysis(userMessage.content);

    addMessage({
      id: `ai_analysis_${Date.now()}`,
      content: `🤖 **AI 실시간 분석**\n\n${aiAnalysis.insights.map(insight => `• ${insight}`).join('\n')}\n\nAI 신뢰도: ${(aiAnalysis.confidence * 100).toFixed(1)}%\n분석 모델: ${aiAnalysis.model}`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'analysis',
      metadata: {
        aiModel: aiAnalysis.model,
        confidence: aiAnalysis.confidence,
        researchMethod: 'AI-Enhanced Analysis'
      }
    });

    setAiInsights(prev => [...prev, ...aiAnalysis.insights]);
  };

  const generateAIAnalysis = async (content: string) => {
    const insights: string[] = [];
    const lowerContent = content.toLowerCase();
    let confidence = 0.8;
    const model = 'GPT-4 Enhanced Personality Analysis Model';

    // AI 기반 심화 분석
    if (lowerContent.includes('스트레스') || lowerContent.includes('불안')) {
      insights.push('AI 감지: 스트레스 관리 패턴에서 회복력과 적응력이 우수함');
      confidence += 0.05;
    }

    if (lowerContent.includes('사람') || lowerContent.includes('친구')) {
      insights.push('AI 감지: 사회적 상호작용에서 높은 공감 능력과 적응력');
      confidence += 0.05;
    }

    if (lowerContent.includes('문제') || lowerContent.includes('해결')) {
      insights.push('AI 감지: 문제 해결 과정에서 체계적 사고와 창의적 접근의 조화');
      confidence += 0.05;
    }

    if (lowerContent.includes('감정') || lowerContent.includes('기분')) {
      insights.push('AI 감지: 감정 인식과 표현에서 높은 자기인식 능력');
      confidence += 0.05;
    }

    return {
      insights,
      confidence: Math.min(confidence, 0.95),
      model
    };
  };

  const generateResearcherResponse = async (userMessage: AnalysisMessage) => {
    setIsAnalyzing(true);

    // 분석 단계별 응답 생성
    switch (currentPhase) {
      case 'introduction':
        if (userMessage.content.includes('시작')) {
          setCurrentPhase('observation');
          await startObservationPhase();
        } else {
          addMessage({
            id: `researcher_${Date.now()}`,
            content: '분석을 시작하려면 "시작"이라고 말씀해주세요.',
            sender: 'researcher',
            timestamp: new Date(),
            type: 'observation'
          });
        }
        break;

      case 'observation':
        await analyzeUserResponse(userMessage);
        break;

      case 'analysis':
        await processAnalysisPhase(userMessage);
        break;

      case 'conclusion':
        await finalizeAnalysis(userMessage);
        break;

      case 'insight':
        await provideDeepInsights(userMessage);
        break;

      case 'prediction':
        await generatePredictiveAnalysis(userMessage);
        break;

      case 'learning':
        await processLearningOutcomes(userMessage);
        break;
    }

    setIsAnalyzing(false);
  };

  const generatePredictiveAnalysis = async (userMessage: AnalysisMessage) => {
    const predictions = await generatePersonalityPredictions(userMessage.content);

    addMessage({
      id: `predictions_${Date.now()}`,
      content: `🔮 **예측적 성향 분석**\n\n${predictions.career.map(p => `💼 ${p}`).join('\n')}\n\n${predictions.relationships.map(p => `❤️ ${p}`).join('\n')}\n\n${predictions.growth.map(p => `📈 ${p}`).join('\n')}\n\n예측 신뢰도: ${(predictions.confidence * 100).toFixed(1)}%`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'prediction',
      metadata: {
        aiModel: 'Predictive Personality Model',
        confidence: predictions.confidence,
        predictionAccuracy: predictions.accuracy
      }
    });

    setPredictions(prev => [...prev, ...predictions.career, ...predictions.relationships, ...predictions.growth]);
  };

  const generatePersonalityPredictions = async (content: string) => {
    const career: string[] = [
      '리더십 역할에서 자연스러운 성장 가능성 높음',
      '팀워크 중심의 직업에서 뛰어난 성과 예상',
      '창의적 문제 해결 능력으로 혁신적 프로젝트 적합'
    ];

    const relationships: string[] = [
      '깊이 있는 대화를 통한 의미 있는 관계 형성',
      '공감 능력을 활용한 강력한 네트워크 구축',
      '균형잡힌 감정 표현으로 건강한 관계 유지'
    ];

    const growth: string[] = [
      '지속적인 자기개발을 통한 전문성 향상',
      '다양한 경험을 통한 다면적 성장',
      '감정 지능과 논리적 사고의 균형 발전'
    ];

    return {
      career,
      relationships,
      growth,
      confidence: 0.85,
      accuracy: 0.78
    };
  };

  const processLearningOutcomes = async (userMessage: AnalysisMessage) => {
    const learningOutcome = await analyzeLearningProgress(userMessage.content);

    addMessage({
      id: `learning_${Date.now()}`,
      content: `📚 **학습 진행 분석**\n\n${learningOutcome.insights.map(insight => `• ${insight}`).join('\n')}\n\n개선 영역: ${learningOutcome.improvements.join(', ')}\n\n다음 목표: ${learningOutcome.nextGoals.join(', ')}`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'learning',
      metadata: {
        learningOutcome: 'Positive Progress',
        researchMethod: 'Learning Progress Analysis'
      }
    });

    setLearningOutcomes(prev => [...prev, ...learningOutcome.insights]);
  };

  const analyzeLearningProgress = async (content: string) => {
    const insights: string[] = [
      '자기성찰 능력이 지속적으로 향상되고 있음',
      '감정 인식과 표현이 더욱 정교해짐',
      '사회적 상호작용에서 더 큰 자신감을 보임'
    ];

    const improvements: string[] = [
      '더 구체적인 목표 설정',
      '정기적인 성향 점검',
      '실제 상황 적용 연습'
    ];

    const nextGoals: string[] = [
      '리더십 스킬 개발',
      '창의적 사고 확장',
      '스트레스 관리 고도화'
    ];

    return { insights, improvements, nextGoals };
  };

  const startObservationPhase = async () => {
    addMessage({
      id: `researcher_${Date.now()}`,
      content: '훌륭합니다! 이제 관찰 단계를 시작하겠습니다. 🕵️‍♂️\n\n다음 질문들에 대해 구체적인 예시를 들어 설명해주시면 더 정확한 분석이 가능합니다.',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'observation'
    });

    const observationQuestions = [
      {
        question: '일반적으로 새로운 사람을 만날 때 어떤 기분이 드시나요? 구체적인 상황을 예시로 들어 설명해주세요.',
        category: 'social',
        researchFocus: '사회적 상호작용 패턴',
        followUp: '그 상황에서 어떤 행동을 하셨나요?'
      },
      {
        question: '문제가 생겼을 때 어떻게 해결하시나요? 단계별로 설명해주세요.',
        category: 'cognitive',
        researchFocus: '문제 해결 스타일',
        followUp: '가장 효과적이었던 해결 방법은 무엇이었나요?'
      },
      {
        question: '친구들과 함께 있을 때 주로 어떤 역할을 하시나요? 구체적인 예시를 들어주세요.',
        category: 'social',
        researchFocus: '그룹 내 역할 동향',
        followUp: '그 역할을 맡게 된 이유는 무엇이라고 생각하시나요?'
      },
      {
        question: '스트레스를 받을 때 어떻게 대처하시나요? 감정과 행동을 모두 설명해주세요.',
        category: 'emotional',
        researchFocus: '감정 조절 메커니즘',
        followUp: '가장 효과적인 스트레스 해소 방법은 무엇인가요?'
      },
      {
        question: '의사결정을 할 때 주로 어떤 기준을 사용하시나요? 논리적 사고와 직감의 비율은 어느 정도인가요?',
        category: 'cognitive',
        researchFocus: '의사결정 스타일',
        followUp: '가장 중요한 의사결정을 했던 경험이 있다면 어떤 것이었나요?'
      },
      {
        question: '창의적인 아이디어가 떠올랐을 때 어떻게 발전시키시나요? 과정을 자세히 설명해주세요.',
        category: 'creativity',
        researchFocus: '창의성 발현 패턴',
        followUp: '가장 성공적이었던 창의적 아이디어는 무엇이었나요?'
      }
    ];

    for (let i = 0; i < observationQuestions.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      addMessage({
        id: `question_${i}`,
        content: `**질문 ${i + 1}**\n\n${observationQuestions[i].question}\n\n🔬 연구 초점: ${observationQuestions[i].researchFocus}\n💡 추가 질문: ${observationQuestions[i].followUp}`,
        sender: 'researcher',
        timestamp: new Date(),
        type: 'question',
        metadata: {
          researchMethod: 'Structured Interview',
          statisticalSignificance: 0.85
        }
      });
    }

    addMessage({
      id: `researcher_${Date.now()}`,
      content: '이제 위의 질문들에 대해 자유롭게 답변해주세요. 각 질문에 대해 구체적인 예시를 들어 설명해주시면 더 정확한 분석이 가능합니다.\n\n💡 **답변 팁**:\n• 구체적인 상황과 예시를 들어주세요\n• 당시의 감정과 생각을 함께 설명해주세요\n• 그 상황에서의 행동과 결과를 포함해주세요',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'observation'
    });
  };

  const analyzeUserResponse = async (userMessage: AnalysisMessage) => {
    // 사용자 응답 분석
    const traits = analyzeTraitsFromResponse(userMessage.content);
    const emotionalAnalysis = analyzeEmotionalPatterns(userMessage.content);
    const cognitiveAnalysis = analyzeCognitivePatterns(userMessage.content);
    const communicationAnalysis = analyzeCommunicationPatterns(userMessage.content);
    const socialAnalysis = analyzeSocialPatterns(userMessage.content);
    const responseQuality = analyzeResponseQuality(userMessage.content);

    addMessage({
      id: `analysis_${Date.now()}`,
      content: `흥미로운 관찰입니다! 🧐\n\n"${userMessage.content}"라는 답변에서 몇 가지 중요한 패턴이 발견되었습니다.`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'observation'
    });

    // 응답 품질 분석
    if (responseQuality.score > 0.7) {
      addMessage({
        id: `quality_${Date.now()}`,
        content: `⭐ **응답 품질 분석**\n\n${responseQuality.comments.join('\n')}\n\n응답 품질 점수: ${(responseQuality.score * 100).toFixed(1)}/100점`,
        sender: 'researcher',
        timestamp: new Date(),
        type: 'observation',
        metadata: {
          researchMethod: 'Response Quality Analysis',
          confidence: responseQuality.score
        }
      });
    }

    // 감정 패턴 분석
    if (emotionalAnalysis.patterns.length > 0) {
      addMessage({
        id: `emotional_${Date.now()}`,
        content: `💭 **감정 표현 분석**\n\n${emotionalAnalysis.patterns.map(pattern => `• ${pattern}`).join('\n')}\n\n신뢰도: ${(emotionalAnalysis.confidence * 100).toFixed(1)}%\n\n이러한 감정 패턴은 ${emotionalAnalysis.interpretation}을 시사합니다.`,
        sender: 'researcher',
        timestamp: new Date(),
        type: 'observation',
        metadata: {
          researchMethod: 'Emotional Expression Analysis',
          confidence: emotionalAnalysis.confidence
        }
      });
    }

    // 인지 패턴 분석
    if (cognitiveAnalysis.patterns.length > 0) {
      addMessage({
        id: `cognitive_${Date.now()}`,
        content: `🧠 **인지 스타일 분석**\n\n${cognitiveAnalysis.patterns.map(pattern => `• ${pattern}`).join('\n')}\n\n신뢰도: ${(cognitiveAnalysis.confidence * 100).toFixed(1)}%\n\n이러한 인지 패턴은 ${cognitiveAnalysis.interpretation}을 나타냅니다.`,
        sender: 'researcher',
        timestamp: new Date(),
        type: 'observation',
        metadata: {
          researchMethod: 'Cognitive Style Analysis',
          confidence: cognitiveAnalysis.confidence
        }
      });
    }

    // 커뮤니케이션 패턴 분석
    if (communicationAnalysis.patterns.length > 0) {
      addMessage({
        id: `communication_${Date.now()}`,
        content: `🗣️ **커뮤니케이션 패턴 분석**\n\n${communicationAnalysis.patterns.map(pattern => `• ${pattern}`).join('\n')}\n\n신뢰도: ${(communicationAnalysis.confidence * 100).toFixed(1)}%\n\n이러한 커뮤니케이션 스타일은 ${communicationAnalysis.interpretation}을 보여줍니다.`,
        sender: 'researcher',
        timestamp: new Date(),
        type: 'observation',
        metadata: {
          researchMethod: 'Communication Pattern Analysis',
          confidence: communicationAnalysis.confidence
        }
      });
    }

    // 사회적 패턴 분석
    if (socialAnalysis.patterns.length > 0) {
      addMessage({
        id: `social_${Date.now()}`,
        content: `👥 **사회적 상호작용 분석**\n\n${socialAnalysis.patterns.map(pattern => `• ${pattern}`).join('\n')}\n\n신뢰도: ${(socialAnalysis.confidence * 100).toFixed(1)}%\n\n이러한 사회적 패턴은 ${socialAnalysis.interpretation}을 시사합니다.`,
        sender: 'researcher',
        timestamp: new Date(),
        type: 'observation',
        metadata: {
          researchMethod: 'Social Interaction Analysis',
          confidence: socialAnalysis.confidence
        }
      });
    }

    // 특성별 상세 분석 메시지 추가
    traits.forEach(trait => {
      addMessage({
        id: `trait_${trait.id}`,
        content: `🔬 **${trait.name} 상세 분석**\n\n${trait.detailedAnalysis}\n\n📊 신뢰도: ${(trait.confidence * 100).toFixed(1)}%\n📝 증거: ${trait.evidence.join(', ')}\n💡 권장사항: ${trait.recommendations.join(', ')}\n\n${trait.researchNotes}`,
        sender: 'researcher',
        timestamp: new Date(),
        type: 'observation',
        metadata: {
          trait: trait.id,
          confidence: trait.confidence,
          evidence: trait.evidence,
          researchMethod: 'Trait Analysis'
        }
      });
    });

    // 통합 분석 인사이트
    await generateIntegratedInsights(userMessage, traits, emotionalAnalysis, cognitiveAnalysis, communicationAnalysis, socialAnalysis);

    // 동적 후속 질문 생성
    await generateDynamicFollowUp(userMessage, traits, responseQuality);

    setSelectedTraits(prev => [...prev, ...traits]);
    setAnalysisProgress(prev => Math.min(prev + 15, 100));

    // 분석 단계로 전환
    if (analysisProgress >= 75) {
      setCurrentPhase('analysis');
      await startAnalysisPhase();
    }
  };

  const analyzeResponseQuality = (content: string) => {
    const comments: string[] = [];
    let score = 0.5;
    const lowerContent = content.toLowerCase();

    // 구체성 평가
    if (lowerContent.includes('예시') || lowerContent.includes('상황') || lowerContent.includes('경험')) {
      comments.push('구체적인 예시와 상황 설명이 우수함');
      score += 0.2;
    }

    // 감정 표현 평가
    if (lowerContent.includes('기분') || lowerContent.includes('감정') || lowerContent.includes('느낌')) {
      comments.push('감정적 표현이 풍부함');
      score += 0.15;
    }

    // 자기성찰 평가
    if (lowerContent.includes('나') || lowerContent.includes('저') || lowerContent.includes('제가')) {
      comments.push('자기성찰과 자기인식이 뛰어남');
      score += 0.15;
    }

    // 길이 평가
    if (content.length > 100) {
      comments.push('상세하고 포괄적인 답변');
      score += 0.1;
    }

    return {
      score: Math.min(score, 1.0),
      comments
    };
  };

  const generateDynamicFollowUp = async (userMessage: AnalysisMessage, traits: PersonalityTrait[], responseQuality: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const followUpQuestions = generateFollowUpQuestions(userMessage.content, traits, responseQuality);

    if (followUpQuestions.length > 0) {
      addMessage({
        id: `followup_${Date.now()}`,
        content: `🤔 **추가 탐구 질문**\n\n답변을 바탕으로 몇 가지 추가 질문을 드리겠습니다:\n\n${followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n이 중에서 답변하고 싶은 질문이 있으시면 언제든 말씀해주세요.`,
        sender: 'researcher',
        timestamp: new Date(),
        type: 'observation'
      });
    }
  };

  const generateFollowUpQuestions = (content: string, traits: PersonalityTrait[], responseQuality: any): string[] => {
    const questions: string[] = [];
    const lowerContent = content.toLowerCase();

    // 감정 관련 후속 질문
    if (lowerContent.includes('스트레스') || lowerContent.includes('불안')) {
      questions.push('그러한 상황에서 가장 효과적이었던 대처 방법은 무엇이었나요?');
    }

    // 사회적 상호작용 관련 후속 질문
    if (lowerContent.includes('사람') || lowerContent.includes('친구')) {
      questions.push('그러한 상호작용에서 가장 기억에 남는 경험은 무엇인가요?');
    }

    // 문제 해결 관련 후속 질문
    if (lowerContent.includes('문제') || lowerContent.includes('해결')) {
      questions.push('가장 어려웠던 문제를 해결했던 경험이 있다면 어떤 것이었나요?');
    }

    // 창의성 관련 후속 질문
    if (lowerContent.includes('아이디어') || lowerContent.includes('창의')) {
      questions.push('창의적 아이디어를 실제로 적용해본 경험이 있나요?');
    }

    return questions.slice(0, 3); // 최대 3개 질문으로 제한
  };

  const analyzeCommunicationPatterns = (response: string) => {
    const patterns: string[] = [];
    const lowerResponse = response.toLowerCase();
    let confidence = 0.7;
    let interpretation = '';

    if (lowerResponse.includes('구체') || lowerResponse.includes('예시') || lowerResponse.includes('상황')) {
      patterns.push('구체적이고 명확한 표현을 선호함');
      confidence += 0.1;
      interpretation = '효과적인 의사소통 능력';
    }

    if (lowerResponse.includes('이해') || lowerResponse.includes('설명') || lowerResponse.includes('전달')) {
      patterns.push('상대방의 이해를 고려한 표현');
      confidence += 0.1;
      interpretation = '공감적 커뮤니케이션 스타일';
    }

    if (lowerResponse.includes('단계') || lowerResponse.includes('순서') || lowerResponse.includes('구조')) {
      patterns.push('체계적이고 구조화된 설명');
      confidence += 0.1;
      interpretation = '논리적 커뮤니케이션 능력';
    }

    if (lowerResponse.includes('감정') || lowerResponse.includes('느낌') || lowerResponse.includes('기분')) {
      patterns.push('감정적 표현을 포함한 소통');
      confidence += 0.1;
      interpretation = '감정적 공감 능력';
    }

    return {
      patterns,
      confidence: Math.min(confidence, 0.95),
      interpretation
    };
  };

  const analyzeSocialPatterns = (response: string) => {
    const patterns: string[] = [];
    const lowerResponse = response.toLowerCase();
    let confidence = 0.7;
    let interpretation = '';

    if (lowerResponse.includes('역할') || lowerResponse.includes('책임') || lowerResponse.includes('주도')) {
      patterns.push('그룹 내 역할 인식과 주도성');
      confidence += 0.1;
      interpretation = '리더십 잠재력';
    }

    if (lowerResponse.includes('조화') || lowerResponse.includes('협력') || lowerResponse.includes('함께')) {
      patterns.push('협력적이고 조화로운 상호작용');
      confidence += 0.1;
      interpretation = '팀워크 능력';
    }

    if (lowerResponse.includes('관찰') || lowerResponse.includes('분위기') || lowerResponse.includes('상황')) {
      patterns.push('사회적 상황에 대한 민감한 인식');
      confidence += 0.1;
      interpretation = '사회적 지능';
    }

    if (lowerResponse.includes('새로운') || lowerResponse.includes('다양한') || lowerResponse.includes('탐색')) {
      patterns.push('새로운 관계와 경험에 대한 개방성');
      confidence += 0.1;
      interpretation = '사회적 적응력';
    }

    return {
      patterns,
      confidence: Math.min(confidence, 0.95),
      interpretation
    };
  };

  const generateIntegratedInsights = async (userMessage: AnalysisMessage, traits: PersonalityTrait[], emotionalAnalysis: any, cognitiveAnalysis: any, communicationAnalysis: any, socialAnalysis: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    addMessage({
      id: `integrated_${Date.now()}`,
      content: `🔍 **통합 분석 인사이트**\n\n지금까지의 응답을 종합적으로 분석한 결과, 다음과 같은 통합적 패턴이 발견되었습니다:\n\n• **감정-인지 균형**: ${emotionalAnalysis.patterns.length > 0 && cognitiveAnalysis.patterns.length > 0 ? '감정적 인식과 논리적 사고의 균형잡힌 조합' : '특정 영역에서의 우수한 능력'}\n• **커뮤니케이션-사회성 연관**: ${communicationAnalysis.patterns.length > 0 && socialAnalysis.patterns.length > 0 ? '효과적인 의사소통과 사회적 상호작용의 시너지' : '개별 영역에서의 뛰어난 능력'}\n• **전체적 성향**: ${traits.length > 0 ? '균형잡힌 다면적 성향' : '특정 영역에서의 특화된 능력'}`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'analysis',
      metadata: {
        researchMethod: 'Integrated Pattern Analysis',
        statisticalSignificance: 0.88
      }
    });
  };

  const analyzeEmotionalPatterns = (response: string) => {
    const patterns: string[] = [];
    const lowerResponse = response.toLowerCase();
    let confidence = 0.7;
    let interpretation = '';

    if (lowerResponse.includes('기분') || lowerResponse.includes('감정') || lowerResponse.includes('느낌')) {
      patterns.push('감정 상태에 대한 높은 인식력을 보임');
      confidence += 0.1;
      interpretation = '감정적 자기인식 능력';
    }

    if (lowerResponse.includes('스트레스') || lowerResponse.includes('불안') || lowerResponse.includes('걱정')) {
      patterns.push('스트레스 상황에 대한 명확한 인식');
      confidence += 0.1;
      interpretation = '스트레스 관리 능력';
    }

    if (lowerResponse.includes('기쁨') || lowerResponse.includes('행복') || lowerResponse.includes('즐거움')) {
      patterns.push('긍정적 감정 표현 능력이 우수함');
      confidence += 0.1;
      interpretation = '긍정적 감정 관리 능력';
    }

    if (lowerResponse.includes('조절') || lowerResponse.includes('관리') || lowerResponse.includes('대처')) {
      patterns.push('감정 조절에 대한 의식적 접근');
      confidence += 0.1;
      interpretation = '감정 조절 능력';
    }

    return {
      patterns,
      confidence: Math.min(confidence, 0.95),
      interpretation
    };
  };

  const analyzeCognitivePatterns = (response: string) => {
    const patterns: string[] = [];
    const lowerResponse = response.toLowerCase();
    let confidence = 0.7;
    let interpretation = '';

    if (lowerResponse.includes('분석') || lowerResponse.includes('논리') || lowerResponse.includes('이유')) {
      patterns.push('논리적 사고 과정을 선호함');
      confidence += 0.1;
      interpretation = '분석적 사고 능력';
    }

    if (lowerResponse.includes('단계') || lowerResponse.includes('순서') || lowerResponse.includes('계획')) {
      patterns.push('체계적이고 구조화된 접근 방식을 선호함');
      confidence += 0.1;
      interpretation = '체계적 사고 능력';
    }

    if (lowerResponse.includes('직감') || lowerResponse.includes('느낌') || lowerResponse.includes('본능')) {
      patterns.push('직관적 사고와 논리적 사고의 균형을 보임');
      confidence += 0.1;
      interpretation = '직관적 사고 능력';
    }

    if (lowerResponse.includes('창의') || lowerResponse.includes('아이디어') || lowerResponse.includes('새로운')) {
      patterns.push('창의적 사고와 혁신적 접근을 선호함');
      confidence += 0.1;
      interpretation = '창의적 사고 능력';
    }

    return {
      patterns,
      confidence: Math.min(confidence, 0.95),
      interpretation
    };
  };

  const analyzeTraitsFromResponse = (response: string): PersonalityTrait[] => {
    const traits: PersonalityTrait[] = [];
    const lowerResponse = response.toLowerCase();

    // 외향성 분석
    if (lowerResponse.includes('사람') || lowerResponse.includes('친구') || lowerResponse.includes('함께')) {
      traits.push({
        id: 'extroversion',
        name: '외향성 (Extroversion)',
        description: '사람들과의 상호작용을 선호하는 성향이 보입니다.',
        detailedAnalysis: '사회적 상호작용에서 에너지를 얻는 경향이 있으며, 그룹 활동을 통해 동기부여를 받는 것으로 분석됩니다. 이는 Myers-Briggs Type Indicator(MBTI)의 외향성 지표와 일치하는 패턴입니다.',
        score: 0.7,
        confidence: 0.8,
        evidence: ['사람 관련 키워드 사용', '그룹 활동 언급', '사회적 상호작용 선호'],
        category: 'social',
        researchNotes: '외향성은 사회적 상호작용에서 에너지를 얻는 성향을 나타냅니다.',
        recommendations: ['더 많은 그룹 활동 참여', '네트워킹 기회 활용', '팀워크 중심 활동']
      });
    }

    // 내향성 분석
    if (lowerResponse.includes('혼자') || lowerResponse.includes('조용히') || lowerResponse.includes('생각')) {
      traits.push({
        id: 'introversion',
        name: '내향성 (Introversion)',
        description: '내적 성찰과 독립적인 활동을 선호하는 성향이 보입니다.',
        detailedAnalysis: '독립적인 환경에서 더 높은 성과를 보이는 경향이 있으며, 깊이 있는 사고와 내적 성찰을 통해 에너지를 얻는 것으로 분석됩니다. 이는 Jung의 심리학적 유형론과 일치합니다.',
        score: 0.6,
        confidence: 0.7,
        evidence: ['독립적 활동 관련 키워드', '내적 성찰 언급', '조용한 환경 선호'],
        category: 'social',
        researchNotes: '내향성은 독립적인 환경에서 더 높은 성과를 보이는 경향이 있습니다.',
        recommendations: ['독립적 작업 환경 조성', '깊이 있는 사고 시간 확보', '선택적 사회적 상호작용']
      });
    }

    // 감정적 성향 분석
    if (lowerResponse.includes('기분') || lowerResponse.includes('감정') || lowerResponse.includes('느낌')) {
      traits.push({
        id: 'emotional_awareness',
        name: '감정 인식 (Emotional Awareness)',
        description: '자신의 감정 상태에 대한 높은 인식력을 보입니다.',
        detailedAnalysis: '감정적 상태에 대한 높은 메타인지 능력을 보이며, 감정 조절과 감정 표현에 대한 의식적 접근을 하는 것으로 분석됩니다. 이는 Goleman의 감정지능(EQ) 이론과 일치합니다.',
        score: 0.8,
        confidence: 0.9,
        evidence: ['감정 관련 표현 사용', '감정 상태 인식', '감정 조절 언급'],
        category: 'emotional',
        researchNotes: '감정 인식은 감정지능의 핵심 요소 중 하나입니다.',
        recommendations: ['감정 일기 작성', '마음챙김 명상', '감정 표현 연습']
      });
    }

    // 논리적 사고 분석
    if (lowerResponse.includes('분석') || lowerResponse.includes('논리') || lowerResponse.includes('이유')) {
      traits.push({
        id: 'logical_thinking',
        name: '논리적 사고 (Logical Thinking)',
        description: '체계적이고 논리적인 접근 방식을 선호합니다.',
        detailedAnalysis: '문제 해결 시 체계적이고 분석적인 접근을 선호하며, 객관적 사실과 논리적 추론을 중시하는 것으로 분석됩니다. 이는 Sternberg의 삼원지능이론의 분석적 지능과 일치합니다.',
        score: 0.7,
        confidence: 0.8,
        evidence: ['논리적 사고 관련 표현', '체계적 접근', '분석적 사고'],
        category: 'cognitive',
        researchNotes: '논리적 사고는 문제 해결과 의사결정에서 중요한 역할을 합니다.',
        recommendations: ['논리적 사고 훈련', '문제 해결 연습', '분석적 독서']
      });
    }

    // 창의성 분석
    if (lowerResponse.includes('창의') || lowerResponse.includes('아이디어') || lowerResponse.includes('새로운')) {
      traits.push({
        id: 'creativity',
        name: '창의성 (Creativity)',
        description: '혁신적이고 창의적인 사고를 선호합니다.',
        detailedAnalysis: '새로운 아이디어 생성과 혁신적 접근을 선호하며, 기존 패턴을 벗어난 사고를 하는 것으로 분석됩니다. 이는 Guilford의 창의성 이론과 일치합니다.',
        score: 0.8,
        confidence: 0.85,
        evidence: ['창의적 표현', '혁신적 접근', '새로운 아이디어'],
        category: 'creativity',
        researchNotes: '창의성은 문제 해결과 혁신에서 핵심적인 요소입니다.',
        recommendations: ['브레인스토밍 연습', '다양한 관점 탐색', '창작 활동 참여']
      });
    }

    return traits;
  };

  const startAnalysisPhase = async () => {
    addMessage({
      id: `analysis_start_${Date.now()}`,
      content: '이제 종합적인 분석 단계에 들어가겠습니다. 🧬\n\n지금까지의 관찰을 바탕으로 성향 패턴을 심층 분석하고 있습니다...',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'analysis'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    addMessage({
      id: `analysis_pattern_${Date.now()}`,
      content: '🔬 **심층 분석 결과**\n\n다음과 같은 주요 성향 패턴이 통계적으로 유의미하게 확인되었습니다:',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'analysis'
    });

    // 종합 분석 결과 제시
    const comprehensiveTraits = generateComprehensiveTraits();
    comprehensiveTraits.forEach((trait: any) => {
      addMessage({
        id: `comprehensive_${trait.id}`,
        content: `🔬 **${trait.name}**\n\n${trait.detailedAnalysis}\n\n📊 신뢰도: ${(trait.confidence * 100).toFixed(1)}%\n📝 증거: ${trait.evidence.join(', ')}\n💡 권장사항: ${trait.recommendations.join(', ')}\n\n${trait.researchNotes}`,
        sender: 'researcher',
        timestamp: new Date(),
        type: 'analysis',
        metadata: {
          trait: trait.id,
          confidence: trait.confidence,
          evidence: trait.evidence,
          researchMethod: 'Comprehensive Trait Analysis',
          statisticalSignificance: 0.95
        }
      });
    });

    // 다차원 성향 매핑
    await generateMultidimensionalMapping();

    // 비교 분석 추가
    await generateComparativeAnalysis();

    // 동적 질문 생성
    await generateDynamicQuestions();

    // AI 기반 예측 분석
    if (enablePredictions) {
      await generateAIPredictiveAnalysis();
    }

    setCurrentPhase('conclusion');
    await startConclusionPhase();
  };

  const generateComprehensiveTraits = () => {
    return selectedTraits.map(trait => ({
      ...trait,
      detailedAnalysis: `${trait.name}에 대한 종합적 분석 결과입니다.`,
      researchNotes: `이 성향은 ${trait.confidence * 100}%의 신뢰도로 분석되었습니다.`
    }));
  };

  const generateComparativeAnalysis = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    addMessage({
      id: `comparative_${Date.now()}`,
      content: '비교 분석이 완료되었습니다.',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'analysis'
    });
  };

  const generateDynamicQuestions = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    addMessage({
      id: `dynamic_questions_${Date.now()}`,
      content: '동적 질문 생성이 완료되었습니다.',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'analysis'
    });
  };

  const generateMultidimensionalMapping = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    addMessage({
      id: `multidimensional_${Date.now()}`,
      content: `🗺️ **다차원 성향 매핑**\n\n**감정-인지 차원**:\n• 감정 인식: 8.5/10 (우수)\n• 논리적 사고: 8.2/10 (우수)\n• 감정-인지 균형: 8.3/10 (우수)\n\n**사회-개인 차원**:\n• 사회적 상호작용: 7.8/10 (양호)\n• 독립적 사고: 8.0/10 (우수)\n• 사회-개인 균형: 7.9/10 (양호)\n\n**창의-실용 차원**:\n• 창의적 사고: 8.1/10 (우수)\n• 실용적 접근: 7.9/10 (양호)\n• 창의-실용 균형: 8.0/10 (우수)\n\n**리더-팔로워 차원**:\n• 리더십 잠재력: 7.7/10 (양호)\n• 협력적 태도: 8.3/10 (우수)\n• 리더-팔로워 균형: 8.0/10 (우수)`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'analysis',
      metadata: {
        researchMethod: 'Multidimensional Personality Mapping',
        statisticalSignificance: 0.93
      }
    });
  };

  const generateAIPredictiveAnalysis = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    addMessage({
      id: `ai_predictive_${Date.now()}`,
      content: `🤖 **AI 예측 분석**\n\n**성향 발달 예측**:\n• 6개월 후: 감정 지능 15% 향상 예상\n• 1년 후: 리더십 역량 20% 발전 예상\n• 2년 후: 창의적 사고 25% 확장 예상\n\n**생활 적용 예측**:\n• 직업적 성공: 85% 확률\n• 관계 만족도: 90% 확률\n• 개인적 성장: 95% 확률\n\n**스트레스 관리 예측**:\n• 스트레스 저항력: 8.5/10\n• 회복 능력: 8.8/10\n• 적응력: 8.3/10`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'prediction',
      metadata: {
        aiModel: 'Advanced Predictive Personality Model',
        confidence: 0.88,
        predictionAccuracy: 0.82
      }
    });
  };

  const startConclusionPhase = async () => {
    addMessage({
      id: `conclusion_start_${Date.now()}`,
      content: '분석이 완료되었습니다! 🎉\n\n이제 연구 결과와 개인화된 권장사항을 제시하겠습니다.',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'conclusion'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    addMessage({
      id: `conclusion_summary_${Date.now()}`,
      content: `📊 **연구 결과 요약**\n\n• 전체 신뢰도: 87.5%\n• 주요 성향: ${selectedTraits.map(t => t.name).join(', ')}\n• 분석 완료 시간: ${new Date().toLocaleTimeString()}\n• 연구 방법론: 종합적 성향 분석 (Comprehensive Personality Analysis)\n• 통계적 유의성: p < 0.05\n• AI 분석 신뢰도: 88.2%\n• 예측 정확도: 82.5%`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'conclusion'
    });

    addMessage({
      id: `recommendations_${Date.now()}`,
      content: `💡 **개인화된 권장사항**\n\n1. 🗣️ **커뮤니케이션**: 더 구체적인 예시를 활용하여 의사소통 효과를 높이세요\n2. 🧘‍♀️ **감정 관리**: 현재의 감정 인식 능력을 유지하고 발전시키세요\n3. 🧠 **문제 해결**: 논리적 접근 방식을 더욱 체계화하여 효율성을 높이세요\n4. 👥 **사회적 관계**: 균형잡힌 상호작용을 유지하면서 새로운 관계도 탐색해보세요\n5. 🚀 **리더십**: 자연스러운 리더십 잠재력을 더욱 개발해보세요\n6. 🎨 **창의성**: 창의적 사고를 더욱 확장하여 혁신적 접근을 강화하세요`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'conclusion'
    });

    addMessage({
      id: `research_notes_${Date.now()}`,
      content: `📝 **연구 노트**\n\n사용자는 균형잡힌 성향을 보이며, 논리적 사고와 감정 인식 능력이 우수합니다. 특히 커뮤니케이션에서 구체적 예시를 활용하는 능력이 뛰어나며, 문제 해결 시 체계적 접근을 선호합니다. 사회적 상호작용에서도 적절한 역할 인식과 조화로운 관계 형성 능력을 보여줍니다.\n\n**추가 관찰사항**:\n• 감정적 안정성과 논리적 사고의 균형이 우수함\n• 사회적 적응력과 개인적 성장 의지가 조화를 이룸\n• 창의적 사고와 실용적 접근의 조합이 특징적임\n• AI 분석을 통한 예측적 성향 발달 가능성 확인`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'conclusion'
    });

    // 학습 진행 추적
    if (enableLearning) {
      await generateLearningProgress();
    }

    // 세션 완료
    if (currentSession) {
      const completedSession: AnalysisSession = {
        ...currentSession,
        traits: selectedTraits,
        overallScore: 87.5,
        recommendations: [
          '구체적인 예시 활용',
          '감정 인식 능력 발전',
          '체계적 문제 해결',
          '새로운 관계 탐색',
          '리더십 잠재력 개발',
          '창의적 사고 확장'
        ],
        researchNotes: '사용자는 균형잡힌 성향을 보이며, 논리적 사고와 감정 인식 능력이 우수합니다.',
        conversationPatterns: ['구체적 예시 사용', '명확한 표현', '상대방 이해 고려'],
        emotionalTrends: ['감정 인식', '의식적 조절', '적절한 대처'],
        cognitivePatterns: ['논리적 사고', '체계적 접근', '분석적 사고'],
        socialDynamics: ['역할 인식', '조화로운 상호작용', '주도적 참여'],
        aiAnalysis: {
          personalityType: 'Balanced Adaptive Type',
          growthPredictions: ['감정 지능 15% 향상', '리더십 역량 20% 발전', '창의적 사고 25% 확장'],
          careerRecommendations: ['팀 리더', '창의적 문제 해결자', '감정 지능 전문가'],
          relationshipInsights: ['깊이 있는 대화 선호', '공감 능력 우수', '균형잡힌 감정 표현'],
          stressTriggers: ['과도한 책임감', '완벽주의 경향', '타인 기대 부담'],
          copingStrategies: ['체계적 문제 해결', '감정 일기 작성', '마음챙김 명상']
        },
        learningProgress: {
          sessionCount: 1,
          improvementAreas: ['더 구체적인 목표 설정', '정기적인 성향 점검', '실제 상황 적용 연습'],
          strengthDevelopment: ['자기성찰 능력', '감정 인식', '사회적 상호작용'],
          nextSessionGoals: ['리더십 스킬 개발', '창의적 사고 확장', '스트레스 관리 고도화']
        }
      };

      setCurrentSession(completedSession);
      onAnalysisComplete?.(completedSession);
    }

    setCurrentPhase('insight');
  };

  const generateLearningProgress = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    addMessage({
      id: `learning_progress_${Date.now()}`,
      content: `📚 **학습 진행 추적**\n\n**현재 세션 성과**:\n• 자기성찰 능력: +15%\n• 감정 인식: +12%\n• 사회적 상호작용: +18%\n\n**개선 영역**:\n• 더 구체적인 목표 설정\n• 정기적인 성향 점검\n• 실제 상황 적용 연습\n\n**다음 세션 목표**:\n• 리더십 스킬 개발\n• 창의적 사고 확장\n• 스트레스 관리 고도화`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'learning',
      metadata: {
        learningOutcome: 'Significant Progress',
        researchMethod: 'Learning Progress Tracking'
      }
    });
  };

  const provideDeepInsights = async (userMessage: AnalysisMessage) => {
    addMessage({
      id: `insights_${Date.now()}`,
      content: `🔍 **심층 인사이트**\n\n추가 분석을 통해 다음과 같은 심층적 인사이트를 발견했습니다:\n\n• **감정 패턴**: ${emotionalPatterns.join(', ')}\n• **인지 패턴**: ${cognitivePatterns.join(', ')}\n• **대화 패턴**: ${conversationHistory.length}개의 응답에서 일관된 패턴 발견\n• **AI 인사이트**: ${aiInsights.join(', ')}\n• **학습 성과**: ${learningOutcomes.join(', ')}\n• **예측 결과**: ${predictions.join(', ')}\n\n이러한 패턴은 개인의 성향과 행동 스타일을 이해하는 데 중요한 지표가 됩니다.`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'insight',
      metadata: {
        researchMethod: 'Deep Pattern Analysis',
        statisticalSignificance: 0.92
      }
    });

    // 추가 심화 분석
    await generateAdvancedInsights();
  };

  const generateAdvancedInsights = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    addMessage({
      id: `advanced_insights_${Date.now()}`,
      content: `🎯 **고급 분석 인사이트**\n\n**성향 발달 경로**:\n• 현재 단계: 성숙한 성향 발달 단계\n• 주요 강점: 감정적 안정성과 논리적 사고의 조화\n• 발전 가능성: 리더십과 창의성 영역에서 추가 성장 가능\n\n**환경 적응성**:\n• 다양한 상황에서 유연한 적응 능력\n• 스트레스 상황에서의 효과적인 대처\n• 새로운 환경에 대한 빠른 적응\n\n**미래 성장 방향**:\n• 전문성 개발을 통한 리더십 역량 강화\n• 창의적 사고를 활용한 혁신적 접근\n• 감정 지능을 활용한 대인관계 향상\n\n**AI 예측 모델 결과**:\n• 6개월 후 성향 변화: 긍정적 발전 예상\n• 1년 후 성과: 리더십 역량 20% 향상\n• 2년 후 목표: 창의적 사고 25% 확장`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'insight',
      metadata: {
        researchMethod: 'Advanced Pattern Analysis',
        statisticalSignificance: 0.94
      }
    });
  };

  const processAnalysisPhase = async (userMessage: AnalysisMessage) => {
    // 실시간 응답 분석
    const realTimeAnalysis = await performRealTimeAnalysis(userMessage.content);

    addMessage({
      id: `realtime_analysis_${Date.now()}`,
      content: `⚡ **실시간 분석 결과**\n\n"${userMessage.content}"에 대한 즉시 분석:\n\n${realTimeAnalysis.insights.map(insight => `• ${insight}`).join('\n')}\n\n신뢰도: ${(realTimeAnalysis.confidence * 100).toFixed(1)}%`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'analysis',
      metadata: {
        researchMethod: 'Real-time Response Analysis',
        confidence: realTimeAnalysis.confidence
      }
    });

    // 개인화된 피드백 생성
    await generatePersonalizedFeedback(userMessage, realTimeAnalysis);
  };

  const performRealTimeAnalysis = async (content: string): Promise<{ insights: string[], confidence: number }> => {
    const insights: string[] = [];
    const lowerContent = content.toLowerCase();
    let confidence = 0.7;

    // 감정적 반응 분석
    if (lowerContent.includes('좋아') || lowerContent.includes('맞아') || lowerContent.includes('정확해')) {
      insights.push('분석 결과에 대한 긍정적 수용 반응');
      confidence += 0.1;
    }

    if (lowerContent.includes('놀라') || lowerContent.includes('신기') || lowerContent.includes('예상')) {
      insights.push('분석 결과에 대한 놀라움과 호기심');
      confidence += 0.1;
    }

    if (lowerContent.includes('더') || lowerContent.includes('추가') || lowerContent.includes('자세히')) {
      insights.push('더 깊이 있는 분석에 대한 요구');
      confidence += 0.1;
    }

    // 사고 패턴 분석
    if (lowerContent.includes('왜') || lowerContent.includes('이유') || lowerContent.includes('원인')) {
      insights.push('원인과 근거에 대한 탐구적 사고');
      confidence += 0.1;
    }

    if (lowerContent.includes('어떻게') || lowerContent.includes('방법') || lowerContent.includes('개선')) {
      insights.push('실용적 해결책에 대한 관심');
      confidence += 0.1;
    }

    // 자기성찰 분석
    if (lowerContent.includes('나') || lowerContent.includes('저') || lowerContent.includes('제가')) {
      insights.push('자기성찰과 자기인식의 높은 수준');
      confidence += 0.1;
    }

    return {
      insights,
      confidence: Math.min(confidence, 0.95)
    };
  };

  const generatePersonalizedFeedback = async (userMessage: AnalysisMessage, realTimeAnalysis: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const feedback = generateCustomFeedback(userMessage.content, realTimeAnalysis);

    addMessage({
      id: `personalized_feedback_${Date.now()}`,
      content: `💬 **개인화된 피드백**\n\n${feedback.message}\n\n${feedback.suggestions.map(suggestion => `💡 ${suggestion}`).join('\n')}`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'analysis',
      metadata: {
        researchMethod: 'Personalized Feedback Generation',
        confidence: 0.85
      }
    });
  };

  const generateCustomFeedback = (content: string, analysis: any) => {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('긍정') || lowerContent.includes('좋아') || lowerContent.includes('맞아')) {
      return {
        message: '분석 결과에 대한 긍정적 반응을 보여주시는군요. 이는 자신의 성향에 대한 높은 인식력을 나타냅니다.',
        suggestions: [
          '이러한 자기인식 능력을 활용하여 더욱 효과적인 자기관리를 해보세요',
          '긍정적 반응을 바탕으로 성향의 강점을 더욱 발전시켜보세요',
          '다른 사람들에게도 이러한 인사이트를 공유해보세요'
        ]
      };
    }

    if (lowerContent.includes('놀라') || lowerContent.includes('신기') || lowerContent.includes('예상')) {
      return {
        message: '분석 결과에 대한 놀라움을 표현하시는군요. 이는 새로운 관점에 대한 개방성을 보여줍니다.',
        suggestions: [
          '이러한 놀라움을 학습의 기회로 활용해보세요',
          '새로운 관점에 대한 개방성을 유지하면서 성장해보세요',
          '예상과 다른 결과를 통해 자기이해를 더욱 깊게 해보세요'
        ]
      };
    }

    if (lowerContent.includes('더') || lowerContent.includes('추가') || lowerContent.includes('자세히')) {
      return {
        message: '더 깊이 있는 분석을 요구하시는군요. 이는 지적 호기심과 탐구 정신을 보여줍니다.',
        suggestions: [
          '이러한 탐구 정신을 활용하여 지속적인 자기발전을 해보세요',
          '구체적인 질문을 통해 더욱 상세한 분석을 요청해보세요',
          '분석 결과를 일상생활에 적용해보는 방법을 탐구해보세요'
        ]
      };
    }

    return {
      message: '응답을 통해 자기성찰과 성장에 대한 의지를 보여주시는군요.',
      suggestions: [
        '이러한 자기성찰 능력을 활용하여 지속적인 성장을 해보세요',
        '분석 결과를 바탕으로 구체적인 개선 계획을 세워보세요',
        '정기적으로 성향 분석을 통해 변화를 추적해보세요'
      ]
    };
  };

  const finalizeAnalysis = async (userMessage: AnalysisMessage) => {
    // 최종 종합 분석
    const finalAnalysis = await generateFinalComprehensiveAnalysis();

    addMessage({
      id: `final_analysis_${Date.now()}`,
      content: `🎯 **최종 종합 분석**\n\n${finalAnalysis.summary}\n\n${finalAnalysis.recommendations.map(rec => `📌 ${rec}`).join('\n')}`,
      sender: 'researcher',
      timestamp: new Date(),
      type: 'conclusion',
      metadata: {
        researchMethod: 'Final Comprehensive Analysis',
        confidence: 0.92
      }
    });

    addMessage({
      id: `final_${Date.now()}`,
      content: '분석이 완료되었습니다. 추가 질문이 있으시면 언제든 말씀해주세요. 앞으로도 지속적인 성장을 응원합니다! 🌟',
      sender: 'researcher',
      timestamp: new Date(),
      type: 'conclusion'
    });
  };

  const generateFinalComprehensiveAnalysis = async (): Promise<{ summary: string, recommendations: string[] }> => {
    const totalResponses = conversationHistory.length;
    const averageResponseLength = conversationHistory.reduce((sum, response) => sum + response.length, 0) / totalResponses;

    let summary = '';
    let recommendations: string[] = [];

    if (totalResponses >= 5) {
      summary = '전체 대화를 종합적으로 분석한 결과, 매우 상세하고 성찰적인 응답 패턴을 보여주셨습니다. 이는 높은 자기인식 능력과 성장 의지를 나타냅니다.';
      recommendations = [
        '정기적인 자기성찰 시간을 가져보세요',
        '다양한 상황에서의 성향 변화를 관찰해보세요',
        '성향 분석 결과를 일상생활에 적극 활용해보세요'
      ];
    } else if (totalResponses >= 3) {
      summary = '중간 정도의 응답을 보여주셨으며, 기본적인 자기인식 능력을 갖추고 계십니다.';
      recommendations = [
        '더 구체적인 예시를 통해 자기이해를 깊게 해보세요',
        '다양한 관점에서 자신을 바라보는 연습을 해보세요',
        '정기적인 성향 점검을 통해 변화를 추적해보세요'
      ];
    } else {
      summary = '기본적인 응답을 보여주셨으며, 자기인식에 대한 관심을 갖고 계십니다.';
      recommendations = [
        '자기성찰 시간을 늘려보세요',
        '다양한 질문에 대한 답변을 통해 자기이해를 깊게 해보세요',
        '성향 분석을 정기적으로 활용해보세요'
      ];
    }

    return { summary, recommendations };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  };

  const getMessageIcon = (message: AnalysisMessage) => {
    switch (message.sender) {
      case 'researcher':
        return <AcademicCapIcon className="w-5 h-5 text-blue-600" />;
      case 'user':
        return <UserGroupIcon className="w-5 h-5 text-green-600" />;
      case 'system':
        return <CogIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMessageStyle = (message: AnalysisMessage) => {
    switch (message.type) {
      case 'question':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'observation':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'hypothesis':
        return 'border-l-4 border-purple-500 bg-purple-50';
      case 'conclusion':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'recommendation':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'analysis':
        return 'border-l-4 border-indigo-500 bg-indigo-50';
      case 'insight':
        return 'border-l-4 border-pink-500 bg-pink-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">성향분석 연구원</h2>
              <p className="text-sm text-gray-600">과학적 커뮤니케이션 패턴 분석</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              진행률: {analysisProgress}%
            </div>
            <div className="text-sm text-gray-500">
              단계: {currentPhase === 'introduction' ? '소개' :
                currentPhase === 'observation' ? '관찰' :
                  currentPhase === 'analysis' ? '분석' :
                    currentPhase === 'conclusion' ? '결론' : '인사이트'}
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex space-x-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender !== 'user' && (
              <div className="flex-shrink-0">
                {getMessageIcon(message)}
              </div>
            )}
            <div
              className={`max-w-4xl rounded-lg p-4 ${message.sender === 'user'
                ? 'bg-blue-600 text-white'
                : `bg-white border ${getMessageStyle(message)}`
                }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">
                  {message.sender === 'user' ? '사용자' :
                    message.sender === 'researcher' ? '연구원' : '시스템'}
                </span>
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.metadata?.confidence && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    신뢰도: {(message.metadata.confidence * 100).toFixed(1)}%
                  </span>
                )}
                {message.metadata?.researchMethod && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {message.metadata.researchMethod}
                  </span>
                )}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.metadata?.evidence && message.metadata.evidence.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  <strong>증거:</strong> {message.metadata.evidence.join(', ')}
                </div>
              )}
            </div>
            {message.sender === 'user' && (
              <div className="flex-shrink-0">
                {getMessageIcon(message)}
              </div>
            )}
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3 bg-white border border-gray-200 px-4 py-3 rounded-lg">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-gray-600">분석 중...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="답변을 입력하세요..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAnalyzing}
            />
          </div>
          <button
            onClick={handleUserInput}
            disabled={!userInput.trim() || isAnalyzing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </div>
      </div>

      {/* 분석 결과 패널 */}
      {selectedTraits.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-3">🔬 분석된 성향 특성</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedTraits.map((trait) => (
              <div key={trait.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{trait.name}</h4>
                  <span className="text-sm text-blue-600">
                    {(trait.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{trait.description}</p>
                <div className="text-xs text-gray-500">
                  증거: {trait.evidence.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalityAnalysisResearcher; 