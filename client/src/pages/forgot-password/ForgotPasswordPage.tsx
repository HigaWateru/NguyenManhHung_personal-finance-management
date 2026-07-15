import { useState } from "react"
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, LockKeyhole, ShieldCheck, Key } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { apiService } from "../../apis/service"
import { extractApiError } from "../../apis/http"
import { authHighlights } from "../../utils/mockData"

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Password Reset
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form fields
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Step 1: Send OTP
  const handleRequestOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    setSuccessMessage(null)

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Vui lòng nhập đúng định dạng email.")
      return
    }

    setLoading(true)
    try {
      const response = await apiService.forgotPassword({ email: email.trim() })
      setSuccessMessage(response.message || "Mã OTP đã được gửi đến email của bạn.")
      setStep(2)
      setSubmitted(false)
    } catch (err) {
      setError(extractApiError(err, "Gửi mã OTP thất bại. Vui lòng thử lại."))
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    setSuccessMessage(null)

    if (!otp.trim() || !/^\d{6}$/.test(otp)) {
      setError("Mã OTP phải gồm 6 chữ số.")
      return
    }

    setLoading(true)
    try {
      const response = await apiService.verifyOtp({ email: email.trim(), otp: otp.trim() })
      setSuccessMessage(response.message || "Xác thực OTP thành công.")
      setStep(3)
      setSubmitted(false)
    } catch (err) {
      setError(extractApiError(err, "Xác thực OTP thất bại. Vui lòng nhập lại."))
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    setSuccessMessage(null)

    if (!password.trim() || password.length < 8) {
      setError("Mật khẩu mới phải có tối thiểu 8 ký tự.")
      return
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,100}$/
    if (!regex.test(password)) {
      setError("Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt.")
      return
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    setLoading(true)
    try {
      const response = await apiService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        password: password,
        confirmPassword: confirmPassword,
      })
      setSuccessMessage(response.message || "Đặt lại mật khẩu thành công.")
      setTimeout(() => {
        navigate("/login")
      }, 2500)
    } catch (err) {
      setError(extractApiError(err, "Đặt lại mật khẩu thất bại. Vui lòng thử lại."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-2">
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_32%)]" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Smart Finance</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold text-white sm:text-5xl">
              Khôi phục mật khẩu tài khoản của bạn.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Hệ thống xác thực mã bảo mật 6 chữ số (OTP) gửi trực tiếp qua Email của bạn trước khi thiết lập lại mật khẩu mới.
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
            {/* Step 1: Request OTP */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Khôi phục</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Quên mật khẩu</h2>
                  <p className="mt-2 text-sm text-slate-400">Nhập email tài khoản của bạn để nhận mã OTP.</p>
                </div>

                <form className="space-y-4" onSubmit={handleRequestOtp} noValidate>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Email</span>
                    <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${submitted && error ? "border-rose-400/50" : "border-white/10"}`}>
                      <Mail size={18} className="text-cyan-300/80" />
                      <input type="email" placeholder="yourname@example.com" value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </label>

                  {error && <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-300 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110"
                  >
                    {loading ? "Đang gửi..." : "Gửi mã OTP"}
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Verify OTP */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Khôi phục</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Xác thực OTP</h2>
                  <p className="mt-2 text-sm text-slate-400">Một mã bảo mật 6 chữ số đã được gửi tới <strong>{email}</strong>.</p>
                </div>

                <form className="space-y-4" onSubmit={handleVerifyOtp} noValidate>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Mã OTP</span>
                    <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${submitted && error ? "border-rose-400/50" : "border-white/10"}`}>
                      <Key size={18} className="text-cyan-300/80" />
                      <input type="text" maxLength={6} placeholder="Nhập 6 chữ số" value={otp}
                        onChange={(event) => setOtp(event.target.value)}
                        className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 tracking-[0.2em] font-semibold"
                      />
                    </div>
                  </label>

                  {error && <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
                  {successMessage && <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{successMessage}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                    >
                      <ArrowLeft size={18} />
                      Quay lại
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-300 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110"
                    >
                      {loading ? "Đang xác thực..." : "Xác nhận OTP"}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <div>
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Thiết lập</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Mật khẩu mới</h2>
                  <p className="mt-2 text-sm text-slate-400">Nhập mật khẩu mới an toàn cho tài khoản của bạn.</p>
                </div>

                <form className="space-y-4" onSubmit={handleResetPassword} noValidate>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Mật khẩu mới</span>
                    <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${submitted && error ? "border-rose-400/50" : "border-white/10"}`}>
                      <LockKeyhole size={18} className="text-cyan-300/80" />
                      <input type={showPassword ? "text" : "password"} placeholder="Tối thiểu 8 ký tự" value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      />
                      <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-slate-400 transition hover:text-cyan-200" aria-label="Hiển thị hoặc ẩn mật khẩu">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Xác nhận mật khẩu mới</span>
                    <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${submitted && error ? "border-rose-400/50" : "border-white/10"}`}>
                      <LockKeyhole size={18} className="text-cyan-300/80" />
                      <input type={showPassword ? "text" : "password"} placeholder="Nhập lại mật khẩu mới" value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </label>

                  {error && <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
                  {successMessage && <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{successMessage}</p>}

                  <button type="submit" disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-300 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110"
                  >
                    {loading ? "Đang cập nhật..." : "Đổi mật khẩu & Đăng nhập"}
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-slate-400">
              Nhớ mật khẩu? <Link to="/login" className="font-medium text-cyan-300 transition hover:text-cyan-200">Đăng nhập</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
