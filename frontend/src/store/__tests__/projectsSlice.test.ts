/**
 * projectsSlice 리듀서 테스트
 */

import projectsReducer, {
  setCurrentProject,
  clearProjects,
  updateProjectMessageCount,
  fetchProjects,
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
} from '../slices/projectsSlice';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {},
}));

const mockProject = {
  id: 'p1',
  name: '프로젝트1',
  description: '설명',
  tags: ['tag1'],
  status: 'active',
  messageCount: 0,
  userId: 'u1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  settings: { aiModel: 'gpt-4', temperature: 0.7, maxTokens: 1000 },
};

describe('projectsSlice', () => {
  const getInitialState = () => projectsReducer(undefined, { type: 'unknown' });

  it('초기 상태', () => {
    const state = getInitialState();
    expect(state.projects).toEqual([]);
    expect(state.currentProject).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('setCurrentProject - id가 목록에 있으면 currentProject 설정', () => {
    let state = projectsReducer(
      getInitialState(),
      fetchProjects.fulfilled([mockProject], '')
    );
    state = projectsReducer(state, setCurrentProject('p1'));
    expect(state.currentProject).toEqual(mockProject);
  });

  it('setCurrentProject - null이면 currentProject null', () => {
    let state = projectsReducer(
      getInitialState(),
      fetchProjects.fulfilled([mockProject], '')
    );
    state = projectsReducer(state, setCurrentProject(null));
    expect(state.currentProject).toBeNull();
  });

  it('setCurrentProject - id가 목록에 없으면 null', () => {
    const state = projectsReducer(getInitialState(), setCurrentProject('unknown'));
    expect(state.currentProject).toBeNull();
  });

  it('clearProjects', () => {
    let state = projectsReducer(
      getInitialState(),
      fetchProjects.fulfilled([mockProject], '')
    );
    state = projectsReducer(state, clearProjects());
    expect(state.projects).toEqual([]);
    expect(state.currentProject).toBeNull();
    expect(state.error).toBeNull();
  });

  it('updateProjectMessageCount', () => {
    let state = projectsReducer(
      getInitialState(),
      fetchProjects.fulfilled([mockProject], '')
    );
    state = projectsReducer(state, updateProjectMessageCount({ projectId: 'p1', count: 5 }));
    expect(state.projects[0].messageCount).toBe(5);
  });

  it('fetchProjects.pending / fulfilled / rejected', () => {
    let state = projectsReducer(getInitialState(), fetchProjects.pending(''));
    expect(state.loading).toBe(true);
    state = projectsReducer(state, fetchProjects.fulfilled([mockProject], ''));
    expect(state.loading).toBe(false);
    expect(state.projects).toEqual([mockProject]);
    state = projectsReducer(state, fetchProjects.rejected(new Error('err'), '', undefined, 'err'));
    expect(state.loading).toBe(false);
    expect(state.error).toBe('err');
  });

  it('fetchProject.fulfilled - 기존 항목 업데이트', () => {
    let state = projectsReducer(
      getInitialState(),
      fetchProjects.fulfilled([mockProject], '')
    );
    const updated = { ...mockProject, name: '업데이트됨' };
    state = projectsReducer(state, fetchProject.fulfilled(updated, 'p1'));
    expect(state.projects[0].name).toBe('업데이트됨');
  });

  it('fetchProject.fulfilled - 새 항목이면 목록에 push', () => {
    const newProject = { ...mockProject, id: 'p2', name: '프로젝트2' };
    const state = projectsReducer(
      getInitialState(),
      fetchProject.fulfilled(newProject, 'p2')
    );
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].id).toBe('p2');
    expect(state.projects[0].name).toBe('프로젝트2');
  });

  it('fetchProject.rejected - error 설정', () => {
    const state = projectsReducer(
      getInitialState(),
      fetchProject.rejected(new Error('fail'), 'p1', undefined, '네트워크 오류')
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('네트워크 오류');
  });

  it('createProject.fulfilled', () => {
    const state = projectsReducer(
      getInitialState(),
      createProject.fulfilled(mockProject, '', { name: 'a', description: 'b' })
    );
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0]).toEqual(mockProject);
  });

  it('createProject.rejected - error 설정', () => {
    const state = projectsReducer(
      getInitialState(),
      createProject.rejected(new Error('fail'), '', { name: 'a', description: 'b' }, '생성 실패')
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('생성 실패');
  });

  it('updateProject.fulfilled', () => {
    let state = projectsReducer(
      getInitialState(),
      fetchProjects.fulfilled([mockProject], '')
    );
    const updated = { ...mockProject, name: '수정됨' };
    state = projectsReducer(
      state,
      updateProject.fulfilled(updated, '', { projectId: 'p1', updates: { name: '수정됨' } })
    );
    expect(state.projects[0].name).toBe('수정됨');
  });

  it('deleteProject.fulfilled', () => {
    let state = projectsReducer(
      getInitialState(),
      fetchProjects.fulfilled([mockProject], '')
    );
    state = projectsReducer(state, setCurrentProject('p1'));
    state = projectsReducer(state, deleteProject.fulfilled('p1', ''));
    expect(state.projects).toHaveLength(0);
    expect(state.currentProject).toBeNull();
  });
});
