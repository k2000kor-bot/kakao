import React, { useState } from 'react';

interface WritingTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    template: {
        topic: string;
        purpose: string;
        content: string;
        style: string;
        tone: string;
        length: string;
        format: string;
        requirements: string;
    };
    tags: string[];
}

interface WritingTemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: WritingTemplate) => void;
}

const WritingTemplatesModal: React.FC<WritingTemplatesModalProps> = ({
    isOpen,
    onClose,
    onSelectTemplate
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const writingTemplates: WritingTemplate[] = [
        {
            id: 'business-proposal',
            name: '비즈니스 제안서',
            description: '신제품, 서비스, 프로젝트에 대한 비즈니스 제안서',
            category: 'business',
            template: {
                topic: '비즈니스 제안서',
                purpose: '신제품/서비스 도입을 위한 경영진 설득',
                content: '시장 분석, 제품/서비스 특징, 수익성 분석, 실행 계획, 예상 효과',
                style: 'formal',
                tone: 'professional',
                length: 'long',
                format: 'structured',
                requirements: '데이터 기반의 객관적 분석, 명확한 ROI 제시'
            },
            tags: ['제안서', '비즈니스', '경영진', '설득']
        },
        {
            id: 'marketing-email',
            name: '마케팅 이메일',
            description: '고객에게 제품/서비스를 홍보하는 마케팅 이메일',
            category: 'marketing',
            template: {
                topic: '마케팅 이메일',
                purpose: '제품/서비스 홍보 및 고객 참여 유도',
                content: '제품 특징, 혜택, 특별 할인, 행동 유도',
                style: 'semi-formal',
                tone: 'persuasive',
                length: 'short',
                format: 'mixed',
                requirements: '매력적인 제목, 명확한 CTA, 개인화된 메시지'
            },
            tags: ['이메일', '마케팅', '홍보', '고객']
        },
        {
            id: 'technical-report',
            name: '기술 보고서',
            description: '기술적 분석이나 연구 결과를 담은 전문 보고서',
            category: 'technical',
            template: {
                topic: '기술 보고서',
                purpose: '기술적 분석 결과 및 권장사항 제시',
                content: '연구 목적, 방법론, 결과 분석, 결론, 권장사항',
                style: 'academic',
                tone: 'professional',
                length: 'very-long',
                format: 'structured',
                requirements: '정확한 데이터, 객관적 분석, 전문 용어 사용'
            },
            tags: ['기술', '보고서', '분석', '연구']
        },
        {
            id: 'company-introduction',
            name: '회사 소개서',
            description: '회사의 비전, 미션, 핵심 가치를 담은 소개서',
            category: 'business',
            template: {
                topic: '회사 소개서',
                purpose: '회사 브랜드 및 가치 전달',
                content: '회사 역사, 비전/미션, 핵심 가치, 주요 성과, 미래 계획',
                style: 'formal',
                tone: 'enthusiastic',
                length: 'medium',
                format: 'mixed',
                requirements: '브랜드 일관성, 시각적 요소 고려, 감정적 연결'
            },
            tags: ['회사', '소개', '브랜드', '비전']
        },
        {
            id: 'blog-post',
            name: '블로그 포스트',
            description: '독자와 소통하는 친근한 블로그 글',
            category: 'content',
            template: {
                topic: '블로그 포스트',
                purpose: '독자와의 소통 및 정보 공유',
                content: '흥미로운 주제, 개인적 경험, 실용적 팁, 독자 참여 유도',
                style: 'casual',
                tone: 'friendly',
                length: 'medium',
                format: 'paragraph',
                requirements: '독자 친화적, SEO 최적화, 시각적 요소'
            },
            tags: ['블로그', '소통', '정보', '독자']
        },
        {
            id: 'press-release',
            name: '보도자료',
            description: '언론사에 배포하는 공식 보도자료',
            category: 'media',
            template: {
                topic: '보도자료',
                purpose: '언론을 통한 공식 정보 전달',
                content: '핵심 뉴스, 배경 정보, 인용문, 연락처',
                style: 'formal',
                tone: 'professional',
                length: 'medium',
                format: 'structured',
                requirements: '5W1H 포함, 객관적 사실 중심, 언론 친화적'
            },
            tags: ['보도자료', '언론', '공식', '뉴스']
        },
        {
            id: 'product-review',
            name: '제품 리뷰',
            description: '제품의 장단점을 분석하는 리뷰 글',
            category: 'content',
            template: {
                topic: '제품 리뷰',
                purpose: '제품에 대한 객관적 평가 및 독자 도움',
                content: '제품 개요, 사용 경험, 장점, 단점, 구매 추천',
                style: 'semi-formal',
                tone: 'friendly',
                length: 'medium',
                format: 'mixed',
                requirements: '정직한 평가, 구체적 경험, 독자 관점'
            },
            tags: ['리뷰', '제품', '평가', '구매']
        },
        {
            id: 'meeting-minutes',
            name: '회의록',
            description: '회의 내용을 정리한 공식 문서',
            category: 'business',
            template: {
                topic: '회의록',
                purpose: '회의 내용 기록 및 후속 조치 추적',
                content: '회의 개요, 참석자, 논의 사항, 결정 사항, 후속 조치',
                style: 'formal',
                tone: 'professional',
                length: 'short',
                format: 'structured',
                requirements: '정확한 기록, 명확한 액션 아이템, 시한 명시'
            },
            tags: ['회의록', '회의', '기록', '조치']
        }
    ];

    const categories = [
        { id: 'all', name: '전체', count: writingTemplates.length },
        { id: 'business', name: '비즈니스', count: writingTemplates.filter(t => t.category === 'business').length },
        { id: 'marketing', name: '마케팅', count: writingTemplates.filter(t => t.category === 'marketing').length },
        { id: 'technical', name: '기술', count: writingTemplates.filter(t => t.category === 'technical').length },
        { id: 'content', name: '콘텐츠', count: writingTemplates.filter(t => t.category === 'content').length },
        { id: 'media', name: '미디어', count: writingTemplates.filter(t => t.category === 'media').length }
    ];

    const filteredTemplates = writingTemplates.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 헤더 */}
                <div className="bg-green-600 text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">📋 글쓰기 템플릿 선택</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 검색 및 필터 */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="템플릿 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === category.id
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.name} ({category.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 템플릿 목록 */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-lg mb-2">🔍</div>
                            <p className="text-gray-600">검색 결과가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => onSelectTemplate(template)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {template.name}
                                        </h3>
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                            {template.category}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-3">
                                        {template.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {template.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div>스타일: {template.template.style}</div>
                                        <div>톤: {template.template.tone}</div>
                                        <div>길이: {template.template.length}</div>
                                    </div>

                                    <button
                                        className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                    >
                                        이 템플릿 사용하기
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        총 {filteredTemplates.length}개의 템플릿
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WritingTemplatesModal;
