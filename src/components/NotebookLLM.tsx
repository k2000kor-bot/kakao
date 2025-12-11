/**
 * 노트북 LLM 컴포넌트
 * 기본 및 프로젝트별 노트북 LLM 인터페이스
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import notebookLLMService from '../services/notebookLLMService';
import type {
  NotebookLLMConfig,
  NotebookLLMStatus,
  NotebookLLMResponse,
} from '../services/notebookLLMService';
import notebookLLMStreamingService from '../services/notebookLLMStreamingService';
import conversationHistoryService from '../services/conversationHistoryService';
import promptTemplateService from '../services/promptTemplateService';
import writingStyleService from '../services/writingStyleService';
import toneService, { ToneType, AgeGroup, ToneConfig } from '../services/toneService';
import domainKnowledgeService, { DomainType } from '../services/domainKnowledgeService';
import { errorLogger } from '../utils/errorLogger';
import './NotebookLLM.css';
// MindMapData는 임시로 로컬 타입으로 정의
interface MindMapData {
  nodes: Array<{ id: string; label: string; type?: string }>;
  edges: Array<{ source: string; target: string; type?: string }>;
}

// detectRelevantDomains 임시 구현
const detectRelevantDomains = (prompt: string): any[] => {
  // 간단한 키워드 기반 도메인 감지
  const domains: any[] = [];
  const promptLower = prompt.toLowerCase();

  // 기본 도메인 키워드 매칭
  const domainKeywords: Record<string, string[]> = {
    '도시정비': ['재개발', '재건축', '정비구역', '조합'],
    '세무': ['세금', '소득세', '양도세', '종합부동산세'],
    '법무': ['계약', '소유권', '등기', '법률'],
  };

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(keyword => promptLower.includes(keyword))) {
      domains.push({
        domain,
        confidence: 0.7,
        matchedKeywords: keywords.filter(k => promptLower.includes(k)),
      });
    }
  }

  return domains;
};

// 임시 함수 정의
const searchDomainKnowledge = (query: string, domains?: string[]): any[] => [];
const getTermDefinition = (term: string): any[] => [];
const getDomainDetail = (domainKey: string): any => null;
const getDomainFAQs = (domainKey: string): any[] => [];
const getDomainExamples = (domainKey: string): any[] => [];
const generateDomainInsights = (domains: string[]): any[] => [];
const validateDomainKnowledge = (domainKey: string): any => null;
const getExpertModeConfig = (domain: string): any => null;
const setExpertModeConfig = (config: any): void => { };
const getDomainUsageStats = (): any[] => [];
const getKnowledgeHistory = (): any[] => [];

// 임시로 주석 처리 - 컴포넌트가 없을 수 있음
// import WritingStyleSelector from './WritingStyleSelector';
// import MindMap from './MindMap';
// import ProgressIndicator from './ProgressIndicator';
// import ErrorRecovery from './ErrorRecovery';

// 임시 컴포넌트 정의
const WritingStyleSelector: React.FC<{ selectedStyleId?: string; onStyleSelect: (styleId: string) => void }> = ({ selectedStyleId, onStyleSelect }) => {
  return (
    <div>
      <p>글쓰기 스타일 선택 기능은 준비 중입니다.</p>
    </div>
  );
};
const MindMap: React.FC<{ data: MindMapData; onNodeClick: (node: any) => void; onNodeSelect: (node: string | null) => void; width: number; height: number; interactive: boolean }> = () => null;
const ProgressIndicator: React.FC<{ progress: number; label: string; size: string; showDetails: boolean }> = () => null;
const ErrorRecovery: React.FC<{ error: Error; onRetry: () => Promise<void>; autoRetry: boolean }> = () => null;
const RealEstateDataPanel: React.FC<{ projectId?: string; onDataSelect: (data: any) => void }> = () => null;

interface NotebookLLMProps {
  /**
   * 프로젝트 ID (프로젝트별 노트북인 경우)
   */
  projectId?: string;

  /**
   * 초기 프롬프트
   */
  initialPrompt?: string;

  /**
   * 응답 완료 콜백
   */
  onResponseComplete?: (response: NotebookLLMResponse) => void;

  /**
   * 에러 발생 콜백
   */
  onError?: (error: Error) => void;
}

