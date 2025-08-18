import { useState, useCallback, useEffect } from 'react';

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    prompt: string;
    variables: string[];
    tags: string[];
    usageCount: number;
    rating: number;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}

export interface TemplateFilter {
    category: string;
    searchTerm: string;
    tags: string[];
    sortBy: 'name' | 'usage' | 'rating' | 'created';
    sortOrder: 'asc' | 'desc';
}

const DEFAULT_CATEGORIES: TemplateCategory[] = [
    {
        id: 'writing',
        name: '글쓰기',
        description: '블로그, 에세이, 보고서 작성',
        icon: '✍️',
        color: 'blue'
    },
    {
        id: 'analysis',
        name: '분석',
        description: '데이터 분석 및 인사이트',
        icon: '📊',
        color: 'green'
    },
    {
        id: 'coding',
        name: '코딩',
        description: '프로그래밍 및 개발',
        icon: '💻',
        color: 'purple'
    },
    {
        id: 'creative',
        name: '창작',
        description: '아이디어 생성 및 창작',
        icon: '🎨',
        color: 'pink'
    },
    {
        id: 'business',
        name: '비즈니스',
        description: '비즈니스 전략 및 마케팅',
        icon: '💼',
        color: 'orange'
    },
    {
        id: 'education',
        name: '교육',
        description: '학습 및 교육 자료',
        icon: '📚',
        color: 'indigo'
    }
];

