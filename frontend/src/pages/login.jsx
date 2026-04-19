import { useState } from "react"
import { Link } from "react-router-dom"
import EyeIcon from "../components/EyeIcon"
import LangToggle from "../components/LangToggle"
import { inputClass, labelClass, btnPrimary } from "../utils/styles"
import { useTranslation } from "react-i18next"



export default function Login() {
  const { t, i18n } = useTranslation()
  const textDir = i18n.language === "ar" ? "rtl" : "ltr"
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      setError(t("login.error_required"))
      return
    }

    setError("")
    console.log("Login:", { ...form })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LangToggle />
     
      <div className="w-[900px] h-[520px] flex-wrap bg-white rounded-2xl shadow-xl overflow-hidden flex">

        {/* ===== Left Side ===== */}
        <div className="hidden md:flex w-[45%] bg-gradient-to-br from-blue-900 to-blue-500 flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute w-56 h-56 rounded-full border border-white/10 -top-14 -right-14" />
          <div className="absolute w-40 h-40 rounded-full border border-white/10 -bottom-10 -left-12" />

          <span className="text-white text-2xl font-medium">
            <span className="text-blue-200">{t("hero.brand")}</span>
          </span>

          <p className="text-white text-2xl font-medium leading-relaxed">
            {t("hero.tagline_1")} <br />
            <span className="text-blue-200">{t("hero.tagline_2")}</span>
          </p>

          <div className="flex gap-8">
            <div className="text-white/80">
              <strong className="block text-lg text-white">+500</strong>
              <small className="text-xs opacity-70">{t("hero.companies")}</small>
            </div>
            <div className="text-white/80">
              <strong className="block text-lg text-white">+2K</strong>
              <small className="text-xs opacity-70">{t("hero.jobs")}</small>
            </div>
          </div>
        </div>

        {/* ===== Right Side ===== */}
        <div className="w-full md:w-[55%] flex flex-col justify-center px-10 py-12 " dir={textDir} > 
          <h2 className="text-2xl font-medium text-gray-900 mb-1"> {t("login.title")}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {t("login.no_account")}{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              {t("login.register")}
            </Link>
          </p>


          <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
            <div>
              <div className="flex justify-between items-center mb-1.5">
              <label className={labelClass}>
               {t("login.email")}
              </label>
              </div>
              <input
                type="email"
                required
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={labelClass}>
                  {t("login.password")}
                </label>
                <a href="#" className="text-xs text-blue-600 hover:underline">
                 {t("login.forgot")}
                </a>
              </div>
             <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${textDir === "rtl" ? "left-3" : "right-3"}`}
                >
                 <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={btnPrimary}
            >
             {t("login.submit")}
            </button>
          </form>
          {error && (
                <p className="text-red-500 text-xs mt-2">{error}</p>
              )}

          <div className="flex items-center gap-3 my-4 text-xs text-gray-400">
            <span className="flex-1 h-px bg-gray-200" />
            أو
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
            {t("login.continue_google")}
          </button>
        </div>

      </div>
    </div>
  )
}