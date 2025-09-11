import { Project } from '../types/project';
import { projectService } from './projectService';

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: 'business' | 'development' | 'research' | 'marketing' | 'education' | 'personal';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedDuration: string;
    tags: string[];
    structure: {
        guidelines: string;
        suggestedFiles: string[];
        initialChats: {
            title: string;
            description: string;
            suggestedQuestions: string[];
        }[];
        milestones: {
            name: string;
            description: string;
            estimatedDays: number;
        }[];
    };
    aiPrompts: {
        welcome: string;
        guidance: string[];
        troubleshooting: string[];
    };
}

export interface TemplateRecommendation {
    template: ProjectTemplate;
    matchScore: number;
    reasons: string[];
    customizations: {
        field: string;
        suggestion: string;
    }[];
}

class SmartTemplateEngine {
    private templates: ProjectTemplate[] = [];

    constructor() {
        this.initializeTemplates();
    }

    private initializeTemplates() {
        this.templates = [
            {
                id: 'web_development',
                name: '웹 개발 프로젝트',
                description: '웹사이트나 웹 애플리케이션 개발을 위한 종합적인 템플릿',
                category: 'development',
                difficulty: 'intermediate',
                estimatedDuration: '2-6개월',
                tags: ['웹개발', 'React', 'Node.js', 'JavaScript', 'HTML', 'CSS'],
                structure: {
                    guidelines: `웹 개발 프로젝트 가이드라인:
1. 요구사항 분석 및 기획
2. UI/UX 디자인 및 프로토타입
3. 프론트엔드 개발 (React, Vue, Angular 등)
4. 백엔드 API 개발 (Node.js, Python, Java 등)
5. 데이터베이스 설계 및 구현
6. 테스트 및 배포
7. 유지보수 및 최적화

코딩 컨벤션을 준수하고, 버전 관리를 철저히 하며, 문서화를 병행하세요.`,
                    suggestedFiles: [
                        'requirements.md',
                        'design-mockup.figma',
                        'api-documentation.md',
                        'database-schema.sql',
                        'deployment-guide.md'
                    ],
                    initialChats: [
                        {
                            title: '프로젝트 기획 및 요구사항',
                            description: '프로젝트의 목표, 기능, 요구사항을 정의합니다',
                            suggestedQuestions: [
                                '이 웹사이트의 주요 목적은 무엇인가요?',
                                '타겟 사용자는 누구인가요?',
                                '필수 기능과 선택 기능을 구분해주세요',
                                '예산과 일정은 어떻게 되나요?'
                            ]
                        },
                        {
                            title: '기술 스택 선택',
                            description: '프로젝트에 적합한 기술 스택을 선정합니다',
                            suggestedQuestions: [
                                '프론트엔드 프레임워크는 무엇을 사용할까요?',
                                '백엔드 기술은 어떤 것이 적합할까요?',
                                '데이터베이스는 어떤 종류를 사용해야 할까요?',
                                '호스팅 및 배포 방식을 정해주세요'
                            ]
                        },
                        {
                            title: 'UI/UX 디자인',
                            description: '사용자 인터페이스와 경험을 설계합니다',
                            suggestedQuestions: [
                                '브랜드 컬러와 디자인 컨셉은 무엇인가요?',
                                '반응형 디자인이 필요한가요?',
                                '접근성 요구사항이 있나요?',
                                '참고할 만한 웹사이트가 있나요?'
                            ]
                        }
                    ],
                    milestones: [
                        { name: '요구사항 분석 완료', description: '프로젝트 범위와 기능 정의', estimatedDays: 7 },
                        { name: '디자인 시안 완료', description: 'UI/UX 디자인 및 프로토타입', estimatedDays: 14 },
                        { name: '프론트엔드 개발 완료', description: '사용자 인터페이스 구현', estimatedDays: 30 },
                        { name: '백엔드 API 완료', description: '서버 로직 및 API 구현', estimatedDays: 21 },
                        { name: '테스트 및 배포', description: '품질 검증 및 운영 환경 배포', estimatedDays: 14 }
                    ]
                },
                aiPrompts: {
                    welcome: '웹 개발 프로젝트를 시작하신 것을 환영합니다! 성공적인 웹사이트 구축을 위해 단계별로 도움을 드리겠습니다.',
                    guidance: [
                        '먼저 프로젝트의 목표와 요구사항을 명확히 정의하는 것이 중요합니다.',
                        '기술 스택 선택 시 프로젝트 규모와 팀의 역량을 고려하세요.',
                        '사용자 중심의 디자인을 위해 페르소나와 사용자 여정을 분석하세요.',
                        '개발 과정에서 지속적인 테스트와 코드 리뷰를 진행하세요.'
                    ],
                    troubleshooting: [
                        '성능 이슈가 발생하면 번들 크기, 이미지 최적화, 캐싱 전략을 점검하세요.',
                        '크로스 브라우저 호환성 문제는 Babel과 Polyfill을 활용하여 해결하세요.',
                        'SEO 최적화를 위해 메타 태그, 시맨틱 HTML, 사이트맵을 구성하세요.',
                        '보안 취약점 방지를 위해 HTTPS, CSP, 입력값 검증을 적용하세요.'
                    ]
                }
            },
            {
                id: 'mobile_app',
                name: '모바일 앱 개발',
                description: 'iOS/Android 모바일 애플리케이션 개발 프로젝트',
                category: 'development',
                difficulty: 'advanced',
                estimatedDuration: '3-8개월',
                tags: ['모바일', 'React Native', 'Flutter', 'iOS', 'Android'],
                structure: {
                    guidelines: `모바일 앱 개발 가이드라인:
1. 시장 조사 및 경쟁 분석
2. 앱 기획 및 와이어프레임
3. UI/UX 디자인 (모바일 최적화)
4. 개발 환경 설정
5. 핵심 기능 개발
6. 디바이스 테스트 및 최적화
7. 앱스토어 등록 및 배포
8. 사용자 피드백 수집 및 업데이트

플랫폼별 가이드라인을 준수하고, 성능 최적화에 특별히 신경 쓰세요.`,
                    suggestedFiles: [
                        'market-research.md',
                        'app-wireframe.sketch',
                        'design-system.md',
                        'testing-checklist.md',
                        'store-listing.md'
                    ],
                    initialChats: [
                        {
                            title: '앱 컨셉 및 시장 분석',
                            description: '앱의 핵심 아이디어와 시장 경쟁력을 분석합니다',
                            suggestedQuestions: [
                                '어떤 문제를 해결하는 앱인가요?',
                                '타겟 사용자층은 어떻게 되나요?',
                                '경쟁 앱들과의 차별점은 무엇인가요?',
                                '수익 모델은 어떻게 계획하고 있나요?'
                            ]
                        },
                        {
                            title: '플랫폼 및 기술 선택',
                            description: '개발 플랫폼과 기술 스택을 결정합니다',
                            suggestedQuestions: [
                                'iOS, Android 둘 다 개발할 예정인가요?',
                                '네이티브 vs 크로스플랫폼 중 어떤 것을 선택할까요?',
                                '백엔드 서비스가 필요한가요?',
                                '푸시 알림, 결제 등 특별한 기능이 필요한가요?'
                            ]
                        }
                    ],
                    milestones: [
                        { name: '시장 조사 완료', description: '경쟁 분석 및 사용자 조사', estimatedDays: 10 },
                        { name: '앱 기획 완료', description: '기능 정의 및 와이어프레임', estimatedDays: 14 },
                        { name: 'MVP 개발 완료', description: '핵심 기능 구현', estimatedDays: 45 },
                        { name: '베타 테스트 완료', description: '사용자 테스트 및 피드백 반영', estimatedDays: 21 },
                        { name: '앱스토어 출시', description: '스토어 등록 및 마케팅', estimatedDays: 14 }
                    ]
                },
                aiPrompts: {
                    welcome: '모바일 앱 개발 프로젝트를 시작하셨네요! 성공적인 앱 출시를 위해 체계적으로 진행해보겠습니다.',
                    guidance: [
                        '사용자 경험(UX)이 모바일 앱의 성공을 좌우합니다.',
                        '플랫폼별 디자인 가이드라인을 철저히 준수하세요.',
                        '성능 최적화와 배터리 효율성을 고려한 개발이 중요합니다.',
                        '다양한 디바이스와 OS 버전에서의 테스트를 빠뜨리지 마세요.'
                    ],
                    troubleshooting: [
                        '앱 크래시 문제는 크래시 리포팅 도구를 활용하여 분석하세요.',
                        '메모리 누수는 프로파일링 도구로 정기적으로 점검하세요.',
                        '앱스토어 리젝트 시 가이드라인을 재검토하고 수정하세요.',
                        '사용자 리뷰를 적극 모니터링하고 빠르게 대응하세요.'
                    ]
                }
            },
            {
                id: 'data_analysis',
                name: '데이터 분석 프로젝트',
                description: '데이터 수집, 분석, 시각화를 통한 인사이트 도출 프로젝트',
                category: 'research',
                difficulty: 'intermediate',
                estimatedDuration: '1-3개월',
                tags: ['데이터분석', 'Python', 'R', '머신러닝', '시각화'],
                structure: {
                    guidelines: `데이터 분석 프로젝트 가이드라인:
1. 문제 정의 및 가설 설정
2. 데이터 수집 및 전처리
3. 탐색적 데이터 분석 (EDA)
4. 통계 분석 및 모델링
5. 결과 해석 및 시각화
6. 보고서 작성 및 발표
7. 결과 검증 및 후속 조치

데이터의 품질과 신뢰성을 항상 검증하고, 편향을 주의하세요.`,
                    suggestedFiles: [
                        'data-dictionary.md',
                        'analysis-notebook.ipynb',
                        'visualization-dashboard.html',
                        'final-report.pdf',
                        'presentation.pptx'
                    ],
                    initialChats: [
                        {
                            title: '문제 정의 및 목표 설정',
                            description: '분석하고자 하는 문제와 목표를 명확히 합니다',
                            suggestedQuestions: [
                                '어떤 비즈니스 문제를 해결하려고 하나요?',
                                '분석을 통해 얻고자 하는 인사이트는 무엇인가요?',
                                '성공 지표는 어떻게 정의할 수 있을까요?',
                                '분석 결과를 어떻게 활용할 예정인가요?'
                            ]
                        },
                        {
                            title: '데이터 수집 및 품질 검증',
                            description: '필요한 데이터를 수집하고 품질을 평가합니다',
                            suggestedQuestions: [
                                '어떤 데이터가 필요한가요?',
                                '데이터는 어디서 구할 수 있나요?',
                                '데이터의 품질과 완성도는 어떤가요?',
                                '개인정보보호 등 법적 이슈는 없나요?'
                            ]
                        }
                    ],
                    milestones: [
                        { name: '문제 정의 완료', description: '분석 목표 및 가설 설정', estimatedDays: 3 },
                        { name: '데이터 수집 완료', description: '필요한 데이터 확보 및 전처리', estimatedDays: 7 },
                        { name: 'EDA 완료', description: '탐색적 데이터 분석', estimatedDays: 10 },
                        { name: '모델링 완료', description: '통계 분석 및 예측 모델 구축', estimatedDays: 14 },
                        { name: '보고서 완료', description: '결과 정리 및 발표 자료 작성', estimatedDays: 7 }
                    ]
                },
                aiPrompts: {
                    welcome: '데이터 분석 프로젝트를 시작하셨네요! 데이터에서 의미 있는 인사이트를 찾아보겠습니다.',
                    guidance: [
                        '명확한 문제 정의가 성공적인 분석의 첫걸음입니다.',
                        '데이터 품질 검증을 소홀히 하지 마세요.',
                        '시각화를 통해 복잡한 결과를 쉽게 전달하세요.',
                        '분석 결과의 한계와 가정을 명시하는 것이 중요합니다.'
                    ],
                    troubleshooting: [
                        '결측치가 많다면 대체 방법을 신중히 선택하세요.',
                        '이상치는 제거하기 전에 원인을 파악하세요.',
                        '과적합 문제는 교차 검증으로 해결하세요.',
                        '상관관계와 인과관계를 혼동하지 마세요.'
                    ]
                }
            },
            {
                id: 'marketing_campaign',
                name: '마케팅 캠페인',
                description: '브랜드 인지도 향상 및 고객 획득을 위한 마케팅 프로젝트',
                category: 'marketing',
                difficulty: 'beginner',
                estimatedDuration: '1-2개월',
                tags: ['마케팅', '브랜딩', 'SNS', '광고', '콘텐츠'],
                structure: {
                    guidelines: `마케팅 캠페인 가이드라인:
1. 타겟 고객 분석 및 페르소나 설정
2. 마케팅 목표 및 KPI 정의
3. 메시지 및 크리에이티브 전략 수립
4. 채널별 실행 계획 수립
5. 콘텐츠 제작 및 배포
6. 성과 모니터링 및 최적화
7. 결과 분석 및 다음 캠페인 기획

데이터 기반의 의사결정을 하고, A/B 테스트를 적극 활용하세요.`,
                    suggestedFiles: [
                        'target-persona.md',
                        'campaign-strategy.pptx',
                        'content-calendar.xlsx',
                        'creative-assets/',
                        'performance-report.pdf'
                    ],
                    initialChats: [
                        {
                            title: '타겟 고객 및 목표 설정',
                            description: '캠페인의 타겟과 목표를 명확히 정의합니다',
                            suggestedQuestions: [
                                '주요 타겟 고객은 누구인가요?',
                                '이번 캠페인의 핵심 목표는 무엇인가요?',
                                '예산과 기간은 어떻게 되나요?',
                                '성공을 어떻게 측정할 예정인가요?'
                            ]
                        },
                        {
                            title: '메시지 및 크리에이티브 전략',
                            description: '캠페인의 핵심 메시지와 크리에이티브 방향을 설정합니다',
                            suggestedQuestions: [
                                '브랜드의 핵심 가치는 무엇인가요?',
                                '고객에게 전달하고 싶은 메시지는?',
                                '어떤 톤앤매너로 소통할까요?',
                                '경쟁사와의 차별점은 무엇인가요?'
                            ]
                        }
                    ],
                    milestones: [
                        { name: '전략 수립 완료', description: '타겟 분석 및 캠페인 전략 확정', estimatedDays: 7 },
                        { name: '크리에이티브 완료', description: '콘텐츠 및 광고 소재 제작', estimatedDays: 14 },
                        { name: '캠페인 런칭', description: '각 채널별 캠페인 시작', estimatedDays: 3 },
                        { name: '중간 최적화', description: '성과 분석 및 캠페인 조정', estimatedDays: 7 },
                        { name: '최종 결과 분석', description: '캠페인 성과 평가 및 보고', estimatedDays: 7 }
                    ]
                },
                aiPrompts: {
                    welcome: '마케팅 캠페인 프로젝트를 시작하셨네요! 효과적인 캠페인 기획부터 실행까지 도와드리겠습니다.',
                    guidance: [
                        '고객의 니즈와 행동 패턴을 깊이 이해하는 것이 중요합니다.',
                        '명확하고 일관된 메시지로 브랜드 정체성을 구축하세요.',
                        '다양한 채널을 활용하되 각각의 특성을 고려하세요.',
                        '데이터를 기반으로 지속적으로 최적화하세요.'
                    ],
                    troubleshooting: [
                        'CTR이 낮다면 크리에이티브나 타겟팅을 재검토하세요.',
                        '전환율이 낮다면 랜딩페이지를 최적화하세요.',
                        '브랜드 인지도가 낮다면 노출 빈도를 늘리세요.',
                        'ROI가 낮다면 채널별 성과를 분석하여 재배분하세요.'
                    ]
                }
            },
            {
                id: 'research_paper',
                name: '학술 연구 프로젝트',
                description: '체계적인 연구 방법론을 통한 학술 논문 작성 프로젝트',
                category: 'research',
                difficulty: 'advanced',
                estimatedDuration: '3-12개월',
                tags: ['연구', '논문', '학술', '분석', '실험'],
                structure: {
                    guidelines: `학술 연구 프로젝트 가이드라인:
1. 연구 주제 선정 및 문헌 조사
2. 연구 질문 및 가설 설정
3. 연구 방법론 설계
4. 데이터 수집 및 실험 수행
5. 결과 분석 및 해석
6. 논문 작성 및 검토
7. 학술지 투고 및 피어 리뷰
8. 연구 결과 발표 및 확산

연구 윤리를 준수하고, 재현 가능한 연구를 수행하세요.`,
                    suggestedFiles: [
                        'literature-review.md',
                        'research-proposal.pdf',
                        'methodology.md',
                        'data-collection-log.xlsx',
                        'manuscript-draft.docx'
                    ],
                    initialChats: [
                        {
                            title: '연구 주제 및 문제 정의',
                            description: '연구할 주제와 해결하고자 하는 문제를 명확히 합니다',
                            suggestedQuestions: [
                                '어떤 분야의 연구를 하고 싶으신가요?',
                                '기존 연구의 한계나 gap은 무엇인가요?',
                                '이 연구의 학술적/실용적 기여는?',
                                '연구 범위와 제약사항은 무엇인가요?'
                            ]
                        },
                        {
                            title: '연구 방법론 설계',
                            description: '연구 목적에 적합한 방법론을 선택하고 설계합니다',
                            suggestedQuestions: [
                                '정량적 vs 정성적 연구 중 어떤 것이 적합한가요?',
                                '데이터는 어떻게 수집할 예정인가요?',
                                '표본 크기와 선정 기준은?',
                                '연구 윤리 승인이 필요한가요?'
                            ]
                        }
                    ],
                    milestones: [
                        { name: '문헌 조사 완료', description: '기존 연구 분석 및 연구 gap 식별', estimatedDays: 30 },
                        { name: '연구 계획 승인', description: '연구 제안서 작성 및 승인', estimatedDays: 14 },
                        { name: '데이터 수집 완료', description: '실험 수행 및 데이터 확보', estimatedDays: 60 },
                        { name: '결과 분석 완료', description: '통계 분석 및 결과 해석', estimatedDays: 30 },
                        { name: '논문 초고 완료', description: '논문 작성 및 내부 검토', estimatedDays: 45 }
                    ]
                },
                aiPrompts: {
                    welcome: '학술 연구 프로젝트를 시작하셨네요! 체계적이고 엄밀한 연구 수행을 도와드리겠습니다.',
                    guidance: [
                        '명확하고 구체적인 연구 질문을 설정하는 것이 중요합니다.',
                        '기존 문헌을 충분히 검토하여 연구의 독창성을 확보하세요.',
                        '연구 방법론은 연구 질문에 적합하게 선택하세요.',
                        '연구 윤리와 데이터 관리 원칙을 철저히 준수하세요.'
                    ],
                    troubleshooting: [
                        '연구 진행이 막힌다면 지도교수나 동료와 상의하세요.',
                        '데이터 품질에 문제가 있다면 수집 방법을 재검토하세요.',
                        '결과가 가설과 다르다면 원인을 분석하고 새로운 해석을 시도하세요.',
                        '논문 리젝트 시 리뷰어 의견을 꼼꼼히 분석하여 수정하세요.'
                    ]
                }
            }
        ];
    }

