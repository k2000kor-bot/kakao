/**
 * 시공사 선정을 위한 고도화된 분석 서비스
 * 비교집 자료 기반 의사결정 지원
 */

export interface CompanyData {
    company_id: string;
    company_name: string;
    technical_specs: Record<string, any>;
    financial_data: Record<string, any>;
    project_history: ProjectHistory[];
    certifications: string[];
    evaluation_scores: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    risk_factors: string[];
    competitive_advantages: string[];
}

export interface ProjectHistory {
    project_name: string;
    project_type: string;
    completion_year: number;
    budget: number;
    duration: number;
    success_rate: number;
    client_satisfaction: number;
}

export interface DecisionCriteria {
    project_type: string;
    budget_range: [number, number];
    timeline: number;
    priority_weights: Record<string, number>;
    mandatory_requirements: string[];
    preferred_features: string[];
    risk_tolerance: 'low' | 'medium' | 'high';
}

export interface EvaluationResult {
    weighted_scores: Record<string, number>;
    qualified_companies: string[];
    risk_assessments: Record<string, RiskAssessment>;
    recommendation_logic: RecommendationLogic;
    decision_rationale: string;
}

export interface RiskAssessment {
    risk_level: 'low' | 'medium' | 'high';
    risk_factors: string[];
    mitigation_strategies: string[];
    overall_risk_score: number;
}

export interface RecommendationLogic {
    ranking: Array<{ company_id: string; score: number }>;
    primary_recommendation: string | null;
    alternative_options: string[];
    decision_factors: string[];
    comparative_analysis: Record<string, string>;
}

export interface GeneratedMessage {
    message_id: string;
    timestamp: string;
    message_type: 'recommendation' | 'comparison' | 'risk_analysis';
    generated_content: {
        title: string;
        content: string;
        summary: string;
        confidence_level?: string;
        comparison_matrix?: boolean;
        risk_distribution?: Record<string, number>;
    };
    decision_logic: EvaluationResult;
}

export interface KnowledgeBase {
    evaluation_guidelines: Record<string, {
        weight_range: [number, number];
        key_indicators: string[];
        evaluation_logic: string;
    }>;
    decision_patterns: Record<string, {
        primary_criteria: string[];
        risk_considerations: string[];
        message_template: string;
    }>;
}

class ConstructionAnalyticsService {
    private baseUrl = process.env.NODE_ENV === 'development' ? '' : 'http://localhost:8002';
    private companiesData: Record<string, CompanyData> = {};
    private evaluationResult: EvaluationResult | null = null;
    private knowledgeBase: KnowledgeBase | null = null;

    /**
     * 비교집 자료 업로드 및 처리
     */
    async uploadComparisonData(file: File, projectType: string): Promise<{
        status: string;
        message: string;
        companies: string[];
        processed_data: Record<string, CompanyData>;
    }> {
        try {
            console.log('Uploading to:', `${this.baseUrl}/api/upload_comparison_data`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('project_type', projectType);

            const response = await fetch(`${this.baseUrl}/api/upload_comparison_data`, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'omit',
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Upload result:', result);

            // 처리된 데이터 저장
            this.companiesData = result.processed_data;

            return result;
        } catch (error) {
            console.error('Error uploading comparison data:', error);
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('네트워크 연결 오류: 백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
            }
            throw error;
        }
    }

    /**
     * 시공사 분석 및 의사결정 논리 생성
     */
    async analyzeCompanies(criteria: DecisionCriteria): Promise<{
        status: string;
        analysis_result: EvaluationResult;
        criteria_applied: DecisionCriteria;
        companies_analyzed: number;
    }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/analyze_companies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(criteria),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // 분석 결과 저장
            this.evaluationResult = result.analysis_result;

            return result;
        } catch (error) {
            console.error('Error analyzing companies:', error);
            throw error;
        }
    }

    /**
     * 일관된 논리 기반 메시지 생성
     */
    async generateMessage(
        messageType: 'recommendation' | 'comparison' | 'risk_analysis',
        includeDetails: boolean = true,
        targetAudience: 'management' | 'technical' | 'general' = 'management'
    ): Promise<{
        status: string;
        message_data: GeneratedMessage;
        generation_info: {
            message_type: string;
            target_audience: string;
            include_details: boolean;
            timestamp: string;
        };
    }> {
        try {
            const requestData = {
                message_type: messageType,
                include_details: includeDetails,
                target_audience: targetAudience,
            };

            const response = await fetch(`${this.baseUrl}/api/generate_message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error generating message:', error);
            throw error;
        }
    }

    /**
     * 평가 기준 목록 조회
     */
    async getEvaluationCriteria(): Promise<{
        criteria: Record<string, {
            name: string;
            description: string;
            weight_range: [number, number];
            data_type: string;
        }>;
        total_criteria: number;
        weight_total: number;
    }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/evaluation_criteria`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching evaluation criteria:', error);
            throw error;
        }
    }

    /**
     * 지식베이스 정보 조회
     */
    async getKnowledgeBase(): Promise<{
        knowledge_base: KnowledgeBase;
        last_updated: string;
        version: string;
    }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/knowledge_base`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.knowledgeBase = result.knowledge_base;

            return result;
        } catch (error) {
            console.error('Error fetching knowledge base:', error);
            throw error;
        }
    }

    /**
     * 의사결정 결과 저장
     */
    async saveDecision(decisionData: any): Promise<{
        status: string;
        message: string;
        decision_id: number;
        timestamp: string;
    }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/save_decision`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(decisionData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving decision:', error);
            throw error;
        }
    }

