export type ApiErrorMap = Record<string, string | number | boolean | null | undefined>

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  errors?: ApiErrorMap
  timestamp?: string
  path?: string
}

export type CurrencyCode = "VND" | "USD" | "EUR" | "JPY"

export type UserProfile = {
  id: number
  fullName: string
  email: string
  avatarUrl: string | null
  timezone: string | null
  currencyCode: CurrencyCode
  displayCurrency: CurrencyCode
  active: boolean
  createdAt: string
  updatedAt: string
}

export type AuthPayload = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: UserProfile
}

export type PageResponse<T> = {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
};

export type CategoryType = "INCOME" | "EXPENSE"

export type CategoryItem = {
  id: number
  name: string
  type: CategoryType
  description: string | null
  transactionCount: number
  createdAt: string
  updatedAt: string
}

export type IncomeItem = {
  id: number
  categoryId: number
  categoryName: string
  amount: number
  transactionDate: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export type ExpenseItem = {
  id: number
  categoryId: number
  categoryName: string
  amount: number
  transactionDate: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export type RecentTransaction = {
  id: number
  type: CategoryType
  categoryId: number
  categoryName: string
  amount: number
  transactionDate: string
  note: string | null
  createdAt: string
}

export type CategoryDistribution = {
  categoryName: string
  amount: number
  percentage: number
}

export type DashboardData = {
  totalIncome: number
  totalExpense: number
  totalBalance: number
  monthlyIncome: number
  monthlyExpense: number
  recentTransactions: RecentTransaction[]
  categoryDistribution?: CategoryDistribution[]
}

export type MonthlyStatistics = {
  month: number
  income: number
  expense: number
  balance: number
}

export type YearlyStatistics = {
  year: number
  income: number
  expense: number
  balance: number
}

export type CategoryStatistics = {
  categoryId: number
  categoryName: string
  type: CategoryType
  totalAmount: number
  percentage: number
}

export type StatisticsData = {
  selectedYear: number
  monthlyStatistics: MonthlyStatistics[]
  yearlyStatistics: YearlyStatistics[]
  categoryStatistics: CategoryStatistics[]
}

export type BankAccountResponse = {
  id: number
  institutionName: string
  accountName: string
  accountType: string
  accountSubtype: string | null
  currentBalance: number
  lastSyncedAt: string | null
  connectionStatus: string
}

export type BudgetResponse = {
  id: number
  categoryId: number
  categoryName: string
  limitAmount: number
  spentAmount: number
  startDate: string
  endDate: string
}

export type GoalResponse = {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string | null
  status: string
}

export type NotificationResponse = {
  id: number
  title: string
  message: string
  read: boolean
  type: string
  createdAt: string
}

export type ExchangeRateResponse = {
  id: number
  currencyCode: CurrencyCode
  currencyName: string
  symbol: string
  rateToVnd: number
  rateChangePercent: number | null
  updatedAt: string
}

