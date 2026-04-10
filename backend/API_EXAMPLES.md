# API 사용 예제

## JavaScript/TypeScript 예제

### Axios를 사용한 예제

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 시도
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/api/auth/refresh', {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data.token;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          // 원래 요청 재시도
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          // 리프레시 실패 시 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// 회원가입
export async function register(userData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
}

// 로그인
export async function login(username: string, password: string) {
  const response = await api.post('/api/auth/login', { username, password });
  if (response.data.success) {
    const { accessToken, refreshToken } = response.data.data.token;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
  return response.data;
}

// 로그아웃
export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    await api.post('/api/auth/logout', { refreshToken });
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// 현재 사용자 정보 조회
export async function getCurrentUser() {
  const response = await api.get('/api/auth/me');
  return response.data;
}

// 프로필 조회
export async function getUserProfile(userId: string) {
  const response = await api.get(`/api/user-profile/${userId}`);
  return response.data;
}

// 프로필 업데이트
export async function updateUserProfile(profile: {
  fullName?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
}) {
  const response = await api.post('/api/update-user-profile', profile);
  return response.data;
}

// 설정 조회
export async function getUserSettings() {
  const response = await api.get('/api/user/settings');
  return response.data;
}

// 설정 업데이트
export async function updateUserSettings(settings: {
  theme?: string;
  language?: string;
  notifications?: any;
}) {
  const response = await api.put('/api/user/settings', settings);
  return response.data;
}
```

## Python 예제

```python
import requests
from typing import Optional, Dict, Any

class CORBUAPIClient:
    def __init__(self, base_url: str = "http://localhost:5002"):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
    
    def _get_headers(self) -> Dict[str, str]:
        """인증 헤더 생성"""
        headers = {"Content-Type": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers
    
    def register(self, username: str, email: str, password: str) -> Dict[str, Any]:
        """회원가입"""
        data = {
            "username": username,
            "email": email,
            "password": password,
            "confirmPassword": password
        }
        response = requests.post(
            f"{self.base_url}/api/auth/register",
            json=data
        )
        return response.json()
    
    def login(self, username: str, password: str) -> Dict[str, Any]:
        """로그인"""
        data = {"username": username, "password": password}
        response = requests.post(
            f"{self.base_url}/api/auth/login",
            json=data
        )
        result = response.json()
        if result.get("success"):
            token_data = result["data"]["token"]
            self.access_token = token_data["accessToken"]
            self.refresh_token = token_data["refreshToken"]
        return result
    
    def get_current_user(self) -> Dict[str, Any]:
        """현재 사용자 정보 조회"""
        response = requests.get(
            f"{self.base_url}/api/auth/me",
            headers=self._get_headers()
        )
        return response.json()
    
    def get_profile(self, user_id: str) -> Dict[str, Any]:
        """프로필 조회"""
        response = requests.get(
            f"{self.base_url}/api/user-profile/{user_id}",
            headers=self._get_headers()
        )
        return response.json()
    
    def update_profile(self, **kwargs) -> Dict[str, Any]:
        """프로필 업데이트"""
        response = requests.post(
            f"{self.base_url}/api/update-user-profile",
            json=kwargs,
            headers=self._get_headers()
        )
        return response.json()
    
    def get_settings(self) -> Dict[str, Any]:
        """설정 조회"""
        response = requests.get(
            f"{self.base_url}/api/user/settings",
            headers=self._get_headers()
        )
        return response.json()
    
    def update_settings(self, **kwargs) -> Dict[str, Any]:
        """설정 업데이트"""
        response = requests.put(
            f"{self.base_url}/api/user/settings",
            json=kwargs,
            headers=self._get_headers()
        )
        return response.json()
    
    def logout(self) -> Dict[str, Any]:
        """로그아웃"""
        if not self.refresh_token:
            return {"success": False, "error": "Not logged in"}
        
        response = requests.post(
            f"{self.base_url}/api/auth/logout",
            json={"refreshToken": self.refresh_token}
        )
        self.access_token = None
        self.refresh_token = None
        return response.json()

# 사용 예제
if __name__ == "__main__":
    client = CORBUAPIClient()
    
    # 회원가입
    register_result = client.register("testuser", "test@example.com", "Test1234!")
    print("회원가입:", register_result)
    
    # 로그인
    login_result = client.login("testuser", "Test1234!")
    print("로그인:", login_result)
    
    # 현재 사용자 정보
    user_info = client.get_current_user()
    print("사용자 정보:", user_info)
    
    # 프로필 업데이트
    profile_update = client.update_profile(
        fullName="테스트 사용자",
        phone="010-1234-5678"
    )
    print("프로필 업데이트:", profile_update)
    
    # 로그아웃
    logout_result = client.logout()
    print("로그아웃:", logout_result)
```

## cURL 예제

### 회원가입
```bash
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!",
    "confirmPassword": "Test1234!"
  }'
```

### 로그인
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test1234!"
  }'
```

### 현재 사용자 정보 조회 (토큰 필요)
```bash
curl http://localhost:5002/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 프로필 업데이트
```bash
curl -X POST http://localhost:5002/api/update-user-profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "테스트 사용자",
    "phone": "010-1234-5678",
    "location": "서울"
  }'
```

### 헬스 체크
```bash
curl http://localhost:5002/api/health
```

## React Hook 예제

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002';

// 인증 Hook
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      });
      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data.token;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(response.data.data.user);
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || '로그인 실패' };
    }
  };
  
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, { refreshToken });
      }
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };
  
  return { user, loading, login, logout, refetch: fetchCurrentUser };
}
```

## 에러 처리 예제

```typescript
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:5002${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    return {
      success: data.success !== false,
      data: data.data || data,
      error: data.error
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '네트워크 오류가 발생했습니다.'
    };
  }
}
```

