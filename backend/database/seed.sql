-- =============================================================================
-- SEED DATA: DỮ LIỆU MẪU CHO HỆ THỐNG QUẢN LÝ SINH VIÊN
-- =============================================================================

USE `qlsv_db`;

-- Xóa dữ liệu cũ theo đúng thứ tự để không vi phạm ràng buộc Foreign Key
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `enrollments`;
TRUNCATE TABLE `students`;
TRUNCATE TABLE `courses`;
TRUNCATE TABLE `classes`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. SEED USERS
-- Mật khẩu mặc định:
-- - admin: 'admin123'
-- - teacher: 'teacher123'
-- - student: 'student123'
-- (Toàn bộ đã được hash chuẩn bcrypt với salt rounds = 10)
-- =============================================================================
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`) VALUES
-- 1 Quản trị viên
(1, 'admin', 'admin@qlsv.edu.vn', '$2b$10$AySH80bmyRoiJ3WbtYX1DeYpWAolTrfGgKfJWSZmc.K7NvXrwNEwq', 'admin'),

-- 2 Giảng viên
(2, 'teacher_lan', 'lan.teacher@qlsv.edu.vn', '$2b$10$N3PI1gTH1Dn0mqbLt93wN.W8VTnu3oTLhXlrVJJ1GXN.oAPCORiGm', 'teacher'),
(3, 'teacher_hung', 'hung.teacher@qlsv.edu.vn', '$2b$10$N3PI1gTH1Dn0mqbLt93wN.W8VTnu3oTLhXlrVJJ1GXN.oAPCORiGm', 'teacher'),

-- 5 Tài khoản sinh viên đại diện (liên kết với 5 sinh viên đầu tiên)
(4, 'sv20220001', 'an.nv@student.edu.vn', '$2b$10$6sHNwdp2Vb/q8CJxIbc06enVgHE.efp/GBx/hOYHyUrdoYWoUzGdG', 'student'),
(5, 'sv20220002', 'mai.tt@student.edu.vn', '$2b$10$6sHNwdp2Vb/q8CJxIbc06enVgHE.efp/GBx/hOYHyUrdoYWoUzGdG', 'student'),
(6, 'sv20220003', 'nam.lh@student.edu.vn', '$2b$10$6sHNwdp2Vb/q8CJxIbc06enVgHE.efp/GBx/hOYHyUrdoYWoUzGdG', 'student'),
(7, 'sv20220004', 'duc.pm@student.edu.vn', '$2b$10$6sHNwdp2Vb/q8CJxIbc06enVgHE.efp/GBx/hOYHyUrdoYWoUzGdG', 'student'),
(8, 'sv20220005', 'linh.vt@student.edu.vn', '$2b$10$6sHNwdp2Vb/q8CJxIbc06enVgHE.efp/GBx/hOYHyUrdoYWoUzGdG', 'student');

-- =============================================================================
-- 2. SEED CLASSES (Danh mục Lớp học)
-- =============================================================================
INSERT INTO `classes` (`id`, `class_name`, `faculty`, `school_year`) VALUES
(1, 'CNTT1-K67', 'Công nghệ thông tin', '2022-2026'),
(2, 'CNTT2-K67', 'Công nghệ thông tin', '2022-2026'),
(3, 'KTPM1-K67', 'Kỹ thuật phần mềm', '2022-2026'),
(4, 'KHMT1-K67', 'Khoa học máy tính', '2022-2026');

-- =============================================================================
-- 3. SEED COURSES (Danh mục Môn học)
-- =============================================================================
INSERT INTO `courses` (`id`, `course_code`, `course_name`, `credits`) VALUES
(1, 'INT1001', 'Nhập môn lập trình C/C++', 3),
(2, 'INT1002', 'Cấu trúc dữ liệu và giải thuật', 4),
(3, 'INT1003', 'Cơ sở dữ liệu', 3),
(4, 'INT1004', 'Lập trình Web nâng cao', 3),
(5, 'INT1005', 'Mạng máy tính', 3),
(6, 'INT1006', 'Kiến trúc máy tính và Hệ điều hành', 4);

-- =============================================================================
-- 4. SEED STUDENTS (20 Sinh viên mẫu)
-- =============================================================================
INSERT INTO `students` (`id`, `student_code`, `full_name`, `dob`, `gender`, `email`, `phone`, `address`, `class_id`, `user_id`) VALUES
(1,  'SV20220001', 'Nguyễn Văn An',       '2004-03-15', 'male',   'an.nv@student.edu.vn',       '0912345601', 'Cầu Giấy, Hà Nội',               1, 4),
(2,  'SV20220002', 'Trần Thị Mai',        '2004-07-22', 'female', 'mai.tt@student.edu.vn',      '0912345602', 'Thanh Xuân, Hà Nội',             1, 5),
(3,  'SV20220003', 'Lê Hoàng Nam',        '2004-11-05', 'male',   'nam.lh@student.edu.vn',      '0912345603', 'Hải Châu, Đà Nẵng',              1, 6),
(4,  'SV20220004', 'Phạm Minh Đức',       '2004-01-18', 'male',   'duc.pm@student.edu.vn',      '0912345604', 'Quận 1, TP. Hồ Chí Minh',        1, 7),
(5,  'SV20220005', 'Vũ Thùy Linh',        '2004-09-30', 'female', 'linh.vt@student.edu.vn',     '0912345605', 'Hồng Bàng, Hải Phòng',           1, 8),
(6,  'SV20220006', 'Hoàng Quốc Bảo',      '2004-04-12', 'male',   'bao.hq@student.edu.vn',      '0912345606', 'Đống Đa, Hà Nội',                2, NULL),
(7,  'SV20220007', 'Đặng Thu Hà',         '2004-08-25', 'female', 'ha.dt@student.edu.vn',       '0912345607', 'Ninh Kiều, Cần Thơ',             2, NULL),
(8,  'SV20220008', 'Bùi Tuấn Anh',        '2004-02-14', 'male',   'anh.bt@student.edu.vn',      '0912345608', 'TP. Nam Định, Nam Định',          2, NULL),
(9,  'SV20220009', 'Đỗ Phương Thảo',      '2004-10-09', 'female', 'thao.dp@student.edu.vn',     '0912345609', 'Quận 7, TP. Hồ Chí Minh',        2, NULL),
(10, 'SV20220010', 'Ngô Quang Huy',       '2004-06-03', 'male',   'huy.nq@student.edu.vn',      '0912345610', 'TP. Bắc Ninh, Bắc Ninh',          2, NULL),
(11, 'SV20220011', 'Dương Quỳnh Nga',     '2004-12-28', 'female', 'nga.dq@student.edu.vn',      '0912345611', 'Ba Đình, Hà Nội',                3, NULL),
(12, 'SV20220012', 'Lý Gia Khiêm',        '2004-05-19', 'male',   'khiem.lg@student.edu.vn',    '0912345612', 'Sơn Trà, Đà Nẵng',              3, NULL),
(13, 'SV20220013', 'Trịnh Khánh Huyền',   '2004-03-08', 'female', 'huyen.tk@student.edu.vn',    '0912345613', 'Quận 3, TP. Hồ Chí Minh',        3, NULL),
(14, 'SV20220014', 'Phan Thanh Tùng',     '2004-09-17', 'male',   'tung.pt@student.edu.vn',     '0912345614', 'TP. Vinh, Nghệ An',              3, NULL),
(15, 'SV20220015', 'Tô Ánh Nguyệt',       '2004-07-04', 'female', 'nguyet.ta@student.edu.vn',   '0912345615', 'Hai Bà Trưng, Hà Nội',           3, NULL),
(16, 'SV20220016', 'Hà Trọng Nhân',       '2004-01-29', 'male',   'nhan.ht@student.edu.vn',     '0912345616', 'TP. Hạ Long, Quảng Ninh',        4, NULL),
(17, 'SV20220017', 'Lương Kiều Oanh',     '2004-11-11', 'female', 'oanh.lk@student.edu.vn',     '0912345617', 'TP. Huế, Thừa Thiên Huế',        4, NULL),
(18, 'SV20220018', 'Cao Việt Hưng',       '2004-08-02', 'male',   'hung.cv@student.edu.vn',     '0912345618', 'TP. Thái Nguyên, Thái Nguyên',    4, NULL),
(19, 'SV20220019', 'Vương Kim Chi',       '2004-06-20', 'female', 'chi.vk@student.edu.vn',      '0912345619', 'Quận 10, TP. Hồ Chí Minh',       4, NULL),
(20, 'SV20220020', 'Trương Tiến Đạt',     '2004-12-01', 'male',   'dat.tt@student.edu.vn',      '0912345620', 'Hà Đông, Hà Nội',                4, NULL);

-- =============================================================================
-- 5. SEED ENROLLMENTS / GRADES (Điểm số môn học theo học kỳ)
-- =============================================================================
INSERT INTO `enrollments` (`student_id`, `course_id`, `semester`, `score`) VALUES
-- Học kỳ 2023.1
(1, 1, '2023.1', 8.50),
(1, 2, '2023.1', 7.80),
(2, 1, '2023.1', 9.20),
(2, 2, '2023.1', 8.90),
(3, 1, '2023.1', 6.50),
(3, 2, '2023.1', 7.00),
(4, 1, '2023.1', 9.80),
(4, 2, '2023.1', 9.50),
(5, 1, '2023.1', 8.20),
(6, 1, '2023.1', 7.40),
(7, 1, '2023.1', 8.70),
(8, 1, '2023.1', 6.80),

-- Học kỳ 2023.2
(1, 3, '2023.2', 8.75),
(1, 4, '2023.2', 9.00),
(2, 3, '2023.2', 8.30),
(2, 4, '2023.2', 8.60),
(3, 3, '2023.2', 7.50),
(4, 3, '2023.2', 9.20),
(4, 4, '2023.2', 9.60),

-- Môn đang học (score NULL)
(1, 5, '2024.1', NULL),
(2, 5, '2024.1', NULL),
(3, 5, '2024.1', NULL),
(4, 5, '2024.1', NULL);
