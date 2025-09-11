import { BuiltContext } from './contextBuilder';

// 인용 주입기: 파일/지침을 클릭 가능한 링크로 삽입
// 링크 스킴: corbu://file/{id}, corbu://guideline/{id}
export function injectCitations(answer: string, context?: BuiltContext): string {
    if (!context) return answer;
    const cites: string[] = [];
    if (context.guidelines?.length) {
        const links = context.guidelines
            .map(g => `[${g.title}](corbu://guideline/${encodeURIComponent(g.id)})`)
            .join(', ');
        cites.push(`지침: ${links}`);
    }
    if (context.files?.length) {
        const links = context.files
            .map(f => `[${f.name}](corbu://file/${encodeURIComponent(f.id)})`)
            .join(', ');
        cites.push(`파일: ${links}`);
    }
    if (cites.length === 0) return answer;
    return `${answer}\n\n---\n[참고]\n${cites.join('\n')}`;
}


