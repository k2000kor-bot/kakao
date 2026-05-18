/** 연결(엣지) 클릭 시 포커스할 참여자 id — 이미 선택된 쪽이면 반대편으로 이동한다. */
export function pickEdgeFocusParticipantId(
  sourceId: string,
  targetId: string,
  selectedNodeId: string | null,
): string {
  if (selectedNodeId === sourceId) return targetId;
  if (selectedNodeId === targetId) return sourceId;
  return targetId;
}
