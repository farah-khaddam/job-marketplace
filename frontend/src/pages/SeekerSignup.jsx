import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import EyeIcon from "../components/EyeIcon"
import CountryCodeSelect from "../components/CountryCodeSelect"
import { inputClass, labelClass } from "../utils/styles"
import {
  sanitizeFullName,
  sanitizePhoneNumber,
  isEmailFormatValid,
  isPasswordLengthValid,
  doPasswordsMatch,
} from "../utils/validation"

const STEPS = {
  REGISTER: "register",
  OTP: "otp",
  SUCCESS: "success",
}


export default function SeekerSignup() {
  const { t, i18n } = useTranslation()
  const textDir = i18n.language === "ar" ? "rtl" : "ltr"

  const [step, setStep] = useState(STEPS.REGISTER)
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+963",
    password: "",
    confirmPassword: "",
  })

  // ─── OTP state ────────────────────────────────────────────────────────────
  const [otpValues, setOtpValues] = useState(Array(6).fill(""))
  const [otp, setOtp] = useState("")
  const [cooldown, setCooldown] = useState(60)
  const inputRefs = useRef([])

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
      if (next[idx]) {
        next[idx] = ""
      } else if (idx > 0) {
        next[idx - 1] = ""
        inputRefs.current[idx - 1]?.focus()
      }
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

  useEffect(() => {
    if (step !== STEPS.OTP || cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown, step])

 
  const resolveApiError = (data, fallbackKey) => {
    if (data?.error_code) {
      return t(`seeker_signup.${data.error_code}`)
    }
    return t(fallbackKey)
  }

  // ─── Field helpers ────────────────────────────────────────────────────────

  const updateFieldError = (field, message) => {
    setFieldErrors((current) => ({ ...current, [field]: message }))
  }

  const handleFullNameChange = (value) => {
    const sanitized = sanitizeFullName(value)
    setForm((prev) => ({ ...prev, fullName: sanitized }))
    setError("")
    updateFieldError(
      "fullName",
      value !== sanitized ? t("seeker_signup.error_full_name_invalid") : ""
    )
  }
  useEffect(() => {
  console.log("test resend:", t("seeker_signup.resend_code_in", { seconds: 30 }))
  console.log("test otp error:", t("seeker_signup.error_otp_invalid"))
}, [])

  const handlePhoneChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "")
    const sanitized = sanitizePhoneNumber(value)
    setForm((prev) => ({ ...prev, phone: sanitized }))
    setError("")
    updateFieldError(
      "phone",
      digitsOnly && (digitsOnly.length < 9 || digitsOnly.length > 10)
        ? t("seeker_signup.error_phone_length_range")
        : ""
    )
  }

  const handleEmailChange = (value) => {
    setForm((prev) => ({ ...prev, email: value }))
    setError("")
    updateFieldError(
      "email",
      value && !isEmailFormatValid(value)
        ? t("seeker_signup.error_email_format")
        : ""
    )
  }

  const handlePasswordChange = (value) => {
    setForm((prev) => ({ ...prev, password: value }))
    setError("")
    updateFieldError(
      "password",
      value && !isPasswordLengthValid(value)
        ? t("seeker_signup.error_password_length")
        : ""
    )
    updateFieldError(
      "confirmPassword",
      form.confirmPassword && !doPasswordsMatch(value, form.confirmPassword)
        ? t("seeker_signup.error_password_match")
        : ""
    )
  }

  const handleConfirmPasswordChange = (value) => {
    setForm((prev) => ({ ...prev, confirmPassword: value }))
    setError("")
    updateFieldError(
      "confirmPassword",
      value && !doPasswordsMatch(form.password, value)
        ? t("seeker_signup.error_password_match")
        : ""
    )
  }

  // ─── STEP 1: Submit registration ──────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.fullName || !form.email || !form.phoneCountryCode || !form.phone || !form.password || !form.confirmPassword) {
      setError(t("seeker_signup.error_required"))
      return
    }

    const hasFieldError = Object.values(fieldErrors).some(Boolean)
    if (hasFieldError) return

    setError("")
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/job-seeker/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          phone_number: `${form.phoneCountryCode}${form.phone}`,
          password: form.password,
          password_confirm: form.confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
      
        setError(resolveApiError(data, "seeker_signup.error_required"))
        return
      }

      setCooldown(60)
      setStep(STEPS.OTP)
    } catch {
      setError(t("seeker_signup.error_network"))
    } finally {
      setLoading(false)
    }
  }

  // ─── STEP 2: Verify OTP ───────────────────────────────────────────────────

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/job-seeker/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(resolveApiError(data, "seeker_signup.error_otp_invalid"))
        return
      }

      setStep(STEPS.SUCCESS)
    } catch {
      setError(t("seeker_signup.error_network"))
    } finally {
      setLoading(false)
    }
  }

  // ─── STEP 2: Resend OTP ───────────────────────────────────────────────────

  const handleResendOtp = async () => {
    if (cooldown > 0) return

    setError("")
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/job-seeker/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          phone_number: `${form.phoneCountryCode}${form.phone}`,
          password: form.password,
          password_confirm: form.confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(resolveApiError(data, "seeker_signup.error_network"))
        return
      }

      setCooldown(60)
      setError("")
    } catch {
      setError(t("seeker_signup.error_network"))
    } finally {
      setLoading(false)
    }
  }

  // ─── Language toggle ──────────────────────────────────────────────────────

  const langToggle = (
    <button
      onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
      className="absolute top-4 left-4 px-3 py-1 border rounded-lg text-sm"
    >
      {i18n.language === "ar" ? "EN" : "ع"}
    </button>
  )

  // ─── SUCCESS screen ───────────────────────────────────────────────────────

  if (step === STEPS.SUCCESS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {langToggle}
        <div className="bg-white rounded-2xl shadow-xl p-10 w-[480px] text-center" dir={textDir}>
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            {t("seeker_signup.success_title")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("seeker_signup.success_message")}
          </p>
          <a
            href="/login"
            className="w-full inline-block py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            {t("seeker_signup.go_to_login")}
          </a>
        </div>
      </div>
    )
  }

  // ─── OTP screen ───────────────────────────────────────────────────────────

  if (step === STEPS.OTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {langToggle}
        <div className="bg-white rounded-2xl shadow-xl p-10 w-[480px]" dir={textDir}>

          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            {t("seeker_signup.otp_title")}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {t("seeker_signup.otp_subtitle")}{" "}
            <span className="font-medium text-gray-800">{form.email}</span>
          </p>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">

            {/* ─── 6-box OTP input ─── */}
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
              {loading ? t("seeker_signup.verifying") : t("seeker_signup.verify")}
            </button>
          </form>

          <div className="flex justify-between mt-4 text-sm">
            <button
              onClick={handleResendOtp}
              disabled={loading || cooldown > 0}
              className="text-blue-600 hover:underline disabled:opacity-50"
            >
            
              {cooldown > 0
                ? t("seeker_signup.resend_code_in", { seconds: cooldown })
                : t("seeker_signup.resend_code")}
            </button>
            <button
              onClick={() => {
                setStep(STEPS.REGISTER)
                setError("")
                setOtpValues(Array(6).fill(""))
                setOtp("")
              }}
              className="text-gray-500 hover:underline"
            >
              {t("seeker_signup.back")}
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ─── REGISTER screen ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {langToggle}

      <div className="bg-white rounded-2xl shadow-xl p-10 w-[480px]" dir={textDir}>

        <h2 className="text-2xl font-medium text-gray-900 mb-4">
          {t("seeker_signup.title")}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* الاسم الكامل */}
          <div>
            <label className={labelClass}>{t("seeker_signup.full_name")}</label>
            <input
              type="text"
              required
              placeholder={t("seeker_signup.full_name_placeholder")}
              value={form.fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.fullName && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className={labelClass}>{t("seeker_signup.email")}</label>
            <input
              type="email"
              required
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* رقم الهاتف */}
          <div>
            <label className={labelClass}>{t("seeker_signup.phone")}</label>
            <div className="flex gap-2">
              <div className="w-40">
                <CountryCodeSelect
                  value={form.phoneCountryCode}
                  onChange={(v) => setForm((p) => ({ ...p, phoneCountryCode: v }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="tel"
                  required
                  placeholder="5X XXX XXXX"
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            {fieldErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          {/* كلمة المرور */}
          <div>
            <label className={labelClass}>{t("seeker_signup.password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={inputClass}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
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
            <label className={labelClass}>{t("seeker_signup.confirm_password")}</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={inputClass}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
              )}
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${textDir === "rtl" ? "left-3" : "right-3"}`}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition mt-1"
          >
            {loading ? t("seeker_signup.submitting") : t("seeker_signup.submit")}
          </button>

        </form>
      </div>
    </div>
  )
  
}
