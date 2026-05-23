/**
 * Genspark형 웰컴 본문 — 대화 화면 빈 상태에서 사용 (프로젝트/일반 동일 마크업)
 * 도구 스트립·예시 칩은 생략하고 제목·안내 문구만 표시합니다.
 */
import React from 'react';
import { WORKSPACE_HOME_HEADLINE } from '../constants/workspaceHomeCopy';

export interface WelcomeWorkspacePanelProps {
    /**
     * false면 루트 워크스페이스 홈과 겹치는 히어로(h1·부제)를 생략합니다.
     */
    showHero?: boolean;
}

export const WelcomeWorkspacePanel: React.FC<WelcomeWorkspacePanelProps> = ({
    showHero = true,
}) => {
    if (!showHero) {
        return (
            <section
                className="welcome-workspace-panel welcome-workspace-panel--compact"
                aria-label="새 대화"
            >
                <p className="sr-only">
                    아래 입력창에 메시지를 입력하면 대화를 시작할 수 있습니다.
                </p>
            </section>
        );
    }

    return (
        <div className="welcome-content brainwave-welcome-content">
            <div className="brainwave-welcome-inner brainwave-welcome-inner--workspace">
                <h1 className="brainwave-welcome-headline">{WORKSPACE_HOME_HEADLINE}</h1>
                <p className="brainwave-welcome-sub">
                    무엇이든 물어보고 만들어보세요. AI와 함께 더 빠르게.
                </p>
            </div>
        </div>
    );
};
