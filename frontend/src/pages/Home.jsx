import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"

const CATEGORIES = [
  { key: "tech",  ar: "تقنية المعلومات", en: "Information Technology" },
  { key: "marketing", ar: "تسويق وإعلام", en: "Marketing & Media" },
  { key: "engineering",  ar: "هندسة", en: "Engineering" },
  { key: "health", ar: "صحة", en: "Healthcare" },
  { key: "education", ar: "تعليم", en: "Education" },
  { key: "finance", ar: "مال وأعمال", en: "Finance & Business" },
]




const FEATURED_COMPANIES = [
  { id: 1, name_ar: "التقنية المتقدمة", name_en: "Advanced Tech", industry_ar: "تقنية المعلومات", industry_en: "Information Technology", jobs_ar: "12 وظيفة", jobs_en: "12 Jobs", logo: "💻", color: "bg-blue-50" },
  { id: 2, name_ar: "هلال للحلول", name_en: "Hilal Solutions", industry_ar: "تصميم وإبداع", industry_en: "Design & Creative", jobs_ar: "7 وظائف", jobs_en: "7 Jobs", logo: "🎨", color: "bg-purple-50" },
  { id: 3, name_ar: "نور للاستثمار", name_en: "Noor Investment", industry_ar: "مال وأعمال", industry_en: "Finance & Business", jobs_ar: "5 وظائف", jobs_en: "5 Jobs", logo: "💰", color: "bg-amber-50" },
  { id: 4, name_ar: "سيريا ديف", name_en: "Syria Dev", industry_ar: "برمجيات", industry_en: "Software", jobs_ar: "9 وظائف", jobs_en: "9 Jobs", logo: "🖥️", color: "bg-green-50" },
  { id: 5, name_ar: "الشام للطب", name_en: "Sham Medical", industry_ar: "رعاية صحية", industry_en: "Healthcare", jobs_ar: "4 وظائف", jobs_en: "4 Jobs", logo: "🏥", color: "bg-red-50" },
  { id: 6, name_ar: "فجر التعليم", name_en: "Fajr Education", industry_ar: "تعليم وتدريب", industry_en: "Education & Training", jobs_ar: "6 وظائف", jobs_en: "6 Jobs", logo: "📚", color: "bg-teal-50" },
]




