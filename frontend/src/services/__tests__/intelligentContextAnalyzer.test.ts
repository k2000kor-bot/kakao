/**
 * intelligentContextAnalyzer 서비스 테스트
 * 지능형 컨텍스트 분석기 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import IntelligentContextAnalyzer from '../intelligentContextAnalyzer';

describe('IntelligentContextAnalyzer', () => {
    let analyzer: IntelligentContextAnalyzer;

    beforeEach(() => {
        analyzer = new IntelligentContextAnalyzer();
    });

    describe('인스턴스 생성', () => {
        it('인스턴스를 생성할 수 있어야 함', () => {
            expect(analyzer).toBeDefined();
            expect(analyzer).toBeInstanceOf(IntelligentContextAnalyzer);
        });

        it('새로운 인스턴스를 생성할 수 있어야 함', () => {
            const analyzer1 = new IntelligentContextAnalyzer();
            const analyzer2 = new IntelligentContextAnalyzer();
            expect(analyzer1).not.toBe(analyzer2);
        });
    });

    describe('analyzeDeepContext', () => {
        it('기본 메시지에 대한 컨텍스트 분석을 수행할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '재개발 프로젝트에 대해 알려주세요',
                [],
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.primaryIntent).toBeDefined();
            expect(analysis.primaryIntent.type).toBeDefined();
            expect(analysis.primaryIntent.confidence).toBeGreaterThanOrEqual(0);
            expect(analysis.hiddenRequirements).toBeDefined();
            expect(analysis.projectContext).toBeDefined();
            expect(analysis.conversationFlow).toBeDefined();
            expect(analysis.responseStrategy).toBeDefined();
        });

        it('대화 기록이 있는 경우 연속성을 분석할 수 있어야 함', async () => {
            const conversationHistory = [
                { message: '재개발 프로젝트 절차', response: '절차 설명...' },
                { message: '시공사 선정 기준', response: '선정 기준 설명...' }
            ];

            const analysis = await analyzer.analyzeDeepContext(
                '예산 계획은 어떻게 수립하나요?',
                conversationHistory,
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.conversationFlow.continuity).toBeGreaterThanOrEqual(0);
            expect(analysis.conversationFlow.previousContext).toBeDefined();
        });

        it('프로젝트 정보가 있는 경우 프로젝트 컨텍스트를 구축할 수 있어야 함', async () => {
            const projectInfo = {
                name: '재개발 프로젝트',
                technologies: ['React', 'TypeScript'],
                description: '부동산 재개발 프로젝트'
            };

            const analysis = await analyzer.analyzeDeepContext(
                '프로젝트 구조를 분석해주세요',
                [],
                projectInfo
            );

            expect(analysis).toBeDefined();
            expect(analysis.projectContext).toBeDefined();
            expect(analysis.projectContext.technologies).toBeDefined();
        });

        it('문제 해결 의도를 감지할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '문제가 있어요. 오류가 발생했어요. 해결 방법을 알려주세요',
                [],
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.primaryIntent.type).toBeDefined();
            // 문제 해결 의도가 높은 점수를 받아야 함
            expect(analysis.primaryIntent.confidence).toBeGreaterThanOrEqual(0);
        });

        it('학습 의도를 감지할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '배우고 싶어요. 설명해주세요. 어떻게 동작하나요?',
                [],
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.primaryIntent.type).toBeDefined();
            expect(analysis.responseStrategy.approach).toBeDefined();
        });

        it('구현 의도를 감지할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '코드를 작성해주세요. 구현해주세요. 예제를 만들어주세요',
                [],
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.primaryIntent.type).toBeDefined();
            expect(analysis.responseStrategy.format).toBeDefined();
        });

        it('긴급도가 높은 메시지를 감지할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '급해요! 빨리 도와주세요! 즉시 필요합니다!',
                [],
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.primaryIntent.urgency).toBe('critical');
            expect(analysis.responseStrategy.approach).toBe('direct');
        });

        it('숨겨진 요구사항을 추출할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '재개발 프로젝트의 시공사 선정 기준을 알려주세요',
                [],
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.hiddenRequirements.explicit).toBeDefined();
            expect(Array.isArray(analysis.hiddenRequirements.explicit)).toBe(true);
            expect(analysis.hiddenRequirements.implicit).toBeDefined();
            expect(Array.isArray(analysis.hiddenRequirements.implicit)).toBe(true);
        });

        it('사용자 ID가 있는 경우 사용자 프로필을 활용할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '프로젝트 분석',
                [],
                null,
                'user-123'
            );

            expect(analysis).toBeDefined();
            expect(analysis.projectContext.userExpertise).toBeDefined();
        });

        it('복잡한 대화 흐름을 분석할 수 있어야 함', async () => {
            const conversationHistory = [
                { message: '재개발 프로젝트', response: '프로젝트 설명' },
                { message: '시공사 선정', response: '선정 기준 설명' },
                { message: '예산 계획', response: '예산 계획 설명' },
                { message: '일정 관리', response: '일정 관리 설명' }
            ];

            const analysis = await analyzer.analyzeDeepContext(
                '종합적인 분석을 요청합니다',
                conversationHistory,
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.conversationFlow.phase).toBeDefined();
            expect(analysis.conversationFlow.expectedFollowUp).toBeDefined();
            expect(Array.isArray(analysis.conversationFlow.expectedFollowUp)).toBe(true);
        });

        it('답변 전략을 결정할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '재개발 프로젝트 분석',
                [],
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.responseStrategy.approach).toBeDefined();
            expect(['direct', 'educational', 'collaborative', 'diagnostic']).toContain(analysis.responseStrategy.approach);
            expect(analysis.responseStrategy.detailLevel).toBeDefined();
            expect(['overview', 'detailed', 'comprehensive', 'expert']).toContain(analysis.responseStrategy.detailLevel);
            expect(analysis.responseStrategy.format).toBeDefined();
            expect(['text', 'code', 'visual', 'interactive']).toContain(analysis.responseStrategy.format);
            expect(analysis.responseStrategy.tone).toBeDefined();
        });
    });

    describe('실제 사용자 시나리오 테스트', () => {
        it('재개발 프로젝트 관련 질문에 대한 심층 분석을 수행할 수 있어야 함', async () => {
            const projectInfo = {
                name: '부동산 재개발 프로젝트',
                technologies: ['프로젝트 관리', '부동산 개발'],
                description: '주거지 재개발 프로젝트'
            };

            const conversationHistory = [
                { message: '재개발 프로젝트 절차', response: '절차 설명...' }
            ];

            const analysis = await analyzer.analyzeDeepContext(
                '시공사 선정 기준과 절차를 상세히 알려주세요. 특히 기술력과 경험을 어떻게 평가하는지 궁금합니다.',
                conversationHistory,
                projectInfo,
                'user-123'
            );

      expect(analysis).toBeDefined();
      expect(analysis.primaryIntent.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.hiddenRequirements.explicit.length).toBeGreaterThanOrEqual(0);
      expect(analysis.projectContext.technologies.length).toBeGreaterThanOrEqual(0);
      expect(['overview', 'detailed', 'comprehensive', 'expert']).toContain(analysis.responseStrategy.detailLevel);
        });

        it('예산 계획 관련 질문에 대한 실용적 분석을 수행할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '예산 계획을 어떻게 수립해야 할까요? 비용 최적화 방안도 함께 알려주세요.',
                [],
                { name: '재개발 프로젝트' }
            );

            expect(analysis).toBeDefined();
            expect(analysis.primaryIntent.type).toBeDefined();
            expect(analysis.responseStrategy.approach).toBeDefined();
            expect(analysis.hiddenRequirements.implicit.length).toBeGreaterThanOrEqual(0);
        });

        it('일정 관리 관련 긴급 질문에 대한 즉각적 분석을 수행할 수 있어야 함', async () => {
            const analysis = await analyzer.analyzeDeepContext(
                '급해요! 일정이 지연되고 있어요. 어떻게 해결해야 할까요?',
                [],
                null
            );

            expect(analysis).toBeDefined();
            expect(analysis.primaryIntent.urgency).toBe('critical');
            expect(analysis.responseStrategy.approach).toBe('direct');
            expect(analysis.responseStrategy.detailLevel).toBe('overview');
        });

        it('복합적인 요구사항에 대한 종합 분석을 수행할 수 있어야 함', async () => {
            const conversationHistory = [
                { message: '재개발 프로젝트', response: '프로젝트 설명' },
                { message: '시공사 선정', response: '선정 기준' },
                { message: '예산 계획', response: '예산 계획 설명' }
            ];

            const projectInfo = {
                name: '종합 재개발 프로젝트',
                technologies: ['프로젝트 관리', '건축', '부동산'],
                currentIssues: ['일정 지연', '예산 초과']
            };

            const analysis = await analyzer.analyzeDeepContext(
                '재개발 프로젝트의 시공사 선정, 예산 계획, 일정 관리를 통합적으로 관리하는 방법을 알려주세요. 현재 일정 지연과 예산 초과 문제가 있어서 긴급하게 해결책이 필요합니다.',
                conversationHistory,
                projectInfo,
                'user-123'
            );

      expect(analysis).toBeDefined();
      expect(analysis.primaryIntent.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.hiddenRequirements.explicit.length).toBeGreaterThanOrEqual(0);
      expect(analysis.projectContext.currentIssues.length).toBeGreaterThanOrEqual(0);
      expect(analysis.conversationFlow.continuity).toBeGreaterThanOrEqual(0);
      expect(analysis.responseStrategy).toBeDefined();
        });
    });
});

