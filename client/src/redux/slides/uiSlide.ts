import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  loadingCount: number;
  globalError: string | null;
};

const initialState: UiState = {
  loadingCount: 0,
  globalError: null,
};

const uiSlide = createSlice({
  name: "ui",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loadingCount += 1;
    },
    stopLoading: (state) => {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
    setGlobalError: (state, action: PayloadAction<string>) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
  },
});

export const { startLoading, stopLoading, setGlobalError, clearGlobalError } = uiSlide.actions;
export default uiSlide.reducer;
