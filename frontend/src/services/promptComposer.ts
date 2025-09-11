import { Intent } from './intentRouter';
import { BuiltContext } from './contextBuilder';

export interface ComposeOptions {
    intent: Intent;
    style?: 'concise' | 'balanced' | 'detailed';
    tone?: 'professional' | 'friendly' | 'neutral';
    requireCitations?: boolean;
}

export function composePrompt(message: string, context?: BuiltContext, options?: ComposeOptions) {
    const style = options?.style || 'balanced';
    const tone = options?.tone || 'professional';
    const requireCitations = options?.requireCitations ?? true;
    const intent = options?.intent || 'qa';

    const system = [
        `You are CORBU.AI assistant. Tone: ${tone}.`,
        `Always reason step-by-step, but show only the final clear answer to the user.`,
        requireCitations ? `Cite sources (files/guidelines) when used.` : `Citations optional.`,
    ].join('\n');

    const ctxLines: string[] = [];
    if (context?.project_name) ctxLines.push(`Project: ${context.project_name}`);
    if (context?.guidelines?.length) ctxLines.push(`Guidelines(${context.guidelines.length}): ${context.guidelines.map(g => g.title).join(', ')}`);
    if (context?.files?.length) ctxLines.push(`Files(${context.files.length}): ${context.files.map(f => f.name).join(', ')}`);

    const user = [
        `Intent: ${intent}. Style: ${style}.`,
        ctxLines.length ? `Context:\n${ctxLines.join('\n')}` : '',
        `Task: ${message}`,
        `Output: Provide a high-quality answer in Korean with bullets and short sections where helpful.`
    ].filter(Boolean).join('\n\n');

    return { system, user };
}


