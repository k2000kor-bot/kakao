import { GUIDANCE_GENERATE_PATH, API_BASE_URL, FALLBACK_API_ORIGIN, joinApiHealthCheckUrl } from '../config/api';
import { extractResponseContent } from '../utils/chatInputUtils';
import type { GraphAiAnalysis } from './conversationGraphAiAnalyzer';

function guidanceOrigin(): string {
  return (API_BASE_URL || FALLBACK_API_ORIGIN).replace(/\/$/, '');
}

/** AI 해석 API 응답에서 텍스트를 추출한다. */
export function extractGuidanceNarrative(data: Record<string, unknown> | null): string | null {
  if (!data) return null;
  for (const key of ['response', 'content', 'message', 'guidance', 'summary', 'text']) {
    const v = data[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  const wrapped = extractResponseContent({ data });
  if (wrapped && !wrapped.includes('응답을 생성할 수 없습니다')) return wrapped.trim();
  return null;
}

export function buildGraphAiNarrativePrompt(analysis: GraphAiAnalysis): string {
  const top = analysis.topInfluencers
    .slice(0, 8)
    .map(
      (p) =>
        `- ${p.label}: 우세 ${p.dominantStance}, 신뢰 ${Math.round(p.stanceConfidence * 100)}%, ${p.exchangeRole}, 메시지 ${p.messageCount}건, 동조/반대/중립 ${p.stanceCounts.동조}/${p.stanceCounts.반대}/${p.stanceCounts.중립}`,
    )
    .join('\n');

  return [
    '당신은 조합·재개발 단체 채팅방 대화 관계도를 해석하는 분석가입니다.',
    '아래 통계만 근거로 5~7문장 한국어 요약을 작성하세요. 추측은 하지 말고, 수치에 없는 인물·사건은 언급하지 마세요.',
    '반드시 포함: (1) 전체 성향 분포 (2) 주도·응답 역할 (3) 동조·반대 긴장 축 (4) 해석 시 주의할 한계.',
    '',
    `[신뢰 지표 ${analysis.trustScore}/100 · ${analysis.trustLabel}]`,
    analysis.stanceSummary,
    analysis.exchangeSummary,
    analysis.alignmentSummary,
    '',
    '주요 참여자:',
    top,
  ].join('\n');
}

/** `/api/guidance/generate`로 관계도 AI 종합 해석을 요청한다. */
export async function fetchGraphAiNarrative(analysis: GraphAiAnalysis): Promise<string | null> {
  const context = buildGraphAiNarrativePrompt(analysis);
  try {
    const res = await fetch(joinApiHealthCheckUrl(guidanceOrigin(), GUIDANCE_GENERATE_PATH), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context,
        preferences: {
          tone: 'professional',
          style: 'analytical',
          length: 'medium',
          domain: 'conversation_graph',
        },
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, unknown>;
    return extractGuidanceNarrative(json);
  } catch {
    return null;
  }
}

/** API 없을 때 표시할 규칙 기반 종합 해석 */
export function buildHeuristicGraphNarrative(analysis: GraphAiAnalysis): string {
  const lead = analysis.exchangeLeaders.map((p) => p.label).join(', ') || '특정인 없음';
  const agree = analysis.agreementHubs.map((p) => p.label).join(', ') || '특정인 없음';
  return [
    analysis.stanceSummary + '.',
    `${analysis.exchangeSummary} 주요 응답·균형 참여자는 그래프에서 연결 두께로 확인할 수 있습니다.`,
    `동조 연결 중심 참여자: ${agree}. 반대·대립 선이 두꺼운 구간은 입장 충돌이 잦은 대화 흐름입니다.`,
    `분석 신뢰도는 ${analysis.trustScore}점(${analysis.trustLabel})입니다. 메시지 맥락·농담·인용은 자동 분류 오차가 있을 수 있으니, 중요한 판단은 원문 대화를 함께 확인하세요.`,
  ].join(' ');
}
