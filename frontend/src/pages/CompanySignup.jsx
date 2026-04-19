import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import EyeIcon from "../components/EyeIcon"
import LangToggle from "../components/LangToggle"
import { inputClass, labelClass, btnPrimary } from "../utils/styles"

const SYRIAN_GOVERNORATES_AR = [
  "دمشق", "ريف دمشق", "حلب", "حمص", "حماة",
  "اللاذقية", "طرطوس", "دير الزور", "الرقة",
  "الحسكة", "درعا", "السويداء", "القنيطرة", "إدلب"
]

const SYRIAN_GOVERNORATES_EN = [
  "Damascus", "Rural Damascus", "Aleppo", "Homs", "Hama",
  "Latakia", "Tartus", "Deir ez-Zor", "Raqqa",
  "Al-Hasakah", "Daraa", "As-Suwayda", "Quneitra", "Idlib"
]

const SECTORS_AR = [
  "تقنية المعلومات", "الصحة", "التعليم", "المال والأعمال",
  "الهندسة", "التسويق والإعلام", "الضيافة والسياحة", "أخرى"
]

const SECTORS_EN = [
  "Information Technology", "Healthcare", "Education", "Finance & Business",
  "Engineering", "Marketing & Media", "Hospitality & Tourism", "Other"
]

export default function CompanySignup() {
  const { t, i18n } = useTranslation()
  const textDir = i18n.language === "ar" ? "rtl" : "ltr"
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    governorate: "",
    sector: "",
    website: "",
    description: "",
    password: "",
    confirmPassword: "",
  })

  const governorates = i18n.language === "ar" ? SYRIAN_GOVERNORATES_AR : SYRIAN_GOVERNORATES_EN
  const sectors = i18n.language === "ar" ? SECTORS_AR : SECTORS_EN

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      !form.companyName || !form.email || !form.phone ||
      !form.governorate || !form.sector ||
      !form.description || !form.password || !form.confirmPassword
    ) {
      setError(t("company_signup.error_required"))
      return
    }

    if (form.password !== form.confirmPassword) {
      setError(t("company_signup.error_password_match"))
      return
    }

    if (form.password.length < 8) {
      setError(t("company_signup.error_password_length"))
      return
    }

    setError("")
    console.log("CompanySignup:", form)
    // هنا لاحقاً تربط مع Django API
    // بعد التسجيل تحول لصفحة "طلبك قيد المراجعة"
    // navigate("/pending")
  }


  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1.5"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">

      <LangToggle />

      <div className="bg-white rounded-2xl shadow-xl p-10 w-[520px]" dir={textDir}>

        <h2 className="text-2xl font-medium text-gray-900 mb-6">
          {t("company_signup.title")}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* اسم الشركة */}
          <div>
            <label className={labelClass}>{t("company_signup.company_name")}</label>
            <input
              type="text"
              required
              placeholder={t("company_signup.company_name_placeholder")}
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* البريد الإلكتروني + رقم الهاتف */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>{t("company_signup.email")}</label>
              <input
                type="email"
                required
                placeholder="example@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>{t("company_signup.phone")}</label>
              <input
                type="tel"
                required
                placeholder="+963 9X XXX XXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* المحافظة + القطاع */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>{t("company_signup.governorate")}</label>
              <select
                required
                value={form.governorate}
                onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                className={inputClass}
              >
                <option value="">{t("company_signup.select")}</option>
                {governorates.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={labelClass}>{t("company_signup.sector")}</label>
              <select
                required
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                className={inputClass}
              >
                <option value="">{t("company_signup.select")}</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* الموقع الإلكتروني */}
          <div>
            <label className={labelClass}>
              {t("company_signup.website")}
              <span className="text-gray-400 font-normal mx-1">({t("company_signup.optional")})</span>
            </label>
            <input
              type="url"
              placeholder="https://www.company.com"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* وصف الشركة */}
          <div>
            <label className={labelClass}>{t("company_signup.description")}</label>
            <textarea
              required
              rows={3}
              placeholder={t("company_signup.description_placeholder")}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* كلمة المرور */}
          <div>
            <label className={labelClass}>{t("company_signup.password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition ${textDir === "rtl" ? "pr-4 pl-10" : "pl-4 pr-10"}`}
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
            <label className={labelClass}>{t("company_signup.confirm_password")}</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`w-full py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition ${textDir === "rtl" ? "pr-4 pl-10" : "pl-4 pr-10"}`}
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
            {t("company_signup.submit")}
          </button>

        </form>
      </div>
    </div>
  )
}