    // 사용자 입력 기반 템플릿 추천
    async recommendTemplates(
        projectName: string,
        description: string,
        tags: string[] = [],
        userPreferences?: {
            category?: string;
            difficulty?: string;
            duration?: string;
        }
    ): Promise<TemplateRecommendation[]> {
        const recommendations: TemplateRecommendation[] = [];

        for (const template of this.templates) {
            const matchScore = this.calculateMatchScore(
                template,
                projectName,
                description,
                tags,
                userPreferences
            );

            if (matchScore > 0.3) {
                const reasons = this.generateMatchReasons(template, projectName, description, tags);
                const customizations = this.generateCustomizations(template, projectName, description);

                recommendations.push({
                    template,
                    matchScore,
                    reasons,
                    customizations
                });
            }
        }

        return recommendations.sort((a, b) => b.matchScore - a.matchScore);
    }

    // 템플릿으로부터 프로젝트 생성
    async createProjectFromTemplate(
        templateId: string,
        projectName: string,
        customizations?: { [key: string]: any }
    ): Promise<Project> {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) {
            throw new Error('템플릿을 찾을 수 없습니다.');
        }

        // 기본 프로젝트 데이터 생성
        const projectData = {
            name: projectName,
            description: customizations?.description || template.description,
            guidelines: this.customizeGuidelines(template.structure.guidelines, customizations),
            tags: [...template.tags, ...(customizations?.additionalTags || [])],
            status: 'active' as const,
            files: [],
            instructions: this.customizeGuidelines(template.structure.guidelines, customizations),
            isActive: true,
            type: 'conversation' as const
        };

