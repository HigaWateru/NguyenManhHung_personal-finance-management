import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  PiggyBank,
  Wallet,
  X,
  RefreshCw,
  AlertCircle,
  Trash2,
  Plus,
  Activity,
  LogOut
} from "lucide-react"
import { Link } from "react-router-dom"
import { usePlaidLink } from "react-plaid-link"
import { apiService } from "../../apis/service"
import { extractApiError } from "../../apis/http"
import type {
  CategoryItem,
  DashboardData,
  BankAccountResponse,
  BudgetResponse,
  GoalResponse
} from "../../types/api"
import MetricCard from "../../components/dashboard/MetricCard"
import ChartCard from "../../components/dashboard/ChartCard"
import CategoryCard from "../../components/dashboard/CategoryCard"
import TransactionList from "../../components/dashboard/TransactionList"
import { useAppSelector } from "../../redux/hooks"
import { formatCurrency as formatCurrencyUtil } from "../../utils/format"

type QuickActionType = "income" | "expense"

type QuickActionForm = {
  date: string
  categoryId: string
  amount: string
  note: string
}

type WeekFlowItem = {
  day: string
  income: number
  expense: number
}

type CategorySplit = {
  label: string
  value: number
}

const icons = { Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, Banknote }

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth)
  const currencyCode = user?.currencyCode || "VND"

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  // Plaid state
  const [plaidConnected, setPlaidConnected] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([])
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [plaidSyncing, setPlaidSyncing] = useState(false)
  const [plaidError, setPlaidError] = useState<string | null>(null)
  const [showAccountsModal, setShowAccountsModal] = useState(false)

  // Budget state
  const [budgets, setBudgets] = useState<BudgetResponse[]>([])
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [budgetForm, setBudgetForm] = useState({ categoryId: "", limitAmount: "" })
  const [budgetSaving, setBudgetSaving] = useState(false)
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([])

  // Goal state
  const [goals, setGoals] = useState<GoalResponse[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalForm, setGoalForm] = useState({ name: "", targetAmount: "", targetDate: "" })
  const [goalSaving, setGoalSaving] = useState(false)

  const [weeklyFlow, setWeeklyFlow] = useState<WeekFlowItem[]>([])
  const [categorySplit, setCategorySplit] = useState<CategorySplit[]>([])

  // Quick Action
  const [quickActionType, setQuickActionType] = useState<QuickActionType | null>(null)
  const [quickActionCategories, setQuickActionCategories] = useState<CategoryItem[]>([])
  const [quickActionSaving, setQuickActionSaving] = useState(false)
  const [quickActionError, setQuickActionError] = useState<string | null>(null)
  const [form, setForm] = useState<QuickActionForm>({
    date: new Date().toISOString().slice(0, 10),
    categoryId: "",
    amount: "",
    note: ""
  })

  // Dummy upcoming bills
  const [upcomingBills, setUpcomingBills] = useState([
    { id: 1, title: "Tiền điện nước sinh hoạt", amount: 850000, dueDate: "Sau 3 ngày", paid: false },
    { id: 2, title: "Gói cước Internet FPT", amount: 350000, dueDate: "Sau 7 ngày", paid: false },
    { id: 3, title: "Thuê nhà chung cư tháng 7", amount: 12000000, dueDate: "Sau 12 ngày", paid: false }
  ])

  const moduleCards = [
    { name: "Thu nhập", route: "/income", desc: "Thêm, tìm kiếm và quản lý tất cả giao dịch thu vào." },
    { name: "Chi tiêu", route: "/expense", desc: "Theo dõi hành vi chi và dòng tiền ra theo danh mục." },
    { name: "Danh mục", route: "/category", desc: "Quản lý nhóm phân loại cho giao dịch thu và chi." },
    { name: "Thống kê", route: "/statistics", desc: "Phân tích tài chính theo tháng, năm và danh mục." }
  ]

  // Setup Plaid Link Hook
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      try {
        setPlaidSyncing(true)
        setPlaidError(null)
        const institutionName = metadata.institution?.name || "Sandbox Bank"
        await apiService.exchangePlaidPublicToken(publicToken, institutionName)
        await fetchPlaidStatus()
        await loadDashboardData()
      } catch (err) {
        setPlaidError(extractApiError(err, "Không thể liên kết tài khoản Plaid."))
      } finally {
        setPlaidSyncing(false)
      }
    },
    onExit: (err) => {
      if (err) {
        setPlaidError(`Plaid Exit: ${err.error_message || "Unknown error"}`)
      }
    }
  })

  const fetchPlaidStatus = async () => {
    try {
      const status = await apiService.getPlaidStatus()
      setPlaidConnected(status.connected)
      if (status.connected) {
        const accounts = await apiService.getPlaidBankAccounts()
        setBankAccounts(accounts)
      } else {
        setBankAccounts([])
        // Fetch link token in background if not connected
        const res = await apiService.getPlaidLinkToken()
        setLinkToken(res.linkToken)
      }
    } catch (err) {
      console.error("Failed to load Plaid status", err)
    }
  }

  const handleSyncTransactions = async () => {
    try {
      setPlaidSyncing(true)
      setPlaidError(null)
      const res = await apiService.syncPlaidTransactions()
      await loadDashboardData()
      await fetchPlaidStatus()
      window.alert(`${res.syncedCount} transactions synchronized successfully.`)
    } catch (err) {
      setPlaidError(extractApiError(err, "Đồng bộ giao dịch Plaid thất bại."))
    } finally {
      setPlaidSyncing(false)
    }
  }

  const handleDisconnectPlaid = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy kết nối ngân hàng? Tất cả tài khoản và giao dịch đã đồng bộ sẽ bị xóa.")) {
      return
    }
    try {
      setPlaidSyncing(true)
      await apiService.disconnectPlaid()
      setPlaidConnected(false)
      setBankAccounts([])
      // Refresh Link token
      const res = await apiService.getPlaidLinkToken()
      setLinkToken(res.linkToken)
      await loadDashboardData()
    } catch (err) {
      setPlaidError(extractApiError(err, "Ngắt kết nối Plaid thất bại."))
    } finally {
      setPlaidSyncing(false)
    }
  }

  const loadDashboardData = async () => {
    setDashboardLoading(true)
    setDashboardError(null)

    try {
      const formatLocalDate = (d: Date) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const r = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${r}`
      }

      const now = new Date()
      const day = now.getDay()
      const diffToMonday = day === 0 ? -6 : 1 - day
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday)
      const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)

      const fromDate = formatLocalDate(monday)
      const toDate = formatLocalDate(sunday)
      const startOfMonth = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))

      const [data, weeklyIncomes, weeklyExpenses, monthlyExpenses, activeBudgets, activeGoals, expenseCats] = await Promise.all([
        apiService.getDashboard(),
        apiService.getIncomes({ page: 0, size: 100, fromDate, toDate }),
        apiService.getExpenses({ page: 0, size: 100, fromDate, toDate }),
        apiService.getExpenses({ page: 0, size: 100, fromDate: startOfMonth, toDate }),
        apiService.getBudgets(),
        apiService.getGoals(),
        apiService.getCategories("EXPENSE")
      ])

      setDashboardData(data)
      setBudgets(activeBudgets)
      setGoals(activeGoals)
      setAllCategories(expenseCats)

      const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
      const weekTemplate: WeekFlowItem[] = dayLabels.map((day) => ({ day, income: 0, expense: 0 }))

      weeklyIncomes.content.forEach((item) => {
        const date = new Date(item.transactionDate)
        const index = (date.getDay() + 6) % 7
        weekTemplate[index].income += Number(item.amount)
      })

      weeklyExpenses.content.forEach((item) => {
        const date = new Date(item.transactionDate)
        const index = (date.getDay() + 6) % 7
        weekTemplate[index].expense += Number(item.amount)
      })

      setWeeklyFlow(weekTemplate)

      const totalMonthlyExpense = monthlyExpenses.content.reduce((sum, item) => sum + Number(item.amount), 0)
      const expenseByCategory = monthlyExpenses.content.reduce<Record<string, number>>((acc, item) => {
        const key = item.categoryName
        acc[key] = (acc[key] ?? 0) + Number(item.amount)
        return acc
      }, {})

      const split = Object.entries(expenseByCategory)
        .map(([label, amount]) => ({
          label,
          value: totalMonthlyExpense > 0 ? Number(((amount / totalMonthlyExpense) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)

      setCategorySplit(split)
    } catch (error) {
      setDashboardError(extractApiError(error, "Không thể tải dữ liệu dashboard."))
    } finally {
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    void fetchPlaidStatus()
    void loadDashboardData()
  }, [currencyCode])

  const openQuickAction = async (type: QuickActionType) => {
    setQuickActionError(null)
    setQuickActionSaving(false)
    setQuickActionType(type)
    setForm({
      date: new Date().toISOString().slice(0, 10),
      categoryId: "",
      amount: "",
      note: ""
    })

    try {
      const categories = await apiService.getCategories(type === "income" ? "INCOME" : "EXPENSE")
      setQuickActionCategories(categories)
    } catch (error) {
      setQuickActionError(extractApiError(error, "Không thể tải danh mục cho tác vụ nhanh."))
      setQuickActionCategories([])
    }
  }

  const closeQuickAction = () => {
    setQuickActionType(null)
    setQuickActionError(null)
  }

  const handleQuickActionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.categoryId.trim() || Number(form.amount) <= 0) {
      window.alert("Vui lòng nhập đầy đủ thông tin hợp lệ.")
      return
    }

    try {
      setQuickActionSaving(true)

      const payload = {
        transactionDate: form.date,
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        note: form.note.trim()
      }

      if (quickActionType === "income") await apiService.createIncome(payload)
      else await apiService.createExpense(payload)

      closeQuickAction()
      await loadDashboardData()
    } catch (error) {
      setQuickActionError(extractApiError(error, "Không thể lưu giao dịch nhanh."))
    } finally {
      setQuickActionSaving(false)
    }
  }

  // Budget Creation
  const handleBudgetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!budgetForm.categoryId || Number(budgetForm.limitAmount) <= 0) {
      window.alert("Vui lòng điền thông tin hợp lệ.")
      return
    }
    try {
      setBudgetSaving(true)
      await apiService.createBudget(Number(budgetForm.categoryId), Number(budgetForm.limitAmount))
      setShowBudgetModal(false)
      setBudgetForm({ categoryId: "", limitAmount: "" })
      await loadDashboardData()
    } catch (err) {
      window.alert("Lỗi thiết lập ngân sách.")
    } finally {
      setBudgetSaving(false)
    }
  }

  const handleDeleteBudget = async (id: number) => {
    if (!window.confirm("Xóa ngân sách này?")) return
    try {
      await apiService.deleteBudget(id)
      await loadDashboardData()
    } catch (err) {
      window.alert("Xóa ngân sách thất bại.")
    }
  }

  // Goal Creation
  const handleGoalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!goalForm.name.trim() || Number(goalForm.targetAmount) <= 0) {
      window.alert("Vui lòng điền thông tin hợp lệ.")
      return
    }
    try {
      setGoalSaving(true)
      await apiService.createGoal(goalForm.name.trim(), Number(goalForm.targetAmount), goalForm.targetDate || undefined)
      setShowGoalModal(false)
      setGoalForm({ name: "", targetAmount: "", targetDate: "" })
      await loadDashboardData()
    } catch (err) {
      window.alert("Lỗi tạo mục tiêu.")
    } finally {
      setGoalSaving(false)
    }
  }

  const handleDeleteGoal = async (id: number) => {
    if (!window.confirm("Xóa mục tiêu này?")) return
    try {
      await apiService.deleteGoal(id)
      await loadDashboardData()
    } catch (err) {
      window.alert("Xóa mục tiêu thất bại.")
    }
  }

  const handleUpdateGoalProgress = async (id: number, current: number, target: number) => {
    const value = window.prompt(`Cập nhật số tiền hiện tại (Mục tiêu: ${formatCurrency(target)})`, String(current))
    if (value === null) return
    const num = Number(value)
    if (isNaN(num) || num < 0) {
      window.alert("Số tiền không hợp lệ.")
      return
    }
    try {
      await apiService.updateGoalProgress(id, num)
      await loadDashboardData()
    } catch (err) {
      window.alert("Cập nhật tiến trình thất bại.")
    }
  }

  const handlePayBill = (id: number) => {
    setUpcomingBills((prev) => prev.map((bill) => (bill.id === id ? { ...bill, paid: true } : bill)))
    window.alert("Hóa đơn đã được đánh dấu là thanh toán thành công!")
  }



  const isIncome = quickActionType === "income"
  const modalTitle = isIncome ? "Thêm thu nhập" : "Thêm chi tiêu"
  const amountPlaceholder = isIncome ? "Ví dụ: 2500000" : "Ví dụ: 350000"

  const dynamicMetrics = useMemo(() => {
    if (!dashboardData) {
      return [
        { label: "Tổng số dư", value: formatCurrency(0), change: "0%", icon: "Wallet", positive: true },
        { label: "Thu nhập tháng", value: formatCurrency(0), change: "0%", icon: "ArrowDownRight", positive: true },
        { label: "Chi tiêu tháng", value: formatCurrency(0), change: "0%", icon: "ArrowUpRight", positive: false },
        { label: "Tỷ lệ tiết kiệm", value: "0%", change: "0%", icon: "PiggyBank", positive: true }
      ]
    }

    const savingRate = dashboardData.totalIncome > 0 ? (dashboardData.totalBalance / dashboardData.totalIncome) * 100 : 0

    return [
      { label: "Tổng số dư", value: formatCurrency(dashboardData.totalBalance), change: "Live", icon: "Wallet", positive: true },
      { label: "Thu nhập tháng", value: formatCurrency(dashboardData.monthlyIncome), change: "Live", icon: "ArrowDownRight", positive: true },
      { label: "Chi tiêu tháng", value: formatCurrency(dashboardData.monthlyExpense), change: "Live", icon: "ArrowUpRight", positive: false },
      { label: "Tỷ lệ tiết kiệm", value: `${savingRate.toFixed(1)}%`, change: "Live", icon: "PiggyBank", positive: savingRate >= 0 }
    ]
  }, [dashboardData, currencyCode])

  const recentRows = useMemo(() => {
    if (!dashboardData) return undefined

    return dashboardData.recentTransactions.map((item) => ({
      id: item.id,
      title: item.note || `${item.type === "INCOME" ? "Thu" : "Chi"} từ ${item.categoryName}`,
      category: item.categoryName,
      amount: `${item.type === "INCOME" ? "+" : "-"}${formatCurrency(item.amount)}`,
      time: new Date(item.createdAt).toLocaleString("vi-VN"),
      type: item.type === "INCOME" ? "income" : ("expense" as "income" | "expense")
    }))
  }, [dashboardData])

  function formatCurrency(value: number) {
    return formatCurrencyUtil(value, currencyCode)
  }

  const primaryBankAccount = bankAccounts.length > 0 ? bankAccounts[0] : null
  const monthlyIncome = dashboardData?.monthlyIncome ?? 0
  const monthlyExpense = dashboardData?.monthlyExpense ?? 0
  const monthlyBalance = monthlyIncome - monthlyExpense
  const expenseRate = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Plaid Bank Connection Card - ALWAYS ON TOP */}
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8 border border-cyan-400/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-200">
              <Banknote size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70 font-semibold">Tích hợp Plaid</p>
              <h3 className="mt-1 text-2xl font-bold text-white">Kết nối ngân hàng tự động</h3>
              <p className="mt-2 text-sm text-slate-400">
                Đồng bộ hóa các giao dịch ngân hàng của bạn tức thời qua Plaid Sandbox.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {plaidConnected && primaryBankAccount ? (
              <>
                <button
                  type="button"
                  onClick={handleSyncTransactions}
                  disabled={plaidSyncing}
                  className="inline-flex items-center gap-2 justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={plaidSyncing ? "animate-spin" : ""} />
                  {plaidSyncing ? "Đang đồng bộ..." : "Đồng bộ giao dịch"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAccountsModal(true)}
                  className="inline-flex items-center gap-2 justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <Activity size={16} />
                  Xem tài khoản ({bankAccounts.length})
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectPlaid}
                  disabled={plaidSyncing}
                  className="inline-flex items-center gap-2 justify-center rounded-2xl border border-rose-300/40 bg-rose-400/10 px-5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20 disabled:opacity-50"
                >
                  <LogOut size={16} />
                  Hủy kết nối
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => open()}
                disabled={!ready || plaidSyncing}
                className="inline-flex items-center gap-2 justify-center rounded-2xl border border-cyan-400/60 bg-cyan-400/20 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/30 disabled:opacity-50"
              >
                <RefreshCw size={16} className={plaidSyncing ? "animate-spin" : ""} />
                Connect Bank
              </button>
            )}
          </div>
        </div>

        {plaidError && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            <AlertCircle size={16} />
            <p>{plaidError}</p>
          </div>
        )}

        {plaidConnected && primaryBankAccount && (
          <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-6 border-t border-white/10 pt-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Ngân hàng</p>
              <p className="mt-1 text-sm font-semibold text-white">{primaryBankAccount.institutionName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Tài khoản chính</p>
              <p className="mt-1 text-sm font-semibold text-white">{primaryBankAccount.accountName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Loại tài khoản</p>
              <p className="mt-1 text-sm font-semibold text-white">{primaryBankAccount.accountType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Số dư hiện tại</p>
              <p className="mt-1 text-sm font-bold text-cyan-300">{formatCurrency(primaryBankAccount.currentBalance)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Đồng bộ cuối</p>
              <p className="mt-1 text-sm text-slate-300">
                {primaryBankAccount.lastSyncedAt ? new Date(primaryBankAccount.lastSyncedAt).toLocaleString("vi-VN") : "Chưa có"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Trạng thái kết nối</p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {primaryBankAccount.connectionStatus}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Overview Intro Banner & Quick Action */}
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr] xl:items-stretch">
          <div className="flex flex-col justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70 font-semibold">Tổng quan</p>
              <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Trung tâm điều phối dòng tiền tài chính cá nhân.
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Theo dõi số dư tức thời, quản lý thu chi, ngân sách, mục tiêu tích lũy và dòng giao dịch tự động.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void openQuickAction("income")}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
                >
                  + Thêm thu nhập
                </button>
                <button
                  type="button"
                  onClick={() => void openQuickAction("expense")}
                  className="inline-flex items-center justify-center rounded-2xl border border-rose-300/40 bg-rose-400/10 px-5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
                >
                  + Thêm chi tiêu
                </button>
                <Link
                  to="/category"
                  className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/40 bg-emerald-400/10 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
                >
                  + Thêm danh mục
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Thu tháng", formatCurrency(monthlyIncome)],
                ["Chi tháng", formatCurrency(monthlyExpense)],
                ["Số dư tháng", formatCurrency(monthlyBalance)]
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-center backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-cyan-400/20 bg-slate-950/50 p-5">
            <p className="text-sm text-slate-400">Tóm tắt phiên làm việc</p>
            <h4 className="mt-2 text-xl font-semibold text-white">Nhanh hôm nay</h4>

            <div className="mt-5 space-y-4">
              {[
                { label: "Tổng thu tích lũy", value: formatCurrency(dashboardData?.totalIncome ?? 0) },
                { label: "Tổng chi tích lũy", value: formatCurrency(dashboardData?.totalExpense ?? 0) },
                { label: "Tổng số dư hiện tại", value: formatCurrency(dashboardData?.totalBalance ?? 0) }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-medium text-white">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Module Shortcuts Grid */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {moduleCards.map((item) => (
          <Link key={item.route} to={item.route} className="glass-panel rounded-3xl p-5 transition hover:-translate-y-1">
            <p className="text-sm text-cyan-200">{item.name}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.desc}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Mở trang</p>
          </Link>
        ))}
      </section>

      {/* Metrics Row */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dynamicMetrics.map((metric) => {
          const Icon = icons[metric.icon as keyof typeof icons]
          return <MetricCard key={metric.label} {...metric} icon={Icon} />
        })}
      </section>

      {/* Recharts charts row */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard data={weeklyFlow} currencyCode={currencyCode} />
        <CategoryCard categories={categorySplit} spentPercent={expenseRate} />
      </section>

      {/* Multi-widget detail block */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1fr]">
        {/* Recent Transactions list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Giao dịch gần đây</h3>
          </div>
          {dashboardLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              Đang tải giao dịch...
            </div>
          )}
          {dashboardError && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {dashboardError}
            </div>
          )}
          <TransactionList transactions={recentRows} />
        </div>

        {/* Budget Progress Widget & Financial Goals */}
        <div className="space-y-6">
          {/* Budget Widget */}
          <article className="glass-panel rounded-3xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Ngân sách chi tiêu</p>
                <h3 className="text-lg font-bold text-white mt-0.5">Budget Progress</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBudgetModal(true)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {budgets.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Chưa có ngân sách nào được thiết lập.</p>
              ) : (
                budgets.map((budget) => {
                  const percent = Math.min(100, (budget.spentAmount / budget.limitAmount) * 100)
                  const isWarning = percent >= 80
                  const barColor = isWarning ? "from-rose-500 to-red-500" : "from-cyan-400 to-blue-500"

                  return (
                    <div key={budget.id} className="rounded-2xl bg-white/5 p-3 border border-white/5 relative">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-white">{budget.categoryName}</span>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Xóa ngân sách"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Đã chi: {formatCurrency(budget.spentAmount)}</span>
                        <span>Hạn mức: {formatCurrency(budget.limitAmount)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </article>

          {/* Goals Widget */}
          <article className="glass-panel rounded-3xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Mục tiêu tiết kiệm</p>
                <h3 className="text-lg font-bold text-white mt-0.5">Financial Goals</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoalModal(true)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {goals.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Chưa có mục tiêu tiết kiệm.</p>
              ) : (
                goals.map((goal) => {
                  const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
                  return (
                    <div key={goal.id} className="rounded-2xl bg-white/5 p-3 border border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white">{goal.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateGoalProgress(goal.id, goal.currentAmount, goal.targetAmount)}
                            className="text-cyan-300 hover:underline"
                          >
                            Cập nhật
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Tích lũy: {formatCurrency(goal.currentAmount)}</span>
                        <span>Mục tiêu: {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">
                        Hạn chót: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString("vi-VN") : "Không xác định"} | Trạng thái: {goal.status}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </article>
        </div>

        {/* Upcoming Bills & Notification Feed */}
        <div className="space-y-6">
          {/* Upcoming Bills Widget */}
          <article className="glass-panel rounded-3xl p-5 border border-white/10">
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Các hóa đơn định kỳ</p>
              <h3 className="text-lg font-bold text-white mt-0.5">Upcoming Bills</h3>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-3 border border-white/5 text-xs">
                  <div>
                    <p className="font-semibold text-white">{bill.title}</p>
                    <p className="text-slate-400 mt-0.5">Số tiền: {formatCurrency(bill.amount)}</p>
                    <p className="text-[10px] text-cyan-300 font-medium mt-1">{bill.dueDate}</p>
                  </div>
                  {bill.paid ? (
                    <span className="rounded-xl bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-400">Đã trả</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePayBill(bill.id)}
                      className="rounded-xl bg-cyan-400/15 px-3 py-1.5 font-semibold text-cyan-300 hover:bg-cyan-400/25 transition"
                    >
                      Thanh toán
                    </button>
                  )}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* Quick Action Modal */}
      {quickActionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-panel-strong w-full max-w-xl rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70 font-semibold">Tác vụ nhanh</p>
                <h4 className="mt-2 text-xl font-semibold text-white">{modalTitle}</h4>
              </div>
              <button
                type="button"
                onClick={closeQuickAction}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleQuickActionSubmit}>
              {quickActionError && (
                <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {quickActionError}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="quick-date" className="mb-2 block text-sm text-slate-300">Ngày</label>
                  <input
                    id="quick-date"
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                </div>

                <div>
                  <label htmlFor="quick-amount" className="mb-2 block text-sm text-slate-300">Số tiền</label>
                  <input
                    id="quick-amount"
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder={amountPlaceholder}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="quick-category" className="mb-2 block text-sm text-slate-300">Danh mục</label>
                  <select
                    id="quick-category"
                    value={form.categoryId}
                    onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  >
                    <option value="">Chọn danh mục</option>
                    {quickActionCategories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-slate-900">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="quick-note" className="mb-2 block text-sm text-slate-300">Ghi chú</label>
                <textarea
                  id="quick-note"
                  rows={3}
                  value={form.note}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Mô tả ngắn cho giao dịch"
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeQuickAction}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={quickActionSaving}
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
                >
                  {quickActionSaving ? "Đang lưu..." : "Lưu nhanh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-panel-strong w-full max-w-md rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold text-white">Thiết lập ngân sách tháng</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Danh mục</label>
                <select
                  value={budgetForm.categoryId}
                  onChange={(e) => setBudgetForm((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Hạn mức chi tiêu ({currencyCode})</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 5000000"
                  value={budgetForm.limitAmount}
                  onChange={(e) => setBudgetForm((p) => ({ ...p, limitAmount: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={budgetSaving}
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/25"
                >
                  {budgetSaving ? "Đang lưu..." : "Lưu ngân sách"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-panel-strong w-full max-w-md rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold text-white">Tạo mục tiêu tích lũy mới</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Tên mục tiêu</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mua laptop mới, Quỹ khẩn cấp"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Số tiền cần tích lũy ({currencyCode})</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 25000000"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm((p) => ({ ...p, targetAmount: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Ngày hoàn thành mong muốn</label>
                <input
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm((p) => ({ ...p, targetDate: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={goalSaving}
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/25"
                >
                  {goalSaving ? "Đang lưu..." : "Tạo mục tiêu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Bank Accounts Modal */}
      {showAccountsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-panel-strong w-full max-w-2xl rounded-3xl p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold text-white">Danh sách tài khoản ngân hàng</h4>
                <p className="text-xs text-slate-400 mt-1">Được lấy trực tiếp từ hệ thống Plaid</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountsModal(false)}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto">
              {bankAccounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5">
                  <div>
                    <h5 className="font-semibold text-white text-sm">{acc.accountName}</h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Mã tài khoản Plaid: {acc.id} | Phân loại: {acc.accountType} ({acc.accountSubtype || "default"})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-cyan-300">{formatCurrency(acc.currentBalance)}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Sync: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleString("vi-VN") : "Chưa có"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAccountsModal(false)}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}