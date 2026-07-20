export type Language = "vi" | "en" | "ja"

export type TranslationKeys = {
  // Navigation & Sidebar
  nav_dashboard: string
  nav_income: string
  nav_expense: string
  nav_categories: string
  nav_statistics: string
  nav_exchange_rates: string
  nav_profile: string
  nav_group_core: string
  nav_group_transactions: string
  nav_group_insights: string
  nav_group_account: string
  nav_focus_title: string
  nav_focus_desc: string

  // Header
  header_subtitle: string
  header_search_placeholder: string
  header_logout: string
  header_user_default_role: string
  notif_title: string
  notif_unread_count: string
  notif_no_unread: string
  notif_mark_all_read: string
  notif_tab_unread: string
  notif_tab_all: string
  notif_empty: string
  notif_badge_new: string
  notif_cat_plaid: string
  notif_cat_rate: string
  notif_cat_budget: string
  notif_cat_security: string
  notif_cat_system: string

  // Plaid Bank Banner
  bank_title: string
  bank_subtitle: string
  bank_desc: string
  bank_sync_btn: string
  bank_syncing: string
  bank_view_accounts: string
  bank_disconnect: string
  bank_connect_btn: string
  bank_label_institution: string
  bank_label_account: string
  bank_label_type: string
  bank_label_balance: string
  bank_label_last_synced: string
  bank_label_status: string

  // Dashboard Overview
  dash_total_balance: string
  dash_monthly_income: string
  dash_monthly_expense: string
  dash_saving_rate: string
  dash_center_title: string
  dash_center_desc: string
  dash_add_income: string
  dash_add_expense: string
  dash_add_category: string
  dash_quick_today: string
  dash_total_savings: string
  dash_total_expenses: string
  dash_current_net: string
  dash_weekly_flow: string
  dash_weekly_flow_sub: string
  dash_cat_distribution: string
  dash_cat_distribution_sub: string
  dash_top_category_prefix: string
  dash_budgets_title: string
  dash_budgets_sub: string
  dash_goals_title: string
  dash_goals_sub: string
  dash_recent_title: string
  dash_recent_sub: string
  dash_btn_new_budget: string
  dash_btn_new_goal: string
  dash_limit_exceeded: string
  dash_target_date: string
  dash_mod_income_desc: string
  dash_mod_expense_desc: string
  dash_mod_category_desc: string
  dash_mod_statistics_desc: string
  dash_open_page: string
  dash_no_budget: string
  dash_no_goal: string
  dash_upcoming_bills: string
  dash_bill_pay: string
  dash_bill_paid: string

  // Exchange Rates
  rate_hero_tag: string
  rate_hero_title: string
  rate_hero_desc: string
  rate_update_btn: string
  rate_updating: string
  rate_table_title: string
  rate_table_sub: string
  rate_col_currency: string
  rate_col_usd_base: string
  rate_col_vnd_equiv: string
  rate_col_24h_change: string
  rate_col_updated: string
  rate_converter_title: string
  rate_converter_sub: string
  rate_converter_amount: string
  rate_converter_from: string
  rate_converter_to: string
  rate_converter_result: string

  // Income & Expense Pages
  inc_page_tag: string
  inc_page_title: string
  inc_page_desc: string
  exp_page_tag: string
  exp_page_title: string
  exp_page_desc: string
  btn_add_record: string
  search_notes_placeholder: string
  all_categories_filter: string
  col_date: string
  col_category: string
  col_amount: string
  col_note: string
  col_actions: string
  modal_add_income: string
  modal_edit_income: string
  modal_add_expense: string
  modal_edit_expense: string
  modal_date_label: string
  modal_category_label: string
  modal_amount_label: string
  modal_note_label: string

  // Category Page
  cat_page_tag: string
  cat_page_title: string
  cat_page_desc: string
  cat_btn_create: string
  cat_col_name: string
  cat_col_type: string
  cat_col_count: string
  cat_col_status: string
  cat_col_desc: string
  cat_chip_income: string
  cat_chip_expense: string
  cat_chip_auto: string
  cat_status_active: string
  cat_status_review: string
  cat_type_income: string
  cat_type_expense: string
  cat_modal_create_title: string
  cat_modal_edit_title: string

  // Statistics Page
  stat_page_tag: string
  stat_page_title: string
  stat_page_desc: string
  stat_year_label: string
  stat_from_date: string
  stat_to_date: string
  stat_flow_chart_title: string
  stat_dist_chart_title: string
  stat_line_chart_title: string
  stat_total_income_year: string
  stat_total_expense_year: string
  stat_yearly_net: string
  stat_by_month: string
  stat_proportion: string

  // Profile Page
  prof_page_tag: string
  prof_page_title: string
  prof_page_desc: string
  prof_personal_info: string
  prof_security_settings: string
  prof_full_name: string
  prof_email: string
  prof_role: string
  prof_currency: string
  prof_timezone: string
  prof_old_password: string
  prof_new_password: string
  prof_confirm_password: string
  prof_save_btn: string
  prof_change_pass_btn: string

  // Common
  loading: string
  save: string
  cancel: string
  delete: string
  edit: string
  confirm: string
  no_data: string
  showing_results: string
  page_previous: string
  page_next: string
  search: string
}

