/**
 * contextBuilder 서비스 테스트
 * 프로젝트 컨텍스트 빌드 기능 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { buildProjectContext, BuiltContext } from '../contextBuilder';
import { Project } from '../../types/project';

describe('contextBuilder', () => {
  describe('buildProjectContext', () => {
    it('project가 없으면 undefined를 반환해야 함', () => {
      const result = buildProjectContext(undefined);
      expect(result).toBeUndefined();
    });

    it('project가 null이면 undefined를 반환해야 함', () => {
      const result = buildProjectContext(null);
      expect(result).toBeUndefined();
    });

    it('기본 프로젝트로 컨텍스트를 생성해야 함', () => {
      const project: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '테스트 설명',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [],
      };

      const result = buildProjectContext(project);

      expect(result).toBeDefined();
      expect(result?.project_id).toBe('project-1');
      expect(result?.project_name).toBe('테스트 프로젝트');
      expect(result?.guidelines).toEqual([]);
      expect(result?.files).toEqual([]);
    });

    it('프로젝트 지침이 있으면 guidelines에 포함해야 함', () => {
      const project: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '테스트 설명',
        instructions: '프로젝트 지침 내용',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [],
      };

      const result = buildProjectContext(project);

      expect(result).toBeDefined();
      expect(result?.guidelines).toHaveLength(1);
      expect(result?.guidelines[0].title).toBe('프로젝트 지침');
      expect(result?.guidelines[0].content).toBe('프로젝트 지침 내용');
    });

    it('프로젝트 파일이 있으면 files에 포함해야 함', () => {
      const project: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '테스트 설명',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [
          {
            id: 'file-1',
            name: 'test.pdf',
            type: 'pdf',
            size: 1000,
            url: 'https://example.com/test.pdf',
          },
          {
            id: 'file-2',
            name: 'test.docx',
            type: 'docx',
            size: 2000,
          },
        ],
      };

      const result = buildProjectContext(project);

      expect(result).toBeDefined();
      expect(result?.files).toHaveLength(2);
      expect(result?.files[0]).toEqual({
        id: 'file-1',
        name: 'test.pdf',
        type: 'pdf',
        size: 1000,
        url: 'https://example.com/test.pdf',
      });
      expect(result?.files[1]).toEqual({
        id: 'file-2',
        name: 'test.docx',
        type: 'docx',
        size: 2000,
      });
    });

    it('history를 포함할 수 있어야 함', () => {
      const project: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '테스트 설명',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [],
      };

      const history: BuiltContext['history'] = [
        { role: 'user', content: '사용자 메시지' },
        { role: 'assistant', content: 'AI 응답' },
      ];

      const result = buildProjectContext(project, history);

      expect(result).toBeDefined();
      expect(result?.history).toEqual(history);
    });

    it('모든 필드를 포함한 완전한 컨텍스트를 생성해야 함', () => {
      const project: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '테스트 설명',
        instructions: '프로젝트 지침',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [
          {
            id: 'file-1',
            name: 'test.pdf',
            type: 'pdf',
            size: 1000,
          },
        ],
      };

      const history: BuiltContext['history'] = [
        { role: 'user', content: '사용자 메시지' },
      ];

      const result = buildProjectContext(project, history);

      expect(result).toBeDefined();
      expect(result?.project_id).toBe('project-1');
      expect(result?.project_name).toBe('테스트 프로젝트');
      expect(result?.guidelines).toHaveLength(1);
      expect(result?.files).toHaveLength(1);
      expect(result?.history).toEqual(history);
    });

    it('files가 undefined인 경우 빈 배열로 처리해야 함', () => {
      const project: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '테스트 설명',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: undefined,
      };

      const result = buildProjectContext(project);

      expect(result).toBeDefined();
      expect(result?.files).toEqual([]);
    });
  });
});

