# Báo cáo Cập nhật Tiến độ Dự án - Smart Finance

Tài liệu này tổng hợp tiến độ triển khai thực tế của dự án **Smart Finance**, chi tiết hóa các chức năng cơ bản đã hoàn thành, các tính năng nâng cao bảo mật và định hướng phát triển mở rộng trong tương lai.

---

## 1. Các Chức Năng Cơ Bản (Core Features)

Hệ thống đã xây dựng hoàn chỉnh và kiểm thử thành công các nghiệp vụ cốt lõi của một ứng dụng quản lý tài chính cá nhân:

| Phân hệ | Chức năng | Trạng thái | Chi tiết triển khai |
| :--- | :--- | :---: | :--- |
| **Xác thực (Authentication)** | Đăng ký & Đăng nhập | `Completed` | Đăng ký tài khoản mới, mã hóa mật khẩu bằng BCrypt. Đăng nhập không trạng thái (Stateless) sử dụng cặp JWT Access Token và Refresh Token để duy trì phiên làm việc an toàn. |
| **Giao dịch (Transactions)** | Quản lý Thu nhập / Chi tiêu | `Completed` | Hỗ trợ đầy đủ các thao tác thêm, sửa, xóa, xem chi tiết giao dịch. Tích hợp bộ lọc phân trang, tìm kiếm nâng cao theo từ khóa nội dung và tìm kiếm động theo tên danh mục giao dịch. |
| **Danh mục (Categories)** | Phân loại giao dịch | `Completed` | Cho phép người dùng tùy biến danh mục riêng biệt. Bảo đảm dữ liệu danh mục được phân tách tuyệt đối giữa các tài khoản người dùng khác nhau. |
| **Tổng quan (Dashboard)** | Giao diện tổng hợp | `Completed` | Hiển thị tổng quan các thẻ số dư tức thời, giao dịch gần đây. Biểu đồ phân bổ chi tiêu được tối ưu hóa hiển thị **Top 3 danh mục chi tiêu nhiều nhất** để người dùng dễ dàng định hình ngân sách. |
| **Thống kê (Statistics)** | Trực quan hóa số liệu | `Completed` | Tích hợp biểu đồ thống kê xu hướng thu chi theo tuần hiện tại (tính chuẩn từ Thứ Hai đến Chủ Nhật), so sánh các tháng trong năm và biểu đồ tỷ trọng giao dịch. |
| **Hồ sơ (User Settings)** | Quản lý cá nhân | `Completed` | Hỗ trợ xem thông tin tài khoản, đổi mật khẩu chủ động và cấu hình múi giờ hiển thị cũng như loại tiền tệ mặc định (VND, USD, EUR). |

---

## 2. Các Chức Năng Nâng Cao (Advanced Features)

Các giải pháp nâng cao về bảo mật hệ thống và tối ưu hóa trải nghiệm đã được tích hợp chặt chẽ:

### A. Chức năng Quên mật khẩu (Forgot Password Flow)
Được xây dựng theo quy chuẩn doanh nghiệp đáp ứng đầy đủ yêu cầu khắt khe về bảo mật:
- **Xác thực OTP Email**: Sử dụng `JavaMailSender` tích hợp SMTP để gửi trực tiếp email chứa mã xác thực 6 chữ số ngẫu nhiên qua template HTML Dark Cyber sang trọng.
- **Lưu trữ bảo mật**: Mã OTP được băm bằng thuật toán BCrypt trước khi lưu tạm vào **Redis** với thời gian sống (TTL) 5 phút để tránh rò rỉ dữ liệu cache.
- **Chống Brute-Force**: Giới hạn tối đa 5 lần nhập sai mã OTP. Hệ thống sẽ tự động hủy OTP trong Redis ở lần nhập sai thứ 5.
- **Rate Limiting**: Ngăn chặn spam bằng cách áp dụng bộ lọc giới hạn gửi OTP tối đa 1 lần/phút và 5 lần/giờ cho mỗi tài khoản email.
- **Thông điệp bảo mật**: API luôn trả về một phản hồi thành công chung để tránh lộ thông tin email có tồn tại trong hệ thống hay không.

