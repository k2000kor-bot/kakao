# 🚀 UniversalChatInput 컴포넌트 사용 가이드

**프론트 회귀·원격 push**: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — **`npm run test:sidebar-context`**. [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md).

**버전**: 1.0.0  
**생성일**: 2025년 8월 5일  
**상태**: ✅ **완전 준비 완료**

---

## 📋 개요

`UniversalChatInput`은 다양한 프로젝트에서 재사용할 수 있는 범용적인 대화 입력 컴포넌트입니다. 홈에 있는 입력창의 모든 기능을 포함하며, 테마, 크기, 기능을 커스터마이징할 수 있습니다.

### 🌟 주요 특징

- **완전한 커스터마이징**: 테마, 크기, 기능 옵션
- **자동 높이 조절**: 입력 내용에 따른 자동 크기 조정
- **파일 업로드**: 드래그 앤 드롭 및 파일 선택
- **음성 입력**: 음성 입력 기능 지원
- **도구 버튼**: 추가 도구 기능
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원
- **반응형**: 다양한 화면 크기에 대응

---

## 🚀 기본 사용법

### 1. 컴포넌트 import

```tsx
import UniversalChatInput from './components/UniversalChatInput';
```

### 2. 기본 사용 예시

```tsx
import React, { useState } from 'react';
import UniversalChatInput from './components/UniversalChatInput';

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
    setIsLoading(true);
    
    // AI 응답 처리
    setTimeout(() => {
      setMessages(prev => [...prev, `AI: ${message}에 대한 응답입니다.`]);
      setIsLoading(false);
    }, 1000);
  };

  const handleFileUpload = (files: File[]) => {
    console.log('업로드된 파일들:', files);
    // 파일 처리 로직
  };

  const handleVoiceInput = () => {
    console.log('음성 입력 시작');
    // 음성 입력 로직
  };

  const handleToolClick = () => {
    console.log('도구 클릭');
    // 도구 기능 로직
  };

  return (
    <div className="chat-container">
      {/* 메시지 목록 */}
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">{msg}</div>
        ))}
      </div>

      {/* 범용 대화 입력창 */}
      <UniversalChatInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        onVoiceInput={handleVoiceInput}
        onToolClick={handleToolClick}
        placeholder="메시지를 입력하세요..."
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatApp;
```

---

## ⚙️ Props 상세 설명

### 필수 Props

| Prop | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| `onSendMessage` | `(message: string) => void` | 메시지 전송 시 호출되는 함수 | - |

### 선택적 Props

| Prop | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| `onFileUpload` | `(files: File[]) => void` | 파일 업로드 시 호출되는 함수 | `undefined` |
| `onVoiceInput` | `() => void` | 음성 입력 버튼 클릭 시 호출되는 함수 | `undefined` |
| `onToolClick` | `() => void` | 도구 버튼 클릭 시 호출되는 함수 | `undefined` |
| `placeholder` | `string` | 입력창 플레이스홀더 텍스트 | `"메시지를 입력하거나 기능을 요청하세요..."` |
| `isLoading` | `boolean` | 로딩 상태 표시 | `false` |
| `disabled` | `boolean` | 입력창 비활성화 | `false` |
| `className` | `string` | 추가 CSS 클래스 | `""` |
| `showFileUpload` | `boolean` | 파일 업로드 버튼 표시 여부 | `true` |
| `showVoiceInput` | `boolean` | 음성 입력 버튼 표시 여부 | `true` |
| `showToolButton` | `boolean` | 도구 버튼 표시 여부 | `true` |
| `autoFocus` | `boolean` | 자동 포커스 여부 | `true` |
| `maxHeight` | `number` | 입력창 최대 높이 (px) | `480` |
| `minHeight` | `number` | 입력창 최소 높이 (px) | `24` |
| `theme` | `'default' \| 'dark' \| 'minimal'` | 테마 설정 | `'default'` |
| `size` | `'small' \| 'medium' \| 'large'` | 크기 설정 | `'medium'` |

---

## 🎨 테마 및 스타일링

### 1. 테마 옵션

