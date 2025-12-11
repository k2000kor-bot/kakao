// axios 모킹을 먼저 설정
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

import axios from 'axios';
import webResearchService, { WebResearchResult } from '../webResearchService';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WebResearchService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('performWebResearch', () => {
        const mockWebResearchResult: WebResearchResult = {
            original_question: '테스트 질문',
            research_results: {
                query: '테스트 쿼리',
                sources: [
                    {
                        url: 'https://example.com',
                        title: '테스트 소스',
                        domain: 'example.com',
                        credibility_score: 0.9,
                        source_type: 'academic'
                    }
                ],
                key_findings: ['발견사항 1', '발견사항 2'],
                consensus_points: ['합의점 1'],
                credibility_assessment: {
                    high_credibility_sources: 1,
                    medium_credibility_sources: 0,
                    low_credibility_sources: 0,
                    average_credibility: 0.9
                },
                research_summary: '연구 요약'
            },
            logical_refutations: [
                {
                    claim: '주장 1',
                    refutation_type: '논리적 오류',
                    evidence: ['근거 1'],
                    counter_arguments: ['반박 1'],
                    confidence_score: 0.8,
                    refutation_strength: '강함'
                }
            ],
            methodology_assessment: {
                sample_size: 10,
                source_diversity: 5,
                methodology_strength: '강함'
            },
            conclusion: '결론',
            recommendations: ['권장사항 1', '권장사항 2'],
            confidence_score: 0.85
        };

        it('웹 연구를 성공적으로 수행해야 함', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    success: true,
                    result: mockWebResearchResult
                }
            });

            const result = await webResearchService.performWebResearch('테스트 질문');

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/analysis/web-research'),
                {
                    question: '테스트 질문',
                    context: {
                        project_id: 'gaeposung_project',
                        user_id: 'default_user',
                        conversation_history: [],
                        uploaded_files: []
                    }
                }
            );
            expect(result).toEqual(mockWebResearchResult);
        });

        it('컨텍스트를 포함하여 웹 연구를 수행해야 함', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    success: true,
                    result: mockWebResearchResult
                }
            });

            const context = {
                project_id: 'custom_project',
                user_id: 'custom_user',
                conversation_history: ['메시지 1', '메시지 2'],
                uploaded_files: ['file1.pdf', 'file2.docx']
            };

            await webResearchService.performWebResearch('테스트 질문', context);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/analysis/web-research'),
                {
                    question: '테스트 질문',
                    context
                }
            );
        });

        it('API 응답이 실패하면 에러를 throw해야 함', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    success: false,
                    error: 'API 오류'
                }
            });

            await expect(
                webResearchService.performWebResearch('테스트 질문')
            ).rejects.toThrow('API 오류');
        });

        it('API 응답에 error가 없으면 기본 에러 메시지를 throw해야 함', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    success: false
                }
            });

            await expect(
                webResearchService.performWebResearch('테스트 질문')
            ).rejects.toThrow('웹 연구 분석에 실패했습니다.');
        });

        it('네트워크 오류 시 에러를 throw해야 함', async () => {
            const networkError = new Error('Network Error');
            mockedAxios.post.mockRejectedValueOnce(networkError);

            await expect(
                webResearchService.performWebResearch('테스트 질문')
            ).rejects.toThrow('Network Error');

            expect(console.error).toHaveBeenCalledWith(
                '웹 연구 서비스 오류:',
                networkError
            );
        });

        it('빈 컨텍스트로 웹 연구를 수행해야 함', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    success: true,
                    result: mockWebResearchResult
                }
            });

            await webResearchService.performWebResearch('테스트 질문', {});

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/analysis/web-research'),
                {
                    question: '테스트 질문',
                    context: {
                        project_id: 'gaeposung_project',
                        user_id: 'default_user',
                        conversation_history: [],
                        uploaded_files: []
                    }
                }
            );
        });

        it('부분 컨텍스트로 웹 연구를 수행해야 함', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    success: true,
                    result: mockWebResearchResult
                }
            });

            await webResearchService.performWebResearch('테스트 질문', {
                project_id: 'partial_project'
            });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/analysis/web-research'),
                {
                    question: '테스트 질문',
                    context: {
                        project_id: 'partial_project',
                        user_id: 'default_user',
                        conversation_history: [],
                        uploaded_files: []
                    }
                }
            );
        });
    });

    describe('formatWebResearchResponse', () => {
        const mockResult: WebResearchResult = {
            original_question: '테스트 질문',
            research_results: {
                query: '테스트 쿼리',
                sources: [
                    {
                        url: 'https://example.com',
                        title: '테스트 소스',
                        domain: 'example.com',
                        credibility_score: 0.9,
                        source_type: 'academic'
                    },
                    {
                        url: 'https://example2.com',
                        title: '테스트 소스 2',
                        domain: 'example2.com',
                        credibility_score: 0.7,
                        source_type: 'news'
                    }
                ],
                key_findings: ['발견사항 1', '발견사항 2'],
                consensus_points: ['합의점 1', '합의점 2'],
                credibility_assessment: {
                    high_credibility_sources: 1,
                    medium_credibility_sources: 1,
                    low_credibility_sources: 0,
                    average_credibility: 0.8
                },
                research_summary: '연구 요약'
            },
            logical_refutations: [
                {
                    claim: '주장 1',
                    refutation_type: '논리적 오류',
                    evidence: ['근거 1', '근거 2'],
                    counter_arguments: ['반박 1'],
                    confidence_score: 0.8,
                    refutation_strength: '강함'
                },
                {
                    claim: '주장 2',
                    refutation_type: '사실 오류',
                    evidence: [],
                    counter_arguments: ['반박 2', '반박 3'],
                    confidence_score: 0.6,
                    refutation_strength: '중간'
                }
            ],
            methodology_assessment: {
                sample_size: 10,
                source_diversity: 5,
                methodology_strength: '강함'
            },
            conclusion: '결론 내용',
            recommendations: ['권장사항 1', '권장사항 2'],
            confidence_score: 0.85
        };

        it('웹 연구 결과를 올바르게 포맷팅해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('## 🔍 웹 연구 기반 고도화된 분석 결과');
            expect(formatted).toContain('### 📋 연구 개요');
            expect(formatted).toContain('테스트 질문');
            expect(formatted).toContain('85.0%');
            expect(formatted).toContain('2개');
        });

        it('주요 발견사항을 포함해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('### 🔍 주요 발견사항');
            expect(formatted).toContain('발견사항 1');
            expect(formatted).toContain('발견사항 2');
        });

        it('합의점을 포함해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('### ✅ 합의점');
            expect(formatted).toContain('합의점 1');
            expect(formatted).toContain('합의점 2');
        });

        it('논리적 반박을 포함해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('### 🧠 논리적 반박');
            expect(formatted).toContain('반박 1: 논리적 오류');
            expect(formatted).toContain('반박 2: 사실 오류');
            expect(formatted).toContain('주장 1');
            expect(formatted).toContain('주장 2');
            expect(formatted).toContain('강함');
            expect(formatted).toContain('중간');
            expect(formatted).toContain('80.0%');
            expect(formatted).toContain('60.0%');
        });

        it('논리적 반박의 근거를 포함해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('근거 1');
            expect(formatted).toContain('근거 2');
        });

        it('논리적 반박의 반박 논리를 포함해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('반박 1');
            expect(formatted).toContain('반박 2');
            expect(formatted).toContain('반박 3');
        });

        it('방법론 평가를 포함해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('### 📊 방법론 평가');
            expect(formatted).toContain('10개');
            expect(formatted).toContain('5개 도메인');
            expect(formatted).toContain('강함');
        });

        it('결론을 포함해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('### 📝 결론');
            expect(formatted).toContain('결론 내용');
        });

        it('권장사항을 포함해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('### 💡 권장사항');
            expect(formatted).toContain('권장사항 1');
            expect(formatted).toContain('권장사항 2');
        });

        it('연구 소스 정보를 포함해야 함', () => {
            const formatted = webResearchService.formatWebResearchResponse(mockResult);

            expect(formatted).toContain('### 📚 연구 소스 정보');
            expect(formatted).toContain('1개');
            expect(formatted).toContain('0개');
            expect(formatted).toContain('80.0%');
        });

        it('주요 발견사항이 없으면 해당 섹션을 포함하지 않아야 함', () => {
            const resultWithoutFindings = {
                ...mockResult,
                research_results: {
                    ...mockResult.research_results,
                    key_findings: []
                }
            };

            const formatted = webResearchService.formatWebResearchResponse(resultWithoutFindings);

            expect(formatted).not.toContain('### 🔍 주요 발견사항');
        });

        it('합의점이 없으면 해당 섹션을 포함하지 않아야 함', () => {
            const resultWithoutConsensus = {
                ...mockResult,
                research_results: {
                    ...mockResult.research_results,
                    consensus_points: []
                }
            };

            const formatted = webResearchService.formatWebResearchResponse(resultWithoutConsensus);

            expect(formatted).not.toContain('### ✅ 합의점');
        });

        it('논리적 반박이 없으면 해당 섹션을 포함하지 않아야 함', () => {
            const resultWithoutRefutations = {
                ...mockResult,
                logical_refutations: []
            };

            const formatted = webResearchService.formatWebResearchResponse(resultWithoutRefutations);

            expect(formatted).not.toContain('### 🧠 논리적 반박');
        });

        it('논리적 반박에 근거가 없으면 근거 섹션을 포함하지 않아야 함', () => {
            const resultWithoutEvidence = {
                ...mockResult,
                logical_refutations: [
                    {
                        claim: '주장',
                        refutation_type: '타입',
                        evidence: [],
                        counter_arguments: ['반박'],
                        confidence_score: 0.8,
                        refutation_strength: '강함'
                    }
                ]
            };

            const formatted = webResearchService.formatWebResearchResponse(resultWithoutEvidence);

            expect(formatted).toContain('주장');
            expect(formatted).not.toContain('**근거**:');
        });

        it('논리적 반박에 반박 논리가 없으면 반박 논리 섹션을 포함하지 않아야 함', () => {
            const resultWithoutCounterArgs = {
                ...mockResult,
                logical_refutations: [
                    {
                        claim: '주장',
                        refutation_type: '타입',
                        evidence: ['근거'],
                        counter_arguments: [],
                        confidence_score: 0.8,
                        refutation_strength: '강함'
                    }
                ]
            };

            const formatted = webResearchService.formatWebResearchResponse(resultWithoutCounterArgs);

            expect(formatted).toContain('주장');
            expect(formatted).not.toContain('**반박 논리**:');
        });

        it('권장사항이 없으면 해당 섹션을 포함하지 않아야 함', () => {
            const resultWithoutRecommendations = {
                ...mockResult,
                recommendations: []
            };

            const formatted = webResearchService.formatWebResearchResponse(resultWithoutRecommendations);

            expect(formatted).not.toContain('### 💡 권장사항');
        });

        it('신뢰도 점수를 올바르게 포맷팅해야 함', () => {
            const resultWithLowConfidence = {
                ...mockResult,
                confidence_score: 0.123
            };

            const formatted = webResearchService.formatWebResearchResponse(resultWithLowConfidence);

            expect(formatted).toContain('12.3%');
        });

        it('평균 신뢰도를 올바르게 포맷팅해야 함', () => {
            const resultWithCustomAvg = {
                ...mockResult,
                research_results: {
                    ...mockResult.research_results,
                    credibility_assessment: {
                        ...mockResult.research_results.credibility_assessment,
                        average_credibility: 0.456
                    }
                }
            };

            const formatted = webResearchService.formatWebResearchResponse(resultWithCustomAvg);

            expect(formatted).toContain('45.6%');
        });
    });

    describe('getWebResearchDescription', () => {
        it('웹 연구 설명을 반환해야 함', () => {
            const description = webResearchService.getWebResearchDescription();

            expect(description).toContain('🔍 **웹 연구 기반 고도화된 분석**');
            expect(description).toContain('실시간 웹 검색');
            expect(description).toContain('정보 검증 시스템');
            expect(description).toContain('논리적 반박 생성');
            expect(description).toContain('법규 적용성 검토');
            expect(description).toContain('방법론 평가');
            expect(description).toContain('실행 권장사항 제공');
        });

        it('설명에 주요 기능이 포함되어야 함', () => {
            const description = webResearchService.getWebResearchDescription();

            expect(description).toContain('Google, Naver, Daum');
            expect(description).toContain('출처 신뢰도 평가');
            expect(description).toContain('논리적 오류 탐지');
        });
    });
});

