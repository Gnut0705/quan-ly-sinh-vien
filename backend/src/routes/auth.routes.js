const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { validateRegister, validateLogin } = require('../middlewares/validateAuth');

const rateLimit = require('express-rate-limit');

// Giới hạn số lần thử đăng nhập: Tối đa 5 lần trong 15 phút từ 1 địa chỉ IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 yêu cầu
  standardHeaders: true, // Trả về thông tin giới hạn trong header `RateLimit-*`
  legacyHeaders: false, // Vô hiệu hóa headers `X-RateLimit-*`
  message: {
    success: false,
    message: 'Bạn đã thử đăng nhập quá nhiều lần (tối đa 5 lần). Vui lòng thử lại sau 15 phút.',
  },
});

const router = express.Router();

// Public routes
// POST /api/auth/register
router.post('/register', validateRegister, authController.register);

// POST /api/auth/login (Giới hạn rate-limit chống Brute Force)
router.post('/login', loginLimiter, validateLogin, authController.login);

// Protected routes (yêu cầu đăng nhập - JWT)
// GET /api/auth/me
router.get('/me', verifyToken, authController.getMe);

// Demo route kiểm tra phân quyền (chỉ cho phép admin và teacher)
// GET /api/auth/admin-teacher-only
router.get(
  '/admin-teacher-only',
  verifyToken,
  authorizeRoles('admin', 'teacher'),
  (req, res) => {
    res.json({
      success: true,
      message: `Chào mừng ${req.user.role}: ${req.user.username}! Bạn có quyền truy cập khu vực này.`,
      user: req.user,
    });
  }
);

module.exports = router;
