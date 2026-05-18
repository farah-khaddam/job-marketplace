import { useState } from "react"
import { useTranslation } from "react-i18next"
import EyeIcon from "../components/EyeIcon"
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
    password: "",
    confirmPassword: "",
  })

  const [otp, setOtp] = useState("")

  // ─── Field helpers (unchanged) ───────────────────────────────────────────

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

  // ─── STEP 1: Submit registration ─────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.fullName || !form.email || !form.phone || !form.password || !form.confirmPassword) {
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
          phone_number: form.phone,
          password: form.password,
          password_confirm: form.confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Show the first error Django returns
        const firstKey = Object.keys(data)[0]
        const firstMsg = data[firstKey]
        setError(Array.isArray(firstMsg) ? firstMsg[0] : firstMsg)
        return
      }

      // Success → go to OTP step
      setStep(STEPS.OTP)
    } catch {
      setError(t("seeker_signup.error_network") || "Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ─── STEP 2: Verify OTP ──────────────────────────────────────────────────

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
        setError(data.error || t("seeker_signup.error_otp_invalid") || "Invalid code.")
        return
      }

      setStep(STEPS.SUCCESS)
    } catch {
      setError(t("seeker_signup.error_network") || "Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ─── STEP 2: Resend OTP ──────────────────────────────────────────────────

  const handleResendOtp = async () => {
    setError("")
    setLoading(true)

    try {
      await fetch("http://127.0.0.1:8000/api/auth/job-seeker/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          phone_number: form.phone,
          password: form.password,
          password_confirm: form.confirmPassword,
        }),
      })
    } catch {
      setError(t("seeker_signup.error_network") || "Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ─── Language toggle ─────────────────────────────────────────────────────

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
            {t("seeker_signup.success_title") || "Account Created!"}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("seeker_signup.success_message") || "Your email has been verified. You can now log in."}
          </p>
          <a
            href="/login"
            className="w-full inline-block py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            {t("seeker_signup.go_to_login") || "Go to Login"}
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
            {t("seeker_signup.otp_title") || "Verify your email"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {t("seeker_signup.otp_subtitle") || "We sent a 6-digit code to"}{" "}
            <span className="font-medium text-gray-800">{form.email}</span>
          </p>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>
                {t("seeker_signup.otp_label") || "Verification Code"}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="______"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""))
                  setError("")
                }}
                className={inputClass}
                required
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              {loading
                ? t("seeker_signup.verifying") || "Verifying..."
                : t("seeker_signup.verify") || "Verify"}
            </button>
          </form>

          <div className="flex justify-between mt-4 text-sm">
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-blue-600 hover:underline disabled:opacity-50"
            >
              {t("seeker_signup.resend_code") || "Resend Code"}
            </button>
            <button
              onClick={() => { setStep(STEPS.REGISTER); setError(""); setOtp("") }}
              className="text-gray-500 hover:underline"
            >
              {t("seeker_signup.back") || "Back"}
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ─── REGISTER screen (your original form, unchanged) ──────────────────────

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
            <input
              type="tel"
              required
              placeholder="+966 5X XXX XXXX"
              value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={inputClass}
            />
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
            {loading
              ? t("seeker_signup.submitting") || "Sending..."
              : t("seeker_signup.submit")}
          </button>

        </form>
      </div>
    </div>
  )
}


// import { useState } from "react"
// import { useTranslation } from "react-i18next"
// import EyeIcon from "../components/EyeIcon"
// import { inputClass, labelClass } from "../utils/styles"
// import {
//   sanitizeFullName,
//   sanitizePhoneNumber,
//   isEmailFormatValid,
//   isPasswordLengthValid,
//   doPasswordsMatch,
// } from "../utils/validation"

// export default function SeekerSignup() {
//   const { t, i18n } = useTranslation()
//   const textDir = i18n.language === "ar" ? "rtl" : "ltr"
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirm, setShowConfirm] = useState(false)
//   const [error, setError] = useState("")
//   const [fieldErrors, setFieldErrors] = useState({
//     fullName: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//   })
//   const [form, setForm] = useState({
//     fullName: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//   })

//   const updateFieldError = (field, message) => {
//     setFieldErrors((current) => ({ ...current, [field]: message }))
//   }

//   const handleFullNameChange = (value) => {
//     const sanitized = sanitizeFullName(value)
//     setForm((prev) => ({ ...prev, fullName: sanitized }))
//     setError("")
//     updateFieldError(
//       "fullName",
//       value !== sanitized ? t("seeker_signup.error_full_name_invalid") : ""
//     )
//   }

//   const handlePhoneChange = (value) => {
//     const digitsOnly = value.replace(/\D/g, "")
//     const sanitized = sanitizePhoneNumber(value)
//     setForm((prev) => ({ ...prev, phone: sanitized }))
//     setError("")
//     updateFieldError(
//       "phone",
//       digitsOnly && (digitsOnly.length < 9 || digitsOnly.length > 10)
//         ? t("seeker_signup.error_phone_length_range")
//         : ""
//     )
//   }

