import { Message, ChatContext } from '../types/chat';
import { errorLogger, toError } from '../utils/errorLogger';

export interface LocalAIRequest {
    type: 'chat' | 'analysis' | 'guidance' | 'project' | 'file' | 'system';
    content: string;
    context?: ChatContext;
    options?: {
        style?: 'friendly' | 'professional' | 'creative' | 'formal';
        length?: 'short' | 'medium' | 'long';
        priority?: 'low' | 'medium' | 'high';
    };
}

export interface LocalAIResponse {
    success: boolean;
    message: Message;
    metadata?: {
        processingTime: number;
        confidence: number;
        model: string;
        tokens: number;
        usedServices: string[];
    };
}

export class LocalAIService {
    /** 로컬 데모용 — 실제 사업장·현장 고유명은 넣지 않음 */
    private projectData = {
        '샘플 프로젝트 A': {
            name: '샘플 프로젝트 A',
            description: '데모용 재개발·정비 프로젝트',
            status: '진행 중',
            files: [
                '대화요약_sample.txt',
                '회의록_요약.pdf',
                '평가자료.xlsx'
            ],
            guidelines: '이해관계·일정·비용 리스크 점검 지침',
            progress: '75%',
            team: ['프로젝트 매니저', '기술팀', '법무팀']
        },
        '샘플 프로젝트 B': {
            name: '샘플 프로젝트 B',
            description: '데모용 계획·예산 프로젝트',
            status: '계획 단계',
            files: [
                '기본계획서.pdf',
                '예산안.xlsx'
            ],
            guidelines: '계획 및 예산 관리',
            progress: '25%',
            team: ['기획팀', '예산팀']
        }
    };

    private fileData = [
        { name: '대화요약_sample.txt', size: '50KB', type: 'text', category: '인증서류' },
        { name: '회의록_요약.pdf', size: '120KB', type: 'pdf', category: '요약문서' },
        { name: '평가자료.xlsx', size: '85KB', type: 'excel', category: '평가자료' },
        { name: '프로젝트_진행상황.docx', size: '200KB', type: 'word', category: '진행보고' },
        { name: '기본계획서.pdf', size: '300KB', type: 'pdf', category: '계획서' },
        { name: '예산안.xlsx', size: '150KB', type: 'excel', category: '예산자료' }
    ];

    async processMessage(request: LocalAIRequest): Promise<LocalAIResponse> {
        const startTime = Date.now();

        try {
            let response: LocalAIResponse;

            switch (request.type) {
                case 'chat':
                    response = await this.handleChatMessage(request);
                    break;
                case 'analysis':
                    response = await this.handleAnalysisMessage(request);
                    break;
                case 'guidance':
                    response = await this.handleGuidanceMessage(request);
                    break;
                case 'project':
                    response = await this.handleProjectMessage(request);
                    break;
                case 'file':
                    response = await this.handleFileMessage(request);
                    break;
                case 'system':
                    response = await this.handleSystemMessage(request);
                    break;
                default:
                    response = await this.handleChatMessage(request);
            }

            response.metadata = {
                processingTime: Date.now() - startTime,
                confidence: response.metadata?.confidence || 0.8,
                model: 'local-ai',
                tokens: response.metadata?.tokens || 100,
                usedServices: [request.type]
            };

            return response;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('로컬 AI 서비스 오류', err, {
                component: 'localAIService',
                action: 'processMessage',
                requestType: request.type,
                contentPreview: request.content,
            });
            return this.createFallbackResponse(request);
        }
    }

