import React, { useState, useEffect } from 'react';
import { useBackendAPI, tokenManager } from '../services/backendAPI';
import { useNotifications } from '../context/AppContext';

interface AuthSystemProps {
  onAuthSuccess: () => void;
  onAuthFailure: () => void;
}

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthSystem: React.FC<AuthSystemProps> = ({ onAuthSuccess, onAuthFailure }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register, isAuthenticated } = useBackendAPI();
  const { addNotification } = useNotifications();

  // 이미 인증된 경우
  useEffect(() => {
    if (isAuthenticated) {
      onAuthSuccess();
    }
  }, [isAuthenticated, onAuthSuccess]);

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!loginForm.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!loginForm.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (loginForm.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!registerForm.name) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!registerForm.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!registerForm.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (registerForm.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    setIsLoading(true);
    try {
      const response = await login(loginForm);

      if (response.success && response.data) {
        const data = response.data as { accessToken: string; refreshToken: string };
        tokenManager.setTokens(data.accessToken, data.refreshToken);
        addNotification({
          type: 'success',
          title: '로그인 성공',
          message: 'CORBU AI에 오신 것을 환영합니다!'
        });
        onAuthSuccess();
      } else {
        addNotification({
          type: 'error',
          title: '로그인 실패',
          message: response.message || '로그인에 실패했습니다.'
        });
        onAuthFailure();
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: '로그인 오류',
        message: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.'
      });
      onAuthFailure();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegisterForm()) return;

    setIsLoading(true);
    try {
      const response = await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password
      });

      if (response.success) {
        addNotification({
          type: 'success',
          title: '회원가입 성공',
          message: '회원가입이 완료되었습니다. 로그인해주세요.'
        });
        setIsLogin(true);
        setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        addNotification({
          type: 'error',
          title: '회원가입 실패',
          message: response.message || '회원가입에 실패했습니다.'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: '회원가입 오류',
        message: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (form: 'login' | 'register', field: string, value: string) => {
    if (form === 'login') {
      setLoginForm(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterForm(prev => ({ ...prev, [field]: value }));
    }

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-3">🤖</span>
            <h1 className="text-3xl font-bold text-gray-900">CORBU.AI</h1>
          </div>
          <p className="text-gray-600">통합 AI 채팅 시스템</p>
        </div>

        {/* 탭 전환 */}
        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-t-lg transition-colors ${isLogin
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            로그인
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-t-lg transition-colors ${!isLogin
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            회원가입
          </button>
        </div>

        {/* 로그인 폼 */}
        {isLogin && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="login-email"
                type="email"
                value={loginForm.email}
                onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="login-password"
                type="password"
                value={loginForm.password}
                onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        )}

        {/* 회원가입 폼 */}
        {!isLogin && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                id="register-name"
                type="text"
                value={registerForm.name}
                onChange={(e) => handleInputChange('register', 'name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="홍길동"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="register-email"
                type="email"
                value={registerForm.email}
                onChange={(e) => handleInputChange('register', 'email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="register-password"
                type="password"
                value={registerForm.password}
                onChange={(e) => handleInputChange('register', 'password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                id="register-confirm-password"
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) => handleInputChange('register', 'confirmPassword', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '회원가입 중...' : '회원가입'}
            </button>
          </form>
        )}

        {/* 추가 정보 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-blue-500 hover:text-blue-600 font-medium"
            >
              {isLogin ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem; 