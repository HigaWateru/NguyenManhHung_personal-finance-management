import { useState } from "react"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound, ShieldCheck } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { authHighlights } from "../../utils/mockData"
import { validateRegisterForm, type RegisterFormErrors, type RegisterFormValues } from "../../utils/authValidation"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { clearAuthError, register } from "../../redux/slides/authSlide"

export default function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [values, setValues] = useState<RegisterFormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    dispatch(clearAuthError())

    const nextErrors = validateRegisterForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh"
    const result = await dispatch(register({
      fullName: values.name,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      timezone,
      currencyCode: "VND",
    }))

    if (register.fulfilled.match(result)) navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-2">
        <section className="order-2 flex items-center p-8 sm:p-10 lg:order-1">
          <div className="w-full">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Đăng ký</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Tạo tài khoản mới</h2>
              <p className="mt-2 text-sm text-slate-400">Khởi tạo không gian quản lý tài chính trong vài bước.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Họ và tên</span>
                <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${submitted && errors.name ? "border-rose-400/50" : "border-white/10"}`}>
                  <UserRound size={18} className="text-cyan-300/80" />
                  <input type="text" placeholder="Nguyễn Văn A"
                    value={values.name}
                    onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  />
                </div>
                <p className={`mt-2 text-xs ${submitted && errors.name ? "text-rose-300" : "text-slate-500"}`}>
                  {submitted && errors.name ? errors.name : "Tên hiển thị của bạn trên hệ thống."}
                </p>
              </label>

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
                  {submitted && errors.email ? errors.email : "Email được dùng để đăng nhập và nhận thông báo."}
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Mật khẩu</span>
                <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${submitted && errors.password ? "border-rose-400/50" : "border-white/10"}`}>
                  <LockKeyhole size={18} className="text-cyan-300/80" />
                  <input type={showPassword ? "text" : "password"} placeholder="Enter strong password"
                    value={values.password}
                    onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-slate-400 transition hover:text-cyan-200" aria-label="Hiển thị hoặc ẩn mật khẩu">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className={`mt-2 text-xs ${submitted && errors.password ? "text-rose-300" : "text-slate-500"}`}>
                  {submitted && errors.password ? errors.password : "Nên dùng ít nhất 8 ký tự, ưu tiên thêm số và ký tự đặc biệt."}
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Xác nhận mật khẩu</span>
                <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${submitted && errors.confirmPassword ? "border-rose-400/50" : "border-white/10"}`}>
                  <LockKeyhole size={18} className="text-cyan-300/80" />
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your password"
                    value={values.confirmPassword}
                    onChange={(event) => setValues((current) => ({ ...current, confirmPassword: event.target.value }))}
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="text-slate-400 transition hover:text-cyan-200" aria-label="Hiển thị hoặc ẩn xác nhận mật khẩu">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className={`mt-2 text-xs ${submitted && errors.confirmPassword ? "text-rose-300" : "text-slate-500"}`}>
                  {submitted && errors.confirmPassword ? errors.confirmPassword : "Vui lòng nhập lại đúng mật khẩu vừa tạo."}
                </p>
              </label>

              <button type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-300 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110"
              >
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                <ArrowRight size={18} />
              </button>

              {error && <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Đã có tài khoản? <Link to="/login" className="font-medium text-cyan-300 transition hover:text-cyan-200">Đăng nhập</Link>
            </p>
          </div>
        </section>

        <section className="order-1 relative flex flex-col justify-between overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 lg:order-2 lg:border-b-0 lg:border-l lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_34%)]" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Smart Finance</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold text-white sm:text-5xl">
              Bắt đầu hành trình quản lý tài chính thông minh.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Giao diện đăng ký được tối ưu cùng phong cách với trang đăng nhập, rõ ràng, dễ sử dụng và thân thiện trên mọi kích thước màn hình.
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
      </div>
    </div>
  )
}