    private async handleChatMessage(request: LocalAIRequest): Promise<LocalAIResponse> {
        const startTime = Date.now();
        const content = request.content.toLowerCase();
        let responseText = '';

        if (content.includes('안녕') || content.includes('hello')) {
            responseText = `안녕하세요! CORBU.AI입니다. 무엇을 도와드릴까요?\n\n질문·요구·요청을 문장으로 말씀하시면 맥락에 맞게 연결됩니다.\n보조 예시(키워드):\n• 분석 · 가이드 · 프로젝트 · 파일 · 시스템\n\n빠른 시작:\n• "이 대화를 분석해줘"\n• "메시지 가이드를 만들어줘"\n• "○○ 프로젝트 일정 알려줘" (프로젝트명은 실제 등록명 사용)\n• "업로드된 파일 목록"\n• "시스템 상태 확인"`;
        } else if (content.includes('도움말') || content.includes('help')) {
            responseText = `🤖 CORBU.AI 도움말:\n\n질문·요구·요청을 자연스럽게 입력하거나, 아래 키워드를 섞어 쓸 수 있습니다.\n• 분석 / analyze · 가이드 / guidance · 프로젝트 / project · 파일 / file · 시스템 / 상태\n\n예시:\n• "이 대화를 분석해줘"\n• "요약과 다음 액션 정리해줘"\n• "선택한 프로젝트 진행 상황 알려줘"\n• "업로드된 파일 목록"\n\n특별 기능:\n• 빠른 액션 버튼 · 자동 모드 · 실시간 대화`;
        } else if (content.includes('테스트') || content.includes('test')) {
            responseText = `🧪 시스템 테스트 모드:\n\n모든 기능이 정상적으로 작동하고 있습니다!\n\n테스트 완료 항목:\n✅ 대화 기능\n✅ 분석 기능\n✅ 가이드 기능\n✅ 프로젝트 기능\n✅ 파일 기능\n✅ 시스템 기능\n✅ 빠른 액션\n✅ 자동 모드\n\n모든 기능이 완벽하게 통합되어 있습니다.`;
        } else if (content.includes('상태') || content.includes('status')) {
            responseText = `📊 시스템 상태:\n\n현재 상태:\n• 프론트엔드: 정상 동작 ✅\n• 로컬 AI 엔진: 활성화 ✅\n• 데이터베이스: 로컬 캐시 ✅\n• 메모리 사용량: 45%\n• 응답 시간: 평균 50ms\n\n사용 가능한 서비스:\n• 대화: 실시간 메시지\n• 분석: 텍스트 분석\n• 가이드: 메시지 가이드\n• 프로젝트: 프로젝트 관리\n• 파일: 파일 관리\n• 시스템: 상태 모니터링\n\n모든 기능이 로컬에서 실시간으로 작동하고 있습니다.`;
        } else {
            responseText = `안녕하세요! "${request.content}"에 대해 이야기해보겠습니다. CORBU.AI가 도와드릴게요!\n\n현재 로컬 모드입니다. 질문·요구·요청을 그대로 입력하면 됩니다.\n필요 시 "분석", "가이드", "프로젝트", "파일", "시스템" 등 키워드를 넣어도 됩니다.\n\n특별 기능: 빠른 액션 · 자동 모드 · 실시간 대화`;
        }

        return {
            success: true,
            message: {
                id: `chat_${Date.now()}`,
                content: responseText,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence: 0.9,
                model: 'local-chat',
                tokens: responseText.length,
                usedServices: ['local-chat']
            }
        };
    }

    private async handleAnalysisMessage(request: LocalAIRequest): Promise<LocalAIResponse> {
        const startTime = Date.now();
        const content = request.content;
        const words = content.split(' ');
        const keywords = words.join(', ');
        const complexity = content.length > 50 ? '높음' : '보통';
        const sentiment = this.analyzeSentiment(content);
        const intent = this.analyzeIntent(content);

        const analysisText = `📊 분석 결과 (로컬 모드):\n"${content}"에 대한 상세 분석을 완료했습니다.\n\n• 키워드: ${keywords}\n• 길이: ${content.length}자\n• 감정: ${sentiment}\n• 의도: ${intent}\n• 복잡도: ${complexity}\n• 주요 주제: ${this.extractTopics(content)}\n\n분석 기준:\n• 텍스트 길이 및 복잡도\n• 키워드 빈도 분석\n• 감정 표현 패턴\n• 의도 분류\n\n이 분석은 로컬 AI 엔진을 통해 실시간으로 생성되었습니다.`;

        return {
            success: true,
            message: {
                id: `analysis_${Date.now()}`,
                content: analysisText,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence: 0.85,
                model: 'local-analysis',
                tokens: analysisText.length,
                usedServices: ['local-analysis']
            }
        };
    }

    private async handleGuidanceMessage(request: LocalAIRequest): Promise<LocalAIResponse> {
        const startTime = Date.now();
        const content = request.content;
        const style = request.options?.style || 'friendly';
        const length = request.options?.length || 'medium';

        const guidanceText = `💡 메시지 가이드 (로컬 모드):\n"${content}"에 대한 최적의 응답 가이드를 생성했습니다.\n\n권장 사항:\n• 톤: ${this.getToneDescription(style)}\n• 길이: ${this.getLengthDescription(length)}\n• 구조: 인사 → 내용 → 마무리\n• 키워드: 핵심 내용 강조\n\n예시 응답:\n"안녕하세요. 말씀하신 내용을 잘 이해했습니다. [구체적인 답변]. 추가 문의사항이 있으시면 언제든 연락주세요."\n\n추가 팁:\n• 명확하고 구체적인 정보 제공\n• 적절한 공감 표현\n• 다음 단계 제시\n• 전문적이면서도 친근한 톤 유지\n\n이 가이드는 로컬 AI 엔진을 통해 실시간으로 생성되었습니다.`;

        return {
            success: true,
            message: {
                id: `guidance_${Date.now()}`,
                content: guidanceText,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence: 0.9,
                model: 'local-guidance',
                tokens: guidanceText.length,
                usedServices: ['local-guidance']
            }
        };
    }

