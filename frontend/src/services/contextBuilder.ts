import { Project, ProjectFile, Guideline } from '../types/project';

export interface BuiltContext extends Record<string, unknown> {
    project_id?: string;
    project_name?: string;
    guidelines: Array<{ id: string; title: string; content: string }>;
    files: Array<{ id: string; name: string; type: ProjectFile['type']; size: number; url?: string }>;
    history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

export function buildProjectContext(project?: Project | null, history?: BuiltContext['history']): BuiltContext | undefined {
    if (!project) return undefined;
    return {
        project_id: project.id,
        project_name: project.name,
        guidelines: project.instructions ? [{ id: '1', title: '프로젝트 지침', content: project.instructions }] : [],
        files: (project.files || []).map((f: ProjectFile) => ({ id: f.id, name: f.name, type: f.type, size: f.size, url: f.url })),
        history
    };
}


