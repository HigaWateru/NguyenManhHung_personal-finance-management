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
- Mô tả lỗi: Khi đăng nhập tài khoản An trên Postman, API `POST /api/v1/auth/login` trả về HTTP 500 thay vị trả token thành công.
- Nguyên nhân: Trong `AuthServiceImpl.login`, method được đánh dấu `@Transactional(readOnly = true)` nhưng vẫn thực hiện thao tác ghi dữ liệu khi tạo refresh token (`insert into refresh_tokens`) và dọn token cũ. MySQL chặn thao tác ghi trên connection read-only, gây `JpaSystemException` với thông báo `Connection is read-only. Queries leading to data modification are not allowed`.
- Cách khắc phục: Đổi annotation của method login từ `@Transactional(readOnly = true)` sang `@Transactional` để cho phép ghi refresh token trong cùng transaction.
- Bài học rút ra (Lesson Learned): Các luồng authentication có phát sinh refresh token phải được coi là luồng ghi dữ liệu; không đặt read-only transaction cho method có side effects lên database.
- Trạng thái (Resolved/Pending): Resolved

## ERR-20260715-003
- Mã lỗi (Error ID): ERR-20260715-003
- Ngày phát sinh: 2026-07-15
- Module: Security & Authentication
- Chức năng: OAuth2 Login Callback
- Mô tả lỗi: Whitelabel Error Page - status=500. `InvalidDataAccessApiUsageException: No EntityManager with actual transaction available for current thread - cannot reliably process 'remove' call` khi redirect từ OAuth2 provider (Google/GitHub).
- Nguyên nhân: Trong `OAuth2AuthenticationSuccessHandler.onAuthenticationSuccess`, chúng ta thực hiện thao tác ghi dữ liệu `userRepository.save()` và xóa dữ liệu `refreshTokenRepository.deleteByRevokedTrueOrExpiresAtBefore()`. Vì method này chạy ở filter layer của Spring Security (nằm ngoài Service layer được quản lý giao dịch bằng `@Transactional`), Hibernate không có transaction hoạt động trên luồng hiện tại dẫn tới lỗi JPA.
- Cách khắc phục: Di chuyển toàn bộ logic nghiệp vụ (tìm/tạo người dùng, xóa token hết hạn, tạo mới refresh token & sinh access token) vào một phương thức mới `loginOAuth2(...)` trong `@Service` `AuthServiceImpl` và đánh dấu phương thức đó với `@Transactional`. Tại filter success handler, chỉ gọi tới service này để lấy thông tin kết quả.
- Bài học rút ra (Lesson Learned): Mọi thao tác truy cập ghi hoặc sửa đổi dữ liệu DB (Save, Update, Delete) trong Spring Boot luôn cần được thực thi trong một transaction được quản lý chặt chẽ ở tầng `@Service`. Không nên gọi trực tiếp các Repository thay đổi dữ liệu từ tầng Security Filter.
- Trạng thái (Resolved/Pending): Resolved

## ERR-20260716-004
- Mã lỗi (Error ID): ERR-20260716-004
- Ngày phát sinh: 2026-07-16
- Module: Plaid Integration & Dependency Management
- Chức năng: Build & Compile Java Backend
- Mô tả lỗi: Lỗi build Gradle: `Could not find com.plaid:plaid-java:19.4.0` và lỗi biên dịch `cannot find symbol ApiClient.Development`.
- Nguyên nhân: Phiên bản Plaid SDK Java `19.4.0` không tồn tại hoặc không khả dụng trên Maven Central. Ngoài ra, phiên bản SDK mới nhất được sinh ra từ OpenAPI sử dụng phương thức `apiClient.setPlaidAdapter(String baseUrl)` nhận tham số trực tiếp là URL (Sandbox, Development, Production) thay vì các hằng số enum trong các phiên bản cũ.
- Cách khắc phục: Cập nhật dependency Plaid Java SDK lên phiên bản mới nhất `41.0.0` khả dụng trên Maven Central, và thay đổi việc cấu hình môi trường adapter trong `PlaidConfig` từ hằng số `ApiClient.Development` sang String url trực tiếp (`"https://development.plaid.com"`).
- Bài học rút ra (Lesson Learned): Luôn kiểm tra các phiên bản thư viện và cấu hình thực tế có sẵn trên repository trung tâm trước khi định hình tài liệu dependency, đặc biệt đối với các thư viện biến động mạnh theo đặc tả OpenAPI như Plaid.
- Trạng thái (Resolved/Pending): Resolved

