import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import EyeIcon from "../components/EyeIcon"
import CountryCodeSelect from "../components/CountryCodeSelect"
import { sanitizePhoneNumber } from "../utils/validation"
import LangToggle from "../components/LangToggle"
import { inputClass, labelClass } from "../utils/styles"

const API_BASE = "http://127.0.0.1:8000"



// ترجمة محلية للـ choices — لأن الـ API بيرجع إنجليزي بس
const GOVERNORATE_AR = {
  damascus:       'دمشق',
  rural_damascus: 'ريف دمشق',
  aleppo:         'حلب',
  homs:           'حمص',
  hama:           'حماة',
  latakia:        'اللاذقية',
  tartus:         'طرطوس',
  deir_ezzor:     'دير الزور',
  raqqa:          'الرقة',
  hasakah:        'الحسكة',
  daraa:          'درعا',
  suwayda:        'السويداء',
  quneitra:       'القنيطرة',
  idlib:          'إدلب',
}

const COMPANY_TYPE_AR = {
  programming: 'تقنية المعلومات',
  civil:       'هندسة مدنية',
  healthcare:  'الصحة',
  education:   'التعليم',
  finance:     'المال والأعمال',
  marketing:   'التسويق والإعلام',
  hospitality: 'الضيافة والسياحة',
  other:       'أخرى',
}

