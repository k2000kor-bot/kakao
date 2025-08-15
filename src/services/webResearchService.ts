import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export interface WebResearchResult {
    original_question: string;
    research_results: {
        query: string;
        sources: Array<{
            url: string;
            title: string;
            domain: string;
            credibility_score: number;
            source_type: string;
        }>;
        key_findings: string[];
        consensus_points: string[];
        credibility_assessment: {
            high_credibility_sources: number;
            medium_credibility_sources: number;
            low_credibility_sources: number;
            average_credibility: number;
        };
        research_summary: string;
    };
    logical_refutations: Array<{
        claim: string;
        refutation_type: string;
        evidence: string[];
        counter_arguments: string[];
        confidence_score: number;
        refutation_strength: string;
    }>;
    methodology_assessment: {
        sample_size: number;
        source_diversity: number;
        methodology_strength: string;
    };
    conclusion: string;
    recommendations: string[];
    confidence_score: number;
}

class WebResearchService {
    async performWebResearch(question: string, context: any = {}): Promise<WebResearchResult> {
        try {
            const response = await axios.post(`${API_BASE_URL}/analysis/web-research`, {
                question,
                context: {
                    project_id: context.project_id || 'gaeposung_project',
                    user_id: context.user_id || 'default_user',
                    conversation_history: context.conversation_history || [],
                    uploaded_files: context.uploaded_files || []
                }
            });

            if (response.data.success) {
                return response.data.result;
            } else {
                throw new Error(response.data.error || '웹 연구 분석에 실패했습니다.');
            }
        } catch (error) {
            console.error('웹 연구 서비스 오류:', error);
            throw error;
        }
    }

    formatWebResearchResponse(result: WebResearchResult): string {
        let formattedResponse = '## 🔍 웹 연구 기반 고도화된 분석 결과\n\n';

        // 연구 개요
        formattedResponse += `### 📋 연구 개요\n`;
        formattedResponse += `- **원본 질문**: ${result.original_question}\n`;
        formattedResponse += `- **신뢰도 점수**: ${(result.confidence_score * 100).toFixed(1)}%\n`;
        formattedResponse += `- **분석 소스**: ${result.research_results.sources.length}개\n\n`;

        // 주요 발견사항
        if (result.research_results.key_findings.length > 0) {
            formattedResponse += `### 🔍 주요 발견사항\n`;
            result.research_results.key_findings.forEach(finding => {
                formattedResponse += `- ${finding}\n`;
            });
            formattedResponse += '\n';
        }

        // 합의점
        if (result.research_results.consensus_points.length > 0) {
            formattedResponse += `### ✅ 합의점\n`;
            result.research_results.consensus_points.forEach(point => {
                formattedResponse += `- ${point}\n`;
            });
            formattedResponse += '\n';
        }

        // 논리적 반박
        if (result.logical_refutations.length > 0) {
            formattedResponse += `### 🧠 논리적 반박\n`;
            result.logical_refutations.forEach((refutation, index) => {
                formattedResponse += `#### 반박 ${index + 1}: ${refutation.refutation_type}\n`;
                formattedResponse += `- **주장**: ${refutation.claim}\n`;
                formattedResponse += `- **반박 강도**: ${refutation.refutation_strength}\n`;
                formattedResponse += `- **신뢰도**: ${(refutation.confidence_score * 100).toFixed(1)}%\n`;

                if (refutation.evidence.length > 0) {
                    formattedResponse += `- **근거**:\n`;
                    refutation.evidence.forEach(evidence => {
                        formattedResponse += `  - ${evidence}\n`;
                    });
                }

                if (refutation.counter_arguments.length > 0) {
                    formattedResponse += `- **반박 논리**:\n`;
                    refutation.counter_arguments.forEach(arg => {
                        formattedResponse += `  - ${arg}\n`;
                    });
                }
                formattedResponse += '\n';
            });
        }

        // 방법론 평가
        formattedResponse += `### 📊 방법론 평가\n`;
        formattedResponse += `- **샘플 크기**: ${result.methodology_assessment.sample_size}개\n`;
        formattedResponse += `- **소스 다양성**: ${result.methodology_assessment.source_diversity}개 도메인\n`;
        formattedResponse += `- **방법론 강도**: ${result.methodology_assessment.methodology_strength}\n\n`;

        // 결론
        formattedResponse += `### 📝 결론\n`;
        formattedResponse += `${result.conclusion}\n\n`;

        // 권장사항
        if (result.recommendations.length > 0) {
            formattedResponse += `### 💡 권장사항\n`;
            result.recommendations.forEach(rec => {
                formattedResponse += `- ${rec}\n`;
            });
            formattedResponse += '\n';
        }

        // 연구 소스 정보
        formattedResponse += `### 📚 연구 소스 정보\n`;
        formattedResponse += `- **고신뢰도 소스**: ${result.research_results.credibility_assessment.high_credibility_sources}개\n`;
        formattedResponse += `- **중신뢰도 소스**: ${result.research_results.credibility_assessment.medium_credibility_sources}개\n`;
        formattedResponse += `- **저신뢰도 소스**: ${result.research_results.credibility_assessment.low_credibility_sources}개\n`;
        formattedResponse += `- **평균 신뢰도**: ${(result.research_results.credibility_assessment.average_credibility * 100).toFixed(1)}%\n\n`;

        return formattedResponse;
    }

    getWebResearchDescription(): string {
        return `🔍 **웹 연구 기반 고도화된 분석**
        
이 모드는 웹 검색을 통한 실시간 정보 수집과 논리적 반박 능력을 갖춘 최상급 문제 해결 시스템입니다.

**주요 기능:**
- 🌐 실시간 웹 검색 (Google, Naver, Daum 등)
- 📚 정보 검증 시스템 (출처 신뢰도 평가)
- 🧠 논리적 반박 생성 (논리적 오류 탐지)
- ⚖️ 법규 적용성 검토
- 📊 방법론 평가
- 💡 실행 권장사항 제공

복합적인 질문이나 논리적 반박이 필요한 경우에 특히 유용합니다.`;
    }
}

const webResearchService = new WebResearchService();
export default webResearchService;
