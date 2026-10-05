const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { validateRegister, validateLogin } = require('../middlewares/validateAuth');

const router = express.Router();

// Public routes
// POST /api/auth/register
router.post('/register', validateRegister, authController.register);

// POST /api/auth/login
router.post('/login', validateLogin, authController.login);

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
