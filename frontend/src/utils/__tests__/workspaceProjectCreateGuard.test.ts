import { shouldSuppressWorkspaceProjectCreate } from '../workspaceProjectCreateGuard';

describe('workspaceProjectCreateGuard', () => {
  it('활성 프로젝트 또는 대화 projectId가 있으면 project_create를 억제한다', () => {
    expect(shouldSuppressWorkspaceProjectCreate('proj-a', undefined)).toBe(true);
    expect(shouldSuppressWorkspaceProjectCreate(undefined, 'proj-b')).toBe(true);
    expect(shouldSuppressWorkspaceProjectCreate(null, '  ')).toBe(false);
    expect(shouldSuppressWorkspaceProjectCreate(undefined, undefined)).toBe(false);
  });
});
