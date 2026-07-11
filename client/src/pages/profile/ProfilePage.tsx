export default function ProfilePage() {
  return (
    <section className="space-y-6">
      <header className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Tài khoản</p>
        <h3 className="mt-3 text-3xl font-semibold text-white">Hồ sơ và bảo mật</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Module quản lý User Profile và Security Session theo đúng scope: thông tin cá nhân, avatar, đổi mật khẩu, quản lý phiên đăng nhập.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <article className="glass-panel rounded-3xl p-5">
          <h4 className="text-lg font-semibold text-white">Thông tin cá nhân</h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ["Họ và tên", "Alex Morgan"],
              ["Email", "alex.morgan@example.com"],
              ["Múi giờ", "Asia/Ho_Chi_Minh"],
              ["Đơn vị tiền", "USD"],
            ].map(([label, value]) => (
              <label key={label} className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{label}</span>
                <input
                  defaultValue={value}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-400/25"
            >
              Lưu hồ sơ
            </button>
          </div>
        </article>

        <article className="glass-panel rounded-3xl p-5">
          <h4 className="text-lg font-semibold text-white">Phiên bảo mật</h4>
          <div className="mt-4 space-y-3">
            {[
              ["Thiết bị hiện tại", "Windows 11 · Chrome 138"],
              ["Lần đăng nhập gần nhất", "2026-07-12 09:34"],
              ["Refresh Token", "Đang hoạt động"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm text-slate-200">{value}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-400/20"
          >
            Thu hồi toàn bộ phiên đăng nhập
          </button>
        </article>
      </section>
    </section>
  );
}
