==================================================
PLAID SANDBOX INTEGRATION & REAL-TIME DASHBOARD FLOW
==================================================

Dashboard hỗ trợ toàn bộ quy trình kết nối ngân hàng Sandbox (First Platypus Bank).

--------------------------------------------------
Trạng thái 1 - Chưa kết nối (Disconnected)
--------------------------------------------------

Hiển thị Thẻ Liên kết Ngân hàng Plaid:

--------------------------------------------------
🏦 Tích hợp Plaid - Kết nối ngân hàng tự động

Chưa kết nối tài khoản ngân hàng.

[ Connect Bank ]
--------------------------------------------------

Khi nhấn [ Connect Bank ]:
   ↓
Mở Plaid Link Modal
   ↓
Người dùng tìm & chọn ngân hàng: First Platypus Bank
   ↓
Đăng nhập bằng Sandbox Credentials:
- Username: user_transactions_dynamic (hoặc user_good)
- Password: pass_good
   ↓
Frontend nhận public_token từ Plaid SDK
   ↓
Frontend gửi public_token + institutionName ("First Platypus Bank") về Backend
   ↓
Backend exchange thành access_token
   ↓
Lưu thông tin BankAccount vào DB & liên kết với User
   ↓
Chuyển trạng thái giao diện sang "Connected".

--------------------------------------------------
Trạng thái 2 - Đã kết nối (Connected)
--------------------------------------------------

Dashboard hiển thị thông tin ngân hàng & các nút thao tác:

✓ Institution Name: First Platypus Bank
✓ Account Name: Plaid Checking / Savings
✓ Account Type: CHECKING / SAVINGS
✓ Current Balance: $5,000.00 / ₫127,250,000
✓ Last Sync: Vừa xong / Thời gian thực
✓ Connection Status: CONNECTED

Các nút thao tác:
[ Đồng bộ giao dịch ] (Sync Transactions)
[ Xem tài khoản (1) ]
[ Hủy kết nối ] (Disconnect)

--------------------------------------------------
Quy trình Đồng bộ Giao dịch & Phân loại Thương hiệu
--------------------------------------------------

Khi nhấn [ Đồng bộ giao dịch ]:
   ↓
Hiển thị trạng thái Loading (Button đếm xoay, disabled)
   ↓
Backend gọi Plaid API transactions/sync
   ↓
Tải về 15 giao dịch động (Dynamic Transactions) từ ngân hàng First Platypus Bank
   ↓
Lưu Giao dịch vào CSDL
   ↓
Chạy Pipeline Phân loại Thương hiệu 5 tầng:
  1. Redis Merchant Cache (TTL 30 ngày)
  2. Merchant Mapping (User/Global)
  3. Smart Rule Engine:
     - OpenAI / ChatGPT → Utilities
     - Apple → Shopping
     - Interest payment → Interest Income
     - Spotify / Netflix → Entertainment
     - Royal Farms / Sweetgreen → Food
  4. AI Categorizer (Gemini 2.5 Flash API)
  5. Fallback Category ("Others" / "Khác")
   ↓
Cache kết quả phân loại vào Redis
   ↓
Backend hoàn tất và trả về HTTP 200: { syncedCount: 15 }
   ↓
Hiển thị thông báo Toast thành công:
"15 transactions synchronized successfully."

--------------------------------------------------
Cập nhật Động Thời gian thực (No Full Page Reload)
--------------------------------------------------

Dashboard tự động cập nhật ngay lập tức:

- Total Balance (Tổng số dư)
- Monthly Income (Thu nhập tháng)
- Monthly Expense (Chi tiêu tháng)
- Recent Transactions (Hiển thị 5 giao dịch mới nhất đã phân loại)
- Category Expense Distribution (Phân bổ chi tiêu dạng Donut & % danh mục)
- Top Category Highlight (Hiển thị badge "Chi nhiều nhất: Utilities (38.5%)")
- Budget Progress (Tiến độ ngân sách)

Tất cả diễn ra mượt mà, thời gian thực 100%, KHÔNG CẦN RELOAD TRANG.
