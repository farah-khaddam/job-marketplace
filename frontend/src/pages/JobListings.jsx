import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import Navbar from "../components/Navbar"

// ─── Mock Data ────────────────────────────────────────────────────
const MOCK_JOBS = [
  { id:1,  title_ar:"مطور Frontend",        title_en:"Frontend Developer",       company_ar:"التقنية المتقدمة",  company_en:"Advanced Tech",      city:"دمشق",      specialization:"software",  jobType:"full_time",  workType:"onsite",  status:"open",  salary:"$800–$1,200", tags:["React","JavaScript","Tailwind"], days_ar:"منذ يومين",   days_en:"2d ago",   views:820 },
  { id:2,  title_ar:"مصمم UI/UX",           title_en:"UI/UX Designer",           company_ar:"هلال للحلول",       company_en:"Hilal Solutions",     city:"حلب",       specialization:"design",    jobType:"full_time",  workType:"remote",  status:"open",  salary:"$600–$900",   tags:["Figma","Adobe XD","Prototyping"], days_ar:"منذ 3 أيام",  days_en:"3d ago",   views:540 },
  { id:3,  title_ar:"محاسب مالي",           title_en:"Financial Accountant",     company_ar:"نور للاستثمار",     company_en:"Noor Investment",     city:"دمشق",      specialization:"finance",   jobType:"part_time",  workType:"onsite",  status:"open",  salary:"$400–$600",   tags:["Excel","محاسبة","ERP"],          days_ar:"منذ 5 أيام",  days_en:"5d ago",   views:310 },
  { id:4,  title_ar:"مطور Backend",         title_en:"Backend Developer",        company_ar:"سيريا ديف",         company_en:"Syria Dev",           city:"اللاذقية",  specialization:"software",  jobType:"full_time",  workType:"hybrid",  status:"open",  salary:"$900–$1,400", tags:["Django","Python","PostgreSQL"],  days_ar:"منذ يوم",     days_en:"1d ago",   views:670 },
  { id:5,  title_ar:"مدير تسويق",           title_en:"Marketing Manager",        company_ar:"الشام للإعلام",     company_en:"Sham Media",          city:"دمشق",      specialization:"marketing", jobType:"full_time",  workType:"onsite",  status:"open",  salary:"$700–$1,000", tags:["SEO","Social Media","Ads"],      days_ar:"منذ أسبوع",   days_en:"1w ago",   views:420 },
  { id:6,  title_ar:"مهندس شبكات",          title_en:"Network Engineer",         company_ar:"التقنية المتقدمة",  company_en:"Advanced Tech",       city:"حمص",       specialization:"software",  jobType:"full_time",  workType:"onsite",  status:"open",  salary:"$600–$850",   tags:["Cisco","Linux","Networking"],    days_ar:"منذ 4 أيام",  days_en:"4d ago",   views:290 },
  { id:7,  title_ar:"معلم لغة إنجليزية",   title_en:"English Teacher",          company_ar:"فجر التعليم",       company_en:"Fajr Education",      city:"حلب",       specialization:"education", jobType:"part_time",  workType:"onsite",  status:"open",  salary:"$300–$500",   tags:["Teaching","IELTS","English"],    days_ar:"منذ 6 أيام",  days_en:"6d ago",   views:195 },
  { id:8,  title_ar:"طبيب عام",             title_en:"General Physician",        company_ar:"الشام للطب",        company_en:"Sham Medical",        city:"دمشق",      specialization:"health",    jobType:"full_time",  workType:"onsite",  status:"open",  salary:"$800–$1,100", tags:["طب","رعاية صحية"],               days_ar:"منذ 3 أيام",  days_en:"3d ago",   views:380 },
  { id:9,  title_ar:"مطور Mobile",          title_en:"Mobile Developer",         company_ar:"سيريا ديف",         company_en:"Syria Dev",           city:"دمشق",      specialization:"software",  jobType:"full_time",  workType:"remote",  status:"open",  salary:"$1,000–$1,500",tags:["React Native","Flutter","iOS"], days_ar:"منذ يومين",   days_en:"2d ago",   views:730 },
  { id:10, title_ar:"أخصائي موارد بشرية",  title_en:"HR Specialist",            company_ar:"نور للاستثمار",     company_en:"Noor Investment",     city:"درعا",      specialization:"hr",        jobType:"full_time",  workType:"onsite",  status:"open",  salary:"$400–$600",   tags:["HR","Recruitment","Training"],   days_ar:"منذ أسبوع",   days_en:"1w ago",   views:210 },
  { id:11, title_ar:"مصمم جرافيك",          title_en:"Graphic Designer",         company_ar:"هلال للحلول",       company_en:"Hilal Solutions",     city:"اللاذقية",  specialization:"design",    jobType:"contract",   workType:"remote",  status:"open",  salary:"$400–$700",   tags:["Photoshop","Illustrator","Branding"], days_ar:"منذ 5 أيام", days_en:"5d ago", views:340 },
  { id:12, title_ar:"مندوب مبيعات",         title_en:"Sales Representative",     company_ar:"الشام للإعلام",     company_en:"Sham Media",          city:"حلب",       specialization:"sales",     jobType:"full_time",  workType:"onsite",  status:"open",  salary:"$350–$550",   tags:["مبيعات","تواصل","CRM"],          days_ar:"منذ يومين",   days_en:"2d ago",   views:155 },
]

