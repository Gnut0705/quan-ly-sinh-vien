import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
        403 - Quyền Truy Cập Bị Từ Chối
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px auto' }}>
        Tài khoản của bạn không có đủ thẩm quyền để truy cập vào tài nguyên này. Nếu bạn nghĩ đây là sự nhầm lẫn, vui lòng liên hệ với Quản trị viên hệ thống.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        ⬅️ Quay Lại Bảng Điều Khiển
      </Link>
    </div>
  );
};

export default Unauthorized;
