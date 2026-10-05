const { pool } = require('../config/db');

/**
 * Danh sách các cột cho phép sắp xếp để chống SQL Injection qua ORDER BY
 */
const ALLOWED_SORT_COLUMNS = {
  id: 's.id',
  student_code: 's.student_code',
  full_name: 's.full_name',
  dob: 's.dob',
  created_at: 's.created_at',
};

class StudentModel {
  /**
   * Lấy danh sách sinh viên có phân trang, tìm kiếm và lọc
   */
  static async findAll({
    page = 1,
    limit = 10,
    search = '',
    classId = null,
    sortBy = 'id',
    order = 'DESC',
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const queryParams = [];

    // Tìm kiếm theo Họ tên hoặc Mã sinh viên (Parameterized query)
    if (search && search.trim() !== '') {
      whereConditions.push('(s.student_code LIKE ? OR s.full_name LIKE ?)');
      const searchPattern = `%${search.trim()}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    // Lọc theo lớp học (class_id)
    if (classId) {
      whereConditions.push('s.class_id = ?');
      queryParams.push(Number(classId));
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 1. Đếm tổng số bản ghi thỏa mãn điều kiện
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM students s
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // 2. Xác định cột và chiều sắp xếp (Whitelist an toàn)
    const sortColumn = ALLOWED_SORT_COLUMNS[sortBy] || 's.id';
    const sortOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 3. Lấy dữ liệu trang hiện tại kèm thông tin lớp học (JOIN classes)
    // mysql2 prepared statements với LIMIT / OFFSET cần số nguyên
    const dataQuery = `
      SELECT 
        s.id,
        s.student_code,
        s.full_name,
        DATE_FORMAT(s.dob, '%Y-%m-%d') AS dob,
        s.gender,
        s.email,
        s.phone,
        s.address,
        s.class_id,
        c.class_name,
        c.faculty,
        c.school_year,
        s.user_id,
        s.created_at,
        s.updated_at
      FROM students s
      INNER JOIN classes c ON c.id = s.class_id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    // Truyền limit và offset dưới dạng Number (string representation trong execute pool)
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
   * Lấy chi tiết sinh viên theo ID kèm thông tin lớp và bảng điểm
   */
  static async findById(id) {
    const studentQuery = `
      SELECT 
        s.id,
        s.student_code,
        s.full_name,
        DATE_FORMAT(s.dob, '%Y-%m-%d') AS dob,
        s.gender,
        s.email,
        s.phone,
        s.address,
        s.class_id,
        c.class_name,
        c.faculty,
        c.school_year,
        s.user_id,
        u.username AS linked_username,
        s.created_at,
        s.updated_at
      FROM students s
      INNER JOIN classes c ON c.id = s.class_id
      LEFT JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(studentQuery, [id]);
    if (!rows[0]) return null;

    const student = rows[0];

    // Lấy thêm danh sách điểm học phần của sinh viên
    const gradesQuery = `
      SELECT 
        e.id AS enrollment_id,
        e.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        e.semester,
        e.score
      FROM enrollments e
      INNER JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = ?
      ORDER BY e.semester DESC, c.course_code ASC
    `;
    const [grades] = await pool.execute(gradesQuery, [id]);
    student.grades = grades;

    return student;
  }

  /**
   * Tìm sinh viên theo mã sinh viên
   */
  static async findByCode(studentCode) {
    const query = `
      SELECT id, student_code, full_name, email, class_id
      FROM students
      WHERE student_code = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [studentCode]);
    return rows[0] || null;
  }

  /**
   * Tìm sinh viên theo email
   */
  static async findByEmail(email) {
    const query = `
      SELECT id, student_code, full_name, email, class_id
      FROM students
      WHERE email = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }

  /**
   * Kiểm tra xem class_id có tồn tại trong bảng classes không
   */
  static async checkClassExists(classId) {
    const query = `SELECT id FROM classes WHERE id = ? LIMIT 1`;
    const [rows] = await pool.execute(query, [classId]);
    return rows.length > 0;
  }

  /**
   * Thêm sinh viên mới
   */
  static async create({
    studentCode,
    fullName,
    dob,
    gender,
    email,
    phone,
    address,
    classId,
    userId = null,
  }) {
    const query = `
      INSERT INTO students 
        (student_code, full_name, dob, gender, email, phone, address, class_id, user_id)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      studentCode,
      fullName,
      dob,
      gender,
      email,
      phone || null,
      address || null,
      classId,
      userId || null,
    ]);

    return this.findById(result.insertId);
  }

  /**
   * Cập nhật thông tin sinh viên
   */
  static async update(id, updateData) {
    const {
      studentCode,
      fullName,
      dob,
      gender,
      email,
      phone,
      address,
      classId,
      userId,
    } = updateData;

    const query = `
      UPDATE students
      SET 
        student_code = ?,
        full_name = ?,
        dob = ?,
        gender = ?,
        email = ?,
        phone = ?,
        address = ?,
        class_id = ?,
        user_id = ?
      WHERE id = ?
    `;

    await pool.execute(query, [
      studentCode,
      fullName,
      dob,
      gender,
      email,
      phone !== undefined ? phone : null,
      address !== undefined ? address : null,
      classId,
      userId !== undefined ? userId : null,
      id,
    ]);

    return this.findById(id);
  }

  /**
   * Xóa sinh viên
   */
  static async delete(id) {
    const query = `DELETE FROM students WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = StudentModel;
