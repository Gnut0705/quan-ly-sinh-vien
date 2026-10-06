# Tài Liệu RESTful API - Hệ Thống Quản Lý Sinh Viên

- **Base URL:** `http://localhost:5000/api`
- **Định dạng dữ liệu:** `application/json`
- **Xác thực:** JSON Web Token (JWT) thông qua HTTP Header:  
  `Authorization: Bearer <your_jwt_token>`
- **Bảo mật mạng & Headers:**
  - **CORS:** Chỉ cho phép truy cập từ `CLIENT_URL` (mặc định: `http://localhost:5173`).
  - **Helmet:** Tự động kích hoạt HTTP Security Headers (`X-Frame-Options`, `X-Content-Type-Options: nosniff`, CSP,...).
  - **Rate Limiting:** Chống Brute Force endpoint `/api/auth/login` (tối đa 5 lần thử / 15 phút).
  - **Bảo vệ dữ liệu:** 100% Prepared Statements (chống SQL Injection), tuyệt đối không trả `password_hash` hay `stack trace` về client.

---

## Bảng Mã Trạng Thái HTTP (Status Codes)

| Mã | Ý nghĩa | Mô tả |
| :--- | :--- | :--- |
| `200 OK` | Thành công | Thao tác truy vấn, cập nhật hoặc xóa thành công. |
| `201 Created` | Đã tạo thành công | Tạo mới bản ghi tài nguyên thành công. |
| `400 Bad Request` | Dữ liệu không hợp lệ | Thiếu trường bắt buộc, sai định dạng (email, ngày sinh,...). |
| `401 Unauthorized` | Chưa xác thực | Thiếu token, token sai hoặc token đã hết hạn. |
| `403 Forbidden` | Không có quyền | Người dùng không đủ quyền hạn (vd: Sinh viên cố tình xóa/sửa). |
| `404 Not Found` | Không tìm thấy | ID tài nguyên không tồn tại trên hệ thống. |
| `409 Conflict` | Xung đột dữ liệu | Trùng lặp giá trị UNIQUE (mã SV, username, email, lớp còn SV, môn có điểm). |
| `429 Too Many Requests` | Vượt giới hạn yêu cầu | Quá nhiều lần thử đăng nhập thất bại (chống Brute Force). |
| `500 Server Error` | Lỗi máy chủ | Lỗi nội bộ từ phía backend (ẩn toàn bộ stack trace khỏi client). |

---

## 1. Authentication Endpoints

### 1.1. Đăng ký tài khoản (Register)
- **Endpoint:** `POST /api/auth/register`
- **Quyền:** Public
- **Request Body:**
```json
{
  "username": "hoangnam_sv",
  "email": "nam.hoang@student.edu.vn",
  "password": "password123",
  "role": "student"
}
```
*(Ghi chú: `role` là tùy chọn, mặc định là `"student"`)*

- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công!",
  "data": {
    "user": {
      "id": 10,
      "username": "hoangnam_sv",
      "email": "nam.hoang@student.edu.vn",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.2. Đăng nhập (Login)
- **Endpoint:** `POST /api/auth/login`
- **Quyền:** Public
- **Request Body:** (Chấp nhận username hoặc email tại trường `identifier`)
```json
{
  "identifier": "admin",
  "password": "admin123"
}
```

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@qlsv.edu.vn",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

- **Cơ chế giới hạn tốc độ (Rate Limiting - Chống Brute Force):**
  - Giới hạn: Tối đa **5 yêu cầu trong 15 phút** từ cùng 1 địa chỉ IP.
  - Headers trả về trong response:
    - `RateLimit-Limit: 5`
    - `RateLimit-Remaining: 4` (giảm dần sau mỗi lần gọi)
    - `RateLimit-Reset: <seconds>` (số giây còn lại trước khi đặt lại hạn ngạch)

- **Response `429 Too Many Requests` (Khi vượt quá 5 lần):**
```json
{
  "success": false,
  "message": "Bạn đã thử đăng nhập quá nhiều lần (tối đa 5 lần). Vui lòng thử lại sau 15 phút."
}
```

---

### 1.3. Lấy thông tin tài khoản hiện tại (Get Current User)
- **Endpoint:** `GET /api/auth/me`
- **Quyền:** Private (Yêu cầu Token)
- **Headers:** `Authorization: Bearer <TOKEN>`

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công.",
  "data": {
    "user": {
      "id": 4,
      "username": "sv20220001",
      "email": "an.nv@student.edu.vn",
      "role": "student",
      "createdAt": "2026-10-05T06:38:34.000Z",
      "updatedAt": "2026-10-05T07:22:55.000Z",
      "studentProfile": {
        "id": 1,
        "studentCode": "SV20220001",
        "fullName": "Nguyễn Văn An",
        "gender": "male",
        "dob": "2004-03-15",
        "phone": "0912345601",
        "address": "Cầu Giấy, Hà Nội",
        "className": "CNTT1-K67",
        "faculty": "Công nghệ thông tin"
      }
    }
  }
}
```

---

## 2. Student Management Endpoints (Quản Lý Sinh Viên)

### 2.1. Lấy danh sách sinh viên (Get Students List)
- **Endpoint:** `GET /api/students`
- **Quyền:** Private (`admin`, `teacher`, `student`)
- **Query Parameters:**
  - `page`: Số trang hiện tại (Mặc định: `1`)
  - `limit`: Số bản ghi mỗi trang (Mặc định: `10`, tối đa: `100`)
  - `search`: Từ khóa tìm kiếm theo Họ tên hoặc Mã sinh viên (VD: `an` hoặc `SV2022`)
  - `class_id`: Lọc theo ID lớp học (VD: `1`, `2`)
  - `sortBy`: Cột sắp xếp (`id`, `student_code`, `full_name`, `dob`, `created_at` - Mặc định: `id`)
  - `order`: Chiều sắp xếp (`ASC` hoặc `DESC` - Mặc định: `DESC`)

- **Ví dụ Request:** `GET /api/students?page=1&limit=2&class_id=1&search=An`

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách sinh viên thành công.",
  "data": [
    {
      "id": 1,
      "student_code": "SV20220001",
      "full_name": "Nguyễn Văn An",
      "dob": "2004-03-15",
      "gender": "male",
      "email": "an.nv@student.edu.vn",
      "phone": "0912345601",
      "address": "Cầu Giấy, Hà Nội",
      "class_id": 1,
      "class_name": "CNTT1-K67",
      "faculty": "Công nghệ thông tin",
      "school_year": "2022-2026",
      "user_id": 4,
      "created_at": "2026-10-05T06:38:34.000Z",
      "updated_at": "2026-10-05T06:38:34.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 2,
    "totalPages": 1
  }
}
```

---

### 2.2. Lấy chi tiết sinh viên (Get Student By ID)
- **Endpoint:** `GET /api/students/:id`
- **Quyền:** Private (`admin`, `teacher`, `student`)
- **Ví dụ Request:** `GET /api/students/1`

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy thông tin sinh viên thành công.",
  "data": {
    "id": 1,
    "student_code": "SV20220001",
    "full_name": "Nguyễn Văn An",
    "dob": "2004-03-15",
    "gender": "male",
    "email": "an.nv@student.edu.vn",
    "phone": "0912345601",
    "address": "Cầu Giấy, Hà Nội",
    "class_id": 1,
    "class_name": "CNTT1-K67",
    "faculty": "Công nghệ thông tin",
    "school_year": "2022-2026",
    "user_id": 4,
    "linked_username": "sv20220001",
    "created_at": "2026-10-05T06:38:34.000Z",
    "updated_at": "2026-10-05T06:38:34.000Z",
    "grades": [
      {
        "enrollment_id": 13,
        "course_id": 4,
        "course_code": "INT1004",
        "course_name": "Lập trình Web nâng cao",
        "credits": 3,
        "semester": "2023.2",
        "score": "9.00"
      },
      {
        "enrollment_id": 1,
        "course_id": 1,
        "course_code": "INT1001",
        "course_name": "Nhập môn lập trình C/C++",
        "credits": 3,
        "semester": "2023.1",
        "score": "8.50"
      }
    ]
  }
}
```

- **Response `404 Not Found` (Khi ID không tồn tại):**
```json
{
  "success": false,
  "message": "Không tìm thấy sinh viên có ID: 999"
}
```

- **Quy tắc bảo vệ quyền riêng tư:**
  - `admin` và `teacher` luôn xem được đầy đủ thông tin cá nhân kèm mảng `grades` của sinh viên.
  - Khi người dùng có vai trò `student` xem thông tin của một sinh viên khác trong trường, mảng `grades` sẽ được tự động ẩn thành `[]` để bảo vệ kết quả học tập cá nhân. Sinh viên chỉ thấy điểm số trong hồ sơ của chính mình.

---

### 2.3. Thêm mới sinh viên (Create Student)
- **Endpoint:** `POST /api/students`
- **Quyền:** Private (**Chỉ Admin**)
- **Request Body:**
```json
{
  "student_code": "SV20220099",
  "full_name": "Phan Quốc Bảo",
  "dob": "2004-06-25",
  "gender": "male",
  "email": "bao.pq@student.edu.vn",
  "phone": "0987654321",
  "address": "Ba Đình, Hà Nội",
  "class_id": 1
}
```

- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Thêm mới sinh viên thành công!",
  "data": {
    "id": 21,
    "student_code": "SV20220099",
    "full_name": "Phan Quốc Bảo",
    "dob": "2004-06-25",
    "gender": "male",
    "email": "bao.pq@student.edu.vn",
    "phone": "0987654321",
    "address": "Ba Đình, Hà Nội",
    "class_id": 1,
    "class_name": "CNTT1-K67",
    "faculty": "Công nghệ thông tin",
    "school_year": "2022-2026",
    "user_id": null,
    "grades": []
  }
}
```

