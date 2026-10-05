const express = require('express');
const ClassController = require('../controllers/class.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const {
  validateCreateClass,
  validateUpdateClass,
} = require('../middlewares/validateClass');

const router = express.Router();

/**
 * @route   GET /api/classes
 * @desc    Lấy danh sách lớp học (phân trang, tìm theo tên, lọc khoa/niên khóa, kèm số SV)
 * @access  Private (Mọi user đã đăng nhập)
 */
router.get('/', verifyToken, ClassController.getClasses);

/**
 * @route   GET /api/classes/:id
 * @desc    Xem chi tiết lớp học (kèm số lượng sinh viên)
 * @access  Private (Mọi user đã đăng nhập)
 */
router.get('/:id', verifyToken, ClassController.getClassById);

/**
 * @route   GET /api/classes/:id/students
 * @desc    Lấy danh sách sinh viên thuộc về một lớp
 * @access  Private (Mọi user đã đăng nhập)
 */
router.get('/:id/students', verifyToken, ClassController.getClassStudents);

/**
 * @route   POST /api/classes
 * @desc    Thêm mới lớp học
 * @access  Private (Chỉ dành riêng cho Admin)
 */
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin'),
  validateCreateClass,
  ClassController.createClass
);

/**
 * @route   PUT /api/classes/:id
 * @desc    Cập nhật thông tin lớp học
 * @access  Private (Chỉ dành riêng cho Admin)
 */
router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  validateUpdateClass,
  ClassController.updateClass
);

/**
 * @route   DELETE /api/classes/:id
 * @desc    Xóa lớp học (chặn nếu lớp còn sinh viên - trả 409)
 * @access  Private (Chỉ dành riêng cho Admin)
 */
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  ClassController.deleteClass
);

module.exports = router;
