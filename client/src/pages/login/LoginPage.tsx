import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail, LockKeyhole, ShieldCheck } from "lucide-react";
import { authHighlights } from "../../utils/mockData";
import { Link, useNavigate } from "react-router-dom";
import { validateLoginForm, type LoginFormErrors, type LoginFormValues } from "../../utils/authValidation";
import { saveAccessToken } from "../../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // Demo flow: set local token and continue to protected routes.
    saveAccessToken(`demo-token-${Date.now()}`);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-2">
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_32%)]" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Smart Finance</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold text-white sm:text-5xl">
              Đăng nhập để quản lý tài chính cá nhân.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Giao diện đăng nhập theo phong cách Cyber Finance Dashboard, tối ưu cho desktop và mobile.
            </p>
          </div>

          <div className="relative z-10 mt-10 grid gap-3">
            {authHighlights.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <ShieldCheck size={18} className="text-cyan-300" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center p-8 sm:p-10">
          <div className="w-full">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Đăng nhập</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Chào mừng bạn trở lại</h2>
              <p className="mt-2 text-sm text-slate-400">Nhập email và mật khẩu để tiếp tục.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${submitted && errors.email ? "border-rose-400/50" : "border-white/10"}`}>
                  <Mail size={18} className="text-cyan-300/80" />
                  <input
                    type="email"
                    placeholder="yourname@example.com"
                    value={values.email}
                    onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  />
                </div>
                <p className={`mt-2 text-xs ${submitted && errors.email ? "text-rose-300" : "text-slate-500"}`}>
                  {submitted && errors.email ? errors.email : "Vui lòng nhập đúng định dạng email."}
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Mật khẩu</span>
                <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${submitted && errors.password ? "border-rose-400/50" : "border-white/10"}`}>
                  <LockKeyhole size={18} className="text-cyan-300/80" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-slate-400 transition hover:text-cyan-200" aria-label="Hiển thị hoặc ẩn mật khẩu">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className={`mt-2 text-xs ${submitted && errors.password ? "text-rose-300" : "text-slate-500"}`}>
                  {submitted && errors.password ? errors.password : "Mật khẩu cần tối thiểu 8 ký tự."}
                </p>
              </label>

              <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.rememberMe}
                    onChange={(event) => setValues((current) => ({ ...current, rememberMe: event.target.checked }))}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <button type="button" className="text-cyan-300 transition hover:text-cyan-200">Quên mật khẩu?</button>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-300 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110"
              >
                Đăng nhập
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Chưa có tài khoản? <Link to="/register" className="font-medium text-cyan-300 transition hover:text-cyan-200">Đăng ký ngay</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}