# Hướng dẫn Demo & Luồng Đồng bộ Ngân hàng Plaid Sandbox (First Platypus Bank & Dynamic Transactions)

Tài liệu hướng dẫn chi tiết quy trình thử nghiệm kết nối ngân hàng giả lập, đồng bộ giao dịch tự động dạng **Dynamic Transactions** (`user_transactions_dynamic`) và phân loại thương hiệu thông minh trong ứng dụng **Smart Finance**.

---

## 1. Thông tin Cấu hình Sandbox

- **Môi trường (Environment)**: Plaid Sandbox (`https://sandbox.plaid.com`)
- **Tên Ngân hàng Mặc định (Institution Name)**: **First Platypus Bank**
- **Tài khoản Đăng nhập Sandbox Khuyên dùng (Dynamic Transactions)**:
  - **Username**: `user_transactions_dynamic`
  - **Password**: `pass_good`
- **Tài khoản Dự phòng (Standard Credentials)**:
  - **Username**: `user_good`
  - **Password**: `pass_good`
- **Mã PIN 2FA giả lập (nếu có)**: `1234`

---

## 2. Kịch bản Demo Chi tiết theo Các Bước

### Bước 1: Kết nối Ngân hàng (Connect Bank)
1. Trên giao diện **Dashboard**, bấm vào thẻ **[Connect Bank]**.
2. Cửa sổ `Plaid Link` xuất hiện. Gõ hoặc chọn ngân hàng **First Platypus Bank**.
3. Nhập Username **`user_transactions_dynamic`** và Password **`pass_good`**.
4. Bấm **Submit**. Plaid sẽ khởi tạo một `public_token` và trả về cho React client.
5. React client tự động gọi API `/api/v1/plaid/exchange-public-token`.
6. Backend trao đổi đổi lấy `access_token`, lưu thông tin ngân hàng vào cơ sở dữ liệu (`bank_accounts`) và cập nhật trạng thái thẻ sang **"Connected"**.

---

### Bước 2: Đồng bộ Giao dịch Động (Sync Dynamic Transactions)
1. Bấm nút **[Đồng bộ giao dịch]** (Sync Transactions).
2. Backend gọi Plaid API `/transactions/sync` sử dụng `access_token` của `user_transactions_dynamic`.
3. Tải về **15 giao dịch động phong phú** mới nhất của ngân hàng Sandbox **First Platypus Bank**.
4. Sau khi đồng bộ thành công, hiển thị thông báo toast:
   > **"15 transactions synchronized successfully."**

---

### Bước 3: Phân loại Thương hiệu Tự động (Merchant Categorization Pipeline)
Mỗi giao dịch ngân hàng Sandbox được phân loại tự động qua Pipeline 5 tầng:

| Thương hiệu giao dịch (Merchant / Note) | Danh mục Phân loại | Tầng Phân loại thành công |
|:---|:---|:---|
| **OpenAI** | **Utilities** (Dịch vụ / Công nghệ) | Smart Rule Engine / AI Categorizer |
| **Apple** | **Shopping** (Mua sắm) | Smart Rule Engine / AI Categorizer |
| **Interest payment** | **Interest / Income** (Thu nhập / Tiền lãi) | Smart Rule Engine (Income Rules) |
| **Spotify** | **Entertainment** (Giải trí) | Smart Rule Engine |
| **Netflix** | **Entertainment** (Giải trí) | Smart Rule Engine |
| **Royal Farms** | **Food** (Ăn uống) | Smart Rule Engine |
| **Sweetgreen** | **Food** (Ăn uống) | Smart Rule Engine |
| **Smart & Final** | **Food** (Ăn uống) | Smart Rule Engine |

Kết quả phân loại được tự động lưu vào **Redis Cache (TTL 30 ngày)** để tối ưu tốc độ cho các lần đồng bộ tiếp theo.

---

### Bước 4: Cập nhật Dashboard Động Thời gian thực (Real-time Dashboard Update)

Sau khi hoàn tất Sync, **Dashboard tự động cập nhật mà KHÔNG CẦN RELOAD TRANG**:

1. **Tổng số dư (Total Balance)**: Tự động tính tổng số dư từ ngân hàng Sandbox First Platypus Bank và các tài khoản liên kết.
2. **Thu nhập tháng (Monthly Income)** & **Chi tiêu tháng (Monthly Expense)**: Tổng hợp tức thì.
3. **Bảng Giao dịch gần đây (Recent Transactions)**: Hiển thị 5 giao dịch mới nhất với biểu tượng Thu/Chi, màu sắc phân biệt và danh mục chuẩn.
4. **Card Phân bổ Chi tiêu (Expense Distribution Card)**:
   - Hiển thị tổng % đã chi trên biểu đồ Donut.
   - Hiển thị **Badge nổi bật Danh mục chi nhiều nhất**: `Chi nhiều nhất: Utilities (38.5%)` hoặc `Chi nhiều nhất: Food (42.0%)`.
   - Danh sách chi tiết % của từng danh mục kèm thanh tiến trình sinh động.

---

## 3. Danh mục Kiểm thử Quick Checklist

- [x] Đăng ký / Đăng nhập tài khoản mới (Giao diện sạch 0 giao dịch rác).
- [x] Mở Plaid Link và kết nối ngân hàng **First Platypus Bank** (`user_transactions_dynamic` / `pass_good`).
- [x] Đã đổi `public_token` lấy `access_token` và lưu `bank_accounts`.
- [x] Bấm **[Đồng bộ giao dịch]** nhận 15 giao dịch động thành công.
- [x] Giao dịch `OpenAI` được phân loại đúng vào **Utilities**.
- [x] Giao dịch `Apple` được phân loại đúng vào **Shopping**.
- [x] Giao dịch `Interest payment` được phân loại đúng vào **Interest / Income**.
- [x] Card Phân bổ Chi tiêu hiển thị đúng **Chi nhiều nhất (Top Category Highlight)**.
- [x] Dashboard cập nhật 100% thời gian thực không reload trang.