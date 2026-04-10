import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface CritiqueOptions {
    requireCitations?: boolean;
    maxLength?: 'short' | 'medium' | 'long';
}

export interface CritiqueResult {
    score: number; // 0~1
    issues: string[];
    needsRefine: boolean;
}

export function critiqueAnswer(answer: string, options?: CritiqueOptions): CritiqueResult {
    const issues: string[] = [];
    const length = coerceTrimmedString(answer, '').length;

    // 간단 휴리스틱: 너무 짧거나, 불릿/구조 부족, 인용 미비
    if (length < 60) issues.push('답변이 너무 짧습니다');
    if (!/\n- |\n\d+\./.test(answer)) issues.push('불릿/구조화가 부족합니다');
    if ((options?.requireCitations ?? true) && !/\[(파일|지침|출처):/.test(answer)) {
        issues.push('인용/출처 표시가 없습니다');
    }

    const penalty = Math.min(issues.length * 0.15, 0.6);
    const base = 0.9 - penalty;
    return {
        score: Math.max(0, Math.min(1, base)),
        issues,
        needsRefine: base < 0.75,
    };
}