#### Default 테마
```tsx
<UniversalChatInput
  theme="default"
  onSendMessage={handleSendMessage}
/>
```

#### Dark 테마
```tsx
<UniversalChatInput
  theme="dark"
  onSendMessage={handleSendMessage}
/>
```

#### Minimal 테마
```tsx
<UniversalChatInput
  theme="minimal"
  onSendMessage={handleSendMessage}
/>
```

### 2. 크기 옵션

#### Small 크기
```tsx
<UniversalChatInput
  size="small"
  onSendMessage={handleSendMessage}
/>
```

#### Medium 크기 (기본)
```tsx
<UniversalChatInput
  size="medium"
  onSendMessage={handleSendMessage}
/>
```

#### Large 크기
```tsx
<UniversalChatInput
  size="large"
  onSendMessage={handleSendMessage}
/>
```

### 3. 커스텀 스타일링

```tsx
<UniversalChatInput
  onSendMessage={handleSendMessage}
  className="custom-chat-input"
  style={{
    border: '2px solid #e5e7eb',
    borderRadius: '20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }}
/>
```

---

## 🔧 고급 사용 예시

### 1. 파일 업로드 기능

```tsx
const handleFileUpload = (files: File[]) => {
  files.forEach(file => {
    console.log(`파일명: ${file.name}`);
    console.log(`크기: ${file.size} bytes`);
    console.log(`타입: ${file.type}`);
    
    // 파일 처리 로직
    if (file.type.startsWith('image/')) {
      // 이미지 파일 처리
      handleImageUpload(file);
    } else if (file.type.startsWith('text/')) {
      // 텍스트 파일 처리
      handleTextFileUpload(file);
    }
  });
};

<UniversalChatInput
  onSendMessage={handleSendMessage}
  onFileUpload={handleFileUpload}
  showFileUpload={true}
/>
```

### 2. 음성 입력 기능

```tsx
const handleVoiceInput = () => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ko-KR';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('음성 인식 결과:', transcript);
      // 음성 입력 결과를 메시지로 처리
    };
    
    recognition.start();
  } else {
    alert('음성 인식이 지원되지 않는 브라우저입니다.');
  }
};

<UniversalChatInput
  onSendMessage={handleSendMessage}
  onVoiceInput={handleVoiceInput}
  showVoiceInput={true}
/>
```

### 3. 도구 기능

```tsx
const handleToolClick = () => {
  // 도구 메뉴 표시
  setShowToolMenu(true);
};

<UniversalChatInput
  onSendMessage={handleSendMessage}
  onToolClick={handleToolClick}
  showToolButton={true}
/>
```

### 4. 로딩 상태 처리

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSendMessage = async (message: string) => {
  setIsLoading(true);
  
  try {
    // AI 응답 요청
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    setMessages(prev => [...prev, `AI: ${data.response}`]);
  } catch (error) {
    console.error('메시지 전송 실패:', error);
  } finally {
    setIsLoading(false);
  }
};

<UniversalChatInput
  onSendMessage={handleSendMessage}
  isLoading={isLoading}
/>
```

---

## 📱 반응형 디자인

### 모바일 최적화

```tsx
const ChatApp: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <UniversalChatInput
      onSendMessage={handleSendMessage}
      size={isMobile ? 'small' : 'medium'}
      showToolButton={!isMobile}
      maxHeight={isMobile ? 200 : 480}
    />
  );
};
```

---

## 🔒 접근성 (Accessibility)

### 키보드 네비게이션

- **Tab**: 버튼들 간 이동
- **Enter**: 메시지 전송
- **Shift + Enter**: 줄바꿈
- **Escape**: 포커스 해제

### 스크린 리더 지원

```tsx
<UniversalChatInput
  onSendMessage={handleSendMessage}
  aria-label="대화 메시지 입력"
  aria-describedby="chat-input-help"
/>
```

---

## 🧪 테스트 예시

### Jest 테스트

```tsx
import { render, fireEvent, screen } from '@testing-library/react';
import UniversalChatInput from './UniversalChatInput';