const DEFAULT_TEMPLATES: PromptTemplate[] = [
    {
        id: 'blog-writer',
        name: '블로그 글 작성',
        description: 'SEO 최적화된 블로그 글을 작성합니다',
        category: 'writing',
        prompt: '다음 주제에 대해 SEO 최적화된 블로그 글을 작성해주세요:\n\n주제: {topic}\n키워드: {keywords}\n목표 독자: {audience}\n글자 수: {wordCount}자\n\n다음 구조로 작성해주세요:\n1. 매력적인 제목\n2. 소개\n3. 주요 내용 (3-4개 섹션)\n4. 결론\n5. 행동 유도',
        variables: ['topic', 'keywords', 'audience', 'wordCount'],
        tags: ['블로그', 'SEO', '마케팅'],
        usageCount: 0,
        rating: 4.5,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'data-analyzer',
        name: '데이터 분석',
        description: '데이터를 분석하고 인사이트를 제공합니다',
        category: 'analysis',
        prompt: '다음 데이터를 분석하고 주요 인사이트를 제공해주세요:\n\n데이터: {data}\n분석 목적: {purpose}\n\n다음 형식으로 분석해주세요:\n1. 데이터 개요\n2. 주요 발견사항\n3. 트렌드 분석\n4. 권장사항\n5. 시각화 제안',
        variables: ['data', 'purpose'],
        tags: ['분석', '데이터', '인사이트'],
        usageCount: 0,
        rating: 4.2,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'code-reviewer',
        name: '코드 리뷰',
        description: '코드를 검토하고 개선사항을 제안합니다',
        category: 'coding',
        prompt: '다음 코드를 리뷰하고 개선사항을 제안해주세요:\n\n코드:\n{code}\n\n언어: {language}\n\n다음 관점에서 리뷰해주세요:\n1. 기능성\n2. 성능\n3. 가독성\n4. 보안\n5. 모범 사례\n6. 개선 제안',
        variables: ['code', 'language'],
        tags: ['코딩', '리뷰', '개선'],
        usageCount: 0,
        rating: 4.8,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'idea-generator',
        name: '아이디어 생성',
        description: '창의적인 아이디어를 생성합니다',
        category: 'creative',
        prompt: '다음 주제에 대한 창의적인 아이디어를 생성해주세요:\n\n주제: {topic}\n목표: {goal}\n제약사항: {constraints}\n\n다음 형식으로 아이디어를 제시해주세요:\n1. 핵심 아이디어\n2. 실행 방법\n3. 예상 효과\n4. 위험 요소\n5. 다음 단계',
        variables: ['topic', 'goal', 'constraints'],
        tags: ['창의성', '아이디어', '혁신'],
        usageCount: 0,
        rating: 4.3,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'business-strategy',
        name: '비즈니스 전략',
        description: '비즈니스 전략을 수립합니다',
        category: 'business',
        prompt: '다음 비즈니스 상황에 대한 전략을 수립해주세요:\n\n비즈니스: {business}\n시장: {market}\n목표: {objective}\n자원: {resources}\n\n다음 구조로 전략을 제시해주세요:\n1. 시장 분석\n2. 경쟁 분석\n3. 핵심 전략\n4. 실행 계획\n5. 성과 측정',
        variables: ['business', 'market', 'objective', 'resources'],
        tags: ['전략', '비즈니스', '계획'],
        usageCount: 0,
        rating: 4.6,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const usePromptTemplates = () => {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [categories] = useState<TemplateCategory[]>(DEFAULT_CATEGORIES);
    const [filter, setFilter] = useState<TemplateFilter>({
        category: 'all',
        searchTerm: '',
        tags: [],
        sortBy: 'name',
        sortOrder: 'asc'
    });

    // 템플릿 로드
    const loadTemplates = useCallback(() => {
        try {
            const saved = localStorage.getItem('prompt-templates');
            if (saved) {
                const parsed = JSON.parse(saved);
                setTemplates(parsed.map((item: any) => ({
                    ...item,
                    createdAt: new Date(item.createdAt),
                    updatedAt: new Date(item.updatedAt)
                })));
            } else {
                // 기본 템플릿 설정
                setTemplates(DEFAULT_TEMPLATES);
                saveTemplates(DEFAULT_TEMPLATES);
            }
        } catch (error) {
            console.error('[Templates] 템플릿 로드 실패:', error);
            setTemplates(DEFAULT_TEMPLATES);
        }
    }, []);

    // 템플릿 저장
    const saveTemplates = useCallback((newTemplates: PromptTemplate[]) => {
        try {
            localStorage.setItem('prompt-templates', JSON.stringify(newTemplates));
        } catch (error) {
            console.error('[Templates] 템플릿 저장 실패:', error);
        }
    }, []);

    // 템플릿 추가
    const addTemplate = useCallback((template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
        const newTemplate: PromptTemplate = {
            ...template,
            id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const updatedTemplates = [newTemplate, ...templates];
        setTemplates(updatedTemplates);
        saveTemplates(updatedTemplates);
    }, [templates, saveTemplates]);

    // 템플릿 업데이트
    const updateTemplate = useCallback((id: string, updates: Partial<PromptTemplate>) => {
        const updatedTemplates = templates.map(template =>
            template.id === id
                ? { ...template, ...updates, updatedAt: new Date() }
                : template
        );
        setTemplates(updatedTemplates);
        saveTemplates(updatedTemplates);
    }, [templates, saveTemplates]);

    // 템플릿 삭제
    const deleteTemplate = useCallback((id: string) => {
        const updatedTemplates = templates.filter(template => template.id !== id);
        setTemplates(updatedTemplates);
        saveTemplates(updatedTemplates);
    }, [templates, saveTemplates]);

    // 템플릿 사용
    const useTemplate = useCallback((id: string) => {
        const template = templates.find(t => t.id === id);
        if (template) {
            updateTemplate(id, { usageCount: template.usageCount + 1 });
            return template;
        }
        return null;
    }, [templates, updateTemplate]);

    // 템플릿 평가
    const rateTemplate = useCallback((id: string, rating: number) => {
        updateTemplate(id, { rating });
    }, [updateTemplate]);

    // 변수 추출
    const extractVariables = useCallback((prompt: string): string[] => {
        const variableRegex = /\{([^}]+)\}/g;
        const variables: string[] = [];
        let match;

        while ((match = variableRegex.exec(prompt)) !== null) {
            variables.push(match[1]);
        }

        return Array.from(new Set(variables));
    }, []);

    // 프롬프트 렌더링
    const renderPrompt = useCallback((template: PromptTemplate, variables: Record<string, string>): string => {
        let renderedPrompt = template.prompt;

        template.variables.forEach(variable => {
            const value = variables[variable] || `{${variable}}`;
            renderedPrompt = renderedPrompt.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
        });

        return renderedPrompt;
    }, []);

    // 필터링된 템플릿
    const getFilteredTemplates = useCallback(() => {
        let filtered = templates.filter(template => {
            // 카테고리 필터
            if (filter.category !== 'all' && template.category !== filter.category) {
                return false;
            }

            // 검색어 필터
            if (filter.searchTerm && !template.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) &&
                !template.description.toLowerCase().includes(filter.searchTerm.toLowerCase())) {
                return false;
            }

            // 태그 필터
            if (filter.tags.length > 0 && !filter.tags.some(tag => template.tags.includes(tag))) {
                return false;
            }

            return true;
        });

        // 정렬
        filtered.sort((a, b) => {
            let aValue: string | number | Date;
            let bValue: string | number | Date;

            switch (filter.sortBy) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'usage':
                    aValue = a.usageCount;
                    bValue = b.usageCount;
                    break;
                case 'rating':
                    aValue = a.rating;
                    bValue = b.rating;
                    break;
                case 'created':
                    aValue = a.createdAt;
                    bValue = b.createdAt;
                    break;
                default:
                    aValue = a.name;
                    bValue = b.name;
            }

            if (filter.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [templates, filter]);

    // 통계 계산
    const getStats = useCallback(() => {
        const totalTemplates = templates.length;
        const totalUsage = templates.reduce((sum, template) => sum + template.usageCount, 0);
        const averageRating = templates.length > 0
            ? templates.reduce((sum, template) => sum + template.rating, 0) / templates.length
            : 0;
        const publicTemplates = templates.filter(template => template.isPublic).length;

        const categoryStats = categories.map(category => ({
            ...category,
            count: templates.filter(template => template.category === category.id).length
        }));

        return {
            totalTemplates,
            totalUsage,
            averageRating: Math.round(averageRating * 10) / 10,
            publicTemplates,
            categoryStats
        };
    }, [templates, categories]);

    // 템플릿 내보내기
    const exportTemplates = useCallback(() => {
        const dataStr = JSON.stringify(templates, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prompt-templates-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }, [templates]);

    // 템플릿 가져오기
    const importTemplates = useCallback((file: File) => {
        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target?.result as string);
                    const validatedTemplates = imported.map((item: any) => ({
                        ...item,
                        createdAt: new Date(item.createdAt),
                        updatedAt: new Date(item.updatedAt)
                    }));
                    setTemplates(validatedTemplates);
                    saveTemplates(validatedTemplates);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }, [saveTemplates]);

    // 초기 로드
    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    return {
        templates: getFilteredTemplates(),
        categories,
        filter,
        setFilter,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        useTemplate,
        rateTemplate,
        extractVariables,
        renderPrompt,
        getStats,
        exportTemplates,
        importTemplates
    };
};
