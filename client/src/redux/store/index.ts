import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../slides/authSlide"
import uiReducer from "../slides/uiSlide"
import exchangeRateReducer from "../slides/exchangeRateSlide"

export const store = configureStore({
	reducer: {
		auth: authReducer,
		ui: uiReducer,
		exchangeRate: exchangeRateReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