- **Response `409 Conflict` (Khi trùng student_code hoặc email):**
```json
{
  "success": false,
  "message": "Mã sinh viên 'SV20220099' đã tồn tại trong hệ thống."
}
```

- **Response `400 Bad Request` (Dữ liệu không đúng định dạng):**
```json
{
  "success": false,
  "message": "Dữ liệu sinh viên không hợp lệ.",
  "errors": [
    { "field": "email", "message": "Định dạng email không hợp lệ." },
    { "field": "dob", "message": "Ngày sinh không đúng định dạng YYYY-MM-DD." }
  ]
}
```

---

### 2.4. Cập nhật thông tin sinh viên (Update Student)
- **Endpoint:** `PUT /api/students/:id`
- **Quyền:** Private (**Chỉ Admin**)
- **Ví dụ Request:** `PUT /api/students/21`
- **Request Body:** (Chỉ cần gửi những trường cần cập nhật)
```json
{
  "full_name": "Phan Quốc Bảo (Đã cập nhật)",
  "phone": "0988889999",
  "address": "Cầu Giấy, Hà Nội"
}
```

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật thông tin sinh viên thành công!",
  "data": {
    "id": 21,
    "student_code": "SV20220099",
    "full_name": "Phan Quốc Bảo (Đã cập nhật)",
    "dob": "2004-06-25",
    "gender": "male",
    "email": "bao.pq@student.edu.vn",
    "phone": "0988889999",
    "address": "Cầu Giấy, Hà Nội",
    "class_id": 1,
    "class_name": "CNTT1-K67"
  }
}
```

---

### 2.5. Xóa sinh viên (Delete Student)
- **Endpoint:** `DELETE /api/students/:id`
- **Quyền:** Private (**Chỉ Admin**)
- **Ví dụ Request:** `DELETE /api/students/21`

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đã xóa sinh viên 'Phan Quốc Bảo' (SV20220099) thành công."
}
```

- **Response `403 Forbidden` (Khi tài khoản không phải Admin cố tình xóa):**
```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: [admin]. Quyền hiện tại của bạn: 'student'."
}
```

---

## 3. Class Management Endpoints (Quản Lý Lớp Học)

