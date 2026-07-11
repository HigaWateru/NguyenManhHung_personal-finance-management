# Smart Finance Sitemap

## 1) Public Routes
- /login
  - Module: Authentication
  - Entity focus: User, RefreshToken
  - Use case: Login

- /register
  - Module: Authentication
  - Entity focus: User
  - Use case: Register

## 2) Private Routes (Authenticated)
- /
  - Module: Dashboard
  - Entity focus: Income, Expense (aggregate), Category (aggregate)
  - Use case: Overview, recent transactions, summary cards

- /income
  - Module: Income Management
  - Entity focus: Income, Category(type=INCOME)
  - Use case: Create, Read, Update, Delete, Search, Pagination

- /expense
  - Module: Expense Management
  - Entity focus: Expense, Category(type=EXPENSE)
  - Use case: Create, Read, Update, Delete, Search, Pagination

- /category
  - Module: Category Management
  - Entity focus: Category
  - Use case: Create, Read, Update, Delete

- /statistics
  - Module: Statistics
  - Entity focus: Income, Expense, Category
  - Use case: Monthly, Yearly, By Category charts

- /profile
  - Module: User & Security
  - Entity focus: User, RefreshToken
  - Use case: View profile, update profile, change password, session controls

## 3) Sidebar Information Architecture
- Core
  - Dashboard
- Transactions
  - Income
  - Expense
  - Category
- Insights
  - Statistics
- Account
  - Profile

## 4) Entity-to-Page Mapping
- User -> /profile, /login, /register
- RefreshToken -> /profile (session/security), /login (issue token), /logout flow
- Category -> /category, /income, /expense
- Income -> /income, /, /statistics
- Expense -> /expense, /, /statistics
