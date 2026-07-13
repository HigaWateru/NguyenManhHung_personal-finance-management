import axios, { AxiosError, AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import type { ApiResponse, AuthPayload } from "../types/api";
import { clearAuthTokens, getAccessToken, getRefreshToken, saveAuthTokens } from "../utils/auth";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type ErrorPayload = {
  message?: string;
  errors?: Record<string, unknown>;
};

const AUTH_WHITELIST = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh-token",
];

const authClient = axios.create({
  baseURL: "/",
  timeout: 15000,
});

export const http = axios.create({
  baseURL: "/",
  timeout: 15000,
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await authClient.post<ApiResponse<AuthPayload>>("/api/v1/auth/refresh-token", {
    refreshToken,
  });

  const data = response.data.data;
  saveAuthTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

http.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorPayload>) => {
    const config = error.config as RetriableConfig | undefined;
    const requestUrl = config?.url ?? "";

    if (!config || config._retry || AUTH_WHITELIST.some((path) => requestUrl.includes(path))) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (!newToken) {
        clearAuthTokens();
        return Promise.reject(error);
      }

      const headers = AxiosHeaders.from(config.headers);
      headers.set("Authorization", `Bearer ${newToken}`);
      config.headers = headers;

      return http(config);
    } catch (refreshError) {
      clearAuthTokens();
      return Promise.reject(refreshError);
    }
  },
);

export function extractApiError(error: unknown, fallback = "Đã xảy ra lỗi, vui lòng thử lại."): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;
    if (apiMessage) {
      return apiMessage;
    }

    if (error.code === "ECONNABORTED") {
      return "Hết thời gian chờ phản hồi từ server.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