export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAr = i18n.language === "ar"
  const textDir = isAr ? "rtl" : "ltr"
  const isLoggedIn = !!localStorage.getItem("token")
  const [search, setSearch] = useState("")
  const [governorate, setGovernorate] = useState("")
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs/")
        if (res.ok) {
          const data = await res.json()
          setJobs(data)
        }
      } catch (err) {
        console.error("fetchJobs error:", err)
      } finally {
        setJobsLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const handleSearch = () => {
    navigate(`/jobs?search=${search}&governorate=${governorate}`)
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50" dir={textDir}>
      <Navbar />

      {/* ===== Hero ===== */}
      <div className="bg-[#1e3a5f] px-10 py-16 text-center relative overflow-hidden"
       style={{ background:"linear-gradient(135deg,#0f2544 0%,#1e3a5f 60%,#162d4a 100%)" }}>
        <div className="absolute w-72 h-72 rounded-full border border-white/5 -top-20 -right-20" />
        <div className="absolute w-52 h-52 rounded-full border border-white/5 -bottom-16 -left-16" />

        <h1 className="text-4xl font-medium text-white mb-3 leading-relaxed relative">
          {t("home.hero_title_1")} <span className="text-blue-300">{t("home.hero_title_2")}</span>
          <br />{t("home.hero_title_3")}
        </h1>
        <p className="text-sm text-white/60 mb-10 relative">{t("home.hero_sub")}</p>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-2 flex flex-col md:flex-row gap-2 max-w-xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("home.search_placeholder")}
            className="flex-1 text-sm px-3 py-2 outline-none text-gray-700 bg-transparent"
          />
          <select
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            className="text-sm px-3 py-2 outline-none text-gray-500 bg-transparent border-r border-gray-200"
          >
            <option value="">{t("home.all_governorates")}</option>
            {["دمشق", "حلب", "حمص", "حماة", "اللاذقية", "طرطوس", "درعا", "إدلب"].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            {t("home.search_btn")}
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 relative mt-10">
          {[
            { num: "+2,000", label: t("home.stat_jobs") },
            { num: "+500", label: t("home.stat_companies") },
            { num: "+10,000", label: t("home.stat_seekers") },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <strong className="block text-xl text-white">{s.num}</strong>
              <small className="text-xs text-white/60">{s.label}</small>
            </div>
          ))}
        </div>
      </div>

      {/* ===== قسم حسب حالة المستخدم ===== */}
      {isLoggedIn ? (
        <div className="px-4 md:px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* وظائف زارها مؤخراً */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">{t("home.recently_viewed")}</h2>
                <span className="text-sm text-blue-600 cursor-pointer">{t("home.see_all")}</span>
              </div>
              <div className="flex flex-col gap-3">
                {jobs.slice(0, 2).map(job => (
                  <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-blue-500 transition">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company_name} · {job.city_label}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{job.employment_type_label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* طلباته الأخيرة */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">{t("home.my_applications")}</h2>
                <span className="text-sm text-blue-600 cursor-pointer">{t("home.see_all")}</span>
              </div>
              <div className="flex flex-col gap-3">
                {jobs.slice(0, 2).map(job => ( 
                  <div key={job.id} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{isAr ? job.title_ar : job.title_en}</p>
                      <p className="text-xs text-gray-500">{isAr ? job.company_ar : job.company_en}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">{t("home.status_pending")}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="px-4 md:px-10 py-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">{t("home.browse_by_category")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => navigate(`/jobs?category=${cat.key}`)}
                className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-blue-500 hover:shadow-sm transition flex flex-col items-center gap-2"
              >
                <span style={{ fontSize: "24px" }}>{cat.icon}</span>
                <span className="text-xs font-medium text-gray-700">{isAr ? cat.ar : cat.en}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== أحدث الوظائف ===== */}
      <div className="px-4 md:px-10 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">{t("home.latest_jobs")}</h2>
          <span
            onClick={() => navigate("/jobs")}
            className="text-sm text-blue-600 cursor-pointer hover:underline"
          >
            {t("home.see_all")} ←
          </span>
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100" />
                  <div className="w-20 h-6 rounded-full bg-gray-100" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-px bg-gray-50 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">{t("home.no_jobs")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.slice(0, 6).map(job => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-blue-500 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-800 text-xs font-medium">
                    {job.company_name?.slice(0, 2)}
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-800">
                    {job.employment_type_label}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">{job.title}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {job.company_name} · {job.city_label}
                </p>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-md">
                    {job.work_mode_label}
                  </span>
                  {job.specialization && (
                    <span className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-md">
                      {isAr ? job.specialization.name_ar : job.specialization.name_en}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                    {job.status_label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(job.created_at).toLocaleDateString(isAr ? "ar-SY" : "en-US")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== أبرز الشركات ===== */}
      <div className="px-4 md:px-10 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {isAr ? "أبرز الشركات" : "Featured Companies"}
          </h2>
          <span
            onClick={() => navigate("/companies")}
            className="text-sm text-blue-600 cursor-pointer hover:underline"
          >
            {t("home.see_all")} ←
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_COMPANIES.map(company => (
            <div
              key={company.id}
              onClick={() => navigate(`/companies/${company.id}`)}
              className="bg-white border border-gray-100 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-sm transition flex items-center gap-4"
            >
              {/* أيقونة الشركة */}
              <div className={`w-12 h-12 rounded-xl ${company.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                {company.logo}
              </div>

              {/* معلومات الشركة */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {isAr ? company.name_ar : company.name_en}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isAr ? company.industry_ar : company.industry_en}
                </p>
              </div>

              {/* عدد الوظائف */}
              <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 flex-shrink-0">
                {isAr ? company.jobs_ar : company.jobs_en}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Footer ===== */}
      <footer className="bg-[#1e3a5f] px-10 py-8 text-center">
        <p className="text-xs text-white/40">© 2025 JobPortal · {t("home.rights")}</p>
      </footer>

    </div>
  )
}
