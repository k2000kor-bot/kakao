import React, { useState, useEffect } from 'react';
import {
  StarIcon, 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  BookmarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  TagIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  HeartIcon,
  ScaleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usage: number;
  rating: number;
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  count: number;
}

const MessageTemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<MessageTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  const [customTemplate, setCustomTemplate] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'usage' | 'rating' | 'createdAt'>('usage');

  const categories: TemplateCategory[] = [
    {
      id: 'greeting',
      name: '인사/환영',
      description: '조합원 환영 및 인사 메시지',
      icon: HeartIcon,
      color: 'bg-pink-500',
      count: 12
    },
    {
      id: 'announcement',
      name: '공지사항',
      description: '중요한 공지사항 전달',
      icon: InformationCircleIcon,
      color: 'bg-blue-500',
      count: 18
    },
    {
      id: 'meeting',
      name: '회의/일정',
      description: '회의 안내 및 일정 조율',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-green-500',
      count: 15
    },
    {
      id: 'welfare',
      name: '복지/혜택',
      description: '복지 혜택 안내 및 문의 응답',
      icon: HeartIcon,
      color: 'bg-yellow-500',
      count: 22
    },
    {
      id: 'salary',
      name: '급여/체불',
      description: '급여 관련 문의 및 해결',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      count: 8
    },
    {
      id: 'safety',
      name: '안전/규정',
      description: '안전 규정 및 교육 안내',
      icon: ShieldCheckIcon,
      color: 'bg-purple-500',
      count: 14
    },
    {
      id: 'negotiation',
      name: '협의/대화',
      description: '시공사 협의 및 대화',
      icon: ScaleIcon,
      color: 'bg-indigo-500',
      count: 16
    },
    {
      id: 'encouragement',
      name: '격려/동기',
      description: '조합원 격려 및 동기부여',
      icon: LightBulbIcon,
      color: 'bg-orange-500',
      count: 10
    }
  ];

  // 샘플 템플릿 데이터
  const sampleTemplates: MessageTemplate[] = [
    {
      id: '1',
      title: '조합원 환영 메시지',
      content: '안녕하세요! 조합에 새로 가입하신 조합원님을 환영합니다. 함께 더 나은 근무 환경을 만들어가겠습니다. 궁금한 점이 있으시면 언제든 문의해주세요.',
      category: 'greeting',
      tags: ['환영', '신규', '안내'],
      usage: 45,
      rating: 4.8,
      isFavorite: true,
      isCustom: false,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: '급여 체불 해결 안내',
      content: '급여 체불 문제로 고민이 많으시군요. 조합에서 시공사와 긴급 협의를 진행하고 있습니다. 최대한 빠른 시일 내에 해결하도록 하겠습니다. 조금만 더 기다려주세요.',
      category: 'salary',
      tags: ['급여', '체불', '해결', '협의'],
      usage: 32,
      rating: 4.6,
      isFavorite: false,
      isCustom: false,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: '안전 교육 일정 안내',
      content: '다음 주 안전 교육이 예정되어 있습니다. 모든 조합원의 참석이 필수입니다. 일정: [날짜] [시간] [장소]. 안전은 우리 모두의 책임입니다.',
      category: 'safety',
      tags: ['안전', '교육', '일정', '필수'],
      usage: 28,
      rating: 4.5,
      isFavorite: true,
      isCustom: false,
      createdAt: '2024-01-08'
    },
    {
      id: '4',
      title: '복지 혜택 개선 안내',
      content: '조합원 여러분의 의견을 반영하여 복지 혜택을 개선했습니다. 의료비 지원, 교육비 지원, 문화생활 지원 등이 확대되었습니다. 자세한 내용은 공지사항을 참고해주세요.',
      category: 'welfare',
      tags: ['복지', '개선', '의료', '교육'],
      usage: 38,
      rating: 4.9,
      isFavorite: true,
      isCustom: false,
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      title: '시공사 협의 결과 안내',
      content: '시공사와의 협의가 성공적으로 마무리되었습니다. 요청하신 사항들이 대부분 반영되었으며, 구체적인 내용은 별도 공지드리겠습니다. 협의 과정에 참여해주신 모든 분들께 감사드립니다.',
      category: 'negotiation',
      tags: ['협의', '시공사', '결과', '감사'],
      usage: 25,
      rating: 4.7,
      isFavorite: false,
      isCustom: false,
      createdAt: '2024-01-05'
    }
  ];

  useEffect(() => {
    setTemplates(sampleTemplates);
    setFilteredTemplates(sampleTemplates);
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory, searchQuery, sortBy]);

  const filterTemplates = () => {
    let filtered = templates;

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usage - a.usage;
        case 'rating':
          return b.rating - a.rating;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleTemplateClick = (template: MessageTemplate) => {
    setSelectedTemplate(template);
  };

  const handleFavoriteToggle = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  const handleUseTemplate = (template: MessageTemplate) => {
    // 템플릿 사용 로직
    console.log('템플릿 사용:', template);
    // 사용 횟수 증가
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usage: t.usage + 1, lastUsed: new Date().toISOString() }
        : t
    ));
  };

  const handleAddCustomTemplate = () => {
    if (customTemplate.title && customTemplate.content && customTemplate.category) {
      const newTemplate: MessageTemplate = {
        id: Date.now().toString(),
        title: customTemplate.title,
        content: customTemplate.content,
        category: customTemplate.category,
        tags: customTemplate.tags,
        usage: 0,
        rating: 0,
        isFavorite: false,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      setTemplates(prev => [newTemplate, ...prev]);
      setCustomTemplate({ title: '', content: '', category: '', tags: [] });
      setShowCustomForm(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !customTemplate.tags.includes(currentTag.trim())) {
      setCustomTemplate(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagIndex: number) => {
    setCustomTemplate(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== tagIndex)
    }));
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : DocumentTextIcon;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'bg-gray-500';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-600" />
          메시지 템플릿 라이브러리
        </h2>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>새 템플릿 추가</span>
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="템플릿 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="usage">사용 빈도순</option>
            <option value="rating">평점순</option>
            <option value="createdAt">최신순</option>
          </select>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 ({templates.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
              <span>{category.name} ({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 템플릿 목록 */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleTemplateClick(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(template.category)}`}></div>
                    <h3 className="font-medium text-gray-900">{template.title}</h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(template.id);
                    }}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    <StarIcon className={`w-5 h-5 ${template.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {template.content}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>사용 {template.usage}회</span>
                    <span>평점 {template.rating}</span>
                  </div>
                  {template.isCustom && (
                    <span className="text-blue-600">커스텀</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 선택된 템플릿 상세 */}
        <div className="lg:col-span-1">
          {selectedTemplate ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedTemplate.title}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    사용하기
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">내용</h4>
                  <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedTemplate.content}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">태그</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">사용 횟수</span>
                    <p className="font-medium">{selectedTemplate.usage}회</p>
                  </div>
                  <div>
                    <span className="text-gray-500">평점</span>
                    <p className="font-medium">{selectedTemplate.rating}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">카테고리</span>
                    <p className="font-medium">
                      {categories.find(c => c.id === selectedTemplate.category)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">생성일</span>
                    <p className="font-medium">{selectedTemplate.createdAt}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>템플릿을 선택하면 상세 내용을 볼 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 커스텀 템플릿 추가 폼 */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">새 템플릿 추가</h3>
              <button
                onClick={() => setShowCustomForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 제목</label>
                <input
                  type="text"
                  value={customTemplate.title}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="템플릿 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <select
                  value={customTemplate.category}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">카테고리 선택</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 내용</label>
                <textarea
                  value={customTemplate.content}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                  placeholder="템플릿 내용을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="태그 입력..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customTemplate.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddCustomTemplate}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                템플릿 추가
              </button>
              <button
                onClick={() => setShowCustomForm(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTemplateLibrary; 