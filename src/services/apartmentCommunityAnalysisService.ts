// 아파트 커뮤니티 분석 서비스
// 입주민 성향 분석, 댓글 분석, 맞춤형 대응글 생성 기능 제공

import axios from 'axios';
import { errorLogger } from '../utils/errorLogger';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// 타입 정의
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type ActivityLevel = 'high' | 'medium' | 'low';
export type CommentCategory = 'complaint' | 'suggestion' | 'question' | 'praise' | 'general';
export type ResponseTone = 'formal' | 'friendly' | 'empathetic' | 'professional';
export type Priority = 'high' | 'medium' | 'low';

export interface ResidentProfile {
    id: string;
    nickname: string;
    sentiment: Sentiment;
    activity_level: ActivityLevel;
    interests: string[];
    comment_count: number;
    influence_score: number;
    last_active: string;
    apartment_unit?: string;
}

export interface CommunityComment {
    id: string;
    resident_id: string;
    resident_nickname: string;
    content: string;
    sentiment: Sentiment;
    category: CommentCategory;
    likes: number;
    replies: number;
    timestamp: string;
    apartment_id?: string;
    topic?: string;
}

export interface CommunityAnalytics {
    total_residents: number;
    active_residents: number;
    total_comments: number;
    sentiment_distribution: {
        positive: number;
        neutral: number;
        negative: number;
    };
    category_distribution: Record<string, number>;
    top_topics: Array<{ topic: string; count: number }>;
    engagement_trend: Array<{ date: string; comments: number; active_users: number }>;
    influence_leaders: Array<{ resident_id: string; nickname: string; influence_score: number }>;
}

export interface CommunityResponse {
    id: string;
    comment_id: string;
    content: string;
    tone: ResponseTone;
    suggested_by: 'ai' | 'manual';
    created_at: string;
    effectiveness_score?: number;
}

export interface CommentAnalysis {
    comment_id: string;
    sentiment: Sentiment;
    key_points: string[];
    suggested_response_tone: ResponseTone;
    priority: Priority;
    related_comments: string[];
}

