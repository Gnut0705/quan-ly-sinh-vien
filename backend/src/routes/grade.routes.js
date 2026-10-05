const express = require('express');
const GradeController = require('../controllers/grade.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const {
  validateCreateGrade,
  validateUpdateGrade,
} = require('../middlewares/validateGrade');

const router = express.Router();

/**
 * @route   GET /api/grades
 * @desc    Lấy danh sách điểm (lọc theo SV, môn, học kỳ; phân trang)
 * @access  Private (Mọi user; student chỉ xem được điểm của chính mình)
 */
router.get('/', verifyToken, GradeController.getGrades);

/**
 * @route   GET /api/grades/student/:id
 * @desc    Xem bảng điểm của một sinh viên kèm GPA
 * @access  Private (Mọi user; student chỉ xem được điểm của chính mình)
 */
router.get('/student/:id', verifyToken, GradeController.getStudentGrades);

/**
 * @route   POST /api/grades
 * @desc    Nhập điểm mới
 * @access  Private (Admin hoặc Teacher)
 */
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'teacher'),
  validateCreateGrade,
  GradeController.createGrade
);

/**
 * @route   PUT /api/grades/:id
 * @desc    Cập nhật điểm số
 * @access  Private (Admin hoặc Teacher)
 */
router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'teacher'),
  validateUpdateGrade,
  GradeController.updateGrade
);

/**
 * @route   DELETE /api/grades/:id
 * @desc    Xóa bản ghi điểm
 * @access  Private (Admin hoặc Teacher)
 */
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'teacher'),
  GradeController.deleteGrade
);

module.exports = router;
