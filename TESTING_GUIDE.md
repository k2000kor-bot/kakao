# 🧪 테스트 가이드

## 테스트 실행

### 모든 테스트 실행
```bash
npm test
```

### Watch 모드로 실행 (개발 중)
```bash
npm run test:watch
```

### 커버리지 리포트 생성
```bash
npm run test:coverage
```

### CI 모드로 실행
```bash
npm run test:ci
```

## 테스트 구조

### 유틸리티 테스트
- `src/utils/__tests__/retryHandler.test.ts` - 재시도 로직 테스트
- `src/utils/__tests__/topicDetector.test.ts` - 토픽 감지 테스트

### 컴포넌트 테스트
- `src/components/__tests__/ErrorRecovery.test.tsx` - 에러 복구 컴포넌트 테스트
- `src/components/__tests__/ProgressIndicator.test.tsx` - 진행률 표시 컴포넌트 테스트

## 테스트 작성 가이드

### 1. 유틸리티 함수 테스트

```typescript
import { functionName } from '../utils/utility';

describe('utility', () => {
  it('should do something', () => {
    const result = functionName();
    expect(result).toBe(expected);
  });
});
```

### 2. React 컴포넌트 테스트

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '../Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### 3. 비동기 함수 테스트

```typescript
import { waitFor } from '@testing-library/react';

it('should handle async operations', async () => {
  const mockFn = jest.fn().mockResolvedValue('data');
  
  await waitFor(() => {
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## 테스트 커버리지 목표

- **유틸리티 함수**: 80% 이상
- **컴포넌트**: 70% 이상
- **서비스**: 75% 이상

## 모킹 가이드

### API 호출 모킹
```typescript
jest.mock('../services/apiService', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' }),
}));
```

### 브라우저 API 모킹
```typescript
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});
```

## 베스트 프랙티스

1. **테스트는 독립적이어야 함**: 각 테스트는 다른 테스트에 의존하지 않아야 합니다.
2. **명확한 테스트 이름**: 테스트 이름은 무엇을 테스트하는지 명확히 해야 합니다.
3. **AAA 패턴**: Arrange, Act, Assert 패턴을 따르세요.
4. **모킹 최소화**: 필요한 경우에만 모킹을 사용하세요.
5. **실제 사용 사례 테스트**: 실제 사용 시나리오를 테스트하세요.