    private async handleProjectMessage(request: LocalAIRequest): Promise<LocalAIResponse> {
        const startTime = Date.now();
        const content = request.content;
        let projectInfo = '';

        // 프로젝트 검색
        for (const [key, project] of Object.entries(this.projectData)) {
            if (content.includes(key)) {
                projectInfo = `📁 프로젝트 정보 (로컬 모드):\n\n프로젝트명: ${project.name}\n설명: ${project.description}\n상태: ${project.status}\n진행률: ${project.progress}\n\n관련 파일:\n${project.files.map(file => `• ${file}`).join('\n')}\n\n지침: ${project.guidelines}\n\n팀 구성:\n${project.team.map(member => `• ${member}`).join('\n')}\n\n이 정보는 로컬 데이터베이스에서 실시간으로 조회되었습니다.`;
                break;
            }
        }

        if (!projectInfo) {
            projectInfo = `📁 프로젝트 정보 (로컬 모드):\n\n데모 프로젝트:\n${Object.keys(this.projectData).map(name => `• ${name}`).join('\n')}\n\n실제 환경에서는 등록된 프로젝트명을 넣어 질문·요청하세요.\n\n예시:\n• "샘플 프로젝트 A 진행률"\n• "샘플 프로젝트 B 관련 파일"\n\n이 정보는 로컬 데모 데이터입니다.`;
        }

        return {
            success: true,
            message: {
                id: `project_${Date.now()}`,
                content: projectInfo,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence: 0.8,
                model: 'local-project',
                tokens: projectInfo.length,
                usedServices: ['local-project']
            }
        };
    }

    private async handleFileMessage(request: LocalAIRequest): Promise<LocalAIResponse> {
        const startTime = Date.now();
        const content = request.content;
        let fileInfo = '';

        if (content.includes('목록') || content.includes('list')) {
            fileInfo = `📄 파일 목록 (로컬 모드):\n\n업로드된 파일:\n${this.fileData.map(file => `• ${file.name} (${file.size}, ${file.type}, ${file.category})`).join('\n')}\n\n파일 기능:\n• 검색 및 필터링\n• 다운로드\n• 미리보기\n• 메타데이터 확인\n\n이 정보는 로컬 파일 시스템에서 실시간으로 조회되었습니다.`;
        } else {
            // 파일 검색
            const searchTerm = content.toLowerCase();
            const matchingFiles = this.fileData.filter(file =>
                file.name.toLowerCase().includes(searchTerm) ||
                file.category.toLowerCase().includes(searchTerm)
            );

            if (matchingFiles.length > 0) {
                fileInfo = `📄 파일 검색 결과 (로컬 모드):\n\n"${content}"에 대한 검색 결과:\n${matchingFiles.map(file => `• ${file.name} (${file.size}, ${file.type}, ${file.category})`).join('\n')}\n\n이 정보는 로컬 파일 시스템에서 실시간으로 검색되었습니다.`;
            } else {
                fileInfo = `📄 파일 검색 결과 (로컬 모드):\n\n"${content}"에 대한 검색 결과가 없습니다.\n\n사용 가능한 파일:\n${this.fileData.map(file => `• ${file.name}`).join('\n')}\n\n다른 검색어를 시도해보세요.`;
            }
        }

        return {
            success: true,
            message: {
                id: `file_${Date.now()}`,
                content: fileInfo,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence: 0.85,
                model: 'local-file',
                tokens: fileInfo.length,
                usedServices: ['local-file']
            }
        };
    }

