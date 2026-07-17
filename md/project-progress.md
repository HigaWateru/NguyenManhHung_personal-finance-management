# Báo cáo Cập nhật Tiến độ Dự án - Smart Finance

Tài liệu này tổng hợp tiến độ triển khai thực tế của dự án **Smart Finance**, chi tiết hóa các chức năng cơ bản đã hoàn thành, các tính năng nâng cao bảo mật và các phân hệ tích hợp vừa được triển khai ở Giai đoạn 2.

---

## 1. Các Chức Năng Cơ Bản & Tích Hợp (Core & Integration Features)

Hệ thống đã xây dựng hoàn chỉnh và kiểm thử thành công các nghiệp vụ cốt lõi của một ứng dụng quản lý tài chính cá nhân thông minh:

| Phân hệ | Chức năng | Trạng thái | Chi tiết triển khai |
| :--- | :--- | :---: | :--- |
| **Xác thực (Authentication)** | Đăng ký & Đăng nhập | `Completed` | Đăng ký tài khoản mới, mã hóa mật khẩu bằng BCrypt. Đăng nhập không trạng thái (Stateless) sử dụng cặp JWT Access Token và Refresh Token để duy trì phiên làm việc an toàn. Hỗ trợ Social Login Google & GitHub. |
| **Tích hợp Plaid Sandbox** | Kết nối & Đồng bộ ngân hàng | `Completed` | Hỗ trợ luồng liên kết tài khoản ngân hàng Sandbox qua Plaid Link. Thực hiện trao đổi public_token lấy access_token, đồng bộ giao dịch tự động/thủ công, hiển thị chi tiết số dư tài khoản trực quan. |
| **Phân loại Giao dịch** | Pipeline phân loại tự động | `Completed` | Kết hợp Redis Caching (30 ngày), quy tắc phân loại dựa trên tên Merchant (Merchant Mapping & Rule Engine), và tích hợp mô hình AI (Gemini NLP API/Heuristics) để tự động hóa gán danh mục cho giao dịch ngân hàng. |
| **Ngân sách (Budgets)** | Quản lý hạn mức chi tiêu | `Completed` | Cho phép người dùng thiết lập hạn mức chi tiêu theo danh mục, tính toán chi tiêu thực tế, hiển thị tiến độ trực quan dưới dạng thanh tiến trình (progress bar) đổi màu cảnh báo khi chi tiêu vượt quá 80%. |
| **Mục tiêu (Saving Goals)** | Kế hoạch tích lũy tài sản | `Completed` | Cho phép tạo mục tiêu tích lũy (tên, số tiền đích, hạn chót), cập nhật tiến trình tích lũy và theo dõi phần trăm hoàn thành. |
| **Thông báo (Notifications)** | Cảnh báo hệ thống | `Completed` | Hệ thống thông báo tự động (cảnh báo vượt hạn mức ngân sách, cảnh báo bảo mật) và giao diện xem thông báo, đánh dấu đã đọc. |
| **Tổng quan (Dashboard)** | Giao diện tổng hợp | `Completed` | Hiển thị thẻ kết nối Plaid ở trên cùng, các thẻ số dư tích lũy, các widget tiến độ ngân sách, mục tiêu tích lũy, hóa đơn định kỳ sắp tới, thông báo mới, biểu đồ phân tích tuần/danh mục và bảng giao dịch gần đây. |
| **Thống kê (Statistics)** | Trực quan hóa số liệu | `Completed` | Tích hợp biểu đồ thống kê xu hướng thu chi theo tuần hiện tại (tính chuẩn từ Thứ Hai đến Chủ Nhật), so sánh các tháng trong năm và biểu đồ tỷ trọng giao dịch. |
| **Ty gia thi truong (Exchange Rates)** | Quan ly ti gia & da tien te | `Completed` | Ho tro theo doi ti gia ngoai te truc tuyen hang ngay qua API open.er-api.com. Quy doi dong bo so tien trong database khi nguoi dung cap nhat don vi tien te goc trong Ho so. Tu dong dinh dang cac số lieu tai chinh tren Dashboard, Giao dich va Thong ke theo tien te ho so cua nguoi dung. |

