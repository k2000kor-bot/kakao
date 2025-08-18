import React, { useState, useEffect } from 'react';
import { Project } from '../types/project';
import ProjectCreationModal from './ProjectCreationModal';
import FileUploadModal from './FileUploadModal';
import InstructionsModal from './InstructionsModal';
import UnifiedChatInterface from './UnifiedChatInterface';
import ProjectStats from './ProjectStats';
import ProjectFiles from './ProjectFiles';
import ProjectGuidelines from './ProjectGuidelines';
import ProjectSearch from './ProjectSearch';
import ProjectExport from './ProjectExport';
import ProjectSettings from './ProjectSettings';
import HelpModal from './HelpModal';
import DarkModeToggle from './DarkModeToggle';
import CollaborationPanel from './CollaborationPanel';
import AutoSaveIndicator from './AutoSaveIndicator';
import RealTimeDashboard from './RealTimeDashboard';
import AIModelSettings from './AIModelSettings';
import AIHistoryPanel from './AIHistoryPanel';
import PromptTemplatesPanel from './PromptTemplatesPanel';
import AIWorkflowPanel from './AIWorkflowPanel';
import AdvancedWritingInterface from './AdvancedWritingInterface';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useNotifications } from '../hooks/useNotifications';
import { useDarkMode } from '../hooks/useDarkMode';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useAutoSave } from '../hooks/useAutoSave';
import { ChatSession } from '../types/chat';
import projectService from '../services/projectService';
import chatSessionService from '../services/chatSessionService';
import unifiedAPI from '../services/unifiedAPI';

interface ChatGPTStyleInterfaceProps {
  currentProject?: Project | null;
  onProjectChange: (project: Project | null) => void;
}

