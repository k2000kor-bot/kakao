/**
 * @jest-environment jsdom
 */
/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WelcomeWorkspacePanel } from '../WelcomeWorkspacePanel';
import { WORKSPACE_HOME_HEADLINE } from '../../constants/workspaceHomeCopy';

describe('WelcomeWorkspacePanel', () => {
    it('히어로 모드에서 제목·부제만 보인다', () => {
        render(
            <MemoryRouter>
                <WelcomeWorkspacePanel />
            </MemoryRouter>
        );
        expect(screen.getByRole('heading', { name: WORKSPACE_HOME_HEADLINE })).toBeInTheDocument();
        expect(screen.getByText(/무엇이든 물어보고 만들어보세요/)).toBeInTheDocument();
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('showHero=false이면 제목·부제 없이 접근성 안내만 제공한다', () => {
        render(
            <MemoryRouter>
                <WelcomeWorkspacePanel showHero={false} />
            </MemoryRouter>
        );
        expect(screen.queryByRole('heading', { name: WORKSPACE_HOME_HEADLINE })).not.toBeInTheDocument();
        expect(screen.queryByText(/무엇이든 물어보고 만들어보세요/)).not.toBeInTheDocument();
        expect(
            screen.getByText(/아래 입력창에 메시지를 입력하면 대화를 시작할 수 있습니다/)
        ).toBeInTheDocument();
    });
});
