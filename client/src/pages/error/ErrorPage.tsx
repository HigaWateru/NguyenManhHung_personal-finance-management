import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="glass-panel w-full max-w-2xl rounded-[2rem] p-8 text-center sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-rose-300/30 bg-rose-500/10 text-rose-200">
          <AlertTriangle size={28} />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.35em] text-rose-200/80">Lỗi điều hướng</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Không tìm thấy trang</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-300">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi. Vui lòng quay lại trang đăng nhập hoặc trang tổng quan.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Về trang đăng nhập
          </Link>

          <Link
            to="/"
            className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
          >
            Đến bảng điều khiển
          </Link>
        </div>
      </section>
    </div>
  );
}
