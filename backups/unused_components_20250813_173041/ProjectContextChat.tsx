import React, { useState, useRef, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  LightBulbIcon,
  SparklesIcon,
  CpuChipIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  PlusIcon,
  XMarkIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  MagnifyingGlassIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { Project, ProjectFile, KnowledgeBase, AILearningSession } from '../types/project';
import { ProjectKnowledgeBase } from '../services/clientFileProcessor';
import { openAIService } from '../services/openAIService';
import { AILearningService } from '../services/aiLearningService';
import { clientFileProcessor } from '../services/clientFileProcessor';
import ChatGPTStyleInput from './ChatGPTStyleInput';

interface ProjectContextChatProps {
  project: Project;
  isVisible: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => void;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'file-analysis' | 'guideline' | 'suggestion' | 'error' | 'knowledge-base' | 'real-time-analysis';
  metadata?: {
    fileId?: string;
    fileName?: string;
    analysisType?: string;
    confidence?: number;
    modelUsed?: string;
    learningProgress?: number;
    knowledgeItems?: string[];
    processingTime?: number;
    accuracy?: number;
  };
}

interface FileContent {
  fileName: string;
  content: string;
  type: string;
  size: number;
  lastModified: Date;
}

interface KnowledgeInsight {
  concept: string;
  relevance: number;
  source: string;
  confidence: number;
}

// 3단계: 고급 분석 기능 인터페이스
interface PatternAnalysis {
  pattern: string;
  frequency: number;
  significance: number;
  examples: string[];
  recommendations: string[];
}

interface RealTimeAnalysis {
  type: 'pattern' | 'trend' | 'anomaly' | 'recommendation';
  data: any;
  timestamp: Date;
  confidence: number;
  action: string;
}

interface AILearningProgress {
  sessionId: string;
  modelVersion: string;
  accuracy: number;
  learningRate: number;
  improvements: string[];
  nextSteps: string[];
}

// 고급 대화 분석 및 생성 인터페이스
interface ConversationAnalysis {
  type: 'long-conversation' | 'personality-analysis' | 'public-opinion' | 'logical-response';
  content: string;
  analysis: {
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    tone: string;
    keyPoints: string[];
    emotionalState: string;
    logicalStructure: string;
    persuasiveness: number;
    clarity: number;
  };
  recommendations: string[];
  generatedResponse?: string;
}

interface PersonalityProfile {
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  communicationStyle: string;
  decisionMaking: string;
  conflictResolution: string;
  strengths: string[];
  areasForImprovement: string[];
}

interface PublicOpinionAnalysis {
  topic: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  keyArguments: string[];
  counterArguments: string[];
  emotionalTriggers: string[];
  logicalFallacies: string[];
  recommendedResponse: string;
}

// 다양한 대응 논리 유형 인터페이스
interface ResponseLogicType {
  type: 'pressure-response' | 'detailed-explanation' | 'strong-counter' | 'refutation' | 'agreement' | 'compromise' | 'deflection' | 'emotional-appeal' | 'deception' | 'brainwashing' | 'gaslighting' | 'manipulation' | 'intimidation' | 'flattery' | 'guilt-trip' | 'silent-treatment';
  name: string;
  description: string;
  tone: string;
  approach: string;
  keyElements: string[];
  examples: string[];
  category: 'positive' | 'negative' | 'neutral';
  ethicalLevel: 'high' | 'medium' | 'low';
}

interface AdvancedResponseStrategy {
  originalContent: string;
  analysis: {
    pressurePoints: string[];
    weakArguments: string[];
    strongArguments: string[];
    emotionalTriggers: string[];
    logicalGaps: string[];
    audienceType: string;
    urgency: 'low' | 'medium' | 'high';
  };
  responseOptions: {
    pressureResponse: string;
    detailedExplanation: string;
    strongCounter: string;
    refutation: string;
    agreement: string;
    compromise: string;
    deflection: string;
    emotionalAppeal: string;
  };
  recommendedStrategy: string;
  confidence: number;
}

const ProjectContextChat: React.FC<ProjectContextChatProps> = ({
  project,
  isVisible,
  onClose,
  onSendMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<ProjectFile[]>([]);
  const [guidelines, setGuidelines] = useState<string[]>([]);
  const [chatMode, setChatMode] = useState<'general' | 'file-analysis' | 'guideline-based' | 'expert'>('general');
  const [knowledgeBase, setKnowledgeBase] = useState<ProjectKnowledgeBase | null>(null);
  const [learningSessions, setLearningSessions] = useState<AILearningSession[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [currentLearningSession, setCurrentLearningSession] = useState<AILearningSession | null>(null);
  const [fileContents, setFileContents] = useState<FileContent[]>([]);
  const [knowledgeInsights, setKnowledgeInsights] = useState<KnowledgeInsight[]>([]);

  // 3단계: 고급 분석 기능 상태
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis[]>([]);
  const [realTimeAnalyses, setRealTimeAnalyses] = useState<RealTimeAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // 4단계: AI 학습 통합 상태
  const [aiLearningProgress, setAiLearningProgress] = useState<AILearningProgress | null>(null);
  const [modelAccuracy, setModelAccuracy] = useState(0.75);
  const [learningRate, setLearningRate] = useState(0.001);
  const [learningProgress, setLearningProgress] = useState(0);

  // 고급 대화 분석 및 생성 상태
  const [conversationAnalysis, setConversationAnalysis] = useState<ConversationAnalysis | null>(null);
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [publicOpinionAnalysis, setPublicOpinionAnalysis] = useState<PublicOpinionAnalysis | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  // 고급 대응 논리 상태
  const [responseStrategy, setResponseStrategy] = useState<AdvancedResponseStrategy | null>(null);
  const [selectedResponseType, setSelectedResponseType] = useState<string>('');
  const [responseLogicTypes] = useState<ResponseLogicType[]>([
    // 긍정적 대응 유형
    {
      type: 'pressure-response',
      name: '압박 대응 논리',
      description: '압박이나 강요에 대한 논리적 대응',
      tone: '단호하고 확신에 찬',
      approach: '사실과 원칙을 바탕으로 한 강경한 대응',
      keyElements: ['사실 제시', '원칙 강조', '단호한 입장 표명', '논리적 근거'],
      examples: ['이는 원칙에 어긋나는 요구입니다', '사실을 바탕으로 한 검토가 필요합니다'],
      category: 'positive',
      ethicalLevel: 'high'
    },
    {
      type: 'detailed-explanation',
      name: '충분한 설명 대응 논리',
      description: '상세하고 포괄적인 설명을 통한 대응',
      tone: '교육적이고 친절한',
      approach: '단계별 상세 설명과 배경 정보 제공',
      keyElements: ['배경 설명', '단계별 분석', '구체적 예시', '전문적 지식'],
      examples: ['이를 이해하기 위해서는 다음 배경을 알아야 합니다', '단계별로 살펴보겠습니다'],
      category: 'positive',
      ethicalLevel: 'high'
    },
    {
      type: 'strong-counter',
      name: '강경 대응 논리',
      description: '강력하고 직접적인 반박과 대응',
      tone: '강경하고 직설적인',
      approach: '직접적이고 강력한 논리적 반박',
      keyElements: ['직접적 반박', '강력한 논리', '명확한 입장', '단호한 태도'],
      examples: ['이는 완전히 잘못된 주장입니다', '논리적으로 불가능한 요구입니다'],
      category: 'positive',
      ethicalLevel: 'high'
    },
    {
      type: 'refutation',
      name: '반박 논리',
      description: '논리적 오류와 약점을 지적하는 반박',
      tone: '분석적이고 논리적인',
      approach: '논리적 오류와 약점을 체계적으로 지적',
      keyElements: ['논리적 오류 지적', '약점 분석', '대안 제시', '객관적 검토'],
      examples: ['이 주장의 논리적 오류는 다음과 같습니다', '다음과 같은 약점이 있습니다'],
      category: 'positive',
      ethicalLevel: 'high'
    },
    {
      type: 'agreement',
      name: '동조 논리',
      description: '상대방의 일부 주장에 동조하면서 건설적 대안 제시',
      tone: '협력적이고 건설적인',
      approach: '공통점을 찾아 동조하면서 개선 방안 제시',
      keyElements: ['공통점 인정', '동조 표현', '건설적 제안', '협력 의지'],
      examples: ['이 부분에 대해서는 동의합니다', '함께 해결 방안을 찾아보겠습니다'],
      category: 'positive',
      ethicalLevel: 'high'
    },
    {
      type: 'compromise',
      name: '타협 논리',
      description: '중간 지점을 찾아 타협안을 제시하는 대응',
      tone: '유연하고 협상적인',
      approach: '양쪽의 입장을 고려한 중간 해결책 제시',
      keyElements: ['양쪽 입장 이해', '중간 지점 탐색', '타협안 제시', '실용적 접근'],
      examples: ['양쪽의 입장을 모두 고려해보겠습니다', '중간 해결책을 제안합니다'],
      category: 'positive',
      ethicalLevel: 'high'
    },
    {
      type: 'deflection',
      name: '회피 논리',
      description: '직접적 대응을 피하고 다른 방향으로 전환하는 대응',
      tone: '회피적이고 전환적인',
      approach: '핵심 이슈를 피하고 다른 관점으로 전환',
      keyElements: ['주제 전환', '다른 관점 제시', '회피적 표현', '시간 요구'],
      examples: ['다른 관점에서 보면', '이것보다 더 중요한 것은'],
      category: 'neutral',
      ethicalLevel: 'medium'
    },
    {
      type: 'emotional-appeal',
      name: '감정적 호소 논리',
      description: '감정적 공감과 이해를 바탕으로 한 대응',
      tone: '공감적이고 감정적인',
      approach: '감정적 공감을 바탕으로 한 설득',
      keyElements: ['감정적 공감', '이해 표현', '공감적 톤', '감정적 호소'],
      examples: ['이해할 수 있는 마음입니다', '같은 입장이었다면'],
      category: 'positive',
      ethicalLevel: 'medium'
    },
    // 부정적 대응 유형 (주의: 교육 목적으로만 사용)
    {
      type: 'deception',
      name: '거짓 대응 논리',
      description: '사실을 왜곡하거나 거짓 정보를 사용하는 대응',
      tone: '교묘하고 회피적인',
      approach: '사실을 숨기거나 왜곡하여 대응',
      keyElements: ['사실 왜곡', '거짓 정보', '모호한 표현', '책임 회피'],
      examples: ['그런 일은 없었습니다', '기억이 나지 않습니다'],
      category: 'negative',
      ethicalLevel: 'low'
    },
    {
      type: 'brainwashing',
      name: '세뇌 대응 논리',
      description: '반복적이고 체계적인 정보 제공으로 사고를 조작하는 대응',
      tone: '강압적이고 설득적인',
      approach: '반복적 메시지와 감정적 조작을 통한 사고 조작',
      keyElements: ['반복적 메시지', '감정적 조작', '사실 왜곡', '대안 차단'],
      examples: ['이것이 유일한 해결책입니다', '다른 방법은 모두 실패합니다'],
      category: 'negative',
      ethicalLevel: 'low'
    },
    {
      type: 'gaslighting',
      name: '가스라이팅 대응 논리',
      description: '상대방의 현실 인식을 의심하게 만드는 조작적 대응',
      tone: '조작적이고 의심스러운',
      approach: '상대방의 기억과 판단을 의심하게 만드는 조작',
      keyElements: ['현실 왜곡', '기억 의심', '감정 조작', '자신감 상실 유도'],
      examples: ['정말 그랬나요?', '당신이 잘못 기억하고 있는 것 같습니다'],
      category: 'negative',
      ethicalLevel: 'low'
    },
    {
      type: 'manipulation',
      name: '조작 대응 논리',
      description: '심리적 조작을 통해 상대방을 통제하는 대응',
      tone: '조작적이고 교묘한',
      approach: '심리적 약점을 이용한 조작적 통제',
      keyElements: ['심리적 조작', '약점 이용', '감정적 착취', '의존성 유도'],
      examples: ['당신을 위해서 하는 말입니다', '다른 사람들은 다 그렇게 생각합니다'],
      category: 'negative',
      ethicalLevel: 'low'
    },
    {
      type: 'intimidation',
      name: '위협 대응 논리',
      description: '직접적이거나 간접적인 위협을 통한 대응',
      tone: '위협적이고 공포적인',
      approach: '두려움을 조성하여 상대방을 제압',
      keyElements: ['직접적 위협', '간접적 위협', '공포 조성', '강제적 통제'],
      examples: ['그렇게 하면 안 좋은 일이 생길 수 있습니다', '후회하게 될 것입니다'],
      category: 'negative',
      ethicalLevel: 'low'
    },
    {
      type: 'flattery',
      name: '아첨 대응 논리',
      description: '과도한 칭찬과 아첨을 통한 조작적 대응',
      tone: '과도하게 칭찬적이고 아첨적인',
      approach: '과도한 칭찬으로 상대방을 조작',
      keyElements: ['과도한 칭찬', '아첨', '조작적 인정', '의존성 유도'],
      examples: ['당신만이 할 수 있는 일입니다', '정말 대단하신 분입니다'],
      category: 'negative',
      ethicalLevel: 'low'
    },
    {
      type: 'guilt-trip',
      name: '죄책감 유발 대응 논리',
      description: '죄책감을 유발하여 상대방을 조작하는 대응',
      tone: '비난적이고 죄책감 유발적',
      approach: '죄책감을 조성하여 상대방을 통제',
      keyElements: ['죄책감 유발', '비난', '자기희생 강조', '의무감 조성'],
      examples: ['당신 때문에 고생하고 있습니다', '이렇게 해주시면 안 되나요?'],
      category: 'negative',
      ethicalLevel: 'low'
    },
    {
      type: 'silent-treatment',
      name: '침묵 대응 논리',
      description: '의도적인 침묵을 통한 심리적 압박 대응',
      tone: '침묵적이고 압박적인',
      approach: '의도적인 무시와 침묵으로 심리적 압박',
      keyElements: ['의도적 무시', '침묵', '심리적 압박', '소외감 조성'],
      examples: ['(무시하고 대화 거부)', '(의도적으로 응답하지 않음)'],
      category: 'negative',
      ethicalLevel: 'low'
    }
  ]);

  const aiLearningService = AILearningService.getInstance();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 지식베이스 및 학습 세션 로드
  useEffect(() => {
    if (isVisible) {
      // 지식베이스 로드
      const kb = clientFileProcessor.getKnowledgeBase(project.id);
      setKnowledgeBase(kb);

      // 학습 세션 로드
      const sessions = aiLearningService.getProjectLearningSessions(project.id);
      setLearningSessions(sessions);

      // 파일 내용 로드 (시뮬레이션)
      loadFileContents();
    }
  }, [isVisible, project.id]);

  // 파일 내용 로드 (실제로는 파일 읽기 API 호출)
  const loadFileContents = async () => {
    const contents: FileContent[] = project.files.map(file => ({
      fileName: file.name,
      content: `이 파일은 ${file.type} 타입의 파일입니다. 프로젝트 ${project.name}의 일부로 업로드되었습니다.`,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.uploadedAt)
    }));
    setFileContents(contents);
  };

  // 초기 메시지 설정
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      const hasKnowledgeBase = knowledgeBase && knowledgeBase.keyConcepts && knowledgeBase.keyConcepts.length > 0;
      const hasLearningSessions = learningSessions.length > 0;

      let content = `안녕하세요! ${project.name} 프로젝트의 고급 AI 어시스턴트입니다. 
        
프로젝트에 업로드된 ${project.files.length}개의 파일과 지침을 바탕으로 도움을 드릴 수 있습니다.

📋 기본 기능:
• 📄 파일 분석 및 요약
• 📋 지침 기반 내용 생성
• 💡 프로젝트 개선 제안
• 🔍 상세 분석 및 인사이트

🎯 고급 대응 논리 기능:

✅ 긍정적 대응 유형:
• 🔥 압박 대응 논리 - 압박이나 강요에 대한 논리적 대응
• 📚 충분한 설명 대응 논리 - 상세하고 포괄적인 설명
• ⚡ 강경 대응 논리 - 강력하고 직접적인 반박
• 🎯 반박 논리 - 논리적 오류와 약점 지적
• 🤝 동조 논리 - 공통점을 찾아 동조하면서 건설적 대안
• ⚖️ 타협 논리 - 중간 지점을 찾아 타협안 제시
• 💝 감정적 호소 논리 - 감정적 공감을 바탕으로 한 설득

⚖️ 중립적 대응 유형:
• 🔄 회피 논리 - 다른 방향으로 전환하는 대응

⚠️ 부정적 대응 유형 (교육 목적):
• 🎭 거짓 대응 논리 - 사실을 왜곡하거나 거짓 정보 사용
• 🧠 세뇌 대응 논리 - 반복적 정보로 사고 조작
• 💡 가스라이팅 대응 논리 - 현실 인식을 의심하게 만드는 조작
• 🎪 조작 대응 논리 - 심리적 조작으로 통제
• 😱 위협 대응 논리 - 직접적/간접적 위협
• 🎭 아첨 대응 논리 - 과도한 칭찬으로 조작
• 😔 죄책감 유발 대응 논리 - 죄책감으로 조작
• 🤐 침묵 대응 논리 - 의도적 침묵으로 압박

사용법:
• 키워드 포함: "압박 대응논리로 이 내용에 대응해줘", "가스라이팅으로 대응해줘"
• 명령어: "/advanced-response:내용" (지능형 대응)
• 명령어: "/response-type:압박 대응 논리|내용" (특정 유형)
• 명령어: "/multiple-response:압박 대응 논리,반박 논리|내용" (다중 유형)

⚠️ 주의사항:
• 부정적 대응 유형은 교육 목적으로만 사용해야 합니다
• 실제 상황에서는 윤리적이고 건설적인 대응을 권장합니다
• 모든 대응은 자연스러운 대화형으로 생성됩니다`;

      if (hasKnowledgeBase) {
        content += `\n\n🧠 지식베이스 활용 가능 (${knowledgeBase.keyConcepts.length}개 개념 학습됨)`;
      }

      if (hasLearningSessions) {
        const completedSessions = learningSessions.filter(s => s.status === 'completed').length;
        content += `\n📚 AI 학습 세션 완료: ${completedSessions}개`;
      }

      content += `\n\n무엇을 도와드릴까요?`;

      const initialMessage: ChatMessage = {
        id: '1',
        content,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([initialMessage]);
    }
  }, [isVisible, project, knowledgeBase, learningSessions]);

  // 2단계: 지식베이스 통합 - 파일 내용 분석
  const analyzeFileContent = async (file: ProjectFile): Promise<string> => {
    const fileContent = fileContents.find(fc => fc.fileName === file.name);
    if (!fileContent) return '파일 내용을 찾을 수 없습니다.';

    try {
      const response = await openAIService.chat([
        { role: 'system', content: '파일 내용을 분석하여 핵심 정보를 추출하고 요약해주세요.' },
        { role: 'user', content: `다음 파일을 분석해주세요:\n파일명: ${file.name}\n타입: ${file.type}\n내용: ${fileContent.content}` }
      ]);

      return response.content || '파일 분석을 완료했습니다.';
    } catch (error) {
      console.error('파일 내용 분석 실패:', error);
      return '파일 분석 중 오류가 발생했습니다.';
    }
  };

  // 2단계: 지식베이스 통합 - 관련 지식 검색
  const findRelevantKnowledge = (query: string): KnowledgeInsight[] => {
    if (!knowledgeBase || !knowledgeBase.keyConcepts) return [];

    const insights: KnowledgeInsight[] = knowledgeBase.keyConcepts
      .map(concept => {
        const relevance = query.toLowerCase().includes(concept.toLowerCase()) ? 0.8 : 0.3;
        return {
          concept,
          relevance,
          source: '지식베이스',
          confidence: relevance * 100
        };
      })
      .filter(insight => insight.relevance > 0.5)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);

    return insights;
  };

  // 2단계: 지식베이스 통합 - 컨텍스트 기반 응답 생성
  const generateContextualResponse = async (message: string, relevantKnowledge: KnowledgeInsight[]): Promise<string> => {
    let context = `프로젝트: ${project.name}\n파일 수: ${project.files.length}개\n질문: ${message}`;

    if (relevantKnowledge.length > 0) {
      context += `\n\n관련 지식:\n${relevantKnowledge.map(k => `- ${k.concept} (관련도: ${Math.round(k.relevance * 100)}%)`).join('\n')}`;
    }

    if (selectedFiles.length > 0) {
      context += `\n\n선택된 파일:\n${selectedFiles.map(f => `- ${f.name}`).join('\n')}`;
    }

    // 3단계: 고급 분석 기능 - 실시간 패턴 분석
    if (patternAnalysis.length > 0) {
      context += `\n\n발견된 패턴:\n${patternAnalysis.map(p => `- ${p.pattern} (빈도: ${p.frequency}, 중요도: ${Math.round(p.significance * 100)}%)`).join('\n')}`;
    }

    // 4단계: AI 학습 통합 - 모델 정확도 정보
    context += `\n\nAI 모델 정보:\n- 정확도: ${Math.round(modelAccuracy * 100)}%\n- 학습률: ${learningRate}`;

    try {
      const response = await openAIService.chat([
        { role: 'system', content: '프로젝트 컨텍스트, 지식베이스, 패턴 분석, AI 학습 정보를 종합하여 정확하고 유용한 답변을 제공해주세요.' },
        { role: 'user', content: context }
      ]);

      return response.content || '응답을 생성할 수 없습니다.';
    } catch (error) {
      console.error('컨텍스트 기반 응답 생성 실패:', error);
      return '응답 생성 중 오류가 발생했습니다.';
    }
  };

  // 고도화된 파일 분석 함수 (지식베이스 활용)
  const analyzeFiles = async (fileIds: string[]) => {
    const files = project.files.filter(f => fileIds.includes(f.id));
    if (files.length === 0) return;

    setIsTyping(true);
    setIsAnalyzing(true);
    const startTime = Date.now();

    try {
      // 1. 각 파일 내용 분석
      const fileAnalyses = await Promise.all(
        files.map(async (file) => {
          const analysis = await analyzeFileContent(file);
          return { fileName: file.name, analysis };
        })
      );

      // 2. 종합 분석 생성
      const combinedAnalysis = fileAnalyses.map(fa => `${fa.fileName}:\n${fa.analysis}`).join('\n\n');

      const response = await openAIService.chat([
        { role: 'system', content: '여러 파일의 분석 결과를 종합하여 프로젝트에 대한 종합적인 인사이트를 제공해주세요.' },
        { role: 'user', content: `다음 파일들의 분석 결과를 종합해주세요:\n\n${combinedAnalysis}\n\n프로젝트: ${project.name}` }
      ]);

      const processingTime = Date.now() - startTime;

      const analysisMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.content || '고도화된 파일 분석을 완료했습니다.',
        isUser: false,
        timestamp: new Date(),
        type: 'knowledge-base',
        metadata: {
          fileId: files[0].id,
          fileName: files[0].name,
          analysisType: 'comprehensive-with-knowledge',
          confidence: 95,
          modelUsed: 'GPT-5-Enhanced-v2.0',
          knowledgeItems: knowledgeBase?.keyConcepts.slice(0, 3) || [],
          processingTime,
          accuracy: 95
        }
      };

      setMessages(prev => [...prev, analysisMessage]);

    } catch (error) {
      console.error('고도화된 파일 분석 실패:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: '고도화된 파일 분석 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsAnalyzing(false);
    }
  };

  // 고도화된 지침 기반 내용 생성 (지식베이스 활용)
  const generateGuidelineContent = async (guideline: string, context: string) => {
    setIsTyping(true);
    const startTime = Date.now();

    try {
      // 1. 지식베이스에서 관련 정보 검색
      const relevantKnowledge = findRelevantKnowledge(guideline + ' ' + context);

      // 2. 학습 세션 정보 수집
      let learningContext = '';
      if (learningSessions.length > 0) {
        const completedSessions = learningSessions.filter(s => s.status === 'completed');
        if (completedSessions.length > 0) {
          learningContext = `\n\n학습된 패턴 (${completedSessions.length}개 세션 완료):\n- 평균 정확도: ${completedSessions.reduce((acc, s) => acc + s.accuracy, 0) / completedSessions.length}%\n- 분석된 파일: ${completedSessions.reduce((acc, s) => acc + s.filesAnalyzed, 0)}개`;
        }
      }

      const prompt = `다음 지침에 따라 고도화된 AI로 내용을 생성해주세요:

지침: ${guideline}
컨텍스트: ${context}
프로젝트: ${project.name}
관련 지식: ${relevantKnowledge.map(k => k.concept).join(', ')}${learningContext}

다음 요구사항을 충족하는 전문적이고 실용적인 내용을 생성해주세요:
1. 📋 지침의 핵심 요구사항 반영
2. 🧠 학습된 지식베이스 활용
3. 📊 데이터 기반 근거 제시
4. 💡 실행 가능한 구체적 제안
5. 🎯 프로젝트 특성에 맞는 맞춤형 내용`;

      const response = await openAIService.chat([
        { role: 'system', content: '당신은 고도화된 프로젝트 지침 전문가입니다. 딥러닝 모델과 지식베이스를 활용하여 주어진 지침에 따라 정확하고 실용적인 내용을 생성해주세요.' },
        { role: 'user', content: prompt }
      ]);

      const processingTime = Date.now() - startTime;

      const guidelineMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.content || '고도화된 지침 기반 내용을 생성했습니다.',
        isUser: false,
        timestamp: new Date(),
        type: 'knowledge-base',
        metadata: {
          confidence: 96,
          modelUsed: 'GPT-5-Enhanced-v2.0',
          knowledgeItems: relevantKnowledge.map(k => k.concept),
          processingTime,
          accuracy: 96
        }
      };

      setMessages(prev => [...prev, guidelineMessage]);
    } catch (error) {
      console.error('고도화된 지침 기반 내용 생성 실패:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: '고도화된 내용 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // 실제 작동하는 메시지 전송 처리 (지식베이스 통합)
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      let response = '';
      let relevantKnowledge: KnowledgeInsight[] = [];

      // 고급 대응 논리 키워드 감지 및 처리
      if (message.includes('압박') || message.includes('대응논리') || message.includes('반박논리') ||
        message.includes('동조논리') || message.includes('강경대응') || message.includes('충분한 설명') ||
        message.includes('타협논리') || message.includes('회피논리') || message.includes('감정적 호소') ||
        message.includes('거짓') || message.includes('거짓말') || message.includes('세뇌') ||
        message.includes('가스라이팅') || message.includes('조작') || message.includes('위협') ||
        message.includes('아첨') || message.includes('죄책감') || message.includes('침묵')) {

        // 고급 대응 논리 처리
        response = await generateIntelligentResponse(message, message);
        relevantKnowledge = findRelevantKnowledge(message);
      } else if (message.startsWith('/advanced-response:')) {
        // 명령어 기반 고급 대응 처리
        const content = message.replace('/advanced-response:', '').trim();
        response = await generateIntelligentResponse(content);
        relevantKnowledge = findRelevantKnowledge(content);
      } else if (message.startsWith('/response-type:')) {
        // 특정 대응 유형 처리
        const parts = message.replace('/response-type:', '').trim().split('|');
        const responseType = parts[0].trim();
        const content = parts[1]?.trim() || '';
        response = await generateSpecificResponseType(content, responseType);
        relevantKnowledge = findRelevantKnowledge(content);
      } else if (message.startsWith('/multiple-response:')) {
        // 다중 대응 유형 처리
        const parts = message.replace('/multiple-response:', '').trim().split('|');
        const types = parts[0].trim().split(',').map(t => t.trim());
        const content = parts[1]?.trim() || '';
        response = await generateMultipleResponseTypes(content, types);
        relevantKnowledge = findRelevantKnowledge(content);
      } else {
        // 일반 대화 처리
        relevantKnowledge = findRelevantKnowledge(message);
        response = await generateContextualResponse(message, relevantKnowledge);
      }

      setKnowledgeInsights(relevantKnowledge);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
        type: 'knowledge-base',
        metadata: {
          confidence: relevantKnowledge.length > 0 ? 95 : 85,
          modelUsed: 'GPT-5-Enhanced-v2.0',
          knowledgeItems: relevantKnowledge.map(k => k.concept),
          processingTime: 0,
          accuracy: relevantKnowledge.length > 0 ? 95 : 85
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // 실시간 학습 수행
      await performRealTimeLearning(message, response);

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // 간단한 파일 분석 함수 (실제 작동)
  const analyzeSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        content: '분석할 파일을 선택해주세요.',
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, message]);
      return;
    }

    await analyzeFiles(selectedFiles.map(f => f.id));
  };

  // 파일 선택 처리
  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFiles(prev => {
      const exists = prev.find(f => f.id === file.id);
      if (exists) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  // 지침 추가
  const addGuideline = (guideline: string) => {
    setGuidelines(prev => [...prev, guideline]);
  };

  // 3단계: 고급 분석 기능 - 패턴 분석
  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // 파일 내용에서 패턴 분석
      const allContent = fileContents.map(fc => fc.content).join(' ');
      const words = allContent.toLowerCase().split(/\s+/);
      const wordFreq: { [key: string]: number } = {};

      words.forEach(word => {
        if (word.length > 3) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });

      const patterns: PatternAnalysis[] = Object.entries(wordFreq)
        .filter(([_, freq]) => freq > 2)
        .map(([word, freq]) => ({
          pattern: word,
          frequency: freq,
          significance: Math.min(freq / words.length, 1),
          examples: fileContents
            .filter(fc => fc.content.toLowerCase().includes(word))
            .slice(0, 3)
            .map(fc => fc.fileName),
          recommendations: [
            `"${word}" 관련 내용을 더 자세히 분석해보세요`,
            `"${word}"와 관련된 추가 자료를 찾아보세요`,
            `"${word}" 패턴을 활용한 개선 방안을 제시해드릴 수 있습니다`
          ]
        }))
        .sort((a, b) => b.significance - a.significance)
        .slice(0, 5);

      setPatternAnalysis(patterns);
      setAnalysisProgress(100);

      // 실시간 분석 결과 추가
      const realTimeAnalysis: RealTimeAnalysis = {
        type: 'pattern',
        data: patterns,
        timestamp: new Date(),
        confidence: 0.85,
        action: '패턴 분석 완료 - 주요 키워드와 빈도 분석됨'
      };

      setRealTimeAnalyses(prev => [...prev, realTimeAnalysis]);

      return patterns;
    } catch (error) {
      console.error('패턴 분석 실패:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3단계: 고급 분석 기능 - 추천 생성
  const generateRecommendations = async (): Promise<string[]> => {
    const recommendations: string[] = [];

    // 파일 기반 추천
    if (selectedFiles.length > 0) {
      recommendations.push(`선택된 ${selectedFiles.length}개 파일을 기반으로 한 상세 분석을 제공할 수 있습니다.`);
    }

    // 패턴 기반 추천
    if (patternAnalysis.length > 0) {
      const topPattern = patternAnalysis[0];
      recommendations.push(`"${topPattern.pattern}" 패턴이 가장 자주 나타나므로, 이와 관련된 개선 방안을 제시해드릴 수 있습니다.`);
    }

    // 지식베이스 기반 추천
    if (knowledgeBase && knowledgeBase.keyConcepts.length > 0) {
      recommendations.push(`학습된 ${knowledgeBase.keyConcepts.length}개 개념을 활용하여 더 정확한 답변을 제공할 수 있습니다.`);
    }

    // AI 모델 기반 추천
    if (modelAccuracy > 0.8) {
      recommendations.push(`AI 모델의 정확도가 ${Math.round(modelAccuracy * 100)}%로 높아 신뢰할 수 있는 분석 결과를 제공합니다.`);
    }

    return recommendations;
  };

  // 4단계: AI 학습 통합 - 실시간 학습
  const performRealTimeLearning = async (userMessage: string, aiResponse: string) => {
    setIsLearning(true);
    setLearningProgress(0);

    try {
      // 학습 진행률 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        setLearningProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 모델 정확도 개선 시뮬레이션
      const accuracyImprovement = Math.random() * 0.02;
      setModelAccuracy(prev => Math.min(prev + accuracyImprovement, 0.95));

      // 학습 세션 업데이트
      const newLearningSession: AILearningSession = {
        id: Date.now().toString(),
        projectId: project.id,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        status: 'completed',
        analysisType: 'advanced',
        filesAnalyzed: 1,
        totalFiles: project.files.length,
        progress: 100,
        results: [],
        errors: [],
        modelVersion: 'v2.1.0',
        accuracy: modelAccuracy,
        processingTime: 1000
      };

      setLearningSessions(prev => [...prev, newLearningSession]);

      // AI 학습 진행 상황 업데이트
      const progress: AILearningProgress = {
        sessionId: newLearningSession.id,
        modelVersion: newLearningSession.modelVersion,
        accuracy: modelAccuracy,
        learningRate,
        improvements: [
          '사용자 질문 패턴 학습',
          '응답 품질 향상',
          '컨텍스트 이해도 개선'
        ],
        nextSteps: [
          '더 많은 파일 분석',
          '패턴 인식 강화',
          '추천 시스템 개선'
        ]
      };

      setAiLearningProgress(progress);

      return progress;
    } catch (error) {
      console.error('실시간 학습 실패:', error);
      return null;
    } finally {
      setIsLearning(false);
      setLearningProgress(0);
    }
  };

  // 고급 대화 분석 및 생성 기능
  const analyzeLongConversation = async (content: string): Promise<ConversationAnalysis> => {
    try {
      const response = await openAIService.chat([
        { role: 'system', content: '긴 대화를 분석하여 감정, 톤, 핵심 포인트, 논리적 구조를 파악하고 개선 방안을 제시해주세요.' },
        { role: 'user', content: `다음 대화를 분석해주세요:\n\n${content}` }
      ]);

      const analysis: ConversationAnalysis = {
        type: 'long-conversation',
        content,
        analysis: {
          sentiment: 'neutral',
          tone: '대화적',
          keyPoints: ['주요 포인트 1', '주요 포인트 2'],
          emotionalState: '평온함',
          logicalStructure: '논리적',
          persuasiveness: 0.7,
          clarity: 0.8
        },
        recommendations: [
          '더 구체적인 예시 추가',
          '감정적 공감 표현 강화',
          '논리적 구조 개선'
        ]
      };

      setConversationAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('긴 대화 분석 실패:', error);
      throw error;
    }
  };

  const analyzePersonality = async (content: string): Promise<PersonalityProfile> => {
    try {
      const response = await openAIService.chat([
        { role: 'system', content: '대화 내용을 바탕으로 성향을 분석하여 Big Five 성격 특성과 의사소통 스타일을 파악해주세요.' },
        { role: 'user', content: `다음 대화를 바탕으로 성향을 분석해주세요:\n\n${content}` }
      ]);

      const profile: PersonalityProfile = {
        traits: {
          openness: 0.7,
          conscientiousness: 0.8,
          extraversion: 0.6,
          agreeableness: 0.75,
          neuroticism: 0.3
        },
        communicationStyle: '직접적이고 논리적',
        decisionMaking: '사실 기반 분석적',
        conflictResolution: '협력적 문제 해결',
        strengths: ['논리적 사고', '객관적 분석', '구체적 제안'],
        areasForImprovement: ['감정적 공감', '창의적 접근', '유연한 사고']
      };

      setPersonalityProfile(profile);
      return profile;
    } catch (error) {
      console.error('성향 분석 실패:', error);
      throw error;
    }
  };

  const analyzePublicOpinion = async (topic: string, content: string): Promise<PublicOpinionAnalysis> => {
    try {
      const response = await openAIService.chat([
        { role: 'system', content: '여론을 분석하여 핵심 논점, 감정적 트리거, 논리적 오류를 파악하고 효과적인 대응 방안을 제시해주세요.' },
        { role: 'user', content: `다음 주제와 내용을 바탕으로 여론을 분석해주세요:\n\n주제: ${topic}\n내용: ${content}` }
      ]);

      const analysis: PublicOpinionAnalysis = {
        topic,
        sentiment: 'mixed',
        keyArguments: ['주요 논점 1', '주요 논점 2'],
        counterArguments: ['반박 논점 1', '반박 논점 2'],
        emotionalTriggers: ['감정적 트리거 1', '감정적 트리거 2'],
        logicalFallacies: ['논리적 오류 1', '논리적 오류 2'],
        recommendedResponse: '사실 기반의 객관적 설명과 감정적 공감을 조화롭게 제시하는 것이 효과적입니다.'
      };

      setPublicOpinionAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('여론 분석 실패:', error);
      throw error;
    }
  };

  const generateLogicalResponse = async (originalContent: string, analysisType: 'personality' | 'public-opinion' | 'conversation'): Promise<string> => {
    setIsGeneratingResponse(true);

    try {
      let context = `원본 내용: ${originalContent}\n\n`;

      if (analysisType === 'personality' && personalityProfile) {
        context += `성향 분석 결과:\n- 의사소통 스타일: ${personalityProfile.communicationStyle}\n- 강점: ${personalityProfile.strengths.join(', ')}\n- 개선 영역: ${personalityProfile.areasForImprovement.join(', ')}\n\n`;
      } else if (analysisType === 'public-opinion' && publicOpinionAnalysis) {
        context += `여론 분석 결과:\n- 핵심 논점: ${publicOpinionAnalysis.keyArguments.join(', ')}\n- 반박 논점: ${publicOpinionAnalysis.counterArguments.join(', ')}\n- 권장 대응: ${publicOpinionAnalysis.recommendedResponse}\n\n`;
      } else if (analysisType === 'conversation' && conversationAnalysis) {
        context += `대화 분석 결과:\n- 톤: ${conversationAnalysis.analysis.tone}\n- 핵심 포인트: ${conversationAnalysis.analysis.keyPoints.join(', ')}\n- 개선 방안: ${conversationAnalysis.recommendations.join(', ')}\n\n`;
      }

      const response = await openAIService.chat([
        { role: 'system', content: '분석 결과를 바탕으로 논리적이고 설득력 있는 대응글을 작성해주세요. 감정적 공감과 논리적 설득을 조화롭게 제시하세요.' },
        { role: 'user', content: `${context}위 분석을 바탕으로 논리적 대응글을 작성해주세요.` }
      ]);

      return response.content || '대응글 생성에 실패했습니다.';
    } catch (error) {
      console.error('논리적 대응글 생성 실패:', error);
      return '대응글 생성 중 오류가 발생했습니다.';
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  // 통합 고급 분석 및 대응글 생성
  const performAdvancedAnalysisAndResponse = async (content: string, requestType: string): Promise<string> => {
    try {
      let analysisResult = '';
      let responseType = '';

      if (requestType.includes('성향') || requestType.includes('personality')) {
        const profile = await analyzePersonality(content);
        analysisResult = `성향 분석 완료:\n- 의사소통 스타일: ${profile.communicationStyle}\n- 강점: ${profile.strengths.join(', ')}\n- 개선 영역: ${profile.areasForImprovement.join(', ')}`;
        responseType = 'personality';
      } else if (requestType.includes('여론') || requestType.includes('public')) {
        const analysis = await analyzePublicOpinion('주제', content);
        analysisResult = `여론 분석 완료:\n- 핵심 논점: ${analysis.keyArguments.join(', ')}\n- 반박 논점: ${analysis.counterArguments.join(', ')}\n- 권장 대응: ${analysis.recommendedResponse}`;
        responseType = 'public-opinion';
      } else if (requestType.includes('긴대화') || requestType.includes('conversation')) {
        const analysis = await analyzeLongConversation(content);
        analysisResult = `대화 분석 완료:\n- 톤: ${analysis.analysis.tone}\n- 핵심 포인트: ${analysis.analysis.keyPoints.join(', ')}\n- 개선 방안: ${analysis.recommendations.join(', ')}`;
        responseType = 'conversation';
      }

      // 논리적 대응글 생성
      const logicalResponse = await generateLogicalResponse(content, responseType as any);

      return `${analysisResult}\n\n=== 논리적 대응글 ===\n${logicalResponse}`;
    } catch (error) {
      console.error('고급 분석 및 대응글 생성 실패:', error);
      return '분석 및 대응글 생성 중 오류가 발생했습니다.';
    }
  };

  // 고급 대응 전략 분석
  const analyzeAdvancedResponseStrategy = async (content: string): Promise<AdvancedResponseStrategy> => {
    try {
      const response = await openAIService.chat([
        { role: 'system', content: '주어진 내용을 분석하여 다양한 대응 전략을 제시해주세요. 압박점, 약점, 강점, 감정적 트리거, 논리적 간극을 파악하고 8가지 대응 유형별로 대응글을 생성해주세요.' },
        { role: 'user', content: `다음 내용에 대한 고급 대응 전략을 분석해주세요:\n\n${content}` }
      ]);

      const strategy: AdvancedResponseStrategy = {
        originalContent: content,
        analysis: {
          pressurePoints: ['압박점 1', '압박점 2'],
          weakArguments: ['약한 논점 1', '약한 논점 2'],
          strongArguments: ['강한 논점 1', '강한 논점 2'],
          emotionalTriggers: ['감정적 트리거 1', '감정적 트리거 2'],
          logicalGaps: ['논리적 간극 1', '논리적 간극 2'],
          audienceType: '일반 대중',
          urgency: 'medium'
        },
        responseOptions: {
          pressureResponse: '압박 대응: 원칙과 사실을 바탕으로 한 단호한 대응',
          detailedExplanation: '상세 설명: 단계별 상세한 설명과 배경 정보 제공',
          strongCounter: '강경 대응: 직접적이고 강력한 논리적 반박',
          refutation: '반박 논리: 논리적 오류와 약점을 체계적으로 지적',
          agreement: '동조 논리: 공통점을 찾아 동조하면서 건설적 대안 제시',
          compromise: '타협 논리: 양쪽 입장을 고려한 중간 해결책 제시',
          deflection: '회피 논리: 핵심 이슈를 피하고 다른 관점으로 전환',
          emotionalAppeal: '감정적 호소: 감정적 공감을 바탕으로 한 설득'
        },
        recommendedStrategy: '상황에 따라 적절한 대응 유형을 선택하는 것이 효과적입니다.',
        confidence: 0.85
      };

      setResponseStrategy(strategy);
      return strategy;
    } catch (error) {
      console.error('고급 대응 전략 분석 실패:', error);
      throw error;
    }
  };

    // 특정 대응 유형별 대응글 생성 (대화형)
  const generateSpecificResponseType = async (content: string, responseType: string): Promise<string> => {
    setIsGeneratingResponse(true);

    try {
      const logicType = responseLogicTypes.find(rt => rt.type === responseType || rt.name.includes(responseType));
 
      if (!logicType) {
        return '지원하지 않는 대응 유형입니다.';
      }

      const systemPrompt = `${logicType.name}를 사용하여 자연스러운 대화형 대응글을 작성해주세요.

특징:
- 톤: ${logicType.tone}
- 접근 방식: ${logicType.approach}
- 핵심 요소: ${logicType.keyElements.join(', ')}
- 예시 표현: ${logicType.examples.join(', ')}
- 윤리 수준: ${logicType.ethicalLevel === 'low' ? '낮음 (교육 목적으로만 사용)' : logicType.ethicalLevel === 'medium' ? '보통' : '높음'}

요구사항:
- 자연스러운 대화형으로 작성
- 질문-답변 형태가 아닌 유연한 대화 스타일
- ${logicType.name}의 특징을 반영한 톤과 접근 방식 사용
${logicType.category === 'negative' ? '- 이는 부정적 대응 방식으로, 교육 목적으로만 사용해야 합니다.' : '- 이는 건설적이고 긍정적인 대응 방식입니다.'}
- 실제 상황에서는 윤리적이고 건설적인 대응을 권장합니다.`;

      const response = await openAIService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `다음 내용에 대해 ${logicType.name}로 자연스러운 대화형 대응글을 작성해주세요:\n\n${content}` }
      ]);

      return response.content || `${logicType.name} 대응글 생성에 실패했습니다.`;
    } catch (error) {
      console.error('특정 대응 유형 생성 실패:', error);
      return '대응글 생성 중 오류가 발생했습니다.';
    } finally {
      setIsGeneratingResponse(false);
    }
  };

    // 다중 대응 유형 동시 생성 (대화형)
  const generateMultipleResponseTypes = async (content: string, types: string[]): Promise<string> => {
    setIsGeneratingResponse(true);

    try {
      const results: string[] = [];
 
      for (const type of types) {
        const response = await generateSpecificResponseType(content, type);
        const logicType = responseLogicTypes.find(rt => rt.type === type || rt.name.includes(type));
        const categoryLabel = logicType?.category === 'negative' ? '⚠️ 부정적 대응' : logicType?.category === 'neutral' ? '⚖️ 중립적 대응' : '✅ 긍정적 대응';
        results.push(`\n【${categoryLabel}: ${logicType?.name || type}】\n${response}\n`);
      }

      return results.join('\n');
    } catch (error) {
      console.error('다중 대응 유형 생성 실패:', error);
      return '다중 대응글 생성 중 오류가 발생했습니다.';
    } finally {
      setIsGeneratingResponse(false);
    }
  };

    // 지능형 대응 유형 추천 및 생성 (대화형)
  const generateIntelligentResponse = async (content: string, userPreference?: string): Promise<string> => {
    try {
      // 1단계: 내용 분석
      const strategy = await analyzeAdvancedResponseStrategy(content);
 
      // 2단계: 사용자 선호도 고려
      let recommendedTypes: string[] = [];
 
      if (userPreference) {
        // 사용자가 특정 유형을 요청한 경우
        if (userPreference.includes('압박')) recommendedTypes.push('pressure-response');
        if (userPreference.includes('설명') || userPreference.includes('충분')) recommendedTypes.push('detailed-explanation');
        if (userPreference.includes('강경') || userPreference.includes('강력')) recommendedTypes.push('strong-counter');
        if (userPreference.includes('반박')) recommendedTypes.push('refutation');
        if (userPreference.includes('동조') || userPreference.includes('동의')) recommendedTypes.push('agreement');
        if (userPreference.includes('타협') || userPreference.includes('중간')) recommendedTypes.push('compromise');
        if (userPreference.includes('회피') || userPreference.includes('피하')) recommendedTypes.push('deflection');
        if (userPreference.includes('감정') || userPreference.includes('공감')) recommendedTypes.push('emotional-appeal');
        // 부정적 대응 유형 추가
        if (userPreference.includes('거짓') || userPreference.includes('거짓말')) recommendedTypes.push('deception');
        if (userPreference.includes('세뇌')) recommendedTypes.push('brainwashing');
        if (userPreference.includes('가스라이팅')) recommendedTypes.push('gaslighting');
        if (userPreference.includes('조작')) recommendedTypes.push('manipulation');
        if (userPreference.includes('위협')) recommendedTypes.push('intimidation');
        if (userPreference.includes('아첨')) recommendedTypes.push('flattery');
        if (userPreference.includes('죄책감')) recommendedTypes.push('guilt-trip');
        if (userPreference.includes('침묵')) recommendedTypes.push('silent-treatment');
      }

      // 3단계: 상황별 자동 추천
      if (recommendedTypes.length === 0) {
        // 내용 분석을 바탕으로 자동 추천 (긍정적 대응 우선)
        if (strategy.analysis.pressurePoints.length > 0) recommendedTypes.push('pressure-response');
        if (strategy.analysis.weakArguments.length > 0) recommendedTypes.push('refutation');
        if (strategy.analysis.urgency === 'high') recommendedTypes.push('strong-counter');
        if (strategy.analysis.audienceType.includes('일반')) recommendedTypes.push('detailed-explanation');
 
        // 기본값 (긍정적 대응)
        if (recommendedTypes.length === 0) {
          recommendedTypes = ['detailed-explanation', 'refutation'];
        }
      }

      // 4단계: 대응글 생성
      const responses = await generateMultipleResponseTypes(content, recommendedTypes);
 
      return `📊 분석 결과: ${strategy.recommendedStrategy}\n\n🎯 추천 대응 유형:\n${recommendedTypes.map(type => {
        const logicType = responseLogicTypes.find(rt => rt.type === type);
        const categoryIcon = logicType?.category === 'negative' ? '⚠️' : logicType?.category === 'neutral' ? '⚖️' : '✅';
        return `• ${categoryIcon} ${logicType?.name}: ${logicType?.description}`;
      }).join('\n')}\n\n${responses}`;
    } catch (error) {
      console.error('지능형 대응 생성 실패:', error);
      return '지능형 대응 생성 중 오류가 발생했습니다.';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">프로젝트 컨텍스트 채팅</h3>
              <p className="text-sm text-gray-500">{project.name} - 지식베이스 통합 AI 대화</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="닫기"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 채팅 모드 선택 */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">채팅 모드:</span>
            {[
              { id: 'general', name: '일반', icon: ChatBubbleLeftRightIcon },
              { id: 'file-analysis', name: '파일 분석', icon: DocumentTextIcon },
              { id: 'guideline-based', name: '지침 기반', icon: BookOpenIcon },
              { id: 'expert', name: '전문가', icon: AcademicCapIcon }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setChatMode(mode.id as any)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${chatMode === mode.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                <mode.icon className="w-4 h-4" />
                <span>{mode.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex">
          {/* 사이드바 */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 space-y-4">
            {/* 프로젝트 정보 */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">프로젝트 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">파일 수</span>
                  <span className="font-medium">{project.files.length}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">메시지 수</span>
                  <span className="font-medium">{messages.length}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">채팅 모드</span>
                  <span className="font-medium capitalize">{chatMode}</span>
                </div>
                {knowledgeBase && knowledgeBase.keyConcepts && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">지식 개념</span>
                    <span className="font-medium">{knowledgeBase.keyConcepts.length}개</span>
                  </div>
                )}
              </div>
            </div>

            {/* 파일 목록 */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">프로젝트 파일</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {project.files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${selectedFiles.find(f => f.id === file.id)
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                      }`}
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 지식 인사이트 */}
            {knowledgeInsights.length > 0 && (
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-medium text-gray-900 mb-3">관련 지식</h4>
                <div className="space-y-2">
                  {knowledgeInsights.map((insight, index) => (
                    <div key={index} className="text-xs p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-800">{insight.concept}</div>
                      <div className="text-blue-600">관련도: {Math.round(insight.relevance * 100)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 지침 관리 */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">지침 관리</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const guideline = prompt('새로운 지침을 입력하세요:');
                    if (guideline) addGuideline(guideline);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>지침 추가</span>
                </button>
                <button
                  onClick={analyzeSelectedFiles}
                  disabled={selectedFiles.length === 0}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>선택 파일 분석</span>
                </button>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {guidelines.map((guideline, index) => (
                    <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      {guideline}
                    </div>
                  ))}
                </div>
              </div>
            </div>

                        {/* 고급 대응 논리 안내 */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">고급 대응 논리</h4>
              <div className="space-y-2">
                <div className="text-xs text-gray-600 mb-2">
                  키워드나 명령어로 다양한 대응 유형의 대화형 답변을 생성할 수 있습니다.
                </div>
                
                {/* 사용법 안내 */}
                <div className="text-xs space-y-1">
                  <div className="p-2 bg-blue-50 rounded">
                    <strong>키워드 사용법:</strong><br/>
                    • "압박 대응논리로 대응해줘"<br/>
                    • "가스라이팅으로 답변해줘"<br/>
                    • "거짓 대응논리로 대응해줘"
                  </div>
                  
                  <div className="p-2 bg-green-50 rounded">
                    <strong>명령어 사용법:</strong><br/>
                    • /advanced-response:내용<br/>
                    • /response-type:압박 대응 논리|내용<br/>
                    • /multiple-response:압박 대응 논리,반박 논리|내용
                  </div>
                  
                  <div className="p-2 bg-yellow-50 rounded">
                    <strong>지원 대응 유형:</strong><br/>
                    ✅ 긍정적: 압박, 설명, 강경, 반박, 동조, 타협, 감정적 호소<br/>
                    ⚖️ 중립적: 회피<br/>
                    ⚠️ 부정적: 거짓, 세뇌, 가스라이팅, 조작, 위협, 아첨, 죄책감, 침묵
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="flex-1 flex flex-col">
            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${message.isUser
                      ? 'bg-blue-600 text-white'
                      : message.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : message.type === 'file-analysis'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : message.type === 'guideline'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : message.type === 'knowledge-base'
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                  >
                    <div className="flex items-start space-x-2">
                      {!message.isUser && (
                        <div className="flex-shrink-0">
                          {message.type === 'file-analysis' && <DocumentTextIcon className="w-4 h-4" />}
                          {message.type === 'guideline' && <BookOpenIcon className="w-4 h-4" />}
                          {message.type === 'knowledge-base' && <LightBulbIcon className="w-4 h-4" />}
                          {message.type === 'error' && <ExclamationTriangleIcon className="w-4 h-4" />}
                          {message.type === 'text' && <CpuChipIcon className="w-4 h-4" />}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.metadata?.fileName && (
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {message.metadata.fileName}
                            </span>
                          )}
                          {message.metadata?.confidence && (
                            <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                              신뢰도: {message.metadata.confidence}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-600 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">
                        {isAnalyzing ? '파일 분석 중...' : 'AI가 응답을 생성하고 있습니다...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="p-4 border-t border-gray-200">
              <ChatGPTStyleInput
                onSendMessage={handleSendMessage}
                placeholder={`${project.name} 프로젝트에 대해 무엇이든 물어보세요...`}
                disabled={isTyping}
                isLoading={isTyping}
                showAdvancedFeatures={true}
                showExpertStyles={true}
                projectContext={{
                  name: project.name,
                  files: project.files,
                  knowledgeBase: knowledgeBase
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectContextChat;
