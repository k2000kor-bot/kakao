/**
 * 🧠 고급 지식 베이스 시스템
 * 다양한 기술 스택과 도메인 지식을 체계적으로 관리하고 제공
 */

export interface TechnologyKnowledge {
    name: string;
    category: string;
    concepts: string[];
    bestPractices: Array<{
        practice: string;
        reasoning: string;
        example: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
    commonIssues: Array<{
        issue: string;
        symptoms: string[];
        solutions: string[];
        prevention: string[];
    }>;
    codeTemplates: Array<{
        name: string;
        description: string;
        code: string;
        language: string;
        useCases: string[];
        dependencies?: string[];
    }>;
    learningPath: Array<{
        level: string;
        topics: string[];
        resources: string[];
        projects: string[];
    }>;
    relatedTechnologies: string[];
    industryUsage: {
        popularity: number;
        trends: string[];
        jobMarket: string;
        salaryRange?: string;
    };
}

export interface DomainKnowledge {
    domain: string;
    subDomains: string[];
    keyPrinciples: string[];
    methodologies: Array<{
        name: string;
        description: string;
        steps: string[];
        benefits: string[];
        drawbacks: string[];
    }>;
    tools: Array<{
        name: string;
        category: string;
        description: string;
        alternatives: string[];
    }>;
    careerPaths: Array<{
        role: string;
        skills: string[];
        experience: string;
        responsibilities: string[];
    }>;
}

class AdvancedKnowledgeBase {
    private technologies: Map<string, TechnologyKnowledge> = new Map();
    private domains: Map<string, DomainKnowledge> = new Map();
    private knowledgeGraph: Map<string, string[]> = new Map();
    
    constructor() {
        this.initializeTechnologies();
        this.initializeDomains();
        this.buildKnowledgeGraph();
    }

    /**
     * 🔍 기술 스택 기반 지식 검색
     */
    getTechnologyKnowledge(techName: string, userLevel: string = 'intermediate'): TechnologyKnowledge | null {
        const tech = this.technologies.get(techName.toLowerCase());
        if (!tech) return null;

        // 사용자 레벨에 맞는 내용 필터링
        const filteredTech = { ...tech };
        filteredTech.bestPractices = tech.bestPractices.filter(bp => 
            this.isAppropriateForLevel(bp.difficulty, userLevel)
        );

        return filteredTech;
    }

    /**
     * 🎯 문제 상황별 해결책 제안
     */
    getSolutionsForProblem(problem: string, context: any): Array<{
        solution: string;
        implementation: string;
        difficulty: string;
        estimatedTime: string;
        prerequisites: string[];
    }> {
        const solutions = [];
        const problemLower = problem.toLowerCase();

        // 성능 문제
        if (problemLower.includes('느려') || problemLower.includes('성능') || problemLower.includes('속도')) {
            solutions.push({
                solution: '코드 레벨 최적화',
                implementation: '알고리즘 복잡도 개선, 불필요한 연산 제거, 캐싱 적용',
                difficulty: 'intermediate',
                estimatedTime: '1-3일',
                prerequisites: ['프로파일링 도구 사용법', '알고리즘 기초']
            });

            if (context?.technologies?.includes('React')) {
                solutions.push({
                    solution: 'React 성능 최적화',
                    implementation: 'React.memo, useMemo, useCallback 적용, 컴포넌트 분할',
                    difficulty: 'intermediate',
                    estimatedTime: '2-5일',
                    prerequisites: ['React Hooks 이해', 'React DevTools 사용법']
                });
            }
        }

        // 버그 문제
        if (problemLower.includes('오류') || problemLower.includes('버그') || problemLower.includes('에러')) {
            solutions.push({
                solution: '체계적 디버깅',
                implementation: '재현 조건 파악 → 로그 분석 → 단계별 테스트 → 근본 원인 수정',
                difficulty: 'beginner',
                estimatedTime: '0.5-2일',
                prerequisites: ['디버깅 도구 사용법', '로그 분석 능력']
            });
        }

        // 학습 요청
        if (problemLower.includes('배우') || problemLower.includes('공부') || problemLower.includes('학습')) {
            solutions.push({
                solution: '체계적 학습 계획',
                implementation: '기초 개념 → 실습 프로젝트 → 심화 학습 → 실무 적용',
                difficulty: 'beginner',
                estimatedTime: '2-12주',
                prerequisites: ['기본 프로그래밍 지식']
            });
        }

        return solutions;
    }

