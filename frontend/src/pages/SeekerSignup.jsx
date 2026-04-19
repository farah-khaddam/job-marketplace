import { useState } from "react"
import { useTranslation } from "react-i18next"
import EyeIcon from "../components/EyeIcon"
import LangToggle from "../components/LangToggle"
import { inputClass, labelClass, btnPrimary } from "../utils/styles"

export default function SeekerSignup() {
  const { t, i18n } = useTranslation()
  const textDir = i18n.language === "ar" ? "rtl" : "ltr"
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.fullName || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError(t("seeker_signup.error_required"))
      return
    }

    if (form.password !== form.confirmPassword) {
      setError(t("seeker_signup.error_password_match"))
      return
    }

    if (form.password.length < 8) {
      setError(t("seeker_signup.error_password_length"))
      return
    }

    setError("")
    console.log("SeekerSignup:", form)
    // هنا لاحقاً تربط مع Django API
  }

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      {/* زر اللغة */}
      <button
        onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
        className="absolute top-4 left-4 px-3 py-1 border rounded-lg text-sm"
      >
        {i18n.language === "ar" ? "EN" : "ع"}
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-10 w-[480px]" dir={textDir}>

        <h2 className="text-2xl font-medium text-gray-900 mb-4">
          {t("seeker_signup.title")}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* الاسم الكامل */}
          <div>
            <label className={labelClass}>
              {t("seeker_signup.full_name")}
            </label>
            <input
              type="text"
              required
              placeholder={t("seeker_signup.full_name_placeholder")}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className={labelClass}>
              {t("seeker_signup.email")}
            </label>
            <input
              type="email"
              required
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* رقم الهاتف */}
          <div>
            <label className={labelClass}>
              {t("seeker_signup.phone")}
            </label>
            <input
              type="tel"
              required
              placeholder="+966 5X XXX XXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
             className={inputClass}
            />
          </div>

          {/* كلمة المرور */}
          <div>
            <label className={labelClass}>
              {t("seeker_signup.password")}
            </label>
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

          {/* تأكيد كلمة المرور */}
          <div>
            <label className={labelClass}>
              {t("seeker_signup.confirm_password")}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${textDir === "rtl" ? "left-3" : "right-3"}`}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition mt-1"
          >
            {t("seeker_signup.submit")}
          </button>

        </form>
      </div>
    </div>
  )
}