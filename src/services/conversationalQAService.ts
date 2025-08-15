import unifiedAPI, { ConversationalQARequest } from './unifiedAPI';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export interface QuestionAnalysis {
    question_type: string;
    keywords: string[];
    entities: string[];
    intent: string;
    confidence: number;
}

export interface AnswerSource {
    source_id: string;
    source_type: string;
    content: string;
    relevance_score: number;
    confidence: number;
}

export interface ConversationalQAResult {
    question: string;
    answer: string;
    confidence: number;
    question_analysis: QuestionAnalysis;
    sources: AnswerSource[];
    follow_up_questions: string[];
    related_topics: string[];
    timestamp: string;
}

class ConversationalQAService {
    async askQuestion(question: string, context: any = {}): Promise<ConversationalQAResult> {
        try {
            const request: ConversationalQARequest = {
                question,
                context: JSON.stringify({
                    project_id: context.project_id || 'gaeposung_project',
                    user_id: context.user_id || 'default_user',
                    session_id: context.session_id || 'default_session',
                    conversation_history: context.conversation_history || [],
                    uploaded_files: context.uploaded_files || []
                })
            };

            const response = await unifiedAPI.conversationalQA(request);

            if (response.success && response.data) {
                return response.data as ConversationalQAResult;
            } else {
                throw new Error(response.error || '대화형 QA 분석에 실패했습니다.');
            }
        } catch (error) {
            console.error('대화형 QA 서비스 오류:', error);
            throw error;
        }
    }

    async addKnowledge(topic: string, content: string, sourceType: string = 'manual',
        relevanceScore: number = 0.8, confidence: number = 0.9): Promise<void> {
        try {
            const response = await axios.post(`${API_BASE_URL}/conversational/knowledge`, {
                topic,
                content,
                source_type: sourceType,
                relevance_score: relevanceScore,
                confidence
            });

            if (!response.data.success) {
                throw new Error(response.data.error || '지식 베이스 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('지식 베이스 추가 오류:', error);
            throw error;
        }
    }

    formatConversationalResponse(result: ConversationalQAResult): string {
        let formattedResponse = '';

        // 답변 (가장 중요한 부분을 먼저 표시)
        formattedResponse += `${result.answer}\n\n`;

        // 질문 분석 정보 (간단하게)
        if (result.question_analysis.confidence > 0.5) {
            formattedResponse += `---\n\n`;
            formattedResponse += `**분석 정보**: ${this.getQuestionTypeLabel(result.question_analysis.question_type)} | 신뢰도: ${(result.question_analysis.confidence * 100).toFixed(0)}%\n\n`;
        }

        // 후속 질문 (사용자가 바로 사용할 수 있도록)
        if (result.follow_up_questions.length > 0) {
            formattedResponse += `**추천 질문**:\n`;
            result.follow_up_questions.slice(0, 3).forEach((question, index) => {
                formattedResponse += `• ${question}\n`;
            });
            formattedResponse += '\n';
        }

        // 소스 정보 (간단하게)
        if (result.sources.length > 0) {
            formattedResponse += `**참고 소스**: ${result.sources.length}개 (신뢰도: ${(result.confidence * 100).toFixed(0)}%)\n\n`;
        }

        return formattedResponse;
    }

    getQuestionTypeLabel(questionType: string): string {
        const labels: { [key: string]: string } = {
            'factual': '사실 확인',
            'analytical': '분석 요청',
            'comparative': '비교 요청',
            'predictive': '예측 요청',
            'opinion': '의견 요청'
        };
        return labels[questionType] || questionType;
    }

    getIntentLabel(intent: string): string {
        const labels: { [key: string]: string } = {
            'information_seeking': '정보 탐색',
            'process_inquiry': '과정 문의',
            'timeline_inquiry': '일정 문의',
            'location_inquiry': '위치 문의',
            'reason_inquiry': '이유 문의',
            'analysis_request': '분석 요청',
            'comparison_request': '비교 요청',
            'prediction_request': '예측 요청',
            'general_inquiry': '일반 문의'
        };
        return labels[intent] || intent;
    }

    getConversationalQADescription(): string {
        return `💬 **대화형 질문-답변 시스템**
        
이 모드는 사용자의 질문을 지능적으로 분석하고 관련 정보를 자동으로 찾아 답변하는 대화형 시스템입니다.

**주요 기능:**
- 🧠 질문 유형 자동 분류 (사실/분석/비교/예측/의견)
- 🔍 키워드 및 엔티티 자동 추출
- 📚 다중 소스 검색 (데이터베이스/웹/문서/대화기록)
- 💡 지능형 답변 생성
- 🔄 후속 질문 자동 제안
- 🔗 관련 주제 추천

자연스러운 대화를 통해 원하는 정보를 쉽게 찾을 수 있습니다.`;
    }
}

const conversationalQAService = new ConversationalQAService();
export default conversationalQAService;
