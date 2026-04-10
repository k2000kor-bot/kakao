import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, BarChart, ExternalLink } from 'lucide-react';
import { getSentimentColor } from '../../styles/themeColors';
import { newsService, NewsArticle, CommentAnalysis } from '../../services/newsService';
import { errorLogger } from '../../utils/errorLogger';
import { coerceTrimmedString } from '../../utils/chatInputUtils';

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
        const q = coerceTrimmedString(searchQuery, '');
        if (!q) return;

        setIsSearching(true);
        try {
            if (apiKey) {
                newsService.setAPIKey(apiKey);
            }
            const result = await newsService.searchNews(q);
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
        void handleSearch();
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
            <div style={{ padding: 'var(--spacing-md)', borderBottom: 'var(--border-width) solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search className="h-5 w-5" style={{ position: 'absolute', left: 'var(--spacing-md)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} aria-hidden />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') void handleSearch();
                            }}
                            placeholder="뉴스 검색어를 입력하세요..."
                            className="bw-input"
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => void handleSearch()}
                        disabled={isSearching || !coerceTrimmedString(searchQuery, '')}
                        className="bw-btn-primary"
                    >
                        {isSearching ? '검색 중...' : '검색'}
                    </button>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                    {(['search', 'trending', 'analysis'] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => { setActiveTab(tab); if (tab === 'trending') loadTrendingNews(); }}
                            className={`bw-btn-ghost ${activeTab === tab ? 'bw-tab-active' : ''}`}
                            style={activeTab === tab ? { background: 'var(--accent-info-muted)', color: 'var(--accent-info)' } : undefined}
                        >
                            {tab === 'search' && <Search className="h-4 w-4" aria-hidden />}
                            {tab === 'trending' && <TrendingUp className="h-4 w-4" aria-hidden />}
                            {tab === 'analysis' && <BarChart className="h-4 w-4" aria-hidden />}
                            <span>{tab === 'search' ? '뉴스 검색' : tab === 'trending' ? '트렌딩 뉴스' : '댓글 분석'}</span>
                        </button>
                    ))}
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
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>검색 결과</h3>
                            {searchResults.map((article) => {
                                const sentColor = getSentimentColor(article.sentiment || 'neutral');
                                const sentStyle = article.sentiment === 'positive' ? { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' } : article.sentiment === 'negative' ? { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' } : { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
                                return (
                                    <div key={article.id} onClick={() => handleArticleSelect(article)} className="bw-card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer', borderColor: 'var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>{article.title}</h4>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>{article.summary || article.content}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); window.open(article.url, '_blank'); }} className="bw-btn-ghost" style={{ padding: 0, fontSize: 'inherit', color: sentColor }}>
                                                        <span>{article.source}</span>
                                                        <ExternalLink className="h-3 w-3" style={{ marginLeft: 'var(--spacing-xs)' }} aria-hidden />
                                                    </button>
                                                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                                    <span style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 9999, fontSize: 'var(--font-size-xs)', fontWeight: 500, ...sentStyle }}>
                                                        {article.sentiment === 'positive' ? '긍정' : article.sentiment === 'negative' ? '부정' : '중립'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); window.open(article.url, '_blank'); }} className="bw-btn-ghost" title="기사 원문 보기">
                                                <ExternalLink className="h-4 w-4" aria-hidden />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>트렌딩 뉴스</h3>
                            {trendingNews.map((article) => (
                                    <div key={article.id} onClick={() => handleArticleSelect(article)} className="bw-card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>{article.title}</h4>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>{article.summary || article.content}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); window.open(article.url, '_blank'); }} className="bw-btn-ghost" style={{ padding: 0, fontSize: 'inherit', color: 'var(--accent-info)' }}>
                                                        <span>{article.source}</span>
                                                        <ExternalLink className="h-3 w-3" style={{ marginLeft: 'var(--spacing-xs)' }} aria-hidden />
                                                    </button>
                                                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--accent-orange)' }}>
                                                        <TrendingUp className="h-3 w-3" aria-hidden />
                                                        <span>트렌딩</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); window.open(article.url, '_blank'); }} className="bw-btn-ghost" title="기사 원문 보기">
                                                <ExternalLink className="h-4 w-4" aria-hidden />
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
                            <div className="bw-card">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>선택된 기사</h3>
                                    <button
                                        onClick={() => window.open(selectedArticle.url, '_blank')}
                                        className="bw-btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}
                                        title="기사 원문 보기"
                                    >
                                        <span>원문 보기</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                </div>
                                <h4 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>{selectedArticle.title}</h4>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>{selectedArticle.summary}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    <button
                                        onClick={() => window.open(selectedArticle.url, '_blank')}
                                        className="bw-btn-ghost" style={{ padding: 0, fontSize: 'inherit', color: 'var(--accent-info)' }}
                                    >
                                        <span>{selectedArticle.source}</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                    <span>{new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {isAnalyzing ? (
                                <div className="text-center py-8">
                                    <div className="bw-spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
                                    <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>댓글 분석 중...</p>
                                </div>
                            ) : commentAnalysis && (
                                <div className="bw-card">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>댓글 분석 결과</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                            <span>출처: {selectedArticle.source}</span>
                                            <button
                                                onClick={() => window.open(selectedArticle.url, '_blank')}
                                                className="bw-btn-ghost" style={{ padding: 0, fontSize: 'inherit', color: 'var(--accent-info)' }}
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
                                            <h4 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>감정 분포</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>긍정</span>
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--accent-success)' }}>
                                                        {commentAnalysis.sentimentDistribution.positive}개
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>중립</span>
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                                        {commentAnalysis.sentimentDistribution.neutral}개
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>부정</span>
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--accent-error)' }}>
                                                        {commentAnalysis.sentimentDistribution.negative}개
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 참여도 지표 */}
                                        <div>
                                            <h4 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>참여도 지표</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>총 댓글</span>
                                                    <span className="text-sm font-medium">{commentAnalysis.totalComments}개</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>총 좋아요</span>
                                                    <span className="text-sm font-medium">{commentAnalysis.engagementMetrics.totalLikes}개</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>평균 좋아요</span>
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
                                                <h4 className="font-medium style={{ color: 'var(--text-primary)' }}">주요 키워드</h4>
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    분석 시간: {new Date().toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {commentAnalysis.topKeywords.slice(0, 10).map((keyword, index) => (
                                                    <span
                                                        key={index}
                                                        style={{ padding: 'var(--spacing-xs) var(--spacing-md)', color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)', borderRadius: 9999, fontSize: 'var(--font-size-sm)' }}
                                                        title={`키워드: ${keyword.keyword}, 빈도: ${keyword.frequency}회`}
                                                    >
                                                        {keyword.keyword} ({keyword.frequency})
                                                    </span>
                                                ))}
                                            </div>
                                            {commentAnalysis.topKeywords.length > 10 && (
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>
                                                    외 {commentAnalysis.topKeywords.length - 10}개 키워드 더...
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* 분석 요약 */}
                                    <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                                        <h4 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>분석 요약</h4>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                            <p>• 총 {commentAnalysis.totalComments}개의 댓글을 분석했습니다.</p>
                                            <p>• 주요 감정: {commentAnalysis.sentimentDistribution.positive > commentAnalysis.sentimentDistribution.negative ? '긍정적' : '부정적'} 반응이 우세합니다.</p>
                                            <p>• 평균 참여도: 댓글당 {commentAnalysis.engagementMetrics.averageLikes.toFixed(1)}개의 좋아요를 받았습니다.</p>
                                            <p>• 출처: <button
                                                onClick={() => window.open(selectedArticle.url, '_blank')}
                                                className="bw-btn-ghost" style={{ padding: 0, color: 'var(--accent-info)' }}
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
