import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { API_BASE } from "../config"
import { useState, useEffect, useMemo } from "react"
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
} from "framer-motion";

// نفس قيم المحافظات (slugs) المستخدمة بـ JobListings/PostJob وبحقل job.city القادم من الباك اند
const GOVERNORATES = [
  { value: "damascus",       label: "دمشق" },
  { value: "aleppo",         label: "حلب" },
  { value: "homs",           label: "حمص" },
  { value: "hama",           label: "حماة" },
  { value: "latakia",        label: "اللاذقية" },
  { value: "tartus",         label: "طرطوس" },
  { value: "deir_ezzor",     label: "دير الزور" },
  { value: "raqqa",          label: "الرقة" },
  { value: "suwayda",        label: "السويداء" },
  { value: "daraa",          label: "درعا" },
  { value: "idlib",          label: "إدلب" },
  { value: "hasakah",        label: "الحسكة" },
  { value: "quneitra",       label: "القنيطرة" },
  { value: "rural_damascus", label: "ريف دمشق" },
]



// ألوان تتكرر دورياً على بطاقات الشركات حسب ترتيب ظهورها
const COMPANY_COLORS = [
  "bg-blue-50", "bg-purple-50", "bg-amber-50",
  "bg-green-50", "bg-red-50", "bg-teal-50",
]


function Counter({ from = 0, to }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    const controls = animate(count, to, {
      duration: 2,
      ease: "easeOut",
    });

    return controls.stop;
  }, [to]);

  return <motion.span>{rounded}</motion.span>;
}

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
  const [jobsError, setJobsError] = useState(false)
  const [specializations, setSpecializations] = useState([])
  const [specializationsLoading, setSpecializationsLoading] = useState(true)
  const [specializationsError, setSpecializationsError] = useState(false)
  const [seekersCount, setSeekersCount] = useState(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE}/jobs/`)
        if (res.ok) {
          const data = await res.json()
          setJobs(Array.isArray(data) ? data : data.results || [])
        } else {
          setJobsError(true)
        }
      } catch (err) {
        console.error("fetchJobs error:", err)
        setJobsError(true)
      } finally {
        setJobsLoading(false)
      }
    }
    const fetchSpecializations = async () => {
      try {
        const res = await fetch(`${API_BASE}/jobs/specializations/`)
        if (res.ok) {
          const data = await res.json()
          setSpecializations(Array.isArray(data) ? data : data.results || [])
        } else {
          setSpecializationsError(true)
        }
      } catch (err) {
        console.error("fetchSpecializations error:", err)
        setSpecializationsError(true)
      } finally {
        setSpecializationsLoading(false)
      }
    }
     const fetchSeekersCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/jobseekers/count/`)
        if (res.ok) {
          const data = await res.json()
          // نتوقع {"count": N} -- إذا رفيقتك رجعت شكل مختلف لازم نعدل هون
          setSeekersCount(typeof data.count === "number" ? data.count : null)
        }
      } catch (err) {
        console.error("fetchSeekersCount error:", err)
      }
    }

    fetchJobs()
    fetchSpecializations()
    fetchSeekersCount()
  }, [])

  const handleSearch = () => {
    navigate(`/jobs?search=${encodeURIComponent(search)}&governorate=${encodeURIComponent(governorate)}`)
  }

  // نبني قائمة أبرز الشركات من بيانات /api/jobs/ الحقيقية (ما في endpoint مستقل للشركات حالياً)
  const featuredCompanies = useMemo(() => {
    const byCompany = new Map()

    jobs.forEach(job => {
      const name = job.company_name?.trim()
      if (!name) return
      if (!byCompany.has(name)) {
        byCompany.set(name, { name, jobsCount: 0 })
      }
      byCompany.get(name).jobsCount += 1
    })

    return Array.from(byCompany.values())
      .sort((a, b) => b.jobsCount - a.jobsCount)
      .slice(0, 6)
      .map((company, index) => ({
        ...company,
        logo: company.name.slice(0, 2),
        color: COMPANY_COLORS[index % COMPANY_COLORS.length],
      }))
  }, [jobs])

  // نفس منطق تجميع الشركات فوق، بس بدون تحديد بـ6 -- لحساب العدد الحقيقي بالإحصائيات
  const totalCompaniesCount = useMemo(() => {
    const names = new Set(jobs.map(job => job.company_name?.trim()).filter(Boolean))
    return names.size
  }, [jobs])

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50" dir={textDir}>
      <Navbar />

      {/* ===== Hero ===== */}
      <motion.div 
  className="bg-[#1e3a5f] px-10 py-16 text-center relative overflow-hidden"
  style={{
    background:
      "linear-gradient(135deg,#0f2544 0%,#1e3a5f 60%,#162d4a 100%)",
    transformOrigin: "top center",
    
  }}
>
        <motion.div
className="absolute w-72 h-72 rounded-full border border-white/5 -top-20 -right-20"
animate={{
    y:[0,-20,0],
    x:[0,15,0]
}}
transition={{
    duration:10,
    repeat:Infinity,
    ease:"easeInOut"
}}
/>
        <motion.div