const SPECIALIZATIONS = [
  { value:"",          label_ar:"كل التخصصات",       label_en:"All Specializations" },
  { value:"software",  label_ar:"هندسة البرمجيات",   label_en:"Software Engineering" },
  { value:"design",    label_ar:"تصميم",              label_en:"Design" },
  { value:"marketing", label_ar:"تسويق",              label_en:"Marketing" },
  { value:"finance",   label_ar:"مالية ومحاسبة",     label_en:"Finance" },
  { value:"health",    label_ar:"رعاية صحية",         label_en:"Healthcare" },
  { value:"education", label_ar:"تعليم",              label_en:"Education" },
  { value:"hr",        label_ar:"موارد بشرية",        label_en:"Human Resources" },
  { value:"sales",     label_ar:"مبيعات",             label_en:"Sales" },
]

const JOB_TYPES = [
  { value:"",          label_ar:"كل الأنواع",   label_en:"All Types" },
  { value:"full_time", label_ar:"دوام كامل",    label_en:"Full Time" },
  { value:"part_time", label_ar:"دوام جزئي",    label_en:"Part Time" },
  { value:"contract",  label_ar:"عقد مؤقت",     label_en:"Contract" },
  { value:"internship",label_ar:"تدريب",         label_en:"Internship" },
  { value:"freelance", label_ar:"عمل حر",        label_en:"Freelance" },
]

const WORK_TYPES = [
  { value:"",       label_ar:"كل طرق العمل", label_en:"All Work Types" },
  { value:"onsite", label_ar:"حضوري",         label_en:"On-site" },
  { value:"remote", label_ar:"عن بُعد",       label_en:"Remote" },
  { value:"hybrid", label_ar:"هجين",          label_en:"Hybrid" },
]

const CITIES = ["","دمشق","حلب","حمص","اللاذقية","طرطوس","حماة","دير الزور","الرقة","السويداء","درعا"]

const SORT_OPTIONS = [
  { value:"newest",  label_ar:"الأحدث",       label_en:"Newest" },
  { value:"oldest",  label_ar:"الأقدم",       label_en:"Oldest" },
  { value:"views",   label_ar:"الأكثر مشاهدة",label_en:"Most Viewed" },
]

const WORK_TYPE_STYLE = {
  onsite: { bg:"#f0fdf4", color:"#166534", border:"#bbf7d0" },
  remote: { bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe" },
  hybrid: { bg:"#faf5ff", color:"#6b21a8", border:"#e9d5ff" },
}

const JOB_TYPE_STYLE = {
  full_time:  { bg:"#eff6ff", color:"#1e40af", border:"#bfdbfe" },
  part_time:  { bg:"#fff7ed", color:"#9a3412", border:"#fed7aa" },
  contract:   { bg:"#fefce8", color:"#854d0e", border:"#fef08a" },
  internship: { bg:"#f0fdf4", color:"#166534", border:"#bbf7d0" },
  freelance:  { bg:"#fdf4ff", color:"#86198f", border:"#f0abfc" },
}

// ─── Sub-components ───────────────────────────────────────────────
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap"
      style={{
        background: active ? "#1e3a5f"               : "white",
        color:      active ? "#ffffff"               : "#64748b",
        borderColor:active ? "#1e3a5f"               : "#e2e8f0",
        boxShadow:  active ? "0 2px 8px rgba(30,58,95,.25)" : "none",
      }}
    >
      {label}
    </button>
  )
}

