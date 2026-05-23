/**
 * 노트북 소스 추가(from-url / from-youtube-url 등) API 실패 시 사용자 메시지 추출
 */

export type NotebookSourcePayload = {
    source: { id: string; title: string; type: string };
    source_count: number;
    synthesized_with_llm?: boolean;
};

/** 단일 엔드포인트(from-url, from-youtube-url) 또는 통합 웹 인제스트 결과 */
export type NotebookUrlIngestResult =
    | ({ ok: true } & NotebookSourcePayload)
    | { ok: false; errorMessage: string };

export function extractNotebookIngestErrorMessage(data: unknown, httpStatus: number): string {
    const fallback =
        httpStatus >= 400 && httpStatus < 600
            ? `요청이 거절되었습니다. (${httpStatus})`
            : '소스 추가에 실패했습니다.';
    if (!data || typeof data !== 'object') {
        return fallback;
    }
    const d = data as Record<string, unknown>;
    const detail = d.detail;
    if (typeof detail === 'string' && detail.trim()) {
        return detail.trim();
    }
    if (detail && typeof detail === 'object') {
        const obj = detail as Record<string, unknown>;
        if (typeof obj.message === 'string' && obj.message.trim()) {
            return String(obj.message).trim();
        }
        if (typeof obj.error === 'string' && obj.error.trim()) {
            return String(obj.error).trim();
        }
    }
    if (typeof d.message === 'string' && d.message.trim()) {
        return d.message.trim();
    }
    if (typeof d.error === 'string' && d.error.trim()) {
        return d.error.trim();
    }
    return fallback;
}