### 3.1. Lấy danh sách lớp học (Get Classes List)
- **Endpoint:** `GET /api/classes`
- **Quyền:** Private (Mọi user đã đăng nhập)
- **Query Parameters:**
  - `page`: Số trang (Mặc định: `1`)
  - `limit`: Số bản ghi mỗi trang (Mặc định: `10`)
  - `search`: Từ khóa tìm kiếm theo tên lớp (VD: `CNTT`)
  - `faculty`: Lọc theo tên khoa/viện (VD: `Công nghệ thông tin`)
  - `school_year`: Lọc theo niên khóa (VD: `2022-2026`)
  - `sortBy`: Cột sắp xếp (`id`, `class_name`, `faculty`, `school_year`, `student_count`)
  - `order`: `ASC` hoặc `DESC` (Mặc định: `DESC`)

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách lớp học thành công.",
  "data": [
    {
      "id": 1,
      "class_name": "CNTT1-K67",
      "faculty": "Công nghệ thông tin",
      "school_year": "2022-2026",
      "created_at": "2026-10-05T06:38:34.000Z",
      "student_count": 5
    }
  ],
  "pagination": {
    "total": 4,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 3.2. Lấy chi tiết lớp học (Get Class By ID)
- **Endpoint:** `GET /api/classes/:id`
- **Quyền:** Private (Mọi user đã đăng nhập)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy chi tiết lớp học thành công.",
  "data": {
    "id": 1,
    "class_name": "CNTT1-K67",
    "faculty": "Công nghệ thông tin",
    "school_year": "2022-2026",
    "created_at": "2026-10-05T06:38:34.000Z",
    "student_count": 5
  }
}
```

---

### 3.3. Lấy danh sách sinh viên của lớp (Get Students of Class)
- **Endpoint:** `GET /api/classes/:id/students`
- **Quyền:** Private (Mọi user đã đăng nhập)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách sinh viên lớp 'CNTT1-K67' thành công.",
  "class": {
    "id": 1,
    "class_name": "CNTT1-K67",
    "faculty": "Công nghệ thông tin",
    "school_year": "2022-2026",
    "student_count": 5
  },
  "data": [
    {
      "id": 1,
      "student_code": "SV20220001",
      "full_name": "Nguyễn Văn An",
      "dob": "2004-03-15",
      "gender": "male",
      "email": "an.nv@student.edu.vn",
      "phone": "0912345601",
      "address": "Cầu Giấy, Hà Nội"
    }
  ],
  "total": 5
}
```

---

### 3.4. Thêm mới lớp học (Create Class)
- **Endpoint:** `POST /api/classes`
- **Quyền:** Private (**Chỉ Admin**)
- **Request Body:**
```json
{
  "class_name": "KTPM2-K67",
  "faculty": "Kỹ thuật phần mềm",
  "school_year": "2022-2026"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Thêm mới lớp học thành công!",
  "data": {
    "id": 5,
    "class_name": "KTPM2-K67",
    "faculty": "Kỹ thuật phần mềm",
    "school_year": "2022-2026",
    "created_at": "2026-10-05T07:45:00.000Z",
    "student_count": 0
  }
}
```
- **Response `409 Conflict` (Trùng tên lớp):**
```json
{
  "success": false,
  "message": "Tên lớp 'KTPM2-K67' đã tồn tại trong hệ thống. Vui lòng chọn tên khác."
}
```

---

### 3.5. Cập nhật thông tin lớp học (Update Class)
- **Endpoint:** `PUT /api/classes/:id`
- **Quyền:** Private (**Chỉ Admin**)
- **Request Body:**
```json
{
  "faculty": "Kỹ thuật phần mềm ứng dụng"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật thông tin lớp học thành công!",
  "data": {
    "id": 5,
    "class_name": "KTPM2-K67",
    "faculty": "Kỹ thuật phần mềm ứng dụng",
    "school_year": "2022-2026"
  }
}
```

---

### 3.6. Xóa lớp học (Delete Class)
- **Endpoint:** `DELETE /api/classes/:id`
- **Quyền:** Private (**Chỉ Admin**)

- **Response `409 Conflict` (Khi lớp vẫn còn sinh viên):**
```json
{
  "success": false,
  "message": "Không thể xóa lớp 'CNTT1-K67' vì hiện đang có 5 sinh viên trực thuộc. Vui lòng chuyển hoặc xóa các sinh viên này trước khi xóa lớp.",
  "student_count": 5
}
```

