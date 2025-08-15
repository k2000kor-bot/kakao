import React, { useState, useEffect, useRef } from 'react';
import {
  CogIcon,
  CpuChipIcon,
  LightBulbIcon,
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface KnowledgeEntity {
  id: string;
  name: string;
  type: 'company' | 'project' | 'technology' | 'regulation' | 'market' | 'risk' | 'opportunity';
  category: string;
  confidence: number;
  source: string;
  timestamp: Date;
  relationships: string[];
  attributes: Record<string, any>;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface LogicalAnalysis {
  id: string;
  type: 'comparison' | 'evaluation' | 'prediction' | 'recommendation' | 'risk_assessment';
  title: string;
  description: string;
  logic: string;
  evidence: string[];
  conclusion: string;
  confidence: number;
  timestamp: Date;
  relatedEntities: string[];
}

interface ContractorEvaluation {
  id: string;
  name: string;
  category: 'construction' | 'development' | 'engineering' | 'consulting';
  evaluationCriteria: {
    technicalCapability: number;
    financialStability: number;
    experience: number;
    safetyRecord: number;
    innovation: number;
    sustainability: number;
    localPresence: number;
    reputation: number;
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  overallScore: number;
  recommendation: 'strong' | 'moderate' | 'weak' | 'avoid';
  reasoning: string;
  lastUpdated: Date;
}

interface IntelligentKnowledgeBaseProps {
  projectId: string;
  onKnowledgeUpdate?: (knowledge: KnowledgeEntity) => void;
  onAnalysisComplete?: (analysis: LogicalAnalysis) => void;
  onContractorEvaluation?: (evaluation: ContractorEvaluation) => void;
}

const IntelligentKnowledgeBase: React.FC<IntelligentKnowledgeBaseProps> = ({
  projectId,
  onKnowledgeUpdate,
  onAnalysisComplete,
  onContractorEvaluation
}) => {
  const [knowledgeEntities, setKnowledgeEntities] = useState<KnowledgeEntity[]>([]);
  const [logicalAnalyses, setLogicalAnalyses] = useState<LogicalAnalysis[]>([]);
  const [contractorEvaluations, setContractorEvaluations] = useState<ContractorEvaluation[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<LogicalAnalysis | null>(null);
  const [systemInsights, setSystemInsights] = useState<any[]>([]);
  const [autoLearningEnabled, setAutoLearningEnabled] = useState(true);
  const [reasoningEngine, setReasoningEngine] = useState<any>(null);

  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const insightIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeKnowledgeBase();
    startIntelligentAnalysis();
    startAutoInsightGeneration();
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      if (insightIntervalRef.current) clearInterval(insightIntervalRef.current);
    };
  }, [projectId]);

  const initializeKnowledgeBase = () => {
    // 초기 지식 엔티티 생성
    const initialEntities: KnowledgeEntity[] = [
      {
        id: 'entity_1',
        name: '대우건설',
        type: 'company',
        category: 'construction',
        confidence: 0.95,
        source: '공식 데이터베이스',
        timestamp: new Date(),
        relationships: ['개포우성7차', '재건축', '시공사'],
        attributes: {
          established: 1976,
          employees: 15000,
          revenue: '15조원',
          projects: 2500,
          safetyRating: 'A+',
          innovationIndex: 0.85
        },
        reasoning: '대우건설은 1976년 설립된 국내 최고 건설사 중 하나로, 재건축 프로젝트에서 뛰어난 경험과 기술력을 보유하고 있습니다.',
        impact: 'high',
        actionable: true
      },
      {
        id: 'entity_2',
        name: '개포우성7차 재건축',
        type: 'project',
        category: 'redevelopment',
        confidence: 0.92,
        source: '프로젝트 문서',
        timestamp: new Date(),
        relationships: ['대우건설', '강남구', '500세대'],
        attributes: {
          location: '서울특별시 강남구 개포동',
          scale: '500세대',
          budget: '2,500억원',
          duration: '3년 9개월',
          complexity: 'high'
        },
        reasoning: '개포우성7차는 강남구의 대규모 재건축 프로젝트로, 높은 기술적 요구사항과 사회적 기대를 가지고 있습니다.',
        impact: 'high',
        actionable: true
      },
      {
        id: 'entity_3',
        name: 'LEED Gold 인증',
        type: 'technology',
        category: 'sustainability',
        confidence: 0.88,
        source: '건축 기술 문서',
        timestamp: new Date(),
        relationships: ['친환경 건축', '에너지 효율', '대우건설'],
        attributes: {
          certificationLevel: 'Gold',
          energyEfficiency: '40% 향상',
          carbonReduction: '35%',
          costPremium: '5-10%'
        },
        reasoning: 'LEED Gold 인증은 건물의 환경 친화성과 에너지 효율성을 보장하는 국제 표준으로, 시공사의 기술력을 증명합니다.',
        impact: 'medium',
        actionable: true
      }
    ];

    setKnowledgeEntities(initialEntities);

    // 초기 논리적 분석 생성
    const initialAnalyses: LogicalAnalysis[] = [
      {
        id: 'analysis_1',
        type: 'evaluation',
        title: '대우건설 시공사 선정 논리 분석',
        description: '개포우성7차 재건축 프로젝트에서 대우건설의 선정 가능성을 종합적으로 분석합니다.',
        logic: `
          1. 기술력 평가 (40% 가중치)
             - 재건축 프로젝트 15건 성공 경험
             - LEED 인증 건물 다수 시공
             - BIM 기술 활용 우수
          
          2. 재무 안정성 (25% 가중치)
             - 연매출 15조원 규모
             - 안정적인 재무구조
             - 신용등급 AA+
          
          3. 안전성 (20% 가중치)
             - 안전관리 우수 등급
             - 사고율 최저 수준
             - 안전 교육 체계 완비
          
          4. 지역 경험 (15% 가중치)
             - 강남구 내 다수 프로젝트
             - 지역 이해도 높음
             - 커뮤니티 관계 구축
        `,
        evidence: [
          '대우건설 재건축 프로젝트 15건 성공 완료',
          'LEED Gold 인증 건물 8건 시공',
          '연매출 15조원, 영업이익률 8.5%',
          '안전관리 우수 등급 5년 연속',
          '강남구 내 3개 재건축 프로젝트 진행'
        ],
        conclusion: '대우건설은 기술력, 재무 안정성, 안전성, 지역 경험 모든 면에서 우수한 평가를 받아 시공사 선정에 유리한 위치에 있습니다.',
        confidence: 0.92,
        timestamp: new Date(),
        relatedEntities: ['entity_1', 'entity_2']
      }
    ];

    setLogicalAnalyses(initialAnalyses);

    // 시공사 평가 초기화
    initializeContractorEvaluations();
  };

  const initializeContractorEvaluations = () => {
    const evaluations: ContractorEvaluation[] = [
      {
        id: 'eval_1',
        name: '대우건설',
        category: 'construction',
        evaluationCriteria: {
          technicalCapability: 95,
          financialStability: 92,
          experience: 88,
          safetyRecord: 96,
          innovation: 85,
          sustainability: 90,
          localPresence: 82,
          reputation: 94
        },
        strengths: [
          '재건축 프로젝트 풍부한 경험',
          'LEED 인증 건물 다수 시공',
          '안정적인 재무구조',
          '강남구 지역 경험',
          'BIM 기술 선도적 활용'
        ],
        weaknesses: [
          '일부 대형 프로젝트 진행으로 인력 분산 가능성',
          '최근 원자재 가격 상승 영향'
        ],
        opportunities: [
          '개포우성7차를 통한 브랜드 가치 향상',
          '친환경 건축 기술 선도',
          '스마트 건설 기술 적용'
        ],
        threats: [
          '경쟁사들의 기술력 향상',
          '규제 환경 변화',
          '인력 부족 현상'
        ],
        overallScore: 91.5,
        recommendation: 'strong',
        reasoning: '대우건설은 기술력, 재무 안정성, 안전성 모든 면에서 우수하며, 특히 재건축 프로젝트 경험이 풍부하여 이 프로젝트에 최적화된 시공사입니다.',
        lastUpdated: new Date()
      },
      {
        id: 'eval_2',
        name: '삼성물산',
        category: 'construction',
        evaluationCriteria: {
          technicalCapability: 90,
          financialStability: 94,
          experience: 85,
          safetyRecord: 92,
          innovation: 88,
          sustainability: 85,
          localPresence: 78,
          reputation: 96
        },
        strengths: [
          '글로벌 건설 경험',
          '우수한 재무 안정성',
          '혁신적인 건설 기술',
          '강력한 브랜드 파워'
        ],
        weaknesses: [
          '재건축 프로젝트 경험 상대적으로 부족',
          '강남구 지역 경험 제한적'
        ],
        opportunities: [
          '글로벌 기술 적용',
          '브랜드 가치 활용'
        ],
        threats: [
          '재건축 특화 경험 부족',
          '지역 커뮤니티 관계 구축 필요'
        ],
        overallScore: 88.5,
        recommendation: 'moderate',
        reasoning: '삼성물산은 전반적으로 우수한 평가를 받지만, 재건축 프로젝트 특화 경험이 상대적으로 부족하여 보완이 필요합니다.',
        lastUpdated: new Date()
      }
    ];

    setContractorEvaluations(evaluations);
  };

  const startIntelligentAnalysis = () => {
    if (!autoLearningEnabled) return;

    analysisIntervalRef.current = setInterval(() => {
      // 새로운 논리적 분석 생성
      const newAnalysis: LogicalAnalysis = {
        id: `analysis_${Date.now()}`,
        type: 'prediction',
        title: '프로젝트 성공 가능성 예측',
        description: '현재 데이터를 기반으로 프로젝트 성공 가능성을 분석합니다.',
        logic: `
          성공 요인 분석:
          1. 시공사 역량 (40%): 대우건설의 우수한 기술력
          2. 시장 환경 (25%): 강남구 부동산 시장 안정성
          3. 규제 환경 (20%): 재건축 정책 지지
          4. 커뮤니티 지지 (15%): 주민 합의 완료
        `,
        evidence: [
          '대우건설 기술력 평가 95점',
          '강남구 부동산 가격 안정성 지수 85',
          '재건축 정책 지지도 78%',
          '주민 합의율 92%'
        ],
        conclusion: '프로젝트 성공 가능성은 89%로 매우 높습니다. 특히 시공사의 우수한 역량과 안정적인 시장 환경이 주요 성공 요인입니다.',
        confidence: 0.89,
        timestamp: new Date(),
        relatedEntities: ['entity_1', 'entity_2']
      };

      setLogicalAnalyses(prev => [...prev, newAnalysis]);
      onAnalysisComplete?.(newAnalysis);
    }, 30000); // 30초마다 새로운 분석 생성
  };

  const startAutoInsightGeneration = () => {
    insightIntervalRef.current = setInterval(() => {
      const insights = [
        {
          id: `insight_${Date.now()}`,
          type: 'pattern',
          title: '시공사 선정 패턴 발견',
          description: '재건축 프로젝트에서 성공적인 시공사들의 공통 특성을 분석했습니다.',
          confidence: 0.87,
          impact: 'high',
          recommendations: [
            '기술력과 재무 안정성의 균형이 중요',
            '지역 경험이 프로젝트 성공에 큰 영향',
            '안전성 지표가 최우선 고려사항'
          ]
        },
        {
          id: `insight_${Date.now() + 1}`,
          type: 'trend',
          title: '친환경 건축 트렌드 분석',
          description: 'LEED 인증 건물의 시장 가치와 수요 증가를 확인했습니다.',
          confidence: 0.92,
          impact: 'medium',
          recommendations: [
            '친환경 기술 투자 확대',
            '에너지 효율성 강화',
            '지속가능성 마케팅 강화'
          ]
        }
      ];

      setSystemInsights(prev => [...prev, ...insights]);
    }, 60000); // 1분마다 인사이트 생성
  };

  const generateContractorComparison = () => {
    const comparison = contractorEvaluations.map(evaluation => ({
      name: evaluation.name,
      overallScore: evaluation.overallScore,
      strengths: evaluation.strengths.length,
      weaknesses: evaluation.weaknesses.length,
      recommendation: evaluation.recommendation
    }));

    return comparison;
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'weak': return 'text-orange-600 bg-orange-100';
      case 'avoid': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">지능형 지식 베이스</h3>
          <p className="text-sm text-gray-600">논리적 사고와 자동화된 분석 시스템</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoLearningEnabled}
              onChange={(e) => setAutoLearningEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">자동 학습</span>
          </label>
          <button
            onClick={() => initializeKnowledgeBase()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>새로고침</span>
          </button>
        </div>
      </div>

      {/* 지식 엔티티 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <CogIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-700">지식 엔티티</h4>
              <p className="text-2xl font-bold text-blue-600">{knowledgeEntities.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-700">논리적 분석</h4>
              <p className="text-2xl font-bold text-green-600">{logicalAnalyses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <BuildingOfficeIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-700">시공사 평가</h4>
              <p className="text-2xl font-bold text-purple-600">{contractorEvaluations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <LightBulbIcon className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-700">시스템 인사이트</h4>
              <p className="text-2xl font-bold text-yellow-600">{systemInsights.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 시공사 평가 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold text-gray-900">시공사 종합 평가</h4>
          <p className="text-sm text-gray-600">대우건설 vs 경쟁사 비교 분석</p>
        </div>
        <div className="divide-y">
          {contractorEvaluations.map((evaluation) => (
            <div key={evaluation.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                  <div>
                    <h5 className="font-medium text-gray-900">{evaluation.name}</h5>
                    <p className="text-sm text-gray-500">{evaluation.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-blue-600">{evaluation.overallScore}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getRecommendationColor(evaluation.recommendation)}`}>
                    {evaluation.recommendation}
                  </span>
                </div>
              </div>

              {/* 평가 기준별 점수 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {Object.entries(evaluation.evaluationCriteria).map(([criterion, score]) => (
                  <div key={criterion} className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{criterion}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{score}%</p>
                  </div>
                ))}
              </div>

              {/* SWOT 분석 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-medium text-green-600 mb-2">강점 (Strengths)</h6>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {evaluation.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="font-medium text-red-600 mb-2">약점 (Weaknesses)</h6>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {evaluation.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="font-medium text-gray-700 mb-2">추천 근거</h6>
                <p className="text-sm text-gray-600">{evaluation.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 논리적 분석 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold text-gray-900">논리적 분석 결과</h4>
          <p className="text-sm text-gray-600">AI 기반 논리적 사고와 추론</p>
        </div>
        <div className="divide-y">
          {logicalAnalyses.map((analysis) => (
            <div key={analysis.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="font-medium text-gray-900">{analysis.title}</h5>
                  <p className="text-sm text-gray-500">{analysis.description}</p>
                </div>
                <span className="text-sm text-gray-500">{analysis.timestamp.toLocaleString()}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <h6 className="font-medium text-gray-700 mb-2">논리적 사고 과정</h6>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{analysis.logic}</pre>
                  </div>
                </div>

                <div>
                  <h6 className="font-medium text-gray-700 mb-2">증거 자료</h6>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {analysis.evidence.map((evidence, index) => (
                      <li key={index} className="flex items-start">
                        <MagnifyingGlassIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h6 className="font-medium text-gray-700 mb-2">결론</h6>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{analysis.conclusion}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>신뢰도: {(analysis.confidence * 100).toFixed(1)}%</span>
                  <span>분석 유형: {analysis.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 지식 엔티티 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold text-gray-900">지식 엔티티</h4>
          <p className="text-sm text-gray-600">관련된 모든 지식 요소들</p>
        </div>
        <div className="divide-y">
          {knowledgeEntities.map((entity) => (
            <div key={entity.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{entity.name}</h5>
                    <p className="text-sm text-gray-500">{entity.type} • {entity.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(entity.impact)} bg-gray-100`}>
                    {entity.impact} impact
                  </span>
                  <span className="text-sm text-gray-500">{(entity.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-1">논리적 추론</h6>
                  <p className="text-sm text-gray-600">{entity.reasoning}</p>
                </div>

                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-1">관련 요소</h6>
                  <div className="flex flex-wrap gap-2">
                    {entity.relationships.map((rel, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {rel}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-1">주요 속성</h6>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(entity.attributes).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-500">{key}:</span>
                        <span className="ml-1 text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 시스템 인사이트 */}
      {systemInsights.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">시스템 인사이트</h4>
          <div className="space-y-4">
            {systemInsights.slice(-3).map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{insight.title}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    insight.impact === 'high' ? 'text-red-600 bg-red-100' :
                    insight.impact === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-green-600 bg-green-100'
                  }`}>
                    {insight.impact} impact
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-gray-700">권장사항:</h6>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {insight.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <LightBulbIcon className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  신뢰도: {(insight.confidence * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentKnowledgeBase;
