import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, BarChart, ExternalLink } from 'lucide-react';
import { newsService, NewsArticle, CommentAnalysis } from '../../services/newsService';
import { errorLogger } from '../../utils/errorLogger';

interface NewsSearchProps {
    onArticleSelect?: (article: NewsArticle) => void;
    apiKey?: string;
}

const NewsSearch: React.FC<NewsSearchProps> = ({ onArticleSelect, apiKey }) => {
    const [searchQuery, setSearchQuery] = useState('원베일리 하자');
    const [searchResults, setSearchResults] = useState<NewsArticle[]>([]);
    const [trendingNews, setTrendingNews] = useState<NewsArticle[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
    const [commentAnalysis, setCommentAnalysis] = useState<CommentAnalysis | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'analysis'>('search');

    // 뉴스 검색
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            if (apiKey) {
                newsService.setAPIKey(apiKey);
            }
            const result = await newsService.searchNews(searchQuery);
            setSearchResults(result.articles);
        } catch (error) {
            errorLogger.error('뉴스 검색 실패', error instanceof Error ? error : new Error(String(error)), { component: 'NewsSearch', action: 'handleSearch' });
            // 오류 시 시뮬레이션 데이터 사용 (원베일리 하자 관련)
            setSearchResults([
                {
                    id: '1',
                    title: '원베일리 아파트 하자 논란, 입주민들 "품질 보증 요구"',
                    content: '최근 원베일리 아파트에서 발생한 하자 문제로 입주민들이 건설사에 대한 품질 보증을 요구하고 있습니다. 특히 외벽 균열과 단열재 문제가 지적되고 있어 건설사 측의 적극적인 대응이 필요한 상황입니다.',
                    url: 'https://news.naver.com/article/123456789',
                    source: '네이버뉴스',
                    publishedAt: new Date().toISOString(),
                    sentiment: 'negative'
                },
                {
                    id: '2',
                    title: '원베일리 하자 사태, 건설사 "전면 점검 및 보수 공사 진행"',
                    content: '원베일리 아파트 하자 사태에 대해 건설사 측이 전면 점검과 보수 공사를 진행한다고 발표했습니다. 입주민들과의 협의를 통해 체계적인 하자 보수 계획을 수립할 예정이라고 밝혔습니다.',
                    url: 'https://news.daum.net/article/987654321',
                    source: '다음뉴스',
                    publishedAt: new Date().toISOString(),
                    sentiment: 'positive'
                },
                {
                    id: '3',
                    title: '원베일리 아파트 하자 문제, 전문가 "초기 설계 단계부터 검토 필요"',
                    content: '원베일리 아파트의 하자 문제에 대해 건축 전문가들이 초기 설계 단계부터 재검토가 필요하다고 지적했습니다. 향후 유사한 문제를 방지하기 위한 제도적 개선도 함께 논의되어야 한다는 의견입니다.',
                    url: 'https://news.khan.co.kr/article/456789123',
                    source: '경향신문',
                    publishedAt: new Date().toISOString(),
                    sentiment: 'neutral'
                },
                {
                    id: '4',
                    title: '원베일리 입주민들, 하자 보수 완료 후 입주 재개 요청',
                    content: '원베일리 아파트 입주민들이 하자 보수 작업이 완료된 후 입주를 재개해달라고 건설사에 요청했습니다. 안전한 주거 환경을 위해 철저한 점검과 보수가 선행되어야 한다는 입장입니다.',
                    url: 'https://news.chosun.com/article/789123456',
                    source: '조선일보',
                    publishedAt: new Date().toISOString(),
                    sentiment: 'negative'
                }
            ]);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, apiKey]);

    // 트렌딩 뉴스 가져오기
    const loadTrendingNews = useCallback(async () => {
        try {
            if (apiKey) {
                newsService.setAPIKey(apiKey);
            }
            const trending = await newsService.getTrendingNews('technology');
            setTrendingNews(trending);
        } catch (error) {
            errorLogger.error('트렌딩 뉴스 가져오기 실패', error instanceof Error ? error : new Error(String(error)), { component: 'NewsSearch', action: 'loadTrendingNews' });
            // 시뮬레이션 데이터 (원베일리 하자 관련 트렌딩)
            setTrendingNews([
                {
                    id: 'trending1',
                    title: '원베일리 하자 사태, SNS에서도 화제',
                    content: '원베일리 아파트 하자 문제가 소셜미디어에서도 큰 화제가 되고 있습니다. 입주민들의 생생한 증언과 사진들이 공유되며 건설업계의 품질 관리에 대한 우려가 확산되고 있습니다.',
                    url: 'https://news.naver.com/trending/123456',
                    source: '네이버뉴스',
                    publishedAt: new Date().toISOString(),
                    sentiment: 'negative'
                },
                {
                    id: 'trending2',
                    title: '원베일리 하자 보수 현장, 전문가들 현장 점검',
                    content: '원베일리 아파트 하자 보수 현장에 건축 전문가들이 직접 나서서 현장 점검을 진행했습니다. 체계적인 보수 계획 수립을 위한 전문적인 의견을 제시할 예정입니다.',
                    url: 'https://news.daum.net/trending/654321',
                    source: '다음뉴스',
                    publishedAt: new Date().toISOString(),
                    sentiment: 'positive'
                }
            ]);
        }
    }, [apiKey]);

    // 댓글 분석
    const analyzeComments = useCallback(async (articleId: string) => {
        setIsAnalyzing(true);
        try {
            const analysis = await newsService.analyzeComments(articleId);
            setCommentAnalysis(analysis);
        } catch (error) {
            errorLogger.error('댓글 분석 실패', error instanceof Error ? error : new Error(String(error)), { component: 'NewsSearch', action: 'analyzeComments' });
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    // 컴포넌트 마운트 시 자동 검색 및 트렌딩 뉴스 로드
    useEffect(() => {
        handleSearch();
        loadTrendingNews();
    }, [handleSearch, loadTrendingNews]);

    // 기사 선택
    const handleArticleSelect = (article: NewsArticle) => {
        setSelectedArticle(article);
        onArticleSelect?.(article);
        analyzeComments(article.id);
    };

    return (
        <div className="h-full flex flex-col">
            {/* 검색 헤더 */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="뉴스 검색어를 입력하세요..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isSearching ? '검색 중...' : '검색'}
                    </button>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex space-x-4 mt-4">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'search' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Search className="h-4 w-4" />
                        <span>뉴스 검색</span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('trending');
                            loadTrendingNews();
                        }}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'trending' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <TrendingUp className="h-4 w-4" />
                        <span>트렌딩 뉴스</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'analysis' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <BarChart className="h-4 w-4" />
                        <span>댓글 분석</span>
                    </button>
                </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <h3 className="text-lg font-semibold text-gray-900">검색 결과</h3>
                            {searchResults.map((article) => (
                                <div
                                    key={article.id}
                                    onClick={() => handleArticleSelect(article)}
                                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-2">{article.title}</h4>
                                            <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(article.url, '_blank');
                                                    }}
                                                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    <span>{article.source}</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </button>
                                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                                <span className={`px-2 py-1 rounded-full ${article.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                                    article.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {article.sentiment === 'positive' ? '긍정' :
                                                        article.sentiment === 'negative' ? '부정' : '중립'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(article.url, '_blank');
                                            }}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="기사 원문 보기"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'trending' && (
                        <motion.div
                            key="trending"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <h3 className="text-lg font-semibold text-gray-900">트렌딩 뉴스</h3>
                            {trendingNews.map((article) => (
                                <div
                                    key={article.id}
                                    onClick={() => handleArticleSelect(article)}
                                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-2">{article.title}</h4>
                                            <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(article.url, '_blank');
                                                    }}
                                                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    <span>{article.source}</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </button>
                                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                                <span className="flex items-center space-x-1 text-orange-600">
                                                    <TrendingUp className="h-3 w-3" />
                                                    <span>트렌딩</span>
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(article.url, '_blank');
                                            }}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="기사 원문 보기"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'analysis' && selectedArticle && (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">선택된 기사</h3>
                                    <button
                                        onClick={() => window.open(selectedArticle.url, '_blank')}
                                        className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="기사 원문 보기"
                                    >
                                        <span>원문 보기</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                </div>
                                <h4 className="font-medium text-gray-900 mb-2">{selectedArticle.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{selectedArticle.summary}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <button
                                        onClick={() => window.open(selectedArticle.url, '_blank')}
                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                        <span>{selectedArticle.source}</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                    <span>{new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {isAnalyzing ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">댓글 분석 중...</p>
                                </div>
                            ) : commentAnalysis && (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">댓글 분석 결과</h3>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <span>출처: {selectedArticle.source}</span>
                                            <button
                                                onClick={() => window.open(selectedArticle.url, '_blank')}
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                title="기사 원문 보기"
                                            >
                                                <span>원문</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* 감정 분포 */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">감정 분포</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">긍정</span>
                                                    <span className="text-sm font-medium text-green-600">
                                                        {commentAnalysis.sentimentDistribution.positive}개
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">중립</span>
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {commentAnalysis.sentimentDistribution.neutral}개
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">부정</span>
                                                    <span className="text-sm font-medium text-red-600">
                                                        {commentAnalysis.sentimentDistribution.negative}개
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 참여도 지표 */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">참여도 지표</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">총 댓글</span>
                                                    <span className="text-sm font-medium">{commentAnalysis.totalComments}개</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">총 좋아요</span>
                                                    <span className="text-sm font-medium">{commentAnalysis.engagementMetrics.totalLikes}개</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">평균 좋아요</span>
                                                    <span className="text-sm font-medium">
                                                        {commentAnalysis.engagementMetrics.averageLikes.toFixed(1)}개
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 키워드 분석 */}
                                    {commentAnalysis.topKeywords.length > 0 && (
                                        <div className="mt-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-900">주요 키워드</h4>
                                                <span className="text-xs text-gray-500">
                                                    분석 시간: {new Date().toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {commentAnalysis.topKeywords.slice(0, 10).map((keyword, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors cursor-default"
                                                        title={`키워드: ${keyword.keyword}, 빈도: ${keyword.frequency}회`}
                                                    >
                                                        {keyword.keyword} ({keyword.frequency})
                                                    </span>
                                                ))}
                                            </div>
                                            {commentAnalysis.topKeywords.length > 10 && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    외 {commentAnalysis.topKeywords.length - 10}개 키워드 더...
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* 분석 요약 */}
                                    <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">분석 요약</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>• 총 {commentAnalysis.totalComments}개의 댓글을 분석했습니다.</p>
                                            <p>• 주요 감정: {commentAnalysis.sentimentDistribution.positive > commentAnalysis.sentimentDistribution.negative ? '긍정적' : '부정적'} 반응이 우세합니다.</p>
                                            <p>• 평균 참여도: 댓글당 {commentAnalysis.engagementMetrics.averageLikes.toFixed(1)}개의 좋아요를 받았습니다.</p>
                                            <p>• 출처: <button
                                                onClick={() => window.open(selectedArticle.url, '_blank')}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {selectedArticle.source}
                                            </button>에서 수집된 데이터입니다.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NewsSearch;