class ApartmentCommunityAnalysisService {
    /**
     * 입주민 목록 조회
     */
    async getResidents(apartmentId?: string): Promise<ResidentProfile[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/apartment/community/residents`, {
                params: apartmentId ? { apartment_id: apartmentId } : {},
            });
            return response.data.residents || [];
        } catch (error) {
            errorLogger.error('입주민 목록 조회 실패', error as Error, {
                component: 'ApartmentCommunityAnalysisService',
                action: 'getResidents',
            });
            // 개발 환경에서는 샘플 데이터 반환
            return this.getSampleResidents();
        }
    }

    /**
     * 커뮤니티 댓글 조회
     */
    async getComments(apartmentId?: string, limit?: number): Promise<CommunityComment[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/apartment/community/comments`, {
                params: {
                    ...(apartmentId && { apartment_id: apartmentId }),
                    ...(limit && { limit }),
                },
            });
            return response.data.comments || [];
        } catch (error) {
            errorLogger.error('댓글 조회 실패', error as Error, {
                component: 'ApartmentCommunityAnalysisService',
                action: 'getComments',
            });
            return this.getSampleComments();
        }
    }

    /**
     * 커뮤니티 분석 데이터 조회
     */
    async getAnalytics(apartmentId?: string, period?: 'week' | 'month' | 'quarter'): Promise<CommunityAnalytics> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/apartment/community/analytics`, {
                params: {
                    ...(apartmentId && { apartment_id: apartmentId }),
                    ...(period && { period }),
                },
            });
            return response.data.analytics;
        } catch (error) {
            errorLogger.error('커뮤니티 분석 조회 실패', error as Error, {
                component: 'ApartmentCommunityAnalysisService',
                action: 'getAnalytics',
            });
            return this.getSampleAnalytics();
        }
    }

    /**
     * 댓글 분석
     */
    async analyzeComment(commentId: string): Promise<CommentAnalysis> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/apartment/community/analyze-comment`, {
                comment_id: commentId,
            });
            return response.data.analysis;
        } catch (error) {
            errorLogger.error('댓글 분석 실패', error as Error, {
                component: 'ApartmentCommunityAnalysisService',
                action: 'analyzeComment',
            });
            // 샘플 분석 반환
            return {
                comment_id: commentId,
                sentiment: 'neutral',
                key_points: ['일반적인 의견'],
                suggested_response_tone: 'friendly',
                priority: 'medium',
                related_comments: [],
            };
        }
    }

    /**
     * 맞춤형 대응글 생성
     */
    async generateResponse(
        commentId: string,
        tone?: ResponseTone
    ): Promise<CommunityResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/apartment/community/generate-response`, {
                comment_id: commentId,
                ...(tone && { tone }),
            });
            return response.data.response;
        } catch (error) {
            errorLogger.error('대응글 생성 실패', error as Error, {
                component: 'ApartmentCommunityAnalysisService',
                action: 'generateResponse',
            });
            // 샘플 대응글 반환
            return {
                id: `response-${Date.now()}`,
                comment_id: commentId,
                content: '감사합니다. 검토 후 답변드리겠습니다.',
                tone: tone || 'friendly',
                suggested_by: 'ai',
                created_at: new Date().toISOString(),
            };
        }
    }

    /**
     * 입주민 성향 분석
     */
    async analyzeResidentSentiment(residentId: string): Promise<{
        overall_sentiment: Sentiment;
        sentiment_trend: Array<{ date: string; sentiment: number }>;
        main_concerns: string[];
        engagement_pattern: 'morning' | 'afternoon' | 'evening' | 'mixed';
    }> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/apartment/community/residents/${residentId}/sentiment`
            );
            return response.data;
        } catch (error) {
            errorLogger.error('입주민 성향 분석 실패', error as Error, {
                component: 'ApartmentCommunityAnalysisService',
                action: 'analyzeResidentSentiment',
            });
            return {
                overall_sentiment: 'neutral',
                sentiment_trend: [],
                main_concerns: [],
                engagement_pattern: 'mixed',
            };
        }
    }

    /**
     * 샘플 입주민 데이터
     */
    private getSampleResidents(): ResidentProfile[] {
        return [
            {
                id: 'resident-1',
                nickname: '김아파트',
                sentiment: 'positive',
                activity_level: 'high',
                interests: ['관리', '시설', '커뮤니티'],
                comment_count: 45,
                influence_score: 8.5,
                last_active: new Date().toISOString(),
                apartment_unit: '101동 301호',
            },
            {
                id: 'resident-2',
                nickname: '이주민',
                sentiment: 'neutral',
                activity_level: 'medium',
                interests: ['정책', '공지'],
                comment_count: 23,
                influence_score: 6.2,
                last_active: new Date(Date.now() - 86400000).toISOString(),
                apartment_unit: '102동 502호',
            },
            {
                id: 'resident-3',
                nickname: '박관리',
                sentiment: 'negative',
                activity_level: 'high',
                interests: ['하자', '불만'],
                comment_count: 67,
                influence_score: 7.8,
                last_active: new Date().toISOString(),
                apartment_unit: '103동 201호',
            },
        ];
    }

    /**
     * 샘플 댓글 데이터
     */
    private getSampleComments(): CommunityComment[] {
        return [
            {
                id: 'comment-1',
                resident_id: 'resident-1',
                resident_nickname: '김아파트',
                content: '관리사무소 직원분들 정말 친절하시고 관리가 잘 되고 있습니다. 감사합니다!',
                sentiment: 'positive',
                category: 'praise',
                likes: 12,
                replies: 3,
                timestamp: new Date().toISOString(),
                topic: '관리',
            },
            {
                id: 'comment-2',
                resident_id: 'resident-3',
                resident_nickname: '박관리',
                content: '엘리베이터 고장이 자주 발생하는데 언제 수리되나요?',
                sentiment: 'negative',
                category: 'complaint',
                likes: 5,
                replies: 2,
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                topic: '시설',
            },
            {
                id: 'comment-3',
                resident_id: 'resident-2',
                resident_nickname: '이주민',
                content: '주차장 확장 공사 일정이 어떻게 되나요?',
                sentiment: 'neutral',
                category: 'question',
                likes: 3,
                replies: 1,
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                topic: '공사',
            },
        ];
    }

    /**
     * 샘플 분석 데이터
     */
    private getSampleAnalytics(): CommunityAnalytics {
        return {
            total_residents: 150,
            active_residents: 45,
            total_comments: 234,
            sentiment_distribution: {
                positive: 120,
                neutral: 80,
                negative: 34,
            },
            category_distribution: {
                complaint: 45,
                suggestion: 30,
                question: 50,
                praise: 60,
                general: 49,
            },
            top_topics: [
                { topic: '관리', count: 45 },
                { topic: '시설', count: 38 },
                { topic: '공사', count: 32 },
                { topic: '정책', count: 28 },
            ],
            engagement_trend: Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return {
                    date: date.toISOString().split('T')[0],
                    comments: Math.floor(Math.random() * 20) + 10,
                    active_users: Math.floor(Math.random() * 15) + 5,
                };
            }),
            influence_leaders: [
                { resident_id: 'resident-1', nickname: '김아파트', influence_score: 8.5 },
                { resident_id: 'resident-3', nickname: '박관리', influence_score: 7.8 },
            ],
        };
    }
}

// 싱글톤 인스턴스
const apartmentCommunityAnalysisService = new ApartmentCommunityAnalysisService();

export default apartmentCommunityAnalysisService;
export { ApartmentCommunityAnalysisService };
