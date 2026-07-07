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