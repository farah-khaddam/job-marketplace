import { NavLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

const NAV_ITEMS = [
  {
    key: "dashboard",
    path: "/company/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    key: "profile",
    path: "/company/profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: "jobs",
    path: "/company/jobs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      </svg>
    ),
  },
  {
    key: "applications",
    path: "/company/applications",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
]

export default function CompanyLayout({ children }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAr = i18n.language === "ar"
  const dir = isAr ? "rtl" : "ltr"

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const companyName = localStorage.getItem("companyName") || t("company.layout.my_company")
  const companyInitials = companyName.slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50 flex" dir={dir}>

      {/* ===== Sidebar ===== */}
      <aside
        className="w-60 bg-[#1e3a5f] flex flex-col flex-shrink-0 fixed top-0 bottom-0"
        style={{ right: isAr ? 0 : "auto", left: isAr ? "auto" : 0 }}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-lg font-semibold text-white">
            Job<span className="text-blue-300">Portal</span>
          </span>
          <p className="text-xs text-white/40 mt-0.5">{t("company.layout.panel")}</p>
        </div>

        {/* Company Info */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-400/20 text-blue-200 text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {companyInitials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{companyName}</p>
            <p className="text-xs text-white/40">{t("company.layout.company_account")}</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`
              }
            >
              {item.icon}
              <span>{t(`company.nav.${item.key}`)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button
            onClick={() => i18n.changeLanguage(isAr ? "en" : "ar")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            <span>{t("company.layout.language")}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>{t("company.layout.logout")}</span>
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main
        className="flex-1 min-h-screen"
        style={{ marginRight: isAr ? "240px" : 0, marginLeft: isAr ? 0 : "240px" }}
      >
        {children}
      </main>

    </div>
  )
}
