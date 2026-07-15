import type { DashboardMetric, NavItem, ProgressItem, Transaction } from "../types/finance"

export const navigationItems: NavItem[] = [
  { label: "Tổng quan", path: "/", icon: "LayoutDashboard", group: "Core" },
  { label: "Thu nhập", path: "/income", icon: "ArrowDownRight", group: "Transactions" },
  { label: "Chi tiêu", path: "/expense", icon: "ArrowUpRight", group: "Transactions" },
  { label: "Danh mục", path: "/category", icon: "Tags", group: "Transactions" },
  { label: "Thống kê", path: "/statistics", icon: "BarChart3", group: "Insights" },
  { label: "Hồ sơ", path: "/profile", icon: "UserRound", group: "Account" },
]

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Tổng số dư", value: "$18,420", change: "+12.4%", icon: "Wallet", positive: true },
  { label: "Thu nhập tháng", value: "$8,540", change: "+8.1%", icon: "ArrowDownRight", positive: true },
  { label: "Chi tiêu tháng", value: "$4,260", change: "-3.2%", icon: "ArrowUpRight", positive: false },
  { label: "Tỷ lệ tiết kiệm", value: "49%", change: "+5.7%", icon: "PiggyBank", positive: true },
]

export const recentTransactions: Transaction[] = [
  { id: 1, title: "Nhận lương tháng", category: "Thu nhập", amount: "+$4,500", time: "Hôm nay, 09:30", type: "income" },
  { id: 2, title: "Mua thực phẩm", category: "Chi tiêu", amount: "-$86", time: "Hôm nay, 12:10", type: "expense" },
  { id: 3, title: "Dự án freelance", category: "Thu nhập", amount: "+$1,200", time: "Hôm qua", type: "income" },
  { id: 4, title: "Thanh toán tiền điện", category: "Chi tiêu", amount: "-$64", time: "Hôm qua", type: "expense" },
  { id: 5, title: "Cà phê gặp khách hàng", category: "Chi tiêu", amount: "-$18", time: "2 ngày trước", type: "expense" },
]

export const categoryProgress: ProgressItem[] = [
  { label: "Ăn uống", value: 72, color: "from-cyan-400 to-blue-500" },
  { label: "Di chuyển", value: 54, color: "from-emerald-400 to-teal-500" },
  { label: "Mua sắm", value: 38, color: "from-sky-400 to-indigo-500" },
  { label: "Tiện ích", value: 26, color: "from-amber-300 to-orange-500" },
]

export const weeklySeries = [78, 94, 72, 118, 86, 132, 150]

export const authHighlights = [
  "Giao diện dashboard hiện đại",
  "Luồng đăng nhập an toàn",
  "Responsive trên mọi thiết bị",
]