---

## 2. Các Chức Năng Nâng Cao (Advanced Features)

Các giải pháp nâng cao về bảo mật hệ thống và tối ưu hóa trải nghiệm đã được tích hợp chặt chẽ:

### A. Chức năng Quên mật khẩu (Forgot Password Flow)
- **Xác thực OTP Email**: Sử dụng `JavaMailSender` tích hợp SMTP để gửi trực tiếp email chứa mã xác thực 6 chữ số ngẫu nhiên qua template HTML Dark Cyber sang trọng.
- **Lưu trữ bảo mật**: Mã OTP được băm bằng thuật toán BCrypt trước khi lưu tạm vào **Redis** với thời gian sống (TTL) 5 phút để tránh rò rỉ dữ liệu cache.
- **Chống Brute-Force**: Giới hạn tối đa 5 lần nhập sai mã OTP. Hệ thống sẽ tự động hủy OTP trong Redis ở lần nhập sai thứ 5.
- **Rate Limiting**: Ngăn chặn spam bằng cách áp dụng bộ lọc giới hạn gửi OTP tối đa 1 lần/phút và 5 lần/giờ cho mỗi tài khoản email.

### B. Vô hiệu hóa JWT & Đăng xuất An toàn (Redis Blacklist)
- **Vô hiệu hóa JWT tức thời**: Khi người dùng logout hoặc reset password thành công, Access Token hiện tại sẽ bị đưa vào blacklist của Redis ngay lập tức.
- **Tự động giải phóng (TTL)**: Sử dụng Redis TTL để tự động xóa token khi hết thời gian sống còn lại của JWT. Không cần Cron Job hay các tiến trình quét định kỳ.
- **Ngăn chặn triệt để**: Bộ lọc `JwtAuthenticationFilter` gọi `JwtBlacklistService.isBlacklisted(token)` trước khi tạo authentication context. Nếu token nằm trong blacklist, trả về ngay lập tức mã lỗi HTTP 401 với thông báo `"Token has been revoked."`.

### C. Quản lý Ảnh đại diện (Cloudinary Integration)
- Tải ảnh đại diện cá nhân trực tiếp lên dịch vụ Cloudinary giúp tối ưu tài nguyên lưu trữ của máy chủ ứng dụng.

---

## 3. Khả Năng Phát Triển của Dự Án (Future Scalability)

Kiến trúc hiện tại của dự án đã được thiết kế sẵn sàng để mở rộng dễ dàng sang các giai đoạn tiếp theo:

### A. Tính năng nghiệp vụ mở rộng (Business Enhancements)
- **Giao dịch định kỳ (Recurring Transactions)**: Tự động hóa việc ghi nhận các khoản thu/chi cố định hàng tháng như tiền nhà, tiền lương, tiền mạng dựa trên phân tích dòng tiền Plaid.
- **Dự báo chi tiêu thông minh**: Sử dụng AI / Machine Learning phân tích hành vi chi tiêu lịch sử để dự báo số tiền chi tiêu trong tháng tiếp theo.

### B. Khả năng mở rộng kỹ thuật (Technical Scalability)
- **Microservices Architecture**: Phân tách phân hệ Thống kê (Statistics) và tính toán báo cáo chuyên sâu (Report) thành một microservice độc lập do các tác vụ này thường chiếm dụng nhiều tài nguyên CPU/RAM.
- **Database Sharding & Replication**: Thiết lập mô hình MySQL Master-Slave (Read/Write Splitting) và đánh chỉ mục sâu vào các bảng `incomes`, `expenses`, `transactions` để tối ưu hóa truy vấn khi cơ sở dữ liệu lên đến hàng triệu bản ghi.
