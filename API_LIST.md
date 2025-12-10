# Danh sách API Backend

Do công cụ Swagger gặp lỗi tương thích phiên bản trên máy của bạn, mình đã tổng hợp danh sách các API hiện có trong hệ thống để bạn tiện tra cứu khi code:

## 1. Auth (Xác thực) - `/api/auth`
*Base URL: http://localhost:8081*

| Method | Endpoint | Mô tả | Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Đăng ký tài khoản mới | JSON: `{ "email": "...", "password": "...", "hoTen": "...", "soDienThoai": "...", "role": "SINH_VIEN/CVHT" }` |
| **POST** | `/api/auth/login` | Đăng nhập | JSON: `{ "email": "...", "password": "..." }` |
| **POST** | `/api/auth/profile/update` | Cập nhật hồ sơ (Lớp/Chuyên môn) | JSON: `{ "maLop": "...", "chuyenMon": "..." }` <br> *(Yêu cầu Token)* |

## 2. Setup (Cài đặt ban đầu) - `/api/setup`
| Method | Endpoint | Mô tả | Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/setup/create-admin` | Tạo tài khoản Admin mặc định | JSON: `{ "email": "...", "password": "..." }` |

## 3. Câu Hỏi (Question) - `/api/questions`
*Yêu cầu Token cho hầu hết các thao tác*

| Method | Endpoint | Mô tả | Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/questions` | Tạo câu hỏi mới | **Multipart/form-data**: <br> - `tieuDe` (text) <br> - `noiDung` (text) <br> - `linhVuc` (text) <br> - `file` (file, optional) |
| **GET** | `/api/questions` | Lấy danh sách câu hỏi (có phân trang) | Params: `?page=0&size=10&keyword=...&linhVuc=...` |
| **GET** | `/api/questions/{id}` | Xem chi tiết câu hỏi theo ID | Path Variable: `id` |
| **GET** | `/api/questions/{id}/file` | Tải file đính kèm của câu hỏi | Path Variable: `id` |
| **PUT** | `/api/questions/{id}` | Cập nhật câu hỏi | Path Variable: `id` <br> Body: Multipart như phần Tạo |
| **POST** | `/api/questions/{id}/answer` | Trả lời câu hỏi (Dành cho CVHT) | Path Variable: `id` <br> **Multipart/form-data**: <br> - `noiDung` (text) <br> - `file` (file, optional) |
| **GET** | `/api/questions/{id}/answers` | Xem lịch sử các câu trả lời | Path Variable: `id` |
| **GET** | `/api/questions/{id}/latest-answer` | Xem câu trả lời mới nhất (nếu có) | Path Variable: `id` |
| **GET** | `/api/questions/versions/{vid}/file` | Tải file đính kèm của câu trả lời | Path Variable: `vid` (Version ID) |

## 4. Quản lý Lớp (Admin) - `/api/classes`
| Method | Endpoint | Mô tả | Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/classes/create` | Tạo lớp mới | JSON: `{ "maLop": "...", "tenLop": "...", "khoa": "..." }` |

## 5. Báo cáo (Admin) - `/api/reports`
| Method | Endpoint | Mô tả | Body / Params |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/reports/dashboard` | Lấy số liệu thống kê dashboard | - |
| **GET** | `/api/reports/export/pdf` | Xuất báo cáo ra file PDF | - |
