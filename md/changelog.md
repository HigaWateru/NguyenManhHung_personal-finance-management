# Nhật ký Thay đổi (Changelog) - Smart Finance

Tất cả các thay đổi lớn đối với cơ sở dữ liệu, backend API và giao diện Frontend của dự án **Smart Finance** được ghi chép đầy đủ dưới đây.

---

## [1.2.0] - 2026-07-20

### Added (Thêm mới)
- **Backend (BE) Features**:
  - **OAuth2 Authentication**: Tích hợp đăng nhập mạng xã hội qua Google và GitHub (`OAuth2AuthenticationSuccessHandler`, `CustomOAuth2UserService`, `OAuth2AuthorizationRequestRepository`).
  - **Redis Token Blacklist**: Quản lý thu hồi JWT Refresh Token và Blacklist Access Token khi Logout hoặc đổi mật khẩu qua Spring Data Redis (`RedisTokenBlacklistService`).
  - **Quên mật khẩu & OTP qua Email**: Luồng khôi phục mật khẩu tự động gửi mã OTP 6 chữ số qua Email sử dụng `JavaMailSender` và Redis storage (`POST /api/v2/auth/forgot-password`, `verify-otp`, `reset-password`).
  - **Upload Ảnh đại diện (Cloudinary)**: Hỗ trợ upload và lưu trữ avatar người dùng trực tuyến qua Cloudinary Java SDK (`CloudinaryService`, `POST /api/v2/auth/profile/avatar`).
  - **Tỷ giá hối đoái & Quy đổi đa tiền tệ (Multi-Currency Support)**:
    - Quản lý tỷ giá 4 loại tiền tệ chính (`VND`, `USD`, `EUR`, `JPY`) với thực thể `ExchangeRate`, API `/api/v2/exchange-rates`.
    - Tự động cập nhật tỷ giá thị trường định kỳ thông qua `@Scheduled` task.
    - Hỗ trợ trường `displayCurrency` trong hồ sơ người dùng, tự động quy đổi số tiền thu/chi trên Dashboard, Thống kê và Báo cáo.
  - **Bộ lọc & Tìm kiếm nâng cao**: Bổ sung truy vấn lọc giao dịch thu/chi theo khoảng thời gian (`fromDate`, `toDate`), danh mục (`categoryId`) và từ khóa (`keyword`) trong `IncomeRepository` và `ExpenseRepository`.

- **Frontend (FE) Features**:
  - **Đa ngôn ngữ (i18n)**: Hỗ trợ 3 ngôn ngữ **Tiếng Việt (VN)**, **Tiếng Anh (EN)**, **Tiếng Nhật (JP)** với `LanguageContext` và từ điển dịch toàn bộ giao diện (Dashboard, Thu nhập, Chi tiêu, Ngân sách, Mục tiêu, Tỷ giá, Cài đặt).
  - **Trang Quản lý Tỷ giá (`ExchangeRatePage.tsx`)**: Hiển thị bảng tỷ giá thời gian thực, chỉ số biến động phần trăm và công cụ quy đổi tiền tệ nhanh.
  - **Cập nhật Profile & Upload Avatar**: Giao diện chọn ảnh đại diện trực quan trên trang Cài đặt với phản hồi tức thì.
  - **Nâng cấp Giao diện & Trải nghiệm Dashboard**: Thiết kế Glassmorphism hiện đại, tối ưu biểu đồ dòng tiền (ChartCard), thẻ danh mục (CategoryCard), danh sách giao dịch gần đây và thanh Header với menu thông báo & đổi ngôn ngữ/tiền tệ.

### Changed (Thay đổi)
- Nâng cấp toàn bộ các API endpoint lên phiên bản `/api/v2/*` (`/api/v2/auth`, `/api/v2/dashboard`, `/api/v2/incomes`, `/api/v2/expenses`, `/api/v2/categories`, `/api/v2/exchange-rates`).
- Mở rộng kiểu dữ liệu `UserProfile` trong `client/src/types/api.ts` hỗ trợ `displayCurrency` và `avatarUrl`.
- Cập nhật kiểu `PaginationQuery` trong `client/src/types/api.ts` để bổ sung hai trường tìm kiếm tùy chọn `fromDate?: string` và `toDate?: string`.
- Cập nhật hàm chuyển đổi `toQueryParams` trong `client/src/apis/service.ts` để map linh hoạt các tham số ngày tháng (`fromDate`/`toDate`, `startDate`/`endDate`) thành URL query string gửi lên server.

### Fixed (Sửa lỗi)
- Sửa lỗi biên dịch TypeScript `Object literal may only specify known properties, and 'fromDate' does not exist in type 'PaginationQuery'` khi gọi API từ [DashboardPage.tsx](client/src/pages/dashboard/DashboardPage.tsx).
- Sửa lỗi JPA Transaction `No EntityManager with actual transaction available` trong `OAuth2AuthenticationSuccessHandler` bằng cách di chuyển logic vào `@Service` với `@Transactional`.
- Sửa lỗi `Duplicate entry` trùng lặp danh mục khi đồng bộ giao dịch ngân hàng Plaid (`CategoryClassificationServiceImpl`).
- Sửa lỗi thiếu placeholder cấu hình Plaid trong môi trường test context (`application-test.properties`).

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
