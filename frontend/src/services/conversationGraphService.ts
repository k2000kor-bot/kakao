/**
 * 대화 업로드 및 대화 관계도 API
 * - POST /api/conversations/upload
 * - GET /api/conversations
 * - GET /api/conversations/:id/relationship-graph?start_date=&end_date=
 */
import {
  API_BASE_URL,
  API_CONVERSATIONS_LIST_PATH,
  API_CONVERSATIONS_RELATIONSHIP_GRAPH_SEGMENT,
  API_CONVERSATIONS_UPLOAD_PATH,
  API_FORM_FIELD_FILE,
  API_FORM_FIELD_NAME,
  API_JSON_FIELD_FILENAME,
  API_JSON_FIELD_TEXT,
  API_QUERY_PARAM_END_DATE,
  API_QUERY_PARAM_START_DATE,
  FALLBACK_API_ORIGIN,
  joinApiHealthCheckUrl,
} from '../config/api';

const conversationGraphOrigin = () => (API_BASE_URL || FALLBACK_API_ORIGIN).replace(/\/$/, '');

export interface ConversationUploadItem {
  id: string;
  name: string;
  filename: string;
  uploaded_at: string;
  message_count: number;
}

export interface RelationshipGraphNode {
  id: string;
  label: string;
  message_count: number;
  /** 동조/반대 분류 건수 (재개발·조합 등 주제) */
  stance_동조?: number;
  stance_반대?: number;
  stance_중립?: number;
  /** 우세 입장: 동조 | 반대 | 중립 */
  dominant_stance?: '동조' | '반대' | '중립';
}

export interface RelationshipGraphEdge {
  source: string;
  target: string;
  weight: number;
  /** 동조·반대·대립 횟수 (연속 발화에서 같은/다른 입장) */
  weight_동조?: number;
  weight_반대?: number;
  weight_대립?: number;
  /** 엣지 표시용: flow | 동조 | 반대 | 대립 */
  edge_type?: string;
}

export interface RelationshipGraphData {
  upload_id: string;
  nodes: RelationshipGraphNode[];
  edges: RelationshipGraphEdge[];
  start_date?: string;
  end_date?: string;
  error?: string;
}

export async function uploadConversation(
  file: File,
  name?: string
): Promise<{ upload_id: string; name: string; filename: string; uploaded_at: string; message_count: number }> {
  const form = new FormData();
  form.append(API_FORM_FIELD_FILE, file);
  if (name) form.append(API_FORM_FIELD_NAME, name);
  const res = await fetch(joinApiHealthCheckUrl(conversationGraphOrigin(), API_CONVERSATIONS_UPLOAD_PATH), {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!json.success || !json.data) throw new Error(json.error || json.message || '업로드 실패');
  return json.data;
}

export async function uploadConversationText(
  text: string,
  name?: string,
  filename?: string
): Promise<{ upload_id: string; name: string; filename: string; uploaded_at: string; message_count: number }> {
  const res = await fetch(joinApiHealthCheckUrl(conversationGraphOrigin(), API_CONVERSATIONS_UPLOAD_PATH), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      [API_JSON_FIELD_TEXT]: text,
      [API_FORM_FIELD_NAME]: name || '대화',
      [API_JSON_FIELD_FILENAME]: filename || 'pasted.txt',
    }),
  });
  const json = await res.json();
  if (!json.success || !json.data) throw new Error(json.error || json.message || '업로드 실패');
  return json.data;
}

export async function listConversations(): Promise<ConversationUploadItem[]> {
  const res = await fetch(joinApiHealthCheckUrl(conversationGraphOrigin(), API_CONVERSATIONS_LIST_PATH), { method: 'GET' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || '목록 조회 실패');
  return json.data || [];
}

export async function fetchRelationshipGraph(
  uploadId: string,
  startDate?: string,
  endDate?: string
): Promise<RelationshipGraphData> {
  const params = new URLSearchParams();
  if (startDate) params.set(API_QUERY_PARAM_START_DATE, startDate);
  if (endDate) params.set(API_QUERY_PARAM_END_DATE, endDate);
  const qs = params.toString();
  const url =
    joinApiHealthCheckUrl(
      conversationGraphOrigin(),
      `${API_CONVERSATIONS_LIST_PATH}/${encodeURIComponent(uploadId)}${API_CONVERSATIONS_RELATIONSHIP_GRAPH_SEGMENT}${qs ? `?${qs}` : ''}`,
    );
  const res = await fetch(url, { method: 'GET' });
  const json = await res.json();
  if (!json.success || !json.data) throw new Error(json.error || '관계도 조회 실패');
  return json.data;
}
