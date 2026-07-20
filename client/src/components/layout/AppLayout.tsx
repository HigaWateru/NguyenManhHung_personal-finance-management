import { useMemo, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import Footer from "./Footer"
import { useLanguage } from "../../context/LanguageContext"

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const { t } = useLanguage()

  const pageTitle = useMemo(() => {
    switch (pathname) {
      case "/": return t("nav_dashboard")
      case "/income": return t("inc_page_title")
      case "/expense": return t("exp_page_title")
      case "/category":
      case "/categories": return t("cat_page_title")
      case "/statistics": return t("stat_page_title")
      case "/exchange-rate": return t("rate_hero_title")
      case "/profile": return t("prof_page_title")
      default: return "Smart Finance"
    }
  }, [pathname, t])

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-slate-100 md:grid md:h-screen md:grid-cols-[18rem_minmax(0,1fr)] md:overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex min-h-screen flex-col md:h-screen md:border-l md:border-white/10 md:bg-slate-950/30 md:overflow-hidden">
        <Header title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 md:overflow-y-auto"><Outlet /></main>
        <Footer />
      </div>
    </div>
  )
}