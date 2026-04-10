/**
 * 연동 뷰용 API — GET /api/integrated/health
 * 카탈로그 타일은 데모 데이터(IntegrationsView).
 */
import { API_BASE_URL, INTEGRATED_API_HEALTH_PATH, joinApiHealthCheckUrl } from '../config/api';

export interface IntegrationCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
}

/** 연동 화면용 데모 카탈로그 (백엔드 연결 시 토글 상태만 API로 대체 가능) */
export const INTEGRATIONS_CATALOG: IntegrationCatalogItem[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: '채널 알림·스레드 요약 공유',
    category: '알림',
    connected: false,
  },
  {
    id: 'email',
    name: '이메일(SMTP)',
    description: '리포트·경고 메일 발송',
    category: '알림',
    connected: false,
  },
  {
    id: 'webhook',
    name: '웹훅',
    description: '사용자 정의 HTTP 콜백',
    category: '자동화',
    connected: true,
  },
  {
    id: 'oauth-google',
    name: 'Google Drive',
    description: '문서·스프레드시트 읽기',
    category: '스토리지',
    connected: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: '위키·DB 동기화',
    category: '스토리지',
    connected: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: '이슈·PR 알림',
    category: '개발',
    connected: false,
  },
];

export interface IntegrationsHealthData {
  status: string;
  service?: string;
}

interface HealthApiResponse {
  success: boolean;
  data?: IntegrationsHealthData;
  error?: string;
}

/**
 * 백엔드 GET /api/integrated/health 호출.
 * 성공 시 연동 상태(healthy 등) 반환, 실패 시 null.
 */
export async function fetchIntegrationsHealth(): Promise<IntegrationsHealthData | null> {
  try {
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, INTEGRATED_API_HEALTH_PATH), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as HealthApiResponse;
    if (json.success && json.data) return json.data;
    return null;
  } catch {
    return null;
  }
}