    /**
     * 📚 학습 경로 추천
     */
    getPersonalizedLearningPath(
        currentSkills: string[], 
        targetRole: string, 
        timeAvailable: string
    ): {
        path: Array<{
            phase: string;
            duration: string;
            topics: string[];
            projects: string[];
            resources: string[];
        }>;
        totalDuration: string;
        difficulty: string;
    } {
        const learningPaths = {
            'frontend-developer': {
                phases: [
                    {
                        phase: 'Foundation',
                        duration: '2-4주',
                        topics: ['HTML5 Semantics', 'CSS3 & Flexbox/Grid', 'JavaScript ES6+'],
                        projects: ['포트폴리오 웹사이트', '반응형 랜딩 페이지'],
                        resources: ['MDN Web Docs', 'freeCodeCamp', 'JavaScript.info']
                    },
                    {
                        phase: 'Framework Mastery',
                        duration: '4-8주',
                        topics: ['React/Vue/Angular', 'State Management', 'Component Design'],
                        projects: ['Todo App with State', 'E-commerce Frontend'],
                        resources: ['공식 문서', 'React/Vue 튜토리얼', 'Component 라이브러리']
                    },
                    {
                        phase: 'Professional Skills',
                        duration: '4-6주',
                        topics: ['Testing', 'Build Tools', 'Performance Optimization'],
                        projects: ['테스트 커버리지 100% 프로젝트', '성능 최적화 사례'],
                        resources: ['Jest/Cypress 문서', 'Webpack/Vite 가이드']
                    }
                ],
                totalDuration: '10-18주',
                difficulty: 'intermediate'
            },
            'backend-developer': {
                phases: [
                    {
                        phase: 'Server Fundamentals',
                        duration: '3-5주',
                        topics: ['HTTP/REST API', 'Database Design', 'Authentication'],
                        projects: ['RESTful API 서버', '사용자 인증 시스템'],
                        resources: ['Node.js 공식 문서', 'Database 설계 가이드']
                    },
                    {
                        phase: 'Advanced Backend',
                        duration: '6-10주',
                        topics: ['Microservices', 'Caching', 'Message Queues'],
                        projects: ['마이크로서비스 아키텍처', '실시간 채팅 서버'],
                        resources: ['System Design 서적', '클라우드 플랫폼 문서']
                    }
                ],
                totalDuration: '9-15주',
                difficulty: 'advanced'
            }
        };

        return learningPaths[targetRole] || {
            path: [],
            totalDuration: '개인 맞춤 계획 필요',
            difficulty: 'varies'
        };
    }