- **Response `200 OK` (Khi lớp không có sinh viên):**
```json
{
  "success": true,
  "message": "Đã xóa lớp học 'KTPM2-K67' thành công."
}
```

---

## 4. Course Management Endpoints (Quản Lý Môn Học)

### 4.1. Lấy danh sách môn học (Get Courses List)
- **Endpoint:** `GET /api/courses`
- **Quyền:** Private (Mọi user đã đăng nhập)
- **Query Parameters:**
  - `page`: Số trang (Mặc định: `1`)
  - `limit`: Số bản ghi mỗi trang (Mặc định: `10`)
  - `search`: Từ khóa tìm theo mã môn hoặc tên môn (VD: `INT` hoặc `Lập trình`)
  - `sortBy`: Cột sắp xếp (`id`, `course_code`, `course_name`, `credits`, `enrollment_count`)
  - `order`: `ASC` hoặc `DESC` (Mặc định: `DESC`)

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách môn học thành công.",
  "data": [
    {
      "id": 1,
      "course_code": "INT1001",
      "course_name": "Nhập môn lập trình C/C++",
      "credits": 3,
      "created_at": "2026-10-05T06:38:34.000Z",
      "enrollment_count": 8
    }
  ],
  "pagination": {
    "total": 6,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 4.2. Lấy chi tiết môn học (Get Course By ID)
- **Endpoint:** `GET /api/courses/:id`
- **Quyền:** Private (Mọi user đã đăng nhập)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy thông tin môn học thành công.",
  "data": {
    "id": 1,
    "course_code": "INT1001",
    "course_name": "Nhập môn lập trình C/C++",
    "credits": 3,
    "created_at": "2026-10-05T06:38:34.000Z",
    "enrollment_count": 8
  }
}
```

---

### 4.3. Thêm mới môn học (Create Course)
- **Endpoint:** `POST /api/courses`
- **Quyền:** Private (**Chỉ Admin**)
- **Request Body:**
```json
{
  "course_code": "INT1099",
  "course_name": "Trí tuệ nhân tạo và Machine Learning",
  "credits": 4
}
```
*(Ghi chú: `credits` phải là số nguyên từ 1 đến 6)*

- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Thêm mới môn học thành công!",
  "data": {
    "id": 7,
    "course_code": "INT1099",
    "course_name": "Trí tuệ nhân tạo và Machine Learning",
    "credits": 4,
    "created_at": "2026-10-05T07:50:00.000Z",
    "enrollment_count": 0
  }
}
```

- **Response `409 Conflict` (Trùng mã môn học):**
```json
{
  "success": false,
  "message": "Mã môn học 'INT1099' đã tồn tại trong hệ thống. Vui lòng chọn mã khác."
}
```

- **Response `400 Bad Request` (Số tín chỉ không hợp lệ):**
```json
{
  "success": false,
  "message": "Dữ liệu môn học không hợp lệ.",
  "errors": [
    { "field": "credits", "message": "Số tín chỉ phải là số nguyên từ 1 đến 6." }
  ]
}
```

---

### 4.4. Cập nhật thông tin môn học (Update Course)
- **Endpoint:** `PUT /api/courses/:id`
- **Quyền:** Private (**Chỉ Admin**)
- **Request Body:**
```json
{
  "course_name": "Trí tuệ nhân tạo ứng dụng",
  "credits": 3
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật thông tin môn học thành công!",
  "data": {
    "id": 7,
    "course_code": "INT1099",
    "course_name": "Trí tuệ nhân tạo ứng dụng",
    "credits": 3
  }
}
```

---

### 4.5. Xóa môn học (Delete Course)
- **Endpoint:** `DELETE /api/courses/:id`
- **Quyền:** Private (**Chỉ Admin**)

- **Response `409 Conflict` (Khi môn đã có sinh viên đăng ký/có điểm):**
```json
{
  "success": false,
  "message": "Không thể xóa môn học 'Nhập môn lập trình C/C++' (INT1001) vì hiện đang có 8 lượt sinh viên đăng ký / có điểm. Vui lòng xử lý dữ liệu điểm số trước khi xóa môn.",
  "enrollment_count": 8
}
```

