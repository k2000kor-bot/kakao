import React, { useState } from 'react';

interface CompanyRelationship {
  parent: string;
  subsidiary: string;
  region: string;
  relationship: string;
}

interface RegionalBias {
  region: string;
  companies: string[];
  bias_type: string;
  score: number;
}

interface IndirectCriticism {
  target: string;
  criticized: string;
  actual_target: string;
  bias_towards: string;
  type: string;
  confidence: number;
}

interface CompanyAffiliation {
  subsidiaries: string[];
  regional_focus: string;
  criticism_impact: string;
  bias_transfer: boolean;
}

interface CompanyRelationshipAnalysis {
  analysis_type: string;
  timestamp: string;
  company_relationships: CompanyRelationship[];
  regional_biases: RegionalBias[];
  indirect_criticisms: IndirectCriticism[];
  bias_patterns: string[];
  company_affiliations: Record<string, CompanyAffiliation>;
  regional_influence: Record<string, number>;
  overall_bias: Record<string, number>;
  key_insights: string[];
}

interface AdvancedCompanyRelationshipAnalysisProps {
  selectedRoomId: string;
}

const AdvancedCompanyRelationshipAnalysis: React.FC<AdvancedCompanyRelationshipAnalysisProps> = ({ selectedRoomId }) => {
  const [analysis, setAnalysis] = useState<CompanyRelationshipAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [testContent, setTestContent] = useState('');

  const runCompanyRelationshipAnalysis = async () => {
    if (!testContent.trim()) {
      alert('분석할 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v7/company-relationship/advanced-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: testContent,
          room_id: selectedRoomId
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.company_relationship_analysis);
      } else {
        alert('분석 실패: ' + data.error);
      }
    } catch (error) {
      console.error('기업 관계 분석 오류:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getBiasColor = (score: number) => {
    if (score > 0.6) return 'text-red-600';
    if (score > 0.3) return 'text-orange-600';
    if (score < -0.3) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="advanced-company-relationship-analysis p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          고급 기업 관계 분석
        </h2>
        <p className="text-gray-600">
          기업 인수/합병 관계, 지역적 편향성, 간접적 비하/우호 표현을 분석합니다.
        </p>
      </div>

      {/* 테스트 입력 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">분석할 내용 입력</h3>
        <textarea
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          placeholder="예: 중흥건설이 쓰레기 같다. 전라도 기업이라 문제가 많다. 삼성물산이 최고다."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
        />
        <button
          onClick={runCompanyRelationshipAnalysis}
          disabled={loading}
          className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '분석 중...' : '기업 관계 분석 실행'}
        </button>
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 border-b border-gray-200">
            {[
              { id: 'overview', label: '개요', icon: '📊' },
              { id: 'relationships', label: '기업 관계', icon: '🏢' },
              { id: 'regional', label: '지역 편향', icon: '🗺️' },
              { id: 'criticism', label: '간접 비하', icon: '⚠️' },
              { id: 'patterns', label: '편향 패턴', icon: '🔍' },
              { id: 'insights', label: '핵심 인사이트', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="min-h-96">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">기업 관계</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {analysis.company_relationships.length}
                  </p>
                  <p className="text-sm text-blue-600">감지된 관계</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800">지역 편향</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {analysis.regional_biases.length}
                  </p>
                  <p className="text-sm text-orange-600">지역별 편향</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">간접 비하</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {analysis.indirect_criticisms.length}
                  </p>
                  <p className="text-sm text-red-600">감지된 비하</p>
                </div>
              </div>
            )}

            {activeTab === 'relationships' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">기업 관계 분석</h3>
                {analysis.company_relationships.map((rel, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{rel.parent} → {rel.subsidiary}</p>
                        <p className="text-sm text-gray-600">
                          지역: {rel.region} | 관계: {rel.relationship}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'regional' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">지역적 편향성 분석</h3>
                {analysis.regional_biases.map((bias, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{bias.region}</p>
                        <p className="text-sm text-gray-600">
                          기업: {bias.companies.join(', ')}
                        </p>
                        <p className={`text-sm font-semibold ${getBiasColor(bias.score)}`}>
                          편향 유형: {bias.bias_type} (점수: {bias.score.toFixed(2)})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'criticism' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">간접적 비하/우호 표현 분석</h3>
                {analysis.indirect_criticisms.map((crit, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">대상: {crit.target}</p>
                        <p className={`text-sm font-semibold ${getConfidenceColor(crit.confidence)}`}>
                          신뢰도: {(crit.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        비하된 기업: {crit.criticized || '없음'}
                      </p>
                      <p className="text-sm text-gray-600">
                        실제 대상: {crit.actual_target}
                      </p>
                      <p className="text-sm text-gray-600">
                        편향 방향: {crit.bias_towards}
                      </p>
                      <p className="text-sm text-gray-600">
                        유형: {crit.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'patterns' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">편향 패턴 분석</h3>
                <div className="space-y-2">
                  {analysis.bias_patterns.map((pattern, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">{pattern}</p>
                    </div>
                  ))}
                </div>
                
                <h4 className="font-semibold mt-6">기업 소속 관계</h4>
                <div className="space-y-3">
                  {Object.entries(analysis.company_affiliations).map(([company, affiliation]) => (
                    <div key={company} className="p-3 border border-gray-200 rounded-lg">
                      <p className="font-semibold">{company}</p>
                      <p className="text-sm text-gray-600">
                        자회사: {affiliation.subsidiaries.join(', ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        지역 집중: {affiliation.regional_focus}
                      </p>
                      <p className="text-sm text-gray-600">
                        비하 영향: {affiliation.criticism_impact}
                      </p>
                      <p className="text-sm text-gray-600">
                        편향 전이: {affiliation.bias_transfer ? '예' : '아니오'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">핵심 인사이트</h3>
                <div className="space-y-3">
                  {analysis.key_insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{insight}</p>
                    </div>
                  ))}
                </div>
                
                <h4 className="font-semibold mt-6">전체 편향성 평가</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysis.overall_bias).map(([company, score]) => (
                    <div key={company} className="p-3 border border-gray-200 rounded-lg">
                      <p className="font-semibold">{company}</p>
                      <p className={`text-lg font-bold ${getBiasColor(score)}`}>
                        {score > 0 ? '+' : ''}{score.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {score > 0.3 ? '우호적' : score < -0.3 ? '비하적' : '중립적'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCompanyRelationshipAnalysis; 