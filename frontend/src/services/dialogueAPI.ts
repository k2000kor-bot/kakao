import {
    API_ANALYZE_CONTEXT_PATH,
    API_DIALOGUE_TYPES_PATH,
    API_GENERATE_DIALOGUE_PATH,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';
import axios, { AxiosResponse } from 'axios';
import { errorLogger, toError } from '../utils/errorLogger';

// 기본 대화 유형 정의
export const DEFAULT_DIALOGUE_TYPES = [
    { id: 'auto', name: 'AI 자동', description: 'AI가 최적의 형식을 선택합니다', category: 'auto', effectiveness_score: 95 },
    { id: 'refutation', name: '반박', description: '상대 주장의 오류나 약점을 지적하며 부정', category: 'opposition', effectiveness_score: 85 },
    { id: 'counter_question', name: '반문', description: '상대의 주장에 질문을 던져 되묻는 방식', category: 'inquiry', effectiveness_score: 80 },
    { id: 'opposition', name: '반대', description: '명확하게 의견을 거부하거나 부정', category: 'opposition', effectiveness_score: 75 },
    { id: 'agreement', name: '동조', description: '상대 의견에 동의하거나 지지', category: 'support', effectiveness_score: 90 },
    { id: 'defense', name: '응호', description: '특정 입장이나 대상을 적극적으로 옹호', category: 'support', effectiveness_score: 82 },
    { id: 'criticism', name: '비난', description: '강하게 부정적 평가나 공격', category: 'attack', effectiveness_score: 70 },
    { id: 'neutral', name: '중립', description: '감정이나 입장 없이 상황만 설명', category: 'objective', effectiveness_score: 88 },
    { id: 'avoidance', name: '회피', description: '명확한 입장을 회피하거나 대화를 흐림', category: 'evasive', effectiveness_score: 65 },
    { id: 'sarcasm', name: '풍자', description: '비꼬거나 간접적으로 비판', category: 'indirect', effectiveness_score: 72 },
    { id: 'empathy', name: '공감', description: '상대 감정을 이해하고 수용', category: 'emotional', effectiveness_score: 93 },
    { id: 'suggestion', name: '제안', description: '해결책이나 대안을 제시', category: 'solution', effectiveness_score: 87 },
    { id: 'questioning', name: '질문', description: '정보를 얻거나 의문을 던짐', category: 'inquiry', effectiveness_score: 85 },
    { id: 'ignoring', name: '무시', description: '반응하지 않거나 대화를 거부', category: 'dismissive', effectiveness_score: 40 },
    { id: 'emphasis', name: '강조', description: '특정 사실이나 의견을 부각', category: 'assertive', effectiveness_score: 83 },
    { id: 'speculation', name: '추측', description: '확실하지 않은 의견을 조심스럽게 제시', category: 'tentative', effectiveness_score: 68 },
    { id: 'emotional_appeal', name: '감정적 호소', description: '논리보다 감정에 기반해 설득', category: 'emotional', effectiveness_score: 78 },
    { id: 'mockery', name: '조롱', description: '상대를 비웃거나 깎아내림', category: 'attack', effectiveness_score: 60 },
    { id: 'directive', name: '명령', description: '지시하거나 강제하는 어투', category: 'command', effectiveness_score: 75 },
    { id: 'coercion', name: '강압', description: '위협, 압박을 통해 상대를 설득', category: 'pressure', effectiveness_score: 55 },
    { id: 'forcefulness', name: '강제', description: '선택권을 주지 않고 특정 행동을 요구', category: 'pressure', effectiveness_score: 50 },
    { id: 'brainwashing', name: '세뇌', description: '장기간 반복·왜곡으로 판단력을 마비시킴', category: 'manipulation', effectiveness_score: 35 },
    { id: 'gaslighting', name: '가스라이팅', description: '상대의 현실 인식을 부정하거나 조작해 혼란을 유도', category: 'manipulation', effectiveness_score: 25 }
];

export const CATEGORY_NAMES = {
    auto: 'AI 자동',
    opposition: '반대',
    support: '지지',
    attack: '공격',
    objective: '객관적',
    evasive: '회피',
    indirect: '간접',
    emotional: '감정적',
    solution: '해결',
    inquiry: '질문',
    dismissive: '무시',
    assertive: '주장',
    tentative: '추측',
    command: '명령',
    pressure: '압박',
    manipulation: '조작'
};

export interface DialogueType {
    id: string;
    name: string;
    description: string;
    category: string;
    effectiveness_score: number;
}

export interface DialogueRequest {
    input_message: string;
    target_dialogue_types: string[];
    intensity_level: number;
    relationship_dynamic: string;
    conversation_context: string[];
    rewrite_mode?: boolean;
    original_text?: string;
    selected_message?: string;
}

export interface AIResponse {
    id: string;
    content: string;
    strategy: string;
    quality: {
        relevance: number;
        accuracy: number;
        empathy: number;
        clarity: number;
        timeliness: number;
        overall: number;
    };
    feedback: string;
    timestamp: string;
    reliability: number;
    message: string;
    confidence: number;
    status: string;
}

export interface ContextAnalysis {
    sentiment: string;
    urgency: number;
    topic: string;
    participants: string[];
    relationship_type: string;
}

export interface GeneratedMessage {
    id: string;
    content: string;
    messageFormat: string;
    confidence: number;
    reasoning: string;
    timestamp: string;
}

// 실제 메시지 생성 로직
const generateMessage = (request: DialogueRequest): GeneratedMessage[] => {
    const { input_message, target_dialogue_types, rewrite_mode, original_text, selected_message } = request;

    const messages: GeneratedMessage[] = [];

    // 선택된 메시지 형식들에 대해 각각 메시지 생성
    const formats = target_dialogue_types.includes('auto') ? ['agreement', 'suggestion', 'empathy'] : target_dialogue_types;

    formats.forEach((formatId, index) => {
        const format = DEFAULT_DIALOGUE_TYPES.find(f => f.id === formatId);
        if (!format) return;

        let content = '';

        if (rewrite_mode && original_text) {
            // 리라이팅 모드
            content = generateRewriteContent(original_text, format);
        } else {
            // 새 메시지 생성 모드
            content = generateNewContent(input_message, format, selected_message);
        }

        messages.push({
            id: `msg_${Date.now()}_${index}`,
            content,
            messageFormat: format.name,
            confidence: Math.floor(Math.random() * 20) + 80, // 80-99% 신뢰도
            reasoning: `${format.name} 형식으로 ${rewrite_mode ? '리라이팅' : '생성'}했습니다. ${format.description}`,
            timestamp: new Date().toISOString()
        });
    });

    return messages;
};

// 리라이팅용 콘텐츠 생성
const generateRewriteContent = (originalText: string, format: DialogueType): string => {
    const templates = {
        refutation: `${originalText}라고 하셨는데, 사실 이 부분에서 다른 관점을 제시해드리고 싶습니다. 실제로는...`,
        agreement: `말씀하신 내용에 완전히 동의합니다. "${originalText}" 이 부분이 특히 공감됩니다.`,
        empathy: `"${originalText}" 라고 말씀해주셔서 마음이 와닿습니다. 그런 상황이셨다면 정말 힘드셨을 것 같아요.`,
        suggestion: `말씀하신 상황을 보니 이런 방법은 어떨까요? "${originalText}" 이 부분을 개선해보시면...`,
        questioning: `"${originalText}" 라고 하셨는데, 혹시 구체적으로 어떤 부분이 그렇게 느껴지셨나요?`,
        neutral: `말씀하신 내용을 정리해보면 "${originalText}" 라는 상황이군요. 이에 대해 객관적으로 살펴보면...`,
        emphasis: `특히 "${originalText}" 이 부분이 정말 중요한 포인트라고 생각합니다!`,
        criticism: `"${originalText}" 이런 접근 방식은 문제가 있어 보입니다. 다시 생각해보시는 게 좋을 것 같아요.`,
        sarcasm: `아, "${originalText}" 정말 훌륭한 생각이네요. (웃음) 하지만 현실적으로는...`,
        directive: `"${originalText}" 이 상황에서는 반드시 이렇게 해야 합니다.`
    };

    return templates[format.id as keyof typeof templates] || `${format.name} 형식으로 다시 표현하면: ${originalText}을 바탕으로 새로운 관점을 제시합니다.`;
};

// 새 메시지 생성
const generateNewContent = (inputMessage: string, format: DialogueType, selectedMessage?: string): string => {
    const context = selectedMessage ? `"${selectedMessage}"에 대한 응답으로` : '';

    const templates = {
        agreement: `${context} 완전히 동의합니다. ${inputMessage}에 대해 저도 같은 생각입니다. 특히 이런 부분이 인상적이네요.`,
        empathy: `${context} 정말 공감이 됩니다. ${inputMessage}에서 말씀하신 마음이 충분히 이해가 가요. 그런 상황에서는 누구나 그렇게 느낄 수 있을 것 같아요.`,
        suggestion: `${context} ${inputMessage}에 관해서 이런 방법은 어떨까요? 제가 경험해본 바로는 이런 접근이 도움이 될 수 있을 것 같습니다.`,
        questioning: `${context} ${inputMessage}에 대해 궁금한 점이 있는데요, 혹시 더 구체적으로 설명해주실 수 있나요?`,
        refutation: `${context} ${inputMessage}에서 말씀하신 부분에 대해 다른 의견이 있습니다. 이런 관점에서 보면 조금 다를 수 있을 것 같아요.`,
        neutral: `${context} ${inputMessage}에 관련해서 객관적으로 정리해보면 이런 상황인 것 같습니다. 사실들을 나열해보면...`,
        emphasis: `${context} ${inputMessage}에서 가장 중요한 포인트는 바로 이것입니다! 이 부분을 놓치면 안 되겠어요.`,
        criticism: `${context} ${inputMessage}에 대해서는 좀 더 신중하게 접근해야 할 것 같습니다. 이런 방식으로는 문제가 있을 수 있어요.`,
        directive: `${context} ${inputMessage}와 관련해서는 반드시 이렇게 해야 합니다. 다른 선택의 여지는 없어 보이네요.`,
        speculation: `${context} ${inputMessage}에 대해서는... 아마도 이런 상황이 아닐까 싶습니다. 확실하지는 않지만 추측해보면...`
    };

    return templates[format.id as keyof typeof templates] || `${format.name} 형식으로 ${inputMessage}에 대해 응답드립니다. ${format.description}를 적용한 메시지입니다.`;
};

// 유틸리티 함수들
export const utils = {
    formatTime: (ms: number | string) => {
        if (typeof ms === 'string') {
            // ISO 문자열을 처리
            const date = new Date(ms);
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        }

        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}시간 ${minutes % 60}분`;
        if (minutes > 0) return `${minutes}분 ${seconds % 60}초`;
        return `${seconds}초`;
    },

    formatDate: (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatEffectiveness: (score: number) => {
        const percentage = Math.round(score * 100);
        return `${percentage}%`;
    },

    formatNumber: (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    downloadFile: (data: unknown, filename: string, format: string = 'json') => {
        let content: string;
        let mimeType: string;

        if (format === 'json') {
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
        } else if (format === 'csv') {
            // 간단한 CSV 변환
            if (Array.isArray(data)) {
                const firstRow = data[0] as Record<string, unknown> | undefined;
                const headers = Object.keys(firstRow ?? {});
                const csvContent = [
                    headers.join(','),
                    ...data.map((row: Record<string, unknown>) => headers.map(header =>
                        JSON.stringify((row[header] ?? ''))
                    ).join(','))
                ].join('\n');
                content = csvContent;
            } else {
                content = JSON.stringify(data, null, 2);
            }
            mimeType = 'text/csv';
        } else {
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.endsWith(`.${format}`) ? filename : `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    generateId: () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

    getCategoryColor: (category: string) => {
        const map: Record<string, string> = {
            auto: 'bw-badge bw-badge-secondary',
            opposition: 'bw-badge bw-badge-error',
            support: 'bw-badge bw-badge-success',
            attack: 'bw-badge bw-badge-warning',
            objective: 'bw-badge',
            evasive: 'bw-badge bw-badge-warning',
            indirect: 'bw-badge bw-badge-secondary',
            emotional: 'bw-badge bw-badge-info',
            solution: 'bw-badge bw-badge-success',
            inquiry: 'bw-badge bw-badge-info',
            dismissive: 'bw-badge',
            assertive: 'bw-badge bw-badge-info',
            tentative: 'bw-badge bw-badge-warning',
            command: 'bw-badge bw-badge-secondary',
            pressure: 'bw-badge bw-badge-error',
            manipulation: 'bw-badge bw-badge-warning',
        };
        return map[category] || 'bw-badge';
    },

    getEffectivenessColor: (score: number) => {
        if (score >= 85) return 'bw-badge bw-badge-success';
        if (score >= 70) return 'bw-badge bw-badge-info';
        if (score >= 55) return 'bw-badge bw-badge-warning';
        return 'bw-badge bw-badge-error';
    },
};

// DialogueAPIService 클래스
export class DialogueAPIService {
    private baseURL: string;

    constructor() {
        this.baseURL = resolveApiBaseUrl();

        // Axios 인터셉터 설정
        axios.interceptors.request.use((config) => {
            config.timeout = 30000; // 30초 타임아웃
            return config;
        });

        axios.interceptors.response.use(
            (response) => response,
            (error: unknown) => {
                const err = toError(error);
                errorLogger.warn('API 호출 실패, 로컬 모드로 전환', {
                    component: 'dialogueAPI',
                    action: 'axiosInterceptor',
                    error: err.message,
                });
                return Promise.reject(error);
            }
        );
    }

    async getDialogueTypes(): Promise<{ dialogueTypes: DialogueType[], categories: typeof CATEGORY_NAMES }> {
        try {
            const response: AxiosResponse = await axios.get(joinApiHealthCheckUrl(this.baseURL, API_DIALOGUE_TYPES_PATH));
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.warn('백엔드 연결 실패, 기본 데이터 사용', {
                component: 'dialogueAPI',
                action: 'getDialogueTypes',
                error: err.message,
            });
            return {
                dialogueTypes: DEFAULT_DIALOGUE_TYPES,
                categories: CATEGORY_NAMES
            };
        }
    }

    async generateDialogue(request: DialogueRequest): Promise<GeneratedMessage[]> {
        try {
            const response: AxiosResponse = await axios.post(
                joinApiHealthCheckUrl(this.baseURL, API_GENERATE_DIALOGUE_PATH),
                request,
            );
            return response.data.messages;
        } catch (error) {
            const err = toError(error);
            errorLogger.warn('백엔드 연결 실패, 로컬 생성 모드 사용', {
                component: 'dialogueAPI',
                action: 'generateDialogue',
                error: err.message,
            });
            // 로컬에서 메시지 생성
            return generateMessage(request);
        }
    }

    async analyzeContext(conversationHistory: string[]): Promise<ContextAnalysis> {
        try {
            const response: AxiosResponse = await axios.post(joinApiHealthCheckUrl(this.baseURL, API_ANALYZE_CONTEXT_PATH), {
                conversation_history: conversationHistory
            });
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.warn('컨텍스트 분석 실패, 기본 분석 사용', {
                component: 'dialogueAPI',
                action: 'analyzeContext',
                conversationHistoryLength: conversationHistory.length,
                error: err.message,
            });
            return {
                sentiment: 'neutral',
                urgency: 5,
                topic: '일반 대화',
                participants: ['사용자', 'AI'],
                relationship_type: 'casual'
            };
        }
    }
}

// 기본 인스턴스 생성 및 내보내기
export const dialogueAPI = new DialogueAPIService();
export default dialogueAPI; 