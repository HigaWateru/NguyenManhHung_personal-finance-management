import { useState } from "react"
import { ArrowRight, Eye, EyeOff, Mail, LockKeyhole, ShieldCheck } from "lucide-react"
import { authHighlights } from "../../utils/mockData"
import { Link, useNavigate } from "react-router-dom"
import { validateLoginForm, type LoginFormErrors, type LoginFormValues } from "../../utils/authValidation"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { clearAuthError, login } from "../../redux/slides/authSlide"

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    dispatch(clearAuthError())

    const nextErrors = validateLoginForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    const result = await dispatch(login({ email: values.email, password: values.password }))
    if (login.fulfilled.match(result)) navigate("/", { replace: true })
  }

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
                  <input type="email" placeholder="yourname@example.com" value={values.email}
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
                  <input type={showPassword ? "text" : "password"} placeholder="Enter your password"
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
                  <input type="checkbox" checked={values.rememberMe}
                    onChange={(event) => setValues((current) => ({ ...current, rememberMe: event.target.checked }))}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <Link to="/forgot-password" className="text-cyan-300 transition hover:text-cyan-200">Quên mật khẩu?</Link>
              </div>

              {error && <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

              <button type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-300 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950/70 px-2 text-slate-400">Hoặc đăng nhập bằng</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <a
                href="http://localhost:8080/oauth2/authorization/google"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Google
              </a>
              <a
                href="http://localhost:8080/oauth2/authorization/github"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </a>
            </div>

            <p className="mt-6 text-center text-sm text-slate-400">
              Chưa có tài khoản? <Link to="/register" className="font-medium text-cyan-300 transition hover:text-cyan-200">Đăng ký ngay</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}