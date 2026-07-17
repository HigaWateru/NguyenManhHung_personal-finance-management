import { useEffect, useState } from "react"
import { Menu, Search, Bell, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { logout } from "../../redux/slides/authSlide"
import { apiService } from "../../apis/service"
import type { NotificationResponse } from "../../types/api"

type HeaderProps = {
  title: string
  onMenuClick: () => void
};

export default function Header({ title, onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const fetchNotifications = async () => {
    try {
      const data = await apiService.getNotifications(true)
      setNotifications(data)
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 20000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await apiService.markNotificationRead(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    await dispatch(logout())
    navigate("/login", { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="flex justify-between items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenuClick}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 md:hidden"
          aria-label="Mở thanh bên"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Smart Finance · Kiến trúc MVP</p>
          <h2 className="truncate text-lg font-semibold text-white sm:text-2xl">{title}</h2>
        </div>

        <label className="hidden flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 lg:flex lg:max-w-xl">
          <Search size={18} className="shrink-0 text-cyan-300/70" />
          <input type="text" placeholder="Tìm giao dịch, danh mục, thống kê..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"/>
        </label>

        <div className="relative">
          <button type="button" onClick={() => setShowDropdown(!showDropdown)}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 relative transition hover:bg-white/10"
            aria-label="Thông báo">
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-cyan-400 text-[9px] font-bold text-slate-950 animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 glass-panel-strong rounded-3xl p-4 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.55)] z-50">
              <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                <h4 className="text-sm font-bold text-white">Cảnh báo & Hệ thống</h4>
                <button type="button" onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Không có thông báo mới.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="relative rounded-xl bg-slate-900/60 p-2.5 border border-white/5 text-xs text-slate-200">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notif.id);
                        }}
                        className="absolute top-1.5 right-1.5 text-slate-500 hover:text-white"
                        title="Đánh dấu đã đọc"
                      >
                        <X size={10} />
                      </button>
                      <p className="font-semibold text-cyan-300 pr-4">{notif.title}</p>
                      <p className="text-[10px] text-slate-300 mt-1">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button type="button" onClick={handleLogout}
          className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 sm:block">
          Đăng xuất
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="h-10 w-10 rounded-2xl object-cover" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-semibold text-slate-950">
              {(user?.fullName?.trim().slice(0, 2).toUpperCase() || "SF")}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.fullName || "Smart Finance"}</p>
            <p className="text-xs text-slate-400">{user?.email || "Tài khoản người dùng"}</p>
          </div>
        </div>
      </div>
    </header>
  )
}