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

class StatsController {
  /**
   * Lấy dữ liệu thống kê hệ thống
   * GET /api/stats
   * - Admin & Teacher: Trả về tổng quan toàn trường (tổng SV, lớp, môn; SV theo lớp; điểm TB theo môn)
   * - Student: Trả về thông tin cá nhân, GPA, điểm các môn, và thông tin lớp sinh hoạt của chính mình
   */
  static async getStats(req, res, next) {
    try {
      const userRole = req.user.role;
      const userId = req.user.id;

      // 1. Phân quyền: Trường hợp là SINH VIÊN
      if (userRole === 'student') {
        const [studentRows] = await pool.execute(
          `SELECT s.id, s.student_code, s.full_name, s.email, s.dob, s.gender, s.class_id,
                  c.class_name, c.faculty, c.school_year
           FROM students s
           LEFT JOIN classes c ON c.id = s.class_id
           WHERE s.user_id = ?
           LIMIT 1`,
          [userId]
        );

        if (!studentRows[0]) {
          return res.status(200).json({
            success: true,
            role: 'student',
            message: 'Tài khoản chưa được liên kết với hồ sơ sinh viên.',
            data: {
              isLinked: false,
              totalCourses: 0,
              passedCourses: 0,
              gpa10: null,
              gpa4: null,
              classification: 'Chưa xếp loại',
              scoresPerCourse: [],
            },
          });
        }

        const student = studentRows[0];

        // Lấy số sinh viên trong cùng lớp sinh hoạt
        const [classmatesResult] = await pool.execute(
          'SELECT COUNT(*) AS total FROM students WHERE class_id = ?',
          [student.class_id]
        );
        const classmatesCount = classmatesResult[0]?.total || 0;

        // Lấy danh sách điểm thi của sinh viên này
        const [enrollmentRows] = await pool.execute(
          `SELECT e.id, e.course_id, c.course_code, c.course_name, c.credits,
                  e.semester, e.score
           FROM enrollments e
           JOIN courses c ON c.id = e.course_id
           WHERE e.student_id = ?
           ORDER BY e.semester ASC, c.course_code ASC`,
          [student.id]
        );

        let totalWeighted10 = 0;
        let totalWeighted4 = 0;
        let gradedCredits = 0;
        let registeredCredits = 0;
        let passedCredits = 0;
        let passedCoursesCount = 0;

        const scoresPerCourse = enrollmentRows.map((item) => {
          registeredCredits += Number(item.credits);
          const converted = convertTo4Scale(item.score);

          if (item.score !== null) {
            const scoreNum = Number(item.score);
            totalWeighted10 += scoreNum * item.credits;
            totalWeighted4 += converted.grade4 * item.credits;
            gradedCredits += item.credits;

            if (scoreNum >= 4.0) {
              passedCredits += item.credits;
              passedCoursesCount += 1;
            }
          }

          return {
            course_id: item.course_id,
            course_code: item.course_code,
            course_name: item.course_name,
            credits: item.credits,
            semester: item.semester,
            score: item.score !== null ? Number(item.score) : null,
            letter_grade: converted ? converted.letter : null,
            grade4: converted ? converted.grade4 : null,
          };
        });

        const gpa10 = gradedCredits > 0 ? Number((totalWeighted10 / gradedCredits).toFixed(2)) : null;
        const gpa4 = gradedCredits > 0 ? Number((totalWeighted4 / gradedCredits).toFixed(2)) : null;
        const classification = getClassification(gpa10);

        return res.status(200).json({
          success: true,
          role: 'student',
          message: 'Lấy dữ liệu thống kê sinh viên thành công.',
          data: {
            isLinked: true,
            studentInfo: {
              id: student.id,
              student_code: student.student_code,
              full_name: student.full_name,
              class_id: student.class_id,
              class_name: student.class_name,
              faculty: student.faculty,
              school_year: student.school_year,
              classmates_count: classmatesCount,
            },
            summary: {
              totalCourses: enrollmentRows.length,
              passedCourses: passedCoursesCount,
              totalRegisteredCredits: registeredCredits,
              passedCredits,
              gpa10,
              gpa4,
              classification,
            },
            scoresPerCourse,
          },
        });
      }

      // 2. Phân quyền: Trường hợp là ADMIN hoặc TEACHER (Xem toàn bộ thống kê)
      const [studentsCount] = await pool.execute('SELECT COUNT(*) AS total FROM students');
      const [classesCount] = await pool.execute('SELECT COUNT(*) AS total FROM classes');
      const [coursesCount] = await pool.execute('SELECT COUNT(*) AS total FROM courses');
      const [gradesCount] = await pool.execute(
        'SELECT COUNT(*) AS total, ROUND(AVG(score), 2) AS overall_avg FROM enrollments WHERE score IS NOT NULL'
      );

      // Thống kê số lượng sinh viên theo từng lớp học (dùng cho biểu đồ cột)
      const [studentsPerClass] = await pool.execute(`
        SELECT 
          c.id AS class_id,
          c.class_name,
          c.faculty,
          c.school_year,
          COUNT(s.id) AS student_count
        FROM classes c
        LEFT JOIN students s ON s.class_id = c.id
        GROUP BY c.id, c.class_name, c.faculty, c.school_year
        ORDER BY c.class_name ASC
      `);

      // Thống kê điểm trung bình theo môn học
      const [avgScorePerCourse] = await pool.execute(`
        SELECT 
          c.id AS course_id,
          c.course_code,
          c.course_name,
          c.credits,
          ROUND(AVG(e.score), 2) AS avg_score,
          COUNT(CASE WHEN e.score IS NOT NULL THEN 1 END) AS graded_count,
          COUNT(e.id) AS total_enrolled
        FROM courses c
        LEFT JOIN enrollments e ON e.course_id = c.id
        GROUP BY c.id, c.course_code, c.course_name, c.credits
        ORDER BY c.course_code ASC
      `);

      return res.status(200).json({
        success: true,
        role: userRole,
        message: 'Lấy dữ liệu thống kê hệ thống thành công.',
        data: {
          overview: {
            totalStudents: Number(studentsCount[0]?.total || 0),
            totalClasses: Number(classesCount[0]?.total || 0),
            totalCourses: Number(coursesCount[0]?.total || 0),
            totalGrades: Number(gradesCount[0]?.total || 0),
            overallAvgScore: gradesCount[0]?.overall_avg !== null ? Number(gradesCount[0].overall_avg) : null,
          },
          studentsPerClass: studentsPerClass.map((item) => ({
            class_id: item.class_id,
            class_name: item.class_name,
            faculty: item.faculty,
            school_year: item.school_year,
            student_count: Number(item.student_count || 0),
          })),
          avgScorePerCourse: avgScorePerCourse.map((item) => ({
            course_id: item.course_id,
            course_code: item.course_code,
            course_name: item.course_name,
            credits: Number(item.credits),
            avg_score: item.avg_score !== null ? Number(item.avg_score) : null,
            graded_count: Number(item.graded_count || 0),
            total_enrolled: Number(item.total_enrolled || 0),
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StatsController;
