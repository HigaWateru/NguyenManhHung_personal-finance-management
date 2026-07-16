=========================
PLAID SANDBOX INTEGRATION
=========================

Dashboard phải hỗ trợ toàn bộ quy trình kết nối ngân hàng Sandbox.

Trạng thái 1 - Chưa kết nối

Hiển thị Card:

----------------------------------------
🏦 Bank Connection

Chưa kết nối tài khoản ngân hàng.

[ Connect Bank ]
----------------------------------------

Khi nhấn Connect Bank

↓

Mở Plaid Link

↓

Người dùng chọn Sandbox Bank

↓

Đăng nhập bằng Sandbox Credential

↓

Frontend gửi public_token về Backend

↓

Backend exchange thành access_token

↓

Lưu BankConnection

↓

Hiển thị trạng thái Connected.

--------------------------------------------------

Trạng thái 2 - Đã kết nối

Dashboard hiển thị:

✓ Institution Name

✓ Account Name

✓ Account Type

✓ Current Balance

✓ Last Sync

✓ Connection Status

Các nút:

[ Sync Transactions ]

[ Disconnect ]

[ View Accounts ]

--------------------------------------------------

Khi nhấn Sync Transactions

↓

Hiển thị Loading

↓

Backend gọi transactions/sync

↓

Lưu Transaction

↓

Merchant Mapping

↓

Rule Engine

↓

AI (nếu cần)

↓

Dashboard tự động Refresh

↓

Hiển thị thông báo:

"15 transactions synchronized successfully."

--------------------------------------------------

Dashboard phải tự động cập nhật:

- Balance
- Total Income
- Total Expense
- Budget
- Recent Transactions
- Expense by Category
- Monthly Report

Sau khi Sync hoàn thành.

Không yêu cầu reload trang.