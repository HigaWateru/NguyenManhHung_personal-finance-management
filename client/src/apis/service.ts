import { http } from "./http"
import type { ApiResponse, AuthPayload, CategoryInput, CategoryItem, ExpenseInput, ExpenseItem, 
  ForgotPasswordInput, IncomeInput, IncomeItem, LoginInput, PageResponse, PaginationQuery, 
  ProfileUpdateInput, RegisterInput, ResetPasswordInput, StatisticsData, UserProfile, VerifyOtpInput,
  CategoryType, DashboardData, BankAccountResponse, BudgetResponse, GoalResponse, NotificationResponse,
  ExchangeRateResponse, CurrencyCode
} from "../types/api"

export type { LoginInput, RegisterInput, ProfileUpdateInput, ForgotPasswordInput, VerifyOtpInput,
  ResetPasswordInput, IncomeInput, ExpenseInput, CategoryInput }

function toQueryParams(query: PaginationQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    size: query.size,
  }

  const searchText = query.keyword?.trim() || query.search?.trim()
  if (searchText) {
    params.keyword = searchText
    params.search = searchText
  }

  if (query.sortBy) params.sortBy = query.sortBy
  if (query.sortDir) params.sortDir = query.sortDir
  if (query.categoryId) params.categoryId = query.categoryId

  const from = query.fromDate || query.startDate
  if (from) {
    params.fromDate = from
    params.startDate = from
  }

  const to = query.toDate || query.endDate
  if (to) {
    params.toDate = to
    params.endDate = to
  }

  return params
}

