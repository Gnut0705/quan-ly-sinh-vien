const { pool } = require('../config/db');

/**
 * Model thao tác với bảng `users` trong MySQL
 */
class UserModel {
  /**
   * Tìm người dùng theo username
   * @param {string} username 
   * @returns {Promise<object|null>}
   */
  static async findByUsername(username) {
    const query = `
      SELECT id, username, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE username = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [username]);
    return rows[0] || null;
  }

  /**
   * Tìm người dùng theo email
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  static async findByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }

  /**
   * Tìm người dùng theo username HOẶC email (phục vụ đăng nhập linh hoạt)
   * @param {string} identifier (username hoặc email)
   * @returns {Promise<object|null>}
   */
  static async findByIdentifier(identifier) {
    const query = `
      SELECT id, username, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE username = ? OR email = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [identifier, identifier]);
    return rows[0] || null;
  }

  /**
   * Tìm thông tin người dùng theo ID (không trả về password_hash)
   * Kèm thông tin hồ sơ sinh viên nếu tài khoản thuộc về sinh viên
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  static async findByIdWithProfile(id) {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.role, 
        u.created_at, 
        u.updated_at,
        s.id AS student_id,
        s.student_code,
        s.full_name AS student_full_name,
        s.gender AS student_gender,
        s.dob AS student_dob,
        s.phone AS student_phone,
        s.address AS student_address,
        c.class_name,
        c.faculty
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      LEFT JOIN classes c ON c.id = s.class_id
      WHERE u.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    if (!rows[0]) return null;

    const row = rows[0];
    const userProfile = {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    // Nếu có thông tin sinh viên kèm theo
    if (row.student_id) {
      userProfile.studentProfile = {
        id: row.student_id,
        studentCode: row.student_code,
        fullName: row.student_full_name,
        gender: row.student_gender,
        dob: row.student_dob,
        phone: row.student_phone,
        address: row.student_address,
        className: row.class_name,
        faculty: row.faculty,
      };
    }

    return userProfile;
  }

  /**
   * Tạo mới một người dùng
   * @param {object} userData 
   * @returns {Promise<{id: number, username: string, email: string, role: string}>}
   */
  static async createUser({ username, email, passwordHash, role = 'student' }) {
    const query = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [username, email, passwordHash, role]);
    return {
      id: result.insertId,
      username,
      email,
      role,
    };
  }
}

module.exports = UserModel;
