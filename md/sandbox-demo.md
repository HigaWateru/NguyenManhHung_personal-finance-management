# Plaid Sandbox Integration Guide

## Mục tiêu

Tích hợp Plaid Sandbox vào Smart Finance để:

- Kết nối ngân hàng giả lập
- Đồng bộ giao dịch
- Đồng bộ tài khoản
- Phân loại giao dịch
- Cập nhật Dashboard

Không sử dụng tiền thật.

---

# Kiến thức cơ bản

Plaid gồm:

User

↓

Plaid Link

↓

Institution

↓

Access Token

↓

Accounts

↓

Transactions

↓

Application

Application KHÔNG kết nối trực tiếp tới ngân hàng.

Application chỉ giao tiếp với Plaid.

Plaid giao tiếp với Sandbox Bank.

---

# Bước 1

Đăng ký tài khoản Plaid

https://dashboard.plaid.com

Tạo Sandbox Project.

---

# Bước 2

Lấy:

- client_id
- secret
- environment

Lưu vào

application.yml

---

# Bước 3

Backend

Cài Plaid SDK

Tạo

PlaidConfig

PlaidClient

PlaidService

---

# Bước 4

Tạo API

POST

/api/plaid/create-link-token

Frontend sẽ gọi API này.

---

# Bước 5

React

Cài

react-plaid-link

Hiển thị

Connect Bank

---

# Bước 6

Người dùng chọn Sandbox Bank

Ví dụ

First Platypus Bank

---

# Bước 7

Đăng nhập

Sandbox Credential

Plaid cung cấp sẵn.

Không dùng tài khoản thật.

---

# Bước 8

Frontend nhận

public_token

↓

Backend

exchange public_token

↓

access_token

↓

item_id

Lưu DB.

---

# Bước 9

Đồng bộ Account

/accounts/get

Lưu

BankAccount

---

# Bước 10

Đồng bộ Transaction

transactions/sync

↓

added

modified

removed

---

# Bước 11

Lưu Transaction

category_id = NULL

status = PENDING

---

# Bước 12

Merchant Mapping

Nếu tìm thấy

↓

Update category

---

# Bước 13

Nếu không tìm thấy

↓

Rule Engine

---

# Bước 14

Nếu vẫn không

↓

AI Categorizer

↓

Update Transaction

↓

Save Merchant Mapping

---

# Bước 15

Dashboard

Hiển thị

- Tổng thu
- Tổng chi
- Budget
- Category
- Biểu đồ

---

# Demo

## Demo 1

Connect Bank

↓

Chọn Sandbox

↓

Đăng nhập

↓

Sync

↓

Có dữ liệu

---

## Demo 2

Sync lần 2

↓

Có giao dịch mới

↓

Dashboard thay đổi

---

## Demo 3

Merchant Mapping

↓

Không gọi AI

↓

Category cập nhật ngay

---

## Demo 4

Merchant mới

↓

AI

↓

Category

↓

MerchantMapping

↓

Sync lần sau

↓

Không gọi AI

---

## Demo 5

User sửa Category

↓

MerchantMapping cập nhật

↓

Các giao dịch sau dùng Category mới

---

# Kiến trúc cuối cùng

Plaid Sandbox

↓

Spring Boot

↓

Transaction

↓

Merchant Mapping

↓

Rule Engine

↓

AI

↓

Redis Cache

↓

Dashboard

---

# Checklist

- [ ] Đăng ký Plaid
- [ ] Tạo Sandbox
- [ ] Tạo Link Token
- [ ] React Plaid Link
- [ ] Exchange Public Token
- [ ] Lưu Access Token
- [ ] Đồng bộ Account
- [ ] Đồng bộ Transaction
- [ ] Merchant Mapping
- [ ] Rule Engine
- [ ] AI Categorizer
- [ ] Dashboard
- [ ] Budget
- [ ] Report