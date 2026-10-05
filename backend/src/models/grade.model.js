const { pool } = require('../config/db');

const ALLOWED_SORT_COLUMNS = {
  id: 'e.id',
  semester: 'e.semester',
  score: 'e.score',
  student_code: 's.student_code',
  full_name: 's.full_name',
  course_code: 'c.course_code',
  course_name: 'c.course_name',
  created_at: 'e.created_at',
};

class GradeModel {
  /**
   * Lấy danh sách điểm có phân trang, lọc theo sinh viên, môn học, học kỳ
   */
  static async findAll({
    page = 1,
    limit = 10,
    studentId = null,
    courseId = null,
    semester = '',
    sortBy = 'id',
    order = 'DESC',
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const queryParams = [];

    // Lọc theo student_id
    if (studentId) {
      whereConditions.push('e.student_id = ?');
      queryParams.push(Number(studentId));
    }

    // Lọc theo course_id
    if (courseId) {
      whereConditions.push('e.course_id = ?');
      queryParams.push(Number(courseId));
    }

    // Lọc theo học kỳ
    if (semester && semester.trim() !== '') {
      whereConditions.push('e.semester = ?');
      queryParams.push(semester.trim());
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 1. Đếm tổng số bản ghi
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM enrollments e
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // 2. Sắp xếp an toàn
    const sortColumn = ALLOWED_SORT_COLUMNS[sortBy] || 'e.id';
    const sortOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 3. Truy vấn danh sách điểm kèm thông tin sinh viên và môn học
    const dataQuery = `
      SELECT 
        e.id,
        e.student_id,
        s.student_code,
        s.full_name AS student_name,
        cl.class_name,
        e.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        e.semester,
        e.score,
        e.created_at,
        e.updated_at
      FROM enrollments e
      INNER JOIN students s ON s.id = e.student_id
      INNER JOIN classes cl ON cl.id = s.class_id
      INNER JOIN courses c ON c.id = e.course_id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataQuery, [...queryParams, limitNum, offset]);

    return {
      items: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Lấy chi tiết một bản ghi điểm theo ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        e.id,
        e.student_id,
        s.student_code,
        s.full_name AS student_name,
        cl.class_name,
        e.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        e.semester,
        e.score,
        e.created_at,
        e.updated_at
      FROM enrollments e
      INNER JOIN students s ON s.id = e.student_id
      INNER JOIN classes cl ON cl.id = s.class_id
      INNER JOIN courses c ON c.id = e.course_id
      WHERE e.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Lấy toàn bộ bảng điểm của 1 sinh viên (phục vụ tính GPA và hiển thị hồ sơ)
   */
  static async findByStudentId(studentId) {
    const query = `
      SELECT 
        e.id AS enrollment_id,
        e.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        e.semester,
        e.score,
        e.created_at,
        e.updated_at
      FROM enrollments e
      INNER JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = ?
      ORDER BY e.semester DESC, c.course_code ASC
    `;
    const [rows] = await pool.execute(query, [studentId]);
    return rows;
  }

  /**
   * Kiểm tra xem cặp (student_id, course_id, semester) đã tồn tại chưa
   */
  static async findByUniqueKey(studentId, courseId, semester) {
    const query = `
      SELECT id, student_id, course_id, semester, score
      FROM enrollments
      WHERE student_id = ? AND course_id = ? AND semester = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [studentId, courseId, semester]);
    return rows[0] || null;
  }

  /**
   * Kiểm tra sinh viên có tồn tại trong bảng students không
   */
  static async checkStudentExists(studentId) {
    const query = `
      SELECT id, student_code, full_name, user_id, class_id 
      FROM students 
      WHERE id = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [studentId]);
    return rows[0] || null;
  }

  /**
   * Kiểm tra môn học có tồn tại trong bảng courses không
   */
  static async checkCourseExists(courseId) {
    const query = `SELECT id, course_code, course_name, credits FROM courses WHERE id = ? LIMIT 1`;
    const [rows] = await pool.execute(query, [courseId]);
    return rows[0] || null;
  }

  /**
   * Nhập điểm mới
   */
  static async create({ studentId, courseId, semester, score }) {
    const query = `
      INSERT INTO enrollments (student_id, course_id, semester, score)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      studentId,
      courseId,
      semester,
      score !== undefined && score !== null && score !== '' ? Number(score) : null,
    ]);

    return this.findById(result.insertId);
  }

  /**
   * Cập nhật điểm số
   */
  static async update(id, { studentId, courseId, semester, score }) {
    const query = `
      UPDATE enrollments
      SET student_id = ?, course_id = ?, semester = ?, score = ?
      WHERE id = ?
    `;
    await pool.execute(query, [
      studentId,
      courseId,
      semester,
      score !== undefined && score !== null && score !== '' ? Number(score) : null,
      id,
    ]);

    return this.findById(id);
  }

  /**
   * Xóa bản ghi điểm
   */
  static async delete(id) {
    const query = `DELETE FROM enrollments WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = GradeModel;
