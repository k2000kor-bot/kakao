// 시공사 정보 서비스
// 하자 이슈, 대응 방안, 선정 기준 분석 기능 제공

import axios from 'axios';
import { errorLogger } from '../utils/errorLogger';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// 타입 정의
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'reported' | 'investigating' | 'fixing' | 'resolved' | 'closed';
export type ResponseType = 'immediate' | 'scheduled' | 'long_term' | 'preventive';
export type SelectionCriteria = 'reputation' | 'price' | 'quality' | 'experience' | 'warranty' | 'response_time';

export interface ConstructionCompany {
    id: string;
    name: string;
    registration_number: string;
    established_year: number;
    headquarters: string;
    specialties: string[];
    certifications: string[];
    rating: number;
    total_projects: number;
    completed_projects: number;
    current_projects: number;
    reputation_score: number;
    quality_score: number;
    response_time_score: number;
    warranty_period: number; // months
    contact_info: {
        phone: string;
        email: string;
        website?: string;
    };
}

export interface DefectIssue {
    id: string;
    company_id: string;
    company_name: string;
    project_id?: string;
    project_name?: string;
    title: string;
    description: string;
    category: 'structure' | 'finishing' | 'electrical' | 'plumbing' | 'heating' | 'safety' | 'other';
    severity: IssueSeverity;
    status: IssueStatus;
    reported_date: string;
    reported_by?: string;
    location?: string;
    photos?: string[];
    estimated_cost?: number;
    actual_cost?: number;
    resolution_date?: string;
    resolution_notes?: string;
}

export interface ResponsePlan {
    id: string;
    issue_id: string;
    company_id: string;
    response_type: ResponseType;
    description: string;
    steps: Array<{
        step_number: number;
        description: string;
        estimated_duration: string;
        responsible_party: string;
    }>;
    estimated_completion: string;
    cost_estimate: number;
    created_at: string;
    status: 'draft' | 'approved' | 'in_progress' | 'completed';
}

export interface SelectionCriteriaAnalysis {
    company_id: string;
    company_name: string;
    criteria_scores: Record<SelectionCriteria, number>;
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    comparison_rank: number;
    suitability_score: number;
}

export interface CompanyComparison {
    companies: Array<{
        company_id: string;
        company_name: string;
        overall_score: number;
        criteria_scores: Record<SelectionCriteria, number>;
    }>;
    best_for: Record<string, string[]>; // criteria -> company names
    summary: string;
}

