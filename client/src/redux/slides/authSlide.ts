import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiService } from "../../apis/service"
import { extractApiError } from "../../apis/http"
import type { UserProfile, CurrencyCode, LoginInput, ProfileUpdateInput, RegisterInput } from "../../types/api"
import { clearAuthTokens, getAccessToken, getRefreshToken, saveAuthTokens } from "../../utils/auth"

type AuthState = {
  user: UserProfile | null
  initialized: boolean
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  initialized: false,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const initializeAuth = createAsyncThunk<UserProfile | null, void, { rejectValue: string }>(
  "auth/initialize",
  async (_, thunkApi) => {
    try {
      if (!getAccessToken()) return null

      const profile = await apiService.getProfile()
      return profile
    } catch (error) {
      clearAuthTokens()
      return thunkApi.rejectWithValue(extractApiError(error, "Phiên đăng nhập đã hết hạn."))
    }
  },
)

export const login = createAsyncThunk<UserProfile, LoginInput, { rejectValue: string }>(
  "auth/login",
  async (payload, thunkApi) => {
    try {
      const authPayload = await apiService.login(payload)
      saveAuthTokens(authPayload.accessToken, authPayload.refreshToken)
      return authPayload.user
    } catch (error) {
      return thunkApi.rejectWithValue(extractApiError(error, "Đăng nhập thất bại."))
    }
  },
)

export const register = createAsyncThunk<UserProfile, RegisterInput, { rejectValue: string }>(
  "auth/register",
  async (payload, thunkApi) => {
    try {
      return await apiService.register(payload)
    } catch (error) {
      return thunkApi.rejectWithValue(extractApiError(error, "Đăng ký thất bại."))
    }
  },
)

export const fetchProfile = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  "auth/fetchProfile",
  async (_, thunkApi) => {
    try {
      return await apiService.getProfile()
    } catch (error) {
      return thunkApi.rejectWithValue(extractApiError(error, "Không thể tải hồ sơ."))
    }
  },
);

export const updateProfile = createAsyncThunk<UserProfile, ProfileUpdateInput, { rejectValue: string }>(
  "auth/updateProfile",
  async (payload, thunkApi) => {
    try {
      return await apiService.updateProfile(payload)
    } catch (error) {
      return thunkApi.rejectWithValue(extractApiError(error, "Không thể cập nhật hồ sơ."))
    }
  },
)

export const uploadAvatar = createAsyncThunk<UserProfile, File, { rejectValue: string }>(
  "auth/uploadAvatar",
  async (file, thunkApi) => {
    try {
      return await apiService.uploadAvatar(file)
    } catch (error) {
      return thunkApi.rejectWithValue(extractApiError(error, "Không thể tải lên ảnh đại diện."))
    }
  },
)

export const changeDisplayCurrency = createAsyncThunk<UserProfile, CurrencyCode, { rejectValue: string }>(
  "auth/changeDisplayCurrency",
  async (displayCurrency, thunkApi) => {
    try {
      return await apiService.updateDisplayCurrency(displayCurrency)
    } catch (error) {
      return thunkApi.rejectWithValue(extractApiError(error, "Không thể cập nhật đơn vị tiền hiển thị."))
    }
  },
)

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, thunkApi) => {
    try {
      const refreshToken = getRefreshToken()
      if (refreshToken) await apiService.logout(refreshToken)
      clearAuthTokens()
    } catch (error) {
      clearAuthTokens()
      return thunkApi.rejectWithValue(extractApiError(error, "Đăng xuất thất bại."))
    }
  },
)

const authSlide = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload
        state.isAuthenticated = Boolean(action.payload && getAccessToken())
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload ?? "Không thể khởi tạo phiên đăng nhập."
      })
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Đăng nhập thất bại."
        state.isAuthenticated = false
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Đăng ký thất bại."
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.initialized = true
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Không thể tải hồ sơ."
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Không thể cập nhật hồ sơ."
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Không thể tải lên ảnh đại diện."
      })
      .addCase(logout.pending, (state) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.initialized = true
        state.isAuthenticated = false
        state.user = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false
        state.initialized = true
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload ?? "Đăng xuất thất bại."
      })
      .addCase(changeDisplayCurrency.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changeDisplayCurrency.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(changeDisplayCurrency.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Không thể cập nhật đơn vị tiền hiển thị."
      })
  },
})

export const { clearAuthError } = authSlide.actions
export default authSlide.reducer
