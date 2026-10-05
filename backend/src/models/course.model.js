const { pool } = require('../config/db');

const ALLOWED_SORT_COLUMNS = {
  id: 'c.id',
  course_code: 'c.course_code',
  course_name: 'c.course_name',
  credits: 'c.credits',
  created_at: 'c.created_at',
  enrollment_count: 'enrollment_count',
};

class CourseModel {
  /**
   * Lấy danh sách môn học (phân trang, tìm kiếm mã/tên môn, kèm số lượt đăng ký)
   */
  static async findAll({
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'id',
    order = 'DESC',
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const queryParams = [];

    // Tìm kiếm theo mã học phần hoặc tên môn học
    if (search && search.trim() !== '') {
      whereConditions.push('(c.course_code LIKE ? OR c.course_name LIKE ?)');
      const searchPattern = `%${search.trim()}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 1. Đếm tổng số môn học thỏa mãn điều kiện
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM courses c
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // 2. Xác định cột và chiều sắp xếp an toàn
    const sortColumn = ALLOWED_SORT_COLUMNS[sortBy] || 'c.id';
    const sortOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 3. Lấy dữ liệu môn học kèm số lượng lượt sinh viên đăng ký
    const dataQuery = `
      SELECT 
        c.id,
        c.course_code,
        c.course_name,
        c.credits,
        c.created_at,
        COUNT(e.id) AS enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
      ${whereClause}
      GROUP BY c.id
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
   * Lấy chi tiết thông tin một môn học theo ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        c.id,
        c.course_code,
        c.course_name,
        c.credits,
        c.created_at,
        COUNT(e.id) AS enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Tìm môn học theo mã học phần (chống trùng lặp UNIQUE)
   */
  static async findByCode(courseCode) {
    const query = `
      SELECT id, course_code, course_name, credits, created_at
      FROM courses
      WHERE course_code = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [courseCode]);
    return rows[0] || null;
  }

  /**
   * Đếm số lượt sinh viên đã đăng ký/có điểm môn học này (dùng kiểm tra trước khi xóa)
   */
  static async countEnrollments(courseId) {
    const query = `SELECT COUNT(*) AS total FROM enrollments WHERE course_id = ?`;
    const [rows] = await pool.execute(query, [courseId]);
    return rows[0].total;
  }

  /**
   * Tạo môn học mới
   */
  static async create({ courseCode, courseName, credits }) {
    const query = `
      INSERT INTO courses (course_code, course_name, credits)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(query, [courseCode, courseName, credits]);
    return this.findById(result.insertId);
  }

  /**
   * Cập nhật thông tin môn học
   */
  static async update(id, { courseCode, courseName, credits }) {
    const query = `
      UPDATE courses
      SET course_code = ?, course_name = ?, credits = ?
      WHERE id = ?
    `;
    await pool.execute(query, [courseCode, courseName, credits, id]);
    return this.findById(id);
  }

  /**
   * Xóa môn học
   */
  static async delete(id) {
    const query = `DELETE FROM courses WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = CourseModel;