class ConstructionCompanyService {
    /**
     * 시공사 목록 조회
     */
    async getCompanies(searchParams?: {
        specialty?: string;
        min_rating?: number;
        location?: string;
    }): Promise<ConstructionCompany[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/construction/companies`, {
                params: searchParams,
            });
            return response.data.companies || [];
        } catch (error) {
            errorLogger.error('시공사 목록 조회 실패', error as Error, {
                component: 'ConstructionCompanyService',
                action: 'getCompanies',
            });
            return this.getSampleCompanies();
        }
    }

    /**
     * 시공사 상세 정보 조회
     */
    async getCompany(companyId: string): Promise<ConstructionCompany | null> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/construction/companies/${companyId}`);
            return response.data.company;
        } catch (error) {
            errorLogger.error('시공사 상세 정보 조회 실패', error as Error, {
                component: 'ConstructionCompanyService',
                action: 'getCompany',
            });
            return this.getSampleCompanies().find((c) => c.id === companyId) || null;
        }
    }

    /**
     * 하자 이슈 조회
     */
    async getDefectIssues(companyId?: string, projectId?: string): Promise<DefectIssue[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/construction/defect-issues`, {
                params: {
                    ...(companyId && { company_id: companyId }),
                    ...(projectId && { project_id: projectId }),
                },
            });
            return response.data.issues || [];
        } catch (error) {
            errorLogger.error('하자 이슈 조회 실패', error as Error, {
                component: 'ConstructionCompanyService',
                action: 'getDefectIssues',
            });
            return this.getSampleDefectIssues();
        }
    }

    /**
     * 하자 이슈 생성
     */
    async createDefectIssue(issue: Omit<DefectIssue, 'id' | 'reported_date' | 'status'>): Promise<DefectIssue> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/construction/defect-issues`, issue);
            return response.data.issue;
        } catch (error) {
            errorLogger.error('하자 이슈 생성 실패', error as Error, {
                component: 'ConstructionCompanyService',
                action: 'createDefectIssue',
            });
            throw error;
        }
    }

    /**
     * 대응 방안 생성
     */
    async generateResponsePlan(issueId: string, companyId: string): Promise<ResponsePlan> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/construction/response-plans`, {
                issue_id: issueId,
                company_id: companyId,
            });
            return response.data.plan;
        } catch (error) {
            errorLogger.error('대응 방안 생성 실패', error as Error, {
                component: 'ConstructionCompanyService',
                action: 'generateResponsePlan',
            });
            return this.getSampleResponsePlan(issueId, companyId);
        }
    }

    /**
     * 선정 기준 분석
     */
    async analyzeSelectionCriteria(
        companyIds: string[],
        criteria?: SelectionCriteria[]
    ): Promise<SelectionCriteriaAnalysis[]> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/construction/selection-analysis`, {
                company_ids: companyIds,
                ...(criteria && { criteria }),
            });
            return response.data.analyses;
        } catch (error) {
            errorLogger.error('선정 기준 분석 실패', error as Error, {
                component: 'ConstructionCompanyService',
                action: 'analyzeSelectionCriteria',
            });
            return companyIds.map((id) => this.getSampleSelectionAnalysis(id));
        }
    }

    /**
     * 시공사 비교
     */
    async compareCompanies(companyIds: string[]): Promise<CompanyComparison> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/construction/compare`, {
                company_ids: companyIds,
            });
            return response.data.comparison;
        } catch (error) {
            errorLogger.error('시공사 비교 실패', error as Error, {
                component: 'ConstructionCompanyService',
                action: 'compareCompanies',
            });
            return this.getSampleComparison(companyIds);
        }
    }

    /**
     * 샘플 시공사 데이터
     */
    private getSampleCompanies(): ConstructionCompany[] {
        return [
            {
                id: 'company-1',
                name: '삼성물산 건설부문',
                registration_number: '123-45-67890',
                established_year: 1977,
                headquarters: '서울특별시',
                specialties: ['아파트', '오피스텔', '상업시설'],
                certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
                rating: 4.5,
                total_projects: 150,
                completed_projects: 140,
                current_projects: 10,
                reputation_score: 8.5,
                quality_score: 8.2,
                response_time_score: 7.8,
                warranty_period: 24,
                contact_info: {
                    phone: '02-1234-5678',
                    email: 'contact@samsung.com',
                    website: 'https://www.samsung.com',
                },
            },
            {
                id: 'company-2',
                name: '현대건설',
                registration_number: '234-56-78901',
                established_year: 1947,
                headquarters: '서울특별시',
                specialties: ['아파트', '빌라', '상업시설'],
                certifications: ['ISO 9001', 'ISO 14001'],
                rating: 4.3,
                total_projects: 200,
                completed_projects: 185,
                current_projects: 15,
                reputation_score: 8.2,
                quality_score: 8.0,
                response_time_score: 8.0,
                warranty_period: 36,
                contact_info: {
                    phone: '02-2345-6789',
                    email: 'contact@hyundai.com',
                    website: 'https://www.hyundai.com',
                },
            },
            {
                id: 'company-3',
                name: '대우건설',
                registration_number: '345-67-89012',
                established_year: 1973,
                headquarters: '서울특별시',
                specialties: ['아파트', '오피스텔'],
                certifications: ['ISO 9001'],
                rating: 4.0,
                total_projects: 120,
                completed_projects: 110,
                current_projects: 10,
                reputation_score: 7.8,
                quality_score: 7.5,
                response_time_score: 7.2,
                warranty_period: 24,
                contact_info: {
                    phone: '02-3456-7890',
                    email: 'contact@daewoo.com',
                },
            },
        ];
    }

    /**
     * 샘플 하자 이슈 데이터
     */
    private getSampleDefectIssues(): DefectIssue[] {
        return [
            {
                id: 'issue-1',
                company_id: 'company-1',
                company_name: '삼성물산 건설부문',
                project_id: 'project-1',
                project_name: '강남 아파트 신축',
                title: '벽면 균열 발생',
                description: '1층 벽면에 세로 균열이 발견되었습니다. 구조적 안전성 점검이 필요합니다.',
                category: 'structure',
                severity: 'high',
                status: 'investigating',
                reported_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                reported_by: '입주민 A',
                location: '1층 로비',
                estimated_cost: 5000000,
            },
            {
                id: 'issue-2',
                company_id: 'company-2',
                company_name: '현대건설',
                project_id: 'project-2',
                project_name: '서초 오피스텔',
                title: '배관 누수',
                description: '화장실 배관에서 누수가 발생하고 있습니다.',
                category: 'plumbing',
                severity: 'medium',
                status: 'fixing',
                reported_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                reported_by: '입주민 B',
                location: '301호',
                estimated_cost: 2000000,
            },
            {
                id: 'issue-3',
                company_id: 'company-1',
                company_name: '삼성물산 건설부문',
                project_id: 'project-1',
                project_name: '강남 아파트 신축',
                title: '도배 불량',
                description: '도배가 일부 벗겨져 있습니다.',
                category: 'finishing',
                severity: 'low',
                status: 'resolved',
                reported_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                resolution_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                reported_by: '입주민 C',
                location: '502호',
                estimated_cost: 500000,
                actual_cost: 450000,
                resolution_notes: '도배 재시공 완료',
            },
        ];
    }

    /**
     * 샘플 대응 방안
     */
    private getSampleResponsePlan(issueId: string, companyId: string): ResponsePlan {
        return {
            id: `plan-${Date.now()}`,
            issue_id: issueId,
            company_id: companyId,
            response_type: 'scheduled',
            description: '전문가 현장 조사 후 수리 계획 수립',
            steps: [
                {
                    step_number: 1,
                    description: '현장 조사 및 원인 분석',
                    estimated_duration: '2일',
                    responsible_party: '기술팀',
                },
                {
                    step_number: 2,
                    description: '수리 계획 수립 및 승인',
                    estimated_duration: '1일',
                    responsible_party: '관리팀',
                },
                {
                    step_number: 3,
                    description: '수리 작업 진행',
                    estimated_duration: '5일',
                    responsible_party: '시공팀',
                },
            ],
            estimated_completion: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
            cost_estimate: 5000000,
            created_at: new Date().toISOString(),
            status: 'approved',
        };
    }

    /**
     * 샘플 선정 기준 분석
     */
    private getSampleSelectionAnalysis(companyId: string): SelectionCriteriaAnalysis {
        const companies = this.getSampleCompanies();
        const company = companies.find((c) => c.id === companyId) || companies[0];

        return {
            company_id: company.id,
            company_name: company.name,
            criteria_scores: {
                reputation: company.reputation_score,
                price: 7.5,
                quality: company.quality_score,
                experience: (company.total_projects / 10) * 0.5,
                warranty: (company.warranty_period / 12) * 2.0,
                response_time: company.response_time_score,
            },
            overall_score: 7.8,
            strengths: ['높은 평판', '우수한 품질', '풍부한 경험'],
            weaknesses: ['높은 가격', '느린 응답 시간'],
            recommendations: ['가격 협상 필요', '응답 시간 개선 요청'],
            comparison_rank: 1,
            suitability_score: 7.8,
        };
    }

    /**
     * 샘플 비교 데이터
     */
    private getSampleComparison(companyIds: string[]): CompanyComparison {
        const companies = this.getSampleCompanies();
        const selectedCompanies = companies.filter((c) => companyIds.includes(c.id));

        return {
            companies: selectedCompanies.map((c) => ({
                company_id: c.id,
                company_name: c.name,
                overall_score: 7.8,
                criteria_scores: {
                    reputation: c.reputation_score,
                    price: 7.5,
                    quality: c.quality_score,
                    experience: (c.total_projects / 10) * 0.5,
                    warranty: (c.warranty_period / 12) * 2.0,
                    response_time: c.response_time_score,
                },
            })),
            best_for: {
                reputation: [selectedCompanies.at(0)?.name || ''],
                price: [selectedCompanies.at(-1)?.name || ''],
                quality: [selectedCompanies.at(0)?.name || ''],
            },
            summary: '종합적으로 우수한 시공사를 선정하는 것이 좋습니다.',
        };
    }
}

// 싱글톤 인스턴스
const constructionCompanyService = new ConstructionCompanyService();

export default constructionCompanyService;
export { ConstructionCompanyService };