export default function CompanySignup() {
  const { t, i18n } = useTranslation()
  const textDir = i18n.language === "ar" ? "rtl" : "ltr"
  const isAr = i18n.language === "ar"
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [governorates, setGovernorates] = useState([])
  const [companyTypes, setCompanyTypes] = useState([])
  const [choicesLoading, setChoicesLoading] = useState(true)

  // جلب الـ choices من الـ API عند تحميل الصفحة
  useEffect(() => {
    fetch(`${API_BASE}/api/choices/`)
      .then((r) => r.json())
      .then((data) => {
        setGovernorates(data.governorates || [])
        setCompanyTypes(data.company_types || [])
      })
      .catch(() => {}) // لو فشل نحتفظ بقوائم فاضية
      .finally(() => setChoicesLoading(false))
  }, [])
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+963",
    governorate: "",
    companyType: "",
    website: "",
    description: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }))
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation محلي
    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: t("company_signup.error_password_match") })
      return
    }
    if (form.password.length < 6) {
      setFieldErrors({ password: t("company_signup.error_password_length") })
      return
    }

    setError("")
    setFieldErrors({})
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/company/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name:     form.companyName,
          email:            form.email,
          phone_number:     `${form.phoneCountryCode}${form.phone}`,
          governorate:      form.governorate,
          company_type:     form.companyType,
          website_url:      form.website || undefined,
          description:      form.description,
          password:         form.password,
          password_confirm: form.confirmPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // بعد التسجيل الناجح ← صفحة "طلبك قيد المراجعة"
        navigate("/pending")
      } else {
        // نعرض أخطاء كل حقل من السيرفر
        const apiFieldMap = {
          company_name:     "companyName",
          phone_number:     "phone",
          governorate:      "governorate",
          company_type:     "companyType",
          website_url:      "website",
          description:      "description",
          password:         "password",
          password_confirm: "confirmPassword",
        }
        const newFieldErrors = {}
        let generalError = ""

        Object.entries(data).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val[0] : val
          const formKey = apiFieldMap[key]
          if (formKey) newFieldErrors[formKey] = msg
          else generalError = msg
        })

        setFieldErrors(newFieldErrors)
        if (generalError) setError(generalError)
      }
    } catch {
      setError(t("company_signup.error_network"))
    } finally {
      setLoading(false)
    }
  }

  const pwInputClass = (dir) =>
    `w-full py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition ${dir === "rtl" ? "pr-4 pl-10" : "pl-4 pr-10"}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <LangToggle />

      <div className="bg-white rounded-2xl shadow-xl p-10 w-[520px]" dir={textDir}>
        <h2 className="text-2xl font-medium text-gray-900 mb-6 text-center">
          {t("company_signup.title")}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* اسم الشركة */}
          <div>
            <label className={labelClass} style={{textAlign: "start", display: "block"}}>{t("company_signup.company_name")}</label>
            <input
              type="text" required
              placeholder={t("company_signup.company_name_placeholder")}
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              className={`${inputClass} ${fieldErrors.companyName ? "border-red-400" : ""}`}
            />
            {fieldErrors.companyName && <p className="text-red-500 text-xs mt-1">{fieldErrors.companyName}</p>}
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className={labelClass} style={{textAlign: "start", display: "block"}}>{t("company_signup.email")}</label>
            <input
              type="email" required
              placeholder="example@company.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`${inputClass} ${fieldErrors.email ? "border-red-400" : ""}`}
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          {/* رقم الهاتف */}
          <div>
            <label className={labelClass} style={{textAlign: "start", display: "block"}}>{t("company_signup.phone")}</label>
            <div className="flex gap-2">
              <div className="w-44 flex-shrink-0">
                <CountryCodeSelect
                  value={form.phoneCountryCode}
                  onChange={(v) => handleChange("phoneCountryCode", v)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                />
              </div>
              <input
                type="tel" required
                placeholder="9X XXX XXXX"
                value={form.phone}
                onChange={(e) => handleChange("phone", sanitizePhoneNumber(e.target.value))}
                className={`flex-1 ${inputClass} ${fieldErrors.phone ? "border-red-400" : ""}`}
              />
            </div>
            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>

          {/* المحافظة + نوع الشركة */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass} style={{textAlign: "start", display: "block"}}>{t("company_signup.governorate")}</label>
              <select
                required
                value={form.governorate}
                onChange={(e) => handleChange("governorate", e.target.value)}
                className={`${inputClass} ${fieldErrors.governorate ? "border-red-400" : ""}`}
              >
                <option value="">{t("company_signup.select")}</option>
                {governorates.map((g) => (
                  <option key={g.value} value={g.value}>
                    {isAr ? (GOVERNORATE_AR[g.value] || g.label) : g.label}
                  </option>
                ))}
              </select>
              {fieldErrors.governorate && <p className="text-red-500 text-xs mt-1">{fieldErrors.governorate}</p>}
            </div>
            <div className="flex-1">
              <label className={labelClass} style={{textAlign: "start", display: "block"}}>{t("company_signup.sector")}</label>
              <select
                required
                value={form.companyType}
                onChange={(e) => handleChange("companyType", e.target.value)}
                className={`${inputClass} ${fieldErrors.companyType ? "border-red-400" : ""}`}
              >
                <option value="">{t("company_signup.select")}</option>
                {companyTypes.map((s) => (
                  <option key={s.value} value={s.value}>
                    {isAr ? (COMPANY_TYPE_AR[s.value] || s.label) : s.label}
                  </option>
                ))}
              </select>
              {fieldErrors.companyType && <p className="text-red-500 text-xs mt-1">{fieldErrors.companyType}</p>}
            </div>
          </div>

          {/* الموقع الإلكتروني */}
          <div>
            <label className={labelClass} style={{textAlign: "start", display: "block"}}>
              {t("company_signup.website")}
              <span className="text-gray-400 font-normal mx-1">({t("company_signup.optional")})</span>
            </label>
            <input
              type="url"
              placeholder="https://www.company.com"
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* وصف الشركة */}
          <div>
            <label className={labelClass} style={{textAlign: "start", display: "block"}}>{t("company_signup.description")}</label>
            <textarea
              required rows={3}
              placeholder={t("company_signup.description_placeholder")}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`${inputClass} resize-none ${fieldErrors.description ? "border-red-400" : ""}`}
            />
            {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
          </div>

          {/* كلمة المرور */}
          <div>
            <label className={labelClass} style={{textAlign: "start", display: "block"}}>{t("company_signup.password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`${pwInputClass(textDir)} ${fieldErrors.password ? "border-red-400" : ""}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${textDir === "rtl" ? "left-3" : "right-3"}`}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <label className={labelClass} style={{textAlign: "start", display: "block"}}>{t("company_signup.confirm_password")}</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"} required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className={`${pwInputClass(textDir)} ${fieldErrors.confirmPassword ? "border-red-400" : ""}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${textDir === "rtl" ? "left-3" : "right-3"}`}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          {/* General Error */}
          {error && <p className="text-red-500 text-xs">{error}</p>}

          {/* Submit */}
          <button
            type="submit" disabled={loading || choicesLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition mt-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                {t("company_signup.submitting")}
              </>
            ) : t("company_signup.submit")}
          </button>

        </form>
      </div>
    </div>
  )
}
