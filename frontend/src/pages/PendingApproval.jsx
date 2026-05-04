import { useTranslation } from "react-i18next"
import LangToggle from "../components/LangToggle"

export default function PendingApproval() {
  const { t, i18n } = useTranslation()
  const textDir = i18n.language === "ar" ? "rtl" : "ltr"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LangToggle />

      <div className="bg-white rounded-2xl shadow-xl p-10 w-[480px] text-center" dir={textDir}>

        {/* أيقونة */}
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>

        <h2 className="text-2xl font-medium text-gray-900 mb-3">
          {t("pending.title")}
        </h2>

        <p className="text-sm text-gray-500 mb-2">
          {t("pending.message")}
        </p>

        <p className="text-sm text-gray-500 mb-8">
          {t("pending.email_note")}
        </p>

        {/* خط فاصل */}
        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">
            {t("pending.contact")}{" "}
            <a href="mailto:support@jobportal.com" className="text-blue-600 hover:underline">
              support@jobportal.com
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}