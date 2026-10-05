import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component bảo vệ các tuyến đường (Protected Route)
 * @param {Array<string>} allowedRoles Danh sách role được phép truy cập (vd: ['admin', 'teacher'])
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu phiên làm việc...</p>
      </div>
    );
  }

  // Chưa đăng nhập -> Chuyển hướng về trang Login và lưu lại URL đang muốn vào
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng không đủ quyền hạn role -> Chuyển sang trang 403 Unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
