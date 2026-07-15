export type ApiErrorMap = Record<string, string | number | boolean | null | undefined>

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  errors?: ApiErrorMap
  timestamp?: string
  path?: string
}

export type CurrencyCode = "VND" | "USD" | "EUR"

export type UserProfile = {
  id: number
  fullName: string
  email: string
  avatarUrl: string | null
  timezone: string | null
  currencyCode: CurrencyCode
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

export type DashboardData = {
  totalIncome: number
  totalExpense: number
  totalBalance: number
  monthlyIncome: number
  monthlyExpense: number
  recentTransactions: RecentTransaction[]
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