describe('UniversalChatInput', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  test('메시지 전송 기능', () => {
    render(<UniversalChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByTitle('메시지 전송');
    
    fireEvent.change(input, { target: { value: '테스트 메시지' } });
    fireEvent.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('테스트 메시지');
  });

  test('파일 업로드 기능', () => {
    const mockOnFileUpload = jest.fn();
    render(
      <UniversalChatInput 
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );
    
    const fileInput = screen.getByTitle('파일 첨부');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(mockOnFileUpload).toHaveBeenCalledWith([file]);
  });
});
```

---

## 🚀 성능 최적화

### 1. 메모이제이션

```tsx
import React, { useCallback, useMemo } from 'react';

const ChatApp: React.FC = () => {
  const handleSendMessage = useCallback((message: string) => {
    // 메시지 처리 로직
  }, []);

  const handleFileUpload = useCallback((files: File[]) => {
    // 파일 처리 로직
  }, []);

  const inputProps = useMemo(() => ({
    onSendMessage: handleSendMessage,
    onFileUpload: handleFileUpload,
    placeholder: "메시지를 입력하세요...",
    theme: "default",
    size: "medium"
  }), [handleSendMessage, handleFileUpload]);

  return <UniversalChatInput {...inputProps} />;
};
```

### 2. 지연 로딩

```tsx
import React, { Suspense } from 'react';

const UniversalChatInput = React.lazy(() => import('./UniversalChatInput'));

const ChatApp: React.FC = () => {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <UniversalChatInput onSendMessage={handleSendMessage} />
    </Suspense>
  );
};
```

---

## 📋 마이그레이션 가이드

### 기존 입력창에서 마이그레이션

#### Before (기존 코드)
```tsx
<div className="chat-input-container">
  <textarea
    value={message}
    onChange={handleChange}
    placeholder="메시지를 입력하세요..."
  />
  <button onClick={handleSend}>전송</button>
</div>
```

#### After (UniversalChatInput 사용)
```tsx
<UniversalChatInput
  onSendMessage={handleSend}
  placeholder="메시지를 입력하세요..."
  theme="default"
  size="medium"
/>
```

---

## 🎯 사용 시나리오

### 1. 일반 대화 앱
```tsx
<UniversalChatInput
  onSendMessage={handleSendMessage}
  placeholder="메시지를 입력하세요..."
  theme="default"
  size="medium"
/>
```

### 2. 고급 AI 대화
```tsx
<UniversalChatInput
  onSendMessage={handleSendMessage}
  onFileUpload={handleFileUpload}
  onVoiceInput={handleVoiceInput}
  onToolClick={handleToolClick}
  placeholder="AI에게 질문하거나 파일을 업로드하세요..."
  theme="dark"
  size="large"
  showFileUpload={true}
  showVoiceInput={true}
  showToolButton={true}
/>
```

### 3. 미니멀 대화
```tsx
<UniversalChatInput
  onSendMessage={handleSendMessage}
  theme="minimal"
  size="small"
  showFileUpload={false}
  showVoiceInput={false}
  showToolButton={false}
/>
```

---

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. 파일 업로드가 작동하지 않음
```tsx
// 해결: onFileUpload prop이 정의되어 있는지 확인
<UniversalChatInput
  onSendMessage={handleSendMessage}
  onFileUpload={handleFileUpload} // 이 prop이 필요함
  showFileUpload={true}
/>
```

#### 2. 테마가 적용되지 않음
```tsx
// 해결: Tailwind CSS가 설치되어 있는지 확인
npm install tailwindcss
```

#### 3. 타입 오류 발생
```tsx
// 해결: TypeScript 타입 정의 확인
interface UniversalChatInputProps {
  onSendMessage: (message: string) => void;
  // ... 기타 props
}
```

---

## 📞 지원 및 문의

### 기술 지원
- **이메일**: support@corbu-ai.com
- **문서**: 이 가이드 참조
- **GitHub**: 이슈 리포트

### 피드백 및 제안
- 기능 요청 및 버그 리포트
- 성능 개선 제안
- 사용자 경험 피드백

---

**가이드 버전**: 1.0.0  
**최종 업데이트**: 2025년 8월 5일  
**상태**: ✅ **완전 준비 완료** 