## ERR-20260716-005
- Mã lỗi (Error ID): ERR-20260716-005
- Ngày phát sinh: 2026-07-16
- Module: Testing & Properties Configuration
- Chức năng: Chạy Unit/Integration Tests
- Mô tả lỗi: Lỗi `PlaceholderResolutionException` gây thất bại khi chạy test suite `./gradlew test`.
- Nguyên nhân: Các cấu hình API Key và credentials của Plaid (`plaid.client-id`, `plaid.secret`, `plaid.environment`) được tiêm qua `@Value` trong `PlaidConfig` và `PlaidServiceImpl` nhưng không được định nghĩa trong profile test (`application-test.properties`). Spring Boot Context không thể khởi tạo do thiếu các placeholder này.
- Cách khắc phục: Bổ dung giá trị mặc định fallback trực tiếp trong annotation `@Value` (ví dụ: `${plaid.client-id:mock_client_id}`) để ứng dụng có thể khởi tạo context thành công trong môi trường kiểm thử mà không cần khai báo trùng lặp properties.
- Bài học rút ra (Lesson Learned): Luôn cung cấp giá trị mặc định hợp lý cho các annotation `@Value` của các biến cấu hình để tránh làm hỏng việc khởi tạo ApplicationContext của các integration test.
- Trạng thái (Resolved/Pending): Resolved

## ERR-20260716-006
- Mã lỗi (Error ID): ERR-20260716-006
- Ngày phát sinh: 2026-07-16
- Module: Plaid Transaction Synchronization
- Chức năng: Đồng bộ giao dịch ngân hàng
- Mô tả lỗi: Lỗi Internal Server Error (HTTP 500) với ngoại lệ `DataIntegrityViolationException` / `Duplicate entry '1-Entertainment-EXPENSE' for key 'categories.uk_categories_user_name_type'`.
- Nguyên nhân:
  1. Trong `CategoryClassificationServiceImpl.findOrCreateMatchingCategory`, sử dụng sai `categoryRepository.findById(userId)` với tham số là `userId` (ID của User) thay vì dùng UserRepository, dẫn đến lỗi logic gán sai User hoặc ném exception `User not found`.
  2. Khi nhiều giao dịch mới ánh xạ đến cùng một danh mục chưa tồn tại (ví dụ: "Entertainment") trong một lần đồng bộ, phương thức tải toàn bộ danh mục của người dùng không tìm thấy danh mục này do nó mới chỉ tồn tại ở dạng tạm lưu (dirty entity) trong phiên làm việc của Hibernate mà chưa đồng bộ (flush) xuống database. Điều này khiến vòng lặp sau chèn thêm bản ghi mới gây trùng khóa duy nhất.
- Cách khắc phục:
  1. Thay đổi chữ ký để nhận thực thể `User` trực tiếp từ giao dịch (`transaction.getUser()`), loại bỏ truy vấn lỗi trên `categoryRepository`.
  2. Sử dụng `categoryRepository.findByUserIdAndNameAndType(...)` để lấy chính xác và nhanh chóng thực thể từ Session Cache/Database, đồng thời dùng `saveAndFlush(...)` để ép đồng bộ dữ liệu ngay lập tức.
- Bài học rút ra (Lesson Learned): Tránh việc truy vấn sai repository chéo kiểu thực thể (kiểu ID khác nhau). Khi thực hiện thêm mới thực thể có tính ràng buộc duy nhất trong một vòng lặp thuộc cùng transaction, cần dùng các phương thức tìm kiếm chính xác và thực hiện flush thủ công (`saveAndFlush`) để đảm bảo tính nhất quán dữ liệu cho các vòng lặp tiếp theo.
- Trạng thái (Resolved/Pending): Resolved
