# Smart Finance
## Project Scope & Technical Specification

> Version: 1.0
> Timeline: 7 Days
> Architecture: Fullstack (ReactJS + Spring Boot REST API)

---
# 1. Project Overview
Smart Finance là hệ thống quản lý tài chính cá nhân giúp người dùng theo dõi thu nhập, chi tiêu và thống kê tài chính trực quan.

Mục tiêu của dự án:
- Xây dựng REST API theo chuẩn Spring Boot
- Thiết kế giao diện hiện đại
- Áp dụng JWT Authentication
- Dashboard trực quan
- Dễ mở rộng trong tương lai

---
# 2. Project Scope
Trong phạm vi 1 tuần chỉ xây dựng các module MVP.

## Authentication
- Register
- Login
- JWT Authentication
- Refresh Token
- Logout
- Profile

---
## Dashboard
Hiển thị
- Tổng số dư
- Thu nhập tháng
- Chi tiêu tháng
- Tiết kiệm
- Giao dịch gần đây
- Biểu đồ thống kê

---
## Income
- Thêm khoản thu
- Chỉnh sửa
- Xóa
- Danh sách
- Tìm kiếm

---
## Expense
- Thêm khoản chi
- Chỉnh sửa
- Xóa
- Danh sách
- Tìm kiếm

---
## Category
- CRUD Category
- Category Income
- Category Expense

---
## Statistics
- Theo tháng
- Theo năm
- Theo danh mục
- Pie Chart
- Bar Chart
- Line Chart

---
## User Profile
- Thông tin cá nhân
- Avatar
- Đổi mật khẩu

---
# 3. Out of Scope (Version 2)
Không thực hiện trong phạm vi dự án.
- AI Financial Assistant
- OCR hóa đơn
- Đồng bộ ngân hàng
- Notification
- Email
- Chia sẻ ví
- Multi Currency
- Export Excel/PDF
- Kafka
- RabbitMQ
- Microservice

---
# 4. Frontend Technology
## Framework
- ReactJS
- TypeScript
- Vite
## Router
- React Router DOM

## HTTP Client
- Axios

## State Management
- Redux Toolkit

## UI
- Tailwind CSS

## Icon
- Lucide React

## Chart
- Recharts

## Notification
- Sonner

## Loading
- React Spinners

## Form Validation
- React Hook Form
- Zod

---
# 5. Backend Technology
Ngôn ngữ
- Java 21

Framework
- Spring Boot

Modules
- Spring Web
- Spring Security
- Spring Data JPA
- Spring Validation

Security
- JWT Authentication
- CORS Configuration
- Password Encoder (BCrypt)

Database
- SQLite

Build Tool
- Gradle

Utilities
- Lombok
- MapStruct

Development
- Docker
- Postman

---
# 6. Coding Architecture
## Backend
```
controller
service
service/impl
repository
entity
dto
mapper
security
config
exception
util
```

---

## Frontend

```
src
components
layouts
pages
routes
services
hooks
store
types
utils
assets
constants
```

---

# 7. UI Design Style

Concept
Cyber Finance Dashboard
Phong cách
- Modern
- Glassmorphism
- Dashboard
- Dark Mode
- Responsive

---
## Primary Color
Neon Blue
#00E5FF

---
## Secondary Color
Electric Blue
#3B82F6

---
## Background
Dark Black
#0F172A

---
## Card
#1E293B
Opacity
80%
Blur
16px

---
## Success
#22C55E

---
## Error
#EF4444

---
## Warning
#FACC15

---
## Text
Primary
#FFFFFF
Secondary
#CBD5E1

---
## Border
#334155

---
# 8. UI Components
Sidebar
Top Navigation
Dashboard Card
Statistic Card
Transaction Table
Pie Chart
Bar Chart
Line Chart
Modal
Drawer
Dropdown
Profile Menu
Search Box
Pagination
Toast Notification
Loading Skeleton
Confirmation Dialog

---
# 9. Responsive
Desktop
>=1200px
Laptop
992px
Tablet
768px
Mobile
>=375px

---
# 10. Coding Convention
Frontend
- Functional Component
- Hooks
- TypeScript Strict Mode
- Reusable Component
- Absolute Import

Backend
- RESTful API
- Layered Architecture
- DTO Pattern
- Mapper Pattern
- Constructor Injection
- Global Exception Handler
- Validation
- Response Wrapper

---
# 11. Future Expansion

Có thể mở rộng thành
- AI Financial Advisor
- Banking Integration
- Expense Prediction
- OCR Receipt
- Push Notification
- Mobile Application
- Multi User Workspace
- Cloud Deployment

---
# 12. Testing Scope
Dự án áp dụng Unit Testing cho Backend nhằm đảm bảo các nghiệp vụ hoạt động chính xác và hỗ trợ quá trình bảo trì.

## Testing Framework
- JUnit 5
- Mockito
- Spring Boot Test
- MockMvc
- AssertJ

---
## Unit Test
### Service Layer
Thực hiện Unit Test cho các Service sau:
- AuthenticationService
- CategoryService
- IncomeService
- ExpenseService
- DashboardService
- StatisticsService
- UserService

Nội dung kiểm thử:
- Business Logic
- Validation
- Exception
- Mapper
- Repository Mock
- Success Case
- Failure Case

---
### Controller Layer
Thực hiện kiểm thử Controller bằng MockMvc.
Kiểm thử:
- HTTP Status
- Response Body
- Validation
- Authentication
- Authorization
- Exception Handler

---
## Test Coverage
Mục tiêu
- Service Layer >= 80%
- Controller Layer >= 80%

---
## Không kiểm thử
Trong phạm vi MVP sẽ không thực hiện
- Integration Test
- Performance Test
- Load Test
- Stress Test
- Security Penetration Test
- End-to-End Test