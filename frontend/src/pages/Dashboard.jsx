import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/students?limit=1');
        if (res.data?.success) {
          setTotalStudents(res.data.pagination.total);
        }
      } catch (error) {
        console.error('Không thể lấy thống kê:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
              Xin chào, {user?.username}! 👋
            </h2>
            <p style={{ opacity: 0.85, fontSize: '14px', maxWidth: '600px' }}>
              Chào mừng bạn đến với Cổng quản lý sinh viên. Hệ thống hỗ trợ tra cứu hồ sơ, phân lớp và theo dõi bảng điểm học phần theo từng học kỳ.
            </p>
          </div>
          <div>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'inline-block',
              }}
            >
              Vai trò hiện tại: {role?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon indigo">👨‍🎓</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : totalStudents}</span>
            <span className="stat-label">Tổng sinh viên</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">🏫</div>
          <div className="stat-info">
            <span className="stat-value">4</span>
            <span className="stat-label">Lớp sinh hoạt</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">📚</div>
          <div className="stat-info">
            <span className="stat-value">6</span>
            <span className="stat-label">Môn học đào tạo</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rose">🛡️</div>
          <div className="stat-info">
            <span className="stat-value">{role === 'admin' ? 'Toàn quyền' : 'Xem & Tra cứu'}</span>
            <span className="stat-label">Quyền hạn tài khoản</span>
          </div>
        </div>
      </div>

      {/* Quick Action Card */}
      <div className="card">
        <h3 className="card-title">Truy Cập Nhanh</h3>
        <p className="card-subtitle">Các chức năng quản lý chính của hệ thống</p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/students" className="btn btn-primary">
            👨‍🎓 Xem Danh Sách Sinh Viên
          </Link>
          {role === 'admin' && (
            <Link to="/students" className="btn btn-secondary">
              ➕ Thêm Sinh Viên Mới
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