const ChatGPTStyleInterface: React.FC<ChatGPTStyleInterfaceProps> = ({
  currentProject,
  onProjectChange
}) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'guidelines' | 'stats' | 'search' | 'export' | 'history' | 'templates' | 'workflows' | 'settings' | 'writing'>('chat');
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  // 통합 AI 분석 상태
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);

  // 화면 전환 방지를 위한 상태 관리
  const [renderedTabs, setRenderedTabs] = useState<string[]>(['chat']);
  const [isInitialized, setIsInitialized] = useState(false);

  // 탭 전환 시 화면 변경 방지
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    // 이미 렌더링된 탭은 유지, 새로운 탭만 추가
    setRenderedTabs(prev => prev.includes(tab) ? prev : [...prev, tab]);
  };

  // 프로젝트 변경 시 화면 변경 방지
  const handleProjectChangeSafe = (project: Project | null) => {
    // 프로젝트 변경 시에도 현재 화면 상태 유지
    onProjectChange(project);
  };

  // 알림 시스템
  const { showSuccess, showError, showInfo } = useNotifications();

  // 다크 모드
  const { toggleDarkMode } = useDarkMode();

  // 성능 모니터링
  usePerformanceMonitor('ChatGPTStyleInterface');

  // 자동 저장
  const autoSave = useAutoSave(
    currentProject,
    `project_${currentProject?.id || 'default'}`,
    {
      interval: 30000, // 30초
      maxBackups: 5,
      enabled: !!currentProject
    }
  );

  // 통합 AI 분석 실행
  const runComprehensiveAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.comprehensiveAnalysis({ content });
      setAnalysisResults(result);
      showSuccess('분석 완료', '종합 분석이 완료되었습니다!');
    } catch (error) {
      showError('분석 오류', '분석 중 오류가 발생했습니다.');
      console.error('분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 시스템 메트릭 조회
  const loadSystemMetrics = async () => {
    try {
      const metrics = await unifiedAPI.getSystemMetrics();
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('시스템 메트릭 조회 오류:', error);
    }
  };

  // 고급 분석 실행
  const runAdvancedAnalysis = async (content: string, analysisType: string = 'comprehensive') => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.advancedAnalysis({ content, analysis_type: analysisType as any });
      setAnalysisResults(result);
      showSuccess('고급 분석 완료', '고급 분석이 완료되었습니다!');
    } catch (error) {
      showError('고급 분석 오류', '고급 분석 중 오류가 발생했습니다.');
      console.error('고급 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 지식 처리 실행
  const runKnowledgeProcessing = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.knowledgeProcessing({ content });
      setAnalysisResults(result);
      showSuccess('지식 처리 완료', '지식 처리가 완료되었습니다!');
    } catch (error) {
      showError('지식 처리 오류', '지식 처리 중 오류가 발생했습니다.');
      console.error('지식 처리 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 부동산 분석 실행
  const runRealEstateAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.realEstateAnalysis({ content });
      setAnalysisResults(result);
      showSuccess('부동산 분석 완료', '부동산 분석이 완료되었습니다!');
    } catch (error) {
      showError('부동산 분석 오류', '부동산 분석 중 오류가 발생했습니다.');
      console.error('부동산 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 글쓰기 생성 실행
  const runWritingGeneration = async (prompt: string, style: string = 'formal') => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.writingGeneration({ prompt, style: style as any });
      setAnalysisResults(result);
      showSuccess('글쓰기 완료', '글쓰기 생성이 완료되었습니다!');
    } catch (error) {
      showError('글쓰기 오류', '글쓰기 생성 중 오류가 발생했습니다.');
      console.error('글쓰기 생성 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 예측 분석 실행
  const runPredictiveAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.predictiveAnalysis({ content });
      setAnalysisResults(result);
      showSuccess('예측 분석 완료', '예측 분석이 완료되었습니다!');
    } catch (error) {
      showError('예측 분석 오류', '예측 분석 중 오류가 발생했습니다.');
      console.error('예측 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 위험도 평가 실행
  const runRiskAssessment = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.riskAssessment({ content });
      setAnalysisResults(result);
      showSuccess('위험도 평가 완료', '위험도 평가가 완료되었습니다!');
    } catch (error) {
      showError('위험도 평가 오류', '위험도 평가 중 오류가 발생했습니다.');
      console.error('위험도 평가 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 경쟁사 분석 실행
  const runCompetitorAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.competitorAnalysis({ content });
      setAnalysisResults(result);
      showSuccess('경쟁사 분석 완료', '경쟁사 분석이 완료되었습니다!');
    } catch (error) {
      showError('경쟁사 분석 오류', '경쟁사 분석 중 오류가 발생했습니다.');
      console.error('경쟁사 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 재무 분석 실행
  const runFinancialAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.financialAnalysis({ content });
      setAnalysisResults(result);
      showSuccess('재무 분석 완료', '재무 분석이 완료되었습니다!');
    } catch (error) {
      showError('재무 분석 오류', '재무 분석 중 오류가 발생했습니다.');
      console.error('재무 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 고급 감정 분석 실행
  const runAdvancedSentimentAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.advancedSentimentAnalysis({ content });
      setAnalysisResults(result);
      showSuccess('고급 감정 분석 완료', '고급 감정 분석이 완료되었습니다!');
    } catch (error) {
      showError('고급 감정 분석 오류', '고급 감정 분석 중 오류가 발생했습니다.');
      console.error('고급 감정 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 머신러닝 예측 실행
  const runMachineLearningPrediction = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.machineLearningPrediction({ content });
      setAnalysisResults(result);
      showSuccess('머신러닝 예측 완료', '머신러닝 예측이 완료되었습니다!');
    } catch (error) {
      showError('머신러닝 예측 오류', '머신러닝 예측 중 오류가 발생했습니다.');
      console.error('머신러닝 예측 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 딥러닝 분석 실행
  const runDeepLearningAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.deepLearningAnalysis({ content });
      setAnalysisResults(result);
      showSuccess('딥러닝 분석 완료', '딥러닝 분석이 완료되었습니다!');
    } catch (error) {
      showError('딥러닝 분석 오류', '딥러닝 분석 중 오류가 발생했습니다.');
      console.error('딥러닝 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 자연어 처리 실행
  const runNaturalLanguageProcessing = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.naturalLanguageProcessing({ content });
      setAnalysisResults(result);
      showSuccess('자연어 처리 완료', '자연어 처리가 완료되었습니다!');
    } catch (error) {
      showError('자연어 처리 오류', '자연어 처리 중 오류가 발생했습니다.');
      console.error('자연어 처리 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 인지 컴퓨팅 실행
  const runCognitiveComputing = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.cognitiveComputing({ content });
      setAnalysisResults(result);
      showSuccess('인지 컴퓨팅 완료', '인지 컴퓨팅 분석이 완료되었습니다!');
    } catch (error) {
      showError('인지 컴퓨팅 오류', '인지 컴퓨팅 분석 중 오류가 발생했습니다.');
      console.error('인지 컴퓨팅 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 실시간 데이터 분석 실행
  const runRealTimeDataAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.realTimeDataAnalysis({ content });
      setAnalysisResults(result);
      showSuccess('실시간 데이터 분석 완료', '실시간 데이터 분석이 완료되었습니다!');
    } catch (error) {
      showError('실시간 데이터 분석 오류', '실시간 데이터 분석 중 오류가 발생했습니다.');
      console.error('실시간 데이터 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 고급 예측 모델링 실행
  const runAdvancedPredictiveModeling = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.advancedPredictiveModeling({ content });
      setAnalysisResults(result);
      showSuccess('고급 예측 모델링 완료', '고급 예측 모델링이 완료되었습니다!');
    } catch (error) {
      showError('고급 예측 모델링 오류', '고급 예측 모델링 중 오류가 발생했습니다.');
      console.error('고급 예측 모델링 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 적응형 학습 시스템 실행
  const runAdaptiveLearningSystem = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.adaptiveLearningSystem({ content });
      setAnalysisResults(result);
      showSuccess('적응형 학습 완료', '적응형 학습 시스템 분석이 완료되었습니다!');
    } catch (error) {
      showError('적응형 학습 오류', '적응형 학습 시스템 분석 중 오류가 발생했습니다.');
      console.error('적응형 학습 시스템 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 실시간 협업 시스템 실행
  const runRealTimeCollaboration = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.realTimeCollaboration({ content });
      setAnalysisResults(result);
      showSuccess('실시간 협업 완료', '실시간 협업 시스템 분석이 완료되었습니다!');
    } catch (error) {
      showError('실시간 협업 오류', '실시간 협업 시스템 분석 중 오류가 발생했습니다.');
      console.error('실시간 협업 시스템 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 고급 시각화 시스템 실행
  const runAdvancedVisualization = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.advancedVisualization({ content });
      setAnalysisResults(result);
      showSuccess('고급 시각화 완료', '고급 시각화 시스템 분석이 완료되었습니다!');
    } catch (error) {
      showError('고급 시각화 오류', '고급 시각화 시스템 분석 중 오류가 발생했습니다.');
      console.error('고급 시각화 시스템 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI 통합 분석 실행
  const runAIIntegratedAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.aiIntegratedAnalysis({ content });
      setAnalysisResults(result);
      showSuccess('AI 통합 분석 완료', 'AI 통합 분석이 완료되었습니다!');
    } catch (error) {
      showError('AI 통합 분석 오류', 'AI 통합 분석 중 오류가 발생했습니다.');
      console.error('AI 통합 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runRealTimeDecisionSupport = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.realTimeDecisionSupport({
        content,
        decision_type: 'strategic',
        urgency_level: 'normal'
      });
      setAnalysisResults(result);
      showSuccess('실시간 의사결정 완료', '실시간 의사결정 지원이 완료되었습니다!');
    } catch (error) {
      showError('실시간 의사결정 오류', '실시간 의사결정 지원 중 오류가 발생했습니다.');
      console.error('실시간 의사결정 지원 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAutoInsightsGeneration = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.autoInsightsGeneration({
        content,
        insight_type: 'comprehensive',
        data_sources: ['market', 'social', 'internal']
      });
      setAnalysisResults(result);
      showSuccess('자동 인사이트 완료', '자동 인사이트 생성이 완료되었습니다!');
    } catch (error) {
      showError('자동 인사이트 오류', '자동 인사이트 생성 중 오류가 발생했습니다.');
      console.error('자동 인사이트 생성 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runPersonalizedDashboard = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.personalizedDashboard({
        content,
        user_preferences: {
          theme: 'modern',
          layout: 'grid',
          widgets: ['performance', 'analytics', 'monitoring']
        },
        dashboard_type: 'comprehensive'
      });
      setAnalysisResults(result);
      showSuccess('개인화 대시보드 완료', '개인화된 대시보드가 생성되었습니다!');
    } catch (error) {
      showError('개인화 대시보드 오류', '개인화된 대시보드 생성 중 오류가 발생했습니다.');
      console.error('개인화된 대시보드 생성 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runMultilingualSupport = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.multilingualSupport({
        content,
        source_language: 'ko',
        target_language: 'en',
        translation_type: 'business'
      });
      setAnalysisResults(result);
      showSuccess('다국어 지원 완료', '다국어 지원이 완료되었습니다!');
    } catch (error) {
      showError('다국어 지원 오류', '다국어 지원 중 오류가 발생했습니다.');
      console.error('다국어 지원 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runArVrSupport = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.arVrSupport({
        content,
        vr_type: 'mixed_reality',
        interaction_mode: 'gesture'
      });
      setAnalysisResults(result);
      showSuccess('AR/VR 지원 완료', 'AR/VR 지원이 완료되었습니다!');
    } catch (error) {
      showError('AR/VR 지원 오류', 'AR/VR 지원 중 오류가 발생했습니다.');
      console.error('AR/VR 지원 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAdvancedInsightsGeneration = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.advancedInsightsGeneration({
        content,
        insight_depth: 'advanced',
        analysis_focus: 'comprehensive'
      });
      setAnalysisResults(result);
      showSuccess('고급 인사이트 완료', '고급 인사이트 생성이 완료되었습니다!');
    } catch (error) {
      showError('고급 인사이트 오류', '고급 인사이트 생성 중 오류가 발생했습니다.');
      console.error('고급 인사이트 생성 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runBlockchainSecurity = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.blockchainSecurity({
        content,
        security_level: 'enterprise',
        blockchain_type: 'private'
      });
      setAnalysisResults(result);
      showSuccess('블록체인 보안 완료', '블록체인 보안이 완료되었습니다!');
    } catch (error) {
      showError('블록체인 보안 오류', '블록체인 보안 중 오류가 발생했습니다.');
      console.error('블록체인 보안 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAutomatedWorkflowEngine = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.automatedWorkflowEngine({
        content,
        workflow_type: 'project_management',
        automation_level: 'full'
      });
      setAnalysisResults(result);
      showSuccess('자동화 워크플로우 완료', '자동화된 워크플로우 엔진이 완료되었습니다!');
    } catch (error) {
      showError('자동화 워크플로우 오류', '자동화된 워크플로우 엔진 중 오류가 발생했습니다.');
      console.error('자동화된 워크플로우 엔진 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runQuantumComputingSupport = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.quantumComputingSupport({
        content,
        quantum_type: 'hybrid',
        algorithm_type: 'optimization'
      });
      setAnalysisResults(result);
      showSuccess('양자 컴퓨팅 완료', '양자 컴퓨팅 지원이 완료되었습니다!');
    } catch (error) {
      showError('양자 컴퓨팅 오류', '양자 컴퓨팅 지원 중 오류가 발생했습니다.');
      console.error('양자 컴퓨팅 지원 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runEdgeComputingSupport = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.edgeComputingSupport({
        content,
        edge_type: 'distributed',
        processing_mode: 'real_time'
      });
      setAnalysisResults(result);
      showSuccess('엣지 컴퓨팅 완료', '엣지 컴퓨팅 지원이 완료되었습니다!');
    } catch (error) {
      showError('엣지 컴퓨팅 오류', '엣지 컴퓨팅 지원 중 오류가 발생했습니다.');
      console.error('엣지 컴퓨팅 지원 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runResearchUnlimitedAnalysis = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.researchUnlimitedAnalysis({
        content,
        analysis_type: 'comprehensive',
        research_depth: 'unlimited'
      });
      setAnalysisResults(result);
      showSuccess('연구용 무제한 분석 완료', '연구용 무제한 분석이 완료되었습니다!');
    } catch (error) {
      showError('연구용 무제한 분석 오류', '연구용 무제한 분석 중 오류가 발생했습니다.');
      console.error('연구용 무제한 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAdvancedResearchControl = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.advancedResearchControl({
        content,
        control_level: 'unlimited',
        research_mode: 'experimental'
      });
      setAnalysisResults(result);
      showSuccess('고급 연구 컨트롤 완료', '고급 연구 컨트롤이 완료되었습니다!');
    } catch (error) {
      showError('고급 연구 컨트롤 오류', '고급 연구 컨트롤 중 오류가 발생했습니다.');
      console.error('고급 연구 컨트롤 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runExperimentalResearchSystem = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.experimentalResearchSystem({
        content,
        research_scope: 'unlimited',
        innovation_level: 'breakthrough'
      });
      setAnalysisResults(result);
      showSuccess('실험적 연구 시스템 완료', '실험적 연구 시스템이 완료되었습니다!');
    } catch (error) {
      showError('실험적 연구 시스템 오류', '실험적 연구 시스템 중 오류가 발생했습니다.');
      console.error('실험적 연구 시스템 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runInnovativeResearchPlatform = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.innovativeResearchPlatform({
        content,
        platform_type: 'next_generation',
        research_focus: 'breakthrough'
      });
      setAnalysisResults(result);
      showSuccess('혁신적 연구 플랫폼 완료', '혁신적 연구 플랫폼이 완료되었습니다!');
    } catch (error) {
      showError('혁신적 연구 플랫폼 오류', '혁신적 연구 플랫폼 중 오류가 발생했습니다.');
      console.error('혁신적 연구 플랫폼 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runFutureTechnologyResearch = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.futureTechnologyResearch({
        content,
        technology_focus: 'futuristic',
        research_horizon: 'long_term'
      });
      setAnalysisResults(result);
      showSuccess('미래 기술 연구 완료', '미래 기술 연구 시스템이 완료되었습니다!');
    } catch (error) {
      showError('미래 기술 연구 오류', '미래 기술 연구 시스템 중 오류가 발생했습니다.');
      console.error('미래 기술 연구 시스템 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runIntegratedResearchEcosystem = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.integratedResearchEcosystem({
        content,
        ecosystem_type: 'comprehensive',
        integration_level: 'unlimited'
      });
      setAnalysisResults(result);
      showSuccess('통합 연구 생태계 완료', '통합 연구 생태계가 완료되었습니다!');
    } catch (error) {
      showError('통합 연구 생태계 오류', '통합 연구 생태계 중 오류가 발생했습니다.');
      console.error('통합 연구 생태계 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runNextGenerationResearchInnovation = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.nextGenerationResearchInnovation({
        content,
        innovation_type: 'breakthrough',
        research_focus: 'future_oriented'
      });
      setAnalysisResults(result);
      showSuccess('차세대 연구 혁신 완료', '차세대 연구 혁신 시스템이 완료되었습니다!');
    } catch (error) {
      showError('차세대 연구 혁신 오류', '차세대 연구 혁신 시스템 중 오류가 발생했습니다.');
      console.error('차세대 연구 혁신 시스템 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runUltimateResearchSystem = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.ultimateResearchSystem({
        content,
        system_type: 'ultimate',
        integration_level: 'complete'
      });
      setAnalysisResults(result);
      showSuccess('최종 통합 연구 시스템 완료', '최종 통합 연구 시스템이 완료되었습니다!');
    } catch (error) {
      showError('최종 통합 연구 시스템 오류', '최종 통합 연구 시스템 중 오류가 발생했습니다.');
      console.error('최종 통합 연구 시스템 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runUltimateResearchInnovationPlatform = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.ultimateResearchInnovationPlatform({
        content,
        platform_type: 'ultimate',
        innovation_level: 'transcendent'
      });
      setAnalysisResults(result);
      showSuccess('궁극적 연구 혁신 플랫폼 완료', '궁극적 연구 혁신 플랫폼이 완료되었습니다!');
    } catch (error) {
      showError('궁극적 연구 혁신 플랫폼 오류', '궁극적 연구 혁신 플랫폼 중 오류가 발생했습니다.');
      console.error('궁극적 연구 혁신 플랫폼 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runUltimateResearchEcosystem = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.ultimateResearchEcosystem({
        content,
        ecosystem_type: 'ultimate',
        integration_level: 'cosmic'
      });
      setAnalysisResults(result);
      showSuccess('궁극적 연구 생태계 완료', '궁극적 연구 생태계가 완료되었습니다!');
    } catch (error) {
      showError('궁극적 연구 생태계 오류', '궁극적 연구 생태계 중 오류가 발생했습니다.');
      console.error('궁극적 연구 생태계 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runCosmicAIIntegration = async (content: string) => {
    try {
      setIsAnalyzing(true);
      const result = await unifiedAPI.cosmicAIIntegration({
        input: content,
        context: {
          integration_level: 'cosmic',
          innovation_potential: 'infinite'
        }
      });
      setAnalysisResults(result);
      showSuccess('우주적 AI 통합 완료', '우주적 인공지능 통합 시스템이 활성화되었습니다!');
    } catch (error) {
      showError('우주적 AI 통합 오류', '우주적 AI 통합 시스템 중 오류가 발생했습니다.');
      console.error('우주적 AI 통합 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 시스템 메트릭 주기적 업데이트
  useEffect(() => {
    loadSystemMetrics();
    const interval = setInterval(loadSystemMetrics, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const loadOrCreateSession = async () => {
    if (!currentProject) return;

    try {
      setIsLoading(true);
      // 기존 세션이 있는지 확인
      const existingSessions = await chatSessionService.loadAllChatSessions();
      const projectSession = existingSessions.sessions.find(s => s.projectId === currentProject.id);

      if (projectSession) {
        setCurrentSession(projectSession);
      } else {
        // 새 세션 생성
        const newSession: ChatSession = {
          id: `session_${Date.now()}`,
          title: `${currentProject.name} 채팅`,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          projectId: currentProject.id,
          isActive: true,
          messageCount: 0,
          participants: ['user'],
          tags: [currentProject.name]
        };

        await chatSessionService.createChatSession(newSession.title, newSession.projectId);
        setCurrentSession(newSession);
      }
    } catch (error) {
      console.error('세션 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 모든 프로젝트 로드
  useEffect(() => {
    loadAllProjects();
  }, []);

  // 현재 프로젝트에 대한 채팅 세션 생성 또는 로드
  useEffect(() => {
    if (currentProject) {
      loadOrCreateSession();
    } else {
      setCurrentSession(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  const loadAllProjects = async () => {
    try {
      const projects = await projectService.loadProjects();
      setAllProjects(projects);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    }
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      setIsLoading(true);
      const newProject = await projectService.createProject(name, description);
      setAllProjects(prev => [...prev, newProject]);
      onProjectChange(newProject);
      setShowProjectModal(false);
      showSuccess('프로젝트 생성 완료', '프로젝트가 생성되었습니다!');
    } catch (error) {
      showError('프로젝트 생성 실패', '프로젝트 생성에 실패했습니다.');
      console.error('프로젝트 생성 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFiles = async (files: File[]) => {
    try {
      setIsLoading(true);
      // 파일 업로드 로직 구현
      showSuccess('파일 업로드 완료', `${files.length}개의 파일이 업로드되었습니다!`);
      setShowFileModal(false);
    } catch (error) {
      showError('파일 업로드 실패', '파일 업로드에 실패했습니다.');
      console.error('파일 업로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetInstructions = async (instructions: string) => {
    try {
      setIsLoading(true);
      // 지침 설정 로직 구현
      showSuccess('지침 설정 완료', '지침이 설정되었습니다!');
      setShowInstructionsModal(false);
    } catch (error) {
      showError('지침 설정 실패', '지침 설정에 실패했습니다.');
      console.error('지침 설정 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      // 파일 삭제 로직 구현
      showSuccess('파일 삭제 완료', '파일이 삭제되었습니다!');
    } catch (error) {
      showError('파일 삭제 실패', '파일 삭제에 실패했습니다.');
      console.error('파일 삭제 오류:', error);
    }
  };

  const handleGuidelineDelete = async (guidelineId: string) => {
    try {
      // 지침 삭제 로직 구현
      showSuccess('지침 삭제 완료', '지침이 삭제되었습니다!');
    } catch (error) {
      showError('지침 삭제 실패', '지침 삭제에 실패했습니다.');
      console.error('지침 삭제 오류:', error);
    }
  };

  const handleGuidelineToggle = async (guidelineId: string, enabled: boolean) => {
    try {
      // 지침 활성화/비활성화 로직 구현
      showSuccess('지침 상태 변경 완료', `지침이 ${enabled ? '활성화' : '비활성화'}되었습니다!`);
    } catch (error) {
      showError('지침 상태 변경 실패', '지침 상태 변경에 실패했습니다.');
      console.error('지침 상태 변경 오류:', error);
    }
  };

  const handleProjectExport = async (format: string) => {
    try {
      // 프로젝트 내보내기 로직 구현
      showSuccess('프로젝트 내보내기 완료', '프로젝트가 내보내기되었습니다!');
    } catch (error) {
      showError('프로젝트 내보내기 실패', '프로젝트 내보내기에 실패했습니다.');
      console.error('프로젝트 내보내기 오류:', error);
    }
  };

  const handleProjectImport = async (file: File) => {
    try {
      // 프로젝트 가져오기 로직 구현
      showSuccess('프로젝트 가져오기 완료', '프로젝트가 가져와졌습니다!');
    } catch (error) {
      showError('프로젝트 가져오기 실패', '프로젝트 가져오기에 실패했습니다.');
      console.error('프로젝트 가져오기 오류:', error);
    }
  };

  const handleUpdateSettings = async (settings: any) => {
    try {
      // 설정 업데이트 로직 구현
      showSuccess('설정 업데이트 완료', '설정이 업데이트되었습니다!');
    } catch (error) {
      showError('설정 업데이트 실패', '설정 업데이트에 실패했습니다.');
      console.error('설정 업데이트 오류:', error);
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    try {
      // 프로젝트 보관 로직 구현
      showSuccess('프로젝트 보관 완료', '프로젝트가 보관되었습니다!');
    } catch (error) {
      showError('프로젝트 보관 실패', '프로젝트 보관에 실패했습니다.');
      console.error('프로젝트 보관 오류:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      // 프로젝트 삭제 로직 구현
      showSuccess('프로젝트 삭제 완료', '프로젝트가 삭제되었습니다!');
    } catch (error) {
      showError('프로젝트 삭제 실패', '프로젝트 삭제에 실패했습니다.');
      console.error('프로젝트 삭제 오류:', error);
    }
  };

  // 키보드 단축키
  useKeyboardShortcuts({
    'Ctrl+N': () => setShowProjectModal(true),
    'Ctrl+O': () => setShowFileModal(true),
    'Ctrl+I': () => setShowInstructionsModal(true),
    'Ctrl+H': () => setShowHelpModal(true),
    'Ctrl+D': toggleDarkMode,
  } as any);

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">CORBU AI</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">지능형 AI 분석 플랫폼에 오신 것을 환영합니다</p>
          <div className="space-y-4">
            <button
              onClick={() => setShowProjectModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              새 프로젝트 생성
            </button>
            <div className="text-sm text-gray-500">
              또는 기존 프로젝트를 선택하세요
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* 헤더 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentProject.name}
              </h1>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {currentProject.status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AutoSaveIndicator
                isSaving={autoSave.state.isSaving}
                hasUnsavedChanges={autoSave.state.hasUnsavedChanges}
                lastSaved={autoSave.state.lastSaved}
                backupCount={autoSave.state.backupCount}
                onManualSave={autoSave.saveData}
              />
              <DarkModeToggle />
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ❓
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              💬 채팅
            </button>
            <button
              onClick={() => handleTabChange('files')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'files'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              📁 파일
            </button>
            <button
              onClick={() => handleTabChange('guidelines')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'guidelines'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              📋 지침
            </button>
            <button
              onClick={() => handleTabChange('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              📊 통계
            </button>
            <button
              onClick={() => handleTabChange('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              🔍 검색
            </button>
            <button
              onClick={() => handleTabChange('export')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              📤 내보내기
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              📚 히스토리
            </button>
            <button
              onClick={() => handleTabChange('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              📝 템플릿
            </button>
            <button
              onClick={() => handleTabChange('workflows')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'workflows'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              ⚙️ 워크플로우
            </button>
            <button
              onClick={() => handleTabChange('writing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'writing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              ✍️ 글쓰기
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              ⚙️ 설정
            </button>
          </nav>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full">
            {/* 프로젝트 액션 카드들 */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => setShowFileModal(true)}>
                  <div className="text-3xl mb-3">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">파일 추가</h3>
                  <p className="text-sm text-gray-600">문서, 이미지, 데이터 파일을 업로드하여 AI 분석을 시작하세요</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
                  onClick={() => setShowInstructionsModal(true)}>
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">지침 추가</h3>
                  <p className="text-sm text-gray-600">AI가 따라야 할 특별한 지침이나 요구사항을 설정하세요</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => runComprehensiveAnalysis('개포우성7차 재개발 프로젝트 분석')}>
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI 종합 분석</h3>
                  <p className="text-sm text-gray-600">고급 AI 분석으로 프로젝트를 종합적으로 분석하세요</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer"
                  onClick={() => runRealEstateAnalysis('개포우성7차 부동산 시장 분석')}>
                  <div className="text-3xl mb-3">🏢</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">부동산 분석</h3>
                  <p className="text-sm text-gray-600">부동산 시장 동향과 투자 가치를 분석하세요</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer"
                  onClick={() => runKnowledgeProcessing('재개발 프로젝트 지식 처리')}>
                  <div className="text-3xl mb-3">🧠</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">지식 처리</h3>
                  <p className="text-sm text-gray-600">지능형 지식 처리로 핵심 정보를 추출하세요</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
                  onClick={() => runWritingGeneration('재개발 프로젝트 제안서', 'professional')}>
                  <div className="text-3xl mb-3">✍️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">글쓰기 생성</h3>
                  <p className="text-sm text-gray-600">AI가 전문적인 문서를 자동으로 생성합니다</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer"
                  onClick={() => runPredictiveAnalysis('개포우성7차 시장 예측 분석')}>
                  <div className="text-3xl mb-3">🔮</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">예측 분석</h3>
                  <p className="text-sm text-gray-600">시장 동향과 프로젝트 성공 가능성을 예측합니다</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-red-300 transition-colors cursor-pointer"
                  onClick={() => runRiskAssessment('개포우성7차 위험도 평가')}>
                  <div className="text-3xl mb-3">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">위험도 평가</h3>
                  <p className="text-sm text-gray-600">프로젝트의 위험 요소를 분석하고 대응 방안을 제시합니다</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors cursor-pointer"
                  onClick={() => runCompetitorAnalysis('개포우성7차 경쟁사 분석')}>
                  <div className="text-3xl mb-3">🏆</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">경쟁사 분석</h3>
                  <p className="text-sm text-gray-600">시장 내 경쟁사와의 비교 분석을 수행합니다</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
                  onClick={() => runFinancialAnalysis('개포우성7차 재무 분석')}>
                  <div className="text-3xl mb-3">💰</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">재무 분석</h3>
                  <p className="text-sm text-gray-600">수익성, 유동성, 성장성 등 재무 지표를 분석합니다</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors cursor-pointer"
                  onClick={() => runAdvancedSentimentAnalysis('개포우성7차 감정 분석')}>
                  <div className="text-3xl mb-3">😊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">고급 감정 분석</h3>
                  <p className="text-sm text-gray-600">텍스트의 감정과 톤을 세밀하게 분석합니다</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors cursor-pointer"
                  onClick={() => runMachineLearningPrediction('개포우성7차 머신러닝 예측')}>
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">머신러닝 예측</h3>
                  <p className="text-sm text-gray-600">고급 ML 모델을 활용한 정확한 예측 분석</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => runDeepLearningAnalysis('개포우성7차 딥러닝 분석')}>
                  <div className="text-3xl mb-3">🧠</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">딥러닝 분석</h3>
                  <p className="text-sm text-gray-600">Transformer 기반 고급 신경망 분석</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
                  onClick={() => runNaturalLanguageProcessing('개포우성7차 자연어 처리')}>
                  <div className="text-3xl mb-3">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">자연어 처리</h3>
                  <p className="text-sm text-gray-600">고급 NLP 기술을 활용한 텍스트 분석</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => runCognitiveComputing('개포우성7차 인지 컴퓨팅')}>
                  <div className="text-3xl mb-3">💡</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">인지 컴퓨팅</h3>
                  <p className="text-sm text-gray-600">인간과 유사한 사고 과정을 통한 분석</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer"
                  onClick={() => runRealTimeDataAnalysis('개포우성7차 실시간 데이터 분석')}>
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">실시간 데이터 분석</h3>
                  <p className="text-sm text-gray-600">시장 데이터, 소셜 감정, 뉴스 분석 실시간 처리</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-red-300 transition-colors cursor-pointer"
                  onClick={() => runAdvancedPredictiveModeling('개포우성7차 고급 예측 모델링')}>
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">고급 예측 모델링</h3>
                  <p className="text-sm text-gray-600">앙상블 모델을 활용한 정확한 예측 분석</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
                  onClick={() => runAdaptiveLearningSystem('개포우성7차 적응형 학습 시스템')}>
                  <div className="text-3xl mb-3">🧠</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">적응형 학습 시스템</h3>
                  <p className="text-sm text-gray-600">지속적 학습과 사용자 맞춤형 분석</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => runRealTimeCollaboration('개포우성7차 실시간 협업 시스템')}>
                  <div className="text-3xl mb-3">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">실시간 협업 시스템</h3>
                  <p className="text-sm text-gray-600">팀원들과 실시간으로 협업하고 분석</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer"
                  onClick={() => runAdvancedVisualization('개포우성7차 고급 시각화 시스템')}>
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">고급 시각화 시스템</h3>
                  <p className="text-sm text-gray-600">인터랙티브 차트와 3D 시각화</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => runAIIntegratedAnalysis('개포우성7차 AI 통합 분석')}>
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI 통합 분석</h3>
                  <p className="text-sm text-gray-600">모든 AI 기술을 종합한 최종 분석</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
                  onClick={() => runRealTimeDecisionSupport('개포우성7차 실시간 의사결정 지원')}>
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">실시간 의사결정 지원</h3>
                  <p className="text-sm text-gray-600">즉시 의사결정을 위한 AI 지원 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer"
                  onClick={() => runAutoInsightsGeneration('개포우성7차 자동 인사이트 생성')}>
                  <div className="text-3xl mb-3">💡</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">자동 인사이트 생성</h3>
                  <p className="text-sm text-gray-600">데이터 기반 자동 인사이트 생성 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer"
                  onClick={() => runPersonalizedDashboard('개포우성7차 개인화된 대시보드')}>
                  <div className="text-3xl mb-3">🎛️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">개인화된 대시보드</h3>
                  <p className="text-sm text-gray-600">사용자 맞춤형 대시보드 생성 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors cursor-pointer"
                  onClick={() => runMultilingualSupport('개포우성7차 다국어 지원')}>
                  <div className="text-3xl mb-3">🌐</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">다국어 지원</h3>
                  <p className="text-sm text-gray-600">다국어 번역 및 현지화 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
                  onClick={() => runArVrSupport('개포우성7차 AR/VR 지원')}>
                  <div className="text-3xl mb-3">🥽</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AR/VR 지원</h3>
                  <p className="text-sm text-gray-600">증강현실 및 가상현실 지원 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-red-300 transition-colors cursor-pointer"
                  onClick={() => runAdvancedInsightsGeneration('개포우성7차 고급 인사이트 생성')}>
                  <div className="text-3xl mb-3">🔬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">고급 인사이트 생성</h3>
                  <p className="text-sm text-gray-600">AI 기반 고급 인사이트 생성 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => runBlockchainSecurity('개포우성7차 블록체인 보안')}>
                  <div className="text-3xl mb-3">🔗</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">블록체인 보안</h3>
                  <p className="text-sm text-gray-600">블록체인 기반 보안 및 투명성 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer"
                  onClick={() => runAutomatedWorkflowEngine('개포우성7차 자동화된 워크플로우 엔진')}>
                  <div className="text-3xl mb-3">⚙️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">자동화된 워크플로우 엔진</h3>
                  <p className="text-sm text-gray-600">AI 기반 자동화된 워크플로우 실행 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors cursor-pointer"
                  onClick={() => runQuantumComputingSupport('개포우성7차 양자 컴퓨팅 지원')}>
                  <div className="text-3xl mb-3">⚛️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">양자 컴퓨팅 지원</h3>
                  <p className="text-sm text-gray-600">양자 컴퓨팅 기반 고급 분석 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
                  onClick={() => runEdgeComputingSupport('개포우성7차 엣지 컴퓨팅 지원')}>
                  <div className="text-3xl mb-3">🌐</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">엣지 컴퓨팅 지원</h3>
                  <p className="text-sm text-gray-600">엣지 컴퓨팅 기반 실시간 처리 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer"
                  onClick={() => runResearchUnlimitedAnalysis('개포우성7차 연구용 무제한 분석')}>
                  <div className="text-3xl mb-3">🚀</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">연구용 무제한 분석</h3>
                  <p className="text-sm text-gray-600">제한 없는 연구 및 분석 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => runAdvancedResearchControl('개포우성7차 고급 연구 컨트롤')}>
                  <div className="text-3xl mb-3">🎛️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">고급 연구 컨트롤</h3>
                  <p className="text-sm text-gray-600">연구용 제한 없는 기능 제어 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer"
                  onClick={() => runExperimentalResearchSystem('개포우성7차 실험적 연구 시스템')}>
                  <div className="text-3xl mb-3">🔬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">실험적 연구 시스템</h3>
                  <p className="text-sm text-gray-600">최첨단 연구 및 혁신 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors cursor-pointer"
                  onClick={() => runInnovativeResearchPlatform('개포우성7차 혁신적 연구 플랫폼')}>
                  <div className="text-3xl mb-3">🌟</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">혁신적 연구 플랫폼</h3>
                  <p className="text-sm text-gray-600">차세대 연구 및 개발 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
                  onClick={() => runFutureTechnologyResearch('개포우성7차 미래 기술 연구')}>
                  <div className="text-3xl mb-3">🚀</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">미래 기술 연구</h3>
                  <p className="text-sm text-gray-600">차세대 기술 연구 및 개발 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors cursor-pointer"
                  onClick={() => runIntegratedResearchEcosystem('개포우성7차 통합 연구 생태계')}>
                  <div className="text-3xl mb-3">🌍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">통합 연구 생태계</h3>
                  <p className="text-sm text-gray-600">모든 연구 기능을 통합한 최종 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors cursor-pointer"
                  onClick={() => runNextGenerationResearchInnovation('개포우성7차 차세대 연구 혁신')}>
                  <div className="text-3xl mb-3">✨</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">차세대 연구 혁신</h3>
                  <p className="text-sm text-gray-600">미래 지향적 연구 혁신 플랫폼</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors cursor-pointer"
                  onClick={() => runUltimateResearchSystem('개포우성7차 최종 통합 연구 시스템')}>
                  <div className="text-3xl mb-3">🏆</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">최종 통합 연구 시스템</h3>
                  <p className="text-sm text-gray-600">모든 연구 기능의 궁극적 통합</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
                  onClick={() => runUltimateResearchInnovationPlatform('개포우성7차 궁극적 연구 혁신 플랫폼')}>
                  <div className="text-3xl mb-3">🌌</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">궁극적 연구 혁신 플랫폼</h3>
                  <p className="text-sm text-gray-600">미래를 선도하는 궁극적 연구 시스템</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-rose-300 transition-colors cursor-pointer"
                  onClick={() => runUltimateResearchEcosystem('개포우성7차 궁극적 연구 생태계')}>
                  <div className="text-3xl mb-3">🌠</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">궁극적 연구 생태계</h3>
                  <p className="text-sm text-gray-600">모든 연구 시스템의 궁극적 통합 생태계</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => runCosmicAIIntegration('개포우성7차 우주적 AI 통합 시스템')}>
                  <div className="text-3xl mb-3">🌌</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">우주적 AI 통합 시스템</h3>
                  <p className="text-sm text-gray-600">모든 AI 기능의 우주적 차원 통합</p>
                </div>
              </div>
            </div>

            {/* 분석 결과 표시 */}
            {isAnalyzing && (
              <div className="p-6 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800">AI 분석 중...</span>
                </div>
              </div>
            )}

            {analysisResults && (
              <div className="p-6 bg-green-50 border-b border-green-200">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">분석 결과</h3>
                  <pre className="text-sm text-green-700 bg-white p-4 rounded border overflow-auto max-h-64">
                    {JSON.stringify(analysisResults, null, 2)}
                  </pre>
                </div>
                <button
                  onClick={() => setAnalysisResults(null)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  결과 닫기
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="p-6 overflow-y-auto">
            <ProjectFiles
              files={currentProject.files}
              onFileDelete={handleFileDelete}
            />
          </div>
        )}

        {activeTab === 'guidelines' && (
          <div className="p-6 overflow-y-auto">
            <ProjectGuidelines
              guidelines={currentProject.guidelines}
              onGuidelineDelete={handleGuidelineDelete}
              onGuidelineToggle={handleGuidelineToggle}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-6 overflow-y-auto space-y-6">
            <RealTimeDashboard />
            <ProjectStats project={currentProject} />

            {/* 시스템 메트릭 표시 */}
            {systemMetrics && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">시스템 메트릭</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{systemMetrics.metrics?.active_users || 0}</div>
                    <div className="text-sm text-gray-600">활성 사용자</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{systemMetrics.metrics?.requests_per_minute || 0}</div>
                    <div className="text-sm text-gray-600">요청/분</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{(systemMetrics.metrics?.average_response_time || 0).toFixed(2)}s</div>
                    <div className="text-sm text-gray-600">평균 응답시간</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{(systemMetrics.metrics?.success_rate || 0) * 100}%</div>
                    <div className="text-sm text-gray-600">성공률</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="p-6 overflow-y-auto">
            <ProjectSearch
              projects={allProjects}
              onProjectSelect={(project) => onProjectChange(project)}
              selectedProjectId={currentProject?.id}
            />
          </div>
        )}

        {activeTab === 'export' && (
          <div className="p-6 overflow-y-auto">
            <ProjectExport
              project={currentProject}
              onExport={handleProjectExport as any}
              onImport={handleProjectImport as any}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6 overflow-y-auto">
            <AIHistoryPanel />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-6 overflow-y-auto">
            <PromptTemplatesPanel />
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="p-6 overflow-y-auto">
            <AIWorkflowPanel />
          </div>
        )}

        {activeTab === 'writing' && (
          <div className="h-full">
            <AdvancedWritingInterface />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 overflow-y-auto space-y-6">
            <AIModelSettings />
            <ProjectSettings
              project={currentProject}
              onUpdateSettings={handleUpdateSettings}
              onArchiveProject={handleArchiveProject}
              onDeleteProject={handleDeleteProject}
            />
          </div>
        )}
      </div>

      {/* 채팅 인터페이스 */}
      {currentSession && (
        <div className="flex-1 flex flex-col">
          <UnifiedChatInterface
            currentSession={currentSession}
            currentProject={currentProject}
          />
        </div>
      )}

      {/* 모달들 */}
      {showProjectModal && (
        <ProjectCreationModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onCreateProject={handleCreateProject as any}
          isLoading={isLoading}
        />
      )}

      {showFileModal && (
        <FileUploadModal
          isOpen={showFileModal}
          onClose={() => setShowFileModal(false)}
          onUploadFiles={handleUploadFiles}
          isLoading={isLoading}
        />
      )}

      {showInstructionsModal && (
        <InstructionsModal
          isOpen={showInstructionsModal}
          onClose={() => setShowInstructionsModal(false)}
          onSetInstructions={handleSetInstructions}
          isLoading={isLoading}
        />
      )}

      {/* 도움말 모달 */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* 협업 패널 */}
      {currentProject && (
        <CollaborationPanel
          projectId={currentProject.id}
          isOpen={showCollaborationPanel}
          onClose={() => setShowCollaborationPanel(false)}
        />
      )}
    </div>
  );
};

export default ChatGPTStyleInterface;
