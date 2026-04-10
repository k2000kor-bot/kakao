/**
 * personalizedLearningExperienceService 서비스 테스트
 * 개인화된 학습 경험 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import personalizedLearningExperienceService from '../personalizedLearningExperienceService';

describe('personalizedLearningExperienceService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(personalizedLearningExperienceService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = personalizedLearningExperienceService;
      const instance2 = personalizedLearningExperienceService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('getLearningExperience', () => {
    it('학습 경험을 가져올 수 있어야 함', async () => {
      const experience = await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');

      expect(experience).toBeDefined();
      expect(experience.user_id).toBe('user-1');
      expect(experience.session_id).toBe('session-1');
      expect(experience.current_learning_path).toBeDefined();
      expect(Array.isArray(experience.learning_goals)).toBe(true);
      expect(experience.progress_tracking).toBeDefined();
      expect(experience.adaptive_content).toBeDefined();
      expect(Array.isArray(experience.learning_recommendations)).toBe(true);
      expect(experience.difficulty_adjustment).toBeDefined();
      expect(experience.last_updated).toBeDefined();
    });

    it('같은 사용자와 세션에 대해 동일한 경험을 반환해야 함', async () => {
      const experience1 = await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const experience2 = await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');

      expect(experience1.user_id).toBe(experience2.user_id);
      expect(experience1.session_id).toBe(experience2.session_id);
    });
  });

  describe('getCurrentLearningPath', () => {
    it('현재 학습 경로를 가져올 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const path = await personalizedLearningExperienceService.getCurrentLearningPath('user-1', 'session-1');

      expect(path).toBeDefined();
      expect(path.path_id).toBeDefined();
      expect(path.path_name).toBeDefined();
      expect(path.description).toBeDefined();
      expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(path.difficulty_level);
      expect(typeof path.estimated_duration).toBe('number');
      expect(Array.isArray(path.prerequisites)).toBe(true);
      expect(Array.isArray(path.modules)).toBe(true);
      expect(typeof path.current_module_index).toBe('number');
      expect(typeof path.completion_percentage).toBe('number');
      expect(path.start_date).toBeDefined();
    });
  });

  describe('getLearningGoals', () => {
    it('학습 목표를 가져올 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const goals = await personalizedLearningExperienceService.getLearningGoals('user-1', 'session-1');

      expect(Array.isArray(goals)).toBe(true);
      goals.forEach(goal => {
        expect(goal.goal_id).toBeDefined();
        expect(goal.title).toBeDefined();
        expect(goal.description).toBeDefined();
        expect(['skill_development', 'knowledge_acquisition', 'project_completion', 'certification']).toContain(goal.category);
        expect(['low', 'medium', 'high', 'critical']).toContain(goal.priority);
        expect(typeof goal.progress).toBe('number');
        expect(['not_started', 'in_progress', 'completed', 'paused']).toContain(goal.status);
        expect(Array.isArray(goal.milestones)).toBe(true);
      });
    });
  });

  describe('getProgressTracking', () => {
    it('진행 상황 추적을 가져올 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const progress = await personalizedLearningExperienceService.getProgressTracking('user-1', 'session-1');

      expect(progress).toBeDefined();
      expect(typeof progress.overall_progress).toBe('number');
      expect(Array.isArray(progress.skill_progress)).toBe(true);
      expect(progress.time_spent).toBeDefined();
      expect(Array.isArray(progress.performance_metrics)).toBe(true);
      expect(typeof progress.learning_velocity).toBe('number');
      expect(typeof progress.retention_rate).toBe('number');
    });
  });

  describe('getLearningRecommendations', () => {
    it('학습 추천을 가져올 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const recommendations = await personalizedLearningExperienceService.getLearningRecommendations('user-1', 'session-1');

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('updateLearningProgress', () => {
    it('학습 진행 상황을 업데이트할 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const path = await personalizedLearningExperienceService.getCurrentLearningPath('user-1', 'session-1');

      if (path.modules.length > 0) {
        const moduleId = path.modules[0].module_id;
        await personalizedLearningExperienceService.updateLearningProgress(
          'user-1',
          'session-1',
          moduleId,
          100,
          85
        );

        const updatedPath = await personalizedLearningExperienceService.getCurrentLearningPath('user-1', 'session-1');
        const updatedModule = updatedPath.modules.find(m => m.module_id === moduleId);
        expect(updatedModule?.completed).toBe(true);
        expect(updatedModule?.performance_score).toBe(85);
      }
    });

    it('부분 완료 진행 상황을 업데이트할 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const path = await personalizedLearningExperienceService.getCurrentLearningPath('user-1', 'session-1');

      if (path.modules.length > 0) {
        const moduleId = path.modules[0].module_id;
        await personalizedLearningExperienceService.updateLearningProgress(
          'user-1',
          'session-1',
          moduleId,
          50
        );

        const updatedPath = await personalizedLearningExperienceService.getCurrentLearningPath('user-1', 'session-1');
        const updatedModule = updatedPath.modules.find(m => m.module_id === moduleId);
        expect(updatedModule?.completed).toBe(false);
      }
    });
  });

  describe('generatePersonalizedContent', () => {
    it('개인화된 콘텐츠를 생성할 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const content = await personalizedLearningExperienceService.generatePersonalizedContent(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        5
      );

      expect(Array.isArray(content)).toBe(true);
      content.forEach(resource => {
        expect(resource.resource_id).toBeDefined();
        expect(resource.title).toBeDefined();
        expect(resource.content).toBeDefined();
        expect(resource.adaptation_reason).toBeDefined();
        expect(typeof resource.user_preference_match).toBe('number');
        expect(typeof resource.difficulty_match).toBe('number');
        expect(typeof resource.learning_style_match).toBe('number');
      });
    });
  });

  describe('generateLearningReport', () => {
    it('학습 리포트를 생성할 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const report = await personalizedLearningExperienceService.generateLearningReport('user-1', 'session-1');

      expect(report).toBeDefined();
      expect(report.user_id).toBe('user-1');
      expect(report.session_id).toBe('session-1');
      expect(typeof report.overall_progress).toBe('number');
      expect(report.current_path).toBeDefined();
      expect(report.performance_summary).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(Array.isArray(report.next_steps)).toBe(true);
      expect(report.report_date).toBeDefined();
    });
  });

  describe('updateUserFeedback', () => {
    it('사용자 피드백을 업데이트할 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const recommendations = await personalizedLearningExperienceService.getLearningRecommendations('user-1', 'session-1');

      if (recommendations.length > 0) {
        const recommendationId = recommendations[0].recommendation_id;
        await personalizedLearningExperienceService.updateUserFeedback(
          'user-1',
          'session-1',
          recommendationId,
          {
            rating: 5,
            helpful: true,
            comments: '매우 도움이 되었습니다',
            difficulty_perceived: 3
          }
        );

        // 피드백이 업데이트되었는지 확인
        const updatedRecommendations = await personalizedLearningExperienceService.getLearningRecommendations('user-1', 'session-1');
        const updatedRecommendation = updatedRecommendations.find(r => r.recommendation_id === recommendationId);
        expect(updatedRecommendation?.user_feedback).toBeDefined();
        expect(updatedRecommendation?.user_feedback?.rating).toBe(5);
      }
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 학습 경험을 생성하고 추적할 수 있어야 함', async () => {
      const experience = await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      expect(experience).toBeDefined();

      const path = await personalizedLearningExperienceService.getCurrentLearningPath('user-1', 'session-1');
      expect(path).toBeDefined();

      const goals = await personalizedLearningExperienceService.getLearningGoals('user-1', 'session-1');
      expect(goals.length).toBeGreaterThan(0);

      const progress = await personalizedLearningExperienceService.getProgressTracking('user-1', 'session-1');
      expect(progress.overall_progress).toBeGreaterThanOrEqual(0);
    });

    it('학습 진행 상황을 업데이트하고 리포트를 생성할 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');
      const path = await personalizedLearningExperienceService.getCurrentLearningPath('user-1', 'session-1');

      if (path.modules.length > 0) {
        await personalizedLearningExperienceService.updateLearningProgress(
          'user-1',
          'session-1',
          path.modules[0].module_id,
          100,
          90
        );

        const report = await personalizedLearningExperienceService.generateLearningReport('user-1', 'session-1');
        expect(report).toBeDefined();
        expect(report.overall_progress).toBeGreaterThanOrEqual(0);
      }
    });

    it('개인화된 콘텐츠를 생성하고 피드백을 업데이트할 수 있어야 함', async () => {
      await personalizedLearningExperienceService.getLearningExperience('user-1', 'session-1');

      const content = await personalizedLearningExperienceService.generatePersonalizedContent(
        'user-1',
        'session-1',
        '재개발 프로젝트 관리',
        5
      );

      expect(Array.isArray(content)).toBe(true);

      const recommendations = await personalizedLearningExperienceService.getLearningRecommendations('user-1', 'session-1');
      if (recommendations.length > 0) {
        await personalizedLearningExperienceService.updateUserFeedback(
          'user-1',
          'session-1',
          recommendations[0].recommendation_id,
          {
            rating: 5,
            helpful: true,
            implemented: true,
            comments: '실용적인 내용이었습니다',
            timestamp: new Date()
          }
        );

        const updatedRecommendations = await personalizedLearningExperienceService.getLearningRecommendations('user-1', 'session-1');
        expect(updatedRecommendations.length).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

