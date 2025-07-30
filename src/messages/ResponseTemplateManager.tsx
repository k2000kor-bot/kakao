import React, { useState } from 'react';
import {
  StarIcon, 
  DocumentTextIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ResponseTemplate {
  id: string;
  title: string;
  content: string;
  strategy: string;
  category: string;
  tags: string[];
  isDefault: boolean;
}

interface ResponseTemplateManagerProps {
  isActive: boolean;
  onTemplateSelect: (template: ResponseTemplate) => void;
}

const ResponseTemplateManager: React.FC<ResponseTemplateManagerProps> = ({ 
  isActive, 
  onTemplateSelect 
}) => {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([
    {
      id: '1',
      title: '논리적 반박 기본',
      content: '객관적 사실을 바탕으로 상황을 분석해보면, 해당 내용에 대해 명확한 근거를 제시할 수 있습니다.',
      strategy: 'logical_rebuttal',
      category: '반박',
      tags: ['논리', '사실', '분석'],
      isDefault: true
    },
    {
      id: '2',
      title: '감정 완화 기본',
      content: '모든 의견이 소중하다고 생각합니다. 서로의 관점을 이해하고 대화를 통해 해결책을 찾아보시죠.',
      strategy: 'emotional_softening',
      category: '완화',
      tags: ['공감', '이해', '대화'],
      isDefault: true
    },
    {
      id: '3',
      title: '정보 제공 기본',
      content: '정확한 정보를 공유드리면, 상황에 대한 오해를 해소하고 명확한 이해를 도울 수 있습니다.',
      strategy: 'information_provision',
      category: '정보',
      tags: ['정보', '명확', '해소'],
      isDefault: true
    },
    {
      id: '4',
      title: '단결 강조 기본',
      content: '함께 해결해나가는 것이 중요합니다. 분열보다는 단결의 힘으로 어려움을 극복해보시죠.',
      strategy: 'unity_emphasis',
      category: '단결',
      tags: ['단결', '협력', '해결'],
      isDefault: true
    }
  ]);
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ResponseTemplate>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEditTemplate = (template: ResponseTemplate) => {
    setIsEditing(template.id);
    setEditingTemplate(template);
  };

  const handleSaveTemplate = () => {
    if (isEditing) {
      setTemplates(prev => prev.map(t => 
        t.id === isEditing ? { ...t, ...editingTemplate } : t
      ));
    } else {
      const newTemplate: ResponseTemplate = {
        ...editingTemplate as ResponseTemplate,
        id: Date.now().toString(),
        isDefault: false
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
    setIsEditing(null);
    setEditingTemplate({});
    setShowAddForm(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditingTemplate({});
    setShowAddForm(false);
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'logical_rebuttal': return 'bg-blue-100 text-blue-800';
      case 'emotional_softening': return 'bg-green-100 text-green-800';
      case 'information_provision': return 'bg-purple-100 text-purple-800';
      case 'unity_emphasis': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStrategyName = (strategy: string) => {
    switch (strategy) {
      case 'logical_rebuttal': return '논리적 반박';
      case 'emotional_softening': return '감정 완화';
      case 'information_provision': return '정보 제공';
      case 'unity_emphasis': return '단결 강조';
      default: return strategy;
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">대응 메시지 템플릿</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>새 템플릿</span>
        </button>
      </div>

      {/* 새 템플릿 추가 폼 */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">새 템플릿 추가</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input
                type="text"
                value={editingTemplate.title || ''}
                onChange={(e) => setEditingTemplate(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="템플릿 제목을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
              <textarea
                value={editingTemplate.content || ''}
                onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="템플릿 내용을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전략</label>
                <select
                  value={editingTemplate.strategy || ''}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, strategy: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">전략 선택</option>
                  <option value="logical_rebuttal">논리적 반박</option>
                  <option value="emotional_softening">감정 완화</option>
                  <option value="information_provision">정보 제공</option>
                  <option value="unity_emphasis">단결 강조</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <input
                  type="text"
                  value={editingTemplate.category || ''}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="카테고리"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
                <span>저장</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>취소</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 템플릿 목록 */}
      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{template.title}</h3>
                  {template.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      기본
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStrategyColor(template.strategy)}`}>
                    {getStrategyName(template.strategy)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.content}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">카테고리: {template.category}</span>
                  {template.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onTemplateSelect(template)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="템플릿 사용"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                </button>
                {!template.isDefault && (
                  <>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="편집"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 편집 모드 */}
            {isEditing === template.id && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                    <input
                      type="text"
                      value={editingTemplate.title || ''}
                      onChange={(e) => setEditingTemplate(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                    <textarea
                      value={editingTemplate.content || ''}
                      onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveTemplate}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckIcon className="w-3 h-3" />
                      <span>저장</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                      <span>취소</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponseTemplateManager; 