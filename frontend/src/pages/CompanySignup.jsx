import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import EyeIcon from "../components/EyeIcon"
import CountryCodeSelect from "../components/CountryCodeSelect"
import { sanitizePhoneNumber } from "../utils/validation"
import { inputClass, labelClass } from "../utils/styles"

const API_BASE = "http://127.0.0.1:8000"

const GOVERNORATE_AR = { damascus:"دمشق", rural_damascus:"ريف دمشق", aleppo:"حلب", homs:"حمص", hama:"حماة", latakia:"اللاذقية", tartus:"طرطوس", deir_ezzor:"دير الزور", raqqa:"الرقة", hasakah:"الحسكة", daraa:"درعا", suwayda:"السويداء", quneitra:"القنيطرة", idlib:"إدلب" }
const COMPANY_TYPE_AR = { programming:"تقنية المعلومات", civil:"هندسة مدنية", healthcare:"الصحة", education:"التعليم", finance:"المال والأعمال", marketing:"التسويق والإعلام", hospitality:"الضيافة والسياحة", other:"أخرى" }

const FALLBACK_GOVERNORATES = [
  { value: "damascus",       label: "Damascus" },
  { value: "rural_damascus", label: "Rural Damascus" },
  { value: "aleppo",         label: "Aleppo" },
  { value: "homs",           label: "Homs" },
  { value: "hama",           label: "Hama" },
  { value: "latakia",        label: "Latakia" },
  { value: "tartus",         label: "Tartus" },
  { value: "deir_ezzor",     label: "Deir ez-Zor" },
  { value: "raqqa",          label: "Raqqa" },
  { value: "hasakah",        label: "Al-Hasakah" },
  { value: "daraa",          label: "Daraa" },
  { value: "suwayda",        label: "As-Suwayda" },
  { value: "quneitra",       label: "Quneitra" },
  { value: "idlib",          label: "Idlib" },
]

const FALLBACK_COMPANY_TYPES = [
  { value: "programming", label: "Programming" },
  { value: "civil",       label: "Civil" },
  { value: "healthcare",  label: "Healthcare" },
  { value: "education",   label: "Education" },
  { value: "finance",     label: "Finance" },
  { value: "marketing",   label: "Marketing" },
  { value: "hospitality", label: "Hospitality" },
  { value: "other",       label: "Other" },
]