- **Response `200 OK` (Khi môn chưa có sinh viên đăng ký):**
```json
{
  "success": true,
  "message": "Đã xóa môn học 'Trí tuệ nhân tạo ứng dụng' (INT1099) thành công."
}
```

---

## 5. Grades & Transcript Endpoints (Quản Lý Điểm Số & Bảng Điểm)

### 5.1. Lấy danh sách điểm (Get Grades List)
- **Endpoint:** `GET /api/grades`
- **Quyền:** Private (Mọi user; **Role student tự động chỉ xem được điểm của chính mình**)
- **Query Parameters:**
  - `page`: Số trang (Mặc định: `1`)
  - `limit`: Số bản ghi mỗi trang (Mặc định: `10`)
  - `student_id`: Lọc theo ID sinh viên
  - `course_id`: Lọc theo ID môn học
  - `semester`: Lọc theo học kỳ (VD: `2023.1`)
  - `sortBy`: Cột sắp xếp (`id`, `score`, `semester`, `student_code`, `full_name`, `course_code`)
  - `order`: `ASC` hoặc `DESC` (Mặc định: `DESC`)

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách điểm thành công.",
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "student_code": "SV20220001",
      "student_name": "Nguyễn Văn An",
      "class_name": "CNTT1-K67",
      "course_id": 1,
      "course_code": "INT1001",
      "course_name": "Nhập môn lập trình C/C++",
      "credits": 3,
      "semester": "2023.1",
      "score": "8.50"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### 5.2. Lấy bảng điểm chi tiết của một sinh viên kèm GPA
- **Endpoint:** `GET /api/students/:id/grades` *(hoặc `GET /api/grades/student/:id`)*
- **Quyền:** Private (Admin, Teacher hoặc **chính sinh viên sở hữu tài khoản**)
- **Quy tắc bảo mật:** Nếu role là `student` và truy cập ID của sinh viên khác -> Trả về **403 Forbidden**.

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy bảng điểm của sinh viên 'Nguyễn Văn An' thành công.",
  "student": {
    "id": 1,
    "student_code": "SV20220001",
    "full_name": "Nguyễn Văn An",
    "class_id": 1
  },
  "summary": {
    "gpa10": 8.46,
    "gpa4": 3.69,
    "totalRegisteredCredits": 16,
    "totalGradedCredits": 13,
    "passedCredits": 13,
    "classification": "Giỏi"
  },
  "transcript": [
    {
      "enrollment_id": 1,
      "course_id": 1,
      "course_code": "INT1001",
      "course_name": "Nhập môn lập trình C/C++",
      "credits": 3,
      "semester": "2023.1",
      "score": "8.50",
      "grade_point_4": 4,
      "letter_grade": "A"
    },
    {
      "enrollment_id": 20,
      "course_id": 5,
      "course_code": "INT1005",
      "course_name": "Mạng máy tính",
      "credits": 3,
      "semester": "2024.1",
      "score": null,
      "grade_point_4": null,
      "letter_grade": null
    }
  ]
}
```

---

### 5.3. Nhập điểm mới (Create Grade)
- **Endpoint:** `POST /api/grades`
- **Quyền:** Private (**Admin hoặc Teacher**)
- **Request Body:**
```json
{
  "student_id": 1,
  "course_id": 6,
  "semester": "2024.1",
  "score": 9.25
}
```
*(Ghi chú: `score` từ 0.00 đến 10.00; nếu môn đang học có thể truyền `null`)*

- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Nhập điểm học phần thành công!",
  "data": {
    "id": 24,
    "student_id": 1,
    "course_id": 6,
    "semester": "2024.1",
    "score": "9.25"
  }
}
```

- **Response `404 Not Found` (Khi `student_id` hoặc `course_id` không tồn tại):**
```json
{
  "success": false,
  "message": "Sinh viên có ID: 9999 không tồn tại trong hệ thống."
}
```

