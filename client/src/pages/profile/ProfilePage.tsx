import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchProfile, updateProfile, uploadAvatar } from "../../redux/slides/authSlide";
import type { CurrencyCode } from "../../types/api";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("VND");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      void dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setTimezone(user.timezone || "Asia/Ho_Chi_Minh");
      setCurrencyCode(user.currencyCode || "VND");
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Kích thước ảnh không được vượt quá 2MB.");
      return;
    }

    setSuccessMsg(null);
    setFormError(null);

    try {
      await dispatch(uploadAvatar(file)).unwrap();
      setSuccessMsg("Cập nhật ảnh đại diện thành công!");
    } catch (err: any) {
      setFormError(err || "Không thể cập nhật ảnh đại diện.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setFormError(null);

    if (!fullName.trim()) {
      setFormError("Họ và tên không được để trống");
      return;
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      setFormError("Họ và tên phải từ 2 đến 100 ký tự");
      return;
    }

    try {
      await dispatch(updateProfile({ fullName: fullName.trim(), timezone, currencyCode })).unwrap();
      setSuccessMsg("Cập nhật hồ sơ thành công!");
    } catch (err: any) {
      setFormError(err || "Không thể cập nhật hồ sơ.");
    }
  };

  if (loading && !user) {
    return <section className="glass-panel rounded-3xl p-6 text-slate-200">Đang tải hồ sơ...</section>;
  }

  if (error && !user) return <section className="glass-panel rounded-3xl p-6 text-rose-200">{error}</section>;

  const commonTimezones = [
    { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh (GMT+7)" },
    { value: "UTC", label: "UTC (GMT+0)" },
    { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
    { value: "Europe/London", label: "Europe/London (GMT+0/+1)" },
    { value: "Europe/Paris", label: "Europe/Paris (GMT+1/+2)" },
    { value: "America/New_York", label: "America/New_York (GMT-5/-4)" },
    { value: "Australia/Sydney", label: "Australia/Sydney (GMT+10/+11)" }
  ];

  const timezonesToRender = [...commonTimezones];
  if (timezone && !commonTimezones.some(tz => tz.value === timezone)) {
    timezonesToRender.push({ value: timezone, label: `${timezone} (Custom)` });
  }

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

          {/* Avatar Section */}
          <div className="mt-6 flex flex-col items-center sm:flex-row sm:gap-6 border-b border-white/5 pb-6">
            <div className="relative group">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="h-24 w-24 rounded-3xl object-cover border border-white/20 shadow-lg group-hover:border-cyan-400/60 transition duration-300"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 text-3xl font-bold text-slate-950 shadow-lg group-hover:from-cyan-300 group-hover:to-blue-400 transition duration-300">
                  {user?.fullName?.trim().slice(0, 2).toUpperCase() || "SF"}
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 grid place-items-center rounded-3xl bg-slate-950/70 backdrop-blur-xs">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-0 text-center sm:text-left flex flex-col justify-center">
              <h5 className="font-medium text-white text-sm">Ảnh đại diện</h5>
              <p className="text-xs text-slate-400 mt-1 mb-3">Chấp nhận JPG, PNG hoặc GIF. Tối đa 2MB.</p>

              <label className="cursor-pointer inline-flex items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-200 hover:bg-cyan-400/20 transition duration-200">
                <span>Thay đổi ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
          </div>
          
          {successMsg && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {successMsg}
            </div>
          )}

          {formError && (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Họ và tên</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                placeholder="Nhập họ và tên"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Email</span>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Múi giờ</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60 [&>option]:bg-slate-800"
              >
                {timezonesToRender.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Đơn vị tiền</span>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60 [&>option]:bg-slate-800"
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>

            <div className="sm:col-span-2 mt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </div>
          </form>
        </article>

        <article className="glass-panel rounded-3xl p-5">
          <h4 className="text-lg font-semibold text-white">Phiên bảo mật</h4>
          <div className="mt-4 space-y-3">
            {[
              ["Thiết bị hiện tại", "Web Browser Session"],
              ["Lần cập nhật gần nhất", user?.updatedAt ? new Date(user.updatedAt).toLocaleString("vi-VN") : "-"],
              ["Refresh Token", "Đang hoạt động"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm text-slate-200">{value}</p>
              </div>
            ))}
          </div>

          <button type="button" 
            className="mt-4 w-full rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-400/20"
          >
            Thu hồi toàn bộ phiên đăng nhập
          </button>
        </article>
      </section>
    </section>
  );
}