export default function CompanySignup() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === "ar"
  const dir = isAr ? "rtl" : "ltr"
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [governorates, setGovernorates] = useState(FALLBACK_GOVERNORATES)
  const [companyTypes, setCompanyTypes] = useState(FALLBACK_COMPANY_TYPES)
  const [choicesLoading, setChoicesLoading] = useState(false)
  const [form, setForm] = useState({ companyName:"", email:"", phone:"", phoneCountryCode:"+963", governorate:"", companyType:"", website:"", description:"", password:"", confirmPassword:"" })

  useEffect(() => {
    fetch(`${API_BASE}/api/choices/`)
      .then(r => { if (!r.ok) throw new Error("failed"); return r.json() })
      .then(data => {
        if (data.governorates?.length) setGovernorates(data.governorates)
        if (data.company_types?.length) setCompanyTypes(data.company_types)
      })
      .catch(() => { /* الـ fallback المحلي شغّال */ })
  }, [])

  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }))
    if (fieldErrors[field]) setFieldErrors(p => ({ ...p, [field]: "" }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setFieldErrors({ confirmPassword: t("company_signup.error_password_match") }); return }
    if (form.password.length < 6) { setFieldErrors({ password: t("company_signup.error_password_length") }); return }
    setError(""); setFieldErrors({}); setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/company/register/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: form.companyName, email: form.email, phone_number: `${form.phoneCountryCode}${form.phone}`, governorate: form.governorate, company_type: form.companyType, website_url: form.website || undefined, description: form.description, password: form.password, password_confirm: form.confirmPassword }),
      })
      const data = await res.json()
      if (res.ok) { navigate("/pending") }
      else {
        const apiFieldMap = { company_name:"companyName", phone_number:"phone", governorate:"governorate", company_type:"companyType", website_url:"website", description:"description", password:"password", password_confirm:"confirmPassword" }
        const newErrors = {}; let generalError = ""
        Object.entries(data).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val[0] : val
          const fk = apiFieldMap[key]
          if (fk) newErrors[fk] = msg; else generalError = msg
        })
        setFieldErrors(newErrors); if (generalError) setError(generalError)
      }
    } catch { setError(t("company_signup.error_network")) }
    finally { setLoading(false) }
  }

  const inputCls = (hasErr) => `w-full px-4 py-2.5 border-2 rounded-xl text-sm bg-white/60 backdrop-blur-sm focus:outline-none focus:bg-white transition-all duration-200 ${hasErr ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"}`
  const lbl = "block text-xs font-semibold text-gray-600 mb-1.5"
  const pwCls = (hasErr) => `w-full py-2.5 border-2 rounded-xl text-sm bg-white/60 focus:outline-none focus:bg-white transition-all duration-200 ${dir === "rtl" ? "pr-4 pl-10" : "pl-4 pr-10"} ${hasErr ? "border-red-400" : "border-gray-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"}`

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)"}} />
      <div className="absolute inset-0 opacity-30" style={{backgroundImage: "radial-gradient(circle at 15% 50%, #3b82f6 0%, transparent 45%), radial-gradient(circle at 85% 20%, #6366f1 0%, transparent 40%), radial-gradient(circle at 70% 85%, #0ea5e9 0%, transparent 40%)"}} />
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px)"}} />

      {/* Left Panel */}
      <div className="hidden lg:flex w-[38%] flex-col justify-between p-14 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-white">Job<span className="text-blue-300">Portal</span></span>
          <button onClick={() => i18n.changeLanguage(isAr ? "en" : "ar")}
            className="px-4 py-1.5 rounded-full text-xs font-medium border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition">
            {isAr ? "EN" : "ع"}
          </button>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-300 font-medium">{isAr ? "تسجيل شركة جديدة" : "New Company Registration"}</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            {isAr ? (<>انضم إلى<br/><span className="text-blue-300">منصتنا</span><br/>وابحث عن<br/>أفضل الكفاءات</>) : (<>Join Our<br/><span className="text-blue-300">Platform</span><br/>& Find Top<br/>Talent</>)}
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10">
            {isAr ? "انشر وظائفك وتواصل مع أفضل المواهب في سوريا" : "Post jobs and connect with the best talent in Syria"}
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: "📋", ar: "انشر وظائفك بسهولة", en: "Post jobs easily" },
              { icon: "👥", ar: "تصفّح المتقدمين", en: "Browse applicants" },
              { icon: "✅", ar: "وظّف الأفضل", en: "Hire the best" },
            ].map(s => (
              <div key={s.icon} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <span className="text-lg">{s.icon}</span>
                <span className="text-sm text-white/70">{isAr ? s.ar : s.en}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/20">© 2025 JobPortal</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-y-auto">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 my-6" dir={dir}>

          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <span className="text-lg font-bold text-gray-900">Job<span className="text-blue-600">Portal</span></span>
            <button onClick={() => i18n.changeLanguage(isAr ? "en" : "ar")}
              className="px-3 py-1 rounded-full text-xs border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
              {isAr ? "EN" : "ع"}
            </button>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">{t("company_signup.title")}</h1>
            <p className="text-sm text-gray-400 mt-1">{isAr ? "أنشئ حساب شركتك وابدأ بنشر الوظائف" : "Create your company account and start posting jobs"}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* اسم الشركة */}
            <div>
              <label className={lbl} style={{textAlign:"start", display:"block"}}>{t("company_signup.company_name")}</label>
              <input type="text" required placeholder={t("company_signup.company_name_placeholder")}
                value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)}
                className={inputCls(!!fieldErrors.companyName)} />
              {fieldErrors.companyName && <p className="text-red-500 text-xs mt-1">{fieldErrors.companyName}</p>}
            </div>

            {/* الإيميل */}
            <div>
              <label className={lbl} style={{textAlign:"start", display:"block"}}>{t("company_signup.email")}</label>
              <input type="email" required placeholder="example@company.com"
                value={form.email} onChange={(e) => handleChange("email", e.target.value)}
                className={inputCls(!!fieldErrors.email)} />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            {/* الهاتف */}
            <div>
              <label className={lbl} style={{textAlign:"start", display:"block"}}>{t("company_signup.phone")}</label>
              <div className="flex gap-2">
                <div className="w-44 flex-shrink-0">
                  <CountryCodeSelect value={form.phoneCountryCode} onChange={(v) => handleChange("phoneCountryCode", v)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-white/60 focus:outline-none focus:border-blue-500 transition" />
                </div>
                <input type="tel" required placeholder="9X XXX XXXX"
                  value={form.phone} onChange={(e) => handleChange("phone", sanitizePhoneNumber(e.target.value))}
                  className={`flex-1 ${inputCls(!!fieldErrors.phone)}`} />
              </div>
              {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
            </div>

            {/* المحافظة + النوع */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl} style={{textAlign:"start", display:"block"}}>{t("company_signup.governorate")}</label>
                <select required value={form.governorate} onChange={(e) => handleChange("governorate", e.target.value)}
                  className={inputCls(!!fieldErrors.governorate)}>
                  <option value="">{t("company_signup.select")}</option>
                  {governorates.map(g => <option key={g.value} value={g.value}>{isAr ? (GOVERNORATE_AR[g.value] || g.label) : g.label}</option>)}
                </select>
                {fieldErrors.governorate && <p className="text-red-500 text-xs mt-1">{fieldErrors.governorate}</p>}
              </div>
              <div>
                <label className={lbl} style={{textAlign:"start", display:"block"}}>{t("company_signup.sector")}</label>
                <select required value={form.companyType} onChange={(e) => handleChange("companyType", e.target.value)}
                  className={inputCls(!!fieldErrors.companyType)}>
                  <option value="">{t("company_signup.select")}</option>
                  {companyTypes.map(s => <option key={s.value} value={s.value}>{isAr ? (COMPANY_TYPE_AR[s.value] || s.label) : s.label}</option>)}
                </select>
                {fieldErrors.companyType && <p className="text-red-500 text-xs mt-1">{fieldErrors.companyType}</p>}
              </div>
            </div>

            {/* الموقع */}
            <div>
              <label className={lbl} style={{textAlign:"start", display:"block"}}>
                {t("company_signup.website")} <span className="text-gray-400 font-normal">({t("company_signup.optional")})</span>
              </label>
              <input type="url" placeholder="https://www.company.com"
                value={form.website} onChange={(e) => handleChange("website", e.target.value)}
                className={inputCls(false)} />
            </div>

            {/* الوصف */}
            <div>
              <label className={lbl} style={{textAlign:"start", display:"block"}}>{t("company_signup.description")}</label>
              <textarea required rows={3} placeholder={t("company_signup.description_placeholder")}
                value={form.description} onChange={(e) => handleChange("description", e.target.value)}
                className={`${inputCls(!!fieldErrors.description)} resize-none`} />
              {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
            </div>

            {/* كلمة المرور */}
            <div>
              <label className={lbl} style={{textAlign:"start", display:"block"}}>{t("company_signup.password")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  value={form.password} onChange={(e) => handleChange("password", e.target.value)}
                  className={pwCls(!!fieldErrors.password)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${dir === "rtl" ? "left-3" : "right-3"}`}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>

            {/* تأكيد */}
            <div>
              <label className={lbl} style={{textAlign:"start", display:"block"}}>{t("company_signup.confirm_password")}</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} required placeholder="••••••••"
                  value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={pwCls(!!fieldErrors.confirmPassword)} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${dir === "rtl" ? "left-3" : "right-3"}`}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
            </div>

            {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading || choicesLoading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              style={{background: "linear-gradient(135deg, #1e3a5f, #3b82f6)"}}>
              {loading ? (<><svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>{t("company_signup.submitting")}</>) : t("company_signup.submit")}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