className="absolute w-52 h-52 rounded-full border border-white/5 -bottom-16 -left-16"
animate={{
    y:[0,20,0],
    x:[0,-15,0]
}}
transition={{
    duration:12,
    repeat:Infinity,
    ease:"easeInOut"
}}
/>
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
            {GOVERNORATES.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
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
  { num: jobs.length, label: t("home.stat_jobs") },
  { num: totalCompaniesCount, label: t("home.stat_companies") },
  ...(seekersCount !== null ? [{ num: seekersCount, label: t("home.stat_seekers") }] : []),
].map((s) => (
            <div key={s.label} className="text-center">
              <strong className="block text-xl text-white"><Counter from={0} to={s.num} /></strong>
              <small className="text-xs text-white/60">{s.label}</small>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
  
</div>
      </motion.div>

      {/* ===== قسم حسب حالة المستخدم (يظهر فقط للمسجلين) ===== */}
      {isLoggedIn && (
        <motion.section
    initial={{ opacity: 0, y: 70 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
        duration: 0.7,
        ease: "easeOut"
    }}
    className="px-4 md:px-10 py-10"
>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* وظائف زارها مؤخراً */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">{t("home.recently_viewed")}</h2>
                <span className="text-sm text-blue-600 cursor-pointer">{t("home.see_all")}</span>
              </div>
              <div className="flex flex-col gap-3">
                {jobs.slice(0, 2).map(job => (
                  <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:-translate-y-2
hover:shadow-2xl
hover:scale-[1.02]
transition-all
duration-300 transition">
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
                  <div key={job.id} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center hover:-translate-y-2
hover:shadow-2xl
hover:scale-[1.02]
transition-all
duration-300 transition">
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
        </motion.section>
      )}

      {/* ===== تصفح حسب التخصص (يظهر دائماً بغض النظر عن حالة تسجيل الدخول) ===== */}
      <motion.section
    initial={{ opacity: 0, y: 70 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
        duration: 0.7,
        ease: "easeOut"
    }}
    className="px-4 md:px-10 py-10"
>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">{t("home.browse_by_category")}</h2>
          </div>
          {specializationsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 animate-pulse">
                  <div className="w-6 h-6 rounded bg-gray-100" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : specializationsError ? (
            <p className="text-sm text-red-400 text-center py-10">{t("home.load_error")}</p>
          ) : specializations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">{t("home.no_jobs")}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {specializations.map((spec, index) => {
                return (
                 <button
                  key={spec.id}
                  onClick={() => navigate(`/jobs?category=${spec.id}`)}
                  className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:-translate-y-2
hover:shadow-2xl
hover:scale-[1.02]
transition-all
duration-300 hover:shadow-sm transition flex flex-col items-center gap-2"
                >
                 
                  <span className="text-xs font-medium text-gray-700">{isAr ? spec.name_ar : spec.name_en}</span>
                </button>
                )
              })}
            </div>
          )}
      </motion.section>

      {/* ===== أحدث الوظائف ===== */}
      <motion.section
    initial={{ opacity: 0, y: 70 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
        duration: 0.7,
        ease: "easeOut"
    }}
    className="px-4 md:px-10 py-10"
>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">{t("home.latest_jobs")}</h2>
          <span
            onClick={() => navigate("/jobs")}
            className="text-sm text-blue-600 cursor-pointer hover:underline"
          >
            {t("home.see_all")} 
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
        ) : jobsError ? (
          <p className="text-sm text-red-400 text-center py-10">{t("home.load_error")}</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">{t("home.no_jobs")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.slice(0, 6).map(job => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:-translate-y-2
hover:shadow-2xl
hover:scale-[1.02]
transition-all
duration-300 transition"
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
      </motion.section>

      {/* ===== أبرز الشركات ===== */}
      <motion.section
    initial={{ opacity: 0, y: 70 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
        duration: 0.7,
        ease: "easeOut"
    }}
    className="px-4 md:px-10 py-10"
>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {isAr ? "أبرز الشركات" : "Featured Companies"}
          </h2>
          <span
            onClick={() => navigate("/companies")}
            className="text-sm text-blue-600 cursor-pointer hover:underline"
          >
            {t("home.see_all")} 
          </span>
        </div>
        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : jobsError ? (
          <p className="text-sm text-red-400 text-center py-10">{t("home.load_error")}</p>
        ) : featuredCompanies.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">{t("home.no_jobs")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCompanies.map(company => (
              <div
                key={company.name}
                onClick={() => navigate(`/jobs?search=${encodeURIComponent(company.name)}`)}
                className="bg-white border border-gray-100 rounded-xl p-5 cursor-pointer hover:-translate-y-2
hover:shadow-2xl
hover:scale-[1.02]
transition-all
duration-300 transition flex items-center gap-4"
              >
                {/* أيقونة الشركة */}
                <div className={`w-12 h-12 rounded-xl ${company.color} flex items-center justify-center text-sm font-medium text-gray-700 flex-shrink-0`}>
                  {company.logo}
                </div>

                {/* معلومات الشركة */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {company.name}
                  </p>
                </div>

                {/* عدد الوظائف */}
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 flex-shrink-0">
                  {company.jobsCount} {isAr
                    ? (company.jobsCount === 1 ? "وظيفة" : "وظائف")
                    : (company.jobsCount === 1 ? "Job" : "Jobs")}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* ===== Footer ===== */}
      <footer className="bg-[#1e3a5f] px-10 py-8 text-center">
        <p className="text-xs text-white/40">© {new Date().getFullYear()} JobPortal · {t("home.rights")}</p>
      </footer>

    </div>
  )
}
