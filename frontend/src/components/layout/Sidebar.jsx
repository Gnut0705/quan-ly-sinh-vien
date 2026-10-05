import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, role } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">🎓</div>
        <div>
          <div className="sidebar-title">QLSV Portal</div>
          <div className="sidebar-subtitle">Hệ Thống Quản Lý</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span>Bảng điều khiển</span>
        </NavLink>

        <NavLink
          to="/students"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">👨‍🎓</span>
          <span>Quản lý Sinh viên</span>
        </NavLink>

        <NavLink
          to="/classes"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🏫</span>
          <span>Quản lý Lớp học</span>
        </NavLink>
      </nav>

      {/* User Information Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.username}</div>
            <span className={`user-role-badge badge-${role}`}>
              {role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