- **Response `409 Conflict` (Khi sinh viên đã có điểm môn này trong kỳ):**
```json
{
  "success": false,
  "message": "Sinh viên 'Nguyễn Văn An' đã có bản ghi môn 'Nhập môn lập trình C/C++' trong học kỳ '2023.1'. Vui lòng dùng chức năng cập nhật (PUT)."
}
```

---

### 5.4. Cập nhật điểm số (Update Grade)
- **Endpoint:** `PUT /api/grades/:id`
- **Quyền:** Private (**Admin hoặc Teacher**)
- **Request Body:**
```json
{
  "score": 9.50
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật điểm số thành công!",
  "data": {
    "id": 24,
    "student_id": 1,
    "course_id": 6,
    "semester": "2024.1",
    "score": "9.50"
  }
}
```

---

### 5.5. Xóa bản ghi điểm (Delete Grade)
- **Endpoint:** `DELETE /api/grades/:id`
- **Quyền:** Private (**Admin hoặc Teacher**)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đã xóa bản ghi điểm môn 'Kiến trúc máy tính và Hệ điều hành' của sinh viên 'Nguyễn Văn An' thành công."
}
```

---

## 6. Statistics & Dashboard Endpoints (Thống Kê Hệ Thống)

### 6.1. Lấy dữ liệu thống kê Dashboard (Get System Statistics)
- **Endpoint:** `GET /api/stats`
- **Quyền:** Private (Yêu cầu đăng nhập - Phân quyền tự động theo vai trò của tài khoản)
- **Headers:** `Authorization: Bearer <TOKEN>`

#### Trường hợp A: Dành cho Admin và Teacher (Thống kê toàn trường)
Hệ thống tổng hợp dữ liệu tổng quan, số sinh viên từng lớp (phục vụ vẽ biểu đồ cột) và điểm trung bình theo từng môn học.

- **Response `200 OK`:**
```json
{
  "success": true,
  "role": "admin",
  "message": "Lấy dữ liệu thống kê hệ thống thành công.",
  "data": {
    "overview": {
      "totalStudents": 20,
      "totalClasses": 4,
      "totalCourses": 6,
      "totalGrades": 24,
      "overallAvgScore": 7.82
    },
    "studentsPerClass": [
      {
        "class_id": 1,
        "class_name": "CNTT1-K67",
        "faculty": "Công nghệ thông tin",
        "school_year": "2022-2026",
        "student_count": 5
      },
      {
        "class_id": 2,
        "class_name": "CNTT2-K67",
        "faculty": "Công nghệ thông tin",
        "school_year": "2022-2026",
        "student_count": 5
      },
      {
        "class_id": 3,
        "class_name": "KTPM1-K67",
        "faculty": "Kỹ thuật phần mềm",
        "school_year": "2022-2026",
        "student_count": 5
      },
      {
        "class_id": 4,
        "class_name": "HTTT1-K67",
        "faculty": "Hệ thống thông tin",
        "school_year": "2022-2026",
        "student_count": 5
      }
    ],
    "avgScorePerCourse": [
      {
        "course_id": 1,
        "course_code": "INT1001",
        "course_name": "Nhập môn lập trình C/C++",
        "credits": 3,
        "avg_score": 8.15,
        "graded_count": 4,
        "total_enrolled": 4
      },
      {
        "course_id": 2,
        "course_code": "INT1002",
        "course_name": "Cấu trúc dữ liệu và giải thuật",
        "credits": 4,
        "avg_score": 7.45,
        "graded_count": 4,
        "total_enrolled": 4
      }
    ]
  }
}
```

#### Trường hợp B: Dành cho Student (Kết quả học tập cá nhân)
Nếu tài khoản có vai trò `student`, API tự động nhận diện `user_id` và chỉ trả về thông tin lớp học, số bạn cùng lớp, GPA tích lũy và danh sách điểm các môn của chính sinh viên đó.

- **Response `200 OK`:**
```json
{
  "success": true,
  "role": "student",
  "message": "Lấy dữ liệu thống kê sinh viên thành công.",
  "data": {
    "isLinked": true,
    "studentInfo": {
      "id": 1,
      "student_code": "SV20220001",
      "full_name": "Nguyễn Văn An",
      "class_id": 1,
      "class_name": "CNTT1-K67",
      "faculty": "Công nghệ thông tin",
      "school_year": "2022-2026",
      "classmates_count": 5
    },
    "summary": {
      "totalCourses": 6,
      "passedCourses": 5,
      "totalRegisteredCredits": 19,
      "passedCredits": 16,
      "gpa10": 8.46,
      "gpa4": 3.69,
      "classification": "Giỏi"
    },
    "scoresPerCourse": [
      {
        "course_id": 1,
        "course_code": "INT1001",
        "course_name": "Nhập môn lập trình C/C++",
        "credits": 3,
        "semester": "2023.1",
        "score": 8.5,
        "letter_grade": "A",
        "grade4": 4.0
      },
      {
        "course_id": 4,
        "course_code": "INT1004",
        "course_name": "Lập trình Web nâng cao",
        "credits": 3,
        "semester": "2023.2",
        "score": 9.0,
        "letter_grade": "A",
        "grade4": 4.0
      }
    ]
  }
}
```

---

## 7. System & Health Check Endpoints

### 7.1. Chào mừng hệ thống (Root Endpoint)
- **Endpoint:** `GET /`
- **Quyền:** Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Chào mừng bạn đến với API Hệ Thống Quản Lý Sinh Viên!",
  "version": "1.0.0",
  "documentation": "/api/health"
}
```

