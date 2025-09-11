export type Intent =
    | 'summarize'
    | 'plan'
    | 'compare'
    | 'analyze'
    | 'code'
    | 'table'
    | 'write'
    | 'qa'
    | 'other';

export interface DetectedIntent {
    intent: Intent;
    confidence: number; // 0~1
    hints: string[];
}

// 매우 가벼운 휴리스틱 라우터 (후속에 ML 교체 가능)
export function detectIntent(message: string): DetectedIntent {
    const m = message.toLowerCase();
    const add = (x: string[]) => x.filter(Boolean);

    if (/\b(요약|summary|summarize)\b/i.test(message)) {
        return { intent: 'summarize', confidence: 0.8, hints: add(['요약 위주', '핵심 불릿']) };
    }
    if (/\b(계획|plan|roadmap|스케쥴|일정)\b/i.test(message)) {
        return { intent: 'plan', confidence: 0.8, hints: add(['단계별 실행', '리스크/대안']) };
    }
    if (/\b(비교|compare|vs\.|장단점)\b/i.test(message)) {
        return { intent: 'compare', confidence: 0.8, hints: add(['표 형태', '결론 요약']) };
    }
    if (/\b(분석|analyze|reason|why|root cause)\b/i.test(message)) {
        return { intent: 'analyze', confidence: 0.7, hints: add(['근거 인용', '대안 제시']) };
    }
    if (/\b(code|코드|snippet|함수|ts|js|python)\b/i.test(message)) {
        return { intent: 'code', confidence: 0.7, hints: add(['코드블록', '주석 최소']) };
    }
    if (/\b(표|table|표로)\b/i.test(message)) {
        return { intent: 'table', confidence: 0.7, hints: add(['표로 정리', '짧은 설명']) };
    }
    if (/\b(작성|write|draft|문서|보고서)\b/i.test(message)) {
        return { intent: 'write', confidence: 0.6, hints: add(['구조적 서술', '인용 포함']) };
    }
    if (/\?$/.test(m) || /\b(어떻게|무엇|왜|언제|어디)\b/.test(message)) {
        return { intent: 'qa', confidence: 0.6, hints: add(['간결 답변', '근거 링크']) };
    }
    return { intent: 'other', confidence: 0.5, hints: [] };
}


