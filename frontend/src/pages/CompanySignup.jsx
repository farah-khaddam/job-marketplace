import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import EyeIcon from "../components/EyeIcon"
import CountryCodeSelect from "../components/CountryCodeSelect"
import { sanitizePhoneNumber } from "../utils/validation"
import LangToggle from "../components/LangToggle"
import { inputClass, labelClass } from "../utils/styles"

const API_BASE = "http://127.0.0.1:8000"

// ─── Steps (نفس pattern الـ JobSeeker) ────────────────────────────────────
const STEPS = {
  REGISTER: "register",
  OTP: "otp",
  SUCCESS: "success",
}

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

  // ─── Step state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(STEPS.REGISTER)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [governorates, setGovernorates] = useState([])
  const [companyTypes, setCompanyTypes] = useState([])
  const [choicesLoading, setChoicesLoading] = useState(true)

  // ─── OTP state (نفس الـ JobSeeker) ────────────────────────────────────────
  const [otpValues, setOtpValues] = useState(Array(6).fill(""))
  const [otp, setOtp] = useState("")
  const [cooldown, setCooldown] = useState(60)
  const inputRefs = useRef([])

  // جلب الـ choices من الـ API عند تحميل الصفحة
  useEffect(() => {
    fetch(`${API_BASE}/api/choices/`)
      .then((r) => r.json())
      .then((data) => {
        setGovernorates(data.governorates || [])
        setCompanyTypes(data.company_types || [])
      })
      .catch(() => {})
      .finally(() => setChoicesLoading(false))
  }, [])

  // ─── Cooldown timer (نفس الـ JobSeeker) ───────────────────────────────────
  useEffect(() => {
    if (step !== STEPS.OTP || cooldown <= 0) return
    const timer = setInterval(() => setCooldown((p) => p - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown, step])

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

  // ─── OTP handlers (نفس الـ JobSeeker بالضبط) ──────────────────────────────
  const handleOtpChange = (val, idx) => {
    const digit = val.replace(/\D/g, "").slice(-1)
    const next = [...otpValues]
    next[idx] = digit
    setOtpValues(next)
    setOtp(next.join(""))
    setError("")
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const next = [...otpValues]
      if (next[idx]) { next[idx] = "" }
      else if (idx > 0) { next[idx - 1] = ""; inputRefs.current[idx - 1]?.focus() }
      setOtpValues(next)
      setOtp(next.join(""))
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = Array(6).fill("")
    paste.split("").forEach((ch, i) => { next[i] = ch })
    setOtpValues(next)
    setOtp(next.join(""))
    inputRefs.current[Math.min(paste.length, 5)]?.focus()
  }

  const resolveApiError = (data, fallbackKey) =>
    data?.error_code ? t(`company_signup.${data.error_code}`) : t(fallbackKey)

  // ─── STEP 1: Submit registration ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

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
        // ← بدل ما نروح على /otp route خارجي، نبقى في نفس الصفحة
        setCooldown(60)
        setStep(STEPS.OTP)
      } else {
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

  // ─── STEP 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/company/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(resolveApiError(data, "company_signup.error_otp_invalid")); return }
      navigate("/company/pending")
    } catch {
      setError(t("company_signup.error_network"))
    } finally {
      setLoading(false)
    }
  }

  // ─── STEP 2: Resend OTP ────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (cooldown > 0) return
    setError("")
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
      if (!res.ok) { setError(resolveApiError(data, "company_signup.error_network")); return }
      setCooldown(60)
    } catch {
      setError(t("company_signup.error_network"))
    } finally {
      setLoading(false)
    }
  }

  const langToggle = (
    <button
      onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
      className="absolute top-4 left-4 px-3 py-1 border rounded-lg text-sm"
    >
      {i18n.language === "ar" ? "EN" : "ع"}
    </button>
  )

  const pwInputClass = (dir) =>
    `w-full py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition ${dir === "rtl" ? "pr-4 pl-10" : "pl-4 pr-10"}`

  // ─── SUCCESS ───────────────────────────────────────────────────────────────
  if (step === STEPS.SUCCESS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {langToggle}
        <div className="bg-white rounded-2xl shadow-xl p-10 w-[480px] text-center" dir={textDir}>
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">{t("company_signup.success_title")}</h2>
          <p className="text-gray-500 text-sm mb-6">{t("company_signup.success_message")}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            {t("company_signup.go_to_login")}
          </button>
        </div>
      </div>
    )
  }

  // ─── OTP ───────────────────────────────────────────────────────────────────
  if (step === STEPS.OTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {langToggle}
        <div className="bg-white rounded-2xl shadow-xl p-10 w-[480px]" dir={textDir}>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">{t("company_signup.otp_title")}</h2>
          <p className="text-gray-500 text-sm mb-6">
            {t("company_signup.otp_subtitle")}{" "}
            <span className="font-medium text-gray-800">{form.email}</span>
          </p>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex gap-2 justify-center" dir="ltr">
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  onPaste={handleOtpPaste}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-14 text-center text-xl font-medium border border-gray-200 rounded-lg bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              {loading ? t("company_signup.verifying") : t("company_signup.verify")}
            </button>
          </form>

          <div className="flex justify-between mt-4 text-sm">
            <button
              onClick={handleResendOtp}
              disabled={loading || cooldown > 0}
              className="text-blue-600 hover:underline disabled:opacity-50"
            >
              {cooldown > 0
                ? t("company_signup.resend_code_in", { seconds: cooldown })
                : t("company_signup.resend_code")}
            </button>
            <button
              onClick={() => { setStep(STEPS.REGISTER); setError(""); setOtpValues(Array(6).fill("")); setOtp("") }}
              className="text-gray-500 hover:underline"
            >
              {t("company_signup.back")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── REGISTER ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      {langToggle}

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
                placeholder="XX XXX XXXX"
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

          {error && <p className="text-red-500 text-xs">{error}</p>}

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
