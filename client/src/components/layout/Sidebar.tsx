import { X, type LucideIcon } from "lucide-react"
import { useMemo } from "react"
import { NavLink } from "react-router-dom"
import { navigationItems } from "../../utils/mockData"
import { LayoutDashboard, ArrowDownRight, ArrowUpRight, Tags, BarChart3, UserRound, TrendingUp } from "lucide-react"
import { useLanguage } from "../../context/LanguageContext"
import type { TranslationKeys } from "../../i18n/translations"

const icons: Record<string, LucideIcon> = {
  LayoutDashboard, ArrowDownRight, ArrowUpRight, Tags, BarChart3, UserRound, TrendingUp
}

type SidebarProps = {
  open: boolean
  onClose: () => void
}

const navTranslationMap: Record<string, keyof TranslationKeys> = {
  "/": "nav_dashboard",
  "/income": "nav_income",
  "/expense": "nav_expense",
  "/category": "nav_categories",
  "/categories": "nav_categories",
  "/statistics": "nav_statistics",
  "/exchange-rate": "nav_exchange_rates",
  "/profile": "nav_profile"
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useLanguage()

  const groupLabels: Record<string, string> = {
    Core: t("nav_group_core"),
    Transactions: t("nav_group_transactions"),
    Insights: t("nav_group_insights"),
    Account: t("nav_group_account"),
  }

  const groupedItems = useMemo(() => {
    return navigationItems.reduce<Record<string, typeof navigationItems>>((acc, item) => {
      if (!acc[item.group]) acc[item.group] = []
      acc[item.group].push(item)
      return acc
    }, {})
  }, [])

  return (
    <>
      <aside
        className={`glass-panel-strong fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-white/10 p-5 transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center justify-between md:shrink-0">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Smart Finance</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Cyber Vault</h1>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 md:hidden cursor-pointer"
            aria-label="Đóng thanh bên"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-5 md:flex-1 md:overflow-y-auto md:pr-1">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group}>
              <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.28em] text-slate-500">{groupLabels[group] ?? group}</p>
              <div className="space-y-2">
                {items.map((item) => {
                  const Icon = icons[item.icon]
                  const translationKey = navTranslationMap[item.path]
                  const labelText = translationKey ? t(translationKey) : item.label

                  return (
                    <NavLink key={item.path} to={item.path} end={item.path === "/"} onClick={onClose}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all cursor-pointer",
                          isActive
                            ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
                            : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white",
                        ].join(" ")
                      }
                    >
                      <Icon size={18} />
                      <span>{labelText}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">{t("nav_focus_title")}</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {t("nav_focus_desc")}
          </p>
        </div>
      </aside>
      {open ? <button type="button" className="fixed inset-0 z-30 bg-slate-950/70 md:hidden cursor-pointer" onClick={onClose} aria-label="Đóng lớp phủ" /> : null}
    </>
  )
}