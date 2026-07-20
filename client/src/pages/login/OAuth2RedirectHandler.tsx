import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAppDispatch } from "../../redux/hooks"
import { fetchProfile } from "../../redux/slides/authSlide"
import { saveAuthTokens } from "../../utils/auth"

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const token = searchParams.get("token")
    const refreshToken = searchParams.get("refreshToken")

    if (token && refreshToken) {
      saveAuthTokens(token, refreshToken)
      void dispatch(fetchProfile())
        .unwrap()
        .then(() => {
          navigate("/", { replace: true })
        })
        .catch(() => {
          navigate("/login", { replace: true })
        })
    } else navigate("/login", { replace: true })
  }, [searchParams, dispatch, navigate])

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-sm text-cyan-300">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        <p>Đang đồng bộ hóa phiên đăng nhập...</p>
      </div>
    </div>
  )
}
