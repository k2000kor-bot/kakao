import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

interface SecuritySystemProps {
  onLogin: (credentials: { username: string; password: string }) => void;
  onLogout: () => void;
  onPermissionCheck: (permission: string) => boolean;
  onSecurityAlert: (alert: { type: string; message: string; severity: 'low' | 'medium' | 'high' }) => void;
}

const SecuritySystem: React.FC<SecuritySystemProps> = ({
  onLogin,
  onLogout,
  onPermissionCheck,
  onSecurityAlert
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30 * 60 * 1000); // 30분
  const [lastActivity, setLastActivity] = useState(Date.now());

  // 샘플 사용자 데이터
  const sampleUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@corbu.ai',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      lastLogin: '2025-01-27 14:30',
      isActive: true
    },
    {
      id: '2',
      username: 'user1',
      email: 'user1@corbu.ai',
      role: 'user',
      permissions: ['read', 'write'],
      lastLogin: '2025-01-27 14:25',
      isActive: true
    },
    {
      id: '3',
      username: 'guest',
      email: 'guest@corbu.ai',
      role: 'guest',
      permissions: ['read'],
      lastLogin: '2025-01-27 14:20',
      isActive: true
    }
  ];

  // 샘플 보안 로그
  const sampleSecurityLogs: SecurityLog[] = [
    {
      id: '1',
      timestamp: '2025-01-27 14:30:00',
      action: '로그인',
      user: 'admin',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'success',
      details: '성공적인 로그인'
    },
    {
      id: '2',
      timestamp: '2025-01-27 14:25:00',
      action: '권한 확인',
      user: 'user1',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success',
      details: '파일 읽기 권한 확인'
    },
    {
      id: '3',
      timestamp: '2025-01-27 14:20:00',
      action: '로그인 시도',
      user: 'unknown',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Linux; Android 10)',
      status: 'failed',
      details: '잘못된 비밀번호'
    }
  ];

  useEffect(() => {
    setSecurityLogs(sampleSecurityLogs);
    
    // 세션 타임아웃 체크
    const sessionCheck = setInterval(() => {
      const now = Date.now();
      if (isAuthenticated && (now - lastActivity) > sessionTimeout) {
        handleSessionTimeout();
      }
    }, 60000); // 1분마다 체크

    // 사용자 활동 감지
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => setLastActivity(Date.now());

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      clearInterval(sessionCheck);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, lastActivity, sessionTimeout]);

  const handleLogin = async () => {
    if (isLocked) {
      onSecurityAlert({
        type: '계정 잠금',
        message: '계정이 잠겨있습니다. 15분 후에 다시 시도해주세요.',
        severity: 'high'
      });
      return;
    }

    try {
      // 실제 로그인 로직 시뮬레이션
      const user = sampleUsers.find(u => u.username === loginCredentials.username);
      
      if (user && loginCredentials.password === 'password') {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setFailedAttempts(0);
        setShowLoginModal(false);
        
        // 보안 로그 추가
        const newLog: SecurityLog = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          action: '로그인',
          user: user.username,
          ipAddress: '192.168.1.100',
          userAgent: navigator.userAgent,
          status: 'success',
          details: '성공적인 로그인'
        };
        
        setSecurityLogs(prev => [newLog, ...prev]);
        onLogin(loginCredentials);
        
        onSecurityAlert({
          type: '로그인 성공',
          message: `${user.username}님이 로그인했습니다.`,
          severity: 'low'
        });
      } else {
        setFailedAttempts(prev => prev + 1);
        
        if (failedAttempts >= 4) {
          setIsLocked(true);
          setTimeout(() => setIsLocked(false), 15 * 60 * 1000); // 15분 후 잠금 해제
          
          onSecurityAlert({
            type: '계정 잠금',
            message: '5회 연속 실패로 계정이 잠겼습니다.',
            severity: 'high'
          });
        }
        
        // 실패 로그 추가
        const failedLog: SecurityLog = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          action: '로그인 시도',
          user: loginCredentials.username,
          ipAddress: '192.168.1.100',
          userAgent: navigator.userAgent,
          status: 'failed',
          details: '잘못된 자격 증명'
        };
        
        setSecurityLogs(prev => [failedLog, ...prev]);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowLoginModal(false);
    
    // 로그아웃 로그 추가
    const logoutLog: SecurityLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      action: '로그아웃',
      user: currentUser?.username || 'unknown',
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      status: 'success',
      details: '사용자 로그아웃'
    };
    
    setSecurityLogs(prev => [logoutLog, ...prev]);
    onLogout();
  };

  const handleSessionTimeout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    onSecurityAlert({
      type: '세션 만료',
      message: '세션이 만료되었습니다. 다시 로그인해주세요.',
      severity: 'medium'
    });
  };

  const checkPermission = (permission: string) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  const getStatusColor = (status: SecurityLog['status']) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'failed': return '#dc2626';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div className="security-system">
      {/* 로그인 버튼 */}
      {!isAuthenticated && (
        <button
          className="login-btn"
          onClick={() => setShowLoginModal(true)}
          disabled={isLocked}
        >
          🔐 로그인
        </button>
      )}

      {/* 사용자 정보 */}
      {isAuthenticated && currentUser && (
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <span className="username">{currentUser.username}</span>
            <span className="role">({currentUser.role})</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
          <button 
            className="security-panel-btn"
            onClick={() => setShowSecurityPanel(!showSecurityPanel)}
          >
            🔒
          </button>
        </div>
      )}

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <h2>🔐 로그인</h2>
            <div className="login-form">
              <div className="form-group">
                <label>사용자명:</label>
                <input
                  type="text"
                  value={loginCredentials.username}
                  onChange={(e) => setLoginCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="사용자명을 입력하세요"
                  disabled={isLocked}
                />
              </div>
              <div className="form-group">
                <label>비밀번호:</label>
                <input
                  type="password"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLocked}
                />
              </div>
              {isLocked && (
                <div className="lock-warning">
                  ⚠️ 계정이 잠겨있습니다. 15분 후에 다시 시도해주세요.
                </div>
              )}
              {failedAttempts > 0 && !isLocked && (
                <div className="failed-attempts">
                  ❌ 로그인 실패: {failedAttempts}/5
                </div>
              )}
              <div className="login-actions">
                <button 
                  className="login-submit-btn"
                  onClick={handleLogin}
                  disabled={isLocked || !loginCredentials.username || !loginCredentials.password}
                >
                  로그인
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowLoginModal(false)}
                >
                  취소
                </button>
              </div>
              <div className="sample-credentials">
                <h4>샘플 계정:</h4>
                <p>사용자명: admin, user1, guest</p>
                <p>비밀번호: password</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 보안 패널 */}
      {showSecurityPanel && isAuthenticated && (
        <div className="security-panel">
          <div className="panel-header">
            <h3>🔒 보안 관리</h3>
            <button 
              className="close-btn"
              onClick={() => setShowSecurityPanel(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="panel-content">
            {/* 사용자 권한 */}
            <div className="permissions-section">
              <h4>사용자 권한</h4>
              <div className="permissions-list">
                {currentUser?.permissions.map(permission => (
                  <span key={permission} className="permission-badge">
                    {permission}
                  </span>
                ))}
              </div>
            </div>

            {/* 보안 로그 */}
            <div className="security-logs-section">
              <h4>보안 로그</h4>
              <div className="logs-list">
                {securityLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="log-item">
                    <div className="log-header">
                      <span className="log-timestamp">{log.timestamp}</span>
                      <span 
                        className="log-status"
                        style={{ backgroundColor: getStatusColor(log.status) }}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="log-details">
                      <span className="log-action">{log.action}</span>
                      <span className="log-user">{log.user}</span>
                    </div>
                    <div className="log-info">
                      <span className="log-ip">IP: {log.ipAddress}</span>
                      <span className="log-details-text">{log.details}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 세션 정보 */}
            <div className="session-info">
              <h4>세션 정보</h4>
              <div className="session-details">
                <p>마지막 활동: {new Date(lastActivity).toLocaleString()}</p>
                <p>세션 만료: {new Date(lastActivity + sessionTimeout).toLocaleString()}</p>
                <p>남은 시간: {Math.max(0, Math.floor((sessionTimeout - (Date.now() - lastActivity)) / 60000))}분</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySystem;
