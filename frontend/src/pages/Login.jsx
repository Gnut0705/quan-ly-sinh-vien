import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Nếu đã đăng nhập thì tự chuyển hướng tới Dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password) {
      setErrorMessage('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(identifier.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.message);
    }
  };

  // Nút điền nhanh tài khoản mẫu để thuận tiện kiểm thử
  const handleQuickFill = (user, pass) => {
    setIdentifier(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎓</div>
          <h1 className="login-title">Đăng Nhập Hệ Thống</h1>
          <p className="login-subtitle">Cổng thông tin Quản lý Sinh viên</p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">
              Tên đăng nhập hoặc Email
            </label>
            <input
              id="identifier"
              type="text"
              className="form-input"
              placeholder="VD: admin hoặc admin@qlsv.edu.vn"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                }}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                <span>Đang xác thực...</span>
              </>
            ) : (
              'Đăng Nhập'
            )}
          </button>
        </form>

        {/* Khối điền nhanh tài khoản kiểm thử */}
        <div className="quick-accounts-box">
          <div className="quick-accounts-title">⚡ Tài khoản kiểm thử nhanh</div>
          <div className="quick-accounts-buttons">
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickFill('admin', 'admin123')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickFill('teacher_lan', 'teacher123')}
            >
              🧑‍🏫 Giảng viên
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickFill('sv20220001', 'student123')}
            >
              👨‍🎓 Sinh viên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