        // 프로젝트 생성
        const project = projectService.createProject(projectData);

        // 초기 채팅 생성 (비동기로 처리)
        setTimeout(() => {
            this.createInitialChats(project.id, template);
        }, 1000);

        return project;
    }

    // 매치 점수 계산
    private calculateMatchScore(
        template: ProjectTemplate,
        projectName: string,
        description: string,
        tags: string[],
        preferences?: any
    ): number {
        let score = 0;

        // 키워드 매칭 (40%)
        const keywordScore = this.calculateKeywordMatch(
            template,
            projectName + ' ' + description,
            tags
        );
        score += keywordScore * 0.4;

        // 카테고리 매칭 (30%)
        if (preferences?.category && preferences.category === template.category) {
            score += 0.3;
        }

        // 난이도 매칭 (15%)
        if (preferences?.difficulty && preferences.difficulty === template.difficulty) {
            score += 0.15;
        }

        // 태그 매칭 (15%)
        const tagMatchScore = this.calculateTagMatch(template.tags, tags);
        score += tagMatchScore * 0.15;

        return Math.min(1, score);
    }

    // 키워드 매칭 계산
    private calculateKeywordMatch(
        template: ProjectTemplate,
        text: string,
        tags: string[]
    ): number {
        const templateKeywords = [
            ...template.name.toLowerCase().split(' '),
            ...template.description.toLowerCase().split(' '),
            ...template.tags.map(tag => tag.toLowerCase())
        ];

        const inputKeywords = [
            ...text.toLowerCase().split(' '),
            ...tags.map(tag => tag.toLowerCase())
        ];

        const matches = templateKeywords.filter(keyword =>
            inputKeywords.some(input => input.includes(keyword) || keyword.includes(input))
        );

        return matches.length / templateKeywords.length;
    }

    // 태그 매칭 계산
    private calculateTagMatch(templateTags: string[], inputTags: string[]): number {
        if (inputTags.length === 0) return 0;

        const matches = templateTags.filter(tag =>
            inputTags.some(input =>
                tag.toLowerCase().includes(input.toLowerCase()) ||
                input.toLowerCase().includes(tag.toLowerCase())
            )
        );

        return matches.length / Math.max(templateTags.length, inputTags.length);
    }

    // 매칭 이유 생성
    private generateMatchReasons(
        template: ProjectTemplate,
        projectName: string,
        description: string,
        tags: string[]
    ): string[] {
        const reasons: string[] = [];

        // 카테고리 매칭
        reasons.push(`${template.category} 분야에 특화된 템플릿입니다`);

        // 태그 매칭
        const matchingTags = template.tags.filter(tag =>
            tags.some(input =>
                tag.toLowerCase().includes(input.toLowerCase()) ||
                input.toLowerCase().includes(tag.toLowerCase())
            )
        );

        if (matchingTags.length > 0) {
            reasons.push(`${matchingTags.join(', ')} 관련 기능을 포함합니다`);
        }

        // 난이도 및 기간
        reasons.push(`${template.difficulty} 수준으로 ${template.estimatedDuration} 소요 예상`);

        return reasons;
    }

    // 커스터마이제이션 제안
    private generateCustomizations(
        template: ProjectTemplate,
        projectName: string,
        description: string
    ): { field: string; suggestion: string }[] {
        const customizations: { field: string; suggestion: string }[] = [];

        // 프로젝트명 기반 커스터마이제이션
        if (projectName.toLowerCase().includes('mobile') || projectName.toLowerCase().includes('앱')) {
            customizations.push({
                field: 'platform',
                suggestion: '모바일 플랫폼에 특화된 기능을 추가하는 것을 권장합니다'
            });
        }

        // 설명 기반 커스터마이제이션
        if (description.toLowerCase().includes('ai') || description.toLowerCase().includes('인공지능')) {
            customizations.push({
                field: 'technology',
                suggestion: 'AI/ML 관련 도구와 라이브러리를 포함하는 것을 고려해보세요'
            });
        }

        return customizations;
    }

    // 가이드라인 커스터마이징
    private customizeGuidelines(
        baseGuidelines: string,
        customizations?: { [key: string]: any }
    ): string {
        let guidelines = baseGuidelines;

        if (customizations?.additionalRequirements) {
            guidelines += '\n\n추가 요구사항:\n' + customizations.additionalRequirements;
        }

        if (customizations?.teamSize) {
            guidelines += `\n\n팀 구성: ${customizations.teamSize}명`;
        }

        return guidelines;
    }

    // 초기 채팅 생성
    private async createInitialChats(projectId: string, template: ProjectTemplate) {
        const { chatService } = await import('./projectService');

        for (const chatTemplate of template.structure.initialChats) {
            const chat = chatService.createChat(projectId, chatTemplate.title);

            // 환영 메시지 추가
            const { messageService } = await import('./projectService');
            messageService.addMessage(
                chat.id,
                `${chatTemplate.description}\n\n${template.aiPrompts.welcome}`,
                'assistant'
            );

            // 제안 질문들을 메시지로 추가
            if (chatTemplate.suggestedQuestions.length > 0) {
                const questionsText = '다음 질문들을 참고해보세요:\n\n' +
                    chatTemplate.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');

                messageService.addMessage(chat.id, questionsText, 'assistant');
            }
        }
    }

    // 템플릿 목록 조회
    getTemplates(category?: string): ProjectTemplate[] {
        if (category) {
            return this.templates.filter(t => t.category === category);
        }
        return this.templates;
    }

    // 템플릿 상세 조회
    getTemplate(templateId: string): ProjectTemplate | null {
        return this.templates.find(t => t.id === templateId) || null;
    }

    // 카테고리 목록 조회
    getCategories(): string[] {
        return Array.from(new Set(this.templates.map(t => t.category)));
    }
}

export const smartTemplateEngine = new SmartTemplateEngine();
export default smartTemplateEngine;
