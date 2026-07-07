# Smart Finance
# Prompt Chain

Version: 1.0

---

# Global Prompt (Áp dụng cho toàn bộ dự án)

Bạn là Senior Fullstack Developer có hơn 10 năm kinh nghiệm.

Hãy xây dựng dự án Smart Finance theo từng bước.

Các yêu cầu bắt buộc:

- Không được bỏ qua yêu cầu trước đó.
- Không tự ý thay đổi kiến trúc đã thống nhất.
- Không sinh mã ngoài phạm vi prompt hiện tại.
- Nếu cần chỉnh sửa file cũ thì chỉ chỉnh sửa tối thiểu.
- Luôn tuân thủ Clean Code.
- Tuân thủ SOLID.
- Tuân thủ RESTful API.
- Sử dụng DTO.
- Sử dụng Mapper.
- Không viết business trong Controller.
- Validate dữ liệu đầy đủ.
- Có xử lý Exception.
- Có comment ngắn khi cần.
- Mỗi lần hoàn thành phải giải thích những file đã tạo.
- Không tạo code dư thừa.

Frontend

- ReactJS
- TypeScript
- Vite
- TailwindCSS
- Redux Toolkit
- Axios
- React Router
- Lucide React

Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- SQLite
- JWT
- Gradle
- Lombok
- MapStruct

UI

Modern Dashboard

Tone màu

- Neon Blue
- Black
- Glassmorphism

---

# Prompt 01

Phân tích toàn bộ yêu cầu dự án.

Xác định

- Phạm vi MVP
- Chức năng
- Danh sách màn hình
- Danh sách API
- Danh sách Entity
- Kiến trúc tổng thể

Không sinh code.

---

# Prompt 02

Thiết kế toàn bộ tầng dữ liệu của dự án Smart Finance.

Yêu cầu:

1. Phân tích các thực thể cần có trong hệ thống.

2. Xác định mối quan hệ giữa các Entity.

3. Thiết kế Entity theo chuẩn JPA.

4. Mỗi Entity phải bao gồm:

- Các thuộc tính
- Kiểu dữ liệu
- Validation Annotation
- Relationship Annotation
- Fetch Type
- Cascade Type
- Naming Convention

5. Thiết kế Enum nếu cần.

6. Thiết kế BaseEntity nếu phù hợp.

7. Sinh đầy đủ source code cho:

- Entity
- Enum
- BaseEntity

8. Sau khi hoàn thành Entity, tạo dữ liệu mẫu (Seed Data) bằng Java.

Yêu cầu Seed Data:

- Không sử dụng file SQL.
- Không sử dụng import CSV.
- Không sử dụng Flyway Seed.
- Sử dụng Java (CommandLineRunner hoặc ApplicationRunner).
- Seed dữ liệu khi ứng dụng khởi động.
- Kiểm tra dữ liệu tồn tại trước khi Seed để tránh trùng lặp.

9. Sinh dữ liệu mẫu hợp lý cho:

User

Category

Income

Expense

10. Dữ liệu mẫu phải phản ánh đúng nghiệp vụ Smart Finance.

Ví dụ:

Category

- Salary
- Food
- Transport
- Shopping
- Entertainment
- Health

Income

- Salary
- Bonus
- Freelance

Expense

- Coffee
- Lunch
- Electricity
- Netflix
- Shopping

11. Sau khi hoàn thành hãy giải thích:

- Quan hệ giữa các Entity.
- Lý do lựa chọn kiểu dữ liệu.
- Chiến lược Seed Data.
- Luồng khởi tạo dữ liệu của hệ thống.

Không tạo Repository, Service hoặc Controller ở bước này.

---

# Prompt 03

Thiết kế Backend Architecture.

Bao gồm

- Folder
- Package
- Dependency
- Layer
- Naming Convention

Không code.

---

# Prompt 04

Thiết kế Frontend Architecture.

Bao gồm

- Folder
- Component
- Layout
- Hook
- Store
- Route
- Service
- Asset

Không code.

---

# Prompt 05

Khởi tạo Spring Boot.

Tạo

- build.gradle
- application.yml
- package
- cấu trúc project
- dependency

Chưa viết nghiệp vụ.

---

# Prompt 06

Xây dựng Authentication.

Bao gồm

- Register
- Login
- JWT
- Refresh Token
- Logout
- User Profile

Backend hoàn chỉnh.

Sinh đầy đủ Entity, DTO, Repository, Service, Controller.

---

# Prompt 07

Xây dựng Global Exception.

Bao gồm

- Exception
- Response Wrapper
- Validation

---

# Prompt 08

Xây dựng Category Module.

CRUD đầy đủ.

Bao gồm

- Entity
- DTO
- Mapper
- Repository
- Service
- Controller

---

# Prompt 09

Xây dựng Income Module.

CRUD

Search

Pagination

Validation

---

# Prompt 10

Xây dựng Expense Module.

CRUD

Search

Pagination

Validation

---

# Prompt 11

Xây dựng Dashboard API.

Bao gồm

- Tổng thu
- Tổng chi
- Tổng số dư
- 5 giao dịch gần nhất
- Thu tháng
- Chi tháng

---

# Prompt 12

Xây dựng Statistics API.

Bao gồm

Theo

- tháng
- năm
- category

Chuẩn bị dữ liệu cho Recharts.

---

# Prompt 13

Refactor Backend.

Kiểm tra

- SOLID
- Clean Code
- Duplicate Code
- Naming
- Performance

Không thay đổi API.

---

# Prompt 14

Khởi tạo React Project.

Cài đặt

- Router
- Redux Toolkit
- Axios
- Tailwind

Sinh cấu trúc thư mục.

---

# Prompt 15

Thiết kế Layout.

Bao gồm

- Sidebar
- Header
- Footer
- Dashboard Layout
- Responsive

Không kết nối API.

---

# Prompt 16

Thiết kế Authentication UI.

Bao gồm

- Login
- Register

Validation.

---

# Prompt 17

Thiết kế Dashboard UI.

Hiển thị

- Card
- Pie Chart
- Bar Chart
- Recent Transaction

Chưa gọi API.

---

# Prompt 18

Thiết kế Income Page.

CRUD

Table

Modal

Search

Pagination

---

# Prompt 19

Thiết kế Expense Page.

CRUD

Table

Modal

Search

Pagination

---

# Prompt 20

Thiết kế Category Page.

CRUD

Table

Modal

---

# Prompt 21

Thiết kế Statistics Page.

Sử dụng Recharts.

Hiển thị

- Pie Chart
- Bar Chart
- Line Chart

---

# Prompt 22

Kết nối toàn bộ Frontend với Backend.

Yêu cầu

- Axios Instance
- JWT Interceptor
- Refresh Token
- Redux
- Loading
- Error Handling

---

# Prompt 23

Kiểm thử toàn bộ hệ thống.

Kiểm tra

- API
- Authentication
- CRUD
- Validation
- Responsive
- Dark Mode

Liệt kê lỗi nếu có.

---

# Prompt 24

Refactor toàn bộ dự án.

Kiểm tra

- Clean Code
- Naming
- Performance
- Folder
- Reusable Component
- Duplicate Code

Không thay đổi giao diện.

---

# Prompt 25

Sinh tài liệu cuối cùng.

Bao gồm

- README.md
- Hướng dẫn cài đặt
- API Document
- Cấu trúc thư mục
- Công nghệ sử dụng
- Hướng phát triển Version 2

Không thay đổi source code.