//   const handleEmailChange = (value) => {
//     setForm((prev) => ({ ...prev, email: value }))
//     setError("")
//     updateFieldError(
//       "email",
//       value && !isEmailFormatValid(value)
//         ? t("seeker_signup.error_email_format")
//         : ""
//     )
//   }

//   const handlePasswordChange = (value) => {
//     setForm((prev) => ({ ...prev, password: value }))
//     setError("")
//     updateFieldError(
//       "password",
//       value && !isPasswordLengthValid(value)
//         ? t("seeker_signup.error_password_length")
//         : ""
//     )
//     updateFieldError(
//       "confirmPassword",
//       form.confirmPassword && !doPasswordsMatch(value, form.confirmPassword)
//         ? t("seeker_signup.error_password_match")
//         : ""
//     )
//   }

//   const handleConfirmPasswordChange = (value) => {
//     setForm((prev) => ({ ...prev, confirmPassword: value }))
//     setError("")
//     updateFieldError(
//       "confirmPassword",
//       value && !doPasswordsMatch(form.password, value)
//         ? t("seeker_signup.error_password_match")
//         : ""
//     )
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()

//     if (!form.fullName || !form.email || !form.phone || !form.password || !form.confirmPassword) {
//       setError(t("seeker_signup.error_required"))
//       return
//     }

//     const hasFieldError = Object.values(fieldErrors).some(Boolean)
//     if (hasFieldError) {
//       return
//     }

//     setError("")
//     console.log("SeekerSignup:", form)
//     // هنا لاحقاً تربط مع Django API
//   }

  

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">

//       {/* زر اللغة */}
//       <button
//         onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
//         className="absolute top-4 left-4 px-3 py-1 border rounded-lg text-sm"
//       >
//         {i18n.language === "ar" ? "EN" : "ع"}
//       </button>

//       <div className="bg-white rounded-2xl shadow-xl p-10 w-[480px]" dir={textDir}>

//         <h2 className="text-2xl font-medium text-gray-900 mb-4">
//           {t("seeker_signup.title")}
//         </h2>

//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">

//           {/* الاسم الكامل */}
//           <div>
//             <label className={labelClass}>
//               {t("seeker_signup.full_name")}
//             </label>
//             <input
//               type="text"
//               required
//               placeholder={t("seeker_signup.full_name_placeholder")}
//               value={form.fullName}
//               onChange={(e) => handleFullNameChange(e.target.value)}
//               className={inputClass}
//             />
//             {fieldErrors.fullName && (
//               <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
//             )}
//           </div>

//           {/* البريد الإلكتروني */}
//           <div>
//             <label className={labelClass}>
//               {t("seeker_signup.email")}
//             </label>
//             <input
//               type="email"
//               required
//               placeholder="example@email.com"
//               value={form.email}
//               onChange={(e) => handleEmailChange(e.target.value)}
//               className={inputClass}
//             />
//             {fieldErrors.email && (
//               <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
//             )}
//           </div>

//           {/* رقم الهاتف */}
//           <div>
//             <label className={labelClass}>
//               {t("seeker_signup.phone")}
//             </label>
//             <input
//               type="tel"
//               required
//               placeholder="+966 5X XXX XXXX"
//               value={form.phone}
//               onChange={(e) => handlePhoneChange(e.target.value)}
//               className={inputClass}
//             />
//             {fieldErrors.phone && (
//               <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
//             )}
//           </div>

//           {/* كلمة المرور */}
//           <div>
//             <label className={labelClass}>
//               {t("seeker_signup.password")}
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 required
//                 placeholder="••••••••"
//                 value={form.password}
//                 onChange={(e) => handlePasswordChange(e.target.value)}
//                 className={inputClass}
//               />
//             {fieldErrors.password && (
//               <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
//             )}
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${textDir === "rtl" ? "left-3" : "right-3"}`}
//               >
//                 <EyeIcon open={showPassword} />
//               </button>
//             </div>
//           </div>

//           {/* تأكيد كلمة المرور */}
//           <div>
//             <label className={labelClass}>
//               {t("seeker_signup.confirm_password")}
//             </label>
//             <div className="relative">
//               <input
//                 type={showConfirm ? "text" : "password"}
//                 required
//                 placeholder="••••••••"
//                 value={form.confirmPassword}
//                 onChange={(e) => handleConfirmPasswordChange(e.target.value)}
//                 className={inputClass}
//               />
//             {fieldErrors.confirmPassword && (
//               <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
//             )}
//               <button
//                 type="button"
//                 onClick={() => setShowConfirm(!showConfirm)}
//                 className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${textDir === "rtl" ? "left-3" : "right-3"}`}
//               >
//                 <EyeIcon open={showConfirm} />
//               </button>
//             </div>
//           </div>

//           {/* رسالة الخطأ */}
//           {error && (
//             <p className="text-red-500 text-xs">{error}</p>
//           )}

//           <button
//             type="submit"
//             className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition mt-1"
//           >
//             {t("seeker_signup.submit")}
//           </button>

//         </form>
//       </div>
//     </div>
//   )
// }