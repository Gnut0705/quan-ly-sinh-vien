const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const SALT_ROUNDS = 10;

/**
 * Helper tạo JSON Web Token (JWT)
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'default_jwt_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
};

/**
 * Controller Đăng ký tài khoản mới
 * Endpoint: POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // 1. Kiểm tra xem username đã tồn tại chưa
    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Tên đăng nhập (username) đã được sử dụng. Vui lòng chọn tên khác.',
      });
    }

    // 2. Kiểm tra xem email đã tồn tại chưa
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Địa chỉ email đã được đăng ký trong hệ thống.',
      });
    }

    // 3. Hash mật khẩu bằng bcrypt với 10 salt rounds
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Lưu người dùng vào database (vai trò mặc định: student)
    const newUser = await UserModel.createUser({
      username,
      email,
      passwordHash,
      role: role || 'student',
    });

    // 5. Cấp Access Token ngay sau khi đăng ký thành công
    const token = generateToken({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller Đăng nhập hệ thống
 * Endpoint: POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // 1. Tìm người dùng theo username HOẶC email
    const user = await UserModel.findByIdentifier(identifier);
    if (!user) {
      // Trả về thông điệp chung tránh kỹ thuật User Enumeration Attack
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập / Email hoặc mật khẩu không chính xác.',
      });
    }

    // 2. So sánh mật khẩu bằng bcrypt.compare
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập / Email hoặc mật khẩu không chính xác.',
      });
    }

    // 3. Tạo JWT Access Token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller Lấy thông tin tài khoản hiện tại
 * Endpoint: GET /api/auth/me
 * Yêu cầu: Đã qua middleware verifyToken
 */
const getMe = async (req, res, next) => {
  try {
    // req.user được gán từ middleware verifyToken
    const user = await UserModel.findByIdWithProfile(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công.',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
