import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import CompanyLayout from "../../components/company/CompanyLayout"

// ===== Constants =====
const JOB_TYPES = [
  { value: "full_time",  label_ar: "دوام كامل",  label_en: "Full Time"  },
  { value: "part_time",  label_ar: "دوام جزئي",  label_en: "Part Time"  },
  { value: "contract",   label_ar: "عقد مؤقت",   label_en: "Contract"   },
  { value: "internship", label_ar: "تدريب",       label_en: "Internship" },
  { value: "freelance",  label_ar: "عمل حر",      label_en: "Freelance"  },
]

const WORK_TYPES = [
  { value: "onsite",  label_ar: "حضوري",    label_en: "On-site" },
  { value: "remote",  label_ar: "عن بُعد",  label_en: "Remote"  },
  { value: "hybrid",  label_ar: "هجين",     label_en: "Hybrid"  },
]

const STATUSES = [
  { value: "open",   label_ar: "مفتوح",   label_en: "Open"   },
  { value: "closed", label_ar: "مغلق",    label_en: "Closed" },
  { value: "draft",  label_ar: "مسودة",   label_en: "Draft"  },
]

const SPECIALIZATIONS = [
  { value: "software",   label_ar: "هندسة البرمجيات",   label_en: "Software Engineering" },
  { value: "design",     label_ar: "تصميم",               label_en: "Design"               },
  { value: "data",       label_ar: "علوم البيانات",       label_en: "Data Science"         },
  { value: "marketing",  label_ar: "تسويق",               label_en: "Marketing"            },
  { value: "finance",    label_ar: "مالية ومحاسبة",       label_en: "Finance"              },
  { value: "hr",         label_ar: "موارد بشرية",         label_en: "Human Resources"      },
  { value: "sales",      label_ar: "مبيعات",               label_en: "Sales"                },
  { value: "operations", label_ar: "عمليات",               label_en: "Operations"           },
  { value: "other",      label_ar: "أخرى",                 label_en: "Other"                },
]

const CITIES = [
  "دمشق", "حلب", "حمص", "اللاذقية", "طرطوس",
  "حماة", "دير الزور", "الرقة", "السويداء", "درعا",
]

const INITIAL_FORM = {
  title:           "",
  description:     "",
  specialization:  "",
  city:            "",
  jobType:         "",
  workType:        "",
  status:          "open",
  isActive:        true,
  viewsCount:      0,
  expirationDate:  "",
  createdAt:       new Date().toISOString().slice(0, 10),
}


// ===== Field wrapper =====
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ms-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ===== Section card =====
function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-5">
        {children}
      </div>
    </div>
  )
}

// ===== Shared input styles =====
const inputCls =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none " +
  "focus:border-[#1e3a5f] focus:bg-white transition placeholder:text-gray-300"

const selectCls =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none " +
  "focus:border-[#1e3a5f] focus:bg-white transition appearance-none"

