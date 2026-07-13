import { Menu, Search, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/slides/authSlide";

type HeaderProps = {
  title: string;
  onMenuClick: () => void;
};

export default function Header({ title, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="flex justify-between items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
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
          <input
            type="text"
            placeholder="Tìm giao dịch, danh mục, thống kê..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <button
          type="button"
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100"
          aria-label="Thông báo"
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 sm:block"
        >
          Đăng xuất
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-semibold text-slate-950">
            {(user?.fullName?.trim().slice(0, 2).toUpperCase() || "SF")}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.fullName || "Smart Finance"}</p>
            <p className="text-xs text-slate-400">{user?.email || "Tài khoản người dùng"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}