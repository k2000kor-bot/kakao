// 뉴스 검색 및 댓글 분석 서비스
import {
    API_QUERY_PARAM_NEWS_API_KEY,
    API_QUERY_PARAM_NEWS_CATEGORY,
    API_QUERY_PARAM_NEWS_COUNTRY,
    API_QUERY_PARAM_NEWS_LANGUAGE,
    API_QUERY_PARAM_NEWS_SORT_BY,
    API_QUERY_PARAM_SEARCH_Q,
    NEWSAPI_DEFAULT_COUNTRY_KR,
    NEWSAPI_PATH_EVERYTHING,
    NEWSAPI_PATH_TOP_HEADLINES,
    NEWSAPI_V2_BASE_URL,
    joinApiBaseAndPath,
} from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import { NEWS_API_KEY_STORAGE_KEY } from './newsStorageKeys';
export interface NewsArticle {
    id: string;
    title: string;
    content: string;
    url: string;
    source: string;
    publishedAt: string;
    author?: string;
    summary?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    comments?: Comment[];
}

export interface Comment {
    id: string;
    content: string;
    author: string;
    timestamp: string;
    likes: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    replies?: Comment[];
}

export interface NewsSearchResult {
    articles: NewsArticle[];
    totalResults: number;
    query: string;
    searchTime: string;
}

export interface CommentAnalysis {
    totalComments: number;
    sentimentDistribution: {
        positive: number;
        negative: number;
        neutral: number;
    };
    topKeywords: Array<{ keyword: string; frequency: number }>;
    trendingTopics: string[];
    averageSentiment: number;
    engagementMetrics: {
        totalLikes: number;
        averageLikes: number;
        totalReplies: number;
    };
}

class NewsService {
    private apiKey: string = '';
    private baseURL: string = NEWSAPI_V2_BASE_URL;

    constructor() {
        // 환경 변수에서 API 키 가져오기
        this.apiKey = process.env.REACT_APP_NEWS_API_KEY || '';
    }

    // API 키 설정
    setAPIKey(apiKey: string): void {
        this.apiKey = apiKey;
        localStorage.setItem(NEWS_API_KEY_STORAGE_KEY, apiKey);
    }

    // 뉴스 검색
    async searchNews(query: string, language: string = 'ko', sortBy: string = 'relevancy'): Promise<NewsSearchResult> {
        if (!this.apiKey) {
            throw new Error('뉴스 API 키가 설정되지 않았습니다.');
        }

        try {
            const qs = new URLSearchParams();
            qs.set(API_QUERY_PARAM_SEARCH_Q, query);
            qs.set(API_QUERY_PARAM_NEWS_LANGUAGE, language);
            qs.set(API_QUERY_PARAM_NEWS_SORT_BY, sortBy);
            qs.set(API_QUERY_PARAM_NEWS_API_KEY, this.apiKey);
            const response = await fetch(
                joinApiBaseAndPath(this.baseURL, `${NEWSAPI_PATH_EVERYTHING}?${qs.toString()}`),
            );

            if (!response.ok) {
                throw new Error(`뉴스 검색 실패: ${response.status}`);
            }

            const data = await response.json();

            const articles: NewsArticle[] = data.articles.map((article: Record<string, unknown>, index: number) => ({
                id: `article_${index}`,
                title: article.title as string,
                content: (article.content || article.description) as string,
                url: article.url as string,
                source: (article.source as { name?: string })?.name || 'Unknown',
                publishedAt: article.publishedAt as string,
                author: article.author as string,
                summary: this.generateSummary((article.content || article.description) as string),
                sentiment: this.analyzeSentiment((article.title as string) + ' ' + ((article.content || article.description) as string))
            }));

            return {
                articles,
                totalResults: data.totalResults,
                query,
                searchTime: new Date().toISOString()
            };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('뉴스 검색 오류', err, {
                component: 'newsService',
                action: 'searchNews',
                query,
            });
            throw err;
        }
    }

