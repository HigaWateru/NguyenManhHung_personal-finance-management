# Error Log

## ERR-20260708-001
- Mã lỗi (Error ID): ERR-20260708-001
- Ngày phát sinh: 2026-07-08
- Module: Backend Configuration
- Chức năng: Khởi động Spring Boot Server
- Mô tả lỗi: Ứng dụng không thể khởi động `ApplicationContext`, dẫn đến lỗi `Unable to start web server` khi chạy server ở môi trường development.
- Nguyên nhân: Profile `dev` trong [server/src/main/resources/application-dev.properties](server/src/main/resources/application-dev.properties) đang override datasource sang `jdbc:mysql://localhost:3306/personal_finance...` trong khi driver và phạm vi dự án đã được chuẩn hóa sang SQLite. Kết quả là Hikari khởi tạo với `org.sqlite.JDBC` nhưng nhận MySQL JDBC URL và ném lỗi `Driver org.sqlite.JDBC claims to not accept jdbcUrl`.
- Cách khắc phục: Đồng bộ lại datasource của profile `dev` về SQLite bằng `jdbc:sqlite:smart-finance.db`, khai báo lại `org.sqlite.JDBC` và `org.hibernate.community.dialect.SQLiteDialect`, đồng thời loại bỏ các thiết lập đặc thù MySQL không còn phù hợp với scope hiện tại.
- Bài học rút ra (Lesson Learned): Khi dự án đã chốt database trong scope kỹ thuật, mọi profile cấu hình phải đồng nhất với quyết định đó; cấu hình môi trường cũ cần được rà soát sau mỗi lần đổi stack để tránh lỗi khởi động khó truy vết.
- Trạng thái (Resolved/Pending): Resolved

## ERR-20260711-002
- Mã lỗi (Error ID): ERR-20260711-002
- Ngày phát sinh: 2026-07-11
- Module: Authentication
- Chức năng: Login
- Mô tả lỗi: Khi đăng nhập tài khoản An trên Postman, API `POST /api/v1/auth/login` trả về HTTP 500 thay vì trả token thành công.
- Nguyên nhân: Trong `AuthServiceImpl.login`, method được đánh dấu `@Transactional(readOnly = true)` nhưng vẫn thực hiện thao tác ghi dữ liệu khi tạo refresh token (`insert into refresh_tokens`) và dọn token cũ. MySQL chặn thao tác ghi trên connection read-only, gây `JpaSystemException` với thông báo `Connection is read-only. Queries leading to data modification are not allowed`.
- Cách khắc phục: Đổi annotation của method login từ `@Transactional(readOnly = true)` sang `@Transactional` để cho phép ghi refresh token trong cùng transaction.
- Bài học rút ra (Lesson Learned): Các luồng authentication có phát sinh refresh token phải được coi là luồng ghi dữ liệu; không đặt read-only transaction cho method có side effects lên database.
- Trạng thái (Resolved/Pending): Resolved