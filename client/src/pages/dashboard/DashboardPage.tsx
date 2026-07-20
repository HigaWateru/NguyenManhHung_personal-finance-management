import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { ArrowDownRight, ArrowUpRight, Banknote, PiggyBank, Wallet, X, RefreshCw, AlertCircle, Trash2,
  Plus, Activity, LogOut
} from "lucide-react"
import { Link } from "react-router-dom"
import { usePlaidLink } from "react-plaid-link"
import { apiService } from "../../apis/service"
import { extractApiError } from "../../apis/http"
import type { CategoryItem, DashboardData, BankAccountResponse, BudgetResponse, GoalResponse } from "../../types/api"
import MetricCard from "../../components/dashboard/MetricCard"
import ChartCard from "../../components/dashboard/ChartCard"
import CategoryCard from "../../components/dashboard/CategoryCard"
import TransactionList from "../../components/dashboard/TransactionList"
import { useAppSelector } from "../../redux/hooks"
import { formatCurrency as formatCurrencyUtil } from "../../utils/format"
import { notifyHeader, triggerNotificationRefresh } from "../../utils/notification"
import { useLanguage } from "../../context/LanguageContext"

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
  const { t, language } = useLanguage()
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
  const [plaidSuccess, setPlaidSuccess] = useState<string | null>(null)
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

  // Dummy upcoming bills translated according to current language
  const [paidBillIds, setPaidBillIds] = useState<number[]>([])

  const upcomingBills = useMemo(() => {
    const rawBills = language === "en" ? [
      { id: 1, title: "Utilities & Electricity", amount: 850000, dueDate: "In 3 days" },
      { id: 2, title: "FPT Internet Subscription", amount: 350000, dueDate: "In 7 days" },
      { id: 3, title: "Apartment Rent - July", amount: 12000000, dueDate: "In 12 days" }
    ] : language === "ja" ? [
      { id: 1, title: "光熱費・水道代", amount: 850000, dueDate: "3日後" },
      { id: 2, title: "FPT インターネット回線料", amount: 350000, dueDate: "7日後" },
      { id: 3, title: "マンション家賃 (7月分)", amount: 12000000, dueDate: "12日後" }
    ] : [
      { id: 1, title: "Tiền điện nước sinh hoạt", amount: 850000, dueDate: "Sau 3 ngày" },
      { id: 2, title: "Gói cước Internet FPT", amount: 350000, dueDate: "Sau 7 ngày" },
      { id: 3, title: "Thuê nhà chung cư tháng 7", amount: 12000000, dueDate: "Sau 12 ngày" }
    ]

    return rawBills.map(b => ({
      ...b,
      paid: paidBillIds.includes(b.id)
    }))
  }, [language, paidBillIds])

  const moduleCards = useMemo(() => [
    { name: t("nav_income"), route: "/income", desc: t("dash_mod_income_desc") },
    { name: t("nav_expense"), route: "/expense", desc: t("dash_mod_expense_desc") },
    { name: t("nav_categories"), route: "/category", desc: t("dash_mod_category_desc") },
    { name: t("nav_statistics"), route: "/statistics", desc: t("dash_mod_statistics_desc") }
  ], [t])

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
      setPlaidSuccess(null)
      const res = await apiService.syncPlaidTransactions()
      await loadDashboardData()
      await fetchPlaidStatus()
      const count = res.syncedCount ?? 0
      const successMsg = count > 0 
        ? t("bank_sync_success_count").replace("{count}", count.toString())
        : t("bank_sync_success_up_to_date")
      
      setPlaidSuccess(successMsg)
      notifyHeader(t("bank_sync_success_header"), "success")
      triggerNotificationRefresh()
    } catch (err) {
      setPlaidSuccess(null)
      const rawMsg = extractApiError(err, t("bank_sync_error_generic"))
      const isTimeout = rawMsg.toLowerCase().includes("timeout") 
        || rawMsg.toLowerCase().includes("quá thời gian") 
        || rawMsg.toLowerCase().includes("504") 
        || rawMsg.toLowerCase().includes("econnaborted")
      const finalMsg = isTimeout ? t("bank_sync_error_timeout") : rawMsg
      
      setPlaidError(finalMsg)
      notifyHeader(finalMsg, "error")
      triggerNotificationRefresh()
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

      const split = (data.categoryDistribution ?? []).map((item) => ({
        label: item.categoryName,
        value: item.percentage
      })).sort((a, b) => b.value - a.value)

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
    setPaidBillIds((prev) => [...prev, id])
  }



  const isIncome = quickActionType === "income"
  const modalTitle = isIncome ? t("dash_add_income") : t("dash_add_expense")
  const amountPlaceholder = isIncome ? "2500000" : "350000"

  const dynamicMetrics = useMemo(() => {
    if (!dashboardData) {
      return [
        { label: t("dash_total_balance"), value: formatCurrency(0), change: "0%", icon: "Wallet", positive: true },
        { label: t("dash_monthly_income"), value: formatCurrency(0), change: "0%", icon: "ArrowDownRight", positive: true },
        { label: t("dash_monthly_expense"), value: formatCurrency(0), change: "0%", icon: "ArrowUpRight", positive: false },
        { label: t("dash_saving_rate"), value: "0%", change: "0%", icon: "PiggyBank", positive: true }
      ]
    }

    const savingRate = dashboardData.totalIncome > 0 ? (dashboardData.totalBalance / dashboardData.totalIncome) * 100 : 0

    return [
      { label: t("dash_total_balance"), value: formatCurrency(dashboardData.totalBalance), change: "Live", icon: "Wallet", positive: true },
      { label: t("dash_monthly_income"), value: formatCurrency(dashboardData.monthlyIncome), change: "Live", icon: "ArrowDownRight", positive: true },
      { label: t("dash_monthly_expense"), value: formatCurrency(dashboardData.monthlyExpense), change: "Live", icon: "ArrowUpRight", positive: false },
      { label: t("dash_saving_rate"), value: `${savingRate.toFixed(1)}%`, change: "Live", icon: "PiggyBank", positive: savingRate >= 0 }
    ]
  }, [dashboardData, currencyCode, t])

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
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70 font-semibold">{t("bank_title")}</p>
              <h3 className="mt-1 text-2xl font-bold text-white">{t("bank_subtitle")}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {t("bank_desc")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {plaidConnected && primaryBankAccount ? (
              <>
                <button type="button" onClick={handleSyncTransactions} disabled={plaidSyncing}
                  className="inline-flex items-center gap-2 justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={16} className={plaidSyncing ? "animate-spin" : ""} />
                  {plaidSyncing ? t("bank_syncing") : t("bank_sync_btn")}
                </button>
                <button type="button" onClick={() => setShowAccountsModal(true)}
                  className="inline-flex items-center gap-2 justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 cursor-pointer"
                >
                  <Activity size={16} />
                  {t("bank_view_accounts")} ({bankAccounts.length})
                </button>
                <button type="button" onClick={handleDisconnectPlaid} disabled={plaidSyncing}
                  className="inline-flex items-center gap-2 justify-center rounded-2xl border border-rose-300/40 bg-rose-400/10 px-5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20 disabled:opacity-50 cursor-pointer"
                >
                  <LogOut size={16} />
                  {t("bank_disconnect")}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => open()} disabled={!ready || plaidSyncing}
                className="inline-flex items-center gap-2 justify-center rounded-2xl border border-cyan-400/60 bg-cyan-400/20 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/30 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={16} className={plaidSyncing ? "animate-spin" : ""} />
                {t("bank_connect_btn")}
              </button>
            )}
          </div>
        </div>

        {plaidError && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <p>{plaidError}</p>
            </div>
            <button type="button" onClick={() => setPlaidError(null)} className="text-rose-300 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {plaidSuccess && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              <p>{plaidSuccess}</p>
            </div>
            <button type="button" onClick={() => setPlaidSuccess(null)} className="text-emerald-300 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {plaidConnected && primaryBankAccount && (
          <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-6 border-t border-white/10 pt-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">{t("bank_label_institution")}</p>
              <p className="mt-1 text-sm font-semibold text-white">{primaryBankAccount.institutionName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">{t("bank_label_account")}</p>
              <p className="mt-1 text-sm font-semibold text-white">{primaryBankAccount.accountName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">{t("bank_label_type")}</p>
              <p className="mt-1 text-sm font-semibold text-white">{primaryBankAccount.accountType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">{t("bank_label_balance")}</p>
              <p className="mt-1 text-sm font-bold text-cyan-300">{formatCurrency(primaryBankAccount.currentBalance)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">{t("bank_label_last_synced")}</p>
              <p className="mt-1 text-sm text-slate-300">
                {primaryBankAccount.lastSyncedAt ? new Date(primaryBankAccount.lastSyncedAt).toLocaleString("vi-VN") : "---"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">{t("bank_label_status")}</p>
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
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70 font-semibold">{t("nav_dashboard")}</p>
              <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                {t("dash_center_title")}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                {t("dash_center_desc")}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={() => void openQuickAction("income")}
                  className="inline-flex items-center justify-center rounded-2xl gap-2 border border-cyan-300/40 bg-cyan-400/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25 cursor-pointer"
                >
                  <Plus size={16} />
                  {t("dash_add_income")}
                </button>
                <button type="button" onClick={() => void openQuickAction("expense")}
                  className="inline-flex items-center justify-center rounded-2xl gap-2 border border-rose-300/40 bg-rose-400/10 px-5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20 cursor-pointer"
                >
                  <Plus size={16} />
                  {t("dash_add_expense")}
                </button>
                <Link to="/category"
                  className="inline-flex items-center justify-center rounded-2xl gap-2 border border-emerald-300/40 bg-emerald-400/10 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20 cursor-pointer"
                >
                  <Plus size={16} />
                  {t("dash_add_category")}
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [t("dash_monthly_income"), formatCurrency(monthlyIncome)],
                [t("dash_monthly_expense"), formatCurrency(monthlyExpense)],
                [t("dash_total_balance"), formatCurrency(monthlyBalance)]
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-center backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-cyan-400/20 bg-slate-950/50 p-5">
            <h4 className="mt-2 text-xl font-semibold text-white">{t("dash_quick_today")}</h4>

            <div className="mt-5 space-y-4">
              {[
                { label: t("dash_total_savings"), value: formatCurrency(dashboardData?.totalIncome ?? 0) },
                { label: t("dash_total_expenses"), value: formatCurrency(dashboardData?.totalExpense ?? 0) },
                { label: t("dash_current_net"), value: formatCurrency(dashboardData?.totalBalance ?? 0) }
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
            <p className="text-sm text-cyan-200 font-semibold">{item.name}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.desc}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">{t("dash_open_page")}</p>
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
            <h3 className="text-xl font-bold text-white">{t("dash_recent_title")}</h3>
          </div>
          {dashboardLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              {t("loading")}
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
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">{t("dash_budgets_title")}</p>
                <h3 className="text-lg font-bold text-white mt-0.5">{t("dash_budgets_sub")}</h3>
              </div>
              <button type="button" onClick={() => setShowBudgetModal(true)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {budgets.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">{t("dash_no_budget")}</p>
              ) : (
                budgets.map((budget) => {
                  const percent = Math.min(100, (budget.spentAmount / budget.limitAmount) * 100)
                  const isWarning = percent >= 80
                  const barColor = isWarning ? "from-rose-500 to-red-500" : "from-cyan-400 to-blue-500"

                  return (
                    <div key={budget.id} className="rounded-2xl bg-white/5 p-3 border border-white/5 relative">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-white">{budget.categoryName}</span>
                        <button onClick={() => handleDeleteBudget(budget.id)}
                          className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
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
                <p className="text-xs uppercase tracking-[0.1em] text-slate-400">{t("dash_goals_title")}</p>
                <h3 className="text-lg font-bold text-white mt-0.5">{t("dash_goals_sub")}</h3>
              </div>
              <button type="button" onClick={() => setShowGoalModal(true)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {goals.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">{t("dash_no_goal")}</p>
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
                            className="text-cyan-300 hover:underline cursor-pointer"
                          >
                            {t("edit")}
                          </button>
                          <button onClick={() => handleDeleteGoal(goal.id)} className="text-slate-500 hover:text-rose-400 cursor-pointer">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Tích lũy: {formatCurrency(goal.currentAmount)}</span>
                        <span>Mục tiêu: {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">
                        Hạn chót: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString("vi-VN") : "---"} | Trạng thái: {goal.status}
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
              <p className="text-xs uppercase tracking-[0.1em] text-slate-400">{t("dash_upcoming_bills")}</p>
              <h3 className="text-lg font-bold text-white mt-0.5">{t("dash_upcoming_bills")}</h3>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-3 border border-white/5 text-xs">
                  <div>
                    <p className="font-semibold text-white">{bill.title}</p>
                    <p className="text-slate-400 mt-0.5">{t("col_amount")}: {formatCurrency(bill.amount)}</p>
                    <p className="text-[10px] text-cyan-300 font-medium mt-1">{bill.dueDate}</p>
                  </div>
                  {bill.paid ? (
                    <span className="rounded-xl bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-400">{t("dash_bill_paid")}</span>
                  ) : (
                    <button type="button" onClick={() => handlePayBill(bill.id)}
                      className="rounded-xl bg-cyan-400/15 px-3 py-1.5 font-semibold text-cyan-300 hover:bg-cyan-400/25 transition cursor-pointer"
                    >
                      {t("dash_bill_pay")}
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
              <button type="button" onClick={closeQuickAction}
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
                  <label htmlFor="quick-date" className="mb-2 block text-sm text-slate-300">{t("col_date")}</label>
                  <input id="quick-date" type="date" value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                </div>

                <div>
                  <label htmlFor="quick-amount" className="mb-2 block text-sm text-slate-300">{t("col_amount")}</label>
                  <input id="quick-amount" type="number" min="0" value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder={amountPlaceholder}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="quick-category" className="mb-2 block text-sm text-slate-300">{t("col_category")}</label>
                  <select id="quick-category" value={form.categoryId} onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45 cursor-pointer"
                  >
                    <option value="">{t("all_categories_filter")}</option>
                    {quickActionCategories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-slate-900">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="quick-note" className="mb-2 block text-sm text-slate-300">{t("col_note")}</label>
                <textarea id="quick-note" rows={3} value={form.note}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="..."
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button type="button" onClick={closeQuickAction}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button type="submit" disabled={quickActionSaving}
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25 cursor-pointer"
                >
                  {quickActionSaving ? t("loading") : t("save")}
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
                <h4 className="text-xl font-bold text-white">{t("dash_budgets_title")}</h4>
              </div>
              <button type="button" onClick={() => setShowBudgetModal(false)}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">{t("col_category")}</label>
                <select value={budgetForm.categoryId} onChange={(e) => setBudgetForm((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45 cursor-pointer"
                  required
                >
                  <option value="">{t("all_categories_filter")}</option>
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">{t("dash_budgets_sub")} ({currencyCode})</label>
                <input type="number" placeholder="5000000" value={budgetForm.limitAmount}
                  onChange={(e) => setBudgetForm((p) => ({ ...p, limitAmount: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowBudgetModal(false)}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button type="submit" disabled={budgetSaving}
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/25 cursor-pointer"
                >
                  {budgetSaving ? t("loading") : t("save")}
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
                <h4 className="text-xl font-bold text-white">{t("dash_goals_title")}</h4>
              </div>
              <button type="button" onClick={() => setShowGoalModal(false)}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">{t("cat_col_name")}</label>
                <input type="text" placeholder="..." value={goalForm.name}
                  onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">{t("col_amount")} ({currencyCode})</label>
                <input type="number" placeholder="25000000" value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm((p) => ({ ...p, targetAmount: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">{t("dash_target_date")}</label>
                <input type="date" value={goalForm.targetDate}
                  onChange={(e) => setGoalForm((p) => ({ ...p, targetDate: e.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowGoalModal(false)}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button type="submit" disabled={goalSaving}
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/25 cursor-pointer"
                >
                  {goalSaving ? t("loading") : t("save")}
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
                <h4 className="text-xl font-bold text-white">{t("bank_view_accounts")}</h4>
                <p className="text-xs text-slate-400 mt-1">Plaid Automated Integration</p>
              </div>
              <button type="button" onClick={() => setShowAccountsModal(false)}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10 cursor-pointer"
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
                      Plaid ID: {acc.id} | {acc.accountType} ({acc.accountSubtype || "default"})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-cyan-300">{formatCurrency(acc.currentBalance)}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Sync: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleString("vi-VN") : "---"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-white/10">
              <button type="button" onClick={() => setShowAccountsModal(false)}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 cursor-pointer"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}