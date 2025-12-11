/**
 * knowledgeService 서비스 테스트
 * 지식 베이스 서비스 테스트
 */

import knowledgeService from '../knowledgeService';
import { Document, Guideline, LogicRule, MessageGenerationRequest } from '../../types/knowledge';

describe('knowledgeService', () => {
  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(knowledgeService).toBeDefined();
    });
  });

  describe('createKnowledgeBase', () => {
    it('지식 베이스를 생성할 수 있어야 함', async () => {
      const kb = await knowledgeService.createKnowledgeBase({
        name: '테스트 지식 베이스',
        description: '테스트용',
        documents: [],
        guidelines: [],
        logicRules: [],
      });

      expect(kb).toBeDefined();
      expect(kb.id).toBeDefined();
      expect(kb.name).toBe('테스트 지식 베이스');
      expect(kb.createdAt).toBeDefined();
      expect(kb.updatedAt).toBeDefined();
    });
  });

  describe('getKnowledgeBase', () => {
    it('지식 베이스를 조회할 수 있어야 함', async () => {
      const kb = await knowledgeService.createKnowledgeBase({
        name: '조회 테스트',
        description: '테스트',
        documents: [],
        guidelines: [],
        logicRules: [],
      });

      const retrieved = await knowledgeService.getKnowledgeBase(kb.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('조회 테스트');
    });

    it('존재하지 않는 지식 베이스는 null을 반환해야 함', async () => {
      const retrieved = await knowledgeService.getKnowledgeBase('nonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('updateKnowledgeBase', () => {
    it('지식 베이스를 업데이트할 수 있어야 함', async () => {
      const kb = await knowledgeService.createKnowledgeBase({
        name: '원본 이름',
        description: '원본 설명',
        documents: [],
        guidelines: [],
        logicRules: [],
      });

      const updated = await knowledgeService.updateKnowledgeBase(kb.id, {
        name: '수정된 이름',
        description: '수정된 설명',
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('수정된 이름');
      expect(updated?.description).toBe('수정된 설명');
      expect(updated?.updatedAt).toBeDefined();
    });

    it('존재하지 않는 지식 베이스 업데이트는 null을 반환해야 함', async () => {
      const updated = await knowledgeService.updateKnowledgeBase('nonexistent', {
        name: '수정',
      });

      expect(updated).toBeNull();
    });
  });

  describe('processDocument', () => {
    it('문서를 처리할 수 있어야 함', async () => {
      const document: Document = {
        id: 'doc-1',
        title: '테스트 문서',
        content: '테스트 내용입니다. 좋은 결과가 나왔습니다.',
        type: 'text',
        embeddings: [],
      };

      const result = await knowledgeService.processDocument(document);

      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.extractedInfo).toBeDefined();
      expect(result.embeddings).toBeDefined();
      expect(result.embeddings.length).toBe(768);
    });

    it('문서 처리 결과에 메타데이터가 포함되어야 함', async () => {
      const document: Document = {
        id: 'doc-1',
        title: '테스트',
        content: '내용',
        type: 'text',
        embeddings: [],
      };

      const result = await knowledgeService.processDocument(document);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.processedAt).toBeDefined();
      expect(result.metadata.documentId).toBe('doc-1');
    });
  });

  describe('addGuideline', () => {
    it('지침을 추가할 수 있어야 함', async () => {
      const kb = await knowledgeService.createKnowledgeBase({
        name: '테스트',
        description: '테스트',
        documents: [],
        guidelines: [],
        logicRules: [],
      });

      const guideline = await knowledgeService.addGuideline(kb.id, {
        title: '테스트 지침',
        content: '지침 내용',
        category: 'general',
        priority: 'high',
      });

      expect(guideline).toBeDefined();
      expect(guideline.id).toBeDefined();
      expect(guideline.title).toBe('테스트 지침');
      expect(guideline.createdAt).toBeDefined();
    });

    it('존재하지 않는 지식 베이스에 지침 추가는 에러를 발생시켜야 함', async () => {
      await expect(
        knowledgeService.addGuideline('nonexistent', {
          title: '테스트',
          content: '내용',
          category: 'general',
          priority: 'high',
        })
      ).rejects.toThrow('지식 베이스를 찾을 수 없습니다.');
    });
  });

  describe('addLogicRule', () => {
    it('논리 규칙을 추가할 수 있어야 함', async () => {
      const kb = await knowledgeService.createKnowledgeBase({
        name: '테스트',
        description: '테스트',
        documents: [],
        guidelines: [],
        logicRules: [],
      });

      const rule = await knowledgeService.addLogicRule(kb.id, {
        name: '테스트 규칙',
        description: '규칙 설명',
        conditions: [],
        actions: [],
        priority: 1,
        isActive: true,
      });

      expect(rule).toBeDefined();
      expect(rule.id).toBeDefined();
      expect(rule.name).toBe('테스트 규칙');
    });

    it('존재하지 않는 지식 베이스에 규칙 추가는 에러를 발생시켜야 함', async () => {
      await expect(
        knowledgeService.addLogicRule('nonexistent', {
          name: '테스트',
          description: '설명',
          conditions: [],
          actions: [],
          priority: 1,
          isActive: true,
        })
      ).rejects.toThrow('지식 베이스를 찾을 수 없습니다.');
    });
  });

  describe('getGuidelines', () => {
    it('모든 지침을 조회할 수 있어야 함', async () => {
      const kb1 = await knowledgeService.createKnowledgeBase({
        name: 'KB1',
        description: '테스트',
        documents: [],
        guidelines: [],
        logicRules: [],
      });

      const kb2 = await knowledgeService.createKnowledgeBase({
        name: 'KB2',
        description: '테스트',
        documents: [],
        guidelines: [],
        logicRules: [],
      });

      await knowledgeService.addGuideline(kb1.id, {
        title: '지침1',
        content: '내용1',
        category: 'general',
        priority: 'high',
      });

      await knowledgeService.addGuideline(kb2.id, {
        title: '지침2',
        content: '내용2',
        category: 'general',
        priority: 'medium',
      });

      const guidelines = await knowledgeService.getGuidelines();

      expect(guidelines.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('generateMessage', () => {
    it('메시지를 생성할 수 있어야 함', async () => {
      const kb = await knowledgeService.createKnowledgeBase({
        name: '테스트',
        description: '테스트',
        documents: [],
        guidelines: [],
        logicRules: [],
      });

      const request: MessageGenerationRequest = {
        knowledgeBaseId: kb.id,
        context: '테스트 컨텍스트',
        userPreferences: {
          tone: 'professional',
          style: 'analytical',
          length: 'medium',
        },
      };

      const response = await knowledgeService.generateMessage(request);

      expect(response).toBeDefined();
      expect(response.generatedMessage).toBeDefined();
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
      expect(response.reasoning).toBeDefined();
      expect(response.metadata).toBeDefined();
    });

    it('존재하지 않는 지식 베이스로 메시지 생성은 에러를 발생시켜야 함', async () => {
      const request: MessageGenerationRequest = {
        knowledgeBaseId: 'nonexistent',
        context: '테스트',
        userPreferences: {
          tone: 'professional',
          style: 'analytical',
          length: 'medium',
        },
      };

      await expect(knowledgeService.generateMessage(request)).rejects.toThrow(
        '지식 베이스를 찾을 수 없습니다.'
      );
    });
  });

  describe('setAIConfig / getAIConfig', () => {
    it('AI 설정을 업데이트할 수 있어야 함', () => {
      const originalConfig = knowledgeService.getAIConfig();

      knowledgeService.setAIConfig({
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
      });

      const updatedConfig = knowledgeService.getAIConfig();
      expect(updatedConfig.model).toBe('gpt-3.5-turbo');
      expect(updatedConfig.temperature).toBe(0.5);
      expect(updatedConfig.maxTokens).toBe(originalConfig.maxTokens); // 다른 설정은 유지
    });

    it('AI 설정을 조회할 수 있어야 함', () => {
      const config = knowledgeService.getAIConfig();

      expect(config).toBeDefined();
      expect(config.model).toBeDefined();
      expect(config.temperature).toBeDefined();
      expect(config.maxTokens).toBeDefined();
    });
  });
});

