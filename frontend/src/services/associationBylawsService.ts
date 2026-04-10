/**
 * 조합 정관 분석·수집 서비스
 * 현장별·프로젝트별로 정관 지식을 수집·분석하여 기본 지식으로 활용
 */

import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import { projectKnowledgeService } from './projectKnowledgeService';

/** 정관 분석 시 추출할 항목 프레임워크 */
export const BYLAWS_ANALYSIS_FRAMEWORK = {
  기본정보: ['조합명', '사업장명', '정비구역', '사업구분(재건축/재개발)', '대지면적', '건축연면적', '규모(세대수)'],
  임원: ['조합장', '이사 수', '감사 수', '임원 자격', '임기', '선출방법', '결격사유'],
  총회_대의원회: ['총회 소집 요건', '의결 정족수', '대의원회 구성', '대의원 선출방법', '의결사항'],
  시공사_선정: ['선정방법(경쟁입찰/수의계약)', '합동설명회', '평가기준', '정관 특별규정'],
  비용_분담: ['정비사업비', '철거비', '신축비', '경비 부과·징수 방법', '청산 방법'],
  분양: ['분양면적 결정 기준', '배정 방법', '동·호수 결정(추첨 등)', '구분소유권 귀속'],
  기타: ['조합원 자격·의무', '회의록·의사록 보관', '정보공개', '정관 변경 절차'],
} as const;

/** 프로젝트별 정관 분석 결과 */
export interface AssociationBylawsAnalysis {
  projectId: string;
  siteName: string; // 프로젝트/현장 표시명 (실제 등록명)
  combinationName: string; // 조합명
  analyzedAt: string;
  source: 'file_upload' | 'manual' | 'url_import';
  sections: Record<string, string | Record<string, string>>;
  rawExcerpts?: string[]; // 원문 발췌
}

/** 정관 기본 지식 (프로젝트 컨텍스트에 주입용) */
export interface BylawsBaseKnowledge {
  projectId: string;
  siteName: string;
  summary: string;
  keyPoints: string[];
  fullAnalysis?: AssociationBylawsAnalysis;
}

const BYLAWS_STORAGE_KEY = 'association_bylaws_';
const BYLAWS_INDEX_KEY = 'association_bylaws_index';

class AssociationBylawsService {
  private static instance: AssociationBylawsService;

  static getInstance(): AssociationBylawsService {
    if (!AssociationBylawsService.instance) {
      AssociationBylawsService.instance = new AssociationBylawsService();
    }
    return AssociationBylawsService.instance;
  }

  /**
   * 프로젝트별 정관 분석 결과 저장
   */
  saveBylawsAnalysis(projectId: string, analysis: Omit<AssociationBylawsAnalysis, 'projectId' | 'analyzedAt'>): AssociationBylawsAnalysis {
    const full: AssociationBylawsAnalysis = {
      ...analysis,
      projectId,
      analyzedAt: new Date().toISOString(),
    };
    const key = BYLAWS_STORAGE_KEY + projectId;
    try {
      localStorage.setItem(key, JSON.stringify(full));
      this.updateIndex(projectId, full.siteName);
    } catch (err) {
      errorLogger.error('정관 분석 저장 실패', err instanceof Error ? err : new Error(String(err)), {
        component: 'associationBylawsService',
        projectId,
      });
    }
    return full;
  }

  /**
   * 프로젝트별 정관 분석 결과 조회
   */
  getBylawsAnalysis(projectId: string): AssociationBylawsAnalysis | null {
    const key = BYLAWS_STORAGE_KEY + projectId;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * 정관 기본 지식으로 포맷 (노트북 컨텍스트·프롬프트에 주입용)
   */
  getBylawsBaseKnowledge(projectId: string): BylawsBaseKnowledge | null {
    const analysis = this.getBylawsAnalysis(projectId);
    if (!analysis) return null;

    const keyPoints: string[] = [];
    for (const [section, value] of Object.entries(analysis.sections)) {
      if (typeof value === 'string') {
        if (coerceTrimmedString(value, '')) keyPoints.push(`[${section}] ${value.substring(0, 200)}${value.length > 200 ? '...' : ''}`);
      } else if (typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          if (coerceTrimmedString(String(v ?? ''), '')) keyPoints.push(`[${section}-${k}] ${String(v).substring(0, 150)}`);
        }
      }
    }

    const summary = `${analysis.combinationName}(${analysis.siteName}) 조합 정관: ${Object.keys(analysis.sections).join(', ')} 등 ${Object.keys(analysis.sections).length}개 섹션 분석됨.`;

    return {
      projectId,
      siteName: analysis.siteName,
      summary,
      keyPoints,
      fullAnalysis: analysis,
    };
  }

