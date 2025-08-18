import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, Message, MessageMetadata } from '../types/chat';
import { Project, ProjectFile } from '../types/project';
import chatSessionService from '../services/chatSessionService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { uploadFile } from '../services/unifiedAPI';
import projectService from '../services/projectService';
import { buildProjectContext } from '../services/contextBuilder';
import { injectCitations } from '../services/citationInjector';
import { usePromptTemplates } from '../hooks/usePromptTemplates';
import { useAIWorkflow } from '../hooks/useAIWorkflow';
import { processIntelligentKnowledge, ProcessingOptions, ProgressCallback } from '../services/intelligentKnowledgeProcessor';
import WritingAssistantModal from './WritingAssistantModal';
import WritingTemplatesModal from './WritingTemplatesModal';
import QuickWritingModal from './QuickWritingModal';

interface UnifiedChatInterfaceProps {
  currentSession: ChatSession;
  currentProject?: Project | null;
}

const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({
  currentSession,
  currentProject
}) => {
  const [messages, setMessages] = useState<Message[]>(currentSession.messages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stylePreset, setStylePreset] = useState<'concise' | 'balanced' | 'detailed'>('balanced');
  const [tonePreset, setTonePreset] = useState<'professional' | 'friendly' | 'neutral'>('professional');
  const [requireCitations, setRequireCitations] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  // 프롬프트 템플릿 및 워크플로우 훅
  const { templates, renderPrompt } = usePromptTemplates();
  const { workflows, executeWorkflow } = useAIWorkflow();

  // 로딩 메시지 상태
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);

  // 로딩 메시지 업데이트 함수 (11단계 시스템)
  const updateLoadingMessage = (step: number, totalSteps: number, description: string, confidence: number) => {
    setLoadingStep(step);
    setTotalSteps(totalSteps);

    const progressPercent = Math.round((step / totalSteps) * 100);
    const confidencePercent = Math.round(confidence * 100);

    // 11단계 지능형 처리 시스템 메시지
    const stepMessages = {
      0: '🔍 질문을 분석하고 명확화하고 있습니다...',
      1: '🌐 웹에서 최신 정보를 수집하고 있습니다...',
      2: '🧠 지능형 분석 시스템을 초기화하고 있습니다...',
      3: '📊 수집된 정보를 체계적으로 분석하고 있습니다...',
      4: '🔍 핵심 정보를 추출하고 구조화하고 있습니다...',
      5: '👁️ 다양한 관점에서 정보를 분석하고 있습니다...',
      6: '⚡ 논리적 추론을 통해 결론을 도출하고 있습니다...',
      7: '🔗 모든 분석 결과를 종합하고 있습니다...',
      8: '✅ 사실을 검증하고 정확성을 확인하고 있습니다...',
      9: '⚖️ 편향성을 평가하고 객관성을 확보하고 있습니다...',
      10: '✨ 응답을 최적화하고 개선하고 있습니다...',
      11: '🎯 최종 검토를 완료하고 있습니다...'
    };

    const currentMessage = stepMessages[step as keyof typeof stepMessages] || '처리 중입니다...';

    setLoadingMessage(`${currentMessage} (${progressPercent}% 완료, 신뢰도: ${confidencePercent}%)`);
  };

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 현재 활성 세션 상태 관리
  const [activeSession, setActiveSession] = useState<ChatSession | null>(currentSession);

  // 프로젝트가 변경될 때마다 새로운 채팅 세션 생성 또는 기존 세션 로드
  useEffect(() => {
    const initializeProjectChat = async () => {
      if (!currentProject) return;

      try {
        // 프로젝트별 기존 채팅 세션 확인
        const projectSessions = await chatSessionService.getProjectChatSessions(currentProject.id);

        if (projectSessions.length > 0) {
          // 기존 세션이 있으면 가장 최근 세션 사용
          const latestSession = projectSessions.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];

          setActiveSession(latestSession);
          setMessages(latestSession.messages);
        } else {
          // 새로운 프로젝트 채팅 세션 생성
          const newSession = await chatSessionService.createChatSession(
            `${currentProject.name} 프로젝트 채팅`,
            currentProject.id
          );

          // 프로젝트 컨텍스트를 포함한 초기 메시지 생성
          const initialMessage: Message = {
            id: Date.now().toString(),
            content: `안녕하세요! **${currentProject.name}** 프로젝트의 AI 어시스턴트입니다.

📋 **프로젝트 정보:**
- 프로젝트명: ${currentProject.name}
- 설명: ${currentProject.description || '설명 없음'}
- 상태: ${currentProject.status}
- 우선순위: ${currentProject.priority}

📁 **업로드된 파일:** ${currentProject.files.length}개
${currentProject.files.map(file => `- ${file.name} (${file.size} bytes)`).join('\n')}

📝 **활성 지침:** ${currentProject.guidelines.filter(g => g.isActive).length}개
${currentProject.guidelines.filter(g => g.isActive).map(guideline => `- ${guideline.title}`).join('\n')}

이제 이 프로젝트의 파일과 지침을 기반으로 도움을 드릴 수 있습니다. 무엇을 도와드릴까요?`,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            isUser: false,
            type: 'text',
            metadata: {
              processingTime: 0,
              confidence: 1.0,
              model: 'project-context',
              tokens: 0,
              usedServices: ['project-initialization']
            }
          };

          setActiveSession(newSession);
          setMessages([initialMessage]);

          // 세션에 초기 메시지 추가
          await chatSessionService.addMessage(newSession.id, initialMessage);
        }
      } catch (error) {
        console.error('프로젝트 채팅 초기화 오류:', error);
      }
    };

    initializeProjectChat();
  }, [currentProject]);

  // 세션이 변경될 때마다 메시지 업데이트
  useEffect(() => {
    if (currentSession && currentSession.messages) {
      setMessages(currentSession.messages);
    }
  }, [currentSession]);

  const buildCtx = () => buildProjectContext(currentProject);

  // 기능 안내 메시지 생성 함수
  const generateFeatureGuideMessage = (feature: string, userRequest: string): string => {
    const featureMessages: Record<string, string> = {
      'file_upload': `📁 **파일 업로드 기능**을 실행합니다.

사용자 요청: "${userRequest}"

파일을 드래그 앤 드롭하거나 클립 아이콘을 클릭하여 파일을 업로드할 수 있습니다.

**지원 형식:**
- 문서: PDF, DOC, DOCX, TXT
- 스프레드시트: XLS, XLSX
- 이미지: PNG, JPG, JPEG

업로드된 파일은 프로젝트 컨텍스트에 자동으로 포함되어 AI 분석에 활용됩니다.`,

      'project_settings': `⚙️ **프로젝트 설정**을 확인합니다.

사용자 요청: "${userRequest}"

현재 프로젝트 정보:
- 프로젝트명: ${currentProject?.name || '알 수 없음'}
- 상태: ${currentProject?.status || '알 수 없음'}
- 우선순위: ${currentProject?.priority || '알 수 없음'}
- 파일 수: ${currentProject?.files.length || 0}개
- 지침 수: ${currentProject?.guidelines.length || 0}개

프로젝트 설정을 수정하거나 상세 정보를 확인할 수 있습니다.`,

      'ai_settings': `🤖 **AI 모델 설정**을 확인합니다.

사용자 요청: "${userRequest}"

AI 모델 설정에서 다음을 조정할 수 있습니다:
- 모델 선택 (GPT-4, GPT-3.5 등)
- 온도 설정 (창의성 조절)
- 최대 토큰 수
- 응답 스타일
- 특별 지시사항

설정을 변경하여 AI 응답을 최적화할 수 있습니다.`,

      'templates': `📝 **프롬프트 템플릿**을 사용합니다.

사용자 요청: "${userRequest}"

사전 정의된 템플릿을 사용하여 일관된 질문을 할 수 있습니다:
- 분석 템플릿
- 요약 템플릿
- 비교 템플릿
- 생성 템플릿
- 검토 템플릿

템플릿을 선택하고 변수를 입력하면 자동으로 완성된 프롬프트가 생성됩니다.`,

      'workflows': `🔄 **AI 워크플로우**를 실행합니다.

사용자 요청: "${userRequest}"

자동화된 워크플로우를 통해 복잡한 작업을 단계별로 처리할 수 있습니다:
- 데이터 분석 워크플로우
- 문서 생성 워크플로우
- 검토 및 피드백 워크플로우
- 커스텀 워크플로우

워크플로우를 선택하면 자동으로 모든 단계가 순차적으로 실행됩니다.`,

      'history': `📚 **AI 응답 히스토리**를 확인합니다.

사용자 요청: "${userRequest}"

이전 AI 응답들을 확인하고 재사용할 수 있습니다:
- 최근 응답 목록
- 응답 검색 및 필터링
- 응답 재사용
- 응답 평가 및 피드백

히스토리에서 유용한 응답을 찾아 현재 대화에 활용할 수 있습니다.`,

      'stats': `📊 **프로젝트 통계**를 확인합니다.

사용자 요청: "${userRequest}"

프로젝트 관련 통계 정보를 확인할 수 있습니다:
- 메시지 수 및 응답 시간
- 파일 분석 통계
- AI 모델 사용 통계
- 사용자 만족도
- 성능 지표

통계를 통해 프로젝트 진행 상황과 AI 성능을 모니터링할 수 있습니다.`,

      'export': `💾 **데이터 내보내기**를 실행합니다.

사용자 요청: "${userRequest}"

프로젝트 데이터를 다양한 형식으로 내보낼 수 있습니다:
- 채팅 기록 (PDF, DOCX, TXT)
- 프로젝트 요약 보고서
- 분석 결과 내보내기
- 설정 백업

내보낸 데이터는 다른 도구에서 활용하거나 백업으로 사용할 수 있습니다.`,

      'writing_request': `✍️ **상세 글쓰기 도우미**를 실행합니다.

사용자 요청: "${userRequest}"

4단계 과정을 통해 상세한 글쓰기 요구사항을 수집합니다:
1. 주제 및 목적 설정
2. 대상 독자 및 핵심 내용
3. 스타일 및 톤 설정
4. 특별 요구사항

모든 요구사항을 입력하면 AI가 맞춤형 글을 작성해드립니다.`,

      'quick_writing': `⚡ **빠른 글쓰기**를 실행합니다.

사용자 요청: "${userRequest}"

간단한 요구사항만으로 빠르게 글을 작성할 수 있습니다:
- 주제/제목
- 목적/취지
- 글쓰기 스타일
- 길이

최소한의 정보로 빠르고 효과적인 글을 생성합니다.`
    };

    return featureMessages[feature] || `요청하신 기능을 실행합니다: ${userRequest}`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !activeSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      isUser: true,
      type: 'text'
    };

    // 사용자 메시지 추가
    setMessages(prev => [...prev, userMessage]);

    // 입력 메시지 분석하여 기능 실행 여부 결정
    const messageContent = inputMessage.toLowerCase();
    let shouldExecuteFeature = false;
    let featureToExecute = '';

    // 기능 요청 패턴 분석
    if (messageContent.includes('파일') && (messageContent.includes('업로드') || messageContent.includes('첨부') || messageContent.includes('추가'))) {
      shouldExecuteFeature = true;
      featureToExecute = 'file_upload';
    } else if (messageContent.includes('프로젝트') && (messageContent.includes('설정') || messageContent.includes('정보') || messageContent.includes('상세'))) {
      shouldExecuteFeature = true;
      featureToExecute = 'project_settings';
    } else if (messageContent.includes('ai') && (messageContent.includes('설정') || messageContent.includes('모델') || messageContent.includes('옵션'))) {
      shouldExecuteFeature = true;
      featureToExecute = 'ai_settings';
    } else if (messageContent.includes('템플릿') || messageContent.includes('양식')) {
      shouldExecuteFeature = true;
      featureToExecute = 'templates';
    } else if (messageContent.includes('워크플로우') || messageContent.includes('자동화')) {
      shouldExecuteFeature = true;
      featureToExecute = 'workflows';
    } else if (messageContent.includes('히스토리') || messageContent.includes('기록') || messageContent.includes('이전')) {
      shouldExecuteFeature = true;
      featureToExecute = 'history';
    } else if (messageContent.includes('통계') || messageContent.includes('분석') || messageContent.includes('데이터')) {
      shouldExecuteFeature = true;
      featureToExecute = 'stats';
    } else if (messageContent.includes('내보내기') || messageContent.includes('export') || messageContent.includes('저장')) {
      shouldExecuteFeature = true;
      featureToExecute = 'export';
    } else if (messageContent.includes('글쓰기') || messageContent.includes('작성') || messageContent.includes('문서')) {
      shouldExecuteFeature = true;
      featureToExecute = 'writing_request';
    } else if (messageContent.includes('빠른') && messageContent.includes('글쓰기')) {
      shouldExecuteFeature = true;
      featureToExecute = 'quick_writing';
    }

    if (shouldExecuteFeature) {
      // 기능 실행 안내 메시지 생성
      const featureGuideMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateFeatureGuideMessage(featureToExecute, inputMessage),
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'text',
        metadata: {
          processingTime: 0,
          confidence: 0.9,
          model: 'feature-guide',
          tokens: 0,
          usedServices: ['feature-detection']
        }
      };

      setMessages(prev => [...prev, featureGuideMessage]);

      // 세션 업데이트
      await chatSessionService.addMessage(activeSession.id, userMessage);
      await chatSessionService.addMessage(activeSession.id, featureGuideMessage);

      // 해당 기능 실행
      handleIntegratedFeature(featureToExecute);

      setInputMessage('');
      return;
    }
    setInputMessage('');
    setIsLoading(true);
    setLoadingMessage('');
    setLoadingStep(0);
    setTotalSteps(0);

    try {
      // 컨텍스트 구성
      const builtCtx = buildCtx();
      const ctx: Record<string, unknown> = builtCtx ? builtCtx as Record<string, unknown> : {};

      // 글쓰기 요청인지 확인
      const lowerMessage = inputMessage.toLowerCase();
      const isWritingRequest = lowerMessage.includes('글') || lowerMessage.includes('작성') ||
        lowerMessage.includes('쓰기') || lowerMessage.includes('문서') ||
        lowerMessage.includes('보고서') || lowerMessage.includes('이메일') ||
        lowerMessage.includes('제안서') || lowerMessage.includes('계획서');

      if (isWritingRequest) {
        // 글쓰기 응답 생성
        const writingResponse = generateWritingResponse(userMessage.content);

        // 글쓰기 안내 메시지 추가
        const writingGuideMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: writingResponse.content,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          isUser: false,
          type: 'text',
          metadata: {
            processingTime: 0,
            confidence: 0.9,
            model: 'writing-assistant',
            tokens: 0,
            usedServices: ['writing-guide']
          }
        };

        setMessages(prev => [...prev, writingGuideMessage]);

        // 세션 업데이트
        await chatSessionService.addMessage(currentSession.id, userMessage);
        await chatSessionService.addMessage(currentSession.id, writingGuideMessage);

        setIsLoading(false);
        return;
      }

      // 일반 질문에 대한 AI 응답 생성
      console.log('🧠 AI 응답 생성 시작...');

      // 초기 로딩 메시지 설정 (11단계 시스템)
      setLoadingMessage('🔍 질문을 분석하고 명확화하고 있습니다... (0% 완료)');

      // 진행 상황 콜백 함수
      const onProgress: ProgressCallback = (step, totalSteps, description, confidence) => {
        console.log(`🧠 11단계 진행 상황: ${step}/${totalSteps} - ${description} (신뢰도: ${(confidence * 100).toFixed(1)}%)`);
        updateLoadingMessage(step, totalSteps, description, confidence);
      };

      // 성능 최적화 옵션 (11단계 시스템)
      const processingOptions: ProcessingOptions = {
        enableParallelProcessing: true, // 병렬 처리 활성화
        maxConcurrentSteps: 2, // 11단계 시스템에서는 2개씩 병렬 처리
        timeoutPerStep: 45000, // 각 단계당 45초 타임아웃 (더 정교한 처리)
        enableCaching: true, // 캐싱 활성화
        cacheExpiry: 3600000, // 1시간 캐시
        enableProgressTracking: true, // 진행 상황 추적
        onProgress // 진행 상황 콜백
      };

      const intelligentResponse = await processIntelligentKnowledge(userMessage.content, ctx, processingOptions);

      // 최종 응답 생성
      let finalContent = intelligentResponse.finalResponse;

      // 지식 처리 정보 추가
      const knowledgeInfo = `
---
**🧠 지능형 처리 정보**
📚 수집된 정보: ${intelligentResponse.metadata.sourcesUsed}개 소스
🧮 추론 단계: ${intelligentResponse.metadata.reasoningSteps}단계
⏱️ 처리 시간: ${intelligentResponse.metadata.processingTime}ms
📊 신뢰도: ${(intelligentResponse.metadata.confidence * 100).toFixed(1)}%

**🔍 검색 쿼리**
${intelligentResponse.knowledgeGathering.searchQueries.map(q => `• ${q}`).join('\n')}

**🧮 논리적 사고 과정**
${intelligentResponse.reasoning.steps.map(step => `• ${step.description}: ${step.confidence * 100}% 신뢰도`).join('\n')}

**✅ 검증 결과**
• 사실 검증: ${intelligentResponse.verification.factCheck.length}개 항목
• 편향성 평가: ${intelligentResponse.verification.biasAssessment.length}개 항목
• 논리적 일관성: 확인됨

**📋 한계점**
${intelligentResponse.reasoning.limitations.map(l => `• ${l}`).join('\n')}
      `;

      finalContent += knowledgeInfo;

      // 인용 추가 (필요시)
      if (requireCitations && builtCtx) {
        finalContent = injectCitations(finalContent, builtCtx);
      }

      const metadata: MessageMetadata = {
        processingTime: intelligentResponse.metadata.processingTime,
        confidence: intelligentResponse.metadata.confidence,
        model: 'intelligent-knowledge-processor',
        tokens: 0, // 실제 토큰 수 계산 필요
        usedServices: ['intelligent-knowledge-processing', 'web-search', 'logical-reasoning', 'fact-checking', 'bias-assessment']
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: finalContent,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'text',
        metadata
      };

      setMessages(prev => [...prev, aiMessage]);

      // 세션 업데이트
      await chatSessionService.addMessage(currentSession.id, userMessage);
      await chatSessionService.addMessage(currentSession.id, aiMessage);

    } catch (error) {
      console.error('메시지 전송 오류:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 메시지 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'system',
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setLoadingStep(0);
      setTotalSteps(0);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    // 사용자 메시지 생성
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      sender: 'user',
      timestamp: new Date().toISOString(),
      isUser: true,
      type: 'text'
    };

    // 사용자 메시지를 먼저 추가
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setLoadingMessage('');
    setLoadingStep(0);
    setTotalSteps(0);

    try {
      // 컨텍스트 구성
      const builtCtx = buildCtx();
      const ctx: Record<string, unknown> = builtCtx ? builtCtx as Record<string, unknown> : {};

      // AI 응답 생성
      console.log('🧠 빠른 질문 AI 응답 생성 시작...');
      setLoadingMessage('🚀 AI가 답변을 생성하고 있습니다... (0% 완료)');

      const onProgress: ProgressCallback = (step, totalSteps, description, confidence) => {
        console.log(`🧠 진행 상황: ${step}/${totalSteps} - ${description} (신뢰도: ${(confidence * 100).toFixed(1)}%)`);
        updateLoadingMessage(step, totalSteps, description, confidence);
      };

      const processingOptions: ProcessingOptions = {
        enableParallelProcessing: true,
        maxConcurrentSteps: 3,
        timeoutPerStep: 30000,
        enableCaching: true,
        cacheExpiry: 3600000,
        enableProgressTracking: true,
        onProgress
      };

      const intelligentResponse = await processIntelligentKnowledge(question, ctx, processingOptions);

      // 최종 응답 생성
      let finalContent = intelligentResponse.finalResponse;

      // 지식 처리 정보 추가
      const knowledgeInfo = `
---
**🧠 지능형 처리 정보**
📚 수집된 정보: ${intelligentResponse.metadata.sourcesUsed}개 소스
🧮 추론 단계: ${intelligentResponse.metadata.reasoningSteps}단계
⏱️ 처리 시간: ${intelligentResponse.metadata.processingTime}ms
📊 신뢰도: ${(intelligentResponse.metadata.confidence * 100).toFixed(1)}%

**🔍 검색 쿼리**
${intelligentResponse.knowledgeGathering.searchQueries.map(q => `• ${q}`).join('\n')}

**🧮 논리적 사고 과정**
${intelligentResponse.reasoning.steps.map(step => `• ${step.description}: ${step.confidence * 100}% 신뢰도`).join('\n')}

**✅ 검증 결과**
• 사실 검증: ${intelligentResponse.verification.factCheck.length}개 항목
• 편향성 평가: ${intelligentResponse.verification.biasAssessment.length}개 항목
• 논리적 일관성: 확인됨

**📋 한계점**
${intelligentResponse.reasoning.limitations.map(l => `• ${l}`).join('\n')}
      `;

      finalContent += knowledgeInfo;

      // 인용 추가 (필요시)
      if (requireCitations && builtCtx) {
        finalContent = injectCitations(finalContent, builtCtx);
      }

      const metadata: MessageMetadata = {
        processingTime: intelligentResponse.metadata.processingTime,
        confidence: intelligentResponse.metadata.confidence,
        model: 'intelligent-knowledge-processor',
        tokens: 0,
        usedServices: ['intelligent-knowledge-processing', 'web-search', 'logical-reasoning', 'fact-checking', 'bias-assessment']
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: finalContent,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'text',
        metadata
      };

      setMessages(prev => [...prev, aiMessage]);

      // 세션 업데이트
      await chatSessionService.addMessage(currentSession.id, userMessage);
      await chatSessionService.addMessage(currentSession.id, aiMessage);

    } catch (error) {
      console.error('빠른 질문 처리 오류:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 질문 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'system',
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setLoadingStep(0);
      setTotalSteps(0);
    }
  };

  const handleUseTemplate = (templateId: string, variables: Record<string, string>) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const renderedPrompt = renderPrompt(template, variables);
      setInputMessage(renderedPrompt);
      setShowTemplateModal(false);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string, inputData: Record<string, unknown> = {}) => {
    try {
      const execution = await executeWorkflow(workflowId, inputData);
      if (execution && execution.status === 'completed') {
        // 워크플로우 결과를 메시지로 추가
        const workflowMessage: Message = {
          id: Date.now().toString(),
          content: `워크플로우 실행 완료: ${JSON.stringify(execution.results, null, 2)}`,
          sender: 'system',
          timestamp: new Date().toISOString(),
          isUser: false,
          type: 'text',
          metadata: {
            processingTime: execution.endTime ? execution.endTime.getTime() - execution.startTime.getTime() : 0,
            confidence: 1.0,
            model: 'workflow',
            tokens: 0,
            usedServices: ['workflow-execution']
          }
        };
        setMessages(prev => [...prev, workflowMessage]);
        setShowWorkflowModal(false);
      }
    } catch (error) {
      console.error('워크플로우 실행 오류:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    let uploadedCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadResponse = await uploadFile({ file });

        if (uploadResponse.success) {
          const metadata: MessageMetadata = {
            processingTime: 0,
            confidence: 1.0,
            model: 'file-upload',
            tokens: 0,
            usedServices: ['file-upload']
          };

          const fileMessage: Message = {
            id: Date.now().toString(),
            content: `파일 "${uploadResponse.file_name || file.name}"이 업로드되었습니다.`,
            sender: 'system',
            timestamp: new Date().toISOString(),
            isUser: false,
            type: 'file',
            metadata,
            fileName: uploadResponse.file_name || file.name,
            fileSize: file.size
          };

          setMessages(prev => [...prev, fileMessage]);

          // 프로젝트에 파일 추가
          if (currentProject) {
            const projectFile: ProjectFile = {
              id: uploadResponse.file_id || `file_${Date.now()}`,
              name: uploadResponse.file_name || file.name,
              type: file.type.startsWith('image/') ? 'image' :
                file.type.startsWith('video/') ? 'video' :
                  file.type.startsWith('audio/') ? 'audio' :
                    file.type.includes('sheet') ? 'spreadsheet' :
                      (file.type.includes('pdf') || file.type.includes('document')) ? 'document' : 'other',
              size: file.size,
              uploadedAt: new Date(),
              status: 'uploaded',
              url: `/uploads/${uploadResponse.file_id || `file_${Date.now()}`}_${uploadResponse.file_name || file.name}`,
              description: `업로드된 파일: ${uploadResponse.file_name || file.name}`,
              tags: []
            };

            await projectService.addFileToProject(currentProject.id, projectFile);
            uploadedCount++;
          }
        }
      }

      if (uploadedCount > 0) {
        console.log(`${uploadedCount}개 파일이 성공적으로 업로드되었습니다.`);
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '파일 업로드 중 오류가 발생했습니다.',
        sender: 'system',
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 빠른 질문 버튼들
  const quickQuestions = [
    "개포우성7차 분석해주세요",
    "내 성향을 분석해주세요",
    "시공사 성향 분석해주세요",
    "예측 분석을 해주세요",
    "파일 내용 요약해주세요",
    "프로젝트 진행상황 분석해주세요",
    "위험 요소를 찾아주세요",
    "개선 방안을 제시해주세요"
  ];

  // 메시지 복사 기능
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 복사 성공 알림 (간단한 토스트 메시지)
      const toast = document.createElement('div');
      toast.textContent = '메시지가 복사되었습니다';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 통합 기능 상태 관리
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showWorkflows, setShowWorkflows] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // 통합 기능 핸들러
  const handleIntegratedFeature = (feature: string, data?: any) => {
    switch (feature) {
      case 'file_upload':
        setShowFileUpload(true);
        break;
      case 'project_settings':
        setShowProjectSettings(true);
        break;
      case 'ai_settings':
        setShowAISettings(true);
        break;
      case 'templates':
        setShowTemplates(true);
        break;
      case 'workflows':
        setShowWorkflows(true);
        break;
      case 'history':
        setShowHistory(true);
        break;
      case 'stats':
        setShowStats(true);
        break;
      case 'export':
        setShowExport(true);
        break;
      case 'writing_request':
        setShowWritingAssistant(true);
        break;
      case 'writing_templates':
        setShowWritingTemplates(true);
        break;
      case 'quick_writing':
        // 빠른 글쓰기 모드
        setShowQuickWriting(true);
        break;
      default:
        break;
    }
  };

  // 통합 응답 생성 함수
  const generateIntegratedResponse = (question: string, context: any) => {
    const lowerQuestion = question.toLowerCase();

    // 파일 관련 질문
    if (lowerQuestion.includes('파일') || lowerQuestion.includes('업로드') || lowerQuestion.includes('문서')) {
      return {
        content: `파일 업로드 기능을 제공해드리겠습니다. 아래 버튼을 클릭하여 파일을 업로드하거나, 드래그 앤 드롭으로 파일을 추가할 수 있습니다.

📁 **지원 파일 형식:**
- 문서: PDF, DOC, DOCX, TXT
- 이미지: JPG, PNG, GIF, SVG
- 데이터: CSV, XLSX, JSON
- 기타: ZIP, RAR

💡 **파일 업로드 후 AI가 자동으로 분석하여 관련 정보를 제공합니다.**`,
        actions: [
          { label: '📁 파일 업로드', action: 'file_upload' },
          { label: '📋 업로드된 파일 보기', action: 'view_files' }
        ]
      };
    }

    // 프로젝트 설정 관련 질문
    if (lowerQuestion.includes('프로젝트') || lowerQuestion.includes('설정') || lowerQuestion.includes('관리')) {
      return {
        content: `프로젝트 관리 기능을 제공해드리겠습니다.

⚙️ **프로젝트 설정:**
- 프로젝트 이름 및 설명 수정
- 상태 및 우선순위 설정
- 태그 및 카테고리 관리

📊 **프로젝트 통계:**
- 생성일, 수정일, 활동 내역
- 파일 수, 메시지 수, 참여자 수
- 진행 상황 및 완료율

🗑️ **프로젝트 관리:**
- 보관/해제, 삭제
- 내보내기/가져오기
- 권한 및 공유 설정`,
        actions: [
          { label: '⚙️ 프로젝트 설정', action: 'project_settings' },
          { label: '📊 프로젝트 통계', action: 'stats' },
          { label: '📤 내보내기/가져오기', action: 'export' }
        ]
      };
    }

    // AI 설정 관련 질문
    if (lowerQuestion.includes('ai') || lowerQuestion.includes('모델') || lowerQuestion.includes('설정')) {
      return {
        content: `AI 모델 설정을 제공해드리겠습니다.

🤖 **AI 모델 선택:**
- GPT-4: 고품질, 창의적 답변
- GPT-3.5: 빠른, 효율적 답변
- Claude: 정확한, 분석적 답변
- Custom: 사용자 정의 모델

⚙️ **고급 설정:**
- Temperature: 창의성 조절 (0.1-2.0)
- Max Tokens: 응답 길이 제한
- Top P: 응답 다양성 조절
- Frequency Penalty: 반복 방지

🎯 **프리셋 설정:**
- Creative: 창의적 답변
- Precise: 정확한 답변
- Balanced: 균형잡힌 답변
- Custom: 사용자 정의`,
        actions: [
          { label: '🤖 AI 모델 설정', action: 'ai_settings' },
          { label: '📝 프롬프트 템플릿', action: 'templates' },
          { label: '🔄 AI 워크플로우', action: 'workflows' }
        ]
      };
    }

    // 템플릿 관련 질문
    if (lowerQuestion.includes('템플릿') || lowerQuestion.includes('프롬프트')) {
      return {
        content: `프롬프트 템플릿 기능을 제공해드리겠습니다.

📝 **템플릿 카테고리:**
- 📊 분석: 데이터 분석, 보고서 작성
- ✍️ 작성: 문서 작성, 이메일 작성
- 🔍 연구: 정보 검색, 요약
- 💡 아이디어: 브레인스토밍, 창의적 사고
- 📈 비즈니스: 전략 수립, 계획 작성

🎯 **템플릿 기능:**
- 미리 정의된 프롬프트 사용
- 변수 치환으로 개인화
- 사용 빈도 및 평점 추적
- 커스텀 템플릿 생성`,
        actions: [
          { label: '📝 템플릿 보기', action: 'templates' },
          { label: '➕ 새 템플릿 생성', action: 'create_template' },
          { label: '⭐ 인기 템플릿', action: 'popular_templates' }
        ]
      };
    }

    // 워크플로우 관련 질문
    if (lowerQuestion.includes('워크플로우') || lowerQuestion.includes('자동화')) {
      return {
        content: `AI 워크플로우 기능을 제공해드리겠습니다.

🔄 **워크플로우 유형:**
- 📊 데이터 분석: 수집 → 분석 → 시각화 → 보고서
- 📝 문서 생성: 요구사항 → 초안 → 검토 → 완성
- 🔍 정보 검색: 질문 → 검색 → 필터링 → 요약
- 💡 아이디어 생성: 주제 → 브레인스토밍 → 평가 → 선별

⚡ **자동화 기능:**
- 단계별 처리 자동화
- 조건부 분기 처리
- 결과 검증 및 피드백
- 일정 기반 실행`,
        actions: [
          { label: '🔄 워크플로우 보기', action: 'workflows' },
          { label: '➕ 새 워크플로우 생성', action: 'create_workflow' },
          { label: '▶️ 워크플로우 실행', action: 'execute_workflow' }
        ]
      };
    }

    // 히스토리 관련 질문
    if (lowerQuestion.includes('히스토리') || lowerQuestion.includes('기록') || lowerQuestion.includes('이전')) {
      return {
        content: `대화 히스토리 기능을 제공해드리겠습니다.

📚 **히스토리 관리:**
- 모든 대화 기록 저장
- 날짜별, 주제별 필터링
- 검색 및 태그 기능
- 즐겨찾기 및 노트 추가

📊 **통계 정보:**
- 총 대화 수, 메시지 수
- 사용한 모델별 통계
- 평균 응답 시간
- 인기 질문 및 주제

💾 **데이터 관리:**
- 히스토리 내보내기/가져오기
- 자동 백업 설정
- 개인정보 보호 설정`,
        actions: [
          { label: '📚 대화 히스토리', action: 'history' },
          { label: '📊 사용 통계', action: 'usage_stats' },
          { label: '💾 데이터 관리', action: 'data_management' }
        ]
      };
    }

    // 통계 관련 질문
    if (lowerQuestion.includes('통계') || lowerQuestion.includes('분석') || lowerQuestion.includes('성과')) {
      return {
        content: `시스템 통계 및 분석을 제공해드리겠습니다.

📈 **실시간 통계:**
- 활성 사용자 수
- 총 프로젝트 수, 파일 수, 메시지 수
- 시스템 부하 및 메모리 사용량
- 응답 시간 및 처리량

📊 **성과 분석:**
- 프로젝트별 활동 통계
- 파일 업로드 및 처리 통계
- AI 모델별 사용 통계
- 사용자 만족도 및 피드백

🔧 **시스템 모니터링:**
- 서버 상태 및 성능
- 오류율 및 복구 시간
- 백업 상태 및 보안
- 업데이트 및 유지보수`,
        actions: [
          { label: '📈 실시간 대시보드', action: 'stats' },
          { label: '📊 성과 분석', action: 'performance_analysis' },
          { label: '🔧 시스템 상태', action: 'system_status' }
        ]
      };
    }

    // 기본 응답
    return {
      content: `안녕하세요! CORBU AI의 모든 기능을 대화를 통해 사용하실 수 있습니다.

🎯 **주요 기능:**
- 📁 **파일 관리**: 파일 업로드, 분석, 관리
- ⚙️ **프로젝트 설정**: 프로젝트 정보, 통계, 관리
- 🤖 **AI 설정**: 모델 선택, 파라미터 조정
- 📝 **템플릿**: 프롬프트 템플릿 관리
- 🔄 **워크플로우**: 자동화된 작업 흐름
- 📚 **히스토리**: 대화 기록 및 통계
- 📊 **분석**: 시스템 성과 및 통계

💡 **사용 방법:**
원하시는 기능에 대해 질문해주시면 관련 기능을 바로 제공해드립니다.

예시:
- "파일을 업로드하고 싶어요"
- "프로젝트 설정을 변경하고 싶어요"
- "AI 모델을 바꾸고 싶어요"
- "템플릿을 만들어보고 싶어요"`,
      actions: [
        { label: '📁 파일 업로드', action: 'file_upload' },
        { label: '⚙️ 프로젝트 설정', action: 'project_settings' },
        { label: '🤖 AI 설정', action: 'ai_settings' },
        { label: '📝 템플릿', action: 'templates' },
        { label: '🔄 워크플로우', action: 'workflows' },
        { label: '📚 히스토리', action: 'history' },
        { label: '📊 통계', action: 'stats' }
      ]
    };
  };

  // 글쓰기 요청 상태 관리
  const [showWritingAssistant, setShowWritingAssistant] = useState(false);
  const [showWritingTemplates, setShowWritingTemplates] = useState(false);
  const [showQuickWriting, setShowQuickWriting] = useState(false);
  const [writingRequest, setWritingRequest] = useState({
    topic: '',
    purpose: '',
    content: '',
    style: '',
    requirements: '',
    targetAudience: '',
    tone: '',
    length: '',
    format: ''
  });

  // 템플릿 선택 처리 함수
  const handleTemplateSelection = (template: any) => {
    setShowWritingTemplates(false);
    setWritingRequest(template.template);
    setShowWritingAssistant(true);
  };

  // 빠른 글쓰기 요청 처리 함수
  const handleQuickWritingRequest = async (request: any) => {
    try {
      setIsLoading(true);
      setShowQuickWriting(false);

      // 사용자 메시지 생성 (글쓰기 요청)
      const userMessage: Message = {
        id: Date.now().toString(),
        content: `빠른 글쓰기 요청: ${request.topic} - ${request.purpose}`,
        sender: 'user',
        timestamp: new Date().toISOString(),
        isUser: true,
        type: 'text'
      };

      // 사용자 메시지 추가
      setMessages(prev => [...prev, userMessage]);

      // 빠른 글쓰기 요청을 AI에게 전달
      const quickWritingPrompt = `다음 요구사항에 따라 간단하고 효과적인 글을 작성해주세요:

**주제/제목:** ${request.topic}
**목적/취지:** ${request.purpose}
**글쓰기 스타일:** ${request.style}
**길이:** ${request.length}

위의 요구사항을 충족하는 간결하고 효과적인 글을 작성해주세요.`;

      // AI에게 빠른 글쓰기 요청 전송
      const response = await processIntelligentKnowledge(quickWritingPrompt, {
        quickWritingRequest: request,
        project: currentProject
      }, {
        enableCaching: false,
        enableProgressTracking: true,
        onProgress: (step, totalSteps, description, confidence) => {
          updateLoadingMessage(step, totalSteps, `✍️ ${description}`, confidence);
        }
      });

      // 응답을 메시지로 추가
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.finalResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'text',
        metadata: {
          processingTime: response.metadata.processingTime,
          confidence: response.metadata.confidence,
          model: 'quick-writing-assistant',
          tokens: 0,
          usedServices: ['quick-writing', 'content-generation']
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // 세션 업데이트
      await chatSessionService.addMessage(currentSession.id, userMessage);
      await chatSessionService.addMessage(currentSession.id, aiMessage);

      // 성공 알림
      console.log('빠른 글쓰기 완료: 요구사항에 맞는 글을 성공적으로 작성했습니다.');

    } catch (error) {
      console.error('빠른 글쓰기 요청 실패:', error);
      console.error('빠른 글쓰기 실패: 글쓰기 요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 글쓰기 요청 처리 함수
  const handleWritingRequest = async (request: any) => {
    try {
      setIsLoading(true);
      setShowWritingAssistant(false);

      // 사용자 메시지 생성 (글쓰기 요청)
      const userMessage: Message = {
        id: Date.now().toString(),
        content: `상세 글쓰기 요청: ${request.topic} - ${request.purpose}`,
        sender: 'user',
        timestamp: new Date().toISOString(),
        isUser: true,
        type: 'text'
      };

      // 사용자 메시지 추가
      setMessages(prev => [...prev, userMessage]);

      // 글쓰기 요청을 AI에게 전달
      const writingPrompt = `다음 요구사항에 따라 글을 작성해주세요:

**주제/제목:** ${request.topic}
**목적/취지:** ${request.purpose}
**대상 독자:** ${request.targetAudience}
**핵심 내용:** ${request.content}
**추가 정보:** ${request.requirements}

**스타일 요구사항:**
- 글쓰기 스타일: ${request.style}
- 톤/어조: ${request.tone}
- 길이: ${request.length}
- 형식: ${request.format}

**특별 요구사항:** ${request.requirements}

위의 모든 요구사항을 충족하는 고품질의 글을 작성해주세요. 요구사항에 맞는 스타일과 톤을 유지하면서, 명확하고 효과적인 내용을 제공해주세요.`;

      // AI에게 글쓰기 요청 전송
      const response = await processIntelligentKnowledge(writingPrompt, {
        writingRequest: request,
        project: currentProject
      }, {
        enableCaching: false,
        enableProgressTracking: true,
        onProgress: (step, totalSteps, description, confidence) => {
          updateLoadingMessage(step, totalSteps, `📝 ${description}`, confidence);
        }
      });

      // 응답을 메시지로 추가
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.finalResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'text',
        metadata: {
          processingTime: response.metadata.processingTime,
          confidence: response.metadata.confidence,
          model: 'intelligent-writing-assistant',
          tokens: 0,
          usedServices: ['intelligent-writing', 'style-analysis', 'content-generation']
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // 세션 업데이트
      await chatSessionService.addMessage(currentSession.id, userMessage);
      await chatSessionService.addMessage(currentSession.id, aiMessage);

      // 성공 알림
      console.log('글쓰기 완료: 요구사항에 맞는 글을 성공적으로 작성했습니다.');

    } catch (error) {
      console.error('글쓰기 요청 실패:', error);
      console.error('글쓰기 실패: 글쓰기 요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 통합 글쓰기 응답 생성 함수
  const generateWritingResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase();

    // 글쓰기 관련 질문 감지
    if (lowerQuestion.includes('글') || lowerQuestion.includes('작성') || lowerQuestion.includes('쓰기') ||
      lowerQuestion.includes('문서') || lowerQuestion.includes('보고서') || lowerQuestion.includes('이메일') ||
      lowerQuestion.includes('제안서') || lowerQuestion.includes('계획서') || lowerQuestion.includes('소개') ||
      lowerQuestion.includes('설명') || lowerQuestion.includes('분석') || lowerQuestion.includes('리뷰')) {

      return {
        content: `📝 **통합 글쓰기 어시스턴트**를 제공해드리겠습니다!

🎯 **글쓰기 요구사항을 상세히 입력해주세요:**

**1. 📋 기본 정보**
- 주제/제목: 어떤 내용의 글을 작성하시나요?
- 목적/취지: 이 글을 통해 무엇을 달성하고 싶으신가요?
- 대상 독자: 누구를 위한 글인가요?

**2. 📄 내용 요구사항**
- 핵심 내용: 포함되어야 할 주요 내용은?
- 추가 정보: 특별히 언급하고 싶은 내용이 있나요?
- 제외 내용: 피하고 싶은 내용이 있나요?

**3. ✍️ 스타일 요구사항**
- 글쓰기 스타일: 공식적/비공식적, 전문적/친근한 등
- 톤/어조: 진지한, 유머러스한, 설득적인 등
- 길이: 짧게/보통/길게, 또는 특정 단어 수
- 형식: 단락 구성, 목록 사용, 인용 등

**4. 🎨 특별 요구사항**
- 참고 자료: 참고할 문서나 자료가 있나요?
- 키워드: 반드시 포함되어야 할 키워드
- 브랜딩: 회사/조직의 특별한 스타일 가이드라인

💡 **예시 요청:**
"마케팅 제안서를 작성해주세요. 신제품 출시를 위한 것이고, 경영진을 대상으로 합니다. 데이터 기반의 설득적이고 전문적인 톤으로, 2-3페이지 분량으로 작성해주세요."

아래 버튼을 클릭하여 상세한 글쓰기 요청을 입력하실 수 있습니다.`,
        actions: [
          { label: '📝 글쓰기 요청하기', action: 'writing_request' },
          { label: '📋 템플릿 사용하기', action: 'writing_templates' },
          { label: '✍️ 빠른 글쓰기', action: 'quick_writing' }
        ]
      };
    }

    // 기본 응답
    return generateIntegratedResponse(question, {});
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-800">CORBU AI 채팅</h2>
          {currentProject && (
            <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {currentProject.name}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* 스타일 프리셋 */}
          <select
            value={stylePreset}
            onChange={(e) => setStylePreset(e.target.value as 'concise' | 'balanced' | 'detailed')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="concise">간결</option>
            <option value="balanced">균형</option>
            <option value="detailed">상세</option>
          </select>

          {/* 톤 프리셋 */}
          <select
            value={tonePreset}
            onChange={(e) => setTonePreset(e.target.value as 'professional' | 'friendly' | 'neutral')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="professional">전문적</option>
            <option value="friendly">친근</option>
            <option value="neutral">중립</option>
          </select>

          {/* 인용 요구 체크박스 */}
          <label className="flex items-center space-x-1 text-sm">
            <input
              type="checkbox"
              checked={requireCitations}
              onChange={(e) => setRequireCitations(e.target.checked)}
              className="rounded"
            />
            <span>인용</span>
          </label>
        </div>
      </div>

      {/* 빠른 질문 버튼들 */}
      {messages.length === 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="text-sm text-gray-600 mb-2">빠른 질문:</div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium mb-2">CORBU AI와 대화를 시작하세요</h3>
            <p className="text-sm text-center max-w-md">
              프로젝트 분석, 성향 분석, 예측 분석 등 다양한 AI 기능을 활용할 수 있습니다.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3/4 px-4 py-2 rounded-lg relative group ${message.isUser
                  ? 'bg-blue-500 text-white'
                  : message.type === 'error'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : message.type === 'file'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : message.type === 'system'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-800'
                  }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.sender === 'user' ? '사용자' :
                    message.sender === 'ai' ? 'CORBU AI' :
                      message.sender === 'system' ? '시스템' : message.sender}
                </div>

                {message.type === 'file' ? (
                  <div className="flex items-center space-x-2">
                    <span>📎</span>
                    <span>{message.content}</span>
                    {message.fileName && (
                      <div className="text-xs opacity-75">
                        파일명: {message.fileName}
                        {message.fileSize && ` (${(message.fileSize / 1024).toFixed(1)}KB)`}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // 코드 블록 스타일링
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <pre className="bg-gray-800 text-white p-3 rounded-md overflow-x-auto">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                        // 링크 스타일링
                        a: ({ children, href, ...props }) => (
                          <a
                            href={href}
                            className="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>

                    {/* 메시지 액션 버튼들 */}
                    {!message.isUser && message.type !== 'error' && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 text-gray-500 hover:text-gray-700 text-xs"
                          title="복사"
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {message.metadata && (
                  <div className="text-xs text-gray-500 mt-2">
                    {message.metadata.confidence && (
                      <span>신뢰도: {Math.round(message.metadata.confidence * 100)}% </span>
                    )}
                    {message.metadata.processingTime && (
                      <span>처리시간: {message.metadata.processingTime.toFixed(0)}ms </span>
                    )}
                    {message.metadata.tokens && (
                      <span>토큰: {message.metadata.tokens}</span>
                    )}
                  </div>
                )}

                {/* 액션 버튼들 */}
                {message.metadata?.usedServices?.includes('writing-guide') && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => handleIntegratedFeature('writing_request')}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                    >
                      📝 글쓰기 요청하기
                    </button>
                    <button
                      onClick={() => handleIntegratedFeature('writing_templates')}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                    >
                      📋 템플릿 사용하기
                    </button>
                    <button
                      onClick={() => handleIntegratedFeature('quick_writing')}
                      className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
                    >
                      ✍️ 빠른 글쓰기
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>{loadingMessage}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t border-gray-200">
        {/* 드래그 앤 드롭 영역 */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 text-center transition-colors"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-gray-500">
            <div className="text-lg mb-2">📁</div>
            <div className="text-sm">파일을 여기에 드래그하거나 아래 버튼을 클릭하세요</div>
            <div className="text-xs text-gray-400 mt-1">지원 형식: PDF, DOC, XLS, 이미지 등</div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
            title="프롬프트 템플릿"
          >
            📝
          </button>

          <button
            onClick={() => setShowWorkflowModal(true)}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
            title="AI 워크플로우"
          >
            🔄
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            multiple
          />

          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            disabled={isLoading}
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>전송 중</span>
              </div>
            ) : (
              '전송'
            )}
          </button>
        </div>

        {/* 입력 힌트 */}
        <div className="text-xs text-gray-500 mt-2 flex items-center space-x-4">
          <span>💡 Enter: 전송, Shift+Enter: 줄바꿈</span>
          <span>📝 템플릿 사용 가능</span>
          <span>🔄 워크플로우 실행 가능</span>
          <span>📎 파일 업로드 지원</span>
          <span>🎯 빠른 질문 버튼 활용</span>
        </div>
      </div>

      {/* 프롬프트 템플릿 모달 */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                프롬프트 템플릿 선택
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.slice(0, 6).map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    const variables: Record<string, string> = {};
                    template.variables.forEach(variable => {
                      variables[variable] = `{${variable}}`;
                    });
                    handleUseTemplate(template.id, variables);
                  }}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI 워크플로우 모달 */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI 워크플로우 실행
              </h3>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflows.slice(0, 6).map((workflow) => (
                <div
                  key={workflow.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleExecuteWorkflow(workflow.id)}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {workflow.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {workflow.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>단계: {workflow.steps.length}개</span>
                    <span>실행: {workflow.executionCount}회</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 글쓰기 어시스턴트 모달 */}
      {showWritingAssistant && (
        <WritingAssistantModal
          isOpen={showWritingAssistant}
          onClose={() => setShowWritingAssistant(false)}
          onSubmit={handleWritingRequest}
          isLoading={isLoading}
        />
      )}

      {/* 글쓰기 템플릿 모달 */}
      {showWritingTemplates && (
        <WritingTemplatesModal
          isOpen={showWritingTemplates}
          onClose={() => setShowWritingTemplates(false)}
          onSelectTemplate={handleTemplateSelection}
        />
      )}

      {/* 빠른 글쓰기 모달 */}
      {showQuickWriting && (
        <QuickWritingModal
          isOpen={showQuickWriting}
          onClose={() => setShowQuickWriting(false)}
          onSubmit={handleQuickWritingRequest}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default UnifiedChatInterface;
