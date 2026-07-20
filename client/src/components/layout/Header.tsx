import { useEffect, useState } from "react"
import { 
  Menu, Search, Bell, X, CheckCheck, Landmark, Globe, ShieldCheck, Check, BellOff, Sparkles, AlertTriangle
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { logout } from "../../redux/slides/authSlide"
import { apiService } from "../../apis/service"
import type { NotificationResponse } from "../../types/api"
import { 
  subscribeNotificationRefresh 
} from "../../utils/notification"

type HeaderProps = {
  title: string
  onMenuClick: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [allNotifications, setAllNotifications] = useState<NotificationResponse[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [filterTab, setFilterTab] = useState<"unread" | "all">("unread")
  const [isFlashing, setIsFlashing] = useState(false)

  const fetchNotifications = async (flashOnNew = false) => {
    try {
      const data = await apiService.getNotifications(false) // fetch all notifications
      setAllNotifications(data || [])
      
      if (flashOnNew) {
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 4000)
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }

  // Subscribe to notification refresh events
  useEffect(() => {
    const unsubscribeRefresh = subscribeNotificationRefresh(() => {
      fetchNotifications(true)
    })

    return () => {
      unsubscribeRefresh()
    }
  }, [])

  // Periodic polling for notifications every 10 seconds
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => fetchNotifications(false), 10000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      setAllNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      await apiService.markNotificationRead(id)
    } catch (err) {
      console.error("Failed to mark notification read", err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setAllNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      await apiService.markAllNotificationsRead()
    } catch (err) {
      console.error("Failed to mark all notifications read", err)
    }
  }

  const handleLogout = async () => {
    await dispatch(logout())
    navigate("/login", { replace: true })
  }

  // Get Category Tag & Icon for Modal Notifications
  const getNotificationCategory = (type: string) => {
    const upper = (type || "").toUpperCase()
    if (upper.includes("PLAID") || upper.includes("BANK")) {
      return {
        badge: "Ngân hàng Plaid",
        icon: <Landmark size={14} className="text-cyan-400" />,
        bg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
      }
    }
    if (upper.includes("EXCHANGE") || upper.includes("RATE")) {
      return {
        badge: "Tỷ giá Ngoại tệ",
        icon: <Globe size={14} className="text-blue-400" />,
        bg: "bg-blue-500/15 border-blue-500/30 text-blue-300"
      }
    }
    if (upper.includes("BUDGET") || upper.includes("WARNING")) {
      return {
        badge: "Cảnh báo Ngân sách",
        icon: <AlertTriangle size={14} className="text-amber-400" />,
        bg: "bg-amber-500/15 border-amber-500/30 text-amber-300"
      }
    }
    if (upper.includes("SECURITY") || upper.includes("AUTH")) {
      return {
        badge: "Bảo mật Tài khoản",
        icon: <ShieldCheck size={14} className="text-emerald-400" />,
        bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
      }
    }
    return {
      badge: "Hệ thống",
      icon: <Sparkles size={14} className="text-purple-400" />,
      bg: "bg-purple-500/15 border-purple-500/30 text-purple-300"
    }
  }

  const unreadNotifications = allNotifications.filter((n) => !n.read)
  const unreadCount = unreadNotifications.length
  const displayedNotifications = filterTab === "unread" ? unreadNotifications : allNotifications

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="flex justify-between items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenuClick}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 md:hidden"
          aria-label="Mở thanh bên"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70 font-semibold">Smart Finance · Quản Lý Tài Chính Cá Nhân</p>
          <h2 className="truncate text-lg font-bold text-white sm:text-xl">{title}</h2>
        </div>

        <label className="hidden flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 lg:flex lg:max-w-xl">
          <Search size={18} className="shrink-0 text-cyan-300/70" />
          <input type="text" placeholder="Tìm giao dịch, danh mục, thống kê..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"/>
        </label>

        {/* Bell Notification Icon & Modal Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onClick={() => {
              setShowDropdown(!showDropdown)
              if (!showDropdown) fetchNotifications(false)
            }}
            className={`rounded-2xl border p-2.5 relative transition-all duration-300 ${
              isFlashing 
                ? "border-cyan-400 bg-cyan-500/30 text-cyan-200 ring-4 ring-cyan-500/40 shadow-lg shadow-cyan-500/30 scale-105"
                : showDropdown 
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-lg shadow-cyan-500/10" 
                  : unreadCount > 0 
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                    : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            }`}
            aria-label="Thông báo"
          >
            <Bell size={18} className={unreadCount > 0 || isFlashing ? "animate-bounce text-cyan-300" : ""} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-[10px] font-extrabold text-slate-950 shadow-lg ring-2 ring-slate-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Expanded Notification Modal Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-88 sm:w-96 rounded-3xl border border-cyan-500/30 bg-slate-900/95 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header Modal Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20">
                    <Bell size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Thông Báo & Cảnh Báo</h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {unreadCount > 0 ? `${unreadCount} thông báo mới chưa đọc` : "Tất cả thông báo đã xem"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button 
                      type="button" 
                      onClick={handleMarkAllRead}
                      className="inline-flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/25 transition shadow-sm"
                      title="Đánh dấu tất cả đã đọc"
                    >
                      <CheckCheck size={12} />
                      <span>Đã đọc hết</span>
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => setShowDropdown(false)} 
                    className="rounded-xl p-1 text-slate-400 hover:text-white hover:bg-white/10 transition"
                    aria-label="Đóng bảng thông báo"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-950/70 p-1 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterTab("unread")}
                  className={`rounded-xl py-1.5 font-bold transition-all ${
                    filterTab === "unread" 
                      ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-500/40 shadow-sm" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Chưa đọc ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`rounded-xl py-1.5 font-bold transition-all ${
                    filterTab === "all" 
                      ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-500/40 shadow-sm" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tất cả ({allNotifications.length})
                </button>
              </div>

              {/* Notification List Items */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {displayedNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                    <div className="rounded-full bg-slate-800/80 p-3 text-slate-500 border border-white/10">
                      <BellOff size={22} />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {filterTab === "unread" ? "Không có thông báo chưa đọc nào." : "Không có thông báo nào."}
                    </p>
                  </div>
                ) : (
                  displayedNotifications.map((notif) => {
                    const cat = getNotificationCategory(notif.type)
                    return (
                      <div 
                        key={notif.id} 
                        className={`relative rounded-2xl p-3.5 border transition-all duration-200 space-y-2 ${
                          notif.read 
                            ? "bg-slate-950/40 border-white/5 opacity-65 hover:opacity-100" 
                            : "bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.bg}`}>
                              {cat.icon}
                              <span>{cat.badge}</span>
                            </span>

                            {!notif.read && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                                ✨ Mới
                              </span>
                            )}
                          </div>

                          {!notif.read && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkRead(notif.id);
                              }}
                              className="rounded-lg bg-white/5 p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/15 transition"
                              title="Đánh dấu đã đọc"
                            >
                              <Check size={13} />
                            </button>
                          )}
                        </div>

                        <h5 className="font-bold text-white text-xs leading-snug">{notif.title}</h5>
                        <p className="text-slate-300 text-[11px] leading-relaxed font-normal">{notif.message}</p>
                        
                        <div className="text-[10px] text-cyan-400/80 text-right font-semibold">
                          {new Date(notif.createdAt).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </div>
                      </div>
                    )
                  })
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
            <img src={user.avatarUrl} alt="Avatar" className="h-9 w-9 rounded-2xl object-cover" />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-semibold text-slate-950">
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