function SelectFilter({ value, onChange, options, isAr }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-semibold border outline-none transition-all cursor-pointer"
        style={{ background:"white", borderColor:"#e2e8f0", color:"#475569", minWidth:"130px" }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {isAr ? o.label_ar : o.label_en}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-2.5 text-slate-400"
           width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  )
}

function JobCard({ job, isAr, onClick }) {
  const wtStyle = WORK_TYPE_STYLE[job.workType] || {}
  const jtStyle = JOB_TYPE_STYLE[job.jobType]   || {}

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden"
      style={{ borderColor:"#e8efff" }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#3b82f6"
        e.currentTarget.style.boxShadow   = "0 8px 32px rgba(59,130,246,.12)"
        e.currentTarget.style.transform   = "translateY(-2px)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#e8efff"
        e.currentTarget.style.boxShadow   = "none"
        e.currentTarget.style.transform   = "translateY(0)"
      }}
    >
      {/* top accent bar */}
      <div className="h-0.5 w-0 group-hover:w-full transition-all duration-300"
           style={{ background:"linear-gradient(90deg,#3b82f6,#6366f1)" }}/>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* company avatar */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
               style={{ background:"linear-gradient(135deg,#1e3a5f,#2d5282)" }}>
            {(isAr ? job.company_ar : job.company_en).charAt(0)}
          </div>

          {/* badges */}
          <div className="flex flex-wrap gap-1.5 justify-end">
            <span className="text-xs px-2.5 py-1 rounded-xl font-semibold border"
                  style={{ background:jtStyle.bg, color:jtStyle.color, borderColor:jtStyle.border }}>
              {isAr
                ? JOB_TYPES.find(j=>j.value===job.jobType)?.label_ar
                : JOB_TYPES.find(j=>j.value===job.jobType)?.label_en}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-xl font-semibold border"
                  style={{ background:wtStyle.bg, color:wtStyle.color, borderColor:wtStyle.border }}>
              {isAr
                ? WORK_TYPES.find(w=>w.value===job.workType)?.label_ar
                : WORK_TYPES.find(w=>w.value===job.workType)?.label_en}
            </span>
          </div>
        </div>

        {/* Title + company */}
        <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
          {isAr ? job.title_ar : job.title_en}
        </h3>
        <p className="text-xs text-slate-500 mb-1">
          {isAr ? job.company_ar : job.company_en}
        </p>
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {job.city}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.tags.slice(0,3).map(tag => (
            <span key={tag} className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ background:"#f1f5f9", color:"#64748b" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t"
             style={{ borderColor:"#f1f5f9" }}>
          <span className="text-sm font-bold" style={{ color:"#1e3a5f" }}>{job.salary}</span>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {job.views}
            </span>
            <span>{isAr ? job.days_ar : job.days_en}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
export default function JobListings() {
  const { t, i18n }         = useTranslation()
  const navigate             = useNavigate()
  const [searchParams]       = useSearchParams()
  const isAr                 = i18n.language === "ar"

  const [search,         setSearch]         = useState(searchParams.get("search") || "")
  const [inputVal,       setInputVal]       = useState(searchParams.get("search") || "")
  const [specialization, setSpecialization] = useState(searchParams.get("category") || "")
  const [city,           setCity]           = useState(searchParams.get("governorate") || "")
  const [jobType,        setJobType]        = useState("")
  const [workType,       setWorkType]       = useState("")
  const [sortBy,         setSortBy]         = useState("newest")

  const handleSearch = () => setSearch(inputVal.trim())

  // ── filtering + sorting ──
  const filtered = useMemo(() => {
    let list = [...MOCK_JOBS]
    if (search)         list = list.filter(j =>
      (j.title_ar + j.title_en + j.company_ar + j.company_en + j.tags.join(" "))
        .toLowerCase().includes(search.toLowerCase()))
    if (specialization) list = list.filter(j => j.specialization === specialization)
    if (city)           list = list.filter(j => j.city === city)
    if (jobType)        list = list.filter(j => j.jobType === jobType)
    if (workType)       list = list.filter(j => j.workType === workType)
    if (sortBy === "views")   list.sort((a,b) => b.views - a.views)
    else if (sortBy === "oldest") list.reverse()
    return list
  }, [search, specialization, city, jobType, workType, sortBy])

  const activeFiltersCount = [specialization, city, jobType, workType].filter(Boolean).length

  const clearFilters = () => {
    setSpecialization(""); setCity(""); setJobType(""); setWorkType("")
    setSearch(""); setInputVal("")
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen" style={{ background:"#f0f4f8" }}>
      <Navbar />

      {/* ── Hero search bar ── */}
      <div className="relative overflow-hidden"
           style={{ background:"linear-gradient(135deg,#0f2544 0%,#1e3a5f 60%,#162d4a 100%)" }}>
        {/* grid overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
             style={{
               backgroundImage:"linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
               backgroundSize:"32px 32px"
             }}/>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background:"radial-gradient(ellipse 60% 100% at 50% 0%,rgba(59,130,246,.18),transparent)" }}/>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-2xl font-black text-white text-center mb-1">
            {t("jobs.title")}
          </h1>
          <p className="text-sm text-white/50 text-center mb-6">{t("jobs.subtitle")}</p>

          {/* search input */}
          <div className="flex gap-2 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-sm border rounded-2xl px-4 py-2.5"
                 style={{ borderColor:"rgba(255,255,255,.2)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder={t("jobs.search_placeholder")}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
              />
              {inputVal && (
                <button onClick={() => { setInputVal(""); setSearch("") }}
                  className="text-white/40 hover:text-white transition text-lg leading-none">×</button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 rounded-2xl text-sm font-bold text-white transition-all"
              style={{ background:"linear-gradient(135deg,#3b82f6,#6366f1)" }}
              onMouseEnter={e => e.currentTarget.style.opacity=".88"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              {t("jobs.search_btn")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm" style={{ borderColor:"#e8efff" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">

            {/* Specialization pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-wrap">
              {SPECIALIZATIONS.map(s => (
                <FilterPill
                  key={s.value}
                  label={isAr ? s.label_ar : s.label_en}
                  active={specialization === s.value}
                  onClick={() => setSpecialization(s.value)}
                />
              ))}
            </div>

            {/* divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1"/>

            {/* select filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <SelectFilter value={city} onChange={setCity} isAr={isAr}
                options={CITIES.map(c => ({ value:c, label_ar: c||"كل المدن", label_en: c||"All Cities" }))} />
              <SelectFilter value={jobType} onChange={setJobType} isAr={isAr} options={JOB_TYPES} />
              <SelectFilter value={workType} onChange={setWorkType} isAr={isAr} options={WORK_TYPES} />
            </div>

            {/* clear + sort */}
            <div className="flex items-center gap-2 ms-auto">
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition px-2">
                  <span>×</span> {t("jobs.clear_filters")}
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                </button>
              )}
              <SelectFilter value={sortBy} onChange={setSortBy} isAr={isAr} options={SORT_OPTIONS} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* count bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-slate-600">
            <span className="text-lg font-black" style={{ color:"#1e3a5f" }}>{filtered.length}</span>
            {" "}{t("jobs.results_count")}
            {search && (
              <span className="text-slate-400 font-normal">
                {" "}{t("jobs.results_for")} "<span className="text-blue-600 font-semibold">{search}</span>"
              </span>
            )}
          </p>
        </div>

        {/* grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-bold text-slate-600 mb-1">{t("jobs.no_results")}</p>
            <p className="text-sm text-slate-400">{t("jobs.no_results_sub")}</p>
            <button onClick={clearFilters}
              className="mt-4 px-6 py-2 rounded-xl text-sm font-bold text-white transition"
              style={{ background:"linear-gradient(135deg,#1e3a5f,#2d5282)" }}>
              {t("jobs.clear_filters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isAr={isAr}
                onClick={() => navigate(`/jobs/${job.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="mt-8 py-6 text-center text-xs text-slate-400 border-t" style={{ borderColor:"#e8efff" }}>
        © 2025 {t("nav.brand")}
      </footer>
    </div>
  )
}
