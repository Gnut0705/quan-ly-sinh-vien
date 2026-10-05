const GradeModel = require('../models/grade.model');
const { pool } = require('../config/db');

/**
 * Helper quy đổi điểm thang 10 sang thang 4 và điểm chữ
 */
const convertTo4Scale = (score10) => {
  if (score10 === null || score10 === undefined) return null;
  const s = Number(score10);
  if (s >= 8.5) return { grade4: 4.0, letter: 'A' };
  if (s >= 7.0) return { grade4: 3.0, letter: 'B' };
  if (s >= 5.5) return { grade4: 2.0, letter: 'C' };
  if (s >= 4.0) return { grade4: 1.0, letter: 'D' };
  return { grade4: 0.0, letter: 'F' };
};

/**
 * Helper tính xếp loại học lực theo GPA thang 10
 */
const getClassification = (gpa10) => {
  if (gpa10 === null || gpa10 === undefined) return 'Chưa xếp loại';
  const gpa = Number(gpa10);
  if (gpa >= 9.0) return 'Xuất sắc';
  if (gpa >= 8.0) return 'Giỏi';
  if (gpa >= 6.5) return 'Khá';
  if (gpa >= 5.0) return 'Trung bình';
  return 'Yếu';
};

/**
 * Controller Quản lý Điểm số / Học phần (CRUD)
 */
class GradeController {
  /**
   * Lấy danh sách điểm có phân trang, lọc theo sinh viên, môn học, học kỳ
   * GET /api/grades
   * Lưu ý: Role student chỉ xem được điểm của chính mình
   */
  static async getGrades(req, res, next) {
    try {
      let {
        page = 1,
        limit = 10,
        student_id,
        course_id,
        semester,
        sortBy = 'id',
        order = 'DESC',
      } = req.query;

      // Bảo vệ: Nếu role là student, bắt buộc chỉ được xem điểm của chính mình
      if (req.user.role === 'student') {
        const [studentRows] = await pool.execute(
          'SELECT id FROM students WHERE user_id = ? LIMIT 1',
          [req.user.id]
        );

        if (!studentRows[0]) {
          return res.status(200).json({
            success: true,
            message: 'Tài khoản chưa được liên kết với hồ sơ sinh viên.',
            data: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
          });
        }

        student_id = studentRows[0].id;
      }

      const result = await GradeModel.findAll({
        page,
        limit,
        studentId: student_id,
        courseId: course_id,
        semester,
        sortBy,
        order,
      });

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách điểm thành công.',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy bảng điểm đầy đủ của một sinh viên kèm tính điểm trung bình tích lũy (GPA)
   * GET /api/students/:id/grades
   * Lưu ý: Role student chỉ xem được điểm của chính mình
   */
  static async getStudentGrades(req, res, next) {
    try {
      const studentId = Number(req.params.id);
      if (isNaN(studentId) || studentId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID sinh viên không hợp lệ.',
        });
      }

      // 1. Kiểm tra sinh viên có tồn tại không
      const student = await GradeModel.checkStudentExists(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sinh viên có ID: ${studentId}`,
        });
      }

      // 2. Phân quyền: Role student chỉ được xem điểm của chính mình
      if (req.user.role === 'student') {
        const isOwner = student.user_id === req.user.id || req.user.studentProfile?.id === studentId;
        if (!isOwner) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền xem điểm của sinh viên khác. Role student chỉ được phép xem điểm của chính mình.',
          });
        }
      }

      // 3. Lấy toàn bộ bảng điểm của sinh viên
      const grades = await GradeModel.findByStudentId(studentId);

      // 4. Tính toán GPA thang 10, GPA thang 4 và tổng số tín chỉ tích lũy
      let totalWeightedScore10 = 0;
      let totalWeightedScore4 = 0;
      let totalGradedCredits = 0;
      let totalRegisteredCredits = 0;
      let passedCredits = 0;

      const formattedGrades = grades.map((g) => {
        totalRegisteredCredits += g.credits;
        const converted = convertTo4Scale(g.score);

        if (g.score !== null) {
          const scoreNum = Number(g.score);
          totalWeightedScore10 += scoreNum * g.credits;
          totalWeightedScore4 += converted.grade4 * g.credits;
          totalGradedCredits += g.credits;

          if (scoreNum >= 4.0) {
            passedCredits += g.credits;
          }
        }

        return {
          enrollment_id: g.enrollment_id,
          course_id: g.course_id,
          course_code: g.course_code,
          course_name: g.course_name,
          credits: g.credits,
          semester: g.semester,
          score: g.score,
          grade_point_4: converted ? converted.grade4 : null,
          letter_grade: converted ? converted.letter : null,
        };
      });

      const gpa10 = totalGradedCredits > 0
        ? Number((totalWeightedScore10 / totalGradedCredits).toFixed(2))
        : null;

      const gpa4 = totalGradedCredits > 0
        ? Number((totalWeightedScore4 / totalGradedCredits).toFixed(2))
        : null;

      const classification = getClassification(gpa10);

      return res.status(200).json({
        success: true,
        message: `Lấy bảng điểm của sinh viên '${student.full_name}' thành công.`,
        student: {
          id: student.id,
          student_code: student.student_code,
          full_name: student.full_name,
          class_id: student.class_id,
        },
        summary: {
          gpa10,
          gpa4,
          totalRegisteredCredits,
          totalGradedCredits,
          passedCredits,
          classification,
        },
        transcript: formattedGrades,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Nhập điểm mới cho sinh viên
   * POST /api/grades (Admin hoặc Teacher)
   */
  static async createGrade(req, res, next) {
    try {
      const { student_id, course_id, semester, score } = req.body;

      // 1. Kiểm tra student_id tồn tại
      const student = await GradeModel.checkStudentExists(student_id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Sinh viên có ID: ${student_id} không tồn tại trong hệ thống.`,
        });
      }

