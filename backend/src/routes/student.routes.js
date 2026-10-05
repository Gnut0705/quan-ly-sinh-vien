const express = require('express');
const StudentController = require('../controllers/student.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const {
  validateCreateStudent,
  validateUpdateStudent,
} = require('../middlewares/validateStudent');

const router = express.Router();

/**
 * @route   GET /api/students
 * @desc    Lấy danh sách sinh viên (phân trang, tìm kiếm, lọc theo lớp, sắp xếp)
 * @access  Private (Yêu cầu đăng nhập: admin, teacher, student)
 */
router.get('/', verifyToken, StudentController.getStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Xem chi tiết thông tin và bảng điểm của 1 sinh viên
 * @access  Private (Yêu cầu đăng nhập: admin, teacher, student)
 */
router.get('/:id', verifyToken, StudentController.getStudentById);

/**
 * @route   GET /api/students/:id/grades
 * @desc    Bảng điểm chi tiết của một sinh viên kèm GPA
 * @access  Private (Mọi user; student chỉ xem được điểm của chính mình)
 */
const GradeController = require('../controllers/grade.controller');
router.get('/:id/grades', verifyToken, GradeController.getStudentGrades);

/**
 * @route   POST /api/students
 * @desc    Thêm mới một sinh viên
 * @access  Private (Chỉ dành riêng cho Admin)
 */
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin'),
  validateCreateStudent,
  StudentController.createStudent
);

/**
 * @route   PUT /api/students/:id
 * @desc    Cập nhật thông tin sinh viên
 * @access  Private (Chỉ dành riêng cho Admin)
 */
router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  validateUpdateStudent,
  StudentController.updateStudent
);

/**
 * @route   DELETE /api/students/:id
 * @desc    Xóa sinh viên khỏi hệ thống
 * @access  Private (Chỉ dành riêng cho Admin)
 */
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  StudentController.deleteStudent
);

module.exports = router;