// ===== Main component =====
export default function PostJob() {
  const { t, i18n } = useTranslation()
  const navigate     = useNavigate()
  const isAr         = i18n.language === "ar"

  const [form,   setForm]   = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // ── helpers ──────────────────────────────────────────
  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())        e.title        = t("company.post_job.errors.required")
    if (!form.description.trim())  e.description  = t("company.post_job.errors.required")
    if (!form.specialization)      e.specialization = t("company.post_job.errors.required")
    if (!form.city)                e.city         = t("company.post_job.errors.required")
    if (!form.jobType)             e.jobType      = t("company.post_job.errors.required")
    if (!form.workType)            e.workType     = t("company.post_job.errors.required")
    if (!form.expirationDate)      e.expirationDate = t("company.post_job.errors.required")
    else if (form.expirationDate <= form.createdAt)
      e.expirationDate = t("company.post_job.errors.expiration_past")
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      // TODO: replace with actual API call
      // await api.post("/company/jobs", form)
      await new Promise(r => setTimeout(r, 800))
      navigate("/company/dashboard")
    } catch {
      setLoading(false)
    }
  }

  const labelOf = (arr, val) => {
    const found = arr.find(x => x.value === val)
    if (!found) return "—"
    return isAr ? found.label_ar : found.label_en
  }

  // ──────────────────────────────────────────────────────
  return (
    <CompanyLayout>
      <div className="px-8 py-8 space-y-8 max-w-4xl mx-auto">

        {/* ===== Header ===== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {t("company.post_job.title")}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t("company.post_job.subtitle")}
            </p>
          </div>
          <button
            onClick={() => navigate("/company/dashboard")}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600
                       text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isAr
                ? <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>
                : <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}
            </svg>
            {t("company.post_job.back")}
          </button>
        </div>

        {/* ===== Basic Info ===== */}
        <Section title={t("company.post_job.sections.basic")}>
          <Field label={t("company.post_job.fields.title")} required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder={t("company.post_job.placeholders.title")}
              className={inputCls + (errors.title ? " border-red-300" : "")}
            />
          </Field>

          <Field label={t("company.post_job.fields.description")} required error={errors.description}>
            <textarea
              rows={5}
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder={t("company.post_job.placeholders.description")}
              className={inputCls + " resize-none" + (errors.description ? " border-red-300" : "")}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={t("company.post_job.fields.specialization")} required error={errors.specialization}>
              <div className="relative">
                <select
                  value={form.specialization}
                  onChange={e => set("specialization", e.target.value)}
                  className={selectCls + (errors.specialization ? " border-red-300" : "")}
                >
                  <option value="">{t("company.post_job.placeholders.select")}</option>
                  {SPECIALIZATIONS.map(s => (
                    <option key={s.value} value={s.value}>
                      {isAr ? s.label_ar : s.label_en}
                    </option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3 text-gray-400"
                     width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </Field>

            <Field label={t("company.post_job.fields.city")} required error={errors.city}>
              <div className="relative">
                <select
                  value={form.city}
                  onChange={e => set("city", e.target.value)}
                  className={selectCls + (errors.city ? " border-red-300" : "")}
                >
                  <option value="">{t("company.post_job.placeholders.select")}</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3 text-gray-400"
                     width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </Field>
          </div>
        </Section>

        {/* ===== Job Details ===== */}
        <Section title={t("company.post_job.sections.details")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <Field label={t("company.post_job.fields.job_type")} required error={errors.jobType}>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map(jt => (
                  <button
                    key={jt.value}
                    type="button"
                    onClick={() => set("jobType", jt.value)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition
                      ${form.jobType === jt.value
                        ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1e3a5f]/40"}`}
                  >
                    {isAr ? jt.label_ar : jt.label_en}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t("company.post_job.fields.work_type")} required error={errors.workType}>
              <div className="flex flex-wrap gap-2">
                {WORK_TYPES.map(wt => (
                  <button
                    key={wt.value}
                    type="button"
                    onClick={() => set("workType", wt.value)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition
                      ${form.workType === wt.value
                        ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1e3a5f]/40"}`}
                  >
                    {isAr ? wt.label_ar : wt.label_en}
                  </button>
                ))}
              </div>
            </Field>

          </div>
        </Section>

        {/* ===== Publish Settings ===== */}
        <Section title={t("company.post_job.sections.publish")}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            <Field label={t("company.post_job.fields.status")}>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={e => set("status", e.target.value)}
                  className={selectCls}
                >
                  {STATUSES.map(s => (
                    <option key={s.value} value={s.value}>
                      {isAr ? s.label_ar : s.label_en}
                    </option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3 text-gray-400"
                     width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </Field>

            <Field label={t("company.post_job.fields.expiration_date")} required error={errors.expirationDate}>
              <input
                type="date"
                value={form.expirationDate}
                min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                onChange={e => set("expirationDate", e.target.value)}
                className={inputCls + (errors.expirationDate ? " border-red-300" : "")}
              />
            </Field>

            <Field label={t("company.post_job.fields.created_at")}>
              <input
                type="date"
                value={form.createdAt}
                disabled
                className={inputCls + " opacity-60 cursor-not-allowed"}
              />
            </Field>

          </div>

          {/* Views count (read-only) + isActive toggle */}
          <div className="flex flex-wrap items-center gap-6 pt-1">

            {/* isActive toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => set("isActive", !form.isActive)}
                className={`relative w-10 h-5.5 rounded-full transition-colors
                  ${form.isActive ? "bg-[#1e3a5f]" : "bg-gray-200"}`}
                style={{ height: "22px", width: "40px" }}
              >
                <span
                  className="absolute top-0.5 start-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all"
                  style={{
                    width: "18px",
                    height: "18px",
                    transform: form.isActive
                      ? (isAr ? "translateX(-18px)" : "translateX(18px)")
                      : "translateX(0)",
                  }}
                />
              </button>
              <span className="text-sm text-gray-700">
                {t("company.post_job.fields.is_active")}
                <span className={`ms-1.5 text-xs font-medium px-2 py-0.5 rounded-full border
                  ${form.isActive
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {form.isActive
                    ? t("company.post_job.active")
                    : t("company.post_job.inactive")}
                </span>
              </span>
            </div>

            {/* Views count */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>
                {t("company.post_job.fields.views_count")}:
                <span className="ms-1 font-medium text-gray-700">{form.viewsCount.toLocaleString()}</span>
              </span>
            </div>

          </div>
        </Section>

        {/* ===== Preview strip ===== */}
        {(form.title || form.city || form.jobType || form.workType || form.status) && (
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4">
            <p className="text-xs text-gray-400 mb-3">{t("company.post_job.preview_label")}</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {form.title || t("company.post_job.placeholders.title")}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-x-3">
                  {form.city && <span>{form.city}</span>}
                  {form.specialization && <span>{labelOf(SPECIALIZATIONS, form.specialization)}</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.jobType && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {labelOf(JOB_TYPES, form.jobType)}
                  </span>
                )}
                {form.workType && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                    {labelOf(WORK_TYPES, form.workType)}
                  </span>
                )}
                {form.status && (
                  <span className={`text-xs px-2.5 py-1 rounded-full border
                    ${form.status === "open"   ? "bg-green-50 text-green-700 border-green-100"  : ""}
                    ${form.status === "closed" ? "bg-red-50 text-red-600 border-red-100"        : ""}
                    ${form.status === "draft"  ? "bg-amber-50 text-amber-700 border-amber-100"  : ""}`}>
                    {labelOf(STATUSES, form.status)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Actions ===== */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <button
            type="button"
            onClick={() => navigate("/company/dashboard")}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200
                       rounded-xl hover:bg-gray-50 transition"
          >
            {t("company.post_job.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#16304f]
                       disabled:opacity-60 text-white text-sm font-medium rounded-xl transition"
          >
            {loading && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            )}
            {loading ? t("company.post_job.submitting") : t("company.post_job.submit")}
          </button>
        </div>

      </div>
    </CompanyLayout>
  )
}
