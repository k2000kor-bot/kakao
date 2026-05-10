# 🎨 CORBU.AI 디자인 시스템 가이드

**작성일**: 2025년 1월 27일  
**버전**: 1.0.0  
**상태**: ✅ **완료**

---

## 📋 목차

1. [개요](#개요)
2. [테마 시스템](#테마-시스템)
3. [색상 팔레트](#색상-팔레트)
4. [타이포그래피](#타이포그래피)
5. [간격 시스템](#간격-시스템)
6. [반경 시스템](#반경-시스템)
7. [그림자 시스템](#그림자-시스템)
8. [컴포넌트 스타일 가이드](#컴포넌트-스타일-가이드)
9. [다크 모드](#다크-모드)
10. [사용 예시](#사용-예시)

---

## 개요

CORBU.AI 디자인 시스템은 일관된 사용자 경험을 제공하기 위한 포괄적인 스타일 가이드입니다. 모든 컴포넌트는 CSS 변수를 통해 테마 시스템과 통합되어 있으며, 다크 모드를 완벽하게 지원합니다.

### 핵심 원칙

- **일관성**: 모든 컴포넌트가 동일한 디자인 토큰 사용
- **접근성**: WCAG 2.1 AA 기준 준수
- **확장성**: 새로운 테마 추가 용이
- **유지보수성**: 중앙 집중식 스타일 관리

---

## 테마 시스템

### ThemeProvider 사용

```tsx
import { ThemeProvider } from '../components/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultMode="auto">
      <YourApp />
    </ThemeProvider>
  );
}
```

### 테마 모드

- `light`: 라이트 모드 강제
- `dark`: 다크 모드 강제
- `auto`: 시스템 설정 따르기 (기본값)

### 테마 변경

```tsx
import { useTheme } from '../components/ThemeProvider';

function ThemeToggle() {
  const { mode, setMode, toggleMode } = useTheme();
  
  return (
    <button onClick={toggleMode}>
      현재 모드: {mode}
    </button>
  );
}
```

---

## 색상 팔레트

### 배경색

```css
/* 기본 배경 */
background: var(--bg-primary);        /* #ffffff (라이트) / #1f2937 (다크) */
background: var(--bg-secondary);      /* #f8fafc (라이트) / #111827 (다크) */
background: var(--bg-tertiary);       /* #f1f5f9 (라이트) / #0f172a (다크) */

/* 인터랙티브 배경 */
background: var(--bg-hover);           /* 호버 상태 */
background: var(--bg-active);          /* 활성 상태 */
background: var(--bg-overlay);         /* 오버레이 (모달 등) */
```

### 텍스트 색상

```css
/* 텍스트 색상 */
color: var(--text-primary);            /* 주요 텍스트 */
color: var(--text-secondary);         /* 보조 텍스트 */
color: var(--text-tertiary);          /* 3차 텍스트 */
color: var(--text-disabled);          /* 비활성 텍스트 */
color: var(--text-inverse);           /* 역색 텍스트 (버튼 등) */
```

### 테두리 색상

```css
/* 테두리 */
border-color: var(--border-color);    /* 기본 테두리 */
border-color: var(--border-hover);    /* 호버 테두리 */
border-color: var(--border-active);   /* 활성 테두리 */
border-color: var(--border-focus);    /* 포커스 테두리 */
```

### 액센트 색상

```css
/* 주요 액센트 */
background: var(--accent-primary);              /* #667eea */
background: var(--accent-primary-hover);        /* #5568d3 */
background: var(--accent-primary-light);       /* #e0e7ff */

/* 보조 액센트 */
background: var(--accent-secondary);            /* #764ba2 */
background: var(--accent-secondary-hover);      /* #5d3d7a */
```

### 상태 색상

```css
/* 성공 */
background: var(--accent-success);              /* #10b981 */
background: var(--accent-success-light);        /* #d1fae5 */

/* 경고 */
background: var(--accent-warning);              /* #f59e0b */
background: var(--accent-warning-light);        /* #fef3c7 */

/* 위험 */
background: var(--accent-danger);                /* #dc2626 */
background: var(--accent-danger-light);         /* #fee2e2 */

/* 정보 */
background: var(--accent-info);                 /* #3b82f6 */
background: var(--accent-info-light);           /* #dbeafe */
```

---

## 타이포그래피

### 폰트 패밀리

```css
font-family: var(--font-family-base);    /* 시스템 기본 폰트 */
font-family: var(--font-family-mono);     /* 모노스페이스 폰트 */
```

### 폰트 크기

```css
font-size: var(--font-size-xs);      /* 12px */
font-size: var(--font-size-sm);      /* 14px */
font-size: var(--font-size-base);    /* 16px */
font-size: var(--font-size-lg);      /* 18px */
font-size: var(--font-size-xl);      /* 20px */
font-size: var(--font-size-2xl);     /* 24px */
font-size: var(--font-size-3xl);     /* 30px */
```

### 폰트 두께

```css
font-weight: var(--font-weight-normal);    /* 400 */
font-weight: var(--font-weight-medium);    /* 500 */
font-weight: var(--font-weight-semibold);   /* 600 */
font-weight: var(--font-weight-bold);       /* 700 */
```

---

## 간격 시스템

```css
padding: var(--spacing-xs);      /* 4px */
padding: var(--spacing-sm);      /* 8px */
padding: var(--spacing-md);      /* 12px */
padding: var(--spacing-lg);      /* 16px */
padding: var(--spacing-xl);      /* 20px */
padding: var(--spacing-2xl);     /* 24px */
padding: var(--spacing-3xl);     /* 32px */
```

### 사용 예시

```css
/* 카드 패딩 */
.card {
  padding: var(--spacing-lg);
}

/* 버튼 패딩 */
.button {
  padding: var(--spacing-sm) var(--spacing-md);
}

/* 섹션 간격 */
.section {
  margin-bottom: var(--spacing-2xl);
}
```

---

## 반경 시스템

```css
border-radius: var(--radius-sm);      /* 4px */
border-radius: var(--radius-md);      /* 6px */
border-radius: var(--radius-lg);      /* 8px */
border-radius: var(--radius-xl);      /* 12px */
border-radius: var(--radius-2xl);     /* 16px */
border-radius: var(--radius-full);    /* 9999px (완전한 원) */
```

### 사용 예시

```css
/* 버튼 */
.button {
  border-radius: var(--radius-md);
}

/* 카드 */
.card {
  border-radius: var(--radius-lg);
}

/* 아바타 */
.avatar {
  border-radius: var(--radius-full);
}
```

---

## 그림자 시스템

```css
box-shadow: var(--shadow-xs);      /* 가장 작은 그림자 */
box-shadow: var(--shadow-sm);      /* 작은 그림자 */
box-shadow: var(--shadow-md);      /* 중간 그림자 */
box-shadow: var(--shadow-lg);      /* 큰 그림자 */
box-shadow: var(--shadow-xl);      /* 매우 큰 그림자 */
box-shadow: var(--shadow-2xl);     /* 가장 큰 그림자 */
```

### 사용 예시

```css
/* 카드 */
.card {
  box-shadow: var(--shadow-md);
}

/* 모달 */
.modal {
  box-shadow: var(--shadow-xl);
}

/* 호버 효과 */
.button:hover {
  box-shadow: var(--shadow-lg);
}
```

---

## 컴포넌트 스타일 가이드

### 버튼

```css
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.button:hover {
  background: var(--accent-primary-hover);
  box-shadow: var(--shadow-sm);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--text-disabled);
}
```

### 입력 필드

```css
.input {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### 카드

```css
.card {
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

### 패널

```css
.panel {
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}
```

---

## 다크 모드

### 자동 지원

모든 CSS 변수는 다크 모드에서 자동으로 변경됩니다. `.dark-mode` 클래스가 적용되면 모든 색상이 다크 테마 값으로 전환됩니다.

### 수동 적용

```css
/* 다크 모드 전용 스타일 */
.dark-mode .component {
  /* 다크 모드 스타일 */
}
```

### 전환 효과

```css
/* 부드러운 전환 */
.component {
  transition: background-color var(--transition-base),
              color var(--transition-base);
}
```

---

## 사용 예시

### 완전한 컴포넌트 예시

```css
/* MyComponent.css */
.my-component {
  /* 레이아웃 */
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  
  /* 스타일링 */
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  
  /* 타이포그래피 */
  font-size: var(--font-size-base);
  color: var(--text-primary);
  
  /* 전환 */
  transition: all var(--transition-base);
}

.my-component:hover {
  background: var(--bg-hover);
  box-shadow: var(--shadow-md);
}

.my-component-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.my-component-content {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
}
```

### TypeScript/React 예시

```tsx
import React from 'react';
import './MyComponent.css';

interface MyComponentProps {
  title: string;
  content: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, content }) => {
  return (
    <div className="my-component">
      <h2 className="my-component-title">{title}</h2>
      <p className="my-component-content">{content}</p>
    </div>
  );
};
```

---

## Z-index 레이어

```css
z-index: var(--z-base);              /* 1 */
z-index: var(--z-dropdown);          /* 1000 */
z-index: var(--z-sticky);            /* 1020 */
z-index: var(--z-fixed);             /* 1030 */
z-index: var(--z-modal-backdrop);    /* 1040 */
z-index: var(--z-modal);             /* 1050 */
z-index: var(--z-popover);           /* 1060 */
z-index: var(--z-tooltip);           /* 1070 */
z-index: var(--z-toast);             /* 1080 */
```

---

## 전환 효과

```css
transition: all var(--transition-fast);      /* 150ms */
transition: all var(--transition-base);     /* 200ms */
transition: all var(--transition-slow);     /* 300ms */
transition: all var(--transition-slower);    /* 500ms */
```

---

## 유틸리티 클래스

### 포커스 링

```css
.focus-ring {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

### 스크린 리더 전용

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 애니메이션

```css
.animate-fade-in {
  animation: fadeIn var(--transition-base);
}

.animate-slide-down {
  animation: slideDown var(--transition-base);
}

.animate-slide-up {
  animation: slideUp var(--transition-base);
}

.animate-scale-in {
  animation: scaleIn var(--transition-base);
}
```

---

## 모범 사례

### ✅ 권장 사항

1. **항상 테마 변수 사용**: 하드코딩된 색상/값 사용 금지
2. **일관된 간격 사용**: spacing 변수 사용
3. **접근성 고려**: 충분한 색상 대비 유지
4. **전환 효과 추가**: 사용자 경험 향상
5. **다크 모드 테스트**: 모든 컴포넌트에서 다크 모드 확인

### ❌ 피해야 할 것

1. 하드코딩된 색상 값 (`#ffffff`, `rgb(255, 255, 255)` 등)
2. 하드코딩된 간격 값 (`padding: 10px` 등)
3. 하드코딩된 반경 값 (`border-radius: 5px` 등)
4. 인라인 스타일 (가능한 한 CSS 클래스 사용)
5. 테마 변수 없이 다크 모드 스타일 작성

---

## 추가 리소스

- **테마 파일**: `src/styles/theme.css`
- **ThemeProvider**: `src/components/ThemeProvider.tsx`
- **예시 컴포넌트**: `src/components/ChatGPTInterface.css`

---

## 버전 히스토리

- **v1.0.0** (2025-01-27): 초기 버전 작성

---

**작성자**: AI Assistant  
**검토 상태**: ✅ 완료

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

