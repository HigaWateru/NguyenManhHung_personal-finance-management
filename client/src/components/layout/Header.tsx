import { useEffect, useState } from "react"
import { 
  Menu, Search, Bell, X, CheckCheck, Landmark, Globe, ShieldCheck, Check, BellOff, Sparkles, AlertTriangle, ChevronDown
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { logout } from "../../redux/slides/authSlide"
import { apiService } from "../../apis/service"
import type { NotificationResponse } from "../../types/api"
import { 
  subscribeNotificationRefresh 
} from "../../utils/notification"
import { useLanguage } from "../../context/LanguageContext"
import type { Language } from "../../i18n/translations"

type HeaderProps = {
  title: string
  onMenuClick: () => void
}

const languageOptions: { code: Language; label: string; flagClass: string }[] = [
  { code: "vi", label: "Tiếng Việt", flagClass: "fi fi-vn" },
  { code: "en", label: "English", flagClass: "fi fi-us" },
  { code: "ja", label: "日本語", flagClass: "fi fi-jp" },
]

export default function Header({ title, onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { language, setLanguage, t } = useLanguage()

  const [allNotifications, setAllNotifications] = useState<NotificationResponse[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
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
        badge: t("notif_cat_plaid"),
        icon: <Landmark size={14} className="text-cyan-400" />,
        bg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
      }
    }
    if (upper.includes("EXCHANGE") || upper.includes("RATE")) {
      return {
        badge: t("notif_cat_rate"),
        icon: <Globe size={14} className="text-blue-400" />,
        bg: "bg-blue-500/15 border-blue-500/30 text-blue-300"
      }
    }
    if (upper.includes("BUDGET") || upper.includes("WARNING")) {
      return {
        badge: t("notif_cat_budget"),
        icon: <AlertTriangle size={14} className="text-amber-400" />,
        bg: "bg-amber-500/15 border-amber-500/30 text-amber-300"
      }
    }
    if (upper.includes("SECURITY") || upper.includes("AUTH")) {
      return {
        badge: t("notif_cat_security"),
        icon: <ShieldCheck size={14} className="text-emerald-400" />,
        bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
      }
    }
    return {
      badge: t("notif_cat_system"),
      icon: <Sparkles size={14} className="text-purple-400" />,
      bg: "bg-purple-500/15 border-purple-500/30 text-purple-300"
    }
  }

  const unreadNotifications = allNotifications.filter((n) => !n.read)
  const unreadCount = unreadNotifications.length
  const displayedNotifications = filterTab === "unread" ? unreadNotifications : allNotifications

  const currentLangObj = languageOptions.find((l) => l.code === language) || languageOptions[0]

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="flex justify-between items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenuClick}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 md:hidden cursor-pointer"
          aria-label="Mở thanh bên"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70 font-semibold">{t("header_subtitle")}</p>
          <h2 className="truncate text-lg font-bold text-white sm:text-xl">{title}</h2>
        </div>

        <label className="hidden flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 lg:flex lg:max-w-xl">
          <Search size={18} className="shrink-0 text-cyan-300/70" />
          <input type="text" placeholder={t("header_search_placeholder")}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"/>
        </label>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button type="button" onClick={() => {
              setShowLangDropdown(!showLangDropdown)
              setShowDropdown(false)
            }}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-cyan-400/40 transition cursor-pointer shadow-sm"
            aria-label="Đổi ngôn ngữ"
          >
            <span className={`${currentLangObj.flagClass} rounded-xs shadow-sm`}></span>
            <span className="font-semibold text-white">{currentLangObj.label}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/15 bg-slate-900/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 space-y-1">
              {languageOptions.map((option) => (
                <button key={option.code} type="button" onClick={() => {
                    setLanguage(option.code)
                    setShowLangDropdown(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition cursor-pointer ${
                    language === option.code 
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" 
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`${option.flagClass} rounded-xs shadow-sm`}></span>
                    <span>{option.label}</span>
                  </div>
                  {language === option.code && <Check size={14} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bell Notification Icon & Modal Dropdown */}
        <div className="relative">
          <button type="button"  onClick={() => {
              setShowDropdown(!showDropdown)
              setShowLangDropdown(false)
              if (!showDropdown) fetchNotifications(false)
            }}
            className={`rounded-2xl border p-2.5 relative transition-all duration-300 cursor-pointer ${
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
                    <h4 className="text-sm font-bold text-white">{t("notif_title")}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {unreadCount > 0 ? `${unreadCount} ${t("notif_unread_count")}` : t("notif_no_unread")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button type="button" onClick={handleMarkAllRead}
                      className="inline-flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/25 transition shadow-sm cursor-pointer"
                      title={t("notif_mark_all_read")}
                    >
                      <CheckCheck size={12} />
                      <span>{t("notif_mark_all_read")}</span>
                    </button>
                  )}
                  <button type="button" onClick={() => setShowDropdown(false)} 
                    className="rounded-xl p-1 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    aria-label="Đóng bảng thông báo"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-950/70 p-1 border border-white/10 text-xs">
                <button type="button" onClick={() => setFilterTab("unread")}
                  className={`rounded-xl py-1.5 font-bold transition-all cursor-pointer ${
                    filterTab === "unread" 
                      ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-500/40 shadow-sm" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t("notif_tab_unread")} ({unreadCount})
                </button>
                <button type="button" onClick={() => setFilterTab("all")}
                  className={`rounded-xl py-1.5 font-bold transition-all cursor-pointer ${
                    filterTab === "all" 
                      ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-500/40 shadow-sm" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t("notif_tab_all")} ({allNotifications.length})
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
                      {t("notif_empty")}
                    </p>
                  </div>
                ) : (
                  displayedNotifications.map((notif) => {
                    const cat = getNotificationCategory(notif.type)
                    
                    // Translate notification content based on current system language
                    let translatedTitle = notif.title
                    let translatedMessage = notif.message

                    if (notif.title.includes("Đồng bộ Giao dịch") || notif.title.includes("Cảnh báo Đồng bộ Giao dịch")) {
                      translatedTitle = notif.title.includes("Cảnh báo") 
                        ? (language === "en" ? "Bank Sync Warning" : language === "ja" ? "銀行同期警告" : "Cảnh báo Đồng bộ Giao dịch")
                        : (language === "en" ? "Bank Sync Completed" : language === "ja" ? "銀行同期完了" : "Đồng bộ Giao dịch Plaid")
                      
                      if (notif.message.includes("quá thời gian")) {
                        translatedMessage = t("bank_sync_error_timeout")
                      } else if (notif.message.includes("cập nhật mới nhất")) {
                        translatedMessage = t("bank_sync_success_up_to_date")
                      } else if (notif.message.includes("Đã đồng bộ thành công")) {
                        const match = notif.message.match(/\d+/)
                        const countStr = match ? match[0] : "15"
                        translatedMessage = t("bank_sync_success_count").replace("{count}", countStr)
                      } else {
                        translatedMessage = notif.message
                      }
                    } else if (notif.title.includes("Cảnh báo Ngân sách")) {
                      if (language === "en") {
                        translatedTitle = "Budget Warning"
                        translatedMessage = notif.message.replace("Chi tiêu cho danh mục", "Expenses for category").replace("đã đạt", "reached").replace("hạn mức ngân sách.", "of budget limit.")
                      } else if (language === "ja") {
                        translatedTitle = "予算警告"
                        translatedMessage = notif.message.replace("Chi tiêu cho danh mục", "カテゴリ「").replace("đã đạt", "」の支出が").replace("hạn mức ngân sách.", "の予算上限に達しました。")
                      }
                    } else if (notif.title.includes("Cập nhật Tỷ giá")) {
                      if (language === "en") {
                        translatedTitle = "Exchange Rates Updated"
                        translatedMessage = "Market exchange rates synced online against USD standard ($1.0000 USD)."
                      } else if (language === "ja") {
                        translatedTitle = "為替レート更新"
                        translatedMessage = "市場為替レートがオンラインで同期されました（USD標準 $1.0000 USD）。"
                      }
                    }

                    return (
                      <div key={notif.id} 
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
                                {t("notif_badge_new")}
                              </span>
                            )}
                          </div>

                          {!notif.read && (
                            <button type="button" onClick={(e) => {
                                e.stopPropagation();
                                handleMarkRead(notif.id);
                              }}
                              className="rounded-lg bg-white/5 p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/15 transition cursor-pointer"
                              title={t("notif_mark_all_read")}
                            >
                              <Check size={13} />
                            </button>
                          )}
                        </div>

                        <h5 className="font-bold text-white text-xs leading-snug">{translatedTitle}</h5>
                        <p className="text-slate-300 text-[11px] leading-relaxed font-normal">{translatedMessage}</p>
                        
                        <div className="text-[10px] text-cyan-400/80 text-right font-semibold">
                          {new Date(notif.createdAt).toLocaleString(language === "vi" ? "vi-VN" : language === "ja" ? "ja-JP" : "en-US", {
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
          className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 sm:block cursor-pointer">
          {t("header_logout")}
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