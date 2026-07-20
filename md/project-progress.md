# Báo cáo Tiến độ Dự án & Hiện thực hóa Chức năng - Smart Finance

Tài liệu này tổng hợp tiến độ triển khai thực tế 100% của dự án **Smart Finance**, chi tiết hóa các phân hệ chức năng, kiến trúc đồng bộ ngân hàng Plaid Sandbox với ngân hàng **First Platypus Bank**, cơ chế phân loại thương hiệu bằng AI/Rules, chiến lược khởi tạo dữ liệu sạch (DataSeeder) và khả năng mở rộng hệ thống.

---

## 1. Bảng Tổng hợp Tiến độ Triển khai (100% Completed)

| Phân hệ / Chức năng | Trạng thái | Mức độ hoàn thành | Chi tiết hiện thực & Xác minh |
| :--- | :---: | :---: | :--- |
| **Xác thực & Phân quyền (Auth & Security)** | `Completed` | **100%** | Đăng ký tài khoản mới (BCrypt), Đăng nhập JWT Stateless (Access Token & Refresh Token), Google OAuth2 Login, Đăng xuất an toàn thu hồi token qua **Redis Blacklist**. |
| **Quên mật khẩu & OTP Email** | `Completed` | **100%** | Xác thực OTP 6 số gửi qua Email HTML Dark Cyber, băm BCrypt lưu Redis 5 phút (TTL), chống Brute-force (tối đa 5 lần sai), Rate-limit (1 lần/phút, 5 lần/giờ). |
| **Tích hợp Plaid Sandbox** | `Completed` | **100%** | Liên kết ngân hàng thử nghiệm **First Platypus Bank** qua Plaid Link modal (`user_good` / `pass_good`), trao đổi `public_token` lấy `access_token`, đồng bộ 15 giao dịch ngân hàng Sandbox tự động/thủ công. |
| **Pipeline Phân loại Thương hiệu** | `Completed` | **100%** | Tự động phân loại thương hiệu theo 5 tầng: Redis Cache (30 ngày) $\rightarrow$ Merchant Mapping $\rightarrow$ Smart Rule Engine (`OpenAI` $\rightarrow$ Utilities, `Apple` $\rightarrow$ Shopping, `Interest payment` $\rightarrow$ Interest Income, `Spotify`/`Netflix` $\rightarrow$ Entertainment) $\rightarrow$ AI Gemini 2.5 Flash API / Local Heuristics $\rightarrow$ Fallback "Others". |
| **Phân bổ chi tiêu & Top Category Highlight** | `Completed` | **100%** | Tổng hợp chi tiêu từ **cả giao dịch thủ công lẫn giao dịch ngân hàng Plaid**, tự động tính phần trăm theo danh mục, hiển thị biểu đồ Donut, danh sách % và **làm nổi bật Danh mục chi nhiều nhất (Top Category Highlight)**. |
| **Ngân sách & Mục tiêu Tiết kiệm** | `Completed` | **100%** | Thiết lập ngân sách chi tiêu theo danh mục (thanh progress bar đổi màu cảnh báo khi vượt 80%), tạo mục tiêu tích lũy tài sản và theo dõi phần trăm hoàn thành. |
| **Đa tiền tệ & Tỉ giá Tự động** | `Completed` | **100%** | `ExchangeRateScheduler` tự động quét và cập nhật tỉ giá định kỳ (VND, USD, EUR, JPY), hỗ trợ người dùng chuyển đổi Tiền tệ hiển thị (Display Currency) linh hoạt. |
| **DataSeeder Policy (Dữ liệu Sạch)** | `Completed` | **100%** | Khởi tạo server tự động làm sạch giao dịch lịch sử cũ, gán sẵn bộ danh mục chuẩn (Salary, Bonus, Food, Transport, Shopping, Utilities, v.v.) cho tài khoản mới mà KHÔNG chèn rác giao dịch thu/chi. |

---

## 2. Chi tiết các Phân hệ Kỹ thuật Nâng cao

### A. Quy trình Kết nối & Đồng bộ Ngân hàng Plaid Sandbox (First Platypus Bank)
1. **Kết nối**: Bấm **[Connect Bank]** $\rightarrow$ Chọn ngân hàng **First Platypus Bank** $\rightarrow$ Đăng nhập với `user_good` / `pass_good` $\rightarrow$ Trao đổi `public_token` lấy `access_token`.
2. **Đồng bộ**: Bấm **[Đồng bộ giao dịch]** $\rightarrow$ Tải 15 giao dịch Sandbox sống động $\rightarrow$ Chạy qua Pipeline phân loại thương hiệu $\rightarrow$ **Cập nhật ngay Dashboard mà không cần reload trang**.

### B. Bộ quy tắc Phân loại Thương hiệu (Merchant Classification Rules)
- `OpenAI`, `ChatGPT`, `Google`, `Microsoft`, `AWS` $\rightarrow$ Danh mục **Utilities** (Dịch vụ / Công nghệ).
- `Apple`, `Amazon`, `Shopee`, `Nike`, `Adidas` $\rightarrow$ Danh mục **Shopping** (Mua sắm).
- `Interest payment`, `dividend`, `lãi tiết kiệm` $\rightarrow$ Danh mục **Interest / Income** (Thu nhập / Tiền lãi).
- `Spotify`, `Netflix`, `Steam`, `Disney` $\rightarrow$ Danh mục **Entertainment** (Giải trí).
- `Royal Farms`, `Sweetgreen`, `Smart & Final`, `Starbucks` $\rightarrow$ Danh mục **Food** (Ăn uống).

### C. Giao diện Phân bổ Chi tiêu (Expense Distribution Card)
- Hiển thị tổng phần trăm đã chi trong tháng trên biểu đồ Donut.
- Tự động tìm và làm nổi bật danh mục chiếm tỷ trọng cao nhất: `Chi nhiều nhất: Utilities (38.5%)`.
- Danh sách từng danh mục có thanh tiến trình phân màu sinh động.

---

## 3. Khả năng Mở rộng trong Tương lai (Future Scalability)

- **Giao dịch định kỳ tự động (Auto Recurring Bills)**: Tự động nhận diện các khoản thanh toán cố định hàng tháng qua ngân hàng Plaid.
- **Phân tích Dự báo AI**: Sử dụng mô hình Machine Learning dự báo xu hướng dòng tiền các tháng tiếp theo.
- **Microservices Deployment**: Tách riêng Service Thống kê & Phân loại AI thành dịch vụ độc lập khi quy mô người dùng tăng trưởng.
