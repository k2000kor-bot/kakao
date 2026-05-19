/**
 * 프로젝트 페이지 — 프로젝트 목록·생성·관리
 * ChatGPT·Gemini 스타일 3분할: 일반 대화 | 프로젝트 | 프로젝트 · 대화
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectHub, { Project as ProjectHubProject } from '../components/ProjectHub';
import ProjectEditModal from '../components/ProjectManagement/ProjectEditModal';
import ProjectCreateModal, { type ProjectCreateFormData, type ProjectCategoryId } from '../components/ProjectManagement/ProjectCreateModal';
import { projectService } from '../services/projectService';
import { getStandaloneChatPath } from '../config/uiPreferences';
import { Project } from '../types/project';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { RoutePathBreadcrumb } from '../components/RoutePathBreadcrumb';

const CATEGORY_TO_TYPE: Record<ProjectCategoryId, Project['type']> = {
  investment: 'business',
  homework: 'research',
  writing: 'conversation',
  travel: 'conversation',
};

function safeDate(value: unknown): Date {
  if (value instanceof Date) return isNaN(value.getTime()) ? new Date() : value;
  if (value == null || value === '') return new Date();
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? new Date() : d;
}

/** 프로젝트 목록·상세·홈과 동일한 상단 경로 크롬 */
function ProjectsRouteChrome() {
  return (
    <div className="bw-page-root bw-page-root--route-chrome">
      <h1 className="sr-only">프로젝트</h1>
      <RoutePathBreadcrumb
        items={[
          { label: '일반 대화', to: getStandaloneChatPath() },
          { label: '프로젝트' },
        ]}
        hint="목록에서 프로젝트를 선택하면 대화·소스 화면으로 이동합니다."
      />
    </div>
  );
}

function toProjectHubFormat(p: Project): ProjectHubProject {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    status: (p.status as 'active' | 'archived' | 'completed') || 'active',
    createdAt: safeDate(p.createdAt),
    updatedAt: safeDate(p.updatedAt),
    messageCount: p.messageCount,
    fileCount: p.files?.length ?? 0,
    tags: p.tags ?? [],
    category: p.type,
  };
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectHubProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectEditModal, setShowProjectEditModal] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    try {
      const loaded = await projectService.getProjects();
      const mapped = loaded
        .filter((p) => p?.id && p?.name)
        .map((p) => toProjectHubFormat(p as Project));
      setProjects(mapped);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const handleProjectSelect = (project: ProjectHubProject) => {
    navigate(`/projects/${project.id}`);
  };

  const handleOpenCreateModal = () => setShowCreateModal(true);

  const handleCreateProjectSubmit = async (data: ProjectCreateFormData) => {
    const created = await projectService.createProject({
      name: data.name,
      description: '',
      type: CATEGORY_TO_TYPE[data.category],
      status: 'active',
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
    });
    if (!created?.id) throw new Error('프로젝트 생성에 실패했습니다.');
    if (data.memoryType === 'project_exclusive') {
      try {
        localStorage.setItem(`project-memory-type-${created.id}`, 'project_exclusive');
      } catch {
        // ignore
      }
    }
    setEditProjectId(created.id);
    setShowProjectEditModal(true);
    await refreshProjects();
  };

  const handleProjectEdit = (projectId: string) => {
    setEditProjectId(projectId);
    setShowProjectEditModal(true);
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      await refreshProjects();
      if (editProjectId === projectId) {
        setShowProjectEditModal(false);
        setEditProjectId(null);
      }
    } catch {
      // 에러 처리
    }
  };

  const handleProjectArchive = async (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const newStatus = proj.status === 'archived' ? 'active' : 'archived';
    try {
      await projectService.updateProject(projectId, { status: newStatus } as Partial<Project>);
      await refreshProjects();
    } catch {
      // 에러 처리
    }
  };

  const handleEditModalClose = () => {
    setShowProjectEditModal(false);
    setEditProjectId(null);
    refreshProjects();
  };

  if (loading) {
    return (
      <div className="brainwave-chat-route-shell brainwave-chat-route-shell--projects">
        <ProjectsRouteChrome />
        <div className="brainwave-chat-route-body">
          <div className="bw-page-root bw-page-root--route-body">
            <LoadingSkeleton type="card" lines={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--projects">
      <ProjectsRouteChrome />
      <div className="brainwave-chat-route-body">
        <div className="bw-page-root bw-page-root--route-body">
          <ProjectHub
            projects={projects}
            onProjectSelect={handleProjectSelect}
            onProjectCreate={handleOpenCreateModal}
            onProjectEdit={handleProjectEdit}
            onProjectDelete={handleProjectDelete}
            onProjectArchive={handleProjectArchive}
          />
          <ProjectCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateProjectSubmit}
          />
          {showProjectEditModal && editProjectId && (
            <ProjectEditModal
              isOpen={showProjectEditModal}
              onClose={handleEditModalClose}
              projectId={editProjectId}
              currentProject={
                (() => {
                  const p = projects.find((pr) => pr.id === editProjectId);
                  return p
                    ? { id: p.id, name: p.name, description: p.description, tags: p.tags }
                    : { id: editProjectId, name: '새 프로젝트' };
                })()
              }
              onSaved={handleEditModalClose}
              onDelete={async (id) => {
                await handleProjectDelete(id);
                handleEditModalClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
