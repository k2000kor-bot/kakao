/// <reference types="jest" />
/**
 * generationPromptBuilder 테스트
 * 모든 입력창에서 동일한 생성글 품질을 위한 통합 프롬프트 빌더
 */

import {
  buildUnifiedGenerationPrompt,
  buildUnifiedChatContext,
  getInnovativeWritingInstructionBlock,
} from '../generationPromptBuilder';

describe('generationPromptBuilder', () => {
  describe('buildUnifiedGenerationPrompt', () => {
    it('사용자 입력에 혁신적 답변 품질 지시를 추가한다', () => {
      const result = buildUnifiedGenerationPrompt('도시정비법 요약해줘');
      expect(result).toContain('도시정비법 요약해줘');
      expect(result).toContain('[혁신적 답변·글쓰기 품질]');
      expect(result).toContain('논리적 구조');
      expect(result).toContain('결론 선행');
      expect(result).toContain('독창적 관점');
      expect(result).toContain('수식어 지양');
    });

    it('기본 config(balanced, practical)를 적용한다', () => {
      const result = buildUnifiedGenerationPrompt('테스트');
      expect(result).toContain('핵심과 근거를 균형 있게');
      expect(result).toContain('실행 가능성과 현실 적용성');
    });

    it('creative perspective 시 창의 모드 지시를 포함한다', () => {
      const result = buildUnifiedGenerationPrompt('아이디어 브레인스토밍해줘', {
        perspective: 'creative',
      });
      expect(result).toContain('창의 모드');
      expect(result).toContain('2개 이상 대안');
    });

    it('질문/요구사항 파싱 시 형식 지시를 포함한다', () => {
      const result = buildUnifiedGenerationPrompt(
        '질문: 인터뷰 질문\n요구사항: 10개 이내'
      );
      expect(result).toContain('질문 목록');
      expect(result).toContain('요구사항 명세');
    });

    it('긴 질문 블록과 매우 짧은 요구는 [입력 해석] 분할 블록을 넣지 않는다', () => {
      const longQ = 'a'.repeat(3000);
      const result = buildUnifiedGenerationPrompt(
        `질문:\n${longQ}\n\n요구사항:\n톤만 지정`,
      );
      expect(result).not.toContain('[입력 해석]');
    });

    it('회의록 의도 시 회의록 형식 지시를 포함한다', () => {
      const result = buildUnifiedGenerationPrompt('회의록 작성해줘');
      expect(result).toContain('회의록');
      expect(result).toContain('참석자');
      expect(result).toContain('액션 아이템');
    });

    it('도시정비 태그 프로젝트 시 도메인 지시를 포함한다', () => {
      const result = buildUnifiedGenerationPrompt('리스트 만들어줘', {
        project: { name: 'P1', tags: ['도시정비'] },
      });
      expect(result).toContain('도시정비');
      expect(result).toContain('인허가');
    });

    it('한국어 입력 시 한국어 이해 계층 블록을 포함한다', () => {
      const result = buildUnifiedGenerationPrompt('위 내용 카톡용으로 반박해줘', {
        conversationHistory: [
          { role: 'user', content: '재개발이 뭐야' },
          { role: 'assistant', content: '재개발은 기존 시가지를 정비하는 사업입니다.' },
        ],
      });
      expect(result).toContain('[한국어 이해·출력 계층 — 내부 전용]');
      expect(result).toContain('korean_profile');
      expect(result).toContain('kakao_message');
    });

    it('agenticGensparkStyle 시 과업 완결형 지시를 포함한다', () => {
      const result = buildUnifiedGenerationPrompt('서비스 소개해줘', {
        agenticGensparkStyle: true,
      });
      expect(result).toContain('[과업 완결형 에이전트 지시');
      expect(result).toContain('[출력 순서 권장 — 본문은 GFM 마크다운]');
    });

    it('deepSeekReviewLayerHints 시 DeepSeek 검수 계층 안내를 포함한다', () => {
      const result = buildUnifiedGenerationPrompt('전략 보고서 초안', {
        deepSeekReviewLayerHints: true,
      });
      expect(result).toContain('[DeepSeek 검수·포맷 계층');
    });
  });

  describe('buildUnifiedChatContext', () => {
    it('parsed_input을 포함한다', () => {
      const ctx = buildUnifiedChatContext('질문: 뭐야\n요구사항: 3페이지');
      expect(ctx.parsed_input).toBeDefined();
      expect(ctx.parsed_input).toEqual(expect.objectContaining({ intent_type: 'combined' }));
    });

    it('conversation_history를 포함한다', () => {
      const ctx = buildUnifiedChatContext('테스트', {
        conversationHistory: [
          { role: 'user', content: '안녕' },
          { role: 'assistant', content: '안녕하세요' },
        ],
      });
      expect(ctx.conversation_history).toHaveLength(2);
      expect(ctx.consistency_instruction).toBeDefined();
    });

    it('adapt_answer_to_request를 항상 포함한다 (요구·질문에 맞게 유연한 생성)', () => {
      const ctx = buildUnifiedChatContext('테스트');
      expect(ctx.adapt_answer_to_request).toBeDefined();
      expect(typeof ctx.adapt_answer_to_request).toBe('string');
      expect(String(ctx.adapt_answer_to_request)).toContain('유연하게');
    });

    it('항상 multi_perspective_response와 perspective_diversity_requested를 포함한다', () => {
      const ctx = buildUnifiedChatContext('테스트');
      expect(ctx.perspective_diversity_requested).toBe(true);
      expect(typeof ctx.multi_perspective_response).toBe('string');
      expect(String(ctx.multi_perspective_response)).toMatch(/관점|이해관계자|대안|한계/);
    });

    it('여러 질문·요구(번호 목록) 시 multi_request_adaptation_instruction을 넣는다', () => {
      const ctx = buildUnifiedChatContext('1. 요약해줘\n2. 비교해줘');
      expect(ctx.multi_request_mode).toBe(true);
      expect(Array.isArray(ctx.multi_request_items)).toBe(true);
      expect(ctx.multi_request_adaptation_instruction).toBeDefined();
      expect(String(ctx.multi_request_adaptation_instruction)).toContain('multi_request_items');
      expect(String(ctx.multi_request_adaptation_instruction)).toMatch(/시나리오|순서/);
    });

    it('웹검색 의도 시 enable_web_research를 포함한다', () => {
      const ctx = buildUnifiedChatContext('/웹검색 오늘 날씨');
      expect(ctx.enable_web_research).toBe(true);
    });

    it('project 정보를 포함한다', () => {
      const ctx = buildUnifiedChatContext('테스트', {
        project: {
          id: 'p1',
          name: '테스트 프로젝트',
          instructions: '지침',
        },
      });
      expect(ctx.projectId).toBe('p1');
      expect(ctx.projectName).toBe('테스트 프로젝트');
      expect(ctx.project_instructions).toBe('지침');
    });

    it('한국어 입력 시 korean_understanding과 enable_korean_depth를 포함한다', () => {
      const ctx = buildUnifiedChatContext('조합원 설득 카톡으로 짧게', {
        conversationHistory: [{ role: 'assistant', content: '안내 드립니다.' }],
      });
      expect(ctx.enable_korean_depth).toBe(true);
      expect(ctx.korean_understanding).toBeDefined();
      expect(ctx.genre_control).toBeDefined();
      expect(typeof ctx.korean_layer_instruction).toBe('string');
    });

    it('agenticGensparkStyle 시 genspark 프롬프트 템플릿을 context에 포함한다', () => {
      const ctx = buildUnifiedChatContext('보고서 초안', { agenticGensparkStyle: true });
      expect(ctx.agentic_genspark_style).toBe(true);
      expect(typeof ctx.genspark_agentic_system).toBe('string');
      expect(typeof ctx.genspark_planner_prompt_template).toBe('string');
      expect(typeof ctx.genspark_external_agent_profile).toBe('string');
      expect(String(ctx.genspark_reference_agent_id)).toContain('eb7747f5');
      expect(String(ctx.genspark_reference_agent_url)).toContain('genspark.ai/agents');
    });

    it('gensparkRouteAgentId 시 참조 에이전트 id·프로필이 해당 id에 맞춘다', () => {
      const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const ctx = buildUnifiedChatContext('안녕', {
        agenticGensparkStyle: true,
        gensparkRouteAgentId: id,
      });
      expect(ctx.genspark_reference_agent_id).toBe(id);
      expect(String(ctx.genspark_reference_agent_url)).toContain(encodeURIComponent(id));
      expect(String(ctx.genspark_external_agent_profile)).toContain(id);
    });

    it('agenticGensparkStyle + project.id 시 Q→A 파이프라인 플래그를 켠다', () => {
      const ctx = buildUnifiedChatContext('보고서 초안', {
        agenticGensparkStyle: true,
        project: { id: 'p1', name: '테스트' },
      });
      expect(ctx.use_pipeline_v2).toBe(true);
      expect(ctx.agentic_pipeline).toBe(true);
    });

    it('agenticGensparkStyle + project여도 useQuestionAnswerPipeline false면 파이프라인 플래그 없음', () => {
      const ctx = buildUnifiedChatContext('보고서', {
        agenticGensparkStyle: true,
        useQuestionAnswerPipeline: false,
        project: { id: 'p1', name: '테스트' },
      });
      expect(ctx.use_pipeline_v2).toBeUndefined();
      expect(ctx.agentic_pipeline).toBeUndefined();
    });

    it('useQuestionAnswerPipeline true만으로 파이프라인 플래그 켬', () => {
      const ctx = buildUnifiedChatContext('일반 질문', {
        useQuestionAnswerPipeline: true,
      });
      expect(ctx.use_pipeline_v2).toBe(true);
      expect(ctx.agentic_pipeline).toBe(true);
    });

    it('pipelineFastPath 시 qa_pipeline_fast_path를 넣어 백엔드가 직경로를 택할 수 있게 한다', () => {
      const ctx = buildUnifiedChatContext('짧게', {
        useQuestionAnswerPipeline: true,
        pipelineFastPath: true,
      });
      expect(ctx.qa_pipeline_fast_path).toBe(true);
    });

    it('answerMode를 answer_mode로 전달한다', () => {
      const ctx = buildUnifiedChatContext('분석', {
        answerMode: 'expert',
      });
      expect(ctx.answer_mode).toBe('expert');
    });

    it('pipelineWebEvidence를 pipeline_web_evidence로 전달한다', () => {
      const ctx = buildUnifiedChatContext('검색', {
        pipelineWebEvidence: '  요약 본문  ',
      });
      expect(ctx.pipeline_web_evidence).toBe('요약 본문');
    });

    it('skipWriterLlmPolish 시 pipeline_skip_writer_llm_polish를 넣는다', () => {
      const ctx = buildUnifiedChatContext('x', { skipWriterLlmPolish: true });
      expect(ctx.pipeline_skip_writer_llm_polish).toBe(true);
    });

    it('deepSeekReviewLayerHints 시 DeepSeek v2 context 힌트를 포함한다', () => {
      const ctx = buildUnifiedChatContext('분석', { deepSeekReviewLayerHints: true });
      expect(ctx.deepseek_review_layer_hints).toBe(true);
      expect(ctx.deepseek_integration_version).toBe('v2');
      expect(typeof ctx.deepseek_chat_formatter_prompt).toBe('string');
      expect(typeof ctx.deepseek_reasoner_critique_prompt).toBe('string');
      expect(typeof ctx.deepseek_korean_reasoner_axis).toBe('string');
      expect(String(ctx.deepseek_korean_reasoner_axis)).toContain('한국어');
    });

    it('pipelineDeepSeekRefine은 deepSeekReviewLayerHints와 함께일 때만 pipeline_deepseek_refine을 넣는다', () => {
      const without = buildUnifiedChatContext('분석', { pipelineDeepSeekRefine: true });
      expect(without.pipeline_deepseek_refine).toBeUndefined();

      const withHints = buildUnifiedChatContext('분석', {
        deepSeekReviewLayerHints: true,
        pipelineDeepSeekRefine: true,
      });
      expect(withHints.pipeline_deepseek_refine).toBe(true);
    });

    it('pipelineDeepSeekReasoner는 deepSeekReviewLayerHints와 함께일 때만 pipeline_deepseek_reasoner를 넣는다', () => {
      const without = buildUnifiedChatContext('분석', { pipelineDeepSeekReasoner: true });
      expect(without.pipeline_deepseek_reasoner).toBeUndefined();

      const withHints = buildUnifiedChatContext('분석', {
        deepSeekReviewLayerHints: true,
        pipelineDeepSeekReasoner: true,
      });
      expect(withHints.pipeline_deepseek_reasoner).toBe(true);
    });

    it('pipelineVerifierRewrite true 시 pipeline_verifier_rewrite를 넣는다', () => {
      const ctx = buildUnifiedChatContext('x', {
        useQuestionAnswerPipeline: true,
        pipelineVerifierRewrite: true,
      });
      expect(ctx.pipeline_verifier_rewrite).toBe(true);
    });

    it('pipelineVerifierRewrite false면 환경변수가 켜져 있어도 pipeline_verifier_rewrite 없음', () => {
      const prev = process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE;
      process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE = 'true';
      try {
        const ctx = buildUnifiedChatContext('x', {
          useQuestionAnswerPipeline: true,
          pipelineVerifierRewrite: false,
        });
        expect(ctx.pipeline_verifier_rewrite).toBeUndefined();
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE;
        else process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE = prev;
      }
    });

    it('REACT_APP_PIPELINE_VERIFIER_REWRITE true이면 Q→A 켜진 요청에 pipeline_verifier_rewrite 포함', () => {
      const prev = process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE;
      process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE = 'true';
      try {
        const ctx = buildUnifiedChatContext('x', {
          useQuestionAnswerPipeline: true,
        });
        expect(ctx.pipeline_verifier_rewrite).toBe(true);
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE;
        else process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE = prev;
      }
    });

    it('includeGenerationScenarioInResponse true 시 include_generation_scenario_in_response 전달', () => {
      const ctx = buildUnifiedChatContext('x', {
        useQuestionAnswerPipeline: true,
        includeGenerationScenarioInResponse: true,
      });
      expect(ctx.include_generation_scenario_in_response).toBe(true);
    });

    it('includeGenerationScenarioInResponse false면 env가 켜져 있어도 플래그 미전달', () => {
      const prev = process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO;
      process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO = 'true';
      try {
        const ctx = buildUnifiedChatContext('x', {
          useQuestionAnswerPipeline: true,
          includeGenerationScenarioInResponse: false,
        });
        expect(ctx.include_generation_scenario_in_response).toBeUndefined();
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO;
        else process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO = prev;
      }
    });

    it('REACT_APP_INCLUDE_QA_GENERATION_SCENARIO true이면 Q→A 켜진 요청에 시나리오 옵트인 포함', () => {
      const prev = process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO;
      process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO = 'true';
      try {
        const ctx = buildUnifiedChatContext('x', {
          useQuestionAnswerPipeline: true,
        });
        expect(ctx.include_generation_scenario_in_response).toBe(true);
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO;
        else process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO = prev;
      }
    });

    it('clientGenerationScenario가 있으면 client_generation_scenario로 전달한다', () => {
      const ctx = buildUnifiedChatContext('질문', {
        clientGenerationScenario: '## 시나리오\n항목',
      });
      expect(ctx.client_generation_scenario).toBe('## 시나리오\n항목');
    });

    it('conversationHistory의 pipelineExtras가 context.conversation_history에 유지된다', () => {
      const ctx = buildUnifiedChatContext('질문: x\n요구사항: y', {
        useQuestionAnswerPipeline: true,
        conversationHistory: [
          {
            role: 'assistant',
            content: '이전 답',
            pipelineExtras: { generationScenarioMarkdown: '## 통합컨텍스트\n히스토리' },
          },
        ],
      });
      const hist = ctx.conversation_history as Array<{
        pipelineExtras?: { generationScenarioMarkdown?: string };
      }>;
      expect(Array.isArray(hist)).toBe(true);
      expect(String(hist[0]?.pipelineExtras?.generationScenarioMarkdown)).toContain('통합컨텍스트');
    });
  });

  describe('getInnovativeWritingInstructionBlock', () => {
    it('기본 블록을 반환한다', () => {
      const block = getInnovativeWritingInstructionBlock();
      expect(block).toContain('[혁신적 답변·글쓰기 품질]');
      expect(block).toContain('논리적 구조');
      expect(block).toContain('다각도');
      expect(block).not.toContain('창의 모드');
    });

    it('includeCreative 시 창의 모드 지시를 포함한다', () => {
      const block = getInnovativeWritingInstructionBlock(true);
      expect(block).toContain('창의 모드');
      expect(block).toContain('2개 이상 대안');
      expect(block).toContain('다각도');
    });
  });
});
