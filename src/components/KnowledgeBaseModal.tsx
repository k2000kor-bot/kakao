import React, { useState } from 'react';
import { XMarkIcon, LightBulbIcon, TagIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { KnowledgeBase } from '../types/project';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKnowledge: (knowledge: Omit<KnowledgeBase, 'id' | 'createdAt'>) => void;
}

const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onAddKnowledge
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'concept' | 'process' | 'reference' | 'insight'>('concept');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [confidence, setConfidence] = useState(0.8);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    const knowledge: Omit<KnowledgeBase, 'id' | 'createdAt'> = {
      title: title.trim(),
      content: content.trim(),
      type,
      tags,
      aiGenerated,
      confidence,
      usage: 0,
      lastAccessed: new Date().toISOString()
    };

    onAddKnowledge(knowledge);
    
    // 폼 초기화
    setTitle('');
    setContent('');
    setType('concept');
    setTags([]);
    setAiGenerated(false);
    setConfidence(0.8);
    
    onClose();
  };

  const getTypeDescription = (type: 'concept' | 'process' | 'reference' | 'insight') => {
    switch (type) {
      case 'concept':
        return '개념, 이론, 원칙 등';
      case 'process':
        return '절차, 방법론, 워크플로우 등';
      case 'reference':
        return '참고 자료, 링크, 문서 등';
      case 'insight':
        return '인사이트, 발견, 경험 등';
    }
  };

  const getTypeIcon = (type: 'concept' | 'process' | 'reference' | 'insight') => {
    switch (type) {
      case 'concept':
        return <AcademicCapIcon className="w-5 h-5" />;
      case 'process':
        return <LightBulbIcon className="w-5 h-5" />;
      case 'reference':
        return <TagIcon className="w-5 h-5" />;
      case 'insight':
        return <LightBulbIcon className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <LightBulbIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">새 지식 추가</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="닫기"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
              제목 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="지식 항목의 제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
              내용 *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="지식 항목의 상세 내용을 입력하세요"
            />
          </div>

          {/* 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['concept', 'process', 'reference', 'insight'] as const).map((typeOption) => (
                <div
                  key={typeOption}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    type === typeOption
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setType(typeOption)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {getTypeIcon(typeOption)}
                    <span className="font-medium text-gray-900 capitalize">{typeOption}</span>
                  </div>
                  <p className="text-xs text-gray-600">{getTypeDescription(typeOption)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              태그
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    title="태그 제거"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="새 태그 입력"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>

          {/* AI 생성 여부 */}
          <div className="flex items-center space-x-3">
            <input
              id="aiGenerated"
              type="checkbox"
              checked={aiGenerated}
              onChange={(e) => setAiGenerated(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="aiGenerated" className="text-sm font-medium text-gray-900">
              AI 생성 지식
            </label>
          </div>

          {/* 신뢰도 */}
          {aiGenerated && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                신뢰도: {Math.round(confidence * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* 미리보기 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">미리보기</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500">제목:</span>
                <span className="text-sm text-gray-900">{title || '제목 미입력'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500">유형:</span>
                <span className="text-sm text-gray-900 capitalize">{type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500">태그:</span>
                <span className="text-sm text-gray-900">
                  {tags.length > 0 ? tags.join(', ') : '태그 없음'}
                </span>
              </div>
              {aiGenerated && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500">신뢰도:</span>
                  <span className="text-sm text-gray-900">{Math.round(confidence * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            지식 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseModal;
