import { ApiHelper } from '../utils/apiHelper';

// 범용 AI 오케스트레이터 API 서비스
export interface OrchestrationRequest {
    question: string;
    complexity?: 'low' | 'medium' | 'high' | 'very_high';
    domain?: string;
    orchestration_preference?: 'sequential' | 'parallel' | 'adaptive' | 'collaborative' | 'emergent' | 'auto';
}

export interface OrchestrationResponse {
    success: boolean;
    orchestration_result: {
        orchestration_task_id: string;
        orchestration_mode: string;
        priority: string;
        participating_systems: string[];
        successful_systems_count: number;
        total_systems_count: number;
        integrated_response: string;
        individual_results: Record<string, any>;
        special_results: Record<string, any>;
        processing_time: number;
        timestamp: string;
    };
    message: string;
}

export interface SystemHealthResponse {
    overall_health: number;
    online_systems: number;
    total_systems: number;
    system_health: Record<string, any>;
    check_timestamp: string;
}

export interface OrchestratorStatusResponse {
    total_systems: number;
    online_systems: number;
    total_tasks: number;
    completed_tasks: number;
    failed_tasks: number;
    system_performance: Record<string, any>;
    last_update: string;
}

class UniversalAIOrchestratorAPI {
    private baseUrl: string;
    private apiHelper: ApiHelper;

    constructor() {
        this.baseUrl = 'http://localhost:8019';
        this.apiHelper = new ApiHelper();
    }

    /**
     * 범용 AI 오케스트레이터를 통한 통합 처리
     */
    async orchestrateRequest(request: OrchestrationRequest): Promise<OrchestrationResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/orchestrate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('오케스트레이션 요청 오류:', error);
            throw error;
        }
    }

    /**
     * 모든 AI 시스템의 건강 상태 확인
     */
    async getSystemsHealth(): Promise<SystemHealthResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/orchestrator/systems-health`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('시스템 건강 상태 확인 오류:', error);
            throw error;
        }
    }

    /**
     * 오케스트레이터 상태 조회
     */
    async getOrchestratorStatus(): Promise<OrchestratorStatusResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/orchestrator/status`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('오케스트레이터 상태 조회 오류:', error);
            throw error;
        }
    }

    /**
     * 오케스트레이션 작업 조회
     */
    async getOrchestrationTasks() {
        try {
            const response = await fetch(`${this.baseUrl}/api/orchestrator/tasks`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('오케스트레이션 작업 조회 오류:', error);
            throw error;
        }
    }

    /**
     * 서버 연결 테스트
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/`);
            return response.ok;
        } catch (error) {
            console.error('서버 연결 실패:', error);
            return false;
        }
    }

    /**
     * 간편한 메시지 전송 (자동 복잡도 및 도메인 감지)
     */
    async sendMessage(message: string, options?: {
        complexity?: 'low' | 'medium' | 'high' | 'very_high';
        domain?: string;
        orchestration_mode?: 'sequential' | 'parallel' | 'adaptive' | 'collaborative' | 'emergent' | 'auto';
    }): Promise<OrchestrationResponse> {
        // 자동 복잡도 감지
        const complexity = options?.complexity || this.detectComplexity(message);

        // 자동 도메인 감지
        const domain = options?.domain || this.detectDomain(message);

        // 자동 오케스트레이션 모드 결정
        const orchestration_preference = options?.orchestration_mode || this.detectOrchestrationMode(message, complexity);

        return this.orchestrateRequest({
            question: message,
            complexity,
            domain,
            orchestration_preference
        });
    }

    /**
     * 메시지 복잡도 자동 감지
     */
    private detectComplexity(message: string): 'low' | 'medium' | 'high' | 'very_high' {
        const highComplexityKeywords = [
            '양자', '의식', '창의성', '지혜', '통합', '초월', '진화', '홀로그래픽',
            '다차원', '복잡', '종합', '분석', '비교', '연구', '탐구'
        ];

        const veryHighComplexityKeywords = [
            '완전한 통합', '모든 시스템', '종합적', '포괄적', '다차원적',
            '양자 역학과 의식', '홀로그래픽 정보 처리'
        ];

        const messageLower = message.toLowerCase();

        if (veryHighComplexityKeywords.some(keyword => messageLower.includes(keyword))) {
            return 'very_high';
        }

        if (highComplexityKeywords.some(keyword => messageLower.includes(keyword))) {
            return 'high';
        }

        if (message.length > 100) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * 메시지 도메인 자동 감지
     */
    private detectDomain(message: string): string {
        const domainKeywords = {
            'politics': ['정치', '정부', '국회', '선거', '정책', '민주주의'],
            'economy': ['경제', '경기', '시장', '투자', 'GDP', '인플레이션'],
            'society': ['사회', '문화', '교육', '복지', '불평등', '다양성'],
            'technology': ['기술', 'AI', '인공지능', '디지털', '혁신', '스마트'],
            'history': ['역사', '과거', '전통', '유산', '문화재', '고대'],
            'philosophy': ['철학', '윤리', '가치', '의미', '존재', '진리'],
            'consciousness': ['의식', '창의성', '지혜', '자기인식', '메타인지'],
            'quantum': ['양자', '중첩', '얽힘', '일관성', '양자역학'],
            'holographic': ['홀로그래픽', '다차원', '간섭', '회절', '공명']
        };

        const messageLower = message.toLowerCase();

        for (const [domain, keywords] of Object.entries(domainKeywords)) {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                return domain;
            }
        }

        return 'general';
    }

    /**
     * 오케스트레이션 모드 자동 결정
     */
    private detectOrchestrationMode(message: string, complexity: string): 'sequential' | 'parallel' | 'adaptive' | 'collaborative' | 'emergent' | 'auto' {
        if (complexity === 'very_high') {
            return 'collaborative';
        }

        if (complexity === 'high') {
            return 'adaptive';
        }

        if (message.includes('통합') || message.includes('종합')) {
            return 'parallel';
        }

        if (message.includes('양자') || message.includes('의식') || message.includes('홀로그래픽')) {
            return 'collaborative';
        }

        return 'auto';
    }
}

// 싱글톤 인스턴스 생성
export const universalAIOrchestratorAPI = new UniversalAIOrchestratorAPI();

// 편의 함수들
export const orchestrateAI = {
    /**
     * 간편한 AI 오케스트레이션
     */
    async ask(question: string, options?: {
        complexity?: 'low' | 'medium' | 'high' | 'very_high';
        domain?: string;
        mode?: 'sequential' | 'parallel' | 'adaptive' | 'collaborative' | 'emergent' | 'auto';
    }) {
        return universalAIOrchestratorAPI.sendMessage(question, options);
    },

    /**
     * 시스템 상태 확인
     */
    async getStatus() {
        return universalAIOrchestratorAPI.getOrchestratorStatus();
    },

    /**
     * 시스템 건강 상태 확인
     */
    async getHealth() {
        return universalAIOrchestratorAPI.getSystemsHealth();
    },

    /**
     * 연결 테스트
     */
    async testConnection() {
        return universalAIOrchestratorAPI.testConnection();
    }
};

export default universalAIOrchestratorAPI;
