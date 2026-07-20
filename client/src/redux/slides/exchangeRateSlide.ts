import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiService } from "../../apis/service"
import { extractApiError } from "../../apis/http"
import type { ExchangeRateResponse } from "../../types/api"

type ExchangeRateState = {
  rates: ExchangeRateResponse[]
  loading: boolean
  error: string | null
}

const initialState: ExchangeRateState = {
  rates: [],
  loading: false,
  error: null,
}

export const fetchExchangeRates = createAsyncThunk<ExchangeRateResponse[], void, { rejectValue: string }>(
  "exchangeRate/fetchAll",
  async (_, thunkApi) => {
    try {
      return await apiService.getExchangeRates()
    } catch (error) {
      return thunkApi.rejectWithValue(extractApiError(error, "Không thể tải tỷ giá thị trường."))
    }
  }
)

export const syncExchangeRates = createAsyncThunk<ExchangeRateResponse[], void, { rejectValue: string }>(
  "exchangeRate/sync",
  async (_, thunkApi) => {
    try {
      return await apiService.syncExchangeRates()
    } catch (error) {
      return thunkApi.rejectWithValue(extractApiError(error, "Không thể đồng bộ tỷ giá thị trường."))
    }
  }
)

const exchangeRateSlide = createSlice({
  name: "exchangeRate",
  initialState,
  reducers: {
    clearExchangeRateError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false
        state.rates = action.payload
        state.error = null
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Không thể tải tỷ giá thị trường."
      })
      .addCase(syncExchangeRates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(syncExchangeRates.fulfilled, (state, action) => {
        state.loading = false
        state.rates = action.payload
        state.error = null
      })
      .addCase(syncExchangeRates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Không thể đồng bộ tỷ giá thị trường."
      })
  }
})

export const { clearExchangeRateError } = exchangeRateSlide.actions
export default exchangeRateSlide.reducer
