# Hướng dẫn Kiểm thử Đồng bộ Giao dịch Động qua Plaid Sandbox (Dynamic Transactions)

Tài liệu này hướng dẫn chi tiết cách kiểm thử đồng bộ giao dịch bằng tài khoản **giao dịch động (`user_transactions_dynamic`)** trên môi trường Plaid Sandbox để kiểm tra tính năng tự động cập nhật dòng tiền và phân bổ chi tiêu thời gian thực trên Smart Finance.

---

## 1. Thông tin tài khoản Plaid Sandbox để Test Giao dịch Động

Để kiểm thử luồng giao dịch được thay đổi động (thêm mới, cập nhật hoặc xóa giao dịch giả lập từ Plaid):

- **Username**: `user_transactions_dynamic`
- **Password**: Bất kỳ mật khẩu nào (ví dụ: `pass_good` hoặc `123456`)
- **Mã xác thực MFA**: Bất kỳ số nào (ví dụ: `123456`)
- **Ngân hàng kiểm thử đề xuất**: **First Platypus Bank** (`ins_109508`) - đây là ngân hàng dạng non-OAuth của Plaid, hỗ trợ tối đa việc tùy chỉnh dữ liệu giả lập Sandbox mà không bị ghi đè.

---

## 2. Các bước tiến hành Kiểm thử Đồng bộ Động

### Bước 1: Kết nối tài khoản ngân hàng động
1. Đăng nhập vào ứng dụng Smart Finance trên trình duyệt (`http://localhost:5173`).
2. Trên thẻ **Kết nối ngân hàng tự động** ở Dashboard, bấm **Connect Bank**.
3. Chọn ngân hàng **First Platypus Bank** (hoặc tìm kiếm "Platypus").
4. Nhập thông tin đăng nhập:
   - **Username**: `user_transactions_dynamic`
   - **Password**: `pass_good`
5. Nhập mã MFA bất kỳ để hoàn thành kết nối.
6. Sau khi kết nối thành công, thẻ ngân hàng trên Dashboard chuyển sang trạng thái **CONNECTED** với tên ngân hàng và số dư của tài khoản động.

---

### Bước 2: Đồng bộ giao dịch lần đầu
1. Bấm **Đồng bộ giao dịch** (Sync Transactions).
2. Hệ thống gọi API `/api/v1/plaid/sync` để kéo về danh sách giao dịch ban đầu của người dùng `user_transactions_dynamic`.
3. Kiểm tra Dashboard:
   - Các chỉ số **Số dư**, **Thu nhập tháng**, **Chi tiêu tháng** hiển thị số liệu tương ứng.
   - Danh sách **Giao dịch gần đây** cập nhật các giao dịch ngân hàng mới.

---

### Bước 3: Tạo giao dịch mới hoặc Kích hoạt thay đổi dữ liệu (Dynamic Test)
Để kiểm tra tính năng đồng bộ liên tục khi tài khoản ngân hàng phát sinh giao dịch mới, Plaid Sandbox cung cấp công cụ mô phỏng thay đổi dữ liệu:

#### Cách 1: Sử dụng Plaid Dashboard (Khuyên dùng)
1. Đăng nhập vào [Plaid Dashboard](https://dashboard.plaid.com/) -> Chọn mục **Developers** > **Sandbox**.
2. Tìm đến mục **Sandbox Users** hoặc **Transactions**.
3. Chọn người dùng có access_token liên quan hoặc sử dụng API Plaid Sandbox `/sandbox/transactions/create` để tạo một giao dịch mới với giá trị tiền và tên merchant bạn mong muốn.

#### Cách 2: Kích hoạt Webhook / Refresh trên Plaid Sandbox
1. Khi sử dụng tài khoản `user_transactions_dynamic`, Plaid tự động định kỳ sinh ra các giao dịch mô phỏng mới hoặc cập nhật trạng thái giao dịch từ PENDING sang POSTED.
2. Để ép Plaid Sandbox cập nhật ngay lập tức các giao dịch mới, bạn có thể gọi API Plaid Sandbox `/sandbox/item/fire_webhook` hoặc trigger đồng bộ thủ công từ ứng dụng Smart Finance bằng cách bấm nút **Đồng bộ giao dịch** trên Dashboard.
3. Sau khi đồng bộ, hệ thống sẽ tự động quét các giao dịch mới thêm (added), thay đổi (modified) hoặc xóa bỏ (removed).

---

### Bước 4: Kiểm chứng dữ liệu đồng bộ
Sau khi bấm **Đồng bộ giao dịch** ở Bước 3:
1. Quan sát pop-up thông báo hiển thị số lượng giao dịch đồng bộ mới (ví dụ: *3 new transactions synchronized successfully*).
2. Kiểm tra xem các giao dịch mới này đã tự động chạy qua pipeline phân loại hay chưa:
   - Nếu tên Merchant trùng với quy tắc cũ, nó sẽ tự động nhận Category tương ứng mà không cần AI.
   - Nếu Merchant hoàn toàn mới (ví dụ: "GrabFood"), kiểm tra xem AI/Heuristics có phân loại đúng vào "Food" hay không.
3. Kiểm tra xem số tiền của các giao dịch mới này có được cộng dồn ngay lập tức vào **Budget Progress** (Hạn mức ngân sách) của danh mục đó hay không.
4. Kiểm tra xem **Financial Goals** và các biểu đồ xu hướng tuần có cập nhật theo dòng tiền mới hay không.