const NotebookLLM: React.FC<NotebookLLMProps> = ({
  projectId,
  initialPrompt = '',
  onResponseComplete,
  onError,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [response, setResponse] = useState<NotebookLLMResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<NotebookLLMStatus | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [useStreaming, setUseStreaming] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedWritingStyle, setSelectedWritingStyle] = useState<string | null>(null);
  const [showWritingStyleSelector, setShowWritingStyleSelector] = useState(false);
  const [writingTopic, setWritingTopic] = useState('');
  const [writingLength, setWritingLength] = useState('중간');
  const [selectedTone, setSelectedTone] = useState<ToneType>('polite');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(null);
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [detectedDomains, setDetectedDomains] = useState<any[]>([]);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  // 도메인 지식 선택 (프로젝트별 또는 전체)
  const [selectedDomains, setSelectedDomains] = useState<DomainType[]>([]);
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [domainSearchResults, setDomainSearchResults] = useState<any[]>([]);
  const [selectedDomainDetail, setSelectedDomainDetail] = useState<string | null>(null);
  const [showDomainStatistics, setShowDomainStatistics] = useState(false);
  const [termSearchQuery, setTermSearchQuery] = useState('');
  const [termDefinitions, setTermDefinitions] = useState<any[]>([]);
  const [domainFAQs, setDomainFAQs] = useState<any[]>([]);
  const [domainExamples, setDomainExamples] = useState<any[]>([]);
  const [showRelationGraph, setShowRelationGraph] = useState(false);
  const [domainInsights, setDomainInsights] = useState<any[]>([]);
  const [knowledgeQuality, setKnowledgeQuality] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [expertMode, setExpertMode] = useState(false);
  const [expertModeConfigs, setExpertModeConfigs] = useState<Record<string, any>>({});
  const [domainUsageStats, setDomainUsageStats] = useState<any[]>([]);
  const [knowledgeHistory, setKnowledgeHistory] = useState<any[]>([]);
  const [showDomainSelector, setShowDomainSelector] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [selectedMindMapNode, setSelectedMindMapNode] = useState<string | null>(null);
  const [showRealEstateData, setShowRealEstateData] = useState(false);
  const [selectedRealEstateData, setSelectedRealEstateData] = useState<any>(null);
  const responseEndRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<NotebookLLMConfig>(() => {
    if (projectId) {
      return notebookLLMService.getProjectNotebookConfig(projectId) || {
        modelType: 'auto',
        processingMode: 'auto',
        projectId,
        temperature: 0.7,
        maxTokens: 2000,
      };
    }
    return notebookLLMService.loadDefaultConfig();
  });

  // 상태 확인
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const notebookStatus = projectId
          ? await notebookLLMService.getProjectNotebookStatus(projectId)
          : await notebookLLMService.getDefaultNotebookStatus();
        setStatus(notebookStatus);
      } catch (err) {
        errorLogger.error('상태 로드 실패', err instanceof Error ? err : new Error(String(err)), {
          component: 'NotebookLLM',
          action: 'loadStatus',
          projectId,
        });
      }
    };

    loadStatus();
  }, [projectId]);

  // 프롬프트 변경 시 자동 도메인 감지
  useEffect(() => {
    if (autoDetectEnabled && prompt.trim().length > 10) {
      try {
        const detected = detectRelevantDomains(prompt);
        setDetectedDomains(detected);

        // 신뢰도가 높은 도메인 자동 선택
        const highConfidence = detected
          .filter((d: any) => d.confidence > 0.5)
          .map((d: any) => d.domain);

        if (highConfidence.length > 0) {
          setSelectedDomains((prev: string[]) => {
            const combined = [...new Set([...prev, ...highConfidence])];
            return combined;
          });
        }
      } catch (error) {
        errorLogger.error('도메인 자동 감지 실패', error instanceof Error ? error : new Error(String(error)), {
          component: 'NotebookLLM',
          action: 'autoDetectDomains',
        });
      }
    }
  }, [prompt, autoDetectEnabled]);

  // 프로젝트별 도메인 설정 로드
  useEffect(() => {
    if (projectId) {
      try {
        const saved = localStorage.getItem(`domainConfig_${projectId}`);
        if (saved) {
          const savedDomains = JSON.parse(saved) as DomainType[];
          if (savedDomains.length > 0) {
            setSelectedDomains(savedDomains);
          }
        }
      } catch (error) {
        errorLogger.warn('프로젝트 도메인 설정 로드 실패', {
          component: 'NotebookLLM',
          action: 'loadDomainConfig',
          projectId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }, [projectId]);

  // 마인드맵 데이터 생성
  useEffect(() => {
    if (showMindMap) {
      const mindMap: MindMapData = {
        nodes: selectedDomains.map(d => ({ id: d, label: d, type: 'domain' })),
        edges: [],
      };
      setMindMapData(mindMap);
    }
  }, [showMindMap, selectedDomains]);

  // 글쓰기 스타일 적용 (어투/연령대 포함)
  const applyWritingStyle = useCallback((styleId: string, topic: string): string => {
    try {
      const toneConfig: ToneConfig = {
        toneType: selectedTone,
        ageGroup: selectedAgeGroup || undefined,
      };
      const stylePrompt = writingStyleService.generatePrompt(
        styleId,
        topic,
        writingTopic,
        writingLength,
        toneConfig
      );
      return stylePrompt;
    } catch (error) {
      errorLogger.error('글쓰기 스타일 적용 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'applyWritingStyle',
      });
      return prompt;
    }
  }, [writingTopic, writingLength, selectedTone, selectedAgeGroup, prompt]);

  // 응답 생성

  // 도메인 지식 검색
  const handleDomainSearch = useCallback((query: string) => {
    if (query.trim().length < 2) {
      setDomainSearchResults([]);
      return;
    }

    try {
      const results = searchDomainKnowledge(query, selectedDomains.length > 0 ? selectedDomains : undefined);
      setDomainSearchResults(results);
    } catch (error) {
      errorLogger.error('도메인 검색 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'searchDomains',
      });
    }
  }, [selectedDomains]);

  // 용어 검색
  const handleTermSearch = useCallback((term: string) => {
    if (term.trim().length < 2) {
      setTermDefinitions([]);
      return;
    }

    try {
      const definitions = getTermDefinition(term);
      setTermDefinitions(definitions);
    } catch (error) {
      errorLogger.error('용어 검색 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'searchTerms',
      });
    }
  }, []);

  // 도메인 상세 정보 로드
  const loadDomainDetail = useCallback((domainKey: string) => {
    try {
      const detail = getDomainDetail(domainKey);
      if (detail) {
        setSelectedDomainDetail(domainKey);
      }
    } catch (error) {
      errorLogger.error('도메인 상세 정보 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'loadDomainDetails',
      });
    }
  }, []);


  // 도메인 FAQ 및 예시 로드
  const loadDomainFAQs = useCallback((domainKey: string) => {
    try {
      const faqs = getDomainFAQs(domainKey);
      const examples = getDomainExamples(domainKey);
      setDomainFAQs(faqs);
      setDomainExamples(examples);
    } catch (error) {
      errorLogger.error('FAQ 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'loadFAQs',
      });
    }
  }, []);

  // 도메인 인사이트 생성
  const generateInsights = useCallback(() => {
    if (selectedDomains.length > 0) {
      try {
        const insights = generateDomainInsights(selectedDomains);
        setDomainInsights(insights);
      } catch (error) {
        errorLogger.error('인사이트 생성 실패', error instanceof Error ? error : new Error(String(error)), {
          component: 'NotebookLLM',
          action: 'generateInsights',
        });
      }
    }
  }, [selectedDomains]);

  // 선택된 도메인 변경 시 FAQ 및 예시 로드
  useEffect(() => {
    if (selectedDomains.length > 0) {
      const firstDomain = selectedDomains[0];
      loadDomainFAQs(firstDomain);
      generateInsights();
    } else {
      setDomainFAQs([]);
      setDomainExamples([]);
      setDomainInsights([]);
    }
  }, [selectedDomains, loadDomainFAQs, generateInsights]);

  // 도메인 검색
  useEffect(() => {
    if (domainSearchQuery.trim().length >= 2) {
      handleDomainSearch(domainSearchQuery);
    } else {
      setDomainSearchResults([]);
    }
  }, [domainSearchQuery, handleDomainSearch]);

  // 용어 검색
  useEffect(() => {
    if (termSearchQuery.trim().length >= 2) {
      handleTermSearch(termSearchQuery);
    } else {
      setTermDefinitions([]);
    }
  }, [termSearchQuery, handleTermSearch]);

  // 지식 품질 검증
  const validateKnowledge = useCallback((domainKey: string) => {
    try {
      const quality = validateDomainKnowledge(domainKey);
      setKnowledgeQuality(quality);
    } catch (error) {
      errorLogger.error('품질 검증 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'validateQuality',
      });
    }
  }, []);


  // 전문가 모드 토글
  const handleExpertModeToggle = useCallback((domain: string, enabled: boolean) => {
    const currentConfig = getExpertModeConfig(domain) || {
      domain,
      enabled: false,
      depth: 'intermediate',
      includeCaseStudies: true,
      includeCalculations: true,
      includeLatestPolicies: true
    };

    const newConfig = { ...currentConfig, enabled };
    setExpertModeConfig(newConfig);
    setExpertModeConfigs(prev => ({ ...prev, [domain]: newConfig }));
  }, []);

  // 도메인 사용 통계 로드
  const loadDomainStats = useCallback(() => {
    try {
      const stats = getDomainUsageStats();
      setDomainUsageStats(stats);
    } catch (error) {
      errorLogger.error('통계 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'loadStats',
      });
    }
  }, []);

  // 지식 히스토리 로드
  const loadKnowledgeHistory = useCallback(() => {
    try {
      const history = getKnowledgeHistory();
      setKnowledgeHistory(history);
    } catch (error) {
      errorLogger.error('히스토리 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'loadHistory',
      });
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    let finalPrompt = prompt.trim();

    // 글쓰기 스타일이 선택된 경우 적용
    if (selectedWritingStyle && writingTopic.trim()) {
      finalPrompt = applyWritingStyle(selectedWritingStyle, writingTopic);
    } else if (!finalPrompt) {
      return;
    }

    // 도메인 지식 통합
    if (selectedDomains.length > 0) {
      finalPrompt = domainKnowledgeService.enrichPromptWithDomainKnowledge(
        finalPrompt,
        selectedDomains,
        0.3
      );
    } else {
      // 자동 도메인 감지
      const detectedDomains = domainKnowledgeService.detectDomainsFromPrompt(finalPrompt);
      if (detectedDomains.length > 0) {
        finalPrompt = domainKnowledgeService.enrichPromptWithDomainKnowledge(
          finalPrompt,
          detectedDomains,
          0.2
        );
      }
    }

    // 실거래 정보 및 등기 정보 통합
    if (selectedRealEstateData) {
      let dataContext = '\n\n[부동산 데이터 정보]\n';

      if ('transactionType' in selectedRealEstateData) {
        // 실거래 정보
        const transaction = selectedRealEstateData as any;
        dataContext += `거래 유형: ${transaction.transactionType}\n`;
        dataContext += `부동산 유형: ${transaction.propertyType}\n`;
        dataContext += `주소: ${transaction.address.sido} ${transaction.address.sigungu} ${transaction.address.dong}\n`;
        dataContext += `거래 금액: ${(transaction.price.amount / 10000).toLocaleString()}만원\n`;
        dataContext += `면적: ${transaction.area.exclusive}㎡\n`;
        dataContext += `거래일자: ${transaction.transactionDate}\n`;
        if (transaction.floor) {
          dataContext += `층수: ${transaction.floor.current}/${transaction.floor.total}층\n`;
        }
      } else {
        // 등기 정보
        const registry = selectedRealEstateData as any;
        dataContext += `변경 유형: ${registry.changeType}\n`;
        dataContext += `주소: ${registry.propertyAddress.sido} ${registry.propertyAddress.sigungu} ${registry.propertyAddress.dong}\n`;
        dataContext += `변경일자: ${registry.changeDate}\n`;
        if (registry.previousOwner) {
          dataContext += `이전 소유자: ${registry.previousOwner.name} (${registry.previousOwner.share})\n`;
        }
        if (registry.newOwner) {
          dataContext += `신규 소유자: ${registry.newOwner.name} (${registry.newOwner.share})\n`;
        }
        if (registry.mortgageInfo) {
          dataContext += `저당권: ${registry.mortgageInfo.creditor} (${(registry.mortgageInfo.amount / 10000).toLocaleString()}만원)\n`;
        }
        if (registry.leaseInfo) {
          dataContext += `전세권: ${registry.leaseInfo.lessee} (${(registry.leaseInfo.deposit / 10000).toLocaleString()}만원)\n`;
        }
      }

      dataContext += '\n위 부동산 데이터를 바탕으로 정확하고 상세한 답변을 제공해주세요.';
      finalPrompt += dataContext;
    }

    setIsLoading(true);
    setIsStreaming(useStreaming);
    setError(null);
    setResponse(null);
    setStreamingContent('');

    // 사용자 메시지 추가
    if (conversationId) {
      conversationHistoryService.addMessage(conversationId, {
        role: 'user',
        content: finalPrompt,
      });
    }

    try {
      if (useStreaming) {
        // 스트리밍 모드
        const context = conversationId
          ? conversationHistoryService.getContextForLLM(conversationId, 10)
          : undefined;

        await (projectId
          ? notebookLLMStreamingService.streamProjectNotebook(
            projectId,
            finalPrompt,
            { conversationContext: context },
            config,
            {
              onChunk: (chunk) => {
                setStreamingContent(chunk.content);
              },
              onComplete: (result) => {
                setResponse(result);
                setIsStreaming(false);
                setIsLoading(false);

                if (conversationId) {
                  conversationHistoryService.addMessage(conversationId, {
                    role: 'assistant',
                    content: result.content,
                    metadata: {
                      modelUsed: result.modelUsed,
                      tokensUsed: result.tokensUsed,
                      processingTime: result.processingTime,
                      confidence: result.confidence,
                    },
                  });
                }

                if (onResponseComplete) {
                  onResponseComplete(result);
                }
              },
              onError: (err) => {
                errorLogger.error('NotebookLLM 스트리밍 오류', err instanceof Error ? err : new Error(String(err)), {
                  component: 'NotebookLLM',
                  action: 'streamProjectNotebook',
                  projectId,
                });
                setError(err);
                setIsStreaming(false);
                setIsLoading(false);
                if (onError) {
                  try {
                    onError(err);
                  } catch (callbackError) {
                    errorLogger.error('onError 콜백 실행 중 오류', callbackError instanceof Error ? callbackError : new Error(String(callbackError)), {
                      component: 'NotebookLLM',
                      action: 'onErrorCallback',
                    });
                  }
                }
              },
            }
          )
          : notebookLLMStreamingService.streamDefaultNotebook(
            finalPrompt,
            { conversationContext: context },
            config,
            {
              onChunk: (chunk) => {
                setStreamingContent(chunk.content);
              },
              onComplete: (result) => {
                setResponse(result);
                setIsStreaming(false);
                setIsLoading(false);

                if (conversationId) {
                  conversationHistoryService.addMessage(conversationId, {
                    role: 'assistant',
                    content: result.content,
                    metadata: {
                      modelUsed: result.modelUsed,
                      tokensUsed: result.tokensUsed,
                      processingTime: result.processingTime,
                      confidence: result.confidence,
                    },
                  });
                }

                if (onResponseComplete) {
                  onResponseComplete(result);
                }
              },
              onError: (err) => {
                errorLogger.error('NotebookLLM 스트리밍 오류', err instanceof Error ? err : new Error(String(err)), {
                  component: 'NotebookLLM',
                  action: 'streamDefaultNotebook',
                });
                setError(err);
                setIsStreaming(false);
                setIsLoading(false);
                if (onError) {
                  try {
                    onError(err);
                  } catch (callbackError) {
                    errorLogger.error('onError 콜백 실행 중 오류', callbackError instanceof Error ? callbackError : new Error(String(callbackError)), {
                      component: 'NotebookLLM',
                      action: 'onErrorCallback',
                    });
                  }
                }
              },
            }
          ));
      } else {
        // 일반 모드
        const context = conversationId
          ? conversationHistoryService.getContextForLLM(conversationId, 10)
          : undefined;

        const result = projectId
          ? await notebookLLMService.generateWithProjectNotebook(projectId, finalPrompt, { conversationContext: context }, config)
          : await notebookLLMService.generateWithDefaultNotebook(finalPrompt, { conversationContext: context }, config);

        setResponse(result);
        setIsLoading(false);

        if (conversationId) {
          conversationHistoryService.addMessage(conversationId, {
            role: 'assistant',
            content: result.content,
            metadata: {
              modelUsed: result.modelUsed,
              tokensUsed: result.tokensUsed,
              processingTime: result.processingTime,
              confidence: result.confidence,
            },
          });
        }

        if (onResponseComplete) {
          onResponseComplete(result);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      errorLogger.error('NotebookLLM 응답 생성 실패', error, {
        component: 'NotebookLLM',
        action: 'generateResponse',
        projectId,
        useStreaming,
      });
      setError(error);
      setIsStreaming(false);
      setIsLoading(false);

      // 에러 콜백 호출
      if (onError) {
        try {
          onError(error);
        } catch (callbackError) {
          errorLogger.error('onError 콜백 실행 중 오류', callbackError instanceof Error ? callbackError : new Error(String(callbackError)), {
            component: 'NotebookLLM',
            action: 'onErrorCallback',
          });
        }
      }
    }
  }, [prompt, projectId, config, useStreaming, conversationId, selectedWritingStyle, writingTopic, applyWritingStyle, onResponseComplete, onError]);

  // 설정 업데이트
  const handleConfigChange = useCallback((newConfig: Partial<NotebookLLMConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    if (projectId) {
      notebookLLMService.setProjectNotebookConfig(projectId, updatedConfig);
    } else {
      notebookLLMService.setDefaultConfig(updatedConfig);
    }
  }, [config, projectId]);

  // 도메인 선택 핸들러
  const handleDomainToggle = useCallback((domain: DomainType) => {
    setSelectedDomains(prev => {
      if (prev.includes(domain)) {
        return prev.filter(d => d !== domain);
      } else {
        return [...prev, domain];
      }
    });
  }, []);

  // 프로젝트별 도메인 설정 저장
  const handleSaveDomainConfig = useCallback(() => {
    if (projectId) {
      try {
        localStorage.setItem(`domainConfig_${projectId}`, JSON.stringify(selectedDomains));
      } catch (error) {
        errorLogger.error('도메인 설정 저장 실패', error instanceof Error ? error : new Error(String(error)), {
          component: 'NotebookLLM',
          action: 'saveDomainConfig',
          projectId,
        });
      }
    }
    setShowDomainSelector(false);
  }, [projectId, selectedDomains]);

  // 대화 초기화
  useEffect(() => {
    if (!conversationId) {
      const conversation = conversationHistoryService.createConversation(
        projectId ? `프로젝트 노트북 LLM` : '기본 노트북 LLM',
        projectId
      );
      setConversationId(conversation.id);
    }
  }, [conversationId, projectId]);

  // 스트리밍 콘텐츠 자동 스크롤
  useEffect(() => {
    if (streamingContent && responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamingContent]);

  // Enter 키 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  return (
    <div className="notebook-llm">
      <div className="notebook-llm-header">
        <h3 className="notebook-llm-title">
          {projectId ? '프로젝트 노트북 LLM' : '기본 노트북 LLM'}
        </h3>
        {status && (
          <div className="notebook-llm-status">
            <span className={`status-indicator ${status.available ? 'available' : 'unavailable'}`}>
              {status.available ? '●' : '○'}
            </span>
            <span className="status-text">
              {status.available ? '사용 가능' : '사용 불가'}
            </span>
            {status.currentModel && (
              <span className="current-model">{status.currentModel}</span>
            )}
          </div>
        )}
      </div>

      {/* 설정 패널 */}
      <div className="notebook-llm-config">
        <div className="config-row">
          <label htmlFor="model-type">모델 타입:</label>
          <select
            id="model-type"
            value={config.modelType}
            onChange={(e) => handleConfigChange({ modelType: e.target.value as any })}
          >
            <option value="auto">자동 선택</option>
            <option value="llama3.1:8b">Llama 3.1 (8B)</option>
            <option value="qwen2.5:7b">Qwen 2.5 (7B)</option>
            <option value="gemma2:9b">Gemma 2 (9B)</option>
            <option value="kullm:12.8b">Kullm (12.8B)</option>
            <option value="polyglot-ko:12.8b">Polyglot-Ko (12.8B)</option>
          </select>
        </div>
        <div className="config-row">
          <label htmlFor="processing-mode">처리 모드:</label>
          <select
            id="processing-mode"
            value={config.processingMode}
            onChange={(e) => handleConfigChange({ processingMode: e.target.value as any })}
            aria-label="처리 모드 선택"
          >
            <option value="auto">자동</option>
            <option value="local_only">로컬만</option>
            <option value="cloud_only">클라우드만</option>
            <option value="hybrid">하이브리드</option>
          </select>
        </div>
        <div className="config-row">
          <label htmlFor="temperature-slider">온도: {config.temperature}</label>
          <input
            id="temperature-slider"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => handleConfigChange({ temperature: Number.parseFloat(e.target.value) })}
            aria-label={`온도 설정: ${config.temperature}`}
            aria-valuemin={0}
            aria-valuemax={2}
            aria-valuenow={config.temperature}
          />
        </div>
        <div className="config-row">
          <label htmlFor="streaming-mode">
            <input
              id="streaming-mode"
              type="checkbox"
              checked={useStreaming}
              onChange={(e) => setUseStreaming(e.target.checked)}
              aria-label="스트리밍 모드 사용"
            />
            스트리밍 모드
          </label>
        </div>
        <div className="config-row">
          <button
            type="button"
            className="template-button"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? '템플릿 숨기기' : '프롬프트 템플릿'}
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`writing-style-button ${selectedWritingStyle ? 'active' : ''}`}
            onClick={() => setShowWritingStyleSelector(!showWritingStyleSelector)}
          >
            {selectedWritingStyle
              ? `✍️ ${writingStyleService.getStyle(selectedWritingStyle)?.name || '스타일 선택됨'}`
              : '✍️ 글쓰기 스타일 선택 (44종)'
            }
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`tone-selector-button ${selectedTone || selectedAgeGroup ? 'active' : ''}`}
            onClick={() => setShowToneSelector(!showToneSelector)}
          >
            {selectedTone || selectedAgeGroup
              ? `🎭 ${toneService.getToneTypeName(selectedTone)}${selectedAgeGroup ? ` (${toneService.getAgeGroupName(selectedAgeGroup)})` : ''}`
              : '🎭 어투/말투 선택'
            }
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`domain-selector-button ${selectedDomains.length > 0 ? 'active' : ''}`}
            onClick={() => setShowDomainSelector(!showDomainSelector)}
          >
            {selectedDomains.length > 0
              ? `📚 도메인 선택됨 (${selectedDomains.length}개)`
              : '📚 도메인 지식 선택'
            }
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`mindmap-button ${showMindMap ? 'active' : ''}`}
            onClick={() => setShowMindMap(!showMindMap)}
          >
            {showMindMap ? '🗺️ 마인드맵 숨기기' : '🗺️ 지식 마인드맵 보기'}
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`real-estate-data-button ${showRealEstateData ? 'active' : ''}`}
            onClick={() => setShowRealEstateData(!showRealEstateData)}
          >
            {showRealEstateData ? '🏢 부동산 데이터 숨기기' : '🏢 실거래/등기 정보'}
          </button>
        </div>
      </div>

      {/* 프롬프트 템플릿 패널 */}
      {showTemplates && (
        <div className="notebook-llm-templates">
          <h4>프롬프트 템플릿</h4>
          <div className="templates-list">
            {promptTemplateService.getTemplates(undefined, projectId).map((template) => {
              const handleTemplateSelect = () => {
                const variables = promptTemplateService.extractVariables(template.template);
                if (variables.length === 0) {
                  setPrompt(template.template);
                  setShowTemplates(false);
                } else {
                  // 변수가 있는 경우 사용자 입력 요청
                  const filled = promptTemplateService.useTemplate(template.id, {});
                  setPrompt(filled);
                  setShowTemplates(false);
                }
              };

              return (
                <button
                  key={template.id}
                  type="button"
                  className="template-item"
                  onClick={handleTemplateSelect}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTemplateSelect();
                    }
                  }}
                  aria-label={`템플릿 선택: ${template.name}`}
                >
                  <div className="template-name">{template.name}</div>
                  <div className="template-description">{template.description}</div>
                  <div className="template-tags">
                    {template.tags.map(tag => (
                      <span key={tag} className="template-tag">{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 글쓰기 스타일 선택 패널 */}
      {showWritingStyleSelector && (
        <div className="notebook-llm-writing-style">
          <WritingStyleSelector
            selectedStyleId={selectedWritingStyle || undefined}
            onStyleSelect={(styleId) => {
              setSelectedWritingStyle(styleId);
              setShowWritingStyleSelector(false);
            }}
          />
          {selectedWritingStyle && (
            <div className="writing-style-inputs">
              <div className="input-group">
                <label htmlFor="writing-topic">주제:</label>
                <input
                  id="writing-topic"
                  type="text"
                  className="writing-input"
                  value={writingTopic}
                  onChange={(e) => setWritingTopic(e.target.value)}
                  placeholder="작성할 주제를 입력하세요"
                />
              </div>
              <div className="input-group">
                <label htmlFor="writing-length">길이:</label>
                <select
                  id="writing-length"
                  className="writing-select"
                  value={writingLength}
                  onChange={(e) => setWritingLength(e.target.value)}
                >
                  <option value="짧음">짧음 (200-500자)</option>
                  <option value="중간">중간 (500-1500자)</option>
                  <option value="길음">길음 (1500-3000자)</option>
                  <option value="매우길음">매우 길음 (3000자 이상)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 도메인 지식 선택 패널 */}
      {showDomainSelector && (
        <div className="notebook-llm-domain-selector">
          <h4>도메인 지식 선택</h4>
          <p className="domain-selector-description">
            전문 지식을 적용할 도메인을 선택하세요. 여러 개 선택 가능합니다.
          </p>
          <div className="domain-grid">
            {domainKnowledgeService.getAllDomainKnowledge().map((domain) => (
              <label
                key={domain.domain}
                htmlFor={`domain-${domain.domain}`}
                className={`domain-checkbox ${selectedDomains.includes(domain.domain) ? 'checked' : ''}`}
              >
                <input
                  id={`domain-${domain.domain}`}
                  type="checkbox"
                  checked={selectedDomains.includes(domain.domain)}
                  onChange={() => {
                    if (selectedDomains.includes(domain.domain)) {
                      setSelectedDomains(selectedDomains.filter(d => d !== domain.domain));
                    } else {
                      setSelectedDomains([...selectedDomains, domain.domain]);
                    }
                  }}
                />
                <div className="domain-info">
                  <div className="domain-name">{domain.name}</div>
                  <div className="domain-description">{domain.description}</div>
                  <div className="domain-keywords">
                    {domain.keywords.slice(0, 3).map(keyword => (
                      <span key={keyword} className="domain-keyword-tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="domain-selector-actions">
            <button
              type="button"
              onClick={() => {
                if (projectId) {
                  try {
                    localStorage.setItem(`domainConfig_${projectId}`, JSON.stringify(selectedDomains));
                  } catch (error) {
                    errorLogger.error('도메인 설정 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                      component: 'NotebookLLM',
                      action: 'saveDomainConfig',
                      projectId,
                    });
                  }
                }
                setShowDomainSelector(false);
              }}
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => setShowDomainSelector(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 마인드맵 패널 */}
      {showMindMap && mindMapData && (
        <div className="notebook-llm-mindmap">
          <div className="mindmap-header">
            <h4>지식 마인드맵</h4>
            <p className="mindmap-description">
              선택한 도메인의 지식 구조를 시각화합니다. 노드를 클릭하면 상세 정보를 확인할 수 있습니다.
            </p>
          </div>
          <MindMap
            data={mindMapData}
            onNodeClick={(node) => {
              setSelectedMindMapNode(node.id);
            }}
            onNodeSelect={setSelectedMindMapNode}
            width={800}
            height={500}
            interactive={true}
          />
        </div>
      )}

      {/* 실거래/등기 정보 패널 */}
      {showRealEstateData && (
        <div className="notebook-llm-real-estate-data">
          <RealEstateDataPanel
            projectId={projectId}
            onDataSelect={(data) => {
              setSelectedRealEstateData(data);
              setShowRealEstateData(false);
            }}
          />
        </div>
      )}

      {/* 어투/말투 선택 패널 */}
      {showToneSelector && (
        <div className="notebook-llm-tone-selector">
          <h4>어투/말투 선택</h4>

          {/* 어투 타입 선택 */}
          <fieldset className="tone-type-section" style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className="section-label">어투 타입:</legend>
            <div className="tone-type-grid">
              {toneService.getAllToneTypes().map((toneType) => (
                <button
                  key={toneType}
                  type="button"
                  className={`tone-type-button ${selectedTone === toneType ? 'active' : ''}`}
                  onClick={() => setSelectedTone(toneType)}
                >
                  {toneService.getToneTypeName(toneType)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 연령대 선택 */}
          <fieldset className="age-group-section" style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className="section-label">연령대 (선택사항):</legend>
            <div className="age-group-grid">
              <button
                type="button"
                className={`age-group-button ${selectedAgeGroup === null ? 'active' : ''}`}
                onClick={() => setSelectedAgeGroup(null)}
              >
                연령대 무관
              </button>
              {toneService.getAllAgeGroups().map((ageGroup) => (
                <button
                  key={ageGroup}
                  type="button"
                  className={`age-group-button ${selectedAgeGroup === ageGroup ? 'active' : ''}`}
                  onClick={() => setSelectedAgeGroup(ageGroup)}
                >
                  {toneService.getAgeGroupName(ageGroup)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 선택된 어투 미리보기 */}
          {selectedTone && (
            <div className="tone-preview">
              <h5>선택된 어투 특성:</h5>
              {(() => {
                const profile = toneService.getToneProfile(selectedTone, selectedAgeGroup || undefined);
                return (
                  <div className="tone-preview-content">
                    <div className="tone-characteristics">
                      <strong>특징:</strong>
                      <ul>
                        {profile.characteristics.map((char, idx) => (
                          <li key={`char-${char}-${idx}`}>{char}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="tone-examples">
                      <strong>표현 예시:</strong>
                      <ul>
                        {profile.examplePhrases.slice(0, 3).map((phrase, idx) => (
                          <li key={`phrase-${phrase}-${idx}`}>{phrase}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="tone-formality">
                      <strong>격식 수준:</strong> {toneService.getFormalityName(profile.formality)}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* 입력 영역 */}
      <div className="notebook-llm-input-area">
        <textarea
          className="notebook-llm-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="프롬프트를 입력하세요... (Cmd/Ctrl + Enter로 실행)"
          rows={4}
        />
        <button
          className="notebook-llm-generate-btn"
          onClick={handleGenerate}
          disabled={isLoading || (!prompt.trim() && !(selectedWritingStyle && writingTopic.trim())) || !status?.available}
        >
          {isLoading ? '생성 중...' : '생성'}
        </button>
      </div>

      {/* 로딩 상태 */}
      {isLoading && !isStreaming && (
        <div className="notebook-llm-loading">
          <ProgressIndicator
            progress={50}
            label="응답 생성 중..."
            size="medium"
            showDetails={false}
          />
        </div>
      )}

      {/* 스트리밍 상태 */}
      {isStreaming && (
        <div className="notebook-llm-streaming">
          <div className="streaming-indicator">
            <span className="streaming-dot"></span>
            <span>스트리밍 중...</span>
          </div>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <ErrorRecovery
          error={error}
          onRetry={handleGenerate}
          autoRetry={false}
        />
      )}

      {/* 응답 표시 */}
      {(response || streamingContent) && (
        <div className="notebook-llm-response">
          <div className="response-header">
            <span className="response-model">
              모델: {response?.modelUsed || '스트리밍'}
            </span>
            {response && (
              <>
                <span className="response-time">
                  처리 시간: {(response.processingTime / 1000).toFixed(2)}초
                </span>
                <span className="response-confidence">
                  신뢰도: {(response.confidence * 100).toFixed(1)}%
                </span>
                <span className="response-tokens">
                  토큰: {response.tokensUsed}
                </span>
              </>
            )}
          </div>
          <div className="response-content">
            {isStreaming ? streamingContent : response?.content}
            {isStreaming && <span className="streaming-cursor">▊</span>}
          </div>
          <div ref={responseEndRef} />
          {response?.metadata && Object.keys(response.metadata).length > 0 && (
            <details className="response-metadata">
              <summary>메타데이터</summary>
              <pre>{JSON.stringify(response.metadata, null, 2)}</pre>
            </details>
          )}
        </div>
      )}

      {/* 성능 메트릭 */}
      {status?.performanceMetrics && (
        <div className="notebook-llm-metrics">
          <h4>성능 메트릭</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">총 요청:</span>
              <span className="metric-value">{status.performanceMetrics.totalRequests}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">로컬 요청:</span>
              <span className="metric-value">{status.performanceMetrics.localRequests}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">클라우드 요청:</span>
              <span className="metric-value">{status.performanceMetrics.cloudRequests}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">평균 응답 시간:</span>
              <span className="metric-value">
                {(status.performanceMetrics.averageResponseTime * 1000).toFixed(0)}ms
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">성공률:</span>
              <span className="metric-value">
                {(status.performanceMetrics.successRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 성능 최적화: React.memo로 props가 변경되지 않으면 리렌더링 방지
export default React.memo(NotebookLLM, (prevProps, nextProps) => {
  // projectId와 initialPrompt만 비교하여 불필요한 리렌더링 방지
  return (
    prevProps.projectId === nextProps.projectId &&
    prevProps.initialPrompt === nextProps.initialPrompt
  );
});

