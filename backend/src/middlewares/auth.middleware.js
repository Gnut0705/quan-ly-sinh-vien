const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

/**
 * Middleware xác thực JSON Web Token (JWT)
 * Kiểm tra header Authorization: Bearer <token>
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập hoặc thiếu Bearer Token hợp lệ.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực.',
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('Biến môi trường JWT_SECRET chưa được cấu hình.');
    }

    // Giải mã và kiểm tra token
    const decoded = jwt.verify(token, jwtSecret);

    // Xác thực người dùng vẫn tồn tại trong database
    const user = await UserModel.findByIdWithProfile(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản liên kết với token này không còn tồn tại trên hệ thống.',
      });
    }

    // Đính kèm thông tin người dùng vào request để các middleware/controller tiếp theo sử dụng
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      studentProfile: user.studentProfile || null,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token xác thực không hợp lệ.',
        code: 'INVALID_TOKEN',
      });
    }

    next(error);
  }
};

/**
 * Middleware phân quyền theo vai trò (Role-based Authorization)
 * @param  {...string} roles Danh sách các vai trò được phép truy cập (vd: 'admin', 'teacher')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu xác thực tài khoản trước khi kiểm tra quyền hạn.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: [${roles.join(', ')}]. Quyền hiện tại của bạn: '${req.user.role}'.`,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
