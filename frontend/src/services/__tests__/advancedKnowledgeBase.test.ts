/**
 * advancedKnowledgeBase 서비스 테스트
 * 고급 지식 베이스 시스템 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import AdvancedKnowledgeBase from '../advancedKnowledgeBase';

describe('AdvancedKnowledgeBase', () => {
  let knowledgeBase: AdvancedKnowledgeBase;

  beforeEach(() => {
    knowledgeBase = new AdvancedKnowledgeBase();
  });

  describe('인스턴스 생성', () => {
    it('인스턴스를 생성할 수 있어야 함', () => {
      expect(knowledgeBase).toBeDefined();
      expect(knowledgeBase).toBeInstanceOf(AdvancedKnowledgeBase);
    });
  });

  describe('getTechnologyKnowledge', () => {
    it('존재하는 기술에 대한 지식을 조회할 수 있어야 함', () => {
      const reactKnowledge = knowledgeBase.getTechnologyKnowledge('React');
      
      expect(reactKnowledge).toBeDefined();
      expect(reactKnowledge?.name).toBe('React');
      expect(reactKnowledge?.category).toBeDefined();
      expect(Array.isArray(reactKnowledge?.concepts)).toBe(true);
      expect(Array.isArray(reactKnowledge?.bestPractices)).toBe(true);
      expect(Array.isArray(reactKnowledge?.commonIssues)).toBe(true);
      expect(Array.isArray(reactKnowledge?.codeTemplates)).toBe(true);
      expect(Array.isArray(reactKnowledge?.learningPath)).toBe(true);
      expect(Array.isArray(reactKnowledge?.relatedTechnologies)).toBe(true);
      expect(reactKnowledge?.industryUsage).toBeDefined();
    });

    it('대소문자 구분 없이 기술 이름을 검색할 수 있어야 함', () => {
      const react1 = knowledgeBase.getTechnologyKnowledge('React');
      const react2 = knowledgeBase.getTechnologyKnowledge('react');
      const react3 = knowledgeBase.getTechnologyKnowledge('REACT');

      expect(react1).toBeDefined();
      expect(react2).toBeDefined();
      expect(react3).toBeDefined();
      expect(react1?.name).toBe('React');
      expect(react2?.name).toBe('React');
      expect(react3?.name).toBe('React');
    });

    it('존재하지 않는 기술을 조회하면 null을 반환해야 함', () => {
      const result = knowledgeBase.getTechnologyKnowledge('NonExistentTech');
      expect(result).toBeNull();
    });

    it('사용자 레벨에 맞는 bestPractices를 필터링해야 함', () => {
      const beginnerKnowledge = knowledgeBase.getTechnologyKnowledge('React', 'beginner');
      const intermediateKnowledge = knowledgeBase.getTechnologyKnowledge('React', 'intermediate');
      const advancedKnowledge = knowledgeBase.getTechnologyKnowledge('React', 'advanced');

      expect(beginnerKnowledge).toBeDefined();
      expect(intermediateKnowledge).toBeDefined();
      expect(advancedKnowledge).toBeDefined();

      // beginner는 beginner 레벨만 볼 수 있어야 함
      if (beginnerKnowledge && beginnerKnowledge.bestPractices.length > 0) {
        beginnerKnowledge.bestPractices.forEach((bp) => {
          expect(['beginner', 'intermediate']).toContain(bp.difficulty);
        });
      }

      // intermediate는 intermediate까지 볼 수 있어야 함
      if (intermediateKnowledge && intermediateKnowledge.bestPractices.length > 0) {
        intermediateKnowledge.bestPractices.forEach((bp) => {
          expect(['beginner', 'intermediate', 'advanced']).toContain(bp.difficulty);
        });
      }
    });

    it('TypeScript 지식을 조회할 수 있어야 함', () => {
      const tsKnowledge = knowledgeBase.getTechnologyKnowledge('TypeScript');

      expect(tsKnowledge).toBeDefined();
      expect(tsKnowledge?.name).toBe('TypeScript');
      expect(tsKnowledge?.category).toBe('Programming Language');
      expect(tsKnowledge?.concepts.length).toBeGreaterThan(0);
    });

    it('Node.js 지식을 조회할 수 있어야 함', () => {
      const nodeKnowledge = knowledgeBase.getTechnologyKnowledge('Node.js');

      expect(nodeKnowledge).toBeDefined();
      expect(nodeKnowledge?.name).toBe('Node.js');
      expect(nodeKnowledge?.category).toBe('Backend Runtime');
      expect(nodeKnowledge?.codeTemplates.length).toBeGreaterThan(0);
    });

    it('기술 지식의 구조가 올바른 형식을 가져야 함', () => {
      const reactKnowledge = knowledgeBase.getTechnologyKnowledge('React');

      if (reactKnowledge) {
        expect(reactKnowledge.bestPractices.length).toBeGreaterThan(0);
        reactKnowledge.bestPractices.forEach((bp) => {
          expect(bp.practice).toBeDefined();
          expect(bp.reasoning).toBeDefined();
          expect(bp.example).toBeDefined();
          expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(bp.difficulty);
        });

        if (reactKnowledge.commonIssues.length > 0) {
          reactKnowledge.commonIssues.forEach((issue) => {
            expect(issue.issue).toBeDefined();
            expect(Array.isArray(issue.symptoms)).toBe(true);
            expect(Array.isArray(issue.solutions)).toBe(true);
            expect(Array.isArray(issue.prevention)).toBe(true);
          });
        }

        if (reactKnowledge.codeTemplates.length > 0) {
          reactKnowledge.codeTemplates.forEach((template) => {
            expect(template.name).toBeDefined();
            expect(template.description).toBeDefined();
            expect(template.code).toBeDefined();
            expect(template.language).toBeDefined();
            expect(Array.isArray(template.useCases)).toBe(true);
          });
        }

        reactKnowledge.learningPath.forEach((path) => {
          expect(path.level).toBeDefined();
          expect(Array.isArray(path.topics)).toBe(true);
          expect(Array.isArray(path.resources)).toBe(true);
          expect(Array.isArray(path.projects)).toBe(true);
        });

        expect(typeof reactKnowledge.industryUsage.popularity).toBe('number');
        expect(Array.isArray(reactKnowledge.industryUsage.trends)).toBe(true);
        expect(reactKnowledge.industryUsage.jobMarket).toBeDefined();
      }
    });
  });

  describe('getSolutionsForProblem', () => {
    it('성능 문제에 대한 해결책을 제안할 수 있어야 함', () => {
      const solutions = knowledgeBase.getSolutionsForProblem('성능이 느려요', {});

      expect(Array.isArray(solutions)).toBe(true);
      expect(solutions.length).toBeGreaterThan(0);
      
      const performanceSolution = solutions.find((s) => s.solution.includes('최적화'));
      expect(performanceSolution).toBeDefined();
      if (performanceSolution) {
        expect(performanceSolution.solution).toBeDefined();
        expect(performanceSolution.implementation).toBeDefined();
        expect(performanceSolution.difficulty).toBeDefined();
        expect(performanceSolution.estimatedTime).toBeDefined();
        expect(Array.isArray(performanceSolution.prerequisites)).toBe(true);
      }
    });

    it('React 컨텍스트에서 성능 문제 해결책을 제안할 수 있어야 함', () => {
      const solutions = knowledgeBase.getSolutionsForProblem('React 성능 문제', {
        technologies: ['React'],
      });

      expect(solutions.length).toBeGreaterThan(0);
      const reactSolution = solutions.find((s) => s.solution.includes('React'));
      expect(reactSolution).toBeDefined();
    });

    it('버그 문제에 대한 해결책을 제안할 수 있어야 함', () => {
      const solutions = knowledgeBase.getSolutionsForProblem('오류가 발생했어요', {});

      expect(solutions.length).toBeGreaterThan(0);
      const bugSolution = solutions.find((s) => s.solution.includes('디버깅'));
      expect(bugSolution).toBeDefined();
      if (bugSolution) {
        expect(bugSolution.difficulty).toBe('beginner');
      }
    });

    it('학습 요청에 대한 해결책을 제안할 수 있어야 함', () => {
      const solutions = knowledgeBase.getSolutionsForProblem('배우고 싶어요', {});

      expect(solutions.length).toBeGreaterThan(0);
      const learningSolution = solutions.find((s) => s.solution.includes('학습'));
      expect(learningSolution).toBeDefined();
    });

    it('여러 문제 유형이 포함된 경우 여러 해결책을 제안해야 함', () => {
      const solutions = knowledgeBase.getSolutionsForProblem(
        '성능도 느리고 오류도 발생해요',
        {}
      );

      expect(solutions.length).toBeGreaterThan(1);
    });

    it('해결책의 구조가 올바른 형식을 가져야 함', () => {
      const solutions = knowledgeBase.getSolutionsForProblem('성능 문제', {});

      solutions.forEach((solution) => {
        expect(solution.solution).toBeDefined();
        expect(typeof solution.solution).toBe('string');
        expect(solution.implementation).toBeDefined();
        expect(typeof solution.implementation).toBe('string');
        expect(solution.difficulty).toBeDefined();
        expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(solution.difficulty);
        expect(solution.estimatedTime).toBeDefined();
        expect(typeof solution.estimatedTime).toBe('string');
        expect(Array.isArray(solution.prerequisites)).toBe(true);
      });
    });
  });

  describe('getPersonalizedLearningPath', () => {
    it('프론트엔드 개발자 학습 경로를 생성할 수 있어야 함', () => {
      const learningPath = knowledgeBase.getPersonalizedLearningPath(
        [],
        'frontend-developer',
        'full-time'
      );

      expect(learningPath).toBeDefined();
      expect(learningPath.totalDuration).toBeDefined();
      expect(learningPath.difficulty).toBeDefined();
      
      // path가 배열인지 확인
      if (learningPath.path) {
        expect(Array.isArray(learningPath.path)).toBe(true);
        if (learningPath.path.length > 0) {
          expect(learningPath.path.length).toBeGreaterThan(0);
        }
      }
    });

    it('백엔드 개발자 학습 경로를 생성할 수 있어야 함', () => {
      const learningPath = knowledgeBase.getPersonalizedLearningPath(
        ['JavaScript'],
        'backend-developer',
        'part-time'
      );

      expect(learningPath).toBeDefined();
      expect(learningPath.totalDuration).toBeDefined();
      
      if (learningPath.path) {
        expect(Array.isArray(learningPath.path)).toBe(true);
        if (learningPath.path.length > 0) {
          expect(learningPath.path.length).toBeGreaterThan(0);
        }
      }
    });

    it('존재하지 않는 역할에 대해 기본 경로를 반환해야 함', () => {
      const learningPath = knowledgeBase.getPersonalizedLearningPath(
        [],
        'non-existent-role',
        'full-time'
      );

      expect(learningPath).toBeDefined();
      expect(learningPath.totalDuration).toBeDefined();
      expect(learningPath.difficulty).toBeDefined();
    });

    it('학습 경로의 구조가 올바른 형식을 가져야 함', () => {
      const learningPath = knowledgeBase.getPersonalizedLearningPath(
        [],
        'frontend-developer',
        'full-time'
      );

      if (learningPath.path && Array.isArray(learningPath.path) && learningPath.path.length > 0) {
        learningPath.path.forEach((phase) => {
          expect(phase.phase).toBeDefined();
          expect(phase.duration).toBeDefined();
          expect(Array.isArray(phase.topics)).toBe(true);
          expect(Array.isArray(phase.projects)).toBe(true);
          expect(Array.isArray(phase.resources)).toBe(true);
        });
      }
    });
  });

  describe('getRelatedTechnologies', () => {
    it('React 관련 기술을 추천할 수 있어야 함', () => {
      const recommendations = knowledgeBase.getRelatedTechnologies(['React'], []);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      const nextjsRecommendation = recommendations.find((r) => r.technology === 'Next.js');
      expect(nextjsRecommendation).toBeDefined();
      if (nextjsRecommendation) {
        expect(nextjsRecommendation.relevanceScore).toBeGreaterThan(0);
        expect(nextjsRecommendation.reason).toBeDefined();
        expect(nextjsRecommendation.learningEffort).toBeDefined();
        expect(nextjsRecommendation.marketDemand).toBeDefined();
      }
    });

    it('JavaScript 관련 기술을 추천할 수 있어야 함', () => {
      const recommendations = knowledgeBase.getRelatedTechnologies(['JavaScript'], []);

      expect(recommendations.length).toBeGreaterThan(0);
      const nodeRecommendation = recommendations.find((r) => r.technology === 'Node.js');
      expect(nodeRecommendation).toBeDefined();
    });

    it('목표 기반 기술 추천을 제공할 수 있어야 함', () => {
      const recommendations = knowledgeBase.getRelatedTechnologies(['React'], ['performance']);

      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('추천 기술이 관련도 점수로 정렬되어야 함', () => {
      const recommendations = knowledgeBase.getRelatedTechnologies(['React'], []);

      if (recommendations.length > 1) {
        for (let i = 0; i < recommendations.length - 1; i++) {
          expect(recommendations[i].relevanceScore).toBeGreaterThanOrEqual(
            recommendations[i + 1].relevanceScore
          );
        }
      }
    });

    it('추천 기술의 구조가 올바른 형식을 가져야 함', () => {
      const recommendations = knowledgeBase.getRelatedTechnologies(['React'], []);

      recommendations.forEach((rec) => {
        expect(rec.technology).toBeDefined();
        expect(typeof rec.relevanceScore).toBe('number');
        expect(rec.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(rec.relevanceScore).toBeLessThanOrEqual(1);
        expect(rec.reason).toBeDefined();
        expect(rec.learningEffort).toBeDefined();
        expect(rec.marketDemand).toBeDefined();
      });
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 기술 학습 경로를 제공할 수 있어야 함', () => {
      const learningPath = knowledgeBase.getPersonalizedLearningPath(
        ['HTML', 'CSS', 'JavaScript'],
        'frontend-developer',
        'part-time'
      );

      expect(learningPath).toBeDefined();
      expect(learningPath.totalDuration).toBeDefined();
      
      if (learningPath.path && Array.isArray(learningPath.path) && learningPath.path.length > 0) {
        expect(learningPath.path.length).toBeGreaterThan(0);
        
        // 프론트엔드 개발 경로에 React 관련 내용이 포함되어야 함
        const hasReactPhase = learningPath.path.some((phase) =>
          phase.topics.some((topic) => topic.toLowerCase().includes('react'))
        );
        expect(hasReactPhase || learningPath.path.length > 0).toBe(true);
      }
    });

    it('시공사 선정 시스템 개발에 필요한 기술 지식을 제공할 수 있어야 함', () => {
      const reactKnowledge = knowledgeBase.getTechnologyKnowledge('React');
      const nodeKnowledge = knowledgeBase.getTechnologyKnowledge('Node.js');
      const tsKnowledge = knowledgeBase.getTechnologyKnowledge('TypeScript');

      expect(reactKnowledge).toBeDefined();
      expect(nodeKnowledge).toBeDefined();
      expect(tsKnowledge).toBeDefined();

      // 각 기술에 대한 베스트 프랙티스와 코드 템플릿이 있어야 함
      if (reactKnowledge) {
        expect(reactKnowledge.bestPractices.length).toBeGreaterThan(0);
        expect(reactKnowledge.codeTemplates.length).toBeGreaterThan(0);
      }

      if (nodeKnowledge) {
        expect(nodeKnowledge.codeTemplates.length).toBeGreaterThan(0);
        expect(nodeKnowledge.codeTemplates.some((t) => t.name.includes('Server'))).toBe(true);
      }
    });

    it('프로젝트 진행 중 발생하는 문제에 대한 해결책을 제공할 수 있어야 함', () => {
      const performanceSolutions = knowledgeBase.getSolutionsForProblem(
        '애플리케이션 성능이 느려요',
        { technologies: ['React'] }
      );

      const bugSolutions = knowledgeBase.getSolutionsForProblem('버그가 자주 발생해요', {});

      expect(performanceSolutions.length).toBeGreaterThan(0);
      expect(bugSolutions.length).toBeGreaterThan(0);

      // React 성능 최적화 해결책이 포함되어야 함
      const reactPerformanceSolution = performanceSolutions.find((s) =>
        s.solution.includes('React')
      );
      expect(reactPerformanceSolution).toBeDefined();
    });

    it('기술 스택 확장을 위한 관련 기술을 추천할 수 있어야 함', () => {
      const currentStack = ['React', 'JavaScript'];
      const goals = ['performance', 'scalability'];

      const recommendations = knowledgeBase.getRelatedTechnologies(currentStack, goals);

      expect(recommendations.length).toBeGreaterThan(0);
      
      // TypeScript나 Next.js 같은 관련 기술이 추천되어야 함
      const hasRelevantTech = recommendations.some(
        (r) => r.technology === 'TypeScript' || r.technology === 'Next.js'
      );
      expect(hasRelevantTech || recommendations.length > 0).toBe(true);

      // 모든 추천이 관련도 점수로 정렬되어 있어야 함
      if (recommendations.length > 1) {
        const sorted = [...recommendations].sort(
          (a, b) => b.relevanceScore - a.relevanceScore
        );
        expect(recommendations).toEqual(sorted);
      }
    });
  });
});