---

### 7.2. Kiểm tra sức khỏe hệ thống (Health Check)
- **Endpoint:** `GET /api/health`
- **Quyền:** Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "service": "Student Management System API",
  "status": "healthy",
  "timestamp": "2026-10-06T02:40:00.000Z",
  "uptime": "342.1s",
  "environment": "development",
  "database": {
    "type": "MySQL",
    "name": "qlsv_db",
    "connected": true,
    "message": "Kết nối MySQL thành công!"
  }
}
```

---

## 8. Quy Chuẩn Kỹ Thuật & Bảo Mật (Security Policies)

Hệ thống tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật hiện đại:

1. **Bảo mật HTTP Headers với Helmet:**
   - Tự động thiết lập các tiêu đề HTTP an toàn (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`,...).
2. **Kiểm soát Nguồn gốc (Strict CORS):**
   - Chỉ cho phép các yêu cầu HTTP từ các địa chỉ được cấu hình trong `CLIENT_URL` (ví dụ: `http://localhost:5173`). Các domain khác bị từ chối truy cập ngay lập tức.
3. **Phòng chống tấn công dò mật khẩu (Brute Force Protection):**
   - Áp dụng `express-rate-limit` vào endpoint `POST /api/auth/login`: Tối đa **5 lần yêu cầu trong 15 phút** từ cùng 1 địa chỉ IP. Trả về `429 Too Many Requests` khi vi phạm.
4. **Chống tấn công SQL Injection:**
   - 100% câu truy vấn cơ sở dữ liệu qua `mysql2` đều sử dụng Prepared Statements (`?` parameter placeholders).
   - Tham số sắp xếp `sortBy` được đối chiếu qua Whitelist tĩnh (`ALLOWED_SORT_COLUMNS`) trước khi chèn vào `ORDER BY`.
5. **Bảo vệ dữ liệu nhạy cảm (Zero Sensitive Leakage):**
   - Tuyệt đối không trả `password_hash` về client trong bất kỳ endpoint nào (`/login`, `/register`, `/me`,...).
   - Xóa bỏ hoàn toàn `stack trace` trong phản hồi lỗi gửi về client để tránh rò rỉ cấu trúc hệ thống.
6. **Xác thực cấu hình Fail-fast:**
   - Khởi động server sẽ kiểm tra biến môi trường `JWT_SECRET`; nếu thiếu sẽ báo lỗi rõ ràng và dừng tiến trình (`process.exit(1)`) để ngăn ngừa lỗ hổng bảo mật.
7. **Phân quyền đa tầng (RBAC - Role-Based Access Control):**
   - Phân cấp 3 vai trò: `admin`, `teacher`, `student` với middleware `verifyToken` và `authorizeRoles` được gắn chặt chẽ trên từng route API.
