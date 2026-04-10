/** 프로젝트·시스템 복원 등 localStorage 키(부작용 없음) */
export const PROJECTS_STORAGE_KEY = 'projects' as const;
/** importSystemData 등 일괄 복원 시 대화 스냅샷 */
export const SYSTEM_IMPORT_CHATS_STORAGE_KEY = 'chats' as const;
/** importSystemData 등 일괄 복원 시 메시지 스냅샷 */
export const SYSTEM_IMPORT_MESSAGES_STORAGE_KEY = 'messages' as const;
/** projectChatStructureService — 레거시 독립 대화 목록 */
export const PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY = 'chatSessions' as const;
/** storageCleaner 등 — 현재 프로젝트 스냅샷 */
export const CURRENT_PROJECT_STORAGE_KEY = 'currentProject' as const;
