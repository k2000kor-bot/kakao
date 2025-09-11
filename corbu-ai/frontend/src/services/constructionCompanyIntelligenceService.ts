/**
 * 시공사 정보 시스템 서비스
 * 하자 이슈, 대응 방안, 선정 기준 분석
 */

export interface DefectIssue {
    id: string;
    companyId: string;
    projectId: string;
    category: 'structural' | 'waterproof' | 'electrical' | 'plumbing' | 'finishing' | 'hvac';
    severity: 'critical' | 'major' | 'minor';
    description: string;
    location: string;
    reportedDate: Date;
    resolvedDate?: Date;
    status: 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'disputed';
    cost: number;
    responsibleParty: 'contractor' | 'subcontractor' | 'material_supplier' | 'design_error';
    resolutionMethod?: string;
    customerSatisfaction?: number; // 1-5 scale
    images?: string[];
    documents?: string[];
}

export interface CompanyPerformance {
    companyId: string;
    companyName: string;
    totalProjects: number;
    completedProjects: number;
    ongoingProjects: number;
    averageProjectDuration: number; // months
    onTimeDeliveryRate: number; // 0-1
    budgetComplianceRate: number; // 0-1
    qualityScore: number; // 0-100
    safetyScore: number; // 0-100
    customerSatisfactionScore: number; // 0-5
    defectRate: number; // defects per project
    totalDefectCost: number;
    certifications: string[];
    specializations: string[];
    financialStability: 'excellent' | 'good' | 'fair' | 'poor';
    lastUpdated: Date;
}

export interface SelectionCriteria {
    id: string;
    name: string;
    weight: number; // 0-1, sum should be 1
    description: string;
    evaluationMethod: string;
    benchmarkValue?: number;
    category: 'technical' | 'financial' | 'experience' | 'quality' | 'safety';
}

export interface CompanyEvaluation {
    companyId: string;
    criteriaScores: {
        criteriaId: string;
        score: number; // 0-100
        evidence: string;
        evaluatedBy: string;
        evaluatedDate: Date;
    }[];
    totalScore: number;
    rank: number;
    recommendation: 'highly_recommended' | 'recommended' | 'conditional' | 'not_recommended';
    strengths: string[];
    weaknesses: string[];
    riskFactors: string[];
    evaluationDate: Date;
}

export interface DefectAnalytics {
    totalDefects: number;
    defectsByCategory: { [category: string]: number };
    defectsBySeverity: { [severity: string]: number };
    defectsByCompany: { [companyId: string]: number };
    averageResolutionTime: number; // days
    totalDefectCost: number;
    defectTrends: {
        month: string;
        count: number;
        cost: number;
    }[];
    topDefectTypes: {
        type: string;
        count: number;
        averageCost: number;
    }[];
    resolutionEfficiency: {
        companyId: string;
        averageResolutionTime: number;
        resolutionRate: number;
        customerSatisfaction: number;
    }[];
}

export interface ResponseStrategy {
    defectCategory: string;
    severity: string;
    recommendedActions: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    preventiveMeasures: string[];
    qualityCheckpoints: string[];
    communicationProtocol: {
        internal: string[];
        customer: string[];
        timeline: string;
    };
    escalationCriteria: string[];
    successMetrics: string[];
}

class ConstructionCompanyIntelligenceService {
    private defectIssues: DefectIssue[] = [];
    private companyPerformances: CompanyPerformance[] = [];
    private selectionCriteria: SelectionCriteria[] = [];
    private companyEvaluations: CompanyEvaluation[] = [];
    private responseStrategies: ResponseStrategy[] = [];

    constructor() {
        this.initializeMockData();
    }

