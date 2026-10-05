const express = require('express');
const CourseController = require('../controllers/course.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const {
  validateCreateCourse,
  validateUpdateCourse,
} = require('../middlewares/validateCourse');

const router = express.Router();

/**
 * @route   GET /api/courses
 * @desc    Lấy danh sách môn học (phân trang, tìm theo mã/tên môn, sắp xếp)
 * @access  Private (Mọi user đã đăng nhập)
 */
router.get('/', verifyToken, CourseController.getCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Xem chi tiết thông tin một môn học
 * @access  Private (Mọi user đã đăng nhập)
 */
router.get('/:id', verifyToken, CourseController.getCourseById);

/**
 * @route   POST /api/courses
 * @desc    Thêm mới môn học
 * @access  Private (Chỉ dành riêng cho Admin)
 */
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin'),
  validateCreateCourse,
  CourseController.createCourse
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Cập nhật thông tin môn học
 * @access  Private (Chỉ dành riêng cho Admin)
 */
router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  validateUpdateCourse,
  CourseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Xóa môn học (chặn nếu đã có sinh viên đăng ký/có điểm - trả 409)
 * @access  Private (Chỉ dành riêng cho Admin)
 */
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  CourseController.deleteCourse
);

module.exports = router;
