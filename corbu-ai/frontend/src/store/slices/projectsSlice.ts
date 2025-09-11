import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// 타입 정의
interface Project {
    id: string;
    name: string;
    description: string;
    tags: string[];
    status: string;
    messageCount: number;
    userId: string;
    createdAt: string;
    updatedAt: string;
    settings: {
        aiModel: string;
        temperature: number;
        maxTokens: number;
    };
}

interface ProjectsState {
    projects: Project[];
    currentProject: Project | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProjectsState = {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchProjects = createAsyncThunk(
    'projects/fetchProjects',
    async (_, { rejectWithValue }) => {
        try {
            const projects = await api.getProjects();
            return projects;
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const fetchProject = createAsyncThunk(
    'projects/fetchProject',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const project = await api.getProject(projectId);
            return project;
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const createProject = createAsyncThunk(
    'projects/createProject',
    async (projectData: {
        name: string;
        description: string;
        tags?: string[];
        settings?: any;
    }, { rejectWithValue }) => {
        try {
            const project = await api.createProject(projectData);
            return project;
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const updateProject = createAsyncThunk(
    'projects/updateProject',
    async ({ projectId, updates }: { projectId: string; updates: Partial<Project> }, { rejectWithValue }) => {
        try {
            const project = await api.updateProject(projectId, updates);
            return project;
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const deleteProject = createAsyncThunk(
    'projects/deleteProject',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const success = await api.deleteProject(projectId);
            if (success) {
                return projectId;
            }
            throw new Error('프로젝트 삭제에 실패했습니다.');
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

// Slice
const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        setCurrentProject: (state, action: PayloadAction<string | null>) => {
            if (action.payload) {
                state.currentProject = state.projects.find(p => p.id === action.payload) || null;
            } else {
                state.currentProject = null;
            }
        },
        clearProjects: (state) => {
            state.projects = [];
            state.currentProject = null;
            state.error = null;
        },
        updateProjectMessageCount: (state, action: PayloadAction<{ projectId: string; count: number }>) => {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                project.messageCount = action.payload.count;
            }
            if (state.currentProject?.id === action.payload.projectId) {
                state.currentProject.messageCount = action.payload.count;
            }
        },
    },
    extraReducers: (builder) => {
        // fetchProjects
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
                state.error = null;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // fetchProject
        builder
            .addCase(fetchProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProject.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    const existingIndex = state.projects.findIndex(p => p.id === action.payload!.id);
                    if (existingIndex >= 0) {
                        state.projects[existingIndex] = action.payload;
                    } else {
                        state.projects.push(action.payload);
                    }
                }
                state.error = null;
            })
            .addCase(fetchProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // createProject
        builder
            .addCase(createProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projects.push(action.payload);
                state.error = null;
            })
            .addCase(createProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // updateProject
        builder
            .addCase(updateProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    const index = state.projects.findIndex(p => p.id === action.payload!.id);
                    if (index >= 0) {
                        state.projects[index] = action.payload;
                    }
                    if (state.currentProject?.id === action.payload.id) {
                        state.currentProject = action.payload;
                    }
                }
                state.error = null;
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // deleteProject
        builder
            .addCase(deleteProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = state.projects.filter(p => p.id !== action.payload);
                if (state.currentProject?.id === action.payload) {
                    state.currentProject = null;
                }
                state.error = null;
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setCurrentProject, clearProjects, updateProjectMessageCount } = projectsSlice.actions;

export default projectsSlice.reducer;
