import { analyzeGuidelines, type GuidelineQualityReport } from './guidelineQuality';
import { coerceTrimmedString } from './chatInputUtils';

export interface GuidelinePolicyPack {
  version: '1.0';
  exportedAt: string;
  projectId?: string;
  projectName?: string;
  instructions: string;
  guidelines: string[];
  tags: string[];
  quality: Pick<
    GuidelineQualityReport,
    'qualityScore' | 'qualityStatus' | 'required' | 'recommended' | 'untyped' | 'duplicates' | 'empty'
  >;
}

export function createGuidelinePolicyPack(input: {
  projectId?: string | null;
  projectName?: string;
  instructions?: string;
  guidelines?: string[];
  tags?: string[];
}): GuidelinePolicyPack {
  const guidelines = (input.guidelines ?? []).map((g) => coerceTrimmedString(g, '')).filter((g) => g.length > 0);
  const quality = analyzeGuidelines(guidelines);
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    ...(input.projectId ? { projectId: input.projectId } : {}),
    ...(input.projectName ? { projectName: input.projectName } : {}),
    instructions: coerceTrimmedString(input.instructions ?? '', ''),
    guidelines,
    tags: (input.tags ?? []).map((t) => coerceTrimmedString(t, '')).filter((t) => t.length > 0),
    quality: {
      qualityScore: quality.qualityScore,
      qualityStatus: quality.qualityStatus,
      required: quality.required,
      recommended: quality.recommended,
      untyped: quality.untyped,
      duplicates: quality.duplicates,
      empty: quality.empty,
    },
  };
}

export function serializeGuidelinePolicyPack(pack: GuidelinePolicyPack): string {
  return JSON.stringify(pack, null, 2);
}

export function parseGuidelinePolicyPack(raw: string): GuidelinePolicyPack | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GuidelinePolicyPack>;
    if (!parsed || parsed.version !== '1.0') return null;
    if (!Array.isArray(parsed.guidelines) || !Array.isArray(parsed.tags)) return null;
    if (typeof parsed.instructions !== 'string') return null;
    if (!parsed.quality || typeof parsed.quality.qualityScore !== 'number' || typeof parsed.quality.qualityStatus !== 'string') {
      return null;
    }
    return {
      version: '1.0',
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      ...(typeof parsed.projectId === 'string' ? { projectId: parsed.projectId } : {}),
      ...(typeof parsed.projectName === 'string' ? { projectName: parsed.projectName } : {}),
      instructions: parsed.instructions,
      guidelines: parsed.guidelines.map((g) => String(g)),
      tags: parsed.tags.map((t) => String(t)),
      quality: {
        qualityScore: Number(parsed.quality.qualityScore),
        qualityStatus: parsed.quality.qualityStatus as GuidelineQualityReport['qualityStatus'],
        required: Number(parsed.quality.required ?? 0),
        recommended: Number(parsed.quality.recommended ?? 0),
        untyped: Number(parsed.quality.untyped ?? 0),
        duplicates: Number(parsed.quality.duplicates ?? 0),
        empty: Number(parsed.quality.empty ?? 0),
      },
    };
  } catch {
    return null;
  }
}
