import React, { useState, useEffect } from 'react';
import {
    QuestionMarkCircleIcon,
    MagnifyingGlassIcon,
    BookOpenIcon,
    AcademicCapIcon,
    LightBulbIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    VideoCameraIcon,
    StarIcon,
    ClockIcon,
    UserIcon,
    CogIcon,
    ArrowPathIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface HelpArticle {
    id: string;
    title: string;
    content: string;
    category: 'getting-started' | 'features' | 'troubleshooting' | 'advanced' | 'faq';
    tags: string[];
    author: string;
    createdAt: Date;
    updatedAt: Date;
    views: number;
    helpful: number;
    notHelpful: number;
    featured: boolean;
}

interface HelpCategory {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    articleCount: number;
}

interface HelpSearchResult {
    article: HelpArticle;
    relevance: number;
    matchedTerms: string[];
}

interface AdvancedHelpSystemProps {
    onArticleView?: (articleId: string) => void;
    onArticleRate?: (articleId: string, helpful: boolean) => void;
    onContactSupport?: () => void;
}

const AdvancedHelpSystem: React.FC<AdvancedHelpSystemProps> = ({
    onArticleView,
    onArticleRate,
    onContactSupport
}) => {
    const [articles, setArticles] = useState<HelpArticle[]>([]);
    const [categories, setCategories] = useState<HelpCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<HelpSearchResult[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
    const [recentArticles, setRecentArticles] = useState<HelpArticle[]>([]);
    const [favoriteArticles, setFavoriteArticles] = useState<string[]>([]);

    // 시뮬레이션된 도움말 데이터
    useEffect(() => {
        const mockArticles: HelpArticle[] = [
            {
                id: '1',
                title: 'CORBU AI 시작하기',
                content: `CORBU AI 시스템을 처음 사용하시는 분들을 위한 가이드입니다.

## 1. 시스템 개요
CORBU AI는 고급 인공지능 기반의 대화형 시스템으로, 다양한 기능을 제공합니다.

## 2. 주요 기능
- **대화형 AI**: 자연스러운 대화를 통한 작업 수행
- **파일 분석**: 문서, 이미지, 비디오 등 다양한 파일 형식 지원
- **프로젝트 관리**: 체계적인 프로젝트 관리 및 협업
- **고급 분석**: 데이터 분석 및 시각화

## 3. 첫 번째 사용
1. 시스템에 로그인합니다
2. 대화창에서 원하는 작업을 요청합니다
3. AI가 요청을 이해하고 적절한 응답을 제공합니다

## 4. 팁
- 명확하고 구체적인 요청을 하면 더 정확한 결과를 얻을 수 있습니다
- 파일을 업로드하여 분석을 요청할 수 있습니다
- 프로젝트를 생성하여 작업을 체계적으로 관리할 수 있습니다`,
                category: 'getting-started',
                tags: ['시작하기', '기본', '가이드'],
                author: 'CORBU AI 팀',
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                views: 1250,
                helpful: 89,
                notHelpful: 3,
                featured: true
            },
            {
                id: '2',
                title: '파일 업로드 및 분석',
                content: `CORBU AI에서 파일을 업로드하고 분석하는 방법을 설명합니다.

## 지원 파일 형식
- **문서**: PDF, DOC, DOCX, TXT
- **이미지**: JPG, PNG, GIF, SVG
- **비디오**: MP4, AVI, MOV
- **오디오**: MP3, WAV, AAC

## 업로드 방법
1. 파일 업로드 버튼을 클릭합니다
2. 분석할 파일을 선택합니다
3. 업로드가 완료되면 AI가 자동으로 분석을 시작합니다

## 분석 결과
- 파일 내용 요약
- 주요 키워드 추출
- 관련 정보 제공
- 추가 작업 제안`,
                category: 'features',
                tags: ['파일', '업로드', '분석'],
                author: '기술 지원팀',
                createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                views: 890,
                helpful: 67,
                notHelpful: 5,
                featured: false
            },
            {
                id: '3',
                title: '프로젝트 관리 기능',
                content: `CORBU AI의 프로젝트 관리 기능을 활용하는 방법입니다.

## 프로젝트 생성
1. 프로젝트 탭으로 이동합니다
2. "새 프로젝트" 버튼을 클릭합니다
3. 프로젝트 이름과 설명을 입력합니다
4. 프로젝트 설정을 구성합니다

## 프로젝트 기능
- **대화 관리**: 프로젝트별 대화 기록 관리
- **파일 관리**: 프로젝트 관련 파일 정리
- **협업**: 팀원과의 실시간 협업
- **분석**: 프로젝트 진행 상황 분석

## 팁
- 프로젝트별로 태그를 사용하여 분류하세요
- 정기적으로 프로젝트 상태를 업데이트하세요
- 팀원과 공유하여 협업 효율성을 높이세요`,
                category: 'features',
                tags: ['프로젝트', '관리', '협업'],
                author: '제품 관리팀',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                views: 567,
                helpful: 45,
                notHelpful: 2,
                featured: false
            },
            {
                id: '4',
                title: '자주 묻는 질문 (FAQ)',
                content: `CORBU AI 사용 중 자주 묻는 질문들과 답변입니다.

## Q: 시스템이 응답하지 않을 때는?
A: 페이지를 새로고침하거나 잠시 후 다시 시도해보세요.

## Q: 파일 업로드가 실패하는 경우?
A: 파일 크기 제한(100MB)을 확인하고, 지원되는 형식인지 확인하세요.

## Q: 대화 기록이 사라지는 경우?
A: 브라우저 캐시를 확인하고, 로그인 상태를 확인하세요.

## Q: 성능이 느린 경우?
A: 인터넷 연결을 확인하고, 브라우저를 최신 버전으로 업데이트하세요.

## Q: 계정 설정을 변경하는 방법?
A: 설정 탭에서 개인 정보 및 환경 설정을 변경할 수 있습니다.`,
                category: 'faq',
                tags: ['FAQ', '문제해결', '기본'],
                author: '고객 지원팀',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                views: 2340,
                helpful: 156,
                notHelpful: 8,
                featured: true
            },
            {
                id: '5',
                title: '고급 분석 기능 사용법',
                content: `CORBU AI의 고급 분석 기능을 활용하는 방법입니다.

## 데이터 분석
- **통계 분석**: 수치 데이터의 통계적 분석
- **트렌드 분석**: 시간에 따른 변화 패턴 분석
- **예측 분석**: 미래 데이터 예측 및 시나리오 분석

## 시각화
- **차트 생성**: 다양한 형태의 차트 및 그래프
- **대시보드**: 실시간 데이터 모니터링
- **보고서**: 자동화된 보고서 생성

## 고급 기능
- **머신러닝**: 자동화된 모델 학습 및 예측
- **자연어 처리**: 텍스트 데이터의 고급 분석
- **이미지 인식**: 이미지 내 객체 및 텍스트 인식`,
                category: 'advanced',
                tags: ['분석', '고급', '데이터'],
                author: '데이터 과학팀',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                views: 345,
                helpful: 28,
                notHelpful: 1,
                featured: false
            }
        ];

        setArticles(mockArticles);
        setRecentArticles(mockArticles.slice(0, 3));

        const mockCategories: HelpCategory[] = [
            {
                id: 'getting-started',
                name: '시작하기',
                description: '처음 사용자를 위한 기본 가이드',
                icon: BookOpenIcon,
                articleCount: mockArticles.filter(a => a.category === 'getting-started').length
            },
            {
                id: 'features',
                name: '기능',
                description: '주요 기능 사용법',
                icon: AcademicCapIcon,
                articleCount: mockArticles.filter(a => a.category === 'features').length
            },
            {
                id: 'troubleshooting',
                name: '문제해결',
                description: '일반적인 문제 해결 방법',
                icon: LightBulbIcon,
                articleCount: mockArticles.filter(a => a.category === 'troubleshooting').length
            },
            {
                id: 'advanced',
                name: '고급',
                description: '고급 기능 및 팁',
                icon: CogIcon,
                articleCount: mockArticles.filter(a => a.category === 'advanced').length
            },
            {
                id: 'faq',
                name: 'FAQ',
                description: '자주 묻는 질문',
                icon: QuestionMarkCircleIcon,
                articleCount: mockArticles.filter(a => a.category === 'faq').length
            }
        ];

        setCategories(mockCategories);
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const results: HelpSearchResult[] = [];
        const terms = query.toLowerCase().split(' ');

        articles.forEach(article => {
            let relevance = 0;
            const matchedTerms: string[] = [];

            terms.forEach(term => {
                if (article.title.toLowerCase().includes(term)) {
                    relevance += 10;
                    matchedTerms.push(term);
                }
                if (article.content.toLowerCase().includes(term)) {
                    relevance += 5;
                    if (!matchedTerms.includes(term)) {
                        matchedTerms.push(term);
                    }
                }
                if (article.tags.some(tag => tag.toLowerCase().includes(term))) {
                    relevance += 3;
                    if (!matchedTerms.includes(term)) {
                        matchedTerms.push(term);
                    }
                }
            });

            if (relevance > 0) {
                results.push({ article, relevance, matchedTerms });
            }
        });

        results.sort((a, b) => b.relevance - a.relevance);
        setSearchResults(results);
    };

    const handleArticleView = (article: HelpArticle) => {
        setSelectedArticle(article);
        setArticles(prev =>
            prev.map(a =>
                a.id === article.id ? { ...a, views: a.views + 1 } : a
            )
        );
        onArticleView?.(article.id);
    };

    const handleArticleRate = (articleId: string, helpful: boolean) => {
        setArticles(prev =>
            prev.map(a =>
                a.id === articleId
                    ? {
                        ...a,
                        helpful: helpful ? a.helpful + 1 : a.helpful,
                        notHelpful: helpful ? a.notHelpful : a.notHelpful + 1
                    }
                    : a
            )
        );
        onArticleRate?.(articleId, helpful);
    };

    const toggleFavorite = (articleId: string) => {
        setFavoriteArticles(prev =>
            prev.includes(articleId)
                ? prev.filter(id => id !== articleId)
                : [...prev, articleId]
        );
    };

    const filteredArticles = articles.filter(article => {
        if (activeCategory === 'all') return true;
        return article.category === activeCategory;
    });

    const renderArticleList = () => (
        <div className="space-y-4">
            {filteredArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                    onClick={() => handleArticleView(article)}>
                                    {article.title}
                                </h3>
                                {article.featured && (
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {article.content.substring(0, 150)}...
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>조회수: {article.views}</span>
                                <span>도움됨: {article.helpful}</span>
                                <span>업데이트: {article.updatedAt.toLocaleDateString()}</span>
                                <div className="flex space-x-1">
                                    {article.tags.slice(0, 3).map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                            <button
                                onClick={() => toggleFavorite(article.id)}
                                className={`p-2 rounded-lg ${favoriteArticles.includes(article.id)
                                    ? 'text-yellow-500 bg-yellow-50'
                                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                    }`}
                                title="즐겨찾기"
                            >
                                <StarIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderSearchResults = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
                검색 결과 ({searchResults.length}개)
            </h3>

            {searchResults.map((result) => (
                <div key={result.article.id} className="bg-white rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                    onClick={() => handleArticleView(result.article)}>
                                    {result.article.title}
                                </h3>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    관련도: {result.relevance}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                                {result.article.content.substring(0, 100)}...
                            </p>

                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>일치하는 용어:</span>
                                {result.matchedTerms.map((term, index) => (
                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                        {term}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderArticleDetail = () => {
        if (!selectedArticle) return null;

        return (
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {selectedArticle.title}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>작성자: {selectedArticle.author}</span>
                            <span>조회수: {selectedArticle.views}</span>
                            <span>업데이트: {selectedArticle.updatedAt.toLocaleDateString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedArticle(null)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <div className="prose max-w-none mb-6">
                    <div className="whitespace-pre-wrap text-gray-700">
                        {selectedArticle.content}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">이 문서가 도움이 되었나요?</span>
                        <button
                            onClick={() => handleArticleRate(selectedArticle.id, true)}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            도움됨 ({selectedArticle.helpful})
                        </button>
                        <button
                            onClick={() => handleArticleRate(selectedArticle.id, false)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            도움안됨 ({selectedArticle.notHelpful})
                        </button>
                    </div>

                    <div className="flex space-x-2">
                        {selectedArticle.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* 인기 문서 */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 문서</h3>
                <div className="space-y-3">
                    {articles
                        .sort((a, b) => b.views - a.views)
                        .slice(0, 5)
                        .map((article) => (
                            <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                        onClick={() => handleArticleView(article)}>
                                        {article.title}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{article.views}회 조회</span>
                            </div>
                        ))}
                </div>
            </div>

            {/* 최근 문서 */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 문서</h3>
                <div className="space-y-3">
                    {recentArticles.map((article) => (
                        <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                    onClick={() => handleArticleView(article)}>
                                    {article.title}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">{article.updatedAt.toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 카테고리별 문서 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg border p-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <category.icon className="w-6 h-6 text-blue-500" />
                            <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                        <p className="text-xs text-gray-500">{category.articleCount}개의 문서</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">고급 도움말 시스템</h3>
                            <p className="text-sm text-gray-500">사용 가이드 및 문제 해결</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onContactSupport}
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                        >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            <span>지원팀 문의</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 검색 */}
            <div className="bg-white border-b px-4 py-3">
                <div className="relative max-w-md">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="도움말 검색..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b">
                <nav className="flex space-x-8 px-4">
                    {[
                        { id: 'overview', name: '개요', icon: BookOpenIcon },
                        { id: 'all', name: '모든 문서', icon: DocumentTextIcon },
                        ...categories.map(cat => ({ id: cat.id, name: cat.name, icon: cat.icon }))
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveCategory(tab.id)}
                            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeCategory === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-4">
                {selectedArticle ? renderArticleDetail() : (
                    searchQuery ? renderSearchResults() : (
                        activeCategory === 'overview' ? renderOverview() : renderArticleList()
                    )
                )}
            </div>
        </div>
    );
};

export default AdvancedHelpSystem;
