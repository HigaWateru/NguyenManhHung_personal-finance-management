import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { initializeAuth } from "../redux/slides/authSlide"

export function RequireAuth() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { initialized, isAuthenticated, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!initialized) void dispatch(initializeAuth())
  }, [dispatch, initialized])

  if (!initialized || loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-300">Đang xác thực phiên đăng nhập...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <Outlet />
}

export function PublicOnly() {
  const dispatch = useAppDispatch()
  const { initialized, isAuthenticated, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!initialized) void dispatch(initializeAuth())
  }, [dispatch, initialized])

  if (!initialized || loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-300">Đang tải...</div>
  }
  if (isAuthenticated) return <Navigate to="/" replace />

  return <Outlet />
}
