import { useMemo, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import Footer from "./Footer"

const titles: Record<string, string> = {
  "/": "Tổng quan tài chính",
  "/income": "Quản lý thu nhập",
  "/expense": "Quản lý chi tiêu",
  "/category": "Quản lý danh mục",
  "/statistics": "Thống kê tài chính",
  "/profile": "Hồ sơ và bảo mật",
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  const pageTitle = useMemo(() => titles[pathname] ?? "Smart Finance", [pathname])

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-slate-100 md:grid md:h-screen md:grid-cols-[18rem_minmax(0,1fr)] md:overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 flex min-h-screen flex-col md:h-screen md:border-l md:border-white/10 md:bg-slate-950/30 md:overflow-hidden">
        <Header title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 md:overflow-y-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}