  /** 섹션 키 → 한글 라벨 (가독성) */
  private static SECTION_LABELS: Record<string, string> = {
    기본정보: '기본정보',
    임원: '임원',
    총회: '총회',
    대의원회: '대의원회',
    시공사선정: '시공사 선정',
    비용분담: '비용 분담',
    분양: '분양',
    기타: '기타',
  };

  /**
   * 정관 기본 지식을 컨텍스트 문자열로 변환 (프롬프트에 포함)
   */
  /** LLM 응답 관련성 향상을 위한 섹션 우선순위 (시공사·총회·비용 등 질의 빈도 높은 항목 우선) */
  private static readonly SECTION_PRIORITY: Record<string, number> = {
    시공사선정: 1,
    총회: 2,
    비용분담: 3,
    분양: 4,
    임원: 5,
    기본정보: 6,
    대의원회: 7,
    기타: 8,
  };

  formatBylawsContextForPrompt(projectId: string): string {
    const knowledge = this.getBylawsBaseKnowledge(projectId);
    if (!knowledge) return '';

    const labelOf = (key: string) => AssociationBylawsService.SECTION_LABELS[key] ?? key;
    const priorityOf = (section: string) => AssociationBylawsService.SECTION_PRIORITY[section] ?? 99;

    const sortedKeyPoints = [...knowledge.keyPoints].sort((a, b) => {
      const sectionA = a.match(/^\[([^\]]+)\]/)?.[1]?.replace(/-.*$/, '') ?? '';
      const sectionB = b.match(/^\[([^\]]+)\]/)?.[1]?.replace(/-.*$/, '') ?? '';
      return (priorityOf(sectionA) - priorityOf(sectionB)) || a.localeCompare(b);
    });

    const lines: string[] = [
      '## [해당 프로젝트 조합 정관 기본 지식]',
      knowledge.summary,
      '',
      '### 핵심 항목',
      ...sortedKeyPoints.slice(0, 20).map((p) => {
        const m = p.match(/^\[([^\]]+)\]\s*(.*)$/);
        if (m) {
          const section = m[1].replace(/-.*$/, '');
          const label = labelOf(section);
          return `- [${label}] ${m[2]}`;
        }
        return `- ${p}`;
      }),
    ];
    return lines.join('\n');
  }

  /**
   * 파일명·원문에서 정관 문서 여부 판별
   */
  isBylawsDocument(fileName: string, rawText?: string): boolean {
    const name = fileName.toLowerCase().replace(/\s/g, '');
    const namePatterns = [
      '정관',
      '조합정관',
      'bylaws',
      'association_bylaws',
      '정관서',
      '정관원문',
      '정관부칙',
      '조합규약'
    ];
    if (namePatterns.some((p) => name.includes(p))) return true;
    if (!rawText) return false;
    const text = rawText.substring(0, 3000);
    const contentPatterns = [
      '조합의 정관',
      '정관',
      '제1장 총칙',
      '설립목적',
      '조합원의 자격',
      '이사회',
      '대의원회',
      '시공자 선정'
    ];
    return contentPatterns.filter((p) => text.includes(p)).length >= 2;
  }

  /**
   * 원문·파일명에서 현장명·조합명 추출 (휴리스틱)
   */
  extractNamesFromRawText(rawText: string, fileName?: string): { siteName: string; combinationName: string } {
    let siteName = '미확인 현장';
    let combinationName = '○○조합';

    // 파일명에서 현장명 추출 (예: ○○단지_정관.pdf, 프로젝트A_조합정관.docx)
    if (fileName) {
      const cleaned = coerceTrimmedString(
        fileName.replace(/\.(pdf|docx?|txt|hwp)$/i, '').replace(/_|정관|조합/g, ' '),
        ''
      );
      const match = cleaned.match(/([가-힣a-zA-Z0-9]+(?:[0-9]+차?)?)/);
      if (match) siteName = match[1];
    }

    // 원문에서 조합명 추출 (다양한 패턴)
    const combPatterns = [
      /(?:조합의\s*명칭|조합명|제1조\s*\(명칭\)|명칭)\s*[:\s]*([^\n]+?)(?:\s*제\d조|\n|$)/,
      /([가-힣a-zA-Z0-9]{2,}(?:\s[가-힣a-zA-Z0-9]+)*(?:주택재건축|재개발|정비사업)?(?:조합|정비사업조합))/,
    ];
    for (const re of combPatterns) {
      const m = rawText.match(re);
      if (m) {
        const cand = coerceTrimmedString(m[1], '').replace(/\s+/g, ' ').slice(0, 80);
        if (cand.length >= 4 && !/^(제\d조|본\s*조합)$/.test(cand)) {
          combinationName = cand;
          break;
        }
      }
    }

    // 원문에서 현장명(사업장명) 추출
    const sitePatterns = [
      /(?:사업장명|사업장\s*명칭|사업대상)\s*[:\s]*([가-힣a-zA-Z0-9]+(?:[0-9]+차?)?)/,
      /([가-힣a-zA-Z0-9]+(?:[0-9]+차?)?)\s*(?:정비사업|재건축|재개발)(?:조합|지구)/,
      /([가-힣]{2,}[0-9]*차?)\s*(?:주택재건축|재개발)/,
    ];
    for (const re of sitePatterns) {
      const m = rawText.match(re);
      if (m) {
        const cand = coerceTrimmedString(m[1] || m[2] || '', '');
        if (cand.length >= 3) {
          siteName = cand;
          break;
        }
      }
    }

    // 조합명에서 현장명 추출 (조합명이 "○○주택재건축조합" 형태인 경우)
    if (siteName === '미확인 현장' && combinationName !== '○○조합') {
      const extracted = coerceTrimmedString(
        combinationName.replace(/(?:주택재건축|재개발|정비사업)?(?:조합|정비사업조합)$/, ''),
        ''
      );
      if (extracted.length >= 3) siteName = extracted;
    }

    return { siteName, combinationName };
  }

  /**
   * 정관 텍스트 수동 붙여넣기로 분석·저장 (isBylawsDocument 검사 생략)
   */
  /** 정관 붙여넣기 최대 길이 (과도한 입력·메모리 방지) */
  private static readonly MAX_PASTE_LENGTH = 150_000;

  analyzeAndSaveFromText(projectId: string, rawText: string): AssociationBylawsAnalysis | null {
    const trimmed = coerceTrimmedString(rawText ?? '', '');
    if (!trimmed) return null;
    if (trimmed.length < 100) return null; // 최소 길이 검증
    if (trimmed.length > AssociationBylawsService.MAX_PASTE_LENGTH) return null; // 최대 길이
    const { siteName, combinationName } = this.extractNamesFromRawText(trimmed);
    const sections = this.extractFromRawText(trimmed, siteName);
    if (Object.keys(sections).length === 0) return null;
    const analysis = this.saveBylawsAnalysis(projectId, {
      siteName,
      combinationName,
      source: 'manual',
      sections: sections as AssociationBylawsAnalysis['sections'],
    });
    try {
      projectKnowledgeService.removeBylawsEntries(projectId);
      const base = this.getBylawsBaseKnowledge(projectId);
      if (base) {
        projectKnowledgeService.addBylawsToKnowledge(projectId, {
          siteName: base.siteName,
          combinationName: analysis.combinationName,
          summary: base.summary,
          keyPoints: base.keyPoints,
        });
      }
    } catch {
      // optional
    }
    return analysis;
  }

  /**
   * 정관 원문·파일명에서 분석 후 저장 (파일 업로드 시 호출)
   */
  analyzeAndSaveFromFile(projectId: string, rawText: string, fileName?: string): AssociationBylawsAnalysis | null {
    if (!this.isBylawsDocument(fileName || '', rawText)) return null;
    const { siteName, combinationName } = this.extractNamesFromRawText(rawText, fileName);
    const sections = this.extractFromRawText(rawText, siteName);
    if (Object.keys(sections).length === 0) return null;
    return this.saveBylawsAnalysis(projectId, {
      siteName,
      combinationName,
      source: 'file_upload',
      sections: sections as AssociationBylawsAnalysis['sections'],
    });
  }

  /**
   * 정관 원문 텍스트에서 구조화 분석 추출 (휴리스틱)
   */
  extractFromRawText(rawText: string, _siteName?: string): Partial<AssociationBylawsAnalysis['sections']> {
    const sections: Record<string, string> = {};
    const lower = rawText.toLowerCase();

    const patterns: Array<{ key: string; keywords: string[] }> = [
      { key: '기본정보', keywords: ['조합의 명칭', '조합명', '정비구역', '사업구분', '대지면적', '규모', '세대수', '제1장 총칙', '설립목적'] },
      { key: '임원', keywords: ['조합장', '이사', '감사', '임기', '선출', '결격사유'] },
      { key: '총회', keywords: ['총회', '소집', '의결', '정족수', '과반수', '개회'] },
      { key: '대의원회', keywords: ['대의원', '대의원회', '대의원 선출'] },
      { key: '시공사선정', keywords: ['시공자', '시공사', '선정', '입찰', '경쟁', '수의계약', '평가기준', '합동설명회'] },
      { key: '비용분담', keywords: ['분담금', '정비사업비', '징수', '청산', '경비 부과'] },
      { key: '분양', keywords: ['분양', '배정', '동호수', '추첨', '구분소유권'] },
      { key: '기타', keywords: ['조합원 자격', '회의록', '의사록', '정보공개', '정관 변경'] },
    ];

    for (const { key, keywords } of patterns) {
      const idx = keywords.findIndex((k) => lower.includes(k));
      if (idx >= 0) {
        const start = lower.indexOf(keywords[idx]);
        const end = Math.min(rawText.length, start + 500);
        let excerpt = rawText.substring(Math.max(0, start), end);
        // 문장 경계에서 자르기 (마침표·줄바꿈)
        const lastPeriod = excerpt.lastIndexOf('.');
        const lastNewline = excerpt.lastIndexOf('\n');
        const cut = Math.max(lastPeriod, lastNewline, Math.floor(excerpt.length * 0.8));
        if (cut > 200) excerpt = excerpt.substring(0, cut + 1);
        const ex = coerceTrimmedString(excerpt, '');
        if (ex) sections[key] = ex.replace(/\s{2,}/g, ' ');
      }
    }

    return sections;
  }

  /**
   * 정관 분석에서 사업 유형(재건축/재개발) 추출
   * 기본정보·조합명·섹션 본문에서 휴리스틱 추출
   */
  extractProjectType(analysis: AssociationBylawsAnalysis | null): string | null {
    if (!analysis) return null;
    const texts: string[] = [];
    for (const [, value] of Object.entries(analysis.sections)) {
      if (typeof value === 'string') texts.push(value);
      else if (typeof value === 'object')
        for (const v of Object.values(value)) if (typeof v === 'string') texts.push(v);
    }
    const comb = analysis.combinationName || '';
    const full = [comb, ...texts].join(' ');
    const hasReconst = /재건축|주택재건축|소규모재건축/.test(full);
    const hasRedevel = /재개발|소규모재개발/.test(full);
    if (hasReconst && hasRedevel) return '재건축·재개발';
    if (hasReconst) return '재건축';
    if (hasRedevel) return '재개발';
    return null;
  }

  /**
   * 프로젝트별 정관 보유 여부
   */
  hasBylaws(projectId: string): boolean {
    return this.getBylawsAnalysis(projectId) !== null;
  }

  /**
   * 전체 현장별 정관 인덱스 (프로젝트Id -> 현장명)
   */
  getBylawsIndex(): Record<string, string> {
    try {
      const data = localStorage.getItem(BYLAWS_INDEX_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * 프롬프트에서 현장명 패턴 추출 (휴리스틱)
   * @param prompt 사용자 입력
   * @returns 추출된 현장명 후보 배열
   */
  extractSiteNamesFromPrompt(prompt: string): string[] {
    if (!coerceTrimmedString(prompt ?? '', '')) return [];
    const results = new Set<string>();
    // 패턴 1: 한글+숫자+차 (예: ○○단지3차)
    const pattern1 = /([가-힣]{2,}[0-9]+차?)\b/g;
    // 패턴 2: 한글+숫자 (예: 단지명123)
    const pattern2 = /([가-힣]{2,}[0-9]+)\b/g;
    const stopWords = /^(그것|이것|저것|어떻게|무엇|언제|어디서|몇가지|몇개|여러가지|몇번|몇년|몇차|제1차|제2차|일차|이차)$/;
    for (const pattern of [pattern1, pattern2]) {
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(prompt)) !== null) {
        const s = coerceTrimmedString(m[1], '');
        if (s.length >= 3 && !stopWords.test(s) && !/^[0-9]+$/.test(s)) {
          results.add(s);
        }
      }
    }
    return Array.from(results);
  }

  /**
   * 프롬프트에 언급된 현장에 대한 정관 컨텍스트 수집 (현재 프로젝트 외 타 프로젝트 포함)
   * @param prompt 사용자 프롬프트
   * @param currentProjectId 현재 프로젝트 ID
   * @returns 추가할 정관 컨텍스트 문자열 (없으면 빈 문자열)
   */
  /** 프롬프트에 언급된 타 현장 정관 수집 시 최대 개수 (컨텍스트 오버플로우 방지) */
  private static readonly MAX_MENTIONED_SITES = 2;

  getBylawsContextForMentionedSites(prompt: string, currentProjectId?: string): string {
    const siteNames = this.extractSiteNamesFromPrompt(prompt);
    if (siteNames.length === 0) return '';

    const parts: string[] = [];
    const seenProjectIds = new Set<string>();

    for (const siteName of siteNames) {
      if (parts.length >= AssociationBylawsService.MAX_MENTIONED_SITES) break;
      const projectIds = this.findProjectIdsBySiteName(siteName);
      for (const pid of projectIds) {
        if (parts.length >= AssociationBylawsService.MAX_MENTIONED_SITES) break;
        if (seenProjectIds.has(pid)) continue;
        if (pid === currentProjectId) continue;

        const ctx = this.formatBylawsContextForPrompt(pid);
        if (ctx) {
          seenProjectIds.add(pid);
          const analysis = this.getBylawsAnalysis(pid);
          const label = analysis ? `[${analysis.siteName} 현장 정관 - 참고용]` : '[참고용 정관]';
          parts.push(`\n${label}\n${ctx}`);
        }
      }
    }
    return parts.length > 0 ? parts.join('\n') : '';
  }

  /**
   * 현장명으로 프로젝트 ID 검색 (프로젝트–현장 매핑)
   * @param siteName 현장·프로젝트 표시명
   * @returns 매칭되는 projectId 배열 (부분 일치 포함)
   */
  findProjectIdsBySiteName(siteName: string): string[] {
    if (!coerceTrimmedString(siteName ?? '', '')) return [];
    const index = this.getBylawsIndex();
    const normalized = coerceTrimmedString(siteName ?? '', '').toLowerCase();
    return Object.entries(index)
      .filter(([, name]) => name?.toLowerCase().includes(normalized) || normalized.includes(name?.toLowerCase() ?? ''))
      .map(([id]) => id);
  }

  private updateIndex(projectId: string, siteName: string): void {
    const index = this.getBylawsIndex();
    index[projectId] = siteName;
    localStorage.setItem(BYLAWS_INDEX_KEY, JSON.stringify(index));
  }

  /**
   * 정관 분석 결과 삭제 (projectKnowledgeService 연동)
   */
  removeBylaws(projectId: string): void {
    localStorage.removeItem(BYLAWS_STORAGE_KEY + projectId);
    const index = this.getBylawsIndex();
    delete index[projectId];
    localStorage.setItem(BYLAWS_INDEX_KEY, JSON.stringify(index));
    try {
      projectKnowledgeService.removeBylawsEntries(projectId);
    } catch (err) {
      errorLogger.warn('정관 지식베이스 연동 삭제 실패(무시)', {
        component: 'associationBylawsService',
        projectId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export const associationBylawsService = AssociationBylawsService.getInstance();