    // 하자 이슈 분석
    analyzeDefectIssues(companyId?: string): DefectAnalytics {
        const filteredDefects = companyId
            ? this.defectIssues.filter(d => d.companyId === companyId)
            : this.defectIssues;

        const defectsByCategory = this.groupBy(filteredDefects, 'category');
        const defectsBySeverity = this.groupBy(filteredDefects, 'severity');
        const defectsByCompany = this.groupBy(filteredDefects, 'companyId');

        const resolvedDefects = filteredDefects.filter(d => d.resolvedDate);
        const averageResolutionTime = resolvedDefects.length > 0
            ? resolvedDefects.reduce((sum, d) => {
                const days = Math.floor((d.resolvedDate!.getTime() - d.reportedDate.getTime()) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0) / resolvedDefects.length
            : 0;

        return {
            totalDefects: filteredDefects.length,
            defectsByCategory: Object.fromEntries(
                Object.entries(defectsByCategory).map(([k, v]) => [k, v.length])
            ),
            defectsBySeverity: Object.fromEntries(
                Object.entries(defectsBySeverity).map(([k, v]) => [k, v.length])
            ),
            defectsByCompany: Object.fromEntries(
                Object.entries(defectsByCompany).map(([k, v]) => [k, v.length])
            ),
            averageResolutionTime,
            totalDefectCost: filteredDefects.reduce((sum, d) => sum + d.cost, 0),
            defectTrends: this.generateDefectTrends(filteredDefects),
            topDefectTypes: this.getTopDefectTypes(filteredDefects),
            resolutionEfficiency: this.calculateResolutionEfficiency()
        };
    }

    // 시공사 성능 평가
    evaluateCompanyPerformance(companyId: string): CompanyPerformance | null {
        return this.companyPerformances.find(cp => cp.companyId === companyId) || null;
    }

    // 시공사 선정 기준 분석
    analyzeSelectionCriteria(): SelectionCriteria[] {
        return this.selectionCriteria;
    }

    // 시공사 종합 평가
    evaluateCompany(companyId: string, criteriaWeights?: { [criteriaId: string]: number }): CompanyEvaluation {
        const performance = this.evaluateCompanyPerformance(companyId);
        const defectAnalysis = this.analyzeDefectIssues(companyId);

        if (!performance) {
            throw new Error(`Company ${companyId} not found`);
        }

        const criteriaScores = this.selectionCriteria.map(criteria => {
            const score = this.calculateCriteriaScore(criteria, performance, defectAnalysis);
            return {
                criteriaId: criteria.id,
                score,
                evidence: this.generateEvidence(criteria, performance, defectAnalysis),
                evaluatedBy: 'AI_System',
                evaluatedDate: new Date()
            };
        });

        const totalScore = this.calculateWeightedScore(criteriaScores, criteriaWeights);
        const recommendation = this.determineRecommendation(totalScore, performance, defectAnalysis);

        return {
            companyId,
            criteriaScores,
            totalScore,
            rank: 1, // Will be calculated when comparing multiple companies
            recommendation,
            strengths: this.identifyStrengths(performance, defectAnalysis),
            weaknesses: this.identifyWeaknesses(performance, defectAnalysis),
            riskFactors: this.identifyRiskFactors(performance, defectAnalysis),
            evaluationDate: new Date()
        };
    }

    // 하자 대응 전략 생성
    generateResponseStrategy(defectIssue: DefectIssue): ResponseStrategy {
        const existingStrategy = this.responseStrategies.find(
            rs => rs.defectCategory === defectIssue.category && rs.severity === defectIssue.severity
        );

        if (existingStrategy) {
            return existingStrategy;
        }

        // Generate new strategy based on defect characteristics
        return this.createResponseStrategy(defectIssue.category, defectIssue.severity);
    }

    // 하자 예방 권장사항
    getPreventiveMeasures(category: string): string[] {
        const categoryMeasures: { [key: string]: string[] } = {
            structural: [
                '구조 설계 검토 강화',
                '철근 배근 상태 정밀 검사',
                '콘크리트 양생 관리 철저',
                '구조물 변형 모니터링'
            ],
            waterproof: [
                '방수 시공 전 바탕면 정리',
                '방수재 품질 검증',
                '방수층 연속성 확보',
                '배수 시설 점검'
            ],
            electrical: [
                '전기 설계도 검토',
                '배선 시공 품질 관리',
                '접지 시설 점검',
                '전기 안전 검사 실시'
            ],
            plumbing: [
                '배관 재료 품질 확인',
                '배관 기울기 정확성 검사',
                '수압 테스트 실시',
                '누수 방지 조치'
            ],
            finishing: [
                '마감재 품질 검증',
                '시공 순서 준수',
                '양생 기간 확보',
                '품질 검사 강화'
            ],
            hvac: [
                '설비 용량 계산 검토',
                '덕트 시공 품질 관리',
                '시운전 테스트 실시',
                '정기 점검 계획 수립'
            ]
        };

        return categoryMeasures[category] || ['일반적인 품질 관리 강화'];
    }

    // 시공사 비교 분석
    compareCompanies(companyIds: string[]): {
        comparison: CompanyEvaluation[];
        ranking: { companyId: string; score: number; rank: number }[];
        recommendations: string[];
    } {
        const evaluations = companyIds.map(id => this.evaluateCompany(id));
        const ranking = evaluations
            .map((evaluation, index) => ({
                companyId: evaluation.companyId,
                score: evaluation.totalScore,
                rank: index + 1
            }))
            .sort((a, b) => b.score - a.score)
            .map((item, index) => ({ ...item, rank: index + 1 }));

        // Update ranks in evaluations
        evaluations.forEach(evaluation => {
            const rankInfo = ranking.find(r => r.companyId === evaluation.companyId);
            if (rankInfo) evaluation.rank = rankInfo.rank;
        });

        return {
            comparison: evaluations,
            ranking,
            recommendations: this.generateComparisonRecommendations(evaluations, ranking)
        };
    }

    // 품질 개선 제안
    generateQualityImprovementPlan(companyId: string): {
        currentIssues: string[];
        improvementActions: {
            category: string;
            actions: string[];
            timeline: string;
            expectedImpact: string;
        }[];
        kpis: {
            metric: string;
            currentValue: number;
            targetValue: number;
            timeline: string;
        }[];
    } {
        const performance = this.evaluateCompanyPerformance(companyId);
        const defectAnalysis = this.analyzeDefectIssues(companyId);

        if (!performance) {
            throw new Error(`Company ${companyId} not found`);
        }

        return {
            currentIssues: this.identifyCurrentIssues(performance, defectAnalysis),
            improvementActions: this.generateImprovementActions(performance, defectAnalysis),
            kpis: this.defineImprovementKPIs(performance, defectAnalysis)
        };
    }

    // Private helper methods
    private initializeMockData(): void {
        // Initialize selection criteria
        this.selectionCriteria = [
            {
                id: '1',
                name: '기술 역량',
                weight: 0.25,
                description: '시공 기술력 및 전문성',
                evaluationMethod: '과거 프로젝트 성과 및 기술 인증',
                benchmarkValue: 80,
                category: 'technical'
            },
            {
                id: '2',
                name: '품질 관리',
                weight: 0.20,
                description: '품질 관리 체계 및 하자 발생률',
                evaluationMethod: '품질 점수 및 하자 통계',
                benchmarkValue: 85,
                category: 'quality'
            },
            {
                id: '3',
                name: '공기 준수',
                weight: 0.15,
                description: '공사 일정 준수율',
                evaluationMethod: '과거 프로젝트 일정 준수 실적',
                benchmarkValue: 90,
                category: 'experience'
            },
            {
                id: '4',
                name: '안전 관리',
                weight: 0.15,
                description: '안전사고 예방 및 관리 체계',
                evaluationMethod: '안전 점수 및 사고 발생률',
                benchmarkValue: 95,
                category: 'safety'
            },
            {
                id: '5',
                name: '재무 안정성',
                weight: 0.15,
                description: '재무 건전성 및 지급 능력',
                evaluationMethod: '재무제표 분석 및 신용도 평가',
                benchmarkValue: 75,
                category: 'financial'
            },
            {
                id: '6',
                name: '고객 만족도',
                weight: 0.10,
                description: '고객 만족도 및 평판',
                evaluationMethod: '고객 설문 및 평가 점수',
                benchmarkValue: 4.0,
                category: 'experience'
            }
        ];

        // Initialize company performances
        this.companyPerformances = [
            {
                companyId: 'company_1',
                companyName: '대한건설',
                totalProjects: 45,
                completedProjects: 42,
                ongoingProjects: 3,
                averageProjectDuration: 24,
                onTimeDeliveryRate: 0.88,
                budgetComplianceRate: 0.92,
                qualityScore: 85,
                safetyScore: 90,
                customerSatisfactionScore: 4.2,
                defectRate: 2.1,
                totalDefectCost: 150000000,
                certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
                specializations: ['아파트', '오피스텔', '상업시설'],
                financialStability: 'good',
                lastUpdated: new Date()
            },
            {
                companyId: 'company_2',
                companyName: '현대건설산업',
                totalProjects: 38,
                completedProjects: 35,
                ongoingProjects: 3,
                averageProjectDuration: 22,
                onTimeDeliveryRate: 0.94,
                budgetComplianceRate: 0.89,
                qualityScore: 88,
                safetyScore: 92,
                customerSatisfactionScore: 4.4,
                defectRate: 1.8,
                totalDefectCost: 120000000,
                certifications: ['ISO 9001', 'ISO 14001', 'KOSHA 18001'],
                specializations: ['아파트', '주상복합', '리모델링'],
                financialStability: 'excellent',
                lastUpdated: new Date()
            }
        ];

        // Initialize defect issues
        this.defectIssues = [
            {
                id: '1',
                companyId: 'company_1',
                projectId: 'project_1',
                category: 'waterproof',
                severity: 'major',
                description: '화장실 방수 불량으로 인한 누수',
                location: '101동 5층 화장실',
                reportedDate: new Date('2024-01-15'),
                resolvedDate: new Date('2024-01-25'),
                status: 'resolved',
                cost: 2500000,
                responsibleParty: 'contractor',
                resolutionMethod: '방수 재시공',
                customerSatisfaction: 3,
                images: ['image1.jpg', 'image2.jpg'],
                documents: ['report1.pdf']
            },
            {
                id: '2',
                companyId: 'company_1',
                projectId: 'project_1',
                category: 'finishing',
                severity: 'minor',
                description: '벽지 들뜸 현상',
                location: '102동 3층 거실',
                reportedDate: new Date('2024-01-20'),
                status: 'in_progress',
                cost: 500000,
                responsibleParty: 'subcontractor',
                customerSatisfaction: 4,
                images: ['image3.jpg']
            }
        ];

        // Initialize response strategies
        this.responseStrategies = [
            {
                defectCategory: 'waterproof',
                severity: 'major',
                recommendedActions: {
                    immediate: ['누수 부위 임시 차단', '피해 범위 조사', '고객 안전 확보'],
                    shortTerm: ['방수층 제거 및 재시공', '주변 마감재 교체', '품질 검사 실시'],
                    longTerm: ['방수 시공 매뉴얼 개선', '작업자 교육 강화', '정기 점검 체계 구축']
                },
                preventiveMeasures: [
                    '방수 시공 전 바탕면 정리 철저',
                    '방수재 품질 검증 강화',
                    '시공 중 품질 검사 실시',
                    '양생 기간 준수'
                ],
                qualityCheckpoints: [
                    '바탕면 청소 및 건조 상태 확인',
                    '방수재 도포 두께 측정',
                    '방수층 연속성 검사',
                    '물막이 테스트 실시'
                ],
                communicationProtocol: {
                    internal: ['즉시 현장 책임자 보고', '품질팀 긴급 회의', '대책 수립 및 승인'],
                    customer: ['24시간 내 고객 연락', '조치 계획 설명', '진행 상황 정기 보고'],
                    timeline: '신고 접수 후 24시간 내 초기 대응'
                },
                escalationCriteria: [
                    '고객 불만 지속',
                    '피해 확산 우려',
                    '언론 보도 가능성',
                    '법적 분쟁 가능성'
                ],
                successMetrics: [
                    '고객 만족도 4점 이상',
                    '재발 방지 확약',
                    '추가 하자 발생 제로',
                    '처리 기간 단축'
                ]
            }
        ];
    }

    private groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
        return array.reduce((groups, item) => {
            const group = String(item[key]);
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {} as { [key: string]: T[] });
    }

    private generateDefectTrends(defects: DefectIssue[]): DefectAnalytics['defectTrends'] {
        const trends: { [month: string]: { count: number; cost: number } } = {};

        defects.forEach(defect => {
            const month = defect.reportedDate.toISOString().substring(0, 7);
            if (!trends[month]) {
                trends[month] = { count: 0, cost: 0 };
            }
            trends[month].count++;
            trends[month].cost += defect.cost;
        });

        return Object.entries(trends).map(([month, data]) => ({
            month,
            count: data.count,
            cost: data.cost
        }));
    }

    private getTopDefectTypes(defects: DefectIssue[]): DefectAnalytics['topDefectTypes'] {
        const typeStats: { [type: string]: { count: number; totalCost: number } } = {};

        defects.forEach(defect => {
            const type = defect.category;
            if (!typeStats[type]) {
                typeStats[type] = { count: 0, totalCost: 0 };
            }
            typeStats[type].count++;
            typeStats[type].totalCost += defect.cost;
        });

        return Object.entries(typeStats)
            .map(([type, stats]) => ({
                type,
                count: stats.count,
                averageCost: stats.totalCost / stats.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    private calculateResolutionEfficiency(): DefectAnalytics['resolutionEfficiency'] {
        return this.companyPerformances.map(company => {
            const companyDefects = this.defectIssues.filter(d => d.companyId === company.companyId);
            const resolvedDefects = companyDefects.filter(d => d.resolvedDate);

            const averageResolutionTime = resolvedDefects.length > 0
                ? resolvedDefects.reduce((sum, d) => {
                    const days = Math.floor((d.resolvedDate!.getTime() - d.reportedDate.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + days;
                }, 0) / resolvedDefects.length
                : 0;

            const resolutionRate = companyDefects.length > 0
                ? resolvedDefects.length / companyDefects.length
                : 0;

            const customerSatisfaction = resolvedDefects.length > 0
                ? resolvedDefects.reduce((sum, d) => sum + (d.customerSatisfaction || 0), 0) / resolvedDefects.length
                : 0;

            return {
                companyId: company.companyId,
                averageResolutionTime,
                resolutionRate,
                customerSatisfaction
            };
        });
    }

    private calculateCriteriaScore(criteria: SelectionCriteria, performance: CompanyPerformance, defectAnalysis: DefectAnalytics): number {
        switch (criteria.id) {
            case '1': // 기술 역량
                return Math.min(100, performance.qualityScore + (performance.certifications.length * 5));
            case '2': // 품질 관리
                return Math.max(0, 100 - (performance.defectRate * 10));
            case '3': // 공기 준수
                return performance.onTimeDeliveryRate * 100;
            case '4': // 안전 관리
                return performance.safetyScore;
            case '5': // 재무 안정성
                const stabilityScore = {
                    'excellent': 100,
                    'good': 80,
                    'fair': 60,
                    'poor': 40
                };
                return stabilityScore[performance.financialStability];
            case '6': // 고객 만족도
                return (performance.customerSatisfactionScore / 5) * 100;
            default:
                return 70; // Default score
        }
    }

    private generateEvidence(criteria: SelectionCriteria, performance: CompanyPerformance, defectAnalysis: DefectAnalytics): string {
        switch (criteria.id) {
            case '1':
                return `품질점수 ${performance.qualityScore}점, 보유인증 ${performance.certifications.length}개`;
            case '2':
                return `하자율 ${performance.defectRate}%, 총 하자비용 ${(performance.totalDefectCost / 1000000).toFixed(1)}백만원`;
            case '3':
                return `일정준수율 ${(performance.onTimeDeliveryRate * 100).toFixed(1)}%, 평균공기 ${performance.averageProjectDuration}개월`;
            case '4':
                return `안전점수 ${performance.safetyScore}점, 안전인증 보유`;
            case '5':
                return `재무등급 ${performance.financialStability}, 예산준수율 ${(performance.budgetComplianceRate * 100).toFixed(1)}%`;
            case '6':
                return `고객만족도 ${performance.customerSatisfactionScore}점/5점, 완료프로젝트 ${performance.completedProjects}개`;
            default:
                return '평가 근거 데이터';
        }
    }

    private calculateWeightedScore(criteriaScores: CompanyEvaluation['criteriaScores'], weights?: { [criteriaId: string]: number }): number {
        let totalScore = 0;
        let totalWeight = 0;

        criteriaScores.forEach(cs => {
            const criteria = this.selectionCriteria.find(c => c.id === cs.criteriaId);
            if (criteria) {
                const weight = weights?.[cs.criteriaId] || criteria.weight;
                totalScore += cs.score * weight;
                totalWeight += weight;
            }
        });

        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    private determineRecommendation(totalScore: number, performance: CompanyPerformance, defectAnalysis: DefectAnalytics): CompanyEvaluation['recommendation'] {
        if (totalScore >= 90 && performance.defectRate < 1.5) return 'highly_recommended';
        if (totalScore >= 80 && performance.defectRate < 2.5) return 'recommended';
        if (totalScore >= 70 && performance.defectRate < 4.0) return 'conditional';
        return 'not_recommended';
    }

    private identifyStrengths(performance: CompanyPerformance, defectAnalysis: DefectAnalytics): string[] {
        const strengths: string[] = [];

        if (performance.onTimeDeliveryRate > 0.9) strengths.push('우수한 공기 준수율');
        if (performance.qualityScore > 85) strengths.push('높은 품질 관리 수준');
        if (performance.safetyScore > 90) strengths.push('탁월한 안전 관리');
        if (performance.customerSatisfactionScore > 4.0) strengths.push('높은 고객 만족도');
        if (performance.defectRate < 2.0) strengths.push('낮은 하자 발생률');
        if (performance.financialStability === 'excellent') strengths.push('우수한 재무 안정성');

        return strengths;
    }

    private identifyWeaknesses(performance: CompanyPerformance, defectAnalysis: DefectAnalytics): string[] {
        const weaknesses: string[] = [];

        if (performance.onTimeDeliveryRate < 0.8) weaknesses.push('공기 지연 위험');
        if (performance.qualityScore < 75) weaknesses.push('품질 관리 개선 필요');
        if (performance.safetyScore < 80) weaknesses.push('안전 관리 강화 필요');
        if (performance.customerSatisfactionScore < 3.5) weaknesses.push('고객 만족도 개선 필요');
        if (performance.defectRate > 3.0) weaknesses.push('높은 하자 발생률');
        if (performance.financialStability === 'poor') weaknesses.push('재무 안정성 우려');

        return weaknesses;
    }

    private identifyRiskFactors(performance: CompanyPerformance, defectAnalysis: DefectAnalytics): string[] {
        const risks: string[] = [];

        if (performance.ongoingProjects > performance.totalProjects * 0.3) {
            risks.push('과도한 동시 진행 프로젝트로 인한 품질 저하 위험');
        }
        if (defectAnalysis.totalDefectCost > 200000000) {
            risks.push('높은 하자 비용으로 인한 재무 부담');
        }
        if (performance.budgetComplianceRate < 0.85) {
            risks.push('예산 초과 위험');
        }

        return risks;
    }

    private createResponseStrategy(category: string, severity: string): ResponseStrategy {
        // Create a generic response strategy based on category and severity
        return {
            defectCategory: category,
            severity,
            recommendedActions: {
                immediate: ['현장 안전 확보', '피해 범위 조사', '임시 조치 실시'],
                shortTerm: ['원인 분석', '수리 계획 수립', '수리 작업 실시'],
                longTerm: ['재발 방지 대책', '품질 관리 강화', '정기 점검 실시']
            },
            preventiveMeasures: this.getPreventiveMeasures(category),
            qualityCheckpoints: ['시공 전 검사', '시공 중 검사', '완료 후 검사'],
            communicationProtocol: {
                internal: ['현장 책임자 보고', '품질팀 회의', '대책 수립'],
                customer: ['고객 연락', '상황 설명', '진행 보고'],
                timeline: '24시간 내 초기 대응'
            },
            escalationCriteria: ['고객 불만', '피해 확산', '언론 관심'],
            successMetrics: ['고객 만족', '재발 방지', '처리 시간 단축']
        };
    }

    private generateComparisonRecommendations(evaluations: CompanyEvaluation[], ranking: any[]): string[] {
        const recommendations: string[] = [];
        const topCompany = ranking[0];

        if (topCompany.score > 85) {
            recommendations.push(`${topCompany.companyId}를 1순위로 추천합니다. 종합점수 ${topCompany.score.toFixed(1)}점으로 우수한 성과를 보입니다.`);
        }

        const lowPerformers = ranking.filter(r => r.score < 70);
        if (lowPerformers.length > 0) {
            recommendations.push(`점수가 70점 미만인 업체들은 신중한 검토가 필요합니다.`);
        }

        return recommendations;
    }

    private identifyCurrentIssues(performance: CompanyPerformance, defectAnalysis: DefectAnalytics): string[] {
        const issues: string[] = [];

        if (performance.defectRate > 2.5) issues.push('높은 하자 발생률');
        if (performance.onTimeDeliveryRate < 0.85) issues.push('공기 지연 문제');
        if (performance.customerSatisfactionScore < 4.0) issues.push('고객 만족도 저조');
        if (defectAnalysis.averageResolutionTime > 14) issues.push('하자 처리 지연');

        return issues;
    }

    private generateImprovementActions(performance: CompanyPerformance, defectAnalysis: DefectAnalytics): any[] {
        const actions = [];

        if (performance.defectRate > 2.5) {
            actions.push({
                category: '품질 관리',
                actions: ['품질 검사 강화', '작업자 교육', '시공 매뉴얼 개선'],
                timeline: '3개월',
                expectedImpact: '하자율 50% 감소'
            });
        }

        if (performance.onTimeDeliveryRate < 0.85) {
            actions.push({
                category: '일정 관리',
                actions: ['공정 계획 정밀화', '리소스 관리 개선', '진도 모니터링 강화'],
                timeline: '6개월',
                expectedImpact: '일정 준수율 90% 달성'
            });
        }

        return actions;
    }

    private defineImprovementKPIs(performance: CompanyPerformance, defectAnalysis: DefectAnalytics): any[] {
        return [
            {
                metric: '하자 발생률',
                currentValue: performance.defectRate,
                targetValue: Math.max(1.0, performance.defectRate * 0.7),
                timeline: '6개월'
            },
            {
                metric: '일정 준수율',
                currentValue: performance.onTimeDeliveryRate * 100,
                targetValue: Math.min(95, performance.onTimeDeliveryRate * 100 + 10),
                timeline: '6개월'
            },
            {
                metric: '고객 만족도',
                currentValue: performance.customerSatisfactionScore,
                targetValue: Math.min(5.0, performance.customerSatisfactionScore + 0.5),
                timeline: '12개월'
            }
        ];
    }

    // Public getter methods
    public getDefectIssues(): DefectIssue[] {
        return this.defectIssues;
    }

    public getCompanyPerformances(): CompanyPerformance[] {
        return this.companyPerformances;
    }

    public getSelectionCriteria(): SelectionCriteria[] {
        return this.selectionCriteria;
    }

    public addDefectIssue(defect: Omit<DefectIssue, 'id'>): DefectIssue {
        const newDefect: DefectIssue = {
            ...defect,
            id: this.generateId()
        };
        this.defectIssues.push(newDefect);
        return newDefect;
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

export const constructionCompanyIntelligenceService = new ConstructionCompanyIntelligenceService();