export const apiService = {
  login: async (payload: LoginInput) => {
    const response = await http.post<ApiResponse<AuthPayload>>("/api/v2/auth/login", payload)
    return response.data.data
  },

  register: async (payload: RegisterInput) => {
    const response = await http.post<ApiResponse<UserProfile>>("/api/v2/auth/register", payload)
    return response.data.data
  },

  getProfile: async () => {
    const response = await http.get<ApiResponse<UserProfile>>("/api/v2/auth/profile")
    return response.data.data
  },

  updateProfile: async (payload: ProfileUpdateInput) => {
    const response = await http.put<ApiResponse<UserProfile>>("/api/v2/auth/profile", payload)
    return response.data.data
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await http.post<ApiResponse<UserProfile>>("/api/v2/auth/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.data
  },

  logout: async (refreshToken: string) => {
    await http.post("/api/v2/auth/logout", { refreshToken })
  },

  getDashboard: async () => {
    const response = await http.get<ApiResponse<DashboardData>>("/api/v2/dashboard")
    return response.data.data
  },

  getStatistics: async (year?: number) => {
    const response = await http.get<ApiResponse<StatisticsData>>("/api/v2/statistics", {
      params: year ? { year } : undefined,
    })
    return response.data.data
  },

  getCategories: async (type?: CategoryType) => {
    const response = await http.get<ApiResponse<CategoryItem[]>>("/api/v2/categories", {
      params: type ? { type } : undefined,
    })
    return response.data.data
  },

  createCategory: async (payload: CategoryInput) => {
    const response = await http.post<ApiResponse<CategoryItem>>("/api/v2/categories", payload);
    return response.data.data
  },

  updateCategory: async (id: number, payload: CategoryInput) => {
    const response = await http.put<ApiResponse<CategoryItem>>(`/api/v2/categories/${id}`, payload)
    return response.data.data
  },

  deleteCategory: async (id: number) => {
    await http.delete(`/api/v2/categories/${id}`)
  },

  getIncomes: async (query: PaginationQuery) => {
    const response = await http.get<ApiResponse<PageResponse<IncomeItem>>>("/api/v2/incomes", {
      params: toQueryParams(query),
    });
    return response.data.data
  },

  createIncome: async (payload: IncomeInput) => {
    const response = await http.post<ApiResponse<IncomeItem>>("/api/v2/incomes", payload)
    return response.data.data
  },

  updateIncome: async (id: number, payload: IncomeInput) => {
    const response = await http.put<ApiResponse<IncomeItem>>(`/api/v2/incomes/${id}`, payload)
    return response.data.data
  },

  deleteIncome: async (id: number) => {
    await http.delete(`/api/v2/incomes/${id}`)
  },

  getExpenses: async (query: PaginationQuery) => {
    const response = await http.get<ApiResponse<PageResponse<ExpenseItem>>>("/api/v2/expenses", {
      params: toQueryParams(query),
    });
    return response.data.data
  },

  createExpense: async (payload: ExpenseInput) => {
    const response = await http.post<ApiResponse<ExpenseItem>>("/api/v2/expenses", payload)
    return response.data.data
  },

  updateExpense: async (id: number, payload: ExpenseInput) => {
    const response = await http.put<ApiResponse<ExpenseItem>>(`/api/v2/expenses/${id}`, payload)
    return response.data.data
  },

  deleteExpense: async (id: number) => {
    await http.delete(`/api/v2/expenses/${id}`)
  },

  forgotPassword: async (payload: ForgotPasswordInput) => {
    const response = await http.post<ApiResponse<{ message: string }>>("/api/v2/auth/forgot-password", payload)
    return response.data
  },

  verifyOtp: async (payload: VerifyOtpInput) => {
    const response = await http.post<ApiResponse<{ message: string }>>("/api/v2/auth/verify-otp", payload)
    return response.data
  },

  resetPassword: async (payload: ResetPasswordInput) => {
    const response = await http.post<ApiResponse<{ message: string }>>("/api/v2/auth/reset-password", payload)
    return response.data
  },

  // Plaid Integration
  getPlaidLinkToken: async () => {
    const response = await http.post<ApiResponse<{ linkToken: string }>>("/api/v2/plaid/create-link-token")
    return response.data.data
  },

  exchangePlaidPublicToken: async (publicToken: string, institutionName: string) => {
    const response = await http.post<ApiResponse<{ message: string }>>("/api/v2/plaid/exchange-public-token", { publicToken, institutionName })
    return response.data.data
  },

  syncPlaidTransactions: async () => {
    const response = await http.post<ApiResponse<{ syncedCount: number }>>("/api/v2/plaid/sync")
    return response.data.data
  },

  getPlaidBankAccounts: async () => {
    const response = await http.get<ApiResponse<BankAccountResponse[]>>("/api/v2/plaid/accounts")
    return response.data.data
  },

  getPlaidStatus: async () => {
    const response = await http.get<ApiResponse<{ connected: boolean }>>("/api/v2/plaid/status")
    return response.data.data
  },

  disconnectPlaid: async () => {
    const response = await http.post<ApiResponse<{ message: string }>>("/api/v2/plaid/disconnect")
    return response.data.data
  },

  // Budgets
  getBudgets: async () => {
    const response = await http.get<ApiResponse<BudgetResponse[]>>("/api/v2/budgets")
    return response.data.data
  },

  createBudget: async (categoryId: number, limitAmount: number) => {
    const response = await http.post<ApiResponse<BudgetResponse>>("/api/v2/budgets", { categoryId, limitAmount })
    return response.data.data
  },

  updateBudget: async (id: number, limitAmount: number) => {
    const response = await http.put<ApiResponse<BudgetResponse>>(`/api/v2/budgets/${id}`, { categoryId: 0, limitAmount })
    return response.data.data
  },

  deleteBudget: async (id: number) => {
    await http.delete(`/api/v2/budgets/${id}`)
  },

  // Goals
  getGoals: async () => {
    const response = await http.get<ApiResponse<GoalResponse[]>>("/api/v2/goals")
    return response.data.data
  },

  createGoal: async (name: string, targetAmount: number, targetDate?: string) => {
    const response = await http.post<ApiResponse<GoalResponse>>("/api/v2/goals", { name, targetAmount, targetDate })
    return response.data.data
  },

  updateGoalProgress: async (id: number, currentAmount: number) => {
    const response = await http.put<ApiResponse<GoalResponse>>(`/api/v2/goals/${id}/progress`, { currentAmount })
    return response.data.data
  },

  updateGoal: async (id: number, name: string, targetAmount: number, targetDate?: string, status?: string) => {
    const response = await http.put<ApiResponse<GoalResponse>>(`/api/v2/goals/${id}?status=${status || "ACTIVE"}`, { name, targetAmount, targetDate })
    return response.data.data
  },

  deleteGoal: async (id: number) => {
    await http.delete(`/api/v2/goals/${id}`)
  },

  // Notifications
  getNotifications: async (unreadOnly?: boolean) => {
    const response = await http.get<ApiResponse<NotificationResponse[]>>("/api/v2/notifications", {
      params: unreadOnly ? { unreadOnly } : undefined
    })
    return response.data.data
  },

  markNotificationRead: async (id: number) => {
    const response = await http.post<ApiResponse<{ message: string }>>(`/api/v2/notifications/${id}/read`)
    return response.data.data
  },

  markAllNotificationsRead: async () => {
    const response = await http.post<ApiResponse<{ message: string }>>("/api/v2/notifications/mark-all-read")
    return response.data.data
  },

  getExchangeRates: async () => {
    const response = await http.get<ApiResponse<ExchangeRateResponse[]>>("/api/v2/exchange-rate")
    return response.data.data
  },

  syncExchangeRates: async () => {
    const response = await http.post<ApiResponse<ExchangeRateResponse[]>>("/api/v2/exchange-rate/sync")
    return response.data.data
  },

  getLatestExchangeRates: async () => {
    const response = await http.get<ApiResponse<ExchangeRateResponse[]>>("/api/v2/exchange-rate/latest")
    return response.data.data
  },

  getExchangeRate: async (currency: string) => {
    const response = await http.get<ApiResponse<ExchangeRateResponse>>(`/api/v2/exchange-rate/${currency}`)
    return response.data.data
  },

  updateDisplayCurrency: async (displayCurrency: CurrencyCode) => {
    const response = await http.put<ApiResponse<UserProfile>>("/api/v2/users/display-currency", { displayCurrency })
    return response.data.data
  }
}