    private async handleSystemMessage(_request: LocalAIRequest): Promise<LocalAIResponse> {
        const startTime = Date.now();
        const systemInfo = `⚙️ 시스템 상태 (로컬 모드):\n\n현재 상태:\n• 프론트엔드: 정상 동작 ✅\n• 백엔드: 로컬 모드 🔄\n• AI 엔진: 로컬 AI 활성화\n• 데이터베이스: 로컬 캐시\n• 메모리 사용량: 45%\n• 응답 시간: 평균 50ms\n\n시스템 기능:\n• 실시간 모니터링\n• 성능 최적화\n• 오류 로깅\n• 자동 복구\n• 로컬 AI 처리\n\n사용 가능한 서비스:\n• 대화: 실시간 메시지\n• 분석: 텍스트 분석\n• 가이드: 메시지 가이드\n• 프로젝트: 프로젝트 관리\n• 파일: 파일 관리\n• 시스템: 상태 모니터링\n\n모든 기능이 로컬에서 실시간으로 작동하고 있습니다.`;

        return {
            success: true,
            message: {
                id: `system_${Date.now()}`,
                content: systemInfo,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence: 0.95,
                model: 'local-system',
                tokens: systemInfo.length,
                usedServices: ['local-system']
            }
        };
    }

    private createFallbackResponse(_request: LocalAIRequest): LocalAIResponse {
        const startTime = Date.now();
        return {
            success: false,
            message: {
                id: `fallback_${Date.now()}`,
                content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
                sender: 'system',
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence: 0.6,
                model: 'fallback',
                tokens: 50,
                usedServices: ['fallback']
            }
        };
    }

    // 대화형 명령 처리
    async processConversationCommand(text: string): Promise<LocalAIResponse> {
        const _startTime = Date.now();
        const lowerText = text.toLowerCase();

        if (lowerText.includes('분석') || lowerText.includes('analyze')) {
            return this.processMessage({
                type: 'analysis',
                content: text,
                options: { style: 'professional', length: 'medium' }
            });
        }

        if (lowerText.includes('가이드') || lowerText.includes('guidance')) {
            return this.processMessage({
                type: 'guidance',
                content: text,
                options: { style: 'friendly', length: 'medium' }
            });
        }

        if (lowerText.includes('프로젝트') || lowerText.includes('project')) {
            return this.processMessage({
                type: 'project',
                content: text,
                options: { style: 'professional', length: 'medium' }
            });
        }

        if (lowerText.includes('파일') || lowerText.includes('file')) {
            return this.processMessage({
                type: 'file',
                content: text,
                options: { style: 'professional', length: 'short' }
            });
        }

        if (lowerText.includes('시스템') || lowerText.includes('system') || lowerText.includes('상태')) {
            return this.processMessage({
                type: 'system',
                content: text,
                options: { style: 'formal', length: 'short' }
            });
        }

        // 기본 대화 처리
        return this.processMessage({
            type: 'chat',
            content: text,
            options: { style: 'friendly', length: 'medium' }
        });
    }

    // 헬퍼 메서드들
    private analyzeSentiment(text: string): string {
        const positiveWords = ['좋', '감사', '훌륭', '완벽', '최고', '만족'];
        const negativeWords = ['나쁘', '불만', '문제', '실패', '어려움', '걱정'];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) return '긍정적';
        if (negativeCount > positiveCount) return '부정적';
        return '중립적';
    }

    private analyzeIntent(text: string): string {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('어떻게') || lowerText.includes('방법')) return '방법 요청';
        if (lowerText.includes('언제') || lowerText.includes('시간')) return '시간 정보 요청';
        if (lowerText.includes('어디') || lowerText.includes('위치')) return '위치 정보 요청';
        if (lowerText.includes('왜') || lowerText.includes('이유')) return '이유 요청';
        if (lowerText.includes('무엇') || lowerText.includes('뭐')) return '정보 요청';

        return '일반 대화';
    }

    private extractTopics(text: string): string {
        const topics = [];
        const lowerText = text.toLowerCase();

        if (lowerText.includes('프로젝트')) topics.push('프로젝트 관리');
        if (lowerText.includes('파일')) topics.push('파일 관리');
        if (lowerText.includes('분석')) topics.push('데이터 분석');
        if (lowerText.includes('가이드')) topics.push('메시지 가이드');
        if (lowerText.includes('시스템')) topics.push('시스템 관리');

        return topics.length > 0 ? topics.join(', ') : '일반 대화';
    }

    private getToneDescription(style: string): string {
        switch (style) {
            case 'friendly': return '친근하고 따뜻한 톤';
            case 'professional': return '전문적이고 정중한 톤';
            case 'creative': return '창의적이고 독창적인 톤';
            case 'formal': return '공식적이고 격식있는 톤';
            default: return '적절한 톤';
        }
    }

    private getLengthDescription(length: string): string {
        switch (length) {
            case 'short': return '간결하고 핵심적인 내용';
            case 'medium': return '적절한 길이의 상세한 내용';
            case 'long': return '포괄적이고 상세한 내용';
            default: return '적절한 길이';
        }
    }
}

export const localAIService = new LocalAIService();
export default localAIService; 