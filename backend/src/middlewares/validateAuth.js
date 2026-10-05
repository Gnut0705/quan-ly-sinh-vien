/**
 * Regex kiểm tra định dạng email chuẩn RFC 5322 cơ bản
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Regex kiểm tra username (3 - 30 ký tự, chữ cái, số hoặc dấu gạch dưới)
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

const ALLOWED_ROLES = ['admin', 'teacher', 'student'];

/**
 * Middleware kiểm tra hợp lệ dữ liệu đăng ký (Register Validation)
 */
const validateRegister = (req, res, next) => {
  const { username, email, password, role } = req.body;
  const errors = [];

  // Validate username
  if (!username || typeof username !== 'string' || !username.trim()) {
    errors.push({ field: 'username', message: 'Tên đăng nhập (username) là bắt buộc.' });
  } else if (!USERNAME_REGEX.test(username.trim())) {
    errors.push({
      field: 'username',
      message: 'Username phải từ 3 đến 30 ký tự, chỉ chứa chữ cái, chữ số và dấu gạch dưới (_).',
    });
  }

  // Validate email
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Địa chỉ email là bắt buộc.' });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Địa chỉ email không đúng định dạng.' });
  } else if (email.trim().length > 100) {
    errors.push({ field: 'email', message: 'Email không được vượt quá 100 ký tự.' });
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Mật khẩu (password) là bắt buộc.' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.' });
  }

  // Validate role (nếu được truyền lên)
  if (role && !ALLOWED_ROLES.includes(role)) {
    errors.push({
      field: 'role',
      message: `Vai trò (role) không hợp lệ. Chỉ chấp nhận một trong các giá trị: ${ALLOWED_ROLES.join(', ')}.`,
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đăng ký không hợp lệ.',
      errors,
    });
  }

  // Chuẩn hóa dữ liệu sau khi kiểm tra
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Middleware kiểm tra hợp lệ dữ liệu đăng nhập (Login Validation)
 */
const validateLogin = (req, res, next) => {
  // Cho phép đăng nhập bằng username HOẶC email thông qua trường 'identifier' hoặc 'username'
  const identifier = req.body.identifier || req.body.username || req.body.email;
  const { password } = req.body;
  const errors = [];

  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    errors.push({
      field: 'identifier',
      message: 'Vui lòng cung cấp username hoặc email để đăng nhập.',
    });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Vui lòng nhập mật khẩu.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Thông tin đăng nhập chưa đầy đủ.',
      errors,
    });
  }

  req.body.identifier = identifier.trim();
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