    /**
     * 의사결정 이력 조회
     */
    async getDecisionHistory(): Promise<{
        history: any[];
        total_decisions: number;
    }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/decision_history`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching decision history:', error);
            throw error;
        }
    }

    /**
     * 시공사별 상세 분석
     */
    getCompanyDetailAnalysis(companyId: string): {
        basic_info: Partial<CompanyData>;
        performance_metrics: Record<string, number>;
        strength_analysis: string[];
        risk_analysis: string[];
        recommendation: string;
    } | null {
        const company = this.companiesData[companyId];
        if (!company) return null;

        const performanceMetrics = this.calculatePerformanceMetrics(company);
        const recommendation = this.generateCompanyRecommendation(company, performanceMetrics);

        return {
            basic_info: {
                company_name: company.company_name,
                certifications: company.certifications,
                project_history: company.project_history,
            },
            performance_metrics: performanceMetrics,
            strength_analysis: company.strengths,
            risk_analysis: company.risk_factors,
            recommendation,
        };
    }

    /**
     * 성과 지표 계산
     */
    private calculatePerformanceMetrics(company: CompanyData): Record<string, number> {
        const metrics: Record<string, number> = {};

        // 기본 평가 점수
        Object.entries(company.evaluation_scores).forEach(([key, value]) => {
            metrics[key] = value;
        });

        // 프로젝트 성공률 계산
        if (company.project_history.length > 0) {
            const avgSuccessRate = company.project_history.reduce(
                (sum, project) => sum + (project.success_rate || 0), 0
            ) / company.project_history.length;
            metrics['프로젝트성공률'] = avgSuccessRate;

            const avgClientSatisfaction = company.project_history.reduce(
                (sum, project) => sum + (project.client_satisfaction || 0), 0
            ) / company.project_history.length;
            metrics['고객만족도'] = avgClientSatisfaction;
        }

        // 위험 점수 (낮을수록 좋음)
        metrics['위험점수'] = Math.max(0, 100 - (company.risk_factors.length * 20));

        // 경쟁력 점수
        metrics['경쟁력점수'] = company.competitive_advantages.length * 10;

        return metrics;
    }

    /**
     * 회사별 추천사항 생성
     */
    private generateCompanyRecommendation(
        company: CompanyData,
        metrics: Record<string, number>
    ): string {
        const avgScore = Object.values(company.evaluation_scores).reduce(
            (sum, score) => sum + score, 0
        ) / Object.keys(company.evaluation_scores).length;

        const riskLevel = company.risk_factors.length;
        const strengthCount = company.strengths.length;

        if (avgScore >= 80 && riskLevel <= 2 && strengthCount >= 3) {
            return `${company.company_name}는 높은 종합점수(${avgScore.toFixed(1)}점)와 낮은 위험도를 보유한 최우선 추천 업체입니다. 특히 ${company.strengths.slice(0, 2).join(', ')} 영역에서 우수한 성과를 보이고 있습니다.`;
        } else if (avgScore >= 70 && riskLevel <= 4) {
            return `${company.company_name}는 양호한 수준의 성과(${avgScore.toFixed(1)}점)를 보이는 검토 대상 업체입니다. ${company.weaknesses.length > 0 ? company.weaknesses[0] + ' 영역의 보완이 필요하나' : ''} 전반적으로 안정적인 선택지입니다.`;
        } else {
            return `${company.company_name}는 추가 검토가 필요한 업체입니다. ${company.risk_factors.slice(0, 2).join(', ')} 등의 위험요소를 신중히 검토한 후 선택하시기 바랍니다.`;
        }
    }

    /**
     * 비교 매트릭스 생성
     */
    generateComparisonMatrix(): {
        companies: string[];
        criteria: string[];
        matrix: number[][];
        rankings: Array<{ company_id: string; total_score: number; rank: number }>;
    } | null {
        if (!this.evaluationResult || Object.keys(this.companiesData).length === 0) {
            return null;
        }

        const companies = Object.keys(this.companiesData);
        const criteria = Object.keys(this.companiesData[companies[0]]?.evaluation_scores || {});

        const matrix = companies.map(companyId => {
            const company = this.companiesData[companyId];
            return criteria.map(criterion => company.evaluation_scores[criterion] || 0);
        });

        const rankings = this.evaluationResult.weighted_scores ?
            Object.entries(this.evaluationResult.weighted_scores)
                .map(([company_id, score], index) => ({
                    company_id,
                    total_score: score,
                    rank: index + 1
                }))
                .sort((a, b) => b.total_score - a.total_score)
                .map((item, index) => ({ ...item, rank: index + 1 }))
            : [];

        return {
            companies,
            criteria,
            matrix,
            rankings
        };
    }

    /**
     * 데이터 초기화
     */
    async resetData(): Promise<{ status: string; message: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/reset_data`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 로컬 데이터도 초기화
            this.companiesData = {};
            this.evaluationResult = null;
            this.knowledgeBase = null;

            return await response.json();
        } catch (error) {
            console.error('Error resetting data:', error);
            throw error;
        }
    }

    /**
     * 현재 상태 조회
     */
    getCurrentState(): {
        has_companies_data: boolean;
        companies_count: number;
        has_evaluation_result: boolean;
        has_knowledge_base: boolean;
    } {
        return {
            has_companies_data: Object.keys(this.companiesData).length > 0,
            companies_count: Object.keys(this.companiesData).length,
            has_evaluation_result: this.evaluationResult !== null,
            has_knowledge_base: this.knowledgeBase !== null,
        };
    }

    /**
     * 로컬 데이터 접근자들
     */
    getCompaniesData(): Record<string, CompanyData> {
        return this.companiesData;
    }

    getEvaluationResult(): EvaluationResult | null {
        return this.evaluationResult;
    }

    getKnowledgeBaseData(): KnowledgeBase | null {
        return this.knowledgeBase;
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const constructionAnalyticsService = new ConstructionAnalyticsService();
export default constructionAnalyticsService; 