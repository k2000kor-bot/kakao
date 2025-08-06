import React, { useState } from 'react';
import { useNotifications } from '../context/AppContext';

interface GuidelineTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
}

interface GuidelinesEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

const GuidelinesEditor: React.FC<GuidelinesEditorProps> = ({
  value,
  onChange,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<GuidelineTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const { addNotification } = useNotifications();

  // 마케팅 논리 지침 템플릿
  const guidelineTemplates: GuidelineTemplate[] = [
    {
      id: '1',
      name: '비교 논리 지침',
      category: '마케팅',
      description: '경쟁사 비교 시 사용할 논리 전개 방법',
      content: `## 🧭 **비교 논리 지침**

### ✅ **1. 비교 논리의 기본 원칙**

| 항목     | 원칙                                           |
| ------ | -------------------------------------------- |
| **비용** | 고객이 실제 부담해야 할 금액을 중심으로 비교한다. |
| **혜택** | '보이는 조건'보다 '실질 내용'을 기준으로 검증한다.       |
| **책임** | "문제가 생겼을 때 누가 책임지나"를 기준으로 판단한다. |
| **설계** | 외형보다 생활에 직결되는 요소를 우선한다.       |

### ✅ **2. 핵심 메시지 템플릿**

> "A는 [장점]로 홍보하지만, B는 [핵심 혜택]로 [실질적 이익]을 제공합니다."

> "겉으로는 좋은 조건처럼 보이지만, 실제로는 [문제점]이 숨어있습니다."

> "말이 아닌 [구체적 기준]으로 비교하면 [우리 제품]이 이기는 제안입니다."`,
      tags: ['비교', '논리', '마케팅', '설득']
    },
    {
      id: '2',
      name: '프로젝트 진행 지침',
      category: '프로젝트 관리',
      description: '프로젝트 진행을 위한 표준 지침',
      content: `## 📋 **프로젝트 진행 지침**

### ✅ **1. 커뮤니케이션 규칙**

- **일일 보고**: 매일 오전 10시에 진행상황 공유
- **주간 회의**: 매주 금요일 오후 2시 정기 회의
- **이슈 보고**: 문제 발생 시 즉시 팀장에게 보고
- **문서 관리**: 모든 문서는 공유 폴더에 정리하여 보관

### ✅ **2. 작업 방식**

- **우선순위**: 중요도와 긴급도에 따른 작업 순서 결정
- **품질 관리**: 각 단계별 검토 및 승인 절차 준수
- **리스크 관리**: 예상 문제점 사전 식별 및 대응 방안 수립

### ✅ **3. 의사결정 프로세스**

- **소액 결정**: 팀원 개별 판단 (50만원 이하)
- **중간 결정**: 팀장 승인 (500만원 이하)
- **중요 결정**: 팀 전체 승인 (500만원 초과)`,
      tags: ['프로젝트', '관리', '커뮤니케이션', '의사결정']
    },
    {
      id: '3',
      name: '설명회 발표 지침',
      category: '발표',
      description: '설명회 및 발표 시 사용할 표준 지침',
      content: `## 🎤 **설명회 발표 지침**

### ✅ **1. 발표 구조**

#### 📌 **도입부 (2분)**
- 인사말 및 발표자 소개
- 발표 목적 및 개요 설명
- 청중의 관심 유도

#### 📌 **본론 (15분)**
- 핵심 내용 3-5개로 구성
- 각 내용별 구체적 사례 제시
- 시각적 자료 활용

#### 📌 **결론 (3분)**
- 핵심 메시지 재강조
- 다음 단계 안내
- 질문 유도

### ✅ **2. 발표 기법**

- **스토리텔링**: 구체적 사례를 통한 설명
- **비교 분석**: 경쟁사 대비 장점 부각
- **숫자 활용**: 구체적 수치로 신뢰도 향상
- **시각 자료**: 차트, 그래프, 이미지 활용

### ✅ **3. 청중 대응**

- **질문 예상**: 사전에 예상 질문 준비
- **명확한 답변**: 핵심 메시지 중심으로 답변
- **공감 형성**: 청중의 관점에서 설명`,
      tags: ['발표', '설명회', '스토리텔링', '청중 대응']
    },
    {
      id: '4',
      name: '홍보 메시지 지침',
      category: '홍보',
      description: '홍보 및 마케팅 메시지 작성 지침',
      content: `## 📢 **홍보 메시지 지침**

### ✅ **1. 메시지 구성 원칙**

#### 📌 **AIDA 모델**
- **Attention**: 주목을 끄는 제목과 도입
- **Interest**: 관심을 유발하는 내용
- **Desire**: 욕구를 자극하는 혜택 설명
- **Action**: 행동을 유도하는 명확한 CTA

#### 📌 **핵심 메시지**
- **간결성**: 한 문장으로 핵심 전달
- **구체성**: 추상적 표현보다 구체적 수치
- **감정성**: 논리와 감정의 균형

### ✅ **2. 채널별 메시지 전략**

| 채널 | 특성 | 메시지 스타일 |
|------|------|---------------|
| **SNS** | 짧고 임팩트 | 해시태그 활용, 시각적 콘텐츠 |
| **이메일** | 상세한 정보 | 개인화, 구체적 혜택 |
| **웹사이트** | 종합적 정보 | 구조화된 정보, CTA 버튼 |
| **보도자료** | 객관적 사실 | 5W1H, 언론사 관점 |

### ✅ **3. 효과적인 표현 기법**

- **숫자 활용**: "30% 향상", "50% 절약"
- **비교 표현**: "기존 대비", "경쟁사 대비"
- **감정어**: "혁신적인", "파격적인", "최고의"
- **행동 유도**: "지금 바로", "한정 기간"`,
      tags: ['홍보', '마케팅', '메시지', 'AIDA']
    },
    {
      id: '5',
      name: '댓글 작성 지침',
      category: '소통',
      description: '온라인 댓글 및 소통 시 지침',
      content: `## 💬 **댓글 작성 지침**

### ✅ **1. 기본 원칙**

#### 📌 **존중과 배려**
- 상대방의 의견을 존중하는 태도
- 공격적이거나 비하하는 표현 금지
- 건설적인 대화 유도

#### 📌 **사실 기반**
- 확인된 사실만 언급
- 추측이나 루머 근거로 사용 금지
- 출처가 있는 정보 활용

### ✅ **2. 상황별 대응**

| 상황 | 대응 원칙 | 예시 |
|------|-----------|------|
| **긍정적 댓글** | 감사 표현 + 추가 정보 | "감사합니다. 더 자세한 내용은..." |
| **질문 댓글** | 명확한 답변 + 추가 도움 | "질문해주셔서 감사합니다. 답변은..." |
| **부정적 댓글** | 공감 + 해결책 제시 | "불편을 끼쳐 죄송합니다. 개선 방안은..." |
| **오해 댓글** | 정정 + 설명 | "오해가 있으신 것 같습니다. 사실은..." |

### ✅ **3. 효과적인 표현**

- **공감 표현**: "이해합니다", "공감합니다"
- **감사 표현**: "관심 가져주셔서 감사합니다"
- **건설적 제안**: "다음과 같은 방법은 어떨까요?"
- **전문성 표현**: "전문가 관점에서 보면..."`,
      tags: ['댓글', '소통', '온라인', '대응']
    }
  ];

  const handleTemplateSelect = (template: GuidelineTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleTemplateApply = () => {
    if (selectedTemplate) {
      const newContent = value + '\n\n' + selectedTemplate.content;
      onChange(newContent);
      
      addNotification({
        type: 'success',
        title: '템플릿 적용 완료',
        message: `${selectedTemplate.name} 템플릿이 추가되었습니다.`
      });
      
      setSelectedTemplate(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '마케팅': 'bg-blue-100 text-blue-800',
      '프로젝트 관리': 'bg-green-100 text-green-800',
      '발표': 'bg-purple-100 text-purple-800',
      '홍보': 'bg-orange-100 text-orange-800',
      '소통': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">프로젝트 지침 편집기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="지침 편집기 닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* 템플릿 선택 영역 */}
          <div className="w-1/3 border-r border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">지침 템플릿</h3>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                {showTemplates ? '접기' : '펼치기'}
              </button>
            </div>

            {showTemplates && (
              <div className="space-y-3">
                {guidelineTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTemplate && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">선택된 템플릿</h4>
                <p className="text-sm text-blue-800 mb-3">{selectedTemplate.name}</p>
                <button
                  onClick={handleTemplateApply}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  템플릿 적용
                </button>
              </div>
            )}
          </div>

          {/* 편집 영역 */}
          <div className="flex-1 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 지침
              </label>
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[500px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="프로젝트 진행 규칙, 작업 방식, 커뮤니케이션 방법 등을 입력하세요"
              />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">💡 지침 작성 팁</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 명확하고 구체적인 규칙을 작성하세요</li>
                <li>• 단계별로 구분하여 이해하기 쉽게 구성하세요</li>
                <li>• 예시와 함께 설명하면 더 효과적입니다</li>
                <li>• 정기적으로 업데이트하여 최신 상태를 유지하세요</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              취소
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesEditor; 