    // 댓글 분석 (시뮬레이션)
    async analyzeComments(_articleId: string): Promise<CommentAnalysis> {
        // 실제로는 댓글 API를 호출하지만, 여기서는 시뮬레이션
        const mockComments: Comment[] = [
            {
                id: '1',
                content: '정말 좋은 기사네요! 정보가 유용했습니다.',
                author: '사용자1',
                timestamp: new Date().toISOString(),
                likes: 15,
                sentiment: 'positive'
            },
            {
                id: '2',
                content: '이런 내용은 이미 알고 있었는데...',
                author: '사용자2',
                timestamp: new Date().toISOString(),
                likes: 3,
                sentiment: 'neutral'
            },
            {
                id: '3',
                content: '완전히 동의합니다! 더 자세한 정보가 필요해요.',
                author: '사용자3',
                timestamp: new Date().toISOString(),
                likes: 8,
                sentiment: 'positive'
            },
            {
                id: '4',
                content: '이건 잘못된 정보인 것 같습니다.',
                author: '사용자4',
                timestamp: new Date().toISOString(),
                likes: 2,
                sentiment: 'negative'
            }
        ];

        const totalComments = mockComments.length;
        const sentimentCount = mockComments.reduce((acc, comment) => {
            acc[comment.sentiment]++;
            return acc;
        }, { positive: 0, negative: 0, neutral: 0 });

        const totalLikes = mockComments.reduce((sum, comment) => sum + comment.likes, 0);
        const averageLikes = totalLikes / totalComments;

        return {
            totalComments,
            sentimentDistribution: sentimentCount,
            topKeywords: this.extractKeywords(mockComments.map(c => c.content)),
            trendingTopics: ['기술', '개발', 'AI', '프로그래밍'],
            averageSentiment: this.calculateAverageSentiment(sentimentCount),
            engagementMetrics: {
                totalLikes,
                averageLikes,
                totalReplies: 0
            }
        };
    }

    // 기사 요약 생성
    private generateSummary(content: string): string {
        if (!content) return '';

        // 간단한 요약 로직 (실제로는 AI 모델 사용)
        const sentences = content.split(/[.!?]+/).filter((s) => coerceTrimmedString(s, '').length > 10);
        if (sentences.length <= 2) return content;

        return sentences.map((s) => coerceTrimmedString(s, '')).join('. ') + '.';
    }

    // 감정 분석 (간단한 키워드 기반)
    private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
        const positiveWords = ['좋다', '훌륭', '최고', '성공', '개선', '발전', '혁신', '긍정'];
        const negativeWords = ['문제', '실패', '위험', '부정', '실망', '실패', '오류', '위기'];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    // 키워드 추출
    private extractKeywords(texts: string[]): Array<{ keyword: string; frequency: number }> {
        const keywords: { [key: string]: number } = {};
        const commonWords = ['이', '그', '저', '것', '수', '등', '및', '또는', '그리고', '하지만'];

        texts.forEach(text => {
            const words = text.split(/\s+/).filter(word =>
                word.length > 1 && !commonWords.includes(word)
            );

            words.forEach(word => {
                keywords[word] = (keywords[word] || 0) + 1;
            });
        });

        return Object.entries(keywords)
            .map(([keyword, frequency]) => ({ keyword, frequency }))
            .sort((a, b) => b.frequency - a.frequency);
    }

    // 평균 감정 점수 계산
    private calculateAverageSentiment(sentimentCount: { positive: number; negative: number; neutral: number }): number {
        const total = sentimentCount.positive + sentimentCount.negative + sentimentCount.neutral;
        if (total === 0) return 0;

        return ((sentimentCount.positive - sentimentCount.negative) / total) * 100;
    }

    // 트렌딩 뉴스 가져오기
    async getTrendingNews(category: string = 'technology'): Promise<NewsArticle[]> {
        if (!this.apiKey) {
            throw new Error('뉴스 API 키가 설정되지 않았습니다.');
        }

        try {
            const qs = new URLSearchParams();
            qs.set(API_QUERY_PARAM_NEWS_COUNTRY, NEWSAPI_DEFAULT_COUNTRY_KR);
            qs.set(API_QUERY_PARAM_NEWS_CATEGORY, category);
            qs.set(API_QUERY_PARAM_NEWS_API_KEY, this.apiKey);
            const response = await fetch(
                joinApiBaseAndPath(this.baseURL, `${NEWSAPI_PATH_TOP_HEADLINES}?${qs.toString()}`),
            );

            if (!response.ok) {
                throw new Error(`트렌딩 뉴스 가져오기 실패: ${response.status}`);
            }

            const data = await response.json();

            return data.articles.map((article: Record<string, unknown>, index: number) => ({
                id: `trending_${index}`,
                title: article.title as string,
                content: (article.content || article.description) as string,
                url: article.url as string,
                source: (article.source as { name?: string })?.name || 'Unknown',
                publishedAt: article.publishedAt as string,
                author: article.author as string,
                summary: this.generateSummary((article.content || article.description) as string),
                sentiment: this.analyzeSentiment((article.title as string) + ' ' + ((article.content || article.description) as string))
            }));
        } catch (error) {
            const err = toError(error);
            errorLogger.error('트렌딩 뉴스 가져오기 오류', err, {
                component: 'newsService',
                action: 'getTrendingNews',
            });
            throw err;
        }
    }
}

export const newsService = new NewsService();

export { NEWS_API_KEY_STORAGE_KEY } from './newsStorageKeys';
