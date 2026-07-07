# Smart Finance - Development Roadmap (7 Days)

> **Project:** Smart Finance
>
> **Duration:** 7 Days
>
> **Architecture:** ReactJS + TypeScript + Spring Boot + SQLite
>
> **Development Method:** Agile Sprint (MVP)

---
# Day 1 - Planning & Project Initialization
## Objectives
* Phân tích yêu cầu
* Thiết kế hệ thống
* Khởi tạo Backend
* Khởi tạo Frontend

## Backend
* Khởi tạo Spring Boot Project
* Cấu hình Gradle
* Cấu hình SQLite
* Cấu hình Spring Security
* Cấu hình JWT
* Tạo cấu trúc thư mục
* Tạo Base Entity
* Cấu hình Global Exception
* Cấu hình Validation

## Frontend
* Khởi tạo Vite + React + TypeScript
* Cài đặt Router
* Cài đặt Redux Toolkit
* Cài đặt Axios
* Cài đặt TailwindCSS
* Thiết lập cấu trúc thư mục
* Thiết lập Theme
* Thiết kế Layout
* Sidebar
* Header
* Routing

## Deliverables
* Project chạy được
* Cấu trúc thư mục hoàn chỉnh
* UI Layout hoàn chỉnh
* Backend khởi tạo thành công

---
# Day 2 - Authentication Module
## Backend
* Register
* Login
* JWT
* Refresh Token
* Logout
* User Profile

## Frontend
* Login Page
* Register Page
* Protected Route
* Authentication Guard
* Lưu Access Token
* Axios Interceptor

## Testing
* Đăng nhập
* Đăng ký
* Token
* Refresh Token

## Deliverables
* Người dùng đăng nhập được
* Chuyển trang sau khi Login
* JWT hoạt động

---
# Day 3 - Category & Income Module
## Backend
Category
* CRUD
* Validation

Income
* CRUD
* Search
* Pagination

## Frontend
Category Page
* Table
* Modal
* Form

Income Page
* Table
* Search
* Modal
* Pagination

## Testing
* CRUD Category
* CRUD Income

## Deliverables
* Quản lý danh mục
* Quản lý thu nhập

---
# Day 4 - Expense Module
## Backend
Expense
* CRUD
* Search
* Pagination

## Frontend
Expense Page
* Table
* Modal
* Search
* Pagination

## Testing
* CRUD Expense
* Validation
* Error Handling

## Deliverables
* Quản lý chi tiêu hoàn chỉnh

---
# Day 5 - Dashboard & Statistics
## Backend
Dashboard API
* Tổng thu
* Tổng chi
* Tổng số dư
* Giao dịch gần đây

Statistics API
* Theo tháng
* Theo năm
* Theo danh mục

## Frontend
Dashboard
* Summary Cards
* Recent Transactions

Statistics
* Pie Chart
* Bar Chart
* Line Chart

## Testing
* Dashboard
* Charts

## Deliverables
* Dashboard hoạt động
* Biểu đồ hiển thị dữ liệu

---
# Day 6 - Profile & UI Refinement
## Backend
* Cập nhật Profile
* Đổi mật khẩu
* Upload Avatar (nếu triển khai)

## Frontend
* Profile Page
* Responsive
* Dark Mode
* Glassmorphism
* Loading
* Empty State
* Toast Notification
* Confirmation Dialog

## Testing
* Responsive
* Dark Mode
* Profile

## Deliverables
* Giao diện hoàn thiện
* Responsive trên Desktop và Mobile

---
# Day 7 - Integration, Testing & Documentation
## Integration
* Kiểm tra toàn bộ API
* Kiểm tra Redux
* Kiểm tra Axios
* Kiểm tra Routing

## Testing
* Authentication
* Category
* Income
* Expense
* Dashboard
* Statistics
* Profile

## Optimization
* Refactor
* Clean Code
* Xóa code thừa
* Kiểm tra Naming Convention
* Tối ưu Component
* Kiểm tra Validation

## Documentation
Hoàn thiện:
* README.md
* SRS.md
* Prompt-Chain.md
* Architecture.md
* System-Flow.md
* Changelog.md

## Final Checklist
### Backend
* Authentication
* Category CRUD
* Income CRUD
* Expense CRUD
* Dashboard API
* Statistics API
* Validation
* Exception Handler

### Frontend
* Login
* Register
* Dashboard
* Income
* Expense
* Category
* Statistics
* Profile
* Responsive
* Dark Mode

### Documentation
* README
* SRS
* Prompt Chain
* Development Notes
* Architecture
* System Flow

---
# MVP Completion Criteria
Dự án được coi là hoàn thành khi đáp ứng các điều kiện sau:
* Người dùng có thể đăng ký và đăng nhập bằng JWT.
* Quản lý được danh mục, thu nhập và chi tiêu.
* Dashboard hiển thị tổng quan tài chính.
* Thống kê bằng biểu đồ hoạt động chính xác.
* Giao diện hiện đại, responsive, hỗ trợ Dark Mode.
* Toàn bộ API được kết nối thành công với Frontend.
* Tài liệu dự án đầy đủ và có thể triển khai theo hướng mở rộng trong các phiên bản tiếp theo.
