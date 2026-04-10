/**
 * Brainwave AI UI Kit — Figma 스타일 아이콘 (node-id=323-168775)
 * 24x24, stroke 2, fill none, stroke currentColor. 일관된 라운드/스트로크.
 */
import React from 'react';

const sizeDefault = 24;
const strokeDefault = 2;

interface IconProps {
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

export function IconLogo({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M12 2a10 10 0 0 1 7.38 16.75 1 1 0 0 1-1.5-.75 8 8 0 1 0-11.76 0 1 1 0 0 1-1.5.75A10 10 0 0 1 12 2z" />
    </svg>
  );
}

export function IconPlus({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconSearch({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function IconSend({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="m22 2-7 20-4-9-9-4L22 2z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export function IconStop({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden={ariaHidden}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export function IconSun({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export function IconMoon({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function IconTrash({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconHome({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

export function IconMessage({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconSettings({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconMap({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="m2 6 6-3 6 3 6-3v14l-6 3-6-3-6 3z" />
      <path d="M8 3v14M16 3v14" />
    </svg>
  );
}

export function IconBook({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}

/** 폴더 (프로젝트·대화 목록용) */
export function IconFolder({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
    </svg>
  );
}

/** Chevron right (펼침 표시) */
export function IconChevronRight({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** Chevron left (사이드바 접기 등) */
export function IconChevronLeft({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function IconMenu({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/** 더보기 (세로 점 세 개) */
export function IconMoreVertical({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconX({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/** 목소리 생성 (TTS) 아이콘 */
export function IconVolume({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/** 업로드 (상단 바) */
export function IconUpload({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

/** 공유/링크 (상단 바: 상자+화살표) */
export function IconShare({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

/** 펜/편집 (상단 바) */
export function IconEdit({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/** 문서 (상단 바) */
export function IconFile({ size = sizeDefault, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeDefault} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}
