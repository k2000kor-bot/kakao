/**
 * Genspark형 파이프라인 부가 메타(과업 계획·검증·블루프린트·trace) — ChatGPTInterface와 동일 UI 계약
 */
import React from 'react';
import { TEST_IDS } from '../../constants/testIds';
import { coerceTrimmedString, type PipelineMessageExtras } from '../../utils/chatInputUtils';
import { AssistantGensparkBody } from './AssistantGensparkBody';

export type GensparkPipelineTheme = {
  borderColor: string;
  textSecondary: string;
};

export interface GensparkPipelineExtrasPanelProps {
  extras: PipelineMessageExtras;
  theme: GensparkPipelineTheme;
  messageId: string;
  /** 해당 턴 생성 단계 UI와 맞춘 웹검색·문서 맥락 힌트(마크다운 미리보기 톤) */
  assistantStepWebSearch?: boolean;
  assistantStepDocumentContext?: boolean;
}

function taskPlanStringField(
  tp: Record<string, unknown> | undefined,
  key: string
): string | undefined {
  if (!tp) return undefined;
  const v = tp[key];
  const t = typeof v === 'string' ? coerceTrimmedString(v, '') : '';
  return t || undefined;
}

export const GensparkPipelineExtrasPanel: React.FC<GensparkPipelineExtrasPanelProps> = ({
  extras,
  theme,
  messageId,
  assistantStepWebSearch,
  assistantStepDocumentContext,
}) => {
  const { borderColor, textSecondary } = theme;
  const taskAnswerMode =
    taskPlanStringField(extras.taskPlan, 'answer_mode') ?? extras.answerMode;
  const taskResponseStyle =
    taskPlanStringField(extras.taskPlan, 'response_style') ?? extras.responseStyle;

  return (
    <details
      data-testid={TEST_IDS.COMPOSER_PIPELINE_EXTRAS}
      style={{
        marginTop: '12px',
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '8px 10px',
        background: 'var(--sidebar-dark-input-bg, rgba(0,0,0,0.03))',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          fontSize: '12px',
          color: textSecondary,
          listStylePosition: 'outside',
        }}
      >
        과업 메타 (계획·시나리오·블루프린트·검수)
      </summary>
      <div style={{ marginTop: '10px', fontSize: '13px' }}>
        {typeof extras.evidenceCoverage === 'number' && (
          <div
            style={{
              marginBottom: '8px',
              fontSize: '12px',
              color: textSecondary,
            }}
          >
            근거 커버리지:{' '}
            <strong>
              {Math.round(
                Math.min(1, Math.max(0, extras.evidenceCoverage)) * 100
              )}
              %
            </strong>
          </div>
        )}
        {extras.pipelineGenerationPhase && (
          <div
            style={{
              marginBottom: '8px',
              fontSize: '12px',
              color: textSecondary,
            }}
          >
            파이프라인 단계:{' '}
            <code
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--bg-active, rgba(0,0,0,0.06))',
              }}
            >
              {extras.pipelineGenerationPhase}
            </code>
          </div>
        )}
        {extras.pipelineTaskType && (
          <div
            style={{
              marginBottom: '8px',
              fontSize: '12px',
              color: textSecondary,
            }}
          >
            과업 유형:{' '}
            <code
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--bg-active, rgba(0,0,0,0.06))',
              }}
            >
              {extras.pipelineTaskType}
            </code>
          </div>
        )}
        {taskAnswerMode && (
          <div
            style={{
              marginBottom: '8px',
              fontSize: '12px',
              color: textSecondary,
            }}
          >
            답변 모드:{' '}
            <code
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--bg-active, rgba(0,0,0,0.06))',
              }}
            >
              {taskAnswerMode}
            </code>
          </div>
        )}
        {taskResponseStyle && (
          <div
            style={{
              marginBottom: '8px',
              fontSize: '12px',
              color: textSecondary,
            }}
          >
            응답 스타일:{' '}
            <code
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--bg-active, rgba(0,0,0,0.06))',
              }}
            >
              {taskResponseStyle}
            </code>
          </div>
        )}
        {extras.taskPlan && Object.keys(extras.taskPlan).length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '12px' }}>과업 계획 (파이프라인)</strong>
            <pre
              style={{
                marginTop: '6px',
                padding: '8px',
                fontSize: '11px',
                overflow: 'auto',
                maxHeight: '220px',
                borderRadius: '6px',
                background: 'var(--bg-active, rgba(0,0,0,0.05))',
                border: `1px solid ${borderColor}`,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {JSON.stringify(extras.taskPlan, null, 2)}
            </pre>
          </div>
        )}
        {(extras.composerOversightEnabled || extras.composerOversightCouncilV2) && (
          <div
            data-testid={TEST_IDS.COMPOSER_OVERSIGHT_COUNCIL}
            style={{
              marginBottom: '12px',
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              background: 'rgba(139, 92, 246, 0.08)',
            }}
          >
            <strong style={{ fontSize: '12px' }}>
              {extras.composerOversightCouncilV2
                ? 'Composer Oversight Council v2'
                : '중간 관리형 답변 생성'}
            </strong>
            <div style={{ marginTop: '4px', fontSize: '12px', color: textSecondary }}>
              {typeof extras.composerOversightWorkItemCount === 'number' &&
              extras.composerOversightWorkItemCount > 0
                ? `작업 항목 ${extras.composerOversightWorkItemCount}개`
                : '작업 항목 분해'}
              {extras.composerOversightHasMultiple ? ' · 다중 요청' : ''}
            </div>
            {extras.composerOversightCouncilV2 && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: textSecondary }}>
                Intake → Strategy → Production → Critique → Integration 순 협의회 파이프라인
              </div>
            )}
          </div>
        )}
        {(extras.composerSelfDevelopImproved ||
          (typeof extras.composerSelfDevelopAttempts === 'number' &&
            extras.composerSelfDevelopAttempts > 0)) && (
          <div
            style={{
              marginBottom: '12px',
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              background: 'rgba(59, 130, 246, 0.08)',
            }}
          >
            <strong style={{ fontSize: '12px' }}>답변 자가 개발</strong>
            <div style={{ marginTop: '4px', fontSize: '12px', color: textSecondary }}>
              {extras.composerSelfDevelopImproved
                ? `품질 검증 후 ${extras.composerSelfDevelopAttempts ?? 0}회 개선하여 최종 답변을 확정했습니다.`
                : `자가 검증 ${extras.composerSelfDevelopAttempts ?? 0}회 수행(초안 유지).`}
              {typeof extras.composerSelfDevelopScore === 'number' && (
                <span style={{ marginLeft: '6px' }}>품질 점수 {extras.composerSelfDevelopScore}</span>
              )}
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: textSecondary }}>
              intake → plan → draft → critique → integrate → evolve 순으로 내부 점검했습니다.
            </div>
          </div>
        )}
        {(extras.verificationSkipped ||
          extras.verificationPass === false ||
          extras.verifierRewriteAttempted === true ||
          (typeof extras.verificationIssueCount === 'number' &&
            (extras.verificationIssueCount ?? 0) > 0)) && (
          <div
            style={{
              marginBottom: '12px',
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              background:
                extras.verificationPass === false ||
                (extras.verificationIssueCount ?? 0) > 0
                  ? 'rgba(251, 191, 36, 0.12)'
                  : 'transparent',
            }}
          >
            <strong style={{ fontSize: '12px' }}>내부 검증 (Verifier)</strong>
            {extras.verifierRewriteAttempted && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '11px',
                  color: textSecondary,
                }}
              >
                검수 피드백 반영을 위해 초안을 1회 재작성했습니다.
              </div>
            )}
            {extras.verificationSkipped && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: textSecondary,
                }}
              >
                생략: {extras.verificationSkipReason ?? '—'}
              </div>
            )}
            {!extras.verificationSkipped && (
              <>
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color:
                      extras.verificationPass === true ? '#15803d' : '#b45309',
                  }}
                >
                  {extras.verificationPass === true ? '통과' : '이슈 있음'}
                  {typeof extras.verificationIssueCount === 'number' && (
                    <span style={{ fontWeight: 400, marginLeft: '6px' }}>
                      ({extras.verificationIssueCount}건)
                    </span>
                  )}
                </div>
                {(extras.verificationIssuesPreview?.length ?? 0) > 0 && (
                  <ul
                    style={{
                      margin: '6px 0 0 0',
                      paddingLeft: '18px',
                      fontSize: '12px',
                    }}
                  >
                    {extras.verificationIssuesPreview!.map((line, li) => (
                      <li
                        key={`ver-iss-${messageId}-${li}`}
                        style={{ marginBottom: '4px' }}
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
                {(extras.verificationFixPreview?.length ?? 0) > 0 && (
                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '11px',
                      color: textSecondary,
                    }}
                  >
                    권장 조치:{' '}
                    {extras.verificationFixPreview!.join(' · ')}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {extras.qaPipelineTraceId && (
          <div
            style={{
              marginBottom: '8px',
              fontSize: '11px',
              color: textSecondary,
              wordBreak: 'break-all',
            }}
          >
            trace: <code>{extras.qaPipelineTraceId}</code>
          </div>
        )}
        {extras.deepseekSeverity && (
          <div
            style={{
              marginBottom: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color:
                extras.deepseekSeverity === 'high'
                  ? '#c2410c'
                  : extras.deepseekSeverity === 'medium'
                    ? '#b45309'
                    : textSecondary,
            }}
          >
            검수 강도: {extras.deepseekSeverity}
          </div>
        )}
        {extras.critiqueSummary && (
          <div
            style={{
              marginBottom: '10px',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-primary)',
            }}
          >
            <strong style={{ fontSize: '12px' }}>검토 한줄</strong>
            <div style={{ marginTop: '4px' }}>{extras.critiqueSummary}</div>
          </div>
        )}
        {extras.responseAlternatives && extras.responseAlternatives.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '12px' }}>대안 표현 (동일 내용)</strong>
            <ol
              style={{
                marginTop: '6px',
                paddingLeft: '18px',
                fontSize: '12px',
                color: 'var(--text-primary)',
              }}
            >
              {extras.responseAlternatives.map((alt, i) => (
                <li
                  key={`alt-${messageId}-${i}`}
                  style={{ marginBottom: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {alt}
                </li>
              ))}
            </ol>
          </div>
        )}
        {extras.generationScenarioMarkdown && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '12px' }}>생성 시나리오 (파이프라인)</strong>
            <div
              className="pipeline-generation-scenario-md"
              style={{
                marginTop: '6px',
                maxHeight: 'min(40vh, 320px)',
                overflowY: 'auto',
                padding: '6px 8px',
                borderRadius: '6px',
                border: `1px solid ${borderColor}`,
                fontSize: '12px',
                background: 'var(--bg-active, rgba(0,0,0,0.04))',
              }}
            >
              <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                <AssistantGensparkBody
                  text={extras.generationScenarioMarkdown}
                  className="genspark-md-body"
                  embedded
                  enhancedCodeBlocks
                  webSearch={assistantStepWebSearch}
                  documentContext={assistantStepDocumentContext}
                />
              </div>
            </div>
          </div>
        )}
        {extras.answerBlueprintMarkdown && (
          <div>
            <strong style={{ fontSize: '12px' }}>답변 개요</strong>
            <div
              className="pipeline-blueprint-md"
              style={{ marginTop: '6px' }}
            >
              <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                <AssistantGensparkBody
                  text={extras.answerBlueprintMarkdown}
                  className="genspark-md-body"
                  embedded
                  enhancedCodeBlocks
                  webSearch={assistantStepWebSearch}
                  documentContext={assistantStepDocumentContext}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </details>
  );
};
