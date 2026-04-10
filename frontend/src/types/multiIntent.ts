/**
 * MultiIntent 관련 타입 정의
 */

export interface MultiIntentResponse {
    index: number;
    type: string;
    prompt: string;
    response: string;
    qualityScore?: number;
    confidence?: number;
    processingTime?: number;
}

export interface MultiIntentResultState {
    id: string;
    summary?: string;
    responses: MultiIntentResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface MultiIntentResponseEntry {
    index: number;
    type: string;
    prompt: string;
    response: string;
    qualityScore?: number;
    confidence?: number;
    processingTime?: number;
}

