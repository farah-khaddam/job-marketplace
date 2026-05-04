import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem("token")

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    // dir="rtl" ثابت دائماً بغض النظر عن اللغة
    <nav className="bg-white border-b border-gray-100 px-10 py-4" dir="rtl">
      <div className="flex items-center justify-between">

        {/* اللوغو — دائماً على اليمين */}
        <Link to="/" className="text-xl font-medium text-blue-900">
          Job<span className="text-blue-600">Portal</span>
        </Link>

        {/* الروابط */}
        <div className="flex items-center gap-7">
          <Link to="/jobs" className="text-sm text-gray-500 hover:text-blue-600 transition">
            {t("navbar.jobs")}
          </Link>
          <Link to="/companies" className="text-sm text-gray-500 hover:text-blue-600 transition">
            {t("navbar.companies")}
          </Link>
          <Link to="/about" className="text-sm text-gray-500 hover:text-blue-600 transition">
            {t("navbar.about", "عن الموقع")}
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition">
                {t("navbar.dashboard")}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-600 transition"
              >
                {t("navbar.logout")}
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              {t("navbar.start", "تسجيل الدخول")}
            </button>
          )}

          {/* زر تغيير اللغة */}
          <button
            onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
            className="text-sm border border-gray-200 px-3 py-1 rounded-lg text-gray-500 hover:border-blue-600 hover:text-blue-600 transition"
          >
            {i18n.language === "ar" ? "EN" : "ع"}
          </button>
        </div>

      </div>
    </nav>
  )
}
