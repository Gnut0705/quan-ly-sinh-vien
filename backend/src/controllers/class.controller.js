const ClassModel = require('../models/class.model');

/**
 * Controller Quản lý Lớp học (CRUD)
 */
class ClassController {
  /**
   * Lấy danh sách lớp học (phân trang, tìm theo tên, lọc theo khoa/niên khóa, kèm số SV)
   * GET /api/classes
   */
  static async getClasses(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        faculty = '',
        school_year = '',
        sortBy = 'id',
        order = 'DESC',
      } = req.query;

      const result = await ClassModel.findAll({
        page,
        limit,
        search,
        faculty,
        schoolYear: school_year,
        sortBy,
        order,
      });

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách lớp học thành công.',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thông tin chi tiết một lớp học kèm số lượng sinh viên
   * GET /api/classes/:id
   */
  static async getClassById(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học không hợp lệ.',
        });
      }

      const classItem = await ClassModel.findById(id);
      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy lớp học có ID: ${id}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Lấy chi tiết lớp học thành công.',
        data: classItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách sinh viên thuộc về một lớp học
   * GET /api/classes/:id/students
   */
  static async getClassStudents(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học không hợp lệ.',
        });
      }

      const classItem = await ClassModel.findById(id);
      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy lớp học có ID: ${id}`,
        });
      }

      const students = await ClassModel.findStudentsByClassId(id);

      return res.status(200).json({
        success: true,
        message: `Lấy danh sách sinh viên lớp '${classItem.class_name}' thành công.`,
        class: {
          id: classItem.id,
          class_name: classItem.class_name,
          faculty: classItem.faculty,
          school_year: classItem.school_year,
          student_count: classItem.student_count,
        },
        data: students,
        total: students.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo lớp học mới
   * POST /api/classes (Chỉ Admin)
   */
  static async createClass(req, res, next) {
    try {
      const { class_name, faculty, school_year } = req.body;

      // 1. Kiểm tra trùng lặp tên lớp
      const existingClass = await ClassModel.findByName(class_name);
      if (existingClass) {
        return res.status(409).json({
          success: false,
          message: `Tên lớp '${class_name}' đã tồn tại trong hệ thống. Vui lòng chọn tên khác.`,
        });
      }

      // 2. Thêm mới lớp học
      const newClass = await ClassModel.create({
        className: class_name,
        faculty,
        schoolYear: school_year,
      });

      return res.status(201).json({
        success: true,
        message: 'Thêm mới lớp học thành công!',
        data: newClass,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật thông tin lớp học
   * PUT /api/classes/:id (Chỉ Admin)
   */
  static async updateClass(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học không hợp lệ.',
        });
      }

      // 1. Kiểm tra lớp học có tồn tại không
      const currentClass = await ClassModel.findById(id);
      if (!currentClass) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy lớp học có ID: ${id}`,
        });
      }

      const { class_name, faculty, school_year } = req.body;

      // 2. Nếu thay đổi tên lớp, kiểm tra không được trùng với lớp khác
      if (class_name && class_name !== currentClass.class_name) {
        const existingClass = await ClassModel.findByName(class_name);
        if (existingClass && existingClass.id !== id) {
          return res.status(409).json({
            success: false,
            message: `Tên lớp '${class_name}' đã được sử dụng bởi lớp khác.`,
          });
        }
      }

      // 3. Thực hiện cập nhật
      const updatedClass = await ClassModel.update(id, {
        className: class_name || currentClass.class_name,
        faculty: faculty || currentClass.faculty,
        schoolYear: school_year || currentClass.school_year,
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin lớp học thành công!',
        data: updatedClass,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa lớp học
   * DELETE /api/classes/:id (Chỉ Admin)
   * Không cho xóa lớp còn sinh viên, trả lỗi 409
   */
  static async deleteClass(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học không hợp lệ.',
        });
      }

      // 1. Kiểm tra lớp học có tồn tại không
      const classItem = await ClassModel.findById(id);
      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy lớp học có ID: ${id}`,
        });
      }

      // 2. Kiểm tra lớp còn sinh viên không
      const studentCount = await ClassModel.countStudents(id);
      if (studentCount > 0) {
        return res.status(409).json({
          success: false,
          message: `Không thể xóa lớp '${classItem.class_name}' vì hiện đang có ${studentCount} sinh viên trực thuộc. Vui lòng chuyển hoặc xóa các sinh viên này trước khi xóa lớp.`,
          student_count: studentCount,
        });
      }

      // 3. Tiến hành xóa nếu lớp không còn sinh viên nào
      await ClassModel.delete(id);

      return res.status(200).json({
        success: true,
        message: `Đã xóa lớp học '${classItem.class_name}' thành công.`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ClassController;
