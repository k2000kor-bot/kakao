import { buildUnifiedQaGensparkPipelineContextMerge } from '../buildUnifiedQaGensparkPipelineContextMerge';
import { GRAPH_ANSWER_CONTEXT_FLAG } from '../../views/conversationGraphAnswerGeneration';
import { withProcessEnv } from '../../test-utils/testHelpers';

describe('buildUnifiedQaGensparkPipelineContextMerge', () => {
    const base = {
        trimmedInput: '간단한 인사',
        featureCtx: {} as Record<string, unknown>,
        composerResponseMode: 'detailed',
        responseStyle: 'balanced',
    };

    it('pipelineMerge에 항상 input_intent_hint가 포함된다', () => {
        const { pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
            ...base,
            trimmedInput: '안녕',
        });
        expect(pipelineMerge.input_intent_hint).toEqual(
            expect.objectContaining({
                intent_type: expect.any(String),
                intent_confidence: expect.any(Number),
            }),
        );
    });

    it('프로젝트 없이 스레드 지침·첨부 맥락만 있으면 최소 parsed_input을 만들고 빈 프로젝트 QA 파이프라인을 허용한다', () => {
        const { parsedInput, pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
            ...base,
            trimmedInput: '요약해 줘',
            hasConversationThreadContext: true,
        });
        expect(parsedInput?.question).toBe('요약해 줘');
        expect(parsedInput?.intent_confidence).toBeGreaterThanOrEqual(0.35);
        expect(pipelineMerge.qa_pipeline_allow_empty_project).toBe(true);
        expect(pipelineMerge.use_pipeline_v2).toBe(true);
    });

    it('REACT_APP_INCLUDE_QA_GENERATION_SCENARIO=0이면 에이전트 세션이 아닐 때 include_generation_scenario_in_response를 넣지 않는다', () => {
        withProcessEnv({ REACT_APP_INCLUDE_QA_GENERATION_SCENARIO: '0' }, () => {
            const { pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
                ...base,
                hasConversationThreadContext: true,
            });
            expect(pipelineMerge.include_generation_scenario_in_response).toBeUndefined();
        });
    });

    it('에이전트 라우트가 있으면 시나리오 생략 env여도 include_generation_scenario_in_response를 유지한다', () => {
        withProcessEnv({ REACT_APP_INCLUDE_QA_GENERATION_SCENARIO: '0' }, () => {
            const { pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
                ...base,
                gensparkRouteAgentId: 'agent-1',
                hasConversationThreadContext: true,
            });
            expect(pipelineMerge.include_generation_scenario_in_response).toBe(true);
        });
    });

    it('composer_simple_query면 Genspark 다단계 파이프라인 대신 직경로만 켠다', () => {
        const { pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
            ...base,
            featureCtx: { composer_simple_query: true },
        });
        expect(pipelineMerge.qa_pipeline_fast_path).toBe(true);
        expect(pipelineMerge.use_pipeline_v2).toBe(false);
        expect(pipelineMerge.agentic_genspark_style).toBe(false);
        expect(pipelineMerge.composer_oversight_enabled).toBeUndefined();
    });

    it('짧은 인사는 featureCtx 플래그 없이도 단순 질문 fast path를 탄다', () => {
        const { pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
            ...base,
            trimmedInput: '안녕',
            featureCtx: {},
        });
        expect(pipelineMerge.qa_pipeline_fast_path).toBe(true);
        expect(pipelineMerge.use_pipeline_v2).toBe(false);
        expect(pipelineMerge.composer_oversight_enabled).toBeUndefined();
    });

    it('관계도 답변 context면 composer oversight를 붙이지 않는다', () => {
        const { pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
            ...base,
            trimmedInput: '1) 요약해줘\n2) 보고서 작성해줘',
            featureCtx: { [GRAPH_ANSWER_CONTEXT_FLAG]: true },
            hasConversationThreadContext: true,
        });
        expect(pipelineMerge.composer_oversight_enabled).toBeUndefined();
        expect(pipelineMerge.composer_oversight_council_v2).toBeUndefined();
    });

    it('딥시크 review가 켜지면 deepseek_review_layer_hints와 refine/reasoner 플래그가 반영된다', () => {
        const { pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
            ...base,
            hasConversationThreadContext: true,
            conversationDeepseek: {
                deepseekReviewHints: true,
                pipelineDeepSeekRefine: true,
                pipelineDeepSeekReasoner: true,
            },
        });
        expect(pipelineMerge.deepseek_review_layer_hints).toBe(true);
        expect(pipelineMerge.pipeline_deepseek_refine).toBe(true);
        expect(pipelineMerge.pipeline_deepseek_reasoner).toBe(true);
    });
});