      // 2. Kiểm tra course_id tồn tại
      const course = await GradeModel.checkCourseExists(course_id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Môn học có ID: ${course_id} không tồn tại trong hệ thống.`,
        });
      }

      // 3. Kiểm tra xem cặp (student_id, course_id, semester) đã tồn tại chưa
      const existing = await GradeModel.findByUniqueKey(student_id, course_id, semester);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Sinh viên '${student.full_name}' đã có bản ghi môn '${course.course_name}' trong học kỳ '${semester}'. Vui lòng dùng chức năng cập nhật (PUT).`,
        });
      }

      // 4. Lưu bản ghi điểm
      const newGrade = await GradeModel.create({
        studentId: student_id,
        courseId: course_id,
        semester,
        score,
      });

      return res.status(201).json({
        success: true,
        message: 'Nhập điểm học phần thành công!',
        data: newGrade,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật điểm số
   * PUT /api/grades/:id (Admin hoặc Teacher)
   */
  static async updateGrade(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID bản ghi điểm không hợp lệ.',
        });
      }

      // 1. Kiểm tra bản ghi điểm có tồn tại không
      const currentGrade = await GradeModel.findById(id);
      if (!currentGrade) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy bản ghi điểm có ID: ${id}`,
        });
      }

      const { student_id, course_id, semester, score } = req.body;

      const targetStudentId = student_id !== undefined ? student_id : currentGrade.student_id;
      const targetCourseId = course_id !== undefined ? course_id : currentGrade.course_id;
      const targetSemester = semester !== undefined ? semester : currentGrade.semester;

      // 2. Nếu đổi student_id, kiểm tra SV có tồn tại không
      if (student_id && student_id !== currentGrade.student_id) {
        const student = await GradeModel.checkStudentExists(student_id);
        if (!student) {
          return res.status(404).json({
            success: false,
            message: `Sinh viên có ID: ${student_id} không tồn tại.`,
          });
        }
      }

      // 3. Nếu đổi course_id, kiểm tra môn học có tồn tại không
      if (course_id && course_id !== currentGrade.course_id) {
        const course = await GradeModel.checkCourseExists(course_id);
        if (!course) {
          return res.status(404).json({
            success: false,
            message: `Môn học có ID: ${course_id} không tồn tại.`,
          });
        }
      }

      // 4. Nếu thay đổi cặp (student, course, semester), kiểm tra không trùng bản ghi khác
      if (
        targetStudentId !== currentGrade.student_id ||
        targetCourseId !== currentGrade.course_id ||
        targetSemester !== currentGrade.semester
      ) {
        const existing = await GradeModel.findByUniqueKey(targetStudentId, targetCourseId, targetSemester);
        if (existing && existing.id !== id) {
          return res.status(409).json({
            success: false,
            message: `Sinh viên đã có bản ghi điểm môn này trong học kỳ '${targetSemester}'.`,
          });
        }
      }

      // 5. Cập nhật
      const updatedGrade = await GradeModel.update(id, {
        studentId: targetStudentId,
        courseId: targetCourseId,
        semester: targetSemester,
        score: score !== undefined ? score : currentGrade.score,
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật điểm số thành công!',
        data: updatedGrade,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa bản ghi điểm
   * DELETE /api/grades/:id (Admin hoặc Teacher)
   */
  static async deleteGrade(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID bản ghi điểm không hợp lệ.',
        });
      }

      const currentGrade = await GradeModel.findById(id);
      if (!currentGrade) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy bản ghi điểm có ID: ${id}`,
        });
      }

      await GradeModel.delete(id);

      return res.status(200).json({
        success: true,
        message: `Đã xóa bản ghi điểm môn '${currentGrade.course_name}' của sinh viên '${currentGrade.student_name}' thành công.`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GradeController;
