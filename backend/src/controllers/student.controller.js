const StudentModel = require('../models/student.model');

/**
 * Controller Quản lý sinh viên (CRUD)
 */
class StudentController {
  /**
   * Lấy danh sách sinh viên có phân trang, tìm kiếm, lọc theo lớp và sắp xếp
   * GET /api/students
   */
  static async getStudents(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        class_id,
        sortBy = 'id',
        order = 'DESC',
      } = req.query;

      const result = await StudentModel.findAll({
        page,
        limit,
        search,
        classId: class_id,
        sortBy,
        order,
      });

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách sinh viên thành công.',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết thông tin một sinh viên theo ID
   * GET /api/students/:id
   */
  static async getStudentById(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID sinh viên không hợp lệ.',
        });
      }

      const student = await StudentModel.findById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sinh viên có ID: ${id}`,
        });
      }

      // Bảo vệ dữ liệu riêng tư: Sinh viên không được xem điểm của sinh viên khác
      if (req.user && req.user.role === 'student' && student.user_id !== req.user.id) {
        student.grades = [];
      }

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin sinh viên thành công.',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm mới một sinh viên
   * POST /api/students (Chỉ Admin)
   */
  static async createStudent(req, res, next) {
    try {
      const {
        student_code,
        full_name,
        dob,
        gender,
        email,
        phone,
        address,
        class_id,
        user_id,
      } = req.body;

      // 1. Kiểm tra lớp học có tồn tại không
      const classExists = await StudentModel.checkClassExists(class_id);
      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: `Lớp học có ID: ${class_id} không tồn tại trong hệ thống.`,
        });
      }

      // 2. Kiểm tra trùng lặp student_code
      const existingCode = await StudentModel.findByCode(student_code);
      if (existingCode) {
        return res.status(409).json({
          success: false,
          message: `Mã sinh viên '${student_code}' đã tồn tại trong hệ thống.`,
        });
      }

      // 3. Kiểm tra trùng lặp email
      const existingEmail = await StudentModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: `Địa chỉ email '${email}' đã được sử dụng bởi sinh viên khác.`,
        });
      }

      // 4. Tạo sinh viên mới trong DB
      const newStudent = await StudentModel.create({
        studentCode: student_code,
        fullName: full_name,
        dob,
        gender,
        email,
        phone,
        address,
        classId: class_id,
        userId: user_id || null,
      });

      return res.status(201).json({
        success: true,
        message: 'Thêm mới sinh viên thành công!',
        data: newStudent,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật thông tin sinh viên
   * PUT /api/students/:id (Chỉ Admin)
   */
  static async updateStudent(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID sinh viên không hợp lệ.',
        });
      }

      // 1. Kiểm tra sinh viên có tồn tại không
      const currentStudent = await StudentModel.findById(id);
      if (!currentStudent) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sinh viên có ID: ${id}`,
        });
      }

      const {
        student_code,
        full_name,
        dob,
        gender,
        email,
        phone,
        address,
        class_id,
        user_id,
      } = req.body;

      // 2. Nếu cập nhật class_id, kiểm tra xem lớp mới có tồn tại không
      if (class_id && class_id !== currentStudent.class_id) {
        const classExists = await StudentModel.checkClassExists(class_id);
        if (!classExists) {
          return res.status(400).json({
            success: false,
            message: `Lớp học có ID: ${class_id} không tồn tại trong hệ thống.`,
          });
        }
      }

      // 3. Nếu cập nhật student_code, kiểm tra không được trùng với sinh viên khác
      if (student_code && student_code !== currentStudent.student_code) {
        const existingCode = await StudentModel.findByCode(student_code);
        if (existingCode && existingCode.id !== id) {
          return res.status(409).json({
            success: false,
            message: `Mã sinh viên '${student_code}' đã được sử dụng bởi sinh viên khác.`,
          });
        }
      }

      // 4. Nếu cập nhật email, kiểm tra không được trùng với sinh viên khác
      if (email && email !== currentStudent.email) {
        const existingEmail = await StudentModel.findByEmail(email);
        if (existingEmail && existingEmail.id !== id) {
          return res.status(409).json({
            success: false,
            message: `Địa chỉ email '${email}' đã được sử dụng bởi sinh viên khác.`,
          });
        }
      }

      // 5. Chuẩn bị dữ liệu cập nhật
      const updateData = {
        studentCode: student_code || currentStudent.student_code,
        fullName: full_name || currentStudent.full_name,
        dob: dob || currentStudent.dob,
        gender: gender || currentStudent.gender,
        email: email || currentStudent.email,
        phone: phone !== undefined ? phone : currentStudent.phone,
        address: address !== undefined ? address : currentStudent.address,
        classId: class_id || currentStudent.class_id,
        userId: user_id !== undefined ? user_id : currentStudent.user_id,
      };

      const updatedStudent = await StudentModel.update(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin sinh viên thành công!',
        data: updatedStudent,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa sinh viên
   * DELETE /api/students/:id (Chỉ Admin)
   */
  static async deleteStudent(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID sinh viên không hợp lệ.',
        });
      }

      // Kiểm tra sinh viên có tồn tại không
      const student = await StudentModel.findById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sinh viên có ID: ${id}`,
        });
      }

      await StudentModel.delete(id);

      return res.status(200).json({
        success: true,
        message: `Đã xóa sinh viên '${student.full_name}' (${student.student_code}) thành công.`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentController;
