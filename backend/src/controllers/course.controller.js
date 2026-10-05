const CourseModel = require('../models/course.model');

/**
 * Controller Quản lý Môn học / Học phần (CRUD)
 */
class CourseController {
  /**
   * Lấy danh sách môn học (phân trang, tìm theo mã/tên môn, sắp xếp)
   * GET /api/courses
   */
  static async getCourses(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'id',
        order = 'DESC',
      } = req.query;

      const result = await CourseModel.findAll({
        page,
        limit,
        search,
        sortBy,
        order,
      });

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách môn học thành công.',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết thông tin một môn học theo ID
   * GET /api/courses/:id
   */
  static async getCourseById(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID môn học không hợp lệ.',
        });
      }

      const course = await CourseModel.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy môn học có ID: ${id}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin môn học thành công.',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm mới môn học
   * POST /api/courses (Chỉ Admin)
   */
  static async createCourse(req, res, next) {
    try {
      const { course_code, course_name, credits } = req.body;

      // 1. Kiểm tra trùng lặp mã môn học (course_code)
      const existingCourse = await CourseModel.findByCode(course_code);
      if (existingCourse) {
        return res.status(409).json({
          success: false,
          message: `Mã môn học '${course_code}' đã tồn tại trong hệ thống. Vui lòng chọn mã khác.`,
        });
      }

      // 2. Tạo môn học mới
      const newCourse = await CourseModel.create({
        courseCode: course_code,
        courseName: course_name,
        credits,
      });

      return res.status(201).json({
        success: true,
        message: 'Thêm mới môn học thành công!',
        data: newCourse,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật thông tin môn học
   * PUT /api/courses/:id (Chỉ Admin)
   */
  static async updateCourse(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID môn học không hợp lệ.',
        });
      }

      // 1. Kiểm tra môn học có tồn tại không
      const currentCourse = await CourseModel.findById(id);
      if (!currentCourse) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy môn học có ID: ${id}`,
        });
      }

      const { course_code, course_name, credits } = req.body;

      // 2. Nếu đổi mã môn học, kiểm tra không được trùng với môn khác
      if (course_code && course_code !== currentCourse.course_code) {
        const existingCourse = await CourseModel.findByCode(course_code);
        if (existingCourse && existingCourse.id !== id) {
          return res.status(409).json({
            success: false,
            message: `Mã môn học '${course_code}' đã được sử dụng bởi môn học khác.`,
          });
        }
      }

      // 3. Tiến hành cập nhật
      const updatedCourse = await CourseModel.update(id, {
        courseCode: course_code || currentCourse.course_code,
        courseName: course_name || currentCourse.course_name,
        credits: credits !== undefined ? credits : currentCourse.credits,
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin môn học thành công!',
        data: updatedCourse,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa môn học
   * DELETE /api/courses/:id (Chỉ Admin)
   * Không cho xóa môn đã có điểm / sinh viên đăng ký, trả lỗi 409
   */
  static async deleteCourse(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID môn học không hợp lệ.',
        });
      }

      // 1. Kiểm tra môn học có tồn tại không
      const course = await CourseModel.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy môn học có ID: ${id}`,
        });
      }

      // 2. Kiểm tra xem môn học đã có sinh viên đăng ký / có điểm chưa
      const enrollmentCount = await CourseModel.countEnrollments(id);
      if (enrollmentCount > 0) {
        return res.status(409).json({
          success: false,
          message: `Không thể xóa môn học '${course.course_name}' (${course.course_code}) vì hiện đang có ${enrollmentCount} lượt sinh viên đăng ký / có điểm. Vui lòng xử lý dữ liệu điểm số trước khi xóa môn.`,
          enrollment_count: enrollmentCount,
        });
      }

      // 3. Tiến hành xóa nếu chưa có lượt đăng ký nào
      await CourseModel.delete(id);

      return res.status(200).json({
        success: true,
        message: `Đã xóa môn học '${course.course_name}' (${course.course_code}) thành công.`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseController;
