import React, { useState, useEffect } from 'react';
import {
  StarIcon, 
  PencilIcon,
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
  ScaleIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CogIcon,
  ArrowPathIcon,
  HeartIcon,
  ShieldCheckIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface MessageStyle {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  characteristics: string[];
}

interface MessageTone {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

interface MessageStructure {
  id: string;
  name: string;
  description: string;
  template: string;
}

interface QualityScore {
  clarity: number;
  empathy: number;
  professionalism: number;
  effectiveness: number;
  overall: number;
}

const AdvancedMessageComposer: React.FC = () => {
  const [messageContent, setMessageContent] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('professional');
  const [selectedTone, setSelectedTone] = useState<string>('respectful');
  const [selectedStructure, setSelectedStructure] = useState<string>('problem-solution');
  const [targetAudience, setTargetAudience] = useState<string>('union_members');
  const [context, setContext] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [qualityScore, setQualityScore] = useState<QualityScore>({
    clarity: 0,
    empathy: 0,
    professionalism: 0,
    effectiveness: 0,
    overall: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const messageStyles: MessageStyle[] = [
    {
      id: 'professional',
      name: '전문적',
      description: '공식적이고 전문적인 톤으로 작성',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      characteristics: ['정확성', '객관성', '구체성', '논리성']
    },
    {
      id: 'empathetic',
      name: '공감적',
      description: '조합원의 감정을 이해하고 공감하는 톤',
      icon: HeartIcon,
      color: 'bg-pink-500',
      characteristics: ['이해', '공감', '지지', '따뜻함']
    },
    {
      id: 'collaborative',
      name: '협력적',
      description: '함께 해결책을 찾아가는 협력적인 톤',
      icon: ScaleIcon,
      color: 'bg-green-500',
      characteristics: ['협력', '대화', '합의', '상호이해']
    },
    {
      id: 'inspiring',
      name: '격려적',
      description: '조합원들을 격려하고 동기부여하는 톤',
      icon: LightBulbIcon,
      color: 'bg-yellow-500',
      characteristics: ['격려', '희망', '동기부여', '긍정성']
    },
    {
      id: 'authoritative',
      name: '권위적',
      description: '명확하고 단호한 권위 있는 톤',
      icon: ShieldCheckIcon,
      color: 'bg-purple-500',
      characteristics: ['명확성', '단호함', '신뢰성', '결정력']
    }
  ];

  const messageTones: MessageTone[] = [
    {
      id: 'respectful',
      name: '정중한',
      description: '상대방을 존중하는 정중한 톤',
      examples: ['감사합니다', '부탁드립니다', '검토해보겠습니다']
    },
    {
      id: 'friendly',
      name: '친근한',
      description: '친근하고 편안한 톤',
      examples: ['안녕하세요', '잘 지내시나요', '도움이 되었으면 좋겠습니다']
    },
    {
      id: 'formal',
      name: '공식적인',
      description: '공식적이고 격식 있는 톤',
      examples: ['검토하여 안내드립니다', '협조 부탁드립니다', '참고하시기 바랍니다']
    },
    {
      id: 'encouraging',
      name: '격려하는',
      description: '상대방을 격려하고 지지하는 톤',
      examples: ['함께 해결해보겠습니다', '노력해보시면 좋겠습니다', '응원하겠습니다']
    }
  ];

  const messageStructures: MessageStructure[] = [
    {
      id: 'problem-solution',
      name: '문제-해결',
      description: '문제를 인정하고 해결책을 제시',
      template: '문제 상황 → 인정 → 해결책 → 실행 계획'
    },
    {
      id: 'acknowledge-address',
      name: '인정-대응',
      description: '상대방 의견을 인정하고 대응',
      template: '의견 인정 → 이해 → 대응 방안 → 협력'
    },
    {
      id: 'information-provide',
      name: '정보 제공',
      description: '정확한 정보를 제공하여 오해 해소',
      template: '상황 설명 → 정보 제공 → 명확화 → 안내'
    },
    {
      id: 'collaborative-approach',
      name: '협력적 접근',
      description: '함께 해결책을 찾아가는 방식',
      template: '공통 목표 → 협력 방안 → 제안 → 함께 해결'
    }
  ];

  const targetAudiences = [
    { id: 'union_members', name: '조합원', description: '일반 조합원 대상' },
    { id: 'union_leaders', name: '조합 지도부', description: '조합 지도부 대상' },
    { id: 'contractors', name: '시공사', description: '시공사 관계자 대상' },
    { id: 'management', name: '관리자', description: '관리자 대상' },
    { id: 'general', name: '일반', description: '일반적인 대상' }
  ];

  useEffect(() => {
    if (messageContent.trim()) {
      analyzeMessageQuality();
    }
  }, [messageContent, selectedStyle, selectedTone, selectedStructure]);

  const analyzeMessageQuality = async () => {
    setIsAnalyzing(true);
    
    // 품질 분석 시뮬레이션
    setTimeout(() => {
      const clarity = Math.min(100, Math.max(0, 70 + Math.random() * 30));
      const empathy = Math.min(100, Math.max(0, 60 + Math.random() * 40));
      const professionalism = Math.min(100, Math.max(0, 80 + Math.random() * 20));
      const effectiveness = Math.min(100, Math.max(0, 65 + Math.random() * 35));
      const overall = Math.round((clarity + empathy + professionalism + effectiveness) / 4);

      setQualityScore({
        clarity: Math.round(clarity),
        empathy: Math.round(empathy),
        professionalism: Math.round(professionalism),
        effectiveness: Math.round(effectiveness),
        overall: Math.round(overall)
      });

      // 제안사항 생성
      const newSuggestions = [];
      if (clarity < 80) newSuggestions.push('메시지를 더 명확하게 작성해보세요');
      if (empathy < 75) newSuggestions.push('공감을 더 표현해보세요');
      if (professionalism < 85) newSuggestions.push('더 전문적인 표현을 사용해보세요');
      if (effectiveness < 80) newSuggestions.push('구체적인 해결책을 제시해보세요');
      
      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords(prev => [...prev, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(prev => prev.filter((_, i) => i !== index));
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
    return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <PencilIcon className="w-6 h-6 mr-2 text-blue-600" />
          고급 메시지 작성기
        </h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          <span>{showPreview ? '미리보기 숨기기' : '미리보기 보기'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 작성 패널 */}
        <div className="space-y-6">
          {/* 메시지 스타일 선택 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">메시지 스타일</h3>
            <div className="grid grid-cols-2 gap-3">
              {messageStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedStyle === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${style.color}`}></div>
                    <span className="font-medium">{style.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 톤 선택 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">메시지 톤</h3>
            <div className="grid grid-cols-2 gap-3">
              {messageTones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTone === tone.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{tone.name}</div>
                  <p className="text-xs text-gray-600 mt-1">{tone.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 구조 선택 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">메시지 구조</h3>
            <div className="space-y-2">
              {messageStructures.map((structure) => (
                <button
                  key={structure.id}
                  onClick={() => setSelectedStructure(structure.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedStructure === structure.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{structure.name}</div>
                  <p className="text-sm text-gray-600 mt-1">{structure.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{structure.template}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 대상 선택 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">대상</h3>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {targetAudiences.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.name} - {audience.description}
                </option>
              ))}
            </select>
          </div>

          {/* 키워드 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">중요 키워드</h3>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                placeholder="키워드 입력..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => handleRemoveKeyword(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 컨텍스트 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">상황/컨텍스트</h3>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="메시지를 작성하는 상황이나 배경을 설명해주세요..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* 메시지 내용 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">메시지 내용</h3>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="메시지를 작성해주세요..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={8}
            />
          </div>
        </div>

        {/* 미리보기 및 분석 패널 */}
        <div className="space-y-6">
          {/* 품질 분석 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="w-5 h-5 mr-2 text-purple-600" />
              메시지 품질 분석
              {isAnalyzing && <ArrowPathIcon className="w-4 h-4 ml-2 animate-spin text-blue-600" />}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">명확성</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${qualityScore.clarity}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${getQualityColor(qualityScore.clarity)}`}>
                    {qualityScore.clarity}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">공감성</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${qualityScore.empathy}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${getQualityColor(qualityScore.empathy)}`}>
                    {qualityScore.empathy}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">전문성</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${qualityScore.professionalism}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${getQualityColor(qualityScore.professionalism)}`}>
                    {qualityScore.professionalism}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">효과성</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${qualityScore.effectiveness}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${getQualityColor(qualityScore.effectiveness)}`}>
                    {qualityScore.effectiveness}%
                  </span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">전체 점수</span>
                  <div className="flex items-center space-x-2">
                    {getQualityIcon(qualityScore.overall)}
                    <span className={`text-lg font-bold ${getQualityColor(qualityScore.overall)}`}>
                      {qualityScore.overall}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 제안사항 */}
          {suggestions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <LightBulbIcon className="w-5 h-5 mr-2 text-blue-600" />
                개선 제안
              </h3>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <StarIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 미리보기 */}
          {showPreview && messageContent && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <EyeIcon className="w-5 h-5 mr-2 text-gray-600" />
                메시지 미리보기
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">조합장</div>
                    <div className="text-xs text-gray-500">방금 전</div>
                  </div>
                </div>
                <div className="text-gray-700 whitespace-pre-wrap text-left">
                  {messageContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-6 flex space-x-3">
        <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <StarIcon className="w-5 h-5" />
          <span>AI 개선 제안</span>
        </button>
        <button className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          <CheckCircleIcon className="w-5 h-5" />
          <span>메시지 완성</span>
        </button>
        <button className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
          <CogIcon className="w-5 h-5" />
          <span>템플릿 저장</span>
        </button>
      </div>
    </div>
  );
};

export default AdvancedMessageComposer; 