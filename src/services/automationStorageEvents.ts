/**
 * 자동화 뷰 저장 시 홈 요약 갱신 — 실제 이벤트는 corbuHomeStorageEvents와 동일합니다.
 */
export {
  CORBU_HOME_STORAGE_UPDATED_EVENT as AUTOMATION_STORAGE_UPDATED_EVENT,
  dispatchCorbuHomeStorageUpdated as dispatchAutomationStorageUpdated,
} from './corbuHomeStorageEvents';
