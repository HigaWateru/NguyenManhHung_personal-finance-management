# Nhật ký Thay đổi (Changelog) - Smart Finance

Tất cả các thay đổi lớn đối với cơ sở dữ liệu, backend API và giao diện Frontend của dự án **Smart Finance** trong Giai đoạn 2 được ghi chép đầy đủ dưới đây.

---

## [1.1.0] - 2026-07-16

### Added (Thêm mới)
- **Database JPA Entities & DDL Schema**:
  - `BankAccount`: Thực thể đại diện cho kết nối ngân hàng của người dùng, liên kết với ID tài khoản Plaid và Access Token.
  - `Transaction`: Thực thể lưu trữ các giao dịch đã đồng bộ từ Plaid.
  - `MerchantMapping`: Quy tắc gán merchant name sang category.
  - `Budget`: Thực thể quản lý hạn mức ngân sách tháng của người dùng theo danh mục.
  - `Goal`: Thực thể quản lý mục tiêu tiết kiệm.
  - `Notification`: Thực thể lưu trữ thông báo hệ thống và cảnh báo chi tiêu.
- **Backend Services**:
  - `PlaidService`: Triển khai luồng xác thực Plaid Link token, trao đổi public token lấy access token, ngắt kết nối ngân hàng và đồng bộ giao dịch.
  - `CategoryClassificationService`: Pipeline phân loại giao dịch tự động tích hợp Redis Cache, Rule Engine và AI Categorizer.
  - `AiCategorizerService`: Phân loại NLP sử dụng mô hình Gemini API với NLP heuristics fallback.
  - `BudgetService`, `GoalService`, `NotificationService`.
- **Backend REST Controllers**:
  - `PlaidController`, `BudgetController`, `GoalController`, `NotificationController`.
- **Frontend Integration**:
  - Thêm gói `react-plaid-link` vào `package.json`.
  - Cập nhật `client/src/types/api.ts` với các kiểu dữ liệu mới (`BankAccountResponse`, `BudgetResponse`, `GoalResponse`, `NotificationResponse`).
  - Cập nhật `client/src/apis/service.ts` với các API endpoints tương ứng.
- **Frontend Dashboard Widgets**:
  - Bank Connection Card (trên cùng trang chủ) quản lý kết nối và đồng bộ Plaid.
  - Budget Progress Card với thanh tiến trình trực quan hiển thị số tiền đã tiêu / hạn mức.
  - Financial Goals Card quản lý các mục tiêu tích lũy và cập nhật tiến trình.
  - Upcoming Bills Card quản lý hóa đơn sắp đến hạn.
  - New Notifications Card hiển thị cảnh báo chưa đọc.

### Changed (Thay đổi)
- Cấu hình Plaid Java SDK lên phiên bản `41.0.0` trong `build.gradle` để phù hợp với đặc tả OpenAPI mới nhất.
- Cập nhật `DashboardServiceImpl` để gộp các tính toán số dư, tổng thu, tổng chi và danh sách giao dịch gần đây từ cả giao dịch thủ công (Incomes, Expenses) và giao dịch đồng bộ từ ngân hàng (Transactions).

### Fixed (Sửa lỗi)
- Sửa lỗi mapping `LocalDate` trong Plaid transaction sync.
- Sửa lỗi configure Plaid client adapter environments.
- Giải quyết vấn đề unresolved placeholders trong test contexts (`application-test.properties`) bằng cách cung cấp mặc định cho các `@Value` annotations.
- Sửa các lỗi typescript unused variables & unused imports trong `DashboardPage.tsx`.