export const translations: Record<Language, TranslationKeys> = {
  vi: {
    // Navigation & Sidebar
    nav_dashboard: "Tổng quan",
    nav_income: "Thu nhập",
    nav_expense: "Chi tiêu",
    nav_categories: "Danh mục",
    nav_statistics: "Thống kê",
    nav_exchange_rates: "Tỷ giá thị trường",
    nav_profile: "Hồ sơ",
    nav_group_core: "Chính",
    nav_group_transactions: "Giao dịch",
    nav_group_insights: "Phân tích",
    nav_group_account: "Tài khoản",
    nav_focus_title: "Trọng tâm",
    nav_focus_desc: "Theo dõi dòng tiền, hành vi chi tiêu và mục tiêu tiết kiệm trên một bảng điều khiển duy nhất.",

    // Header
    header_subtitle: "Smart Finance · Quản Lý Tài Chính Cá Nhân",
    header_search_placeholder: "Tìm giao dịch, danh mục, thống kê...",
    header_logout: "Đăng xuất",
    header_user_default_role: "Tài khoản người dùng",
    notif_title: "Thông Báo & Cảnh Báo",
    notif_unread_count: "thông báo mới chưa đọc",
    notif_no_unread: "Tất cả thông báo đã xem",
    notif_mark_all_read: "Đã đọc hết",
    notif_tab_unread: "Chưa đọc",
    notif_tab_all: "Tất cả",
    notif_empty: "Không có thông báo nào.",
    notif_badge_new: "✨ Mới",
    notif_cat_plaid: "Ngân hàng Plaid",
    notif_cat_rate: "Tỷ giá Ngoại tệ",
    notif_cat_budget: "Cảnh báo Ngân sách",
    notif_cat_security: "Bảo mật Tài khoản",
    notif_cat_system: "Hệ thống",

    // Plaid Bank Banner
    bank_title: "Kết nối Ngân hàng",
    bank_subtitle: "Kết nối ngân hàng tự động",
    bank_desc: "Đồng bộ hóa tất cả các giao dịch từ tài khoản ngân hàng của bạn một cách nhanh chóng và bảo mật.",
    bank_sync_btn: "Đồng bộ giao dịch",
    bank_syncing: "Đang đồng bộ...",
    bank_view_accounts: "Xem tài khoản",
    bank_disconnect: "Hủy kết nối",
    bank_connect_btn: "Kết nối Ngân hàng",
    bank_label_institution: "Ngân hàng",
    bank_label_account: "Tài khoản chính",
    bank_label_type: "Loại tài khoản",
    bank_label_balance: "Số dư hiện tại",
    bank_label_last_synced: "Đồng bộ cuối",
    bank_label_status: "Trạng thái kết nối",

    // Dashboard Overview
    dash_total_balance: "Tổng số dư",
    dash_monthly_income: "Thu nhập tháng",
    dash_monthly_expense: "Chi tiêu tháng",
    dash_saving_rate: "Tỷ lệ tiết kiệm",
    dash_center_title: "Trung tâm điều phối dòng tiền tài chính cá nhân.",
    dash_center_desc: "Theo dõi số dư tức thời, quản lý thu chi, ngân sách, mục tiêu tích lũy và dòng giao dịch tự động.",
    dash_add_income: " Thêm thu nhập",
    dash_add_expense: " Thêm chi tiêu",
    dash_add_category: " Thêm danh mục",
    dash_quick_today: "Nhanh hôm nay",
    dash_total_savings: "Tổng tích lũy",
    dash_total_expenses: "Tổng chi tích lũy",
    dash_current_net: "Tổng số dư hiện tại",
    dash_weekly_flow: "Dòng Tiền Theo Tuần",
    dash_weekly_flow_sub: "Tương quan thu chi theo từng ngày",
    dash_cat_distribution: "Phân Bổ Chi Tiêu",
    dash_cat_distribution_sub: "Tỷ trọng các nhóm chi phí chính",
    dash_top_category_prefix: "Chi nhiều nhất",
    dash_budgets_title: "Ngân Sách Chi Tiêu",
    dash_budgets_sub: "Hạn mức chi tiêu chi tiết theo danh mục",
    dash_goals_title: "Mục Tiêu Tiết Kiệm",
    dash_goals_sub: "Tiến độ tích lũy cho các kế hoạch tài chính",
    dash_recent_title: "Giao Dịch Gần Đây",
    dash_recent_sub: "Các biến động thu chi mới nhất",
    dash_btn_new_budget: "+ Thiết lập ngân sách",
    dash_btn_new_goal: "+ Tạo mục tiêu",
    dash_limit_exceeded: "Đạt hạn mức",
    dash_target_date: "Mục tiêu",
    dash_mod_income_desc: "Thêm, tìm kiếm và quản lý tất cả giao dịch thu vào.",
    dash_mod_expense_desc: "Theo dõi hành vi chi và dòng tiền ra theo danh mục.",
    dash_mod_category_desc: "Quản lý nhóm phân loại cho giao dịch thu và chi.",
    dash_mod_statistics_desc: "Phân tích tài chính theo tháng, năm và danh mục.",
    dash_open_page: "Mở trang",
    dash_no_budget: "Chưa có ngân sách nào được thiết lập.",
    dash_no_goal: "Chưa có mục tiêu tiết kiệm.",
    dash_upcoming_bills: "Các Hóa Đơn Định Kỳ",
    dash_bill_pay: "Thanh toán",
    dash_bill_paid: "Đã trả",

    // Exchange Rates
    rate_hero_tag: "Thị trường ngoại hối (Base: USD $)",
    rate_hero_title: "Tỷ Giá Thị Trường Thực",
    rate_hero_desc: "Bảng tỷ giá ngoại tệ trực tuyến chuẩn quốc tế lấy Đô la Mỹ (USD - $) làm đơn vị gốc. Tự động theo dõi biến động thị trường trong 24 giờ và hỗ trợ bộ quy đổi tiền tệ tức thì.",
    rate_update_btn: "Cập nhật thị trường 24h",
    rate_updating: "Đang cập nhật...",
    rate_table_title: "Bảng Tỷ Giá Ngoại Tệ Trực Tuyến",
    rate_table_sub: "Đơn vị gốc chuẩn: Đô la Mỹ (USD - $)",
    rate_col_currency: "Đồng tiền",
    rate_col_usd_base: "Tỷ giá (Gốc USD $)",
    rate_col_vnd_equiv: "Tỷ giá (VND)",
    rate_col_24h_change: "Biến động (24h)",
    rate_col_updated: "Cập nhật",
    rate_converter_title: "Bộ Quy Đổi Tiền Tệ",
    rate_converter_sub: "Quy đổi tỷ giá nhanh theo thời gian thực",
    rate_converter_amount: "Số tiền cần quy đổi",
    rate_converter_from: "Từ",
    rate_converter_to: "Sang",
    rate_converter_result: "Kết quả quy đổi",

    // Income & Expense Pages
    inc_page_tag: "Giao dịch",
    inc_page_title: "Quản lý thu nhập",
    inc_page_desc: "Ghi nhận và quản lý các nguồn thu nhập cá nhân hàng tháng một cách chính xác.",
    exp_page_tag: "Giao dịch",
    exp_page_title: "Quản lý chi tiêu",
    exp_page_desc: "Theo dõi và quản lý chi tiết các khoản chi tiêu sinh hoạt, ăn uống và mua sắm cá nhân hàng ngày.",
    btn_add_record: "Thêm giao dịch",
    search_notes_placeholder: "Tìm ghi chú hoặc danh mục...",
    all_categories_filter: "Tất cả danh mục",
    col_date: "Ngày giao dịch",
    col_category: "Danh mục",
    col_amount: "Số tiền",
    col_note: "Ghi chú",
    col_actions: "Hành động",
    modal_add_income: "Thêm thu nhập mới",
    modal_edit_income: "Cập nhật thu nhập",
    modal_add_expense: "Thêm chi tiêu mới",
    modal_edit_expense: "Cập nhật chi tiêu",
    modal_date_label: "Ngày giao dịch",
    modal_category_label: "Danh mục",
    modal_amount_label: "Số tiền",
    modal_note_label: "Ghi chú mô tả",

    // Category Page
    cat_page_tag: "Phân loại tài chính",
    cat_page_title: "Quản lý danh mục",
    cat_page_desc: "Tùy chỉnh và quản lý phân loại danh mục Thu nhập và Chi tiêu linh hoạt theo nhu cầu quản lý tài chính của bạn.",
    cat_btn_create: "Tạo danh mục",
    cat_col_name: "Tên danh mục",
    cat_col_type: "Loại danh mục",
    cat_col_count: "Số giao dịch",
    cat_col_status: "Trạng thái",
    cat_col_desc: "Mô tả",
    cat_chip_income: "Danh mục Thu nhập",
    cat_chip_expense: "Danh mục Chi tiêu",
    cat_chip_auto: "Tự động phân loại",
    cat_status_active: "Hoạt động",
    cat_status_review: "Rà soát",
    cat_type_income: "Thu nhập",
    cat_type_expense: "Chi tiêu",
    cat_modal_create_title: "Tạo danh mục mới",
    cat_modal_edit_title: "Cập nhật danh mục",

    // Statistics Page
    stat_page_tag: "Thống kê",
    stat_page_title: "Báo cáo tài chính",
    stat_page_desc: "Báo cáo phân tích tổng quan dòng tiền thu nhập, chi tiêu và phân bổ ngân sách chi tiết theo thời gian thực.",
    stat_year_label: "Năm báo cáo",
    stat_from_date: "Từ ngày",
    stat_to_date: "Đến ngày",
    stat_flow_chart_title: "Tương Quan Thu Chi Theo Tháng",
    stat_dist_chart_title: "Phân Bổ Chi Tiêu Theo Danh Mục",
    stat_line_chart_title: "Xu Hướng Số Dư Ròng",
    stat_total_income_year: "Tổng thu năm",
    stat_total_expense_year: "Tổng chi năm",
    stat_yearly_net: "Số dư ròng",
    stat_by_month: "Theo tháng",
    stat_proportion: "Tỷ trọng",

    // Profile Page
    prof_page_tag: "Cài đặt",
    prof_page_title: "Hồ sơ người dùng",
    prof_page_desc: "Quản lý thông tin cá nhân, cài đặt tài khoản và tùy chỉnh mật khẩu an toàn.",
    prof_personal_info: "Thông tin cá nhân",
    prof_security_settings: "Bảo mật & Mật khẩu",
    prof_full_name: "Họ và tên",
    prof_email: "Địa chỉ Email",
    prof_role: "Vai trò người dùng",
    prof_currency: "Đơn vị tiền tệ",
    prof_timezone: "Múi giờ",
    prof_old_password: "Mật khẩu hiện tại",
    prof_new_password: "Mật khẩu mới",
    prof_confirm_password: "Xác nhận mật khẩu mới",
    prof_save_btn: "Lưu thay đổi",
    prof_change_pass_btn: "Đổi mật khẩu",

    // Common
    loading: "Đang tải dữ liệu...",
    save: "Lưu",
    cancel: "Hủy",
    delete: "Xóa",
    edit: "Sửa",
    confirm: "Xác nhận",
    no_data: "Không có dữ liệu nào.",
    showing_results: "Hiển thị",
    page_previous: "Trang trước",
    page_next: "Trang sau",
    search: "Tìm kiếm..."
  },

  en: {
    // Navigation & Sidebar
    nav_dashboard: "Dashboard",
    nav_income: "Income",
    nav_expense: "Expenses",
    nav_categories: "Categories",
    nav_statistics: "Statistics",
    nav_exchange_rates: "Exchange Rates",
    nav_profile: "Profile",
    nav_group_core: "Core",
    nav_group_transactions: "Transactions",
    nav_group_insights: "Insights",
    nav_group_account: "Account",
    nav_focus_title: "Key Focus",
    nav_focus_desc: "Monitor cash flow, spending habits, and savings goals on a single unified dashboard.",

    // Header
    header_subtitle: "Smart Finance · Personal Finance Management",
    header_search_placeholder: "Search transactions, categories, stats...",
    header_logout: "Sign Out",
    header_user_default_role: "User Account",
    notif_title: "Notifications & Alerts",
    notif_unread_count: "new unread notifications",
    notif_no_unread: "All notifications read",
    notif_mark_all_read: "Mark all read",
    notif_tab_unread: "Unread",
    notif_tab_all: "All",
    notif_empty: "No notifications available.",
    notif_badge_new: "✨ New",
    notif_cat_plaid: "Plaid Bank",
    notif_cat_rate: "Exchange Rates",
    notif_cat_budget: "Budget Alert",
    notif_cat_security: "Account Security",
    notif_cat_system: "System",

    // Plaid Bank Banner
    bank_title: "Bank Connection",
    bank_subtitle: "Automated Bank Synchronization",
    bank_desc: "Synchronize all transactions from your linked bank accounts quickly and securely.",
    bank_sync_btn: "Sync Transactions",
    bank_syncing: "Syncing...",
    bank_view_accounts: "View Accounts",
    bank_disconnect: "Disconnect Bank",
    bank_connect_btn: "Connect Bank",
    bank_label_institution: "Bank Institution",
    bank_label_account: "Primary Account",
    bank_label_type: "Account Type",
    bank_label_balance: "Current Balance",
    bank_label_last_synced: "Last Synced",
    bank_label_status: "Connection Status",

    // Dashboard Overview
    dash_total_balance: "Total Balance",
    dash_monthly_income: "Monthly Income",
    dash_monthly_expense: "Monthly Expense",
    dash_saving_rate: "Savings Rate",
    dash_center_title: "Personal Cash Flow Command Center",
    dash_center_desc: "Track real-time balances, income/expenses, budgets, savings goals, and automated transaction feeds.",
    dash_add_income: " Add Income",
    dash_add_expense: " Add Expense",
    dash_add_category: " Add Category",
    dash_quick_today: "Quick Overview",
    dash_total_savings: "Total Savings",
    dash_total_expenses: "Total Cumulative Expense",
    dash_current_net: "Net Current Balance",
    dash_weekly_flow: "Weekly Cash Flow",
    dash_weekly_flow_sub: "Daily income vs expense comparison",
    dash_cat_distribution: "Expense Breakdown",
    dash_cat_distribution_sub: "Proportion of major expense groups",
    dash_top_category_prefix: "Highest Spending",
    dash_budgets_title: "Budget Planning",
    dash_budgets_sub: "Spending limits organized by category",
    dash_goals_title: "Savings Goals",
    dash_goals_sub: "Accumulation progress for financial plans",
    dash_recent_title: "Recent Transactions",
    dash_recent_sub: "Latest income and expense activities",
    dash_btn_new_budget: "+ Add Budget Limit",
    dash_btn_new_goal: "+ Create Goal",
    dash_limit_exceeded: "Limit Reached",
    dash_target_date: "Target",
    dash_mod_income_desc: "Add, search, and manage all incoming income streams.",
    dash_mod_expense_desc: "Track spending habits and outgoing cash flow by category.",
    dash_mod_category_desc: "Manage classification groups for income & expenses.",
    dash_mod_statistics_desc: "Analyze financial performance by month, year & category.",
    dash_open_page: "Open Page",
    dash_no_budget: "No budget configured yet.",
    dash_no_goal: "No savings goals set yet.",
    dash_upcoming_bills: "Upcoming Recurring Bills",
    dash_bill_pay: "Pay Now",
    dash_bill_paid: "Paid",

    // Exchange Rates
    rate_hero_tag: "Forex Market (Base: USD $)",
    rate_hero_title: "Real-Time Market Exchange Rates",
    rate_hero_desc: "International market currency exchange rates with US Dollar (USD - $) as base. Tracks 24-hour fluctuations automatically and offers instant currency conversion.",
    rate_update_btn: "Refresh Market (24h)",
    rate_updating: "Updating...",
    rate_table_title: "Live Foreign Currency Table",
    rate_table_sub: "Standard Base Unit: US Dollar (USD - $)",
    rate_col_currency: "Currency",
    rate_col_usd_base: "Base Rate (USD $)",
    rate_col_vnd_equiv: "Equivalent (VND)",
    rate_col_24h_change: "24h Variation",
    rate_col_updated: "Last Updated",
    rate_converter_title: "Currency Converter",
    rate_converter_sub: "Instant real-time currency converter",
    rate_converter_amount: "Amount to Convert",
    rate_converter_from: "From",
    rate_converter_to: "To",
    rate_converter_result: "Converted Result",

    // Income & Expense Pages
    inc_page_tag: "Transactions",
    inc_page_title: "Income Management",
    inc_page_desc: "Record and manage monthly personal income streams accurately.",
    exp_page_tag: "Transactions",
    exp_page_title: "Expense Management",
    exp_page_desc: "Track and organize daily living, dining, and shopping expenses in detail.",
    btn_add_record: "Add Transaction",
    search_notes_placeholder: "Search notes or categories...",
    all_categories_filter: "All Categories",
    col_date: "Transaction Date",
    col_category: "Category",
    col_amount: "Amount",
    col_note: "Notes",
    col_actions: "Actions",
    modal_add_income: "Add New Income",
    modal_edit_income: "Update Income",
    modal_add_expense: "Add New Expense",
    modal_edit_expense: "Update Expense",
    modal_date_label: "Transaction Date",
    modal_category_label: "Category",
    modal_amount_label: "Amount",
    modal_note_label: "Description Notes",

    // Category Page
    cat_page_tag: "Financial Classification",
    cat_page_title: "Category Management",
    cat_page_desc: "Customize income and expense categories flexibly according to your financial needs.",
    cat_btn_create: "Create Category",
    cat_col_name: "Category Name",
    cat_col_type: "Type",
    cat_col_count: "Transactions",
    cat_col_status: "Status",
    cat_col_desc: "Description",
    cat_chip_income: "Income Categories",
    cat_chip_expense: "Expense Categories",
    cat_chip_auto: "Auto Categorization",
    cat_status_active: "Active",
    cat_status_review: "Under Review",
    cat_type_income: "Income",
    cat_type_expense: "Expense",
    cat_modal_create_title: "Create New Category",
    cat_modal_edit_title: "Update Category",

    // Statistics Page
    stat_page_tag: "Statistics",
    stat_page_title: "Financial Analytics & Reports",
    stat_page_desc: "Real-time analytical reports on cash flow, expense distribution, and budget performance.",
    stat_year_label: "Reporting Year",
    stat_from_date: "From Date",
    stat_to_date: "To Date",
    stat_flow_chart_title: "Monthly Income vs Expense Flow",
    stat_dist_chart_title: "Expense Distribution by Category",
    stat_line_chart_title: "Net Balance Trend",
    stat_total_income_year: "Total Annual Income",
    stat_total_expense_year: "Total Annual Expense",
    stat_yearly_net: "Net Balance",
    stat_by_month: "By Month",
    stat_proportion: "Proportion",

    // Profile Page
    prof_page_tag: "Settings",
    prof_page_title: "User Profile",
    prof_page_desc: "Manage personal information, account settings, and update password securely.",
    prof_personal_info: "Personal Information",
    prof_security_settings: "Security & Password",
    prof_full_name: "Full Name",
    prof_email: "Email Address",
    prof_role: "User Role",
    prof_currency: "Display Currency",
    prof_timezone: "Timezone",
    prof_old_password: "Current Password",
    prof_new_password: "New Password",
    prof_confirm_password: "Confirm New Password",
    prof_save_btn: "Save Changes",
    prof_change_pass_btn: "Change Password",

    // Common
    loading: "Loading data...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    confirm: "Confirm",
    no_data: "No data available.",
    showing_results: "Showing",
    page_previous: "Previous",
    page_next: "Next",
    search: "Search..."
  },

  ja: {
    // Navigation & Sidebar
    nav_dashboard: "ダッシュボード",
    nav_income: "収入管理",
    nav_expense: "支出管理",
    nav_categories: "カテゴリ設定",
    nav_statistics: "統計・レポート",
    nav_exchange_rates: "為替レート",
    nav_profile: "プロフィール",
    nav_group_core: "メイン",
    nav_group_transactions: "取引履歴",
    nav_group_insights: "分析",
    nav_group_account: "アカウント",
    nav_focus_title: "フォーカス",
    nav_focus_desc: "キャッシュフロー、支出傾向、貯蓄目標を一元管理するダッシュボード。",

    // Header
    header_subtitle: "Smart Finance · 個人資産管理システム",
    header_search_placeholder: "取引、カテゴリ、統計を検索...",
    header_logout: "ログアウト",
    header_user_default_role: "ユーザーアカウント",
    notif_title: "通知・アラート",
    notif_unread_count: "件の未読通知",
    notif_no_unread: "すべての通知を確認済み",
    notif_mark_all_read: "すべて既読にする",
    notif_tab_unread: "未読",
    notif_tab_all: "すべて",
    notif_empty: "通知はありません。",
    notif_badge_new: "✨ 新着",
    notif_cat_plaid: "Plaid銀行連携",
    notif_cat_rate: "為替レート",
    notif_cat_budget: "予算アラート",
    notif_cat_security: "セキュリティ",
    notif_cat_system: "システム",

    // Plaid Bank Banner
    bank_title: "銀行口座連携",
    bank_subtitle: "自動口座同期機能",
    bank_desc: "連携銀行口座の取引履歴を迅速かつ安全に同期します。",
    bank_sync_btn: "取引データを同期",
    bank_syncing: "同期中...",
    bank_view_accounts: "口座一覧",
    bank_disconnect: "連携解除",
    bank_connect_btn: "銀行口座を連携",
    bank_label_institution: "金融機関",
    bank_label_account: "メイン口座",
    bank_label_type: "口座種別",
    bank_label_balance: "現在残高",
    bank_label_last_synced: "最終同期",
    bank_label_status: "接続状態",

    // Dashboard Overview
    dash_total_balance: "総資産残高",
    dash_monthly_income: "今月の収入",
    dash_monthly_expense: "今月の支出",
    dash_saving_rate: "貯蓄率",
    dash_center_title: "個人財務キャッシュフロー統括センター",
    dash_center_desc: "リアルタイム残高、収支管理、予算計画、貯蓄目標、自動取引データを一元管理します。",
    dash_add_income: " 収入を追加",
    dash_add_expense: " 支出を追加",
    dash_add_category: " カテゴリを追加",
    dash_quick_today: "本日のサマリー",
    dash_total_savings: "総貯蓄額",
    dash_total_expenses: "累計支出額",
    dash_current_net: "純資産額",
    dash_weekly_flow: "週間キャッシュフロー",
    dash_weekly_flow_sub: "日別の収支バランス比較",
    dash_cat_distribution: "支出の内訳",
    dash_cat_distribution_sub: "主要費目別の支出割合",
    dash_top_category_prefix: "最多支出費目",
    dash_budgets_title: "予算管理",
    dash_budgets_sub: "カテゴリ別の支出上限設定",
    dash_goals_title: "貯蓄目標",
    dash_goals_sub: "財務計画に向けた貯蓄の進捗",
    dash_recent_title: "最近の取引履歴",
    dash_recent_sub: "最新の収支アクティビティ",
    dash_btn_new_budget: "+ 予算を設定",
    dash_btn_new_goal: "+ 目標を作成",
    dash_limit_exceeded: "上限到達",
    dash_target_date: "目標期限",
    dash_mod_income_desc: "収入データの追加・検索・一元管理。",
    dash_mod_expense_desc: "費目別の支出傾向とキャッシュフローの追跡。",
    dash_mod_category_desc: "収支取引のカテゴリ分類グループの管理。",
    dash_mod_statistics_desc: "月別・年別・費目別の詳細財務分析。",
    dash_open_page: "ページを開く",
    dash_no_budget: "予算が設定されていません。",
    dash_no_goal: "貯蓄目標が設定されていません。",
    dash_upcoming_bills: "定期請求・支払予定",
    dash_bill_pay: "支払う",
    dash_bill_paid: "支払済み",

    // Exchange Rates
    rate_hero_tag: "外国為替市場 (Base: USD $)",
    rate_hero_title: "リアルタイム市場為替レート",
    rate_hero_desc: "米ドル (USD - $) を基軸通貨とした国際為替レート。24時間の市場変動を自動追跡し、即時通貨換算機能をサポート。",
    rate_update_btn: "為替データを更新 (24h)",
    rate_updating: "更新中...",
    rate_table_title: "リアルタイム為替レート一覧",
    rate_table_sub: "基軸通貨: 米ドル (USD - $)",
    rate_col_currency: "通貨",
    rate_col_usd_base: "基軸レート (USD $)",
    rate_col_vnd_equiv: "換算額 (VND)",
    rate_col_24h_change: "24時間変動",
    rate_col_updated: "最終更新",
    rate_converter_title: "通貨コンバーター",
    rate_converter_sub: "リアルタイムの即時通貨換算計算機",
    rate_converter_amount: "換算金額",
    rate_converter_from: "換算元",
    rate_converter_to: "換算先",
    rate_converter_result: "換算結果",

    // Income & Expense Pages
    inc_page_tag: "取引",
    inc_page_title: "収入の管理",
    inc_page_desc: "毎月の個人収入を正確に記録・管理します。",
    exp_page_tag: "取引",
    exp_page_title: "支出の管理",
    exp_page_desc: "日々の生活費、食費、ショッピング支出を詳細に管理します。",
    btn_add_record: "取引を追加",
    search_notes_placeholder: "メモやカテゴリを検索...",
    all_categories_filter: "すべてのカテゴリ",
    col_date: "取引日",
    col_category: "カテゴリ",
    col_amount: "金額",
    col_note: "メモ",
    col_actions: "操作",
    modal_add_income: "新規収入を登録",
    modal_edit_income: "収入情報を更新",
    modal_add_expense: "新規支出を登録",
    modal_edit_expense: "支出情報を更新",
    modal_date_label: "取引日付",
    modal_category_label: "カテゴリ",
    modal_amount_label: "金額",
    modal_note_label: "詳細メモ",

    // Category Page
    cat_page_tag: "財務分類",
    cat_page_title: "カテゴリ管理",
    cat_page_desc: "ニーズに合わせて収入・支出カテゴリを柔軟にカスタマイズできます。",
    cat_btn_create: "カテゴリを作成",
    cat_col_name: "カテゴリ名",
    cat_col_type: "種別",
    cat_col_count: "取引件数",
    cat_col_status: "ステータス",
    cat_col_desc: "説明",
    cat_chip_income: "収入カテゴリ",
    cat_chip_expense: "支出カテゴリ",
    cat_chip_auto: "自動カテゴリ分類",
    cat_status_active: "アクティブ",
    cat_status_review: "確認中",
    cat_type_income: "収入",
    cat_type_expense: "支出",
    cat_modal_create_title: "新規カテゴリを作成",
    cat_modal_edit_title: "カテゴリ情報を更新",

    // Statistics Page
    stat_page_tag: "統計・レポート",
    stat_page_title: "財務分析レポート",
    stat_page_desc: "キャッシュフロー、支出内訳、予算達成率をリアルタイムに分析・視覚化。",
    stat_year_label: "対象年",
    stat_from_date: "開始日",
    stat_to_date: "終了日",
    stat_flow_chart_title: "月別収支推移",
    stat_dist_chart_title: "カテゴリ別支出割合",
    stat_line_chart_title: "純収支推移",
    stat_total_income_year: "年間総収入",
    stat_total_expense_year: "年間総支出",
    stat_yearly_net: "純収支",
    stat_by_month: "月別",
    stat_proportion: "構成比",

    // Profile Page
    prof_page_tag: "設定",
    prof_page_title: "ユーザープロフィール",
    prof_page_desc: "個人情報、アカウント設定、パスワードを安全に管理します。",
    prof_personal_info: "個人情報",
    prof_security_settings: "セキュリティとパスワード",
    prof_full_name: "氏名",
    prof_email: "メールアドレス",
    prof_role: "ユーザー権限",
    prof_currency: "表示通貨",
    prof_timezone: "タイムゾーン",
    prof_old_password: "現在のパスワード",
    prof_new_password: "新しいパスワード",
    prof_confirm_password: "新しいパスワード (確認)",
    prof_save_btn: "変更を保存",
    prof_change_pass_btn: "パスワードを変更",

    // Common
    loading: "データを読み込み中...",
    save: "保存",
    cancel: "キャンセル",
    delete: "削除",
    edit: "編集",
    confirm: "確認",
    no_data: "データが存在しません。",
    showing_results: "表示中",
    page_previous: "前へ",
    page_next: "次へ",
    search: "検索..."
  }
}
