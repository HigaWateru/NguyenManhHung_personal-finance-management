import { http } from "./http"
import type {ApiResponse, AuthPayload, CategoryItem, CategoryType, CurrencyCode, DashboardData, ExpenseItem, IncomeItem,
  PageResponse, StatisticsData, UserProfile, } from "../types/api"

export type LoginInput = {
  email: string
  password: string
}

export type ProfileUpdateInput = {
  fullName: string
  timezone: string
  currencyCode: CurrencyCode
}

export type RegisterInput = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  timezone?: string
  currencyCode?: "VND" | "USD" | "EUR"
}

export type CategoryInput = {
  name: string
  type: CategoryType
  description?: string
}

export type IncomeInput = {
  categoryId: number
  amount: number
  transactionDate: string
  note?: string
}

export type ExpenseInput = {
  categoryId: number
  amount: number
  transactionDate: string
  note?: string
}

export type ForgotPasswordInput = {
  email: string
}

export type VerifyOtpInput = {
  email: string
  otp: string
}

export type ResetPasswordInput = {
  email: string
  otp: string
  password: string
  confirmPassword: string
}

export type PaginationQuery = {
  page?: number
  size?: number
  keyword?: string
  categoryId?: number
  fromDate?: string
  toDate?: string
}

function toQueryParams(query: PaginationQuery) {
  return {
    ...(query.page !== undefined ? { page: query.page } : {}),
    ...(query.size !== undefined ? { size: query.size } : {}),
    ...(query.keyword ? { keyword: query.keyword } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.fromDate ? { fromDate: query.fromDate } : {}),
    ...(query.toDate ? { toDate: query.toDate } : {}),
  }
}

export const apiService = {
  login: async (payload: LoginInput) => {
    const response = await http.post<ApiResponse<AuthPayload>>("/api/v1/auth/login", payload)
    return response.data.data
  },

  register: async (payload: RegisterInput) => {
    const response = await http.post<ApiResponse<UserProfile>>("/api/v1/auth/register", payload)
    return response.data.data
  },

  getProfile: async () => {
    const response = await http.get<ApiResponse<UserProfile>>("/api/v1/auth/profile")
    return response.data.data
  },

  updateProfile: async (payload: ProfileUpdateInput) => {
    const response = await http.put<ApiResponse<UserProfile>>("/api/v1/auth/profile", payload)
    return response.data.data
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await http.post<ApiResponse<UserProfile>>("/api/v1/auth/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.data
  },

  logout: async (refreshToken: string) => {
    await http.post("/api/v1/auth/logout", { refreshToken })
  },

  getDashboard: async () => {
    const response = await http.get<ApiResponse<DashboardData>>("/api/v1/dashboard")
    return response.data.data
  },

  getStatistics: async (year?: number) => {
    const response = await http.get<ApiResponse<StatisticsData>>("/api/v1/statistics", {
      params: year ? { year } : undefined,
    })
    return response.data.data
  },

  getCategories: async (type?: CategoryType) => {
    const response = await http.get<ApiResponse<CategoryItem[]>>("/api/v1/categories", {
      params: type ? { type } : undefined,
    })
    return response.data.data
  },

  createCategory: async (payload: CategoryInput) => {
    const response = await http.post<ApiResponse<CategoryItem>>("/api/v1/categories", payload);
    return response.data.data
  },

  updateCategory: async (id: number, payload: CategoryInput) => {
    const response = await http.put<ApiResponse<CategoryItem>>(`/api/v1/categories/${id}`, payload)
    return response.data.data
  },

  deleteCategory: async (id: number) => {
    await http.delete(`/api/v1/categories/${id}`)
  },

  getIncomes: async (query: PaginationQuery) => {
    const response = await http.get<ApiResponse<PageResponse<IncomeItem>>>("/api/v1/incomes", {
      params: toQueryParams(query),
    });
    return response.data.data
  },

  createIncome: async (payload: IncomeInput) => {
    const response = await http.post<ApiResponse<IncomeItem>>("/api/v1/incomes", payload)
    return response.data.data
  },

  updateIncome: async (id: number, payload: IncomeInput) => {
    const response = await http.put<ApiResponse<IncomeItem>>(`/api/v1/incomes/${id}`, payload)
    return response.data.data
  },

  deleteIncome: async (id: number) => {
    await http.delete(`/api/v1/incomes/${id}`)
  },

  getExpenses: async (query: PaginationQuery) => {
    const response = await http.get<ApiResponse<PageResponse<ExpenseItem>>>("/api/v1/expenses", {
      params: toQueryParams(query),
    });
    return response.data.data
  },

  createExpense: async (payload: ExpenseInput) => {
    const response = await http.post<ApiResponse<ExpenseItem>>("/api/v1/expenses", payload)
    return response.data.data
  },

  updateExpense: async (id: number, payload: ExpenseInput) => {
    const response = await http.put<ApiResponse<ExpenseItem>>(`/api/v1/expenses/${id}`, payload)
    return response.data.data
  },

  deleteExpense: async (id: number) => {
    await http.delete(`/api/v1/expenses/${id}`)
  },

  forgotPassword: async (payload: ForgotPasswordInput) => {
    const response = await http.post<ApiResponse<{ message: string }>>("/api/v1/auth/forgot-password", payload)
    return response.data
  },

  verifyOtp: async (payload: VerifyOtpInput) => {
    const response = await http.post<ApiResponse<{ message: string }>>("/api/v1/auth/verify-otp", payload)
    return response.data
  },

  resetPassword: async (payload: ResetPasswordInput) => {
    const response = await http.post<ApiResponse<{ message: string }>>("/api/v1/auth/reset-password", payload)
    return response.data
  },
}
