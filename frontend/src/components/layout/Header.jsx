import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-title-wrap">
        <h1 className="header-page-title">Hệ Thống Quản Lý Sinh Viên</h1>
      </div>

      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Xin chào, <strong>{user?.username}</strong>
          </span>
          <span className={`badge badge-${role}`}>
            {role?.toUpperCase()}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          title="Đăng xuất khỏi hệ thống"
        >
          🚪 Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header;
