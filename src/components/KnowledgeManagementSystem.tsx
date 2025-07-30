import React, { useState, useEffect } from 'react';
import knowledgeService from '../services/knowledgeService';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  knowledge_type: string;
  category: string;
  priority: string;
  confidence: number;
  usage_count: number;
  expert_verified: boolean;
  similarity?: number;
}

interface KnowledgeStatistics {
  total_knowledge?: number;
  type_counts?: Record<string, number>;
  category_counts?: Record<string, number>;
  priority_counts?: Record<string, number>;
  average_usage?: number;
  average_confidence?: number;
  verified_count?: number;
  verification_rate?: number;
}

const KnowledgeManagementSystem: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeItem[]>([]);
  const [selectedKnowledgeType, setSelectedKnowledgeType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [statistics, setStatistics] = useState<KnowledgeStatistics | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<KnowledgeItem[]>([]);
  const [expertName, setExpertName] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationComments, setVerificationComments] = useState('');



  // 지식 타입 옵션
  const knowledgeTypes = [
    { value: 'fact', label: '사실 정보' },
    { value: 'procedure', label: '절차 정보' },
    { value: 'policy', label: '정책 정보' },
    { value: 'case', label: '사례 정보' },
    { value: 'guideline', label: '가이드라인' },
    { value: 'faq', label: '자주 묻는 질문' }
  ];

  // 카테고리 옵션
  const categories = [
    { value: 'labor_law', label: '노동법' },
    { value: 'safety_guidelines', label: '안전 가이드라인' },
    { value: 'welfare_info', label: '복지 정보' },
    { value: 'negotiation_materials', label: '협의 자료' },
    { value: 'training_materials', label: '교육 자료' },
    { value: 'union_policy', label: '조합 정책' }
  ];

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // 임시로 샘플 통계 데이터 반환
      const stats: KnowledgeStatistics = {
        total_knowledge: 150,
        type_counts: { fact: 50, procedure: 30, policy: 25, case: 20, guideline: 15, faq: 10 },
        category_counts: { labor_law: 40, safety_guidelines: 35, welfare_info: 25, negotiation_materials: 20, training_materials: 15, union_policy: 15 },
        priority_counts: { high: 60, medium: 70, low: 20 },
        average_usage: 12.5,
        average_confidence: 85.2,
        verified_count: 120,
        verification_rate: 80.0
      };
      setStatistics(stats);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const extractKnowledgeFromDocuments = async () => {
    try {
      setIsExtracting(true);
      // 임시로 성공 응답 시뮬레이션
      console.log('지식 추출 완료');
      loadStatistics();
    } catch (error) {
      console.error('지식 추출 실패:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const searchKnowledge = async () => {
    if (!searchQuery.trim()) return;

    try {
      // 임시로 샘플 검색 결과 반환
      const convertedResults: KnowledgeItem[] = [
        {
          id: '1',
          title: '노동법 관련 지식',
          content: '노동법에 따른 근로자의 권리와 의무',
          knowledge_type: 'fact',
          category: 'labor_law',
          priority: 'high',
          confidence: 95,
          usage_count: 15,
          expert_verified: true
        }
      ];
      setSearchResults(convertedResults);
    } catch (error) {
      console.error('지식 검색 실패:', error);
    }
  };

  const loadKnowledgeByType = async (knowledgeType: string) => {
    try {
      // 임시로 샘플 데이터 반환
      const convertedItems: KnowledgeItem[] = [
        {
          id: '1',
          title: `${knowledgeType} 관련 지식`,
          content: `${knowledgeType}에 대한 상세 정보`,
          knowledge_type: knowledgeType,
          category: 'general',
          priority: 'medium',
          confidence: 85,
          usage_count: 10,
          expert_verified: true
        }
      ];
      setKnowledgeItems(convertedItems);
    } catch (error) {
      console.error('타입별 지식 로드 실패:', error);
    }
  };

  const loadKnowledgeByCategory = async (category: string) => {
    try {
      // 임시로 샘플 데이터 반환
      const convertedItems: KnowledgeItem[] = [
        {
          id: '1',
          title: `${category} 관련 지식`,
          content: `${category}에 대한 상세 정보`,
          knowledge_type: 'general',
          category: category,
          priority: 'medium',
          confidence: 85,
          usage_count: 10,
          expert_verified: true
        }
      ];
      setKnowledgeItems(convertedItems);
    } catch (error) {
      console.error('카테고리별 지식 로드 실패:', error);
    }
  };

  const loadRelatedKnowledge = async (knowledgeId: string) => {
    try {
      // 임시로 샘플 데이터 반환
      const convertedItems: KnowledgeItem[] = [
        {
          id: 'related_1',
          title: '관련 지식 1',
          content: '관련 지식에 대한 상세 정보',
          knowledge_type: 'general',
          category: 'general',
          priority: 'medium',
          confidence: 85,
          usage_count: 5,
          expert_verified: true
        }
      ];
      setRelatedItems(convertedItems);
    } catch (error) {
      console.error('관련 지식 로드 실패:', error);
    }
  };

  const updateKnowledgeUsage = async (knowledgeId: string) => {
    try {
      // 임시로 성공 로그만 출력
      console.log('지식 사용 기록 업데이트됨');
    } catch (error) {
      console.error('지식 사용 기록 업데이트 실패:', error);
    }
  };

  const addExpertVerification = async (knowledgeId: string) => {
    if (!expertName || !verificationStatus) {
      alert('전문가 이름과 검증 상태를 입력해주세요.');
      return;
    }

    try {
      // 임시로 성공 로그만 출력
      console.log('전문가 검증 추가됨');
      setExpertName('');
      setVerificationStatus('');
      setVerificationComments('');
      loadStatistics();
    } catch (error) {
      console.error('전문가 검증 추가 실패:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fact': return 'border-l-4 border-blue-500 bg-blue-50';
      case 'procedure': return 'border-l-4 border-green-500 bg-green-50';
      case 'policy': return 'border-l-4 border-purple-500 bg-purple-50';
      case 'case': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'guideline': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'faq': return 'border-l-4 border-indigo-500 bg-indigo-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">17</span>
        🧠 고도화된 지식 관리 시스템
      </h2>

      {/* 지식 추출 섹션 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">📚 지식 추출</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">
            업로드된 문서들에서 자동으로 지식을 추출하여 지식 베이스를 구축합니다.
          </p>
          <button
            onClick={extractKnowledgeFromDocuments}
            disabled={isExtracting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isExtracting ? '추출 중...' : '문서에서 지식 추출'}
          </button>
        </div>
      </div>

      {/* 검색 섹션 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">🔍 지식 검색</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색할 지식을 입력하세요..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={searchKnowledge}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            검색
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">검색 결과 ({searchResults.length}개)</h4>
            {searchResults.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg ${getTypeColor(item.knowledge_type)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">{item.title}</h5>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="text-xs text-gray-500">유사도: {(item.similarity! * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.content}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    신뢰도: {(item.confidence * 100).toFixed(1)}% | 사용: {item.usage_count}회
                  </div>
                  <button
                    onClick={() => updateKnowledgeUsage(item.id)}
                    className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                  >
                    사용 기록
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 필터링 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">📋 타입별 지식</h3>
          <select
            value={selectedKnowledgeType}
            onChange={(e) => {
              setSelectedKnowledgeType(e.target.value);
              if (e.target.value) {
                loadKnowledgeByType(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            aria-label="지식 타입 선택"
          >
            <option value="">타입 선택</option>
            {knowledgeTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">📁 카테고리별 지식</h3>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              if (e.target.value) {
                loadKnowledgeByCategory(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            aria-label="카테고리 선택"
          >
            <option value="">카테고리 선택</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 지식 목록 */}
      {knowledgeItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">📖 지식 목록 ({knowledgeItems.length}개)</h3>
          <div className="space-y-3">
            {knowledgeItems.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg ${getTypeColor(item.knowledge_type)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">{item.title}</h5>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    {item.expert_verified && (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        전문가 검증
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.content}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    신뢰도: {(item.confidence * 100).toFixed(1)}% | 사용: {item.usage_count}회
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        loadRelatedKnowledge(item.id);
                      }}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      관련 지식
                    </button>
                    <button
                      onClick={() => updateKnowledgeUsage(item.id)}
                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                    >
                      사용 기록
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 관련 지식 */}
      {relatedItems.length > 0 && selectedItem && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            🔗 관련 지식 - {selectedItem.title}
          </h3>
          <div className="space-y-2">
            {relatedItems.map((item) => (
              <div key={item.id} className={`p-3 rounded-lg ${getTypeColor(item.knowledge_type)}`}>
                <div className="flex justify-between items-start mb-1">
                  <h6 className="font-medium text-gray-800">{item.title}</h6>
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전문가 검증 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">✅ 전문가 검증</h3>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={expertName}
              onChange={(e) => setExpertName(e.target.value)}
              placeholder="전문가 이름"
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              aria-label="검증 상태 선택"
            >
              <option value="">검증 상태 선택</option>
              <option value="verified">검증됨</option>
              <option value="pending">검토 중</option>
              <option value="rejected">거부됨</option>
            </select>
            <button
              onClick={() => selectedItem && addExpertVerification(selectedItem.id)}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
            >
              검증 추가
            </button>
          </div>
          <textarea
            value={verificationComments}
            onChange={(e) => setVerificationComments(e.target.value)}
            placeholder="검증 코멘트..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>
      </div>

      {/* 통계 */}
      {statistics && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">📊 지식 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{statistics.total_knowledge}</div>
              <div className="text-sm text-blue-800">총 지식</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{statistics.verified_count}</div>
              <div className="text-sm text-green-800">검증된 지식</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{statistics.average_usage?.toFixed(1)}</div>
              <div className="text-sm text-yellow-800">평균 사용</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{statistics.verification_rate}%</div>
              <div className="text-sm text-purple-800">검증률</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeManagementSystem; 