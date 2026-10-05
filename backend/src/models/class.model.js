const { pool } = require('../config/db');

const ALLOWED_SORT_COLUMNS = {
  id: 'c.id',
  class_name: 'c.class_name',
  faculty: 'c.faculty',
  school_year: 'c.school_year',
  created_at: 'c.created_at',
  student_count: 'student_count',
};

class ClassModel {
  /**
   * Lấy danh sách lớp học (phân trang, tìm theo tên lớp, lọc theo khoa/niên khóa, kèm số SV)
   */
  static async findAll({
    page = 1,
    limit = 10,
    search = '',
    faculty = '',
    schoolYear = '',
    sortBy = 'id',
    order = 'DESC',
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const queryParams = [];

    // Tìm kiếm theo tên lớp (class_name)
    if (search && search.trim() !== '') {
      whereConditions.push('c.class_name LIKE ?');
      queryParams.push(`%${search.trim()}%`);
    }

    // Lọc theo khoa (faculty)
    if (faculty && faculty.trim() !== '') {
      whereConditions.push('c.faculty = ?');
      queryParams.push(faculty.trim());
    }

    // Lọc theo niên khóa (school_year)
    if (schoolYear && schoolYear.trim() !== '') {
      whereConditions.push('c.school_year = ?');
      queryParams.push(schoolYear.trim());
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 1. Đếm tổng số lớp học thỏa mãn điều kiện
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM classes c
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // 2. Xác định cột và chiều sắp xếp an toàn
    const sortColumn = ALLOWED_SORT_COLUMNS[sortBy] || 'c.id';
    const sortOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 3. Lấy dữ liệu lớp học kèm số lượng sinh viên (COUNT student)
    const dataQuery = `
      SELECT 
        c.id,
        c.class_name,
        c.faculty,
        c.school_year,
        c.created_at,
        COUNT(s.id) AS student_count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id
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
   * Lấy chi tiết thông tin lớp học theo ID kèm số lượng sinh viên
   */
  static async findById(id) {
    const query = `
      SELECT 
        c.id,
        c.class_name,
        c.faculty,
        c.school_year,
        c.created_at,
        COUNT(s.id) AS student_count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Tìm lớp học theo tên lớp (chống trùng lặp UNIQUE)
   */
  static async findByName(className) {
    const query = `
      SELECT id, class_name, faculty, school_year, created_at
      FROM classes
      WHERE class_name = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [className]);
    return rows[0] || null;
  }

  /**
   * Lấy danh sách toàn bộ sinh viên thuộc về một lớp
   */
  static async findStudentsByClassId(classId) {
    const query = `
      SELECT 
        s.id,
        s.student_code,
        s.full_name,
        DATE_FORMAT(s.dob, '%Y-%m-%d') AS dob,
        s.gender,
        s.email,
        s.phone,
        s.address,
        s.user_id,
        s.created_at
      FROM students s
      WHERE s.class_id = ?
      ORDER BY s.student_code ASC
    `;
    const [rows] = await pool.execute(query, [classId]);
    return rows;
  }

  /**
   * Đếm số lượng sinh viên hiện có trong lớp (dùng để kiểm tra trước khi xóa)
   */
  static async countStudents(classId) {
    const query = `SELECT COUNT(*) AS total FROM students WHERE class_id = ?`;
    const [rows] = await pool.execute(query, [classId]);
    return rows[0].total;
  }

  /**
   * Tạo lớp học mới
   */
  static async create({ className, faculty, schoolYear }) {
    const query = `
      INSERT INTO classes (class_name, faculty, school_year)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(query, [className, faculty, schoolYear]);
    return this.findById(result.insertId);
  }

  /**
   * Cập nhật thông tin lớp học
   */
  static async update(id, { className, faculty, schoolYear }) {
    const query = `
      UPDATE classes
      SET class_name = ?, faculty = ?, school_year = ?
      WHERE id = ?
    `;
    await pool.execute(query, [className, faculty, schoolYear, id]);
    return this.findById(id);
  }

  /**
   * Xóa lớp học
   */
  static async delete(id) {
    const query = `DELETE FROM classes WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ClassModel;