### B. Vô hiệu hóa JWT & Đăng xuất An toàn
- **Thu hồi JWT tức thời**: Khi đặt lại mật khẩu thành công, cột `credentialsUpdatedAt` của thực thể `User` sẽ được cập nhật. Bộ lọc `JwtAuthenticationFilter` tự động đối chiếu thời gian phát hành token (`iat`) và từ chối ngay lập tức mọi token cũ.
- **Thu hồi Refresh Token**: Đánh dấu `revoked = true` cho toàn bộ các Refresh Token của người dùng trong cơ sở dữ liệu để yêu cầu tất cả các thiết bị đăng nhập lại.

### C. Quản lý Ảnh đại diện (Cloudinary Integration)
- Tải ảnh đại diện cá nhân trực tiếp lên dịch vụ Cloudinary giúp tối ưu tài nguyên lưu trữ của máy chủ ứng dụng.

### D. Cơ chế JWT Blacklist bằng Redis (Revocation)
- **Vô hiệu hóa JWT tức thời**: Khi người dùng logout hoặc reset password thành công, Access Token hiện tại sẽ bị đưa vào blacklist của Redis ngay lập tức.
- **Tự động giải phóng (TTL)**: Sử dụng Redis TTL để tự động xóa token khi hết thời gian sống còn lại của JWT. Không cần Cron Job hay các tiến trình quét định kỳ.
- **Ngăn chặn triệt để**: Bộ lọc `JwtAuthenticationFilter` gọi `JwtBlacklistService.isBlacklisted(token)` trước khi tạo authentication context. Nếu token nằm trong blacklist, trả về ngay lập tức mã lỗi HTTP 401 với thông báo `"Token has been revoked."`.

---

## 3. Khả Năng Phát Triển của Dự Án (Future Scalability)

Kiến trúc hiện tại của dự án đã được thiết kế sẵn sàng để mở rộng dễ dàng sang các giai đoạn tiếp theo:

### A. Tính năng nghiệp vụ mở rộng (Business Enhancements)
- **Hạn mức ngân sách (Budgeting)**: Cho phép đặt giới hạn chi tiêu tối đa cho từng danh mục chi tiêu theo tháng và gửi cảnh báo tự động khi chạm ngưỡng (ví dụ: đã tiêu hết 80% ngân sách ăn uống).
- **Mục tiêu tiết kiệm (Saving Goals)**: Tạo các hũ tiết kiệm thông minh tích lũy tiền cho các kế hoạch tương lai (mua nhà, mua xe, du lịch).
- **Giao dịch định kỳ (Recurring Transactions)**: Tự động hóa việc ghi nhận các khoản thu/chi cố định hàng tháng như tiền nhà, tiền lương, tiền mạng.

### B. Tích hợp Hệ thống (Integration Scalability)
- **Đăng nhập mạng xã hội (OAuth2)**: Liên kết và cho phép đăng nhập nhanh qua Google hoặc GitHub.
- **Đa quốc gia (i18n & Currency)**: Hỗ trợ thay đổi đa ngôn ngữ giao diện (Tiếng Việt, Tiếng Anh) và quy đổi tỷ giá ngoại tệ theo thời gian thực (Exchange Rate Updates).

### C. Khả năng mở rộng kỹ thuật (Technical Scalability)
- **Microservices Architecture**: Phân tách phân hệ Thống kê (Statistics) và tính toán báo cáo chuyên sâu (Report) thành một microservice độc lập do các tác vụ này thường chiếm dụng nhiều tài nguyên CPU/RAM.
- **Database Sharding & Replication**: Thiết lập mô hình MySQL Master-Slave (Read/Write Splitting) và đánh chỉ mục sâu vào các bảng `incomes`, `expenses` để tối ưu hóa truy vấn khi cơ sở dữ liệu lên đến hàng triệu bản ghi.
- **Cơ chế Blacklist Token trên Redis**: Nâng cấp blacklist token sử dụng Redis cluster với TTL khớp thời gian hết hạn còn lại của JWT để thu hồi token đăng xuất tức thời một cách triệt để.
