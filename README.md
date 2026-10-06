# Hệ Thống Quản Lý Sinh Viên (Student Management System)

Dự án website quản lý sinh viên full-stack hoàn chỉnh, chuyên nghiệp phục vụ cho portfolio cá nhân.  
Hệ thống hỗ trợ đầy đủ các nghiệp vụ quản lý hồ sơ sinh viên, lớp sinh hoạt, môn học/học phần, nhập điểm thi, tính điểm trung bình tích lũy (GPA thang 10 & thang 4), và phân quyền người dùng theo vai trò (RBAC).

---

## 📌 Mục Lục
1. [Công Nghệ Sử Dụng (Tech Stack)](#1-công-nghệ-sử-dụng-tech-stack)
2. [Sơ Đồ Thực Thể & Cơ Sở Dữ Liệu (ER Diagram)](#2-sơ-đồ-thực-thể--cơ-sở-dữ-liệu-er-diagram)
3. [Cấu Trúc Thư Mục Dự Án](#3-cấu-trúc-thư-mục-dự-án)
4. [Phân Quyền Người Dùng & Tài Khoản Mẫu (RBAC)](#4-phân-quyền-người-dùng--tài-khoản-mẫu-rbac)
5. [Các Tính Năng & Trang Giao Diện (Frontend)](#5-các-tính-năng--trang-giao-diện-frontend)
6. [Danh Sách RESTful API (Backend)](#6-danh-sách-restful-api-backend)
7. [Hướng Dẫn Cài Đặt & Chạy Ứng Dụng](#7-hướng-dẫn-cài-đặt--chạy-ứng-dụng)
8. [Tiêu Chuẩn Bảo Mật & Kỹ Thuật Nổi Bật](#8-tiêu-chuẩn-bảo-mật--kỹ-thuật-nổi-bật)

---

## 1. Công Nghệ Sử Dụng (Tech Stack)

### **Frontend**
- **Framework:** React 19 + Vite (Fast HMR, tối ưu bundle production).
- **Routing:** React Router DOM v7 (Nested routes, Protected routes theo vai trò).
- **HTTP Client:** Axios (cấu hình interceptor tự động gán Bearer Token, tự động điều hướng khi hết hạn token 401).
- **Styling:** Vanilla CSS Design System hiện đại (CSS Variables, Glassmorphism, Responsive, Micro-animations, bảng màu HSL hài hòa).
- **Kiến trúc mã nguồn:** Tách biệt rõ ràng Custom Hooks (`useStudents`, `useClasses`, `useCourses`, `useGrades`), Contexts (`AuthContext`, `ToastContext`), và các Reusable Components dùng chung.

### **Backend**
- **Nền tảng:** Node.js + Express.js.
- **Cơ sở dữ liệu:** MySQL (kết nối qua `mysql2/promise` với Connection Pool tối ưu hiệu năng).
- **Xác thực & Bảo mật:** `bcrypt` (mã hóa mật khẩu 10 salt rounds), `jsonwebtoken` (JWT token có thời hạn), CORS, Parameterized SQL Queries chống SQL Injection.
- **Kiến trúc tầng (Layered Architecture):**
  - `config/`: Kết nối Database và biến môi trường.
  - `controllers/`: Tiếp nhận request, xử lý nghiệp vụ, trả response chuẩn RESTful.
  - `models/`: Thao tác trực tiếp với MySQL bằng truy vấn tham số hóa (`?`).
  - `middlewares/`: Kiểm tra JWT token, phân quyền vai trò (RBAC), validate dữ liệu đầu vào, xử lý lỗi tập trung.
  - `routes/`: Định tuyến các API endpoint.

---

## 2. Sơ Đồ Thực Thể & Cơ Sở Dữ Liệu (ER Diagram)

### Sơ đồ Mermaid ERD
```mermaid
erDiagram
    users ||--o| students : "tài khoản sinh viên (1:0..1)"
    classes ||--o{ students : "thuộc lớp (1:N)"
    students ||--o{ enrollments : "đăng ký học (1:N)"
    courses ||--o{ enrollments : "được đăng ký (1:N)"

    users {
        int id PK "Tự tăng (Auto Increment)"
        varchar username UK "Tên đăng nhập duy nhất"
        varchar password_hash "Băm mật khẩu bcrypt"
        enum role "admin, teacher, student"
        timestamp created_at "Thời gian tạo"
        timestamp updated_at "Thời gian cập nhật"
    }

    classes {
        int id PK "Tự tăng (Auto Increment)"
        varchar class_name UK "Mã / Tên lớp duy nhất"
        varchar faculty "Khoa / Viện quản lý"
        varchar school_year "Niên khóa (VD: 2022-2026)"
        timestamp created_at "Thời gian tạo"
    }

    students {
        int id PK "Tự tăng (Auto Increment)"
        varchar student_code UK "Mã sinh viên duy nhất"
        varchar full_name "Họ và tên"
        date dob "Ngày sinh"
        enum gender "male, female, other"
        varchar email UK "Email duy nhất"
        varchar phone "Số điện thoại"
        varchar address "Địa chỉ thường trú"
        int class_id FK "Liên kết classes.id"
        int user_id FK "Liên kết users.id (nullable)"
        timestamp created_at "Thời gian tạo"
        timestamp updated_at "Thời gian cập nhật"
    }

    courses {
        int id PK "Tự tăng (Auto Increment)"
        varchar course_code UK "Mã học phần duy nhất"
        varchar course_name "Tên môn học"
        int credits "Số tín chỉ (CHECK 1-6)"
        timestamp created_at "Thời gian tạo"
    }

    enrollments {
        int id PK "Tự tăng (Auto Increment)"
        int student_id FK "Liên kết students.id"
        int course_id FK "Liên kết courses.id"
        varchar semester "Học kỳ (VD: 2023.1)"
        decimal score "Điểm số thang 10 (0.00 - 10.00)"
        timestamp created_at "Thời gian tạo"
        timestamp updated_at "Thời gian cập nhật"
    }
```

### Ràng buộc & Tối ưu CSDL
- **Khóa ngoại & Toàn vẹn tham chiếu:**
  - `students.class_id` -> `classes.id`: `ON DELETE RESTRICT` (Không cho xóa lớp nếu lớp vẫn còn sinh viên).
  - `students.user_id` -> `users.id`: `ON DELETE SET NULL` (Xóa tài khoản user không làm mất hồ sơ sinh viên).
  - `enrollments.student_id` -> `students.id`: `ON DELETE CASCADE` (Xóa sinh viên tự động thu hồi lịch sử điểm).
  - `enrollments.course_id` -> `courses.id`: `ON DELETE RESTRICT` (Không cho xóa môn học nếu đã có điểm/lượt đăng ký).
- **Ràng buộc duy nhất (Unique):**
  - `users.username`, `classes.class_name`, `students.student_code`, `students.email`, `courses.course_code`.
  - Composite Unique: `enrollments(student_id, course_id, semester)` (Chống trùng lặp điểm cho một sinh viên trong cùng một môn ở một học kỳ).
- **Ràng buộc kiểm tra (Check):**
  - `courses.credits >= 1 AND courses.credits <= 6` (Số tín chỉ đào tạo chuẩn).
  - `enrollments.score IS NULL OR (score >= 0.00 AND score <= 10.00)`.

---

## 3. Cấu Trúc Thư Mục Dự Án

```text
QLSV/
├── backend/
│   ├── database/
│   │   ├── schema.sql              # Cấu trúc bảng MySQL, khóa chính, khóa ngoại, index
│   │   └── seed.sql                # Dữ liệu khởi tạo mẫu (users, classes, courses, students, grades)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Connection pool mysql2/promise
│   │   ├── controllers/            # Controller tiếp nhận request và gọi model
│   │   │   ├── auth.controller.js
│   │   │   ├── student.controller.js
│   │   │   ├── class.controller.js
│   │   │   ├── course.controller.js
│   │   │   └── grade.controller.js
│   │   ├── middlewares/            # Middleware xác thực, validate và bắt lỗi
│   │   │   ├── auth.middleware.js  # verifyToken, authorizeRoles
│   │   │   ├── validator.middleware.js # Kiểm tra tính hợp lệ của payload
│   │   │   └── error.middleware.js # Xử lý lỗi tập trung (centralized error handler)
│   │   ├── models/                 # Query MySQL thuần tham số hóa (?)
│   │   │   ├── user.model.js
│   │   │   ├── student.model.js
│   │   │   ├── class.model.js
│   │   │   ├── course.model.js
│   │   │   └── grade.model.js
│   │   ├── routes/                 # Express Router
│   │   │   ├── auth.route.js
│   │   │   ├── student.route.js
│   │   │   ├── class.route.js
│   │   │   ├── course.route.js
│   │   │   └── grade.route.js
│   │   └── server.js               # Khởi tạo Express app, CORS, mount routes, health check
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Các component tái sử dụng trên toàn hệ thống
│   │   │   │   ├── Modal.jsx       # Hộp thoại modal tùy biến
│   │   │   │   ├── ConfirmDialog.jsx # Hộp thoại xác nhận nguy hiểm (Xóa)
│   │   │   │   ├── Pagination.jsx  # Phân trang thông minh kèm chọn limit
│   │   │   │   ├── Toast.jsx       # Thông báo góc màn hình (Success, Error, Info)
│   │   │   │   └── SearchableSelect.jsx # Dropdown chọn sinh viên/môn có ô tìm kiếm
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx      # Thanh header, thông tin user, nút logout
│   │   │   │   ├── Sidebar.jsx     # Thanh bên hông hiển thị menu theo quyền
│   │   │   │   └── AppLayout.jsx   # Layout bọc các trang bảo vệ
│   │   │   ├── students/           # Component module Sinh viên
│   │   │   │   ├── StudentFilters.jsx
│   │   │   │   ├── StudentTable.jsx
│   │   │   │   ├── StudentForm.jsx
│   │   │   │   └── StudentDetailModal.jsx
│   │   │   ├── classes/            # Component module Lớp học
│   │   │   │   ├── ClassFilters.jsx
│   │   │   │   ├── ClassTable.jsx
│   │   │   │   └── ClassForm.jsx
│   │   │   ├── courses/            # Component module Môn học
│   │   │   │   ├── CourseFilters.jsx
│   │   │   │   ├── CourseTable.jsx
│   │   │   │   └── CourseForm.jsx
│   │   │   ├── grades/             # Component module Điểm số
│   │   │   │   ├── GradeFilters.jsx
│   │   │   │   ├── GradeTable.jsx
│   │   │   │   └── GradeForm.jsx
│   │   │   └── ProtectedRoute.jsx  # Kiểm tra đăng nhập và role hợp lệ
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Lưu trữ JWT, user info, đăng nhập, đăng xuất
│   │   │   └── ToastContext.jsx    # Quản lý trigger toast notification
│   │   ├── hooks/                  # Custom hooks trừu tượng hóa gọi API
│   │   │   ├── useStudents.js
│   │   │   ├── useClasses.js
│   │   │   ├── useCourses.js
│   │   │   └── useGrades.js
│   │   ├── pages/                  # Các trang màn hình chính
│   │   │   ├── Login.jsx           # Trang đăng nhập có nút điền nhanh tài khoản demo
│   │   │   ├── Dashboard.jsx       # Bảng điều khiển thống kê tổng quan
│   │   │   ├── StudentList.jsx     # Quản lý sinh viên (/students)
│   │   │   ├── ClassList.jsx       # Quản lý lớp học (/classes)
│   │   │   ├── ClassDetail.jsx     # Chi tiết lớp & danh sách SV (/classes/:id)
│   │   │   ├── CourseList.jsx      # Quản lý môn học (/courses)
│   │   │   ├── GradeList.jsx       # Bảng điểm tổng hợp (/grades)
│   │   │   ├── StudentTranscript.jsx # Bảng điểm chi tiết & GPA SV (/students/:id/grades)
│   │   │   └── Unauthorized.jsx    # Trang báo lỗi 403 không có quyền
│   │   ├── services/
│   │   │   └── api.js              # Cấu hình Axios instance & interceptors
│   │   ├── styles/
│   │   │   └── index.css           # Toàn bộ design token và style của ứng dụng
│   │   ├── App.jsx                 # Cấu hình Router
│   │   └── main.jsx
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── docs/
│   └── API.md                      # Tài liệu chi tiết request/response mẫu của toàn bộ API
└── README.md
```

---

## 4. Phân Quyền Người Dùng & Tài Khoản Mẫu (RBAC)

Hệ thống triển khai mô hình **Role-Based Access Control (RBAC)** nghiêm ngặt ở cả 2 đầu Backend và Frontend:

| Chức năng | Admin (`admin`) | Giảng viên (`teacher`) | Sinh viên (`student`) |
| :--- | :---: | :---: | :---: |
| **Xem Dashboard** | ✅ Đầy đủ số liệu | ✅ Xem số liệu | ✅ Xem số liệu |
| **Quản lý Sinh viên** | ✅ Thêm / Sửa / Xóa | 👁️ Chỉ xem | ❌ Bị chặn |
| **Quản lý Lớp học** | ✅ Thêm / Sửa / Xóa | 👁️ Xem danh sách & SV của lớp | 👁️ Xem danh sách & SV của lớp |
| **Quản lý Môn học** | ✅ Thêm / Sửa / Xóa | 👁️ Chỉ xem tra cứu | 👁️ Chỉ xem tra cứu |
| **Nhập / Sửa / Xóa Điểm** | ✅ Toàn quyền | ✅ Nhập / Sửa / Xóa điểm | ❌ Không có quyền |
| **Xem Bảng điểm** | ✅ Xem tất cả SV | ✅ Xem tất cả SV | 👁️ **Chỉ xem điểm của chính mình** |
| **Tra cứu GPA** | ✅ Xem tất cả SV | ✅ Xem tất cả SV | 👁️ Xem GPA của chính mình |

### Tài khoản kiểm thử nhanh (Demo Accounts)

Hệ thống cung cấp sẵn các nút chọn tài khoản kiểm thử ngay tại trang đăng nhập:

| Vai trò | Tên đăng nhập | Mật khẩu mẫu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **👑 Quản trị viên (Admin)** | `admin` | `admin123` | Toàn quyền thêm, sửa, xóa tất cả các module |
| **🧑‍🏫 Giảng viên (Teacher)** | `teacher_lan` | `teacher123` | Nhập và chỉnh sửa điểm thi cho sinh viên |
| **🧑‍🏫 Giảng viên (Teacher)** | `teacher_hung` | `teacher123` | Giảng viên bộ môn |
| **👨‍🎓 Sinh viên (Student)** | `sv20220001` | `student123` | Sinh viên Nguyễn Văn An (Xem bảng điểm cá nhân) |
| **👨‍🎓 Sinh viên (Student)** | `sv20220002` -> `sv20220005` | `student123` | Các sinh viên mẫu khác trong hệ thống |

---

## 5. Các Tính Năng & Trang Giao Diện (Frontend)

### 1. Xác thực & Đăng nhập (`/login`)
- Giao diện đăng nhập hiện đại với hiệu ứng Glassmorphism.
- Tự động lưu JWT vào `localStorage` và cập nhật thông tin người dùng trong `AuthContext`.
- Hỗ trợ các nút **Điền nhanh tài khoản kiểm thử** (Admin, Teacher, Student) tiện lợi khi demo.

### 2. Bảng điều khiển (`/dashboard`)
- Thống kê các chỉ số KPI: Tổng số sinh viên, Số lượng lớp học, Tổng số môn học, Số bản ghi điểm.
- Khối chào mừng cá nhân hóa theo từng vai trò đăng nhập.
- Danh sách liên kết thao tác nhanh (Quick Actions) điều hướng tới các module.

### 3. Quản lý Sinh viên (`/students`)
- **Bảng danh sách:** Hiển thị Mã SV, Họ tên (avatar chữ cái đầu), Lớp, Khoa, Ngày sinh, Giới tính, Email, Số điện thoại.
- **Tìm kiếm & Lọc:** Tìm theo tên hoặc mã sinh viên (tích hợp **Debounce 400ms** giảm tải request), lọc theo Lớp sinh hoạt.
- **Sắp xếp & Phân trang:** Click tiêu đề cột để sắp xếp tăng/giảm, chuyển trang và tùy chọn số dòng/trang (5, 10, 20, 50).
- **Thêm / Sửa sinh viên:** Modal form có client-side validation nghiêm ngặt (Mã SV, Email, SĐT, Ngày sinh). Hiển thị lỗi từ server (trùng mã SV, trùng email) ngay dưới trường tương ứng.
- **Xóa sinh viên:** Hộp thoại xác nhận `ConfirmDialog`.
- **Xem chi tiết hồ sơ & Điểm:** Modal hiển thị đầy đủ thông tin cá nhân và bảng điểm tóm tắt, có nút mở trang bảng điểm chi tiết.

### 4. Quản lý Lớp học (`/classes` & `/classes/:id`)
- **Bảng danh sách:** Tên lớp, Khoa/Viện, Niên khóa, Số lượng sinh viên (`badge`).
- **Bộ lọc:** Lọc theo Khoa/Viện, lọc theo Niên khóa, tìm kiếm tên lớp có debounce.
- **Thêm / Sửa lớp:** Modal form kiểm tra bắt buộc, độ dài ký tự và chống trùng tên lớp.
- **Chặn xóa lớp có sinh viên (HTTP 409):** Khi xóa lớp đang có sinh viên, server từ chối và frontend hiển thị Toast thông báo lỗi: *"Không thể xóa lớp vì hiện đang có X sinh viên trực thuộc..."*.
- **Chi tiết lớp học (`/classes/:id`):** Click vào tên lớp mở trang chi tiết, hiển thị banner thông tin lớp và danh sách toàn bộ sinh viên thuộc lớp.

### 5. Quản lý Môn học (`/courses`)
- **Bảng danh sách:** Mã môn học (font monospace), Tên môn học, Số tín chỉ (badge màu phân cấp).
- **Tìm kiếm:** Tìm theo mã môn hoặc tên môn có debounce.
- **Thêm / Sửa môn:** Client validate mã môn (tự động uppercase), tên môn, số tín chỉ từ 1 đến 6 (kèm các nút chọn nhanh 1 - 6 TC).
- **Chặn xóa môn đã có điểm (HTTP 409):** Không cho phép xóa môn đã có sinh viên đăng ký/có điểm.

### 6. Quản lý Điểm số & Bảng điểm (`/grades` & `/students/:id/grades`)
- **Trang bảng điểm tổng hợp (`/grades`):**
  - Lọc theo Sinh viên (sử dụng dropdown tìm kiếm `SearchableSelect`), lọc theo Môn học, lọc theo Học kỳ (`2023.1`, `2023.2`, `2024.1`...).
  - Hiển thị Điểm số thang 10 kèm Điểm chữ (A, B, C, D, F) theo badge màu.
  - Role Student tự động chỉ hiển thị điểm của chính mình và ẩn toàn bộ nút thêm/sửa/xóa.
- **Modal Nhập / Sửa điểm:**
  - Dropdown tìm kiếm chọn sinh viên và môn học.
  - Chọn học kỳ, nhập điểm 0.0 - 10.0 (kèm nút chọn nhanh các mốc điểm `4.0`, `5.5`, `7.0`, `8.5`, `10.0`).
  - Xử lý lỗi trùng lặp (HTTP 409) nếu sinh viên đã có điểm môn này trong cùng học kỳ.
- **Trang Bảng điểm Sinh viên & GPA (`/students/:id/grades`):**
  - Banner tổng hợp chỉ số học tập: **GPA Thang 10**, **GPA Thang 4**, **Số tín chỉ đạt/đăng ký**, **Xếp loại học lực** (*Xuất sắc, Giỏi, Khá, Trung bình, Yếu*).
  - Phân nhóm bảng điểm chi tiết theo từng học kỳ kèm tính GPA riêng của kỳ đó và trạng thái Đạt / Không đạt.
  - Bảo vệ quyền riêng tư: Chặn sinh viên truy cập xem bảng điểm của sinh viên khác (HTTP 403).

---

## 6. Danh Sách RESTful API (Backend)

| Nhóm | Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Đăng ký tài khoản mới |
| | `POST` | `/api/auth/login` | Public | Đăng nhập hệ thống (nhận JWT) |
| | `GET` | `/api/auth/me` | Logged In | Lấy thông tin user đang đăng nhập |
| **Students** | `GET` | `/api/students` | Admin, Teacher | Danh sách SV (tìm kiếm, lọc, phân trang, sort) |
| | `GET` | `/api/students/:id` | Logged In | Chi tiết thông tin 1 sinh viên |
| | `POST` | `/api/students` | Admin | Thêm sinh viên mới (chống trùng mã SV, email) |
| | `PUT` | `/api/students/:id` | Admin | Cập nhật thông tin sinh viên |
| | `DELETE`| `/api/students/:id` | Admin | Xóa sinh viên |
| **Classes** | `GET` | `/api/classes` | Logged In | Danh sách lớp kèm số lượng sinh viên |
| | `GET` | `/api/classes/:id` | Logged In | Chi tiết 1 lớp học |
| | `GET` | `/api/classes/:id/students` | Logged In | Danh sách sinh viên thuộc lớp |
| | `POST` | `/api/classes` | Admin | Thêm lớp mới (chống trùng tên lớp) |
| | `PUT` | `/api/classes/:id` | Admin | Cập nhật thông tin lớp |
| | `DELETE`| `/api/classes/:id` | Admin | Xóa lớp (chặn xóa nếu lớp còn SV -> 409) |
| **Courses** | `GET` | `/api/courses` | Logged In | Danh sách môn học (phân trang, search) |
| | `GET` | `/api/courses/:id` | Logged In | Chi tiết môn học |
| | `POST` | `/api/courses` | Admin | Thêm môn học mới (credits 1-6) |
| | `PUT` | `/api/courses/:id` | Admin | Cập nhật thông tin môn học |
| | `DELETE`| `/api/courses/:id` | Admin | Xóa môn học (chặn xóa nếu đã có điểm -> 409) |
| **Grades** | `GET` | `/api/grades` | Logged In | Danh sách điểm (Student chỉ xem điểm của mình) |
| | `GET` | `/api/students/:id/grades` | Logged In | Bảng điểm chi tiết & GPA của SV (chặn xem chéo -> 403) |
| | `POST` | `/api/grades` | Admin, Teacher | Nhập điểm môn học (chặn trùng kỳ -> 409) |
| | `PUT` | `/api/grades/:id` | Admin, Teacher | Cập nhật điểm số |
| | `DELETE`| `/api/grades/:id` | Admin, Teacher | Xóa bản ghi điểm |
| **System** | `GET` | `/api/health` | Public | Kiểm tra trạng thái server & kết nối MySQL |

> 📘 Chi tiết Request Body, Query Params, Response mẫu JSON vui lòng tham khảo file [docs/API.md](file:///h:/Code/QLSV/docs/API.md).

---

## 7. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu tiên quyết
- **Node.js**: Phiên bản 18.x trở lên.
- **MySQL**: Phiên bản 8.0 trở lên đang chạy trên cổng `3306`.

### Bước 1: Khởi tạo Cơ sở dữ liệu MySQL
Mở terminal hoặc phần mềm quản lý MySQL (DBeaver / MySQL Workbench) và thực thi 2 file theo thứ tự:
```bash
# 1. Tạo CSDL qlsv_db và cấu trúc bảng
mysql -u root -p < backend/database/schema.sql

# 2. Nạp dữ liệu mẫu (admin, teacher, students, courses, grades)
mysql -u root -p < backend/database/seed.sql
```

### Bước 2: Cấu hình biến môi trường

**Backend (`backend/.env`):**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=qlsv_db
JWT_SECRET=your_jwt_secret_key_qlsv_2026_super_secure
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Bước 3: Cài đặt Dependencies & Khởi chạy

**Khởi chạy Backend:**
```bash
cd backend
npm install
npm run dev
# Server lắng nghe tại http://localhost:5000
```

**Khởi chạy Frontend:**
```bash
cd frontend
npm install
npm run dev
# Ứng dụng chạy tại http://localhost:5173
```

Mở trình duyệt truy cập: **[http://localhost:5173](http://localhost:5173)**

---

## 8. Tiêu Chuẩn Bảo Mật & Kỹ Thuật Nổi Bật

1. **Phòng chống SQL Injection tuyệt đối:**
   - 100% các câu truy vấn cơ sở dữ liệu đều sử dụng tham số hóa (`?`) thông qua `mysql2/promise`.
   - Các trường sắp xếp cột động (`sortBy`, `order`) được kiểm tra nghiêm ngặt qua danh sách trắng (Whitelist Columns) trước khi đưa vào SQL.
2. **Xác thực & Mã hóa:**
   - Mật khẩu người dùng được băm an toàn bằng `bcrypt` trước khi lưu vào cơ sở dữ liệu.
   - Cơ chế ký và xác thực token JWT không lưu trữ thông tin nhạy cảm.
3. **Frontend Tối ưu Trải nghiệm Người Dùng (UX):**
   - Tìm kiếm thời gian thực có **Debounce** chống gửi request liên tục làm nghẽn mạng.
   - Xử lý trạng thái rỗng (Empty States), Loading spinner mượt mà trên tất cả các bảng.
   - Xử lý phản hồi lỗi rõ ràng qua Toast và hiển thị lỗi validate ngay dưới từng input field.
   - Tự động điều hướng về `/login` nếu token hết hạn (HTTP 401).
4. **Xử lý toàn vẹn dữ liệu (HTTP 409 Conflict):**
   - Ngăn xóa lớp học nếu còn sinh viên.
   - Ngăn xóa môn học nếu đã có sinh viên đăng ký.
   - Ngăn nhập trùng điểm môn học của sinh viên trong cùng một học kỳ.
   - Báo lỗi rõ ràng giúp người dùng dễ dàng hiểu nguyên nhân.

---

*Dự án được xây dựng phục vụ học tập, nghiên cứu và làm đồ án portfolio.*
