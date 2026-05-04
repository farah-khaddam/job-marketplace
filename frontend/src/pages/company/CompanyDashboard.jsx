import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import CompanyLayout from "../../components/company/CompanyLayout"

// ===== Mock Data =====
const MOCK_STATS = [
  { key: "active_jobs",    value: 8,    icon: "💼", bg: "bg-blue-50",    border: "border-blue-100" },
  { key: "total_apps",     value: 143,  icon: "📩", bg: "bg-violet-50",  border: "border-violet-100" },
  { key: "pending_review", value: 27,   icon: "⏳", bg: "bg-amber-50",   border: "border-amber-100" },
  { key: "total_views",    value: 2840, icon: "👁️", bg: "bg-teal-50",    border: "border-teal-100" },
]

const MOCK_RECENT_APPS = [
  { id: 1, name: "أحمد الخطيب",   job_ar: "مطور Frontend", job_en: "Frontend Developer", time_ar: "منذ ساعتين",  time_en: "2h ago",    status: "pending",  initials: "أخ" },
  { id: 2, name: "سارة نور",      job_ar: "مصمم UI/UX",    job_en: "UI/UX Designer",     time_ar: "منذ 5 ساعات", time_en: "5h ago",    status: "reviewed", initials: "سن" },
  { id: 3, name: "محمد البغدادي", job_ar: "مطور Backend",  job_en: "Backend Developer",  time_ar: "أمس",         time_en: "Yesterday", status: "accepted", initials: "مب" },
  { id: 4, name: "لينا الحسن",    job_ar: "مطور Frontend", job_en: "Frontend Developer", time_ar: "منذ يومين",   time_en: "2d ago",    status: "rejected", initials: "لح" },
]

const MOCK_ACTIVE_JOBS = [
  { id: 1, title_ar: "مطور Frontend", title_en: "Frontend Developer", apps: 34, views: 820,  days_left_ar: "12 يوم متبقي",  days_left_en: "12d left" },
  { id: 2, title_ar: "مصمم UI/UX",    title_en: "UI/UX Designer",     apps: 21, views: 540,  days_left_ar: "7 أيام متبقية", days_left_en: "7d left"  },
  { id: 3, title_ar: "مطور Backend",  title_en: "Backend Developer",  apps: 18, views: 390,  days_left_ar: "20 يوم متبقي",  days_left_en: "20d left" },
]

const STATUS_STYLES = {
  pending:  "bg-amber-50 text-amber-700 border-amber-100",
  reviewed: "bg-blue-50 text-blue-700 border-blue-100",
  accepted: "bg-green-50 text-green-700 border-green-100",
  rejected: "bg-red-50 text-red-600 border-red-100",
}

const QUICK_ACTIONS = [
  { icon: "📋", key: "manage_jobs",    path: "/company/jobs" },
  { icon: "👥", key: "review_apps",   path: "/company/applications" },
  { icon: "🏢", key: "company_profile", path: "/company/profile" },
]

export default function CompanyDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAr = i18n.language === "ar"

  return (
    <CompanyLayout>
      <div className="px-8 py-8 space-y-8">

        {/* ===== Header ===== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {t("company.dashboard.title")}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t("company.dashboard.welcome")}
            </p>
          </div>
          <button
            onClick={() => navigate("/company/jobs/post")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-medium rounded-xl transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {t("company.dashboard.post_job")}
          </button>
        </div>

        {/* ===== Stats ===== */}
        <div className="grid grid-cols-4 gap-4">
          {MOCK_STATS.map(stat => (
            <div key={stat.key} className={`bg-white border rounded-2xl p-5 ${stat.border}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${stat.bg}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{t(`company.dashboard.stats.${stat.key}`)}</p>
            </div>
          ))}
        </div>

        {/* ===== Two Columns ===== */}
        <div className="grid grid-cols-5 gap-6">

          {/* Recent Applications */}
          <div className="col-span-3 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">
                {t("company.dashboard.recent_apps.title")}
              </h2>
              <button onClick={() => navigate("/company/applications")} className="text-xs text-blue-600 hover:underline">
                {t("company.dashboard.recent_apps.view_all")}
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {MOCK_RECENT_APPS.map(app => (
                <div key={app.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {app.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{app.name}</p>
                      <p className="text-xs text-gray-400">
                        {isAr ? app.job_ar : app.job_en} · {isAr ? app.time_ar : app.time_en}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[app.status]}`}>
                    {t(`company.status.${app.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Jobs */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">
                {t("company.dashboard.active_jobs.title")}
              </h2>
              <button onClick={() => navigate("/company/jobs")} className="text-xs text-blue-600 hover:underline">
                {t("company.dashboard.active_jobs.view_all")}
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {MOCK_ACTIVE_JOBS.map(job => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/company/jobs/${job.id}/applications`)}
                  className="px-6 py-4 hover:bg-gray-50/50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {isAr ? job.title_ar : job.title_en}
                    </p>
                    <span className="text-xs text-gray-400">
                      {isAr ? job.days_left_ar : job.days_left_en}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-2.5">
                    <span>{job.apps} {t("company.dashboard.active_jobs.applicants")}</span>
                    <span>{job.views} {t("company.dashboard.active_jobs.views")}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min((job.apps / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ===== Quick Actions ===== */}
        <div className="grid grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.key}
              onClick={() => navigate(action.path)}
              className="bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm rounded-2xl p-5 text-start transition group"
            >
              <div className="text-2xl mb-3">{action.icon}</div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition">
                {t(`company.dashboard.quick_actions.${action.key}`)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {t(`company.dashboard.quick_actions.${action.key}_sub`)}
              </p>
            </button>
          ))}
        </div>

      </div>
    </CompanyLayout>
  )
}
