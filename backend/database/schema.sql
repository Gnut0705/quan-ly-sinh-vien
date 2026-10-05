-- =============================================================================
-- DATABASE SCHEMA: QUẢN LÝ SINH VIÊN (Student Management System)
-- Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `qlsv_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `qlsv_db`;

-- Tắt kiểm tra khóa ngoại tạm thời để tránh xung đột khi drop bảng
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. BẢNG USERS: Tài khoản người dùng hệ thống (Admin, Giảng viên, Sinh viên)
-- =============================================================================
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tên đăng nhập, không trùng lặp',
    `email` VARCHAR(100) NULL UNIQUE COMMENT 'Email tài khoản, không trùng lặp',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã băm bằng bcrypt',
    `role` ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student' COMMENT 'Vai trò trong hệ thống',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. BẢNG CLASSES: Lớp sinh hoạt / Lớp chuyên ngành
-- =============================================================================
CREATE TABLE `classes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `class_name` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tên lớp, ví dụ: CNTT1-K67',
    `faculty` VARCHAR(100) NOT NULL COMMENT 'Khoa / Viện quản lý',
    `school_year` VARCHAR(20) NOT NULL COMMENT 'Niên khóa, ví dụ: 2022-2026',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_classes_faculty` (`faculty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. BẢNG STUDENTS: Hồ sơ chi tiết sinh viên
-- =============================================================================
CREATE TABLE `students` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã sinh viên, ví dụ: SV20220001',
    `full_name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên đầy đủ',
    `dob` DATE NOT NULL COMMENT 'Ngày tháng năm sinh',
    `gender` ENUM('male', 'female', 'other') NOT NULL DEFAULT 'male' COMMENT 'Giới tính',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email liên hệ duy nhất',
    `phone` VARCHAR(20) NULL COMMENT 'Số điện thoại',
    `address` VARCHAR(255) NULL COMMENT 'Địa chỉ thường trú',
    `class_id` INT NOT NULL COMMENT 'Khóa ngoại liên kết tới bảng classes',
    `user_id` INT NULL UNIQUE COMMENT 'Tài khoản đăng nhập nếu có (1-1 với users, có thể NULL)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Khóa ngoại
    CONSTRAINT `fk_students_class` 
        FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_students_user` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,

    -- Indexes hỗ trợ tìm kiếm và sắp xếp thường xuyên
    INDEX `idx_students_class_id` (`class_id`),
    INDEX `idx_students_full_name` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. BẢNG COURSES: Danh mục học phần / Môn học
-- =============================================================================
CREATE TABLE `courses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã học phần, ví dụ: INT1001',
    `course_name` VARCHAR(100) NOT NULL COMMENT 'Tên môn học',
    `credits` INT NOT NULL CHECK (`credits` > 0) COMMENT 'Số tín chỉ (> 0)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. BẢNG ENROLLMENTS / GRADES: Đăng ký môn học & Điểm số sinh viên
-- =============================================================================
CREATE TABLE `enrollments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL COMMENT 'Khóa ngoại tới bảng students',
    `course_id` INT NOT NULL COMMENT 'Khóa ngoại tới bảng courses',
    `semester` VARCHAR(20) NOT NULL COMMENT 'Kỳ học, ví dụ: 2023.1, 2023.2',
    `score` DECIMAL(4, 2) NULL COMMENT 'Điểm học phần theo thang 10 (0.00 - 10.00)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ràng buộc điểm hợp lệ nếu đã nhập điểm
    CONSTRAINT `chk_enrollment_score` 
        CHECK (`score` IS NULL OR (`score` >= 0.00 AND `score` <= 10.00)),

    -- Khóa ngoại
    CONSTRAINT `fk_enrollments_student` 
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_enrollments_course` 
        FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Đảm bảo 1 sinh viên trong 1 học kỳ chỉ đăng ký môn học đó tối đa 1 lần
    CONSTRAINT `uq_student_course_semester` 
        UNIQUE (`student_id`, `course_id`, `semester`),

    -- Indexes hỗ trợ lọc điểm theo môn, sinh viên và học kỳ
    INDEX `idx_enrollments_student` (`student_id`),
    INDEX `idx_enrollments_course` (`course_id`),
    INDEX `idx_enrollments_semester` (`semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