    /**
     * 🔗 관련 기술 추천
     */
    getRelatedTechnologies(currentTech: string[], userGoals: string[]): Array<{
        technology: string;
        relevanceScore: number;
        reason: string;
        learningEffort: string;
        marketDemand: string;
    }> {
        const recommendations = [];

        // React 사용자에게 추천
        if (currentTech.includes('React')) {
            recommendations.push({
                technology: 'Next.js',
                relevanceScore: 0.95,
                reason: 'React 기반 풀스택 프레임워크로 SSR, 성능 최적화 제공',
                learningEffort: '중간 (2-3주)',
                marketDemand: '높음'
            });

            recommendations.push({
                technology: 'TypeScript',
                relevanceScore: 0.90,
                reason: 'React와 완벽 호환, 타입 안전성으로 대규모 프로젝트에 필수',
                learningEffort: '중간 (3-4주)',
                marketDemand: '매우 높음'
            });
        }

        // JavaScript 사용자에게 추천
        if (currentTech.includes('JavaScript')) {
            recommendations.push({
                technology: 'Node.js',
                relevanceScore: 0.85,
                reason: '같은 언어로 백엔드 개발 가능, 풀스택 개발자 경로',
                learningEffort: '낮음 (1-2주)',
                marketDemand: '높음'
            });
        }

        // 목표 기반 추천
        if (userGoals.includes('performance')) {
            recommendations.push({
                technology: 'Web Workers',
                relevanceScore: 0.80,
                reason: '무거운 작업을 백그라운드에서 처리하여 UI 블로킹 방지',
                learningEffort: '중간 (1-2주)',
                marketDemand: '중간'
            });
        }

        return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    /**
     * 🏗️ 기술 스택 초기화
     */
    private initializeTechnologies(): void {
        // React 지식
        this.technologies.set('react', {
            name: 'React',
            category: 'Frontend Framework',
            concepts: ['Components', 'JSX', 'State', 'Props', 'Hooks', 'Context', 'Virtual DOM'],
            bestPractices: [
                {
                    practice: 'Function Components with Hooks',
                    reasoning: '더 간단한 코드, 재사용성, 최신 React 패턴',
                    example: 'const MyComponent = () => { const [state, setState] = useState(); return <div>{state}</div>; }',
                    difficulty: 'beginner'
                },
                {
                    practice: 'Memoization for Performance',
                    reasoning: '불필요한 리렌더링 방지로 성능 향상',
                    example: 'const MemoComponent = React.memo(({ data }) => <div>{data}</div>);',
                    difficulty: 'intermediate'
                }
            ],
            commonIssues: [
                {
                    issue: '무한 리렌더링',
                    symptoms: ['브라우저 멈춤', '메모리 사용량 급증', 'useEffect 무한 호출'],
                    solutions: ['의존성 배열 확인', 'useCallback/useMemo 사용', '상태 업데이트 로직 점검'],
                    prevention: ['ESLint React Hooks 규칙 사용', '의존성 배열 신중하게 관리']
                }
            ],
            codeTemplates: [
                {
                    name: 'Custom Hook Template',
                    description: '재사용 가능한 로직을 위한 커스텀 훅',
                    code: `function useCustomHook(initialValue) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  
  const updateValue = useCallback(async (newValue) => {
    setLoading(true);
    try {
      // 비동기 로직
      setValue(newValue);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { value, loading, updateValue };
}`,
                    language: 'javascript',
                    useCases: ['API 호출', '폼 상태 관리', '로컬 스토리지 연동'],
                    dependencies: ['react']
                }
            ],
            learningPath: [
                {
                    level: 'Beginner',
                    topics: ['JSX 기초', 'Component 생성', 'Props 전달', 'State 관리'],
                    resources: ['React 공식 튜토리얼', 'Create React App'],
                    projects: ['간단한 카운터', 'Todo 리스트']
                },
                {
                    level: 'Intermediate',
                    topics: ['Hooks 심화', 'Context API', '성능 최적화', 'Testing'],
                    resources: ['React Hooks 가이드', 'Testing Library'],
                    projects: ['쇼핑몰 앱', '대시보드']
                }
            ],
            relatedTechnologies: ['Next.js', 'TypeScript', 'Redux', 'React Router'],
            industryUsage: {
                popularity: 95,
                trends: ['Server Components', 'Concurrent Features', 'Suspense'],
                jobMarket: '매우 높은 수요',
                salaryRange: '중급: 4000-6000만원, 시니어: 6000-8000만원'
            }
        });

        // TypeScript 지식
        this.technologies.set('typescript', {
            name: 'TypeScript',
            category: 'Programming Language',
            concepts: ['Types', 'Interfaces', 'Generics', 'Union Types', 'Type Guards', 'Modules'],
            bestPractices: [
                {
                    practice: 'Strict Type Checking',
                    reasoning: '런타임 오류를 컴파일 타임에 발견',
                    example: 'interface User { id: number; name: string; } const user: User = { id: 1, name: "John" };',
                    difficulty: 'beginner'
                },
                {
                    practice: 'Generic Types for Reusability',
                    reasoning: '타입 안전성을 유지하면서 재사용 가능한 코드 작성',
                    example: 'function identity<T>(arg: T): T { return arg; }',
                    difficulty: 'intermediate'
                }
            ],
            commonIssues: [
                {
                    issue: 'any 타입 남용',
                    symptoms: ['타입 체킹 우회', '런타임 오류 발생', 'IDE 자동완성 불가'],
                    solutions: ['구체적인 타입 정의', '유니온 타입 사용', '타입 가드 구현'],
                    prevention: ['strict 모드 사용', 'ESLint @typescript-eslint 규칙']
                }
            ],
            codeTemplates: [
                {
                    name: 'API Response Type',
                    description: 'API 응답을 위한 제네릭 타입',
                    code: `interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;`,
                    language: 'typescript',
                    useCases: ['API 타입 정의', '응답 데이터 타입 안전성'],
                    dependencies: []
                }
            ],
            learningPath: [
                {
                    level: 'Beginner',
                    topics: ['기본 타입', '인터페이스', '함수 타입', '배열 타입'],
                    resources: ['TypeScript Handbook', 'TypeScript Playground'],
                    projects: ['기존 JS 프로젝트를 TS로 마이그레이션']
                }
            ],
            relatedTechnologies: ['JavaScript', 'React', 'Node.js', 'Angular'],
            industryUsage: {
                popularity: 90,
                trends: ['Template Literal Types', 'Conditional Types', '타입 추론 개선'],
                jobMarket: '급속히 증가하는 수요',
                salaryRange: '중급: 4500-6500만원, 시니어: 6500-9000만원'
            }
        });

        // Node.js 지식
        this.technologies.set('node.js', {
            name: 'Node.js',
            category: 'Backend Runtime',
            concepts: ['Event Loop', 'Modules', 'Streams', 'Buffer', 'File System', 'HTTP Server'],
            bestPractices: [
                {
                    practice: 'Async/Await over Callbacks',
                    reasoning: '콜백 헬 방지, 가독성 향상, 에러 처리 개선',
                    example: 'const data = await fs.promises.readFile("file.txt", "utf8");',
                    difficulty: 'beginner'
                },
                {
                    practice: 'Environment Configuration',
                    reasoning: '환경별 설정 분리, 보안 강화',
                    example: 'const PORT = process.env.PORT || 3000;',
                    difficulty: 'beginner'
                }
            ],
            commonIssues: [
                {
                    issue: '메모리 누수',
                    symptoms: ['메모리 사용량 지속 증가', '서버 성능 저하', 'Out of Memory 오류'],
                    solutions: ['이벤트 리스너 정리', '타이머 해제', 'WeakMap 사용'],
                    prevention: ['메모리 프로파일링', '정기적인 모니터링']
                }
            ],
            codeTemplates: [
                {
                    name: 'Express Server Setup',
                    description: 'Express 서버 기본 설정',
                    code: `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(helmet());
app.use(cors());
app.use(express.json());

// 라우트
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
                    language: 'javascript',
                    useCases: ['REST API 서버', '웹 서비스 백엔드'],
                    dependencies: ['express', 'cors', 'helmet']
                }
            ],
            learningPath: [
                {
                    level: 'Beginner',
                    topics: ['기본 모듈', 'HTTP 서버', 'File System', 'NPM'],
                    resources: ['Node.js 공식 문서', 'Node.js 튜토리얼'],
                    projects: ['간단한 웹 서버', 'CLI 도구']
                }
            ],
            relatedTechnologies: ['Express.js', 'MongoDB', 'PostgreSQL', 'Redis'],
            industryUsage: {
                popularity: 85,
                trends: ['ESM 지원', '성능 개선', 'Web Streams'],
                jobMarket: '높은 수요',
                salaryRange: '중급: 4000-6000만원, 시니어: 6000-8500만원'
            }
        });
    }

    /**
     * 🏢 도메인 지식 초기화
     */
    private initializeDomains(): void {
        this.domains.set('web-development', {
            domain: 'Web Development',
            subDomains: ['Frontend', 'Backend', 'Full-stack', 'DevOps'],
            keyPrinciples: [
                'User Experience First',
                'Performance Optimization',
                'Security by Design',
                'Accessibility',
                'Maintainable Code'
            ],
            methodologies: [
                {
                    name: 'Agile Development',
                    description: '반복적이고 점진적인 개발 방법론',
                    steps: ['요구사항 분석', '스프린트 계획', '개발', '테스트', '배포', '회고'],
                    benefits: ['빠른 피드백', '변화 대응', '품질 향상'],
                    drawbacks: ['초기 계획 부족', '문서화 부족 위험']
                }
            ],
            tools: [
                {
                    name: 'Git',
                    category: 'Version Control',
                    description: '분산 버전 관리 시스템',
                    alternatives: ['SVN', 'Mercurial']
                }
            ],
            careerPaths: [
                {
                    role: 'Frontend Developer',
                    skills: ['HTML/CSS', 'JavaScript', 'React/Vue', 'UI/UX'],
                    experience: '0-2년: 주니어, 3-5년: 시니어, 5년+: 리드',
                    responsibilities: ['UI 구현', '사용자 경험 개선', '성능 최적화']
                }
            ]
        });
    }

    /**
     * 🕸️ 지식 그래프 구축
     */
    private buildKnowledgeGraph(): void {
        this.knowledgeGraph.set('react', ['javascript', 'html', 'css', 'typescript', 'next.js']);
        this.knowledgeGraph.set('typescript', ['javascript', 'node.js', 'react', 'angular']);
        this.knowledgeGraph.set('node.js', ['javascript', 'express.js', 'mongodb', 'postgresql']);
    }

    /**
     * 📊 사용자 레벨 적합성 확인
     */
    private isAppropriateForLevel(difficulty: string, userLevel: string): boolean {
        const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
        return levels[difficulty] <= levels[userLevel] + 1;
    }
}

export default AdvancedKnowledgeBase;
